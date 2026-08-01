# Ce7O12 OMC Calculation Procedure

**Goal:** Establish a ground-state Ce3+/Ce4+ 4f localization branch for Ce7O12 in a production cell of at least 100 atoms, using occupation-matrix-controlled (OMC) DFT+U in the Watson-patched VASP, and produce a documented branch suitable as a DFT+U reference state for AIMD or MLIP data generation. The selected branch is defined by its released (occupation-control-removed) ordinary DFT+U energy, its retained site pattern, and its restart robustness.

---

## 0. Prerequisites (fix before Step 1)

These values are fixed once and held identical for every Ce7O12 calculation in this procedure and across the sibling CeO2, Ce11O20, and Ce2O3 reference work.

- **Structure source.** Materials Project `mp-2629` (Ce7O12). Record the downloaded CIF hash.
- **Executable.** Watson-patched VASP 5.4.4 `vasp_std_omc_5.4.4`, build checksum `6f49e6c4fd1fbd0af0395df3aa6d39f4122d04b4708ad2f5fd3bb1387e0934b6`. Confirm with `strings` that the binary contains `OCCEXT found - reading occupation matrix from external file OCCMATRIX`.
- **Plane-wave cutoff.** `ENCUT` = the converged value from the Ce7O12 PWCS sweep. Current recorded value: 650 eV. Source of record: the PWCS run index. Do not re-derive per cell.
- **k-point density.** Gamma-centered mesh at the converged density from the Ce7O12 KPCS sweep. Apply the same reciprocal-space density to every cell by scaling the mesh to the cell's reciprocal lattice; do not re-sweep per cell.
- **DFT+U policy (reference functional).** Dudarev (`LDAUTYPE = 2`). `U(Ce 4f) = 5.0 eV` (Nolan et al. 2005). `U(O 2p) = 0.0 eV`. This U set is the project reference policy and is identical for CeO2, Ce7O12, Ce11O20, and Ce2O3.
- **Localized-Ce3+ reference trace.** `s_loc` = the released f spin-trace difference of a single, unambiguously localized Ce3+, used only to calibrate the Step 7.2 localization gate. Provisional value: `s_loc = 0.80` (from the smoke-run released localized sites, which sat at 0.70-0.84). Refine once by reading the released trace from a CeO2 + one-excess-electron calculation run with this INCAR, then record the final value and re-evaluate any gated runs against it. Treat `s_loc` as an imported constant, like `ENCUT`; no CeO2 calculation is part of this procedure. **Freeze rule:** `s_loc = 0.80` is fixed for the entire Ce7O12 campaign. It may be changed only by adding a dated calibration entry here (source run, released trace, date), after which every already-gated run is re-evaluated against the new value. Do not change `s_loc` between batches without that record.
- **enumlib.** Install `enum.x` and `makestr.x` (`conda install conda-forge::enumlib`) on the host that runs the pymatgen enumeration. Confirm both are on `PATH`.

---

## 1. Combinatorial count

1.1. Reduce `mp-2629` to its primitive cell with pymatgen `SpacegroupAnalyzer(struct, symprec=0.1).get_primitive_standard_structure()`. Record the space group, atom count, Ce count `N_Ce`, and the number of Ce7O12 formula units in the primitive cell.

Validate the reduced cell before proceeding: confirm the Ce:O ratio is 7:12, that `N_Ce` and the O count are integer multiples of the formula unit, and that the oxygen coordination environment around each Ce (the ordered vacancy framework) is unchanged from the input `mp-2629` cell. If the reduction returns a cell that does not preserve the ordered framework — wrong stoichiometry, broken vacancy pattern, or symmetrization that moves atoms off the ordered sites — do not reduce: run the enumeration in the `mp-2629` cell as supplied and set `N_Ce` and `N_Ce3` from that cell.

1.2. From the formal valence count, the number of Ce3+ per formula unit is 4 and the number of Ce4+ is 3 (`4*(+3) + 3*(+4) = +24 = -(12*(-2))`). Set `N_Ce3 = 4 * (formula units in the primitive cell)`.

1.3. Record the raw combinatorial count before symmetry reduction:

```text
N_raw = binomial(N_Ce, N_Ce3)
```

For a single-formula-unit primitive cell (`N_Ce = 7`, `N_Ce3 = 4`), `N_raw = binomial(7,4) = 35`.

---

## 2. Symmetry-reduced enumeration (pymatgen + enumlib)

Enumerate the symmetry-distinct Ce3+/Ce4+ orderings **inside the primitive cell**, which is the defining periodicity of the ordered phase. Do not enumerate in a supercell, and do not enumerate vacancy/oxygen arrangements — the oxygen framework is fixed by `mp-2629`.

2.1. Oxidation-decorate the primitive cell: O as `O2-`, every Ce site as the disordered composition `{"Ce3+": N_Ce3/N_Ce, "Ce4+": 1 - N_Ce3/N_Ce}`.

2.2. Enumerate:

```python
from pymatgen.transformations.advanced_transformations import EnumerateStructureTransformation

est = EnumerateStructureTransformation(
    min_cell_size=1,
    max_cell_size=1,
    symm_prec=0.1,          # recorded tolerance; do not change between batches
    sort_criteria="ewald",  # oxidation states present -> electrostatic pre-rank
)
orderings = est.apply_transformation(decorated_struct, return_ranked_list=100000)
```

2.3. Assign each returned ordering a stable integer `candidate_id` in the returned order. For each candidate, record: the Ce POSCAR indices assigned Ce3+, the Ce POSCAR indices assigned Ce4+, the Ewald pre-rank energy, and the parent structure hash. Store as `Ce7O12_site_patterns.csv`.

2.4. Configurational degeneracies are not produced by this path and are not used in this procedure. If degeneracy weights are later required, compute them separately from the Ce-sublattice symmetry operations with `spglib`.

---

## 3. Anchor candidate

3.1. Construct the experimentally/literature-implied Ce3+ ordering for Ce7O12 (Ce3+ on the sites dictated by the vacancy ordering). Express it as a Ce3+ POSCAR-index set in the same primitive cell.

3.2. Confirm this ordering appears as one of the enumerated `candidate_id` rows from Step 2. Record its `candidate_id`. This candidate is run first in Step 6 and is the expected ground state; the remaining enumerated candidates are the completeness check.

---

## 4. OCCMATRIX seed construction

The `OCCMATRIX` file controls all Ce sites. The first line is the number of controlled atoms (all Ce in the cell). Each Ce block is:

```text
<POSCAR_atom_index> 3 2
<7x7 spin-up matrix>
<7x7 spin-down matrix>
```

`3` is `L = 3` (f). `2` is the number of spin blocks. The 7 rows/columns are the local f projectors (indices 1..7) in the Watson/VASP real spherical-harmonic basis. The mapping of those indices to magnetic quantum numbers `m = -3..+3` follows VASP's real-harmonic ordering; confirm the exact index-to-`m` order against the Watson patch documentation before attaching any physical orbital label. The seed in Step 4.2 is defined by matrix position, not by an assumed `m`.

4.1. **Ce4+ sites:** both 7x7 blocks are all zeros.

4.2. **Ce3+ sites, default seed (`diag6`):** spin-up block has `1.0` at projector position `(6,6)`; all other spin-up entries are 0; the spin-down block is all zeros. The seed is named by matrix position, not by orbital label, until the index-to-`m` convention is confirmed (Step 4 note); once index 6 is verified to be `m = +2`, it may be relabeled `diag_f2`. Position `(6,6)` is expected to be the f2 orbital, which lies in the low-energy cubic `t2u` set for fluorite CeO2 — a reasonable AW-motivated starting choice, not a claim that it is the ground-state orbital in the lower-symmetry Ce7O12 environment. The final orbital character is set by the release (Phase B/C), not by the seed.

4.3. **Ce3+ sites, robustness seed (`local6`, used only if `diag6` fails targeting in Step 6):** build the local Ce-O frame from the coordinating oxygen positions of that Ce, form the 7x7 Wigner-D rotation `R` for `l = 3` in VASP's **real** spherical-harmonic basis, and set the spin-up block to `R · n · R^T`, where `n` is the `diag6` spin-up matrix from 4.2. `R` and `n` must both be in the real-harmonic convention. The spin-down block stays all zeros.

4.4. Verify the written file: total spin-up trace `= N_Ce3`, total spin-down trace `= 0`. Record `occmatrix-generation-manifest.txt`.

4.5. **MAGMOM and spin.** In POSCAR atom order, set `MAGMOM` to `+1.0` on each Ce3+ index, `0.0` on each Ce4+ index, and `0.0` on every O. Set `NUPDOWN = N_Ce3` (ferromagnetic baseline). The Ce3+ index set, the OCCMATRIX f1 sites, and the `MAGMOM = +1` sites must be the identical set.

---

## 5. Common INCAR

Identical electronic settings for all OMC and release runs in this procedure. The two differences between phases are `OCCEXT` and the restart tags (Step 6).

```text
ENCUT     = 650          # frozen PWCS value (Prereq 0)
ISPIN     = 2
ISYM      = 0
LASPH     = .TRUE.
LMAXMIX   = 6
LDAU      = .TRUE.
LDAUTYPE  = 2
LDAUL     = 3 -1         # species order Ce O ; U on Ce f only
LDAUU     = 5.0 0.0
LDAUJ     = 0.0 0.0
LDAUPRINT = 2
LORBIT    = 11
EDIFF     = 1E-6
EDIFFG    = -0.01
NELM      = 200
NELMIN    = 6
ISMEAR    = 0
SIGMA     = 0.02
ALGO      = Normal
AMIX      = 0.2
BMIX      = 0.0001
AMIX_MAG  = 0.2
BMIX_MAG  = 0.0001
LWAVE     = .TRUE.
LCHARG    = .TRUE.
```

---

## 6. OMC workflow per candidate (primitive scale)

Run this three-phase workflow for the anchor candidate first, then for every other enumerated candidate. All runs in this step use the primitive cell. Ions relax; the cell is fixed (`ISIF = 2`).

**Optional triage (use only when enumeration returns many candidates, e.g. more than ~12 after symmetry reduction).** Before committing every candidate to the full `NSW = 60` workflow, run a cheap relaxed probe: Phase A with `NSW = 10`, then a short Phase B release with `NSW = 10`. This is a collapse-reject filter only, not an acceptance test. Reject a candidate here only on an obvious failure — the imposed pattern delocalizes, or all intended Ce3+ electrons leave their sites. Any candidate that plausibly targets and localizes, and any ambiguous case, proceeds to the full workflow below; a few ionic steps give the polaron only partial distortion, so a borderline candidate is never rejected on a short probe. Skip this triage when the candidate count is small enough to run all candidates at full length.

**Phase A — OMC-on, relax under constraint.** Add `OCCEXT = 1` and place the candidate `OCCMATRIX` (Step 4) in the directory. Set `NSW = 60`, `IBRION = 2`, `ISIF = 2`. Start from the candidate's enumerated POSCAR. This phase lets the lattice form the polaronic distortion that matches the imposed pattern. The Phase A energy is diagnostic only and is never used for ranking.

Acceptance for Phase A: `OUTCAR` contains the `OCCEXT` read marker; the electronic loop reaches `EDIFF` before `NELM` on the final ionic step; the final printed f occupation traces equal the imposed pattern (spin-up trace 1.0 on each Ce3+, 0.0 on each Ce4+); final magnetization `≈ N_Ce3`. If targeting fails (a Ce3+ site does not reach unit spin-up trace), rerun Phase A with the `local6` seed (Step 4.3) for the failing site.

**Phase B — release, restart from wavefunction.** Copy `POSCAR<-CONTCAR`, `WAVECAR`, `CHGCAR` from Phase A. Remove `OCCEXT`; remove the `OCCMATRIX` file. Set `ISTART = 1`, `ICHARG = 1`, `NSW = 60`, `IBRION = 2`, `ISIF = 2`. The submit script aborts if `OCCEXT` appears in INCAR or an `OCCMATRIX` file exists. The Phase B energy is the physical ranking energy for the candidate.

**Phase C — release, restart from structure only.** Copy `POSCAR<-CONTCAR` from Phase A; do **not** copy `WAVECAR` or `CHGCAR`. Set `ISTART = 0`, `ICHARG = 2`, `NSW = 60`, `IBRION = 2`, `ISIF = 2`, and the Step 4 `MAGMOM`. Run Phase C for the anchor candidate, any candidate within 0.05 eV of the current lowest Phase B energy, and any candidate selected to go to production. The branch is restart-robust if Phase B and Phase C give a symmetry-equivalent Ce3+ set (Step 7.3) **and** `|E_B - E_C| <= 5 meV per formula unit`; otherwise record both final patterns and mark the candidate not restart-robust.

---

## 7. Ranking and gates (primitive scale)

Apply these gates to every Phase B (and Phase C) result before using its energy. Energies that fail any gate are not ranked.

7.1. **Convergence gate.** `OUTCAR` prints the `EDIFF` stop marker; the final electronic step is strictly below `NELM`; final `|dE| <= EDIFF` and `|d eps| <= EDIFF`; over the last `min(20, n_steps)` electronic steps, at least 80% satisfy `|dE| <= 5*EDIFF` and `|d eps| <= 5*EDIFF`, and the median `rms` of the last half does not exceed the median `rms` of the first half.

A candidate that fails this gate for numerical reasons (SCF did not converge, or the late tail is oscillatory) is not scientifically rejected. Retry it once with an SCF-protocol variation — reduce `AMIX` to 0.1, keep `BMIX = 0.0001`, optionally switch `ALGO` to `All` or `Damped`, and raise `NELM` to 300 — before setting it aside. Only a candidate that still fails after the SCF retry is excluded, and it is recorded as `non_converged`, which is distinct from a physically rejected pattern.

7.2. **Localization gate (calibrated, not hardcoded).** From the final LDA+U occupation matrices, compute per-Ce spin-trace difference `s = trace(up) - trace(down)`. Released projector traces are reduced from 1.0 by hybridization, so the thresholds are scaled from the recorded localized-Ce3+ reference `s_loc` (Prerequisites) rather than fixed at 0.8/0.2. Set the Ce3+ floor `s_hi = 0.85 * s_loc` and the Ce4+ ceiling `s_lo = 0.25 * s_loc`.

Pass conditions: every intended Ce3+ site has `s >= s_hi`; every intended Ce4+ site has `s <= s_lo`; and the gap between the `N_Ce3`-th and (`N_Ce3`+1)-th ranked `s` values is at least `0.5 * (s_hi - s_lo)`. Record the count of Ce sites in the mid-band `s_lo < s < s_hi` as a sharpness diagnostic. A candidate fails only on the floor/ceiling or the ranked-gap test; mid-band sites are recorded but do not by themselves reject a candidate.

7.3. **Site-pattern equivalence gate.** Using `spglib`/`pymatgen` on the Ce sublattice with `symprec = 0.1`, test whether the final localized Ce3+ set lies in the same symmetry orbit as the intended Ce3+ set. Record `site_pattern_equivalence = retained | symmetry_equivalent | changed`.

When a release is `changed` (drifts to a different but coherent Ce3+ set), record which enumerated `candidate_id` that final set matches. Because Step 2 enumerates every symmetry-distinct primitive ordering, the drifted-to pattern is already its own candidate and is seeded and ranked on its own, so nothing is lost; the `changed` record cross-links the two and is evidence that the drifted-to pattern is favorable. At production scale, where enumeration is not exhaustive, an emergent pattern is instead captured by Step 9.3.

7.4. **Ranking.** Among candidates that pass 7.1–7.3, rank by Phase B released total energy, lowest first. Phase B (restart from the prepared wavefunction and charge) supplies the ranking energy; Phase C (structure-only restart) is the robustness check and is not used as an alternative ranking energy. Record `Ce7O12_branch_ranking.csv` with `candidate_id`, intended Ce3+ set, final Ce3+ set, `site_pattern_equivalence`, Phase B energy, relative energy, final magnetization, per-site `s`, and max force.

7.5. Select the lowest-energy candidate plus every candidate within 0.05 eV of it for promotion to production (Step 8). The Phase B ranking is provisional with respect to spin: before treating any ordering as the ground state, run the spin-ordering check (Step 10.1) on the lowest-energy candidate and every candidate within 0.10 eV of it, and re-rank if a non-ferromagnetic arrangement lowers a candidate's energy.

---

## 8. Build the production cell (>= 100 atoms)

8.1. Choose an integer supercell of the ordered cell whose atom count is at least 100. With a 57-atom conventional cell, a 1x1x2 (or equivalent) supercell gives 114 atoms (`Ce42 O72`, `N_Ce3 = 24`). Record the supercell matrix and the resulting atom and Ce3+ counts.

8.2. Propagate each promoted ground-state ordering into the supercell by replication: every replicated Ce inherits the Ce3+/Ce4+ label of its image in the small cell. Regenerate the production `OCCMATRIX` and `MAGMOM` for the full Ce3+ index set (Step 4), with `NUPDOWN = N_Ce3` for the production cell.

8.3. Scale the k-mesh to the production reciprocal lattice at the frozen k-density (Prereq 0).

---

## 9. Production OMC workflow

9.1. Run Phase A, Phase B, and Phase C (Step 6) on the production cell for each promoted ordering, using the production `OCCMATRIX`, `MAGMOM`, and k-mesh.

9.2. Apply the Step 7 gates at production scale. For the localization gate, evaluate `s` over all production Ce sites.

9.3. If a promoted ordering's released production ground state breaks the small-cell periodicity (the final Ce3+ pattern is not a clean replication of the primitive ordering), enumerate Ce3+ orderings in the supercell (Step 2 with the supercell as the input cell) restricted to patterns consistent with the observed symmetry breaking, and run those through Steps 6–7 at production scale.

9.4. The production reference branch is the promoted ordering with the lowest Phase B production energy that passes all gates. Optionally relax this single winner with `ISIF = 3` to obtain the cell-relaxed reference geometry.

---

## 10. Spin-ordering and orbital-seed robustness

10.1. **Spin ordering.** For the lowest-energy ordering and every ordering within 0.10 eV of it (Step 7.5), rerun Phase A->B with alternative collinear spin assignments on the fixed Ce3+ set: (a) all Ce3+ spin-up (`NUPDOWN = N_Ce3`, baseline); (b) a compact half-up/half-down arrangement (`NUPDOWN = 0`, per-site `MAGMOM` signs); (c) a separated half-up/half-down arrangement if distinct. If the Phase B energy spread across spin arrangements is small relative to the Step 7 site-pattern energy spread, keep the baseline; otherwise the spin arrangement becomes part of the branch definition.

10.2. **Orbital seed.** For the winning ordering, rerun Phase A->B with the `local6` seed (Step 4.3) and with one rank-1 projector seed `v v^T`, where `v` is the dominant spin-up eigenvector of the converged Phase A occupation matrix. If all seeds release to the same Ce3+ pattern and energy, the branch is seed-independent; record the result.

---

## 11. Deliverable: branch catalog

Write `Ce7O12_branch_catalog.md` recording, for the production reference branch and every competing branch within 0.10 eV: phase, `candidate_id`, supercell matrix, intended and final Ce3+ index sets, orbital seed, spin assignment, release type, Phase B energy and relative energy, per-site `s`, final magnetization, max force, `site_pattern_equivalence`, structure hash, and the converged reference POSCAR path. The branch catalog and the relaxed reference POSCAR are the inputs handed to AIMD/MLIP generation; the POSCAR alone is not sufficient.

---

## Differences from Allen & Watson (2014)

- Enumeration uses pymatgen `EnumerateStructureTransformation` (enumlib backend), not the SOD code.
- Enumeration is over Ce3+/Ce4+ valence orderings on a fixed ordered-phase oxygen framework, not over electron sites in an otherwise stoichiometric host with a single vacancy.
- The ordering is decided in the primitive cell and tiled to a production cell of at least 100 atoms, rather than studied directly in the defect supercell.
- Phase A relaxes ions under the occupation constraint, so the polaronic distortion forms before release; the smoke-test fixed-ion preparation is not used.
- The DFT+U policy applies U to Ce 4f only (`U(O 2p) = 0`), fixed identically across the ceria reference set.
- Released energies are gated on electronic convergence, localization sharpness, and symmetry-equivalence before any energy comparison.
