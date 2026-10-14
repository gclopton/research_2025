# Introduction to integrals

An antiderivative reverses differentiation: $F'(x)=f(x)$. Since constants differentiate to zero, an indefinite integral describes a family, $\int f(x)\,dx=F(x)+C$.

For example, $\int 2x\,dx=x^2+C$. More generally, $\int x^n\,dx=x^{n+1}/(n+1)+C$ for $n\ne -1$ on an interval where the functions are defined. The case $n=-1$ gives $\ln|x|+C$ on an interval excluding zero.

## Check the idea

```study
calc-antiderivative
```

## Definite integrals

For a continuous function, the definite integral measures signed accumulation. The fundamental theorem gives

$$\int_a^b f(x)\,dx=F(b)-F(a).$$

Thus $\int_0^2 2x\,dx=2^2-0^2=4$. Contributions below the x-axis count negatively. In particular, $\int_{-1}^1x\,dx=0$, although the total geometric area is positive.

## Review together

```study-group
title: Integral practice
questions:
  - calc-power
  - calc-table
  - calc-definite
  - calc-order
  - calc-explain
  - calc-draw
```
