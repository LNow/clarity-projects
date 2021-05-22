(define-constant EMPTY_MINER_STRUCT {minerId: u0, amount: u0})

(define-data-var pushList 
  {
    smallest: (optional {minerId: uint, amount: uint}), 
    miners: (list 32 {minerId: uint, amount: uint})
  }
  {
    smallest: none,
    miners: (list )
  }
)

(define-public (get-push-list)
  (ok (var-get pushList))
)

(define-public (add-miner (minerId uint) (amount uint))
  (let
    (
      (curList (var-get pushList))
      (smallest (get smallest curList))
      (curSmallestAmount (default-to u0 (get amount smallest)))
      (miners (get miners curList))
      (cnt (len miners))
      (newMiners (if (< cnt u32) (unwrap-panic (as-max-len? (append miners { minerId: minerId, amount: amount }) u32)) miners))
      (newSmallest (some { minerId: minerId, amount: amount }))
    )
    (begin
    (if (and (is-eq u32 cnt) (<= amount curSmallestAmount))
      (err "uuu")

      (begin
        (if (is-none smallest)
          ;; add first element to empty list
          (var-set pushList { smallest: newSmallest, miners: newMiners })
          (if (> u32 cnt)
            ;; add new element if list is not empty
            (if (< amount (unwrap-panic (get amount smallest)))
              (var-set pushList { smallest: newSmallest, miners: newMiners }) 
              (var-set pushList { smallest: smallest, miners: newMiners })
            )
            (let
              (
                (data (fold remove-smallest-closure miners 
                  { 
                    smallestMinerId: (unwrap-panic (get minerId smallest)),
                    newSmallestAmount: u0,
                    newSmallest: EMPTY_MINER_STRUCT,
                    newMiners: (unwrap-panic (as-max-len? (list EMPTY_MINER_STRUCT) u32))
                  }
                  )
                )
                (newMinerAfterRemoval (get newMiners data))
                (newSmallestAfterRemoval (get newSmallest data))
              )
              (var-set pushList
                {
                  smallest: (some newSmallestAfterRemoval),
                  miners: (unwrap-panic (as-max-len? (append newMinerAfterRemoval { minerId: minerId, amount: amount }) u32))
                }
              )
            )
          )
        )
        (ok true)
      )
    )
    )
  )
)


(define-private 
  (remove-smallest-closure 
    (miner {minerId: uint, amount: uint}) 
    (data 
      {
        smallestMinerId: uint, 
        newSmallestAmount: uint,
        newSmallest: {minerId: uint, amount: uint}, 
        newMiners: (list 32 {minerId: uint, amount: uint})
      }
    )
  )
  (if (is-eq (get minerId miner) (get smallestMinerId data))
    data
    (let
      (
        (amount (get amount miner))
        (curSmallestAmount (get newSmallestAmount data))
        (curMiners (get newMiners data))
        (newMiners (unwrap-panic (as-max-len? (append curMiners miner) u32)))
      )
      (if (is-eq curSmallestAmount u0)
        (merge data {newSmallestAmount: amount, newSmallest: miner, newMiners: (unwrap-panic (as-max-len? (list miner) u32)) })      
        (if (< amount curSmallestAmount)
          (merge data {newSmallestAmount: amount, newSmallest: miner, newMiners: newMiners})
          (merge data {newMiners: newMiners})
        )
      )
    )
  )
)

;; (add-miner u1 u1)
;; (add-miner u2 u2)
;; (add-miner u3 u3)
;; (add-miner u4 u4)
;; (add-miner u5 u5)
;; (add-miner u6 u6)
;; (add-miner u7 u7)
;; (add-miner u8 u8)
;; (add-miner u9 u9)
;; (add-miner u10 u10)
;; (add-miner u11 u11)
;; (add-miner u12 u12)
;; (add-miner u13 u13)
;; (add-miner u14 u14)
;; (add-miner u15 u15)
;; (add-miner u16 u16)
;; (add-miner u17 u17)
;; (add-miner u18 u18)
;; (add-miner u19 u19)
;; (add-miner u20 u20)
;; (add-miner u21 u21)
;; (add-miner u22 u22)
;; (add-miner u23 u23)
;; (add-miner u24 u24)
;; (add-miner u25 u25)
;; (add-miner u26 u26)
;; (add-miner u27 u27)
;; (add-miner u28 u28)
;; (add-miner u29 u29)
;; (add-miner u30 u30)
;; (add-miner u31 u31)


