(define-constant ERR_GOAL_CANT_BE_0 (err "Goal can't be equal 0"))
(define-constant ERR_UNKNOWN_PROJECT (err "Unknown project"))
(define-constant ERR_UNAUTHORIZED (err "Unauthorized"))
(define-constant ERR_UNEXPECTED (err "Unexpected error"))


(define-data-var lastProjectId uint u0)

(define-map projects
    {projectId: uint}
    {
        owner: principal,
        goal: uint,
        lastMilestoneId: uint
    }
)


(define-map milestones 
    {projectId: uint, milestoneId: uint}
    {goal: uint}
)

(define-public (createProject) 
    (let
        (
            (newProjectId (+ (var-get lastProjectId) u1))
        )
        (map-set projects
            {projectId: newProjectId}
            {
                owner: tx-sender,
                goal: u0,
                lastMilestoneId: u0
            }
        )
        (var-set lastProjectId newProjectId)
        (ok true)    
    )
)

(define-public (createMilestone (projectId uint) (goal uint))
    (begin 
        (asserts! (> goal u0) ERR_GOAL_CANT_BE_0)
        (let 
            (
                (project (unwrap! (getProject projectId) ERR_UNKNOWN_PROJECT))
                (owner (get owner project))
                (newMilestoneId (+ (get lastMilestoneId project) u1))
                (newProjectGoal (+ (get goal project) goal))
            )
            (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
            ;; add new milestone
            (map-set milestones
                {projectId: projectId, milestoneId: newMilestoneId}
                {
                    goal: goal
                }
            )
            ;; update project info
            (map-set projects
                {projectId: projectId}
                (merge project {goal: newProjectGoal, lastMilestoneId: newMilestoneId})
            )
            (ok true)
        )
    )
)

(define-read-only (getProject (projectId uint))
    (map-get? projects {projectId: projectId})
)

(define-read-only (getMilestone (projectId uint) (milestoneId uint)) 
    (map-get? milestones {projectId: projectId, milestoneId: milestoneId})
)

(define-read-only (getProjectsCount) 
    (var-get lastProjectId)
)

(define-read-only (getMilestonesCount (projectId uint))
    (default-to u0 (get lastMilestoneId (getProject projectId)))
)

(define-read-only (getProjectGoal (projectId uint)) 
    (default-to u0 (get goal (getProject projectId)))
)

(define-read-only (getMilestoneGoal (projectId uint) (milestoneId uint))
    (default-to u0 (get goal (getMilestone projectId milestoneId)))
)

(define-read-only (getProjectOwner (projectId uint)) 
    (get owner (getProject projectId))
)