
Here’s the paper checklist, organized by priority and with the exact reason each paper matters.

# Tier 1 — highest priority

- [x] Yablinsky, Devanathan, Pakarinen et al. 2015, Journal of Materials Research 30, 1473  
    Topic: 940 MeV Au irradiation / high-(S_e) CeO(2) MD study.  
    Needed for: Quantitative CeO(_2) SHI validation targets.  
    Pull details: MD potential, thermal-spike implementation, radial energy profile, time scales, defect counts, cluster sizes, density-change metrics, and defect-identification method.  
    Paper: [[Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Section 4: Track Morphology and Annealing in CeO2 (Experiment + Simulation)/markdown_originals/Yablinsky et al 2015 - Characterization of swift heavy ion irradiation damage in ceria/Yablinsky et al 2015 - Characterization of swift heavy ion irradiation damage in ceria.md|Markdown]]
	    
- [x] Pakarinen et al. 2024, Journal of Nuclear Materials, “Bulk, overlap and surface effects of swift heavy ions in CeO(2)”  
    Topic: TREKIS+MD / modern CeO(_2) SHI track modeling.  
    Needed for: Closest modern analog to your project.  
    Pull details: Source coupling, cell sizes, surface vs bulk setup, overlap protocol, track-discontinuity metrics, defect analytics, and reported track morphology.  
    Paper: [[Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Section 4: Track Morphology and Annealing in CeO2 (Experiment + Simulation)/markdown_originals/Rymzhanov et al 2025 - Bulk, overlap and surface effects of swift heavy ions in CeO2/Rymzhanov et al 2025 - Bulk, overlap and surface effects of swift heavy ions in CeO2.md|Markdown]]  
    Vault note: Found under Rymzhanov et al. 2025; the title and Journal of Nuclear Materials paper match.
	    
- [x] Kümmerle & Heger 1999, Journal of Solid State Chemistry 147, 485  
    Topic: Structural determination of Ce({11})O({20}) and Ce(7)O({12}).  
    Needed for: Building reduced-ceria phase structures correctly.  
    Pull details: Atomic positions, space groups, lattice parameters, vacancy-ordering geometry, and any alternative structural settings.  
    Paper: [[Papers/DFT + U Reference Data and MLIP Training/Section 6: MLIP Validation Targets for Ceria Redox Chemistry/markdown_originals/Kummerle and Heger 1999 - The Structures of C-Ce2O3+d, Ce7O12, and Ce11O20/Kummerle and Heger 1999 - The Structures of C-Ce2O3+d, Ce7O12, and Ce11O20.md|Markdown]]
	    
- [x] Primary Toulemonde i-TS reference for oxides  
    Likely target: Toulemonde, Dufour & Paumier long i-TS paper, or the 2006 Matematisk-fysiske Meddelelser chapter on amorphisable insulators.  
    Topic: Inelastic thermal spike parameters for oxides.  
    Needed for: Defensible (g), (C_e), and (\kappa_e) starting values.  
    Pull details: Calibrated parameters for SiO(2), Y(_2)O(_3), or other analogous oxides; model equations; boundary assumptions; parameter-fitting logic.  
    Paper: [[Papers/Computational Architecture/Phase 0 Foundations and Model Taxonomy/Reviews and Landscape Maps/markdown_originals/Toulemonde et al 2006 - Experimental phenomena and thermal spike model description of ion tracks in amorphisable inorganic insulators/Toulemonde et al 2006 - Experimental phenomena and thermal spike model description of ion tracks in amorphisable inorganic insulators.md|Markdown]]
    

# Tier 2 — important specificity

- [x] Costantini et al. 2017, Journal of Applied Physics 122, 205901  
    Topic: Raman spectroscopy of SHI-irradiated CeO(2).  
    Needed for: Experimental qualitative validation of oxygen disorder and damage metrics.  
    Pull details: Raman modes, especially F({2g}); fluence dependence; peak broadening, shifting, weakening; relation to (S_e) and disorder.  
    Paper: [[Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Section 2: Irradiation-Induced Reduction in Ceria (Experimental Evidence)/markdown_originals/Costantini et al 2017 - Raman spectroscopy study of damage induced in cerium dioxide by swift heavy ion irradiations/Costantini et al 2017 - Raman spectroscopy study of damage induced in cerium dioxide by swift heavy ion irradiations.md|Markdown]]
	    
- [x] Cureton, Tracy, Lang et al. 2021, Quantum Beam Science 5, 19, “Review of Swift Heavy Ion Irradiation Effects in CeO(2)”  
    Topic: Review of CeO(_2) SHI irradiation literature.  
    Needed for: Cross-checking the validation targets against the broader field.  
    Pull details: Summary of track formation thresholds, defect accumulation, experimental observables, and unresolved modeling issues.  
    Paper: [[Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Section 5: Competing Mechanisms and Non-Redox Controls/markdown_originals/Cureton et al 2021 - Review of Swift Heavy Ion Irradiation Effects in CeO2/Cureton et al 2021 - Review of Swift Heavy Ion Irradiation Effects in CeO2.md|Markdown]]
	    
- [x] Musaelian, Johansson, Batatia et al. 2023, Nature Communications, Allegro paper  
    Topic: Allegro architecture and hyperparameter guidance.  
    Needed for: Grounding MLIP architecture choices.  
    Pull details: Cutoff radius choices, (\ell_{\max}), number of layers, tensor-product structure, accuracy/cost tradeoffs, and scaling claims.  
    Paper: [[Papers/Computational Architecture/Phase 6D-iv: Performance, scaling, and practical tradeoffs/markdown_originals/Musaelian et al 2023 - Learning local equivariant representations for large-scale atomistic dynamics/Musaelian et al 2023 - Learning local equivariant representations for large-scale atomistic dynamics.md|Markdown]]
    
- [ ] Palomares, Lang, Ewing et al. 2017, Journal of Materials Chemistry A, “Defect accumulation in swift heavy ion-irradiated CeO(2) and ThO(_2)”  
    Topic: Experimental defect accumulation under SHI fluence.  
    Needed for: CeO(_2) ion-sweep validation.  
    Pull details: Defect accumulation versus fluence, comparison with ThO(_2), saturation behavior, and experimental damage metrics.
    

# Tier 3 — useful but not essential

- [ ] Devanathan standalone CeO(2) MD methodology papers  
    Possible title mentioned: “Molecular Dynamics Simulation of Fission Fragment Damage in Nuclear Fuel and Surrogate Material,” _MRS Advances 2017.  
    Topic: CeO(2) MD methodology behind or related to Yablinsky-style simulations.  
    Needed for: Filling in methodological details if the 2015 paper cites them elsewhere.  
    Pull details: Potential parameters, defect analysis methods, thermal-spike setup, simulation cell construction, and validation conventions.
    
- [x] Any liquid CeO(2), molten CeO(_2), high-temperature CeO(_2), or first-principles AIMD paper  
    Topic: Behavior of CeO(_2) near melting or in highly disordered liquid-like regimes.  
    Needed for: Bounding how aggressive the DFT+U/AIMD training envelope can be.  
    Pull details: Temperature range, PBE+U behavior, structural stability, oxygen disorder, Ce coordination, and whether the method remains physically meaningful near/above melting.  
    Papers: [[Papers/DFT + U Reference Data and MLIP Training/Section 6: MLIP Validation Targets for Ceria Redox Chemistry/markdown_originals/Manara et al 2021 - Infrared laser absorption and melting behaviour of nano-sized cerium dioxide; A laser heating study/Manara et al 2021 - Infrared laser absorption and melting behaviour of nano-sized cerium dioxide; A laser heating study.md|Manara 2021 Markdown]], [[Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Section 3: Defect Chemistry and Oxygen Transport in Reduced Ceria/markdown_originals/Yashima et al 2003 - High-temperature neutron powder diffraction study of cerium dioxide CeO2 up to 1770 K/Yashima et al 2003 - High-temperature neutron powder diffraction study of cerium dioxide CeO2 up to 1770 K.md|Yashima 2003 Markdown]]
	    
- [x] Loschen et al. 2007, Physical Review B 75, 035115  
    Topic: DFT+U treatment of ceria.  
    Needed for: Justifying (U=5.0) eV or nearby values.  
    Pull details: Chosen (U), treatment of Ce (4f) states, lattice constants, band gaps, vacancy energetics, Ce(^{3+})/Ce(^{4+}) localization behavior.  
    Paper: [[Papers/DFT + U Reference Data and MLIP Training/Section 1: DFT+U Methodology for f-Electron Oxides (Metastability, Convergence, Branch Control)/markdown_originals/Loschen et al 2007 - First-principles LDA+U and GGA+U study of cerium oxides; Dependence on the effective U parameter/Loschen et al 2007 - First-principles LDA+U and GGA+U study of cerium oxides; Dependence on the effective U parameter.md|Markdown]]
    
