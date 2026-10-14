---
study:
  version: 1
  id: code-wolfram-replace
  title: Wolfram — replacement rules
  type: code
  concepts:
    - mathematica
    - Code completion
  code:
    language: mathematica
    source: |-
      Clear[x];
      result = (x^2 + 1) {{blank:replace}} x {{blank:rule}} 3;
      Print[result];
  answers:
    - id: replace
      accepted:
        - /.
      whitespace: exact
      caseSensitive: true
    - id: rule
      accepted:
        - ->
      whitespace: exact
      caseSensitive: true
---

## Prompt

Replace x with 3 and evaluate the expression.

## Explanation

/. applies replacement rules; -> constructs a rule.
