---
study:
  version: 1
  id: ordering-fluid
  title: Ordering — derive linear strain rate
  type: ordering
  concepts:
    - sequences
  choices:
    - id: step-1
      text: "Approximate the velocity difference: $u(x+\\Delta x)-u(x)\\approx
        \\frac{\\partial u}{\\partial x}\\Delta x$."
    - id: step-2
      text: Over $\Delta t$, the extension is $\delta\ell\approx\frac{\partial
        u}{\partial x}\Delta x\Delta t$.
    - id: step-3
      text: "Divide by the original length: $\\delta\\ell/\\Delta
        x\\approx\\frac{\\partial u}{\\partial x}\\Delta t$."
    - id: step-4
      text: "Divide by $\\Delta t$ and take the local limit:
        $\\dot\\epsilon_{xx}=\\frac{\\partial u}{\\partial x}$."
  correct:
    - step-1
    - step-2
    - step-3
    - step-4
  shuffle: true
---

## Prompt

Arrange the steps from the velocity difference to the linear strain rate in the $x$ direction.

## Explanation

Translation cancels between the two faces; their relative displacement produces extension.
