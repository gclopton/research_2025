# "Thermal Spike" model applied to thin targets irradiated with swift heavy ion beams at few MeV/u 

Christelle Stodel ${ }^{1, *}$, Marcel Toulemonde ${ }^{2}$, Christoph Fransen ${ }^{3}$, Bertrand Jacquot ${ }^{1}$, Emmanuel Clément ${ }^{1}$, Georges Frémont ${ }^{1}$, Matthieu Michel ${ }^{1}$ and Christian Dufour ${ }^{4}$<br>${ }^{1}$ Grand Accélérateur National d'Ions Lourds (GANIL), CNRS/CEA, Bvd Henri Becquerel, BP 55027, 14076 Caen CEDEX 5, France<br>${ }^{2}$ Centre de Recherche sur les Ions, les Matériaux et la Photonique (CIMAP), Bvd Henri Becquerel, BP 5133, 14070 Caen CEDEX 4, France<br>${ }^{3}$ Institut für Kernphysik, Universität zu Köln, Zülpicher Strasse 77, 50937 Köln, Germany<br>${ }^{4}$ Centre de Recherche sur les Ions, les Matériaux et la Photonique (CIMAP), 6 Bvd du Maréchal Juin, 14050 Caen CEDEX 4, France


#### Abstract

High electronic excitations in radiation of metallic targets with swift heavy ion beams at the coulomb barrier play a dominant role in the damaging processes of some metals. The inelastic thermal spike model was developed to describe tracks in materials and is applied in this paper to some systems beams/targets employed recently in some nuclear physics experiments. Taking into account the experimental conditions and the approved electron-phonon coupling factors, the results of the calculation enable to interpret the observation of the fast deformation of some targets.


## 1 Introduction

In nuclear physics, structural evolution of nuclei when moving (far) away from magic numbers [1] remains intriguing in many aspects. It is not well theoretically reproduced so far by state-of-the-art models. High resolution spectroscopic data reveal this nuclear structure evolution as a function of spin, angular momentum, excitation energy and isospin. Their comparison with advanced nuclear model allow a microscopically description of these evolutions.

High resolution gamma-ray spectroscopy sheds light to the nuclear structure by measuring energy of excited states, their decay branching ratios and their lifetime. The Recoil Doppler Distance-Shift (RDDS) technique is an outstanding method to extract the lifetimes of the states of interest to deduce absolute transition strengths that are essential to test theoretical approaches. Here we discuss target problems in measurements using a so-called plunger device for half-life measurements using the RDDS technique [2] combined with the VAMOS++ spectrometer and the tracking germanium detector array AGATA (Fig. 1).

In these recent studies, exotic (i.e. neutron deficient or neutron rich) nuclei of interest were produced in inverse kinematics either by deep inelastic or by fusion-fission and fusion-evaporation reaction using heavy ion beams around the Coulomb barrier.

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-1_611_807_1356_1069.jpg)
Fig. 1. The Plunger set-up in the AGATA-VAMOS vacuum chamber.

Contrary to previous experiments using a similar setup but exploring other nuclei produced in direct kinematics, it was observed that some targets were slightly or seriously deformed even at very low heavy ion beam current ( $<1 \mathrm{pnA}$ ). Unfortunately, this shape change is at the detriment of the quality of measurements: the distance between the plunger target and a plunger degrader foil used to slow down the recoils should be known and constant with a precision of better than $1 \mu \mathrm{~m}$ but the wrinkles height of the material was observed to be of the order of $100 \mu \mathrm{~m}$, see Fig. 2.

[^0]![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-2_890_565_238_310.jpg)
Fig. 2. upper: Titanium target mounted on the plunger set-up after irradiation; lower: scanning electron microscope (electron $20 \mathrm{kV})$ photograph of the target with magnification *17.

Several causes were then questioned in order to explain the observations. Indeed, the damage can originate from:

- Mechanical stress induced by the fabrication process or the method of stretching and fixation on the frame.
- Chemical reaction with air in the time between fabrication and irradiation under vacuum, some material can oxidize easily and become fragile.
- Interaction with another material in the case of a backing.
- Irradiation inducing heating, phase change or damage of the material.
The last three causes can modify the properties of the material to unexpected values of some parameters (elasticity, conductivity, melting temperature, ...) which may make the target delicate to sustain the beams.

In plunger systems, the targets undergo exceptional mechanical strain because they have to be stretched and fixed over a small solid cone. This requirement was verified and qualified before irradiation. But as observed on Fig. 2, the rolling method used to manufacture the target might have induced during irradiation a preferential direction of the wrinkle-like structures of the Ti targets.

In all cases studied, the target temperature at thermodynamically equilibrium were calculated by taking into account the properties of the beam (energy, intensity, spot size) and the target material (emissivity, thermal conductance, thickness). This temperature was estimated considering cooling by radiation and conduction. The values obtained were lower than the fusion temperature of the material reported in literature.

Then the damage formation resulting from a nanometric, dense and shortly created electronic excitation in the material, was investigated using the Inelastic Thermal Spike model (i-TS) [3-6].

Indeed, the passage of a fast ion through a foil creates a "heat spike" along its path, in which the temperature may be briefly extremely high, even if the average temperature of the foil remains low. Within this model, this paper reports on the temperature distribution in time along the beam track calculated for the different projectile/target systems under consideration. The results of the model are compared to the temperature needed for the material to reach the melt phase when the track formation appears in the material.

## 2 "Thermal Spike" model

### 2.1 Description

The i-TS model is one of the most powerful tool to describe damage induced by swift heavy ions and is most widely applied to any target material either metallic, semiconductor or insulators.

The model reproduces the electronic excitation of the material through a four step process: first, the incident ions transfer their energy to the electrons of the target by ion-electron collisions. Second, electron-electron collisions share this energy with other cold electrons. Third, the energy is transferred to the lattice by electronphonon coupling. Forth, the energy dissipates among the atoms. This process induces a spike along the ion trajectory. Regarding the timeline, illustrated on figure 2.1 from [7], the energy is deposited in the electrons within $10^{-16}$ to $10^{-15} \mathrm{~s}$ and then transferred to the lattice atoms within $10^{-13}$ to $10^{-11} \mathrm{~s}$.

Mathematically this model is based on specific solutions of two coupled differential equations (1) and (2) governing the heat diffusion to the electrons and atomic subsystems versus time $t$ and space $r$ (in cylindrical geometry) and their exchange via the electron-phonon coupling:

$$
\begin{aligned}
C_{e}\left(T_{e}\right) \frac{\partial T_{e}}{\partial t} & =\frac{1}{r} \frac{\partial\left[r K_{e}\left(T_{e}\right) \frac{\partial T_{e}}{\partial r}\right]}{\partial r}-g\left(T_{e}-T_{a}\right)+A(r) \\
C_{a}\left(T_{a}\right) \frac{\partial T_{a}}{\partial t} & =\frac{1}{r} \frac{\partial\left[r K_{a}\left(T_{a}\right) \frac{\partial T_{a}}{\partial r}\right]}{\partial r}+g\left(T_{e}-T_{a}\right)
\end{aligned}
$$

In these equations, the parameters $T_{e, a}(r, t), C_{e, a}(r, t)$ and $K_{e, a}(r, t)$ are the temperature, specific heat and thermal conductivity of the electronic (e) and atomic (a) subsystem, respectively. $A(r)$ is the energy deposited into the electronic subsystem supplied by the incident ion by ballistic collisions at radius $r$. The integration of $A(r)$ over space gives the total stopping power $d E / d x$. The only free parameter in this model is the electron-phonon coupling strength $g$.

Due to the very short time of energy deposition ( $10^{-13}-10^{-12} \mathrm{~s}$ ), the model calculations are performed within a superheating scenario [8], i.e. that increase of temperature does not stop when reaching the melting or the boiling temperature.

The track radii are associated with the cylinder in which the energy deposited on the atoms surpasses a specific energy. This limit, $E_{S H}$, is defined as the energy
to reach the melting temperature, $E_{\text {fus }}$, plus the energy required to make the solid-liquid phase change (latent heat of fusion, $E_{\text {lat }}$ ). This criterium is used since the superheating scenario of the target is the result of a very rapid heating stage ( $\approx 10^{-13} \mathrm{~s}$ ) [7]. As heat capacity of a material is a function of its internal energy and temperature (equation (3)), the $T_{S H}$ temperature is deduced from the integration of the specific heat from $T_{0}=0 K$ to $T_{S H}$ which equals the $E_{S H}$ energy.

$$
C_{a}=\frac{d E}{d T}
$$

### 2.2 Application to experiments

### 2.2.1 Experimental conditions

The experiments were performed at GANIL using heavy ion beams around Coulomb barrier energy impinging on targets as listed in Table 1.

Cases 1, 2 and 3 correspond to experiments using the plunger device mounted in the VAMOS target chamber at an angle of $45^{\circ}$ with respect the beam axis. A magnesium degrader slows down the recoiling nuclei produced in the first target placed at an adjustable distance downstream. The first targets were self-supporting and manufactured by rolling. In case 2, a layer of copper was evaporated on the titanium in order to increase its thermal conductivity. The copper layer was facing the beam.

These systems are compared to cases 4 and 5 using either a similar target (Ni) in direct kinematics with a "light" ion beam ( ${ }^{50} \mathrm{Cr}$ ) or a target of ${ }^{54} \mathrm{Fe}$ irradiated with a heavy ion ${ }^{124} \mathrm{Xe}$ beam at comparable velocities.

In case 4, a gold foil was used to slow down the beam before reacting in the nickel target.

In case 5, iron was evaporated on a thin carbon layer, four targets were irradiated and revealed various behaviour.

The effective material thicknesses are given taking into account the angle of the target with respect to the incoming beam ( $45^{\circ}$ in cases 1,2 and 3 and $0^{\circ}$ for cases 4 and 5).

Table 1. Experimental properties of the beam (energy and intensity) and targets (effective thickness).
| Experiment 1: <br> ${ }^{238} \mathrm{U}^{32+}(6.2 \mathrm{MeV} / \mathrm{u} ; 1 \mathrm{pnA})+{ }^{64} \mathrm{Ni}\left(2.6 \mathrm{mg} / \mathrm{cm}^{2}\right)$ $+{ }^{\text {nat }} \mathrm{Mg}\left(5.2 \mathrm{mg} / \mathrm{cm}^{2}\right)$ <br> No problem of target, Mg degrader slightly deformed |
| :--- |
| Experiment 2: <br> ${ }^{238} \mathrm{U}^{32+}(6.76 \mathrm{MeV} / \mathrm{u} ; 0.1 \mathrm{pnA})+\mathrm{Cu}^{-50} \mathrm{Ti}\left(0.6-2.1 \mathrm{mg} / \mathrm{cm}^{2}\right) +{ }^{\text {nat }} \mathrm{Mg}\left(4.5 \mathrm{mg} / \mathrm{cm}^{2}\right)$ <br> Target seriously deformed quickly $\mathrm{I}_{\max }=3 \mathrm{nAe}=0.1 \mathrm{pnA}$ |
| Experiment 3: $\begin{gathered} { }^{238} \mathrm{U}^{32+}(6.76 \mathrm{MeV} / \mathrm{u} ; 0.07 \mathrm{pnA})+{ }^{50} \mathrm{Ti}\left(2.1 \mathrm{mg} / \mathrm{cm}^{2}\right) \\ +{ }^{\text {nat }} \mathrm{Mg}\left(4.5 \mathrm{mg} / \mathrm{cm}^{2}\right) \end{gathered}$ <br> Target seriously deformed quickly $\mathrm{I}_{\text {max }}=2 \mathrm{nAe}=0.07 \mathrm{pnA}$ |
| Experiment 4: $\begin{aligned} { }^{50} \mathrm{Cr}^{8+}(4 \mathrm{MeV} / \mathrm{u} ; 10 \mathrm{pnA}) & +\mathrm{Au}\left(2.4 \mathrm{mg} / \mathrm{cm}^{2}\right) \\ & +{ }^{58} \mathrm{Ni}\left(7-10 \mathrm{mg} / \mathrm{cm}^{2}\right) \end{aligned}$ <br> No problem at 30 nAe |


```
Experiment 5:
${ }^{124} \mathrm{Xe}^{39+}(4 \mathrm{MeV} / \mathrm{u} ; 1 \mathrm{pnA})+\mathrm{C}-{ }^{54} \mathrm{Fe}\left(0.03-0.2 \mathrm{mg} / \mathrm{cm}^{2}\right)$
3 targets have broken below 6 nAe and 1 sustained up to 80
nAe
```


### 2.2.2 Inputs of the $i$-TS calculations

The initial temperature at equilibrium ( $T_{e q}$ in Table 2) of the target is determined by the beam intensity, energy and spot size. It was calculated considering cooling by radiation and conduction through the target holder. The external surfaces radiate towards a black body at room temperature and if necessary, the mutual radiation between two closed targets were considered. The range of temperature is estimated with a beam spot represented by a Gaussian distribution with $\sigma=1 \mathrm{~mm}$ and emissivity values ranging from 0.1 to 0.9 [9-10].

The measured thermal conductivity ( $\mathrm{K}_{\mathrm{s}}$ ) of a metal corresponds to the electron conductivity taking into account all the properties of the electron gas. Consequently, using $\mathrm{K}_{\mathrm{s}}$ as the input of the metal thermal conductivity, the value of the g factor should be near to the one calculated with a number of electrons equal to the number of atoms [5].

The value of $g$ was determined by fitting the track size confirming the validity of this hypothesis, apart for Ti for which the g factor is twice larger than the expected one. Then the electron-phonon coupling factors g are from [5] and were confirmed or adjusted from detailed study of experimental sputtering yields in nickel [6], titanium [11], and iron [11] materials.

Table 2. Parameters of the materials for the i-TS simulations.
| Material experiment | dP [mwatts] | $\mathbf{T}_{\text {eq }}$ [K] | DE/dx [keV/Å] |
| :--- | :--- | :--- | :--- |
| Mg |  |  |  |
| 1 | 540 | $850 \pm 100$ | 1.9 |
| 2/3 | 48 | $500 \pm 100$ | 1.9 |
| Ni |  |  |  |
| 1 | 200 | $850 \pm 100$ | 7.8 |
| 4 | 1700 | $1150 \pm 100$ | 1.5 |
| Cu |  |  |  |
| 2 | 4 | $500 \pm 100$ | 7.2 |
| Ti |  |  |  |
| 2/3 | 18 | $450 \pm 100$ | 4 |
| Au |  |  |  |
| 4 | 250 | $750 \pm 100$ | 2 |
| Fe |  |  |  |
| 5 | 10 | $450 \pm 50$ | 4 |


| Material | $\mathbf{g}^{*} \mathbf{1 0}^{\mathbf{1 0}}$ <br> $\left[\mathbf{W} / \mathbf{c m}^{\mathbf{3}} / \mathbf{K}\right]$ | $\mathbf{n} \mathbf{1 0}^{\mathbf{2 2}}$ <br> $\left[\boldsymbol{e} / \mathbf{c m}^{\mathbf{3}}\right]$ |
| :--- | :--- | :--- |
| $\mathbf{M g}$ | $16.8[5]$ | $4.3[5]$ |
| $\mathbf{N i}$ | $107[5-6]$ | $9.14[5-6]$ |
| $\mathbf{C u}$ | $12.7[5]$ | $8.5[5]$ |
| $\mathbf{T i}$ | $1000[11]$ | $5.7[5]$ |
| $\mathbf{A u}$ | $2.3[5]$ | $5.9[5]$ |
| $\mathbf{F e}$ | $119[11,5]$ | $8.9[5]$ |

The thermodynamically temperature at equilibrium was well below the fusion temperature of the material for all experiments except for the first one ( Mg ) where it could have been close.

### 2.2.3 Results

For comparison, the simulations with i-TS model were done at 300 K and some temperatures around $T_{e q}$ reported in Table 2 in all cases.

The results of the calculations are given in Fig. 3 to Fig. 8 where the lattice temperatures are plotted versus time along ion path. The temperatures are represented by full, dashed and dashed-dotted lines for the initial temperature of the material of 300 K , mean $\mathrm{T}_{\mathrm{eq}}$ (written in bold and underlined) and $T_{e q} \pm 100$ respectively.

The limit temperature ( $T_{S H}$ ) corresponds to the energy necessary to melt the material defined as the melting temperature plus the corresponding latent heat of fusion, their values are reported in Table 3 and plotted in the figures where they could be reached together with the corresponding fusion temperature.

Table 3. "Super-Heating" and fusion temperatures $[\mathrm{K}]$ of materials.
|  | $\mathbf{M g}$ | $\mathbf{N i}$ | $\mathbf{C u}$ | $\mathbf{T i}$ | $\mathbf{A u}$ | $\mathbf{F e}$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $\mathbf{T}_{\mathbf{S H}}$ | 1260 | 2250 | 1900 | 2580 | 1790 | 2180 |
| $\mathbf{T}_{\text {fus }}$ | 923 | 1728 | 1358 | 1941 | 1337 | 1811 |


![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-4_501_689_1462_228.jpg)
Fig. 3. Evolution of the lattice temperature of the Mg degrader as a function of time along the ion path for cases 1,2 and 3 (filled in grey).

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-4_1013_698_260_1128.jpg)
Fig. 4. Evolution of the lattice temperature of the Ni target as a function of time along the ion path for cases 1 (upper) and 4 (lower).

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-4_497_691_1452_1103.jpg)
Fig. 5. Evolution of the lattice temperature of the Cu target as a function of time along the ion path for cases 2.

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-5_502_698_296_219.jpg)
Fig. 6. Evolution of the la8.5ttice temperature of the Ti target as a function of time along the ion path for cases 2 and 3.

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-5_499_689_950_228.jpg)
Fig. 7. Evolution of the lattice temperature of the Au target as a function of time along the ion path for cases 4.

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-5_505_695_1599_226.jpg)
Fig. 8. Evolution of the lattice temperature of the Fe target as a function of time along the ion path for cases 5.

## 3 Discussion

The temperature distributions over time for the different systems show various features.

First the temperature is maximum at a different time according to the material, in the ranges $\left[10^{-14}-10^{-13} \mathrm{~s}\right]$, $\left[10^{-13}-10^{-12} \mathrm{~s}\right]$ or $\left[10^{-12}-10^{-11} \mathrm{~s}\right]$ for Ti , " $\mathrm{Fe}, \mathrm{Au}, \mathrm{Mg}, \mathrm{Ni}$ " or Cu respectively. This tendency is directly linked to the electron-phonon strength: the larger it is, the smaller are the heating and cooling times.

Secondly, the temperature rise varies according to either the material or the initial conditions. It ranges from $\approx 65 \mathrm{~K}$ for Au (Fig. 7) (or $\approx 300 \mathrm{~K}$ for Mg (Fig. 3), $\approx 450 \mathrm{~K}$ for Cu (Fig. 5)) to $\approx 8700 \mathrm{~K}$ for Ti (Fig. 6) and for Ni targets from $\approx 560 \mathrm{~K}$ in experiment 4 (Fig. 4 lower) to $\approx 1880 \mathrm{~K}$ in experiment 1 (Fig. 4 upper).

In experiment 4, the nickel and gold targets did not show any damage, and the model shows that the temperature increase due to spike did not reach the limit temperature ( $\mathrm{T}_{\mathrm{SH}}$ ).

Compared to the first experiment, where the electronic stopping power of the Ni target was higher ( $7.8 \mathrm{keV} / \mathrm{A}$ ), its temperature increase could have influenced the Mg degrader temperature at equilibrium above the fusion temperature, explaining that it was slightly deformed as observed.

In the second experiment, the temperature distribution of the copper material (Fig. 5) is well below its limit temperature, by contrast with the titanium response to the spike where $\mathrm{T}_{\mathrm{SH}}$ is reached fast, what could explain the rapidly degradation of the targets ( Ti alone or Ti with Cu evaporated) at very low beam intensity.

As explained in [12] and regarding Fig. 9 for Ti targets, the latent track radius, defined as the radius of a cylinder of matter in which the energy necessary to melt is exceeded, is calculated to be about 8 nm . This value is in accordance with the one measured in [13] and calculated in [11] at $\mathrm{dE} / \mathrm{dx}=40 \mathrm{keV} / \mathrm{nm}$. The radius of 8 nm corresponds to a fluence of $1.2^{*} 10^{12}$ particle per $\mathrm{cm}^{2}$ inducing a first modification of the material, in other words before overlapping of spikes. This fluence is reached within 1 to 16 minutes with a beam of 0.1 pnA and a spot radius of 1 to 4 mm . Track overlapping can induce phase change in the titanium [14] which can affect drastically the target stability.

![](./images/b77cecc0-4084-4bd4-8a4c-0600dc7737b7-5_554_764_1690_1087.jpg)
Fig. 9. Temperature distribution of the Ti target as calculated with the Thermal Spike Model.

The temperature rise is pronounced for $\mathrm{Fe}(\approx 1800 \mathrm{~K}$, Fig. 8), and the higher value is near $\mathrm{T}_{\mathrm{SH}}$ independent of the initial temperatures. However, the four iron targets used did not behave similarly under irradiation, one of them could sustain the beam up to an intensity of 80 nAe , the other ones broke at low intensity and within few hours. Apart from the potential "thermal spike" effect, one can speculate that other contributions to the damage of targets
originates from the carbon/iron interface (carbon used as a backing) because of their different thermal expansion coefficients and/or the high sensitivity of iron to oxidation when it was on air before irradiation.

## 4 Conclusion

The thermal spike model, applied to some projectiletarget combinations allows to understand that some metallic targets were deformed due to a fast and local temperature increase while others were insensitive. The model enables to predict reliably the sensitivity of targets to the electronic slowing down of heavy ion by considering fundamental parameters such as the energy loss and the electron-phonon coupling factor determined by some sputtering yields experimental studies. Preliminary estimations with this model prior to experiments will help to adjust some parameters, i.e. the beam energy and target material to prevent the damages.

## References

1. B. A. Brown, Prog. Part. and Nucl. Phys. 47, 517 (2001)
2. A. Dewald, O. Möller and P. Petkov, Progr. Part. and Nucl. Instr. Meth. A 67, 786 (2012)
3. C. Dufour, A. Audouard, F. Beneu, J. Dural, J. P. Girard, A. Hairie, M. Levalois, E. Paumier, M. Toulemonde, J. Phys. Condens. Matter 5, 4573 (1993).
4. M. Toulemonde, C. Dufour, A. Meftah, E. Paumier, Nucl. Instr. Meth. B 166-167, 903 (2000)
5 . Z. G. Wang, C. Dufour, E. Paumier, M. Toulemonde, J. Phys. Condens. Matter 6, 6733 (1994)
5. C. Dufour, Z. G. Wang, E. Paumier, M. Toulemonde, Bull. Matter. Sci. 22, 671 (1999)
6. C. Dufour, M. Toulemonde, Ion Beam Modification of Solids (Springer Ser. Surf. Sci. 61, 63, 2016)
7. W. Assmann, M. Toulemonde, C. Trautmann, Topics Appl. Phys. 110, 401 (2007)
8. M. Michel, note STP 570A, GANIL, Caen, 2016.
9. M. Michel, note STP 573A, GANIL, Caen, 2014.
10. M. Toulemonde, W. Assmann, C. Dufour, A. Meftah, C. Trautmann, Nucl. Instr. and Meth. B 277, 28 (2012)
11. M. Toulemonde, C. Dufour, Z. Wang, E. Paumier, Nucl. Instr. and Meth. B 112, 26 (1996)
12. H. Dammak, D. Lesueur, A. Dunlop, P. Legrand, J. Morillo, Radiat. Eff. Defects Solids 126, 111 (1993)
13. M. Angiolini, H. Dammak, A. Dunlop, Philosophical Magazine Letters 82, 81-89 (2002)

[^0]:    * Corresponding author: stodel@ganil.fr

