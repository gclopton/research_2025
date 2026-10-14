---
study:
  version: 1
  id: code-python-comprehension
  title: Python — comprehension keywords
  type: code
  concepts:
    - python
    - Code completion
  code:
    language: python
    source: |-
      values = [1, 2, 3, 4]
      squares = [x**2 {{blank:loop}} x in values {{blank:condition}} x % 2 == 0]
      assert squares == [4, 16]
  answers:
    - id: loop
      accepted:
        - for
      whitespace: exact
      caseSensitive: true
    - id: condition
      accepted:
        - if
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the comprehension so it squares only the even values.

## Explanation

A comprehension uses for to iterate and if to filter.
