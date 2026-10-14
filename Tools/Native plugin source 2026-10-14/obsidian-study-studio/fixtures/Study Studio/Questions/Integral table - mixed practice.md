---
study:
  version: 1
  id: demo-integral-table-mixed
  familyId: demo-integral-table
  title: Integral table — mixed practice
  type: table
  concepts:
    - Calculus
    - Antiderivatives
    - Standard integrals
  answers:
    - id: power
      accepted:
        - x^2
        - x²
        - x^{2}
      caseSensitive: true
    - id: cosine
      accepted:
        - cos(x)
        - cos x
        - \cos x
        - \cos(x)
        - \cos\left(x\right)
      caseSensitive: true
    - id: exponential
      accepted:
        - e^x
        - e^{x}
        - exp(x)
        - \exp(x)
      caseSensitive: true
    - id: arctangent
      accepted:
        - arctan(x)
        - arctan x
        - atan(x)
        - \arctan x
        - \arctan(x)
      caseSensitive: true
    - id: reciprocal
      accepted:
        - 1/x
        - x^-1
        - x^{-1}
        - \frac{1}{x}
      caseSensitive: true
    - id: chain
      accepted:
        - sin(2x)/2
        - (1/2)sin(2x)
        - 0.5sin(2x)
        - \frac{1}{2}\sin(2x)
        - \frac{\sin(2x)}{2}
      caseSensitive: true
  table:
    columns:
      - Integrand $f(x)$
      - One antiderivative $F(x)$
    rows:
      - - text: $2x$
        - blank: power
          sourceText: $x^2$
      - - blank: cosine
          sourceText: $\cos x$
        - text: $\sin x$
      - - text: $e^x$
        - blank: exponential
          sourceText: $e^x$
      - - text: $\dfrac{1}{1+x^2}$
        - blank: arctangent
          sourceText: $\arctan x$
      - - blank: reciprocal
          sourceText: $\dfrac{1}{x}$
        - text: $\ln|x|$, on an interval not containing $0$
      - - text: $\cos(2x)$
        - blank: chain
          sourceText: $\dfrac{1}{2}\sin(2x)$
---

## Prompt

Complete each missing integrand or antiderivative so that

$$F'(x)=f(x).$$

Use the standard forms and **omit the integration constant**. For example, type powers as `x^3` and trig functions as `sin(x)`. Do not include dollar signs.

This prototype matches listed text alternatives rather than proving mathematical equivalence. If a correct form is rejected, keep it so we can add it to the accepted answers.

## Explanation

Differentiate each entry on the right to check the corresponding integrand:

$$
\begin{aligned}
\frac{d}{dx}x^2 &= 2x,\\
\frac{d}{dx}\sin x &= \cos x,\\
\frac{d}{dx}e^x &= e^x,\\
\frac{d}{dx}\arctan x &= \frac{1}{1+x^2},\\
\frac{d}{dx}\ln|x| &= \frac{1}{x}\quad(x\ne0),\\
\frac{d}{dx}\left[\frac12\sin(2x)\right] &= \frac12\cdot2\cos(2x)=\cos(2x).
\end{aligned}
$$

For the full indefinite integrals, append $+C$ to the antiderivatives. The final row checks the factor from the chain rule.
