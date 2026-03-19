# 4-Year Reading Plan: Computational Nuclear Materials, Radiation Physics, and Machine Learning

*A structured roadmap toward MIT-caliber faculty expertise in multiscale modeling of radiation effects in redox-active materials, machine-learned interatomic potentials, and the theoretical foundations that underpin them.*

---

## How to Use This Plan

This plan is organized into **domains**, each containing books ranked by priority within that domain. Priority tiers are:

- **Tier 1 — Foundation**: Read first. These are load-bearing for your research identity and should be read with care, pen in hand, working problems.
- **Tier 2 — Depth**: Read after the foundations are solid. These give you the expert-level understanding that separates someone who *uses* methods from someone who *creates* them.
- **Tier 3 — Breadth and Reference**: Consult as needed, read selectively, or tackle after Tiers 1–2 in that domain. Important for rounding out your knowledge and for credibility in adjacent areas.

**Realistic pacing**: A dense theoretical physics or mathematics textbook takes 2–4 months of serious study (not just reading — working problems, re-deriving results, connecting to your research). A more applied or survey-style book can be absorbed in 2–6 weeks. Plan accordingly. You will not read all of these cover-to-cover, and you shouldn't try to. The goal is strategic depth in your core areas and working fluency everywhere else.

**A note on papers vs. books**: Books give you the *grammar* of a field; papers give you the *vocabulary* of the frontier. For any domain below, once you've read the Tier 1 book(s), you should be reading the seminal papers in parallel. I've noted key papers where they substitute for or are more important than any textbook.

---

## I. Mathematics

*This is the substrate everything else sits on. As a theoretician, your mathematical maturity is what will determine whether you can invent new formalisms or merely apply existing ones. The creators of Allegro needed deep comfort with representation theory, tensor products, and equivariance — that's not something you pick up from a ML tutorial.*

### Linear Algebra and Matrix Theory

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Strang — **Linear Algebra and Its Applications** | Practical workhorse. Eigendecomposition, SVD, positive definiteness — you use these constantly in ML, QM, and DFT. If your linear algebra is already strong, skim this and move on. | 1 |
| 2 | Horn & Johnson — **Matrix Analysis** | The rigorous treatment. Matrix norms, perturbation theory, matrix functions, Kronecker products. Essential when you need to prove things about your loss landscapes, stability of your MD integrators, or convergence of SCF cycles. | 2 |
| 3 | Golub & Van Loan — **Matrix Computations** | The algorithmic side. How eigensolvers, linear system solvers, and factorizations actually work at scale. Matters when you're thinking about computational cost of DFT or training large models. | 3 |

### Group Theory and Representation Theory

*This is arguably the single most important mathematical area for someone building equivariant ML potentials. The entire Allegro/MACE/NequIP architecture family is built on the representation theory of O(3). You need to understand irreducible representations, Clebsch-Gordan decompositions, spherical harmonics as basis functions for irreps, and Wigner-D matrices not as abstract formalism but as computational building blocks.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Hall — **Lie Groups, Lie Algebras, and Representations: An Elementary Introduction** | The most accessible rigorous treatment of continuous symmetry groups. Covers SO(3), SU(2), their representations, and the general theory. This is where you learn *why* Clebsch-Gordan coefficients and spherical harmonics appear in equivariant networks. | 1 |
| 2 | Dresselhaus, Dresselhaus & Jorio — **Group Theory: Application to the Physics of Condensed Matter** | Bridges abstract group theory to solid-state physics applications: space groups, phonon symmetry, selection rules, band representations. Directly relevant to both your crystallography and your condensed matter physics. | 1 |
| 3 | Cornwell — **Group Theory in Physics** (Vols. I & II) | More comprehensive than Hall on the physics applications, covering both point groups and continuous groups with explicit constructions of representations relevant to physics. | 2 |
| 4 | Tung — **Group Theory in Physics: An Introduction to Symmetry Principles, Group Representations, and Special Functions** | Excellent treatment of the special functions (spherical harmonics, Wigner functions) as representation theory, which is exactly the perspective you need for equivariant NNs. | 2 |

### Real Analysis and Functional Analysis

*You need this for rigorous understanding of DFT (the Hohenberg-Kohn theorems are statements about functionals on Hilbert spaces), for understanding convergence in ML training, and for the mathematical foundations of quantum mechanics.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Kreyszig — **Introductory Functional Analysis with Applications** | The most accessible entry point. Banach and Hilbert spaces, operators, spectral theory — the language of quantum mechanics and DFT formalized. | 1 |
| 2 | Rudin — **Principles of Mathematical Analysis** (Baby Rudin) | The standard rigorous analysis text. Measure theory, convergence, integration. Builds the mathematical maturity you need for everything else. | 2 |
| 3 | Reed & Simon — **Methods of Modern Mathematical Physics** (Vol. I: Functional Analysis) | The definitive reference for the mathematical foundations of quantum mechanics. Spectral theory of self-adjoint operators, distribution theory. Heavy but definitive. | 3 |

### Differential Equations (ODEs, PDEs, and Numerical Methods)

*Your two-temperature model is a coupled PDE system. Your MD integrators are ODE solvers. Your SCF cycles are nonlinear fixed-point iterations.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Strikwerda — **Finite Difference Schemes and Partial Differential Equations** | Practical and rigorous treatment of numerical PDE methods. Directly relevant to how the TTM electronic temperature field is discretized and evolved. Stability, convergence, consistency — the concepts that tell you whether your simulation is solving the right equations. | 1 |
| 2 | Evans — **Partial Differential Equations** | The modern rigorous treatment. Sobolev spaces, weak solutions, existence/uniqueness theory. Gives you the mathematical language to analyze the TTM equations and diffusion problems rigorously. | 2 |
| 3 | Hairer, Nørsett & Wanner — **Solving Ordinary Differential Equations** (Vols. I & II) | The definitive reference on ODE integration methods. Symplectic integrators for MD, stiff system solvers for coupled TTM-MD, Runge-Kutta methods. If you ever need to modify or analyze your MD integrator, this is where you go. | 2 |
| 4 | Trefethen & Bau — **Numerical Linear Algebra** | Clean, modern treatment of the numerical algorithms that underpin scientific computing: iterative solvers, eigenvalue algorithms, conditioning. You'll use this knowledge constantly. | 1 |

### Probability, Statistics, and Information Theory

*Foundations for understanding ML from a principled perspective — loss functions, generalization, Bayesian inference, uncertainty quantification.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Jaynes — **Probability Theory: The Logic of Science** | A deep, opinionated, and brilliant treatment of probability as extended logic. Transforms how you think about inference, model selection, and what it means for a model to "know" something. Directly relevant to Bayesian approaches in ML and uncertainty quantification for MLIPs. | 1 |
| 2 | Cover & Thomas — **Elements of Information Theory** | Entropy, mutual information, KL divergence, rate-distortion theory. These concepts appear everywhere in modern ML (cross-entropy loss, VAEs, information bottleneck). | 2 |
| 3 | Wasserman — **All of Statistics** | A concise graduate-level survey. Good for filling in any gaps in your statistical toolkit. | 3 |

### Topology and Differential Geometry

*Increasingly relevant to ML theory (manifold learning, geometric deep learning, topological data analysis) and to understanding crystal defects (homotopy theory of defects).*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Nakahara — **Geometry, Topology and Physics** | Written for physicists. Covers manifolds, fiber bundles, homotopy, homology — the mathematical structures that appear in geometric deep learning and in the topological classification of crystal defects. | 2 |
| 2 | Lee — **Introduction to Smooth Manifolds** | More rigorous than Nakahara. A proper mathematics treatment if you want to go deeper into the geometry underlying equivariant architectures. | 3 |

---

## II. Statistical Mechanics and Thermodynamics

*This was the most critical gap in your original list. The TTM-MD framework, defect thermodynamics, phase stability of CeO₂₋ₓ, Langevin dynamics, and the very concept of a "thermal spike" are all statistical mechanics. You cannot be a theoretician in your field without deep command of this area.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Callen — **Thermodynamics and an Introduction to Thermostatistics** | The cleanest, most rigorous treatment of classical thermodynamics from the postulational approach. Legendre transforms, stability conditions, Maxwell relations — all derived with mathematical precision. You need this formal thermodynamic framework before statistical mechanics, because defect thermodynamics (formation free energies, equilibrium vacancy concentrations, phase stability in CeO₂₋ₓ) is built on it. | 1 |
| 2 | Chandler — **Introduction to Modern Statistical Mechanics** | Beautifully written, conceptually clean. Covers the foundations (ensembles, free energies, fluctuations, response functions) in a way that builds real physical intuition. The chapter on Monte Carlo and the fluctuation-dissipation theorem are directly relevant to your simulation work. Start here for stat mech. | 1 |
| 3 | McQuarrie — **Statistical Mechanics** | The comprehensive graduate reference. More detailed than Chandler on quantum statistical mechanics, ideal and non-ideal systems, and chemical equilibria. Use this as the encyclopedic complement to Chandler's conceptual foundations. | 1 |
| 4 | Zwanzig — **Nonequilibrium Statistical Mechanics** | This is where you learn the Mori-Zwanzig projection operator formalism — the theoretical framework that justifies coarse-graining electronic degrees of freedom into a temperature field (which is exactly what the TTM does). Generalized Langevin equations, memory functions, fluctuation-dissipation relations for non-equilibrium systems. Essential for understanding *why* your simulation framework takes the form it does, and for being able to extend it. | 1 |
| 5 | De Groot & Mazur — **Non-Equilibrium Thermodynamics** | The classic on irreversible thermodynamics: entropy production, Onsager reciprocal relations, coupled transport (thermoelectricity, thermodiffusion). Relevant to understanding coupled heat and charge transport during the spike. | 2 |
| 6 | Landau & Lifshitz — **Statistical Physics, Part 1** | The Landau & Lifshitz treatment. Characteristically terse and deep. Phase transitions, fluctuation theory, Landau theory of second-order transitions. A physicist's bible. | 2 |
| 7 | DeHoff — **Thermodynamics in Materials Science** | Thermodynamics specifically oriented toward materials scientists: solution models, phase diagrams from free energy curves, defect equilibria, surfaces and interfaces. Bridges the gap between physics-style stat mech and the way materials scientists actually think about phase stability and defect chemistry. | 2 |
| 8 | Reif — **Fundamentals of Statistical and Thermal Physics** | Solid, thorough treatment. Good secondary reference if Chandler or McQuarrie leaves gaps. | 3 |

---

## III. Quantum Mechanics

*Your original list had seven QM books, which is too much overlap. Here's a trimmed, purposeful selection that covers the formalism, the materials applications, and the many-body theory you need for understanding DFT and electronic structure at a deep level.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Sakurai & Napolitano — **Modern Quantum Mechanics** | Your primary QM reference. Rigorous, elegant, covers the formalism (bra-ket, angular momentum, perturbation theory, scattering) at the level you need. Work the problems. | 1 |
| 2 | Kaxiras — **Quantum Theory of Materials** | This one maps directly onto your research. Connects QM formalism to electronic structure of solids, bonding, band theory, and DFT. This is where QM meets materials science. | 1 |
| 3 | Martin — **Electronic Structure: Basic Theory and Practical Methods** | Not really a QM book — it's *the* book on electronic structure methods. DFT, pseudopotentials, basis sets, self-consistency, exchange-correlation functionals, DFT+U. This is your DFT bible. Every page is relevant to your work. | 1 |
| 4 | Fetter & Walecka — **Quantum Theory of Many-Particle Systems** | Many-body perturbation theory, Green's functions, diagrammatic methods. You need this to understand correlation effects beyond DFT — why DFT+U works, what it approximates, and what it misses. Also essential background for understanding GW, DMFT, and other beyond-DFT methods you may need for Ce 4f physics. | 2 |
| 5 | Zetilli — **Quantum Mechanics: Concepts and Applications** | Your QM home base. Read in parallel with Sakurai in Year 1 to re-activate your foundations and provide the concrete worked examples and physical pictures that ground Sakurai's abstract formalism. Keep as an ongoing reference and problem source throughout the PhD. | 1 (parallel with Sakurai) |
| 6 | Szabo & Ostlund — **Modern Quantum Chemistry** | Hartree-Fock, configuration interaction, many-body perturbation theory from a chemistry perspective. Gives you the wavefunction-based methods that complement DFT. Useful for understanding the reference methods people benchmark DFT+U against. | 2 |

*Books from your original list I'd deprioritize or drop: Atkins (too chemistry-intro level for your needs), Johnson and Kastburg (too specialized in atomic structure for your main research direction — revisit only if you go deep into many-body perturbation theory for f-electron systems).*

---

## IV. Electronic Structure and Density Functional Theory

*This is one of your core competencies. You need to understand DFT not just as a practitioner but at the level where you can assess the validity of your DFT+U reference for the Ce-O system, understand what systematic errors you're baking into your MLIP, and potentially develop corrections.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Martin — **Electronic Structure: Basic Theory and Practical Methods** | (Listed above under QM as well.) The comprehensive treatment of DFT in practice. Hohenberg-Kohn, Kohn-Sham, exchange-correlation functionals, pseudopotentials, PAW, plane waves, convergence. | 1 |
| 2 | Sholl & Steckel — **Density Functional Theory: A Practical Introduction** | Good for the practical "how to run calculations" perspective, but you'll outgrow it quickly. Read early, then move on. | 1 |
| 3 | Giustino — **Materials Modelling Using Density Functional Theory** | A modern, pedagogically excellent bridge between DFT theory and materials applications. Covers DFT, pseudopotentials, phonons, optical properties, and transport — all from a computational materials perspective. More current than Sholl, more accessible than Martin for a first pass, and directly oriented toward the kinds of calculations you actually run. Read this alongside or shortly after Sholl. | 1 |
| 4 | Parr & Yang — **Density-Functional Theory of Atoms and Molecules** | The formal mathematical foundations of DFT. Variational principles, the adiabatic connection, exact conditions on the exchange-correlation functional. Gives you the theoretical depth to understand *why* certain approximations fail for strongly correlated systems like Ce 4f. | 2 |
| 5 | Martin, Reining & Ceperley — **Interacting Electrons: Theory and Computational Approaches** | The sequel to Martin's first book. Covers beyond-DFT methods: GW, BSE, DMFT, QMC. Critical for understanding the landscape of methods that could improve upon your DFT+U reference, and for being conversant with the broader electronic structure community. | 2 |
| 6 | Dreizler & Gross — **Density Functional Theory: An Approach to the Quantum Many-Body Problem** | The rigorous mathematical treatment. Formal proofs, extensions to finite temperature and time-dependent DFT. Reference-level depth. | 3 |
| 7 | Kohanoff — **Electronic Structure Calculations for Solids and Molecules** | Practical complement focusing on implementation details: basis sets, k-point sampling, molecular dynamics from electronic structure. Good bridge between theory and practice. | 2 |

| 8 | Alkauskas, Deák, Neugebauer, Pasquarello & Van de Walle (Eds.) — **Advanced Calculations for Defects in Materials: Electronic Structure Methods** | This book is *extremely* relevant to your work. It covers the practical and theoretical challenges of computing defect properties from first principles: formation energies and transition levels, finite-size corrections for charged defects in supercells, the band-gap problem and its impact on defect energetics, self-interaction corrections, and DFT+U for correlated defect systems. Several chapters deal directly with the kinds of calculations you need to validate your MLIP training data — e.g., how to correctly compute oxygen vacancy formation energies in an oxide with localized f-electrons. This is where you learn to do defect calculations *rigorously* rather than just running VASP with default settings. | 1 |

**Essential papers (no textbook substitute)**:
- Anisimov, Zaanen & Andersen (1991) — The original DFT+U paper
- Liechtenstein, Anisimov & Zaanen (1995) — The rotationally invariant DFT+U
- Dudarev et al. (1998) — The simplified (Dudarev) DFT+U you're using
- Himmetoglu et al. (2014) — "Hubbard-corrected DFT energy functionals: The LDA+U description of correlated systems" — the comprehensive modern review
- Loschen et al. (2007) — Your own reference for Ce-O DFT+U calibration
- Freysoldt et al. (2014) — "First-principles calculations for point defects in solids" (Rev. Mod. Phys.) — The definitive modern review on charged defect calculations, finite-size corrections, and alignment schemes. Companion reading to the Alkauskas et al. book.
- Zaanen, Sawatzky & Allen (1985) — "Band gaps and electronic structure of transition-metal compounds" — The ZSA classification of correlated insulators. Foundational for understanding where your ceria phases sit.
- Meredig et al. (2010) — "Method for locating low-energy solutions within DFT+U" — Directly addresses the multiple-minima problem you encounter in Ce₇O₁₂. Practical strategies for navigating the DFT+U energy landscape.
- Allen & Watson (2014) — "Occupation matrix control of d- and f-electron localisations using DFT+U" — The theoretical basis for the OCCMATRIX seeding you're already using.

---

## V. Solid State and Condensed Matter Physics

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Ashcroft & Mermin — **Solid State Physics** | The standard graduate text. Crystal structure, reciprocal space, band theory, phonons, electron-phonon interactions, semiconductors, magnetism. You already have this — make sure you've worked through the phonon and electron-phonon chapters carefully, since electron-phonon coupling is literally the *g* parameter in your TTM equations. | 1 |
| 2 | Dove — **Introduction to Lattice Dynamics** | Phonon theory in depth: dispersion relations, anharmonicity, thermal conductivity from phonons, soft modes, phase transitions. Your MLIP needs to get phonon dispersions right; this book tells you why and how to check. | 1 |
| 3 | Ziman — **Electrons and Phonons** | The classic on transport theory in solids. Boltzmann equation, electron-phonon scattering, thermal and electrical conductivity from microscopic theory. Directly relevant to the electronic thermal conductivity kₑ and electron-phonon coupling g in your TTM model. | 2 |
| 4 | Mahan — **Many-Particle Physics** | The comprehensive condensed matter many-body theory reference. Green's functions, polarons, optical properties, transport. The polaron chapter is directly relevant to the Ce³⁺ small-polaron physics in your reduced ceria. | 2 |
| 5 | Stoneham — **Theory of Defects in Solids** | *The* book on defect physics from a condensed matter theory perspective. Point defects, defect thermodynamics, migration, electronic states of defects, optical and spin resonance signatures. Everything in your SHI track simulations produces defects — this is where you learn the theory of what you're creating. | 1 |
| 6 | Cai & Nix — **Imperfections in Crystalline Solids** | A modern, comprehensive treatment of defects — point defects, dislocations, interfaces, cracks — with a materials science emphasis. More accessible and up-to-date than Stoneham in many respects, with excellent worked examples and a cleaner pedagogical structure. Stoneham gives you the condensed-matter-theory depth; Cai & Nix gives you the modern materials-science perspective. Together they're a very strong pair. | 1 |
| 7 | Tilley — **Defects in Solids** | More focused on non-stoichiometric compounds and defect chemistry. Directly relevant to CeO₂₋ₓ and the vacancy-polaron coupling that defines your system. | 2 |
| 8 | Hull & Bacon — **Introduction to Dislocations** | You will encounter dislocation loops and extended defects in irradiated materials — both in experiment (TEM observations of irradiated ceria) and in simulations at the scales you're targeting. This is the standard, readable introduction to dislocation theory. Was covers dislocation-related radiation effects, but Hull & Bacon gives you the underlying mechanics. | 2 |
| 9 | Khomskii — **Transition Metal Compounds: Structure and Physical Properties** | This is the book you're missing most urgently. Khomskii covers exactly the physics that makes your Ce₇O₁₂ calculations hard: charge ordering in mixed-valence compounds, orbital ordering, the interplay between electronic structure and magnetic ordering, Jahn-Teller distortions, superexchange mechanisms (Goodenough-Kanamori rules), and the Hubbard model as the underlying theory that DFT+U approximates. Your three-structure framework — physical, electronic, magnetic — and the way you reason about their coupling is precisely the physics Khomskii formalizes. When you write "charge and spin updates compete" in your AFM convergence notes, you're describing a phenomenon that Khomskii treats theoretically: the coupled charge-spin-orbital degrees of freedom in correlated oxides. This book will transform your understanding of *why* DFT+U has multiple minima and what each minimum means physically. | 1 |
| 10 | Cox — **Transition Metal Oxides: An Introduction to their Electronic Structure and Properties** | The Zaanen-Sawatzky-Allen (ZSA) classification of correlated insulators — Mott-Hubbard vs. charge-transfer — is the theoretical framework for understanding where CeO₂ and Ce₂O₃ sit in the landscape of correlated oxides. Cox covers this classification, crystal field theory in oxides, superexchange, mixed valence (Robin-Day classification), polaron formation, and metal-insulator transitions. When you ask "why does U_eff shift the 4f states relative to the O 2p manifold differently in CeO₂ vs Ce₂O₃?", the answer is in the ZSA framework: CeO₂ is a charge-transfer insulator (gap set by O 2p → Ce 4f), while Ce₂O₃ is a Mott-Hubbard insulator (gap set by 4f → 4f). DFT+U acts on these two situations differently, and Cox gives you the physics to understand why. | 1 |
| 11 | Fazekas — **Lecture Notes on Electron Correlation and Magnetism** | The theoretical foundations of correlated electron physics: the Hubbard model in detail (half-filling, doping, metal-insulator transition), the Anderson impurity model, Kondo physics, exchange mechanisms (direct, super, double exchange), and magnetic ordering. DFT+U adds a Hubbard U to the Kohn-Sham Hamiltonian — Fazekas tells you what the Hubbard model actually is, what its solutions look like, and what physics the mean-field (DFT+U) treatment captures vs. misses. Your SCF convergence difficulties with AFM Ce₇O₁₂ are, at their core, a manifestation of the frustrated energy landscape of the Hubbard model at intermediate filling — Fazekas gives you the theoretical language for this. | 2 |
| 12 | Goodenough — **Magnetism and the Chemical Bond** | The classic that established the rules for predicting magnetic ordering in oxides. The Goodenough-Kanamori rules tell you whether a given metal-oxygen-metal bond pathway will be ferromagnetic or antiferromagnetic based on the orbital geometry and electron count. When you choose an A-type AFM ordering for Ce₇O₁₂ and need to know whether it's physically reasonable, Goodenough's rules are what you apply. Dense and old-fashioned in style, but the physics is permanent. | 2 |
| 13 | Blundell — **Magnetism in Condensed Matter** | Accessible, modern introduction to magnetism: diamagnetism, paramagnetism, exchange, ordering, mean field theory, spin waves. Covers the conceptual foundations (local moment formation, Curie-Weiss behavior, crystal field effects) that connect Ashcroft & Mermin's general treatment to your specific f-electron physics. A good warm-up before the more specialized texts above. | 1 |
| 14 | Jensen & Mackintosh — **Rare Earth Magnetism: Structures and Excitations** | The definitive treatment of magnetism in rare earth systems. Crystal field theory for f-electrons, exchange interactions, magnetic structures, and excitations in lanthanide compounds. Ce is a rare earth — the 4f¹ configuration of Ce³⁺, its crystal field splitting in the fluorite oxygen cage, and the competition between localization and itineracy are all covered from a perspective no general condensed matter book provides. This is where you learn why your Ce³⁺ moments behave the way they do, and why DFT+U's treatment of them is an approximation of specific character. | 2 |
| 15 | De Boer — **Semiconductor Physics** | Keep from your original list if you need the semiconductor perspective on ceria's electronic properties (it behaves as a wide-gap semiconductor/insulator). | 3 |

---

## VI. Radiation Physics, Ion-Solid Interactions, and Radiation Effects in Materials

*This is your specific application domain. You need to know this area cold — both the experimental phenomenology and the theoretical models.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Was — **Fundamentals of Radiation Materials Science** | Arguably the single most important book you were missing. Displacement damage theory (NRT, arc-dpa), point defect production and evolution, void swelling, radiation-induced segregation, irradiation creep, phase stability under irradiation. This is the materials science context that your simulations serve. NNSA and national lab interviewers will expect you to speak this language fluently. | 1 |
| 2 | Nastasi, Mayer & Hirvonen — **Ion-Solid Interactions: Fundamentals and Applications** | Electronic and nuclear stopping, range distributions, sputtering, ion mixing. The physics of how your swift heavy ions deposit energy. You already have this — good. | 1 |
| 3 | Wesche — **Ion Beam Modification of Solids** (Eds: Wesch & Wendler) | Complements Nastasi with a focus on the materials modification side: track formation, amorphization, ion beam synthesis. Directly relevant to your SHI work. | 1 |
| 4 | Ziegler, Biersack & Littmark — **The Stopping and Range of Ions in Solids** | The SRIM/TRIM reference. Understanding stopping power calculations from first principles, not just as software output. | 2 |
| 5 | Sickafus, Kotomin & Uberuaga (Eds.) — **Radiation Effects in Solids** (NATO ASI Series) | This is the ceramics-and-oxides-specific radiation effects volume that complements Was's metals-heavy treatment. Chapters by leading researchers on radiation damage in fluorite-structure oxides, complex oxides, and ceramics. Several chapters are directly about the material class you work on. This fills a real gap — Was gives you the general framework, but this volume speaks your specific materials language. | 1 |
| 6 | Thompson — **Defects and Radiation Damage in Metals** | Classic treatment of radiation damage from a physics perspective. Good for the historical and theoretical foundations. | 3 |
| 7 | Sigmund — **Particle Penetration and Radiation Effects** (Vols. 1 & 2) | The comprehensive modern treatment of ion-solid interaction physics. Vol. 2 specifically covers swift heavy ions, the Coulomb explosion and thermal spike models, and track formation. This is your most specialized reference. | 2 |

**Essential papers**:
- Toulemonde, Dufour & Paumier — The inelastic thermal spike model papers
- Szenes — Thermal spike model for SHI tracks
- Trautmann, Klaumünzer et al. — Experimental SHI track morphology studies
- Weber et al. — Radiation effects in fluorite-structure oxides

---

## VII. Nuclear Engineering and Nuclear Materials

*For career positioning with NNSA, DOE, and national labs. You need to understand the application context: why does anyone care about radiation damage in fluorite oxides? Because they're nuclear fuel surrogates. You need to speak the language of nuclear materials confidently.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Olander — **Fundamental Aspects of Nuclear Reactor Fuel Elements** | The classic on nuclear fuel materials science. Fuel fabrication, fission product behavior, fuel-cladding interactions, UO₂ and MOX properties. CeO₂ is studied precisely because it's an accessible surrogate for UO₂/PuO₂ — Olander tells you why the properties you're computing matter for the fuel cycle. | 1 |
| 2 | Stacey — **Nuclear Reactor Physics** | Clean modern treatment of reactor physics: neutron transport, criticality, reactor kinetics, burnup. Gives you the engineering context to understand what drives materials requirements. | 1 |
| 3 | Allen, Was, & Zinkle (various review articles and chapters) — **Radiation Effects in Nuclear Materials** | Not a single book, but the body of review work by these authors (especially Zinkle & Was on materials challenges for advanced reactors, and Allen & Was on radiation damage mechanisms) is essential reading. Treat these as Tier 1 paper reading. | 1 |
| 4 | Cacuci (Ed.) — **Handbook of Nuclear Engineering** | Encyclopedic reference. Consult specific chapters on fuel performance, materials degradation, and computational methods. | 3 |
| 5 | Shultis & Faw — **Fundamentals of Nuclear Science and Engineering** | Broader overview covering nuclear physics, radiation interactions, shielding, dosimetry. Good for filling in any nuclear science background you're missing. | 2 |
| 6 | Konings (Ed.) — **Comprehensive Nuclear Materials** | Multi-volume encyclopedia. The chapters on radiation effects in ceramics and on computational methods for nuclear materials are directly relevant. Use as a reference. | 3 |

---

## VIII. Materials Science and Engineering Fundamentals

*Phase stability, kinetics, diffusion, and thermodynamics of real materials. You need this to connect your atomistic simulations to the mesoscale and macroscale phenomena that experimentalists observe.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Balluffi, Allen & Carter — **Kinetic Processes in Materials** | Diffusion theory, nucleation, grain growth, phase transformations from a kinetic perspective. The defects your SHI simulations create don't just sit there — they migrate, cluster, anneal, and evolve. This book tells you the theory of those processes. | 1 |
| 2 | Porter, Easterling & Sherif — **Phase Transformations in Metals and Alloys** | Thermodynamics of phase stability, nucleation theory, diffusional and diffusionless transformations. Foundational for understanding phase stability in CeO₂₋ₓ as a function of oxygen content and temperature. | 1 |
| 3 | DeGraef & McHenry — **Structure of Materials** | Already on your list. Good comprehensive treatment of crystallography, diffraction, and microstructure. | 1 |
| 4 | Khachaturyan — **Theory of Structural Transformations in Solids** | Advanced. Microelasticity theory, concentration waves, long-range order. Relevant if you want to connect your atomistic defect structures to mesoscale strain fields and ordering phenomena. | 2 |
| 5 | Chiang, Birnie & Kingery — **Physical Ceramics: Principles for Ceramic Science and Engineering** | The modern physics-of-ceramics text. More focused than the older Kingery on the physics you actually need: defect chemistry and transport in ionic oxides, phase equilibria, sintering mechanisms, and electronic properties of ceramics. Covers Kröger-Vink notation, Brouwer diagrams, and nonstoichiometry in a way that maps directly onto your CeO₂₋ₓ system. Better suited to your needs than the original Kingery or the broader Carter & Norton. | 1 |
| 6 | Shewmon — **Diffusion in Solids** | The standard focused treatment of diffusion: mechanisms (vacancy, interstitial, grain boundary), the mathematics of Fick's laws, thermodynamic factor, Kirkendall effect, and diffusion in ionic crystals specifically. Balluffi et al. covers kinetics broadly, but Shewmon goes deeper on the diffusion mechanisms that govern oxygen transport and vacancy migration in your ceria system. | 2 |
| 7 | Kröger — **The Chemistry of Imperfect Crystals** | Defect chemistry in ionic/covalent crystals using Kröger-Vink notation. The language experimentalists use to describe the defect equilibria in your CeO₂₋ₓ system. | 2 |
| 8 | Carter & Norton — **Ceramic Materials: Science and Engineering** | A broader, more modern ceramics text than Chiang. Covers processing, mechanical properties, and applications alongside the physics. Good secondary reference for rounding out your ceramics knowledge, but Chiang is the better primary text for your physics-oriented needs. | 3 |

---

## IX. Crystallography and Symmetry

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | DeGraef & McHenry — **Structure of Materials** | (Listed above.) | 1 |
| 2 | Giacovazzo et al. — **Fundamentals of Crystallography** (IUCr Texts) | More rigorous crystallographic treatment than DeGraef. Space groups, diffraction theory, structure solution. | 2 |
| 3 | International Tables for Crystallography, Teaching Edition | Already on your list. Essential reference for space group notation and symmetry operations. | 2 |

*Note: I dropped Alan's "Molecular Symmetry and Group Theory" from your original list because Dresselhaus et al. (in the Mathematics/Group Theory section) covers the same ground with more depth and direct relevance to solid-state physics. The molecular point group perspective in Alan is useful for chemistry but less so for your crystalline materials and equivariant network work.*

### Experimental Characterization (for Computational Credibility)

*ChatGPT raised a valid point here. Even as a theoretician/computationalist, you need to understand the experiments your simulations are being compared to. When you present SHI track simulation results at a conference, experimentalists will ask you about TEM, XRD, and Raman data. You don't need to master these techniques, but you need to read them intelligently.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Cullity & Stock — **Elements of X-Ray Diffraction** | The standard XRD text. Bragg's law, powder diffraction, peak broadening from defects and strain — the primary way people characterize crystallinity and lattice parameter changes in irradiated ceria. You need to understand what "the XRD peaks broaden after irradiation" means structurally. | 2 |
| 2 | Williams & Carter — **Transmission Electron Microscopy: A Textbook for Materials Science** | TEM is *the* technique for directly imaging SHI tracks in ceria. You need to understand bright-field/dark-field imaging, diffraction contrast, HAADF-STEM, EELS — enough to interpret the micrographs your experimental collaborators produce and that you're comparing your simulations against. | 2 |

---

## X. Molecular Dynamics and Atomistic Simulation

*You're building and running large-scale MD simulations as your primary research tool. You need to understand the methodology at a deep level — not just how to use LAMMPS, but why velocity-Verlet preserves phase space volume, how thermostats work, what finite-size effects you're introducing, and how to extract thermodynamic properties from trajectories.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Frenkel & Smit — **Understanding Molecular Simulation** | The standard. Covers the statistical mechanics foundations of simulation (ensemble generation, free energy methods, rare event methods), Monte Carlo, and MD. Essential for understanding what your simulations can and cannot tell you. | 1 |
| 2 | Allen & Tildesley — **Computer Simulation of Liquids** | The classic on MD implementation: force calculations, neighbor lists, periodic boundaries, long-range corrections, thermostats, barostats. More implementation-focused than Frenkel & Smit. | 1 |
| 3 | Tuckerman — **Statistical Mechanics: Theory and Molecular Simulation** | A modern and mathematically rigorous treatment that unifies the statistical mechanics theory with the simulation methodology. Particularly strong on integrators, extended-system methods (Nosé-Hoover), and free energy methods. If you could read only one book in this section, this might be the most complete. | 1 |
| 4 | Rapaport — **The Art of Molecular Dynamics Simulation** | More practical and algorithmic. Good for understanding the computational aspects: parallelization, cell lists, optimization of force loops. | 3 |

---

## XI. Machine Learning and Deep Learning

*You want to create new architectures and theories, not just train existing models. This requires understanding ML from the ground up — optimization theory, generalization theory, the geometry of representation learning, and the specific equivariant/geometric architectures that underpin modern MLIPs.*

### Foundations

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Deisenroth, Faisal & Ong — **Mathematics for Machine Learning** | A focused, efficient bridge from mathematics (linear algebra, analytic geometry, probability, optimization) to the ML algorithms that use them. Freely available online. If your math foundations are solid, this is a fast read that shows you exactly how the math you already know maps onto ML concepts. Read this *before* or alongside Goodfellow to build the bridge efficiently. | 1 |
| 2 | Goodfellow, Bengio & Courville — **Deep Learning** | The standard graduate text. Covers fundamentals (optimization, regularization, CNNs, RNNs, generative models) and the mathematical foundations (linear algebra, probability, numerical computation) in one place. Start here for ML foundations. | 1 |
| 3 | Bishop & Bishop — **Deep Learning: Foundations and Concepts** (2024 edition) | The modern update to Bishop's classic. More rigorous probabilistic treatment than Goodfellow. Strong on Bayesian methods, which are increasingly important for uncertainty quantification in MLIPs. | 1 |
| 4 | Shalev-Shwartz & Ben-David — **Understanding Machine Learning: From Theory to Algorithms** | The theoretical foundations: PAC learning, VC dimension, Rademacher complexity, generalization bounds. If you want to understand *why* deep learning works (and when it shouldn't), this gives you the mathematical framework. | 2 |
| 5 | Murphy — **Probabilistic Machine Learning** (Vols. 1 & 2) | Comprehensive modern reference for probabilistic/Bayesian ML. Gaussian processes (used in GAP potentials), variational inference, Bayesian neural networks. Vol. 2 covers advanced topics including deep generative models. | 2 |

### Geometric Deep Learning and Equivariant Networks

*This is the specific ML subfield that produced Allegro, NequIP, MACE, and the other equivariant MLIP architectures. This is where your ML reading must go deepest.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Bronstein, Bruna, Cohen & Veličković — **Geometric Deep Learning: Grids, Groups, Graphs** | The foundational monograph for the field. Unifies CNNs, GNNs, and equivariant networks under a single symmetry-based framework. This is the conceptual architecture you need to internalize to *design* new equivariant architectures, not just use existing ones. | 1 |
| 2 | Hamilton — **Graph Representation Learning** | Graph neural networks: message passing, graph attention, spectral methods. Your MLIP is fundamentally a graph neural network operating on atomic neighbor graphs. | 1 |

**Essential papers (these are as important as any textbook)**:
- Batzner et al. (2022) — E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials (NequIP — the precursor to Allegro)
- Musaelian et al. (2023) — Learning local equivariant representations for large-scale atomistic dynamics (Allegro itself)
- Batatia et al. (2022) — MACE: Higher order equivariant message passing neural networks
- Thomas et al. (2018) — Tensor field networks: Rotation- and translation-equivariant NNs for 3D point clouds
- Geiger & Smidt (2022) — e3nn: Euclidean Neural Networks (the software library and its theory)
- Bartók, Kondor & Csányi (2013) — On representing chemical environments (the SOAP descriptor — foundational for understanding how local atomic environments are represented)

### Optimization Theory

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Boyd & Vandenberghe — **Convex Optimization** | The foundations of optimization. Convexity, duality, interior point methods, semidefinite programming. ML training is non-convex, but understanding the convex case gives you the toolkit and intuition. Freely available online. | 2 |
| 2 | Nocedal & Wright — **Numerical Optimization** | Practical numerical optimization: gradient descent, quasi-Newton methods, conjugate gradient, constrained optimization, trust regions. Directly relevant to training neural networks and to the geometry optimization steps in your DFT workflow. | 2 |

---

## XII. Machine Learning for Atomistic Simulation (Specialized)

*There is no single canonical textbook for this intersection yet, but several key references and reviews serve the role.*

| # | Resource | Why It Matters | Tier |
|---|---------|---------------|------|
| 1 | Behler — **Four Generations of High-Dimensional Neural Network Potentials** (Chem. Rev. 2021) | The comprehensive review of MLIP development from Behler-Parrinello to message-passing architectures. Historical perspective and taxonomy of the field you're working in. | 1 |
| 2 | Unke et al. — **Machine Learning Force Fields** (Chem. Rev. 2021) | Complementary review covering the mathematical foundations: symmetry-adapted representations, kernel methods, neural network architectures, training strategies, active learning. | 1 |
| 3 | Deringer, Caro & Csányi — **Machine Learning Interatomic Potentials as Emerging Tools for Materials Science** (Adv. Mater. 2019) | Review focused on materials science applications, with practical guidance on validation, transferability, and failure modes. | 1 |
| 4 | Noé et al. — **Machine Learning for Molecular Simulation** (Ann. Rev. Phys. Chem. 2020) | Broader scope: enhanced sampling, coarse-graining, and free energy methods with ML. Gives you a vision for where the field is going beyond just force fields. | 2 |

---

## XIII. Continuum Mechanics and Transport Theory

*For understanding the continuum-level physics in your TTM model, stress wave propagation during the thermal spike, and thermal transport in defective materials.*

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Landau & Lifshitz — **Theory of Elasticity** | The standard theoretical treatment. Stress, strain, elastic waves, thermal stresses. The stress waves generated by your thermal spike and absorbed by your Langevin rim are elastic/thermoelastic phenomena. | 2 |
| 2 | Landau & Lifshitz — **Physical Kinetics** | Transport in the Boltzmann equation framework. Electron-phonon coupling, thermal conductivity, electrical conductivity from kinetic theory. Directly relevant to parameterizing your TTM (the coupling constant g, the electronic thermal conductivity kₑ). | 2 |
| 3 | Chen — **Nanoscale Energy Transport and Conversion** | Modern treatment of thermal transport at the nanoscale: phonon and electron transport, the Boltzmann transport equation, ballistic vs. diffusive regimes. Relevant because your SHI tracks are nanometer-scale objects where continuum Fourier-law heat conduction may break down. | 2 |

---

## XIV. Electrodynamics

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Griffiths — **Introduction to Electrodynamics** | Already on your list. Solid foundations. Sufficient for most of what you need unless you go into dielectric theory or optical properties of materials. | 1 |
| 2 | Jackson — **Classical Electrodynamics** | The graduate standard. Much more rigorous and complete than Griffiths. Electromagnetic response of media, radiation, multipole expansions. Relevant if you need to understand dielectric response of ceria or the electromagnetic interactions in ion stopping at a deeper level. | 3 |

---

## XV. Computational Chemistry and Methods

| # | Book | Why It Matters | Tier |
|---|------|---------------|------|
| 1 | Szabo & Ostlund — **Modern Quantum Chemistry** | (Listed under QM as well.) The best introduction to wavefunction-based computational quantum chemistry: Hartree-Fock, CI, MBPT, coupled cluster. Gives you the methods that serve as benchmarks for DFT. | 2 |
| 2 | Jensen — **Introduction to Computational Chemistry** | Broader survey: semi-empirical methods, DFT, force fields, molecular properties, solvation models. Good reference for the wider computational chemistry landscape. | 3 |

*I dropped Ramachandran from your original list — it's too elementary and too broad for where you're headed. Szabo & Ostlund plus Jensen cover the computational chemistry you actually need, and your DFT books cover the rest.*

---

## Research-First Priority Stack: What to Read for Your Simulations Right Now

*The semester schedule below is designed for balanced, long-term knowledge building. But your research doesn't wait. This section answers a different question: "If I need to understand my SHI track simulations and MLIP training deeply enough to troubleshoot problems and develop physical theory — what do I read first?"*

*These are ranked by direct impact on your two active workflows. If you're in the middle of running simulations or training potentials and something isn't working, this is your triage order.*

### The Core 10: Books That Directly Drive Your Research

These books are load-bearing for your day-to-day work. Every one of them answers questions you will actually encounter while running TTM-MD simulations or training your Ce-O Allegro potential.

| Priority | Book | Subject | Why It's Urgent |
|----------|------|---------|----------------|
| 1 | Martin — **Electronic Structure** | Electronic Structure / DFT | Your DFT+U reference is the foundation everything else rests on. If your reference is wrong, your MLIP is wrong, and your track simulations are wrong. Martin tells you what DFT is actually doing, what approximations you're making, and where they can fail. You need this to assess whether your U_eff choice is giving you a physically faithful Ce-O energy landscape. |
| 2 | Chandler — **Introduction to Modern Statistical Mechanics** | Statistical Mechanics | Your TTM-MD is a stat mech framework. The thermal spike is a non-equilibrium stat mech process. Defect formation energies are free energies. Without stat mech, you can run simulations but you can't interpret what they mean. |
| 3 | Frenkel & Smit — **Understanding Molecular Simulation** | Molecular Dynamics | You are running large-scale MD. This book tells you what your simulation can and cannot tell you: what ensemble you're sampling, what finite-size effects look like, how to extract thermodynamic observables from trajectories, and how to diagnose when your simulation is giving you artifacts rather than physics. |
| 4 | Alkauskas et al. — **Advanced Calculations for Defects in Materials** | Defect Physics | Your MLIP training data consists of defect calculations in CeO₂₋ₓ. This book tells you how to do those calculations rigorously — finite-size corrections, the band-gap problem, self-interaction errors in f-electron systems. If your training data has systematic errors (and it might — DFT+U for Ce 4f is tricky), this is where you learn to detect and correct them. |
| 5 | Stoneham — **Theory of Defects in Solids** | Defect Physics | You are creating and studying defects. This book tells you the theory of what you're creating: formation energies, migration barriers, electronic states of defects, defect-defect interactions, and the thermodynamics that governs whether defects anneal or persist. When you look at your track and see a certain radial defect profile, Stoneham gives you the theoretical language to explain why it looks that way. |
| 6 | Was — **Fundamentals of Radiation Materials Science** | Radiation Materials Science | The application context for your simulations. Displacement damage theory, defect production, microstructural evolution under irradiation. When an experimentalist asks "how does your simulated track compare to what we see in irradiated ceria?", you need Was's framework to answer. |
| 7 | Goodfellow et al. — **Deep Learning** | Machine Learning | You are training a neural network potential. When your training loss plateaus, when your validation error diverges, when your potential gives unphysical forces in certain configurations — you need to understand optimization landscapes, overfitting, regularization, and learning rate schedules at a level deeper than "try reducing the learning rate." |
| 8 | Bronstein et al. — **Geometric Deep Learning** | Machine Learning | Your potential is an equivariant graph neural network. When you need to decide whether to increase the maximum angular momentum L in your features, or whether to add another interaction layer, or why your potential fails for certain coordination environments — you need to understand what equivariance is actually buying you, what the representation-theoretic capacity of your model is, and how the symmetry constraints interact with expressiveness. |
| 9 | Zwanzig — **Nonequilibrium Statistical Mechanics** | Statistical Mechanics | The theoretical justification for your TTM-MD framework. The two-temperature model is a *projected* description — it coarse-grains the full electron-lattice dynamics into two coupled temperature fields. Zwanzig tells you exactly what approximations this entails, what you're throwing away, and when those approximations break down. If your thermal spike dynamics look unphysical, Zwanzig gives you the framework to diagnose whether the problem is in the TTM coupling, the boundary conditions, or the potential. |
| 10 | Nastasi — **Ion-Solid Interactions** | Ion–Solid Interactions | The stopping power physics. How much energy does your ion deposit, at what rate, with what radial profile? If your simulated track radius or energy deposition doesn't match experiment, you need to understand the stopping power theory well enough to diagnose whether the problem is in the energy deposition model or in the atomistic response. |

### The Next 7: Books That Deepen Your Theoretical Interpretation

Once the Core 10 are solid, these give you the theoretical depth to go from "I can run and troubleshoot simulations" to "I can develop new theory and physical interpretations."

| Priority | Book                                                                        | Subject                              | What It Adds                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11       | Khomskii — **Transition Metal Compounds**                                   | Condensed Matter / Correlated Oxides | **Newly added — directly addresses your current DFT+U challenges.** Charge ordering, orbital ordering, the interplay between electronic and magnetic structure in correlated oxides. Your three-structure framework (physical/electronic/magnetic) and the SCF convergence difficulties in AFM Ce₇O₁₂ are exactly the physics Khomskii formalizes. This book explains *why* DFT+U has multiple minima and what each minimum means physically. |
| 12       | Cox — **Transition Metal Oxides**                                           | Condensed Matter / Correlated Oxides | **Newly added.** The Zaanen-Sawatzky-Allen classification (Mott-Hubbard vs. charge-transfer insulators) is the framework for understanding why your U_eff acts differently on CeO₂ vs. Ce₂O₃. Mixed valence, polaron formation, and the electronic structure of oxides from a physics perspective.                                                                                                                                            |
| 13       | Blundell — **Magnetism in Condensed Matter**                                | Magnetism                            | **Moved up from Year 3.** You need the foundations of magnetism — local moment formation, exchange, crystal field effects, magnetic ordering — now, not in two years, given that you're actively doing AFM calculations and choosing magnetic structures.                                                                                                                                                                                     |
| 14       | Tuckerman — **Statistical Mechanics: Theory and Molecular Simulation**      | Statistical Mechanics                | Deepens your understanding of integrators, thermostats, and the stat mech foundations of MD beyond what Frenkel & Smit covers. Particularly important for understanding the Langevin dynamics in your boundary layer.                                                                                                                                                                                                                         |
| 15       | Cai & Nix — **Imperfections in Crystalline Solids**                         | Defect Physics                       | The materials-science complement to Stoneham. Together they give you both the physics-theory and materials-science perspectives on defects.                                                                                                                                                                                                                                                                                                   |
| 16       | Ashcroft & Mermin — **Solid State Physics** (phonon and transport chapters) | Condensed Matter / Solid State       | The microscopic theory of electron-phonon coupling and thermal transport. Your TTM has parameters (g, kₑ, Cₑ, Cₗ) that come from solid-state physics. Ashcroft & Mermin tells you what those parameters mean microscopically and how they depend on temperature.                                                                                                                                                                              |
| 17       | Hall — **Lie Groups, Lie Algebras, and Representations**                    | Mathematics / Representation Theory  | The mathematical machinery behind your Allegro architecture. When you need to go beyond using Allegro to potentially modifying or extending the architecture, Hall gives you the representation theory to do it.                                                                                                                                                                                                                              |

### How This Maps to Troubleshooting

When something goes wrong in your research, here's what to reach for:

**"My MLIP gives unphysical forces in certain configurations"**
→ Goodfellow (is it an optimization/generalization problem?) → Alkauskas (is it a DFT+U reference data problem?) → Bronstein (is it an architectural expressiveness problem?) → Frenkel & Smit (is it a configuration sampling problem in training data?)

**"My thermal spike doesn't produce a track / produces too large a track"**
→ Nastasi (is the energy deposition model correct?) → Zwanzig (is the TTM coupling faithful?) → Ashcroft & Mermin (are the TTM parameters physical?) → Was (what does experiment actually show?)

**"My defect formation energies don't match literature values"**
→ Alkauskas (finite-size corrections? band-gap problem? wrong charge state?) → Martin (is your XC functional / U_eff appropriate?) → Stoneham (is your reference value actually reliable?)

**"My track shows unexpected oxygen sublattice behavior during quench"**
→ Stoneham (defect migration and recovery theory) → Chandler (is the free energy landscape driving what you see?) → Chiang (what does defect chemistry predict for this oxygen stoichiometry?) → Frenkel & Smit (is this a simulation artifact or real physics?)

**"My MLIP training loss won't converge"**
→ Goodfellow (learning rate, batch size, regularization) → Bronstein (architectural choices) → Alkauskas + Martin (is the training data internally consistent? are there DFT+U multiple-minima issues in your labels?)

**"My DFT+U SCF won't converge for a magnetic/charge-ordered state"**
→ Khomskii (what does the energy landscape of the charge-ordered state look like? is there frustration?) → Cox (is this a Mott-Hubbard or charge-transfer system, and how does that affect the SCF?) → Martin (mixing schemes, SCF algorithms) → Blundell/Goodenough (is the magnetic ordering you seeded physically reasonable for these exchange pathways?) → Fazekas (what does the Hubbard model predict about competing ground states at this filling?)

**"I don't know which magnetic ordering to use for a reduced ceria phase"**
→ Goodenough (apply the Goodenough-Kanamori rules to the Ce-O-Ce bond angles in your structure) → Blundell (understand what types of exchange dominate) → Jensen & Mackintosh (crystal field splitting of the Ce³⁺ 4f¹ state in the oxygen cage) → Khomskii (interplay of charge and orbital ordering with magnetic ordering)

---

## Semester-by-Semester Schedule

This schedule distributes all the primary readings across 12 semesters (Spring, Summer, Fall × 4 years). Each semester has a **theme** to keep your brain in a coherent zone rather than scattering across unrelated topics — this matters a lot for ADHD. Within each semester, books are listed in suggested reading order.

**Pacing guidelines:**
- **Spring / Fall semesters** (~4 months each, competing with coursework and research): 3–4 books. Focus on one "heavy" book plus 2–3 lighter or more applied ones.
- **Summer** (~4 months, your deep-reading season): 5–7 books. This is where you tackle the dense theoretical works and catch up on breadth.

**How to use this with ADHD:** Pick up the first book for the semester. When you finish it (or hit diminishing returns), move to the next. Don't look ahead to future semesters — that's future-you's problem. If you fall behind, slide books into the next semester rather than trying to cram. The schedule is a guide, not a prison.

---

### YEAR 1: FOUNDATIONS
*Build the theoretical scaffolding that everything else rests on.*

---

#### Year 1 — Spring
**Theme: Quantum Mechanics, Thermodynamics, and Getting Your DFT House in Order**

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Sholl & Steckel — **DFT: A Practical Introduction** | Quick, applied read. Gets you running calculations correctly while you build deeper theory. Read in the first 2–3 weeks. | 2–3 weeks |
| 2 | Zetilli — **Quantum Mechanics: Concepts and Applications** | Your QM re-activation pass. You built your original QM intuition on this book — use it to wake that knowledge back up before layering Sakurai's formalism on top. The early chapters will come back fast; slow down when you hit angular momentum coupling, perturbation theory, and scattering, which connect directly to your current research. Read alongside Sakurai: when Sakurai feels too abstract, ground yourself in Zetilli's worked examples. | Parallel with Sakurai |
| 3 | Sakurai — **Modern Quantum Mechanics** | Your primary QM backbone for the abstract operator-algebraic formalism. Work the problems — angular momentum and perturbation theory chapters are especially important for your work. This is a semester-long companion. With Zetilli running in parallel, Sakurai's formalism-first approach will click faster because you have the physical pictures underneath. | Full semester |
| 4 | Callen — **Thermodynamics and an Introduction to Thermostatistics** | Formal thermodynamics before stat mech. Read alongside Sakurai when you need a change of pace. Defect formation energies and phase stability depend on this formalism. | 6–8 weeks |
| 5 | Griffiths — **Introduction to Electrodynamics** | If not already mastered, skim for refresh. If solid, skip entirely. | 3–4 weeks or skip |

---

#### Year 1 — Summer
**Theme: Electronic Structure, Statistical Mechanics, and Radiation Materials (The Big Push)**

*This is your first major reading sprint. These are the three pillars of your research — electronic structure for your DFT+U reference, stat mech for your TTM-MD framework, and radiation materials science for the application domain.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Martin — **Electronic Structure: Basic Theory and Practical Methods** | The cornerstone DFT book. Dense but essential. Focus especially on the chapters covering exchange-correlation, pseudopotentials/PAW, and self-consistency. Return to specialized chapters later as needed. | 8–10 weeks |
| 2 | Chandler — **Introduction to Modern Statistical Mechanics** | Beautiful and concise. Ensembles, free energies, fluctuation-dissipation. Pairs naturally with Martin because you'll see the stat mech underpinning DFT (finite-temperature DFT, free energy perturbation). | 4–5 weeks |
| 3 | Was — **Fundamentals of Radiation Materials Science** | Your application domain bible. Point defect production, damage cascades, void swelling, radiation-induced segregation. Read this cover-to-cover — you need to speak this language fluently at national lab interviews. | 6–8 weeks |
| 4 | Giustino — **Materials Modelling Using Density Functional Theory** | Modern, pedagogical bridge between DFT theory and materials calculations. Read after Martin to consolidate. | 4–5 weeks |
| 5 | Deisenroth, Faisal & Ong — **Mathematics for Machine Learning** | Quick bridge read (freely available online). Maps the math you already know onto ML concepts. Read in a week or two to prepare for Goodfellow in the fall. | 1–2 weeks |

---

#### Year 1 — Fall
**Theme: Solid State Physics, Machine Learning Foundations, and Numerical Methods**

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Ashcroft & Mermin — **Solid State Physics** | The graduate standard. If you've already taken a solid-state course, focus on the chapters you need most: phonons (Ch. 22–25), electron-phonon coupling (Ch. 26), and transport (Ch. 13, 16). The phonon and e-ph coupling chapters directly underpin your TTM model. | Full semester (selective) |
| 2 | Goodfellow, Bengio & Courville — **Deep Learning** | ML foundations. Optimization, regularization, architectures. Read alongside Ashcroft when you need variety. | 6–8 weeks |
| 3 | Trefethen & Bau — **Numerical Linear Algebra** | Clean, modern, and surprisingly engaging. Eigensolvers, SVD, conditioning, iterative methods — you use these algorithms constantly in DFT and ML. | 4–5 weeks |

---

### YEAR 2: CORE DEPTH AND SPECIALIZATION
*Go deep in the areas that define your unique research identity: defect physics, equivariant ML, ion-solid interactions, and non-equilibrium stat mech.*

---

#### Year 2 — Spring
**Theme: Defect Physics, Correlated Oxides, and Magnetism**

*This semester is all about defects and the correlated-electron physics that governs your materials. By the end, you should think naturally in terms of formation energies, migration barriers, charge ordering, superexchange, and Kröger-Vink notation. The Khomskii and Blundell additions directly address the physics you're wrestling with in your DFT+U calculations right now.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Blundell — **Magnetism in Condensed Matter** | Start here for the magnetism foundations. Local moment formation, exchange mechanisms, crystal field effects, mean field theory, magnetic ordering. You need this *now* — you're actively choosing magnetic structures for your DFT+U calculations, and you need the conceptual framework to evaluate whether your choices are physically reasonable. Accessible and fast-paced. | 4–5 weeks |
| 2 | Stoneham — **Theory of Defects in Solids** | The condensed-matter-theory perspective on defects. Electronic states of defects, defect thermodynamics, optical signatures. Dense but foundational. | 8–10 weeks |
| 3 | Khomskii — **Transition Metal Compounds** | Charge ordering, orbital ordering, the interplay between electronic and magnetic structure in correlated oxides. This is the book that explains *why* your Ce₇O₁₂ AFM calculations are so hard — the coupled charge-spin-orbital degrees of freedom, the multiple SCF minima, the competition between different orderings. Read alongside or immediately after Stoneham. | 6–8 weeks |
| 4 | Alkauskas et al. — **Advanced Calculations for Defects in Materials** | Directly relevant to your DFT+U work: formation energies, finite-size corrections, band-gap problem, self-interaction in f-electron systems. Read the chapters most relevant to oxide defect calculations. | 4–6 weeks (selective) |

---

#### Year 2 — Summer
**Theme: Equivariant ML, Representation Theory, Ion-Solid Interactions, and Correlated Oxide Physics (The Identity-Defining Summer)**

*This is the summer where your two core competencies — ML and radiation physics — get their deep treatment, alongside the correlated oxide physics that governs your specific material system. The Hall + Bronstein pairing is the intellectual foundation for building Allegro-class architectures. Cox completes the correlated oxide picture started with Khomskii in the spring.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Hall — **Lie Groups, Lie Algebras, and Representations** | The mathematical foundations of equivariant networks. SO(3), SU(2), irreps, Clebsch-Gordan coefficients, spherical harmonics as representation theory. Work the exercises. This transforms your understanding of *why* Allegro works. | 8–10 weeks |
| 2 | Bronstein et al. — **Geometric Deep Learning** | Read immediately after (or during) Hall. The symmetry principles from Hall are exactly what Bronstein formalizes into a unified framework for neural network design. This pairing is where you develop the ability to *design* equivariant architectures. | 4–5 weeks |
| 3 | Cox — **Transition Metal Oxides** | The Zaanen-Sawatzky-Allen classification, crystal field theory in oxides, superexchange, mixed valence, metal-insulator transitions. Completes the picture Khomskii started in the spring. After this, you'll understand where CeO₂ (charge-transfer insulator) and Ce₂O₃ (Mott-Hubbard insulator) sit in the landscape of correlated oxides, and why DFT+U treats them differently. | 4–5 weeks |
| 4 | Nastasi, Mayer & Hirvonen — **Ion-Solid Interactions** | Electronic and nuclear stopping theory, range distributions, sputtering. The physics of your ion beams. | 5–6 weeks |
| 5 | Sickafus, Kotomin & Uberuaga — **Radiation Effects in Solids** | The ceramics-specific radiation damage volume. Chapters on fluorite-structure oxides are directly about your material system. | 4–5 weeks (selective) |
| 6 | Cai & Nix — **Imperfections in Crystalline Solids** | The materials-science complement to Stoneham (read in the spring). Excellent worked examples on point defects through dislocations and interfaces. | 5–6 weeks |
| 7 | MLIP review papers | Behler (Chem. Rev. 2021), Unke et al. (Chem. Rev. 2021), Deringer et al. (Adv. Mater. 2019). Read these as a concentrated block to map the MLIP landscape. | 2–3 weeks |

---

#### Year 2 — Fall
**Theme: Non-Equilibrium Statistical Mechanics and Simulation Methods**

*The theoretical framework for your TTM-MD simulations. By the end of this semester, you should understand — not just use — the two-temperature equations.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Zwanzig — **Nonequilibrium Statistical Mechanics** | Mori-Zwanzig projection operators, generalized Langevin equations, memory functions. This is the deep theory behind coarse-graining electronic DOF into a temperature field. Short but dense — every page matters. | 6–8 weeks |
| 2 | Tuckerman — **Statistical Mechanics: Theory and Molecular Simulation** | Unifies stat mech theory with simulation methodology. Integrators, extended-system methods, free energy methods. The most complete single book connecting the theory you're learning to the MD you're running. | 8–10 weeks |
| 3 | Hamilton — **Graph Representation Learning** | Graph neural networks: message passing, graph attention, spectral methods. Directly relevant since your MLIP operates on atomic neighbor graphs. Lighter read after Zwanzig and Tuckerman. | 3–4 weeks |

---

### YEAR 3: ADVANCED THEORY AND BROADER COMPETENCY
*Develop the theoretical sophistication to create new methods and the breadth to speak across communities.*

---

#### Year 3 — Spring
**Theme: Many-Body Theory, Nuclear Materials Context, and Correlated Electron Theory**

*Two threads: deepening your electronic structure theory (many-body methods beyond DFT, including the theoretical foundations of what DFT+U approximates) and building nuclear engineering/fuel context for NNSA credibility.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Fetter & Walecka — **Quantum Theory of Many-Particle Systems** | Green's functions, diagrammatic perturbation theory, self-energy. Understanding correlation effects beyond DFT — why DFT+U is an approximation and what it misses for Ce 4f physics. | 8–10 weeks |
| 2 | Fazekas — **Lecture Notes on Electron Correlation and Magnetism** | The Hubbard model in detail, Anderson impurity model, exchange mechanisms, magnetic ordering from a many-body perspective. DFT+U adds a Hubbard U — Fazekas tells you what the Hubbard model actually is, what its solutions look like, and what the mean-field (DFT+U) approximation captures and misses. Pairs perfectly with Fetter & Walecka. | 6–8 weeks |
| 3 | Olander — **Fundamental Aspects of Nuclear Reactor Fuel Elements** | Nuclear fuel materials science: UO₂ properties, fission products, fuel-cladding interactions. CeO₂ is studied because it's a surrogate for UO₂ — Olander tells you why the properties you compute matter. | 6–8 weeks |
| 4 | Kaxiras — **Quantum Theory of Materials** | QM specifically for materials: electronic structure, bonding, defects, surfaces. Bridges Sakurai's formalism to your materials problems. By Year 3 you'll appreciate the connections to many-body theory more deeply. | 5–6 weeks |

---

#### Year 3 — Summer
**Theme: Advanced Electronic Structure, Kinetics, and Probability (The Theory Summer)**

*This is the deep-theory summer. Many-body physics, beyond-DFT methods, and the foundations of inference.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Martin, Reining & Ceperley — **Interacting Electrons** | Beyond-DFT: GW, BSE, DMFT, QMC. What the next generation of electronic structure methods looks like and when DFT+U isn't enough. | 8–10 weeks |
| 2 | Balluffi, Allen & Carter — **Kinetic Processes in Materials** | Diffusion, nucleation, growth, coarsening. The defects your SHI simulations create undergo all of these processes during recovery. | 6–8 weeks |
| 3 | Mahan — **Many-Particle Physics** | Condensed matter many-body theory reference. The polaron chapter is directly relevant to your Ce³⁺ small-polaron physics. Read selectively — focus on polarons, Green's functions, and transport. | 6–8 weeks (selective) |
| 4 | Jaynes — **Probability Theory: The Logic of Science** | Transforms how you think about inference, model selection, and uncertainty. Directly relevant to Bayesian approaches in ML and UQ for MLIPs. Brilliant but opinionated — read as a thinker, not just a student. | 5–6 weeks |
| 5 | Bishop & Bishop — **Deep Learning: Foundations and Concepts** | The rigorous probabilistic complement to Goodfellow. Bayesian methods, uncertainty quantification. | 5–6 weeks |
| 6 | Porter, Easterling & Sherif — **Phase Transformations in Metals and Alloys** | Nucleation, spinodal decomposition, diffusional and diffusionless transformations. Phase stability in CeO₂₋ₓ. | 4–5 weeks |
| 7 | Dresselhaus, Dresselhaus & Jorio — **Group Theory for Condensed Matter** | Space groups, phonon symmetry, selection rules, band representations. Bridges the abstract group theory from Hall to your solid-state physics. Moved here from Year 3 Spring to make room for Fazekas. | 5–6 weeks |

---

#### Year 3 — Fall
**Theme: DFT Depth, Diffusion, and Ceramics**

*Consolidating your DFT expertise at the formal level while building materials-specific knowledge in ceramics and diffusion.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Parr & Yang — **DFT of Atoms and Molecules** | The formal foundations: variational principles, adiabatic connection, exact conditions on XC functionals. Where you learn *why* DFT approximations fail for strongly correlated systems. | 6–8 weeks |
| 2 | Chiang, Birnie & Kingery — **Physical Ceramics** | Defect chemistry in ionic oxides, Brouwer diagrams, nonstoichiometry, transport. Maps directly onto your CeO₂₋ₓ system. | 5–6 weeks |
| 3 | Shewmon — **Diffusion in Solids** | Deep treatment of diffusion mechanisms — vacancy, interstitial, grain boundary. The mathematics of Fick's laws and diffusion in ionic crystals. | 4–5 weeks |
| 4 | Szabo & Ostlund — **Modern Quantum Chemistry** | HF, CI, MBPT, coupled cluster. Wavefunction methods that benchmark your DFT. Lighter read after Parr & Yang since you already have many-body theory from Fetter & Walecka. | 4–5 weeks |

---

### YEAR 4: MASTERY, BREADTH, AND CAREER POSITIONING
*Round out your expertise, fill remaining gaps, and develop the breadth expected of a faculty candidate.*

---

#### Year 4 — Spring
**Theme: Lattice Dynamics, Transport Theory, and Nuclear Engineering**

*Phonons, thermal transport, and reactor physics — the physical context for your TTM model and your career positioning with NNSA.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Dove — **Introduction to Lattice Dynamics** | Phonon theory in depth. Your MLIP needs to reproduce phonon dispersions — this tells you why and how to validate them. Anharmonicity and thermal conductivity chapters are especially relevant. | 5–6 weeks |
| 2 | Ziman — **Electrons and Phonons** | Transport theory: Boltzmann equation, electron-phonon scattering, thermal conductivity. Directly relevant to the kₑ and g parameters in your TTM model. | 6–8 weeks |
| 3 | Stacey — **Nuclear Reactor Physics** | Neutron transport, criticality, reactor kinetics, burnup. The engineering context for nuclear materials requirements. | 5–6 weeks |

---

#### Year 4 — Summer
**Theme: The Landau & Lifshitz Semester + Mathematical Depth (The Theoretician's Summer)**

*This is the summer you level up as a theoretician. L&L volumes are terse, deep, and rewarding. Pair them with the mathematical foundations that support your most advanced work.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Landau & Lifshitz — **Statistical Physics, Part 1** | Phase transitions, fluctuation theory, Landau theory. A physicist's bible — terse but every sentence is load-bearing. | 6–8 weeks |
| 2 | Landau & Lifshitz — **Theory of Elasticity** | Stress, strain, elastic waves, thermal stresses. The continuum mechanics of your Langevin rim and stress wave propagation during thermal spikes. | 5–6 weeks |
| 3 | Landau & Lifshitz — **Physical Kinetics** | Boltzmann transport equation, electron-phonon coupling, thermal conductivity from kinetic theory. Underpins the parameterization of your TTM. | 5–6 weeks |
| 4 | Kreyszig — **Introductory Functional Analysis** | Banach and Hilbert spaces, operators, spectral theory. The mathematical language of QM and DFT made rigorous. Return to this alongside your more advanced electronic structure work. | 6–8 weeks |
| 5 | Boyd & Vandenberghe — **Convex Optimization** | Optimization foundations: convexity, duality, interior point methods. Freely available online. Useful for both ML training and DFT convergence analysis. | 4–5 weeks |
| 6 | Sigmund — **Particle Penetration and Radiation Effects** (Vol. 2) | Comprehensive SHI physics: Coulomb explosion model, thermal spike model, track formation. Your most specialized reference. | 4–5 weeks (selective) |
| 7 | Jensen & Mackintosh — **Rare Earth Magnetism** | Crystal field theory for f-electrons, exchange in lanthanides, magnetic structures. The specialized treatment of exactly the kind of magnetism your Ce³⁺ system exhibits. Read selectively — focus on crystal field chapters and the Ce-specific discussions. By this point you have the many-body theory (Fetter & Walecka) and general magnetism (Blundell) to appreciate this. | 4–5 weeks (selective) |

---

#### Year 4 — Fall
**Theme: Breadth, Characterization, and Putting It All Together**

*Final semester: fill remaining gaps, build experimental literacy for faculty interviews, and read the books that round out your profile.*

| # | Book | Notes | Est. Time |
|---|------|-------|-----------|
| 1 | Shalev-Shwartz & Ben-David — **Understanding Machine Learning** | ML theory: generalization bounds, PAC learning, VC dimension. Gives you the rigorous theoretical framework to understand *why* your models generalize (or don't). | 5–6 weeks |
| 2 | Hull & Bacon — **Introduction to Dislocations** | Dislocation theory for irradiated materials. Dislocation loops are a key feature of radiation damage microstructure. | 4–5 weeks |
| 3 | Cullity & Stock — **Elements of X-Ray Diffraction** | XRD — the primary tool for characterizing lattice parameter changes and crystallinity in irradiated ceria. You need to interpret this data. | 4–5 weeks |
| 4 | Williams & Carter — **Transmission Electron Microscopy** | TEM — the technique for directly imaging your SHI tracks. Read selectively: focus on diffraction contrast, HAADF-STEM, and EELS chapters. | 4–5 weeks (selective) |
| 5 | Nakahara — **Geometry, Topology and Physics** | Manifolds, fiber bundles, homotopy theory. The mathematical structures in geometric deep learning and topological classification of defects. A rewarding end-of-PhD read. | Ongoing/selective |

---

### Reference Shelf (Consult As Needed, Don't Schedule)

*These are Tier 2–3 books that don't need dedicated reading slots. Keep them accessible and pull them off the shelf when a specific research question demands them.*

**Mathematics:**
- Strang — Linear Algebra and Its Applications (refresh if needed)
- Horn & Johnson — Matrix Analysis (when you need matrix theory rigor)
- Golub & Van Loan — Matrix Computations (algorithmic reference)
- Cornwell — Group Theory in Physics, Vols. I & II (deeper group theory)
- Tung — Group Theory in Physics (special functions as representation theory)
- Rudin — Principles of Mathematical Analysis (when you need real analysis rigor)
- Reed & Simon — Methods of Modern Mathematical Physics (definitive QM math reference)
- Evans — Partial Differential Equations (rigorous PDE theory)
- Hairer, Nørsett & Wanner — Solving ODEs (integrator theory reference)
- Strikwerda — Finite Difference Schemes and PDEs (TTM discretization reference)
- Cover & Thomas — Elements of Information Theory (ML theory reference)
- Wasserman — All of Statistics (stats reference)
- Lee — Introduction to Smooth Manifolds (rigorous geometry)
- Nocedal & Wright — Numerical Optimization (optimization algorithms reference)

**Physics and Materials:**
- McQuarrie — Statistical Mechanics (encyclopedic stat mech reference)
- Reif — Fundamentals of Statistical and Thermal Physics (secondary stat mech)
- De Groot & Mazur — Non-Equilibrium Thermodynamics (irreversible thermo)
- DeHoff — Thermodynamics in Materials Science (materials thermo reference)
- Zetilli — Quantum Mechanics (now scheduled in Year 1 Spring alongside Sakurai; keep as ongoing reference afterward)
- Dreizler & Gross — DFT: An Approach to the Quantum Many-Body Problem (rigorous DFT)
- Kohanoff — Electronic Structure Calculations (practical DFT complement)
- De Boer — Semiconductor Physics (semiconductor perspective on ceria)
- Tilley — Defects in Solids (non-stoichiometric compounds)
- Ziegler, Biersack & Littmark — Stopping and Range of Ions (SRIM reference)
- Thompson — Defects and Radiation Damage in Metals (historical radiation damage)
- Wesch & Wendler — Ion Beam Modification of Solids (track formation, amorphization)
- Chen — Nanoscale Energy Transport (when Fourier-law breakdown matters)
- Jackson — Classical Electrodynamics (if you need dielectric response theory)
- Allen & Tildesley — Computer Simulation of Liquids (MD implementation reference)
- Rapaport — Art of Molecular Dynamics Simulation (parallelization, algorithms)
- Khachaturyan — Theory of Structural Transformations (microelasticity, ordering)
- Kröger — Chemistry of Imperfect Crystals (defect chemistry notation reference)
- Carter & Norton — Ceramic Materials (broad ceramics reference)
- Giacovazzo et al. — Fundamentals of Crystallography (rigorous crystallography)
- International Tables for Crystallography, Teaching Edition (space group reference)
- Murphy — Probabilistic ML, Vols. 1 & 2 (Bayesian ML/GP reference)

**Nuclear Engineering:**
- Shultis & Faw — Fundamentals of Nuclear Science and Engineering (broad nuclear reference)
- Cacuci (Ed.) — Handbook of Nuclear Engineering (encyclopedic)
- Konings (Ed.) — Comprehensive Nuclear Materials (encyclopedia, ceramics chapters)
- Jensen — Introduction to Computational Chemistry (landscape reference)

---

## Final Notes

**On the "experimentalist + theoretician" point**: You're right that the bar is rising. But the distinguishing feature of a top computational materials scientist isn't that they can do everything — it's that they can *bridge* scales and communities. Your unique value proposition is someone who can talk to the DFT people about exchange-correlation, talk to the ML people about equivariance and generalization, talk to the radiation effects experimentalists about track morphology, and talk to the nuclear engineers about fuel performance — and connect all of those conversations through simulation. The reading plan above is designed to give you that bridging capability.

**On mathematics as a lifelong endeavor**: Absolutely. The items in Section I will serve you for decades. The representation theory and functional analysis are especially important because they're the mathematical language that the most innovative work in both electronic structure theory and geometric deep learning is written in. Return to these books repeatedly as your understanding deepens.

**On ADHD and this schedule**: The semester structure is designed to work *with* your brain. Each period has a theme so you're not context-switching between unrelated fields. The summer blocks are longer and more intense — lean into hyperfocus during those months. During regular semesters, the lighter reading load accounts for the fact that you're also doing coursework and research. If a book grabs you and you want to go deep, go deep — that hyperfocus is a superpower, not a bug. If a book isn't clicking, put it down and move to the next one in the semester; you can always come back. The Reference Shelf exists specifically so that those books don't clutter your mental to-do list.

**Total count**: ~45 books on the active schedule across 12 semesters, plus ~35 on the reference shelf. The scheduled books are the non-negotiable core; the reference shelf is there when you need it, not when someone tells you to read it.
