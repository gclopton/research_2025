---
study:
  version: 1
  id: fk-vector
  title: Convective acceleration is a vector
  type: short-answer
  concepts:
    - Kinematics 3.2
    - Convective acceleration is a vector
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: $\partial_t\mathbf V=0$ and $(\mathbf V\cdot\nabla)\mathbf
      V=(-\Omega^2x,-\Omega^2y,0)$. Speed stays constant along a circular path
      while direction changes.
    rubric:
      - id: r0
        text: Computes zero local acceleration.
      - id: r1
        text: Computes both centripetal components with negative signs.
      - id: r2
        text: Distinguishes constant speed from constant velocity.
---

## Prompt

For $\mathbf V=(-\Omega y,\Omega x,0)$ with constant $\Omega$, compute the local and convective accelerations. Does constant particle speed imply zero acceleration?

## Explanation
