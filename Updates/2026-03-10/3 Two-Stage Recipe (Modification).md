
**Problem:** MAGMOM only biases spin density at the first SCF step - it carries no orbital occupation information. $\mathrm{For}_2 \mathrm{Ce}_7 \mathrm{O}_{12}$ ( $12 \mathrm{Ce}^{3+}$ and $9 \mathrm{Ce}^{4+}$ sites), the SCF must discover the correct charge ordering and orbital occupations on its own, with too many competing basins to do so reliably.
_Step 1_ - Bootstrap a single known-good state
- Construct an OCCMATRIX file encoding the expected $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ charge and orbital ordering
- Run a single ENCUT point with occupation matrix control to constrain the f-electrons into the correct configuration
- Verify: site-resolved moments, occupation matrices, band gap, and energy are physically reasonable

_Step 2_ - WAVECAR-seed the full sweep
- Use the converged WAVECAR from Step 1 to seed all ENCUT points (already proven for $\mathrm{Ce}_2 \mathrm{O}_3$ )
- The WAVECAR carries the full orbital occupation information, locking each point into the correct basin from step 1
- The two-stage recipe (Davidson → RMM-DIIS) then refines within that basin

_Step 3_ (if needed) - Combine both seeds
- If WAVECAR extrapolation degrades at distant ENCUT values, supply both OCCMATRIX and WAVECAR as redundant constraints








![[Screenshot 2026-03-11 at 2.48.39 PM.png]]





| ENCUT (eV) | Stage | Active | SCF Steps | NELM | NELM Util. (%) | RMS ΔE (eV) | \|ΔE\| last (eV) | Status |
|-----------:|-------|:------:|----------:|-----:|---------------:|------------:|-----------------:|--------|
| 400 | final |  | 125 | 300 | 41.7 | — | 0.000 | Unstable (E spikes) |
| 400 | root  | * | 125 | 300 | 41.7 | — | 0.000 | Unstable (E spikes) |
| 400 | rough |  | 301 | 300 | **100** | 2.290 | 0.000 | NELM ceiling reached |
| 450 | final | * | 56  | 300 | 18.7 | — | 0.002 | **Converging** |
| 450 | rough |  | 301 | 300 | **100** | 0.603 | 0.000 | NELM ceiling reached |
| 500 | final |  | — | — | — | — | — | Not started |
| 500 | rough | * | 205 | 300 | 68.3 | 1.248 | 0.012 | Unstable (E spikes) |
| 550 | final |  | — | — | — | — | — | Not started |
| 550 | rough | * | 134 | 300 | 44.7 | 2.484 | 0.090 | Unstable (E spikes) |
| 600 | final |  | — | — | — | — | — | Not started |
| 600 | rough | * | 145 | 300 | 48.3 | 2.157 | 0.022 | Unstable (E spikes) |
| 650 | final |  | — | — | — | — | — | Not started |
| 650 | rough | * | 123 | 300 | 41.0 | 2.121 | 0.045 | Unstable (E spikes) |
| 700 | final |  | — | — | — | — | — | Not started |
| 700 | rough | * | 103 | 300 | 34.3 | 7.029 | 2.422 | Unstable (E spikes) |
