# Study of $\mathrm{CeO}_{2}$ and Its Native Defects by Density Functional Theory with Repulsive Potential

**Venue:** The Journal of Physical Chemistry C 118(42), 24248–24256 (2014)

**DOI:** [10.1021/jp506625h](https://doi.org/10.1021/jp506625h)

**Zotero citation key:** `huangDFT+UStudyCeO22014`

Bolong Huang, ${ }^{*, \dagger}$ Roland Gillen, ${ }^{\ddagger}$ and John Robertson ${ }^{*, \ddagger}$<br>${ }^{\dagger}$ Department of Physics and Materials Science, City University of Hong Kong, Kowloon, Hong Kong Special Administrative Region, People's Republic of China<br>${ }^{\ddagger}$ Engineering Department, Cambridge University, Cambridge CB3 0FA, United Kingdom

## Abstract

We investigated the native point defects in $\mathrm{CeO}_{2}$ by the density functional theory with repulsive potential (DFT+U) method and by use of a nonlinear core-corrected norm-conserving Ce pseudopotential. We find the neutral oxygen vacancy $\left(\mathrm{V}_{\mathrm{O}}{ }^{0}\right)$ in $\mathrm{CeO}_{2}$ to have a very low formation energy of only 0.39 eV in the O-poor limit. It is a deep donor with negative U behavior, stable only in its neutral and doubly positive states. The anion Frenkel defect is found to be the lowest energy disorder defect, with a formation energy of only 2.08 eV/defect site. These low formation energies arise from the improved transferability of our Ce pseudopotential for its +3 and +4 valence states. The negative U behavior of $\mathrm{V}_{\mathrm{O}}$ leads to excellent photocatalytic behavior, while the low formation energy of the anion Frenkel defect leads to a superior oxygen storage-and-release capability.

![Graphical abstract](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-1_469_437_877_1495.jpg)

## 1. INTRODUCTION

$\mathrm{CeO}_{2}$ is an important lanthanide oxide that is widely used as an oxygen buffer in car exhaust catalysts, ${ }^{1}$ as a fast ion conductor in solid state fuel cells, ${ }^{2}$ as a catalyst, ${ }^{3-6}$ as a high-dielectric constant gate oxide, ${ }^{7}$ and in resistance random access memories (ReRAM). ${ }^{8}$ Many properties of $\mathrm{CeO}_{2}$ are determined by its intrinsic defects ${ }^{9-23}$ and the unusual behavior of the semicore Ce 4f levels. $\mathrm{CeO}_{2}$ has mixed-valence behavior accompanied by the localization of electrons on Ce 4f states due to oxygen-related defects. ${ }^{9-23}$ The oxygen vacancy is the most common defect of the $\mathrm{CeO}_{2}$ surface, as noted in both experimental ${ }^{11}$ and theoretical studies. ${ }^{23}$ It is found that structural distortion plays a key role in stabilizing the vacancy, and this is related to the oxygen storage capacity of $\mathrm{CeO}_{2} .{ }^{15}$ On the other hand, the disorder defects are important in oxygen ion transport. ${ }^{9,10}$ It is therefore important to understand the properties and energetics of the native defects and in particular the oxygen vacancy and the structural disorder defects.

There have been numerous first-principles studies of the electronic structure of $\mathrm{CeO}_{2} .{ }^{16-18,21,22,24-29}$ It is well-known that the conventional density functional theory (DFT) fails to describe well the localized 4 f orbitals due to a lack of self-interaction cancellation (SIC) in DFT. ${ }^{21,22,24-29}$ There has therefore been considerable effort to correct this error. The simplest method is to use the DFT+U method, which adds an on-site repulsive potential $U$ for the localized d and f orbitals. ${ }^{30-32}$ However, this method is somewhat empirical, and further methods such as the GW method ${ }^{26,27}$ and the hybrid functionals ${ }^{23,28,29,33,34}$ can be used. However, self-consistent GW is computationally expensive. Jiang et al. ${ }^{26,27}$ proposed the lower-cost $\mathrm{G}_{0} \mathrm{~W}_{0}$ version, based on an initial electronic structure derived from the local density approximation (LDA) + U method. This gives a substantially improved band structure. Hybrid functionals like the Heyd-Scuseria-Erzenhof (HSE) function or screened exchange (sX) schemes are an efficient way to improve band gaps in electronic structure calculations and to carry out geometry relaxations for defects in these systems. ${ }^{23,24}$

On the other hand, the transferability of pseudopotential is another possible source of error in such mixed-valence systems, and there has been less work on this aspect. The pseudopotential tends to be calculated for a single valence state within the DFT method. It is not necessarily fully transferable. The errors arise because of the spatial overlap of the core and valence charge density. As the exchange-correlation potential is a nonlinear function of the charge density, it is desirable that the core and valence charge densities are spatially separated. Otherwise, the pseudopotential is dependent on the valence configuration and spin polarization. This overlap between valence and core charge density and the nonlinearity causes a systematic error in the total exchange-correlation potential. It is desirable to use a pseudopotential to restrict the basis set for computational speed, especially in defect supercell calculations. However, this source of error can lead to the use of all-electron calculations.

The electronic structure of $\mathrm{CeO}_{2}$ is still a matter of some debate. It has two gaps between 2p and 4f states and between 2p and 5d states that must be quantified. The experimental data on the band gaps ${ }^{35-41}$ mostly have low resolution of 0.3-0.6 eV due to the lifetime broadening. To normalize the experimental values, the most reliable value for the $\mathrm{O}_{2 \mathrm{p}}-\mathrm{Ce}_{5 \mathrm{~d}}$ gap is chosen as 6 eV and the $\mathrm{O}_{2 \mathrm{p}}-\mathrm{Ce}_{4 \mathrm{f}}$ gap is taken from the photoluminescence measurements, which show higher accuracy (3.33 and 3.39 eV above the $\mathrm{O}_{2 \mathrm{p}}$ valence band edge).

Table 1. Calculated Bulk Properties of $\mathrm{CeO}_{2}$ Compared with Results of Other Groups and Experiments ${ }^{\boldsymbol{a}}$

|  | PBE-w/o-NLCC | $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}+\mathrm{NLCC}$ | ref 21 | ref 22 | ref 29 | exptl data | error vs expt (\%) | exptl ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| lattice, $a(\AA)$ | 5.45 | 5.46 | 5.49 | 5.49 | Exp. 5.411 | 5.411 | 0.9 | 54 |
| $\mathrm{E}_{\mathrm{g}}(2 \mathrm{p}-4 \mathrm{f})(\mathrm{eV})$ | 2.30 | 3.30 | 2.51 | 2.35 | 4.2 | 3.33 | 0.9 | 40 |
| $\mathrm{E}_{\mathrm{g}}(2 \mathrm{p}-5 \mathrm{~d})(\mathrm{eV})$ | 5.47 | 5.98 | 5.30 | 5.31 | 6.5 | 6.0 | 0.3 | 39 |
| VB width (eV) | 3.90 | 4.69 | 4.0 | 4.0 | 4.4 | 4.5-5.0 | 4.2* | 28, 35 |
| formation $\Delta H_{\mathrm{f}}(\mathrm{eV})$ | -10.54 | -11.50 | -10.50 | -11.80 |  | -11.28 | 1.9 | 56 |
| bulk modulus (GPa) | 184 | 201 |  | 181 |  | 220 | 8.6 | 55 |

${ }^{a}$ We give the error between our $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}+\mathrm{NLCC}$ calculated results and experimental values. The asterisk means that we take the value of 4.5 eV as experimental VB width for error comparison.

Here, we carry out DFT+U band calculations using a nonlinear core-corrected norm-conserving pseudopotential, which is a basis for other lanthanide materials. We then carry out calculations on the point defects of $\mathrm{CeO}_{2}$ as starting point for other lanthanide oxides and the higher actinide oxides with partially filled f orbitals.

## 2. NONLINEAR CORE CORRECTION FOR 4F LEVELS IN LANTHANIDES

In order to correct the error induced by overlaps of valence-core charge density, we choose the nonlinear core correction (NLCC) method to take the core charge density into account for each atom before computing the LDA or generalized gradient approximation (GGA) potential. For fast Fourier transform, only some of the core charge is included by the partial core correction (PCC). Following Louie et al., ${ }^{42}$ the full core charge density can be replaced with a partial core charge density, defined as below, for nonlinear core correction:

$$
\rho_{\text {partial }}^{\mathrm{c}}(r)=\left\{\begin{array}{cc}
A \sin (B r) / r & \text { if } r<r_{0} \\
\rho^{\mathrm{c}}(r) & \text { if } r>r_{0}
\end{array}\right.
\tag{1}
$$

where $r_{0}$ is a radius where the core charge density is 1-2 times larger than the valence charge density. $A$ and $B$ are determined by the value and the gradient of the core charge density at $r_{0}$. By this method, the core charge is therefore retained and used to reconstruct the full exchange-correlation potential in the calculations. A similar method has been proposed by Fuchs and Scheffler, ${ }^{43}$ but we focus on the theoretical prototype of NLCC used in preliminary calculations.

## 3. CALCULATION SETUP

Our DFT+U calculation uses the CASTEP ${ }^{44}$ code. The norm-conserving pseudopotentials of Ce and O are generated by OPIUM code in the Kleinman-Bylander projector form ${ }^{45}$ and already employ nonlinear partial core correction ${ }^{42}$ and scalar relativistic averaging scheme ${ }^{46}$ for spin-orbital coupling effect. The RRKJ method is chosen as optimization of pseudopotentials. ${ }^{47}$ The PBE functional was chosen for PBE+U calculations with a kinetic cutoff energy of 750 eV, which expands the valence electrons states in a plane-wave basis set. The ensemble DFT (EDFT) method of Marzari et al. ${ }^{48}$ is used for convergence. For bulk properties of $\mathrm{CeO}_{2}$, we use a $4 \times 4 \times 4$ Monkhost-Pack (MP) k-point mesh, which converges the total energy to under $5.0 \times 10^{-7} \mathrm{eV}$ per atom. The Hellmann-Feynman force on each atom was converged to lower than 0.01 eV/Å.

For defects, we use a $2 \times 2 \times 2 \mathrm{CeO}_{2}$ supercell containing 96 atoms. We select the (1/4, 1/4, 1/4) special k-point ${ }^{49}$ in the simple cubic 2 × 2 × 2 supercell. The geometry optimization used the Broyden-Fletcher-Goldfarb-Shannon (BFGS) algorithm through all bulk and defect supercell calculations.
We follow the Anisimov type DFT+U method ${ }^{30}$ and the self-consistently determined Hubbard U parameter $\left(\mathrm{U}_{\mathrm{f}}=4 \mathrm{eV}\right)$ for Ce 4f orbital by ab initio linear response method of Cococcioni et al. ${ }^{31,32}$ To stabilize the hole states lying in the O 2p orbitals, we also apply a Hubbard U potential to the O 2p states $\left(\mathrm{U}_{\mathrm{p}}=4 \mathrm{eV}\right)$ following Lany, ${ }^{50,51}$ Morgan et al., ${ }^{52}$ and Keating et al. ${ }^{21}$ Accordingly, both the f- and p- orbital electrons of the rare earth and oxygen should be considered when using DFT+U. Note that all of our PBE+U calculations were implemented with NLCC, and $U$ is set to $U_{\mathrm{f}}=4.0 \mathrm{eV}$ for Ce and $U_{\mathrm{p}}=4.0 \mathrm{eV}$ for O, which is $U_{\mathrm{pf}}$ for short.

For the calculation of defect formation energy in different charge states, the overall supercell size was kept fixed based on the relaxed neutral bulk unit cell. The defect formation energy $\left(H_{q}\right)$ at the charge state $q$ as a function of the Fermi energy $\left(E_{\mathrm{F}}\right)$ and the chemical potential $\Delta \mu$ of element $\alpha$ is given by

$$
\begin{aligned}
H_{q}\left(E_{\mathrm{F}}, \mu\right)= & {\left[E_{q}-E_{\mathrm{H}}\right]+q\left(E_{\mathrm{V}}+\Delta E_{\mathrm{F}}\right) } \\
& +\sum_{\alpha} n_{\alpha}\left(\mu_{\alpha}^{0}+\Delta \mu_{\alpha}\right)
\end{aligned}
\tag{2}
$$

where $E_{q}$ and $E_{\mathrm{H}}$ are the total energy of a defect cell and a perfect cell, respectively, calculated of charge $q, \Delta E_{\mathrm{F}}$ is the Fermi energy with respect to the valence band maximum, $n_{\alpha}$ is the number of atoms of element $\alpha$, and $\mu_{\alpha}^{0}$ is reference chemical potential, following Lany and Zunger. ${ }^{53}$

## 4. RESULTS AND DISCUSSION

### 4.1. Bulk

Bulk $\mathrm{CeO}_{2}$ has the cubic fluorite structure, with lattice constant $5.411 \AA .^{54}$ Table 1 shows our Perdew-Burke-Ernzerhof (PBE) result from geometry optimization is $5.450 \AA$, with an error of $0.7 \%$. The PBE+U calculation similarly gives $5.458 \AA$ with around $0.9 \%$ error, representing comparable reliability when the $U$ parameter is introduced. The PBE+U results compare with the $5.494 \AA$ value found by Keating et al. ${ }^{21}$ and Zacherle et al. ${ }^{22}$ within the GGA+U scheme. The bulk modulus of $\mathrm{CeO}_{2}$ is calculated by PBE and PBE+U and the results obtained are $B_{0}=184 \mathrm{GPa}$ for PBE and $B_{0}=201 \mathrm{GPa}$ for PBE+U. Though these values are smaller than the experimental value of 220 GPa, ${ }^{55}$ they are improved over the values [ $B_{0}=172$ GPa (GGA) and 181 GPa (GGA+U)] found by Zacherle et al. ${ }^{22}$ The calculated electronic density of states (DOS) with PBE+U $\left(U_{\mathrm{f}}=4, U_{\mathrm{p}}=4\right)$ under NLCC has good agreement with X-ray photoelectron spectroscopic (XPS) experimental data; see Figure 1.

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-3_857_842_237_207.jpg)
Figure 1. (Left) Calculated band structures of $\mathrm{CeO}_{2}$ by PBE+U with $U_{\mathrm{f}}=4 \mathrm{eV}$ and $U_{\mathrm{p}}=4 \mathrm{eV}$ based on NLCC. The black dashed line is the Fermi level $\left(E_{\mathrm{F}}\right)$. (Right) Calculated total density of states of $\mathrm{CeO}_{2}$ by nonlinear core corrected PBE+U with $U_{\mathrm{f}}=4 \mathrm{eV}$ and $U_{\mathrm{p}}=4 \mathrm{eV}$ (shown as $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}+\mathrm{NLCC}$; red solid line), where the $2 \mathrm{p}-4 \mathrm{f}$ gap is 3.30 eV and the 2p-5d gap is 5.98 eV. The zero energy is the highest occupied level. The blue dotted line denotes the experimental results reprinted and replotted from literature results. ${ }^{35}$ The red arrow shows the Fermi level $\left(E_{\mathrm{F}}\right)$.

The band structures of $\mathrm{CeO}_{2}$ calculated by both GGA and GGA+U methods (see Figure 1) are compared. This work found that the band gap of $\mathrm{O}_{2 \mathrm{p}}-\mathrm{Ce}_{4 \mathrm{f}}$ orbitals increases from 2.30 eV in GGA to 3.30 eV in GGA+U, which is very consistent with the experimental value of 3.33 eV from photoluminescence. ${ }^{40}$ The secondary band gap of $\mathrm{O}_{2 \mathrm{p}}-\mathrm{Ce}_{5 \mathrm{~d}}$ orbitals also increases from 5.47 eV in GGA to 5.98 eV in GGA+U, which is close to the optical reflectance value of $6.0 \mathrm{eV} .{ }^{39}$ The upper valence band (mainly 2 p orbitals of oxygen atoms) width increases from 3.90 eV in PBE to 4.69 eV in GGA+U, which matches the range of $4.5-5.0 \mathrm{eV}$ reported by Wuilloud et al. ${ }^{35}$ and Mullins et al. ${ }^{37}$

For the bulk formation enthalpy, $\mu_{\mathrm{Ce}}+2 \mu_{\mathrm{O}}=\Delta H_{\mathrm{f}}\left(\mathrm{CeO}_{2}\right)$, the experimental formation enthalpy of $\mathrm{CeO}_{2}$ is -11.28 eV at $T=$ 298 K . ${ }^{56}$ Our calculations give -10.54 eV by PBE and -11.50 eV by PBE+U $\left(U_{\mathrm{f}}=4, U_{\mathrm{p}}=4\right)$ at $T=0 \mathrm{~K}$ (ground state), which agrees well with the experimental value at $T=298 \mathrm{~K} .{ }^{46}$ Before we discuss the defect formation energy, the value of the chemical potential of oxygen and cerium in $\mathrm{CeO}_{2}$ is determined by the limitation of the phase boundaries between $\mathrm{CeO}_{2}$ and $\mathrm{Ce}_{2} \mathrm{O}_{3}$. The upper bound of $\mu_{\mathrm{O}}$, which is the Ce-poor/O-rich environment, is limited by the formation of $\mathrm{O}_{2}$ molecule (gas), which means $\mu_{\mathrm{O}}=0 \mathrm{eV}$ and $\mu_{\mathrm{Ce}}=-11.50 \mathrm{eV}$. The lower bound of $\mu_{\mathrm{O}}$, the Ce-rich/O-poor limit, is given by the formation of $\mathrm{Ce}_{2} \mathrm{O}_{3}$, or $2 \mu_{\mathrm{Ce}}+3 \mu_{\mathrm{O}} \leq \Delta H_{\mathrm{f}}\left(\mathrm{Ce}_{2} \mathrm{O}_{3}\right)=-20.23 \mathrm{eV}$, giving $\mu_{\mathrm{O}}=-2.77\,\mathrm{eV}$ and $\mu_{\mathrm{Ce}}=-5.95\,\mathrm{eV}$.

### 4.2. Oxygen Vacancy

The neutral oxygen vacancy leaves two excess electrons, which localize onto two of four adjacent Ce sites, changing their valence from $\mathrm{Ce}^{4+}$ to $\mathrm{Ce}^{3+}$. For $\mathrm{V}_{\mathrm{O}}{ }^{0}$, after geometry relaxation, eight neighboring oxygen atoms move off their ideal lattice sites toward the vacancy site since a vacancy site is an effective positive charge center, while neighboring Ce atoms move away from the vacancy with the two $\mathrm{Ce}^{4+}$ moving further.

Moreover, the neighboring O atom bridging two $\mathrm{Ce}^{4+}$ moves by $0.25 \AA$, while the O atom bridging two $\mathrm{Ce}^{3+}$ moves only $0.01 \AA$ from our PBE+U calculations. The four O atoms connected to one $\mathrm{Ce}^{3+}$ move toward $\mathrm{V}_{\mathrm{O}}{ }^{0}$ by $0.15 \AA$. The difference of O atoms is due to $\mathrm{Ce}^{3+}$ ions having less positive charge than $\mathrm{Ce}^{4+}$. The two $\mathrm{Ce}^{3+}$ ions move a distance of $0.13 \AA$ toward each other due to weak coupling of two unpaired electrons in 4f states, while the two $\mathrm{Ce}^{4+}$ ions move a distance of $0.18 \AA$ (Figure 2a). This trend is absent in simple PBE calculations.

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-3_879_1078_1514_546.jpg)
Figure 2. (a) Local view of relaxed structure of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{O}}$ by PBE+U. Blue and green isosurfaces denotes the two electrons localized on the f orbitals of two Ce atoms and therefore producing gap states with spin-up and spin-down states, respectively. $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ are shown. The length of the arrows indicates the distance of the different displacements of Ce ions. (b) Total DOS of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{O}}$ in neutral state. The Fermi level is shown by the arrow. AF means antiferromagnetic configurations of the defect states. (c) Summary of calculations on formation energies of $\mathrm{V}_{\mathrm{O}}$, calculated by PBE+ $\mathrm{U}_{\mathrm{pf}}$ with NLCC (this work), $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}$ with projector augmented wave (PAW), ${ }^{21}$ and $\mathrm{PBE}+\mathrm{U}_{\mathrm{f}}$ with $\mathrm{PAW}^{22}$ under both O-poor and O-rich chemical potential limits.

Figure 2b shows the electronic density of states (DOS) of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{O}}{ }^{0}$ calculated by $\mathrm{PBE}+\mathrm{U}\left(U_{\mathrm{f}}=4 \mathrm{eV}, U_{\mathrm{p}}=4 \mathrm{eV}\right)$. It can be seen that $\mathrm{O}_{2 \mathrm{p}}$ dominates the valence band and $\mathrm{Ce}_{4 \mathrm{f}}$ dominates the conduction band as the 4f band is empty. Between $\mathrm{O}_{2 \mathrm{p}}$ and $\mathrm{Ce}_{4 \mathrm{f}}$ bands, there are two gap states, spin-up and spin-down, lying well inside the band gap (near the midgap) with antiferromagnetic arrangement. Moreover, these defect states denote the occupied $\mathrm{Ce}_{4 \mathrm{f}}$ states, indicating the occurrence of $\mathrm{Ce}^{3+}$ ions near the $\mathrm{V}_{\mathrm{O}}$ site.
For the DOS of $\mathrm{V}_{\mathrm{O}}{ }^{+}$, there is only a gap state with a single peak near the midgap. The gap states of $\mathrm{V}_{\mathrm{O}}{ }^{0}$ are 1.55 eV below the conduction band edge. The gap state of $\mathrm{V}_{\mathrm{O}}{ }^{+}$also lies near midgap, at about 1.05 eV below the conduction band edge.

Figure 2c shows the defect formation energies of oxygen vacancy for both O-poor and O-rich conditions within different charge states by $\operatorname{PBE}+\mathrm{U}\left(U_{\mathrm{f}}=4 \mathrm{eV}, U_{\mathrm{p}}=4 \mathrm{eV}\right)$. For $\mathrm{V}_{\mathrm{O}}{ }^{0}$ under O-rich conditions, the calculated formation energy is 3.16 eV, corresponding to 0.39 eV for the O-poor limit. The formation of $\mathrm{V}_{\mathrm{O}}{ }^{0}$ under O-rich conditions is higher than the value of 2.22 eV by Keating et al. ${ }^{21}$ but closer to 3.27 eV by Zacherle et al., ${ }^{22}$ while our $\mathrm{V}_{\mathrm{O}}{ }^{0}$ formation energy of 0.39 eV in the O-poor limit is lower than both 1.03 eV of Zacherle et al. ${ }^{22}$ and 0.58 eV of Keating et al. ${ }^{21}$ The transition energy levels correspond to Fermi energies where two charge states, $q$ and $q^{\prime}$, have the same formation energies according to eq 2. The calculated transition energy level of $\mathrm{V}_{\mathrm{O}}{ }^{0} / \mathrm{V}_{\mathrm{O}}{ }^{2+}$ by PBE+U ( $U_{\mathrm{f}}=4 \mathrm{eV}, U_{\mathrm{p}}=4 \mathrm{eV}$ ) is 2.53 eV, which is 0.77 eV below the conduction band minimum $E_{\mathrm{C}}$. This compares to ~ 1.7 eV by Zacherle et al., ${ }^{22} 2.0$ eV by Jiang et al., ${ }^{19}$ and 1.5 eV by Hellman et al. ${ }^{20}$ The 0/+ transition energy level of $\mathrm{V}_{\mathrm{O}}$ is 0.97 eV below $E_{\mathrm{C}}$. However, $\mathrm{V}_{\mathrm{O}}{ }^{+}$ is never the most stable charge state. The defect tends to disproportionate according to the reaction $2 \mathrm{~V}_{\mathrm{O}}{ }^{+} \rightarrow \mathrm{V}_{\mathrm{O}}{ }^{0}+\mathrm{V}_{\mathrm{O}}{ }^{2+}$, leaving a neutral $\left(\mathrm{V}_{\mathrm{O}}{ }^{0}\right)$ and a +2 charge state $\left(\mathrm{V}_{\mathrm{O}}{ }^{2+}\right)$. This corresponds to a so-called negative U defect, with $U=-0.39 \mathrm{eV}$. The negative-U behavior of $\mathrm{V}_{\mathrm{O}}$ in $\mathrm{CeO}_{2}$ is in accordance with the experimental phenomenon that catalytic activity of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{O}}$ is higher than the perfect bulk $\mathrm{CeO}_{2}$. Thus, the oxygen vacancy is a near-deep donor defect, of which $\mathrm{V}_{\mathrm{O}}{ }^{0}$ and $\mathrm{V}_{\mathrm{O}}{ }^{2+}$ are the stable states.

There has been a long debate on the ferromagnetic (FM) behavior that was observed in nonmagnetic oxides, when synthesized as thin film or as nanoparticles. However, $\mathrm{CeO}_{2}$ is unusual. Castleton et al. ${ }^{41}$ and Andersson et al. ${ }^{17}$ both found that the antiferromagnetic (AFM) and FM configurations are degenerate with $\Delta E<1 \mathrm{meV}$ in the bulk $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{O}}$. The reduced $\mathrm{CeO}_{2}$ surface has similar effects. Fabris et al. ${ }^{57}$ found that $\mathrm{V}_{\mathrm{O}}$ causes $\mathrm{CeO}_{2}$ surface to have AFM behavior independent of the $\mathrm{V}_{\mathrm{O}}$ concentration, while Nolan et al. ${ }^{58}$ and Han et al. ${ }^{59}$ noted that oxygen vacancies will induce FM in $\mathrm{CeO}_{2}$.

Here, we find AFM behavior of the neutral state of $\mathrm{V}_{\mathrm{O}}$ in $\mathrm{CeO}_{2}$ and near-degeneracy of the FM state. This is similar to the results obtained by Keating et al., ${ }^{21}$ Andersson et al., ${ }^{17}$ and Castleton et al. ${ }^{41}$ Zhang et al. ${ }^{60}$ also find that AFM is slightly more stable than FM by 0.02 eV.

### 4.3. Cerium Vacancy

The cerium vacancy $\left(\mathrm{V}_{\mathrm{Ce}}\right)$ gives four hole states on its adjacent O sites. Figure 3a shows the relaxed structure of $\mathrm{V}_{\mathrm{Ce}}$ with four localized hole states. The defect has a quintet spin state that is slightly lower in energy than the triplet or singlet states and also selectively localized on specific O atoms with $T_{\mathrm{d}}$ symmetry. For the local structure relaxed by PBE+U ( $U_{\mathrm{f}}=4 \mathrm{eV}, U_{\mathrm{p}}=4 \mathrm{eV}$ ), the O atoms without four localized hole states uniformly move away from the $\mathrm{V}_{\mathrm{Ce}}$ site by $0.35 \AA$, whereas the O atoms with localized hole states all move toward the $\mathrm{V}_{\mathrm{Ce}}$ site by $0.10 \AA$. This phenomenon cannot be found by simple PBE+U without $U$ parameters on $\mathrm{O}_{2 \mathrm{p}}$. Our results on local O atoms movement are all larger and more obvious than the results of Keating et al. ${ }^{21}$

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-4_883_1078_234_545.jpg)
Figure 3. (a) Local side view of relaxed structure of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{Ce}}$ (located in the center). Blue and green isosurfaces denotes the four holes localized on the nearest O sites: two of them are spin-up and the other two are spin-down states, respectively. The length of the arrows indicates the distance of the different displacements of O ions. (b) Total DOS of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{Ce}}$ in neutral state. The vertical dashed line at zero energy denotes the highest occupied level. The Fermi level is shown by the arrow. (c) Formation energy of $\mathrm{V}_{\mathrm{Ce}}$ in charge states 0, -1, -2, -3, and -4 under the O-rich (or Ce-poor) chemical potential limit.

From the electronic DOS of $\mathrm{CeO}_{2}$ with $\mathrm{V}_{\mathrm{Ce}}$, shown in Figure 3b, the system shows a defect state with 0.55 eV below the conduction band minimum (CBM), which shows that the localized hole states are dominated by the empty $\mathrm{O}_{2 \mathrm{p}}$ orbitals. The calculation by PBE+U $\left(U_{\mathrm{f}}=4.0 \mathrm{eV}, U_{\mathrm{p}}=4.0 \mathrm{eV}\right)$ shows the importance of including a $U$ interaction of the O 2p states, otherwise $\mathrm{V}_{\mathrm{Ce}}$ in $\mathrm{CeO}_{2}$ would have a metallic DOS, due to the incorrect description of the hole states.

Calculated formation energies of cerium vacancy are shown in Figure 3c with different charge states of $\mathrm{V}_{\mathrm{Ce}}{ }^{0}, \mathrm{~V}_{\mathrm{Ce}}{ }^{-1}, \mathrm{~V}_{\mathrm{Ce}}{ }^{-2}, \mathrm{~V}_{\mathrm{Ce}}{ }^{-3}$, and $\mathrm{V}_{\mathrm{Ce}}{ }^{-4}$. The transition energy level of 0/-4 is 1.00 eV above the valence band maximum (VBM). The formation energy of $\mathrm{V}_{\mathrm{Ce}}{ }^{0}$ is 5.00 eV for the O-rich limit and 10.55 eV for Ce-rich. Compared to Zacherle et al., ${ }^{22}$ our results gave values 1.22 and 0.15 eV lower under O-rich and O-poor limits, respectively. On the other hand, Keating et al. ${ }^{21}$ show very similar results under the O-rich limit, which is 4.91 eV with only 0.09 eV difference compared with ours. However, their formation energy of $\mathrm{V}_{\mathrm{Ce}}{ }^{0}$ in the O-poor limit is remarkably low (8.19 eV), about 2.5 eV lower than the results of Zacherle et al. ${ }^{22}$ and ours. This may due to overestimation of $\mu_{\mathrm{Ce}}$ with larger $U_{\mathrm{f}}$ and $U_{\mathrm{p}}$ values.

### 4.4. Oxygen Interstitial

The local structural relaxation between oxygen interstitial $\left(\mathrm{I}_{\mathrm{O}}\right)$ and lattice oxygen sites leads to absence of hole states. The relaxed structure of the oxygen interstitial $\left(\mathrm{I}_{\mathrm{O}}\right)$ is obtained by PBE+U with $U_{\mathrm{f}}=4.0 \mathrm{eV}$ and $U_{\mathrm{p}}=$ 4.0 eV. $\mathrm{I}_{\mathrm{O}}$ is found to re-bond to an adjacent lattice O site with a bond length of $1.391 \AA$. This is larger than the $\mathrm{O}-\mathrm{O}$ bond length $(1.217 \AA)$ of $\mathrm{O}_{2}$ and shows characteristics of a peroxide species. The lattice O site moves $0.071 \AA$ toward the $\mathrm{I}_{\mathrm{O}}$, and the $\mathrm{I}_{\mathrm{O}}$ moves $0.88 \AA$ toward the neighboring lattice O site. Figure 4a shows the localized orbitals around the oxygen interstitial site. The oxygen interstitial forming peroxide ion in closed packed metal oxides is also seen in $\mathrm{Al}_{2} \mathrm{O}_{3}, \mathrm{TiO}_{2}$, and ZnO.

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-5_925_1087_231_543.jpg)
Figure 4. (a) Local front and side views of relaxed structure of $\mathrm{CeO}_{2}$ with $\mathrm{I}_{\mathrm{O}}$. The localized orbitals are sitting along $\mathrm{I}_{\mathrm{O}}$ and host O ions. Small $\pi$-orbitals locate the O ions next to $\mathrm{I}_{\mathrm{O}}$. (b) Total DOS of $\mathrm{CeO}_{2}$ with $\mathrm{I}_{\mathrm{O}}$. The vertical dashed line at zero energy denotes the highest occupied level. The Fermi level is shown by the arrow. (c) Summary of calculations on formation energies of $\mathrm{I}_{\mathrm{O}}$ in $\mathrm{CeO}_{2}$ calculated by $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}$ with NLCC (this work), $\mathrm{PBE}+\mathrm{U}_{\mathrm{pf}}$ with PAW, ${ }^{21}$ and $\mathrm{PBE}+\mathrm{U}_{\mathrm{f}}$ with $\mathrm{PAW}^{22}$ under both O-poor and O-rich chemical potential limits.

In the electronic DOS of $\mathrm{I}_{\mathrm{O}}$ (Figure 4b), there are three peaks with both spin-up and spin-down, which lie in the range from -6.5 to 0 eV. The $\sigma$ state of the peroxide is at -4.4 eV, slightly below the lower limit of the valence band. The $\pi$ and $\pi^{*}$ states are found at -6.05 and 0 eV, respectively.

The formation energy of $\mathrm{I}_{\mathrm{O}}$ in charge states of 0, -1, and -2 under O-rich chemical potential limit are 1.82, 4.49, and 7.40 eV, respectively. The formation energy of $\mathrm{I}_{\mathrm{O}}{ }^{0}$ is about 1 eV lower than the value obtained by Zacherle et al. ${ }^{22}$ As seen from Figure 4c, $\mathrm{I}_{\mathrm{O}}$ gives almost the same formation energy under O-rich conditions as found by Keating et al., ${ }^{21}$ which supports the reliability of introducing $U$ on $\mathrm{O}_{2 \mathrm{p}}$. We also found the positive-U effect between 0 and -2 states compared to -1 state, showing that the energy cost of merely introducing O cannot be fully compensated by disordering the lattice.

### 4.5. Cerium Interstitial

Interstitial Ce atom provide four excess electrons (Figure 5a) with one electron remains on the interstitial $\mathrm{Ce}\left(\mathrm{I}_{\mathrm{Ce}}\right)$ while the three others move to the neighboring cerium atoms (see right bottom of Figure 5a). The local structure relaxed by the PBE+U method with $U_{\mathrm{f}}=4.0$ eV and $U_{\mathrm{p}}=4.0 \mathrm{eV}$ shows that three of the nearest-neighboring Ce atoms move $0.244 \AA$ away from their original Ce lattice positions, while the remaining three nearest-neighboring Ce atoms move $0.324 \AA$ away from their original positions. Analyzing the orbital composition, we find that the three Ce atoms with $0.244 \AA$ movement are the $\mathrm{Ce}^{3+}$ ions and the other three Ce atoms with 0.324 Å movement are the $\mathrm{Ce}^{4+}$ ions.

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-5_896_1097_1359_534.jpg)
Figure 5. (a) Relaxed structure of $\mathrm{I}_{\mathrm{Ce}}$ in $\mathrm{CeO}_{2}$. The light blue sphere is the $\mathrm{I}_{\mathrm{Ce}}$ atom. The right bottom figure is the local view of localized gap states orbitals induced by $\mathrm{I}_{\mathrm{Ce}}$ in $\mathrm{CeO}_{2}$. (b) Total DOS of $\mathrm{CeO}_{2}$ with $\mathrm{I}_{\mathrm{Ce}}$. The vertical dashed line at zero energy denotes the highest occupied level. The Fermi level is shown by the arrow. (c) Formation energy of $\mathrm{I}_{\mathrm{Ce}}$ in $\mathrm{CeO}_{2}$ under O-poor (or Ce-rich) chemical potential limit.

From the electronic DOS results shown in Figure 5b, the ground-state electronic configuration of the $\mathrm{CeO}_{2}$ system with $\mathrm{I}_{\mathrm{Ce}}$ presents a ferromagnetic feature. There are in fact four states deep in the gap, and two states have nearly the same energy pinning of the charge neutral level (CNL) 1.45 eV below the CBM. These deep levels stay 1.45, 1.53, 1.57, and 2.03 eV below the CBM with the same spin-up configurations and fully occupied states, which is different from the results of Keating et al., ${ }^{21}$ who reported the system as being antiferromagnetic and all defect states as being partially occupied.

The energy cost of accepting the additional Ce in $\mathrm{CeO}_{2}$ as $\mathrm{I}_{\mathrm{Ce}}$ is very high in the neutral state: 11.69 eV for $\mathrm{I}_{\mathrm{Ce}}{ }^{0}$ at the Ce-poor (or O-rich) limit and 6.14 eV at the Ce-rich (or O-poor) limit, shown in Figure 5c. The formation energy of our $\mathrm{I}_{\mathrm{Ce}}{ }^{0}$ is around 1 eV higher than those reported by Zacherle et al. ${ }^{22}$ due to the difference of processing the chemical potential with different pseudopotentials and Hubbard $U$ parameters. However, a large difference is presented for $\mathrm{I}_{\mathrm{Ce}}{ }^{4+}$ at the Ce-poor limit since the formation energy of $\mathrm{I}_{\mathrm{Ce}}{ }^{4+}$ of 5.60 eV by Zacherle et al. ${ }^{22}$ is about 5 eV higher than ours. This may be due to errors when calculating the ionization energies with different pseudopotentials and $U$ parameters.

### 4.6. Frenkel and Schottky Defects

We have also studied the anion Frenkel and Schottky defects, respectively. These defects are important, as they determine how $\mathrm{CeO}_{2}$ responds to disorder. The anion Frenkel defect corresponds to moving an oxygen atom from its original lattice site to leave an oxygen vacancy $\left(\mathrm{V}_{\mathrm{O}}\right)$ and create an interstitial $\left(\mathrm{I}_{\mathrm{O}}\right)$ (see Figure 6a). From the electronic DOS calculation, it is found that there is an acceptor-like state appearing at 1.02 eV above VBM (see Figure 6b). The orbitals of the defect state are mainly dominated by $\pi$ orbitals of $\mathrm{I}_{\mathrm{O}}$ while there are no states from $\mathrm{V}_{\mathrm{O}}$. From the relaxed structure, the lattice around $\mathrm{V}_{\mathrm{O}}$ is more obviously distorted than the structure near $\mathrm{I}_{\mathrm{O}}$, since the $\mathrm{V}_{\mathrm{O}}$ localizes two electrons in the f orbitals of adjacent Ce atoms, which cause large Coulomb repulsive interactions, while the $\pi$-orbitals around $\mathrm{I}_{\mathrm{O}}$ from the oxygen atoms will participate in new coupling interactions and therefore induce less lattice distortion. Meanwhile the excess $\mathrm{O}_{2 \mathrm{p}}$ level of $\mathrm{I}_{\mathrm{O}}$ will shift to a higher energy due to the Coulomb repulsive interaction.

In the case of the Schottky defect, the structure has not been affected by the presence of the defect. Also, no gap states have been found in the electronic DOS (Figure 6c), since four holes generated by $\mathrm{V}_{\mathrm{Ce}}$ passivate the four electrons left by two $\mathrm{V}_{\mathrm{O}}$.
We found that the anion Frenkel defect can easily form with a relatively low formation energy of 2.08 eV, while the Schottky defect cost more energy (3.86 eV). Note that the anion Frenkel defect is generated through formation of $\mathrm{V}_{\mathrm{O}}$ and $\mathrm{I}_{\mathrm{O}}$ within diffusion distance. We recall that $\mathrm{V}_{\mathrm{O}}$ has a low formation energy of 0.39 eV in the O-poor limit. Therefore, we believe that the $\mathrm{V}_{\mathrm{O}}$ $+\mathrm{I}_{\mathrm{O}}$ complex will have a similar formation energy to the anion Frenkel defect under specific charge state and chemical potential environment. This implies the possible dynamics of oxygen-assisted defects (vacancy formation, migration, etc.) in the $\mathrm{CeO}_{2}$ system, which would reveal the physical nature of oxygen storage and reversible catalytic behaviors.

The anion Frenkel (a-Fr) defect is the dominant defect contributing to the ionic conductivity and diffusion of $\mathrm{CeO}_{2}$. We find it to be the lowest-cost disorder defect (2.08 eV in 96-atom supercell), which is consistent with $\mathrm{CaF}_{2}$ or other materials in fluorite structure. Table 2 shows that our value of 2.08 eV is slightly higher than that found by Keating et al. ${ }^{21}$ (1.98 eV) and similar to that of Zacherle et al. ${ }^{22}$ (2.07 eV). Thus, the anion Frenkel defect will account for the high ionic conductivity of $\mathrm{CeO}_{2}$, consistent with the experimental data of Stratton and Tuller. ${ }^{10}$

Table 2. Formation Energy Comparison for Neutral Oxygen Vacancy $\left(\mathrm{V}_{\mathrm{O}}\right)$ Anion Frenkel, Frenkel, and Schottky Defects ${ }^{\boldsymbol{a}}$

| defect | ref 22 | ref 21 | this work |
| :--- | :--- | :--- | :--- |
| neutral $\mathrm{V}_{\mathrm{O}}$ (O-poor), eV | 1.03 | 0.58 | 0.39 |
| anion Frenkel, eV | 2.07 | 1.98 | 2.08 |
| Frenkel, eV | 6.23 |  | 5.80 |
| Schottky, eV | 2.29 | 3.66 | 3.86 |

${ }^{a}$ As denoted from the table, this work shows the improvement on the defect formation energy calculation by nonlinear core correction on Ce pseudopotentials.

![](./images/0c55f968-fc26-4275-a9ca-67e75b19b5da-6_963_1141_227_516.jpg)
Figure 6. (a) Relaxed structure of anion Frenkel defect $\left(\mathrm{V}_{\mathrm{O}}+\mathrm{I}_{\mathrm{O}}\right)$ in $\mathrm{CeO}_{2}$. The green arrow shows the formation path of the anion Frenkel defect in $\mathrm{CeO}_{2}$. The starting point of the arrow is the oxygen vacancy (VO) site. The arrow points to the oxygen interstitial $\left(\mathrm{I}_{\mathrm{O}}\right)$ site that located at the centre of the localized orbitals (blue isosurface area). Localized orbitals of the gap states induced by the anion Frenkel defect $\left(\mathrm{V}_{\mathrm{O}}+\mathrm{I}_{\mathrm{O}}\right)$ in $\mathrm{CeO}_{2}$. (b) Total DOS of the anion Frenkel defect $\left(\mathrm{V}_{\mathrm{O}}+\mathrm{I}_{\mathrm{O}}\right)$ in $\mathrm{CeO}_{2}$. The vertical dashed line at zero energy denotes the highest occupied level. The Fermi level is shown by the arrow. (c) Total DOS of the Schottky defect $\left(\mathrm{V}_{\mathrm{Ce}}+2 \mathrm{~V}_{\mathrm{O}}\right)$ in $\mathrm{CeO}_{2}$. The vertical dashed line at zero energy denotes the highest occupied level. The Fermi level is shown by the arrow. (d) Formation energies (per defect) of anion Frenkel (a-Fr) pair defect with reference to separation (in angstroms) of the a-Fr pair.

We have calculated the effect of defect pair separation on the formation energy of a-Fr pair. The formation energy converges to 2.03 eV for large supercell sizes (Figure S1 in Supporting Information). Thus, the $2 \times 2 \times 3$ supercell of 144 atoms is a suitable size to model the a-Fr pair diffusions. Figure 6d also shows that $5.95 \AA$ represents a crossover separation; below this the a-Fr pair recombines, whereas above this the pair can remain separate, due to the stabilization of separate defects by lattice distortion.

With considerable effort given to verifying the results, our value for its formation energy indeed shows less error than that given by Keating et al. ${ }^{21}$ because we included both the $U_{\mathrm{p}}$ term on the O 2p orbitals and a more transferable Ce pseudopotential to represent the energy difference between $\mathrm{Ce}+3$ and +4 states.

## 5. CONCLUSION

This work has used a corrected DFT+U method combined with partial core correction (under nonlinear core correction scheme) in the pseudopotentials, which can ameliorate the conventional DFT+U deficit and is remarkably close to the reported experimental results. We have used this for a systematic study of the native point defects in the $\mathrm{CeO}_{2}$ system. We find that the $\mathrm{V}_{\mathrm{O}}$ has a low formation energy of 0.39 eV in the O-poor limit, accounting for the ease of reduction, and that the anion Frenkel defect is the lowest-energy disorder defect, consistent with experiment (ref 37 of Zacherle et al. ${ }^{22}$ ). This shows the importance both of including $U$ correction on Ce 4f and O 2p states and of having a fully transferable pseudopotential.

## ASSOCIATED CONTENT

### Supporting Information

One figure showing minimum formation energies (per defect) of a-Fr pair defect with respect to supercell size of the a-Fr pair formed. This material is available free of charge via the Internet at http://pubs.acs.org.

## AUTHOR INFORMATION

### Corresponding Authors

E-mail: bolhuang@cityu.edu.hk; tel (+852)-2784-4027.
E-mail: jr@eng.cam.ac.uk; tel (+44)-01223-748-331.

### Notes

The authors declare no competing financial interest.

## ACKNOWLEDGMENTS

All computing facilities and calculation resources receive funding from the Research Grant Council, University Grants Committee of the HKSAR government. BH would like to thank the fund support and calculations resources all supplied by the Department of Physics and Materials Science, City University of Hong Kong.

## REFERENCES

(1) Kašpar, J.; Fornasiero, P.; Graziani, M. Use of $\mathrm{CeO}_{2}$-Based Oxides in the Three-Way Catalysis. Catal. Today 1999, 50, 285-298.

(2) Kharton, V. V.; Marques, F. M. B.; Atkinson, A. Transport Properties of Solid Oxide Electrolyte Ceramics: A Brief Review. Solid State Ionics 2004, 174, 135-149.

(3) Deng, W.; Carpenter, C.; Yi, N.; Flytzani-Stephanopoulos, M. Comparison of the Activity of $\mathrm{Au} / \mathrm{CeO}_{2}$ and $\mathrm{Au} / \mathrm{Fe}_{2} \mathrm{O}_{3}$ Catalysts for the CO Oxidation and the Water-Gas Shift Reactions. Top. Catal. 2007, 44, 199-208.

(4) Si, R.; Flytzani-Stephanopoulos, M. Shape and Crystal-Plane Effects of Nanoscale Ceria on the Activity of $\mathrm{Au}-\mathrm{CeO}_{2}$ Catalysts for the Water-Gas Shift Reaction. Angew. Chem., Int. Ed. 2008, 47, 2884-2887.

(5) Panagiotopoulou, P.; Papavasiliou, J.; Avgouropoulos, G.; Ioannides, T.; Kondarides, D. I. Water-Gas Shift Activity of Doped $\mathrm{Pt} / \mathrm{CeO}_{2}$ Catalysts. Chem. Eng. J. 2007, 134, 16-22.

(6) Ganduglia-Pirovano, M. V.; Popa, C.; Sauer, J.; Abbott, H.; Uhl, A.; Baron, M.; Stacchiola, D.; Bondarchuk, O.; Shaikhutdinov, S.; Freund, H.-J. Role of Ceria in Oxidative Dehydrogenation on Supported Vanadia Catalysts. J. Am. Chem. Soc. 2010, 132, 2345-2349.

(7) Robertson, J. High Dielectric Constant Oxides. Eur. Phys. J.: Appl. Phys. 2004, 28, 265-291.

(8) Liao, Z.; Gao, P.; Meng, Y.; Fu, W.; Bai, X.; Zhao, H.; Chen, D. Electrode Engineering for Improving Resistive Switching Performance in Single Crystalline $\mathrm{CeO}_{2}$ Thin Films. Solid-State Electron. 2012, 72, 4-7.

(9) Tuller, H. L.; Nowick, A. S. Defect Structure and Electrical Properties of Nonstoichiometric $\mathrm{CeO}_{2}$ Single Crystals. J. Electrochem. Soc. 1979, 126, 209-217.

(10) Stratton, T. G.; Tuller, H. L. Thermodynamic and Transport Studies of Mixed Oxides. The $\mathrm{CeO}_{2}-\mathrm{UO}_{2}$ System. J. Chem. Soc., Faraday Trans. 2 1987, 83, 1143-1156.

(11) Esch, F.; Fabris, S.; Zhou, L.; Montini, T.; Africh, C.; Fornasiero, P.; Comelli, G.; Rosei, R. Electron Localization Determines Defect Formation on Ceria Substrates. Science 2005, 309, 752-755.

(12) Göbel, M. C.; Gregori, G.; Maier, J. Electronically Blocking Grain Boundaries in Donor Doped Cerium Dioxide. Solid State Ionics 2012, 215, 45-51.

(13) Pu, Z.-Y.; Liu, X.-S.; Jia, A.-P.; Xie, Y.-L.; Lu, J.-Q.; Luo, M.-F. Enhanced Activity for CO Oxidation over Pr- and Cu-Doped $\mathrm{CeO}_{2}$ Catalysts: Effect of Oxygen Vacancies. J. Phys. Chem. C 2008, 112, 15045-15051.

(14) Paier, J.; Penschke, C.; Sauer, J. Oxygen Defects and Surface Chemistry of Ceria: Quantum Chemical Studies Compared to Experiment. Chem. Rev. 2013, 113, 3949-3985.

(15) Skorodumova, N. V.; Simak, S. I.; Lundqvist, B. I.; Abrikosov, I. A.; Johansson, B. Quantum Origin of the Oxygen Storage Capability of Ceria. Phys. Rev. Lett. 2002, 89, No. 166601.

(16) Skorodumova, N. V.; Ahuja, R.; Simak, S. I.; Abrikosov, I. A.; Johansson, B.; Lundqvist, B. I. Electronic, Bonding, and Optical Properties of $\mathrm{CeO}_{2}$ and $\mathrm{Ce}_{2} \mathrm{O}_{3}$ from First Principles. Phys. Rev. B 2001, 64, No. 115108.

(17) Andersson, D. A.; Simak, S. I.; Johansson, B.; Abrikosov, I. A.; Skorodumova, N. V. Modeling of $\mathrm{CeO}_{2}, \mathrm{Ce}_{2} \mathrm{O}_{3}$, and $\mathrm{CeO}_{2-\mathrm{X}}$ in the LDA + U Formalism. Phys. Rev. B 2007, 75, No. 035109.

(18) Loschen, C.; Carrasco, J.; Neyman, K. M.; Illas, F. First-Principles LDA + U and GGA + U Study of Cerium Oxides: Dependence on the Effective U Parameter. Phys. Rev. B 2007, 75, No. 035115.

(19) Jiang, Y.; Adams, J. B.; van Schilfgaarde, M.; Sharma, R.; Crozier, P. A. Theoretical Study of Environmental Dependence of Oxygen Vacancy Formation in $\mathrm{CeO}_{2}$. Appl. Phys. Lett. 2005, 87, No. 141917.

(20) Hellman, O.; Skorodumova, N. V.; Simak, S. I. Charge Redistribution Mechanisms of Ceria Reduction. Phys. Rev. Lett. 2012, 108, No. 135504.

(21) Keating, P. R. L.; Scanlon, D. O.; Morgan, B. J.; Galea, N. M.; Watson, G. W. Analysis of Intrinsic Defects in $\mathrm{CeO}_{2}$ Using a Koopmans-Like GGA+U Approach. J. Phys. Chem. C 2011, 116, 2443-2452.

(22) Zacherle, T.; Schriever, A.; De Souza, R. A.; Martin, M. Ab Initio Analysis of the Defect Structure of Ceria. Phys. Rev. B 2013, 87, No. 134104.

(23) Ganduglia-Pirovano, M. V.; Da Silva, J. L. F.; Sauer, J. Density-Functional Calculations of the Structure of Near-Surface Oxygen Vacancies and Electron Localization on $\mathrm{CeO}_{2}(111)$. Phys. Rev. Lett. 2009, 102, No. 026101.

(24) Hay, P. J.; Martin, R. L.; Uddin, J.; Scuseria, G. E. Theoretical Study of $\mathrm{CeO}_{2}$ and $\mathrm{Ce}_{2} \mathrm{O}_{3}$ Using a Screened Hybrid Density Functional. J. Chem. Phys. 2006, 125, No. 034712.

(25) Da Silva, J. L. F.; Ganduglia-Pirovano, M. V.; Sauer, J.; Bayer, V.; Kresse, G. Hybrid Functionals Applied to Rare-Earth Oxides: The Example of Ceria. Phys. Rev. B 2007, 75, No. 045121.

(26) Jiang, H.; Gomez-Abal, R. I.; Rinke, P.; Scheffler, M. Localized and Itinerant States in Lanthanide Oxides United by GW @ LDA + U. Phys. Rev. Lett. 2009, 102, No. 126403.

(27) Jiang, H.; Rinke, P.; Scheffler, M. Electronic Properties of Lanthanide Oxides from the GW Perspective. Phys. Rev. B 2012, 86, No. 125115.

(28) Kullgren, J.; Castleton, C. W. M.; Müller, C.; Ramo, D. M.; Hermansson, K. B3LYP Calculations of Cerium Oxides. J. Chem. Phys. 2010, 132, No. 054110.

(29) Gillen, R.; Clark, S. J.; Robertson, J. Nature of the Electronic Band Gap in Lanthanide Oxides. Phys. Rev. B 2013, 87, No. 125116.

(30) Anisimov, V. I.; Zaanen, J.; Andersen, O. K. Band Theory and Mott Insulators: Hubbard U Instead of Stoner I. Phys. Rev. B 1991, 44, 943-954.

(31) Cococcioni, M.; de Gironcoli, S. Linear Response Approach to the Calculation of the Effective Interaction Parameters in the LDA + U Method. Phys. Rev. B 2005, 71, No. 035105.

(32) Kulik, H. J.; Cococcioni, M.; Scherlis, D. A.; Marzari, N. Density Functional Theory in Transition-Metal Chemistry: A Self-Consistent Hubbard U Approach. Phys. Rev. Lett. 2006, 97, No. 103001.

(33) Heyd, J.; Scuseria, G. E.; Ernzerhof, M. Hybrid Functionals Based on a Screened Coulomb Potential. J. Chem. Phys. 2003, 118, 8207-8215.

(34) Krukau, A. V.; Vydrov, O. A.; Izmaylov, A. F.; Scuseria, G. E. Influence of the Exchange Screening Parameter on the Performance of Screened Hybrid Functionals. J. Chem. Phys. 2006, 125, No. 224106.

(35) Wuilloud, E.; Delley, B.; Schneider, W. D.; Baer, Y. Spectroscopic Evidence for Localized and Extended $f$-Symmetry States in $\mathrm{CeO}_{2}$. Phys. Rev. Lett. 1984, 53, 202-205.

(36) Allen, J. W. Valence Fluctuations in Narrow Band Oxides. J. Magn. Magn. Mater. 1985, 47-48, 168-174.

(37) Mullins, D. R.; Overbury, S. H.; Huntley, D. R. Electron Spectroscopy of Single Crystal and Polycrystalline Cerium Oxide Surfaces. Surf. Sci. 1998, 409, 307-319.

(38) Pfau, A.; Schierbaum, K. D. The Electronic Structure of Stoichiometric and Reduced $\mathrm{CeO}_{2}$ Surfaces: An XPS, UPS and HREELS Study. Surf. Sci. 1994, 321, 71-80.

(39) Marabelli, F.; Wachter, P. Covalent Insulator $\mathrm{CeO}_{2}$ : Optical Reflectivity Measurements. Phys. Rev. B 1987, 36, 1238-1243.

(40) Chai, C.; Yang, S.; Liu, Z.; Liao, M.; Chen, N. Violet/Blue Photoluminescence from $\mathrm{CeO}_{2}$ Thin Film. Chin. Sci. Bull. 2003, 48, 1198-1200.

(41) Castleton, C. W. M.; Kullgren, J.; Hermansson, K. Tuning LDA +U for Electron Localization and Structure at Oxygen Vacancies in Ceria. J. Chem. Phys. 2007, 127, No. 244704.

(42) Louie, S. G.; Froyen, S.; Cohen, M. L. Nonlinear Ionic Pseudopotentials in Spin-Density-Functional Calculations. Phys. Rev. B 1982, 26, 1738-1742.

(43) Fuchs, M.; Scheffler, M. Ab Initio Pseudopotentials for Electronic Structure Calculations of Poly-Atomic Systems Using Density-Functional Theory. Comput. Phys. Commun. 1999, 119, 67-98.

(44) Clark, S. J.; Segall, M. D.; Pickard, C. J.; Hasnip, P. J.; Probert, M. J.; Refson, K.; Payne, M. C. First Principles Methods Using CASTEP. Z. Kristallogr. 2005, 220, 567-570.

(45) Kleinman, L.; Bylander, D. M. Efficacious Form for Model Pseudopotentials. Phys. Rev. Lett. 1982, 48, 1425-1428.

(46) Grinberg, I.; Ramer, N. J.; Rappe, A. M. Transferable Relativistic Dirac-Slater Pseudopotentials. Phys. Rev. B 2000, 62, 2311-2314.

(47) Rappe, A. M.; Rabe, K. M.; Kaxiras, E.; Joannopoulos, J. D. Optimized Pseudopotentials. Phys. Rev. B 1990, 41, 1227-1230.

(48) Marzari, N.; Vanderbilt, D.; Payne, M. C. Ensemble Density-Functional Theory for Ab Initio Molecular Dynamics of Metals and Finite-Temperature Insulators. Phys. Rev. Lett. 1997, 79, 1337-1340.

(49) Probert, M. I. J.; Payne, M. C. Improving the Convergence of Defect Calculations in Supercells: An Ab Initio Study of the Neutral Silicon Vacancy. Phys. Rev. B 2003, 67, No. 075204.

(50) Lany, S.; Zunger, A. Generalized Koopmans Density Functional Calculations Reveal the Deep Acceptor State of $\mathrm{N}_{\mathrm{o}}$ in ZnO. Phys. Rev. B 2010, 81, No. 205209.

(51) Lany, S.; Zunger, A. Polaronic Hole Localization and Multiple Hole Binding of Acceptors in Oxide Wide-Gap Semiconductors. Phys. Rev. B 2009, 80, No. 085202.

(52) Morgan, B. J.; Watson, G. W. Intrinsic N-Type Defect Formation in $\mathrm{TiO}_{2}$ : A Comparison of Rutile and Anatase from GGA+U Calculations. J. Phys. Chem. C 2010, 114, 2321-2328.

(53) Lany, S.; Zunger, A. Assessment of Correction Methods for the Band-Gap Problem and for Finite-Size Effects in Supercell Defect Calculations: Case Studies for ZnO and GaAs. Phys. Rev. B 2008, 78, No. 235104.

(54) Rossignol, S.; Gerard, F.; Mesnard, D.; Kappenstein, C.; Duprez, D. Structural Changes of Ce-Pr-O Oxides in Hydrogen: A Study by in Situ X-Ray Diffraction and Raman Spectroscopy. J. Mater. Chem. 2003, 13, 3017-3020.

(55) Gerward, L.; Staun Olsen, J.; Petit, L.; Vaitheeswaran, G.; Kanchana, V.; Svane, A. Bulk Modulus of $\mathrm{CeO}_{2}$ and $\mathrm{PrO}_{2}-\mathrm{An}$ Experimental and Theoretical Study. J. Alloy. Compd. 2005, 400, 56-61.

(56) Haynes, W. M. CRC Handbook of Chemistry and Physics; CRC Press: Boca Raton, FL, 2011.

(57) Fabris, S.; Vicario, G.; Balducci, G.; de Gironcoli, S.; Baroni, S. Electronic and Atomistic Structures of Clean and Reduced Ceria Surfaces. J. Phys. Chem. B 2005, 109, 22860-22867.

(58) Nolan, M.; Parker, S. C.; Watson, G. W. The Electronic Structure of Oxygen Vacancy Defects at the Low Index Surfaces of Ceria. Surf. Sci. 2005, 595, 223-232.

(59) Han, X.; Lee, J.; Yoo, H.-I. Oxygen-Vacancy-Induced Ferromagnetism in $\mathrm{CeO}_{2}$ from First Principles. Phys. Rev. B 2009, 79, No. 100403.

(60) Zhang, C.; Michaelides, A.; King, D. A.; Jenkins, S. J. Oxygen Vacancy Clusters on Ceria: Decisive Role of Cerium $f$ Electrons. Phys. Rev. B 2009, 79, No. 075433.
