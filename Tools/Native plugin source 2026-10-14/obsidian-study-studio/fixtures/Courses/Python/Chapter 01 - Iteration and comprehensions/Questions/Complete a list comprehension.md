---
study:
  version: 1
  id: python-comprehension
  title: Complete a list comprehension
  type: code
  concepts:
    - Comprehensions
    - Filtering
  courseIds:
    - lab-python
  code:
    language: python
    source: squares = [n**2 {{blank:loop}} n in range(6) {{blank:condition}} n % 2
      == 0]
  answers:
    - id: loop
      accepted:
        - for
      whitespace: exact
    - id: condition
      accepted:
        - if
      whitespace: exact
  chapters:
    - courseId: lab-python
      chapterId: 01-iteration
      title: 01 · Iteration and comprehensions
---

## Prompt

Build the squares of even integers from 0 through 5.

## Explanation

The result is [0, 4, 16].
