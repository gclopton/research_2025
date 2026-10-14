---
study:
  version: 1
  id: python-loop
  title: Complete a loop body
  type: code
  concepts:
    - Iteration
    - Accumulation
  courseIds:
    - lab-python
  code:
    language: python
    source: |-
      total = 0
      for value in numbers:
      {{blank:body}}
      print(total)
  answers:
    - id: body
      accepted:
        - "    total += value"
        - "    total = total + value"
      whitespace: exact
  chapters:
    - courseId: lab-python
      chapterId: 01-iteration
      title: 01 · Iteration and comprehensions
---

## Prompt

Complete the body to sum the values in numbers.

## Explanation

Indent the loop body by four spaces. Both listed accumulation forms are accepted.
