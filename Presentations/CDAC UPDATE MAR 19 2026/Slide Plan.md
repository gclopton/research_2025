# CDAC Update — Slide Plan
## Multiscale Modeling of Swift Heavy-Ion Track Formation in Redox Active Materials
### March 19, 2026 — 20 minute talk

---

## Slide 1: Title Slide

---

## Slide 2: Motivation (NNSA / Applied Context)
*Pending literature search results. Framing: stockpile stewardship, pit aging, ceramic waste forms, ceria as PuO₂ surrogate.*

---

## Slide 3: Motivation (Scientific)
*Why does redox chemistry matter for radiation damage? Broader significance.*

---

## Slide 4: The Open Question
*Fluorite oxides with different redox flexibility respond differently to the same SHI irradiation. Is redox chemistry an active participant in track formation, or are thermal-spike mechanics alone sufficient?*

**Key papers:**
- Tracy et al 2015 (Nature Materials) — Irradiates ThO₂ (no redox) vs CeO₂ (redox-active) with same beams. ThO₂ shows energy-dependent Frenkel-pair damage; CeO₂ shows energy-independent coupled reduction + oxygen loss. Directly proves redox is not passive.
- Cureton et al 2018 (Acta Mater.) — Head-to-head CeO₂/ThO₂/UO₂. Grain-size effects differ across the three; CeO₂ forms a secondary reduced phase (Ce₁₁O₂₀) under irradiation.
- Ishikawa et al 2013 (NIMB) — UO₂ tracks are smaller than CeO₂ tracks at the same stopping power, despite similar structure and thermal properties. Points at chemistry as the missing variable.

---

## Slide 5: Experimental Evidence — Irradiation-Induced Reduction
*Direct spectroscopic evidence that SHI irradiation reduces Ce⁴⁺ → Ce³⁺ and displaces oxygen.*

**Key papers:**
- Iwase et al 2009 (NIMB) — XPS quantifying Ce³⁺ formation + EXAFS showing decreased Ce-O coordination with fluence. 3-5% oxygen displaced — too large for elastic interactions alone.
- Ohno et al 2008 (NIMB) — Independent EXAFS/XPS confirmation at low dpa, confirming electronic excitation (not knock-on) as the dominant mechanism.
- Costantini et al 2017 (J. Appl. Phys.) — Raman showing oxygen vacancy band at ~600 cm⁻¹ without amorphization.
- Takaki et al 2014 (NIMB) — HAADF-STEM showing Ce sublattice retained but O sublattice severely disordered in 4-5 nm track core. Atomic-scale evidence that the oxygen sublattice is preferentially disrupted.

---

## Slide 6: Track Morphology in CeO₂
*What do tracks actually look like? Crystalline, underdense, oxygen-disordered cores.*

**Key papers:**
- Yablinsky et al 2015 (J. Mater. Res.) — Comprehensive STEM characterization of 945 MeV Au tracks. Limited disorder despite extreme thermal transients.
- Sonoda et al 2008 (NIMB) — Threshold electronic stopping 15-16 keV/nm; track diameter decreases ~23% at 800°C.
- Yasuda et al 2013 (NIMB) — Depth-dependent microstructure; track accumulation saturates at 10¹⁶ ions/m² with 8.4 nm influence radius.
- Rymzhanov et al 2025 (J. Nucl. Mater.) — Recent TREKIS+MD simulation: track core ~2 nm discontinuous crystalline regions, 85% oxygen defects, 40 ps recrystallization.

---

## Slide 7: Annealing and Recovery — CeO₂ vs ThO₂ vs UO₂
*How damage recovers, and how recovery mechanisms differ with redox chemistry.*

**Key papers:**
- Palomares et al 2015 (J. Appl. Cryst.) — In-situ synchrotron XRD: CeO₂ has two-stage recovery (0.99 eV and 2.13 eV activation energies, attributed to O-interstitial and Ce-vacancy migration). ThO₂ has only single-stage recovery. The multivalent Ce³⁺/Ce⁴⁺ enables more complex recovery pathways.
- Weber 1983 (J. Nucl. Mater.) — UO₂ has three recovery stages (1.5, 2.2, 3.1 eV). Baseline for comparison.
- Onofri et al 2020 (Acta Mater.) — In-situ TEM of UO₂ annealing: dislocation recovery at 500-1100°C.

---

## Slide 8: Competing Explanations — Why Not Just Thermal Spike?
*The thermal-spike model works well for many materials. What does it miss for CeO₂?*

**Key papers:**
- Szenes 1996, 2020 (NIMB; Radiat. Eff.) — Classic thermal spike: track radius depends only on melting temperature. Works for many insulators. But Szenes 2020 shows track sizes follow a universal relation which CeO₂ deviates from.
- Toulemonde et al 2012 (NIMB) — Inelastic thermal spike model: distinguishes amorphizable vs non-amorphizable materials. CeO₂ stays crystalline.
- Sickafus et al 2000, 2007 (Science; Nature Materials) — Structural flexibility / order-disorder as a radiation tolerance mechanism. Important alternative to redox: maybe CeO₂ is radiation tolerant because of structural flexibility, not redox flexibility.
- Trachenko et al 2005 (Phys. Rev. B) — Bond ionicity as predictor of amorphization resistance. Non-redox framework.

---

## Slide 9: The CeO₂₋ₓ Reduction Series
*Stoichiometric framework: how oxygen vacancies create Ce³⁺, the four compositions in the training set (CeO₂, Ce₁₁O₂₀, Ce₇O₁₂, Ce₂O₃).*

**Key papers:**
- Tuller & Nowick 1979 (J. Electrochem. Soc.) — Foundational defect chemistry of reduced ceria.
- Mogensen et al 2000 (Solid State Ionics) — Comprehensive ceria defect chemistry review.
- Nolan et al 2006 (Solid State Ionics) — DFT+U vacancy formation/migration barriers.
- Ricken et al 1984 (J. Solid State Chem.) — Phase diagram of nonstoichiometric CeO₂₋ₓ. Pre-melting phase behavior in reduced ceria.

---

## Slide 10: DFT+U Calibration — Methodology
*Why DFT+U, what U_eff controls, and the metastability challenge.*

**Key papers:**
- Dudarev et al 1998 (Phys. Rev. B) — The simplified rotationally-invariant DFT+U formulation (U_eff = U − J). The standard used in all your calculations.
- Fabris et al 2005 (Phys. Rev. B) — Identifies the metastability crisis in ceria DFT+U: multiple competing local minima with different 4f occupations. Proposes Wannier-function solution.
- Castleton et al 2007 (J. Chem. Phys.) — Systematic U-parameter study showing trade-offs: optimal U differs for structure (3-4 eV) vs electronic structure (7-8 eV). Localization begins at U≈3 eV, maximizes at ~6 eV.
- Cococcioni & de Gironcoli 2005 (Phys. Rev. B) — Linear response approach to calculating U from first principles.

---

## Slide 11: DFT+U Calibration — Results (CeO₂)
*DOS, band alignments, zero magnetization confirming robust insulating fluorite. O(2p)–Ce(4f) and O(2p)–Ce(5d) separations weakly sensitive to U_eff in the oxidized phase.*

**Key papers:**
- Loschen et al 2007 (Phys. Rev. B 75, 035115) — Primary benchmark. Maps all relevant band separations vs U_eff for CeO₂ and Ce₂O₃.

---

## Slide 12: DFT+U Calibration — Results (Reduced Phases: Ce₂O₃, Ce₇O₁₂)
*Spin polarization, near-gap Ce(4f) weight, and the stronger U_eff sensitivity in reduced phases. The Hubbard parameter matters most where redox chemistry changes the bonding.*

**Key papers:**
- Loschen et al 2007 (Phys. Rev. B 75, 035115) — Again the primary benchmark for Ce₂O₃.
- Allen & Watson 2014 (PCCP) — Occupation matrix control for handling metastable states. Directly relevant to how you controlled 4f localization in reduced phases.

---

## Slide 13: MLIP Training Strategy
*Why sample the full reduction series rather than just CeO₂. The Allegro architecture. Dataset requirements.*

**Key papers:**
- Ko et al 2021 (Nature Comms.) — 4G-HDNNP showing that purely local descriptors fail for charge-transfer oxides. Motivates why message-passing architectures are needed for redox-active systems.
- Bernstein et al 2019 (npj Comput. Mater.) — Automated diversity-based sampling for training corpus construction.
- Zhang et al 2023 (Chem. Mater.) — Shell-model IP for CeO₂ using QM/MM reference data across all defect charge states. Shows a single potential must handle Ce³⁺ and Ce⁴⁺ consistently.
- Stippell et al 2024 — Building a DFT+U MLIP for UO₂. Direct methodological precedent.

---

## Slide 14: TTM-MD Framework
*Two-temperature equations, coupling to atomistic lattice, Langevin rim boundary condition.*

**Key papers:**
- Darkins & Duffy 2018 (Comput. Mater. Sci.) — Comprehensive 2T-MD framework reference.
- Zeng et al 2023 (npj Comput. Mater.) — TTM + deep-learning potential for laser-driven W. Precedent for MLIP+TTM coupling.
- Pelli Cresi et al 2020 (J. Phys. Chem. Lett.) — Ultrafast polaron formation in CeO₂ on 330 fs timescale. Ce⁴⁺→Ce³⁺ transitions happen fast enough to be relevant during the thermal spike.
- Medvedev et al 2023 (Phys. Rev. B) — Temperature-dependent electron-phonon coupling g(T_e) in semiconductors. Key parameter for TTM equations in nonmetals like ceria.

---

## Slide 15: What Comes Next
*MLIP training → validation → TTM-MD production → the "redox on vs off" comparison experiment → track descriptors to extract.*

**Key papers:**
- Garrido et al 2009 (NIMB) — Thermal-spike null hypothesis baseline. The "redox off" comparison tests against this.
- Rymzhanov et al 2025 (J. Nucl. Mater.) — Current state-of-the-art CeO₂ track simulation (fixed-charge potential). Your work goes beyond this by adding redox capability.

---

## Slide 16: Conclusion / Summary
*Recap: DFT+U calibration complete, confirms the reference is physically faithful across the reduction series. Next steps: MLIP training → TTM-MD → test whether redox chemistry modulates track formation.*

---

## Slide 17: Acknowledgments / Funding
