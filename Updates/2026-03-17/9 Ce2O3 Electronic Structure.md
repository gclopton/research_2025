
**The Ce3+ charge state:**
CeO2 has all Ce4+ (zero 4f electrons per Ce). Ce7O12 has a mix — 4 Ce3+ and 3 Ce4+ per formula unit, with ~300,000 possible charge orderings and extensive OCCMATRIX engineering needed to guide the SCF to the right one. Ce2O3 is the other extreme: **all Ce are Ce3+, every time, without exception.** Each Ce3+ has exactly one 4f electron localized on it. There is nothing to order. There is no competing charge state. The SCF is handed a single possible solution and it finds it every time.


**How DFT+U shapes the electronic structure:**

The 4f shell in cerium has 7 orbital states (14 with spin). In Ce2O3 with one 4f electron per Ce, that electron must sit in one of those 7 orbitals. Without DFT+U, all 7 orbitals are degenerate and the 4f electron is delocalized across them — producing a metallic or near-metallic state that does not match experiment. The DFT+U term (Dudarev scheme, U=5.0 eV) penalizes fractional occupation: it raises the energy of partially-filled orbitals and lowers the energy of fully-filled or empty ones. The result is that the single 4f electron collapses into one specific orbital (or a linear combination of them), opening a gap between the occupied 4f state and the empty 4f states above it.

This is the **Hubbard gap** — and it is small.

**Band gap: 0.25 eV**


| Quantity | Value |
| :--- | :---: |
| VBM (spin-up Ce 4f) | $\sim 3.86 \mathrm{eV}$ |
| CBM (spin-up empty) | $\sim 4.12 \mathrm{eV}$ |
| Band gap | $\sim \mathbf{0 . 2 5} \mathbf{~ e V}$ |
| Gap variation $(450-1200 \mathrm{eV})$ | 0.009 eV |


The trend makes physical sense. In CeO2, the 4f shell is completely empty — the gap is the full width of the O 2p to empty 4f separation, ~3 eV. As you reduce the material (add 4f electrons), occupied 4f states rise up into the gap. By Ce2O3, the occupied 4f band sits right at the Fermi level, and the gap shrinks to the tiny DFT+U splitting within the 4f manifold — 0.25 eV.

**Why there is only one DFT+U minimum:**

In Ce7O12, the SCF can fall into many different local DFT+U minima depending on which Ce3+ sites the 4f electrons localize on (up to ~300,000 configurations). OCCMATRIX seeding was essential to reach the correct minimum. In Ce2O3, both Ce atoms are equivalent by symmetry (both are at the same Wyckoff position) and both must be Ce3+ — there is no choice to be made. Every SCF starting point leads to the same ground state. This is why every ENCUT point converged in just 7–9 SCF steps with no seeding required.

**Electronic stability across the ENCUT sweep:**

The band gap is flat at 0.25 ± 0.005 eV from 450 eV to 1200 eV — a variation of less than 4%. There is no gap closure, no metallic transition, and no change in charge state at any ENCUT point. The calculation is in the same insulating Ce3+ ground state at every point in the sweep.






