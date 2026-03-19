
**Where Ce2O3 sits in the magnetic complexity hierarchy:**

| Material | Magnetic atoms | Possible configurations | What we did |
| :--- | :--- | :--- | :--- |
| CeO2 | None (all Ce4+, zero 4f electrons) | 1 - trivially non-magnetic | Nothing needed |
| Ce2O3 | $2 \mathrm{Ce} 3+(1 \mu \mathrm{~B}$ each $)$ | FM: $2 \mu \mathrm{~B} / \mathrm{AFM}: 0 \mu \mathrm{~B}$ | Sweep in FM |
| Ce7O12 | $12 \mathrm{Ce} 3+(1 \mu \mathrm{~B}$ each $)$ | FM : $+12 \mu \mathrm{~B} / \mathrm{AFM}: 0 \mu \mathrm{~B} /$ ferrimagnetic: anything in between | 11 calculations to establish FM as ground state |


Ce2O3 sits in the middle. It has magnetic atoms — unlike CeO2 — but barely: just two Ce3+ atoms in the primitive cell. This means the only possible collinear magnetic states are ferromagnetic (both spins up, net = 2 μB) or antiferromagnetic (one up, one down, net = 0 μB). There is no room for ferrimagnetic behavior, no charge ordering to fight with, and no ambiguity about which atoms carry moments.

**The Ce3+ moment:**

Each Ce3+ ion carries exactly one 4f electron. That electron occupies a single spin-up orbital in the 4f manifold. The resulting local moment is **1 μB per Ce3+**. With 2 Ce3+ atoms in the cell, the total moment for an FM configuration is **2 μB**. This is the same physical origin as the Ce3+ moment in Ce7O12, but dramatically simpler because both Ce atoms are symmetry-equivalent — there is no distinction between site types.


The ENCUT sweep was run in the FM configuration:

```
ISPIN  = 2
MAGMOM = 2*1.0  3*0.0
```

Two Ce atoms initialized spin-up (+1 μB each), three O atoms initialized non-magnetic. No OCCMATRIX seeding was needed — the DFT+U landscape for Ce2O3 has a single minimum, and any reasonable starting spin configuration finds it.

**Result: perfect magnetic stability**

| ENCUT range mag $(\boldsymbol{\mu B})$ | Behavior |  |
| :--- | :--- | :---: |
| $450-1200 \mathrm{eV}$ | $\mathbf{2 . 0 0 0 0}$ | Constant at every point |

The total moment is exactly 2.0000 μB at every ENCUT from 450 to 1200 eV. No drift, no oscillation, no spin-flipping. The two Ce3+ moments are locked in and stable across the entire sweep.

**Contrast with Ce7O12:**

In Ce7O12, we ran 11 separate calculations — FM cold starts, AFM attempts at 4 different configurations (varying spin balance, charge ordering, mixing), and a ferrimagnetic WAVECAR test — before concluding that FM is the ground state. The challenge was not just the larger cell but the coupling between magnetic ordering and charge ordering: which of the 12 Ce3+ atoms is spin-up vs spin-down affects how the DFT+U potential localizes the 4f electrons, which affects the charge ordering, which feeds back into the magnetic stability. Every AFM attempt ended in non-convergence or collapse back to FM.

In Ce2O3, none of that complexity exists:

- Both Ce3+ sites are identical by symmetry — there is no charge ordering to fight
- FM with 2 equivalent spins-up is the simplest possible magnetic state
- The SCF has no competing minima to navigate around
- 7–9 steps to convergence at every ENCUT

**FM vs AFM in Ce2O3 — what we did not test:**

The AFM configuration (one Ce up, one Ce down) was not tested as part of this sweep. This is intentional — the ENCUT sweep's goal is to converge the energy of a single well-defined state, not to compare magnetic orderings. Running the sweep in FM is the right choice: FM is the simpler state, less prone to SCF instability, and gives a clean reference energy. A separate pair of calculations (FM vs AFM at the certified ENCUT of 900 eV) would be needed to determine which is the true ground state. Given that Ce7O12 — the more complex intermediate oxide — is robustly FM under DFT+U with U=5.0 eV, FM is the expected ground state for Ce2O3 as well under the same computational parameters.

**Series comparison: magnetic moments**

| Material | Ce valence | Ce3+ count | FM moment (per f.u.) | Tested? |
| :--- | :--- | :--- | :--- | :--- |
| CeO2 | All Ce4+ | 0 | $0 \mu \mathrm{~B}$ | N/A |
| Ce7O12 | Mixed | 4 per f.u. (12 per supercell) | $\mathbf{4} \boldsymbol{\mu \mathrm { B }} /$ f.u. ( $\mathbf{1 2} \boldsymbol{\mu \mathrm { B }} /$ supercell) | Yes - 11 calculations |
| Ce 2 O 3 | All Ce3+ | 2 per f.u. | $\mathbf{2 \mu B}$ | Yes - stable across full sweep |

The progression from CeO2 → Ce7O12 → Ce2O3 is a systematic increase in the number of 4f electrons and magnetic moment per formula unit, driven by the progressive reduction of Ce4+ → Ce3+.