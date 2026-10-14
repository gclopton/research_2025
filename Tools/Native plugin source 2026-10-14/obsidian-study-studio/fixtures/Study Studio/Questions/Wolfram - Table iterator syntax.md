---
study:
  version: 1
  id: code-wolfram-table
  title: Wolfram — Table iterator syntax
  type: code
  concepts:
    - mathematica
    - Code completion
  code:
    language: mathematica
    source: |-
      result = Table[i + j, {{blank:iterators}}];
      Print[result];
  answers:
    - id: iterators
      accepted:
        - "{i, 1, 2}, {j, 1, 3}"
        - "{i, 2}, {j, 3}"
      whitespace: exact
      caseSensitive: true
---

## Prompt

Build the 2×3 array whose (i,j) element is i+j. Complete both iterators.

## Explanation

The first iterator controls rows; the second controls columns.
