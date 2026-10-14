---
study:
  version: 1
  id: code-shell-pipeline
  title: Linux shell — pipelines and extended regex
  type: code
  concepts:
    - bash
    - Code completion
  code:
    language: bash
    source: printf '%s\n' run-12 skip run-3 {{blank:pipe}} grep {{blank:flag}}
      '^run-[0-9]+$'
  answers:
    - id: pipe
      accepted:
        - "|"
      whitespace: exact
      caseSensitive: true
    - id: flag
      accepted:
        - -E
      whitespace: exact
      caseSensitive: true
---

## Prompt

Filter only lines beginning with run- followed by one or more digits. Supply the pipeline and extended-regex switch.

## Explanation

A pipe passes stdout to the next command. grep -E enables + in extended regular expressions.
