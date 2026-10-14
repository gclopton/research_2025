---
study:
  version: 1
  id: calc-table
  title: Basic integral table
  type: table
  concepts:
    - Antiderivatives
    - Power rule
  courseIds:
    - lab-calculus
  table:
    columns:
      - Integrand
      - Antiderivative
    rows:
      - - text: $1$
        - text: $x+C$
      - - text: $2x$
        - blank: a
      - - text: $\cos x$
        - blank: b
  answers:
    - id: a
      accepted:
        - x^2+C
        - x^{2}+C
        - x^2 + C
    - id: b
      accepted:
        - \sin x+C
        - \sin(x)+C
        - sin x + C
  chapters:
    - courseId: lab-calculus
      chapterId: 01-antiderivatives
      title: 01 · Antiderivatives
---

## Prompt

Complete each antiderivative. Include $+C$. Use Math Studio if useful.

## Explanation

Differentiate each answer to check it. Automatic matching uses listed alternatives, so an equivalent form may need manual review.
