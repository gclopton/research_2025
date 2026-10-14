---
study:
  version: 1
  id: fk-convention
  title: Rotation tensor sign convention
  type: choice
  concepts:
    - Kinematics 4.2.3
    - Rotation tensor sign convention
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  choices:
    - id: o0
      text: $L=\dot\varepsilon-\omega$.
    - id: o1
      text: $L=\dot\varepsilon+\omega$.
    - id: o2
      text: $L=2\dot\varepsilon+\omega$.
  correct:
    - o0
  shuffle: true
---

## Prompt

This chapter defines $\omega_{ij}=(L_{ji}-L_{ij})/2$. Which decomposition is consistent?

## Explanation

Adding $(L+L^T)/2$ to $(L-L^T)/2$ reconstructs $L$; the latter is $-\omega$ here.
