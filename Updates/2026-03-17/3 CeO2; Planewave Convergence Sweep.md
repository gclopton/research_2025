
| Setting | Value |
| :--- | :--- |
| ENCUT range | $600-950 \mathrm{eV}$ (8 points, 50 eV steps) |
| SCF mode | Default cold start (no WAVECAR seeding, no staging) |
| Smearing | ISMEAR = -5 (tetrahedron method - correct for insulators) |
| Spin | ISPIN = 1 (nonmagnetic) |
| DFT+U | Dudarev, $\mathrm{U}=5.0 \mathrm{eV}$ on Ce 4f |
| EDIFF | $1 \times 10^{-5} \mathrm{eV}$ |
| Convergence criterion | $\pm 2 \mathrm{meV}$ per formula unit relative to 950 eV reference |
| Reference ENCUT | 950 eV (highest point in sweep, used as baseline) |

Every ENCUT point converged in exactly **17 SCF steps** — identical across all 8 points. This is the signature of a well-behaved insulator with a single electronic minimum.

| ENCUT (eV) | $\mathrm{E}_0$ (eV/cell) | $\boldsymbol{\Delta} \mathbf{E}$ from $\mathbf{9 5 0 ~ e V}$ ref (meV/atom) | SCF steps |
| :--- | :--- | :--- | :--- |
| 600 | -47.7990 | 0.59 | 17 |
| 650 | -47.8054 | 0.47 | 17 |
| 700 | -47.8103 | 1.28 | 17 |
| 750 | -47.8089 | 1.05 | 17 |
| 800 | -47.8071 | 0.76 | 17 |
| 850 | -47.8046 | 0.33 | 17 |
| 900 | -47.8030 | 0.07 | 17 |
| 950 | -47.8026 | 0.00 (ref) | 17 |


![[Pasted image 20260317104031.png|500]]
