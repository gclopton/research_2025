




- **Describe problem and previous work**
	- Describe a problem
	- How can this study help
	- What has been learnt from previous studies (especially collaborators)? What does preliminary work suggest?
- **Limitations of current computations methods**
	- How have computational studies of this type been carried out in the past
		- Classical potentials
		- Machine learned potentials (MLIPs)
- **Describe plans**
	- What will the requested allocation be used for?
	- Add table for time estimate
- **Table for time estimate**
	- **Bridges-2 Regular memory**
		- _MD Calculations_
			- Materials: Which materials:
			- Temperatures per material:
			- GPU hours per long-timescale run:
			- Sub-Total:
		- _Training of MLIPs_
			- ??? Don't know what rows to put here
			- Sub total


# Theoretical Background

## Physics
- Density Functional Theory
- SHI Track Physics
- Statistical Mechanics
- Defect Calculations
- Thermochemistry of Defect and Phase formation in Ceria
- Redox chemistry
- Diffusion physics

## Machine Learning


# Track formation in other materials
- What other classes of materials have SHI track formation studies been done in?
	- [I don't know the best way to try to create categories. But maybe depending on which group a material falls under, you can predict certain things about track formation in that material such as ease of track formation in that material.]
	- Metals like iron?
	- Insulators like diamond?
	- Semiconductors like cerium oxide, thorium oxide, uranium oxide
		- [Maybe we need different sub-groups for this?]


# Track formation in Ceria
- Track radius (core cs core+shell)
- Density Change
- Swelling (Δa/a) microstrain
- defect populations (Ce³⁺ fraction; reduced phases like Ce₁₁O₂₀)
	- Chemical/defect-chemistry state that behaves like a phase variable: $\delta$ in $\mathrm{CeO}_{2-\delta}, \mathrm{Ce}^{3+}$ fraction, oxygen vacancy/interstitial populations, and whether defects cluster or order.
This is the sense that is especially relevant for $\mathrm{CeO}_2$ vs $\mathrm{ThO}_2$ : $\mathrm{CeO}_2$ can change valence and stoichiometry locally, so the "state" is not just temperature and strain; it's also redox/stoichiometry.
- Experimental Observables to target for validation
	- TEM/HRTEM, XRD, PDF, Raman, XAS/XPS

## SHI fundamentals
- Electronic vs Nuclear Stopping (focus on electronic stopping regime for SHI)
- Track-Formation stages and timescales (ionization -> electron transport -> lattice heating -> Quench -> long-time annealing)
- Competing Theoretical Mechanisms
- i-TS / TTM framework (equations + parameters + what it predicts)
	- If you want to deepen this part mathematically beyond classical i-TS/TTM, there is also a line of work that couples an inelastic thermal spike picture to a **phase-field** description so that “amorphization vs recrystallization vs stress” becomes an explicit state evolution rather than an after-the-fact interpretation. (https://pubs.rsc.org/en/content/articlelanding/2022/cp/d2cp04061a)
- ATSM scaling (thresholds, velocity effect)
- Coulomb explosion + exciton/non-thermal concepts (when/why invoked)
- What each model would predict for _fluorite oxides specifically_ and what parameters you’d need. [APS Links+2UCL Discovery+2](https://link.aps.org/doi/10.1103/PhysRevB.73.184107?utm_source=chatgpt.com)





## Cross-material survey: "Track formation regimes"
- metals (rapid electronic heat conduction; often weaker/labile tracks)
- amorphous insulators/glasses (robust tracks)
- ionic crystals/oxides (core–shell, defect-rich tracks)
- ceramics with high radiation tolerance (fluorite, pyrochlore, etc.)
	- Fluorite Oxides
		- CeO₂: what is known
			-  core–shell morphology; oxygen displacement length scales [MDPI](https://www.mdpi.com/2412-382X/5/2/19)
			- peroxide-like oxygen defect clusters in CeO₂ [RSC Publishing](https://pubs.rsc.org/en/content/articlelanding/2017/ta/c7ta02640d)
			- swelling/microstrain and links to Ce³⁺ + V_O [MDPI](https://www.mdpi.com/2412-382X/5/2/19)
			- (non-)amorphization evidence [AIP Publishing+1](https://pubs.aip.org/aip/jap/article-abstract/122/20/205901/154080?utm_source=chatgpt.com)
			- threshold estimates and velocity/flux/grain-size effects [MDPI](https://www.mdpi.com/2412-382X/5/2/19)
		- ThO₂: what differs
			- less disorder under comparable SHI conditions [RSC Publishing](https://pubs.rsc.org/en/content/articlelanding/2017/ta/c7ta02640d)
			- annealing window for oxygen-defect annihilation and near-complete recovery by ~750 °C [Impact](https://impact.ornl.gov/en/publications/thermal-defect-annealing-of-swift-heavy-ion-irradiated-thosub2sub)
			- interpret through “no valence flexibility” vs CeO₂ (tie to redox framework)




# Computational Methods and Modeling


## What We are Modeling
- **Primary Track Formation (fs -> ps)**
	- electronic excitation
	- energy transfer to lattice
	- onset of melting/disordering
- **Quench and "Frozen-In" Track Structure (ps -> ns)**
	- recrystallization vs amorphization
	- density change
	- defect clustering
	- core-shell morphology
- **Post-Track Evolution (ns-> Seconds)**
	- oxygen diffusion, vacancy clustering/ordering
	- redox relaxation ($Ce^{3+} / Ce^{4+}$)
	- phase separation/precipitation
	- recovery annealing



## Stoichiometric Variants to be Studies

###  $CeO_{2}$
- baseline ($\delta = 0$)


###  $Ce_{11} O_{20}$
- mild-moderate reduction
- fluorite-related ordered vacancies

###  $Ce_{7} O_{12}$
- more reduced than $Ce_{11} O_{12}$
- fluorite-related ordered vacancies


###  $Ce_{2} O_{3}$
- extreme reduction
- potentially different polymorph



### Notes
- You don't need to simulate track in each bulk phase to model redox in tracks
- For SHI tracks that start in $\mathrm{CeO}_2$, the track core is formed by ultrafast reduction + oxygen rearrangement during quench. 
	- On the ps-ns timescale, the core is far more likely to resemble "fluorite with lots of vacancies + reduced cations" than to fully reconstruct into the stable bulk polymorph of $\mathrm{Ce}_2 \mathrm{O}_3$. 
	- Computationally, its often better to treat stoichiometry as a continuous variable $\delta$ inside a fluorite lattice (oxygen removed / expelled), and use $\mathrm{Ce}_{11} \mathrm{O}_{20}, \mathrm{Ce}_7 \mathrm{O}_{12}, \mathrm{Ce}_2 \mathrm{O}_3$ mainly as:
		- benchmark structures for potential validation (can the model represent the reduced chemistry/ordering?) and
		- candidate long-time/overlap outcomes (does repeated damage + relaxation drift toward orderedvacancy motifs?)


## Computational Parameters

#####  $S_e \text { at the depth of interest }$
- record $S_{e}(z)$ and $S_{n}(z)$ so you can show system is in electronic-stopping regime

##### Ion Velocity $v$ (or energy per nucleon MeV/u)
- Tracks can differ at the same $S_{e}$ depending on ion velocity because the delta-electron distribution and early energy transport differ.

##### Radial Dose / Source Radius Parameter $r_{0}$
- Experiments don't directly report $r_{0}$
- Two conditions with the same $S_{e}$ but different $r_{0}$ can produce different peak $T_{l}(r,t)$ and hence different track radii.
- Keep $r_{0}$ fixed once calibrated for a given velocity class

##### Grain Size / Microstructure Class
- Grain size changes swelling and microstrain behavior


##### Irradiation Temperature and Thermal History


##### Initial Stoichiometry
- $\delta$ and $\mathrm{Ce}^{3+}$ fraction as state variables

##### Ion species

##### Incidence angle


##### Beam Flux



## Phase 1: Calculation of Stopping Power and Radial Energy Deposition Profile
- Use SRIM (or equivalent power database) to obtain $S_{e}(z)$. Confirm that we are in an electronic stopping-dominated regime for chosen ion energies
- Don't stop at a single scalar. Need radial dose profile $S(r,t)$
- Use electron-transport / radial dose model (analytic or Monte-Carlo) to justify $r_{0}$ and the tail. Propagate this into TTM


## Phase 2a: VASP Calculations (Skip to Phase 2b for Classical Potentials)
- **Convergence tests:** Do plane-wave and k-point convergence. The target should be forces (not total energy is converged).
- Pick a single VASP parameter set that is consistent across all structures.
- Note: For large supercells used to generate disordered snapshots, it's common to end up in a regime where $\Gamma$-only (or a very sparse mesh) is acceptable, but it needs to be justified by convergence on a smaller representative cell at same settings.
- Choose U parameter for DFT + U calculations. Validate against a small property (lattice parameter/elastic response, oxygen vacancy formation energy trends, localization of the reduced electron (Ce3+^{3+}3+-like site), and (if you can afford it) a migration barrier or two)


### DFT-MD Computations
- Generate configurations from each stoichiometry/phase. This includes
	- Equilibrium crystals: $\mathrm{CeO}_2, \mathrm{Ce}_{11} \mathrm{O}_{20}, \mathrm{Ce}_7 \mathrm{O}_{12}, \mathrm{Ce}_2 \mathrm{O}_3$ (relevant polymorph) at several strains/volumes.
	- Defects and reduction motifs: $V_{\mathrm{O}}, \mathrm{O}$ interstitials, Frenkel pairs, clusters, and locally reduced environments ( $\mathrm{CeO}_{2-\delta}$ supercells with different vacancy arrangements).
	- High-T disordered states: melted and rapidly quenched structures, plus "near-melt" high-T snapshots.
- DFT+U BOMD are true track temperatures / melting is usually too expensive for the amount of data needed here.
	- The standard workaround used in may extreme event MLIP projects is
		- Generate melt/quench and highly defected structures with a cheaper model (classical potential or early MLIP)
		- Then compute VASP-single-point energies on carefully selected subset of those snapshots (active learning helps a lot here)

### Training Allegro
- Keep datasets organized by source (phase\defect/temperature), but combine them into one training corpus for a single Ce-O model.
- Split train/validation/test in a way that avoids leakage (e.g., split by trajectory and by structure family, not by randomly shuffling frames)




## Phase 2c: Electron-Lattice Transport with TTM/i-TS
- Implement a cylindrical TTM/i-TS solver for $T_{e}(r,t)$ and $T_{l}(r,t)$ with temperature dependent $C_e\left(T_e\right), k_e\left(T_e\right), g\left(T_e, T_l\right)$ and latent heat / melt criterion
- From this, obtain track radius thresholds, velocity effect, and compare material-to-material differences in terms of electron transport coupling
- Provide the correct heating history for the MD stage
- Ensure the simulation domain and boundary treatment are physically defensible:
	- sufficiently large lateral size (many times the expected track radius) so that thermal and elastic waves do not reflect back into the core,
	- a far-field heat sink region (your rim-Langevin idea is fine as long as you justify the thickness and damping),
	- careful thermostat policy: don't "thermostat the track," thermostat the bath.
- As verification layer, run a standalone TTM/i-TS calculation for the same source $S(r,t)$ and confirm LAMMPS's electron field reproduces the same $T_{e}(r,t) / T_{l}(r,t)$ envelopes for matched parameters. This will show that the coupling is not a black box.

## Phase: 3 Atomistic track formation with TTM-coupled MD in LAMMPS
- Use 2T-MD / TTM-MD to keep track of electron field and lattice coupled self-consistency during the spike and quench
- Use LAMMPS fix ttm/grid (electrons on a grid + diffusion + coupling to atoms)


### Classical and Machine Learned Potentials


The potentials that are used in this project are described below:

#### Classical Potentials

##### Cooper-Rushton-Grimes (CRG) Many-Body Actinide-Oxide Potential 
- Is a potential build to reproduce thermophysical properties (lattice parameter, bulk modulus, enthalpy, heat capacity) from 300-3000K across a family that explicitly includes $CeO_{2}, ThO_{2}, UO_{2}$
- The thermal spike will take the system into a high-temperature regime. CRG is widely used in nuclear-oxide MD for high-T behavior.
- **Limitation:** It will not provide dynamic redox/charge transfer. It's not a variable-charge model; it won't spontaneously create $\mathrm{Ce}^{3+}$ sites.


##### Rigid-Ion Buckingham-Coulomb Potential
- Chose from literature that benchmarks ceria potentials
- Use Grimes-type potentials as they offer the best overall combination of fidelity and applicability across properties like lattice constants, thermal expansion, dielectric properties, oxygen migration energy, and mechanical properties.
- This potential will act as the control for what we gain with MLIPs and with reactive/variable-charge models
- **Limitation:** Buckingham forms are known to have issues at short ranges. Protect agains the Buckingham short-range pathology in extreme events by adding a short-range repulsive correction/spline or blending to ZBL at very short distances.


##### Broqvist ReaxFF Parametrization for $CeO_{2}$ and partially reduced $CeO_{2 - x}$
- Potential was explicitly fit/validated for oxygen chemistry across bulk and surfaces and is distributed via OpenKIM / LAMMPS workflows
- Strength: Is strongest classical way to give simulations a shot a dynamic reduction/oxidation behavior (via charge equilibration and active bonding)
- Weakness: ReaxFF accuracy can vary outside its training envelope. The thermal spike used in this paper wil be in the extreme regime


##### DIPPIM
- **strength:** explicitly treats reduced/doped states
- **Weakness:** DIPPIM is a dipole-polarizable ion model, and is not always a drop-in "pair_style + file" inLAMMPS the way Buckingham or ReaxFF is.




#### Machine Learned Potentials

Train one unified Ce-O potential (not separate models for each phase), because track cores will sample a continuum of local environments between these endpoints. Where TTM provides energy flow (but not oxidation states).

##### Allegro
- Use allegro as the production MLIP for the largest TTM-MD runs because it was build specifically to be strictly local and to scale with MPI in LAMMPS via `pair_allegro`
- **strength:** Track simulations what $10^{5} - 10^{7}$ atoms and long trajectories. A message-passing GNN (e.g., NequIP in its LAMMPS form) is commonly constrained (e.g., limited MPI scaling), while Allegro is explicitly positioned to overcome that by being strictly local in a way that supports parallel execution in LAMMPS.


##### 4th generation high-dimensional neural network potential (4G-HDNNP) with charge equilibration (iQEq) in LAMMPS via n2p2
- This model handles global charge redistribution and electrostatics.
- Charge equilibration based on environment-dependent electronegativities
- Use the interative QEq (iQEq) implementation that was specially implemented in LAMMPS for 4G-HDNNPs (with n2p2) to avoid the unfavorable cubic scaling of direct QEq solves


##### Pitfalls to be Aware of During Training of MLIPs
- Equilibrium crystals for each stoichiometry $\left(\mathrm{CeO}_2, \mathrm{Ce}_{11} \mathrm{O}_{20}, \mathrm{Ce}_7 \mathrm{O}_{12}, \mathrm{Ce}_2 \mathrm{O}_3\right.$ polymorph(s)) with strains and volumes.
- Defects across stoichiometry: oxygen vacancies, interstitials, Frenkel pairs, defect clusters, vacancy ordering motifs.
- High-temperature AIMD snapshots up to and through melting and rapid quench (this is where track cores live).
- Short-range repulsion coverage: either by explicit high-energy close-approach configurations in the dataset or by a controlled baseline repulsion strategy, so the MLIP does not do something unphysical under extreme compression.


## Energy Deposition and Heat Transport
- **Stopping-Power Inputs (Se, Sn):** 
	- Use SRIM, ion-transport tools or experimental stopping data; will be used to set the energy per unit length that enters the model
- **Continuum "Thermal Spike" / Two-Temperature Model (TTM/i-TS):**
	- Compute electron and lattice temperature fields Te(r,t), Tl(r,t) with electron diffusion and electron-phonon coupling. This will give me a bridge from $S_{e}$ to a lattice heating history
	- Use this to model heat diffusion. The peak temperature and quench rate control whether we get a melted cylinder that recrystallizes (core-shell, defect-rich) vs one that amorphizes (in "amorphizable ceramics"), and they largely set the track radius/threshold behavior




## Research Gaps
- Redox, damage accumulation is experimentally supported and framed as important (especially in comparisons like $CeO_{2}$ and $ThO_{2}$).
- Track formation kinetics can be simulated with sophisticated excitation -> MD pipelines in $CeO_{2}$ (TREKIS + MD) and with 2T-MD in $UO_{2}$.
- In this work, we develop a model of swift heavy ion track formation in ceria that couples thermal-spike dynamics with redox and nonstoichiometry, and we show that incorporating these processes produces parameter-dependent changes in core and shell radii, radial oxygen redistribution, swelling/microstrain signatures, and post-spike recovery kinetics, linking redox-driven defect chemistry to track formation and evolution