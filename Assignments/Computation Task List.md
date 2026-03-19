# Computation task list (SHI tracks in ceria)

This note converts the computational commitments implied by `/Users/gradyclopton/ObsidianVaults/research_2025/Assignments/Introduction.md` into an actionable checklist. The organizing principle is end-to-end reproducibility: constrain the forcing first (stopping + radial dose), validate transport next (standalone cylindrical TTM/i-TS and LAMMPS parity), then run controlled model comparisons, and finally quantify track and redox observables.

## 1) Define irradiation inputs and energy deposition forcing

- [ ] Identify the specific ion species, energies, and target conditions to match experiments.
- [ ] Run SRIM to obtain $S_e(z)$ and $S_n(z)$ for the selected conditions.
- [ ] Archive SRIM inputs/outputs and record versions/settings (so runs are reproducible).
- [ ] Construct the velocity-class-dependent radial dose model $S(r,t)$.
- [ ] Specify the source width $r_0$ and tail behavior explicitly (and document choices).
- [ ] Decide which parameter space is a “sweep” versus “fixed baseline” (e.g., $r_0$, coupling strength, diffusion strength) so later trends can’t be dismissed as artifacts.

## 2) Build a standalone cylindrical TTM / i-TS solver

- [ ] Implement a cylindrical TTM/i-TS solver that takes $S(r,t)$ and outputs $T_e(r,t)$, $T_l(r,t)$.
- [ ] Implement the electron–lattice transport parameterization ${C_e(T_e), \kappa_e(T_e), g(T_e,T_l)}$.
- [ ] Establish numerical stability checks (time step sensitivity, radial grid sensitivity, boundary placement).
- [ ] Produce reference “envelopes” $T_e(r,t)$ and $T_l(r,t)$ for representative forcing cases.

## 3) Calibrate and verify LAMMPS electron-field implementation against the standalone solver

- [ ] Configure LAMMPS TTM/2T-MD electron grid diffusion + electron–phonon coupling for the same forcing used in the cylindrical solver.
- [ ] Run matched-input cases and confirm that LAMMPS reproduces consistent $T_e(r,t)$ and $T_l(r,t)$ envelopes.
- [ ] Record the exact mapping between model inputs (source term, geometry, boundary conditions) so “matched inputs” are unambiguous.

## 4) Design production TTM-MD track simulations to avoid boundary/finite-size artifacts

- [ ] Choose simulation domain sizes and boundary/sink/thermostat placement to separate the latent core from the heat-affected zone.
- [ ] Demonstrate that conclusions are stable with respect to boundary placement and cell size (avoid spurious quenching by nearby thermostatted regions).
- [ ] Define the baseline protocol (cell geometry, PBC choices, sink strategy, run length, analysis cadence) used for all interaction models.

## 5) Run controlled inter-model comparisons under identical TTM forcing

- [ ] Select the classical baselines to include (e.g., rigid-ion Buckingham–Coulomb with stabilization; many-body actinide-oxide-type potentials as applicable).
- [ ] Select a reactive/charge-equilibrated model for $\mathrm{CeO_2}$ and reduced ceria (as the “redox-enabled” classical comparator).
- [ ] For each model, run the same track protocol with identical TTM forcing (same $S(r,t)$, same transport parameters, same geometry).
- [ ] Define “redox-enabled vs redox-frozen” comparison pairs that isolate chemistry from forcing/numerics.

## 6) Generate DFT(+U) reference data in VASP (MLIP prerequisite)

- [ ] Select DFT(+U) settings and convergence targets appropriate for ceria redox and defects (and keep them consistent across the corpus).
- [ ] Build the stoichiometry ladder dataset: $\mathrm{CeO_2}$, $\mathrm{Ce_{11}O_{20}}$, $\mathrm{Ce_7O_{12}}$, $\mathrm{Ce_2O_3}$ (chosen polymorph family for the reduced endpoint).
- [ ] Build defect datasets: vacancies, interstitials, Frenkel pairs, clusters (across relevant stoichiometries).
- [ ] Build strained-state datasets for thermoelastic response.
- [ ] Build high-temperature disordered snapshots representing melt and quench environments (the regimes hit during spikes).
- [ ] Organize/train-test splits and keep a record of provenance for each configuration.

## 7) Train and validate two complementary MLIP classes

- [ ] Train a strictly local, MPI-scalable Allegro model intended for large-scale TTM-MD track simulations.
- [ ] Train a charge-equilibrated model (4G-HDNNP with iterative QEq via n2p2) intended to represent global charge redistribution/electrostatics.
- [ ] Validate both models on: (i) stoichiometry ladder, (ii) defect families, (iii) strained states, and (iv) high-$T$ disordered/melt–quench snapshots.
- [ ] Confirm model stability in the temperature/disorder regimes relevant to thermal spikes (not just near-equilibrium crystals).

## 8) Define observables and postprocessing needed to answer the study’s central questions

- [ ] Track morphology: core/shell structure and track radii (define an operational criterion and keep it consistent across models).
- [ ] Oxygen redistribution: define and compute a radial oxygen nonstoichiometry profile $\delta(r)$ (or an equivalent oxygen disorder/redistribution metric).
- [ ] Defects: quantify defect production, clustering, and spatial distributions (early recovery included).
- [ ] Swelling/microstrain: define and compute observables that map onto experimental swelling/microstrain signatures.
- [ ] Redox signatures (define and implement a consistent strategy across model classes).
  - [ ] In charge-equilibrated models, define charge-based metrics and thresholds to label reduced regions/species.
  - [ ] For local MLIPs, implement a DFT-calibrated oxidation-state inference strategy when needed.
- [ ] Create “apples-to-apples” plots/tables (outside this note) that compare observables across interaction models under identical forcing.



