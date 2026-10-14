---
study:
  version: 1
  concepts:
    - Linear algebra
  id: demo-matrix
  title: Matrix dimensions
  type: choice
  choices:
    - id: a
      text: $2\times4$
    - id: b
      text: $3\times3$
    - id: c
      text: $4\times2$
  correct:
    - a
  shuffle: true
---

## Prompt

If $A$ is a $2\times3$ matrix and $B$ is a $3\times4$ matrix, what are the dimensions of $AB$?

## Explanation

The inner dimensions agree; the result takes the outer dimensions: $2\times4$.
