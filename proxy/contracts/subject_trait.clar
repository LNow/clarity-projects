(define-trait subject-trait
  ((perform-operation (uint uint) (response uint uint)))
)


(define-trait subject-trait-proxy
  ((perform-operation (uint uint <subject-trait>) (response uint uint)))
)