# Slide Points — CDAC Update, March 19, 2026

---

## Slide 2: Motivation — Radiation Damage in Nuclear Materials

- Fission fragments deposit tens of MeV along nanometer-wide tracks through fuel pellets, creating defects that degrade thermal conductivity, promote swelling, and alter fission-gas retention
- The same damage processes govern long-term integrity of ceramic waste forms designed to immobilize surplus weapons-grade Pu in geological repositories
- In weapon pits, alpha decay produces 5.15 MeV alphas and 86 keV U recoils, generating Frenkel pairs, He bubbles, and transmutation products over decades
- Damage accumulation rate vs. self-healing efficiency determines whether a material retains functional properties over its required service lifetime
- Under Stockpile Stewardship, pit lifetime predictions must be made without underground testing — they rely on accelerated-aging experiments, surrogate studies, and validated computational models
- Largest uncertainty in pit lifetime estimates: void swelling thresholds, He bubble kinetics, and defect annealing rates remain poorly constrained beyond ~40 years of natural aging data

---

## Slide 3: Motivation — Ceria as Surrogate and the Redox Hypothesis

- Direct Pu experiments are constrained by radiotoxicity, proliferation controls, and specialized facility requirements
- CeO₂ is the standard non-radioactive surrogate for PuO₂: similar ionic radii (Ce⁴⁺: 0.97 Å, Pu⁴⁺: 0.96 Å), same fluorite structure (Fm3̄m), same 3+/4+ valence flexibility
- (U,Ce)O₂ and (U,Pu)O₂ show nearly identical sintering behavior, microstructure, and thermal properties above 900 K
- The most important shared property: reversible cation oxidation state change (Ce⁴⁺ ⇌ Ce³⁺ parallels Pu⁴⁺ ⇌ Pu³⁺)
- Tracy et al. (2015) irradiated ThO₂ (monovalent, no redox) and CeO₂ (multivalent) under identical SHI conditions: qualitatively different damage signatures
- ThO₂ showed energy-dependent Frenkel-pair accumulation; CeO₂ showed energy-independent coupled reduction + oxygen displacement
- Lattice expansion in CeO₂ (5.4165 → 5.4651 Å) consistent with chemical reduction, not simple thermal disorder
- If redox is a controllable knob for radiation tolerance, it could be engineered through composition/doping — a design principle for the entire fluorite nuclear ceramics family

---

## Slide 4: The Open Question

- Fluorite oxides share the same structure and similar thermomechanical properties, yet respond to SHI irradiation in strikingly different ways
- Cureton et al. (2018): CeO₂, ThO₂, UO₂ irradiated with same beams — grain-size-dependent damage accumulation differs systematically; CeO₂ forms a secondary reduced phase (Ce₁₁O₂₀) with no analog in ThO₂
- Ishikawa et al. (2013): UO₂ track sizes are consistently smaller than CeO₂ at comparable stopping powers, despite similar melting temperatures and lattice parameters
- If thermal properties alone governed tracks, these materials should behave identically — they do not
- Tracy et al. (2015): CeO₂ redox response is energy-independent (chemical mechanism), while ThO₂ damage scales with deposited energy (thermomechanical mechanism)
- Central question: Is redox chemistry an active participant in track formation, or are thermal-spike mechanics sufficient?

---

## Slide 5: Experimental Evidence — Irradiation-Induced Reduction

- Iwase et al. (2009): synchrotron XPS shows systematic Ce³⁺ increase with SHI fluence; EXAFS shows decreased Ce–O coordination — 3-5% oxygen displaced, too large for elastic interactions alone
- Ohno et al. (2008): independent XANES confirmation of Ce³⁺ formation at low dpa; electronic excitation (not knock-on) is the dominant reduction mechanism
- Costantini et al. (2017): Raman shows growth of oxygen vacancy band (~600 cm⁻¹) without loss of F₂g mode — crystal structure retained even as O sublattice becomes defective
- Takaki et al. (2014): HAADF-STEM resolves individual tracks — Ce sublattice intact, O sublattice severely disordered in 4-5 nm track core
- Consistent picture: SHI irradiation preferentially disrupts the oxygen sublattice while preserving the cation framework; oxygen vacancies are compensated by Ce⁴⁺ → Ce³⁺ reduction

---

## Slide 6: Track Morphology in CeO₂

- Yablinsky et al. (2015): STEM of 945 MeV Au tracks — continuous tracks with only modest contrast changes; fluorite lattice retained; primary signature is local density reduction and O sublattice rearrangement
- Sonoda et al. (2008): threshold electronic stopping ~15-16 keV/nm; track diameter decreases ~23% at 800°C — thermal recovery already competes with track formation at elevated T
- Yasuda et al. (2013): damage accumulation saturates at ~10¹⁶ ions/m² with 8.4 nm influence radius
- Rymzhanov et al. (2025): TREKIS + MD simulation predicts ~2 nm track core with discontinuous crystalline regions, 85% oxygen defects, 40 ps recrystallization
- Key point: current simulations use fixed-charge potentials that cannot capture redox chemistry — does adding that capability change the predictions?

---

## Slide 7: Annealing and Recovery — CeO₂ vs ThO₂ vs UO₂

- Palomares et al. (2015): in-situ synchrotron XRD in hydrothermal diamond anvil cell
  - CeO₂: two-stage recovery (E_a = 0.99 eV for O interstitial migration, 2.13 eV for Ce vacancy migration)
  - ThO₂: only single-stage recovery
  - The multivalent Ce³⁺/Ce⁴⁺ chemistry enables additional defect migration pathways unavailable in monovalent ThO₂
- Weber (1983): UO₂ has three recovery stages (E_a = 1.5, 2.2, 3.1 eV)
- Onofri et al. (2020): in-situ TEM of UO₂ annealing — progressive dislocation loop shrinkage at 500-1100°C
- Same crystal structure, different cation redox chemistry → distinct activation energy spectra and recovery kinetics
- The chemical degree of freedom controls the defect recovery landscape

---

## Slide 8: Competing Explanations — Why Not Just Thermal Spike?

- Inelastic thermal spike model: track radius depends on melting T and thermal diffusivity; successfully predicts radii in many insulators (Szenes 1996, Toulemonde et al. 2012)
- Structural flexibility hypothesis (Sickafus et al. 2000, 2007): fluorite oxides accommodate disorder through cation antisite formation without losing crystalline order
- Bond ionicity hypothesis (Trachenko et al. 2005): more ionic materials resist amorphization because they reconstruct coordination polyhedra more easily
- These explanations capture real physics — the question is whether they are complete
- If they were complete, CeO₂ and ThO₂ should respond identically (same structure, similar melting T, similar bond ionicity) — but they do not (Tracy et al. 2015)
- An additional mechanism must be operating — redox flexibility is the most obvious candidate

---

## Slide 9: The CeO₂₋ₓ Reduction Series

- CeO₂₋ₓ: x = oxygen deficiency per Ce; each vacancy leaves 2 excess electrons that localize as Ce³⁺ polarons
- Average Ce valence = 4 − 2x; Ce³⁺ fraction ≈ 2x; vacancy fraction = x/2
- Four training compositions spanning the reduction series:
  - CeO₂: x = 0, all Ce⁴⁺, fully oxidized fluorite
  - Ce₁₁O₂₀: x ≈ 0.18, ~9% O vacancy fraction
  - Ce₇O₁₂: x ≈ 0.29, ~14% O vacancy fraction, mixed-valence (Ce³⁺ + Ce⁴⁺ on distinct sites)
  - Ce₂O₃: x = 0.50, all Ce³⁺, fully reduced sesquioxide
- Reduced ceria phases appear at high T and low pO₂ — precisely the conditions encountered transiently during a thermal spike
- The MLIP must learn the distinct local coordination motifs and bonding responses across this entire spectrum

---

## Slide 10: DFT+U Calibration — Methodology

- Standard DFT fails for reduced ceria: self-interaction error causes 4f electrons to delocalize artificially instead of forming Ce³⁺ polarons
- DFT+U adds an on-site Hubbard penalty to 4f orbitals favoring integer occupation; Dudarev formulation uses single parameter U_eff = U − J
- Trade-offs in U_eff choice: optimal for lattice parameters (3-4 eV) ≠ optimal for band gap (7-8 eV); 4f localization begins at U ≈ 3 eV, maximizes at ~6 eV (Castleton et al. 2007)
- Metastability challenge: DFT+U admits multiple electronic solutions with different 4f occupation patterns — SCF can become trapped in the wrong minimum (Fabris et al. 2005)
- Requires careful initialization of occupation matrices/magnetic moments — critical for MLIP training where every configuration must be labeled from the correct ground state
- Our calibration: U_eff = 4, 5, 6 eV across CeO₂, Ce₇O₁₂, Ce₂O₃ — verify qualitative physics preserved across all three

---

## Slide 11: DFT+U Calibration — Results (CeO₂)

- CeO₂ is comparatively insensitive to U_eff across 4-6 eV range
- DOS retains expected fluorite character: O(2p) valence band, insulating gap, unoccupied Ce 4f as lowest Ce-derived feature above Fermi level
- Non-magnetic (magnetization = 0) at all U_eff — oxidized state does not spuriously localize a 4f electron
- O(2p)→Ce(4f) separation: 2.29 eV (U=4) → 2.59 eV (U=6) — modest variation
- O(2p)→Ce(5d) separation: ~5 eV, weakly U-dependent
- This weak sensitivity is helpful: CeO₂ training labels are not overly dependent on U_eff fine-tuning

---

## Slide 12: DFT+U Calibration — Results (Ce₂O₃, Ce₇O₁₂)

- Ce₂O₃: strongly spin-polarized; magnetization ≈ 1.9 μ_B (expected: 2 μ_B for two Ce³⁺ per f.u.)
- Ce₇O₁₂: magnetization ≈ 3.8 μ_B (expected: ~4 μ_B for 4 Ce³⁺ per 7 Ce atoms)
- U_eff sensitivity is much stronger in reduced phases than in CeO₂
- Ce₂O₃: O(2p)–Ce(4f) drops from 3.6 eV (U=4) to 1.76 eV (U=6) — near-gap alignment shifts substantially
- Literature benchmark (Loschen et al. 2007) confirms this hierarchy: largest U-driven variations occur where redox chemistry changes the bonding
- Occupation matrix control (Allen & Watson 2014) used to ensure reduced-phase calculations consistently reach the correct electronic ground state
- Key takeaway: the Hubbard parameter matters most precisely where the MLIP must be most accurate — in vacancy-rich, Ce³⁺-rich environments

---

## Slide 13: MLIP Training Strategy

- Core requirement: training corpus must force the model to learn distinct energetic/force responses of oxidized vs. reduced environments through geometry alone — no explicit charge variable
- Training corpus spans same four compositions: CeO₂, Ce₁₁O₂₀, Ce₇O₁₂, Ce₂O₃
- Configuration generation: homogeneous strains (elastic response), O sublattice disorder (vacancy motifs), AIMD snapshots at multiple temperatures (anharmonic motion)
- Corpus curation: remove near-duplicates by geometric similarity; balance across phases to prevent overfitting to CeO₂
- Architecture: Allegro equivariant neural network with message-passing on local neighbor graph
- Ko et al. (2021): purely local descriptors fail for charge-transfer oxides — need non-local information flow
- Zhang et al. (2023): single potential must handle Ce³⁺ and Ce⁴⁺ consistently across all defect charge states
- Stippell et al. (2024): DFT+U-trained MLIP demonstrated for UO₂ — direct methodological precedent

---

## Slide 14: TTM-MD Framework

- Two-temperature molecular dynamics: electronic subsystem as continuum temperature field coupled to explicit atomistic lattice
- SHI deposits energy as source term S_e(r,t) on electronic temperature grid; electron-phonon coupling g transfers energy to lattice
- Electronic T_e evolves under diffusion + coupling + source; lattice T_l evolves through coupling alone; MD provides microscopic defect production pathway
- Langevin rim boundary at T₀ = 300 K absorbs heat and pressure waves from the finite cell
- Polaron formation timescale in CeO₂: ~330 fs (Pelli Cresi et al. 2020) — fast enough to be relevant during the ps-timescale thermal spike
- Electron-phonon coupling g requires careful treatment in wide-gap insulators (Medvedev et al. 2023)
- Precedent for MLIP + TTM coupling: Zeng et al. (2023) demonstrated deep-learning potential + TTM for laser-driven W

---

## Slide 15: What Comes Next

- DFT+U calibration: COMPLETE — reference is physically faithful across the reduction series
- Next: generate MLIP training corpus from AIMD across all four compositions
- Train Allegro potential; validate against DFT+U benchmarks (defect formation energies, elastic constants, phonon dispersions)
- Couple validated MLIP to TTM-MD in LAMMPS for SHI track simulations
- Critical experiment: redox-capable MLIP vs. fixed-charge classical potential
  - If indistinguishable → thermal-spike null hypothesis is sufficient; redox is passive
  - If systematically different track radii/defect densities/recovery timescales → redox is an active participant
- Quantify by comparing both models against experimental data (Yablinsky 2015, Sonoda 2008) and state-of-the-art fixed-charge simulations (Rymzhanov 2025)

---

## Slide 16: Conclusion / Summary

- Established DFT+U reference across U_eff = 4-6 eV for CeO₂, Ce₇O₁₂, Ce₂O₃
- CeO₂ remains robust non-magnetic insulator; reduced phases show expected spin polarization and Ce(4f) character
- Strongest U_eff sensitivity in reduced/vacancy-rich compositions — precisely the environments dominating the track core
- This motivates training strategy spanning the full CeO₂₋ₓ reduction series with strained and high-T configurations
- Next steps: MLIP training → TTM-MD coupling → redox on/off comparison
- Foundation validated against spectral and energetic benchmarks sensitive to the chemistry this project is designed to test
