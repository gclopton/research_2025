
# I-0 Abstract

We calculated the formation energies of all simple point defects in cubic fluorite structured $\mathrm{CeO}_2$ using density functional theory within the GGA $+U$ approximation. All possible defect charge states were considered, and also polarons $\mathrm{Ce}_{\mathrm{Ce}}^{\prime}$ and associates of polarons with oxygen vacancies: $\left(\mathrm{V}_{\mathrm{o}}^{-}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)$ and $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{o}}^{-}-\mathrm{Ce}_{\mathrm{Cc}}^{\prime}\right)^{\mathrm{x}}$. From the individual defect energies, we extracted Schottky, Frenkel, and anti-Frenkel energies: we find that anti-Frenkel disorder has the lowest energy in ceria. Energies for the reduction and the hydration of ceria are also computed, and the results are in good agreement with experiment. Finally, point-defect concentrations and conductivities are predicted for undoped and donor-doped systems as a function of oxygen partial pressure and temperature. The characteristic slopes found in experiment are reproduced.

# I. INTRODUCTION

Cerium dioxide, or ceria, adopts the cubic fluorite structure for a wide range of temperatures, hydrostatic pressures, and dopant concentrations. Over the past decades, ceria doped with acceptor cations has been studied intensively because of its high ionic conductivity, ${ }^{1-22}$ which makes it a candidate material for the electrolyte in solid oxide fuel cells (SOFC). The high ionic conductivity arises from oxygen vacancies, which are highly mobile, and which are created to compensate the acceptor dopants. Nominally undoped ceria, in contrast, has attracted little attention, ${ }^{23-29}$ but this is likely to change with the demonstration of resistive switching in undoped ceria and hence its use as the active element in resistive random access memory (ReRAM). ${ }^{30-32}$

Pure ceria, being an intrinsic $n$-type semiconductor, ${ }^{25}$ exhibits a distinct small polaron conductivity. ${ }^{24,29,33,34}$ The polarons are located at cerium ions and formally change $\mathrm{Ce}_{\mathrm{Ce}}^{\times}$ to $\mathrm{Ce}_{\mathrm{Ce}}^{\prime}$. It is generally agreed that these electron polarons are compensated by positively charged oxygen vacancies under reducing conditions. ${ }^{25,35,36}$ At small electron concentrations, i.e., at low Fermi energies (or equivalently at high oxygen partial pressures), it is proposed that the electrons are compensated by doubly charged oxygen vacancies

$$
\left[\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right]=2\left[\mathrm{~V}_{\mathrm{O}}^{\bullet \cdot}\right]
$$


At higher Fermi energies, it is proposed that the electrons are compensated by singly charged oxygen vacancies

$$
\left[\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right]=\left[\mathrm{V}_{\mathrm{O}}^{\prime}\right]
$$


At even higher Fermi energies, the singly charged vacancies are presumably reduced to neutral vacancies; being neutral, they have of course no impact on global charge neutrality.

Evidently, if one wants to study computationally the behavior of point defects in ceria, one has to examine both the polaronic nature of the electronic defects and the different charge states of the ionic defects, and this has not been the case in computational studies to date. For example, Keating et al. ${ }^{29}$ only considered overall neutral defect clusters, whereas Hellman et al. ${ }^{28}$ did not take polarons into account. A second issue concerning point defects in ceria is the lack of agreement in the literature on the prevailing defect disorder type. Keating et al. ${ }^{29}$ and Nakayama et al. ${ }^{19}$ find Schottky disorder to have the lowest energy, whereas it is usually concluded from experimental studies ${ }^{37-39}$ that anti-Frenkel disorder is dominant. In this study, formation energies of ionic and electronic defects in $\mathrm{CeO}_2$ were calculated with density functional theory and the GGA $+U$ method. We examined all intrinsic point defects in their different charge states, and in particular, electron polarons and the association of such polarons with oxygen vacancies. ${ }^{34}$ Focusing on these defects, we are able to describe the experimentally measured behavior ${ }^{23-25,37,39}$ of point defects as a function of $p \mathrm{O}_2$ in undoped and donor-doped ceria.

The paper is organized as follows: In Sec. II, we give a short overview of the framework we used to calculate defect formation energies and defect concentrations, after which we describe in Sec. III salient computational details. In Sec. IV, we present our results: on the calculated bulk properties of ceria; on the defect formation energies; on Schottky, Frenkel, and anti-Frenkel energies; as well as on the energies of reduction and hydration. We also discuss calculated polaron concentrations and conductivities in this section. Lastly, in Sec. V we provide a short summary of our results.


# II. THEORY

Formation energies of isolated charged defects are calculated as follows: $:^{40-42}$

$$
\begin{aligned}
\Delta E_{\text {form }}\left(X^q\right)= & E_{\text {tot }, \text { corr }}\left(X^q\right)-E_{\text {tot }}(\text { bulk })-\sum_{\mathrm{i}} n_{\mathrm{i}} \mu_{\mathrm{i}} \\
& +q\left(E_{\mathrm{Fermi}}+E_{\mathrm{VBM}}\right)
\end{aligned}
$$

$\Delta E_{\text {form }}\left(X^q\right)$ is the formation energy of the defect $X$ in the charge state $q, E_{\text {tot,corr }}\left(X^q\right)$ is the total energy of the supercell with the defect after correction of finite-size effects, and $E_{\text {tot }}$ (bulk) the total energy of the perfect bulk cell. $n_{\mathrm{i}}$ denotes the number of atoms of type i removed from ( $n_i<0$ ) or added to ( $n_{\mathrm{i}}>0$ ) the bulk cell to form the defect, $\mu_{\mathrm{i}}$ is the chemical potential of atom i, and $E_{\text {Fermi }}$ the Fermi energy relative to the valence band maximum $E_{\mathrm{VBM}}$ of the bulk.

In order to minimize finite-size effects, i.e., image-charge interactions and elastic effects, one can calculate the energies for different cell sizes and then extrapolate to infinite dilution. An alternative approach, and one pursued in this study, is to perform an image-charge correction as proposed by Freysoldt et al. ${ }^{43}$ This yields the converged energy from the calculation of just one supercell size and is corrected with respect to image-charge effects, but not with respect to elastic effects.

The concentration $\left[X^q\right]$ of a dilute defect $X^q$ in a given material with a Fermi energy $E_{\text {Fermi }}$ at a temperature $T$ and a given oxygen partial pressure $p \mathrm{O}_2$ can be calculated from its Gibbs free energy of formation $\Delta G_{\text {form }}$ employing a Boltzmann ansatz according to

$$
\left[X^q\right]=N(X) \exp \left(-\frac{\Delta G_{\text {form }}\left(X^q\right)}{k_{\mathrm{B}} T}\right)
$$


The preexponential factor $N(X)$ denotes the concentration of possible lattice sites for the defect $X$. The Gibbs free energy of formation contains contributions from the change of internal energy $\Delta E_{\text {form }}$, the change of volume $\Delta V_{\text {form }}$, and the change of entropy $\Delta S_{\text {form }}$ in the defect formation process:

$$
\Delta G_{\text {form }}=\Delta E_{\text {form }}+p \Delta V_{\text {form }}-T \Delta S_{\text {form }}
$$


In Eq. (5), $p$ denotes the hydrostatic pressure and $T$ the temperature. Since the change of volume $\Delta V_{\text {form }}$ during a defect formation process in a crystal is small, the volume term of the Gibbs free energy of formation may be neglected for ambient (small) pressures. As the calculation of formation entropies is beyond the scope of this study, we also neglect the term $-T \Delta S_{\text {form }}$, even though it can have a significant impact at higher temperatures. In effect, we make the following simplification:

$$
\Delta G_{\text {form }} \approx \Delta E_{\text {form }}
$$

and thus obtain, instead of Eq. (4),

$$
\left[X^q\right]=N(X) \exp \left(-\frac{\Delta E_{\text {form }}\left(X^q\right)}{k_{\mathrm{B}} T}\right)
$$


According to Eq. (3), the formation energy depends on two parameters, namely, the chemical potential of the incorporated or excorporated atoms and the Fermi energy. By varying the chemical potential numerically within the stability range of the investigated material and by imposing charge neutrality

$$
\sum_{X^q} q\left[X^q\right]=0
$$

the Fermi energy can be determined for each value of the chemical potential. With the Fermi energy, the defect concentration at the given chemical potential can be determined [see Eq. (7)]. The chemical potential of oxygen depends on the oxygen partial pressure $p \mathrm{O}_2$ as shown in Eq. (9) $\left[\mu_{\mathrm{O}}^{\circ}\right.$ being the standard chemical potential of oxygen and $\left(p \mathrm{O}_2\right)^{\circ}$ the reference oxygen partial pressure of 1 bar]:

$$
\mu_{\mathrm{O}}=\mu_{\mathrm{O}}^{\circ}+k_{\mathrm{B}} T \ln \left[p \mathrm{O}_2 /\left(p \mathrm{O}_2\right)^{\circ}\right]
$$


Thus, using Eq. (7) the concentrations of point defects can be calculated as a function of temperature and oxygen partial pressure. At large defect concentrations, that is, as the concentration of defects approaches the concentration of available lattice sites, Eq. (7) is no longer valid. In this case, a Fermi-Dirac-type expression is required: ${ }^{44}$

$$
\left[X^q\right]=\frac{N(X)}{\exp \left(\frac{\Delta E_{\text {fom }}\left(X^q\right)}{k_B T}\right)+1}
$$
We compare Boltzmann and Fermi-Dirac approaches where appropriate.

# III. COMPUTATIONAL METHOD

The density functional calculations were performed within the generalized gradient approximation (GGA) according to Perdew, Burke, and Ernzerhof ${ }^{45}$ and the projector augmented wave (PAW) method, ${ }^{46}$ as implemented in the Vienna ab initio simulation package (VASP). ${ }^{47,48}$ The electronic wave functions were expanded with a basis set of plane waves with kinetic energies of up to $E_{\text {kin }}=500 \mathrm{eV}$. For cerium, 12 electrons were included, corresponding to the electron configuration [Pd] $4 f^1 5 s^2 5 p^6 5 d^1 6 s^2$. For oxygen, 6 electrons were included, corresponding to the electron configuration $[\mathrm{He}] 2 s^2 2 p^4$.

A $2 \times 2 \times 2$ supercell of the cubic $F m \overline{3} m$ fluorite structure with 96 atoms ( 768 electrons) was used. The Brillouin zone integration was carried out with a $2 \times 2 \times 2$ Monkhorst-Pack ${ }^{49}$ grid in the first Brillouin zone of the cubic supercell. Structural relaxations were conducted until the Hellmann-Feynman force acting on each atom was less than $0.005 \mathrm{eV} \AA^{-1}$. A Hubbard $U$ parameter was employed to account for localized Ce $4 f$ electrons. A rotationally invariant approach ${ }^{50}$ was used with an effective $U$ parameter of $U=5.0 \mathrm{eV}$, as recommended in the literature. ${ }^{51}$ The calculated energies were corrected with respect to image-charge interactions according to Freysoldt et al. ${ }^{43}$

# IV. RESULTS AND DISCUSSION

## IV-A. Properties of the perfect lattice

We first examine the calculated lattice properties of defectfree ceria (see Table I). Our aim is to demonstrate that we can describe the perfect lattice reasonably well. The equilibrium lattice parameter and the bulk modulus were calculated by fitting a Birch-Murnaghan ${ }^{52,53}$ equation of state to total energies for different cell volumes. The lattice constants obtained with the GGA functional $a_0=5.468 \AA$ and with the GGA $+U$ functional $a_0=5.494 \AA$ are slightly larger than the experimentally found value of $a_0=5.411 \AA \AA^{54}$ The difference can be explained by the characteristic overestimation of the lattice constant by the GGA functional (even more pronounced for the GGA $+U$ functional). The bulk moduli $B_0=172 \mathrm{GPa}(\mathrm{GGA})$ and $B_0=181 \mathrm{GPa}(\mathrm{GGA}+U)$ derived in this study are, as is also characteristic of these functionals, smaller than the experimentally found value of $220 \mathrm{GPa} .{ }^{54}$ As can be seen in Table I, our values for the lattice constant and bulk modulus are close to other theoretical values in the literature. ${ }^{19,29,55}$



The formation energy $\Delta E_{\text {form }}^{\mathrm{CeO}_2}$ of the cubic fluorite structured $\mathrm{CeO}_2$ from its constituent elements was calculated within the GGA formalism, as there is no physical reason to include a $U$ parameter for metallic Ce . (For detailed discussions of this issue and associated problems, the reader is referred to Refs. 56 and 57.) $\Delta E_{\text {form }}^{\mathrm{CeO}_2}$ was found to be -10.44 eV . To correct for the well-known overbinding of the $\mathrm{O}_2$ molecule in GGA calculations, one can subtract 1.36 eV per $\mathrm{O}_2$ molecule ${ }^{58}$ from calculated oxidation energies. This yields a corrected formation energy of ceria of $\Delta E_{\text {form,corr }}^{\mathrm{CeO}_2}=-11.80 \mathrm{eV}$ at $T=0 \mathrm{~K}$ and agrees well with the experimentally found value of the formation enthalpy of -11.28 eV at $T=298 \mathrm{~K} .{ }^{59}$

Ceria is a wide-band-gap semiconductor. The band-gap energy $\Delta E_{\mathrm{g}}$ lies in the range of $5.5-6.0 \mathrm{eV}^{60,61}$ The valence and conduction bands are formed predominantly by $\mathrm{O} 2 p$ and Ce $5 d$ states, respectively. ${ }^{55}$ Within the band gap there are Ce $4 f$ states, which are unoccupied in the defect-free bulk material. Due to resolution limits, it is difficult to experimentally determine the degree of localization of these $f$ states, but they are assumed to be localized. ${ }^{51}$ The energy difference $\Delta E_{f \text {-VBM }}$ between the lowest unoccupied $4 f$ state and the valence band maximum (VBM) was experimentally found to be around $3.0 \mathrm{eV} .{ }^{61,62}$ In this study, $\Delta E_{\mathrm{g}}=5.31 \mathrm{eV}$ and $\Delta E_{f-\mathrm{VBM}}=$ 2.35 eV were obtained with the $\mathrm{GGA}+U$ functional, which is in reasonable agreement with the experimental values.

 
## IV-B. Defect formation energies

The value of the chemical potential of oxygen in ceria $\mu_{\mathrm{O}}^{\mathrm{CeO}_2}$ is limited by the phase boundaries of $\mathrm{CeO}_2$. At low oxygen partial pressures, $\mathrm{CeO}_2$ is bordered by $\mathrm{Ce}_2 \mathrm{O}_3$ and at high oxygen partial pressures by the gaseous $\mathrm{O}_2$ phase. From these conditions, a range of the chemical potential of $\mu_{\mathrm{O}, \text { min }}^{\mathrm{CeO}_2}=-7.17 \mathrm{eV}$ under oxygen-poor conditions up to $\mu_{\mathrm{O}, \text { max }}^{\mathrm{CeO}_2}=-4.93 \mathrm{eV}$ under oxygen-rich conditions can be derived for ceria. In Table II, the calculated GGA $+U$ defect formation energies of ionic point defects in an oxygen-poor and an oxygen-rich environment are listed for a Fermi energy of 0 eV . The energies of the interstitial defects correspond to species placed in the octahedral hole of the fluorite structure. The only exception is the neutral oxygen interstitial, for which a configuration with a slight displacement of the oxygen atom from the octahedral site is found to be energetically favored (see Sec. IV B3).


### 1. Polarons

As noted in the Introduction, the correct description of electronic defects in ceria is a critical issue. It is therefore necessary to compare the localized electronic defect (electron polaron) with a delocalized electronic defect (band electron). The preparation of a delocalized electron was easily achieved by adding an extra electron to a supercell of the bulk material. The band electron occupies one of the previously unoccupied $f$ states within the band gap and its formation energy is computed to be $\Delta E_{\text {form }}=2.20 \mathrm{eV}$ (for $E_{\text {Fermi }}=0 \mathrm{eV}$ ). Since the charge is smeared out, a charge correction according to Freysoldt et al. ${ }^{43}$ is not possible. The preparation of a polaron, i.e., the localization of an extra charge on one chosen cerium ion, in contrast, is not easily achieved. Specifically, before starting the structural relaxation, we had to displace the neighboring ions in a fashion resulting from a hypothetical negative point charge on the cerium ion on which the polaron was to be localized: the neighboring cerium cations were moved towards this cerium ion, and the neighboring oxygen ions were displaced in the opposite direction, i.e., away from this cerium ion. The amount of the displacement was varied; a starting configuration with a displacement of $d=1-2 \AA$ was found to result in the successful preparation of a polaron. As can be seen from Fig. 1, which shows the partial charge density corresponding to the highest occupied state of the relaxed configuration, the additional electron is indeed localized on one cerium atom. (All plots of the partial charge density shown in this work were created with the program vesta. ${ }^{63}$ ) The density of states (DOS) of the supercell with the polaron shown on the right of Fig. 1 reveals that the polaron induces localized states within the gap between the valence band maximum and the Ce $4 f$ states. These do not appear in the DOS of the supercell with an additional delocalized electron presented on the left of Fig. 1. In contrast to the band electron, the localized charge of the polaron causes monopole terms in the image-charge interactions. A charge correction according to Freysoldt was therefore performed and yielded a correction of $\Delta E_{\text {corr }}=0.06 \mathrm{eV}$, resulting in a formation energy of the polaron of $\Delta E_{\text {form }}=1.90 \mathrm{eV}$ (for $E_{\text {Fermi }}=0 \mathrm{eV}$ ). So, formation of polarons is energetically favored by 0.3 eV with respect to band electrons, rendering it the dominant electronic defect in our calculations. This agrees well with the experimental findings of Tuller et al. ${ }^{24}$


### 2. Oxygen vacancies and associates of oxygen vacancies and polarons
It has been reported ${ }^{34,64,65}$ that association between positively charged oxygen vacancies and negatively charged polarons occurs:

$$
\mathrm{V}_{\mathrm{O}}^{\because}+\mathrm{Ce}_{\mathrm{Ce}}^{\prime} \rightleftharpoons\left(\mathrm{V}_{\mathrm{o}}^{\because}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)
$$


This defect associate formally resembles a singly charged oxygen vacancy $\mathrm{V}_{\mathrm{O}}$. A doubly charged oxygen vacancy can also form an associate with two polarons

$$
\mathrm{V}_{\mathrm{O}}^{\ddot{ }}+2 \mathrm{Ce}_{\mathrm{Ce}}^{\prime} \rightleftharpoons\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{O}}^{\ddot{ }}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\times}
$$

which formally resembles a neutral oxygen vacancy $V_0^{\times}$. We prepared, therefore, such vacancy-polaron associates according to the procedure detailed in the previous section.

In spite of their formal resemblance, the electronic structure of the two defect species $\mathrm{V}_{\mathrm{O}}^{\times}$and $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{O}}^{\because}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^x$, for example, differs considerably, as can be seen from the partial charge densities shown in Fig. 2. The additional charge for $\mathrm{V}_{\mathrm{O}}^{\times}$is equally distributed over the four nearest cerium ions, whereas for $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{O}}^{\ddot{ }}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\times}$it is clearly localized in the form of two polarons adjacent to the oxygen vacancy. For $\mathrm{V}_{\mathrm{O}}^{+}$, the charge is similarly distributed over the four nearest cerium ions, whereas for $\left(\mathrm{V}_{\mathrm{O}}^{\ddot{ }}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{-}$it is localized as a polaron on one neighboring cerium ion (not shown). The formation energy of the associate of a doubly charged oxygen vacancy and one polaron is lower by 0.14 eV than the formation energy of $\mathrm{V}_{\mathrm{o}}$ (see Table II). Similarly, $\Delta E_{\text {form }}$ of the associate of a doubly charged vacancy with two polarons is lower than the neutral oxygen vacancy $\mathrm{V}_{\mathrm{O}}^{\times}$by 0.47 eV . Nevertheless, structural relaxation of a cell with two additional electrons yields the configuration shown in Fig. 2(a), i.e., without polaron formation. This emphasizes that care should be taken in the preparation procedure and in the control of the different charge states of point defects.

Figure 3 summarizes all the calculated formation energies of the differently charged oxygen vacancies, with and without polarons. Formation energies are plotted against the Fermi energy, with the dashed, vertical line denoting the energy of the lowest $\mathrm{Ce} 4 f$ state, i.e., the upper border of the gap between the valence band and the Ce $4 f$ states. The formation energy falls below zero for Fermi energies smaller than $E_{\text {Fermi }}=0.09 \mathrm{eV}$ in an oxygen-rich environment and smaller than $E_{\mathrm{Fermi}}=$ 1.25 eV in an oxygen-poor environment. If we make the simplification of Eq. (6), then for $\Delta E_{\text {form }}\left(\mathrm{V}_0^*\right)<0$, no negatively charged point defect can form in sufficient quantities to charge compensate $\mathrm{V}_{\mathrm{o}}$. In other words, negative defect formation energies lead to the principle of electroneutrality being violated. For this reason, the Fermi energy of ceria cannot fall below the above-mentioned values at which the formation energy is zero.

Oxygen vacancies in oxides often exhibit a so-called negative $U$ effect. ${ }^{66,67}$ This refers to the preferred formation of neutral oxygen vacancies over singly charged oxygen vacancies. For the oxygen vacancies without polarons, we find a small Fermi energy span from $1.71-1.83 \mathrm{eV}$ in which the singly charged vacancy $\mathrm{V}_{\mathrm{O}}$ is the energetically most favorable species. However, as shown in Fig. 3, the lowering of the formation energy of neutral vacancies through the formation of a cluster with two polarons results in the suppression of the formation of singly charged vacancy species. After inclusion of all relevant oxygen vacancy species, the GGA $+U$ calculations predict a negative $U$ effect in $\mathrm{CeO}_2$. We stress, however, that this does not necessarily mean that $\left(\mathrm{V}_{\ddot{\mathrm{o}}}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)$ is not present in ceria. For example, it is conceivable that neutral vacancy-polaron associates $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{O}}^{\ddot{ }}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\times}$are the dominating defects for high Fermi energies, whereas $\left(\mathrm{V}_{\mathrm{O}}^{-}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\prime}$, compensated by electrons, dominate electroneutrality. This possibility is usually ignored in the literature on this topic.

The binding energies between the polarons and the doubly charged oxygen vacancies in the two clusters were calculated. The value for the singly charged cluster is $\Delta E_{\text {bind }}=0.33 \mathrm{eV}$. The neutral cluster with two polarons exhibits a binding energy of $\Delta E_{\text {bind }}=0.36 \mathrm{eV}$ per bound polaron. Bishop et al. ${ }^{64}$ have experimentally found $\Delta E_{\text {bind }}=0.20 \mathrm{eV}$ per polaron-vacancy bond in the neutral cluster. Nakayama et al. ${ }^{34}$ have recently calculated a polaron-vacancy binding energy of 0.40 eV per bound polaron in the neutral cluster and a higher binding energy of 0.49 eV in the cluster with one polaron. It can be assumed, therefore, that the majority of the clusters are associated within the temperature range examined experimentally (and investigated in this work).

Keating et al. ${ }^{29}$ also calculated the formation energies of defects in bulk ceria. They did not determine the formation energies of the defects in all charge states but determined the formation energies of overall neutral clusters of charged point defects and oppositely charged polarons. The formation energy of the neutral cluster of a doubly charged oxygen vacancy and two polarons calculated in our work $\Delta E_{\text {form }}=0.56 \mathrm{eV}$ in an O-poor environment agrees very well with the value which Keating et al. present as the formation energy of an oxygen vacancy $\Delta E_{\text {form }}=0.57 \mathrm{eV}$, but which is, strictly speaking, the formation energy of an associate of a vacancy and two polarons.


### 3. Oxygen interstitials

Keating et al. ${ }^{29}$ report that interstitial oxygen species are unstable in the octahedral hole of the fluorite structure and relax into a position near a lattice oxygen ion, forming a peroxide ion. For the doubly charged oxygen interstitial $\mathrm{O}_{\mathrm{i}}^{\prime \prime}$, we find that the configuration with a very similar bond length of $d_{\mathrm{O}-\mathrm{o}}=1.46 \AA$ is less favorable by 0.96 eV than the configuration with the interstitial ion in the octahedral position $\left[d_{\mathrm{O}-\mathrm{o}}=2.52 \AA\right.$ ]. In the case of the neutral interstitial $\mathrm{O}_{\mathrm{i}}^{\times}$, we find a configuration where the interstitial is slightly displaced from the octahedral site, but still distant from the nearest oxygen ion, with $d_{0-0}=2.26 \AA$. This configuration is lower in energy by 0.21 eV but cannot be classified as a peroxide configuration because of the large oxygen-oxygen distance.


### 4. Summary

To summarize the results so far, we plot in Fig. 4 the formation energies of all ionic and electronic defects in bulk ceria as a function of the Fermi energy. The possible Fermi energies are in the range of $E_{\text {Fermi }}=1.25-1.90 \mathrm{eV}$ under oxygen-poor conditions, and are limited by oxygen vacancies and polarons. Under oxygen-rich conditions, oxygen vacancies and cerium vacancies confine the Fermi energies of the system to energies $E_{\text {Fermi }}=0.09-1.84 \mathrm{eV}$.

In the context of this work, the preparation of localized electron holes, probably located on oxygen ions, was not pursued. We note, however, that Stratton et al. ${ }^{37}$ reported the electronic conductivity of U-doped $\mathrm{CeO}_2$ to vary, at low temperatures and high $p \mathrm{O}_2$, according to $\left(p \mathrm{O}_2\right)^{-1 / 2}$; this was explained in terms of donor dopants being compensated by clusters of localized holes and doubly charged oxygen interstitials:

$$
\left[D^{\prime}\right]=\left[\left(\mathrm{O}_{\mathrm{i}}^{\prime \prime}-\mathrm{h}^{\prime}\right)^{\prime}\right] .
$$

## C. Schottky, Frenkel, and anti-Frenkel energies

The Frenkel energy $\Delta E_{\mathrm{Fr}}$, anti-Frenkel energy $\Delta E_{\mathrm{a}-\mathrm{Fr}}$, and Schottky energy $\Delta E_{\text {Sch }}$ were determined from the individual defect energies in Table II for the maximally charged defect states:

$$
\begin{array}{lc}
\text { Fr: } & \mathrm{Ce}_{\mathrm{Ce}}^{\times} \rightleftharpoons \mathrm{V}_{\mathrm{Ce}}^{\prime \prime \prime}+\mathrm{Ce}_{\mathrm{i}}^{\cdots}, \\
\text { a-Fr: } & \mathrm{O}_{\mathrm{O}}^{\times} \rightleftharpoons \mathrm{V}_{\mathrm{O}}^{\prime \prime}+\mathrm{O}_{\mathrm{i}}^{\prime \prime}, \\
\text { Sch: } & \mathrm{Ce}_{\mathrm{Ce}}^{\times}+2 \mathrm{O}_{\mathrm{O}}^{\times} \rightleftharpoons \mathrm{V}_{\mathrm{Ce}}^{\prime \prime \prime \prime}+2 \mathrm{~V}_{\mathrm{O}}^{\bullet}+\mathrm{CeO}_2 \text { (surf) }
\end{array}
$$

$\mathrm{CeO}_2$ (surf) refers to the formula unit of $\mathrm{CeO}_2$ that is produced at the surface by Schottky disorder; this energy is approximated here as the energy of a bulk formula unit. In order to compare our calculations with GGA literature data, we calculated energies with both GGA and GGA $+U$ functionals. The energies listed in Table III (all energies are per defect created) show that the anti-Frenkel disorder is the energetically most favorable type of intrinsic ionic disorder in ceria at $T=0 \mathrm{~K}$.

Atomistic calculations with empirical pair potentials (EPP) performed by Walsh et al. ${ }^{27}$ show the same trends. The absolute values per defect of $\Delta E_{\mathrm{Fr}}=15.94 \mathrm{eV}, \Delta E_{\mathrm{a}-\mathrm{Fr}}=3.21 \mathrm{eV}$, and $\Delta E_{\text {Sch }}=5.79 \mathrm{eV}$, however, are much larger than the values calculated in this work. GGA calculations performed by Nakayama and Martin ${ }^{19}$ yield an anti-Frenkel energy of $\Delta E_{\mathrm{a}-\mathrm{Fr}}=2.02 \mathrm{eV}$ per defect similar to the anti-Frenkel energies obtained in this study. Larger differences are found for energies which involve the formation of highly charged defects, i.e., $\mathrm{V}_{\mathrm{Ce}}^{\prime \prime \prime \prime}$ and $\mathrm{Ce}_{\mathrm{i}}$. This can be explained by the fact that the energies of Nakayama and Martin are not image-charge corrected. The calculated corrections for GGA formation energies in this work are $\Delta E_{\text {corr }}=1.94 \mathrm{eV}$ per defect for Frenkel disorder and $\Delta E_{\text {corr }}=0.77 \mathrm{eV}$ per defect for Schottky disorder, while it is only $\Delta E_{\text {corr }}=0.11 \mathrm{eV}$ per defect for anti-Frenkel disorder. Without the image-charge corrections, the energies calculated in this work agree well with the formation energies calculated by Nakayama and Martin for all three types of disorder. This emphasizes the need to apply finite-size corrections even in order to extract only qualitatively correct predictions from $a b$ initio defect calculations.

Even though Keating et al. ${ }^{29}$ observe peroxide ions in the case of interstitial oxygen ions, their anti-Frenkel energy agrees surprisingly well with the anti-Frenkel energy calculated in this work. The Schottky energy calculated by Keating et al. in contrast is much smaller than our value. The reason for this could lie in associative energy contributions in the energies determined by Keating et al.: both defects of anti-Frenkel disorder were placed within one supercell; the same is true for all three defects of Schottky disorder. Whereas in the case of anti-Frenkel disorder the defects were placed apart, at a distance of $d=7.17 \AA$, in order to avoid recombination, the vacancies forming the Schottky disorder were placed in direct vicinity. It can therefore be assumed that defect interactions contribute to the anti-Frenkel and Schottky energies presented by Keating and co-workers. This is confirmed by the fact that the anti-Frenkel energy is lower than the sum of the formation energies of an oxygen vacancy and an oxygen interstitial. The same is true for the Schottky energy compared with the sum of the formation energies of a cerium vacancy and two oxygen vacancies. Frenkel, anti-Frenkel, and Schottky energies are conventionally calculated for maximally charged, dilute defects. The energies calculated in this work correspond to the classic formation energies of ionic intrinsic disorder.

At present, experimental data are only available for anti-Frenkel disorder in U -doped $\mathrm{CeO}_2$. By measuring the electrical conductivity and oxygen self-diffusion, Stratton et al. ${ }^{37}$ determined an anti-Frenkel energy of $\Delta E_{\mathrm{a}-\mathrm{Fr}}=1.83 \mathrm{eV}$ (see Table III) for $0.1 \% \mathrm{U}$-doped $\mathrm{CeO}_2$. The theoretical values determined in this study $\Delta E_{\mathrm{a}-\mathrm{Fr}}(\mathrm{GGA})=2.04 \mathrm{eV}$ and $\Delta E_{\mathrm{a}-\mathrm{Fr}}(\mathrm{GGA}+U)=2.07 \mathrm{eV}$ differ from the experimental value by ca. $12 \%$, i.e., the data agree reasonably well. We conclude that anti-Frenkel disorder is the dominant structural disorder type in ceria.


## IV-D. Energy of reduction

The reduction of ceria involves the removal of oxygen ions from the lattice and the creation of electronic defects. As demonstrated in Sec. IV B1, these electronic defects are localized as electron polarons, and thus the reduction reaction reads as

$$
2 \mathrm{Ce}_{\mathrm{Ce}}^{\times}+\mathrm{O}_{\mathrm{O}}^{\times} \rightleftharpoons \mathrm{V}_{\mathrm{O}}^{\ddot{ }}+2 \mathrm{Ce}_{\mathrm{Ce}}^{\prime}+\frac{1}{2} \mathrm{O}_2(\mathrm{~g})
$$


The reduction energy can therefore be calculated according to

$$
\begin{aligned}
\Delta E_{\mathrm{Red}}= & E_{\text {tot }, \text { corr }}\left(\mathrm{V}_{\mathrm{O}}^*\right)+2 E_{\text {tot }, \text { corr }}\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right) \\
& +\frac{1}{2} E_{\mathrm{tot}}\left(\mathrm{O}_2\right)-3 E_{\text {tot }}(\text { bulk })
\end{aligned}
$$


As in the case of the formation energy of ceria (see Sec. IV A), a correction for the GGA overbinding of the $\mathrm{O}_2$ molecule was conducted according to Wang et al. ${ }^{58}$ The calculated and corrected reduction energy is thus $\Delta E_{\text {Red }}^{\text {corr }}=4.21 \mathrm{eV}$. Tuller experimentally found a reduction enthalpy of $\Delta H_{\text {Red }}=$ 4.67 eV for undoped ceria. ${ }^{25}$ This value agrees very well with the calculated energy, differing by ca. $10 \%$. For $15 \%$ Sm-doped ceria, Chueh et al. ${ }^{68}$ reported the reduction enthalpy to be $\Delta H_{\text {Red }}=4.18 \mathrm{eV}$, which is even closer to our value. From measurements on epitaxial thin films of $2 \mathrm{~mol} \% \mathrm{Nb}$ doped ceria, Göbel et al. ${ }^{39}$ extracted an oxygen insertion energy $\Delta H_{\mathrm{i}}=\Delta H_{\mathrm{a}-\mathrm{Fr}}-\Delta H_{\text {Red }}=(-0.35 \pm 0.1) \mathrm{eV}$. This is in satisfactory agreement with our theoretical prediction of $\Delta E_{\mathrm{i}}=\Delta E_{\mathrm{a}-\mathrm{Fr}}-\Delta E_{\mathrm{Red}}^{\text {corr }}=-0.07 \mathrm{eV}$.

## IV-E. Energy of hydration

Wagner ${ }^{69}$ observed the dissolution of water into yttriastabilized zirconia (YSZ) in $\mathrm{H}_2 \mathrm{O}$ atmospheres, and proposed that the dissolution occurs by the reaction with an oxygen vacancy to give interstitial protons:

$$
\mathrm{V}_{\mathrm{o}}^{\ddot{ }}+\mathrm{H}_2 \mathrm{O} \rightleftharpoons \mathrm{O}_{\mathrm{o}}^{\times}+2 \mathrm{H}_{\mathrm{i}}
$$


In order to calculate the energy of this reaction (the hydration energy), one requires the formation energy of interstitial hydrogen species. The formation energies of such species in ceria at $E_{\text {Fermi }}=0 \mathrm{eV}$ under H -rich conditions are listed in Table IV. The entries denoted as $\mathrm{H}_{\mathrm{i}}$ (oct) refer to interstitial defects in the octahedral hole of the fluorite structure. The other entries denoted as $\mathrm{H}_{\mathrm{i}}$ (oxy) refer to a different stable configuration in which the hydrogen moiety is located close to an oxygen ion with an interionic distance of $d_{\mathrm{O}-\mathrm{H}}=0.98 \AA$. The configuration with the proton close to an oxygen ion is energetically more stable than that corresponding to the occupation of the octahedral hole.

Figure 5 shows the formation energies of protonic defects in both configurations as a function of the Fermi energy.



For the majority of possible Fermi energies, the positively charged proton is the preferred defect. At Fermi energies $E_{\text {Fermi }}=1.51-2.13 \mathrm{eV}$, the formation of neutral hydrogen interstitials is favored and above Fermi energies of $E_{\text {Fermi }}=$ 2.13 eV negatively charged hydride interstitials become most favorable. The hydration energy was calculated in the same manner as the reduction energy:

$$
\begin{aligned}
\Delta E_{\mathrm{Hyd}}^{\mathrm{eff}}= & 2 E_{\text {tot }, \text { corr }}\left[\mathrm{H}_{\mathrm{i}}^{\prime}(\mathrm{oxy})\right]-E_{\text {tot }, \text { corr }}\left(\mathrm{V}_{\mathrm{O}}^{\ddot{ }}\right) \\
& \left.-E_{\text {tot }}\left(\mathrm{H}_2 \mathrm{O}\right)-E_{\text {tot }} \text { (bulk }\right)
\end{aligned}
$$


The hydration energy of $\mathrm{CeO}_2$ is thus predicted to be $\Delta E_{\text {Hyd }}^{\text {eff }}=$ +0.68 eV .

The behavior of fluorite structured oxides, such as $\mathrm{CeO}_2$ (and $\mathrm{ZrO}_2$ ), contrasts strongly, therefore, with that of perovskite oxides, such as $\mathrm{SrCeO}_3$ and $\mathrm{BaZrO}_3$, for which the hydration energy is often negative (e.g., $\Delta E_{\mathrm{Hyd}}^{\text {eff }}=-0.82 \mathrm{eV}$ for $10 \%$ Y-doped $\mathrm{BaZrO}_3$ (Ref. 70)), and the incorporation of water takes place spontaneously to fill the majority of oxygen vacancies. Our calculations predict the dissolution of water into $\mathrm{CeO}_2$ [see Eq. (19)] to be endothermic. This prediction is in line with experimental findings, in which the solubility of hydrogen in ceria is reported to be low. ${ }^{71}$

## IV-F. Defect concentrations

All the following defect concentrations were determined from the GGA $+U$ formation energies from Table II.


### 1. Pure ceria

The concentrations of all point defects were calculated for undoped ceria according to Eq. (7). Figure 6 shows the concentrations at a temperature of $T=650 \mathrm{~K}$. As expected, oxygen vacancies and electron polarons are the dominant defects. All other defects, i.e., oxygen interstitials, cerium vacancies, and cerium interstitials are minority defects, with equilibrium concentrations smaller than $10^{-2} \mathrm{~cm}^{-3}$ at this temperature.

At small deviations from stoichiometry, i.e., at high oxygen partial pressures, doubly charged oxygen vacancies $\mathrm{V}_{\mathrm{o}}^*$ are the prevalent vacancy species. At low oxygen partial pressures, the cluster of a doubly charged oxygen vacancy and two polarons is the energetically most favorable species. The neutral cluster cannot charge compensate the polarons, however. Figure 6 shows that in the region where the neutral cluster is the dominant vacancy species, the polarons are compensated by singly charged oxygen vacancies in the form of a cluster of a doubly charged vacancy and one polaron. Thus, a negative $U$ effect does not exclude singly charged vacancies from being stable but it does exclude them from being the dominant point defect. In Fig. 6, one finds that the predicted oxygen vacancy concentrations for very low oxygen partial pressures are greater than the concentration of oxygen lattice sites $\left[N\left(\mathrm{~V}_{\mathrm{O}}\right)=\right.$ $4.825 \times 10^{22} \mathrm{~cm}^{-3}$ ] in ceria. For higher temperatures, the polaron concentration also exceeds the concentration of cerium lattice sites $\left[N\left(\mathrm{Ce}_{\mathrm{Ce}}\right)=2.412 \times 10^{22} \mathrm{~cm}^{-3}\right]$, and the effect is even more pronounced for the oxygen vacancies. This process is physically impossible for oxygen vacancies and unlikely for electron polarons, as it would require two polarons to reside on one cerium site, forming $\mathrm{Ce}_{\mathrm{Ce}}^{\prime \prime}$.

There are several reasons for the calculated defect concentrations exceeding the lattice site concentrations. The first reason is the underestimation of the individual defect energies $\Delta E_{\text {form }}\left(X^q\right)$, as evidenced by the calculated reduction energy being lower than the experimentally determined value (see Sec. IV D). Second, defect concentrations were calculated according to Eq. (7), on the basis of Maxwell-Boltzmann statistics, that is, for low (dilute) defect concentrations. At high defect concentrations, when the concentration of defects approaches the concentration of available sites, MaxwellBoltzmann statistics is no longer valid: rather, Fermi-Dirac statistics should be employed [see Eq. (10)]. Third, long before such site availability effects become important, we expect interactions between oxygen vacancy species to play a role. The inclusion of such effects is beyond the scope of this study, however, and we confine our analysis, especially at large deviations from stoichiometry, i.e., at small oxygen partial pressures, to the implementation of FermiDirac statistics. The results are indicated with dotted lines in Fig. 6.

From the laws of mass action and the condition of charge neutrality, the polaron concentrations are expected to follow a power-law dependence on oxygen partial pressure with a characteristic exponent of $-\frac{1}{6} \approx-0.167$ when the polarons are compensated by doubly charged oxygen vacancies. ${ }^{37}$ The exponent of the predicted concentration curves is exactly -0.167 in agreement with the expected value. When polarons are charge compensated by singly charged oxygen vacancies, an exponent of $-\frac{1}{4}$ is expected. The polaron concentration curves at large deviations from stoichiometry, i.e., at low oxygen partial pressures, show a slope of ca. -0.229 . The slight deviation from the theoretically expected value of -0.25 can be explained by the fact that the slope was determined only at the onset of the $-\frac{1}{4}$ regime, as lower $p \mathrm{O}_2$ 's were not accessible due to phase stability. Overall, the expected power-law dependencies of the polaron concentrations on oxygen partial pressure are reproduced well.

We comment here further on the $p \mathrm{O}_2$ dependence of the oxygen vacancy concentration, which has also been determined experimentally. ${ }^{23}$ If the oxygen vacancy concentration is plotted against $p \mathrm{O}_2$ in a double logarithmic plot, a kink, i.e., a change of slopes, is observed. Jiang et al. ${ }^{26}$ calculated oxygen vacancy concentrations but only for neutral vacancies, i.e., low $p \mathrm{O}_2$. In their study, they were not able to reproduce the experimentally measured kink in oxygen vacancy concentration versus $\log _{10}\left(p \mathrm{O}_2\right)$, but this is not entirely surprising because they did not incorporate charged vacancies in their calculations of concentrations. Following on from this incomplete description, Hellman et al. ${ }^{28}$ concluded that the standard semiconductor formalism was not able to describe the above-mentioned kink. They claim instead that an unusual mechanism of charge redistribution between $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ species, together with high impurity levels, provides the only explanation for the kink in such a plot. As can be seen in Fig. 6, this is not true. We consider a huge range of oxygen vacancy concentrations, from low to high, and we clearly observe a kink in the oxygen vacancy concentration, which occurs, when at low $p \mathrm{O}_2,\left[\mathrm{~V}_{\mathrm{o}}^{\prime \prime}\right]$ becomes smaller than $\left[\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{o}}^{-}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\times}\right]$. The standard semiconductor formalism pursued in this study, if applied correctly and with finite-size corrections, is also able to reproduce the experimental kink in the oxygen vacancy concentration and without resorting to unusual explanations and unrealistically high impurity concentrations.


### 2. Donor-doped ceria

Figure 7 shows the calculated concentrations of oxygen vacancies and polarons of 1 ppm donor-doped ceria at $T=$ 650 K . The small donor content of 1 ppm was chosen in order to be able to see both the intrinsic and the extrinsic defect regimes within the stability limits of the compound. It also serves to emphasize that 1 ppm of impurities is sufficient to alter the overall defect behavior. The transition from the extrinsic to the intrinsic defect regime can be observed around an oxygen partial pressure of $p \mathrm{O}_2 \approx 10^{-6} \mathrm{bar}$. At high oxygen partial pressures, the donor concentration fixes the polaron concentration. With decreasing oxygen partial pressure, the concentration of oxygen vacancies increases above the donor concentration, giving rise to the onset of the intrinsic regime. The oxygen vacancies are charge compensated by polarons. All other defects are minority defects over the whole $p \mathrm{O}_2$ range. As in the case of the undoped system, the same changes in the slope of the concentration curves are observed within the range of investigated oxygen partial pressures. The expected characteristic exponents of the power-law dependence of the polaron concentrations in donor-doped ceria, i.e., $-\frac{1}{4}$ for low, $-\frac{1}{6}$ for intermediate, and 0 for high partial pressures can be reproduced from our calculated formation energies.


## IV-G. Conductivities

Electronic conductivities $\sigma$ were calculated from the polaron concentrations in undoped ceria at various temperatures according to

$$
\sigma=|q| \cdot \mathrm{e} \cdot\left[\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right] \cdot(1-f) \cdot u
$$


Here, $u$ is the polaron mobility and $f$ the site fraction of $\mathrm{Ce}_{\mathrm{Ce}}^{\prime}$. The term $(1-f)$, which reduces the effective mobility at large polaron concentrations, accounts for the fact that in order to migrate, a polaron needs a free cerium site $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\times}\right)$ to migrate to. The conductivity thus reaches a maximum when $50 \%$ of the lattice sites are occupied in the case of negligible polaron-polaron interactions. The polaron mobility $u$ is thermally activated:

$$
u=\frac{A_0}{T} \exp \left(-\frac{E_{\mathrm{H}}}{k_{\mathrm{B}} T}\right),
$$

where $A_0$ is a preexponential factor and $E_{\mathrm{H}}$ is the activation energy of the hopping process. Tuller et al. ${ }^{24}$ experimentally determined a polaron mobility of $u=3.9 \times 10^{-3} \mathrm{~cm}^2 \mathrm{~V}^{-1} \mathrm{~s}^{-1}$ for $\mathrm{CeO}_{1.88}$ at a temperature of $T=1273 \mathrm{~K}$. With this value as a first approximation and a temperature activation of the mobility of $E_{\mathrm{H}}=0.44 \mathrm{eV},{ }^{24}$ polaron conductivities were calculated and were compared with conductivities found experimentally by Stratton et al. ${ }^{37}$ and Tuller et al. ${ }^{25}$ (see Fig. 8). As the mobility of electrons is much larger than the mobility of ionic defects, the conductivity measured experimentally is predominantly electronic.


### 1. Pure ceria

Since the calculated polaron concentrations are too high for the above-mentioned reasons, the conductivities are expected to lie above the experimental values as well. A comparison of our predicted data (see Fig. 8) with experimental data (see Fig. 1 of Ref. 25) shows that this is indeed the case for undoped ceria. The calculated conductivities are one to two orders of magnitude larger than the experimentally found conductivities. The dotted lines in Fig. 8 show the conductivities calculated with Fermi-Dirac statistics. At large temperatures and low oxygen partial pressures, the curves calculated with Fermi-Dirac statistics deviate from the curves calculated with Boltzmann statistics. In this case, the model of dilute defects is no longer valid. Since the method of determining defect formation energies and concentrations employed in this work is based on the model of dilute defects, the calculated data are only valid where Boltzmann and Fermi-Dirac yield the same results. In this regime, which is denoted by the thick lines in Fig. 8, the experimental and calculated data qualitatively agree well, in particular the slopes of the $p \mathrm{O}_2$ dependence. 

The changes of the exponent of the power-law dependence on the oxygen partial pressure observed for the polaron concentrations also show in the conductivity curves (see Fig. 8). The slope of the conductivity curves changes from $-\frac{1}{6}$ in the $p \mathrm{O}_2$ regime where the polarons are compensated by doubly charged oxygen vacancies to $-\frac{1}{4}$ in the regime where the polarons are compensated by singly charged vacancies. The slope of the calculated conductivities reaches a value of -0.164 in the $p \mathrm{O}_2$ region of charge compensation by doubly charged oxygen vacancies and -0.213 in the regime of charge compensation by singly charged oxygen vacancies. The slopes are smaller than the expected slopes because of the reduced polaron mobility at large polaron concentrations due to the factor $(1-f)$ in Eq. (21). This factor is also responsible for the observed maximum in the conductivity curves.

The solid (Maxwell-Boltzmann) and dotted lines (FermiDirac) end for the same temperature at different partial pressures, which is due to the fact that for very high Fermi energies (low $p \mathrm{O}_2$ ), the Boltzmann concentrations become unphysical and the charge neutrality condition can no longer be fulfilled. This problem, however, occurs way beyond the regime of dilute defects, so it does not alter any conclusions drawn in this paper.


### 2. Donor-doped ceria

Figure 9 shows the calculated polaron conductivities of 1000 ppm donor-doped ceria at various temperatures. (Experimental data for comparison is shown in Fig. 2 of Ref. 37 and refers to conductivities measured for $0.1 \% \mathrm{U}$-doped ceria.) The slopes in the conductivity curves found experimentally by Stratton et al. ${ }^{37}$ are reproduced well by the calculated curves. We also see three different regimes: In regime I, the slope is $-\frac{1}{4}$ where the polarons are charge compensated by singly charged oxygen vacancies. In regime II, where the polarons are compensated with doubly charged oxygen vacancies, the slope is $-\frac{1}{6}$. In regime III, the polaron concentration is fixed by the donor concentration.

As observed in the undoped case, due to the high polaron concentrations and the reduced polaron mobilities, the values of the slopes tend to be slightly smaller than the slopes of the concentration curves. In regime I, the slope is -0.162 instead of the expected value of $-\frac{1}{6} \approx-0.167$. In regime II, the slope is -0.228 instead of the expected slope of $-\frac{1}{4}$. As in the undoped system, we observe numerical problems due to unphysical Boltzmann concentrations. But they do not play any role for the reasons already mentioned above.

Overall, there is very good qualitative agreement with experiment as long as the defects can be considered to be dilute, which is the basic assumption for the calculation of our defect formation energies. This is achieved only due to the inclusion of the formation energies of oxygen vacancies in different charge states, or to be more precise, by explicitly calculating not only $\mathrm{V}_{\mathrm{O}}^{\prime \prime}$ but also $\left(\mathrm{V}_{\mathrm{O}}^{\ddot{ }}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)$ and $\left(\mathrm{Ce}_{\mathrm{Ce}}^{\prime}-\mathrm{V}_{\mathrm{O}}^{\ddot{\circ}}-\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right)^{\times}$.


# V. CONCLUSION

We calculated the formation energies of all intrinsic point defects in ceria using the GGA $+U$ functional. In particular, we determined the formation energy of a polaron and of associates of polarons with the doubly charged oxygen vacancy $\mathrm{V}_{\mathrm{o}}$. We found that these associates are energetically favored with respect to ordinary $\mathrm{V}_{\mathrm{O}}$ and $\mathrm{V}_{\mathrm{O}}^{\times}$. Reduction and hydration energies have been computed and both show good agreement with experiment. We also calculated defect concentrations and conductivities, which show the characteristic slopes of the polaron concentration $\left[\mathrm{Ce}_{\mathrm{Ce}}^{\prime}\right]$ for undoped ( $-\frac{1}{4}$ and $-\frac{1}{6}$ ) and donor-doped $\left(-\frac{1}{4},-\frac{1}{6}\right.$, and 0$) \mathrm{CeO}_2$. These changes of slopes, which are also found experimentally, are due to the different charge states of the oxygen vacancy.
