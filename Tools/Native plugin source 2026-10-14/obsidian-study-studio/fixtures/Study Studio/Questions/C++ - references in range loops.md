---
study:
  version: 1
  id: code-cpp-reference
  title: C++ — references in range loops
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
          for ({{blank:reference}} : values) {
              value *= 2;
          }
          assert((values == std::vector<int>{2, 4, 6}));
      }
  answers:
    - id: reference
      accepted:
        - int& value
        - int &value
        - auto& value
        - auto &value
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the loop declaration so each vector element is modified, not a copy.

## Explanation

A reference binds to each existing vector element. A value variable would change only a copy.
