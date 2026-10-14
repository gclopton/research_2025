---
study:
  version: 1
  concepts:
    - Calculus
  id: demo-table
  title: Complete the derivative table
  type: table
  answers:
    - id: linear
      accepted:
        - "1"
    - id: square
      accepted:
        - 2x
        - 2*x
        - 2 x
  table:
    columns:
      - Function $f(x)$
      - Derivative $f′(x)$
    rows:
      - - text: $5$
        - text: $0$
      - - text: $x$
        - blank: linear
      - - text: $x^2$
        - blank: square
---

## Prompt

Complete the two missing derivatives. The first row is supplied.

## Explanation

Apply $\frac{d}{dx}x^n=nx^{n-1}$.
