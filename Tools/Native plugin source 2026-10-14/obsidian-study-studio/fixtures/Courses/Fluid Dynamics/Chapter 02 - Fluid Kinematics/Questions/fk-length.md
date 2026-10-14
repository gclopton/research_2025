---
study:
  version: 1
  id: fk-length
  title: Stretching from unequal face velocities
  type: short-answer
  concepts:
    - Kinematics 4.1.1
    - Stretching from unequal face velocities
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: $D\ell/Dt=u(x+\Delta x)-u(x)$. Dividing by $\Delta x$ and taking its
      local limit gives $\partial u/\partial x$. Equal added velocities cancel.
    rubric:
      - id: r0
        text: Uses the difference of face velocities.
      - id: r1
        text: Normalizes by length and takes the local limit.
      - id: r2
        text: Explains translation cancellation.
---

## Prompt

Faces separated by $\Delta x$ move with $u(x)$ and $u(x+\Delta x)$. Derive the local fractional length rate and explain cancellation of common translation.

## Explanation
