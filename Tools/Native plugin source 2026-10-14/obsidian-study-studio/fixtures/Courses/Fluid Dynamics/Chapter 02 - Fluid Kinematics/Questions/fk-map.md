---
study:
  version: 1
  id: fk-map
  title: Convert a motion map to a velocity field
  type: short-answer
  concepts:
    - Kinematics 1.1
    - Convert a motion map to a velocity field
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: $u_L=aXe^{at}$, $X=xe^{-at}$, so $u_E(x,t)=ax$.
    rubric:
      - id: r0
        text: Differentiates at fixed $X$ to obtain $aXe^{at}$.
      - id: r1
        text: Uses $X=xe^{-at}$.
      - id: r2
        text: Obtains $u_E=ax$ without treating $X$ as the current position.
---

## Prompt

For $x=Xe^{at}$ with constant $a$, find the Lagrangian velocity, invert the motion map, and obtain the Eulerian velocity.

## Explanation
