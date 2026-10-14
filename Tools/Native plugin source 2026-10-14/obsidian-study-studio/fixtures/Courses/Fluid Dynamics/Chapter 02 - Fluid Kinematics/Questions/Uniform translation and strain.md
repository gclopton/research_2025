---
study:
  version: 1
  id: fluid-strain
  title: Uniform translation and strain
  type: short-answer
  concepts:
    - Linear strain
    - Velocity gradients
  courseIds:
    - lab-fluid-dynamics
  written:
    reference: The length changes at rate $u(x+\Delta x)-u(x)$. Divide by $\Delta x$
      and take the local limit to obtain $\partial u/\partial x$. Uniform
      translation has equal face velocities, so the difference and strain rate
      are zero.
    rubric:
      - id: difference
        text: Uses the difference of face velocities as the length-change rate.
      - id: normalize
        text: Divides by the element length and takes the local limit.
      - id: uniform
        text: Explains why equal velocities give zero stretching.
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
---

## Prompt

Two faces of a small element have velocities $u(x)$ and $u(x+\Delta x)$. Explain why uniform translation causes no stretching and derive the local linear strain rate.

## Explanation


