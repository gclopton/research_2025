---
study:
  version: 1
  id: fk-chain
  title: Derive the material derivative
  type: short-answer
  concepts:
    - Kinematics 3
    - Derive the material derivative
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: $Df/Dt=\partial_t f+\dot x\,\partial_xf+\dot y\,\partial_yf+\dot
      z\,\partial_zf=\partial_t f+u\partial_xf+v\partial_yf+w\partial_zf$.
    rubric:
      - id: r0
        text: Applies the chain rule along the trajectory.
      - id: r1
        text: Identifies coordinate rates as local velocity components.
      - id: r2
        text: Includes both local and advective terms.
---

## Prompt

Starting with $f(\mathbf r(\mathbf X,t),t)$ at fixed $\mathbf X$, derive the Eulerian scalar material derivative.

## Explanation
