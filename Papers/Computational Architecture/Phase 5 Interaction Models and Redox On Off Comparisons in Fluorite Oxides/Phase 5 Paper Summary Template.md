### Phase 5 extraction checklist for each paper

Phase 5 is about building a defensible “redox off vs redox on” comparison framework for fluorite oxides (especially $\mathrm{CeO_2}$). Phase 5 papers support three deliverables:

1. fixed-charge (“redox frozen”) track/spike MD baselines you can reproduce,
2. redox-enabled interaction models you can credibly use as chemistry-on comparators,
3. simulation-native redox observables that map to experimental signatures (and calibration references that justify your thresholds).

## General question set (ask these for every Phase 5 paper)

0. **Which Phase 5 deliverable does this paper support, and what is the reproduction target?**  
    Classify the paper as one of:
    - fixed-charge spike/track MD baseline,
    - redox-enabled interaction model (ReaxFF/QEq, DIPPIM/polarizable, etc.),
    - reduced-ceria comparator (nonstoichiometry on, redox frozen),
    - redox calibration reference (DFT+U, defect chemistry consistency).
    Then name 1 concrete reproduction target (a figure/table/parameter set/protocol paragraph) you will extract and reproduce.

1. **What material system is modeled and what “reduction state” is represented?**  
    Record whether the paper treats $\mathrm{CeO_2}$, $\mathrm{CeO_{2-x}}$, doped ceria, $\mathrm{UO_2}$ analogs, or fluorite analogs. If nonstoichiometry is present, record how it is parameterized (e.g., $x$ or $\delta$) and how it is introduced (explicit vacancies, charge compensation rules, defect equilibria).

2. **What interaction model is used, and what degrees of freedom for charge/chemistry are actually present?**  
    Record the model class and what it can/cannot do:
    - fixed-charge ionic potential (Buckingham/BMH, etc.): no dynamic redox,
    - polarizable ion model (e.g., DIPPIM): polarization allowed but charges fixed unless model says otherwise,
    - variable-charge reactive model (ReaxFF/QEq): dynamic partial charges and bond-order chemistry,
    - multiscale forcing (TREKIS+MD) but still fixed-charge at the MD layer.
    State explicitly whether Ce$^{3+}$/Ce$^{4+}$ interconversion is a modeled degree of freedom or only inferred.

3. **What is the energy-deposition / thermal-spike forcing protocol?**  
    Extract how “the spike” is implemented:
    - velocity assignment (Maxwellian inside a cylinder),
    - prescribed $T_e$/$T_l$ fields (TTM or i-TS forcing),
    - source term on an electron grid (TTM-MD),
    - other injection mechanisms.
    Record geometry (cylinder radius/length; where the track is placed), timing (instantaneous vs time-dependent), and normalization to $S_e$ (if applicable).

4. **What sinks and boundary conditions are used, and how might they bias chemistry?**  
    Record thermostats, fixed-temperature regions, electron-grid sinks (if any), free surfaces, and periodicity. Then state the most likely chemistry-relevant bias:
    - premature quench suppressing reduction/defect clustering,
    - surfaces enabling oxygen loss/electron emission (if modeled),
    - limited volume effects (overlap/repeated impacts).

5. **What are the paper’s primary observables, and which of them can serve as “redox proxies”?**  
    Record what the paper actually measures from simulation:
    - oxygen Frenkel pairs / vacancy–interstitial separation histograms,
    - defect clusters, dislocations, amorphous fraction,
    - radial density deficit and its fit parameters,
    - coordination statistics and sublattice disorder metrics,
    - charge distributions / oxidation-state-like classifiers (for variable-charge models),
    - diffusion coefficients, chemical expansion, vacancy formation energies (for model validation papers).
    Then identify which observable(s) you would use as redox proxies when true redox is absent (fixed-charge).

6. **If the model is redox-enabled: how will you define and report “reduction” robustly?**  
    Extract whether the paper provides guidance on:
    - charge histograms or reference distributions,
    - vacancy-associated charge localization,
    - thresholds for classifying Ce sites (Ce$^{3+}$-like vs Ce$^{4+}$-like),
    - spatial profiles (radial reduced-site fraction; vacancy density).
    If not provided, record what reference states you will use and what classifier you will adopt (and label it as your choice).

7. **What parameterization/validation evidence is provided for the interaction model?**  
    For potentials/force-fields, record:
    - training targets (bulk modulus, lattice constant, surface energies),
    - defect energetics (oxygen vacancy formation energies, depth dependence, migration barriers),
    - reduced-ceria behavior (energetic ordering of vacancy sites, chemical expansion),
    - known failure modes or caveats stated by the authors.
    The goal is to justify why the model can be used for “chemistry on/off” comparisons under extreme excitation.

8. **What short-range robustness strategy is used for high-energy spikes?**  
    Record whether the model uses ZBL joining or other short-range repulsion handling, and whether the paper discusses validity under high-temperature/high-energy close approaches.

9. **What is the minimal “chemistry on/off” comparison this paper enables?**  
    Write one concrete comparison you could run:
    - same forcing + same domain + same sinks, but swap fixed-charge potential ↔ ReaxFF,
    - same forcing, but vary initial nonstoichiometry (vacancies present vs absent) under fixed charge,
    - same forcing, but compare bulk vs surface to see if reduction proxies change.
    Define what constitutes a “difference” (charge-based reduction profile; vacancy production; density deficit; recovery kinetics).

10. **What is missing for reproduction, and what is the reproducibility rating?**  
    List missing details that block reproduction (potential parameter files, exact spike geometry, thermostat reach, vacancy initialization, QEq settings, timestep, short-range joining). Assign a rating (high/medium/low) and name the single biggest missing detail if not “high.”

---

### Minimal end-of-paper record (what you should be able to write after reading)

After finishing a Phase 5 paper, you should be able to write: (i) what deliverable bucket it supports, (ii) the interaction model class and whether redox is dynamical, (iii) the forcing protocol and sinks/BCs, (iv) the observables it provides (including redox proxies), (v) the validation evidence for the model (especially vacancy energetics), and (vi) one specific chemistry on/off comparison it enables.

---

## Paper-specific addenda (use only for the corresponding Phase 5 paper)

These addenda are included because the Phase 5 anchor papers each have one high-value extraction “gotcha” that directly affects your chemistry on/off design.

### Sasajima et al. (2021) — Fully specified fixed-charge spike injection baseline in $\mathrm{CeO_2}$

15S) **What effective valences and electrostatics method are used (Ewald settings if stated), and how would you reproduce them in your code?**  
16S) **What is the exact cylinder geometry and outside-region temperature control (velocity scaling details), and how close are sinks/thermostats to the track?**  
17S) **What defect accounting scheme is used (e.g., oxygen Frenkel pairs with separation bins), and what output would you replicate first?**

### Yablinsky et al. (2015) — Fixed-charge thermal spike in $\mathrm{CeO_2}$ with experimental anchors

15Y) **What thermal-spike injection temperatures/energies are used in MD (e.g., 12 and 36 keV/nm analogs), and how is “damage” quantified in the simulation?**  
16Y) **What experimental observable is the primary anchor (density reduction, EELS, TEM), and what simulation metric is used as its analog?**

### Rymzhanov et al. (2025) — TREKIS + MD in $\mathrm{CeO_2}$ with bulk/surface/overlap framing

15R) **What is the TREKIS→MD handoff (what fields are passed, what time window, and how is near-surface handled)?**  
16R) **What overlap protocol is used and how is recovery/saturation diagnosed?**

### Pisarev & Starikov (2014) — $\mathrm{UO_2}$; MOX-07 + ZBL; finite 2T stage

15P) **Where is ZBL joined, and what short-range switching function/parameters are used (if stated)?**  
16P) **How is the “2T stage” duration defined and what switches off at the handoff?**

### Broqvist et al. (2015) — ReaxFF for $\mathrm{CeO_2}$ and $\mathrm{CeO_{2-x}}$

15B) **What ReaxFF/QEq settings are implied (charge equilibration parameters, charge ranges), and what reference states are used for vacancy energetics validation?**  
16B) **What vacancy formation energy definitions are used (bulk vs surface, depth dependence), and what subset would you reproduce as a model-validation test before doing spikes?**

### Burbano et al. (2011) — DIPPIM for reduced/doped $\mathrm{CeO_2}$

15D) **What polarization degrees of freedom are present (dipoles only vs higher multipoles), and how are they integrated/relaxed during MD?**  
16D) **What defect energetics and transport quantities are used to validate the potential (migration barriers, expansion, elastic constants), and which are most relevant to your redox proxies?**

### Cui et al. (2012) — Reduced-ceria MD (vacancies explicit; charges fixed)

15C) **How is nonstoichiometry introduced and charge neutrality enforced in a fixed-charge model?**  
16C) **What structural/transport metrics are most sensitive to $\delta$ (pair distribution, diffusivity), and how would you use them as “reduction state” controls in spike simulations?**

### Castleton et al. (2007) — DFT+U redox calibration

15K) **What localization criterion is used to diagnose Ce 4f localization around an oxygen vacancy, and what does it imply for an oxidation-state classifier?**  
16K) **What $U$ range gives physically meaningful localization, and how would you translate that into a “reference expectation” for classical redox models?**

### Zhang et al. (2023) — Defect chemistry consistency in $\mathrm{CeO_2}$

15Z) **What are the main sources of inconsistency across methods for defect energetics/charge localization, and what reporting practices does the paper implicitly recommend?**  
16Z) **Which defect states/charge states are emphasized as necessary for a consistent defect-chemistry picture, and how does that inform which redox observables you should prioritize?**

