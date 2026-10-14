# Equation corpus

## Inline and repeated expressions

First $x^2+1$ stays here. Second $x^2+1$ must be edited independently.

## Integral

$$
\int_0^1 \frac{x^2}{\sqrt{1+x^2}}\,dx
$$

## PDE and initial condition

$$
\begin{aligned}
\frac{\partial u}{\partial t}+\mathbf{v}\cdot\nabla u
&=\nabla\cdot\left(D\nabla u\right)+f(x,t)\\
u(x,0)&=u_0(x)
\end{aligned}
$$

## Nested matrix

$$
A=\begin{bmatrix}
a_{11}&\frac{\partial u}{\partial x}&\int_0^t f(s)\,ds\\
0&\begin{bmatrix}1&2\\3&4\end{bmatrix}&\lambda^2\\
\alpha&\beta&\gamma
\end{bmatrix}
$$

## Cases

$$
f(x)=\begin{cases}x^2&x\geq0\\-x&x<0\end{cases}
$$

## Preserve every derivation line

$$
\begin{aligned}
(x+h)^2-x^2&=x^2+2xh+h^2-x^2\\
&=(x^2-x^2)+2xh+h^2\\
&=0+2xh+h^2\\
&=2xh+h^2\\
&=h(2x+h)
\end{aligned}
$$

## Manual tag candidate

$$
E=mc^2\tag{A.1}
$$

## Closed multiple integrals

$$
\oiint_S \mathbf{F}\cdot d\mathbf{S}
$$

$$
\oiiint_V f\,dV
$$
