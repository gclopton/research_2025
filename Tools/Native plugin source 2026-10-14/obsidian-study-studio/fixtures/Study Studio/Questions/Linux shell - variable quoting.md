---
study:
  version: 1
  id: code-shell-quoting
  title: Linux shell — variable quoting
  type: code
  concepts:
    - bash
    - Code completion
  code:
    language: bash
    source: |-
      filename="lecture notes.txt"
      printf '%s\n' {{blank:quoted}}
  answers:
    - id: quoted
      accepted:
        - '"$filename"'
        - '"${filename}"'
      whitespace: exact
      caseSensitive: true
---

## Prompt

Print a filename containing spaces as exactly one line.

## Explanation

Double quotes preserve the variable value as one argument.
