(define-data-var lastProposalId uint u0)

(define-map proposals 
    { proposalId: uint}
    { 
        owner: principal,
        goal: uint,
        invested: uint,
        closed: bool
    }
)




;; returns total number of proposals stored in contract 
(define-read-only (getProposalsCount)
    (var-get lastProposalId)
)

;; creates new proposal with desired goal
(define-public (createProposal (goal uint))
    (begin
        (asserts! (> goal u0) (err "Goal can't be equal 0"))
    
        (let 
            ((newProposalId (+ u1 (var-get lastProposalId)))) 
            (map-set proposals
                {proposalId: newProposalId}
                {  
                    owner: tx-sender,
                    goal: goal,
                    invested: u0,
                    closed: false
                }
            )
            (var-set lastProposalId newProposalId)
            (ok true)
        )
    )
)

;; retunrs proposal details
(define-read-only (getProposal (proposalId uint)) 
    (map-get? proposals {proposalId: proposalId})
)

(define-read-only (alreadyFunded (proposalId uint))
    (let
        (
            (proposal (unwrap! (getProposal proposalId) false))
            (goal (get goal proposal))
            (invested (get invested proposal))
        )
        (>= invested goal)
    )
)

(define-read-only (alreadyClosed (proposalId uint))
    (let
        (
            (proposal (unwrap! (getProposal proposalId) false))
        )
        (get closed proposal)
    )
)

(define-public (invest (proposalId uint) (amount uint))
    (let
        (
            (proposal (unwrap! (getProposal proposalId) (err "Unknown proposal")))
            (invested (get invested proposal))
            (newInvested (+ invested amount))
        )
        (asserts! (> amount u0) 
            (err "Invested amount can not be 0"))
        
        (asserts! (> (stx-get-balance tx-sender) amount) 
            (err "Insufficient funds"))
        
        (asserts! (not (alreadyFunded proposalId)) 
            (err "Proposal already funded"))
        
        (unwrap! (stx-transfer? amount tx-sender (as-contract tx-sender)) 
            (err "Failed to execute investment transfer"))

        (map-set proposals 
            {proposalId: proposalId}
            (merge proposal {invested: newInvested})
        )    
        (ok true)
    )
)

(define-public (closeProposal (proposalId uint))
    (let
        (
            (proposal (unwrap! (getProposal proposalId) (err "Unknown proposal")))
            (invested (get invested proposal))
            (owner (get owner proposal))
        )
        (asserts! (is-eq owner tx-sender) 
            (err "Unauthorized"))

        (asserts! (alreadyFunded proposalId)
            (err "Proposal not fully funded"))

        (asserts! (not (alreadyClosed proposalId))
            (err "Proposal already closed"))
        
        (unwrap! (as-contract (stx-transfer? u1 tx-sender owner))
            (err "Failed to execute investment transfer"))

        (map-set proposals 
            {proposalId: proposalId}
            (merge proposal {closed: true})
        )  

        (ok true)
    )
)