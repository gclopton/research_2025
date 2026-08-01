# Ceria SHI Electronic-Structure Calculation History

This note reconstructs the calculation history for the ceria swift-heavy-ion (SHI) project as of July 26, 2026. The purpose is to give Claude a path-auditable map of what has been tried, what worked, what failed, and why the current Bond Distortion Method (BDM) campaign exists.

The focus here is the electronic-structure work, not the calc-manager app. The app and its docs are useful because they preserve run intent, analysis, and path conventions, but the scientific thread is: converge ceria electronically, generate AIMD data, train a machine-learned interatomic potential (MLIP), and use that MLIP to simulate SHI track formation and annealing in ceria, with special attention to whether redox chemistry affects track formation and recovery.

# One-Sentence State Of The Project

The project has moved from ordinary PBE+U convergence and staged AIMD recipes, through occupation-matrix-control (OMC) prototypes, to a current BDM workflow for fluorite CeO2 at PBE+U(5); BDM is the active path because it keeps the calculations close to ordinary VASP/AIMD practice while systematically testing whether geometry and spin biasing are enough to find the correct localized 4f branches.

# Source Map For Audit

The canonical cluster-side calculation store is Bridges scratch:

```text
/ocean/projects/mat260002p/clopton/scratch
```

The local calculation mirror is:

```text
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch
```

The active BDM campaign lives at:

```text
Bridges scratch:
/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5

Calc mirror:
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5
```

The BDM documentation folder is:

```text
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign
```

The older managed convergence and AIMD attempts are mostly under:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/convergence_tests
```

There is also an older cluster-only molecular-dynamics tree that I found on Bridges but not in the local calc mirror:

```text
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics
```

The OMC prototype notes are in:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/OMC Calculation Campaign
```

# Important Naming Trap: Two CeO2 Materials Appear In The History

The older `CeO2_mp-1018664` directory is not the same material as the active BDM campaign. The BDM docs record that `mp-1018664` is a tetragonal CeO2 polymorph with a Ce2O4 cell, not the cubic fluorite CeO2 phase used for the current BDM work. The active BDM material is fluorite CeO2, pinned in the campaign docs as `mp-20194`.

This matters because older convergence evidence under:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664
```

should not be treated as direct convergence evidence for the BDM fluorite CeO2 campaign. It is still useful background because it uses related PBE+U settings and POTCARs, but its k-point convergence does not transfer cleanly to cubic fluorite.

# Method 1: Ordinary PBE+U Convergence And Static Reference Work

The first layer of the project was ordinary PBE+U convergence and reference-state work across ceria phases. These calculations established that static electronic-structure calculations could be run and managed, but they also exposed that the identity of the electronic branch matters in reduced ceria.

The main managed calculation roots are:

```text
CeO2:
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664

Ce2O3:
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200

Ce7O12:
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629
```

Under those roots, the important ordinary workflow families are `pwcs`, `kpcs`, and `u-sweep`. Representative paths found on Bridges include:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664/runs/pwcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664/runs/kpcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664/runs/u-sweep

/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/pwcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/kpcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/u-sweep

/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/pwcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/kpcs
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/u-sweep
```

The urgent U-sweep planning note is:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/urgent-ceria-u-sweep-submission-plan.md
```

That plan targeted Ueff = 3, 4, 5, and 6 eV for CeO2, Ce2O3, and Ce7O12, with `ENCUT = 650 eV` and Gamma-centered `3 3 3` k-point meshes. It explicitly warned not to flatten Ce2O3 and Ce7O12 into one-shot jobs: those reduced phases needed the staged `ldau-magnetic-localized` recipe.

For Ce7O12, one important static reference used later as setup guidance was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/pwcs/014-MAR-27-2026-104140-pwcs-staged-ldau-magnetic-localized/ENCUT_650/final
```

That reference helped seed later OMC work, but it was not treated as proof that a released OMC state was certified.

The overall lesson from this phase was not simply "PBE+U works" or "PBE+U fails." For stoichiometric or simpler insulating cases, ordinary PBE+U statics can be clean. For reduced ceria, the calculation can converge to different local 4f branches depending on starting conditions and numerical path. That branch sensitivity is the central problem the later methods try to control.

# Method 2: Staged DFT+U Recipes For AIMD

The second layer was staged DFT+U preparation for AIMD. The idea was to use staged recipes such as `seed -> rough -> final_static`, with internal magnetic/localization seeding, then run finite-temperature AIMD for MLIP training.

The key documentation is:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ceo2-aimd-tests-may-2026.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce2o3-aimd-tests-may-2026.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-scaling-tests-may-2026.md
```

## CeO2 AIMD: Usable For Pipeline Practice, But Not Final Fluorite Evidence

The best older CeO2 AIMD candidate was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664/runs/aimd/00001-MAY-12-2026-215532-aimd-production-default-seednone-u5-650eV-gamma-ediff1e-4-temps-250-500-750-1000-rerun-from-s01
```

The May 2026 note records that it ran 250, 500, 750, and 1000 K, with 1000 ionic samples per temperature at `POTIM = 1.0 fs`, giving about 1 ps per temperature. It used `ENCUT = 650 eV`, U = 5 eV, Gamma-only sampling, `EDIFF = 1E-4`, and `NELM = 300`. The reported behavior was clean enough for Allegro/MLIP pipeline practice: temperature means were near the requested values, total-energy drift was small on the meV/atom scale, mean SCF counts were about 4.3-4.5 iterations, max SCF count was 10, and no step hit `NELM`.

However, this evidence belongs to `CeO2_mp-1018664`, the tetragonal CeO2 polymorph. It should not be used as final fluorite CeO2 training evidence for the current SHI campaign. It is evidence that the AIMD and MLIP pipeline mechanics can work for a comparatively benign CeO2 case, not evidence that the current fluorite BDM Hamiltonian is fully certified.

I also found older cluster-only CeO2 molecular-dynamics folders here:

```text
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/01-mp-1018664-CeO2/250
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/01-mp-1018664-CeO2/500
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/01-mp-1018664-CeO2/750
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/01-mp-1018664-CeO2/1000
```

Those folders contain VASP input/output filenames, but a direct Bridges check showed empty OSZICAR files and no `General timing` footer in OUTCAR for the four top-level temperature directories. The INCARs used `ENCUT = 400`, U = 5, `NSW = 2000`, `POTIM = 1.0`, Gamma-only `1 1 1`, and a large magnetic seed line. I would treat those top-level molecular-dynamics folders as early or failed setup evidence, not usable AIMD data.

## Ce2O3 AIMD: Staged Preparation Ran, But AIMD Was Not Usable

The most important Ce2O3 AIMD root is:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/aimd
```

The latest reviewed attempt was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/aimd/000003-MAY-15-2026-010500-aimd-prod-staged-ldauMagLoc-intSeed-U5-E650-gamma-T4-seg250-fullRM
```

This used staged `ldau-magnetic-localized` preparation, U = 5 eV, `ENCUT = 650 eV`, Gamma-only AIMD, target temperatures 250, 500, 750, and 1000 K, and short 250-step segments. The May 2026 analysis says the static prep stages looked mechanically calm, but the first AIMD segment failed as production evidence: severe temperature excursions, large total-energy and free-energy drift, high SCF iteration counts, several `NELM` hits, and unstable total magnetization.

The key scientific interpretation is that fixed-geometry static convergence was not the same test as AIMD stability. The electronic branch could be prepared at one geometry, but finite-temperature ionic motion pushed the calculation across magnetic/localization basins. That means the staged recipe was not robust enough to generate reduced-ceria AIMD training data.

## Ce7O12 Staged Scaling/AIMD: Evidence For State-Selection Failure

The Ce7O12 staged scaling and AIMD work is centered at:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629
```

The relevant analysis note is:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-scaling-tests-may-2026.md
```

The important scaling paths include:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/scaling/000005-MAY-18-2026-160833-scaling-smoke-staged-ldauMagLoc-intSeed-KPTS_4x4x4-pathfix
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/scaling/000007-MAY-19-2026-150258-scaling-smoke-staged-ldauMagLoc-intSeed-KPTS_3x3x3-pathfix
```

The conclusion recorded there is that different resource layouts and k-point choices reached different electronic/magnetic basins: roughly 12 muB, 6-7 muB, near-zero/negative, or about -2 muB depending on path. Some jobs had SCF resets or late instability. This is strong evidence that the problem was not merely walltime or processor count; it was electronic-state selection in reduced ceria.

I also found older cluster-only Ce7O12 molecular-dynamics scaling folders under:

```text
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/02-mp-2629-Ce7O12
```

Several of those scaling tests reached 25 ionic steps and printed `General timing`, but they were scaling/smoke calculations, not the production MLIP dataset. They should be treated as performance and stability probes.

## Verdict On Staged Recipes

The staged approach was useful because it made ordinary VASP PBE+U calculations more reproducible than a naive one-shot run, and it produced a clean CeO2 AIMD practice trajectory. But for reduced ceria, the method was too slow and too fragile for the SHI data-generation goal. It did not solve branch control robustly enough to support large AIMD campaigns across redox-active configurations.

# Method 3: Occupation Matrix Control

Occupation Matrix Control was explored because reduced ceria needs explicit control of which Ce sites carry localized 4f electrons and which f orbitals they occupy. This method used the Watson OMC patch to make VASP read an external `OCCMATRIX` when `OCCEXT = 1`.

The OMC notes are:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-omc-smoke-run-log-2026-05-26.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-omc-smoke-test-checklist.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce11o20-omc-smoke-run-log-2026-06-01.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/checklists/ceria-omc-analysis-suite-checklist.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/OMC Calculation Campaign/Ce7O12 OMC Calculation Campaign/Ce7O12 OMC Calculation Campaign Solution.md
```

The patched executable recorded in the notes is:

```text
/ocean/projects/mat260002p/clopton/software/vasp-omc-smoke-20260526/bin/vasp_std_omc_5.4.4
```

The live OMC-related run trees include:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc-production
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce11O20_poscar-local/runs/omc
```

## Ce7O12 OMC Smoke: The Constraint Worked

The first Ce7O12 OMC smoke campaign is:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke
```

The minimal one-Ce runtime smoke was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/phase4-minimal-ce-atom-occmatrix-read
```

The note records Slurm job `40996829`, completed in 19 seconds, with OUTCAR evidence that the patched executable read the external `OCCMATRIX`.

The first real Ce7O12 fixed-ion OMC-on seed was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/phase7-ce7o12-formal-f1-diag1-omc-on-fixed-ion
```

That run used a 57-atom Ce21O36 cell, with a formal 12 f1 / 9 f0 Ce-site pattern. It converged as an OMC-on preparation run, wrote restart artifacts, and preserved the imposed occupation pattern. This proved that the patched executable and `OCCMATRIX` construction could prepare a desired electronic state.

However, fixed-ion OMC-on success is not a physical energy. The OMC-on energy is diagnostic only because the occupation constraint is active.

## Ce7O12 OMC Release: Ordinary DFT+U Did Not Cleanly Retain The State

The first ordinary DFT+U release from the Ce7O12 OMC seed was:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/phase8-ce7o12-formal-f1-diag1-release-ordinary-dftu-fixed-ion
```

It removed `OCCEXT`, removed active `OCCMATRIX`, and restarted from the OMC-prepared `WAVECAR` and `CHGCAR`. The job completed, but the analysis records it as borderline and not physically usable: it reached the EDIFF marker only at `NELM = 300`, residuals remained noisy, and local f character became smeared rather than a clean retained or alternative ordered pattern. The exact intended top-12 site pattern changed almost immediately after the constraint was removed. The final release energy should not be used for physical comparison.

Additional Ce7O12 release diagnostics were run:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/phase9-rel-lorbit11-nelm500
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/010-release_diag_lorbit11_nelm500_64mpi_kpar4_ncore4
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke/011-release_diag_lorbit11_nelm500_128mpi_kpar8_ncore4
```

The local analysis summary for phase9 reports no active OMC marker, an EDIFF marker, final DAV 164, final magnetization about 12.018 muB, but only 4/12 overlap with the intended sites and broad/localization problems. Direct Bridges checks show the 64-rank and 128-rank release variants also completed with no OMC marker and EDIFF markers, but their final magnetizations and SCF histories differ. These runs are diagnostic evidence about release sensitivity, not a clean production OMC dataset.

## Ce11O20 OMC Smoke: Control Worked, Release Changed Sites

The Ce11O20 OMC smoke run is:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce11O20_poscar-local/runs/omc/000000-JUN-01-2026-ce11o20-omc-smoke
```

The OMC-on fixed-ion stage completed and imposed the requested candidate pattern. The ordinary release also completed, but the intended f1 sites were not retained: the final top Ce sites by f trace/spin trace moved from the intended set onto a different set. The note recommends further release diagnostics with `LORBIT = 11` and larger `NELM`. This again supports the conclusion that OMC can impose a state, but ordinary release and production-quality ranking remain nontrivial.

## Ce7O12 OMC Production-Style Candidate

A later, more physically serious OMC production-style path was started for Ce7O12 candidate 1:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc-production/012-cand1_diag_f2_phaseA
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc-production/013-cand1_diag_f2_phaseB
```

Stage A for candidate 1 was an OMC-on ionic relaxation, not just a fixed-ion constraint. It placed Ce3+ on sites {2, 3, 5, 6}, used `diag_f2`, kept `NUPDOWN = 4`, and relaxed under the occupation constraint. The OMC campaign solution records Stage A as complete and accepted: converged at ionic step 13/60, maximum residual force about 0.0094 eV/A, clean f moments around 0.98 muB on the intended Ce3+ sites, and no NELM exhaustion. Its energy is diagnostic only.

Stage B was staged as the ordinary DFT+U release that would produce the ranking energy, but the remote directory I checked contains only setup files such as `INCAR`, `POSCAR`, and `submit.sbatch`; I did not find `OUTCAR`, `OSZICAR`, or `vasprun.xml` there. In other words, candidate 1 Stage B appears staged but not completed in the audited state. The campaign solution also says Stage C was not yet staged and that a Phase C POSCAR-hash guard needed to be added before batching candidates.

## Verdict On OMC

OMC is scientifically promising because it can deliberately impose a Ce3+/Ce4+ and orbital pattern. The best evidence is the clean OMC-on state preparation in Ce7O12, especially the production-style Stage A relaxation where a polaronic distortion formed under the constraint.

OMC is on hold because it is operationally expensive and scientifically delicate. It requires a patched executable, external `OCCMATRIX` files, candidate-specific branch enumeration, OMC-on preparation, ordinary release, branch-retention analysis, and usually large restart files. For MLIP data generation, especially AIMD, that cost and complexity are high. OMC may remain the fallback for hard cases or benchmark branch control, but it is not the current main path.

# Method 4: Bond Distortion Method

BDM is the current active method for fluorite CeO2. The campaign is designed to test whether systematic geometry distortion plus spin/moment initialization can find the correct localized branches without occupation-matrix control.

The core BDM docs are:

```text
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/2. Bond Distortion Method CeO2.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/5. Block A Analysis and Certification.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/7. Block B Analysis and Certification.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/9. Block C Analysis and Certification.md
```

The active calculation tree is:

```text
/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5
```

## BDM Scientific Premise

The BDM campaign targets cubic fluorite CeO2 at PBE+U(5). It is motivated by the need to generate a neutral and charged defect corpus suitable for later AIMD and MLIP training, while explicitly tracking 4f branch correctness. The premise is that for ceria defect structures, especially oxygen-vacancy-derived Ce3+ localization, geometry and spin biasing may be enough to locate the correct branches. The campaign measures that premise rather than assuming it: branch-unresolved rate is treated as a campaign result.

BDM is attractive for AIMD because it uses ordinary VASP input machinery after structures are generated. It does not require an OMC-patched executable for every candidate and does not require carrying external occupation matrices through a production data workflow. That is why it is more compatible with eventual AIMD data generation, although this is still a hypothesis that has to be verified by actual defect-screening branch success rates.

## Stage 0 Block A: Convergence Passed

Block A calculations are in:

```text
/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockA
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockA
```

All ten jobs passed electronic convergence and branch checks. The accepted production choices are:

```text
ENCUT = 550 eV
bulk k-mesh = Gamma-centered 4 x 4 x 4
screening-tier Gamma-only defect supercell error estimate = about 2 meV/atom
```

The key numerical results from the analysis are:

```text
ENCUT scan at k = 4 x 4 x 4, Delta E/atom vs 650 eV:
A01 400 eV  -13.361 meV/atom
A02 450 eV   -1.309 meV/atom
A03 500 eV   +2.625 meV/atom
A04 550 eV   +2.496 meV/atom
A05 600 eV   +1.064 meV/atom
A06 650 eV    0.000 meV/atom

k-point scan at ENCUT = 600 eV, Delta E/atom vs 6 x 6 x 6:
A07 2 x 2 x 2  +2.036 meV/atom
A08 3 x 3 x 3  -0.011 meV/atom
A05 4 x 4 x 4  -0.005 meV/atom
A09 5 x 5 x 5  +0.012 meV/atom
A10 6 x 6 x 6   0.000 meV/atom
```

Block A also served as a pipeline smoke test for the BDM campaign tree, manifests, guarded submissions, and sync discipline.

## Stage 0 Block B: Bulk Geometry And Energy Mostly Passed; Dielectric Failed

Block B calculations are in:

```text
/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockB
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockB
```

B01 and B02 performed the two-step cell relaxation at high cutoff. B02 is the final bulk geometry source:

```text
B02_cellrelax2/CONTCAR
a = 5.5000979 A
d0 = a * sqrt(3) / 4 = 2.3817 A
volume = 166.38 A^3
bulk magnetization = 0.0000 muB
```

B03 is the production static at 550 eV:

```text
B03_static550
E0 = -97.303445 eV per 12-atom conventional cell
E0 = -24.325861 eV per CeO2 formula unit
bulk magnetization = 0.0000 muB
```

B04, the dielectric calculation, failed in attempt 1:

```text
B04_dielectric
```

It timed out at the 2 h walltime. The analysis records that no dielectric tensor blocks or Born effective charges were produced. More importantly, one field/displacement subsolve hit `NELM = 200` and VASP continued, proving that a clean-looking final exit would not be enough; every perturbation subsolve must be checked. The diagnosis was a non-decaying period-2 oscillation in a field-perturbed solve with the default damped orbital timestep `TIME = 0.40`.

The proposed resubmission, not yet treated here as completed, is B04r with:

```text
TIME = 0.1
NELM = 450
ISPIN = 1
MAGMOM removed
walltime = 12 h
```

Every other input should remain byte-identical to the original B04 except for those intentional changes.

## Stage 0 Block C: Reference Chemistry Passed Scientifically, But The U=5 Thermochemistry Gate Tripped

Block C calculations are in:

```text
/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockC
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockC
```

C01, the O2 molecule reference, passed:

```text
C01_O2
spin triplet, NUPDOWN = 2
d(O-O) = 1.233 A
E0(O2) = -9.8868035 eV
```

C02/C02b, the Ce metal benchmark, demonstrated a branch problem and was explicitly marked benchmark-only:

```text
C02_Ce_metal
C02b_Ce_metal_static550
```

C02 relaxed to a localized magnetic branch at 750 eV with total moment 4.62 muB and energy -20.568595 eV for the 4-atom cell. C02b then collapsed into a nonmagnetic itinerant branch at the 550 eV static surface, with energy -15.709444 eV. This made the Ce-metal formation-enthalpy benchmark void; it should not enter load-bearing chemistry.

C03/C04 tested Ce2O3 magnetic branches:

```text
C03_Ce2O3_FM
C04_Ce2O3_AFM
```

Both passed branch checks. AFM won by 1.184 meV/cell, so C05 inherited the AFM branch:

```text
C05_Ce2O3_static550
E0(Ce2O3) = -41.806962 eV
per-Ce f moments = +0.982 / -0.982 muB
gap = 2.93 eV
```

The reduction-energy gate was then evaluated:

```text
CeO2 -> 1/2 Ce2O3 + 1/4 O2
Ered = 0.5 E(Ce2O3) + 0.25 E(O2) - E(CeO2)
Ered = +0.951 eV per CeO2
```

The original acceptance band was about 1.5-2.3 eV per CeO2, so the gate tripped low. The important interpretation in the Block C analysis is that this is not a setup failure. It matches the known PBE+U behavior: U around 5 eV gives robust Ce3+/Ce4+ localization but underestimates the experimental reduction thermochemistry. The current recommendation recorded there is to keep U = 5.0 for localization physics and document the redox thermochemistry bias rather than retune U to match formation energies at the cost of the 4f physics.

## Current BDM Scope

The active BDM scope has been narrowed to intrinsic CeO2 defects, not dopant benchmarking. The campaign document describes intrinsic vacancies and interstitials in a 2 x 2 x 2 conventional fluorite supercell, using BDM/ShakeNBreak-style distortions and rattles, with Gamma-point screening and production re-relaxation of winners. Neutral-only MLIP corpus eligibility is emphasized.

The current BDM blocker is not Block A, B01-B03, or the C01/C03/C04/C05 reference branch physics. Those are largely settled. The two active decisions are:

```text
1. Whether to approve and run B04r to obtain the dielectric tensor for eFNV.
2. How to record the U = 5.0 reduction-energy gate: strict experimental-band fail vs. literature-consistent PBE+U(5) pass-with-limitation.
```

# Why BDM Is The Current Best Path

BDM is the best current path because it attacks structural metastability directly while keeping the production calculations close to ordinary VASP. It is less invasive than OMC and therefore more plausible as a route to large AIMD data generation and MLIP training.

That said, the reason for using BDM is not that it is already proven. The reason is that it gives a clean empirical test:

```text
Can geometry distortion plus spin initialization produce branch-clean Ce3+/Ce4+ states often enough for a defect corpus?
```

If the branch-unresolved rate is low, BDM becomes a practical workflow for the SHI MLIP campaign. If the branch-unresolved rate is high for particular defect classes or charge states, then OMC remains the fallback for those cases, or those cases need a more specialized branch-control workflow.

# Chronological Interpretation

The project seems to have evolved in this order.

First, ordinary PBE+U convergence and U-sweep work built the baseline Hamiltonian and revealed which combinations of ENCUT, k-points, U, and staged SCF settings could run at all. This produced useful static reference paths, especially for Ce2O3 and Ce7O12, but also showed that reduced ceria is branch-sensitive.

Second, staged recipes were tried for AIMD. This worked well enough for a CeO2 AIMD pipeline-practice trajectory, but it did not produce trusted reduced-ceria production trajectories. Ce2O3 AIMD failed quality gates quickly, and Ce7O12 scaling showed resource-layout-dependent electronic branches.

Third, OMC was explored as a stronger branch-control method. It succeeded at imposing occupation patterns and, in the production-style Ce7O12 Stage A, at relaxing a constrained polaronic geometry. But ordinary release remained delicate, and the workflow is too heavy to be the default for a broad AIMD/MLIP data-generation campaign.

Fourth, the current BDM campaign was started for fluorite CeO2 at PBE+U(5). Stage 0 has already produced clean convergence, bulk geometry, bulk energy, O2, and Ce2O3 references. It has also exposed two important limitations: the dielectric calculation needs a repaired B04r recipe, and U = 5.0 should be defended as a localization choice rather than as a thermochemistry-fit choice.

# Current Calculation Inventory For Claude

Use these paths first when checking the assertions above.

BDM campaign docs:

```text
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/2. Bond Distortion Method CeO2.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/5. Block A Analysis and Certification.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/7. Block B Analysis and Certification.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/BDM Calculation Campaign/9. Block C Analysis and Certification.md
```

BDM raw calculations:

```text
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockA
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockB
/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockC
```

Older AIMD/staged-recipe notes:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ceo2-aimd-tests-may-2026.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce2o3-aimd-tests-may-2026.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-scaling-tests-may-2026.md
```

Older AIMD/staged-recipe raw roots on Bridges:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/CeO2_mp-1018664/runs/aimd
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce2O3_mp-1182200/runs/aimd
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/aimd
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/scaling
```

Older molecular-dynamics roots found on Bridges:

```text
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/01-mp-1018664-CeO2
/ocean/projects/mat260002p/clopton/scratch/molecular_dynamics/02-mp-2629-Ce7O12
```

OMC notes and campaign docs:

```text
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce7o12-omc-smoke-run-log-2026-05-26.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/operations/test-calculations/ce11o20-omc-smoke-run-log-2026-06-01.md
/Users/gradyclopton/Projects/calc-manager/docs/planning/checklists/ceria-omc-analysis-suite-checklist.md
/Users/gradyclopton/Projects/calc-manager/docs/blackboard/Blackboard Archive/Calculation Campaigns/OMC Calculation Campaign/Ce7O12 OMC Calculation Campaign/Ce7O12 OMC Calculation Campaign Solution.md
```

OMC raw roots on Bridges:

```text
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc/000000-MAY-26-2026-ce7o12-omc-smoke
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce7O12_mp-2629/runs/omc-production
/ocean/projects/mat260002p/clopton/scratch/convergence_tests/Ce11O20_poscar-local/runs/omc/000000-JUN-01-2026-ce11o20-omc-smoke
```

# Open Decisions And Risks

The next calculation decision in the active BDM campaign is whether to run B04r with the repaired dielectric settings. Without a dielectric tensor, charged-defect eFNV corrections remain blocked.

The next scientific policy decision is how to write the U = 5.0 gate. The calculations show U = 5.0 gives clean localization in Ce2O3 and clean f0 CeO2, but it does not reproduce the experimental reduction energy. The defensible position is to keep U = 5.0 for localization and record a thermochemistry limitation, but that should be an explicit campaign decision before defect production resumes.

The main unresolved technical risk is whether BDM's geometry-plus-spin biasing will actually keep a low branch-unresolved rate across the defect suite. Stage 0 is encouraging because Ce2O3 FM/AFM branch control worked with plain `MAGMOM`, but Stage 0 is not the defect suite. The real test comes when vacancy/interstitial/charge-state pools are screened.

The older staged AIMD runs should not be folded blindly into the MLIP corpus. The CeO2 trajectory is useful for pipeline practice, but it is tetragonal `mp-1018664`, not current fluorite `mp-20194`. The Ce2O3 and Ce7O12 staged runs are diagnostic evidence of branch fragility, not production training data.

OMC should remain available as a fallback or benchmark method, but not as the default data-generation method unless BDM fails. Its strongest completed result is constrained branch preparation; its release behavior remains expensive and delicate.

# Bottom Line For The Access Proposal

The project has already demonstrated the central computational obstacle for SHI ceria modeling: redox-active ceria is not just a force-field sampling problem; it is an electronic-branch control problem. Ordinary PBE+U and staged recipes are not enough for reduced ceria AIMD at scale. OMC can impose branches but is too cumbersome to be the default MLIP data-generation strategy. BDM is the current compromise: use systematic structural distortions and spin biasing to generate branch-clean defect states with standard VASP, then use those states to build a neutral/charged defect corpus feeding AIMD and MLIP training for SHI track simulations.

The current campaign is not ready for large defect production until B04r and the U = 5.0 policy decision are closed. Once those are closed, the next decisive metric is the BDM branch-unresolved rate across the intrinsic CeO2 defect suite.
