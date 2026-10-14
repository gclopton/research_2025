---
study:
  version: 1
  id: ordering-python
  title: Ordering — running mean algorithm
  type: ordering
  concepts:
    - sequences
  choices:
    - id: step-1
      text: Set `total = 0`.
    - id: step-2
      text: Visit each value and add it to `total`.
    - id: step-3
      text: Compute `mean = total / len(values)`.
    - id: step-4
      text: Return `mean`.
  correct:
    - step-1
    - step-2
    - step-3
    - step-4
  shuffle: true
---

## Prompt

Arrange these operations to compute the mean of a nonempty list.

## Explanation

Initialize before accumulating; divide only after all values are included.
