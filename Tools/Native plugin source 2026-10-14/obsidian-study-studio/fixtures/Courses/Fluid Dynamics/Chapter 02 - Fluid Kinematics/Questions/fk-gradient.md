---
study:
  version: 1
  id: fk-gradient
  title: Rows and columns of the velocity gradient
  type: short-answer
  concepts:
    - Kinematics 4.2.5
    - Rows and columns of the velocity gradient
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: $L=\begin{bmatrix}2&3\\5&-1\end{bmatrix}$,
      $\dot\varepsilon=\begin{bmatrix}2&4\\4&-1\end{bmatrix}$,
      $\omega=\begin{bmatrix}0&1\\-1&0\end{bmatrix}$. Their difference recovers
      $L$.
    rubric:
      - id: r0
        text: Rows identify velocity components and columns differentiation directions.
      - id: r1
        text: Correct symmetric part.
      - id: r2
        text: Correct antisymmetric part with chapter sign.
      - id: r3
        text: Verifies reconstruction.
---

## Prompt

For $u=2x+3y,\ v=5x-y,\ w=0$, write the planar $L$, $\dot\varepsilon$, and chapter-convention $\omega$. Check $L=\dot\varepsilon-\omega$.

## Explanation
