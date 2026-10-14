---
study:
  version: 1
  id: python-range
  title: Read range bounds
  type: choice
  concepts:
    - Iteration
    - Range
  courseIds:
    - lab-python
  choices:
    - id: a
      text: "`[0, 1, 2]`"
    - id: b
      text: "`[1, 2, 3]`"
    - id: c
      text: "`[0, 1, 2, 3]`"
  correct:
    - a
  shuffle: true
  chapters:
    - courseId: lab-python
      chapterId: 01-iteration
      title: 01 · Iteration and comprehensions
---

## Prompt

What does list(range(3)) produce?

## Explanation

The start defaults to zero and the stop is excluded.
