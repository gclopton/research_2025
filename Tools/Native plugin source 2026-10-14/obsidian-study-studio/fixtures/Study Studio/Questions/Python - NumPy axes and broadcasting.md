---
study:
  version: 1
  id: code-python-numpy
  title: Python — NumPy axes and broadcasting
  type: code
  concepts:
    - python
    - Code completion
  code:
    language: python
    source: |-
      import numpy as np
      a = np.array([[1., 2.], [3., 4.]])
      means = a.mean({{blank:axis}})
      weights = np.array([10., 100.])
      scaled = a * weights[{{blank:shape}}]
      assert np.allclose(means, [2., 3.])
      assert np.allclose(scaled, [[10., 20.], [300., 400.]])
  answers:
    - id: axis
      accepted:
        - axis=0
        - axis = 0
      whitespace: exact
      caseSensitive: true
    - id: shape
      accepted:
        - :, None
        - :, np.newaxis
      whitespace: exact
      caseSensitive: true
---

## Prompt

Compute column means, then reshape weights into a column for broadcasting.

## Explanation

axis=0 reduces rows to one mean per column. Adding a new axis makes weights a column.
