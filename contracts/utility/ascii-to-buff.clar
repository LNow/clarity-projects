(define-read-only (ascii-to-buff (in (string-ascii 100)))
    (fold ascii-to-buff_clojure in 0x)
)

(define-private (ascii-to-buff_clojure (chr (string-ascii 1)) (out (buff 100)))
    (match (index-of " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~" chr) idx
        (match (element-at 0x202122232425262728292A2B2C2D2E2F303132333435363738393A3B3C3D3E3F404142434445464748494A4B4C4D4E4F505152535455565758595A5B5C5D5E5F606162636465666768696A6B6C6D6E6F707172737475767778797A7B7C7D7E idx) x
            (unwrap-panic (as-max-len? (concat out x) u100))
            out
        )
        out
    )
)