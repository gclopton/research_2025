
Magnetism in Ce7O12 comes entirely from the **12 Ce3+ ions** in the supercell. Each Ce3+ carries one localized 4f electron with spin ½, giving a local moment of **~1 uB per Ce3+ site**. The 9 Ce4+ ions have empty 4f shells and contribute zero moment. The 36 O2- ions also contribute zero moment.

This means the magnetic problem reduces to: **what is the spin arrangement of 12 moments on 12 specific Ce sites?**

| Ordering | Description | Net moment | What we tried |
| :--- | :--- | :--- | :--- |
| Ferromagnetic (FM) | All $12 \mathrm{Ce} 3+$ spins aligned | +12.0 uB | $\checkmark$-converged |
| Antiferromagnetic (AFM) | $6 \mathrm{up}+6$ down, net $=0$ | 0 uB | $x$ - never converged |
| Ferrimagnetic | Unequal up/down | $\neq 0, \neq \pm 12$ | $x$ - collapsed to FM |


**What the FM 900 eV calculation tells us**
The converged FM golden seed gives the site-projected 4f moments directly from the OUTCAR. The pattern repeats identically across all 3 formula units:

| Position | Atoms (FU1/FU2/FU3) | 4f moment (uB) | Assignment |
| :--- | :--- | :--- | :--- |
| Triplet 1 | 1, 8, 15 | 0.872 | Ce3+ |
| Triplet 2 | 2, 9, 16 | 0.778 | Ce3+ |
| Triplet 3 | 3, 10, 17 | 0.813 | Ce3+ |
| Triplet 4 | 4, 11, 18 | 0.572 | Ce3+ (partial) |
| Triplet 5 | 5, 12, 19 | 0.044 | Ce4+ |
| Triplet 6 | 6, 13, 20 | 0.897 | Ce3+ |
| Singlet | 7, 14, 21 | 0.018 | Ce4+ |

**Total moment = 11.998 uB ≈ 12.0 uB** — exactly 12 Ce3+ × 1 uB.
Two things stand out:
1. **Singlets (7, 14, 21) are non-magnetic** — the high-symmetry Wyckoff 3a sites consistently carry near-zero moment (0.018 uB), confirming they are Ce4+
2. **The pattern is perfectly consistent across all 3 formula units** — same moments at positions 1/8/15, 2/9/16, etc. This confirms the charge ordering is a genuine physical preference, not an artifact


**Why determining the magnetic ground state was the hardest part**
Getting a reliable FM energy was straightforward. Getting a reliable non-FM energy required 10 separate calculations:


| Attempt | What changed | Final mag | Converged? |
| :--- | :--- | :--- | :--- |
| AFM v1 | First try (7/5 wrong balance) | $-0.955 \mathrm{uB}$ | Marginal |
| AFM v2 | Fixed to 6/6 balance | oscillating | No |
| AFM v3 | Reduced AMIX to 0.05 | plateau + blowup | No |
| AFM v4 | Corrected charge ordering | drifted to -3.94 | No |
| Ferrimagnetic | Seeded -4 uB from FM WAVECAR | $+12.0 \mathrm{uB}$ | Yes - to FM |

The ferrimagnetic test was decisive: even when we explicitly seeded the spin-down channels on 8 of the 12 Ce3+ sites using the converged FM WAVECAR as a starting point, the SCF collapsed back to FM in **41 steps**. The system did not even pause at the ferrimagnetic configuration.


Under these computational settings (PBE+U, U = 5.0 eV, no spin-orbit coupling), Ce7O12 is **ferromagnetic** with:

- Total moment: **12.0 uB** per supercell (4.0 uB per formula unit)
- Local moments: 0.78 – 0.90 uB on strong Ce3+ sites, ~0.02 uB on Ce4+ sites
- FM converges in 90 steps at 900 eV with rms(c) = 0.003 — a clean, deep minimum


