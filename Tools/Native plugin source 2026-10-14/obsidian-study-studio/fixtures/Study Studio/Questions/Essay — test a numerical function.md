---
study:
  version: 1
  id: written-code
  title: Essay — test a numerical function
  type: short-answer
  concepts:
    - written reasoning
  written:
    reference: Check simple known cases, a one-element list, negative values, and
      mixed signs. Define whether an empty list raises an error or returns a
      special value, then test that contract. Specify handling of nonnumeric
      values and nonfinite numbers. Use suitable absolute and relative
      tolerances for floating-point results. Distinguish expected behavior from
      assumptions that need clarification.
    rubric:
      - id: criterion-1
        text: Includes ordinary and boundary cases with known expected results.
      - id: criterion-2
        text: Defines and tests the empty-input and invalid-input contract.
      - id: criterion-3
        text: Explains tolerance-based floating-point comparisons and their limitations.
---

## Prompt

You are reviewing a Python function that returns the mean of a list. Propose a test strategy. Discuss ordinary inputs, boundary cases, floating-point comparisons, and how you would specify behavior for invalid input.

## Explanation


