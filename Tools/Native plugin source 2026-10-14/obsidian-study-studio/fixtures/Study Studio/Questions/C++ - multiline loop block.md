---
study:
  version: 1
  id: code-cpp-block
  title: C++ — multiline loop block
  type: code
  concepts:
    - cpp
    - Code completion
  code:
    language: cpp
    source: |-
      #include <vector>
      #include <cassert>
      int main() {
          std::vector<int> values{1, 2, 3};
          int total = 0;
      {{blank:block}}
          assert(total == 6);
      }
  answers:
    - id: block
      accepted:
        - |2-
              for (int value : values) {
                  total += value;
              }
      whitespace: exact
      caseSensitive: true
---

## Prompt

Write a range loop that adds each vector element to total. Match the shown four-space indentation.

## Explanation

Braces delimit the loop body. This item practices a specific range-loop formulation.
