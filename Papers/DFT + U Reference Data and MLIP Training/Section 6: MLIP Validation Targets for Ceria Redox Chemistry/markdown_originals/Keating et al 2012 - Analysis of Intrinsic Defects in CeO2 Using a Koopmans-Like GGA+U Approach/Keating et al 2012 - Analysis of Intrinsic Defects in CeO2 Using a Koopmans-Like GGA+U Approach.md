# Analysis of Intrinsic Defects in CeO2 Using a Koopmans-Like GGA+U Approach

**Authors:** Patrick R. L. Keating; David O. Scanlon; Benjamin J. Morgan; Natasha M. Galea; Graeme W. Watson

**Venue:** The Journal of Physical Chemistry C 116, 2443-2452 (2012)

**DOI / identifier:** 10.1021/jp2080034

**Conversion note:** Generated from the downloaded PDF using PyMuPDF text extraction on 2026-08-17. Figures and equations may require checking against the PDF.


---

## Page 1

Published:
December 15, 2011
r 2011 American Chemical Society
2443
dx.doi.org/10.1021/jp2080034 | J. Phys. Chem. C 2012, 116, 2443–2452
ARTICLE
pubs.acs.org/JPCC
Analysis of Intrinsic Defects in CeO2 Using a Koopmans-Like
GGA+U Approach
Patrick R. L. Keating, David O. Scanlon,* Benjamin J. Morgan,† Natasha M. Galea,‡ and Graeme W. Watson*
School of Chemistry and CRANN, Trinity College Dublin, Dublin 2, Ireland
’INTRODUCTION
In the area of environmentally friendly technologies, CeO2
has emerged as an important material with many applications
such as catalysis,1 solid oxide fuel cells,2 and gas sensors.3 CeO2 is
eﬀective as a catalyst47 and as a support for other catalysts.1,811
This is due to the high thermal stability, self-decoking properties
(which prevent poisoning of the catalyst),12,13 and high oxygen
storage capacity (OSC) of CeO2. OSC refers to the ability of
CeO2 to release oxygen under reducing conditions and absorb
oxygen under oxidizing conditions,1416 which is a result of the
comparative ease of oxygen vacancy formation in CeO2.17,18 The
ability of CeO2 to simultaneously catalyze oxidation and reduc-
tion reactions, e.g., the conversion of CO and NO2/NO to CO2
and NO/N2, respectively, has been investigated through experi-
mental47 and theoretical studies.1924 Oxygen released from
CeO2 will oxidize CO, and the resulting oxygen vacancies can
then act as adsorption sites for NO2/NO, leading to reduction of
these molecules and reoxidizing CeO2. CeO2 catalysts have also
been shown to be useful for the oxidation of hydrocarbons2527
and for the watergas-shift reaction9 where they supply a steady
stream of oxygen to catalyze the reactions. Zhou et al. found that
nanoscale CeO2, which exposes the more reducible {100} and
{110} surfaces, has increased catalytic activity,7 demonstrating
the importance of oxygen vacancy formation with respect to
catalysis. While these examples deal with oxygen vacancies on the
surface, oxygen vacancy formation in the bulk plays an important
role by facilitating the transport of oxygen ions to or from the
surface.25
CeO2 is also a promising material for the electrolyte in inter-
mediate temperature (≈5001000 K) solid oxide fuel cells.28 It
is generally considered that the intrinsic ionic conductivity is a
result of oxygen vacancies, but work on other materials with the
ﬂourite structure has suggested that Frenkel defects could also
contribute.29 However, stoichiometric CeO2 is a poor ionic con-
ductor, displaying a conductivity of around 3.13  103 S cm1,
due to a low concentration of oxygen vacancies at intermediate
temperatures.30 Previous studies have shown that conductivity
can be greatly increased by the introduction of dopants to create
charge compensating oxygen vacancies, which can act as a path-
way for ionic diﬀusion.3143 The dopants that lead to the highest
increase in ionic conductivity in CeO2 are Gd and Sm.3234,37,41
It has been suggested that this is because the ionic radius of these
dopants closely matches the ionic radius of the cerium ions,
causing little deformation of the host lattice.44 Another method
that increases ionic conductivity is codoping CeO2,38,39,4550
where the dopants are chosen so that one will expand the crystal
lattice while the other will contract it, and thus the two distor-
tions cancel.
A controversial subject is the ferromagnetic (FM) behavior
that has been observed in normally nonmagnetic oxides, includ-
ing CeO2, when they are synthesized as thin ﬁlms or nano-
particles.5153 This unexpected behavior was ﬁrst observed in
thin ﬁlms of HfO2,51 but a subsequent paper claimed that this was
caused by contamination of the samples.52 Further studies have
reported FM behavior in thin ﬁlms of TiO2 and In2O3
54 and
nanoparticles of Al2O3, ZnO, SnO2, In2O3, and CeO2,53 suggest-
ing that ferromagnetism is an intrinsic property of many nano-
sized metal oxides.
Since FM behavior appears to be an intrinsic property, a
number of native defects have been suggested as the cause of the
apparent ferromagnetism in CeO2. It is thought that the two
electrons localized on cerium ions after the removal of an oxygen
Received:
August 19, 2011
Revised:
December 13, 2011
ABSTRACT: We have investigated the formation of intrinsic defects in CeO2
using density functional theory with the generalized gradient approximation
(GGA) corrected for on-site Coulombic interactions (GGA+U). We employed
an ab initio ﬁtting procedure to determine a U{O2p} value that satisﬁes a Koopmans-
like condition and obtained a value of U{O2p} = 5.5 eV. We subsequently demon-
strated that by applying GGA+U to the O2p states, in addition to the Ce4f states, we
were able to model localized holes in addition to localized electrons, thus improving
the description of p-type defects in CeO2. Our results show that under oxygen-poor
conditions the defects with the lowest formation energy are oxygen vacancies, while
oxygen interstitials, which form peroxide ions, will be more favorable under oxygen-
rich conditions. We carried out temperature and pressure dependence analyses to determine the relative abundance of intrinsic defects
under real-worldconditionsanddeterminedthatoxygenvacancieswillalwaysbethe dominantdefect. Furthermore, wedeterminedthatat
the dilute limit none of the defects studied can account for the intrinsic ferromagnetism that has been observed in nanosized CeO2.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 2

2444
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
could be the cause55,56 especially when these are present on the
surface.57 Experimental58 and theoretical59 studies have, however,
indicated that oxygen vacancies are unlikely to be the cause of the
FM behavior. Recent studies on CeO2 surfaces have claimed that it
is not the concentration of surface oxygen vacancies but the ratio of
Ce3+/Ce4+ ions on the surface that determines ferromagnetism in
CeO2.60,61
Another possible source of FM behavior that has been sug-
gested is cerium vacancies.58,56 While these can potentially induce
a greater magnetic moment in CeO2 when compared to oxygen
vacancies, previous work has suggested that the concentration of
cerium vacancies would be very low, due to a high formation
energy, and therefore unlikely to account for ferromagnetism.62,63
In the area of intrinsic defects, previous work has concentrated
on oxygen vacancies in CeO2, with only a handful of studies hav-
ing investigated the properties of other intrinsic defects. The only
theoretical data on cerium vacancies by Fernandes et al., using
LDA(GGA)+U calculation, predicted that these defects would
be semimetallic in nature,56 contrary to similar defects in other
metal oxides.6466 The structure of Frenkel defects has been
investigated,67,68 and their eﬀect on ionic conductivity was
investigated through molecular dynamics calculations, which
suggested that such defects are more likely to recombine than
contribute to conductivity.68 Yasunaga et al.63,69 investigated
CeO2 surfaces under electron radiation, determining that oxygen
and cerium interstitials were present, but their exact structure and
impact on the intrinsic properties of CeO2 was not investigated.
In this paper, we employ GGA calculations with on-site
Coulomb correction (GGA+U) to explore the properties of
intrinsic defects within CeO2. Using a Koopmans-like approach,
we determine a suitable U value for the O2p states. We provide
information on the formation energies and also the geometry and
electronic structure of each defect. Defect concentrations are
then assessed as a function of temperature and oxygen partial
pressure.
’METHODS
Calculations were carried out with the Vienna Ab-initio
Simulation Package (VASP),7072 using the Projector Augmen-
ted Wave (PAW)73 implementation with GGA-PBE exchange
correlation functionals.7072 The energy of the 12 atom unit cell
of CeO2 (spacegroup Fm3m) was determined at a series of
volumes using a 4  4  4 MonkhorstPack74 k-point mesh and
a 500 eV plane wave cutoﬀ. The equilibrium structure was ob-
tained by ﬁtting the series of energyvolume data to the Murnaghan
equation of state, thus obtaining the equilibrium lattice constant and
avoiding the problem of Paulay stress. All defect calculations
were based on a 2  2  2 (96 atom) expansion of the CeO2 unit
cell and were performed at a 500 eV plane wave cutoﬀwith a 2 
2  2 MonkhorstPack k-point mesh. All calculations were
deemed to be converged when the forces on each ion were less
than 0.01 eV Å1.
Standard LDA and GGA functionals are incapable of correctly
modeling systems with localized electronic defects due to the
inherent self-interaction error (SIE).7577 Skorodumova et al.
tried to describe the electronic structure of CeO2 and reduced
CeO2 by treating the cerium f states as part of the valence band
for Ce(IV) ions and as part of the core levels, disconnected from
the valence band, for Ce(III) ions.78,79 While this method was
able to provide models of stoichiometric and reduced CeO2 that
agreed with experimental observations, the results depended on a
priori knowledge of the structure of the reduced system and
therefore had no predictive power. Accurate and consistent re-
sults are obtainable by employing the LDA(GGA) + U method,80
which can approximately correct the SIE associated with LDA-
(GGA) calculations.8082 Previous theoretical work found that
the expected structure of reduced CeO2 could be reproduced by
introducing a value of U{Ce4f} = 5.0 eV.83 The U value from
diﬀerent calculations is not always directly comparable, as each
functional will have a diﬀerent SIE and each programs’ imple-
mentation of LDA(GGA)+U will diﬀer in how they determine
orbital occupations. However, subsequent studies demonstrate
that values of U{Ce4f} = 5.5,84 4.5,85 and 5.0 eV18,62,83,86,87 can
accurately model the ground state properties of pure and reduced
CeO2. Accurate descriptions of CeO2 and reduced CeO2 have
also been obtained with hybrid-DFT techniques.88,89 These
methods reduce the SIE error by introducing a ﬁxed amount of
nonlocal Fock exchange to the DFT exchange-correlation func-
tionals. In this study, we employ the GGA+U method with
U{Ce4f} = 5.0 eV, as this method will reduce the SIE without the
high computational overhead associated with hybrid-DFT in a
plane wave basis set.
Previous studies on metal oxides have shown that when
employing LDA(GGA) to model O-derived p-type defect states,
such as localized holes, it is necessary to apply an SIE correction
to the O2p states which can be accomplished using LDA(GGA)
+U.6466,76,90 Previous studies used a U{O2p} value of 7 eV,91,92
but this value was derived for MgO.76 Because we expect that
some of the defects we study may lead to the formation of
localized holes on oxygen anions, it is necessary to determine a
suitable value of U{O2p} for CeO2.
To determine the U value for the O2p, states we employed an
ab initio ﬁtting procedure used by Morgan and Watson,65 similar
to the Koopmans-like procedure developed by Lany and
Zunger.64 This method is based on the result that the energy
change of a system when an electron is added or removed should
be linear.93 For self-interaction free systems, the addition of an
electron to a hole state (with N electrons) is determined by the
condition
EðN þ 1Þ  EðNÞ ¼ eiðNÞ
ð1Þ
where E(N) is the energy of the system with a self-trapped hole
(the +1 charge state); E(N + 1) is the energy of the neutral
system with the same structure as the E(N) system; and ei(N) is
the eigenvalue of the hole state relative to the valence band
maximum (VBM). Included in the calculation of the charged
cell are two corrections: a core-level alignment, as desribed in
Scanlon et al.,94 and a MakovPayne image charge correction.95
When E(N + 1)  E(N) and ei(N) are plotted against U, we
observe that at U{O2p} = 5.5 eV the requirement of eq 1 is
satisﬁed, indicating that the SIE of the system has been overcome
(Figure 1). This suggests that the value of U{O2p} = 7 eV that
was used previously by Yeriskin and Nolan91,92 would not satisfy
eq 1 and hence would overstabilize oxygen holes in CeO2.
The defect formation energies, ΔHf(D), are calculated accord-
ing to the equation
ΔHfðDÞ ¼ ðECeO2ðDÞ  ECeO2Þ þ ∑
i
niEi þ niμi
ð2Þ
where ECeO2 and ECeO2(D) are the calculated energies of the
stoichiometric and defect supercells, respectively; ni are the
numbers of atoms of Ce and O that are added to (positive) or
removed from (negative) an external atomic reservoir; Ei are the
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 3

2445
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
elemental energies of the species (i.e., Ce(s) and O2(g)); and μi is
the chemical potential for cerium and oxygen. By varying the
chemical potentials of each species, we can model speciﬁc
equilibrium conditions within the global constraint of the cal-
culated enthalpy of the host, i.e., CeO2. When U{Ce4f} = 5.0 eV
and U{O2p} = 0 eV, hereafter denoted as UCe,O = {5.0, 0} eV, we
obtain: μCe + 2μO = ΔHf(CeO2) = 10.5 eV. The upper bound
of μO, the Ce-poor/O-rich environment, is limited by the
formation of O2(g): μO = 0 eV, μCe = 10.5 eV. The lower
bound of μO, the Ce-rich/O-poor environment, is limited by the
formation of Ce2O3: 2μCe + 3μO e ΔHf(Ce2O3) = 18.97 eV,
which yields: μO = 2.03 eV, μCe = 6.44 eV.
For calculations where U{Ce4f} = 5.0 eV and U{O2p} = 5.5 eV,
i.e., UCe,O = {5.0, 5.5} eV, the formation energies are: ΔHf-
(CeO2) = 9.67 eV and ΔHf(Ce2O3) = 17.7 eV, which sets
the chemical potentials at the Ce-poor/O-rich limit as μO = 0 eV,
μCe= 9.67 eV and at the Ce-rich/O-poor limit to μO = 1.64 eV,
μCe = 6.39 eV.
The eﬀect of temperature and pressure on the defect forma-
tion energies was estimated by considering the enthalpic and
entropic contributions to the oxygen chemical potential μO in
the O2 gas phase. The direct eﬀects of temperature and pressure
on μCe, ΔHf(CeO2), and ΔHf(Ce2O3) are neglected as these
are either small (PΔV terms) or are expected to cancel as the
vibrational frequencies of the reference materials will be relatively
insensitive to temperature (TΔSvib). However, μCe will be
aﬀected by the condition μCe + 2μO = ΔHf(CeO2). Because
we are only concerned with the change in μO, we only need to
take into account the aﬀect of the partial oxygen pressure. The
change to μO can be expressed as96
ΔμOðT, PÞ ¼ 1
2 CpðT  T0Þ

 T S0 þ Cp ln T
T0


þ kBT ln P
P0

ð3Þ
In the above equation, we used Cp = (7/2)kB for the constant-
pressure speciﬁc heat capacity per diatomic molecule, derived
from the ideal gas law, and the experimental value for the O2(g)
standard entropy, S0 = 205 J mol1 K1. The reference tem-
perature (T0) and pressure (P0) are set to 298 K and 1 atm,
respectively (standard temperature and pressure). Once the
temperature dependence of the formation energies is calculated,
it is then possible to estimate the defect concentrations as a func-
tion of temperature, assuming Arrhenius-type behavior.
’RESULTS
Bulk Properties. The lattice constant of CeO2 for UCe,O =
{5.0, 0} eV (UCe,O = {5.0, 5.5} eV) was calculated to be 5.494 Å
(5.477 Å), which is within 1.5% (1.2%) of the experimental
lattice constant of 5.41 Å.97 The CeO bond length, 2.377 Å
(2.372 Å), also agrees with the experimental bond length, being
within 1.5% (1.2%) of the recorded value of 2.343 Å.98 The band
structure was calculated for UCe,O = {5.0, 0} eV and UCe,O = {5.0,
5.5} eV, and minimal differences were observed between them
(Figure 2). The calculated band gap was found to be 2.45 eV
(2.51 eV). These values are significantly lower than the experi-
mentally determined band gap, values of which have been
reported as 2.76,99 3.31,100 and 3.60 eV.101 This is not un-
expected as GGA is well-known to underestimate band gaps
despite accurately describing the ground state properties.102 By
Figure 2. Band structure of pure CeO2 for (a) UCe,O = {5.0, 0} eV and
(b) UCe,O = {5.0, 5.5} eV. The VBM is set to 0 eV.
Figure 1. Variation of the electron addition energy, E(N + 1)  E(N)
(red line, red circles), and the hole state eigenvalue (relative to the
VBM), ei (blue line, blue squares), of the +1 charge state of CeO2, as a
function of U{O2p}. For all calculations U{Ce4f} = 5.0 eV.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 4

2446
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
integrating the PEDOS (not shown), we found that 11.8%
(12.4%) of the electrons in the valence band are associated with
Ce states, showing that there is no significant redistribution of the
electrons upon the introduction of U{O2p}.
Defect Structure. All calculations of defects in CeO2 were
carried out using both UCe,O = {5.0, 0} eV and UCe,O = {5.0,
5.5} eV. For each of the defects, we investigated several possible
structures and spin states to determine the lowest energy struc-
ture.
Oxygen Vacancy. During the formation of an oxygen vacancy,
two excess electrons are localized onto nearby Ce ions, reducing
them from Ce(IV) to Ce(III).8385,87 In Kr€ogerVink notation,
this is
Ox
O þ 2Cex
Ce f V ••
O þ 2Ce0
Ce þ 1
2 O2ðgÞ
ð4Þ
where OO
x represents a neutral oxygen on an oxygen lattice site;
CeCe
x is a neutral cerium atom on a cerium site; VO
•• is a doubly
positively charged vacancy at an oxygen lattice site; and Ce0Ce is
singly negatively charged cerium (i.e., Ce(III)) at a cerium lattice
site. The excess electrons occupy previously empty 4f states on
the Ce ions. This is supported by experimental studies, which
have found distinctive 4f peaks deep in the band gap of reduced
CeO2.14,103,104 For the calculations of an oxygen vacancy in
CeO2, the structures obtained for the two different cases when
UCe,O = {5.0, 0} eV and UCe,O = {5.0, 5.5} eV were found to be
very similar, and hence only the latter is displayed in Figure 3.
There was almost no difference in energy between the ferro-
magnetic and antiferromagnetic configurations (<0.1 meV), and
so we have only displayed the ferromagnetic configuration of the
excess electrons. The vacancy is an area of effective positive
charge, hence the eight neighboring oxygen ions move off their
lattice site toward the vacancy, while the neighboring Ce
ions move away from the vacancy. For calculations where
UCe,O = {5.0, 0} eV (UCe,O = {5.0, 5.5} eV), the neighboring
oxygen which is only coordinated to Ce(IV) ions moves by
0.22 Å (0.30 Å), the oxygen ion bridging the two Ce(III) ions by
0.04 Å (0.03 Å), and the four oxygens which are coordinated to
Figure 3. (a) Structure with spin-density plot and (b) the density of
states of an oxygen vacancy in CeO2 with UCe,O = {5.0, 5.5} eV. Cerium
atoms are represented by white spheres; oxygen atoms are represented
by red spheres; and the position of the vacancy is represented by the light
green sphere. The isosurface is shown in blue and is set to 0.05 e/Å3.
For the density of states, the Ce4f states are represented by green lines,
and the O2p states are represented by red lines. All other states are shown
in gray.
Figure 4. (a) Full simulation cell and (b) the local structure of a cerium
interstitial with a partial charge-density plot of the defect peaks and (c)
density of states of a cerium interstitial in CeO2 when UCe,O = {5.0, 5.5}
eV. The cerium interstitial is represented by the black sphere; the blue
isosurface represents the spin-up electrons; and the green isosurface
represents the spin-down electrons. The isosurfaces are set to 0.05 e/Å3.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 5

2447
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
one Ce(III) ion by 0.19 Å (0.12 Å), all toward the vacancy. The
two Ce(III) ions move 0.09 Å (0.13 Å), whereas the Ce(IV) ions
move a distance of 0.16 Å (0.18 Å). The variation in the relaxa-
tion of the oxygen ions can be related to the Ce(III) ions being less
positive than the Ce(IV) ions, leading to a longer Ce(III)O bond.
Figure 3(b) shows the electronic density of states (EDOS) for
an oxygen vacancy in CeO2, with a ferromagnetic arrangement of
electrons, when UCe,O = {5.0, 5.5} eV (the diﬀerences for results
with UCe,O = {5.0, 0} eV were negligible). We can see that between
the O2p dominated valence band and the Ce4f dominated band a
new defect peak has appeared, made up of occupied Ce4f states,
which indicates the presence of Ce(III) ions. The EDOS for the
antiferromagnetic conﬁguration displays a similar Ce4f defect peak,
albeit with one peak spin up and the other spin down. Both the
position and nature of the defect peak are consistent with previous
experimental14 and theoretical83,86,105,106 work.
Cerium Interstitial. The introduction of a cerium interstitial
introduces four extra electrons to the system. There are two
different ways for the excess electrons to localize: either the
electrons localize on four of the ceria neighboring the vacancy,
reducing them from Ce(IV) to Ce(III)
4Cex
Ce þ CeðsÞ f 4Ce0
Ce þ Ce••••
i
ð5Þ
or one electron remains on the interstitial ion while three of the
neighboring cerium ions are reduced
3Cex
Ce þ CeðsÞ f 3Ce0
Ce þ Ce•••
i
ð6Þ
Figure 4 shows the structure, spin density, and EDOS for the
cerium interstitial when UCe,O = {5.0, 5.5} eV (negligible
diﬀerences for results with UCe,O = {5.0, 0} eV). The lowest
energy was found when the excess electrons localize according to
eq 6 in an antiferromagnetic conﬁguration (Figure 4(b)). For
UCe,O = {5.0, 0} eV (UCe,O = {5.0, 5.5} eV), the singlet con-
ﬁguration was lower in energy than the quintet and triplet states
by 240 meV (450 meV) and 90 meV (140 meV), respectively.
The eight oxygen ions neighboring the interstitial ion remain on
their lattice sites. The six Ce ions that neighbor the interstitial
relax away from it by 0.25 Å for the Ce(III) ions and 0.32 Å for
the Ce(IV) ions for both values of U{O2p}.
The EDOS, Figure 4(c), shows defect peaks made up of
occupied Ce4f states between the valence and conduction bands,
which are due to Ce(III) ions. A partial charge analysis of the
defect peaks shows that the lowest energy peak in the spin-up
state is attributed to the interstitial Ce(III) ion. The remaining
peaks are due to the three Ce(III) ions neighboring the inter-
stitial, one in the spin-up state and two in the spin-down state.
Cerium Vacancy. The formation of a neutral cerium vacancy
removes four electrons from the lattice. This creates holes in the
valencebandwhichareexpectedtolocalizeontheO2pstates,asthese
states dominate the VBM. In Kr€oger-Vink notation this would be
Cex
Ce þ 4Ox
O f V
0000
Ce þ 4O•
O þ CeðsÞ
ð7Þ
Figure 5 shows the structures of a cerium vacancy for (a) UCe,O =
{5.0, 0} eV and (b) UCe,O = {5.0, 5.5} eV. Both structures are
Figure 5. Local defect structure with spin-density plot of a cerium
vacancy with (a) UCe,O = {5.0, 0} eV and (b) UCe,O = {5.0, 5.5} eV. The
position of the vacancy is represented by the orange sphere. The
isosurface is set to 0.05 e/Å3.
Figure 6. Density of states for a cerium vacancy with (a) UCe,O =
{5.0, 0} eV and (b) UCe,O = {5.0, 5.5} eV.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 6

2448
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
shown with the overall spin in the quintet state, as this spin
conﬁguration was found to be marginally lower in energy than
the triplet or singlet states (8.5 and 11.4 meV, respectively).
When UCe,O = {5.0, 0} eV, the spin density is delocalized over the
eight oxygen ions neighboring the vacancy; however, when UCe,O =
{5.0, 5.5} eV we obtain a diﬀerent picture with localized holes on
four of the oxygens neighboring the vacancy. For UCe,O = {5.0, 0}
eV the eight oxygen ions that neighbor the cerium vacancy move
away from the vacancy by between 0.13 and 0.14 Å. When UCe,O =
{5.0, 5.5} eV, the OO
x ions relax away from the cerium vacancy by
0.26 Å, whereas the OO
• ions relax toward the vacancy by 0.03 Å
leading to an increased Ce(IV)OO
• bond (2.44 Å) since the OO
•
ions are less negatively charged than the OO
x ions.
The EDOS for a cerium vacancy when UCe,O = {5.0, 0} eV
(Figure 6(a)) indicates that the cerium vacancy is semimetallic in
nature, similar to the EDOS of Fernandes et al.56 However, the
EDOS when UCe,O = {5.0, 5.5} eV (Figure 6(b)) shows a defect
state within the band gap primarily composed of empty
O2p orbitals from the oxygen holes, indicating that the metallic
solution is a result of failing to account for the SIE. This is similar
to previous studies on cation vacancies in other metal oxides with
O2p dominated valence bands that have applied corrections for
the SIE.6466,76,90
Oxygen Interstitial. It might be expected that the introduction
of an oxygen interstitial would form localized holes on the
interstitial ion and the neighboring oxygen ions
Ox
O þ 1
2 O2ðgÞ f O•
O þ O
0
i
ð8Þ
However, the interstitial ion could relax from its original
position toward the lattice oxygen, forming a peroxide ion, and
hence no holes would be observed
Ox
O þ 1
2 O2ðgÞ f ðO2Þx
O
ð9Þ
Figure 7 shows the structure of the oxygen interstitial and its
EDOS for UCe,O = {5.0, 5.5} eV (minimal diﬀerences were found
with UCe,O = {5.0, 0} eV). When UCe,O = {5.0, 0} eV (UCe,O =
{5.0, 5.5} eV), the interstitial ion moves 0.84 Å (0.80 Å) toward a
lattice oxygen, which moves 0.10 Å (0.10 Å) toward the inter-
stitialposition. The resultingOO bond length is 1.45 Å (1.48 Å),
which is characteristic of a peroxide species. The formation of a
peroxide upon the introduction of an oxygen interstitial has also
beenobserved inother close-packed metaloxides, suchasAl2O3,107
SnO2,108 TiO2,65,109 and ZnO.110
Peaks corresponding to the peroxide (which are O2p in nature)
can be seen in the EDOS (Figure 7(b)) between 6 and 0 eV.
Integrating these peaks gives approximately 10 electrons, sug-
gesting occupation of a σ, two π, and two π* orbitals, as expected
from the MO diagram of a peroxide ion. Furthermore, the peak at
Figure 7. (a) Structure and (b) density of states of a peroxide ion in
CeO2 when UCe,O = {5.0, 5.5} eV. The peroxide ion is represented by
the dark green spheres. In the density of states the O2s, O2p, and O3d
states from the peroxide oxygens are represented by the blue, purple, and
orange lines, respectively. The peroxide peaks have been magniﬁed by
5 to aid clarity.
Figure 8. (a) Structure with partial charge density of the defect peaks
and (b) density of states of an anion Frenkel defect in CeO2 when
UCe,O = {5.0, 5.5} eV. The oxygen vacancy is represented by the light
green sphere, and the oxygen interstitial is represented by the purple
sphere. The isosurface is set to 0.05 e/Å3.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 7

2449
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
∼4.4 eV corresponds to the empty σ* orbital of the peroxide ion,
which has been observed previously in SnO2.108
Anion Frenkel and Schottky Defects. In Kr€ogerVink nota-
tion, an anion Frenkel defect is denoted by
Ox
O f V••
O þ O
00
i
ð10Þ
and a Schottky defect by
Cex
Ce þ 2Ox
O f V
0000
Ce þ 2V••
O
ð11Þ
The structures and EDOS for the anion Frenkel and the
Schottky defects are shown in Figure 8 and Figure 9, respectively.
For both of these defects, we only show the results for UCe,O =
{5.0, 5.5} eV (structures and EDOS largely unchanged when
UCe,O = {5.0, 0} eV). Several diﬀerent defect conﬁgurations
were investigated to determine the lowest energy structure in
each case. For the anion Frenkel defect we found that there was a
minimum distance the oxygen interstitial had to be from its
corresponding vacancy, below which they would spontaneously
recombine. Figure 8(a) shows a stable anion Frenkel defect when
the oxygen interstitial is 7.17 Å from the corresponding oxygen
vacancy. For the Schottky defect, we found that the cerium and
oxygen vacancies will form defect clusters, as shown in Figure 9-
(a). The presence of a Schottky defect does not aﬀect the EDOS
with respect to the pure bulk.18 In the case of the anion Frenkel
defect, a new peak appears in the band gap, made up of O2p states
with a small contribution from Ce4f states. The charge density
associated with the defect peak is shown in Figure 8(a) and sug-
gests the orbitals of the Oi00 atom and neighboring lattice oxygens
are perturbing each other, shifting their levels to a higher energy
in the density of states.
Formation Energies. The chemical-dependent defect forma-
tion energies are shown in Table 1. Under Ce-rich/O-poor con-
ditions, the formation energy of oxygen vacancies is significantly
lower than any of the other defects. However, under Ce-poor/
O-rich conditions, the peroxide ion has the lowest formation
energy, with oxygen vacancies having the second lowest energy.
In all cases, the formation energy for cerium vacancies and cerium
interstitials is much higher than the other defects.
Comparison of the results for UCe,O = {5.0, 0} eV and UCe,O =
{5.0, 5.5} eV cases show only small diﬀerences in the formation
energies. The exception to this is for the cerium vacancy where
the formation energy is lower by 2.16 eV at the Ce-rich/O-poor
limit and by 1.38 eV at the Ce-poor/O-rich when UCe,O = {5.0,
5.5} eV. This is because cerium vacancies lead to the formation of
localized holes on neighboring oxygen ions. Without the correc-
tion to the O2p states, the SIE leads to a delocalization of the
charge over the oxygens, but when the SIE is counteracted a
localized electronic structure is obtained.
Figure 10 show the change in concentration of the defects with
temperature for UCe,O = {5.0, 5.5} eV. The oxygen partials
pressures are set at P = 1010 atm (Figure 10(a)) and P = 0.2 atm
(Figure 10(b)) to represent defects in CeO2 under low oxygen
partial pressure (e.g., SOFC anode) and high oxygen partial pres-
sure (e.g., SOFC cathode).2 At both high and low oxygen partial
pressures, the most abundant defect will be oxygen vacancies. At
higher temperatures, there are small concentrations of anion
Frenkel and Schottky defects, while the concentrations of cerium
vacancies and cerium interstitials are negligible. Under high partial
oxygen pressure, the concentration of peroxide ions is signiﬁ-
cantly higher than at low pressure; however, at the typical operat-
ing temperature of a solid oxide fuel cell (≈5001000 K), the
concentration of oxygen vacancies is far greater.
’DISCUSSION
The SIE is a major obstacle to the accurate modeling of defects
in solids, and its eﬀect on n-type defects in CeO2 has been
extensively modeled. However, the study of the SIE with respect
to p-type defects has not received as much attention. To address
this, we have employed an ab initio ﬁtting procedure to deter-
mine a U parameter for the O2p states in CeO2. Using our derived
value of U{O2p} = 5.5 eV, we were able to model localized
Figure 9. (a) Structure and (b) density of states of a Schottky defect in
CeO2 when UCe,O = {5.0, 5.5} eV. The cerium vacancy is represented by
the orange sphere, and the oxygen vacancies are represented by the light
green spheres.
Table 1. Chemical Potential Dependent Defect Formation
Energies, for UCe,O = {5.0, 0} eV and UCe,O = {5.0, 5.5} eVa
UCe,O = {5.0, 0} eV
UCe,O = {5.0, 5.5} eV
Ce-rich/
O-poor
Ce-poor/
O-rich
Ce-rich/
O-poor
Ce-poor/
O-rich
O vacancy
0.57
2.60
0.58
2.22
Ce interstitial
5.96
10.02
6.03
9.31
Ce vacancy
10.35
6.29
8.19
4.91
O interstitial (peroxide)
3.76
1.73
3.50
1.86
anion Frenkel
3.89
3.89
3.96
3.96
Schottky
3.58
3.58
3.66
3.66
a All energies are given in eV.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 8

2450
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
electron holes on the oxygen anions, yielding electronic structures
similar to studies of other wide-gap metal oxides with O2p domi-
nated valence bands in which the SIE has been corrected.6466,76 If
U{O2p} is not included when modeling cerium vacancies, the SIE
leads to a delocalized defect which is semimetallic in nature.56 The
U{O2p} value is therefore essential for modeling defects that form
localized oxygen holes in CeO2.
From our temperature dependence analyses (Figure 10), we
ﬁnd that the defect with the greatest concentration in CeO2
will be oxygen vacancies. In terms of catalysis, the importance of
the OSC of CeO2 is well understood, as at higher temperatures
there will be a high concentration of oxygen released from CeO2,
allowing the catalysis of oxidation reactions, while the oxygen
vacancies can act as sites for reduction reactions.1418 Oxygen
vacancies will also act as a pathway for ionic conduction by
allowing neighboring oxygen ions to hop from their lattice
position and ﬁll the vacancy site. As the temperature and number
of vacancies increase, ionic conductivity will also increase. Un-
fortunately, the formation of a neutral oxygen vacancy leads to
the reduction of two Ce(IV) ions to Ce(III) which could lead to
unwanted electronic conductivity, thus short-circuiting the op-
eration of a solid oxide fuel cell. We also found that there was no
energy diﬀerence between a ferromagnetic and antiferromag-
netic arrangement of the excess electrons. Therefore, oxygen
vacancies are unlikely to be the cause of the observed ferromag-
netism in CeO2, in agreement with previous work.59
The formation energy of cerium interstitials is prohibitively
high, and therefore their concentration in CeO2 is negligible,
even at elevated temperatures. This is in contrast to materials
such as TiO2, which can stabilize titanium interstitials at high
temperatures or low partial oxygen pressures.90,111 Due to their
high formation energy, cerium interstitials are unlikely to have
any impact on the catalytic properties or the ionic conductivity of
CeO2. Furthermore, the four Ce(III) ions created by the forma-
tion of the interstitial defect will preferentially arrange their spins
in a singlet state, and therefore these defects are also unlikely to
contribute to ferromagnetism.
The concentration of cerium vacancies is also predicted to be
negligible in CeO2 and is therefore unlikely to contribute to catalysis
or conductivity. Fernandes et al. suggested that this defect could
partly account for the intrinsic ferromagnetism in CeO2 despite the
low concentration due to a large magnetic moment.56 Our results
show that a quintet arrangement for the oxygen holes around a
cerium vacancy is indeed the most stable conﬁguration; however, it
is only lower in energy than the singlet state by 11 meV, far lower
that the previously reported stabilization energy of 221 meV.56 The
discrepancy between these results is most likely due to previous
work not taking into account the SIE for the O2p states and hence
having stronger interactions between the spins of the electrons
delocalized over the same oxygen sites.
An oxygen interstitial in ceria will move from its interstitial
position, forming a peroxide ion with a neighboring lattice oxygen.
At low pressures, the concentration of peroxide ions is low, but at
higher pressures the concentration increases signiﬁcantly. However,
since oxygen interstitials are trapped as peroxide ions, they are
unlikely to contribute to the OSC. Furthermore, these are unlikely
to be mobile defects and will not contribute to ionic conductivity.
At elevated temperatures, there will be a small concentration
of anion Frenkel defects. The results for the anion Frenkel defect
agree with previous work, which has shownthat they can be present
within CeO2
112 but are liable to undergo pair recombination unless
the oxygen interstitials are suﬃciently far from their correspond-
ing oxygen vacancies.68 The oxygen vacancies of an anion Frenkel
defect could act as pathways for ionic diﬀusion, but since the con-
centration of such defects is very low in CeO2, their contribution
will be insigniﬁcant. This is in contrast to other materials with the
ﬂourite structure, such as CaF2, where Frenkel defects do con-
tribute to ionic conductivity due to lower formation energies.113
There will be a small concentration of Schottky defects at high
temperatures. It was found though that the lowest energy
structure of the Schottky defect is when the oxygen vacancies
and the cerium vacancy cluster together. This preference for
forming clusters, together with a low concentration, suggests that
Schottky defects will not signiﬁcantly contribute toward the ionic
conductivity of CeO2.
’CONCLUSION
We have applied GGA+U to investigate the properties of
intrinsic defects within CeO2. Using an ab initio ﬁtting proce-
dure, based on Koopmans’ theorem, we have determined that a
value of U{O2p} = 5.5 eV will remove the SIE associated with the
O2p states. When this U value is applied to our calculations, it is
possible to model localized oxygen holes in CeO2. We have also
shown that to accurately model electronic defects in CeO2 it is
necessary to include U on both the Ce4f and O2p states. This is an
important result for future research on defective CeO2 where there is
the possibility of forming localized holes and/or localized electrons.
We determined that oxygen vacancies will have the lowest for-
mation energies under oxygen-poor conditions, while oxygen inter-
stitials will have the lowest formation energy at the oxygen-rich limit.
To relate these results to real world operating conditions, we carried
out a temperature dependence analysis under high and low oxygen
Figure 10. Temperature dependence of concentration of intrinsic
defects in CeO2 at oxygen partial pressures of (a) P = 1010 atm and
(b) P = 0.2 atm.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 9

2451
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
partial pressures. Our results have shown that under these conditions
oxygen vacancies will always be the most abundant defect in CeO2.
Furthermore, we have demonstrated that at the dilute limit none of
the considered defects studied can account for the apparent ferro-
magnetism observed in CeO2.
’AUTHOR INFORMATION
Corresponding Author
*E-mail: scanloda@tcd.ie; watsong@tcd.ie.
Present Addresses
†Department of Materials, University of Oxford, Parks Road,
OX1 3PH, U.K.
‡Faculty of Health, Sport and Science, University of Glamorgan,
Pontypridd, CF37 1DL, U.K.
’ACKNOWLEDGMENT
This work was supported by Science Foundation Ireland
through the Research Frontiers Programme (grant numbers 08/
RFP/MTR1044 and 09/RFP/MTR2274). Calculations were
performed on the IITAC and Lonsdale supercomputers as main-
tained by TCHPC and the Stokes supercomputer as maintained
by ICHEC.
’REFERENCES
(1) Deng, W. L.; Carpenter, C.; Yi, N.; Flytzani-Stephanopoulos, M.
Top. Catal. 2007, 44, 199–208.
(2) Jacobson, A. J. Chem. Mater. 2010, 22, 660–674.
(3) Khodadadi, A.; Mohajersadeh, S. S.; Mortazavi, Y.; Miri, A. M.
Sens. Actuators, B 2001, 80, 267–271.
(4) Guo, J. X.; Yuan, S. H.; Gong, M. C.; Zhang, L.; Zhang, J, L.;
Zhao, M.; Chen, Y. Q. Acta Chim. Sin. 2007, 10, 937–942.
(5) Krishna, K.; Bueno-Lopez, A.; Makkee, M.; Moulijn, J. A. Top.
Catal. 2007, 4243, 221–228.
(6) Nunan, J. G.; Cohn, M. J.; Dormer, J. T. Catal. Today 1992,
14, 277–291.
(7) Zhou, K.; Wang, X.; Sun, X.; Peng, Q.; Li, Y. J. Catal. 2005,
229, 206–212.
(8) Si, R.; Flytsani-Stephanopoulos, M. Angew. Chem., Int. Ed. 2008,
47, 2884–7.
(9) Panagiotopoulou, P.; Papavasiliou, J.; Avgouropoulos, G.; Ioannides,
T. Chem. Eng. J. 2007, 134, 16–22.
(10) Camellone, M. F.; Fabris, S. J. Am. Chem. Soc. 2009, 131,
10473–10483.
(11) Ganduglia-Pirovano, M. V.; Popa, C.; Sauer, J.; Abbott, H.; Uhl,
A.; Baron, M.; Stacchiola, D.; Bondarchuk, O.; Shaikhutdinov, S.;
Freund, H.-J. J. Am. Chem. Soc. 2010, 132, 2345–2349.
(12) Huang, T. J.; Li, J. F. J. Power Sources 2008, 181, 62–68.
(13) Huang, T. J.; Wang, C. H. Chem. Eng. J. 2007, 132, 97–103.
(14) Henderson, M.A.; Perkins, C. L.;Engelhard, M. H.; Thevuthasan,
S.; F., P. C. H. Surf. Sci. 2003, 526, 1–18.
(15) Yang, Z. X.; Woo, T. K.; Baudin, M.; Hermansson, K. J. Chem.
Phys. 2004, 120, 7741–7749.
(16) Andersson, D. A.; Simak, S. I.; Skorodumova, N. V.; Abrikosov,
I. A.; Johansson, B. A. Appl. Phys. Lett. 2007, 90, 031909.
(17) Lavik, E. B.; Kosacki, I.; Tuller, H. L.; Chiang, Y. M.; Ying, J. Y.
J. Electroceram. 1997, 1, 7–14.
(18) Nolan, M.; Fearon, J. E.; Watson, G. W. Solid State Ionics 2006,
177, 3069–3074.
(19) Nolan, M.; Parker, S. C.; Watson, G. W. Phys. Chem. Chem.
Phys. 2006, 8, 216–218.
(20) Nolan, M.; Verdugo, V. S.; Metiu, H. Surf. Sci. 2008, 602,
2734–2742.
(21) Scanlon, D. O.; Galea, N. M.; Morgan, B. J.; Watson, G. W.
J. Phys. Chem. C 2009, 113, 11095–11103.
(22) Azambre, B.; L., Z.; Delacroix, F.; Weber, J. V. Catal. Today
2008, 137, 278–282.
(23) Yang, Z. X.; He, B. L.; Lu, Z. S.; Hermansson, K. J. Phys. Chem. C
2010, 114, 4486–4494.
(24) Yang, Z. X.; Woo, T. K.; Hermansson, K. Surf. Sci. 2006,
600, 4953–4960.
(25) Zhao, S.; Gorte, R. J. Appl. Catal., A. 2004, 277, 129–136.
(26) Zhang, B.; Li, D.; Wang, X. Catal. Today 2010; DOI: 10.1016/
j.cattod.2010.04.019.
(27) Beckers, J.; Lee, A. F.; Rothenberg, G. Adv. Synth. Catal. 2009,
351, 1557–1566.
(28) Brett, D. J. L.; Atkinson, A.; Brandon, N. P.; Skinner, S. J. Chem.
Soc. Rev. 2008, 37, 1568–1578.
(29) Van Brutzel, L.; Chartier, A.; Crocombette, J. P. Phys. Rev. B
2008, 78, 024111.
(30) Basu,S.;Sujatha,D.;Maiti,H.S.Mater.Res.Soc.2004,19,3162–3171.
(31) Fu, Y. P.; Tseng, C. W.; Peng, P. C. J. Eur. Ceram. Soc. 2008,
28, 85–90.
(32) Esposito, V.; Zunic, M.; Traversa, E. Solid State Ionics 2009,
180, 1069–1075.
(33) Kuharuangrong, S. J. Power Sources 2007, 171, 506–510.
(34) Rambabu, B.; Ghosh, S.; Hrudananda, J. J. Mater. Sci. 2006,
41, 7530–7536.
(35) Sen, S.; Avila-Paredes, H. J.; Kim, S. J. Mater. Chem. 2008,
18, 3915–3917.
(36) Zhu, B.; Liu, X.; Zhu, Z.; Ljungberg, R. Int. J. Hydrogen Energy
2008, 33, 3385–3392.
(37) Zha, S.; Xia, C.; Meng, G. J. Power Sources 2002, 115,
44–48.
(38) Sha, X.; Lu, Z.; Huang, X.; Miao, J.; Ding, Z.; Xin, X.; Su, W.
J. Alloys Compd. 2007, 428, 59–64.
(39) Guan, X.; Zhou, H.; Liu, Z.; Wang, Y.; Zhang, J. Mater. Res. Bull.
2008, 43, 1046–1054.
(40) Cheng, C. H.; Lee, S. F.; Hong, C. W. J. Electrochem. Soc. 2007,
154, E158–E163.
(41) Inaba, H.; Sagawa, R.; Hayashi, H.; Kawamura, K. Solid State
Ionics 1999, 122, 95–103.
(42) Hayashi, H.; Sagawa, R.; Inaba, R.; Kawamura, K. Solid State
Ionics 2000, 131, 281–290.
(43) Nakayama, M.; Martin, M. Phys. Chem. Chem. Phys. 2009,
11, 3241–3249.
(44) Kim, D. J. J. Am. Ceram. Soc. 2005, 72, 1415–1421.
(45) Cioater~a, N.; P^arvulescu, V.; Rolle, A.; Vannier, R. N. Solid State
Ionics 2009, 180, 681–687.
(46) Dikmen, S.; Aslanbay, H.; Dikmen, E.; Sahin, O. J. Power Sources
2009, 195, 2488–2495.
(47) Ferrari, V.; Llois, A. M.; Vildosola, V. J. Phys.: Condens. Matter
2010, 22, 276002.
(48) Ji, Y.; Liu, J.; He, T.; Wang, J.; Su, W. J. Alloys Compd. 2005,
389, 317–322.
(49) Kumar, V. P.; Reddy, Y. S.; Kistaiah, P.; Prasad, G.; Reddy, C. V.
Mater. Chem. Phys. 2008, 112, 711–718.
(50) Zheng, Y.; Shi, Y.; Gu, H.; Gao, L.; Chen, H.; Guo, L. Mater. Res.
Bull. 2009, 44, 1717–1721.
(51) Venkatesan, M.; Fitzgerald, C. B.; Coey, J. M. D. Nature 2004,
630, 630.
(52) Abraham, D. W.; Frank, M. M.; Guha, S. Appl. Phys. Lett. 2005,
87, 252502.
(53) Sundaresan, A.; Bhargavi, R.; Rangarajan, N.; Siddesh, U.; Rao,
C. N. R. Phys. Rev. B 2006, 74, 161306.
(54) Hong, N. H.; Sakai, J.; Poirot, N.; Brize, V. Phys. Rev. B 2006,
73, 132404.
(55) Han, X.; Lee, J.; Yoo, H. I. Phys. Rev. B 2009, 79, 100403.
(56) Fernandes, V.; Mossanek, J. O.; Schio, P.; Klein, J. J.; de
Oliveira, A. J. A.; Ortiz, W. A.; Mattoso, N.; Varalda, J.; Schreiner,
W. H.; Abbate, M.; Mosca, D. H. Phys. Rev. B 2009, 80, 035202.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026


---

## Page 10

2452
dx.doi.org/10.1021/jp2080034 |J. Phys. Chem. C 2012, 116, 2443–2452
The Journal of Physical Chemistry C
ARTICLE
(57) Ge, M. Y.; Wang, H.; Liu, E. Z.; Liu, J. F.; Jiang, J. Z.; Li, Y. K.;
Xu, Z. A.; Li, H. Y. Appl. Phys. Lett. 2008, 93, 062505.
(58) Liu, Y.; Lockman, Z.; Aziz, A.; MacManus-Driscoll, J. J. Phys.:
Condens. Matter 2008, 20, 165201.
(59) Keating, P. R. L.; Scanlon, D. O.; Watson, G. W. J. Phys.:
Condens. Matter 2009, 21, 405502.
(60) Fernandes, V.; Schio, P.; de Oliveira, A. J. A.; Ortiz, W. A.;
Fichtner, P.; Amaral, L.; Graﬀ, I. L.; Varalda, J.; Mattoso, N.; Schreiner,
W. H.; Mosca, D. H. J. Phys.: Condens. Matter 2010, 22, 6004.
(61) Li, M.; Ge, S.; Qiao, W.; Zhang, L.; Zuo, Y.; Yan, S. Appl. Phys.
Lett. 2009, 94, 152511.
(62) Zhang, C.; Michaelides, A.; King, D. A.; Jenkins, S. J. J. Chem.
Phys. 2008, 129, 194708.
(63) Yasunaga, K.; Yasuda, K.; Matsumura, S.; Sonoda, T. Nucl.
Instrum. Methods Phys. Res., Sect. B 2008, 266, 2877–2881.
(64) Lany, S.; Zunger, A. Phys. Rev. B 2009, 80, 085202.
(65) Morgan, B. J.; Watson, G. W. Phys. Rev. B 2009, 80, 233102.
(66) Nolan, M.; Watson, G. W. J. Chem. Phys. 2006, 125, 144701.
(67) Kuznetsova, T. G.; Sadykov, V. A. Kinet. Catal. 2008, 49, 840–858.
(68) Guglielmetti, A.; Chartier, A.; van Brutzel, L.; Crocombette,
J.-P.; Yasuda, K.; Meis, C.; Matsumura, S. Nucl. Instrum. Methods Phys.
Res., Sect. B 2008, 266, 5120–5125.
(69) Yasunaga, K.; Yasuda, K.; Matsumura, S.; Sonoda, T. Nucl.
Instrum. Methods Phys. Res., Sect. B 2006, 250, 114–118.
(70) Kresse, G.; Hafner, J. Phys. Rev. B 1994, 49, 14251–14269.
(71) Kresse, G.; Furthmuller, J. Phys. Rev. B 1996, 54, 11169–11186.
(72) Kresse, G.; Furthmuller, J. Comput. Mater. Sci. 1996, 6, 12–50.
(73) Blochl, P. E. Phys. Rev. B 1994, 50, 17953–17979.
(74) Monkhorst, H. J.; Pack, J. D. Phys. Rev. B 1976, 13, 5188–5192.
(75) Scanlon, D. O.; Walsh, A.; Morgan, B. J.; Watson, G. W. J. Phys.
Chem. C 2008, 112, 9903–9911.
(76) Scanlon, D. O.; Walsh, A.; Morgan, B. J.; Nolan, M.; Fearon, J.;
Watson, G. W. J. Phys. Chem. C 2007, 111, 7971–7979.
(77) Morgan, B. J.; Scanlon, D. O.; Watson, G. J. Mater. Chem. 2009,
19, 5175–5178.
(78) Skorodumova, N. V.; Ahuja, R.; Simak, S. I.; Abrikosov, I. A.;
Johansson, B.; Lundqvist, B. I. Phys. Rev. B 2001, 64, 115108.
(79) Skorodumova, N. V.; Simak, S. I.; Lundqvist, B. I.; Abrikosov,
I. A.; Johansson, B. Phys. Rev. Lett. 2002, 89, 166601.
(80) Dudarev, S. L.; Botton, G. A.; Savrasov, S. Y.; Humphreys, C. J.;
Sutton, A. P. Phys. Rev. B 1998, 57, 1505–1509.
(81) Schick, A. B.; Pickett, W. E.; Liechtenstein, A. I. J. Electron.
Spectrosc. 2001, 114, 753–758.
(82) Gavartin, J. L.; Sushko, P. V.; Shluger, A. L. Phys. Rev. B 2003,
67, 035108.
(83) Nolan, M.; Grigoleit, S.; Sayle, D. C.; Parker, S. C.; Watson,
G. W. Surf. Sci. 2005, 576, 217–229.
(84) Castleton, C. W. M.; Kullgren, J.; Hermansson, K. J. Chem. Phys.
2007, 127, 244704.
(85) Fabris, S.; Vicario, G.; Balducci, G.; de Gironcoli, S.; Baroni, S.
J. Phys. Chem. B 2005, 109, 22860–22867.
(86) Galea, N. M.; Scanlon, D. O.; Morgan, B. J.; Watson, G. W. Mol.
Simul. 2009, 35, 577–583.
(87) Andersson, D. A.; Simak, S. I.; Johansson, B.; Abrikosov, I. A.;
Skorodumova, N. V. Phys. Rev. B 2007, 75, 035109.
(88) Da Silva, J. L. F.; Ganduglia-Pirovano, M. V.; Sauer, J.; Bayer, V.;
Kresse, G. Phys. Rev. B 2007, 75, 045121.
(89) Ganduglia-Pirovano, M. V.; Da Silva, J. L. F.; Sauer, J. Phys. Rev.
B 2009, 102, 026101.
(90) Morgan, B. J.; Watson, G. W. J. Phys. Chem. C 2010,
114, 2321–2328.
(91) Yeriskin, I.; Nolan, M. J. Chem. Phys. 2009, 131, 244701.
(92) Yeriskin, I.; Nolan, M. J. Phys.: Condens. Matter 2010,
22, 135004.
(93) Perdew,J.P.;Ruzsinsky,A.;Csonka,G.I.; Vydrov,O.A.;Scuseria,
G. E.; Staroverov, V. N.; Tao, J. Phys. Rev. A 2007, 76, 040501(R).
(94) Scanlon, D. O.; Morgan, B. J.; Watson, G. W.; Walsh, A. Phys.
Rev. Lett. 2009, 103, 096405.
(95) Makov, G.; Payne, M. C. Phys. Rev. B 1995, 51, 4014–4022.
(96) Reuter, K.; Scheﬄer, M. Phys. Rev. B 2001, 65, 035406.
(97) K€ummerle, E. A.; Heger, G. J. Solid State Chem. 1999, 147,
485–500.
(98) Wu, Z.; Zhang, J.; Chen, X.; Chen, Z.; Sun, M.; Wu, Z.; Guo, L.
Phys. Scr. 2005, T115, 902–806.
(99) Magesh, G.; Viswanathan, B.; Viswanath, R. P.; Varadarajan,
T. K. V. Indian J. Chem., Sec. A 2009, 46A, 480–488.
(100) Sathyamurthy, S.; Leonard, K. J.; Davestani, R.; Paranthaman,
M. P. Nanotechnology 2005, 16, 1960–1964.
(101) Debnath, S.; Islam, M. R.; Khan, M. S. R. Bull. Mater. Sci. 2007,
30, 315–319.
(102) Zhu, Y. Z.; Chen, G. D.; Ye, H.; Walsh, A.; Moon, C. Y.; Wei,
S.-H. Phys. Rev. B 2008, 77, 245209.
(103) Mullins, D. R.; Radulovic, P. V.; Overbury, S. H. Surf. Sci.
1999, 429, 186–198.
(104) Mullins, D. R.; Overbury, S. H.; Huntley, D. R. Surf. Sci. 1998,
409, 307–319.
(105) Nolan, M.; Parker, S. C.; Watson, G. W. Surf. Sci. 2005,
595, 223–232.
(106) Zhang, C. J.; Michaelides, A.; King, D. A.; Jenkins, S. J. Phys.
Rev. B 2009, 79, 075433.
(107) Sokol, A. A.; Walsh, A.; Catlow, C. R. A. Chem. Phys. Lett.
2010, 492, 44–48.
(108) Godinho, K. G.; Walsh, A.; Watson, G. W. J. Phys. Chem. C
2009, 113, 439–448.
(109) Na-Phattalung, S.; Smith, M. F.; Kim, K.; Du, M.-H.; Wei,
S.-H.; Zhang, S. B.; Limpijumnong, S. Phys. Rev. B 2006, 73, 125205.
(110) Catlow, C. R. A.; French, S. A.; Sokol, A. A.; Al-Sunaidi, A. A.;
Woodley, S. M. J. Comput. Chem. 2008, 29, 2234–2249.
(111) Nowotny, M. K.; Sheppard, L. R.; Bak, T.; Nowotny, J. J. Phys.
Chem. C 2008, 112, 5275–5300.
(112) Mamontov, E.; Egami, T. J. Phys. Chem. Solids 2000,
61, 1345–1356.
(113) Catlow, C. R. A.; Norgett, M. J. J. Phys.-Paris 1973, 34, C9–45.
Downloaded from pubs.​acs.​org/​jpccck/​article-pdf/​116/​3/​2443/​14716439/​jp2080034.​pdf by UNIV ILLINOIS URBANA-CHAMPAIGN user on 17 August 2026
