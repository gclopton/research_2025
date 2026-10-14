---
study:
  version: 1
  id: code-wolfram-map
  title: Wolfram — pure functions and Map
  type: code
  concepts:
    - mathematica
    - Code completion
  code:
    language: mathematica
    source: |-
      result = ({{blank:function}} &) {{blank:map}} {1, 2, 3};
      Print[result];
  answers:
    - id: function
      accepted:
        - "#^2"
        - "#1^2"
      whitespace: exact
      caseSensitive: true
    - id: map
      accepted:
        - /@
      whitespace: exact
      caseSensitive: true
---

## Prompt

Square every list element using a pure function and the infix Map operator.

## Explanation

Slots (#) refer to pure-function arguments; & terminates the function and /@ maps it over a list.
