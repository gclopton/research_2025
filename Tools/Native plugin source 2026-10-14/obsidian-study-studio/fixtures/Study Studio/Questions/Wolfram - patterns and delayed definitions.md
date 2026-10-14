---
study:
  version: 1
  id: code-wolfram-pattern
  title: Wolfram — patterns and delayed definitions
  type: code
  concepts:
    - mathematica
    - Code completion
  code:
    language: mathematica
    source: |-
      Clear[square];
      square[{{blank:pattern}}] {{blank:assign}} x^2;
      Print[square[5]];
  answers:
    - id: pattern
      accepted:
        - x_
      whitespace: exact
      caseSensitive: true
    - id: assign
      accepted:
        - :=
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the pattern and delayed-assignment operator for a reusable square function.

## Explanation

x_ matches an argument and binds it to x. SetDelayed (:=) evaluates the right side when the definition is used.
