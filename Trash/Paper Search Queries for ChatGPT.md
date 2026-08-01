# Paper Search Queries for ChatGPT

These queries are designed to be pasted one at a time into ChatGPT. Each batch covers a coherent theme.

**Paste these instructions at the top of EVERY batch before the numbered items:**

> Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as one of: `Exact match`, `Closest relevant match`, or `No exact match found`. If no exact match exists, provide the closest relevant paper and explain what gap remains.

---

## Batch 1: Ceria SHI Irradiation Experiments (Tracks, Reduction, Spectroscopy, Annealing)

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains.

I am building a literature index for a research project on swift heavy ion (SHI) track formation and annealing in ceria and reduced ceria (the CeO2 – CeO2-x – Ce2O3 system). I need published research papers for each item below.

1. A paper that directly compares SHI track radii, morphology, or recovery in CeO2 and UO2 under the same or closely comparable irradiation conditions. If no true head-to-head comparison exists, find the closest paper that compares radiation response across multiple fluorite oxides including ceria.

2. Experimental SHI track characterization in UO2 — TEM images, SAXS measurements, or XRD data showing track morphology. This serves as a "non-redox-flexible" comparator baseline.

3. Experimental evidence of a systematic trend in radiation damage across rare-earth oxides (e.g., Ln2O3 series) where the reducibility or electronic structure of the cation correlates with radiation response (amorphization resistance, track size, or recovery behavior).

4. Spectroscopic evidence (XPS, EELS, XANES, or similar) showing Ce3+ formation — i.e., irradiation-induced reduction — in CeO2 after swift heavy ion or high-electronic-stopping irradiation. Any ion irradiation study showing Ce4+ → Ce3+ conversion in ceria.

5. Raman spectroscopy of ion-irradiated ceria showing oxygen vacancy signatures (the ~460 cm⁻¹ F2g mode changes, the ~600 cm⁻¹ defect band, or other features) correlated with electronic stopping or ion fluence.

6. SAXS (small-angle X-ray scattering) measurements of SHI tracks in CeO2, giving quantitative track radii. If none exist for CeO2 specifically, find SAXS track measurements in a closely related fluorite oxide (ThO2, UO2).

7. Experimental studies of thermal annealing of SHI tracks in CeO2 — TEM, XRD, or Raman showing track recovery, shrinkage, or recrystallization as a function of annealing temperature. If none exist for CeO2, find the closest fluorite oxide analog.

8. Track annealing studies in UO2 for comparison — how do SHI or fission tracks in UO2 evolve with thermal annealing?
```

---

## Batch 2: Ce–O System Fundamentals (Phase Diagram, Reduction Series, Defect Chemistry, Transport)

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains.


I am training a machine-learning interatomic potential (MLIP) across the full ceria reduction series — CeO2, Ce7O12, and Ce2O3 — for use in SHI track simulations. I need papers covering the Ce–O phase landscape, crystal structures of the reduced phases, defect chemistry, and transport properties. These serve as both physical background and MLIP validation targets.

CE–O PHASE LANDSCAPE AND REDUCED PHASE CRYSTALLOGRAPHY:

1. The Ce–O binary phase diagram — an assessed or experimentally determined phase diagram covering the full composition range from CeO2 through Ce7O12 to Ce2O3, including the phase boundaries and stability regions of intermediate phases.

2. Crystal structure of Ce7O12 — the vacancy-ordered superstructure. I need the space group, lattice parameters, and the oxygen vacancy ordering pattern. This phase is one of our MLIP training targets and I need to build it correctly.

3. Crystal structure of Ce2O3 — both the A-type (hexagonal) and C-type (bixbyite/cubic) polymorphs. Lattice parameters and which polymorph is stable under what conditions.

4. Lattice parameter evolution as a continuous function of x in CeO2-x — experimental measurements (XRD, neutron diffraction) showing how the lattice constant changes across the nonstoichiometry range, including Vegard's-law-like behavior or deviations.

5. Formation enthalpies or relative phase stability across the Ce–O reduction series — thermodynamic data (experimental or computational) for the energetics of CeO2 → Ce7O12 → Ce2O3 reduction. This is a critical MLIP validation target: the potential must get the relative stability of these phases correct.

DEFECT CHEMISTRY AND TRANSPORT:

6. The canonical foundational reference on defect chemistry of reduced ceria (CeO2-x) — defect equilibria, how oxygen vacancy concentration depends on temperature and pO2. Likely authors: Tuller & Nowick, or Mogensen, Sammes & Tompsett.

7. Small polaron hopping in ceria — the Ce3+ 4f electron as a small polaron, hopping mechanism, and activation energy. This matters because electronic transport couples to structural relaxation during track annealing.

8. Oxygen vacancy migration barriers in CeO2 and CeO2-x — DFT-calculated or experimentally measured activation energies for oxygen ion hopping. Key MLIP validation target.

9. Chemical expansion in reduced ceria — how the lattice parameter changes when Ce4+ reduces to Ce3+ and oxygen vacancies form. Likely authors: Marrocchelli, Bishop, or Chatzichristodoulou.

10. Experimental oxygen diffusivity in reduced ceria as a function of temperature and reduction level — tracer diffusion, conductivity-derived, or SIMS measurements.
```

---

## Batch 3: Ceria Thermophysical Properties and Competing Mechanisms

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains.

For each request, the information does not have to be all in one paper. If the information is spread across several papers that is fine, just document what is in them so I'll know where to file them away.

PART A — THERMOPHYSICAL PROPERTIES OF CERIA (needed for TTM parameterization and MLIP validation):

1. Thermal conductivity of CeO2 and CeO2-x as a function of temperature and stoichiometry. Experimental data (laser flash, 3-omega) where available; for the high-T regime (>1500 K) relevant to thermal spikes, computational estimates or assessment papers are acceptable.

2. Electron-phonon coupling in CeO2 or a closely related insulating oxide. A clean coupling constant g may not exist for CeO2 the way it does for metals. I am looking for any paper that estimates, models, or measures the rate of energy transfer from excited electrons to the lattice in ceria or a comparable wide-bandgap insulator. Assessment papers or model calculations are acceptable.

3. Electronic heat capacity of CeO2 as a function of electronic temperature. For a wide-bandgap insulator with 4f states, this differs fundamentally from the free-electron model used for metals. Any ab initio calculation, model estimate, or parametrization used in a thermal-spike or TTM study of an insulating oxide.

4. CeO2 and Ce2O3 melting points — experimental measurements. Also any known high-temperature phase behavior or structural transitions before melting.

5. Elastic constants of CeO2 and Ce2O3 — experimental (ultrasonic, Brillouin scattering, nanoindentation) or DFT values.

6. Reduction enthalpy or oxygen vacancy formation thermodynamics in CeO2 — experimental values from calorimetry, thermogravimetry, coulometric titration, or equilibrium measurements. Note: I am looking for experimental thermodynamic data, not a single "vacancy formation energy" number — the quantity may be reported as a reduction enthalpy, partial molar enthalpy of oxygen, or similar.

PART B — COMPETING MECHANISMS FOR RADIATION TOLERANCE (non-redox explanations):

7. Papers whose thermal-spike or TTM models explain SHI track behavior in fluorite oxides using only thermal parameters (κ, C_p, g, T_melt) without invoking redox chemistry. This is the null hypothesis that a purely thermal model is sufficient.

8. Sickafus, Ewing, and/or others on "structural flexibility" or "cation disorder tolerance" as a predictor of radiation tolerance in fluorite and pyrochlore oxides — arguments that structural flexibility rather than redox chemistry controls radiation tolerance.

9. Papers showing that SHI track formation thresholds or track radii correlate with melting point or cohesive energy across many materials, without needing a redox mechanism. Possibly Toulemonde, Szenes, or Meftah.

10. Trachenko's rigidity-based or topological classification of radiation tolerance in oxides — arguments that radiation tolerance maps onto bond rigidity, network connectivity, or glass-forming tendency.
```

---

## Batch 4: DFT+U Methodology, Branch Control, and MLIP Training Data Design

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains.

For each request, the information does not have to be all in one paper. If the information is spread across several papers that is fine, just document what is in them so I'll know where to file them away.

I am running DFT+U (VASP) calculations on cerium oxide phases (CeO2, Ce7O12, Ce2O3) to generate training data for machine-learning interatomic potentials (MLIPs). I need foundational methodology papers and practical workflow references.

1. Dudarev, Botton, Savrasov, Humphreys, Sutton — the original paper introducing the simplified rotationally invariant DFT+U approach used in VASP (LDAUTYPE=2). 1998, Physical Review B.

2. Cococcioni and de Gironcoli — linear-response method for computing the Hubbard U parameter from first principles. Around 2005, Physical Review B.

3. Khakshouri, Alfè, and Duffy — electronic-temperature-dependent interatomic potentials. Around 2008, Physical Review B. This establishes the U(R, T_e) framework.

4. Methods for monitoring DFT+U occupation matrices, site magnetic moments, or localization patterns along an AIMD trajectory to detect unintended electronic branch switches. This could be a methodology paper, a case study demonstrating the problem, or a paper proposing practical diagnostics. Authors to check: Meredig, Allen, or anyone working on DFT+U metastability in dynamics.

5. Best practices for running AIMD under DFT+U for oxides — thermostat choices, time step selection, equilibration criteria, handling SCF convergence failures. This may not be a single canonical paper; methodology papers, case studies in f-electron oxides, or VASP documentation that addresses this are all acceptable.

6. Active learning strategies for oxide MLIPs — on-the-fly learning methods for deciding which AIMD snapshots to include in training when the configuration space spans multiple stoichiometries and high-T disorder. Key authors: Jinnouchi & Kresse, Vandermause et al. (FLARE), or Bernstein & Csányi.

7. Snapshot triage and outlier detection in MLIP training sets — committee disagreement, D-optimality, or force-error-based filtering to identify frames that may reflect branch switches, SCF failures, or unphysical states.

8. Any paper or methodology for systematically building training structures that span a nonstoichiometry range in an oxide — e.g., CeO2 through Ce7O12 to Ce2O3 — with controlled vacancy patterns and ordering rather than random oxygen removal. This could be from ceria specifically or from any analogous oxide system (e.g., UO2+x, TiO2-x, FeOx).

Also, please confirm the full citations (authors, title, year, journal) for these papers referenced in a previous discussion:

A. [CONFIRM] Chemical Reviews paper on MLIP data generation / training set design, approximately 2024: https://pubs.acs.org/doi/10.1021/acs.chemrev.4c00572

B. [CONFIRM] Digital Discovery paper on DFT label noise tolerance for MLIPs, 2026: https://pubs.rsc.org/en/content/articlehtml/2026/dd/d5dd00294j

C. [CONFIRM] arXiv paper on MLIP training for multi-electronic-state systems, approximately 2025: https://arxiv.org/pdf/2503.09814
```

---

## Batch 5: MLIP Deployment in LAMMPS (Integration, ZBL, OOD Detection, Performance)

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains. For this batch, results from preprints, software documentation, GitHub repositories, and LAMMPS mailing list discussions are acceptable where no journal paper exists.

For each request, the information does not have to be all in one paper. If the information is spread across several papers that is fine, just document what is in them so I'll know where to file them away.

I am deploying an Allegro machine-learning interatomic potential inside LAMMPS for swift heavy ion (SHI) track simulations using fix ttm/grid. I need practical references for the integration, failure modes, and performance.

1. Has anyone published a paper, preprint, or documented example where an MLIP (GAP, ACE, MACE, Allegro, NequIP, or any ML potential) was coupled to LAMMPS fix ttm or fix ttm/grid for radiation damage, laser ablation, or SHI track simulation? Search broadly across all material systems. This is the single most important reference for my project.

2. A paper using MACE, Allegro, NequIP, or ACE applied to a metal oxide (UO2, CeO2, ZrO2, HfO2, SiO2, or similar). I need a precedent for a local equivariant MLIP architecture applied to an oxide.

3. Any paper where an MLIP was used for a radiation damage simulation (cascade or thermal spike) in an oxide rather than a metal. All published MLIP radiation-damage work I know of is in tungsten or silicon.

4. Practical guidance on pair_style hybrid/overlay with pair_zbl in LAMMPS for combining an MLIP with ZBL short-range repulsion. Papers, LAMMPS tutorials, or documented examples are all acceptable. The key issue is avoiding double-counting or discontinuities at the splice distance.

5. Uncertainty quantification or out-of-distribution detection methods for MLIPs during production MD. How to monitor in real time whether the potential is being queried on configurations outside its training distribution. Key authors: Schran, Batatia (MACE uncertainty), Vandermause (FLARE on-the-fly), or Musil & Ceriotti.

6. Documented failure modes when an MLIP extrapolates badly during MD — practical descriptions of what actually happens (force spikes, energy drift, unphysical atom ejection, catastrophic instability). Any material system.

7. GPU-accelerated MLIP pair_styles in LAMMPS — benchmark data for Allegro, MACE, or similar on GPU, showing performance for systems in the tens-of-thousands to hundreds-of-thousands atom range. I need to assess whether track-scale simulations are computationally feasible.

Also confirm the full citation for:
[CONFIRM] Oxidation-state-aware MLIP, npj Computational Materials 2025: https://www.nature.com/articles/s41524-025-01709-z
```

---

## Batch 6: Theoretical Frameworks, Post-Processing, and Computational Setup

```
Use web browsing. Do not infer or invent citations. For each numbered item, provide: Author(s), full title, year, journal/venue, and a verified DOI or publisher landing-page link. Label each result as: Exact match, Closest relevant match, or No exact match found. If no exact match exists, provide the closest relevant paper and explain what gap remains. For items 7 and 10, documentation, tutorials, or well-documented software examples are acceptable.

For each request, the information does not have to be all in one paper. If the information is spread across several papers that is fine, just document what is in them so I'll know where to file them away.

THEORETICAL FRAMEWORKS:

1. Phase-field or continuum models that couple defect chemistry (nonstoichiometry, oxygen vacancy concentration) to thermal transport equations in irradiated nuclear oxides. This could be for UO2, CeO2, or other nuclear ceramics. Authors to check: Andersson, Tonks, Millett (for UO2 fuel performance models), or any coupled defect-thermal model in an oxide.

2. Any existing modeling work on oxidation/reduction front propagation in an oxide under strong thermal or radiation driving. If no SHI-specific papers exist, the closest thermochemical or defect-transport analog in an oxide under steep gradients is acceptable.

3. Foundational nonequilibrium thermodynamics for coupled defect reactions and transport in ionic solids — the conservation-law and constitutive-law framework for a rigorous theoretical paper. Key references: Schmalzried ("Chemical Kinetics of Solids"), or Martin, or Onsager-type transport frameworks applied to oxide defect chemistry.

Also confirm:
[CONFIRM] Electron-temperature-dependent potential, npj Computational Materials ~2023: https://www.nature.com/articles/s41524-023-01168-4

POST-PROCESSING AND ANALYSIS:

4. Methods for computing synthetic SAXS profiles from atomistic simulation output for direct comparison with experimental SAXS measurements of ion track radii. Authors to check: Kluth, Afra, Leino, or anyone doing MD→SAXS comparison for ion tracks.

5. Methods for generating synthetic TEM or HAADF-STEM images from atomistic coordinates (multislice or similar). Software references: QSTEM, abTEM, Dr. Probe, or similar applied to radiation damage structures.

6. A paper where radial density profiles, Wigner-Seitz defect analysis, or coordination analysis was explicitly applied to LAMMPS output of an SHI track simulation and compared against experiment. I need to see the actual analysis methodology, not just the final result.

COMPUTATIONAL SETUP:

7. SRIM stopping powers for CeO2 — any paper that reports Se and Sn values for swift heavy ions in ceria. Check whether Rymzhanov et al. (2025, J. Nucl. Mater.) or Yablinsky et al. (2015, J. Mater. Res.) report explicit SRIM Se values for CeO2 that could serve as an independent cross-check.

8. Guidance on minimum simulation cell dimensions for SHI track simulations — how far the pressure wave extends radially and when periodic images interact. Any paper that has systematically tested cell-size convergence for track simulations.

9. Neutron diffraction studies of oxygen sublattice disorder in CeO2-x or Ce2O3 at high temperature — evidence for oxygen disorder, superionic behavior, or structural transitions relevant to the thermal spike regime. Likely authors: Hull, Norberg, or Scavini.

10. LAMMPS energy audit methodology for TTM-MD — how to track total energy partitioning (electronic + kinetic + potential) per timestep to verify conservation after the source term is off. Papers, LAMMPS documentation, or mailing list discussions are all acceptable.
```

---

## Usage Notes

- Paste one batch at a time into ChatGPT
- The "Use web browsing / Exact match / Closest / No match" instruction is already included at the top of each batch — do not remove it
- After each batch, review the results and verify at least a few DOIs before moving on
- For [CONFIRM CITATION] items, verify authors/title/year/journal match the URL
- If an item returns "No exact match found," note what gap remains — that tells you the literature may genuinely be sparse there
- Save all results into a working document so we can update the three paper indexes afterward
- Recommended order: Batch 1 and 2 first (experimental anchors and phase landscape), then Batch 4 (DFT+U methodology you're actively using), then the rest
