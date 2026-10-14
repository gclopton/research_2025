Check for updates

Cite this: Phys. Chem. Chem. Phys., 2018, 20, 15293

Received 23rd February 2018, Accepted 14th May 2018

DOI: 10.1039/c8cp01219a
rsc.li/pccp

# Anisotropic chemical strain in cubic ceria due to oxygen-vacancy-induced elastic dipoles † 

Tridip Das, ${ }^{\mathrm{a}}$ Jason D. Nicholas, ${ }^{\mathrm{a}}$ Brian W. Sheldon ${ }^{\mathrm{b}}$ and Yue Qi ${ }^{* \mathrm{a}}$


#### Abstract

Accurate characterization of chemical strain is required to study a broad range of chemical-mechanical coupling phenomena. One of the most studied mechano-chemically active oxides, nonstoichiometric ceria $\left(\mathrm{CeO}_{2-\delta}\right)$, has only been described by a scalar chemical strain assuming isotropic deformation. However, combined density functional theory (DFT) calculations and elastic dipole tensor theory reveal that both the short-range bond distortions surrounding an oxygen-vacancy and the long-range chemical strain are anisotropic in cubic $\mathrm{CeO}_{2-\delta}$. The origin of this anisotropy is the charge disproportionation between the four cerium atoms around each oxygen-vacancy (two become $\mathrm{Ce}^{3+}$ and two become $\mathrm{Ce}^{4+}$ ) when a neutral oxygen-vacancy is formed. Around the oxygen-vacancy, six of the $\mathrm{Ce}^{3+}-\mathrm{O}$ bonds elongate, one of the $\mathrm{Ce}^{3+}-\mathrm{O}$ bond shorten, and all seven of the $\mathrm{Ce}^{4+}-\mathrm{O}$ bonds shorten. Further, the average and maximum chemical strain values obtained through tensor analysis successfully bound the various experimental data. Lastly, the anisotropic, oxygen-vacancy-elastic-dipole induced chemical strain is polarizable, which provides a physical model for the giant electrostriction recently discovered in doped and non-doped $\mathrm{CeO}_{2-\delta}$. Together, this work highlights the need to consider anisotropic tensors when calculating the chemical strain induced by dilute point defects in all materials, regardless of their symmetry.


## 1 Introduction

Chemical strain, the dimensional change caused by a compositional change, is of interest in a variety of electrochemical devices. ${ }^{1}$ For instance, the coupling between the chemical, mechanical, and electrical state that results from an electrochemically-active material experiencing chemical strain can: ${ }^{1}$ (a) produce stress in constrained materials that can (under some situations) lead to their mechanical degradation or failure, ${ }^{2,3}$ (b) provide new opportunities to characterize point defect concentration in materials, ${ }^{4,5}$ and (c) allow internal point defect concentrations to be altered with an externally applied stress, strain, or electrical potential. ${ }^{6-8}$ Since the majority of electrochemically active materials are mechano-chemically active, accurate values of chemical strain are required to quantify the general chemical-mechanical coupling phenomena. ${ }^{9-12}$

Of materials where chemical-mechanical coupling occurs, cerium oxide (either in pure or doped form) is the most widely studied nonstoichiometric oxide to date ${ }^{5}$ because its oxygen vacancy concentration can be varied over many orders of magnitude ${ }^{13,14}$ and because of its broad application as a catalyst, ${ }^{15}$ Solid Oxide Fuel Cell (SOFC) material, ${ }^{13,14,16-19}$ high-performance electrostrictor, ${ }^{7}$ oxide memristor component, ${ }^{8,20}$ etc. It is also helpful that ceria has a high

[^0]chemical expansion coefficient (the chemical strain per defect), ${ }^{5}$ $\alpha_{\mathrm{C}}$, defined as:
$$
\alpha_{\mathrm{C}}=\varepsilon_{\mathrm{C}} / \delta
$$
where $\varepsilon_{\mathrm{C}}$ is the chemical strain and $\delta$ is the oxygen nonstoichiometry. Its unique functionality and chemical strain are largely determined by the electronic structure of the oxygen vacancies. Therefore, accurate chemical expansion coefficients, $\alpha_{\mathrm{C}}$, determined by density functional theory (DFT) calculations can be used along with the measured chemical strain, $\varepsilon_{\mathrm{C}}$, to determine the vacancy concentration, $\delta$ in operando, as demonstrated in other oxide materials for battery applications. ${ }^{11,21}$

Although an elastic dipole tensor ${ }^{22}$ is the most general way to describe the short-and-long range deformation caused by changes in dilute point defect concentrations, previous experimental ${ }^{23-33}$ and computational ${ }^{9,10,19}$ studies on ceria have often treated the chemical strain, $\varepsilon_{\mathrm{C}}$, as a scalar (effectively assuming uniform oxygen-vacancy-induced strains in pure and doped $\mathrm{CeO}_{2-\delta}$ ). For instance, by computing the average lattice parameter change as a function of $\delta$, Marrocchelli et al. ${ }^{9}$ predicted the average $\alpha_{\mathrm{C}}$ in $\mathrm{CeO}_{2-\delta}$ using molecular dynamics with a DIPole Polarizable Ion Model (DIPPIM) force field. ${ }^{34}$ Further, Er et al. ${ }^{10}$ found uniform Ce deformation around an oxygen vacancy using density functional theory (DFT) and calculated a scalar $\alpha_{\mathrm{C}}$ based only on the principle components of the elastic dipole tensor. Wang et al. demonstrated non-uniform Ce displacement around an oxygen vacancy using $\mathrm{DFT}+U$ calculations but still reported a scalar $\alpha_{\mathrm{C}}$ using the average
lattice parameter change from a simulation cell containing one vacancy (which lead to $\alpha_{\mathrm{C}}$ varying with the simulation cell size). ${ }^{12}$

Even though fluorite-structured $\mathrm{CeO}_{2-\delta}$ has cubic symmetry, several new experimental observations suggest a directionally anisotropic ${ }^{12}$ chemical expansion, which requires a tensor representation. For instance, it has been shown that large biaxial stresses cause cubic ceria thin films to become tetragonal with increased vacancy concentration. ${ }^{35}$ Further, doped and un-doped ceria thin films ${ }^{7}$ and bulk pellets ${ }^{36}$ exhibit electrostrictive strains that are related to simultaneous Ce-O bond shortening and Ce-O bond lengthening around the oxygen vacancies (i.e. anisotropic local lattice distortion). ${ }^{37}$ In addition, Li et al. further characterized the short-range Ce-O bond distortions around an oxygen vacancy in $\mathrm{CeO}_{2-\delta}{ }^{37}$ and hypothesized that the oxygen vacancy induced chemical strain must be anisotropic in nature (and polarizable) to produce the large strains observed in ceria under an applied electric field, the so-called giant electrostriction phenomenon; while other mechanisms will give a much smaller electrostriction strain.

The goal of the present work was to reveal the physics of the counter-intuitive anisotropic chemical strain in cubic $\mathrm{CeO}_{2-\delta}$. This was accomplished by fully describing both the short-range lattice distortion and long-range elastic strain induced by dilute oxygen vacancies in $\mathrm{CeO}_{2-\delta}$. While the short-range lattice distortion (i.e. the oxygen nearest and second nearest neighbor bond distortions) could be accurately described by $\mathrm{DFT}+U$ calculations with a set of atomic displacements, the long-range elastic strain required the full chemical expansion coefficient tensor. As demonstrated here, with a tensorial $\alpha_{\mathrm{C}}$, the anisotropic chemical strain, average chemical strain, maximum expansion direction, and maximum contraction direction were fully captured and used to explain a broad range of experimentally-measured chemical strains ${ }^{24,25,38}$ and the "giant electrostriction" ${ }^{7}$ behavior observed in pure and doped ceria.

## 2 Methods

The chemical expansion coefficient tensor was calculated following the definition of Gillian ${ }^{22}$ and others. ${ }^{10,11}$ In this method, the shortrange elastic dipole tensor, $\boldsymbol{G}$, associated with an oxygen vacancy can be calculated by taking the first order Taylor expansion of the oxygen vacancy formation energy, $E_{\mathrm{V}_{\mathrm{O}}, \varepsilon}^{\mathrm{f}}$ eth respect to the applied strain tensor, ɛ. Since

$$
E_{\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}, \varepsilon}^{\mathrm{f}}=E_{\mathrm{V}_{\circ}^{\bullet \bullet, e=0}}^{\mathrm{f}}+\boldsymbol{G}: \boldsymbol{\varepsilon}
$$

where $E_{\mathrm{V}_{\mathrm{O}}^{\bullet \bullet},=0}^{\mathrm{f}}$ is the $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ formation energy in the absence of any applied strain, taking the derivative of eqn (2) with respect to $\varepsilon$, yields:

$$
\boldsymbol{G}=\mathrm{d} E_{\mathrm{V}_{\mathrm{O}}, \varepsilon}^{\mathrm{f}} / \mathrm{d} \varepsilon
$$

The chemical strain tensor at a given dilute oxygen vacancy concentration can be calculated by minimizing the total energy, $\Delta E_{\text {total }}$ with respect to the applied stain. $\Delta E_{\text {total }}$ consists of the energy due to the local lattice distortions caused by oxygen vacancy formation $\left(\Delta E_{\text {short }}\right)$ and the long-range elastic strain energy caused by oxygen vacancy formation $\left(\Delta E_{\text {long }}\right)$ as:

$$
\Delta E_{\text {total }}=\Delta E_{\text {short }}+\Delta E_{\text {long }}=\frac{\delta}{V_{\mathrm{U}}} \boldsymbol{G}: \boldsymbol{\varepsilon}+\frac{1}{2}(\mathbb{C}: \boldsymbol{\varepsilon}): \boldsymbol{\varepsilon},
$$

where $V_{\mathrm{U}}$ is the volume per formula unit of perfect $\mathrm{CeO}_{2}$ and $\mathbb{C}$ is the elastic stiffness tensor for the perfect lattice. Taking the derivative of eqn (4) with respect to $\varepsilon$ yields:

$$
\frac{\mathrm{d} \Delta E_{\text {total }}}{\mathrm{d} \varepsilon}=0=\frac{\delta}{V_{\mathrm{U}}} \boldsymbol{G}+\mathbb{C}: \boldsymbol{\varepsilon} .
$$

As shown in Section S1 of the ESI, † the chemical strain tensor, $\varepsilon_{\mathrm{C}}$ can be obtained by rearranging eqn (5) and substituting eqn (4) to yield:

$$
\boldsymbol{\varepsilon}_{\mathrm{C}}=\frac{-\delta\left(\mathbb{C}^{-1} \boldsymbol{G}\right)}{V_{\mathrm{U}}} \text { and } \boldsymbol{\alpha}_{\mathrm{C}}=\frac{-\left(\mathbb{C}^{-1} \boldsymbol{G}\right)}{V_{\mathrm{U}}}
$$

Here, both the short-range bond distortions around an oxygen vacancy and the elastic diploe tensor $\boldsymbol{G}$ were computed using spin-polarized plane wave DFT calculations implemented in the Vienna Ab Initio Simulation Package (VASP). A generalized gradient approximation with a Hubbard- $U$ correction $(\mathrm{GGA}+U)$ was utilized with $U_{\text {eff }}=4.5$ to treat the highly localized Ce 4f orbitals, following the rotationally invariant approach proposed by Dudarev et al. ${ }^{39}$ and previous calculations on ceria by Fabris et al. ${ }^{40}$ This $U_{\text {eff }}$ value for Ce 4f has been shown to provide satisfactory charge localization on Ce due to oxygen vacancy formation ${ }^{25}$ in the bulk and at the surface. ${ }^{41}$ The 2 × 2 × 2 ceria cubic-supercell shown in Fig. 1a was used for the neutral oxygen vacancy formation and short-range bond distortion calculations (with $\delta=0.03125$ ). Such a low $\delta$ avoided any vacancy-vacancy interactions caused by the periodic boundary conditions, ${ }^{42}$ a condition we consider as a dilute approximation. Future lowering the vacancy concentration below 1\% may involve other charge redistribution mechanisms. ${ }^{43,44}$ However, this situation is not considered here because most prior chemical-mechanical characterizations examined higher oxygen nonstoichiometry levels.

## 3 Results and discussion

3.1 Charge-disproportionation-induced anisotropic local lattice distortions around an oxygen vacancy

Neutral oxygen vacancy formation leaves two electrons in the $\mathrm{CeO}_{2-\delta}$ lattice. In a perfect $\mathrm{CeO}_{2}$ lattice, each Ce is in cubic coordination with 8 oxygen atoms and each oxygen is in tetrahedral coordination with 4 Ce atoms (Fig. 1a). As shown in Table 1, the DFT-predicted lattice parameters for the perfect lattice agree well with the values obtained from X-ray absorption near edge structure (XANES) measurements. ${ }^{37}$ The distribution of these two electrons on the $\mathrm{CeO}_{2-\delta}$ lattice directly impacts the short-range (local) lattice distortions and the long-range chemical strain. Therefore $\mathrm{DFT}+U$ calculations were performed to compare two possibilities: (a) the two electrons are equally shared among the four oxygen-vacancy-coordinated Ce atoms (resulting in isotropic local distortions) and (b) the two electrons are preferentially localized on only two oxygen-vacancy-coordinated Ce

![](./images/e49d2335-69af-4849-bfb8-96f6f378b4fd-3_1080_1480_167_292.jpg)
Fig. 1 (a) A $2 \times 2 \times 2 \mathrm{CeO}_{1.97}$ supercell with a neutral oxygen vacancy at the center and representative coordination polyhedra for Ce (yellow) and oxygen (red). (b) The charge distribution on Ce , the distance from the oxygen vacancy site, and various directions of interest. (c) Displacement of the O-atoms around an oxygen vacancy (black). Red-O moved away from the vacancy site. Green-O came closer to the oxygen vacancy site. Pink Ce-O bonds signify elongation relative to the bond length in the perfect structure and blue Ce-O bonds signify contraction. (d) Local oxygen lattice distortions around the oxygen vacancy site compared to the oxygen perfect lattice with $\mathrm{O}-\mathrm{O}-\mathrm{O}$ distances of $5.496 \text{Å}$.

Table 1 Energy and bond-length changes for various short-range deformation models
| Ceria structure $(2 \times 2 \times 2) \mathrm{d}$ | 0 K formation energy (eV) | Ce charge | $\mathrm{Ce}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ bond distance change | $\mathrm{O}-\mathrm{Ce}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ linear bond distance change | Ce-O bond distance change |  |  |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|  |  |  |  |  | This study (DFT on $\mathrm{CeO}_{2-\delta}$ ) |  | XANES data ${ }^{36}$ |
| Perfect lattice | -783.63 | 4+ | $2.38 \text{Å}$ | $4.76 \text{Å}$ | $2.38 \text{Å}$ | $\times 8$ | $2.34 \text{Å}$ |
| Uniform deformation | -775.20 | 3.5+ | +6.4\% | +1.35\% | 0.2\% | $\times 3$ |  |
|  |  |  |  |  | -0.3\% | $\times 3$ |  |
|  |  |  |  |  | -3.7\% | $\times 1$ |  |
| Non-uniform deformation | -775.75 | 3+ | +5.9\% | +1.84\% | -2.1\% | $\times 1$ | (+2.4\% to +14.1\%) × 1 |
|  |  |  |  |  | 1.6\% | $\times 2$ |  |
|  |  |  |  |  | 2.1\% | $\times 2$ |  |
|  |  |  |  |  | 2.5\% | $\times 2$ |  |
|  |  | 4+ | +7.6\% | +1.41\% | -4.6\% | $\times 1$ | (-2.4\% to -14.1\%) ×6 |
|  |  |  |  |  | -3.0\% | $\times 2$ |  |
|  |  |  |  |  | -2.1\% | $\times 1$ |  |
|  |  |  |  |  | -1.7\% | $\times 1$ |  |
|  |  |  |  |  | -1.3\% | $\times 2$ |  |


'+' indicates an increase and '-' indicates a decrease in bond length, '\%' indicates the strain relative to the perfect lattice, and '×' indicates the number of affected bonds. Note that even though the lattice is experiencing uniform deformation, different $\mathrm{Ce}-\mathrm{O}$ bonds around an individual Ce atom can experience different deformations.
atoms (resulting in directionally anisotropic local distortions). The atomic positions were relaxed after $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ formation in both cases while the cell volume was kept constant.

When isotropic lattice distortions were imposed, the four oxygen-vacancy-adjacent Ce atoms were all 3.5+ charged and moved equally away from the $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ site by $0.15 \text{Å}$, similar to the configurations reported by Marrocchelli et al. ${ }^{9}$ and Shenoy et al. ${ }^{10}$ In the non-uniform case, after $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ formation, two Ce atoms moved further than the other two, causing a non-uniform displacement of Ce atoms around each $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$. As reported in

Table 1, the non-uniform distortions were energetically favorable over the uniform distortions by 0.55 eV. In this case, two of the oxygen-vacancy-adjacent Ce atoms maintained a 4+ charge and the other two Ce atoms became 3+, as depicted in Fig. 1a. More detailed partial density of states (PDOS) calculations for the Ce 5d and 4f orbitals before and after the formation of an oxygen vacancy showed charge localization in the 4f orbital after $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ formation (details provided in ESI, † Section S2), which is consistent with previous computational studies. ${ }^{45,46}$

This charge disproportionation occurs between the oxygen-vacancy-adjacent Ce atoms in $\mathrm{CeO}_{2-\delta}$ leading to non-uniform local lattice distortions. Fig. 1b illustrates how the Ce- $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ distances changed from $2.38 \text{Å}$ to 2.52 and $2.56 \text{Å}$ for $\mathrm{Ce}^{3+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ and $\mathrm{Ce}^{4+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$, respectively. All four oxygen-vacancy-adjacent Ce atoms moved away from the $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ along the $\langle 111\rangle$ directions, with the $\mathrm{Ce}^{4+}$ atoms moving further than the $\mathrm{Ce}^{3+}$ atoms to form a distorted tetrahedron. Fig. 1c illustrates the effect that oxygen vacancy formation has on the local oxygen anion sublattice. As shown in Fig. 1c, each $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ has 6 FNN, 12 SNN, and 8 third nearest neighboring (TNN) oxygen atoms. The green oxygen atoms in Fig. 1c came closer to the $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ while the red oxygen atoms moved away from the $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$. Specifically, the 4 FNN oxygen atoms connected to $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ moved closer by $\sim 0.13 \text{Å}$, the FNN oxygen atoms connected to two $\mathrm{Ce}^{4+}$ atoms moved closer by $0.28 \text{Å}$, and the FNN oxygen atoms connecting the two $\mathrm{Ce}^{3+}$ atoms moved away only by $0.01 \text{Å}$.

Table 1 details the changes in the Ce-O bond distances around each $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$. As seen in Fig. 1c, the pink Ce-O bonds were shortened by oxygen vacancy formation while the blue bonds were lengthened. All seven of the $\mathrm{Ce}^{4+}-\mathrm{O}$ bonds around each oxygen-vacancy-coordinated $\mathrm{Ce}^{4+}$ contracted to lengths between $2.27 \text{Å}$ and $2.35 \text{Å}$, or by -4.6\% to -1.3\% compared to Ce-O in the perfect lattice. In contrast, six out of the seven Ce-O bonds around each oxygen-vacancy-coordinated $\mathrm{Ce}^{3+}$ elongated (as denoted by the pink bonds in Fig. 1c) to $\sim 2.43 \text{Å}$ or by 2\%. The $\mathrm{Ce}^{3+}-\mathrm{O}$ bond on the $\mathrm{O}-\mathrm{Ce}^{3+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ diagonal contracted to $2.33 \text{Å}$ or by -2\%. Li et al. ${ }^{37}$ used XANES to experimentally determine the local Ce-O bond length changes that occur when oxygen is removed from Gd doped ceria. They noticed that some Ce-O bonds were shortened to 2.013-2.288 Å (or by -13\% to -2\%) but some were elongated to 2.398-2.673 Å (2.3-16\%) with the introduction of oxygen vacancies. They also observed that the local bond length change was not sensitive to Gd-dopant level; therefore, it is appropriate to compare the predicted bond changes with the experiments, or at least the trends in bond length change. The simulations presented here on pure ceria show that bond contraction was in the range of -4.6\% to -1.3\% while bond elongation was in the range of 1.6-2.5\%. Despite the differences in absolute bond length magnitude, unlike previous modeling work performed assuming uniform local expansion (as shown in Table 1), the present DFT results effectively captured the simultaneous bond lengthening and shortening observed experimentally when oxygen is removed from ceria. It must be noted, however, that the two local deformation models proposed by Li et al. ${ }^{37}$ are only partially correct because they did not account for the non-uniform charge states on the oxygen-vacancy-adjacent Ce atoms.

### 3.2 The relationship between elastic dipoles and the anisotropic chemical strain induced by oxygen vacancies

Charge disproportionation and anisotropic local lattice distortions lead to anisotropic elastic dipoles and an anisotropic long-range chemical expansion coefficient as summarized in eqn (2)-(6). The short-range elastic dipole tensor, $\boldsymbol{G}$, is calculated by computing the oxygen vacancy formation energy $E_{\mathrm{V}_{\mathrm{O}}^{\bullet,}}^{\mathrm{f}}$ with different applied strain components, $\varepsilon$, from $\mathrm{DFT}+U$ and then fitting $E_{\mathrm{V}_{\mathrm{O}, \varepsilon}^{\bullet \bullet}}^{\mathrm{f}}$ as a linear function of strain along each strain direction as shown in Fig. 2a, producing:

$$
\boldsymbol{G}=\left[\begin{array}{lll}
-9.633 & 0.001 & 0.001 \\
0.001 & -9.633 & 1.734 \\
0.001 & 1.734 & -9.633
\end{array}\right]
$$

Fig. 2a clearly shows that the oxygen vacancy formation energy decreases under tension but does not vary much with shear strain. This indicates that the oxygen vacancy concentration in $\mathrm{CeO}_{2-\delta}$ increases under tensile uniaxial, biaxial, or hydrostatic stress; a trend experimentally-observed by Gopal et al. ${ }^{35}$

Entering $\boldsymbol{G}$ and the DFT predicted $V_{\mathrm{U}}$ and $\mathbb{C}$ values into eqn (6) leads to the DFT-predicted chemical expansion coefficient and chemical strain tenor. The calculated $V_{\mathrm{U}}=41.50 \text{Å}^{3}$ and cubic $\mathrm{CeO}_{2} \mathbb{C}$ values of $C_{11}=343 \mathrm{GPa}, C_{22}=103 \mathrm{GPa}$, and $C_{44}=54 \mathrm{GPa}$ are comparable to those obtained in previous calculations. ${ }^{13,47,48}$ Further, the 198 GPa Young's modulus calculated from these $C_{i j}$ 's is comparable to the experimentally-reported values (225 GPa). ${ }^{49}$ A fully DFT-predicted chemical expansion coefficient tensor with its primary directions along the $\langle 100\rangle$ directions is:

$$
\alpha_{\mathrm{C}}=\left[\begin{array}{lll}
0.067 & 0.000 & 0.000 \\
0.000 & 0.067 & -0.124 \\
0.000 & -0.124 & 0.067
\end{array}\right] .
$$

This complete, $\alpha_{\mathrm{C}}$ tensor contains information on the directions of the maximum and minimum strain values. By diagonalization of the $\alpha_{\mathrm{C}}$ tensor, one can obtain the anisotropy of the chemical strain projected onto the principle directions, using the relationship:

$$
\boldsymbol{\alpha}_{\mathrm{C}} \times \boldsymbol{R}=\boldsymbol{\alpha}_{\mathrm{C}, \mathrm{P}}
$$

where the eigenvectors provide the rotation matrix,

$$
\boldsymbol{R}=\left[\begin{array}{lll}
0 & 0 & 1 \\
\overline{1} & 1 & 0 \\
1 & 1 & 0
\end{array}\right]
$$

and the eigenvalues identify the components of the chemical expansion coefficient projected onto each the principal directions in $\alpha_{\mathrm{C}, \mathrm{P}}$ to yield:

$$
\alpha_{C, P}=\left[\begin{array}{lll}
0.191 & 0.000 & 0.000 \\
0.000 & -0.057 & 0.000 \\
0.000 & 0.000 & 0.067
\end{array}\right] .
$$

![](./images/e49d2335-69af-4849-bfb8-96f6f378b4fd-5_1301_834_167_164.jpg)
Fig. 2 (a) Variation of the oxygen vacancy formation energy as a function of the strain applied in various directions. As denoted by eqn (3), the slope of the formation energy versus strain gives the elastic dipole tensor projected on a specific strain direction. (b) Predictions of the average $\mathrm{CeO}_{2-\delta}$ chemical strain $\left(\alpha_{\mathrm{C}}\right)$ and maximum $\mathrm{CeO}_{2-\delta}$ chemical strain $\left(\alpha_{\mathrm{C}, \mathrm{M}}\right)$ from this study (lines) compared to past experimentally measured $\mathrm{CeO}_{2-\delta}$ chemical strains (solid symbols) and past DFT-predicted $\mathrm{CeO}_{2-\delta}$ chemical strains (open symbols).

After diagonalizing $\alpha_{\mathrm{C}}$, the chemical strain anisotropy is apparent. The maximum possible chemical expansion coefficient of 0.191 occurs in the [01̄1] direction shown in Fig. 1b. This is almost three times larger than the chemical expansion coefficient along the [100] direction. In the perpendicular [011] direction a compressive strain with $\alpha_{\mathrm{C}, \mathrm{y} y}=-0.057$ is observed. This chemical strain anisotropy is caused by the local anisotropic lattice distortion. Fig. 1d shows the oxygen square sublattice on the (100) planes exhibited a rhombohedral distortion with a side length of $5.546 \text{Å}$ and a (∠O19-O20-O23) corner angle of 93°. The four corner O-atoms (O18, O3, O7, O26) forming linear $\mathrm{O}-\mathrm{Ce}^{3+/ 4+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ bonds with the oxygen vacancy are also distorted, while the $\mathrm{O}-\mathrm{Ce}^{3+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ lengths are longer than the $\mathrm{O}-\mathrm{Ce}^{4+}-\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$ lengths. On close observation of the rotation matrix (or eigenvectors), it can be seen that the $x$ and $y$-axes of the diagonalized tensor correspond to the [01̄1] (O7-O18 direction) and the [011] (O1-O24 direction) directions, respectively. On the (001) plane, the O7-O18 diagonal elongated to $7.90 \text{Å}$ in the [01̄1] direction from $7.77 \text{Å}$ (in perfect ceria), while the O1-O24 diagonal contracted to $7.73 \text{Å}$ in the [011] direction, inducing the long-range anisotropic strain.

From the chemical expansion coefficient tensor calculated here, $\alpha_{\mathrm{C}, \mathrm{P}}$, the average chemical expansion coefficient produced by a collection of randomly-oriented anisotropic dipoles is given by $\alpha_{\mathrm{C}, \text { Ave }}=\operatorname{tr}\left(\alpha_{\mathrm{C}}\right)=0.067$. This will happen in polycrystalline samples or even in single crystals. Because there are six equivalent arrangements for $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ ions to occupy around each $\mathrm{V}_{\mathrm{O}}^{\bullet \bullet}$, in an unbiased $\mathrm{CeO}_{2-\delta}$ crystal with a dilute concentration of oxygen vacancies, these elastic dipoles will be randomly oriented, resulting in an average crystal structure that remains cubic. The averaged maximum chemical expansion coefficient $\alpha_{\mathrm{C}, \text { Max }}$ is given by the two principle positive $\alpha_{\mathrm{C}, \mathrm{P}}$ values, and is equal to 0.129. Fig. 2b shows the $\varepsilon_{\mathrm{C}}$ vs. $\delta$ trends obtained from the average and maximum $\alpha_{\mathrm{C}}$ values (as shown in eqn (1), $\alpha_{\mathrm{C}}$ is the slope of the lines in Fig. 2b) capture/bracket all the dilute (i.e. $\delta<0.05$ ) experimental and previously-calculated $\mathrm{CeO}_{2-\delta}$ chemical strain values in the literature. ${ }^{9,10,24,25,38}$ The experimental values display significant variation due to sample processing and testing differences. Hull et al. ${ }^{38}$ obtained a chemical expansion coefficient of 0.065 from neutron diffraction measurements of powdered ceria samples at 1000 °C under different oxygen partial pressures. This compares well with the average $\operatorname{tr}\left(\alpha_{\mathrm{C}}\right)=0.067$ obtained here. Bishop et al. ${ }^{23}$ obtained a chemical expansion coefficient of 0.108 from 800 °C dilatometry measurements. Chiang et al. ${ }^{25}$ obtained chemical expansion coefficients of 0.094 and 0.091 from dilatometry measurements at 800 °C and 900 °C respectively. $\alpha_{\mathrm{C}, \mathrm{M}}$ provides an upper bound for all the experimental data and is comparable to the experimental observations of Hull et al. ${ }^{38}$ This is consistent with the idea that the present DFT-based anisotropic chemical strain model can determine the overall chemical strain response of $\mathrm{CeO}_{2-\delta}$.

### 3.3 Electric dipoles and electrostriction in ceria-based materials

In addition to producing an elastic dipole, as shown in Fig. 1, oxygen vacancies in nonstoichiometric ceria also produce an electric dipole with a 〈001〉 orientation with a magnitude of 2.9 e Å, as calculated in Section S3 of the ESI.† In an unbiased $\mathrm{CeO}_{2-\delta}$ crystal with a dilute concentration of oxygen vacancies, the electric dipoles can exist in the $\pm[100], \pm[010]$, or $\pm[001]$ directions. Random orientation of these will produce no net electric charge, along with an analogous distribution of elastic dipole tensors, resulting in an average chemical strain, $\varepsilon_{E=0}=\delta \times \operatorname{tr}\left(\alpha_{\mathrm{C}}\right)$. However, under the bias of an electric field, the electrons can redistribute between the oxygen-vacancy-adjacent cerium atoms to create a $\mathrm{Ce}^{3+}-\mathrm{Ce}^{4+}$ arrangement with a dipole more closely aligned with the applied electric field. For example, an electric field applied in the [001] direction leads to the preferential $\mathrm{Ce}^{3+}-\mathrm{Ce}^{4+}$ arrangement shown in Fig. 1. Due to the applicability of the dilute point defect approximation, both dipole-dipole interactions and the total dipole moment per volume are weak; thus domain structures are
unlikely in the dilute ceria examined here. Since the long-range chemical strain is anisotropic, this partial alignment of the oxygen-vacancy-induced dipoles will create a net strain compared to the unbiased $E=0$ state. The maximum strain difference due to this effect is:

$$
\Delta \varepsilon_{E}=\varepsilon_{E}-\varepsilon_{E=0}=\delta \cdot\left(\varphi \times \alpha_{\mathrm{C}, \mathrm{M}}-\operatorname{tr}\left(\boldsymbol{\alpha}_{\mathrm{C}}\right)\right)
$$

where $\varphi$ is an orientation factor that is related to crystal orientation, the electric field direction, and the angles between the maximum strain direction with the preferred dipole direction. Since the dipole orientations are symmetric in pairs (i.e. the occur in the + and - of each $\langle 100\rangle$ direction), if the electric field is changed to the opposite direction, the net strain change will be the same, causing nonstoichiometric ceria to exhibit electrostrictive instead of ferroelectric behavior. Using eqn (8), the maximum possible electrostriction strain coefficient is estimated as $\alpha_{E}=\frac{\Delta \varepsilon_{E}}{\delta}=$ $\alpha_{\mathrm{C}, \mathrm{M}}-\operatorname{tr}\left(\alpha_{\mathrm{C}}\right)=0.062$. This value is larger than the electrostrictive strain coefficients of ~0.005-0.008 for pure ceria and ~0.003-0.011 for gadolinium doped ceria obtained by dividing the measured electrostriction strains and measured $\delta$ in the thin film work of Korobko et al. ${ }^{50}$ This overestimate can be attributed to several experimental effects including less than optimal grain orientations, slow dipole rearrangement kinetics, and vacancy-vacancy interactions (at least in the Gd doped ceria thin films) that may have produced thin film $\alpha_{E}$ values less than the maximum possible values. Nevertheless, the anisotropic oxygen-vacancy-induced elastic dipole model introduced here provides a reasonable explanation of the experimentally observed electrostriction in nonstoichiometric, fluorite-based oxides such as $\mathrm{CeO}_{2-\delta}$.

## 4 Conclusions

In summary, by combining DFT+U calculations with elastic dipole theory, the present work reveals that oxygen vacancy formation induces both anisotropic elastic dipoles and anisotropic longrange chemical strain in cubic $\mathrm{CeO}_{2-\delta}$. The origin of this anisotropy is the charge disproportionation on the four oxygen vacancy adjacent cerium atoms, which become two $\mathrm{Ce}^{3+}$ and two $\mathrm{Ce}^{4+}$ when a neutral oxygen vacancy forms. These $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ atoms move away from the oxygen vacancy by differing amounts which causes some of the neighboring oxygen atoms to move closer to the oxygen vacancy and some to move further away, resulting in an overall anisotropic lattice distortion. The oxygen-vacancy-adjacent Ce-O bond lengths calculated here, some of which are larger and some of which are smaller than those in the perfect lattice, are consistent with experimental observations. The calculations also reveal that most of the $\mathrm{Ce}^{3+}-\mathrm{O}$ bonds elongate while the $\mathrm{Ce}^{4+}-\mathrm{O}$ bonds shorten around each oxygen vacancy. The long-range chemical strain and chemical expansion coefficient tensors calculated here fully describe the directions of the maximum strain and the average strain; strains which bound all the experimentally measured chemical strain data for ceria. In addition to the elastic dipoles, the charge disproportionation creates electric dipole moments oriented along the $\langle 100\rangle$ directions (one for each of the six possible $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ arrangements in a single crystal). Without an external bias, these anisotropic dipoles are randomly oriented and an average chemical strain is likely to be measured. However, an electric field bias can align the dipoles since the charge transfer among the neighboring Ce atoms around an oxygen vacancy is possible. This creates a finite strain change as a function of applied electric field, which explains the recently observed giant electrostriction in doped and undoped cubic $\mathrm{CeO}_{2-\delta}$. This model system illustrates the need to use anisotropic tensors when calculating the chemical strain induced by dilute point defects in all materials, regardless of their symmetry.

## Conflicts of interest

There are no conflicts to declare.

## Acknowledgements

TD, BWS, and YQ gratefully acknowledge GOALI collaborative research support from the National Science Foundation under Grant No. DMR-1410946 and DMR-1410850. JDN gratefully acknowledges support from NSF CAREER Award Number CBET-1254453. The calculations presented here were performed at the Michigan State High-Performance Computing Center. The authors would like to thank Christine James for assistance with the chemical strain tensor calculations.

## References

1 J. D. Nicholas, Y. Qi, S. R. Bishop and P. P. Mukherjee, J. Electrochem. Soc., 2014, 161, Y11.
2 A. Rao, J. Dsa, S. Goyal and B. R. Singh, in Physics of Semiconductor Devices, ed. Jain, V. K.; Verma, A., Springer International Publishing, Cham, 2014; pp. 555-558.
3 A. Scarpa, G. Ghibaudo, G. Ghidini, G. Pananakakis and A. Paccagnella, Microelectron. Reliab., 1998, 38, 195.
4 B. W. Sheldon, S. Mandowara and J. Rankin, Solid State Ionics, 2013, 233, 38.
5 J. D. Nicholas, Extreme Mech. Lett., 2016, 9, 405.
6 M. M. Hasan, M. M. Billah, M. N. Naik, J. G. Um and J. Jang, IEEE Electron Device Lett., 2017, 38, 1035.
7 R. Korobko, A. Patlolla, A. Kossoy, E. Wachtel, H. L. Tuller, A. I. Frenkel and I. Lubomirsky, Adv. Mater., 2012, 24, 5857.
8 R. Schmitt, J. Spring, R. Korobko and J. L. M. Rupp, ACS Nano, 2017, 11, 8881.
9 D. Marrocchelli, S. R. Bishop, H. L. Tuller and B. Yildiz, Adv. Funct. Mater., 2012, 22, 1958.
10 D. Er, J. Li, M. Cargnello, P. Fornasiero, R. J. Gorte and V. B. Shenoy, J. Electrochem. Soc., 2014, 161, F3060.
11 C. James, Y. Wu, B. Sheldon and Y. Qi, MRS Adv., 2016, 1, 1037.
12 B. Wang, X. Xi and A. N. Cormack, Chem. Mater., 2014, 26, 3687.
13 M. Mogensen, S. Nigel and T. Geoff, Solid State Ionics, 2000, 129, 63.
14 H. L. Tuller and S. R. Bishop, Annu. Rev. Mater. Res., 2011, 41, 369.

15 A. Trovarelli, Catal. Rev., 1996, 38, 439.
16 C. Xia and M. Liu, Solid State Ionics, 2002, 152-153, 423.
17 G. A. Deluga, J. R. Salge, L. D. Schmidt and X. E. Verykios, Science, 2004, 303, 993.
18 V. Esposito and E. Traversa, J. Am. Ceram. Soc., 2008, 91, 1037.
19 J. S. Ahn, D. Pergolesi, M. A. Camaratta, H. Yoon, B. W. Lee, K. T. Lee, D. W. Jung, E. Traversa and E. D. Wachsman, Electrochem. Commun., 2009, 11, 1504.
20 M. Ismail, C.-Y. Huang, D. Panda, C.-J. Hung, T.-L. Tsai, J.-H. Jieng, C.-A. Lin, U. Chand, A. Rana, E. Ahmed, I. Talib, M. Nadeem and T.-Y. Tseng, Nanoscale Res. Lett., 2014, 9, 45.
21 L. Nation, J. Li, C. James, Y. Qi, N. Dudney and B. W. Sheldon, J. Power Sources, 2017, 364, 383.
22 M. J. Gillan, J. Phys. C: Solid State Phys., 1984, 17, 1473.
23 S. R. Bishop, K. L. Duncan and E. D. Wachsman, Acta Mater., 2009, 57, 3596.
24 S. R. Bishop, K. L. Duncan and E. D. Wachsman, Electrochim. Acta, 2009, 54, 1436.
25 H.-W. Chiang, R. N. Blumenthal and R. A. Fournelle, Solid State Ionics, 1993, 66, 85.
26 V. V. Kharton, A. A. Yaremchenko, M. V. Patrakeev, E. N. Naumovich and F. M. B. Marques, J. Eur. Ceram. Soc., 2003, 23, 1417.
27 S. R. Bishop, K. L. Duncan and E. D. Wachsman, J. Am. Ceram. Soc., 2010, 93, 4115.
28 S. B. Adler, J. Am. Ceram. Soc., 2004, 84, 2117.
29 Y. Chen and S. B. Adler, Chem. Mater., 2005, 17, 4537.
30 M. Vračar, A. Kuzmin, R. Merkle, J. Purans, E. A. Kotomin, J. Maier and O. Mathon, Phys. Rev. B: Condens. Matter Mater. Phys., 2007, 76, 174107.
31 S. McIntosh, J. F. Vente, W. G. Haije, D. H. A. Blank and H. J. M. Bouwmeester, Chem. Mater., 2006, 18, 2187.
32 P. H. Larsen, P. V. Hendriksen and M. Mogensen, J. Therm. Anal., 1997, 49, 1263.
33 S. Miyoshi, Solid State Ionics, 2003, 161, 209.
34 M. Burbano, D. Marrocchelli, B. Yildiz, H. L. Tuller, S. T. Norberg, S. Hull, P. A. Madden and G. W. Watson, J. Phys.: Condens. Matter, 2011, 23, 255402.
35 C. Balaji Gopal, M. García-Melchor, S. C. Lee, Y. Shi, A. Shavorskiy, M. Monti, Z. Guan, R. Sinclair, H. Bluhm, A. Vojvodic and W. C. Chueh, Nat. Commun., 2017, 8, 15360.
36 N. Yavo, O. Yeheskel, E. Wachtel, D. Ehre, A. I. Frenkel and I. Lubomirsky, Acta Mater., 2018, 144, 411.
37 Y. Li, O. Kraynis, J. Kas, T.-C. Weng, D. Sokaras, R. Zacharowicz, I. Lubomirsky and A. I. Frenkel, AIP Adv., 2016, 6, 055320.
38 S. Hull, S. T. Norberg, I. Ahmed, S. G. Eriksson, D. Marrocchelli and P. A. Madden, J. Solid State Chem., 2009, 182, 2815.
39 S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys and A. P. Sutton, Phys. Rev. B: Condens. Matter Mater. Phys., 1998, 57, 1505.
40 S. Fabris, S. de Gironcoli, S. Baroni, G. Vicario and G. Balducci, Phys. Rev. B: Condens. Matter Mater. Phys., 2005, 71, 041102.
41 L.-J. Chen, Y. Tang, L. Cui, C. Ouyang and S. Shi, J. Power Sources, 2013, 234, 69.
42 T. Das, J. D. Nicholas and Y. Qi, J. Mater. Chem. A, 2017, 5, 4493.
43 O. Hellman, N. V. Skorodumova and S. I. Simak, Phys. Rev. Lett., 2012, 108, 135504.
44 L. Cui, Y. Tang, H. Zhang, L. G. Hector, C. Ouyang, S. Shi, H. Li and L. Chen, Phys. Chem. Chem. Phys., 2012, 14, 1923.
45 C. W. M. Castleton, A. L. Lee, J. Kullgren and K. Hermansson, J. Phys.: Conf. Ser., 2014, 526, 012002.
46 C. Loschen, J. Carrasco, K. M. Neyman and F. Illas, Phys. Rev. B: Condens. Matter Mater. Phys., 2007, 75, 035115.
47 S. Shi, Y. Tang, C. Ouyang, L. Cui, X. Xin, P. Li, W. Zhou, H. Zhang, M. Lei and L. Chen, J. Phys. Chem. Solids, 2010, 71, 788.
48 Y. Wang, K. Duncan, E. Wachsman and F. Ebrahimi, Solid State Ionics, 2007, 178, 53.
49 N. Yavo, D. Noiman, E. Wachtel, S. Kim, Y. Feldman, I. Lubomirsky and O. Yeheskel, Scr. Mater., 2016, 123, 86.
50 R. Korobko, A. Lerner, Y. Li, E. Wachtel, A. I. Frenkel and I. Lubomirsky, Appl. Phys. Lett., 2015, 106, 042904.

[^0]:    ${ }^{a}$ Chemical Engineering \& Materials Science Department, Michigan State University, East Lansing, MI 48824, USA. E-mail: yueqi@egr.msu.edu
    ${ }^{b}$ School of Engineering, Brown University, Providence, RI 02912, USA
    † Electronic supplementary information (ESI) available. See DOI: 10.1039/c8cp01219a

