

Swift heavy ions (SHIs) deposit energy into solids predominantly through electronic stopping on femtosecond-picosecond timescales, producing a highly localized "thermal-spike" excursion that can generate a nanoscale cylindrical damage zone and then quench rapidly. In cerium dioxide and related cerium oxides, experiments and modeling indicate that individual tracks can exhibit a core-shell morphology and substantial anion disorder while the material remains comparatively resistant to full amorphization, consistent with rapid recrystallization during quench.

Several measurements further suggest that track formation in ceria can be accompanied by changes in local chemistry: XAS/XPS studies of SHI-irradiated $\mathrm{CeO}_2$ report partial reduction of nominally $\mathrm{Ce}^{4+}$ toward $\mathrm{Ce}^{3+}$, which is closely tied to oxygen nonstoichiometry and oxygen-vacancy populations in ceria. MDM $\cdot 2$ At the same time, not all probes resolve clear chemical shifts inside tracks under all conditionsfor example, microscopy/EELS work has reported density changes in the track core while noting that chemical changes were not observed in that study-so the extent and role of irradiation-driven redox during track formation remains an open, conditions-dependent question rather than a foregone conclusion.


The goal of this project is to test-using controlled simulations across oxidized and reduced cerium oxide compositions-whether redox capacity measurably alters track formation and early recovery relative to more chemically constrained fluorite oxides such as $\mathrm{UO}_2$. This comparison is motivated by experimental literature suggesting that the irradiation response of these fluorite oxides may be strongly influenced by redox behavior, with $\mathrm{CeO}_2$ often discussed as tending toward reduction under SHI irradiation.




# Part 1


## 1A SRIM Calculations

SRIM is used to compute $S_e(z)$ and $S_n(z)$ for the ion conditions of interest, along with projected range and straggling metrics. These outputs are reduced to an effective electronic stopping $S_e{ }^*$ over the modeled track segment and then converted into discretized $S(r, t)$ tables that satisfy the normalization constraint

$$
\int_0^{\infty} 2 \pi r d r \int_{-\infty}^{\infty} S(r, t) d t=S_e^*
$$


This produces a deposition specification that can be consumed identically by a cylindrical TTM solver and by the LAMMPS TTM coupling [Why are you making a differentiation between the TTM solver and the LAMMPS  TTM Coupling.], ensuring that verification and production runs use the same physics input.

**Outputs of 1A: (SRIM outputs)**
- $S_e{ }^*$ for each ion condition
- one or more normalized $S(r, t)$ families parameterized by $r_0$ [Why did you say one or more. Do we not know how many we need? Can we not figure that out now?]
- tail choice
- and a deposition timescale.




## 1B DFT(+U) Labeling


The purpose of the DFT( $+U$ ) labeling is to generate a force-field training set that represents the local chemical environments and lattice distortions expected during SHI track formation and early recovery in cerium oxides, while remaining internally consistent across oxidized and reduced compositions. The calculations will be performed with one coherent $\operatorname{DFT}(+U)$ setup (functional, $U$, spin treatment as needed, and convergence settings) so that energies and forces can be compared across the dataset without mixing incompatible choices.

The labeled configurations will be selected to cover the building blocks that dominate track physics rather than only equilibrium crystals. The dataset will include pristine bulk structures under small homogeneous strains, oxygen-vacancy formation environments, vacancy-disordered configurations representative of reduced states, and small vacancy clusters. To improve robustness in the thermal-spike regime, additional structures will be drawn from short high-temperature MD snapshots (from inexpensive preliminary runs) so that the training set contains thermally disordered but chemically reasonable coordination environments and force distributions. Where relevant, configurations will be sampled across the targeted cerium oxide compositions so that both oxidized and reduced local environments are represented.

Outputs of 1B:
- A defined DFT( $+U$ ) computational setup used consistently for all labels (functional, $U$, spin/magnetism treatment if applicable, and convergence settings).
- An initial labeled dataset (energies, forces, stresses) spanning strained bulk environments, oxygenvacancy and vacancy-cluster environments, vacancy-disordered reduced environments, and thermally disordered snapshots representative of spike conditions across the targeted cerium oxide compositions.




## 1C Set up Cylindrical TTM Solver


A cylindrical two-temperature-model (TTM) solver will be implemented to provide a reference solution for electron-lattice energy exchange and electronic/lattice heat transport in ( $r, t$ ) under a prescribed deposition source $S(r, t)$. The governing cylindrical TTM equations will be solved numerically with specified initial and boundary conditions. The solver will output $T_e(r, t), T_l(r, t)$, and derived diagnostics used later for boundary justification and interpretation, such as peak temperatures, time-to-peak, and a heat-affected-zone radius $R_{\mathrm{HAZ}}$ defined by a chosen temperature criterion.

A LAMMPS-side verification configuration will also be prepared so that the TTM subsystem in LAMMPS can be compared directly against the cylindrical reference solution for the same $S(r, t)$ and parameter set. Atomic structural evolution will be suppressed or minimized as much as practicable during this verification step so that differences primarily reflect electronic diffusion and electron-lattice coupling rather than defect production. Radial temperature fields from LAMMPS will be extracted using a consistent binning procedure in $r$, and agreement will be evaluated using quantitative measures such as peak $T_l(r, t)$, cooling rates, and the radial decay of the temperature excursion.

Outputs of 1C:
- A cylindrical TTM reference solver that takes $S(r, t)$ and a specified parameter set $\left\{C_e, k_e, g, C_l, k_l\right\}$ and returns $T_e(r, t), T_l(r, t)$, and derived diagnostics including an operational $R_{\text {HAZ }}$.
- A LAMMPS verification input path that uses the same $S(r, t)$ specification and enables controlled comparison to the cylindrical solver (e.g., restricted atomic motion or an equivalent approach that limits structural feedback).
- A defined comparison procedure specifying radial binning, time sampling, and error measures used to quantify agreement between LAMMPS-TTM and the cylindrical reference solution.




# Part 2: Size and boundary-effect study 


A production geometry and sink placement will be selected such that the heat-affected zone and the region used for track metrics are not directly quenched by thermostatting and are not distorted by boundary-driven artifacts. The transverse cell dimensions and the sink radius will be varied systematically; when necessary, the sink thickness and the thermostat form will also be varied to test sensitivity. For each configuration, the stability of track-defining observables will be evaluated, including core and shell radii, radial disorder profiles, radial density deficit (as a swelling proxy), and early-time relaxation indicators. The aim is to show that, once the geometry and sink definition are chosen, the track metrics are insensitive to further increases in system size or changes in boundary treatment.

**Outputs of Part 2**: 
- a justified production cell size
- a justified sink definition
- quantitative evidence that the chosen geometry and boundary treatment do not quench or reshape the spike region used for interpretation






# Part 3

## 3A Track Formation Simulation In LAMMPS using Classical Potentials

Baseline SHI track simulations will be generated using the existing rigid-ion Buckingham + Coulomb + PPPM interaction model in a production geometry that has passed the size and boundary-effect checks. boundary-effect checks. Energy deposition will be applied using deposition inputs from part 1A, which include: (1) $S_e$ for the chosen deposition window and (2) the associated normalized $S(r, t)$ table.


**Outputs:**
- A reference set of track trajectories for each targeted cerium oxide composition.
- Track structure and early-recovery metrics computed consistently for $\mathrm{CeO}_2, \mathrm{Ce}_{11} \mathrm{O}_{20}$, $\mathrm{Ce}_7 \mathrm{O}_{12}$, and $\mathrm{Ce}_2 \mathrm{O}_3$, including: core and shell radii (track radius measures), radial disorder and density profiles, radial oxygen nonstoichiometry $\delta(r)$, swelling and microstrain proxies, defect/vacancy populations and clustering statistics, and early-time relaxation trends.
- A curated set of representative atomic configurations sampled from the trajectories (pre-spike, peak/spike, and early recovery) for subsequent $\mathrm{DFT}(+U)$ labeling and MLIP development.


## 3B MLIP Training 



# Part 4 Track Formation Simulation in LAMMPS using MLIPs





# Part 5 Analysis

- redox effects <-> track formation
- performance of MLIPs vs classical potentials




