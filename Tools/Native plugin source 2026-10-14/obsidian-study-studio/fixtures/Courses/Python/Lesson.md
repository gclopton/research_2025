# Iteration and comprehensions

Python uses indentation to group a loop body. The stop in range is excluded.

```python
total = 0
for value in [1, 2, 3]:
    total += value

squares = [n**2 for n in range(6) if n % 2 == 0]
```

The total is 6; squares is [0, 4, 16]. A comprehension combines an expression, an iteration clause, and an optional filter.

## Review

```study-group
title: Python review
questions:
  - python-range
  - python-comprehension
  - python-loop
  - python-order
  - python-tests
```
