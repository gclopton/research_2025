### Phase 3 extraction checklist for each resource

Phase 3 resources exist to make your **LAMMPS TTM/2T-MD implementation reproducible and auditable**. The goal is not “damage happened,” but rather:

- you can reconstruct the **electron grid**, **electron transport**, and **electron↔atom coupling** choices from paper-alone (or manual-alone),
- you can extract and plot intermediate fields ($T_e(\mathbf{r},t)$ or $T_e(r,t)$, and an atomic temperature proxy),
- you can perform **energy accounting** checks (what energy is stored in electrons; what energy is exchanged per step),
- you can design a **parity harness** that compares LAMMPS outputs against your standalone cylindrical solver under matched forcing and comparable boundary/sink choices.

## General question set (ask these for every Phase 3 resource)

0. **What kind of Phase 3 resource is this, and what parity deliverable does it support?**  
    Classify the resource as one of:
    - LAMMPS documentation page (command semantics + restrictions + outputs),
    - runnable example repository (input decks you can run and inspect),
    - algorithm-defining paper (what the coupling *means* and how it is discretized),
    - applied TTM-MD paper (a benchmark case with intermediate plots/fields).
    Then state the single parity deliverable it supports (e.g., “grid $T_e$ dump format,” “electron→atom energy transfer audit,” “how sinks are implemented,” “region-wise properties across layers,” or “runnable harness with a track-like source term”).

1. **What is the electron subsystem representation?**  
    Record whether electrons are represented as:
    - a diffusion PDE on a regular grid over the MD box (typical LAMMPS `fix ttm` family),
    - a finite-reservoir or extended-grid “bath” with fixed-$T_e$ sinks,
    - something else (e.g., explicit carriers, MC handoff, non-diffusive transport).
    Record the evolved electron field ($T_e$, electronic energy density, etc.) and its units.

2. **What is the lattice/atom subsystem representation and temperature definition?**  
    Record how the paper/resource defines the atomic temperature that couples to electrons:
    - local kinetic temperature in bins/cells,
    - a thermostat temperature target,
    - a coarse-grained cell temperature,
    - a lattice temperature field $T_l$ (continuum),
    and how it is computed (per-atom compute, spatial binning, averaging window).

3. **What are the governing equations being approximated by the MD+grid algorithm?**  
    Write down the continuum form the resource implies (symbolic is fine), at least:
    - electron diffusion and capacity: $C_e(T_e)\,\partial_t T_e = \nabla\cdot(\kappa_e(T_e)\nabla T_e) - g(T_e-T_l) + S(\mathbf{r},t)$,
    - lattice heating term (whether explicit PDE or implicit via MD + thermostat coupling).
    Then record how the implementation maps that into discrete objects: grid cells, finite differences, and a coupling operator applied to atoms.

4. **What are the electron transport coefficients and how are they specified?**  
    Record:
    - $C_e$ (constant vs $C_e(T_e)$),
    - $\kappa_e$ (constant vs $\kappa_e(T_e)$, or a diffusivity $D_e$),
    - any “scaling knobs” (e.g., multiplying $\kappa_e$ by a factor),
    plus the provenance (measured, literature, fitted, computed on the fly).

5. **What is the electron↔atom coupling parameterization and what symbol does it correspond to?**  
    Extract the coupling form used by the algorithm (often proportional to $T_e-T_l$). Then map the resource’s parameter names to a continuum $g$-like quantity (or to friction coefficients).
    If the implementation uses separate parameters (e.g., electronic stopping friction vs electron–phonon coupling), list both and state which one is responsible for *heat exchange* versus *projectile energy loss*.

6. **What is the forcing/deposition model in this resource?**  
    Record *how energy enters* the coupled system:
    - prescribed initial $T_e(\mathbf{r},0)$ (from a file),
    - explicit source term on the electron grid $S(\mathbf{r},t)$,
    - electronic stopping friction on fast atoms/projectiles,
    - mixed approaches.
    Capture the normalization statement tying it back to an energy-per-length input like $S_e$ (if applicable).

7. **What are the electron-grid geometry, spacing, and domain extent (including sinks)?**  
    Record:
    - grid dimensions ($N_x,N_y,N_z$) and physical spacing ($\Delta x,\Delta y,\Delta z$),
    - whether the electron grid extends beyond the atomistic region,
    - how “sinks” are implemented (fixed-$T_e$ boundary, extended domain to a fixed boundary, explicit sink term),
    - any statements like “small grid vs big grid” and the rationale (diffusion distance to sinks).

8. **What boundary conditions and constraints does the implementation impose?**  
    For LAMMPS-based resources, record hard constraints (orthogonal 3D boxes, periodicity requirements, group restrictions) and any implications for your intended SHI domain and boundary-condition strategy.

9. **What outputs are available for auditing parity (fields + energy accounting)?**  
    List exactly what can be extracted and how:
    - grid $T_e$ output method (e.g., `dump grid`, grid averaging),
    - atomic temperature extraction (per-atom / spatial binning),
    - electron total energy, and per-timestep electron→atom energy transfer (vector/scalar outputs),
    - any additional diagnostic channels (sink flux, source energy injected).

10. **What stochasticity is present, and what does “reproducible” mean for parity?**  
    If coupling uses Langevin noise, record:
    - which parameters/seed control the randomness,
    - whether exact trajectory reproducibility is expected (usually no, across MPI layouts),
    - what parity metric is appropriate instead (energy conservation, mean envelopes, time-averaged profiles, ensemble statistics).

11. **What unit system and material-property units are used?**  
    Record the LAMMPS unit style (e.g., `metal`, `real`) and how $C_e$, $\kappa_e$, and coupling parameters must be converted into those units. If the resource uses mixed sources (SI in a paper; LAMMPS units in input), record the conversion steps you must do later.

12. **What is missing for a runnable parity harness, and what is your minimum “honest assumption”?**  
    List missing items (grid spacing, sink BC, coupling constants, deposition normalization, region definitions). Then state the minimum assumption you would adopt to proceed, clearly labeled as assumed. Assign a reproducibility rating (high/medium/low) based on whether you could build a runnable case and audit energy without contacting the authors.

---

### Minimal end-of-resource record (what you should be able to write after reading)

After finishing a Phase 3 resource, you should be able to write: resource type; intended parity deliverable; electron-grid definition (size, spacing, domain, sinks); coefficients ($C_e$, $\kappa_e$ or $D_e$, coupling); coupling implementation details (what acts on atoms, where stochasticity enters); deposition/forcing method; outputs for $T_e$ and energy exchange; unit conventions; and a reproducibility rating with one sentence naming the biggest missing detail if not “high.”

---

## Resource-type addenda (use only when relevant)

### A) LAMMPS documentation pages (commands + constraints + outputs)

15A) **What are the exact input arguments/keywords that matter for parity?**  
    Record the specific parameters you would need to set to reproduce a benchmark ($N_x,N_y,N_z$, $C_e$, $\kappa_e$, coupling/friction parameters, file inputs, BC options, etc.).

16A) **What computed outputs does the command expose, and in what form (scalar/vector)?**  
    Record which values can be accessed as fix outputs, computes, or dumps, and how you would log them.

17A) **What are the documented restrictions/quirks that will affect your intended domain?**  
    Record any box-shape restrictions, boundary requirements, parallelism caveats, and performance implications that would change how you design parity tests.

### B) Runnable repositories / example input decks

15B) **What is the smallest example that exercises the key failure modes you care about?**  
    Choose one example that includes: electron diffusion on a grid, coupling to atoms, and a spatially structured source or initialization.

16B) **What intermediate outputs does the example produce by default, and what do you need to add?**  
    Record which dumps/logs exist and what you would add to enable parity overlays ($T_e$ grid dumps, spatially binned atomic temperature, electron→atom energy transfer time series).

17B) **What does the example implicitly assume about sinks and domain truncation?**  
    Identify whether it uses fixed-$T_e$ boundaries, extended grids, thermostatted regions, or other artificial sinks.

### C) Algorithm-defining papers (what LAMMPS is “supposed” to be implementing)

15C) **How does the paper discretize the electron diffusion equation and couple it to atoms?**  
    Extract the discretization (finite difference, cell mapping) and how atom energies exchange with the local electron cell.

16C) **How does the algorithm guarantee (or fail to guarantee) energy conservation?**  
    Record the energy-accounting mechanism and any caveats (noise terms, boundary flux, sink removal).

17C) **How does the algorithm separate “electronic stopping” from “electron–phonon coupling”?**  
    Record which term corresponds to projectile friction versus heat exchange, and how they are combined (or not).

### D) Applied TTM-MD papers (parity-relevant benchmark cases)

15D) **What is the benchmark case you can actually reconstruct?**  
    Identify one figure/plot you can overlay against (e.g., $T_e$ or $T_l$ profiles vs time/radius; sensitivity to grid size; sink placement effects).

16D) **What electron-grid extent and sink strategy is used, and how does the paper justify it?**  
    Record whether the paper uses an extended electron grid, fixed-$T_e$ boundaries, or region-based sinks, and what sensitivity they report.

17D) **What region-wise properties or layered geometry logic is used (if any)?**  
    Record how the paper assigns different $C_e$, $\kappa_e$, $g$ in different regions/materials, and how interfaces are treated (continuity, contact resistance, shared grid, etc.).

