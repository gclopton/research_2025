---
study:
  version: 1
  id: fk-determinant
  title: Why the trace controls volume
  type: short-answer
  concepts:
    - Kinematics 4.1.2
    - Why the trace controls volume
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: The local map multiplies volume by $\det(I+L\Delta
      t)=1+\operatorname{tr}(L)\Delta t+O(\Delta t^2)$. Subtract 1, divide by
      $\Delta t$, and take the limit to obtain
      $\operatorname{tr}(L)=\nabla\cdot\mathbf V$.
    rubric:
      - id: r0
        text: Identifies the determinant as volume multiplier.
      - id: r1
        text: Uses its first-order trace expansion.
      - id: r2
        text: Takes the fractional-rate limit.
---

## Prompt

Explain how $d\mathbf r(t+\Delta t)=(I+L\Delta t)d\mathbf r(t)+O(\Delta t^2)$ leads to the fractional volume rate.

## Explanation
