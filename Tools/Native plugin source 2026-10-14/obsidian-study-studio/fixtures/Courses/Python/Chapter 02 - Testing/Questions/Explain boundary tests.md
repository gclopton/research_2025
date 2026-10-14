---
study:
  version: 1
  id: python-tests
  title: Explain boundary tests
  type: short-answer
  concepts:
    - Testing
  courseIds:
    - lab-python
  written:
    reference: Use known results, a one-element list, mixed signs, and an explicit
      empty-input contract. An empty mean is undefined; the implementation may
      raise a documented exception. Test that contract.
    rubric:
      - id: ordinary
        text: Includes ordinary cases with known expected values.
      - id: boundary
        text: Includes a one-element case and specifies empty-list behavior.
      - id: check
        text: Explains how the tests check the documented contract.
  chapters:
    - courseId: lab-python
      chapterId: 02-testing
      title: 02 · Testing
---

## Prompt

Describe tests for a function that returns the mean of a list. Explain what you would do about an empty list.

## Explanation


