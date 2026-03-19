

Great opportunity to nail down the concepts. Let me explain with Ce7O12 as the concrete example since you already have intuition for it.

---

**Ferromagnetic (FM)** — all spins point the same direction

```
Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑
Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑
```

Net moment = **+12 uB** (12 × +1). This is your golden seed run.

---

**Antiferromagnetic (AFM)** — spins alternate, _equal_ numbers up and down, _same_ atom type

```
Ce3+↑  Ce3+↓  Ce3+↑  Ce3+↓  Ce3+↑  Ce3+↓
Ce3+↑  Ce3+↓  Ce3+↑  Ce3+↓  Ce3+↑  Ce3+↓
```

Net moment = **0 uB** (6×+1 + 6×-1 = 0). This is what we've been trying to achieve.

---

**Ferrimagnetic** — spins point in opposite directions, but _unequal_ numbers, so they don't cancel

```
Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑  Ce3+↑
Ce3+↓  Ce3+↓  Ce3+↓  Ce3+↓
```

Net moment = **+4 uB** (8×+1 + 4×-1 = 4). This is what your AFM calculations keep drifting toward.

---

The key distinction:

- **FM vs AFM:** same atom type, opposite spin directions, but FM has all aligned while AFM has equal numbers opposing
- **AFM vs ferrimagnetic:** both have up AND down spins, but AFM cancels perfectly (net = 0) while ferrimagnetic doesn't (net ≠ 0)

**Why Ce7O12 makes this tricky:** You have 12 Ce3+ sites carrying moments and 9 Ce4+ sites with no moment. The 12 Ce3+ sites form a frustrated geometry — they don't sit on a simple lattice where perfect alternation (AFM) is geometrically natural. So the SCF keeps sliding to ferrimagnetic (unequal up/down) because that's the closest thing to a local minimum on this frustrated landscape.

A real-world analogy: ferrite magnets (like the ones on your fridge) are ferrimagnetic — that's actually where the name comes from. They're magnetic like FM materials, but weaker because some spins partially cancel.


# Types of AFM Orderings


Great question. The different AFM types describe the **geometric pattern** of how the spins alternate. They were originally defined for perovskite structures (like manganites) but the concept applies broadly.

---

**A-type AFM** — FM within each layer, AFM between layers (what we've been trying)

```
Layer 1:  ↑  ↑  ↑  ↑   (all up)
Layer 2:  ↓  ↓  ↓  ↓   (all down)
Layer 3:  ↑  ↑  ↑  ↑   (all up)
```

Neighbors within a layer: parallel. Neighbors between layers: antiparallel.

---

**C-type AFM** — AFM within layers, FM between layers (opposite of A-type)

```
Layer 1:  ↑  ↓  ↑  ↓   (alternating)
Layer 2:  ↑  ↓  ↑  ↓   (same pattern)
Layer 3:  ↑  ↓  ↑  ↓   (same pattern)
```

Neighbors within a layer: antiparallel. Neighbors between layers: parallel.

---

**G-type AFM** — every nearest neighbor is antiparallel in all directions (checkerboard in 3D)

```
Layer 1:  ↑  ↓  ↑  ↓
Layer 2:  ↓  ↑  ↓  ↑
Layer 3:  ↑  ↓  ↑  ↓
```

This is the most "antiferromagnetic" pattern — maximum neighbor



