---
study:
  version: 1
  id: calc-power
  title: Power rule exponent
  type: blank
  concepts:
    - Antiderivatives
    - Power rule
  courseIds:
    - lab-calculus
  answers:
    - id: power
      accepted:
        - n+1
        - n + 1
    - id: constant
      accepted:
        - C
        - c
  chapters:
    - courseId: lab-calculus
      chapterId: 01-antiderivatives
      title: 01 · Antiderivatives
---

## Prompt

For $n\ne -1$, $\int x^n\,dx$ has a power of $x$ equal to {{blank:power}} and an arbitrary constant denoted {{blank:constant}}.

## Explanation

The antiderivative is $x^{n+1}/(n+1)+C$.
