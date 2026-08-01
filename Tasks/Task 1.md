# Task 1: Build a Silica SHI-Track Scaffold Before Returning to Ceria

The purpose of this task is to stand up a complete, working swift-heavy-ion track-simulation pipeline in a material that is much simpler than ceria. The target material for this first scaffold should be silica, meaning either amorphous $\mathrm{SiO}_2$ or $\alpha$-quartz, because silica lets me focus on the mechanics of the workflow rather than on redox chemistry, mixed valence, or $f$-electron localization. The goal is not yet to answer a new chemistry question. The goal is to make sure that the forcing, two-temperature coupling, simulation cell design, boundary handling, radial analysis, and track-metric extraction all work in a system where the underlying materials physics is comparatively clean and where there is already literature precedent.

This task should be treated as a methodological baseline for the broader ceria program. If I cannot reproduce a reasonable silica track with an existing validated silica potential or an existing silica MLIP, then it is premature to spend more time on ceria-specific complications such as $\mathrm{Ce}^{4+}/\mathrm{Ce}^{3+}$ redox chemistry, DFT+$U$ branch control, or reduction-series coverage.

## Core objective

Reproduce a literature-style silica swift-heavy-ion track simulation using an existing validated silica interaction model, and make the full simulation-and-analysis pipeline operational. In practical terms, this means selecting one specific benchmark case from the silica track literature, implementing the same style of forcing in my codebase, running the simulation to quench, and extracting physically interpretable track descriptors that can be compared to the published result.

## Immediate scope

For this task, I should not begin by training a new silica MLIP unless that becomes necessary later. The first version of the scaffold should use an already validated interaction model for silica, either a published classical potential or a published silica MLIP, so that the dominant uncertainty is in the SHI workflow rather than in the interatomic model. The point of this task is to debug the track pipeline, not to conflate that effort with a fresh potential-development project.

The first benchmark should be one of the established silica/quartz references already collected in the vault, especially the Leino/Pakarinen line of work on latent tracks in quartz and amorphous silica. I should choose a single target system and stay with it long enough to get a clean reproduction before broadening to additional materials or additional silica phases.

## Recommended benchmark choice

The most sensible first benchmark is a case as close as possible to the Leino-style workflow discussed in my notes:

- use silica as the target material,
- use a published SHI case with known stopping power and track-radius discussion,
- use a track-analysis definition that can be compared directly to the literature,
- keep the material model fixed while I debug the rest of the pipeline.

I should decide explicitly between the following two starting points:

- **Amorphous silica** if I want the simplest structural analysis and density-profile comparison,
- **$\alpha$-quartz** if I want a crystalline benchmark that is closer in spirit to later oxide track work.

If the main goal is simply to get the workflow working robustly, amorphous silica is probably the better first target. If the main goal is to practice crystalline-track metrics and later transition more smoothly to fluorite oxides, $\alpha$-quartz may be the better choice.

## Deliverables

By the end of this task, I want the following outputs to exist in a reproducible form:

- one clearly identified silica benchmark case from the literature, including the ion species, stopping power or radial deposition profile, target phase, and comparison observable;
- one working simulation setup that can generate a latent track in silica using an existing validated potential;
- one documented forcing implementation for SHI energy deposition, including the exact form of the radial and temporal deposition model;
- one working two-temperature or thermal-spike coupling setup with justified parameter choices;
- one stable simulation-cell design with boundaries that do not introduce obvious artifacts into the track region;
- one postprocessing workflow that computes radial density profiles, disorder metrics, and an operational track radius;
- one comparison against the selected literature benchmark, including where the simulation agrees and where it differs;
- one written note summarizing what parts of the pipeline are now trustworthy enough to transfer to rung-2 and rung-3 materials.

## Concrete subproblems to solve

### 1. Pick the benchmark case

I need to choose one exact literature target rather than vaguely aiming at “a silica track.” The choice should specify:

- whether the material is amorphous silica or $\alpha$-quartz;
- which paper is the primary benchmark;
- which irradiation condition is being reproduced;
- which observable is the main comparison target, such as track radius from radial density variation, core-shell density contrast, or threshold behavior.

This decision must be written down before heavy simulation work begins, because different papers use different radius definitions and different forcing assumptions.

### 2. Choose the interaction model

I need to identify one existing silica interaction model that is already regarded as credible for high-temperature and damaged-state dynamics. The chosen model should be justified explicitly. The selection criteria should include:

- proven stability under heating, quenching, and local disorder;
- reasonable structural behavior for the chosen silica phase;
- compatibility with my MD engine and planned 2T coupling;
- enough literature credibility that disagreement with the benchmark is not automatically dismissed as “bad potential.”

Only after a successful scaffold run should I consider replacing the interaction model with a silica MLIP of my own.

### 3. Reproduce the equilibrium material first

Before simulating a track, I need to show that the chosen model reproduces the unirradiated starting structure well enough for the track problem to be meaningful. At minimum this means checking:

- density or lattice parameters, depending on phase;
- structural stability over an equilibration run;
- absence of obvious unphysical drift, collapse, or spontaneous disordering;
- sensible thermal behavior in the temperature range relevant to the track setup.

The point is not to perform a full force-field publication benchmark. The point is to eliminate avoidable setup failures before introducing SHI forcing.

### 4. Implement the SHI forcing cleanly

I need one explicit and reproducible prescription for how the ion deposits energy. This includes:

- the radial deposition profile;
- the temporal profile of deposition;
- the mapping between literature stopping power and simulation input units;
- the effective deposition radius or characteristic width;
- the assumptions used if the implementation is only an approximation to the original paper.

This part must be auditable. Later failures in the track radius are otherwise impossible to interpret.

### 5. Get the two-temperature coupling working

The silica scaffold must include a working continuum-to-atomistic energy-transfer layer, not just a generic hot-cylinder excitation, unless I intentionally start with a simpler pre-2T baseline. If a simpler hot-cylinder run is used first, that should be treated as an intermediate debugging step rather than the final deliverable.

For the 2T part, I need to define and document:

- electronic heat capacity model;
- electronic diffusivity or conductivity model;
- electron-phonon coupling term or equivalent thermostat mapping;
- lattice/electronic mesh coupling strategy;
- ambient and damping conditions.

The implementation does not need to be perfect on the first pass, but it must be internally consistent and stable enough to support track formation without obvious numerical pathology.

### 6. Design boundaries and cell size carefully

I need a simulation cell that is large enough for the track core and early relaxation to occur without severe reflection or artificial recapture of energy from the boundaries. This includes:

- selecting lateral dimensions large enough to separate the track core from the thermostat or dissipative rim;
- choosing a longitudinal dimension that is adequate for the intended forcing model;
- implementing a dissipative boundary region or equivalent sink;
- testing whether changing the cell size or rim thickness materially changes the extracted track radius.

This is one of the main places where an apparently “working” simulation can still be misleading.

### 7. Build the analysis pipeline

The simulation is not useful unless the output can be analyzed in a way that maps onto the literature. I need a reusable postprocessing workflow that computes:

- radial density profiles;
- local coordination or disorder metrics;
- a track-radius definition that is explicitly stated;
- optional core-shell descriptors if that is part of the benchmark paper;
- time evolution of the track during the quench, if feasible.

This should be automated enough that later comparisons across materials do not require inventing a new analysis workflow from scratch.

### 8. Validate against literature

The final step is not simply “a track formed.” The final step is whether the simulated track can be compared meaningfully to the silica benchmark. That means checking:

- whether the track forms at approximately the expected stopping power range;
- whether the radius is in the expected ballpark;
- whether the qualitative morphology matches the benchmark, such as amorphization, density deficit, or a core-shell profile;
- whether discrepancies can be traced to forcing assumptions, thermal parameters, interaction model limitations, or analysis definitions.

## Minimum success criteria

This task should count as successful if I can say all of the following with evidence:

- I can run a stable silica SHI track simulation with a literature-based forcing model.
- I can explain exactly how energy is deposited and transferred to the lattice.
- I can show that the resulting track morphology is not dominated by obvious boundary or thermostat artifacts.
- I can extract a radial track metric in a reproducible way.
- I can compare the result to a named literature benchmark and discuss the agreement or disagreement coherently.

## Stretch goals

These are useful but not required for the first completion of Task 1:

- compare a simple hot-cylinder initialization against full 2T coupling;
- compare amorphous silica and $\alpha$-quartz using the same analysis pipeline;
- compare a classical silica potential against an existing silica MLIP;
- package the workflow so that the same forcing and analysis machinery can later be reused for `TiO2-x`, `ThO2`, and `CeO2-x`.

## What this task is supposed to teach me

If completed properly, this task should answer the following methodological questions before I return to more difficult materials:

- Can I reliably map an SHI forcing model into my simulation code?
- Can I make the 2T coupling behave sensibly in practice?
- Can I choose boundary conditions and cell sizes that do not corrupt the track?
- Can I define track radius and disorder metrics in a way that is reproducible and literature-comparable?
- Can I separate errors due to the interaction model from errors due to forcing, thermal parameters, or analysis?

## What should explicitly wait until later

The following should not be allowed to derail this first scaffold task:

- training a brand-new silica MLIP from scratch;
- trying to solve the full velocity-effect problem immediately;
- broad parameter sweeps before one benchmark case is working;
- redox-aware modeling issues that are specific to rung-2 or rung-3 materials;
- ceria-specific DFT+$U$ calibration questions.

## End product for future me

When this task is done, I want to be able to hand my future self a working statement like this:

“The SHI pipeline has been demonstrated in silica. The forcing, 2T coupling, boundary treatment, radial profiling, and track metrics are operational. Any remaining difficulty in moving to `TiO2-x`, `ThO2`, or `CeO2-x` is therefore due mainly to the material model, not to the basic simulation scaffold.”
