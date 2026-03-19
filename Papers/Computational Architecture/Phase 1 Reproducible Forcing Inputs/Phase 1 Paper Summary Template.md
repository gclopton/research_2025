### Phase 1 extraction checklist for each paper

Phase 1 papers are “scaffolding validation” references. The goal is to extract enough information to reproduce the paper’s forcing inputs from paper-alone: stopping curves ($S_e(z)$, $S_n(z)$) and/or an implementable radial deposition model ($S(r)$ or $S(r,t)$), including all normalization and cutoffs.

## General question set (ask these for every Phase 1 paper)

0. **What Phase 1 deliverable does this paper provide, and what is the best reproduction target?**  
    Classify the paper as primarily: (i) SRIM/TRIM stopping curves ($S_e(z)$, $S_n(z)$), (ii) radial dose / δ-electron deposition ($D(r)$ or equivalent), (iii) an explicit source term for TTM ($S(r,t)$), or (iv) “methods guidance” (best practices, pitfalls). Then choose one concrete reproduction target (a specific figure/table/curve) you will attempt to match.
    If the paper provides only a plot (no tabulated data), record what you will do to extract it (digitize vs re-run the same code output), and what level of agreement is realistic.

1. **What are the irradiation conditions (projectile-side inputs)?**  
    Record ion species, incident energy (and/or MeV/u), charge state if stated, incidence geometry (normal vs angled; beam direction convention), and any velocity-class labels (low vs high velocity) used by the authors. If the paper averages over energies/depth windows, record the window definition.

2. **What are the target conditions (material-side inputs)?**  
    Record target composition/stoichiometry, density, thickness/layer stack (if any), and whether the calculation assumes amorphous vs crystalline structure. If density is modified from “theoretical” (e.g., powders/porosity), record the stated value and how the paper says to interpret depth/range under that choice.

3. **What code/model is used, and what is the exact configuration needed for reproducibility?**  
    Record the code lineage and version (e.g., SRIM-2010, SRIM 2013, SRIM/TRIM year), the calculation mode (Stopping/Range tables vs TRIM; Quick vs Full Cascade; ion distribution statistics; number of ions), and any explicit settings the paper reports that affect outputs. If the paper uses TRIM damage outputs (vacancies, displacements, dpa, damage energy), also record the target parameters required for those predictions (threshold displacement energy $E_d$ and any stated surface/lattice/binding energies, plus any stated damage model/partitioning assumptions). If settings are not stated, record what is missing and whether the output is still realistically reproducible.

4. **What quantities are output, in what units, and along what coordinates?**  
    For stopping curves: record whether the paper shows $S_e(z)$ and $S_n(z)$ separately, what units are used (e.g., keV/nm), and what $z$ means (depth in target, path length, projected range coordinate). Also record any auxiliary SRIM/TRIM outputs the paper uses as “forcing metadata” (projected range, straggling, ion distribution, damage/vacancy profiles, damage energy, dpa). For radial deposition: record whether the paper outputs dose/energy density per radius (e.g., $D(r)$) or a source term per time (e.g., $S(r,t)$), and the units/conventions.

5. **How is normalization and energy accounting enforced?**  
    Extract the statement that ties the model output back to an energy-per-length input like $S_e$ (or to an ion energy-loss budget). For SRIM/TRIM, record whether the paper treats $S_e$/$S_n$ as direct outputs or as inputs used for later modeling. For radial deposition or $S(r,t)$, write down the integral/constraint that enforces energy conservation (e.g., radial integration of deposition equals $S_e$; time integration recovers the intended deposited energy).

6. **What cutoffs, truncations, or “effective parameter” substitutions are made, and why?**  
    Record any explicit radial cutoffs, tail truncations, minimum/maximum δ-electron energies, or “effective width” substitutions (e.g., replacing a detailed δ-electron cascade with a Gaussian width). For SRIM/TRIM, record any non-default target modifications (density changes, compound handling choices) and any cautions about near-surface charge-state or other systematic effects. If the paper discusses Quick vs Full Cascade or damage-energy partition models (e.g., modified Kinchin–Pease / Lindhard-type partitioning), record which choice is used and what it changes in the outputs you care about.

7. **How does the paper connect Phase 1 outputs to downstream modeling (TTM/TTM-MD), if it does?**  
    Record exactly how the paper uses $S_e(z)$ or a radial deposition law: constant-$S_e$ approximation vs depth-dependent forcing; how a source width depends on ion velocity/energy; whether a temporal envelope is assumed; and whether the paper treats these as calibrated knobs or “fixed physics.”

8. **What is missing for paper-alone reproduction, and what is the minimum additional assumption you would have to make?**  
    List missing details that block reproduction (SRIM mode/version, density, ion count, equation parameters, cutoffs). If you can make a reasonable default assumption, record it explicitly as “assumed” so later comparisons remain honest.

---

### Minimal end-of-paper record (what you should be able to write after reading)

After finishing a Phase 1 paper, you should be able to write: paper type (1A/1B); a reproduction target (figure/table); projectile inputs; target inputs; exact code/model configuration; the explicit output(s) ($S_e(z)$/$S_n(z)$ and/or $S(r)$/$S(r,t)$); normalization/energy accounting; cutoffs; and a one-sentence reproducibility rating (high/medium/low) naming the single biggest missing detail if not “high.”

---

## Group-specific addenda (use only for papers in the corresponding bucket)

### Phase 1A) Reproducible SRIM/TRIM stopping curves ($S_e(z)$), ($S_n(z)$)

15A) **Which SRIM/TRIM workflow is actually used for $S_e(z)$/$S_n(z)$ (Stopping/Range tables vs TRIM), and why is that workflow appropriate for the paper’s goal?**  
16A) **What SRIM/TRIM version/year, calculation mode (Quick vs Full Cascade), and ion statistics are stated (number of ions, uncertainty/variance, binning/smoothing)?**  
17A) **How is the target defined inside SRIM/TRIM (compound setup, density, layers/thickness), and are any “effective density” or porosity corrections applied (including any explicit depth/range rescaling logic)?**  
18A) **What is the depth coordinate used in the stopping plots (projected range vs depth vs path length), and how does incidence geometry (angle, multilayers, thin films on substrates) affect interpretation?**  
19A) **What is the exact reproduction procedure: which SRIM/TRIM output(s) should you export to match the paper’s curves, and what postprocessing choices matter (units, coordinate transform, binning)?**  
20A) **What validation/sanity checks are possible from paper-alone, and what SRIM limitations are specifically relevant for this case (compound corrections, slow heavy ions in light-element targets, near-surface charge-state caveats, sensitivity to density and mode)?**

### Phase 1B) Radial dose / δ-electron deposition and implementable source terms ($S(r)$, $S(r,t)$)

15B) **What quantity is computed, and what is the explicit output you can reproduce?**  
    Record whether the paper outputs a radial dose/energy-density-like profile (e.g., $D(r)$), a radial energy deposition kernel, or a full separable source term $S(r,t)$. Note the representation (continuous formula vs binned cylindrical shells/histograms vs algorithm) and the coordinate convention ($r$ vs $t$ for radial distance).

16B) **What is the electron production model (δ-electron spectrum) and its kinematic limits?**  
    Record the differential δ-electron production model (cross section or spectrum model), how maximum δ-electron energy is set, and what approximations are made (e.g., Rutherford-like assumptions, bound vs free electrons, normal ejection assumptions).

17B) **What electron transport/attenuation model is used to turn δ-electrons into deposited energy?**  
    Record the range–energy relation used (power law vs tabulated; which reference), any electron transmission/attenuation factors (e.g., $\eta(r,t)$-type terms), and any angular-distribution or condensed-phase corrections (electron scattering, collective effects via dielectric response, etc.).

18B) **How do charge and velocity enter (effective charge, $Z^*$, $\beta$ scaling), and how does the model encode “velocity effect” in the tails/width?**  
    Record the effective charge prescription (if any), how $\beta$ enters, and which parameter(s) change with ion velocity/energy (e.g., $\alpha(\beta)$, cutoff ranges, effective width proxies). If the model claims an asymptotic tail law (often $\sim 1/r^2$ in certain regimes), record where that regime applies and where it breaks down.

19B) **What is the normalization/energy-conservation statement, and what cutoffs are required for it to work?**  
    Write down the condition that makes the radial (and/or radial-time) deposition integrate back to the intended energy per unit length (typically $S_e$). Record any explicit lower/upper cutoffs, near-axis “missing dose” corrections, and the rationale for convergence choices.

20B) **If the paper specifies a time dependence, what temporal envelope $A(t)$ is used, and how are its timescales chosen?**  
    Record whether deposition is instantaneous in time or spread over a thermalization window (e.g., a Gaussian $A(t)$ with stated width and cutoff). If the paper uses a separable form $S(r,t)=S_e\,F(r)\,A(t)$ (possibly with prefactors/absorption fractions), record $F(r)$, $A(t)$, and the normalization constraints on each.

21B) **What is the cleanest “unit test” reproduction target, and what tolerance is realistic?**  
    Choose one plotted curve you can reproduce from paper-alone (e.g., a specific $D(r)$ profile at a stated ion energy/material, or a specific $S(r,t)$ slice). Record what “match” means (shape, integral/normalization, width metric), and what error band is acceptable given the stated approximations (digitization error, table choice, cutoff sensitivity).
