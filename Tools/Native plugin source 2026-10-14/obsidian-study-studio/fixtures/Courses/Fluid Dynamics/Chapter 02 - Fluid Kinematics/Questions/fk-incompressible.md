---
study:
  version: 1
  id: fk-incompressible
  title: Volume-preserving does not mean rigid
  type: choice
  concepts:
    - Kinematics 4.1.2
    - Volume-preserving does not mean rigid
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  choices:
    - id: o0
      text: Volume preserving but deforming.
    - id: o1
      text: Rigid rotation with no deformation.
    - id: o2
      text: Volume expanding at rate $2a$.
    - id: o3
      text: Stationary fluid.
  correct:
    - o0
  shuffle: true
---

## Prompt

For $u=ax,\ v=-ay,\ w=0$ with $a\ne0$, which description applies?

## Explanation

The divergence is $a-a=0$, but the normal strain rates are nonzero.
