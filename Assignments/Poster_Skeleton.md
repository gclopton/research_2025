# Poster skeleton (work in progress)

## Title (one line)
Write a specific, claim-shaped title that names (i) SHI latent tracks, (ii) ceria/redox/nonstoichiometry, and (iii) the modeling stack (SRIM → TTM → TTM-MD) so the audience immediately knows what you built and what you are testing.

## Authors + affiliations
List authors, group/lab, institution(s), and (if appropriate) program/center. Add a one-line acknowledgment of facility/funding constraints if that context matters for why ceria is used as a surrogate.

## 30-second takeaway (top-right box)
State, in two sentences, what the poster contributes *right now* even if production track results are not finalized. Sentence 1: the scientific question and why it matters. Sentence 2: the deliverable you have in hand (a constrained forcing + calibrated/verified transport + an analysis plan for redox-enabled vs redox-frozen comparisons).

## Motivation / relevance
Explain why swift-heavy-ion (SHI) tracks matter in fluorite oxides (thermal transport, swelling/stress, microstructural stability), and why systematic mechanism work is hard in actinide fuels. Then justify ceria as a surrogate that is similar in structure/thermomechanics but distinct in oxygen sublattice activity and multivalency.

## Open problem
State the “what we still don’t know” in one paragraph. Emphasize the conditions dependence: tracks can show core–shell morphology and oxygen disorder, and some probes suggest partial \( \mathrm{Ce}^{4+}\rightarrow\mathrm{Ce}^{3+} \) reduction, but the role of redox during formation and early recovery is not settled across irradiation conditions and measurement modalities.

## Research question

Under physically constrained SHI forcing and verified electron-lattice transport (same $S(r, t)$ and TTM parameters), when-across ceria stoichiometry/nonstoichiometry and irradiation-condition space- [<- that's seems a little rediculously verbose for a poster. Also you use a lot of uneccessary adjectives like verified electron-lattice transport; it will make people think you don't know what you're talking about if your post looks like a word salad] does enabling redox/nonstoichiometry in the interaction model produce significant changes in latent-track morphology and early recovery, relative to redox-frozen/fixed-charge descriptions run under the identical protocol [we are testing both classical potentials and MLIPs, right? And this sentence encapsulates that?]

## Hypothesis (mechanism-level)
Write one sentence that makes a mechanism claim: redox flexibility and oxygen nonstoichiometry are not only byproducts of the spike, but pathways that modify defect energetics, oxygen redistribution, and recovery kinetics, thereby reshaping latent-track observables.

## Approach overview (single schematic)
Insert a workflow figure that runs left-to-right: SRIM stopping \(\rightarrow\) normalized deposition \(S(r,t)\) \(\rightarrow\) cylindrical TTM/i-TS calibration/verification \(\rightarrow\) LAMMPS TTM-MD production \(\rightarrow\) analysis of track metrics and redox signatures. Add a caption that promises “physically constrained forcing, verified transport, controlled comparisons.”

[Figure A placeholder: pipeline schematic.]

## Forcing inputs: SRIM and deposition model
Describe what you compute from SRIM (e.g., \(S_e(z)\), \(S_n(z)\), projected range/straggling) and what you reduce it to for the modeled segment (e.g., an effective \(S_e^{*}\)). Then define your deposition family \(S(r,t)\), including the explicit width parameter \(r_0\), any tail model choice, and the time scale used for deposition.

Include the normalization constraint as a “credibility anchor,” and state that the *same* discretized \(S(r,t)\) is used in both the reference cylindrical solver and the LAMMPS coupling so that verification is meaningful:
\[
\int_0^{\infty} 2 \pi r\,dr \int_{-\infty}^{\infty} S(r,t)\,dt = S_e^{*}.
\]

[Figure B placeholder: example \(S(r)\) profiles for different \(r_0\) and tail choices, with normalization indicated.]

## Transport layer: cylindrical TTM / i-TS calibration and verification
State the purpose of the cylindrical TTM/i-TS solver: to provide a reference solution for \(T_e(r,t)\) and \(T_l(r,t)\) under the prescribed \(S(r,t)\), and to constrain/verify the parameterization \(\{C_e(T_e),\kappa_e(T_e),g(T_e,T_l)\}\) before you interpret atomistic track outcomes.

Describe the verification check you will show on the poster even if full track metrics are pending: a comparison of radial temperature envelopes (peak \(T_l(r,t)\), time-to-peak, cooling rates, radial decay) between the reference solver and LAMMPS under matched inputs, with atomic structural evolution suppressed or minimized where appropriate so the comparison isolates the transport/coupling implementation.

[Figure C placeholder: overlaid \(T_l(r,t)\) or selected time-slices \(T_l(r)\) from cylindrical solver vs LAMMPS verification case.]

## Atomistic production: LAMMPS TTM-MD setup
Give a short description of the production geometry philosophy: large, bulk-like periodic cells; boundary/sink regions placed far enough from the track axis to avoid artificial quenching of the heat-affected zone; and a systematic finite-size / sink-placement sensitivity study to show that track-defining observables are stable to further increases in size or boundary treatment changes.

[Figure D placeholder: simulation cell cross-section showing track axis, heat-affected zone radius concept, sink/thermostat region placement.]

## Materials / composition ladder
List (in prose) the compositions you will compare and what role each plays in the story: \( \mathrm{CeO_2} \) as oxidized baseline, ordered-vacancy reduced phases \( \mathrm{Ce_{11}O_{20}} \) and \( \mathrm{Ce_7O_{12}} \) as intermediate redox states, and \( \mathrm{Ce_2O_3} \) as a strongly reduced endpoint for validation or long-time/overlap outcomes.

## Interaction models (controlled comparisons)
Explain the design principle: run the same TTM forcing and protocol across multiple interaction models to separate “physics of forcing/transport” from “chemistry of the interaction model.” Mention your baselines (rigid-ion Buckingham–Coulomb with stabilization; reactive/charge-equilibrated ReaxFF for ceria/reduced ceria) and the MLIP plan (Allegro for scalable track runs; charge-equilibrated NN potential such as 4G-HDNNP + iterative QEq via n2p2 for explicit charge redistribution), with DFT(+U) labels from VASP.

## Observables: what you will measure (and why)
Define the track metrics you will report, and tie each to a physical interpretation. Include core and shell radii (morphology), radial disorder profiles and density deficit (swelling proxy), radial oxygen nonstoichiometry \(\delta(r)\), defect/vacancy populations and clustering statistics, and early-time relaxation indicators. State clearly which metrics are used to define “track radius” and how you avoid boundary contamination in those definitions.

## Redox signatures: how you will quantify chemistry
State what constitutes “redox evidence” inside your model stack. For charge-equilibrated models, note charge-based metrics; for local MLIPs, note what DFT-calibrated oxidation-state inference you will use if required. Be explicit about what you can and cannot claim from each model class so the audience trusts the comparison.

## Status (as of Feb 18, 2026)
Write a short, honest status paragraph that separates (i) completed scaffolding validation (forcing inputs specified; normalization checks; transport verification plan), (ii) in-progress production runs and sensitivity studies (geometry/sink justification), and (iii) upcoming analysis milestones (first pass track metrics across the composition ladder and model classes). This is the section that replaces “final results” while still demonstrating momentum.

## Preliminary outputs you can show even without “final results”
Describe (in one paragraph) the “evidence of traction” plots that are acceptable and useful at a conference: one verified transport overlay (Figure C), one geometry/sink sensitivity summary plot, and one example of how a track metric is computed from a snapshot (definition figure). Keep claims modest and label everything clearly as verification, sensitivity, or demonstration.

## What would falsify the hypothesis?
Add one paragraph that names concrete outcomes that would change your mind, such as “track metrics are unchanged across redox-capable versus redox-frozen models under matched forcing,” or “\(\delta(r)\) signatures do not correlate with morphology once boundary artifacts are controlled.” This makes the poster look rigorous rather than salesy.

## Impact / why this matters
Write a paragraph that connects your end-to-end framework to the practical value: credible model-based interpretation of SHI track observables in redox-active fluorite oxides, and a reusable protocol for separating forcing/transport choices from chemistry choices.

## Acknowledgments
Funding/program, collaborators, and any software/facility acknowledgments (SRIM, LAMMPS, VASP, clusters).

## Contact / QR
Provide an email and (optionally) a QR code linking to a short project page or a repository folder of non-sensitive artifacts (figures, parameter table, references). If you include a QR, add a caption that says exactly what it links to.

