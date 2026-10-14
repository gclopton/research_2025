---
study:
  version: 1
  id: fk-unsteady-curves
  title: Construct two curves in unsteady flow
  type: short-answer
  concepts:
    - Kinematics 2.4
    - Construct two curves in unsteady flow
  courseIds:
    - lab-fluid-dynamics
  chapters:
    - courseId: lab-fluid-dynamics
      chapterId: 02-kinematics
      title: 02 · Fluid Kinematics
  written:
    reference: The streamline is $y=t_*x$ because time is fixed while integrating
      $dy/dx=t_*$. The pathline has $x=t,\ y=t^2/2$, hence $y=x^2/2$ for
      $t\ge0$.
    rubric:
      - id: r0
        text: Holds observation time fixed for streamline slope.
      - id: r1
        text: Solves both particle ODEs with the initial condition.
      - id: r2
        text: Distinguishes the straight line and parabola.
---

## Prompt

In nondimensional variables let $u=1,\ v=t$. Find the streamline through the origin at time $t_*$ and the pathline of the particle at the origin at $t=0$.

## Explanation
