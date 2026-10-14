---
study:
  version: 1
  id: code-cpp-lambda
  title: C++ — lambda capture and predicate
  type: code
  concepts:
    - cpp
    - Code completion
  code:
    language: cpp
    source: |-
      #include <algorithm>
      #include <vector>
      #include <cassert>
      int main() {
          int limit = 2;
          std::vector<int> values{1, 2, 3, 4};
          auto count = std::count_if(values.begin(), values.end(),
              [{{blank:capture}}](int x) { return {{blank:predicate}}; });
          assert(count == 2);
      }
  answers:
    - id: capture
      accepted:
        - limit
        - "&limit"
      whitespace: exact
      caseSensitive: true
    - id: predicate
      accepted:
        - x > limit
        - limit < x
      whitespace: exact
      caseSensitive: true
---

## Prompt

Complete the capture and predicate so count_if counts values above limit.

## Explanation

The lambda needs access to limit; its predicate returns true for elements to count.
