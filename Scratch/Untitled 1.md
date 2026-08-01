

**1. Why is it harder to build a track-formation potential for ceria than for SiO2?**

- Tracy et al. (2015), _Phase transformations in Ln2O3 materials irradiated with swift heavy ions_. This is the strongest experimental anchor that radiation response in ceria-family oxides is redox-coupled, not just a passive thermal-spike problem.
- Iwase et al. (2009), _Study on the behavior of oxygen atoms in swift heavy ion irradiated CeO2 by means of synchrotron radiation X-ray photoelectron spectroscopy_. Direct evidence that SHI irradiation drives Ce4+ -> Ce3+ reduction in ceria.
- Ohno et al. (2008), _Study on effects of swift heavy ion irradiation in cerium dioxide using synchrotron radiation X-ray absorption spectroscopy_. Bulk-sensitive XANES/EXAFS evidence for irradiation-induced valence and local-structure changes in ceria.
- Costantini et al. (2017), _Raman spectroscopy study of damage induced in cerium dioxide by swift heavy ion irradiations_. Connects SHI damage in ceria to vacancy formation and defect signatures, not just generic heating.
- Tuller and Nowick (1979), _Defect Structure and Electrical Properties of Nonstoichiometric CeO2 Single Crystals_. Foundational paper for the nonstoichiometric defect chemistry that a ceria potential must capture.
- Mogensen et al. (2000), _Physical, chemical and electrochemical properties of pure and doped ceria_. Broad review of the coupled vacancy, electronic, and transport physics that make ceria much richer than a simpler network oxide.
- Tuller and Nowick (1977), _Small polaron electron transport in reduced CeO2 single crystals_. Key paper on Ce3+ small-polaron hopping, which is exactly the kind of electronic-structure-coupled behavior that simple track potentials miss.
- Nolan et al. (2006), _Oxygen vacancy formation and migration in ceria_. Standard DFT+U benchmark showing that vacancy energetics and migration are central observables in ceria.
- Bishop et al. (2009), _Defect equilibria and chemical expansion in non-stoichiometric undoped and gadolinium-doped cerium oxide_. Important because reduction changes the lattice itself through chemical expansion.
- Marrocchelli et al. (2012), _Understanding Chemical Expansion in Non-Stoichiometric Oxides: Ceria and Zirconia Case Studies_. Mechanistic explanation of why redox changes and strain are coupled in ceria.
- Zinkevich et al. (2006), _Thermodynamic modelling of the cerium-oxygen system_. Essential because ceria is not a single simple composition; the relevant phase ladder spans CeO2, Ce7O12, Ce2O3, and intermediates.
- Ray and Cox (1975), _Neutron diffraction determination of the crystal structure of Ce7O12_. Core structural paper for the intermediate reduced phase you actually care about.
- Da Silva (2007), _Stability of the Ce2O3 phases: A DFT+U investigation_. Shows that even the reduced endmember is polymorphically nontrivial.
- Ko et al. (2021), _A fourth-generation high-dimensional neural network potential with accurate electrostatics including non-local charge transfer_. Best general argument that ordinary local MLIPs are strained by oxides with nonlocal charge redistribution.
- Malica and Marzari (2025), _Teaching oxidation states to neural networks_. Directly relevant to your case because it argues that oxidation-state awareness can be necessary for redox-active materials.
- Shin et al. (2025), _Charge integrated graph neural network-based machine learning potential for amorphous and non-stoichiometric hafnium oxide_. Not ceria, but a very close methodological analogue for “nonstoichiometry + amorphous/high-T states + charge redistribution.”
- Pakarinen et al. (2009), _Molecular dynamics simulations of the structure of latent tracks in quartz and amorphous SiO2_. Useful SiO2 comparator showing track modeling in a non-redox oxide where the same forcing can be studied without a Ce-like valence problem.
- Kluth et al. (2008), _Fine structure in swift heavy ion tracks in amorphous SiO2_. Another SiO2 comparator where the main problem is structural densification/core-shell morphology, not charge-state switching.
- Nasir et al. (2025), _Modelling silica using MACE-MP machine learnt interatomic potentials_. Good comparator for the point that an oxide MLIP can be comparatively straightforward when oxidation-state transfer is not the dominant hidden variable.

**2. Why are the DFT calculations themselves more challenging for ceria?**

- Fabris et al. (2005), _Taming multiple valency with density functionals: A case study of defective ceria_. The classic paper for why defective ceria has many metastable low-energy electronic solutions.
- Allen and Watson (2014), _Occupation matrix control of d- and f-electron localisations using DFT+U_. Best paper for the practical problem of multiple metastable f-electron occupations and localization branches.
- Castleton et al. (2007), _Tuning LDA+U for electron localization and structure at oxygen vacancies in ceria_. Canonical reference for the fact that U controls whether the reduction physics localizes correctly.
- Loschen et al. (2007), _First-principles LDA+U and GGA+U study of cerium oxides: Dependence on the effective U parameter_. Important because the calibration problem spans the whole CeO2 -> Ce7O12 -> Ce2O3 ladder, not just one vacancy in CeO2.
- Cococcioni and de Gironcoli (2005), _Linear response approach to the calculation of the effective interaction parameters in the LDA+U method_. The standard reference if you want to justify U from first principles rather than inherit it.
- Dorado et al. (2009), _DFT+U calculations of the ground state and metastable states of uranium dioxide_. Not ceria, but a very relevant fluorite f-electron analogue showing the same metastability problem.
- Meredig et al. (2010), _Method for locating low-energy solutions within DFT+U_. Useful for the general “many self-consistent branches” problem.
- Qiu et al. (2025), _Circumventing the Metastable States within DFT+U through Random Density Matrix Control_. Recent paper directly aimed at the metastability issue you will face in AIMD/data generation.
- Murgida et al. (2014), _Ordering of oxygen vacancies and excess charge localization in bulk ceria: A DFT+U study_. Important because vacancy ordering and charge localization are coupled, so even choosing representative reduced structures is nontrivial.
- Gopal and Van de Walle (2012), _Ab initio thermodynamics of intrinsic oxygen vacancies in ceria_. Strong reference for the nonstoichiometry/configurational-complexity side of the DFT problem.
- Zhang et al. (2023), _Toward a Consistent Prediction of Defect Chemistry in CeO2_. Best recent consistency/pitfall paper for why defect energetics and oxidation-state inference in ceria are calibration-sensitive and method-sensitive.

**3. Why do classical potentials fail much more easily for ceria than for SiO2?**

- Sasajima et al. (2021), _Nanopore Formation in CeO2 Single Crystal by Ion Irradiation: A Molecular Dynamics Study_. Important because it is an explicit fixed-charge ceria SHI baseline; it shows what a redox-frozen model is actually assuming.
- Yablinsky et al. (2015), _Characterization of swift heavy ion irradiation damage in ceria_. Widely used fixed-charge ceria track paper; useful as the benchmark for what you get when ceria is treated structurally but not electronically.
- Rymzhanov et al. (2025), _Bulk, overlap and surface effects of swift heavy ions in CeO2_. Modern redox-frozen ceria workflow baseline.
- Broqvist et al. (2015), _ReaxFF Force-Field for Ceria Bulk, Surfaces, and Nanoparticles_. Direct evidence from the index that people resort to variable-charge reactive models once they want ceria reduction chemistry to exist in the potential.
- Burbano et al. (2011), _A dipole polarizable potential for reduced and doped CeO2 obtained from first principles_. Important because even outside ReaxFF, ceria often needs a more chemistry-aware model class than a simple fixed-charge pair potential.
- Cui et al. (2012), _Molecular dynamics simulation of reduced CeO2_. Good control case separating “oxygen vacancies present” from “dynamic charge transfer present.”
- Iwase et al. (2009), _Study on the behavior of oxygen atoms in swift heavy ion irradiated CeO2 by means of synchrotron radiation X-ray photoelectron spectroscopy_. The direct physical reason fixed-charge models are in danger: the real material changes valence under irradiation.
- Ohno et al. (2008), _Study on effects of swift heavy ion irradiation in cerium dioxide using synchrotron radiation X-ray absorption spectroscopy_. Same point, with bulk-sensitive valence/local-structure evidence.
- Tracy et al. (2015), _Phase transformations in Ln2O3 materials irradiated with swift heavy ions_. Strongest broader argument that redox efficiency itself changes radiation tolerance.
- Ko et al. (2021), _A fourth-generation high-dimensional neural network potential with accurate electrostatics including non-local charge transfer_. Best general citation for why purely local/fixed-charge models miss nonlocal charge redistribution.
- Malica and Marzari (2025), _Teaching oxidation states to neural networks_. Directly relevant to why oxidation-state information matters in redox-active materials.
- Jung and Cheng (2026), _Neural network potentials with effective charge separation for non-equilibrium dynamics of ionic solids: a ZnO case study_. Good general nonequilibrium ionic-solid precedent for separating electrostatics from short-range ML.
- Pakarinen et al. (2009), _Molecular dynamics simulations of the structure of latent tracks in quartz and amorphous SiO2_. Useful SiO2 counterexample: the main track problem can be treated as structural response under a fixed composition/network.
- Kluth et al. (2008), _Fine structure in swift heavy ion tracks in amorphous SiO2_. Same counterexample in amorphous silica.
- Osmani et al. (2011), _Energy dissipation in dielectrics after swift heavy-ion impact: A hybrid model_. Helpful for the silica/dielectric side because it treats the problem as energy deposition and lattice response, not valence-state chemistry.
- Nasir et al. (2025), _Modelling silica using MACE-MP machine learnt interatomic potentials_. Useful modern comparator for the fact that an oxide MLIP can work well when charge transfer and oxidation-state switching are not the central hidden variables.