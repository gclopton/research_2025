
Mixed valence: the defining feature
Ce7O12 cannot be electronically described as "all $\mathrm{Ce} 3+$ " or "all $\mathrm{Ce} 4+$ " - it is genuinely mixed valence.
Charge balance requires:
Per formula unit: $4 \mathrm{Ce} 3++3 \mathrm{Ce} 4+$
- $4 \times(+3)+3 \times(+4)=24=12 \times(-2)$

**Per supercell (3 formula units):** $\mathbf{1 2 ~ C e 3 + + 9 ~ C e 4 +}$
This is fundamentally different from the other two materials:

| Material       | Ce charge state                                              | Electronic complexity  |
| :------------- | :----------------------------------------------------------- | :--------------------- |
| $CeO_{2}$      | All $\mathbf{C e} 4+($ empty 4 f$)$                          | One minimum, trivial   |
| $Ce_{2}O_{3}$  | All $\mathbf{C e} 3+($ one f-electron each $)$               | One minimum, tractable |
| $Ce_{7}O_{12}$ | $\mathbf{1 2} \mathbf{~ C e 3}+\mathbf{+ 9} \mathbf{C e 4}+$ | Many minima, hard      |

Each $\mathbf{C e 3}+$ carries one localized 4 f electron occupying the $f_{z} 3(m=0)$ orbital. This electron is:
- Highly localized - it lives almost entirely on one atom
- Strongly correlated - standard DFT cannot describe it correctly without DFT+U
- The source of the magnetic moment ( 1 uB per Ce3+)

Each $\mathrm{Ce4}$ + has a completely empty 4 f shell - identical to CeO 2 .
The DFT+U correction ( $\mathrm{U}=5.0 \mathrm{eV}$, Dudarev scheme) splits the occupied and unoccupied 4 f states, pushing the occupied $\mathrm{Ce} 3+\mathrm{f}$-electrons down and the empty $\mathrm{Ce} 4+\mathrm{f}$-states up. This stabilizes the chargeordered insulating ground state.

**The charge ordering problem**
With $12 \mathrm{Ce} 3+$ and $9 \mathrm{Ce} 4+$ to assign across 21 Ce sites, the SCF has many possible charge orderings each one is a different local minimum with a different self-consistent solution. Without guidance, the SCF may:
- Find the wrong charge ordering and report a wrong energy
- Oscillate between orderings without converging
- Converge to an unphysical mixed state

This is why OCCMATRIX seeding is required. We explicitly initialize the $4 f$ orbital occupation matrix for all 21 Ce atoms:

| Site | Assignment f-orbital seed |  |
| :--- | :--- | :--- |
| Triplet positions $1,2,3,6$ (atoms $1,2,3,6,8,9,10,13,15,16,17,20)$ | Ce3+ | f_z3 $=1.0$ |
| Triplet positions $4,5+$ singlets (atoms $4,5,7,11,12,14,18,19,21)$ | Ce4+ | all $f=0.0$ |

**Band structure:**
From the converged FM 900 eV golden seed calculation (NELECT $=468$, NBANDS $=288$ ):

| Quantity | Value |
| :--- | :--- |
| VBM (band 228) | 4.637 eV |
| CBM (band 229) | 6.814 eV |
| Band gap | 2.177 eV |
| Character of VBM | Ce3 + occupied 4f states (narrow band, bands 209-228) |
| Character of CBM | Ce4 + empty 4f states |

The 2.177 eV gap is between the occupied Ce3+ 4f band and the empty Ce4+ 4f conduction band is narrower than the CeO2 gap ( 2.968 eV ) because in Ce7O12 the occupied f-electrons sit inside the gap rather than in the valence band - the $\mathrm{Ce} 3+4 f$ states are the valence band maximum.
The band structure also reveals the $12 \mathrm{Ce} 3+$ f-electrons clearly: there is a narrow, flat band of 12 occupied states (bands 209-228, spanning $\sim 0.5 \mathrm{eV}$ ) sitting just below the gap, well separated from the O 2 p valence band below and the empty $\mathrm{Ce} 4+4 \mathrm{f}$ states above.



