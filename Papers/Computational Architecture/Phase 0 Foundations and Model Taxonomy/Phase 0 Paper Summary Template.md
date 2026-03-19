

### Phase 0 extraction checklist for each paper

## General question set (ask these for every Phase 0 paper)

0. **What kind of paper is this, and what does it actually specify versus cite?**  
    Classify the paper by its intended role (review/taxonomy; model-defining; experiment-only; early-time kinetics; radial-dose/track-structure; hybrid atomistic–continuum methods). Then record what the paper specifies explicitly (equations, parameters, $S(r,t)$, boundary conditions, track criterion) versus what it defers to citations. If key definitions/equations are not given, write down the primary source(s) the paper points to.

1. **What model family is the paper using, and what do its key terms mean?**  
    Identify the model “family” as the authors define it (ITSM/i-TS, ATSM, TTM, hybrid track-structure + TTM, exciton/cumulative, etc.). Record whether multiple families are combined and how responsibilities are divided (e.g., track-structure for early electron kinetics; TTM for later diffusion). Then write the paper’s operational definitions for ambiguous terms—_latent track, damage, amorphous track, melt zone, disordered zone, damage cross section,_ and _velocity effect_—with special attention to how the paper defines “track radius” from either measurements or computed fields.
    
2. **What state variables are evolved, and what geometry/symmetry is assumed?**  
    List the model’s state variables (commonly $T_e(r,t)$ and $T_l(r,t)$, but possibly electronic energy density, carrier density, pressure/stress fields, or nonthermal distributions). Record the assumed symmetry and dimensionality (cylindrical 1D in $r$; $r$–$z$; depth dependence via $S_e(z)$; etc.). If the model is not time-evolved (common in ATSM presentations), record what is prescribed instead of solved (e.g., an assumed final Gaussian temperature/energy field).
    
3. **What are the governing equations (or governing assumptions), and what physics is being approximated?**  
    Transcribe the governing equations in their explicit form (or provide a faithful symbolic form with all terms and where the source enters). For TTM/i-TS, capture the coupled diffusion + electron–phonon coupling structure and the precise placement of the source term. For ATSM-type work, capture what is assumed (e.g., final field shape) and the conservation statement replacing explicit time evolution. Record whether phase change is represented and how (latent heat via enthalpy method, effective heat capacity, explicit melt criterion, etc.).
    
4. **What material functions and parameters appear, and how are they obtained?**  
    For each coefficient/constitutive function in the governing description, record whether it is a constant, tabulated function, fitted parameter, or derived from independent material data. Where applicable, capture $C_e(T_e)$, $\kappa_e(T_e)$, and $g(T_e,T_l)$, plus the lattice-side representation ($C_l$, $\kappa_l$, or an enthalpy formulation). If the paper uses alternative “knobs” instead (e.g., an electron mean free path $\lambda$, an absorption radius $\alpha$, or a source width $r_0$), record those and explicitly map them to “transport” versus “deposition width” versus “coupling.” For ceramics/insulators, note whether “electronic transport” is treated as effective/phenomenological diffusion and whether the paper discusses its justification and limits. If multiple parameter sets are used across materials or ion regimes, record what changes and what stays fixed.
    
5. **What is the source term $S(r,t)$, and what does “radial dose” mean in this paper?**  
    Write down the source term explicitly, including (i) its radial form and (ii) its time envelope (if any). Record whether deposition is instantaneous, time-distributed over a thermalization time, or produced by a separate track-structure/Monte-Carlo stage. Capture the radial profile choice (Gaussian core; core + tail; Katz/Waligórski-type radial dose; fitted absorption radius $\alpha$; explicit source width $r_0$; etc.). Record how tails and long-range δ-electron transport are treated (asymptotic behavior, truncation/cutoffs, and rationale).
    
6. **How is the velocity effect encoded in the model (if it is addressed at all)?**  
    If velocity effect is discussed, record the _encoded mechanism_ (not just narrative): which knob(s) change with ion velocity class—deposition width ($r_0$ or $\alpha$), tail behavior, effective electron diffusion, coupling $g$, energy partitioning, or something else—and exactly where those changes enter the source term and/or transport coefficients. If velocity effect is invoked without stating what changes between low- and high-velocity ions, flag the missing specification.
    
7. **How are stopping powers used, and how is the source normalized to deposited energy?**  
    Record where $S_e$ (and $S_n$, if used) come from (SRIM, stopping tables, other codes) and whether stopping is treated as constant along the track or depth-dependent ($S_e(z)$). Extract the energy-accounting relation that ties the source term to the deposited energy per unit length (typically a normalization integral over radius and time). If normalization is hidden in a constant or “absorption fraction,” record the exact definition. If the paper flags charge-state / near-surface caveats (e.g., tabulated SRIM values differing from near-surface stopping due to nonequilibrium projectile charge state), capture the statement and what the authors do about it.

8. **What energy pathways are included, and what energy channels are neglected or folded into efficiency factors?**  
    Beyond source normalization, record the model’s “energy budget”: what fraction of deposited energy is assumed to thermalize into the modeled electronic subsystem, how energy is transferred to the lattice, and whether additional channels are included or explicitly neglected (e.g., elastic-wave/shock energy, radiative losses, nonthermal melting, defect-formation energy, electronic excitations stored in holes/excitons). If the paper introduces efficiency factors (often implicitly) to represent “missing channels,” write down their definition and where they enter.
    
9. **What initial conditions, boundary conditions, domain sizes, and sinks are assumed?**  
    Record initial $T_e$ and $T_l$, the outer boundary location ($r=R$), and the boundary condition type (fixed temperature, insulating, finite medium approximation, explicit sink term, etc.). If the paper introduces artificial cooling, thermostat analogs, truncations, or “infinite medium” approximations, record the functional form and physical rationale. Treat these as first-class assumptions because they affect peak temperatures, melt radii, and quench rates.
    
10. **How does the paper define “track formation” (and any thresholds) as observables?**  
    Extract the operational rule that maps computed fields and/or measured quantities to a track metric. Record whether track radius is defined by (i) a melt criterion (exceeding $T_m$, possibly with persistence time), (ii) boiling/evaporation/sublimation, (iii) an energy-density/disorder threshold, or (iv) an empirical mapping from computed temperature/energy to a damage cross section. If a threshold $S_{e,\mathrm{th}}$ is defined, record the precise criterion used (centerline reaches $T_m$; onset of cross section; accumulation/percolation logic; etc.) and what is tuned to match thresholds versus radii. Also record whether the paper treats track formation as a single-ion (single-hit) phenomenon or as a cumulative/fluence-dependent process (e.g., track overlap, pre-damage lowering thresholds).
    
11. **What experiments or datasets are being matched, and what is actually constrained by data?**  
    Record the experimental observable(s) (TEM track radius, RBS/channeling disorder fraction, SAXS density deficit, XRD microstrain, AFM hillock dimensions, etc.) and how they are converted into a radius or cross section. Capture irradiation conditions (ion species, energy, $S_e$, $S_n$, velocity regime, fluence) and initial material state (crystalline vs amorphous, microstructure, pre-damage). If multiple materials are included, record which model parameters are changed across materials and which are claimed to be universal.
    
12. **Which inputs are treated as material properties versus calibration knobs?**  
    Make an explicit separation between independently constrained quantities and fitted/tuned quantities. Where applicable, do this for $g$, $\kappa_e$ (or electron diffusivity), $C_e/C_l$, the deposition width parameter ($r_0$ or $\alpha$), and the track/damage criterion parameters (threshold temperature/energy density, persistence time, etc.). If the paper uses other free parameters (e.g., $\lambda$ or an energy-absorption fraction), include them. If parameters shift across cases without being labeled as fits, flag that as “implicit calibration.”
    
13. **What implementation-level details are stated, and how reproducible is the paper as a benchmark?**  
    Extract timescales (electron thermalization, coupling time, spike duration, quench time), length scales (absorption radius, electron diffusion length, melt radius, heat-affected zone), and any numerical details (grid spacing, time step, solver type, stability tests). Record whether energy conservation checks or numerical sensitivity analyses are reported. Any intermediate field plot (e.g., $T_l(r,t)$ at specified times) is especially valuable for later reproducibility. Then assign a reproducibility rating (high/medium/low) based on whether you could reconstruct the model without contacting the authors. High reproducibility typically requires an explicit $S(r,t)$ with normalization, stated BCs/domain size, an explicit track criterion, and a clear statement of what is fitted. Flag red flags such as missing equations/source term, track radius defined only by “best fit,” velocity effect invoked with no encoded mechanism, and unexplained parameter drift.
    

---

### Minimal end-of-paper record (what you should be able to write after reading)

After finishing a Phase 0 paper, you should be able to produce a short record containing: paper type/scope; model family; state variables and geometry; governing equations/assumptions; coefficients and provenance; explicit source term and normalization; energy pathways/omissions; velocity-effect knob(s); BC/IC/sink assumptions; track criterion and threshold logic; experimental anchors; and a reproducibility rating with one sentence naming the most important missing detail if the rating is not “high.”

---

## Group-specific addenda (use only for papers in the corresponding bucket)

### A) Reviews and landscape maps

15A) **What paradigm map does the review build, and where does it locate the “canonical” model definitions?**  
16A) **For each paradigm, what does the review treat as required inputs versus calibration knobs, and what ranges/typical values does it imply?**  
17A) **Which observables, benchmark material systems, and irradiation regimes does the review highlight as most discriminating (e.g., velocity-effect datasets, track radii, hillocks, SAXS density deficits, RBS/channeling disorder, microstrain)?**  
18A) **What limitations, failure modes, and dominant uncertainties does the review explicitly emphasize (e.g., radial-dose extrapolation, early-time nonthermal kinetics, $g$/$\kappa_e$ uncertainty, validity window of thermalized $T_e$, missing energy channels such as elastic waves/shocks)?**  
19A) **What “best practices” does the review implicitly or explicitly recommend for reproducible modeling and comparison (reporting of $S(r,t)$ and normalization, boundary/sink choices, sensitivity checks, energy accounting, clear track/threshold definitions)?**

### B) Seminal/model-defining papers (ATSM/ITSM foundations; velocity-effect anchors)

15B) **For time-evolved “thermal process” / TTM-style foundations: what is actually solved, what is the source, and what are the free parameters?**  
16B) **For ATSM-style foundations: what is assumed instead of time evolution, and what energy/conservation logic determines the final profile?**  
17B) **For velocity-effect anchors (experiment): how is “damage cross section” operationally extracted, and what does the paper’s “effective radius” actually correspond to?**  
18B) **What scaling claims or “master curves” are made (e.g., cross section vs $S_e$, $R$ vs $S_e$, or collapse with material parameters), and what assumptions are required for the collapse to hold?**  
19B) **What is the minimal reproducible benchmark in this paper (one dataset/figure/parameter set), and what missing specification would block reproduction?**

### C) Early-time electronic kinetics / hybrid approaches

15C) **What does the paper claim about electron thermalization time, and how does it diagnose when a temperature-based $T_e$ becomes meaningful?**  
16C) **What transport regime dominates early (ballistic fronts vs diffusion), and what does the paper conclude about where/why diffusion-type heat equations break down?**  
17C) **How is deposited energy partitioned among channels (free electrons, holes/excitons, ionization/excitation, phonons), and how does that partition evolve in time?**  
18C) **How is the hybrid coupling done (e.g., MC→TTM handoff), and which effective material functions does it produce ($C_e$, $\kappa_e$/diffusivity, $g$, or source initialization)?**  
19C) **If you collapse this into a practical TTM/i-TS forcing for your code, what effective $S(r,t)$, deposition width, and tail law does the paper imply, and what is the single best benchmark quantity to reproduce?**

### D) δ-electrons / radial dose lineage

15D) **What quantity is being computed (radial dose/energy density), and what is the explicit formula/algorithm?**  
16D) **What physical inputs does it require, and how are they modeled (electron spectrum, range–energy relation, $Z^*$ effective charge / $\beta$ scaling, angular effects, condensed-phase corrections)?**  
17D) **What regime is it intended for, and what limits/extrapolation warnings are stated (near-track behavior, far-tail behavior, low-energy ions, material dependence)?**  
18D) **What core-width scale and tail law does it imply (e.g., effective “Waligórski radius”–type width, asymptotic $1/r^2$-like falloff), and how are truncations/cutoffs chosen?**  
19D) **What is the most concrete reproducibility check (a plotted $D(r)$ for a specified ion/material), and how is energy conservation enforced (radial integration recovers stopping power / deposited energy per unit length)?**
