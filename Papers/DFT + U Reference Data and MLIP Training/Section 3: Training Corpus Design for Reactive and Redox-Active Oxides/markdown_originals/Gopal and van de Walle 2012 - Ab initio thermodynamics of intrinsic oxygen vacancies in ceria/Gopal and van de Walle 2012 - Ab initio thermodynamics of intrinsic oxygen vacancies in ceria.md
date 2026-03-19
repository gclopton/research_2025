# Ab initio thermodynamics of intrinsic oxygen vacancies in ceria 

Chirranjeevi Balaji Gopal ${ }^{1}$ and Axel van de Walle ${ }^{2}$<br>${ }^{1}$ Department of Applied Physics and Materials Science, California Institute of Technology, Pasadena, California 91125, USA,<br>${ }^{2}$ School of Engineering, Brown University, Providence, Rhode Island 02912, USA

(Dated: March 26, 2022)


#### Abstract

Nonstoichiometric ceria $\left(\mathrm{CeO}_{2-\delta}\right)$ is a candidate reaction medium to facilitate two step water splitting cycles and generate hydrogen. Improving upon its thermodynamic suitability through doping requires an understanding of its vacancy thermodynamics. Using density functional theory(DFT) calculations and a cluster expansion based Monte Carlo simulations, we have studied the high temperature thermodynamics of intrinsic oxygen vacancies in ceria. The DFT $+U$ approach was used to get the ground state energies of various vacancy configurations in ceria, which were subsequently fit to a cluster expansion Hamiltonian to efficiently model the configurational dependence of energy. The effect of lattice vibrations was incorporated through a temperature dependent cluster expansion. Lattice Monte Carlo simulations using the cluster expansion Hamiltonian were able to detect the miscibility gap in the phase diagram of ceria. The inclusion of vibrational and electronic entropy effects made the agreement with experiments quantitative. The deviation from an ideal solution model was quantified by calculating as a function of nonstoichiometry, a) the solid state entropy from Monte Carlo simulations and b) Warren-Cowley short range order parameters of various pair clusters.


## I. INTRODUCTION

Ceria( $\mathrm{CeO}_{2}$ ) and ceria based fluorite structure oxides are among the best performing solid oxide fuel cell electrolytes and have historically been used as automotive exhaust catalysts to reduce noxious gases. Due to its structural similarity to urania and thoria, ceria is also of interest to the nuclear fuels community to investigate radiation damage to fuel rods in nuclear reactors. Recently, Chueh et al! ${ }^{[12]}$ demonstrated a two step solar driven thermochemical cycle based on ceria to split water and produce hydrogen as follows.

$$
\begin{aligned}
& \mathrm{CeO}_{2-\delta_{L}} \xrightarrow{T_{H}} \mathrm{CeO}_{2-\delta_{H}}+\frac{\delta_{H}-\delta_{L}}{2} \mathrm{O}_{2} \\
& \mathrm{CeO}_{2-\delta_{H}}+\left(\delta_{H}-\delta_{L}\right) \mathrm{H}_{2} \mathrm{O} \xrightarrow{T_{L}} \mathrm{CeO}_{2-\delta_{L}}+\left(\delta_{H}-\delta_{L}\right) \mathrm{H}_{2}
\end{aligned}
$$

$\delta_{L}$ and $\delta_{H}$ respectively denote the oxygen nonstoichiometry at the low temperature ( $\mathrm{T}_{L}$ ) and high temperature ( $\mathrm{T}_{H}$ ) steps. The high temperature step of the redox cycle involves release of oxygen from ceria, forming oxygen vacancies(henceforth referred to as vacancies) in the lattice. At the low temperature step, ceria reacts with water, oxidizing itself and liberating $\mathrm{H}_{2}$ which can be used to generate electricity through a fuel cell. From a purely thermodynamics perspective, these applications stem from the remarkable ability of ceria to display significant oxygen nonstoichiometry without changing its crystal structure. The oxygen vacancy formation is facilitated by the ability of Ce to exist in two oxidation states: $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$. A general thermodynamic framework based on $\mathrm{DFT}+U$ calculations to assess the suitability of an oxide for twostep water splitting cycles was proposed by Meredig and Wolverton ${ }^{3}$.

Experimental work on undoped ceria has been actively pursued for a long time, excellent reviews of which
have been published by Inaba et al. ${ }^{4}$ and Mogensen et al. ${ }^{5}$. Thermodynamic data including nonstoichiometry $\delta$ as a function of temperature (T) and partial pressure of oxygen ( $p_{O_{2}}$ ) and the enthalpy and entropy of reduction reaction has been measured extensively ${ }^{6}$. On the computational side, significant research has been devoted to understanding the electronic structure of nonstoichiometric ceria from first principles using density functional theory(DFT) ${ }^{\frac{78}{8}}$ with the standard local density approximation(LDA) and generalized gradient approximation(GGA) exchange correlation functionals. It is well known that the 4 f electrons in $\mathrm{CeO}_{2}$ need to be treated as valence states to accurately reproduce the experimentally observed properties ${ }^{9}$. Using the conventional LDA and GGA exchange correlation functionals in ceria leads to the self interaction error and a consequent failure to reproduce the insulating character of defect-free ceria. This necessitates adding a Hubbard potential $(U)$ correction for the Ce ' 4 f ' electrons to generate the experimentally observed band gap ${ }^{10}$. Hybrid functionals yield improvement in the electronic picture of ceria, but do not significantly change the energetics of vacancy formation ${ }^{\underline{11} \text {. The effects of transition and }}$ rare earth metal dopants $\sqrt{12}$ : both aliovalent ${ }^{15116}$ and isovalent ${ }^{\frac{17118}{17}}$ on oxygen vacancy formation have been investigated using a supercell approach. The oxygen storage capacity is correlated to the structural relaxation brought about by dopants with smaller ionic radius than $\mathrm{Ce}^{4+}$ and the electrostatic effects. Activation energies for potential vacancy migration pathways have been computed from first principles $\sqrt{19}-21$ to understand the mechanisms of defect migration at atomistic scale. With the development of density functional perturbation theory, lattice dynamical properties, Born effective charges and phonon density of states have been calculated and these are found to agree well with experimental data ${ }^{2223}$.

However, $a b$ initio calculations are currently in-
tractable for system sizes greater than a few hundred atoms. To obtain finite temperature bulk properties, it is necessary to move beyond the realm of DFT calculations to statistical thermodynamics of larger system sizes( $>10^{3}$ atoms ). While literature abounds with experimental investigations of the properties of ceria at high temperatures, the computational work described above has been primarily limited to studying the electronic structure and defect formation energies of ceria at absolute zero without attempting to obtain thermodynamic properties at higher temperatures, which is where its most interesting applications and properties emerge.

Our computational study aims to isolate and focus on the thermodynamics of intrinsic oxygen vacancies in ceria relevant to thermochemical cycling. While vacancies are central to the thermochemical cycling process, the thermodynamic driving force is governed by the change in $\delta$ (i.e. $\Delta \delta$ ) between $T_{H}$ and $T_{L}$. For repeatability of the redox cycle, it is necessary to operate in the regime of single phase nonstoichiometric ceria. Furthermore, at such high values of $\delta$, defect interactions become considerable and can negatively impact the entropic driving force for the reduction of ceria. Understanding the nature of vacancy interactions as a function of temperature and concentration in ceria will therefore be instrumental in motivating dopants to improve its suitability. Aside from its immediate relevance to thermochemical fuel production, we chose ceria as our model system since its phase diagram and vacancy thermodynamics are established experimentally. This would help test the accuracy of the computational thermodynamics approach to studying nonstoichiometric oxides, and extend it to screen dopants and predict properties of doped ceria, for which literature is not as extensive.

Modeling of ceria presents a unique challenge: it requires the ability to capture electron-localization and associated electronic entropy effects. A step in this direction was made for the $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ system ${ }^{24}$ by showing that including electronic entropy via a cluster expansion approach yields a phase diagram whose topology is in qualitative agreement with experiments. We build upon this effort and seek to conclusively demonstrate the thermodynamic validity of such an approach, by verifying that the inclusion of both electronic and vibrational entropies results in excellent quantitative agreement with experiments for not only the phase diagram, but other thermodynamic quantities as well, such as the entropy of reduction and short-range order.

The paper is organized as follows. The methodology of studying phase equilibria from first principles as applied to ceria will be discussed in Section II. Results and discussion (section III) will be broken down into subsections to focus independently on electronic structure calculations, cluster expansion and free energy integration. Wherever applicable, the intricacies of dealing with intrinsic oxygen vacancies in ceria will be emphasized.

## II. METHODOLOGY

The standard first principles approach to computing phase equilibria has been detailed previously. $25-27$ We present a brief overview here to highlight salient features of this approach relevant to nonstoichiometric oxides. Phase equilibria studies from first principles integrate both rigorous first principles calculations over selected small structures and large scale statistical ensemble based methods. The partition function, which contains all the thermodynamic information for a system, can be coarse grained over a hierarchy of degrees of freedom as described in Equation 3.

$$
Z=\sum_{\sigma \in L} \sum_{\nu \in \sigma} \exp [-\beta E(\sigma, \nu)]
$$

where $\nu, \sigma$ are respectively the vibrational and configurational states of the system constrained to a lattice L. Here, the configurational states include both genuine configuration variables (the presence of oxygen vacancies) and electronic state information (the location of the $\mathrm{Ce}^{3+}$ ions. The energy $E(\sigma, \nu)$ is obtained by performing quantum mechanical calculations for a fixed composition in the lattice, followed by ionic relaxation. Vibrational frequencies of the system are then calculated for small displacements away from the relaxed ground state at 0 K . The cluster expansion then parametrizes this information in terms of larger structural units and enables estimation of energies of cells and compositions inaccessible through first principles calculations in a fast and efficient manner. Finally, the thermodynamic integration procedure, with the aid of Monte Carlo simulations incorporates the effect of compositional fluctuations and temperature on the properties of the system and is used to derive other thermodynamic quantities.

## A. First principles calculations

Electronic structure calculations were performed using the Vienna $\boldsymbol{a} \boldsymbol{b}$ initio simulation package (VASP), a plane wave pseudopotential based DFT code ${ }^{28}$. GGA exchange correlation functional using the PAW (projector augmented wave) method ${ }^{29}$ was employed. To correct for the strong on-site coulombic interaction of the Ce 4f electrons, we adopted the rotationally invariant GGA $+U$ formalism introduced by Dudarev et a $a^{30}$. The Hubbard potential term ' $U$ ' penalizes partial occupancy of the f states and opens up a band gap. The value of U is typically set by fitting to experimentally established band gaps, or quantities such as lattice constant and bulk modulus. For nonstoichiometric ceria, based on previous $\mathrm{LDA}+U$ and GGA $+U$ studies ${ }^{8 / 10}$ of oxygen vacancy formation energies and electron localization on $\mathrm{Ce}^{3+}, U=5$ for GGA $+U$ and $U=6$ for LDA $+U$ have been proposed as optimal. Spin polarized GGA+ $U$ calculations in this work were all performed using $U=5$.

Ceria has a fluorite structure, with oxygen atoms occupying the tetrahedral voids of an FCC lattice of Ce . Defect calculations were performed on $2 \times 2 \times 2$ supercells of ceria ( 96 atoms), using a $2 \times 2 \times 2 k$-point grid. Electronic relaxations were performed until the total energy difference was less than $10^{-4} \mathrm{eV}$ while ionic relaxations were carried out until residual forces less than $0.02 \mathrm{eV} / \AA$ were achieved. Formation of vacancies in ceria leads to expansion of the lattice resulting from increased coulombic repulsion between the $\mathrm{Ce}^{4+}$ ions and larger ionic radius of $\mathrm{Ce}^{3+}$. We account for this by performing multiple constant volume relaxations at distinct volumes for each structure. The energy benefit accrued from the volume relaxation is significant, and if overlooked, could lead to erroneous energies predicted with the cluster expansion later on. In all, 36 different configurations of vacancies were studied with compositions ranging from $\mathrm{CeO}_{2}$ to $\mathrm{CeO}_{1.75}$.

First principles lattice dynamics calculations were performed to incorporate vibrational effects on phase stability. We used the 'small displacement' finite differences method as implemented in VASP 5.2 to compute the Hessian matrix for the structures. Displacements of $0.015 \AA$ away from the equilibrium relaxed positions were employed. For higher vacancy concentrations, we included structures with both pseudo-randomly dispersed and clustered arrangements to span the configurational dependence of the vibrational frequencies. The force constants output by VASP were used to obtain the dynamical matrix at other q -points and calculate out the phonon density of states (DOS) using PHONOPY ${ }^{31}$. Gaussian smearing and an $8 \times 8 \times 8$ q-point mesh were employed for the DOS calculation. The vibrational free energy ( $\mathrm{F}_{\text {Vib }}$ ) and entropy ( $\mathrm{S}_{\text {Vib }}$ ) were evaluated under the harmonic approximation as

$$
\begin{gathered}
\frac{F_{V i b}(T)}{N}=\frac{E^{*}}{N}+k_{B} T \int_{0}^{\infty} \ln \left(2 \sinh \left(\frac{h \nu}{2 k_{B} T}\right)\right) g(\nu) d \nu \\
\frac{S_{V i b}(T)}{N}=\left(\frac{\partial F_{V i b} / N}{\partial T}\right)_{V}
\end{gathered}
$$

where N is the total number of atoms in the system, $\nu$ is frequency of phonon mode, $\mathrm{g}(\nu)$ is the phonon density of states.

## B. Cluster expansion : configurational degrees of freedom

The cluster expansion (CE) Hamiltonian treats configurational disorder by decomposing the energy of a lattice into a basis of clusters ( points, pairs, triplets etc.) of lattice sites. Each cluster is a polynomial in occupation variables and has an associated effective cluster interaction (ECI), 'J' in equation 6. The ECIs are obtained by
fitting to the database of $a b$ initio energies.

$$
E(\sigma)=J_{0}+\sum_{i} J_{i} \sigma_{i}+\sum_{i \neq j} J_{i j} \sigma_{i} \sigma_{j}+\ldots
$$

Vacancies are treated as independent species, so any site in the anion sub-lattice can be occupied by an oxygen ion or vacancy. Additionally, we explicitly treat charge state disorder in the cation sub-lattice resulting from $\mathrm{Ce}^{4+} / \mathrm{Ce}^{3+}$ ( configurational electronic entropy ). In order to describe the energetics of this system with two interacting sub-lattices, we use a multicomponent multilattice CE formalism ${ }^{\frac{3233}{32}}$ that works in the product basis of cluster functions defined on each sublattice. Despite the presence of 4 distinct species ( $\mathrm{O}, \mathrm{Vac}, \mathrm{Ce}^{3+}, \mathrm{Ce}^{4+}$ ), constraints of site and charge balance ( $2\left[\mathrm{Ce}^{3+}\right]=[\mathrm{Vac}]$ ) render the system essentially pseudo-binary. Our cluster expansion fit was obtained using the mmaps code in the alloy theoretic automated toolkit (ATAT) ${ }^{2734}$.

The knowledge of ECIs provides a computationally inexpensive and efficient means to compute the energy of a large system on the fly during Monte Carlo simulations, circumventing the need for time consuming $a b$ initio calculations. As such, the CE fit to $a b$ initio energies is independent of temperature. By cluster expanding phonon free energies in the basis of clusters fit to configurational energies, the ECIs, and consequently the MC data can be made to include vibrational effects.

## C. Lattice Monte Carlo simulations : thermodynamic properties

The fundamental external variables of interest to the thermochemical cycling of ceria are temperature ( T ) and oxygen partial pressure ( $p_{O_{2}}$ ). Its properties are strongly dependent on the oxygen nonstoichiometry, which is uniquely set for a given ( $\mathrm{T}, p_{\mathrm{O}_{2}}$ ). Thus, ceria lends itself to be conveniently studied by semi grand canonical Monte Carlo simulations, treating temperature and chemical potential as external variables. A semi-grand canonical ensemble fixes the total number of lattice sites, letting the concentration of individual species fluctuate in response to an an applied temperature or chemical potential change. Consideration of macroscopic chargeneutrality leaves us with one independent chemical potential $\mu$ written as :

$$
\mu=\left(\mu_{V a c}-\mu_{O^{2-}}\right)+2\left(\mu_{C e^{3+}}-\mu_{C e^{4+}}\right)
$$

where $\mu_{V a c}, \mu_{O^{2-}}, \mu_{C e^{3+}}$ and $\mu_{C e^{4+}}$ denote the chemical potentials of the individual species which are externally imposed. $\mu$ can be described as the free energy cost associated with swapping a pair of $\mathrm{Ce}^{4+}$ and $\mathrm{O}^{2-}$ with a pair of $\mathrm{Ce}^{3+}$ and $V a c$.

The Grand Potential $\Phi(\mu, T)$ with respect to a reference can be obtained by thermodynamic integration along a fixed T or fixed $\mu$ path

$$
\Phi\left(T_{0}, \mu\right)=\Phi\left(T_{0}, \mu_{0}\right)-\int_{\mu_{0}}^{\mu}\left\langle N\left(T_{0}, \mu\right)\right\rangle d \mu
$$

$$
\frac{\Phi\left(T, \mu_{0}\right)}{k_{B} T}=\frac{\Phi\left(T_{0}, \mu_{0}\right)}{k_{B} T_{0}}+\int_{T_{0}}^{T}\left(\left\langle E\left(T, \mu_{0}\right)\right\rangle-\mu\left\langle N\left(T, \mu_{0}\right)\right\rangle\right) d \beta
$$

$\langle E\rangle$ is the thermodynamically averaged energy, $\langle N\rangle$ is the thermodynamically averaged concentration, $\mu_{0}$ and $\mathrm{T}_{0}$ are the reference chemical potential and temperature, and $\beta=1 / k_{B} T$. The low temperature and high temperature expansions to obtain the reference points for integration are not central to this paper and can be found elsewhere ${ }^{35}$. Our MC runs were performed on 5184 atom cells (larger sizes were attempted and found to not affect the results) using the memc2 code from ATAI ${ }^{[32]}$. Temperature steps of 40 K were used for the MC runs, with 2000 equilibrium passes and 1000 averaging passes at each $\left(T, p_{O_{2}}\right)$. Simultaneous spin flips were used to maintain charge balance and were constrained to occur within two unit cell distances of each other.

It should be noted that the constraint of charge balance alone is not sufficient to guarantee that the system will never undergo a phase separation into multiple spurious ground states that are locally non charge balanced although the overall simulation cell is. This can occur when the cluster expansion is only fitted to chargebalanced structures, thus providing little guarantee that the extrapolated energy of non-charge-balanced structures is physically meaningful. We avoided this problem by an iterative procedure. Starting with a cluster expansion fitted to charge-balanced structure only, we monitored the simulation for evidence of phase separation into non-charge-balanced structures. Whenever this was observed, the energy of the structure was calculated from first principles and included in the cluster expansion to reduce extrapolation errors from the fit. Since $a b$ initio calculations imposing periodic boundary conditions necessarily enforce charge-neutrality, we used a neutralizing background charge to estimate the energy of non-charge-balanced structures. This ansatz is justified whenever the resulting calculated energies are sufficiently high, so that these configurations are very rarely sampled in equilibrium.)

## III. RESULTS AND DISCUSSION

## A. First principles

Using GGA $+U$ calculations, the equilibrium lattice constant for stoichiometric ceria was found to be $5.48 \AA$. The formation of an oxygen vacancy in a $2 \times 2 \times 2$ supercell is accompanied by the localization of two electrons onto the 4 f states of two Ce atoms with anti-symmetric spins. True ground state convergence in other vacancy structures was tested by assigning different starting spin configurations to the Ce atoms (up or down spin, and their locations) and looking for the lowest energy structure. The 2p-5d and 2p-4f energy gaps were 5.3 eV and

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-4_564_772_184_1147.jpg)
FIG. 1. Phonon density of states from first principles calculated under the harmonic approximation. Oxygen vacancies lead to softening of vibrational modes in $\mathrm{CeO}_{1.91}$ (3 vacancies in a $2 \times 2 \times 2$ supercell) compared to $\mathrm{CeO}_{2}$.

2.5 eV respectively. The formation energy for an oxygen vacancy in a $2 \times 2 \times 2$ supercell was calculated to be 3.2 eV , agreeing with previous GGA $+U$ studies ${ }^{7}$. We included up to 8 vacancies in a $2 \times 2 \times 2$ supercell (corresponding to $\mathrm{CeO}_{1.75}$ ) in different configurations. Such defect concentrations, while high, have been shown to exist in ceria under appropriate ( $T, p_{O_{2}}$ ) and are of interest to us. The lattice expansion associated with vacancy formation was evaluated through multiple constant volume relaxations of each configuration and found to be around $2 \%$ for $\mathrm{CeO}_{1.75}$ (8 vacancies in a $2 \times 2 \times 2$ supercell).

Phonon DOS computed under the harmonic approximation are plotted in Fig. 1. Vacancies are clearly stabilized by vibrations as evidenced by the softening of modes in $\mathrm{CeO}_{1.91}$ ( 3 vacancies in a $2 \times 2 \times 2$ supercell) compared to $\mathrm{CeO}_{2}$. Further, for a given concentration, clustered vacancies had stiffer phonon modes than vacancies dispersed over the supercell.

## B. Cluster Expansion

The optimal cluster expansion fit to the calculated $a b$ initio energies (CE 1) of the 36 relaxed geometries comprised 13 pairs and 1 triplet clusters apart from the null and 2 point clusters. Considering that ceria is an ionic compound, it is important to ascertain if the long range electrostatic interactions are adequately described by a short-range cluster expansion. To ascertain this, we fit another cluster expansion (CE 2) to the $a b$ initio energies after subtracting out the coulombic energy term (computed through an Ewald summation). The latter was then cluster expanded in the basis of clusters identified by the fit, and added as an energetic correction to the ECIs. The results are illustrated by Fig. 2. The pair and triplet cluster ECIs of CE 2 show identical decay characteristics with cluster diameter as CE 1 , indicating that
electrostatic interactions are captured well by the cluster expansion. The cross-validation score ${ }^{[27]}$, which provides a measure of the predictive power of a cluster expansion fit, was close to 0.003 eV for both CE 1 and CE 2. In view of these results, we justify using CE 1 for further work, given its higher computational efficiency.

The effect of temperature on ECIs was incorporated by cluster expanding the vibrational free energies in the basis of clusters of CE 1. This introduced a temperature dependent correction to 7 clusters (determined via crossvalidation) out of a total of 17 .

## C. Monte Carlo Simulations

The $\mathrm{Ce}-\mathrm{O}$ phase diagram in the composition range of $\mathrm{Ce}_{2} \mathrm{O}_{3}-\mathrm{CeO}_{2}$ has been determined by experiments. The low temperature portion of the phase diagram is complicated by the many vacancy ordered phases of composition $\mathrm{Ce}_{n} \mathrm{O}_{2 n-m}$, and is not of primary concern to this work. Of interest to us is the high temperature phase diagram and the ability of first principles calculations to predict the miscibility gap and vacancy thermodynamics in single phase non stoichiometric ceria.

A temperature-composition plot along a constant $\mu$ trajectory starting from 0 K is shown in Fig. 3. Defect free $\mathrm{CeO}_{2}$, the starting ground state (GS), is stable up to $1300^{\circ} \mathrm{C}$ before oxygen vacancies start to form. With the inclusion of vibrational effects, the onset of vacancies happens at a much lower temperature of $900^{\circ} \mathrm{C}$, all other variables being the same. Most $a b$ initio phase diagram studies have in past neglected the non-configurational contributions to defect formation entropy, which can sub-

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-5_585_864_1585_191.jpg)
FIG. 2. ECI vs cluster diameter for a cluster expansion fit to the as calculated first principles energies (squares, denoted by CE 1). Subtracting the electrostatic energy prior to fitting and later adding it back (as an energetic correction) does not change the variation of ECIs with cluster diameter (filled triangles, CE 2). This indicates that the electrostatic interactions are captured by the cluster expansion and do not need an explicit treatment.

stantially affect phase stability.
In order to accurately predict the miscibility gap, it is necessary to perform simulations from two different starting points for each $\mu-$ a heating simulation from the low temperature ordered ground state, and a cooling simulation from the high temperature disordered phase. At a given temperature, the discontinuity in concentration when the grand potentials from the two runs are equated leads to the miscibility gap. The phase diagram in the composition range of $\mathrm{CeO}_{1.8}$ to $\mathrm{CeO}_{2}$ obtained using this approach is shown in Fig. 4. A miscibility gap shows up even in the absence of vibrations, but the temperature scale is off by nearly a factor of two compared to experiments. The solubility limit of vacancies in ceria is underestimated and the miscibility gap is shown to persist up to temperatures as high as $1500^{\circ} \mathrm{C}$. The temperature dependent cluster expansion provides a closer agreement : the miscibility gap closes at $800^{\circ} \mathrm{C}\left(690^{\circ} \mathrm{C}\right.$ in experiments) and single phase ceria is shown to be stable at higher oxygen nonstoichiometry at any given temperature.

The cluster expansion technique was principally intended to model configurational disorder in alloys in which interatomic interactions tend to be much simpler than in insulators or semiconductors. Studies have however expanded its domain of applications to describe the energetics of Li intercalation in battery materials and model charge state disorder through a localized electronic entropy term $\stackrel{24}{2}$, equilibrium composition profile across interfaces of doped ceria superlattices ${ }^{36}$. This is the first study of high temperature phase diagram of ceria from first principles. That it captures the thermodynamics and detects a miscibility gap in a correlated electron system is in itself a significant result; the quantitative agreement with experiment upon including the effect of vibrations and electronic entropy shows even more promise.

The phase diagram helps identify thermodynamically stable phases at equilibrium, but even in the region of single phase nonstoichiometric ceria, significant short range order can persist leading to deviation of bulk thermodynamic properties from that of an ideal solution. Indeed, this is the case and ceria deviates from an ideal solution model for $\delta$ values as low as 0.007 . It is characterized experimentally by studying the dependence of nonstoichiometry (or a dependent property there of, such as electrical conductivity)on the partial pressure of oxygen. It can also be studied by extracting the nonstoichiometry dependence of entropy change associated with vacancy formation. Momentarily disregarding the entropy of gaseous oxygen released upon vacancy formation, the entropy change for the solid phase can be directly evaluated by converting the grand canonical output of MC simulations into canonical quantities.

$$
\langle S\rangle=\frac{1}{T}\left(\langle E\rangle-\Phi-\sum_{i} \mu_{i}\left\langle n_{i}\right\rangle\right)
$$

We fit a model which includes ideal configurational en-
tropy with a polynomial correction term (to account for non-ideal behavior) to $\mathrm{S}(\delta)$ evaluated per site.

$$
\begin{array}{r}
S_{\text {Solid }}(\delta)=A\left[2\left(\frac{\delta}{2}\right) \ln \left(\frac{\delta}{2}\right)+2\left(1-\frac{\delta}{2}\right) \ln \left(1-\frac{\delta}{2}\right)\right. \\
+(2 \delta) \ln (2 \delta)+(1-2 \delta) \ln (1-2 \delta)] \\
+B \delta^{3}+C \delta^{2}+D \delta+E
\end{array}
$$

where $\delta$ is the nonstoichiometry, A,B,C,D and E are constants (for a given T). The solid state entropy $\mathrm{S}_{\text {Solid }}(\delta)$ per site referenced to $\mathrm{S}_{\text {Solid }}(\delta=0)$ is plotted in Fig. 5 for $\mathrm{T}=1480 \mathrm{~K}$. The ideal solution entropy(the term whose coefficient is A) peaks at $\delta=0.25$, but the actual entropy of the system plateaus much sooner. The pronounced deviation from ideal solution behavior is apparent from $\delta$ values as low as 0.01 . Vibrations clearly increase the entropic advantage to having vacancies, but the strongly non ideal character persists. To compare with experimental work ${ }^{[6]}$, we computed the entropy of reduction associated with forming an oxygen vacancy in the limit of infinitesimal change in nonstoichiometry.

$$
\begin{array}{r}
\lim _{\Delta \delta \rightarrow 0} \frac{1}{\Delta \delta} \mathrm{CeO}_{2-\delta} \longrightarrow \frac{1}{\Delta \delta} \mathrm{CeO}_{2-(\delta+\Delta \delta)}+\frac{1}{2} \mathrm{O}_{2} \\
\Delta S_{\text {Total }}(\delta)=\Delta S_{\text {Solid }}(\delta)+0.5 * S_{O_{2}}(\delta) \\
S_{O_{2}}(T)=S_{O_{2}}^{0}(T, 1 \mathrm{~atm})-k_{B} \ln \left[\frac{p_{O_{2}}}{1 \mathrm{~atm}}\right] \\
\Delta S_{\text {Solid }}(\delta)=\frac{1}{\Delta \delta}\left(S_{C e O_{2-\delta}}-S_{C e O_{2-\delta-\Delta \delta}}\right)
\end{array}
$$

The solid state entropy is readily available from MC simulations. However, there are difficulties associated with calculating entropy of gaseous oxygen from first principles, mainly concerned with the definition of a reference

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-6_601_869_1705_156.jpg)
FIG. 3. A constant $\mu$ trajectory MC simulation starting from the low temperature ground state ( $\mathrm{CeO}_{2}$ ) illustrating vibrational effects on the phase diagram and vacancy concentrations.

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-6_676_859_182_1112.jpg)
FIG. 4. (Color online) Miscibility gap in ceria calculated from Monte Carlo simulations. The pronounced effect of vibrations is visible from the suppression of the miscibility gap to lower temperatures and enhanced vacancy solubility in nonstoichiometric ceria. The experimental phase diagram ${ }^{[37]}$ has been overlaid for comparison.

state. This can be resolved by using the standard state entropy data for molecular oxygen from thermochemical tables ${ }^{38} . p_{O_{2}}$ can be obtained using Eqn. 16.

$$
\mu_{O}(T)=\mu_{O}^{0}(T)+k_{B} T \ln \left[\frac{p_{O_{2}}}{1 a t m}\right]
$$

While the chemical potentials of the respective species from MC simulations are guaranteed to yield the right equilibrium composition and free energies, they are arbitrarily displaced from their true values by an additive constant. This prevents a straightforward application of Equation 16. As a workaround, we used the experimentally published nonstoichiometry vs $\ln \left(p_{O_{2}}\right)$ data ${ }^{6}$ to fit the chemical potential from MC and obtain the offset. $\Delta S_{\text {Total }}(\delta)$ computed using this approach at 1480 K is illustrated in Fig. 6. The strong deviation from ideal solution model suggests that the entropic benefit from vacancies is being offset by some kind of defect interactions. These defect interactions could arise from stable defect complexes or vacancy ordering over short length scales. We look to characterize and quantify the short range order (SRO) by calculating the thermally averaged pair correlations for the pair clusters in real space. Formally, this idea is embodied in the Warren-Cowley parameters.

$$
\begin{gathered}
\alpha_{l m n}(\delta)=\frac{\left\langle\sigma_{000} \sigma_{l m n}\right\rangle-\left\langle\sigma_{000}\right\rangle^{2}}{1-\left\langle\sigma_{000}\right\rangle^{2}} \\
\left\langle\sigma_{000} \sigma_{l m n}\right\rangle=\sum_{\sigma} P(\sigma, T) \frac{1}{N} \sum_{i} \sigma_{i} \sigma_{i+(l m n)}
\end{gathered}
$$

For a pair $\{(0,0,0),(\mathrm{l}, \mathrm{m}, \mathrm{n})\}$ in the $\mathrm{O}^{2-} /$ Vac sub-lattice with vacancy site fraction 's', $\hat{\sigma}_{i}$ is the occupation vari-

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-7_693_904_180_143.jpg)
FIG. 5. Entropy of $\mathrm{CeO}_{2-\delta}$ referenced to $\mathrm{CeO}_{2}$ computed from MC simulations at 1480 K . The deviation from ideal solution behavior (configurational disorder in $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ and $\mathrm{O}^{2-}$ /Vac lattice) becomes apparent even at low $\delta$. Vibrations provide entropic benefit to forming vacancies, but the marked non-ideal behavior prevails.

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-7_680_888_1190_176.jpg)
FIG. 6. Entropy change associated with forming an oxygen vacancy (see Eqn. 12) as a function of nonstoichiometry compared with experiment ${ }^{\underline{6}}$

able for site i averaged over all sites equivalent by symmetry, $\left\langle\hat{\sigma}_{000}\right\rangle^{2}=(1-2 s)^{2}$ is the MC average of the point cluster correlation and $\left\langle\hat{\sigma}_{000} \hat{\sigma}_{l m n}\right\rangle$ is the averaged correlation function of the pair cluster. $\mathrm{P}(\sigma, \mathrm{T})$ is the probability of configuration $\sigma$, given by

$$
P(\sigma, T)=\frac{1}{Z\left(\left\{\mu_{i}\right\}, T\right)} \exp \left[-\beta\left(E(\sigma)-\sum_{i} \mu_{i} x_{i}\right)\right]
$$

where $Z\left(\left\{\mu_{i}\right\}, T\right)$ is the semi-grand canonical partition

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-7_568_690_174_1173.jpg)
FIG. 7. (Color online) Different vacancy pairs in the anion sub-lattice of a unit cell of ceria. Black boxes denote vacancies. The color scheme for the oxygen atoms corresponds with that used for plotting SRO parameters of various vacancy pairs in Fig. 8.

function and $\left\{\mu_{i}\right\}$ is the set of chemical potentials. If vacancies behave ideally (non interacting, randomly distributed), then $\left\langle\hat{\sigma}_{000} \hat{\sigma}_{l m n}\right\rangle=\left\langle\hat{\sigma}_{000}\right\rangle\left\langle\hat{\sigma}_{l m n}\right\rangle=(1-2 s)^{2}$ and $\alpha_{l m n}(\delta)=0$ for any $\delta$. Clustering of like species is given by $\alpha_{l m n}>0$ and likewise ordering of unlike species is given by $\alpha_{l m n}<0$.

TABLE I. Cluster type, coordinates and diameter of the first five pair clusters in the anion sublattice of ceria. There are 2 distinct $1 / 2[111]$ clusters, one within the unit cell(superscript 'a') and another extending out of the unit cell, with a face centered Ce atom halfway in between (superscript 'b').
| Cluster type | Sites (fractional <br> coordinates) | Diameter $(\AA)$ |
| :---: | :---: | :---: |
| $1 / 2[100]$ | $(0.25,0.25,0.25)$ <br> $(0.25,0.25,0.75)$ | 2.74 |
| $1 / 2[110]$ | $(0.25,0.25,0.25)$ | 3.87 |
|  | $(-0.25,0.25,0.75)$ |  |
| $1 / 2[111]^{a}$ | $(0.75,0.75,0.75)$ | 4.75 |
|  | $(0.25,0.25,1.25)$ |  |
| $1 / 2[111]^{b}$ | $(0.75,0.75,0.75)$ | 4.75 |
|  | $(0.25,0.25,0.25)$ |  |
| $[100]$ | $(0.75,0.75,0.75)$ | 5.48 |
|  | $(-0.25,0.75,0.75)$ |  |


Fig. 7 shows three vacancy pairs in the anion sublattice of a unit cell of ceria. There are 2 distinct $1 / 2[111]$ clusters, one within the unit cell and another extending out of the unit cell, with a face centered Ce atom halfway in between. Tab. I summarizes the coordinates and diameters of the five smallest pair clusters in the anion sublattice. In Fig. 8(a), $\alpha(\delta)$ at 1320 K for the five clusters in Table I are plotted. Close to stoichiometry, $\alpha_{l m n}=0$ for all (lmn), as would be expected for non interacting vacancies. However, deviations from zero become apparent even for slightly off-stoichiometric compositions. In particular, there is strong preference for va-
cancies to align along $1 / 2[110]$. The negative correlation along $1 / 2[100]$ indicates that two vacancies are not thermodynamically favored at nearest neighbor sites. The two distinct $1 / 2[111]$ pairs have nearly the same value of $\alpha>0$ and hence are possible directions for short range clustering of vacancies. The effect of temperature is to favor disorder (Fig. 8(b) for WC parameters at 1791 K ), as can be seen from the fact that $\alpha_{l m n} \approx 0$ up to larger nonstoichiometry. At still higher concentrations of vacancies, the $\alpha_{l m n}$ start to deviate from zero and show similar clustering/ordering tendencies along the respective directions.

![](./images/600e2bc2-07e8-4d2d-b93f-9ae854223136-8_1423_895_696_156.jpg)
FIG. 8. (Color online) Warren-Cowley short range order parameters $\left(\alpha_{l m n}\right)$ as a function of nonstoichiometry for various pair clusters in the $\mathrm{O}^{2-}$ /Vac sublattice at (a) 1262 K and (b) 1791 K . Of note is a strong clustering tendency along $1 / 2[110]$.

There are multiple related system properties associated with vacancy formation in ceria, hence no one rule can govern the choice of dopants. While vacancies are crucial,
it is the change in nonstoichiometry between the high and low temperature steps (Eqn. 1 ) that ultimately establishes the oxygen uptake and consequently the amount of hydrogen produced. An important implication of this study is that interactions between vacancies (can include dopant-vacancy interactions in doped ceria) markedly diminish the entropic driving force for the thermochemical cycling of ceria. A dopant which tends to increase the dielectric constant of ceria would screen vacancies from seeing each other and inhibit short range ordering. A computational study combining accurate first principles calculations of electronic structure and energetics, together with an efficient cluster expansion based Monte Carlo simulations of configurational disorder, temperature and oxygen chemical potential effects is essential to screen potential dopants for ceria.

## IV. CONCLUSIONS

We successfully employed a cluster expansion Hamiltonian based lattice Monte Carlo simulations approach to quantitatively compute the high temperature thermodynamics of oxygen vacancies in ceria from first principles. The ground state energy and electronic structure of nonstoichiometric ceria were obtained from GGA+ $U$ supercell calculations. The database of structures and energies was used to fit a coupled cluster expansion that explicitly accounts for charge state disorder ( $\mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ ). Lattice vibrational free energies were calculated from first principles under the harmonic approximation and found to favor formation of vacancies. Vibrational effects were incorporated as a temperature correction to the ECIs. The phase diagram obtained from lattice Monte Carlo simulations was found to exhibit a miscibility gap. The inclusion of vibrations resulted in quantitative corrections to the composition and temperature range of the miscibility gap, yielding excellent agreement with experiments. The solid state entropy change resulting from vacancy formation was evaluated and the deviation from ideal solution behavior illustrated through composition dependence of entropy. To further quantify the defect interactions leading to deviations from ideality, Warren Cowley short range order parameters were computed. It was found that there is a strong preference for vacancies to cluster along $1 / 2[110]$ and $1 / 2[111]$ directions, while the nearest neighbor $1 / 2[100]$ sites exhibited ordering behavior. While temperature does disorder the structure, the aforementioned behavior was shown to persist at temperatures as high as 1780 K .

## ACKNOWLEDGEMENTS

Work supported by the National Science Foundation under CAREER Grant DMR-1154895 and by Teragrid/XSEDE computational Resources provided by NCSA and TACC under Grant No. DMR050013N.
${ }^{1}$ W. C. Chueh and S. M. Haile, Phil. Trans. R. Soc. A. 368, 3269 (2010).
${ }^{2}$ W. C. Chueh, C. Falter, M. Abbott, D. Scipio, P. Furler, S. M. Haile, and A. Steinfeld, Science 330, 1797 (2010).
${ }^{3}$ B. Meredig and C. Wolverton, Phys. Rev. B 80, 245119 (2009).
${ }^{4}$ H. Inaba and H. Tagawa, Solid State Ionics 83, 1 (1996).
${ }^{5}$ M. Mogensen, N. M. Sammes, and G. A. Tompsett, Solid State Ionics 129, 63 (2000).
${ }^{6}$ R. J. Panlener and R. N. Blumenthal, J. Phys. Chem. Solids M, 1213 (1975).
${ }^{7}$ D. A. Andersson, S. I. Simak, B. Johansson, I. A. Abrikosov, and N. V. Skorodumova, Phys. Rev. B 75, 035109 (2007).
${ }^{8}$ C. W. M. Castleton, J. Kullgren, and K. Hermansson, J. Chem. Phys. 127, 244704 (2007).
${ }^{9}$ N. V. Skorodumova, R. Ahuja, S. I. Simak, I. A. Abrikosov, B. Johansson, and B. I. Lundqvist, Phys. Rev. B 64, 115108 (2001).
${ }^{10}$ C. Loschen, J. Carrasco, K. M. Neyman, and F. Illas, Phys. Rev. B. 75, 035115 (2007).
${ }^{11}$ J. L. F. Da Silva, M. V. Ganduglia-Pirovano, J. Sauer, V. Bayer, and G. Kresse, Phys. Rev. B 75, 045121 (2007).
${ }^{12}$ A. Gupta, U. V. Waghmare, and M. S. Hegde, Chem. Mat. 22, 5184 (2010).
${ }^{13}$ D. O. Scanlon, B. J. Morgan, and G. W. Watson, Phys. Chem. Chem. Phys. 13, 4279 (2011).
${ }^{14}$ Z. Yang, G. Luo, Z. Lu, T. K. Woo, and K. Hermansson, J. Phys. : Condens. Matter 20, 035210 (2008).
${ }^{15}$ D. A. Andersson, S. I. Simak, N. V. Skorodumova, I. A. Abrikosov, and B. Johansson, Proc. Nat. Acad. Sci. USA. 103, 3518 (2006).
${ }^{16}$ D. A. Andersson, S. I. Simak, N. V. Skorodumova, I. A. Abrikosov, and B. Johansson, Appl. Phys. Lett. 90, 031909 (2007).
${ }^{17}$ Z. Yang, T. K. Woo, and K. Hermansson, J. Chem. Phys. 124, 224704 (2006).
${ }^{18}$ H.-T. Chen and J.-G. Chang, J. Chem. Phys. 132, 214702 (2010).
${ }^{19}$ P. P. Dholabhai, J. B. Adams, P. Crozier, and R. Sharma, J. Chem. Phys. 132, 094104 (2010).
${ }^{20}$ A. Ismail, J. Hooper, J. B. Giorgi, and T. K. Woo, Phys. Chem. Chem. Phys. 13, 6116 (2011).
${ }^{21}$ P. P. Dholabhai, J. B. Adams, P. Crozier, and R. Sharma, Phys. Chem. Chem. Phys. 12, 7904 (2010).
${ }^{22}$ T. Gürel and R. Eryigit, Phys. Rev. B. 74, 014302 (2006).
${ }^{23}$ G. Dutta, S. K. Saha, and U. V. Waghmare, Solid State Commun. 150, 2020 (2010).
${ }^{24}$ F. Zhou, T. Maxisch, and G. Ceder, Phys. Rev. Lett. 97, 155704 (2006).
${ }^{25}$ A. V. Ruban and I. A. Abrikosov, Rep. Prog. Phys. 71, 046501 (2008).
${ }^{26}$ G. Ceder, A. V. D. Ven, C. Marianetti, and D. Morgan, Modell. Simul. Mater. Sci. Eng. 8, 311 (2000).
${ }^{27}$ A. van de Walle and G. Ceder, J. Phase Equilib. 23, 348 (2002).
${ }^{28}$ G. Kresse and J. Furthmüller, Phys. Rev. B. 54, 11169 (1996).
${ }^{29}$ P. E. Blöchl, Phys. Rev. B 50, 17953 (1994).
${ }^{30}$ S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys, and A. P. Sutton, Phys. Rev. B 57, 1505 (1998).
${ }^{31}$ A. Togo, F. Oba, and I. Tanaka, Phys. Rev. B 78, 134106 (2008).

32 A. van de Walle, Calphad 33, 266 (2009).
${ }^{33}$ P. D. Tepesch, G. D. Garbulsky, and G. Ceder, Phys. Rev. Lett. 74, 2272 (1995).
${ }^{34}$ A. van de Walle, M. Asta, and G. Ceder, Calphad 26, 539 (2002).

35 A. van de Walle and M. Asta, Modell. Simul. Mater. Sci. Eng. 10, 521 (2002).
${ }^{36}$ A. van de Walle and D. E. Ellis, Phys. Rev. Lett. 98, 266101 (2007).
${ }^{37}$ M. Ricken, J. Nölting, and I. Riess, J. Solid State Chem. 54, 89 (1984).
${ }^{38}$ P. Linstrom and W. Mallard, NIST Chemistry Web Book, NIST Standard Reference Database Number 69. Gaithersburg, MD : Natl. Inst. Standard. Tech. (2003).

