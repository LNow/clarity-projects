(define-data-var lastProposalId uint u0)

(define-map proposals 
    { proposalId: uint}
    { 
        yea: uint,
        nay: uint
    }
)

(define-map votes
    { proposalId: uint, voter: principal }
    { yea: bool, nay: bool }
)

;; returns number of proposals stored in contract
(define-read-only (getProposalsCount)
    (var-get lastProposalId)
)

;; creates new proposal
(define-public (createProposal)
    (let 
        ((newProposalId (+ u1 (var-get lastProposalId)))) 
        (map-set proposals
            {proposalId: newProposalId}
            {yea: u0, nay: u0}
        )
        (var-set lastProposalId newProposalId)
        (ok true)
    )
)


;; vote yea
(define-public (voteYea (proposalId uint))
    (begin
        (asserts! (notVotedYet proposalId tx-sender) 
                (err "Already voted"))
        (let 
            (
                (newYea (+ (getYeaVotesCount proposalId) u1)) 
                (proposal (unwrap! (map-get? proposals {proposalId: proposalId}) (err "Unknow proposal")))
            ) 
            ;; record voters vote
            (map-set votes
                {proposalId: proposalId, voter: tx-sender}
                {yea: true, nay: false}
            )
            (map-set proposals 
                {proposalId: proposalId}
                (merge proposal {yea: newYea})
            )        
            (ok true)
        )
    )
)

;; vote nay
(define-public (voteNay (proposalId uint))
    (begin
        (asserts! (notVotedYet proposalId tx-sender) 
            (err "Already voted")) 
        (let 
            (
                (newNay (+ (getNayVotesCount proposalId) u1)) 
                (proposal (unwrap! (map-get? proposals {proposalId: proposalId}) (err "Unknow proposal")))
            ) 
            ;; record voters vote
            (map-set votes
                {proposalId: proposalId, voter: tx-sender}
                {yea: false, nay: true}
            )
            (map-set proposals 
                {proposalId: proposalId}
                (merge proposal {nay: newNay})
            )
            (ok true)
        )
    )
)

;; checks if contract have proposal with provided proposalId
(define-read-only (hasProposal (proposalId uint))
    (is-some (map-get? proposals {proposalId: proposalId}))
)


;; return number of total votes
(define-read-only (getTotalVotesCount (proposalId uint)) 
    (+
        (getYeaVotesCount proposalId)
        (getNayVotesCount proposalId)
    )
)

;; returns number of aye votes )
(define-read-only (getYeaVotesCount (proposalId uint))
    (default-to u0 (get yea (map-get? proposals {proposalId: proposalId})))
)


;; returns number of nay votes
(define-read-only (getNayVotesCount (proposalId uint)) 
    (default-to u0 (get nay (map-get? proposals {proposalId: proposalId})))
)


;; checks if voter already voted on specyfic proposal
(define-read-only (notVotedYet (proposalId uint) (voter principal))
    (is-none (map-get? votes {proposalId: proposalId, voter: voter}))
)