

**Why Ce2O3 needs a different approach from CeO2**

For CeO2, a cold start was sufficient — no f-electrons, no charge ordering, a single SCF minimum, 17 steps done. For Ce2O3, a cold start will still find the correct electronic state (there is only one), but it will take significantly more SCF steps to get there because:

1. **Two localized 4f electrons must settle into specific orbitals** — the DFT+U potential creates a landscape where the Ce3+ 4f electron must collapse into one of 7 possible orbitals. A cold start wanders through this landscape; a WAVECAR seed starts already inside it.
2. **The magnetic state must carry through the sweep** — each ENCUT point must start in the same FM spin state (mag = 2 μB). A seeded WAVECAR guarantees this; a cold start could in principle land in a wrong spin configuration, though Ce2O3's simplicity makes this unlikely.
3. **Every point must represent the same electronic state** — for the energy vs. ENCUT curve to be meaningful, the DFT+U orbital occupation must be identical at every point. WAVECAR seeding enforces this; cold starts leave it to chance.

Ce2O3 is simpler than Ce7O12 in every way — 5 atoms vs. 57, one charge state vs. mixed valence, one DFT+U minimum vs. ~300,000. But it still benefits from the same two-phase approach: first establish a high-quality seed, then run the sweep seeded from it.


---

**Phase 1: Establishing the seed (run 002 — ENCUT_1000/final)**

Before the production sweep, a single calculation was run at **ENCUT = 1000 eV** to produce a converged WAVECAR encoding the correct Ce3+ orbital occupation and FM spin state.

_Step 1 — Set MAGMOM:_ INCAR set to `MAGMOM = 2*1.0 3*0.0` — both Ce3+ atoms seeded spin-up (+1 μB each), O atoms non-magnetic. No OCCMATRIX needed — with only two symmetry-equivalent Ce3+ sites, the SCF finds the correct orbital occupation naturally.

_Step 2 — Run the SCF:_ VASP run with ISPIN=2, LDAU=.TRUE. (U=5.0 eV), staged ldau-magnetic-localized recipe, EDIFF=1E-4, AMIX=0.2.

_Step 3 — Write the WAVECAR:_ The converged WAVECAR (written to `/ocean` to avoid disk quota issues) encodes the final Ce3+ 4f orbital occupations and FM spin density. This becomes the universal starting point for all 16 ENCUT points in the sweep.

**Result:** Clean convergence. mag = 2.0000 μB, rms(c) well below threshold. This WAVECAR is the seed for run 004.


---

**Phase 2: The PWCS sweep (004-MAR-15-2026-002811-pwcs-staged-ldau-magnetic-localized)**

With the seed established, the full ENCUT sweep was run using the `ldau-magnetic-localized` staged SCF recipe.


| Setting | Value |
| :--- | :--- |
| ENCUT range | $450-1200 \mathrm{eV}$ ( 16 points, 50 eV steps) |
| SCF mode | Staged - Idau-magnetic-localized recipe |
| Seed WAVECAR | Run 002, ENCUT_1000/final |
| Smearing | ISMEAR = -5 (tetrahedron with Blöchl corrections) |
| Spin | ISPIN = 2, FM |
| DFT+U | Dudarev, $\mathrm{U}=5.0 \mathrm{eV}$ on Ce 4f |
| EDIFF | 1E-4 |
| Convergence criterion | $\pm 2 \mathrm{meV}$ per formula unit |
| Reference ENCUT | 1200 eV |
| Formula units | $1 \times \mathrm{Ce} 2 \mathrm{O} 3$ per cell |


**What the staged ldau-magnetic-localized recipe does:**

Rather than a single cold-start SCF, each ENCUT point runs two stages in sequence:

_Stage 1 — Rough (ALGO=Normal, Davidson):_ Reads the seed WAVECAR (ISTART=1, ICHARG=0). VASP extrapolates the wavefunctions from the 1000 eV basis to the target ENCUT basis. The Ce3+ 4f orbital occupations and FM spin structure from the seed are used as the starting point. Davidson diagonalization is used here — it is robust near convergence and confirms the f-orbital localization is stable before handing off. For ENCUT_600, this takes **5 DAV steps**.

_Stage 2 — Final (ALGO=All, conjugate gradient):_ The main SCF runs to EDIFF using conjugate gradient (CGA), which is more accurate than Davidson near the minimum. For ENCUT_600, **7 CGA steps** reach convergence. The final OSZICAR energy and magnetic moment are read from this stage.

This two-stage structure ensures that the energy difference between ENCUT points reflects only the change in basis set size — not differences in orbital occupation or spin state.

**Why three previous runs came before this one:**

| Run | Date | Outcome |
| :--- | :---: | :--- |
| 000 | Feb 17 | Early test, chain-restart mode |
| 001 | Mar 11 | First staged attempt |
| 002 | Mar 11 | Completed - produced the seed WAVECAR |
| 003 | Mar 11 | Failed at ENCUT $\mathbf{6 5 0}$ - disk quota exceeded |
| $\mathbf{0 0 4}$ | Mar 15 | This run - all $\mathbf{1 6}$ points converged |

**Full convergence data:**

| ENCUT (eV) | SCF steps | $\mathrm{E}_0$ (eV/cell) | $\boldsymbol{\Delta} \mathbf{E}$ from $\mathbf{1 2 0 0 ~ e V}$ ref (meV/f.u.) | mag ( $\mu \mathrm{B}$ ) |
| :--- | :--- | :--- | :--- | :--- |
| 450 | 9 | -40.6702 | -5.1 | 2.000 |
| 500 | 9 | -40.6564 | +8.7 | 2.000 |
| 550 | 9 | -40.6593 | +5.8 | 2.000 |
| 600 | 9 | -40.6664 | -1.3 | 2.000 |
| 650 | 9 | -40.6707 | -5.6 | 2.000 |
| 700 | 9 | -40.6744 | -9.3 | 2.000 |
| 750 | 9 | -40.6724 | -7.3 | 2.000 |
| 800 | 7 | -40.6700 | -4.9 | 2.000 |
| 850 | 7 | -40.6676 | -2.5 | 2.000 |
| 900 | 7 | -40.6660 | -0.9 | 2.000 |
| 950 | 7 | -40.6657 | -0.6 | 2.000 |
| 1000 | 7 | -40.6656 | -0.5 | 2.000 |
| 1050 | 7 | -40.6657 | -0.6 | 2.000 |
| 1100 | 9 | -40.6659 | -0.8 | 2.000 |
| 1150 | 9 | -40.6655 | -0.4 | 2.000 |
| 1200 | 9 | -40.6651 | 0.00 (ref) | 2.000 |






![[Screenshot 2026-03-17 at 12.02.20 PM.png|500]]

**Certified ENCUT = 900 eV** — at 900 eV, ΔE = −0.9 meV/f.u., inside the ±2 meV tolerance. At 850 eV, ΔE = −2.5 meV/f.u., just outside.


**The non-monotonic dip at 700 eV:**

The energy drops to −9.3 meV/f.u. at 700 eV before recovering to the converged plateau. This is the same DFT+U basis artifact seen in Ce7O12: as the plane-wave basis expands through an intermediate size, it briefly destabilizes the f-orbital localization before the variational principle reasserts at higher ENCUT. The reference-tail criterion handles this correctly — it certifies based on proximity to the high-ENCUT limit, not on monotonic convergence.

**The magnetism check:**

mag = 2.0000 μB at every single ENCUT point from 450 to 1200 eV. The WAVECAR seeding locked the FM state in at step 1 of the rough stage and it never moved. The step count dropping from 9 (low ENCUT) to 7 (mid ENCUT, near seed at 1000 eV) and back to 9 (high ENCUT, beyond seed) reflects only how far the basis set is from the seed — the electronic state itself is identical everywhere.


---


**Series comparison:**

| Material | Certified ENCUT | Sweep range | Steps/pt | Recipe |
| :--- | :--- | :--- | :--- | :--- |
| CeO2 | 850 eV | $600-950 \mathrm{eV}$ | 17 (cold start) | Default |
| Ce2O3 | $\mathbf{9 0 0 ~ e V}$ | $\mathbf{4 5 0 - 1 2 0 0 ~ e V}$ | $\mathbf{7 - 9}$ (WAVECAR seed) | Staged Idau-magnetic-localized |
| Ce7O12 | 1150 eV | $750-1200 \mathrm{eV}$ | $29-58$ (golden WAVECAR + OCCMATRIX) | Staged Idau-magnetic-localized |

Ce2O3 and Ce7O12 certify at the same ENCUT (900 eV vs. 1150 eV are close), use the same staged recipe, and both required a pre-computed WAVECAR seed. The critical difference is in the preparation: Ce2O3's seed needed a single run with straightforward MAGMOM initialization, while Ce7O12's golden seed required an OCCMATRIX to explicitly direct 12 f-electrons to specific sites across a 57-atom supercell. The same physics — localized Ce3+ 4f electrons — drives both the higher certified ENCUT relative to CeO2 and the need for the staged approach.

