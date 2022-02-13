# vrf

## Overview
Contract provides cheap functions that returns to random `uint` using lower 16 bytes of VRF created for that specific block.

To reduce execution costs and avoid calculating same value over and over again, results for each block are saved in map.


## Functions
`get-rnd` returns random value generated for specific block height.

`get-save-rnd` returns random value generated for specific block height, and saves it in map if it hasn't been saved previously.




## Dev notes
`(buff 256)` with all hex values is used instead of `(list 256 (buff 1))` to reduce runtime execution costs 5.8x !!!

```
+----------------------+------------------+------------------+------------+
|                      | Consumed [buff]  | Consumed [list]  | Limit      |
+----------------------+------------------+------------------+------------+
| Runtime              | 59664            | 350646           | 5000000000 |
+----------------------+------------------+------------------+------------+
| Read count           | 6                | 6                | 7750       |
+----------------------+------------------+------------------+------------+
| Read length (bytes)  | 2220             | 3058             | 100000000  |
+----------------------+------------------+------------------+------------+
| Write count          | 1                | 1                | 7750       |
+----------------------+------------------+------------------+------------+
| Write length (bytes) | 33               | 33               | 15000000   |
+----------------------+------------------+------------------+------------+
```

`fold` in `lower-16-le` has been replaced by [unwinded code](https://en.wikipedia.org/wiki/Loop_unrolling) to reduce runtime execution costs 2.8x at the expense of increasing `read length` by 28%.  
```
+----------------------+---------------------+------------------+------------+
|                      | Consumed [inlined]  | Consumed [fold]  | Limit      |
+----------------------+---------------------+------------------+------------+
| Runtime              | 59664               | 168189           | 5000000000 |
+----------------------+---------------------+------------------+------------+
| Read count           | 6                   | 6                | 7750       |
+----------------------+---------------------+------------------+------------+
| Read length (bytes)  | 2220                | 1607             | 100000000  |
+----------------------+---------------------+------------------+------------+
| Write count          | 1                   | 1                | 7750       |
+----------------------+---------------------+------------------+------------+
| Write length (bytes) | 33                  | 33               | 15000000   |
+----------------------+---------------------+------------------+------------+
```

Instead of defining buffer with all hex values as constant it has been placed directly inside `buff-to-u8` resulting in a 12.6% reduction of runtime execution costs.

```
+----------------------+---------------------+------------------+------------+
|                      | Consumed [in func]  | Consumed [const  | Limit      |
+----------------------+---------------------+------------------+------------+
| Runtime              | 59664               | 68257            | 5000000000 |
+----------------------+---------------------+------------------+------------+
| Read count           | 6                   | 6                | 7750       |
+----------------------+---------------------+------------------+------------+
| Read length (bytes)  | 2220                | 2253             | 100000000  |
+----------------------+---------------------+------------------+------------+
| Write count          | 1                   | 1                | 7750       |
+----------------------+---------------------+------------------+------------+
| Write length (bytes) | 33                  | 33               | 15000000   |
+----------------------+---------------------+------------------+------------+
```