---
study:
  version: 1
  id: code-python-block
  title: Python — loop body and indentation
  type: code
  concepts:
    - python
    - Code completion
  code:
    language: python
    source: |-
      def positive_square_sum(values):
          total = 0
      {{blank:block}}
          return total

      assert positive_square_sum([-2, 0, 3, 4]) == 25
  answers:
    - id: block
      accepted:
        - |2-
              for value in values:
                  total += value**2 if value > 0 else 0
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete both indented lines to accumulate the squares of positive values. Include four spaces before for and eight before total.

## Explanation

The body belongs to the function and its update belongs to the loop. This exercise checks an exact two-line formulation.
