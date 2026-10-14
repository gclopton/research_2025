---
study:
  version: 1
  id: written-fluid
  title: Short answer — translation and strain
  type: short-answer
  concepts:
    - written reasoning
  written:
    reference: The relative velocity is $u(x+\Delta x)-u(x)\approx(\partial
      u/\partial x)\Delta x$. Over $\Delta t$, the extension is
      $\delta\ell\approx(\partial u/\partial x)\Delta x\Delta t$. Dividing by
      $\Delta x\Delta t$ and taking the local limit gives
      $\dot\epsilon_{xx}=\partial u/\partial x$. Equal face velocities produce
      translation with zero extension.
    rubric:
      - id: criterion-1
        text: Explains that equal face velocities produce translation without extension.
      - id: criterion-2
        text: Relates extension to the velocity difference over the time interval.
      - id: criterion-3
        text: Divides by the original length and elapsed time to obtain
          $\dot\epsilon_{xx}=\partial u/\partial x$.
---

## Prompt

Two faces of a small fluid element have velocities $u(x)$ and $u(x+\Delta x)$. Explain why uniform translation does not stretch the element, and derive its local linear strain rate.

## Explanation


