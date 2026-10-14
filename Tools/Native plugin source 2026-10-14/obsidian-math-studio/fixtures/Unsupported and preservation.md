# Unsupported and preservation

These deliberately probe compatibility; not all are expected to render.

## Unknown macro: refuse conversion without changing source

$$
\researchOperator{u}+\customTensor{A}_{ij}
$$

## Native commands to investigate

$$
\newcommand{\vect}[1]{\mathbf{#1}}
\vect{u}=\begin{pmatrix}1\\2\end{pmatrix}
$$

## Code must not become an equation

Inline code: `$x^2$`.

```latex
$$\frac{a}{b}$$
```

Literal currency: \$5 and \$10.

## Whitespace and comments to preserve on cancel or no-op

$$
  x  + y % keep this comment
  = z
$$
