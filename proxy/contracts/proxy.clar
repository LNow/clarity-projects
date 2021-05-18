(impl-trait .subject_trait.subject-trait-proxy)
(use-trait subject-trait .subject_trait.subject-trait)

(define-data-var subject principal .subject_a)

(define-read-only (get-subject)
  (var-get subject)
)

(define-public (change-subject (contract <subject-trait>))
  (begin
    (var-set subject (contract-of contract))
    (ok true)
  )
)

(define-public (perform-operation (arg1 uint) (arg2 uint) (contract <subject-trait>)) 
  (begin
    (asserts! (is-eq (contract-of contract) (var-get subject))
      (err u9999999999))

    (contract-call? contract perform-operation arg1 arg2)
  )
)