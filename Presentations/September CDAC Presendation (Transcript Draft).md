

## [Slide 1] Background: Swift Heavy Ion Irradiation

**Swift heavy ions (SHI)** are energetic ions-typically MeV-GeV per ion and heavier than Si-that lose most of their energy to the target's electron system rather than by direct atomic collisions. In this "electronic stopping" regime the quantity of interest is the electronic stopping power $S_e=-(\mathrm{d} E / \mathrm{d} x)_e$, which can reach tens of $\mathrm{keV} \mathrm{nm}^{-1}$ along a nanometers-wide cylindrical path. The power density is deposited on femtosecond timescales, creating an ultra-dense population of excited electrons that subsequently transfer heat to the lattice within picoseconds. Because the energy is delivered to a narrow core, the material response is highly localized: depending on $S_{e,}$ temperature, and material properties, SHI can leave behind latent amorphous "ion tracks," generate point defects and small clusters, or, at lower $S_{e \text {, }}$ merely excite and heal without permanent damage.

Two complementary pictures are used to rationalize this response. The **inelastic (thermal) spike model** treats the electrons and lattice as coupled continua governed by a two-temperature framework:

$$
\begin{aligned}
& C_e \frac{\partial T_e}{\partial t}=\nabla \cdot\left(k_e \nabla T_e\right)-g\left(T_e-T_l\right)+A(r, t), \\
& C_l \frac{\partial T_l}{\partial t}=\nabla \cdot\left(k_l \nabla T_l\right)+g\left(T_e-T_l\right) .
\end{aligned}
$$


Here $A(r, t)$ represents the radial and temporal profile of the electronic energy deposition, $g$ is the electron-phonon coupling, and $C, k$ are heat capacities and conductivities. When $S_e$ is above a material-specific threshold, the model predicts a transient, nanometric melt that rapidly quenches, producing tracks or defect-rich rims. An earlier, complementary viewpoint-Coulomb explosion-emphasizes the very first tens of femtoseconds, when swift ionization can create strong radial electric fields and repulsive forces that help launch atoms before thermalization. In practice, modern interpretations acknowledge a continuum: prompt electrostatic forces seed atomic motion, after which electron-phonon coupling governs the ensuing thermal evolution. This is precisely the physics that TTM-MD (two-temperature model coupled to molecular dynamics) aims to capture.


Fluorite oxides such as ceria ( $\mathrm{CeO}_2$ ) are a particularly revealing case because their radiation response intertwines with redox chemistry. Ceria's cation can switch between $\mathrm{Ce}^{4+}$ and $\mathrm{Ce}^{3+}$ while creating or annihilating oxygen vacancies; SHI-induced ionization and subsequent nonequilibrium chemistry can thus alter the local defect equilibria as the thermal spike evolves. In regimes where the lattice briefly melts and re-solidifies, the presence of mobile oxygen vacancies and mixed valence sites can bias recovery pathways, stabilize defect clusters or loops, or, conversely, assist in rapid healing-outcomes that depend on $S_e$, temperature, and preexisting stoichiometry. For our study, this landscape motivates simulations that explicitly couple electronic energy deposition to lattice dynamics (TTM-MD) and that are sensitive to ceria's redox-defect degrees of freedom, so we can quantify when SHI produces stable tracks versus reversible excitation and how redox mediates that boundary.



## [Slide 2] Background: Swift-Heavy-Ion Irradiation of Ceria


The Lang group uses swift heavy ions (SHIs, MeV/u) to interrogate how ceria responds when energy is deposited dominantly to the electronic subsystem. In bulk and nanocrystalline CeO₂, SHIs do not amorphize the fluorite lattice; instead they generate point‑defect populations and microstrain that accumulate with fluence while the long‑range crystallinity is retained. In side‑by‑side comparisons with isostructural ThO₂ and UO₂, CeO₂ shows a stronger defect‑accumulation signature than ThO₂, reflecting the central role of redox chemistry in its response.

**Redox‑driven structural evolution.** Because Ce can toggle between Ce⁴⁺ and Ce³⁺, electronic‑stopping irradiation drives reduction in CeO₂, including the emergence of the oxygen‑deficient Ce₁₁O₂₀ phase under continued exposure. This phase evolution is accelerated in nanocrystalline material (enhanced oxygen loss), whereas ThO₂ (Th⁴⁺ only) shows little redox activity and correspondingly smaller irradiation‑induced swelling. Redox is the controlling variable for the fluorite oxides ([Lang et al., 2020, p. 509](zotero://open-pdf/library/items/B2P8H98X?page=26&annotation=ITZBWQ6N)).


**Grain‑size effects and macroscopic swelling.** The top panels of Fig. 25 (p. 27) compile X‑ray refinements of the unit‑cell parameter versus fluence for micro‑ vs nano‑CeO₂. The nano‑CeO₂ curves swell more and earlier than micro‑CeO₂, and the lower panel summarizes this trend as a larger “damage cross‑section” for the nanoform. This grain‑size sensitivity is one place where CeO₂ differs from ThO₂ (smaller nano–micro gap) and resembles nanocrystalline UO₂ in its susceptibility to volumetric change.


![[Screenshot 2025-08-21 at 5.16.05 PM.png]]



**Ion‑track‑scale defect morphology.** Microscopies show that individual SHI tracks in CeO₂ have a _==chemically zoned defect structure==_: an oxygen‑vacancy–rich core surrounded by a peripheral region enriched in oxygen interstitials ([Lang et al., 2020, p. 509](zotero://open-pdf/library/items/B2P8H98X?page=26&annotation=ETTPAJMM)). The lateral extent of this affected zone depends on ion energy and velocity (i.e., the ==velocity effect==), and on irradiation temperature—all of which modulate defect mobility and recombination.

**Local structure from neutron total scattering.** Using high‑flux pulsed neutron PDF measurements (a technique the group advocates precisely because SHIs can prepare bulk‑thickness damaged volumes), Lang and colleagues identify small peroxide‑like O–O clusters as probable products of oxygen interstitial aggregation in irradiated CeO₂. This provides a chemically explicit picture of the “interstitial‑rich” halo inferred from electron microscopy and connects track‑core/halo chemistry to redox.

**Defect recovery kinetics.** Isochronal annealing between 300–1100 K reveals two‑stage recovery in CeO₂ (contrasting with a single recovery stage in ThO₂). The group interprets this as evidence that the defect species and complexes produced by SHIs in CeO₂ are more diverse—again a consequence of the variable Ce valence and oxygen sublattice chemistry.


## [Slide 3] Background: Swift-Heavy-Ion Irradiation of Ceria

**Implications the Lang group draws for modeling and fuel surrogates.**

1. For CeO₂, **radiation tolerance in the electronic‑stopping regime is governed less by amorphization resistance and more by redox‑mediated defect chemistry and oxygen transport**—which dictates microstrain, swelling, and phase evolution (e.g., Ce₁₁O₂₀).
    
2. **Grain size matters:** nanoscale grains facilitate oxygen exchange, amplifying reduction and accelerating phase changes.
    
3. Because these mechanisms differ from UO₂ and ThO₂, the group cautions that **CeO₂ is an informative—but not one‑to‑one—surrogate** for UO₂ under SHI conditions; any surrogate use must explicitly account for differences in redox flexibility. These conclusions are consolidated in §1.15.4 and the comparative plots in **Fig. 25**.
    

**Takeaway:**  
Under swift‑heavy‑ion irradiation, ceria stays crystalline but reduces (Ce⁴⁺→Ce³⁺), develops oxygen‑vacancy cores with interstitial‑rich halos at the track scale, can transform toward Ce₁₁O₂₀ (especially in nanograins), and shows two‑stage recovery—making its SHI response a redox‑controlled defect‑chemistry problem rather than an amorphization problem.


## [Slide 4] MD Simulations of Heavy Ion Irradiation Processes in Ceria


Molecular dynamics (MD) is our atomistic microscope for swift-heavy-ion (SHI) irradiation. In a few hundred femtoseconds after an ion passage, electronic excitations shed energy into the lattice and launch a nanoscale thermal and pressure transient; within picoseconds the material either recrystallizes or "freezes in" a cylindrical track of disorder. Classical MD can capture the entire lattice response-melting, flow, density waves, quenching, and point-defect evolution-provided we feed it a realistic spatiotemporal map of the energy delivered from the electronic subsystem. The Lang review lays out both the phenomenology and the simulation playbook we'll use: direct "cylindrical heating" MD to build intuition, hybrid MD+thermal-spike workflows to incorporate electron-to-phonon coupling, and fully concurrent two-temperature MD (2T-MD) for self-consistent heat exchange and transport (see Sec. 1.15.3.3 and Fig. 22 on p. 508 for a textbook MD reproduction of a core-shell track in a- $\mathrm{SiO}_2$ ).

In the near term, we will run baseline MD track simulations in $\mathrm{CeO}_2$ using both our machine-learned interatomic potential and a well-vetted classical potential. The initial condition will be a short, nanometer-radius cylinder whose atoms receive a prescribed kinetic-energy profile mimicking the early electron-to-lattice energy transfer. Practically, we will map the electronic stopping $S_e=d E / d x$ for a chosen ion/velocity into a radially decaying energy density (Gaussian or measured/Monte-Carlo profile), randomize velocity directions, and let the lattice evolve with thermostatted boundaries to emulate bulk heat conduction (as standard in track MD; Sec. 1.15.3.3.1). This "instantaneous deposition" model cannot reproduce the velocity effect by itself, but it is fast, exposes sensitivity to potentials and melting points, and already predicts whether $\mathrm{CeO}_2$ forms continuous tracks or only dense point-defect halos-an issue known to depend on oxygen mobility and redox-mediated recovery in fluorite oxides.




## [Slide 5] Implementing the Two Temperature Model for MD Simulations



Our longer-term goal is a concurrent two-temperature MD implementation. Conceptually, we solve the electron and lattice heat equations on a cylindrical grid while the atoms evolve in MD, with energy exchanged via an inhomogeneous Langevin thermostat. In the notation of the review, the electron and lattice temperatures $T_e(r, t)$ and $T_a(r, t)$ obey the coupled diffusion equations (Eqs. (9)-(10), p. 502), driven by a source term $\boldsymbol{A}(r, t)$ that encodes the ion's radial energy deposition and coupled through the electron-phonon parameter $g\left(T_e\right)$. The coupling to atoms appears as friction and stochastic forcing in the MD equations of motion (Eqs. (11)-(12), p. 505). This 2T-MD scheme preserves the correct time ordering-fast radial electron transport, then delayed lattice heating-and naturally produces the observed dependence of track radius on ion velocity (the "velocity effect"), because higher-velocity ions spawn more energetic $\delta$-electrons that carry energy farther from the core before it thermalizes.

Implementation for $\mathrm{CeO}_2$ will proceed in three steps. First, we will generate $A(r, t)$ from stopping-power calculations and a Waligórski-type radial dose (or MC-based electron-cascade data when available), choosing ion/energy to match experiments on fluorites. Second, we will parameterize the electronic channel- $C_e\left(T_e\right), K_e\left(T_e\right)$, and $g\left(T_e\right)$-using literature/DFT trends for wide-gap insulators, then refine $g$ by matching the onset of melting in small calibration runs, as commonly done for oxides where $l^2= K_e / g$ must be inferred (Fig.17, p.503). Finally, we will validate against known SHI signatures: track radius vs. $S_e$ and ion velocity; the emergence (or absence) of a molten-core stage; and the quenched density profile. For glasses, MD reproduces the under-dense core/over-dense shell measured by SAXS (Fig. 22, p. 508); for fluorite oxides, we will look for oxygen-defect clustering near the core and rapid recrystallization at the periphery, behaviors the review links to the unusual radiation tolerance of $\mathrm{UO}_2 / \mathrm{ThO}_2$ and the redox-sensitive response of $\mathrm{CeO}_2$.

Once 2T-MD is in place, we can extend fidelity further by adding the "hole potential energy" channel that recent MC-MD workflows found essential for matching track sizes without ad-hoc boosts (Fig.16, p.502), and by running temperature-dependent simulations to capture the observed growth of track radius with irradiation temperature. The outcome will be a predictive MD framework that translates ion species, energy, and fluence into mesoscopic observables-track size, density gradients, and defect populations-directly comparable to TEM/SAXS/XRD datasets, and ready to test hypotheses about $\mathrm{CeO}_2$ 's redox-assisted damage recovery under electronic stopping.



## [Slide 6] Progress



## [Slide 7] Progress




## [Slide 8] Ceria Phase Diagram and Calibration of U Parameters in DFT

**Ceria and the Ce-O phase space.**
Ceria $\left(\mathrm{CeO}_2\right)$ sits at one end of the $\mathrm{Ce}-\mathrm{O}$ binary with Ce in the +4 state and the fluorite structure (Fm3m). Because Ce readily cycles between $\mathrm{Ce}^{4+}$ and $\mathrm{Ce}^{3+}, \mathrm{CeO}_2$ accommodates a wide range of non-stoichiometry, $\mathrm{CeO}_{2-x}$, by forming and ordering oxygen vacancies. As temperature rises and oxygen partial pressure falls, fluorite $\mathrm{CeO}_2$ progressively reduces through vacancy-ordered sub-oxides-classically indexed compositions such as $\mathrm{Ce}_{11} \mathrm{O}_{20}$ and $\mathrm{Ce}_7 \mathrm{O}_{12}$-before reaching the sesquioxide $\mathrm{Ce}_2 \mathrm{O}_3$ at the opposite end ( $\mathrm{Ce}^{3+}$ dominant). These ordered intermediates are the crystallographic fingerprints of the thermodynamic redox buffer $2 \mathrm{CeO}_2 \rightleftharpoons \mathrm{Ce}_2 \mathrm{O}_3+1 / 2 \mathrm{O}_2$ : at fixed $T$, lowering $\mathrm{pO}_2$ shifts the buffer to the right and stabilizes vacancy-rich phases; at fixed $p_{\mathrm{O}_2}$, raising $T$ has the same effect by entropically favoring oxygen release. In nanoscale ceria, the same transitions occur at milder conditions because surface oxygen is less tightly bound, a fact that matters both for catalysis and for radiation response.

**Why this matters for irradiation.**
In swift-heavy-ion (SHI) experiments, the electronic energy loss can drive local redox shifts that map directly onto this phase diagram: $\mathrm{CeO}_2$ shows oxygen-vacancy-rich track cores, oxygen-interstitial halos, and, under sufficient electronic stopping, even forms reduced sub-oxides such as $\mathrm{Ce}_{11} \mathrm{O}_{20}$. These observations underscore that "which phase you get" is governed by how much oxygen is expelled or rearranged in the ion track and therefore by the local $T, p_{\mathrm{O}_2}$-equivalents created by the spike. That coupling between structure and redox-vacancy-rich cores, interstitial shells, and sub-oxide formation-is summarized in Lang et al.'s review of SHI effects on fluorite oxides (see Sec. 1.15.4 and Fig. 25).


**Calibrating $U$ for DFT $+U$ in ceria.**
Standard semilocal DFT (e.g., PBE) delocalizes Ce 4f electrons, collapsing the $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ gap and mispredicting oxygen-vacancy energetics. DFT+ $U$ corrects this by penalizing fractional 4f occupancies, but the Hubbard parameter must be chosen with care because it sets the thermodynamics of the very redox steps that define the phase diagram. A practical calibration has three pillars:
1. **Electronic structure targets.** The empty $\mathrm{Ce}-4 \mathrm{f}$ manifold in stoichiometric $\mathrm{CeO}_2$ should appear as a narrow band in the gap, spatially localized on Ce, while reduced states should show self-trapped $4 \mathrm{f}^1$ polarons on $\mathrm{Ce}^{3+}$ with $\sim 1 \mu_B$ local moment and clear charge/spin localization (e.g., via Bader or projected-DOS analysis). The goal is "correct physics" of localization rather than any single target band gap number (reported optical gaps reflect different $\mathrm{O} 2 \mathrm{p} \rightarrow \mathrm{Ce} 4 \mathrm{f}$ vs $\mathrm{O} 2 \mathrm{p} \rightarrow \mathrm{Ce} 5 \mathrm{~d}$ transitions).
2. **Thermochemistry targets.** Tune $U_{\text {eff }}$ so that key redox energetics are reasonable: the formation energy of a neutral oxygen vacancy in bulk $\mathrm{CeO}_2$ (under O-rich and O-poor limits), the reduction energy $\mathrm{CeO}_2 \rightarrow \mathrm{CeO}_{2-x}+1 / 2 \mathrm{O}_2$, and the relative stability of $\mathrm{CeO}_2$ vs $\mathrm{Ce}_2 \mathrm{O}_3$. These metrics anchor the computed phase boundaries and defect equilibria that control where $\mathrm{Ce}_{11} \mathrm{O}_{20} / \mathrm{Ce}_7 \mathrm{O}_{12}$ appear. For additional cross-checks, compare to hybrid-DFT (HSE06) benchmarks or high-quality experimental thermochemistry when available.
3. **Structure and kinetics.** Verify that the relaxed lattice parameter of $\mathrm{CeO}_2$ is close to experiment, that $\mathrm{Ce}-\mathrm{O}$ bond disproportionation appears around vacancies (longer $\mathrm{Ce}^{3+}-\mathrm{O}$, shorter $\mathrm{Ce}^{4+}-\mathrm{O}$ ), and that oxygen migration barriers fall in a physically sensible range. These structural signatures go hand-in-hand with the vacancy ordering seen in the phase diagram and with irradiation-induced vacancy clustering.


**A working protocol.**
Start with a linear-response or constrained-RPA estimate of $U$ on $\mathrm{Ce}-4 \mathrm{f}$ to avoid purely empirical fitting, then refine $U_{\text {eff }}=U-J$ by scanning in small increments (e.g., 0.5 eV ). At each value, compute: (i) bulk $\mathrm{CeO}_2$ and $\mathrm{Ce}_2 \mathrm{O}_3$ total energies (to bracket the redox window), (ii) an isolated $V_0$ in a $\geq 2 \times 2 \times 2$ fluorite supercell with spin polarization and symmetry breaking to allow polaron formation, and (iii) the electronic density and DOS to confirm 4 f localization. Choose the smallest $U_{\text {eff }}$ that simultaneously yields robust $\mathrm{Ce}^{3+}$ polarons, realistic vacancy thermochemistry, and minimal over-opening of the gap; in practice, many studies converge in the mid-single-digit eV range for $\mathrm{Ce}-4 \mathrm{f}$ when consistent pseudopotentials are used. Report the final $U_{\text {eff }}$, the tested observables, and the supercell/k-mesh so that redox and transport predictionsespecially those you will compare to SHI-induced reduction pathways-are reproducible.

**Linking back to experiments.**
With a calibrated $U$, your DFT can (i) place the $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ energetics on the right scale to predict which vacancy-ordered sub-oxides stabilize at given $T, p_{\mathrm{O}_2}$, and (ii) quantify the driving forces for the vacancy-rich cores and interstitial halos observed in ion tracks. That makes the simulation outputs directly comparable to SHI data on ceria-e.g., the emergence of $\mathrm{Ce}_{11} \mathrm{O}_{20}$ under strong electronic stopping and the defect-chemistry asymmetry between the track core and periphery-closing the loop between the computed phase diagram and measured irradiation outcomes.


## [Slide 9] Generation of MLIP


**_Generation of a machine-learned interatomic potential (MLIP) for ceria ( $\mathrm{CeO}_2$ )_**

Ceria's utility in redox catalysis and ionic transport stems from facile formation of oxygen vacancies and the associated $\mathrm{Ce}^{4+} / \mathrm{Ce}^{3+}$ small polarons-features that make it challenging for fixed-form empirical force fields to remain reliable across bulk, surfaces, interfaces, and highly excited states. MLIPs close this gap by fitting a flexible functional form directly to quantum-mechanical data, delivering near-DFT accuracy at molecular-dynamics (MD) cost and scale. For our irradiation problem, this is crucial: swift-heavy-ion (SHI) impacts transiently drive matter far from equilibrium, into hot, defect-rich configurations that require both large cells and long times to capture. A high-quality MLIP lets us sample those states realistically and at scale, then couple them to the electron-lattice energy flow encoded by the two-temperature model. For background on why MLIPs are the right workhorse here, see recent reviews of the field's accuracyefficiency tradeoffs. PMC

**Training data strategy.** We will build the reference dataset with DFT+U (using the U calibration discussed earlier) to capture $\mathrm{Ce}-4 \mathrm{f}$ localization, spanning: (i) stoichiometric fluorite $\mathrm{CeO}_2$ and reduced $\mathrm{CeO}_{2-\mathrm{x}}$ across broad strain and temperature ranges; (ii) point defects and clusters (isolated VO, di-/tri-vacancies, vacancy-polaron complexes) and their migration pathways; (iii) low-index surfaces [(111), (110), (100)] and common extended defects; (iv) distorted, molten, and amorphous states to cover the "thermal spike" envelope; and (v) small compositional excursions (H, He, noble gases) relevant to irradiation. The importance of explicitly sampling oxygen-vacancy kinetics with ML force fields has been demonstrated for ceria, where a neural-network potential reproduced non-Arrhenius vacancy migration at elevated temperatures-exactly the rate-controlling process our SHI simulations will need. PMC Likewise, moment-tensor potentials (MTPs) trained on ab initio data have proven accurate for ceria surface free energies up to $\sim 2000 \mathrm{~K}$, underscoring that a single MLIP can remain predictive across wide thermodynamic ranges.


**Active learning and coverage.** The data engine will alternate between ML-driven MD and DFT labeling: (1) seed the model on a small, diverse set (bulk/surfaces/defects); (2) run exploratory NPT/NVT MD from 300-4000 K, impact-mimicking quenches, and NEB/CI-NEB samplings for defect migration; (3) flag configurations with high extrapolation grades and add them to the queue; (4) retrain and iterate until error saturates on an independent test set including properties we care about (elastic constants, thermal expansion, surface and defect free energies, vacancy and polaron migration barriers). The D-optimality/LOTF approach behind MLIP-3 has a strong track record for building reliable potentials with minimal labeling cost and will keep the dataset focused on "unknown unknowns" our SHI use-case exposes.


**Ceria-specific validation and transfer.** Beyond standard energy/force/stress metrics, we will validate against ceria observables: equation of state; phonons and heat capacity; surface free energies [(111) > (110) trends] across T; oxygen-vacancy formation energies and charge-localization patterns consistent with DFT+U/HSE baselines (typical bulk VO formation energies $2.5-3.5 \mathrm{eV}$ ); and vacancy/polaron diffusion coefficients. APS Links PMC American Chemical Society Publications Where helpful as a comparator, we will benchmark against a recent classical/reaction-field potential (e.g., ReaxFF for stoichiometric and reduced ceria) to quantify the MLIP's gains in redox fidelity and transferability.


**Outcome for the irradiation workflow.** The resulting MLIP will enable million-atom, nanosecond-scale simulations of SHI-induced thermal spikes and recovery, while remaining faithful to the defect chemistry that controls energy dissipation and microstructural evolution. It also slots cleanly into our two-temperature MD: electrons deposit energy along the ion track; the MLIP governs the lattice's anharmonic response, defect generation and migration, and-once we adopt the charge-aware variantnonlocal redox rebalancing driven by steep, transient gradients.




## [Slide 10] Benchmarking MLIP and Classical Potential on Some Simple Tests



**Benchmarking a Machine-Learned Interatomic Potential (MLIP) against a Classical Potential for $\mathrm{CeO}_2$ : simple, discriminating tests**

The point of a benchmark is not to be encyclopedic, but to be surgical: a handful of inexpensive calculations that expose the strengths and limits of two force fields in the physics we actually care about. For ceria-especially in the context of swift-heavy-ion (SHI) effects-those physics include the integrity of the fluorite lattice across large temperature excursions, oxygen-defect thermodynamics and transport, and the ability to quench from a transient liquid back to a crystalline solid with realistic residual disorder. SHI tracks are now understood as an ultrafast thermal process with local melting and quenching; modeling therefore leans on thermal-spike/2T-MD ideas and on molecular dynamics that can faithfully reproduce melting, heat transport and recrystallization in oxides. That sets the bar for what our potential must do well.

**Philosophy and scope**

We run the MLIP and a representative "classical" ionic force field (e.g., Buckingham-type with long-range Coulomb and, if applicable, a core-shell polarizability) side by side, keeping cells, kinematics, thermostats/barostats and analysis identical. All comparisons are against DFT(+U) reference calculations assembled specifically for the benchmark, not against each other, so that any superiority is anchored to first-principles targets. Because $\mathrm{CeO}_2$ chemistry is redox-active, we explicitly include tests that require the model to handle $\mathrm{Ce}^{4+} / \mathrm{Ce}^{3+}$ changes and oxygen polarons; this is where conventional fixed-charge force fields often struggle and where MLIPs trained to DFT+U can, in principle, excel.



_1) Crystal physics at 0 K : equation of state and elasticity_

We start with the bedrock. Fit a third-order Birch-Murnaghan equation of state to E(V) from $\pm 6-8 \%$ volumetric strain around equilibrium and extract $a_0$ and $B_0$. Compute $C_{11}$, $C_{12}$, and $C_{44}$ by small symmetry-preserving strains. These tests are cheap, but they are surprisingly predictive: if the force field gets the curvature of the E-V curve wrong, it will also misreport phonon velocities, heat capacity trends, and shock/thermal responses downstream. Acceptance guidelines can be pragmatic rather than absolute (e.g., $\left|\Delta a_0\right| \lesssim 0.5 \%,\left|\Delta B_0\right| \lesssim 10 \%$, and each $C_{i j}$ within $\sim 10-15 \%$ of DFT). The MLIP should typically track DFT more closely; classical models sometimes hard-code a too-stiff oxygen sublattice to mimic missing many-body effects.



_2) Oxygen-defect thermodynamics and polarons_

Radiation tolerance, non-stoichiometry, and redox couple together in ceria. We benchmark:
- Isolated oxygen vacancy $V_O^{* *}$ formation energy in charge-neutral supercells with two adjacent Ce reduced to $\mathrm{Ce}^{3+}$ (DFT+U target).
- Oxygen interstitial and the O Frenkel pair formation energy.
- Schottky defect energy.

We then check localization: the relaxed structure should prefer two nearby $\mathrm{Ce}^{3+}$ (small polarons) with realistic $\mathrm{Ce}-\mathrm{O}$ bond elongation, not a delocalized electron gas. Classical fixed-charge potentials frequently mis-rank these states or cannot represent them at all; an MLIP trained to redox-rich DFT+U data should capture both the energetics and the local distortions. This block is decisive because SHI exposure in fluorites produces copious oxygen point defects and their recovery depends sensitively on the migration and stability of these species (see the MD section and discussion of oxygen mobility differences in fluorites on pp. 24-25 of the review).


_3) Migration barriers along physically relevant paths_

Use climbing-image NEB to extract barriers for oxygen vacancy migration along the canonical <110> hop in fluorite $\mathrm{CeO}_2$ and for interstitialcy-type motion at higher O contents. Report both the barrier and saddle geometry. For SHI-recovery proxies, the absolute value is less important than internal consistency across local environments (bulk vs near a defect cluster). MLIPs with robust local descriptors typically capture barrier trends well; classical models can under- or over-bind the saddle due to short-range pair forms.


_4) Finite-T structure: thermal expansion, heat capacity and stability_

Run NPT MD from $300-1500 \mathrm{~K}$ to obtain $a(T)$ and the linear expansion coefficient $\alpha(T)$. Watch for spurious phase changes, oxygen sublattice instabilities, or unphysical negative $\alpha$ at intermediate T. Then, quench from just below melt to 300 K and check whether the correct fluorite topology is recovered or if the system glassifies. These checks target the "recrystallization ability" that MD studies have identified as central to track survival and healing in oxides. In materials that resist track amorphization, efficient lattice heat conduction and facile structural recovery are key; our potential must reproduce that qualitative behavior to be trustworthy for SHI proxies (see the discussion and Fig. 21-22 on track densification, core-shell structures, and quench kinetics).


_5) Melting point and latent heat (coexistence test)_

A short two-phase coexistence simulation yields $T_{\mathrm{m}}$ and the enthalpy of fusion. SHI tracks pass through a transient melt; both the inelastic thermal-spike picture and 2T-MD workflows assume that the interatomic potential gets melting and quench energetics "right enough" to capture liquid radius and resolidification trends. If a model's $T_{\mathrm{m}}$ is wildly off, track radii and recovery will be unphysical when we later deposit energy cylindrically. The review's modeling section emphasizes that the fidelity of melting/recrystallization controls how much permanent disorder a track leaves behindexactly what we need to model in $\mathrm{CeO}_2$.

_6) Surfaces and cleavage (low-index planes)_

Compute surface energies for $\{111\},\{110\}$, and $\{100\}$ and the $\{111\}$ cleavage energy. This guards against over-cohesive behavior that hides in bulk fits but appears during cascade-like local decohesion. Surface energetics also matter for pore/hillock formation at impact sites, a signature observed in many oxides under SHI irradiation.


_7) A minimal SHI-proxy: "hot cylinder" and 2T-MD coupling_

Finally, a simple, fast proxy for electronic stopping is to inject energy into a nanocylinder (radius ~1-2 nm) and watch its evolution with and without a two-temperature coupling term to an electronic bath. We do not try to match a specific dE/dx, only to compare qualitative responses:
- maximum liquid radius and its scaling with deposited energy density;
- quench speed and degree of recrystallization;
- residual point-defect density and clustering.

The review summarizes how track size grows with energy density and how materials with efficient heat conduction or easy recrystallization resist permanent amorphization. A potential that overheats, fails to recrystallize, or produces unrealistically porous wakes is a red flag for SHI applications (see the i-TS/2T-MD framework and trends compiled on pp. 19-23 and the materials-specific recovery behavior on pp. 24-26).


_Interpreting outcomes_

If the MLIP is well trained on redox-rich DFT+U data, it should outperform the classical model on oxygen-defect energies, polaron localization and migration barriers, and it should better track DFT in the E-V curve. Classical models often look competitive for $a_0$, $B_0$ and even $C_{i j}$ (they were tuned there) and can be numerically robust at long timesteps, but they frequently stumble on any test that requires variable charge or bond order. For SHI-proxies specifically, beware two failure modes: (i) "sticky" liquids that do not recrystallize on quench (too little configurational freedom or overstabilized defects), and (ii) liquids that explode into over-porous tracks (under-cohesive oxygen network). The SHI literature shows that track formation in oxides is governed by an interplay of transient melting, electron-phonon coupling, and defect mobility; our benchmarks are chosen to illuminate exactly those levers in $\mathrm{CeO}_2$.

_Practicalities and reporting_

Keep the cells small ( $2 \times 2 \times 2$ and $3 \times 3 \times 3$ fluorite supercells) for DFT reference affordability; for migration and SHI-proxy runs, confirm that results are stable to doubling the box. Use identical thermostats/barostats, cutoffs and Ewald/PPPM tolerances; quote uncertainties from short replicas with different seeds. For each test, publish three numbers: MLIP error vs DFT, classical error vs DFT, and the computational cost per atom-step. This makes the trade-off transparent: an MLIP that is $3-5 \times$ heavier than a pair potential but collapses defect-energy errors from $\sim 0.6-1.0 \mathrm{eV}$ to $\sim 0.1-0.2 \mathrm{eV}$ is clearly worth it for irradiation MD where the physics lives in defects and their recovery.



_Why this particular suite?_

Because it maps cleanly onto what SHI physics demands from a potential. The review's modeling section shows that track formation is a thermal, radial, time-resolved problem in which melting, heat flow, and recrystallization compete; MD studies further highlight the special role of oxygen mobility and defect kinetics in fluorites. A benchmark that nails bulk curvature, oxygen defect chemistry and high-T/quench behavior will give us defensible confidence when we later couple the force field to an inelastic thermal-spike or 2T-MD driver to simulate heavy-ion impacts in ceria.

Note on figures in the review used for context: the i-TS/2T-MD framework and its parameters are summarized on pp. 19-21, including Eqs. (9)-(12); trends linking track size, melting/quench, and material class are discussed on pp. 20-26 with illustrative Figs. 21-22 showing densification and quench morphologies. These provide the physical justification for prioritizing melting, heat transport, and oxygen-defect kinetics in our benchmark.




