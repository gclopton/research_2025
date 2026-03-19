# Phase 6 Paper Summary Template (MLIP Credibility Under Extreme Nonequilibrium Dynamics)

Use this template to extract the minimum information needed to justify (and later defend) a training-corpus philosophy for SHI-like extremes: phase/stoichiometry ladders, defects + strain, high-$T$ disorder, and close-approach robustness. Phase 6 papers often differ in *model class* (local vs charge-aware) and in *stress tests* (cascades, melt–quench, amorphization), so this template is organized as a general question set plus group-specific addenda.

---

## Paper metadata

- **Citation (as used in Paper Index):**
- **DOI / canonical link:**
- **Venue + year:**
- **Material system(s):**
- **Model family (one line):** (e.g., GAP/SOAP, MTP, SNAP, NEP, equivariant GNN, HDNNP, 4G-HDNNP+QEq, “separated Coulomb + ML residual”, etc.)
- **Intended operating regime:** (equilibrium / defects / high-$T$ liquid / cascades / nonequilibrium stress / nonstoichiometry)
- **Code + implementation:** (LAMMPS pair style? n2p2? custom? open repo? version if stated)
- **Reproducibility rating (high/medium/low):** one sentence explaining what is missing if not high.

---

## General question set (ask these for every Phase 6 paper)

### 1) What failure mode is this paper trying to prevent?

- [ ] What “breakage” is the paper addressing (ballistic close encounters, liquid instability, poor defect physics, missing electrostatics, nonstoichiometry transfer, stress-path transfer, etc.)?
- [ ] What is the target application the authors use to motivate credibility (cascades, fracture, melt–quench amorphization, high-$T$ transport, electrochemistry, etc.)?

### 2) What is the model, exactly, and what physics is explicit vs implicit?

- [ ] What is the functional form / architecture and its locality assumptions?
- [ ] Are long-range interactions explicit (Coulomb, dispersion), learned implicitly, or separated analytically?
- [ ] If charges exist, where do they enter energy/forces, and what is solved each timestep (if anything)?

### 3) What is the reference theory and the “truth” this model learns?

- [ ] What electronic-structure level is used for training labels (DFT functional, $U$ if DFT+$U$, dispersion correction, pseudopotentials/PAW, cutoffs, $k$-mesh)?
- [ ] What quantities are fit (energies/forces/stresses/charges/dipoles) and what weighting scheme is used?
- [ ] Are there multiple label fidelities (e.g., pretraining + transfer learning)?

### 4) What is the training corpus philosophy in concrete terms?

- [ ] Which phases/polymorphs are included (explicit list)?
- [ ] Which stoichiometries / compositions are included (including off-stoichiometric or vacancy-rich states)?
- [ ] What defect types are included (vacancies/interstitials/Frenkel pairs/clusters/dislocations/surfaces/interfaces/grain boundaries)?
- [ ] What strain / stress paths are included (hydrostatic, shear, large deformation, shock-like, thermal expansion sampling)?
- [ ] What high-$T$ / disordered states are included (AIMD liquid, melt–quench amorphous, hot phonons, oxygen sublattice mobility, etc.)?

### 5) How does the paper handle close-approach physics?

- [ ] Is there an explicit short-range repulsive wall (e.g., ZBL blending, screened repulsion, spline)?
- [ ] What distance/energy range is protected, and how is continuity enforced (energy/force continuity class)?
- [ ] What benchmark(s) probe the repulsive regime (TDE, PKA/cascade defect statistics, high-energy collisions)?

### 6) What validation metrics do they use, and which are “reviewer-credible” for extremes?

- [ ] Standard properties: EOS, elastic constants, phonons, thermal expansion, melting point (if attempted), diffusion constants (if relevant).
- [ ] Defect thermodynamics/kinetics: formation energies, migration barriers, clustering.
- [ ] Nonequilibrium/extreme tests: cascades (defect survival vs PKA energy), melt–quench stability, amorphization thresholds, high-$T$ liquid structure (RDF/$S(q)$).
- [ ] What plots/tables are the “benchmark targets” you could reproduce later?

### 7) What uncertainty/convergence work do they do (or omit)?

- [ ] Dataset coverage arguments: active learning loop, extrapolation tests, uncertainty metrics, “novelty” detectors.
- [ ] Sensitivity to hyperparameters, training set size, or weighting choices.
- [ ] Known limitations and explicitly out-of-scope regimes.

### 8) What is the computational cost and scaling story?

- [ ] Reported speed (relative to DFT/classical potentials) and scaling with system size.
- [ ] Hardware assumptions (CPU/GPU), parallel scaling notes.
- [ ] For charge-aware models: the scaling cost of the charge solve (direct QEq vs iterative iQEq vs mesh methods), and any convergence tolerances.

### 9) What, specifically, should you copy into your own “Phase 6 → ceria” plan?

- [ ] One sentence: “the transferable design principle.”
- [ ] One concrete corpus action item (what configuration family you must include).
- [ ] One concrete validation action item (what plot/metric you must reproduce for ceria).

---

## Group-specific addenda (use only for papers in the corresponding bucket)

### Phase 6A) Local, scalable MLIPs validated in cascades / ballistic + spike-like extremes

- [ ] What is the cascade/spike benchmark setup (material, PKA energy range, temperature, cell sizes, boundary conditions, thermostat strategy)?
- [ ] What is the “pass/fail” metric (defect counts, cluster distributions, displacements, residual damage morphology, energy partition, time-to-thermalization proxies)?
- [ ] Do they report TDE, and if so how is it computed (directions, statistics, temperature, criterion)?
- [ ] How is the liquid phase represented and validated (melt point, RDF/$S(q)$, diffusion)?
- [ ] If a tabulated/speed-optimized variant is used (e.g., tabGAP): what fidelity is preserved, what changes, and what is revalidated?

### Phase 6B) Oxide/fluorite precedents: phase ladders, melt–quench stability, defects, high-$T$ disorder

- [ ] What “phase ladder” is targeted (explicit phases, transition temperatures/pressures if discussed)?
- [ ] What high-$T$ sampling protocol is used (AIMD ensemble, temperature schedule, quench rates, volume control)?
- [ ] What structural validation is used for disordered states (RDF, $S(q)$, coordination statistics, diffusion constants, experimental comparisons)?
- [ ] How are defects and nonstoichiometry represented (explicit vacancies/interstitials, composition control, charge/oxidation proxies if any)?
- [ ] What tests probe transfer across stress/strain and across polymorphs?

### Phase 6C) Charge-aware MLIPs (QEq/iQEq and separated Coulomb terms)

- [ ] What is the charge model (QEq/iQEq/other), and what is optimized/solved each step?
- [ ] What is the electrostatics partition (analytical long-range + learned short-range residual, or learned total with charges as internal DOF)?
- [ ] What targets validate charge realism (charge distributions by environment/stoichiometry, response under fields, defect-associated charge localization proxies)?
- [ ] What stability issues are discussed (charge sloshing, convergence failures, pathological charge states) and what safeguards/tolerances are used?
- [ ] What is the implementation pathway in MD (LAMMPS integration, n2p2, custom), and what outputs are available for auditing (per-atom charges, electrostatic energy terms)?

---

## Minimal end-of-paper record (paste this at the end of your summary)

**Model + scope:**  
**Reference labels (DFT/DFT+$U$/etc.):**  
**Training corpus coverage (phases/stoichiometries/defects/strain/high-$T$):**  
**Close-approach treatment (e.g., ZBL blending):**  
**Extreme-validation anchors (1–3 key plots/metrics):**  
**Computational cost/scaling notes:**  
**Transferable design principle (one sentence):**  
**Action items for ceria (corpus + validation):**  
**Reproducibility rating + missing info:**  

