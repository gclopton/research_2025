---
study:
  version: 1
  id: code-cpp-template
  title: C++ — template declaration
  type: code
  concepts:
    - cpp
    - Code completion
  code:
    language: cpp
    source: |-
      #include <cassert>
      template <{{blank:parameter}}>
      {{blank:result}} twice(T value) { return value + value; }
      int main() {
          assert(twice(3) == 6);
          assert(twice(1.5) == 3.0);
      }
  answers:
    - id: parameter
      accepted:
        - typename T
        - class T
      whitespace: exact
      caseSensitive: true
    - id: result
      accepted:
        - T
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the template parameter declaration and function return type.

## Explanation

T names the template type parameter, used for both the argument and return type.
