
$Ce_{2}O_{3}$ (mp-1182200) is the **fully reduced endpoint** of the cerium oxide series — every cerium atom is Ce3+, with a completely filled 4f¹ configuration. It is the direct contrast to CeO2:

![[Screenshot 2026-03-17 at 11.40.29 AM.png|300]]


$Ce_{2}O_{3}$ occurs naturally as the mineral cerianite's reduced counterpart and is the thermodynamically stable phase of cerium oxide under reducing conditions.


**Crystal structure**
Ce2O3 adopts the **A-type rare-earth sesquioxide structure**, also called the hexagonal La2O3-type structure.

| Property              | Value                                                              |
| :-------------------- | :----------------------------------------------------------------- |
| Space group           | P-3m1 (No. 164) - hexagonal                                        |
| Materials Project ID  | $\mathrm{mp-1182200}$                                              |
| Lattice parameters    | $\|\mathrm{a}\|=\|\mathrm{b}\|=6.187 \ Å,\|\mathrm{c}\|=3.190 \ Å$ |
| Angle between a and b | $120^{\circ}$                                                      |
| c/a ratio             | 0.5155                                                             |
| Atoms per cell        | $2 \mathrm{Ce}+3 \mathrm{O}=5$ atoms                               |
| Cell volume           | $105.8 \ Å^3\left(52.9 \ Å^3\right.$ per formula unit $)$          |

The structure is **layered** — Ce-O planes stack along the c-axis. Each Ce3+ sits in a 7-fold coordinated environment (one O above, three O in-plane, three O below).


**Both Ce atoms are equivalent by symmetry**

Unlike Ce7O12 with its two distinct Wyckoff sites (singlets and triplets), in Ce2O3 **both Ce atoms occupy the same Wyckoff site** (2d in P-3m1). They are related by the inversion symmetry of the cell. This means:

- Both Ce are Ce3+ — there is no charge ordering problem
- Both carry the same f-electron configuration
- There is only **one possible charge state** — no competing DFT+U minima
- The SCF always finds the same solution regardless of starting point

This is why Ce2O3 is much easier to converge than Ce7O12.


**Ce3+–O bond lengths:** From the Materials Project geometry (mp-1182200):

| Bond type                                               | Length $(\dot{\mathbf{A}})$ |
| :------------------------------------------------------ | :-------------------------- |
| $\mathrm{Ce} 3+-\mathrm{O}$ (3 equivalent bonds, set 1) | $2.3909 \ Å$                |
| $\mathrm{Ce} 3+-\mathrm{O}$ (3 equivalent bonds, set 2) | $2.4004 \ Å$                |
| Mean Ce3+-O                                             | $\mathbf{2 . 3 9 5 6} \ Å$  |

**Comparison across the series:**

| Material | Ce charge | Mean Ce-O bond $(\ Å)$ | Relative to CeO2 |
| :--- | :--- | :--- | :--- |
| CeO2 | Ce4+ | $2.271 \ Å$ | baseline |
| Ce7O12 Ce3+ sites | Ce3+ | $2.398 \ Å$ | $+0.127 \ Å(+5.6 \%)$ |
| Ce2O3 | Ce3+ | $\mathbf{2 . 3 9 6} \ Å$ | $+\mathbf{0 . 1 2 5} \ Å(+\mathbf{5 . 5 \%})$ |

The Ce3+–O bond in Ce2O3 and the Ce3+ sites in Ce7O12 are essentially identical (~2.396–2.398 Å), confirming that the local Ce3+ environment is consistent across the cerium oxide series. The ~0.125 Å elongation relative to CeO2 is the direct structural signature of the extra 4f electron expanding the Ce3+ ion relative to Ce4+.


| Property | CeO2 | Ce2O3 | Ce7012 |
| :--- | :--- | :--- | :--- |
| Atoms | 6 | 5 | 57 |
| Ce sites | 1 type | 1 type | 2 types (singlet + triplet) |
| Charge ordering | None | None | 12 Ce3+ / 9 Ce4+ |
| f-electrons | 0 | 2 (one per Ce) | 12 |
| DFT+U minima | 1 | 1 | ~300,000 |
| Structure type | Cubic | Hexagonal | Rhombohedral |

Ce2O3 introduces the complication of localized f-electrons and magnetism that CeO2 lacks, but without the charge ordering problem that makes Ce7O12 so difficult. It is the natural stepping stone between the two.


