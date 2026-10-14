---
study:
  version: 1
  id: code-python-regex
  title: Python — regex structure
  type: code
  concepts:
    - python
    - Code completion
  code:
    language: python
    source: |-
      import re
      pattern = r"{{blank:pattern}}"
      assert re.{{blank:method}}(pattern, "AB-123") is not None
      assert re.fullmatch(pattern, "AB-1234") is None
  answers:
    - id: pattern
      accepted:
        - "[A-Z]{2}-[0-9]{3}"
        - "[A-Z]{2}-\\d{3}"
      whitespace: exact
      caseSensitive: true
    - id: method
      accepted:
        - fullmatch
      whitespace: exact
      caseSensitive: true
---

## Prompt

Use two uppercase ASCII letters, a hyphen, and exactly three digits. Select the API that tests the whole string.

## Explanation

Character classes and repetition counts describe the format; fullmatch requires the entire string to match.
