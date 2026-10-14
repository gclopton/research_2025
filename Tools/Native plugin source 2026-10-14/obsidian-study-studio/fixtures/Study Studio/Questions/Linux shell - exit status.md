---
study:
  version: 1
  id: code-shell-status
  title: Linux shell — exit status
  type: code
  concepts:
    - bash
    - Code completion
  code:
    language: bash
    source: |-
      true
      if [ {{blank:status}} -eq 0 ]; then
          printf 'ok\n'
      fi
  answers:
    - id: status
      accepted:
        - '"$?"'
        - $?
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the condition to report success when the previous command exited successfully.

## Explanation

$? is the exit status of the preceding command; zero denotes success.
