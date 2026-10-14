---
study:
  version: 1
  id: code-shell-loop
  title: Linux shell — loop syntax
  type: code
  concepts:
    - bash
    - Code completion
  code:
    language: bash
    source: |-
      for name in alpha beta; {{blank:start}}
      {{blank:body}}
      {{blank:end}}
  answers:
    - id: start
      accepted:
        - do
      whitespace: exact
      caseSensitive: true
    - id: body
      accepted:
        - "    printf '%s\\n' \"$name\""
      whitespace: exact
      caseSensitive: true
    - id: end
      accepted:
        - done
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the loop keywords and its body. This uses only synthetic names and prints them; no files are changed.

## Explanation

A shell for loop encloses commands between do and done.
