(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u4001))

(impl-trait .sip-009-trait-nft-standard.nft-trait)
(define-non-fungible-token mintable-nft uint)

(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-data-var lastTokenId uint u0)

(define-read-only (get-last-token-id)
    (ok (var-get lastTokenId))
)

(define-read-only (get-owner (tokenId uint))
    (ok (nft-get-owner? mintable-nft tokenId))
)

(define-read-only (get-token-uri (tokenId uint))
    (ok (some "http://mintable-nft"))
)

(define-public (transfer (tokenId uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq sender tx-sender) ERR_UNAUTHORIZED)
        (nft-transfer? mintable-nft tokenId sender recipient)
    )
)

(define-constant ERR_UNKNOWN_TENDER (err u4002))

(define-map TenderPricing 
    principal ;; tender
    {
        price: uint,
        artistAddress: principal,
        commissionRate: uint,
        commissionAddress: principal,
    }
)

(define-public (mint-with (tender <ft-trait>))
    (let
        (
            (pricing (unwrap! (map-get? TenderPricing (contract-of tender)) ERR_UNKNOWN_TENDER))
            (price (get price pricing))
            (artistAddress (get artistAddress pricing))
            (commission (/ (* price (get commissionRate pricing)) u10000))
            (commissionAddress (get commissionAddress pricing))
            (newTokenId (+ (var-get lastTokenId) u1))
        )
        (try! (nft-mint? mintable-nft newTokenId tx-sender))

        (and (> price u0) (try! (contract-call? tender transfer price tx-sender artistAddress none)))
        (and (> commission u0) (try! (contract-call? tender transfer commission tx-sender commissionAddress none)))
        (var-set lastTokenId newTokenId)
        (ok newTokenId)
    )
)

(define-public (set-tender-pricing 
    (tender <ft-trait>) 
    (price uint) (artistAddress principal) 
    (commissionRate uint) (commissionAddress principal))

    (begin
        (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (ok (map-set TenderPricing
            (contract-of tender)
            {
                price: price,
                artistAddress: artistAddress,
                commissionRate: commissionRate,
                commissionAddress: commissionAddress,
            }
        ))
    )    
)