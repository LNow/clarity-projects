# uint-to-ascii

## Overview
Contract provides one function to convert numbers to their textual representation.

## Functions
`uint-to-ascii` converts unsigned integers to ascii string.

## Dev notes
Using `(buff 39)` as `fold` input is cheaper than `(list 39 bool)`.

Usually short, but descriptive tuple keys are preferable. However when we have to process tuple multiple times (just like in this case), they should be as short as possible