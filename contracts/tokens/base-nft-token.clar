(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u4001))

(impl-trait .sip-009-trait-nft-standard.nft-trait)
(define-non-fungible-token base-nft uint)

(define-data-var lastTokenId uint u0)

(define-read-only (get-last-token-id)
    (ok (var-get lastTokenId))
)

(define-read-only (get-owner (tokenId uint))
    (ok (nft-get-owner? base-nft tokenId))
)

(define-read-only (get-token-uri (tokenId uint))
    (ok (some "http://base-nft"))
)

(define-public (transfer (tokenId uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq sender tx-sender) ERR_UNAUTHORIZED)
        (nft-transfer? base-nft tokenId sender recipient)
    )
)

;; Mint function is not guarded by any means intentionally
;; #[allow(unchecked_data)]
(define-public (mint (recipient principal))
    (let 
        (
            (newTokenId (+ (var-get lastTokenId) u1))
        )
        (try! (nft-mint? base-nft newTokenId recipient))
        (var-set lastTokenId newTokenId)
        (ok newTokenId)
    )
)