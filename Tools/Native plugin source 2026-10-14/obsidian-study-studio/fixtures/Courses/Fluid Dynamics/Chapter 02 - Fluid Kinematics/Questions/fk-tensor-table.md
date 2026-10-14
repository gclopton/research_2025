---
study:
  version: 1
  id: fk-tensor-table
  title: Read the deformation and rotation tensors
  type: table
  concepts:
    - Kinematics 4.2.5
    - Read the deformation and rotation tensors
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  table:
    columns:
      - Quantity
      - Value ($\mathrm{s^{-1}}$)
    rows:
      - - text: $\dot\varepsilon_{xx}$
        - text: "2"
      - - text: $\dot\varepsilon_{xy}$
        - blank: a0
      - - text: $\omega_{xy}$
        - blank: a1
      - - text: $\nabla\cdot\mathbf V$
        - blank: a2
  answers:
    - id: a0
      accepted:
        - "2"
    - id: a1
      accepted:
        - "-4"
    - id: a2
      accepted:
        - "0"
---

## Prompt

Let $L=\begin{bmatrix}2&6&0\\-2&-2&0\\0&0&0\end{bmatrix}\ \mathrm{s^{-1}}$. Complete the numeric entries using this chapter's $\omega=(L^T-L)/2$ convention.

## Explanation

$\dot\varepsilon_{xy}=(6-2)/2=2$, $\omega_{xy}=(-2-6)/2=-4$, trace $2-2=0$.
