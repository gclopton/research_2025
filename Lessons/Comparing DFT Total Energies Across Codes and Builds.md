**Lesson from the BDM oxygen-vacancy campaign, August 2026.** A relative energy quoted in the analysis silently subtracted a total energy computed with VASP 6.1.2 from one computed with VASP 5.4.4. This document records why that subtraction is invalid, how the situation arose, how it was caught, and the working rules that prevent it. Written for review after the Aug 25 meeting; the incident details live in the campaign log and doc 14 of the BDM campaign folder.

# What happened

The campaign ran its three tiers on two clusters. The screening relaxations ran on Bridges, whose VASP module is 6.1.2. The final 2×2×2 relaxations were submitted to both clusters as a queue race; only the Campus Cluster jobs ran, and Campus loads VASP 5.4.4. The analysis then reported that the k-point refinement lowered the total energies by 0.140–0.158 eV per cell. That statement subtracts a Bridges 6.1.2 screening energy from a Campus 5.4.4 final energy, so the quoted shift is the k-point effect plus an unmeasured constant offset between the two builds. No one chose to compare builds; the comparison happened because each tier inherited whichever cluster ran it.

# Why a DFT total energy is not an observable

A plane-wave DFT total energy contains contributions whose bookkeeping is a convention of the code, not a property of the material. In the PAW method the energy is assembled from valence terms plus atomic reference and core contributions, and the code chooses how these are grouped, tabulated, and referenced. Different codes place the zero in very different places: nobody compares a VASP total energy with a Quantum ESPRESSO total energy, because they differ by enormous amounts. Different builds of the same code are the subtle version of the same fact. Implementation changes between versions shift the assembled total by a small constant for the same physical state — small enough that the numbers look comparable, which is exactly what makes the mistake easy.

What is physical is everything that survives the subtraction of that constant: energy differences between states computed with the same build, forces, geometries, charge and magnetization densities, site moments, and occupation matrices. Two builds of VASP describe the same physics — in this campaign both produced the same polaron states with the same 0.97-class occupation eigenvalues — but they report totals against slightly different zeros. The working picture is two lab scales with different tare offsets: differences taken on one scale are exact; a raw reading from one scale minus a raw reading from the other measures the tare, not the objects.

# The rule

Subtract only within a build. Any quantity formed as a difference of total energies — relative stability, an energy landscape, a formation energy, a convergence shift, an acceptance test against a parent calculation — requires every term to come from the same code version and build. Structures, converged electronic states, moments, densities, and occupation matrices transfer freely across builds, so a tier may hand its geometries to a tier on another machine without harm. The contamination begins only where numbers from the two sides meet in a subtraction.

Applied to a multi-tier campaign: each tier must be internally single-build, and every cross-tier energy comparison must either be within-build or carry the measured offset. Handing structures across tiers is safe. Handing energies across tiers is not.

# How it was caught

During setup review of statics that were being duplicated onto the second cluster, the planned acceptance test — final energy within 1 meV of the parent — forced the question of whether the two energies were comparable at all. Reading the OUTCAR headers answered it: 6.1.2 on one cluster, 5.4.4 on the other. The general lesson inside the specific one: a precise acceptance criterion surfaces hidden assumptions, because it forces the comparison to be stated exactly before it is made.

# Guards now in place, and repairs

The final tier is uniformly 5.4.4, so every within-tier result stands. The k-shift sentence carries the unmeasured offset and is treated as a caveat; the planned repair is a single calibration job — one already-converged configuration rerun once on the other build — whose energy difference measures the offset directly. The formation-energy assembly must not mix the Bridges Stage 0 reference energies with Campus defect energies; the planned repair is rerunning the small reference calculations on Campus. Statics that run on the 6.1.2 cluster are accepted by state evidence (site, moment, occupation eigenvalues) instead of the energy test. A proposed campaign-checklist line — record the VASP build on both machines before a tier changes clusters — is pending approval in doc B.

# Questions to work through on revisit

How large are typical total-energy offsets between adjacent VASP versions for identical inputs, and what implementation changes produce them. Whether POTCAR files being byte-identical guarantees anything about the assembled total (it does not; the assembly convention lives in the code). What the measured offset from the calibration job turns out to be, and whether it is constant across the row's charge states as the constant-tare picture predicts.
