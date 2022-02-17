(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u4001))

(impl-trait .sip-010-trait-ft-standard.sip-010-trait)
(define-fungible-token base-ft)

(define-read-only (get-balance (owner principal))
    (ok (ft-get-balance base-ft owner))
)

(define-read-only (get-decimals)
    (ok u6)
)

(define-read-only (get-name)
    (ok "base-ft")
)

(define-read-only (get-symbol)
    (ok "BFT")
)

(define-read-only (get-token-uri)
    (ok (some u"http://base-ft"))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply base-ft))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq sender tx-sender) ERR_UNAUTHORIZED)
        (try! (ft-transfer? base-ft amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)
    )
)

;; Mint function is not guarded by any means intentionally
;; #[allow(unchecked_data)]
(define-public (mint (amount uint) (recipient principal))
    (ft-mint? base-ft amount recipient)
)