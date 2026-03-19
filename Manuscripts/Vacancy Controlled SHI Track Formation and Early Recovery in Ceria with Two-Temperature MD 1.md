# Vacancy Controlled SHI Track Formation and Early Recovery in Ceria with Two-Temperature MD 

Grady Clopton Jac Copeland Akshay Vellore

March 19, 2026

## 1 Introduction

Nuclear fuels operate in extreme environments in which their lattices are constantly bombarded by high energy particles like neutrons, recoil nuclei, and fission fragments. When these particles hit the lattice they impart a large amount of energy in a very small region and create defects and damage tracks in the lattice which are illustrated in Figure 1. Defects and damage tracks cause phonon scattering (leading to a lower thermal conductivity), facilitate swelling and micro-cracking (altering pellet-clad stresses), and influence fission-gas retention and release. All of these phenomena have a large effect on fuel temperature and lifetime and are therefore imperative to understand.

![](https://cdn.mathpix.com/cropped/11b1f735-60af-4919-8c19-67d8edcab2b2-01.jpg?height=605&width=1344&top_left_y=1443&top_left_x=371)
Figure 1: Left: Typical fuel assembly for reactors. Right: Cross section of fuel pellet showing damage tracks and micro-cracking. [1]

Actinide oxides like uranium dioxide ( $\mathrm{UO}_{2}$ ) are common nuclear fuels however their radiotoxicity and strict handling constraints complicate the completion of systematic, mechanism focused studies. As a surrogate material, cerium oxide is appealing. It has the same fluorite structure, similar elastic and thermal responses, and similar redox chemistry which is critical for the formation and recovery of oxygen vacancies. These structural and chemical
similarities allow relevant mechanisms to be isolated with $\mathrm{CeO}_{2}$ in the laboratory and then translated to real fuels.

To simulate damage from fission fragments in the lab, experimentalists use swift heavy ions (SHIs) at dedicated particle accelerators such as GSI's UNILAC. Swift heavy ions are ions generally heavier than carbon ccelerated to specific energies $\gtrsim 1 \mathrm{MeV} / \mathrm{u}$ (often $1- 10^{3} \mathrm{MeV} / \mathrm{u}$ ) so that their velocity is comparable to or exceeds the Bohr velocity. In this high-velocity limit, electronic stopping dominates over nuclear stopping. In this regime, energy loss is dominated by electronic excitations rather than large-angle nuclear collisions, which produce a transient thermal spike. The spike heats the lattice and creates a damage track and amorphization in the lattice via thermally activated diffusion. Over time the tracks recover leaving a latent track in the lattice with local amorphousness.

From experimental results ceria appears to be more resistant to lasting radiation damage than comparable oxides like $\mathrm{UO}_{2}$. One finding with high-resolution TEM on 200 MeV Xe in CeO 2 resolved continuous latent tracks with only about a $10 \%$ density reduction [2]. Some studies have shown with spectroscopy and in-situ measurements, partial reduction of ceria from $\mathrm{Ce}^{4+} \rightarrow C e^{3+}$ in the track core that compensates anion disorder. Additionally, some studies have also found that ceria recrystallizes quickly compared with many other oxides. Under SHI bombardment it can partially self-heal, and in some conditions it shows higher thresholds or faster recovery of track contrast. A plausible hypothesis for these phenomena links this relative resilience to lasting irradiation damage to its oxygen stoichiometry ( $C e^{4+} \leftrightarrow C e^{3+}$ ) and transient formation of reduced phases that alter defect energetics and promote recombination [3, 4].

To interrogate this hypothesis, we use two-temperature molecular dynamics of $\mathrm{CeO}_{2}-\delta$ to quantify how oxygen deficiency $\delta$ influences early-time SHI damage metrics such as latenttrack radius, peak defect density, and time-evolution of core lattice temperature. Molecular dynamics is well suited to this problem because established interatomic models for ceria allow us to vary defect content, spike parameters ( $S_{e}, r_{0}, g$ ), and initial temperature in a controlled way, without the fabrication and handling constraints of irradiated-fuel experiments. In this work we therefore use MD as a high-throughput tool to explore this parameter space and to assess whether plausible changes in $\delta$ are expected to lead to experimentally resolvable differences in track-like observables in $\mathrm{CeO}_{2}$.

## 2 Methods

All simulations in this work are performed with classical two-temperature molecular dynamics (TTM-MD) of $\mathrm{CeO}_{2}-\delta$ using the LAMMPS package. We construct periodic fluorite supercells with prescribed oxygen-vacancy concetrations $\delta=0.01,0.05$, and 0.10 and two lateral sizes, $4 \times 4 \times 8 \mathrm{~nm}$ and $12 \times 12 \times 24 \mathrm{~nm}$, and evolve them under a combination of a rigid-ion Buckingham + Coulomb force field and an explicit electronic heat bath. Each trajectory consists of three stages: (i) preparation of a $\mathrm{CeO}_{2}-\delta$ supercell with the desired vacancy content, (ii) NVT pre-equilibration using a dual-thermostat scheme that establishes a 300 K lattice with a Langevin rim and an interior region, and (iii) a spike stage in which an imposed linear energy deposition $S_{e}$ and a continuum electronic temperature field drive the coupled electron-lattice dynamics and subsequent cooling.

The interatomic potential, long-range electrostatics, and TTM coupling used in these simulations are described in Sections 2.1-2.3. The complete set of LAMMPS input decks, YAML configuration files, and Python utilities used to generate the supercells, introduce vacancies, and launch the runs is available in a public GitHub repository at https://github. com/gclopton-at-illinois/mse_485_group1. This repository implements the workflow underlying the calculations reported here and allows the geometries, vacancy concentrations, and spike parameters discussed in the following sections to be reproduced or systematically varied without altering the physical model itself.

### 2.1 Potentials

In our TTM-MD simulations of SHI tracks in ceria, the $\mathrm{CeO}_{2}$ lattice is described by a rigidion Buckingham + Coulomb potential with long-range electrostatics handled by PPPM. The total lattice potential energy takes the familiar Born-model form

$$
U(\{\mathbf{r}\})=\sum_{i<j}\left[A_{i j} \exp \left(-\frac{r_{i j}}{\rho_{i j}}\right)-\frac{C_{i j}}{r_{i j}^{6}}+\frac{q_{i} q_{j}}{4 \pi \varepsilon_{0} r_{i j}}\right],
$$

where $r_{i j}=\left|\mathbf{r}_{i}-\mathbf{r}_{j}\right|$ is the minimum-image separation between ions $i$ and $j, A_{i j}, \rho_{i j}$, and $C_{i j}$ are Buckingham parameters for each pair type, and $q_{i}$ are the ionic charges. The Buckingham term is truncated at $10 \AA$, while the Coulomb term is evaluated by Ewald/PPPM using the same periodic cell as the MD simulation. The $\mathrm{O}-\mathrm{O}$ and $\mathrm{Ce}-\mathrm{O}$ Buckingham parameters we use trace back to the classical $\mathrm{CeO}_{2}$ force fields originally developed for bulk and mixed $\mathrm{CeO}_{2}-\mathrm{ZrO}_{2}$ by Balducci and co-workers and subsequently adopted by Sayle, Parker, and co-workers in simulations of $\mathrm{CeO}_{2}$ nanoparticles [5, 6]. In our implementation the Ce - Ce Buckingham interaction is set to zero, so that Ce - Ce forces are purely Coulombic through the surrounding oxygen lattice. The specific Buckingham parameters used for this work are summarized in the following table.

Table 1: Buckingham parameters for $\mathrm{CeO}_{2}$.
| Atom $i$ | Atom $j$ | $A / \mathrm{eV}$ | $\rho / \AA$ | $C / \mathrm{eV} \AA^{6}$ | Cut-off $/ \AA$ |
| :--- | :--- | :---: | :---: | :---: | :---: |
| O | O | 22764.30 | 0.149 | 27.89 | 10.0 |
| O | Ce | 1986.83 | 0.351 | 20.40 | 10.0 |
| Ce | Ce | Set to zero |  |  |  |


Within the class of rigid-ion Born models for ceria, this potential is one of several commonly used sets that reproduce the experimental fluorite lattice parameter to good accuracy and give a reasonable elastic response for bulk $\mathrm{CeO}_{2}$, although more sophisticated polarizable models achieve systematically better agreement across lattice, elastic, and transport properties [7].

The short-range Buckingham part represents non-bonded repulsion and dispersion. For each ion pair ( $i, j$ ), the Pauli repulsion term $A_{i j} \exp \left(-r_{i j} / \rho_{i j}\right)$ generates the steeply rising wall that prevents ionic cores from overlapping, while the attractive dispersion term $-C_{i j} / r_{i j}^{6}$ produces a weak van der Waals tail at intermediate distances. In the $\mathrm{CeO}_{2}$ parameterization we use, nonzero Buckingham interactions exist only for $\mathrm{O}-\mathrm{O}$ and $\mathrm{Ce}-\mathrm{O}$ pairs. This reflects
the strong ionic character of the $\mathrm{Ce}-\mathrm{O}$ bond and the fact that direct $\mathrm{Ce}-\mathrm{Ce}$ overlap is screened by the oxygen sublattice. At very short separations the bare Buckingham form becomes unphysical because the attractive $-C_{i j} / r^{6}$ term dominates the decaying exponential and drives the energy to $-\infty$ as $r \rightarrow 0$. To regularize this "Buckingham catastrophe" we overlay a ZBL nuclear repulsion below about $1.5 \AA$. In the present work, however, the spikes are thermally driven by electron-phonon coupling rather than by high-energy knockon collisions, so close approaches into the ZBL regime are extremely rare and the observed dynamics are controlled almost entirely by the Buckingham + Coulomb part of the force field.

Electrostatics are modeled with fixed effective charges $q_{\mathrm{Ce}}=+2.4 e$ and $q_{\mathrm{O}}=-1.2 e$, so that each $\mathrm{CeO}_{2}$ formula unit is neutral. These reduced charges are standard in rigid-ion models of $\mathrm{CeO}_{2}$ and are intended to mimic electronic screening. They preserve the strong Madelung binding of the fluorite lattice without the severe overbinding and exaggerated stiffness that typically appear when full formal charges ( $+4 e$ on $\mathrm{Ce},-2 e$ on O ) are used in a non-polarizable model. The long-range Coulomb energy is evaluated with an Ewald/PPPM split. In this formulation the $1 / r$ kernel is decomposed into a short-range real-space contribution with a damped kernel $\operatorname{erfc}(\alpha r) / r$, summed over all distinct pairs with minimum-image distances, plus a reciprocal-space contribution in which the periodic charge distribution is represented on a mesh and the smooth long-wavelength modes interact via the usual $1 / k^{2}$ Coulomb Green's function. A self-interaction term removes the spurious interaction of each ion with its own Gaussian screening cloud. The splitting parameter $\alpha$ and PPPM mesh are chosen so that the total Coulomb energy and forces are converged to the usual accuracy target used in LAMMPS oxide simulations. In our simulations, we request a target accuracy of $10^{-5}$ in the PPPM solver, and LAMMPS automatically choses $\alpha$ and the mesh resolution consistent with this tolerance for the given cutoff and cell size.

This potential choice is a compromise between physical realism and computational cost. The Buckingham + Coulomb rigid-ion model we use belongs to the standard Born-model family of interatomic potentials for ceria and has been employed in a number of earlier MD studies of bulk and reduced $\mathrm{CeO}_{2}$ to examine elastic properties, defect energetics, and transport. Comparative assessments of empirical pair potentials for ceria show that such rigid-ion Born models can reproduce the fluorite lattice parameter and bulk modulus reasonably well, and they yield thermal expansion and oxygen-vacancy migration barriers that are at least qualitatively consistent with experiment, even though no single parameter set accurately captures all bulk and defect properties simultaneously [8, 9], . Within these limitations, this class of potentials has been used as a practical backbone for simulations of mechanical response, oxygen self-diffusion, and ionic/thermal conductivity in pure and doped ceria. It is also computationally cheap enough to be applied in large simulation cells (up to $12 \times 12 \times 24 \mathrm{~nm}$ in this work) with an explicit two-temperature model and tens of thousands of MD steps, something that would be much more demanding with polarizable or machine-learned potentials. On the negative side, the model is strictly rigid-ion: it does not contain explicit $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ charge transfer, dipole polarizability, or a detailed treatment of the $4 f$ electrons. As a consequence, it cannot capture all aspects of reduced $\mathrm{CeO}_{2-\delta}$ chemistry, and quantities such as defect formation energies, migration barriers, and thermal conductivities should be regarded as approximate; state-of-the-art polarizable models such as the DIPPIM potential of Burbano et al. achieve significantly better quantitative agree-
ment with experiment across these properties, but at a substantially higher computational cost [7].

For the purposes of this study, these limitations are acceptable, but they do constrain how we interpret our results. The main observables we analyze are the time evolution of the lattice temperature in a cylindrical core region during and after the thermal spike, the buildup of point defects and defect density in that same core, and radial mass-density profiles from which we attempt to infer an effective track radius. In the real material, experiments show that these quantities are influenced by both the elastic and vibrational properties of the fluorite lattice and by ceria's redox flexibility. Swift heavy ion irradiation can create oxygen vacancies, increase the $\mathrm{Ce}^{3+}$ fraction, and produce unit-cell swelling and microstrain tied to changes in cation valence [10, 4, 11]. Our rigid-ion Buckingham + Coulomb model captures the mechanical and thermal part of this response-how the fluorite lattice expands, conducts heat, and accommodates oxygen Frenkel pairs, but it does not represent explicit $\mathrm{Ce}^{3 *} / \mathrm{Ce}^{4 *}$ charge transfer or 4 f -electron rehybridization. As a result, it can reproduce trends in track heating, strain, and defect production driven by ionic bonding and lattice mechanics as a function of stopping power, cell size, and oxygen vacancy content, but it cannot address in a quantitatively reliable way the portion of the track response that is controlled by redox chemistry and associated changes in Ce valence.

### 2.2 NVT Equilibration

The purpose of the equilibration stage is to prepare $\mathrm{CeO} 2-\delta$ supercells with the desired oxygen-vacancy content at the target temperature $T=300 \mathrm{~K}$ under the same dualthermostat boundary conditions that will be used during the subsequent spike stage. For each choice of $\delta$ and box size, we construct a fluorite $\mathrm{CeO}_{2}$ lattice, randomly remove O ions to obtain the prescribed vacancy concentration, and evolve the system in NVT until the temperature and pressure fluctuations are stationary.

### 2.2.1 Equilibration Parameters

The main control parameters in this stage are the oxygen-vacancy concentration, the simulation cell size, the target temperature, and the MD timestep. We consider three vacancy fractions, $\delta=0.01,0.05$ and 0.10, and two periodic supercell sizes $4 \times 4 \times 8 \mathrm{~nm}$ and $12 \times 12 \times 24$ nm . For all cases we fix the volume to the corresponding flurite lattice at 300 K , use a target temperature of 300 K , and integrate the equations of motion with a timestep of 0.5 fs . The actual box dimensions are slightly larger than the nominal values quoted above, so that all atoms remain comfortably inside the simulation cell througout the trajectory.

### 2.2.2 Dual Thermostat Setup

According to Konstantinou et al., standard NVE and NVT-thermostatted schemes work very well in situations where no external energy is being added to a system or if that energy is small or comparable to the average energy of the simulated volume [12]. However, in cases like irradiation from swift heavy-ions, where the amount of energy added to the system is much larger than the average energy of our simulation box, these straightforward NVT and

NVE Velocity Verlet schemes break down. For this specific scenario, we need an MD scheme that will allow the system to be driven from a non-equilibrium state back into equilibrium. One such scheme for NVT simulations is to set up stochastic boundary conditions using a Langevin thermostat on the rim particles to induce the return to equilibrium. To account for this, we set up the equilibration stage with two different thermostats: the Langevin thermostat on the rim to be used later in the energy spike stage and the Nose-Hoover thermostat for the interior that will be replaced with a different scheme in the energy spike stage.

### 2.3 Spike Dynamics and Track Formation

After the initial NVT equilibration, the simulation enters the "spike" stage, in which we mimic the passage of a swift heavy ion through $\mathrm{CeO}_{2-\delta}$ and follow the coupled evolution of the lattice and an electronic temperature field. At the beginning of this stage we reset the MD timestep counter to zero so that the spike envelope is expressed with respect to $t=0$. The atoms in the interior region are then switched from Nose-Hoover NVT to microcanonical NVE dynamics and are advanced with standard velocity-Verlet. Any change in the interior lattice energy during this stage is therefore due to explicit source terms and electron-lattice coupling, not to an imposed thermostat. The atoms in the outer rim continue to evolve under a Langevin thermostat at 300 K , which acts as a heat and phonon sink and mimics the surrounding bulk crystal.

The electronic subsystem is represented as a continuum temperature field $T_{e}(\mathbf{r}, t)$ defined on a regular grid and evolved with a standard two-temperature-model (TTM) equation,

$$
C_{e}\left(T_{e}\right) \partial_{t} T_{e}=\nabla \cdot\left(k_{e}\left(T_{e}\right) \nabla T_{e}\right)-g\left(T_{e}-T_{\ell}\right)+s(\mathbf{r}, t)
$$

where $C_{e}\left(T_{e}\right)$ and $k_{e}\left(T_{e}\right)$ are the electronic heat capacity and thermal conductivity, $g$ is the electron-phonon coupling parameter, $T_{\ell}$ is the local lattice temperature, and $s(\mathbf{r}, t)$ is the source term associated with the ion. The PDE is discretized by a finite-volume scheme on the TTM grid and subcycled within each MD step. For a given MD timestep $\Delta t$, the electron field is advanced in $M$ smaller substeps of length $\delta t_{e}=\Delta t / M$, chosen to satisfy the usual diffusion stability criterion based on $k_{e}$ and the grid spacing. In each cell $c$ of volume $\Delta V_{c}$ this evolution includes an exchange term $g\left(T_{e, c}-T_{\ell, c}\right) \Delta V_{c}$ that transfers energy between electrons and lattice. The corresponding lattice update is applied to the atoms in that cell as a momentum-conserving rescaling of the fluctuations about the cell center-of-mass velocity. In this way the electron-lattice coupling changes only the thermal part of the lattice kinetic energy, leaving linear momentum unchanged locally.

The ion is represented as a straight track aligned with the $z$-axis and centered at $\left(c_{x}, c_{y}\right)$ in the transverse plane. Its action is encoded in a cylindrical line source $s(\mathbf{r}, t)$ that injects energy into the simulation with the prescribed lineal energy deposition $S_{e}$ (in $\mathrm{eV} / \mathrm{A}$ ). The source is taken to be separable in radius and time about the track center,

$$
s(\mathbf{r}, t)=\frac{S_{e} L_{z}}{\mathcal{N}_{t}} f_{t}(t) \frac{1}{\mathcal{N}_{r}} f_{r}(r), \quad r=\sqrt{\left(x-c_{x}\right)^{2}+\left(y-c_{y}\right)^{2}}
$$

where $L_{z}$ is the cell length in $z_{1}(t)$ is a Gaussian time envelope of width $\tau$, and $f_{r}(r)$ is a Gaussian radial envelope of width $r_{0}$. The normalizations $\mathcal{N}_{t}$ and $\mathcal{N}_{r}$ are chosen so that $f_{t}$
integrates to unity over the simulated time window and $f_{r}$ integrates to $\pi r_{0}^{2}$ in the transverse plane. With this choice the total energy deposited by the source over the spike stage satisfies

$$
\int_{0}^{T_{\mathrm{run}}} \int_{\mathbb{R}^{2}} s(\mathbf{r}, t) d A d t=S_{e} L_{z}
$$

so that the integral of the instantaneous lineal power $P_{\text {tot }}(t)=\int s(\mathbf{r}, t) d A$ exactly equals the intended $S_{e} L_{z}$. In the present implementation this normalized source is applied as a per-atom power load directly to the lattice. At each MD step the atoms are assigned weights proportional to $\exp \left(-r_{i}^{2} / r_{0}^{2}\right)$, these weights are normalized so that the instantaneous perstep energy increment matches $P_{\text {tot }}(t) \Delta t$, and the resulting power is added to the atomic kinetic energy. The electron field evolves in parallel and exchanges energy with the lattice via the coupling term $g\left(T_{e}-T_{\ell}\right)$.

Because the interior atoms are integrated in NVE, the spike stage admits a closed energy balance. Denoting the lattice energy $\mathcal{E}_{\text {lat }}(t)=\mathrm{KE}(t)+\mathrm{PE}(t)$, the electron internal energy $E_{e}(t)$, the cumulative rim work $W_{\text {rim }}(t)$ (negative when the rim removes heat from the lattice), and the cumulative injected energy $Q_{\text {in }}(t)=\int_{0}^{t} P_{\text {tot }}(\tau) d \tau$, the model predicts that

$$
\left[\mathcal{E}_{\mathrm{lat}}(t)-\mathcal{E}_{\mathrm{lat}}(0)\right]+\left[E_{e}(t)-E_{e}(0)\right]-W_{\mathrm{rim}}(t)-Q_{\mathrm{in}}(t)=\mathcal{R}(t)
$$

should remain close to zero, where $\mathcal{R}(t)$ is the residual that collects numerical error from time integration, PPPM force truncation, and finite precision. In practice we record $\mathcal{E}_{\text {lat }}(t), E_{e}(t)$, and $W_{\text {rim }}(t)$ throughout the spike stage and use the known analytic form of $Q_{\text {in }}(t)$ from the normalized source to check that this combination stays bounded and near zero. Small, fluctuation-level deviations are taken as evidence that the source, the TTM coupling, and the Langevin rim together form a consistent, approximately closed energy accounting.

Finally, to connect the spike dynamics to track formation, we define a core-cylinder temperature by restricting the kinetic energy sum to atoms within a cylinder of radius $r_{\text {core }}$ around the track axis and subtracting the instantaneous center-of-mass motion of that region. The resulting core lattice temperature $T_{\ell}^{\text {core }}(t)$ tracks how strongly the central part of the lattice is heated and how quickly it cools, while the time-dependent defect density in the same core region and the radial mass-density profiles $\rho(r, t)$ extracted from the atomic positions provide complementary measures of how much permanent disorder and density change the spike leaves behind. Together, these observables characterize whether a given choice of $S_{e}$, cell size, and vacancy content produces only dispersed point defects or a more localized, track-like damage profile in $\mathrm{CeO}_{2-\delta}$.

## 3 Results \& Discussion

### 3.1 Analysis of Simulation Results

### 3.1.1 $\delta$ dependence of Swift Heavy-Ion Track Formation in $4 \times 4 \times 8 \mathrm{CeO}_{2}-\delta$

For the $4 \times 4 \times 8 \mathrm{~nm}$ cell, all three observables-defect density vs time, radial mass density, and core lattice temperature-are consistent with a moderate, sub-threshold electronic spike. The
defect density increases monotonically over the $7-8 \mathrm{ps}$ window with no clear peak and subsequent recovery, indicating that defects accumulate steadily and are only weakly annealed on these timescales. The core lattice temperature fluctuates around a value only modestly above the initial temperature (tens of kelvin), and we never see a dramatic temperature jump followed by rapid cooling. Combined with the OVITO snapshots, this points to dispersed point defects and small clusters embedded in an otherwise crystalline lattice, rather than a sharply amorphized track.

The radial mass-density profiles for all three $\delta$ values are nearly flat in the interior and then drop sharply only in the outermost radial bin. That drop is already present in the $\mathrm{t}=0$ frame, which tells us that it is a geometric/normalization artifact: at large radius, the cylindrical shells extend outside the rectangular simulation box, so we divide by too large a volume. In this small $4 \times 4 \times 8$ geometry we therefore cannot robustly extract a latent track radius from $\rho(r)$. Boundary effects contaminate the outer shells, and any real density change in the core is maller than the bin-to-bin noise.

Across $\delta=0.01,0.05$ and 0.10 the qualitative behavior is the same. Defects accumulate steadily, those core temperature shows similar noisy trends, and the radial density curves largely overlap within statistical fluctuations. Any apparent $\delta$-trend in peak defect density (for example, a slight increase with growing oxygen deficiency) is comparable in magnitude to run-to-run noise and finite-size effects. Because the Langevin rim occupies a significant fraction of the cross-section in this small box, energy is drained efficiently regardless of $\delta$. Therefore, at the baseline stopping power of $S_{e}$ of $45 \mathrm{eV} / \AA$, the $4 \times 4 \times 8$ cell does not reveal a strong, statistically significant $\delta$-dependence on any of the three observables.

![](https://cdn.mathpix.com/cropped/11b1f735-60af-4919-8c19-67d8edcab2b2-09.jpg?height=1256&width=1748&top_left_y=253&top_left_x=259)
Figure 2: Time evolution of defect density (left column), radial mass density (middle column), and core lattice temperature (right column) for the $4 \times 4 \times 8 \mathrm{~nm} \mathrm{CeO} \mathrm{O}_{2}-\delta$ simulations with $S_{e}=45 \mathrm{ev} / \AA$. Each row corresponds to a different initial oxygen-vacancy content (top to bottom: $\delta=0.01,0.05$, and 0.10 ).

The OVITO displacement map in Figure 3 makes this picture more concrete. Here each atoms is colored by the magnitude of its displacement between the initial equilibrated configuration and the final snapshot of the spike. Most of the interior remains dark blue, indicating that the majority of ions return to positions very close to their original fluorite sites. The central region along the nominal track axis shows scattered patches of green and yellow, corresponding to atoms that have moved by several tenths of an ångström or more and marking small defect clusters and local rearrangements. However, these high-displacement regions are isolated and mottled rather than forming a continuous cylindrical core. Together with the flat radial density profiles, this confirms that the $4 \times 4 \times 8 \mathrm{~nm}$ geometry and $\mathrm{Se}=45 \mathrm{ev} / \AA$ the spike produces primarily dispersed point defects and small clusters, with no clearly resolved latent track.

![](https://cdn.mathpix.com/cropped/11b1f735-60af-4919-8c19-67d8edcab2b2-10.jpg?height=1058&width=1401&top_left_y=242&top_left_x=361)
Figure 3: OVITO displacement analysis for the $4 \times 4 \times 8 \mathrm{~nm} \mathrm{CeO} O_{2}-\delta$ cell at the end of the spike stage. Atoms are colored by their net displacement between the equilibriated prespike configuration and the final frame of the trajectory, with blue atoms having moved only slightly and gree/yellow atoms indicating larger displacements. The left panel shows a crosssection perpendicular to the ion track, while the right panel shows the full three-dimensional cell. The configuration is consistent with dispersed point defects and small clusters embedded in an otherwise crystalline fluorite lattice, rather than a continuous amorphous ion track.

## $3.2 \delta$ dependence of Swift Heavy-Ion Track Formation in 12x12x24 $\mathrm{CeO} \mathrm{O}_{2}-\delta$

The $12 \times 12 \times 24 \mathrm{~nm}$ box pushes the Langevin rim several nanometers farther away from the ion track and provides a much thicker bulk-like interior than the $4 \times 4 \times 8 \mathrm{~nm}$ geometry. In addition, these simulations use a much stronger spike with lineal electronic stopping $S_{e}=350 \mathrm{ev} / \AA(\approx 35 \mathrm{keV} / \mathrm{nm})$, which lies in the range where experiments on $C e O_{2}$ report clear ion tracks in TEM [2, 13]. Together, the larger box and higher stopping power move the model closer to the experimental regime, while still keeping the computational cost manageable.

Figure 4 collects the three principal observables for this larger cell for a 2 ps window. In the left column, the core defect density rises sharply during the first few hundred femtoseconds as the spike deposits energy and then continues to grow more slowly for the remainder of the run. There is no clear maximum or recovery in this short window. The three vacancy concentrations follow very similar trajectories. Within the noise level of single MD trajectories, we do not resolve strong, systematic $\delta$ trend in either the rate or the final level of defect
production.
The middle column of Figure 4 shows radial mass-density profiles at several times during and after the spike. At $\mathrm{t}=0$ the profiles are nearly flat throughout the interior, with the familiar sharp drop only in the outermost radial bin due to the cylindrical shells extending beyond the rectangular simulation box. Even in this larger geometry, the radial profiles do not support a clean extraction of a latent-track radius.

The right column shows the core lattice temperature histories $T_{l, \text { core }}(t)$. As in the $4 \times 4 \times 8$ runs, the core temperature fluctuates around a roughly constant baseline of $\sim 5 \times 10^{2} \mathrm{~K}$ with excursions on the order of $10-20 \mathrm{~K}$. In the larger $12 \times 12 \times 24$ cell, there is a modest upward drift over the $1.6-2 \mathrm{ps}$ window, but we do not resolve the classic thermal spike signature of a sharp rise followed by cooling back to the rim temperature. Instead, the data look like a warm, slightly heating core whose detailed evolution is dominated by stochastic MD fluctuations. Within this noise level, the three $\delta$ curves are nearly indistinguishable. Any small differences in their average temperature or short-time behavior are comparable to the random variations along a single trajectory. Thus, based on the present $T_{l, \text { core }(t)}$ data alone, we cannot claim a strong, quantitative $\delta$ dependence of the lattice heating in the $12 \times 12 \times 24$ geometry.

![](https://cdn.mathpix.com/cropped/11b1f735-60af-4919-8c19-67d8edcab2b2-12.jpg?height=1221&width=1748&top_left_y=251&top_left_x=266)
Figure 4: Time evolution of defect density (left column), radial mass density (middle column), and core lattice temperature (right column) for the $12 \times 12 \times 24 \mathrm{~nm} \mathrm{CeO} \mathrm{O}_{2}-\delta$ simulations with $S_{e}=350 \mathrm{eV} / \AA$.

The OVITO displacement maps for both box sizes look qualitatively similar. In each case, the majority of the atoms have small displacements, while higher displacement atoms appear as scattered spots and small clusters throughout the interior. In the $12 \times 12 \times 24 \mathrm{~nm}$ cell, we do not visually resolve a distinct cylindrical region in which most atoms are strongly displaced. Taken together with the nearly flat radial mass-density profiles, this suggests that for the present choice of $S_{e}$, geometry, and $\delta$ the simulations mainly produce dispersed point defects and small clusters rather than a sharply defined amorphous ion track, and they do not reveal a clear, quantitative $\delta$ dependence in the morphology of the damaged region.

![](https://cdn.mathpix.com/cropped/11b1f735-60af-4919-8c19-67d8edcab2b2-13.jpg?height=968&width=1395&top_left_y=242&top_left_x=365)
Figure 5: OVITO displacement analysis for the $12 \times 12 \times 24 \mathrm{~nm} C e O_{2}-\delta$ with $S_{e}=350 \mathrm{eV} / \AA$. As in the $4 \times 4 \times 8 \mathrm{~nm}$ case, most atoms remain weakly dispaced, while atoms with larger displacements (green/yellow) appear as scattered clusters throughout the interior.

### 3.3 Finite Size Effects

All of our TTM-MD simulations are performed in finite periodic supercells with a thermostatted Langevin rim. This inevitably introduces finite-size effects that influence how heat and damage evolve around the swift heavy ion (SHI) trajectory.

### 3.3.1 Length Scales for SHI Tracks

SHI track formation in oxides is controlled by several coupled radial length scales. First, the latent-track core radius $R_{\text {core }}$ is the size of the heavily damaged cylindrical region that remains after cooling. For $\mathrm{CeO}_{2}$, TEM/STEM and complementary diffraction/spectroscopy studies show that even at high electronic stopping powers (e.g. $200 \mathrm{MeVXe}, 940 \mathrm{MeVAu}, S_{e} \approx 15-42 \mathrm{keV} / \mathrm{nm}$ ) the ion track core is only weakly underdense. Takaki et al. estimate an atomic density decrease of about $10 \%$ in the track core and observe reduced Ce-sublattice HAADF intensity over a region $4-5 \mathrm{~nm}$ across, with O-sublattice disorder confined to a diameter of 4 nm [14, 2]. Cureton et al. summarize XRD/TEM analyses giving effective track sizes of $3-5 \mathrm{~nm}$ from unitcell expansion fits, again with only modest density reduction and no amorphization of the fluorite lattice [4]. Taken together, these measurements place a conservative $\mathrm{CeO}_{2}$ core radius in the range $R_{\text {core }} \sim 1-2.5 \mathrm{~nm}$. Recent hybrid MonteCarlo + MD simulations for strongly irradiated wide-gap oxides likewise find crystalline or weakly disordered tracks with nanometer-scale cores. In $\mathrm{Al}_{2} \mathrm{O}_{3}$, Rymzhanov et al. report
discontinuous distorted crystalline tracks of diameter $\sim 2 \mathrm{~nm}$ under 167 MeV Xe irradiation, while in YAG they obtain continuous amorphous tracks of diameter $\sim 6.5 \mathrm{~nm}$ [15]. These results again suggest that a reasonable working estimate for a SHI-damage core radius in this class of oxides is $R_{\text {core }} \approx 1-2.5 \mathrm{~nm}$.

Second, there is a broader heat-affected zone radius $R_{\text {heat }}$, out to which the electronic and lattice temperatures rise significantly during the spike. Time-resolved MC+MD modeling for $\mathrm{MgO}, \mathrm{Al}_{2} \mathrm{O}_{3}$ and YAG shows that while the final tracks are only $2-6 \mathrm{~nm}$ in diameter, the transient melted region early in the spike can extend to $\sim 5-6 \mathrm{~nm}$ in radius before recrystallization or amorphization sets in [15]. This suggests that for $\mathrm{CeO}_{2}$ under high Se one should expect both temperature and structural perturbations over a radial scale of several nanometers beyond the final track core.

Finally, over the picosecond time window accessible to MD, heat and damage can diffuse radially over a distance $\ell \sim \sqrt{4 D t_{\text {max }}}$, where $D$ is an effective thermal diffusivity. For typical oxide values and $t_{\text {max }} \sim 10-100 \mathrm{ps}, \ell$ is again in the few- to ten-nanometer range. Taken together, these considerations imply that any artificial boundary or thermostat closer than a few times ( $R_{\text {heat }}$ ) to the SHI axis will perturb both the cooling kinetics and the final damage morphology.

### 3.3.2 Role of Box Size and Boundary Conditions in Resolving Local Defects vs Bulk Track Structure

Existing $\mathrm{CeO}_{2}$ MD studies fall into two broad categories with respect to system size. One family, exemplified by work from Sasajima and co-workers [16], deliberately uses very small boxes (only a few nanometers) to focus on local defect chemistry and nanopore formation. In their nanopore-formation simulations, the $\mathrm{CeO}_{2}$ crystal is constructed by cloning the fluorite unit cell $6 \times 6 \times 4$ times, giving crystal dimensions $3.25 \times 3.25 \times 2.33 \mathrm{~nm}^{3}$ embedded in a $3.25 \times 3.25 \times 3.25 \mathrm{~nm}^{3}$ calculation region. A cylindrical region of 1.0 nm diameter at the center is treated as the beam track. High thermal energy $g S_{e}$ up to $1.6 \mathrm{keV} / \mathrm{nm}$ is deposited there by resetting velocities at $t=0$, and the region outside a 2.0 nm diameter cylinder is kept at 298 K by velocity scaling throughout the 3 ps simulation. Earlier $C e O_{2}$ thermal-spike work by the same group uses essentially the same geometry to analyze oxygen Frenkel pairs and defect clustering in a single-crystal track.

These simulations embrace very strong finite-size effects. The heated cylinder is a substantial fraction of the cross-section, and the outer region is a rigid 298 K heat bath. This is appropriate for questions about local structure - what kinds of oxygen Frenkel pairs form, under what effective stopping powers $g S_{e}$ nanopores appear-but it is not suited to quantitatively extracting bulk track radius, density changes, or realistic long-range heat flow.

The second family of $\mathrm{CeO}_{2}$ work aims at a bulk-like description of SHI damage. Yablinsky et al. [14] combined classical thermal-spike MD in $\mathrm{CeO}_{2}$ at 12 and $36 \mathrm{keV} / \mathrm{nm}$ with micrometric TEM observations at $42 \mathrm{keV} / \mathrm{nm}$. Their MD uses a three-dimensional periodic $\mathrm{CeO}_{2}$ supercell and an imposed radial energy deposition profile to mimic a thermal spike in bulk ceria. The simulations show isolated point defects at $12 \mathrm{keV} / \mathrm{nm}$ and clustered defects at $36 \mathrm{keV} / \mathrm{nm}$, but no complete amorphization of the track at either $S_{e}$, consistent with experiments that report only a small density reduction in the ion track core at $42 \mathrm{keV} / \mathrm{nm}$. While the exact supercell dimensions are not highlighted as a variable in that work, the
methodology is clearly in the "large periodic cell with no nearby free surfaces" regime, in contrast to the nanoscale boxes used in Sasajima's nanopore studies.

A recent review of $\mathrm{CeO}_{2}$ SHI effects by Cureton and co-workers [4] explicitly juxtaposes these two modeling philosophies: small $\mathrm{CeO}_{2}$ cells for local defect and nanopore structure, and larger, bulk-like cells for density changes, dislocation loops and track radii. This provides an important context for our simulations. Depending on box size and boundary conditions, $\mathrm{CeO} \mathrm{O}_{2}$ MD can be either a "local structure microscope" or a true bulk track model, but not both simultaneously.

### 3.3.3 Lesson from Hybrid MC+MD in Other Oxides

Hybrid Monte-Carlo + MD schemes for other oxides provide more explicit guidance on finite-size convergence. In their study of overlapping SHI tracks in $\mathrm{Al}_{2} \mathrm{O}_{3}$, Rymzhanov et al. [15] used the TREKIS MC code to compute the radial lattice energy deposition, then fed this into LAMMPS MD in corundum supercells of three different sizes: $14.7 \times 14.8 \times 9 \mathrm{nm}^{3}$, $18.8 \times 12.2 \times 5.2 \mathrm{~nm}^{3}$, and $21.8 \times 14 \times 7.7 \mathrm{~nm}^{3}$, all with periodic boundary conditions. The outer $0.5-\mathrm{nm}$ border layers in x and y were cooled with a Berendsen thermostat at 300 K, while the interior evolved in NVE. They state that different supercell sizes were used to ensure that there was no significant influence of the boundaries on the simulation results, and track diameters of 1.8 nm were found to be stable across these sizes. In other words, once the distance from the track axis to the thermostatted borders is several times the track radius, the core observables (track diameter, defect counts) become insensitive to box size.

Set against those numbers, our $12 \times 12 \times 24 \mathrm{~nm}^{3}$ geometry is in the right ballpark but still marginal. The NVE interior radius $r_{\mathrm{NVE}} \approx 4.5 \mathrm{~nm}$ is about $2-3$ times the $\mathrm{CeO}_{2}$ core radius and comparable to the lower end of the heat-affected radii seen in other oxides, but smaller than the $\sim 8.4 \mathrm{~nm}$ influence radius inferred for $\mathrm{CeO}_{2}$ from track-overlap analysis. This means that our Langevin rim still encroaches on the outer part of the heat-affected zone that would, in a bulk crystal, participate in the thermal spike and its recrystallization. In contrast, state-of-the-art hybrid MC+MD studies in $\mathrm{Al}_{2} \mathrm{O}_{3}$ and YAG place the thermostatted borders $\sim 7-10 \mathrm{~nm}$ from the track axis, with lateral box sizes of $20-26 \mathrm{~nm}$ (about 8-12 times the track diameter), and explicitly show that track diameter and defect counts become independent of supercell size once this separation is achieved.

Physically, having the rim inside or at the edge of the heat-affected zone matters in two ways. First, it accelerates cooling. Energy carried by ballistic atoms and phonons can reach the thermostatted region after traveling only a few nanometers, where the Langevin drag continuously removes kinetic energy. This short-circuits some of the lateral and longitudinal heat flow that would occur in a larger, nearly adiabatic interior, and can shorten the lifetime and reduce the peak of the molten/softened zone. Second, it constrains defect evolution and saturation. Atoms near the rim are constantly being re-thermalized toward 300 K , which reduces thermal expansion and suppresses large structural rearrangements. It also changes the balance between defect recombination and retention in the halo surrounding the core. Both effects tend to bias the simulation toward faster quenching and a more localized, less relaxed damage structure than would emerge in an effectively infinite crystal.

We can say that the $12 \times 12 \times 24 \mathrm{~nm}$ cell is a clear improvement over $4 \times 4 \times 8 \mathrm{~nm}$ in that it provides a thicker NVE shell around the track and pushes the rim further away, in a
way that is qualitatively consistent with the box-size choices used in hybrid SHI simulations of other oxides. However, our present $\mathrm{CeO}_{2}$ runs at this size still do not form an obvious latent track, and key observables such as the radial mass-density profiles and the fitted track radius remain strongly influenced by the box geometry and the cylindrical-in-a-square normalization. To demonstrate a quantitative improvement in physical fidelity, we would need to compare, for example, core temperature histories, energy-balance metrics, or central defect densities across box sizes and show that these core observables have converged; our current output does not yet provide enough such evidence.

### 3.4 Computational Cost vs Cell Sizes

Our $\mathrm{CeO}_{2}-\delta$ TTM-MD simulations are computationally demanding because they combine relatively large atom counts, an explicit electronic subsystem, and long spike durations. In practice, the cell sizes and the number of trajectories we could afford were limited not only by physical considerations (Section 3.3) but also by walltime constraints on the campus cluster. To quantify these constraints, we used the $4 \times 4 \times 8 \mathrm{~nm} \mathrm{CeO}_{2}-\delta$ trajectory that completed both NVT equilibration and the full TTM spike as a timing reference ( $\approx 11500$ atoms on 32 MPI ranks). From the LAMMPS logs, this run required about 3 hours of walltime for the spike stage and only a few minutes for the preequilibration, so the total cost per trajectory is dominated by the TTM segment.

For the larger $12 \times 12 \times 24 \mathrm{~nm}$ geometry, the TTM spike was still running when this report was written. We obtained roughly 2 ps of data (used in Section 3.2) but the job had not yet reached the planned final time. We therefore cannot quote a measured walltime for a complete spike in this cell. Instead, we estimated what the total cost would be if the spike were carried out to its full planned duration by assuming that the per-step cost during the TTM stage scales approximately linearly with the number of atoms (and TTM grid cells), and by keeping the same order of magnitude for the number of TTM steps as in the $4 \times 4 \times 8$ run. The same scaling was then used to obtain order-of-magnitude walltime estimates for hypothetical "bulk-like" cells of size $16 \times 16 \times 32 \mathrm{~nm}$ and $20 \times 20 \times 40 \mathrm{~nm}$. The arithmetic and assumptions behind these estimates are summarized in Appendix A.

The resulting walltime estimates for one complete Phase-1 trajectory (equilibration plus a full TTM spike) on 32 cores are collected in Table 2. The $4 \times 4 \times 8 \mathrm{~nm}$ geometry is extremely inexpensive. A full equilibrated trajectory costs only about 3 hours. Moving to $12 \times 12 \times 24 \mathrm{~nm}$ increases the undamped interior radius to a more realistic value but also raises the expected cost by roughly an order of magnitude to on the order of 40 hours for a single completed spike. Extrapolating further, the $16 \times 16 \times 32 \mathrm{~nm}$ and $20 \times 20 \times 40 \mathrm{~nm}$ cells would require on the order of 4 and 7 days of walltime per trajectory, respectively. A systematic convergence study over several $\delta$ and $S_{e}$ values at these larger sizes would therefore consume hundreds of core-days and was beyond what we could realistically pursue within the time constraints of this project. This is why the present work focuses on the $4 \times 4 \times 8$ and $12 \times 12 \times 24 \mathrm{~nm}$ cells and treats the larger geometries as targets for future, more resource-intensive studies.

Table 2: Estimated walltime per Phase-1 $\mathrm{CeO}_{2}-\delta$ trajectory on 32 MPI ranks. The $4 \times 4 \times 8$ entry is measured directly from LAMMPS logs. The $12 \times 12 \times 24$ entry is an extrapolation based on the partially completed spike and linear scaling with atom count. The $16 \times 16 \times 32$ and $20 \times 20 \times 40$ entries are fully estimated using the same scaling model (see Appendix A).
| Cell size $(\mathrm{nm})$ | Atoms $N(\approx)$ | Total walltime per run $[\mathrm{h}]$ | Status of timing |
| :--- | :---: | :---: | :---: |
| $4 \times 4 \times 8$ | $1.15 \times 10^{4}$ | $\approx 3$ | measured (completed spike) |
| $12 \times 12 \times 24$ | $2.5 \times 10^{5}$ | $\approx 38$ | estimated (spike still running) |
| $16 \times 16 \times 32$ | $6.0 \times 10^{5}$ | $\approx 90(\approx 3.7$ days $)$ | estimated |
| $20 \times 20 \times 40$ | $1.2 \times 10^{6}$ | $\approx 175(\approx 7.3$ days $)$ | estimated |


## 4 Conclusion

In this work we used two-temperature molecular dynamics with a rigid-ion Buckingham + Coulomb force field to explore how oxygen deficiency $\delta$ influences swift heavy-ion track formation and early-time recovery in $\mathrm{CeO}_{2}-\delta$. We constructed $4 \times 4 \times 8 \mathrm{~nm}$ and $12 \times 12 \times 24 \mathrm{~nm}$ fluorite supercells with $\delta=0.01,0.05,0.10$, deposited lineal electronic stopping powers of $S_{e}=45$ and $350 \mathrm{eV} / \AA$, and analyzed core defect densities, radial mass-density profiles, core lattice temperatures, and OVITO displacement maps. Across all cases, the simulations produced dispersed point defects and small clusters embedded in an otherwise crystalline lattice, but no clearly resolved amorphous ion track or robust shift in track-like observables with $\delta$ over the first few picoseconds. Within this model and parameter range, variations in oxygen vacancy content have a much weaker effect on early SHI damage than the overall stopping power and geometry.

At the same time, our finite-size analysis and cost estimates show that the boxes ( $4 \times 4 \times 8$ and $12 \times 12 \times 24 \mathrm{~nm}$ ) are still marginal for true bulk track modeling, and that systematically converging core observables with respect to box size and $\delta$ would require substantially larger, longer, and more expensive simulations. Future work should therefore combine larger supercells and longer time windows with more advanced, redox-capable potentials or hybrid MC+MD schemes, so that the experimentally observed interplay between Ce valence, oxygen stoichiometry, and SHI track structure in $\mathrm{CeO}_{2}$ can be addressed in a quantitatively reliable way.

## References

[1] Richard A Dunlap. Generation IV Nuclear Reactors: Design, operation and prospects for future energy production. IOP Publishing, October 2024.
[2] S. Takaki, K. Yasuda, T. Yamamoto, S. Matsumura, and N. Ishikawa. Atomic structure of ion tracks in Ceria. Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms, 326:140-144, May 2014.
[3] K. Yasuda, M. Etoh, K. Sawada, T. Yamamoto, K. Yasunaga, S. Matsumura, and N. Ishikawa. Defect formation and accumulation in CeO 2 irradiated with swift heavy
ions. Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms, 314:185-190, November 2013.
[4] William F. Cureton, Cameron L. Tracy, and Maik Lang. Review of Swift Heavy Ion Irradiation Effects in CeO2. Quantum Beam Science, 5(2):19, June 2021.
[5] Gabriele Balducci, Jan Kašpar, Paolo Fornasiero, Mauro Graziani, M. Saiful Islam, and Julian D. Gale. Computer Simulation Studies of Bulk Reduction and Oxygen Migration in $\mathrm{CeO}_{2} \mathrm{ZrO}_{2}$ Solid Solutions. The Journal of Physical Chemistry B, 101(10):1750-1753, March 1997.
[6] Thi X. T. Sayle, Stephen C. Parker, and Dean C. Sayle. Shape of CeO 2 nanoparticles using simulated amorphisation and recrystallisation. Chemical Communications, (21):2438, 2004.
[7] Mario Burbano, Dario Marrocchelli, Bilge Yildiz, Harry L Tuller, Stefan T Norberg, Stephen Hull, Paul A Madden, and Graeme W Watson. A dipole polarizable potential for reduced and doped $\mathrm{CeO}_{2}$ obtained from first principles. Journal of Physics: Condensed Matter, 23(25):255402, June 2011.
[8] A Gotte, D Spangberg, K Hermansson, and M Baudin. Molecular dynamics study of oxygen self-diffusion in reduced CeO2. Solid State Ionics, 178(25-26):1421-1427, October 2007.
[9] Steffen Grieshammer, Leila Momenzadeh, Irina V. Belova, and Graeme E. Murch. Ionic and thermal conductivity of pure and doped ceria by molecular dynamics. Solid State Ionics, 355:115424, November 2020.
[10] H. Ohno, A. Iwase, D. Matsumura, Y. Nishihata, J. Mizuki, N. Ishikawa, Y. Baba, N. Hirao, T. Sonoda, and M. Kinoshita. Study on effects of swift heavy ion irradiation in cerium dioxide using synchrotron radiation X-ray absorption spectroscopy. Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms, 266(12-13):3013-3017, June 2008.
[11] V. Grover, R. Shukla, Renu Kumari, B. P. Mandal, P. K. Kulriya, S. K. Srivastava, S. Ghosh, A. K. Tyagi, and D. K. Avasthi. Effect of grain size and microstructure on radiation stability of $\mathrm{CeO}_{2}$ : an extensive study. Phys. Chem. Chem. Phys., 16(48):2706527073, October 2014.
[12] K Konstantinou, F C Mocanu, T H Lee, and S R Elliott. Ab initio computer simulations of non-equilibrium radiation-induced cascades in amorphous $\mathrm{Ge}_{2} \mathrm{Sb}_{2} \mathrm{Te}_{5}$. Journal of Physics: Condensed Matter, 30(45):455401, November 2018.
[13] T. Sonoda, M. Kinoshita, N. Ishikawa, M. Sataka, Y. Chimi, N. Okubo, A. Iwase, and K. Yasunaga. Clarification of the properties and accumulation effects of ion tracks in CeO2. Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms, 266(12-13):2882-2886, June 2008.
[14] Clarissa A. Yablinsky, Ram Devanathan, Janne Pakarinen, Jian Gan, Daniel Severin, Christina Trautmann, and Todd R. Allen. Characterization of swift heavy ion irradiation damage in ceria. Journal of Materials Research, 30(9):1473-1484, May 2015.
[15] R.A. Rymzhanov, N. Medvedev, A.E. Volkov, J.H. O'Connell, and V.A. Skuratov. Overlap of swift heavy ion tracks in Al2O3. Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms, 435:121-125, November 2018.
[16] Yasushi Sasajima, Ryuichi Kaminaga, Norito Ishikawa, and Akihiro Iwase. Nanopore Formation in CeO2 Single Crystal by Ion Irradiation: A Molecular Dynamics Study. Quantum Beam Science, 5(4):32, November 2021.

## A Estimating Computational Cost vs. Cell Size

The goal of this appendix is to document how we obtained the walltime estimates in Table 2 from a single completed reference run.

We start from the $4 \times 4 \times 8 \mathrm{nmCeO}_{2}-\delta$ trajectory that completed both the NVT equilibration and the full TTM spike. This simulation contains $N_{4} \approx 1.15 \times 10^{4}$ atoms and was run on 32 MPI ranks. According to the LAMMPS logs, the equilibration stage (without TTM) took about 100 s for 20000 steps, while the spike stage (with the TTM fix active) took about 3 hours for 35000 steps. Thus: - total spike walltime

$$
t_{\text {spike }}^{(4 \times 4 \times 8)} \approx 3 \mathrm{~h} \approx 1.1 \times 10^{4} \mathrm{~s},
$$

- number of spike steps

$$
n_{\text {spike }}^{(4 \times 4 \times 8)}=35000
$$

- per-step cost for the spike

$$
t_{\text {step }}^{(4 \times 4 \times 8)}=t_{\text {spike }}^{(4 \times 4 \times 8)} / n_{\text {spike }}^{(4 \times 4 \times 8)} \approx 0.31 \mathrm{~s} / \mathrm{step},
$$

- per-step, per-atom cost during the spike

$$
c_{\text {spike }}=t_{\text {spike }}^{(4 \times 4 \times 8)} /\left(N_{4} n_{\text {spike }}^{(4 \times 4 \times 8)}\right) \approx 3 \times 10^{-5} \mathrm{~s}(\text { step atom })^{-1}
$$

The equilibration stage is more than two orders of magnitude cheaper per step and contributes only a few percent to the total walltime, so for larger cells we treat equilibration as a small additive correction and focus on the spike.

For any other cell with $N$ atoms and a planned TTM spike of $n_{\text {spike }}$ steps run on the same number of cores, we assume that the spike walltime scales approximately linearly with the number of atoms and the number of TTM steps,

$$
t_{\text {spike }}\left(N, n_{\text {spike }}\right) \approx c_{\text {spike }} N n_{\text {spike }}
$$

with $c_{\text {spike }}$ taken from the calibrated $4 \times 4 \times 8$ run. We keep the equilibration at $10000-$ 20000 steps and scale its cost with $N$ in the same way, but since this is a small correction we quote only the final rounded totals in Table 2.

For the $12 \times 12 \times 24 \mathrm{~nm}$ geometry, the LAMMPS input deck specifies a TTM spike of $n_{\text {spike }}^{(12 \times 12 \times 24)}=2.0 \times 10^{4}$ steps, and the created supercell contains $N_{12} \approx 2.5 \times 10^{5}$ atoms. Inserting these values gives
$t_{\text {spike }}^{(12 \times 12 \times 24)} \approx c_{\text {spike }} N_{12} n_{\text {spike }}^{(12 \times 12 \times 24)} \approx\left(3 \times 10^{-5}\right) \times\left(2.5 \times 10^{5}\right) \times\left(2.0 \times 10^{4}\right) \approx 1.3 \times 10^{5} \mathrm{~s} \approx 38 \mathrm{~h}$.
Adding a small contribution for equilibration yields the $\approx 38 \mathrm{~h}$ entry in Table 2. Importantly, at the time of writing our $12 \times 12 \times 24$ run had only progressed to about 2 ps of physical time (the first portion of this planned spike), so this $\approx 38 \mathrm{~h}$ is an extrapolated estimate for a fully completed spike rather than a measured walltime.

To estimate the cost of still larger boxes we kept the same aspect ratio and used the $12 \times 12 \times 24$ atom count as a baseline. For a $16 \times 16 \times 32 \mathrm{~nm}$ cell, each linear dimension is scaled by a factor $s_{16}=16 / 12$, so the volume and atom count scale as $s_{16}^{3}$. This gives

$$
N_{16} \approx N_{12} s_{16}^{3} \approx N_{12}\left(\frac{16}{12}\right)^{3} \approx 6.0 \times 10^{5} \text { atoms }
$$

Assuming the same 20000 -step spike, the spike walltime is then

$$
t_{\mathrm{spike}}^{(16 \times 16 \times 32)} \approx c_{\mathrm{spike}} N_{16} n_{\mathrm{spike}}^{(12 \times 12 \times 24)} \approx 3.2 \times 10^{5} \mathrm{~s} \approx 90 \mathrm{~h} \approx 3.7 \text { days }
$$

which we round to $\approx 90 \mathrm{~h}$ in Table 2. For a $20 \times 20 \times 40 \mathrm{~nm}$ cell, the linear scale factor relative to $12 \times 12 \times 24$ is $s_{20}=20 / 12$, so

$$
N_{20} \approx N_{12} s_{20}^{3} \approx N_{12}\left(\frac{20}{12}\right)^{3} \approx 1.2 \times 10^{6} \text { atoms }
$$

and

$$
t_{\text {spike }}^{(20 \times 20 \times 40)} \approx c_{\text {spike }} N_{20} n_{\text {spike }}^{(12 \times 12 \times 24)} \approx 6.3 \times 10^{5} \mathrm{~s} \approx 1.8 \times 10^{2} \mathrm{~h} \approx 7.3 \text { days. }
$$

Again, equilibration adds only a small correction, so we quote $\approx 175 \mathrm{~h}(\approx 7.3$ days $)$ as the total per-trajectory walltime in Table 2.

