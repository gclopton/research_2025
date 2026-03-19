

In this work, we develop a model of swift heavy ion track formation in ceria that couples thermal-spike dynamics with redox and nonstoichiometry, and we show that incorporating these processes produces parameter-dependent changes in core and shell radii, radial oxygen redistribution, swelling/microstrain signatures, and post-spike recovery kinetics, linking redox-driven defect chemistry to track formation and evolution


# End-to-end computational workflow for SHI track formation in Ce–O

## Step 0: Define the computational study design and target observables

- The computational campaign is defined on a small set of primary axes: ($(S_e,\ \mathrm{MeV/u})$) (irradiation condition), ($S(r,t)$) (radial dose model and characteristic radius ($r_0$)), initial chemical state (($\delta$) and vacancy ordering), microstructure class (single crystal vs sink-rich), temperature protocol, and fluence regime (single-impact vs overlap).
    
- The analysis targets are fixed a priori: core and shell radii, radial oxygen redistribution ($\delta(r)$), density deficit, swelling/microstrain proxies, defect populations and clustering statistics, and redox proxies ($Ce(^{3+}$)-like metrics).
    

**Output artifact:** a study manifest listing the parameter vector, the subset of planned sweeps, and the definitions of each reported observable.



## Step 1: Compute stopping power for each irradiation condition

- Electronic and nuclear stopping powers ($S_e(z)$) and ($S_n(z)$) are obtained for each ion species/energy pair used as an anchor condition.
- The stopping calculations are performed with **SRIM** (or an equivalent vetted stopping-power database), and the regime is documented as electronic-stopping dominated when (S_e \gg S_n).
    

**Software:** SRIM (or equivalent stopping database).  
**Inputs:** ion species, ion energy, target density/composition.  
**Outputs:** (S_e(z)), (S_n(z)) tables and a chosen depth-of-interest value (S_e) (with documented depth window).

**Handoff:** Step 1 outputs feed Step 2 (source construction) and Step 4/6 (parameter reporting).

---

## Step 2: Construct the radial energy deposition source term (S(r,t))

- A radial dose model (S(r,t)) is specified for each velocity class (reported as MeV/u), including a characteristic source radius (r_0) and a deposition-time model (fs–ps).
    
- The radial tail is justified using an analytic delta-electron parameterization or an electron-transport model.
    

**Software:**

- Primary: analytic radial dose model implemented in a scriptable environment (Python/Julia).
    
- Optional high-fidelity source construction: **TREKIS** (or similar electron-kinetics tool) when an explicit excitation-transport calculation is required.
    

**Inputs:** (S_e) from Step 1, ion velocity class, material parameters required by the chosen radial-dose model.  
**Outputs:** a fully specified (S(r,t)) parameter set (including (r_0), tail parameters, deposition time profile).

**Handoff:** Step 2 outputs feed Step 3 (TTM calibration/verification) and Step 7 (production TTM-MD runs).

---

## Step 3: Electron–lattice transport model definition and verification (TTM/i-TS)

This step produces the **transport parameterization** used by the coupled TTM-MD runs and provides an independent verification layer.

### Step 3A: Standalone cylindrical TTM/i-TS solve (calibration and verification layer)

- The coupled diffusion equations for (T_e(r,t)) and (T_l(r,t)) are solved in cylindrical symmetry to validate and bracket electron–lattice transport behavior under the selected (S(r,t)).
    

**Software:**

- Primary: in-house scriptable cylindrical TTM solver (Python/Julia finite differences).
    
- Optional external cross-check: Thermal Spike GUI (if used as an independent reference implementation).
    

**Inputs:** (S(r,t)) from Step 2, electronic parameters (C_e(T_e)), (\kappa_e(T_e)), coupling (g(T_e,T_l)), boundary conditions.  
**Outputs:** validated envelopes for (T_e(r,t)), (T_l(r,t)), and a defensible parameter set (including grid resolution guidance and sensitivity brackets).

### Step 3B: Coupled TTM-MD parameterization for production runs

- The same transport parameterization is encoded in the LAMMPS TTM implementation for on-the-fly electron–lattice coupling during MD.
    

**Software:** **LAMMPS** (TTM capability; production uses `fix ttm/grid`).  
**Inputs:** (S(r,t)) and TTM parameters from Steps 2–3A.  
**Outputs:** a LAMMPS-ready TTM configuration (grid spacing, coupling constants/functions, source-term specification) that reproduces the standalone solver envelopes under matched conditions.

**Handoff:** Step 3 outputs feed Step 7 (production TTM-MD track simulations).

---

## Step 4: Generate reference electronic-structure data for MLIPs (DFT(+U))

- Reference labels (energies, forces, and selectively stresses) are generated using DFT(+U) for Ce–O configurations spanning: equilibrium phases, reduced stoichiometries, defects, and high-temperature disordered environments (melt/quench snapshots).
    
- A single consistent VASP policy is selected across all Ce–O stoichiometries, and the (U) value is justified using a property set tied to defect and reduction behavior (not DOS alone).
    

**Software:** **VASP** (DFT(+U)); auxiliary parsers (ASE/pymatgen or equivalent) for dataset extraction.  
**Inputs:** representative structures (equilibrium + defects + disordered snapshots), converged ENCUT/k-point policy, DFT(+U) settings.  
**Outputs:** labeled configurations with energies/forces (and stress where included), stored in a training-ready format.

**Handoff:** Step 4 outputs feed Step 5 (MLIP training) and Step 6 (benchmark gates against reference properties).

---

## Step 5: Train and deploy MLIPs for Ce–O across stoichiometry

- A single unified Ce–O model is trained to span the continuum of local environments sampled in SHI tracks, rather than separate per-phase models.
    
- Dataset splits are performed by trajectory and structure family to avoid leakage.
    

**Software:**

- **Allegro** training stack (for the production local MLIP).
    
- **n2p2** training stack for 4G-HDNNP with charge equilibration, including iterative QEq (iQEq), for explicit electrostatics/charge redistribution.
    

**Inputs:** labeled data from Step 4, training configuration (loss weights, stress inclusion policy, active-learning selection if used).  
**Outputs:** deployed MLIP artifacts suitable for LAMMPS:

- Allegro deployed model for `pair_allegro`.
    
- n2p2 deployed model for LAMMPS (4G-HDNNP+iQEq workflow).
    

**Handoff:** Step 5 outputs feed Step 7 (production TTM-MD runs) by substituting the interaction model in LAMMPS.

---

## Step 6: Benchmark gates for interaction models (mandatory pre-track validation)

This step determines whether each interaction model is admissible for thermal-spike simulations.

### Step 6A: Classical interaction models

- Classical interaction models are instantiated in LAMMPS and validated for high-temperature robustness, defect physics trends, and short-range stability.
    

**Software:** **LAMMPS**.  
**Models:** CRG, rigid-ion Buckingham–Coulomb (with short-range stabilization), Broqvist ReaxFF (validated for applicability to reduced states), and optional polarizable models only if implemented and validated.

### Step 6B: MLIP validation

- MLIPs are validated against held-out reference configurations and against targeted thermomechanical/defect benchmarks, including melt/quench stability tests.
    

**Software:** LAMMPS + analysis scripts; comparison to Step 4 reference data.  
**Outputs:** pass/fail gates and benchmark summaries for each model.

**Handoff:** Step 6 determines the final set of admissible models used in Step 7.

---

## Step 7: Production SHI track simulations with coupled TTM-MD

- Track formation is simulated with **TTM-coupled MD** in LAMMPS, with electrons represented on a grid that diffuses and exchanges energy with the lattice during the spike and quench.
    
- The irradiation source term and transport parameters are held fixed for a given ((S_e,\ \mathrm{MeV/u})) condition, and the interaction model is swapped to perform controlled classical-versus-MLIP comparisons.
    

**Software:** **LAMMPS**

- Electron–lattice coupling: `fix ttm/grid`.
    
- Interatomic model: CRG / Buckingham / ReaxFF / Allegro / 4G-HDNNP+iQEq (selected via `pair_style`/`pair_coeff`).
    

**Inputs:**

- TTM parameterization and (S(r,t)) from Steps 2–3.
    
- Interaction model from Step 6 (classical parameter file or MLIP artifact).
    
- Initial structures representing the selected stoichiometry/microstructure class.
    

**Outputs:** atomistic trajectories and field outputs needed to compute track observables.

**Handoff:** Step 7 outputs feed Step 8 (post-processing and inference).

---

## Step 8: Post-processing, inference, and observable extraction

- Track metrics are computed using fixed definitions that are held constant across all interaction models and conditions.
    
- Redox proxies are computed using charge-based metrics for charge-equilibrated models and calibrated inference for local MLIPs when oxidation-state fields are required.
    

**Software:** analysis stack (Python + OVITO/ASE/pymatgen or equivalent), defect analysis tools, and custom scripts for radial profiling and strain proxies.  
**Inputs:** Step 7 trajectories and metadata manifests.  
**Outputs:** core/shell radii, (\delta(r)), density deficit, defect statistics, swelling/microstrain proxies, redox proxy fields, and uncertainty brackets where required.

---

## Step 9: Comparative analysis and mechanistic attribution

- Comparisons are performed across interaction models under identical TTM forcing to quantify what changes when redox/charge-transfer capability is enabled or suppressed.
    
- Comparisons are performed across stoichiometries and microstructures to isolate the roles of initial chemical state, sinks, and overlap/annealing protocols.
    

**Software:** analysis scripts (Python).  
**Outputs:** mechanistic conclusions expressed as parameter-dependent trends and cross-model discrepancies tied to redox/nonstoichiometry pathways.

---

# Dataflow summary (what feeds into what)

- **SRIM** → ({S_e(z), S_n(z)}) → **radial source construction (S(r,t))** → **TTM parameterization/verification** → **LAMMPS TTM-MD input deck**.
    
- **VASP DFT(+U)** → labeled energies/forces(/stress) → **MLIP training (Allegro, n2p2)** → deployed MLIP files → **LAMMPS interaction model selection**.
    
- **LAMMPS TTM-MD** (TTM parameters + interaction model) → trajectories → **post-processing** → track observables → **comparative analysis**.
    

---

# Correction to the stoichiometry list

- Ce(_7)O(_{12}) is more reduced than **Ce(_{11})O(_{20})** (not Ce(_{11})O(_{12})).
    

---

If integration into the allocation narrative is required, the above steps map cleanly into resource categories: (i) VASP labeling and optional short BOMD (Step 4), (ii) MLIP training (Step 5), (iii) large-scale LAMMPS TTM-MD production runs (Step 7), and (iv) post-processing (Step 8).