# Study Studio compatibility lab

This is an isolated development vault. Study Studio is currently a specification, not an implemented plugin. Math Studio and Slide Studio are installed for integration testing.

## Visual baseline

Compare heading levels, **bold**, *italic*, ==highlight==, and <mark style="background: #FFB8EBA6;">custom highlight</mark> in light and dark modes.

### Mathematics

Inline $x^2+y^2=r^2$ and display math:

$$
\begin{aligned}u &= x^2+y^2\\
\nabla u &= \begin{bmatrix}2x\\2y\end{bmatrix}
\end{aligned}
$$

> [!note] Callout fixture
> Editable notes, annotations and questions must retain math, links and theme styling.

```python
# Study fixture: select an expression to turn it into a blank later.
def square(x):
    return x * x
```

| Quantity | Meaning |
| --- | --- |
| $u$ | Scalar field |
| $\nabla u$ | Gradient |

## Manual checks

Open Math Studio on the equation, edit and cancel, then edit and save. Create a disposable Slide Studio slide/deck using its commands. Check theme changes, popout windows, hotkeys and undo. Future Study Studio tests belong here. Plugin installation alone does not establish that these checks pass.
