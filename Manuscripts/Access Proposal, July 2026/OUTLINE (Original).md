# Outline — Section 2.10 (Grady): Redox chemistry in swift-heavy-ion track formation in ceria

Working title for the section: **"Does redox chemistry govern swift-heavy-ion track formation in ceria? A machine-learned-potential study of CeO2"** (trim at draft time if the house style favors shorter titles).

Hard constraints from Elif (Slack, Jul 26): fully new contribution; ~3/4 page; one small, legible figure; very brief problem + previous work; concrete plans; a table for the time estimate; total request ~1.5–2 million credits; machines limited to Bridges-2 RM, Bridges-2 EM, and NCSA Delta GPU (no Bridges2-GPU); a few references; submission target next Sunday. Register: proposal for *what we want to do*, not a progress report — prior work appears only as motivation and feasibility evidence, and must not duplicate anything reported in last month's progress report (low risk: this is a new contribution, but check at merge).

---

## I. Introduction — the physical problem and the question

Flow: hook (what an SHI does to ceria) → significance (why ceria, why anyone cares) → the question (redox chemistry's role) → pointer to Figure N.

- Hook, 1–2 sentences: a swift heavy ion deposits tens of keV/nm into the electronic system; electron–phonon coupling converts this to a cylindrical thermal spike a few nm wide that melts and quenches within picoseconds, leaving an ion track. Keep the thermal-spike vocabulary here — it sets up the simulation plan in §III.
- Significance, 1–2 sentences:
  - CeO2 is the model redox-active fluorite oxide and the standard non-radioactive surrogate for PuO2/MOX fuels (Kim et al. 2008); track formation and recovery in fluorites underlie their noted radiation tolerance.
  - Experiments give the question teeth: synchrotron XAS shows Ce4+ → Ce3+ reduction in SHI-irradiated CeO2 (Ohno et al. 2008), and Tracy et al. (Nat. Commun. 2015) showed damage accumulation *couples to* the redox response — fixed-valence ThO2 damages differently than multivalent CeO2, and tolerance tracks the efficiency of the redox reaction. Correlation is established; mechanism is not. That is exactly the gap simulation can close.
- The question, stated as the section's thesis (1 sentence): does the facile Ce4+/Ce3+ redox couple materially affect how tracks form and anneal in CeO2, and by what mechanism? Atomistic simulation is the only route to the mechanism, and no existing interatomic potential for ceria treats the redox degree of freedom on equal footing with the lattice.
- Cite here (all confirmed in the vault, Papers/Ceria Radiation Chemistry and Hypothesis Anchors + Actinide Context): tracks — Sonoda et al. 2008 (track properties and accumulation) and/or Takaki et al. 2014 (atomic structure of tracks: cores retain the cation sublattice while the oxygen sublattice disorders — directly supports the redox/oxygen framing); redox evidence — Ohno et al. 2008 and Tracy et al. 2015 (the hypothesis anchor); surrogate claim — Kim et al. 2008. Figure N referenced at the end of this block. If space forces cuts, keep Tracy + one of Sonoda/Ohno.

## II. The computational obstacle and prior work

Flow: why an MLIP is mandatory → why a ceria MLIP is not routine (the f-electron problem, with our prior-allocation evidence in one breath) → the working solution and current state (feasibility).

- Scale argument, 1 sentence: a track is 10^5–10^6 atoms over ps–ns; no DFT method reaches it; the dynamics must run on a machine-learned interatomic potential (MLIP) trained on DFT reference data. Cite Allegro (already ref 18 in the document — reuse the global number).
- The obstacle, 2–3 sentences, fusing "hard problem" with "our previous work" (they are the same content here):
  - The training data must capture 4f-electron localization: reduced ceria's chemistry is carried by Ce3+ small polarons, which exist only at the DFT+U (or hybrid) level, and DFT+U admits multiple self-consistent electronic states ("branches") at fixed geometry.
  - Our prior work demonstrated this is the binding constraint, not a technicality: finite-temperature AIMD of reduced ceria is unstable to uncontrolled branch switching, and constrained-occupation methods that pin the branch, which we prototyped, are too heavy for data generation at scale. One compact sentence pair — the internal detail stays internal.
- The working solution + current state, 2 sentences (feasibility evidence, present tense):
  - We have a validated PBE+U(5.0) reference framework for fluorite CeO2 — converged basis and k-sampling, relaxed bulk geometry, reference-phase chemistry (O2, AFM Ce2O3) — and we adopt the systematic bond-distortion + rattle structure search of Mosquera-Lois et al. (ShakeNBreak) to generate branch-verified defect configurations with standard VASP machinery, following the demonstration by Das et al. that geometry- and spin-biased GGA+U converges correctly localized V_O states.
  - Every configuration passes an explicit electronic-branch check (site moments + f-occupation eigenvalues against calibrated fingerprints) before entering the dataset. One clause only — this is the quality-control differentiator, not a paragraph.
- Cite here: Mosquera-Lois et al., npj Comput. Mater. 9, 25 (2023); ShakeNBreak (JOSS 7, 4817 (2022)); Das et al., PCCP 20, 15293 (2018). Optional if space allows: Kumagai–Oba (eFNV) for charged-defect corrections.

## III. Proposed work — pipeline, then evidence architecture

Flow: four tiers in execution order, one concrete sentence each; then the evidence architecture (how the tiers combine to answer the question); close with the deliverable. This section owns Figure N.

### Pipeline

- Tier 1 — Defect ground-state dataset (Bridges-2 RM): complete the intrinsic-defect search (V_O, V_Ce, O_i, Ce_i across physical charge states) in 96-atom supercells: ~400 Γ-point screening relaxations from distorted/rattled starting points, then production re-relaxation of every distinct low-energy minimum at converged k-sampling. Outputs: ground-state and low-lying metastable configurations (Ce3+ placement patterns; O–O dimer/peroxide motifs for interstitials — the oxygen-excess chemistry a track quench will visit), eFNV-corrected formation energies, and the neutral-cell configurations that seed the training corpus. The relaxed defect geometries also calibrate the structural fingerprints used in Tier 4.
- Tier 2 — AIMD training corpus (Bridges-2 RM): ab initio MD at PBE+U across the composition range the Tier-4 series will visit — stoichiometric CeO2, reduced CeO2−x cells built from the Tier-1 vacancy ground states (2–3 reduction levels), and Ce2O3 — from 300 K through melt-relevant temperatures, plus rapid-quench trajectories to sample the disordered configurations a track interior actually visits. Branch checks applied along trajectories; snapshots relabeled at production settings. (Design point to carry into the draft: the corpus compositions are chosen so that every Tier-4 simulation is *in-domain* for the potential.)
- Tier 3 — MLIP training (NCSA Delta GPU): train an Allegro potential on the combined corpus; 2–3 active-learning generations (train → MLIP-MD exploration → select poorly-predicted configurations → DFT relabel on RM → retrain).
- Tier 4 — Track simulations (NCSA Delta GPU): thermal-spike simulations (two-temperature-model energy deposition into MLIP-MD, LAMMPS; methodology per Darkins & Duffy 2018) in 10^5–10^6-atom cells, across stopping powers spanning the experimental track-formation threshold and across the oxygen-stoichiometry/pre-damage series below; then annealing/recovery runs (experimental anchor for recovery: Palomares et al. 2015).

### Evidence architecture (how the question gets answered)

- Internal causal lever — the stoichiometry/pre-damage series: track simulations in stoichiometric CeO2, pre-reduced CeO2−x (2–3 reduction levels), and pre-damaged (track-overlap) cells, all with the single in-domain potential. Systematic dependence of track threshold, morphology, and recovery on reduction level is the causal evidence that the redox channel participates. Experimental anchors: Sonoda 2008 (accumulation effects), Rymzhanov 2025 (overlap effects).
- Mechanism — redox-linked fingerprints in the trajectories: Ce3+-like local environments identified by bond-length signatures calibrated on the Tier-1 DFT ground states (the Das elongation pattern), oxygen- vs. cation-sublattice disorder (Takaki's observation), vacancy/interstitial partitioning, peroxide/O–O motifs, and reoxidation during annealing. This is the part experiment cannot do: watch the mechanism operate in space and time.
- Credibility — validation against independent CeO2 observables the potential is never fit to: track radius vs. stopping power, track-formation threshold, Ce3+ spectroscopic signatures (Ohno), annealing recovery (Palomares).
- Novelty position, 1 clause where it fits: existing SHI-in-ceria simulations (e.g., Rymzhanov et al. 2025, TREKIS-based Monte Carlo + classical MD) use fixed-charge interatomic potentials — the redox degree of freedom this project targets is exactly what current models cannot represent.
- Claim target (drives the closing sentence of the section): redox chemistry is a *necessary mechanistic ingredient* in track formation and recovery in ceria — not "the only causal variable." Both legs of the design can return a negative (no dependence on reduction level; no fingerprints in the quench), which is what makes a positive result meaningful.
- Deliverables, 1 sentence: a mechanistic answer to the redox question; the first branch-verified, redox-aware training dataset and MLIP for fluorite CeO2, reusable for fuel-surrogate radiation-damage studies beyond this project.

## IV. Resource estimate and justification

Flow: one short benchmark-basis paragraph, then the itemized request block with explicit arithmetic (house style of §§2.1 and 2.4). Numbers below are working values — firm up at draft time; [BENCH] items need a benchmark run or a stated scaling basis before Sunday.

- Benchmark basis to state in text:
  - Static/relaxation costs anchored to our measured Bridges-2 RM timings from the current reference campaign. Scaled to 96-atom Γ-point screening relaxations: ~64 cores × 4 h ≈ **256 SUs each** [BENCH: confirm with one 96-atom V_O screening relaxation, or state as scaling estimate].
  - Production re-relaxations at 2×2×2 k: ~64 cores × 16 h ≈ **1,024 SUs each**.
  - AIMD: adopt the group's benchmarked figure for a comparable-size oxide cell, **6,144 SUs per 10 ps run** (64 cores × 96 h) [BENCH: one short fluorite AIMD segment would make this ours rather than borrowed — decide this week].
  - Relabeling single points: ~**32 SUs each** at production settings.
  - MLIP training: Allegro, ~**10 GPU-h per 5 epochs** (group precedent, §2.4), ~500 epochs per generation.
  - MLIP-MD: ~**100 GPU-h per track simulation** (10^6 atoms, ~50 ps) [BENCH: scaling estimate; state basis honestly].
- Request block (target: ~1.5M RM SUs + ~7k Delta GPU-h; check the credit conversion for Delta GPU hours via the ACCESS exchange calculator before finalizing against the 1.5–2M credit band):

| Item | Count | SUs or GPU-h each | Sub-total |
|---|---|---|---|
| **Bridges-2 RM** | | | |
| Defect screening relaxations (Γ) | 400 | 256 SUs | 102,400 SUs |
| Production re-relaxations (2×2×2 k) | 60 | 1,024 SUs | 61,440 SUs |
| AIMD: 8 compositions × 5 temperatures × 5 seeds/quenches | 200 | 6,144 SUs | 1,228,800 SUs |
| Active-learning relabeling single points | 2,000 | 32 SUs | 64,000 SUs |
| *RM sub-total* | | | **~1,456,640 SUs** |
| **NCSA Delta GPU** | | | |
| MLIP training, 3 active-learning generations | 3 × 1,000 GPU-h | | 3,000 GPU-h |
| Track simulations (stoichiometry/pre-damage series across stopping powers) | 30 | 100 GPU-h | 3,000 GPU-h |
| Annealing/recovery runs | 10 | 100 GPU-h | 1,000 GPU-h |
| *Delta sub-total* | | | **7,000 GPU-h** |

- No Bridges-2 EM request (nothing in the pipeline is memory-bound; say nothing rather than justify an absence).
- Show at least two of the multiplications inline in the text (e.g., "200 × 6,144 = 1,228,800 SUs"), matching §2.4's style.

## Figure N (one small figure)

- Recommendation: a single-row pipeline schematic, left to right: (a) defect search sketch — fluorite cell with V_O and two Ce3+, a fan of distorted trial structures collapsing to a ground state; (b) AIMD corpus — compositions × temperature axis (CeO2 → CeO2−x → Ce2O3); (c) MLIP; (d) track simulation — cylindrical thermal spike in a large cell, with the stoichiometry series indicated (three cells at increasing reduction level) and a small Ce3+-fingerprint inset. Caption of 1–2 sentences.
- Build clean (vector, matplotlib or draw.io → PDF/PNG at high DPI); "legible and nice" per Elif — no screenshots of internal plots.
- Fallback if the schematic looks busy at small size: drop panel (b) and show (a)/(d) only — search feeds simulation.

## References to add (all confirmed present in the vault; continue the document's global numbering at merge; [v] = verify volume/pages against the PDF at merge)

1. Sonoda et al., Nucl. Instrum. Methods Phys. Res. B 266, 2882 (2008) — ion-track properties and accumulation in CeO2. [v]
2. Ohno et al., Nucl. Instrum. Methods Phys. Res. B 266, 3013 (2008) — XAS evidence of Ce4+ → Ce3+ reduction under SHI irradiation. [v]
3. Tracy et al., Nat. Commun. 6, 6133 (2015) — redox response of actinide materials to highly ionizing radiation; damage accumulation coupled to cation valence variability.
4. Takaki et al., Nucl. Instrum. Methods Phys. Res. B (2014) — atomic structure of ion tracks in ceria. [v]
5. Kim et al., J. Nucl. Mater. (2008) — applicability of CeO2 as a PuO2 surrogate in MOX fuel development. [v]
6. Darkins & Duffy, Comput. Mater. Sci. 147, 145 (2018) — two-temperature molecular dynamics for radiation effects. [v]
7. Rymzhanov, Volkov, Skuratov (2025) — bulk, overlap and surface effects of swift heavy ions in CeO2 (state of the art in redox-blind SHI-ceria modeling). [v]
8. Palomares et al., J. Appl. Crystallogr. 48 (2015) — in situ defect annealing of SHI-irradiated CeO2 and ThO2. [v]
9. Mosquera-Lois, Kavanagh, Walsh, Scanlon, npj Comput. Mater. 9, 25 (2023).
10. Mosquera-Lois et al., J. Open Source Softw. 7, 4817 (2022) (ShakeNBreak).
11. Das, Nicholas, Sheldon, Qi, Phys. Chem. Chem. Phys. 20, 15293 (2018).
12. Allegro — already ref 18 in the main document; reuse the global number.
13. Optional: Kumagai & Oba, Phys. Rev. B 89, 195205 (2014) (eFNV).

Not every entry survives into 3/4 page — the section likely carries 6–8 of these. Priority order if cutting: Tracy, Sonoda or Ohno, Darkins & Duffy, Mosquera-Lois, Das, Allegro, then the rest.

## Open items before drafting

1. Decide: run the two quick benchmarks ([BENCH] items — one 96-atom screening relaxation, one short fluorite AIMD segment) or state scaling-based estimates. Benchmarks strengthen §IV materially and the screening one doubles as the campaign's first defect calculation.
2. Check the ACCESS credit conversion for Delta GPU-hours and adjust counts so the total lands inside 1.5–2M credits.
3. Build Figure N.
4. At merge: verify the [v]-flagged volumes/pages against the PDFs; renumber citations globally; confirm no overlap with last month's progress report; match the Resource Request formatting of the surrounding sections exactly.
