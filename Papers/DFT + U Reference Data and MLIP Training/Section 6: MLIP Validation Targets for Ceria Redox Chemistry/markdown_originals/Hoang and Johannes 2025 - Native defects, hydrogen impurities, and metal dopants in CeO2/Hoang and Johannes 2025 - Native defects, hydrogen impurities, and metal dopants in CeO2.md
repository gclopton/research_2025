# Native defects, hydrogen impurities, and metal dopants in CeO2

**Authors:** Khang Hoang; Michelle D. Johannes

**Venue:** Physical Review Materials 9, 095801 (2025); arXiv:2504.02595v2

**DOI / identifier:** 10.1103/8qzc-t7dy

**Conversion note:** Generated from the downloaded PDF using PyMuPDF text extraction on 2026-08-17. Figures and equations may require checking against the PDF.


---

## Page 1

Native defects, hydrogen impurities, and metal dopants in CeO2
Khang Hoang1, ∗and Michelle D. Johannes2
1Center for Computationally Assisted Science and Technology & Department of Physics,
North Dakota State University, Fargo, North Dakota 58108, United States.
2Center for Computational Materials Science, U.S. Naval Research Laboratory,
4555 Overlook Ave SW, Washington, District of Columbia 20375, United States.
(Dated: September 1, 2025)
Ceria (CeO2) is a material of signiﬁcant technological importance. A detailed understanding of
the material’s defect physics and chemistry is key to understanding and optimizing its properties.
Here, we report a hybrid density-functional study of native point defects, hydrogen impurities, and
metal dopants in CeO2.
We ﬁnd that electron polarons (η−
Ce) and oxygen vacancies (V 2+
O ) are
the dominant native defects under conditions ranging from extreme oxidizing to highly reducing.
Hydrogen is stable either in the hydroxyl (H+
i ) or hydride (H+
O) structure but the substitutional
H+
O is energetically more favorable than H+
i only under highly reducing conditions. The interstitial
H+
i is highly mobile in the bulk. Yttrium (Y) is energetically most favorable at the substitutional
Ce site.
Copper (Cu) and nickel (Ni) can be incorporated at the substitutional site and/or an
interstitial site, depending on actual conditions during preparation, and the dopants can exist in
diﬀerent charge and spin states. In light of the results, we discuss electronic and ionic conduction
and the eﬀects of metal doping on the formation of electron polarons and oxygen vacancies.
I.
INTRODUCTION
Ceria (CeO2), a rare-earth metal oxide, is of interest
for numerous important applications. CeO2-based ma-
terials have most commonly been used as a catalyst or
as a non-inert support for catalysts; they have also been
considered for use in fuel cells, hydrocarbon reforming,
photocatalysis, water splitting, biomedical applications,
among others [1]. Defect physics and chemistry plays an
essential role in the properties and functionalities of ma-
terials [2–4]. Oxygen release and uptake in CeO2, for ex-
ample, arises from the ability to deviate from stoichiome-
try. Electronic and ionic conduction in the metal oxide is
also governed by the formation and migration of respec-
tive charge-carrying electronic and ionic defects [5–8]. In
addition to native point defects, which are intrinsic to the
material, extrinsic defects such as impurities and dopants
are present or intentionally introduced to manipulate the
material’s properties [9–23]. A detailed understanding of
the defect physics and chemistry in CeO2 is key to opti-
mizing its performance in various applications.
Density-functional theory (DFT) based ﬁrst-principles
studies of defects in CeO2 have been carried out by many
authors [24–35], mainly using the DFT+U method [36,
37] with the Hubbard U term often applied on the Ce 4f
states and with few studies using a hybrid DFT/Hartree-
Fock method [38, 39]. Although much has been learned
from these studies, the fundamental understanding is still
far from satisfactory. Certain aspects of defects in CeO2
are under debate; for example, the dominant native de-
fects in the materials under diﬀerent experimental condi-
tions or the lattice and electronic structure and energetics
of speciﬁc defects. More importantly, there is still a lack
∗E-mail: khang.hoang@ndsu.edu
of a more comprehensive and rigorous approach that can
provide a deep understanding of the defect physics that
in turn can oﬀer physical insights for materials design.
We herein report a study of native defects, hydrogen
impurities, and metal dopants in CeO2, using a hybrid
DFT/Hartree-Fock method [38, 39] which treats all or-
bitals in all elements on equal footing. Supercell models
much larger than those used in the previous DFT-based
studies are employed to properly take into account local
lattice distortion and to reduce artiﬁcial defect-defect in-
teraction. In addition to common native defects, hydro-
gen impurities are selected for this study as CeO2 is often
prepared, treated, or used in an H2-rich environment. For
metal dopants, we select yttrium (Y), copper (Cu), and
nickel (Ni) as examples. These metal dopants are often
found in CeO2-based materials [13–23] and, as it will be
made clear later, they represent rather distinct physics
and chemistry. In light of the results for the lattice and
electronic structure, energetics, and migration of defects,
we discuss possible defect landscapes in CeO2, the elec-
tronic and ionic conduction, and the eﬀects of hydrogen
impurities and of metal doping. Comparison with previ-
ously reported computational studies and with available
experiments is made where appropriate.
II.
METHODOLOGY
First-principles calculations are based on the Heyd-
Scuseria-Ernzerhof (HSE06) screened hybrid functional
[38], the projector augmented wave (PAW) method [40],
and a plane-wave basis set, as implemented in the Vi-
enna Ab Initio Simulation Package (vasp) [41–43]. We
use the standard PAW potentials in the vasp database
which treat Ce 5s25p64f 15d16s2, O 2s22p4, H 1s1, Y
4s24p64d15s2, Cu 3d104s1, and Ni 3d84s2 explicitly as
valence electrons and the rest as core electrons.
The
arXiv:2504.02595v2  [cond-mat.mtrl-sci]  29 Aug 2025


---

## Page 2

2
Hartree-Fock mixing parameter and the screening length
are set to the standard values of 25% and 10 ˚A, respec-
tively; the plane-wave basis-set cutoﬀis set to 500 eV.
The calculations for bulk CeO2 (four formula units per
unit cell) are carried out using k-point meshes as dense
as 8×8×8; k-point meshes for other bulk phases (Ce,
Ce2O3, Cu, CuO, Ni, NiO, Y, and Y2O3) and isolated
molecules (O2, H2, and H2O) are chosen appropriately.
Defects in CeO2 are modeled using cubic 3×3×3 (324-
atom) supercells. Integrations over the Brillouin zone in
the defect calculations are carried out using the Γ point.
In all calculations, structural relaxations are performed
with the HSE06 functional and the force threshold is cho-
sen to be 0.02 eV/˚A; the spin polarization is included and
the convergence is assumed when the total energy diﬀer-
ence between consecutive cycles is within 10−5 eV.
The formation energy of a defect or defect complex X
in eﬀective charge state q is deﬁned as [44, 45]
Ef(Xq) =
Etot(Xq) −Etot(bulk) −
X
i
niµi
(1)
+ q(Ev + µe) + ∆q,
where Etot(Xq) and Etot(bulk) are, respectively, the total
energies of a supercell containing X and of an equivalent
supercell of the perfect host material. µi is the atomic
chemical potential of species i that have been added to
(ni>0) or removed from (ni<0) the supercell to form
the defect.
µe is the electron chemical potential, i.e.,
the Fermi level, referenced to the valence-band maximum
(VBM) in the bulk (Ev). Finally, ∆q is the correction
term to align the electrostatic potentials of the perfect
bulk and defect supercells and to account for ﬁnite-size
eﬀects on the total energies of charged defects [46].
We examine defect landscapes in CeO2 using three
sets of atomic chemical potentials which correspond to
three diﬀerent experimental conditions. Condition A as-
sumes equilibrium with air at T = 500◦C (within the
temperature range in which CeO2 is often prepared),
which leads to the oxygen chemical potential µO = −0.87
eV [47]. Condition B corresponds to a highly reducing
environment in which the host material is assumed to be
in equilibrium with the O-deﬁcient phase Ce2O3, which
gives µO = −3.09 eV; equivalently, this condition corre-
sponds approximately to, e.g., the oxygen partial pres-
sure pO2 = 10−10 atm and T = 1200◦C [47]. For com-
pleteness, we also consider condition C which assumes an
extreme oxidizing environment where the host is in equi-
librium with isolated O2 molecules at 0 K, corresponding
to µO = 0 eV. In each case, the atomic chemical potential
of the other species (Ce, H, Y, Cu, and Ni) is determined
accordingly using, respectively, CeO2, an isolated H2O
molecule, Y2O3, CuO, and NiO as limiting phases, ex-
cept in the case of B where the limiting phase of Ni, Cu,
and H is elemental Ni, elemental Cu, and an isolated H2
molecule, respectively. Since A and B are more experi-
mentally relevant, their results will be explicitly reported;
we will mention results obtained under condition C only
when needed to have a more complete picture.
The migration of a small polaron between two positions
QA and QB can be described by the transfer of its lattice
distortion [48]. We estimate the migration barrier (Em)
by computing the total energies of a set of supercell con-
ﬁgurations linearly interpolated between QA and QB and
identify the energy maximum. For an oxygen vacancy
or hydrogen interstitial, the migration barrier is calcu-
lated by using the climbing-image nudged elastic-band
(NEB) method [49]. Unless otherwise noted, these sets
of NEB calculations are carried out using the DFT+U
method [36] that is based on the Perdew-Burke-Ernzerhof
(PBE) functional [50], with the eﬀective Hubbard param-
eter U = 5 eV applied on the Ce 4f states. Castleton
et al. [51] have thoroughly benchmarked various DFT
functionals for the study of polaron migration in CeO2
and found that PBE+U (with U = 5 eV) gives a better
description over HSE06. Although the same conclusion
may not be made regarding the ionic defects, we also
employ PBE+U in the NEB calculations for the oxygen
vacancy and the hydrogen interstitial to reduce compu-
tational costs, thus making the calculations feasible.
Finally, it should be noted that spin-orbit coupling
(SOC) is not included as signiﬁcant cancellation is ex-
pected between the terms in Eq. (1).
Our tests show
that the formation energy of the electron polaron (η−
Ce)
obtained in HSE+SOC calculations is diﬀerent from that
obtained in HSE calculations by only 40 meV, well within
the typical error bar of the formation energy calculation
(about 0.1 eV). This is also consistent with computa-
tional tests done for Eu-related defects in GaN [52].
III.
RESULTS AND DISCUSSION
A.
Bulk properties
CeO2 crystallizes in a face-centered cubic, ﬂuorite-type
structure (space group Fm¯3m).
The lattice constant
within the HSE06 functional is 5.387 ˚A (at 0 K), which
is comparable to the experimental value (5.401 ˚A, mea-
sured at 100 K) [53]. The Ce–O bond length is 2.33 ˚A.
The electronic contribution to the static dielectric con-
stant of CeO2 is 4.56, based on the real part of the dielec-
tric function ǫ1(ω) for ω →0. The ionic contribution is
21.89, obtained from the macroscopic ion-clamped static
dielectric tensor [54], as calculated using the vasp code.
The total dielectric constant is thus 26.45.
Figure 1 shows the electronic structure of CeO2. We
ﬁnd that the VBM is predominantly the O 2p states,
whereas the conduction-band minimum (CBM) is pre-
dominantly the Ce 4f states. The calculated band gap is
3.62 eV (indirect). For comparison, the reported experi-
mental band gap is in the range 2.9–4.4 eV [32]. As it will
be made clear later, the nature of the electronic structure
at the VBM and CBM has great impact on defect for-
mation. Our calculated bulk properties (e.g., band gap
and dielectric constant at 0 K) are in agreement with the
previous HSE06 bulk calculations [55].


---

## Page 3

3
FIG. 1. Total and projected electronic densities of states of
CeO2. The zero of energy is set to the highest occupied states.
FIG. 2.
Formation energies of native defects in CeO2 ob-
tained under (a) condition A and (b) condition B, plotted as
a function of the Fermi level from the VBM (at 0 eV) to the
CBM (at 3.62 eV). The slope indicates the charge state (q):
positively (negatively) charged defects have positive (nega-
tive) slopes. A solid energy segment represents a stable single
point defect conﬁguration; dotted energy segments are com-
plexes of the single defect and one or more electron or hole
polarons. µint
e , marked by the vertical dotted line, is the po-
sition of the Fermi level determined by the native defects.
B.
Native defects
Figure 2 shows the formation energies of relevant na-
tive defects in CeO2. Electronic defects include a hole
polaron localized mostly at an O site [η+
O with spin
S = 1/2, which can be regarded as O−at the O2−site;
see Fig. 3(a)] and an electron polaron localized at a Ce
site [η−
Ce, i.e., Ce3+ 4f 1, S = 1/2, at the Ce4+ site; see
FIG. 3. Structures of representative electronic and ionic na-
tive defects in CeO2: (a) the hole polaron η+
O, (b) the elec-
tron polaron η−
Ce, and (c) the neutral oxygen vacancy (i.e., a
complex of V 2+
O
and two η−
Ce). The isovalue for the charge-
density isosurface (yellow) is set to 0.02 e/˚A3.
The large
(gray) spheres are Ce and small (red) spheres are O. The
vacancy is behind the front oxygen atom at the center. All
the atomic structures are visualized using vesta [56].
Fig. 3(b)]. η+
O is formed upon removing an electron from
the CeO2 supercell; naturally, it is the electron from the
highest occupied state (i.e., the VBM, which is predom-
inantly the O 2p states) that is removed. η−
Ce is, on the
other hand, formed upon adding an electron to the su-
percell, naturally to the lowest unoccupied state (i.e., the
CBM, which is predominantly the Ce 4f states). These
polarons are stable even in the absence of any other de-
fect. The interplay between polaron formation and elec-
tronic structure in metal oxides has been well discussed
in, e.g., Ref. 2. The local lattice environment is distorted
with longer Ce–O bond lengths as the negative (positive)
charge gets reduced; 2.42 ˚A in the case of η+
O and 2.41 ˚A
in the case of η−
Ce, compared to 2.33 ˚A in the perfect bulk
material. Since the hole (electron) is highly localized on
the lattice, it can be regarded as small polaron.
Ionic defects include the following structurally, elec-
tronically, and energetically stable single defects: V 2+
O
(i.e., the removal of an O2−ion from the supercell), O0
i
(the addition of an oxygen that leads to the formation
of an O–O dimer with an existing oxygen; the O–O dis-
tance is 1.42 ˚A), O2−
i
(the added O2−ion is octahedrally
coordinated by Ce; the O–Ce distance is 2.55–2.62 ˚A),
V 4−
Ce (the removal of a Ce4+ ion), and Ce4+
i
(the addition
of a Ce4+ ion). In the V 2+
O
conﬁguration, the nearest O
neighbors of the vacancy move inward by 0.23 ˚A, and the
nearest Ce neighbors move outward by 0.17 ˚A. In V 4−
Ce ,
the nearest O neighbors of the vacancy move outward
by 0.23 ˚A, and the nearest Ce neighbors move inward
by 0.07 ˚A. In Ce4+
i , the added Ce4+ ion is octahedrally
coordinated by Ce with the distance being 3.01–3.02 ˚A.
Note that O0
i at the octahedral site is found to be 1.30
eV higher in energy compared to the O–O dimer conﬁg-
uration. On the other hand, O2−
i
in the dimer conﬁgu-
ration is 2.45 eV higher compared to being at the octa-
hedral site. Our results for O2−
i
appear to be consistent
with experiments where the octahedral interstitial site
was assumed in structure reﬁnements [57, 58]. The octa-
hedrally coordinated O2−
i
is expected to occur together
with V 2+
O
via an anion-Frenkel pair mechanism, and can
recombine under high-temperature treatment [57].


---

## Page 4

4
Other (nominal) charge states of these vacancies and
interstitials are, in fact, defect complexes consisting of
the single defects and the electron or hole polaron(s).
For example, the +, 0, or −state of VO is a complex of
V 2+
O
and one, two, or three η−
Ce with the binding energy
of 0.29 eV, 0.44 eV, or 0.55 eV with respect to its con-
stituents, respectively. Figure 3(c) shows the structure of
the (nominal) neutral oxygen vacancy with two electron
polarons as nearest neighbors. Similarly, the 3−, 2−, −,
0, or + state of VCe is a complex of V 4−
Ce and one, two,
three, four, or ﬁve η+
O with the binding energy of 1.14 eV,
2.19 eV, 3.01 eV, 3.76 eV, or 4.43 eV, respectively.
Energetically, η−
Ce and V 2+
O
have the lowest formation
energies and thus are the dominant defects in undoped
CeO2, under conditions from extreme oxidizing (µO = 0
eV) to highly reducing (µO = −3.09 eV). Note that al-
though V 4−
Ce has the lowest formation energy in a range
of Fermi level values below the CBM, this range is phys-
ically inaccessible under experimentally relevant condi-
tions as the formation energy there becomes negative. In
the absence of electrically active impurities that can shift
the Fermi-level position or when such impurities occur in
much lower concentrations than charged native defects,
the Fermi level is at µint
e , determined by the native de-
fects (As µint
e
is at least 0.6 eV from the band edges,
contributions from free holes and electrons are negligi-
ble). µint
e
is the Fermi-level position at which the ma-
terial maintains its charge neutrality [2]. In CeO2, µint
e
is approximately where η−
Ce and V 2+
O
have equal forma-
tion energies; µint
e
= 1.95 eV above the VBM for µO = 0
eV, 2.24 eV for µO = −0.87 eV [Fig. 2(a)], and 2.98 eV
for µO = −3.09 eV [Fig. 2(b)]. The Fermi level is thus
higher in a more reducing environment, which is consis-
tent with experiments [59]. The Fermi level was reported
to be about 2.7 eV [60] or ∼3 eV [59] above the VBM in
CeO2 thin ﬁlms. Note that our results are diﬀerent from
those of Zacherle et al. [26]; the discrepancy can be as-
cribed to the DFT+U method used in the previous work
in which the U term was applied on the Ce 4f orbitals
only and all other orbitals were left uncorrected. Our
ﬁndings are also in contrast to those of Zhang et al. [32]
(who used a hybrid quantum mechanical/molecular me-
chanical method) where the anion-Frenkel pair (i.e., V 2+
O
and O2−
i ) was found to be dominant and determine the
Fermi-level position. As it will be made clear later, know-
ing µint
e
is key to analyzing the interaction between CeO2
and hydrogen impurities or metal dopants.
The formation energy of η−
Ce (i.e., Ce3+) and V 2+
O
at
µint
e
is low, especially under reducing conditions, e.g., 1.14
eV for µO = −0.87 eV [an oxidizing environment, see
Fig. 2(a)] or 0.41 eV for µO = −3.09 eV [highly reducing,
Fig. 2(b)]. With such a low formation energy, positively
charged oxygen vacancies and Ce3+ can occur with a high
concentration. These two defects can be formed simul-
taneously, e.g., via oxygen loss during materials prepara-
tion or under heat treatment in an reducing environment,
or during the oxygen release process in electrochemical
applications. This is consistent with the fact that CeO2
samples are often O-deﬁcient and contain Ce3+ [61, 62].
Using our defect notation, the oxygen release and uptake
reaction can be written as
O0
O + 2Ce0
Ce ⇋1
2O2 + V 2+
O
+ 2η−
Ce.
(2)
The oxygen storage capacity is thus necessarily related
to the ability to form oxygen vacancies in the material.
Notably, among the native defects, η−
Ce and V 2+
O
can
serve as charge-carrying defects in electronic and ionic
conduction, respectively. The migration barrier (Em) of
η−
Ce is calculated to be 0.19 eV within DFT+U. The en-
ergy is only 43 meV in HSE06 calculations; however, it is
known that the hybrid functional can underestimate the
polaron migration barrier in metal oxides [51]. In both
sets of calculations, the saddle-point conﬁguration has
the extra electron almost equally distributed over the two
neighboring Ce atoms, which is diﬀerent from DFT+U
results of Sun et al. [29], probably due to the smaller
(96-atom) supercell used in their calculations. The en-
ergy barrier for the migration of V 2+
O
is 0.72 eV.
Experimentally, electrical conductivity data reported
by Blumenthal and Hofmaier [6] for CeO2−x (x
=
0.00424) clearly shows two regions in the log σ vs. 1/T
plot: a high-T (low-T ) region with an activation energy
(Ea) of 0.22 eV (0.59 eV). In the high-T region, Ea = Em,
showing that our calculated migration barrier (0.19 eV) is
in good agreement with experiment (0.22 eV). The higher
activation energy (0.59 eV) measured in the low-T region
can be ascribed to defect association; i.e., Ea = Em +Eb,
where Eb = 0.37 eV is the binding energy. This value is
comparable to the binding energy (0.29 eV) of η−
Ce and
V 2+
O
we mention earlier.
Naik and Tien also reported
an activation energy of 0.19 eV in the high-T region for
CeO2−x, independent of x up to x = 0.03 [8]. Note that
the formation energy (Ef) does not enter the formula for
Ea as the charge-carrying defects (athermal η−
Ce) already
pre-exist in the material during the conductivity mea-
surement [2]. Finally, the calculated migration barrier
for V 2+
O
is comparable to the experimental activation en-
ergy values (0.64–0.82) for ionic conduction reported for
various rare-earth doped CeO2 materials [22, 63–65].
C.
Hydrogen impurities
Figure 4 shows the formation energies of various hy-
drogen impurities in CeO2. The hydrogen interstitial is
stable as H+
i with the added proton (H+) forming a hy-
droxyl structure with an oxygen (the O–H distance is 1.01
˚A) and staying in the line connecting two neighboring O
atoms; see Fig. 5(a). This H+
i conﬁguration is 37 meV
lower in energy than another one in which the added
H+ ion forms a Ce–O–H line (where the O–H distance is
only slightly shorter, 0.97 ˚A). The 0 (or −) state of Hi
is not stable as a single defect but a complex of H+
i and
one (two) η−
Ce with a binding energy of 0.22 eV (0.25 eV).
The hydrogen molecule interstitial is stable as (H2)0
i with


---

## Page 5

5
FIG. 4. Formation energies of hydrogen impurities in CeO2
obtained under (a) condition A and (b) condition B. A solid
energy segment represents a stable ionic defect conﬁguration;
dotted energy segments are complexes of the ionic defect and
one or more electron or hole polarons. µint
e
marks the Fermi-
level position determined by the native defects.
FIG. 5. Structures of hydrogen impurities in CeO2: (a) H+
i ,
(b) H+
O, and (c) (Hi-VO)3+ (i.e., a complex of H+
i and V 2+
O ).
The small green sphere is H; the circle represents the vacancy.
the neutral H2 molecule residing at the center of the Ce
octahedron. The substitutional hydrogen at the O lattice
site is stable as H+
O which is an H−ion at the void left
by the removal of an O2−ion; see Fig. 5(b). Although
the H−ion can be seen as standing alone, its distance
to the nearest Ce neighbors is 2.40 ˚A, comparable to the
Ce–H bond lengths in CeH3. H+
O can thus be regarded
as having a hydride structure. Such a substitutional de-
fect can move oﬀ-center and form a Hi-VO complex. This
complex is found to be stable as (Hi-VO)3+, a complex
of H+
i (hydroxyl) and V 2+
O
with a binding energy of 0.18
eV; see Fig. 5(c). Other (nominal) charge states of Hi-VO
are just complexes of (Hi-VO)3+ and one or more η−
Ce.
Among these defects, H+
i is energetically more favor-
able at µint
e
for 0 eV ≤µO ⪅−2.50 eV [which includes
condition A–see Fig. 4(a)–and condition C]. Interest-
ingly, H+
O is more favorable for −2.50 eV ⪅µO ≤−3.09
eV [which includes condition B, see Fig. 4(b)]. Under less
reducing conditions (which also correspond to lower µint
e
values), H+
O (hydride) decomposes into H+
i
(hydroxyl)
and an oxygen vacancy. Our results thus suggest that one
can control the dominant hydrogen species in the bulk by
FIG. 6. Formation energies of Y-related defects in CeO2 ob-
tained under (a) condition A and (b) condition B.
tuning experimental conditions. We also ﬁnd that H+
i is
highly mobile in the bulk; its migration barrier is only
60 meV within DFT+U, in agreement with the values
recently reported by Stimac and Goldman [34] for (nom-
inally neutral) hydrogen interstitials. The migration of
H+ ions from the surface into the bulk may be aﬀected
by competing processes, however. The out-diﬀusion from
the bulk to the surface, for example, can counteract the
in-diﬀusion. Besides, hydrogen can react with oxygen on
the surface to form H2O or some OH species and get
cleaned out.
The high activation energy (< 1.69 eV)
for hydrogen diﬀusion experimentally observed in CeO2
polycrystalline thin ﬁlms [12] seems to suggest that the
in-diﬀusion may be impeded by certain processes at the
surface/subsurface layers or grain boundaries. This is-
sue, especially regarding hydrogen diﬀusion in CeO2 sin-
gle crystals, needs further experimental investigations.
Other experimental reports indicated that hydrogen
can be incorporated into the bulk [10, 11], although the
solubility appears to be low [66], and CeO2 prepared un-
der H2 ﬂow has a signiﬁcantly increased Ce3+ concen-
tration [9, 67]. The formation of Ce3+ is likely associ-
ated with the formation of oxygen vacancies. However,
as a positively charged defect (donor-like dopant) and if
present in the bulk with a signiﬁcant concentration, H+
i
can also shift the Fermi level toward the CBM [2], thus
lowering the the formation energy of η−
Ce and therefore
increasing its concentration. Finally, Wu et al. [67] re-
ported evidence for the presence of bulk Ce–H species
upon H2 dissociation over CeO2. Such hydride species
could be related to the H+
O defect we discussed above.
D.
Metal dopants
Figures 6 and 7 show the calculated formation ener-
gies of select metal dopants in CeO2. In the following


---

## Page 6

6
FIG. 7. Formation energies of Cu- and Ni-related defects in
CeO2 obtained under (a) condition A and (b) condition B.
FIG. 8. Structures of representative metal dopants and re-
lated defect complexes in CeO2: (a) Y−
Ce, (b) (YCe-VO)+, (c)
Cu2−
Ce , (d) (CuCe-VO)0, (e) Ni2−
Ce , and (f) (NiCe-VO)0.
discussion, we focus on the stable charge states (ionic
defect conﬁgurations) presented by the solid energy lines
in the formation-energy plot as other (nominal) charge
states (dotted energy lines) are just complexes of the sta-
ble ionic defects and η−
Ce or η+
O (or η∗
O in the case of YCe,
where η∗
O is an electron hole delocalized over two O sites).
We ﬁnd that the substitutional YCe is stable as Y−
Ce in
which Y3+ replaces Ce4+ at a Ce site. The Y–O distance
is 2.36 ˚A, comparable to the Ce–O bond length (2.33 ˚A)
in the perfect bulk material; see Fig. 8(a).
The small
lattice distortion is due to the small diﬀerence in the
ionic radii of eight-fold coordinated Ce4+ (0.97 ˚A) and
Y3+ (1.02 ˚A) [68]. Due to the Coulombic attraction, Y−
Ce
and V 2+
O
can come close and form (YCe-VO)+ with the
binding energy of 0.44 eV; see Fig. 8(b). This complex
can capture an η−
Ce to become (YCe-VO)0 with a binding
energy of 0.59 eV, or combine with another Y−
Ce to form a
(2YCe-VO)0 with a binding energy of 0.73 eV. (2YCe-VO)0
is found to be lower in energy than (YCe-VO)0, except in
highly reducing environments (e.g., under condition B).
The interstitial Yi is stable as Y3+
i , which is an extra
Y3+ ion at the center of a Ce octahedron. Y3+
i
is always
in much higher in energy than Y−
Ce and related defect
complexes. This is due to the large ionic radius of Y3+.
Next, CuCe is stable as Cu2−
Ce (i.e., Cu2+ 3d9, S = 1/2,
at the Ce4+ site) and/or Cu−
Ce (i.e., Cu3+ 3d8, S = 0,
at the Ce4+ site). The Cu+ ion is thus not stable at the
substitutional site.
CuCe is signiﬁcantly oﬀ-center, by
0.99 ˚A (1.11 ˚A) in the case of Cu2−
Ce (Cu−
Ce), and forms a
(slightly square pyramidal distorted) square planar with
four oxygens; see Fig. 8(c). The large lattice distortion
is consistent with the large diﬀerence in the ionic radii of
Cu2+ (Cu3+) and Ce4+ [68]. Possible Cu-related defect
complexes include (CuCe-VO)0, a complex of Cu2−
Ce and
V 2+
O
with a binding energy of 1.35 eV, see Fig. 8(d), and
(CuCe-VO)+, a complex of Cu−
Ce and V 2+
O
with a binding
energy of 1.11 eV. Note that our results for Cu are diﬀer-
ent from those of Sun and Yildiz [30]; e.g., (CuCe-VO)+
does not appear in their formation-energy plot.
The interstitial Cui is electronically stable as Cu2+
i
(i.e, Cu2+ 3d9, S = 1/2) or Cu+
i
(Cu+ 3d10, S = 0),
with the Cu2+ (or Cu+) ion at the center of the Ce
octahedron.
We ﬁnd that, at the Fermi-level position
µint
e , the formation energy of Cu+
i
is higher than Cu2−
Ce
for 0 eV ≤µO ⪅−1.10 eV [which includes condition
A–see Fig. 7(a)–and condition C] and lower for −1.10
eV ⪅µO ≤−3.09 eV [which includes condition B, see
Fig. 7(b)]. Cu+
i
and Cu2−
Ce have comparable formation
energies for µO ≈−1.10eV [i.e., near condition A, see
Fig. 7(a)]. Our results suggest that under normal condi-
tions, Cu may exist both as Cu2+ at the substitutional
site and as Cu+ at the interstitial site. Under reducing
conditions, on the other hand, Cu+
i (i.e., Cu+) becomes
the dominant Cu species; see, e.g., Fig. 7(b). This ap-
pears to be consistent with experimental observations of
multiple Cu oxidation states in Cu-doped CeO2 [15, 16].
Finally, NiCe is stable as Ni−
Ce (i.e., low-spin Ni3+ 3d7,
S = 1/2, at the Ce4+ site) and Ni2−
Ce (i.e., low-spin Ni2+
3d8, S = 0, at the Ce4+ site).
Like Cu, Ni is signiﬁ-
cantly oﬀ-center, by 1.07 ˚A (1.17 ˚A) in the case of Ni−
Ce
(Ni2−
Ce ), and forms a (slightly square pyramidal distorted)
square planar with four oxygen atoms; see Fig. 8(e). The
high-spin state of Ni2+ (S = 2) is only 5 meV higher in
energy than the low-spin one; i.e., they are essentially
degenerate. Defect complexes with oxygen vacancies in-
clude (NiCe-VO)0, a complex of Ni2−
Ce and V 2+
O
with a
binding energy of 1.33 eV, see Fig. 8(f), and (NiCe-VO)+,
a complex of Ni−
Ce and V 2+
O
with a binding energy of
1.11 eV. Similar to Cui, the interstitial Nii is also stable
electronically as Ni2+
i
(where the low-spin and high-spin
states Ni2+ are degenerate in energy) or Ni+
i (i.e., Ni+
3d9; S = 1/2). At µint
e , Ni+
i is higher in energy than Ni2−
Ce
under conditions A and C, but lower under condition B;
see Fig. 7(b); the crossover point is at µO ≈−1.59 eV.
Note that Wang et al. [35] also found the interstitial Ni


---

## Page 7

7
to be stable as Ni+ in their DFT+U calculations.
Overall, we ﬁnd that, under experimentally relevant
conditions such as in Fig. 6 and Fig. 7, the substitutional
dopants Y, Cu, and Ni in CeO2 are stable, respectively, as
Y−
Ce, Cu2−
Ce , and Ni2−
Ce (either as unassociated defects or in
complexes with oxygen vacancies) at the Fermi level µint
e
determined by native defects. The Y, Cu, and Ni inter-
stitials, on the other hand, are stable as Y3+
i , Cu+
i , and
Ni2+
i , respectively. For Cu and Ni, the lattice site prefer-
ence (substitutional vs. interstitial) and the charge and
spin state of the metal dopants depends on actual exper-
imental conditions. The diﬀerence in the structure and
energetics between Cu (or Ni) versus Y can be ascribed
to the Shannon ionic radius of Cu (Ni) being smaller than
that of Y [68]. As negatively charged (acceptor-like) de-
fects, Y−
Ce, Cu2−
Ce , and Ni2−
Ce can facilitate the formation of
charge-compensating, positively charged oxygen vacan-
cies, without increasing the concentration of Ce3+ and
thus without increasing the electronic conductivity. As
positively charged (donor-like) defects and if present with
a large concentration, Y3+
i , Cu+
i , and Ni2+
i
can lower the
formation energy of η−
Ce and thus increase the Ce3+ con-
centration. See, e.g., Ref. 2 for a further discussion of
eﬀects of doping in complex metal oxides.
As a general note, having a ﬁnite binding energy does
not mean a complex will readily form. Under thermal
equilibrium, the binding energy needs to be greater than
the larger of the formation energies of the individual de-
fects for the complex to have higher concentration than
its constituents [44]. Most of the relevant defect com-
plexes considered in this work have a small binding en-
ergy. This suggests that their concentration is expected
to be much smaller than that of the isolated constituents.
Experimentally, Thurber et al. [19] reported x-ray pho-
toelectron spectroscopy studies of Ce1−xNixO2 nanopar-
ticles (0.01 ≤x ≤0.20) which showed that nickel is sub-
stitutionally incorporated as Ni2+ at the Ce site in the
bulk; there is also contribution from Ni3+ surface states.
Derafa et al. [20], on the other hand, reported the in-
corporation of nickel into the lattice in the form of Ni3+
species in Ni0.1Ce0.9O2−x nanoparticles. The determina-
tion of the identity of Ni species in CeO2 is expected to be
challenging as, according to our results, the dopant can
be incorporated into the lattice at diﬀerent lattice sites
and exist in diﬀerent charge and spin states. Regarding
the eﬀects of substitutional metal doping, experimental
studies appear to be unanimous on the role of Y, Cu,
and Ni in promoting oxygen vacancies [13, 14, 17, 19–
23], which is consistent with our above analysis.
IV.
CONCLUSIONS
We have carried out a hybrid density-functional study
of defect physics in bulk CeO2. The (negatively charged)
electron polaron (η−
Ce, i.e., Ce3+) and the positively
charged oxygen vacancy (V 2+
O ) are found to be the dom-
inant native defects under conditions ranging from ex-
treme oxidizing to highly reducing. The migration barri-
ers of and the binding energy between η−
Ce and V 2+
O
are in
good agreement with experiments. Hydrogen is stable ei-
ther in the hydroxyl (H+
i ) or hydride (H+
O) conﬁguration,
depending actual experimental conditions. The intersti-
tial H+
i
is highly mobile in the bulk. Yttrium is most
stable as the substitutional lattice site; the lattice pref-
erence (substitutional versus interstitial) of copper and
nickel, on the other hand, depends on actual conditions
during materials preparation, and the dopants can exist
in diﬀerent charge and spin states. In light of the results,
we discuss the eﬀects of metal doping on the formation
of electron polarons and oxygen vacancies.
This work thus provides guidance for experimental de-
fect characterization and defect-controlled synthesis. It
also serves as a methodological template and a basis
for further investigation of other dopants and impuri-
ties. A detailed understanding of the synthesis–(defect)
structure–property relationship such as that developed
here would ultimately lead to the design and discovery
of CeO2-based materials with better performance.
ACKNOWLEDGMENTS
M.D.J. was supported by the U.S. Oﬃce of Naval Re-
search through the U.S. Naval Research Laboratory’s
core fundamental research program. This work used re-
sources of the Center for Computationally Assisted Sci-
ence and Technology (CCAST) at North Dakota State
University, which were made possible in part by Na-
tional Science Foundation Major Research Instrumenta-
tion (MRI) Award No. 2019077.
[1] T. Montini, M. Melchionna, M. Monai, and P. Fornasiero,
Fundamentals and Catalytic Applications of CeO2-Based
Materials, Chem. Rev. 116, 5987 (2016).
[2] K. Hoang and M. D. Johannes, Defect physics in complex
energy materials, J. Phys.: Condens. Matter 30, 293001
(2018).
[3] J. Paier, C. Penschke, and J. Sauer, Oxygen Defects and
Surface Chemistry of Ceria: Quantum Chemical Studies
Compared to Experiment, Chem. Rev. 113, 3949 (2013).
[4] R. Schmitt, A. Nenning, O. Kraynis, R. Korobko, A. I.
Frenkel, I. Lubomirsky, S. M. Haile, and J. L. M. Rupp,
A review of defect structure and chemistry in ceria and
its solid solutions, Chem. Soc. Rev. 49, 554 (2020).
[5] E. Shoko, M. Smith, and R. H. McKenzie, Charge distri-
bution and transport properties in reduced ceria phases:
A review, J. Phys. Chem. Solids 72, 1482 (2011).
[6] R. N. Blumenthal and R. L. Hofmaier, The Temperature
and Compositional Dependence of the Electrical Conduc-


---

## Page 8

8
tivity of Nonstoichiometric CeO2−x, J. Electrochem. Soc.
121, 126 (1974).
[7] H. Tuller and A. Nowick, Small polaron electron trans-
port in reduced CeO2 single crystals, J. Phys. Chem.
Solids 38, 859 (1977).
[8] I. Naik and T. Tien, Small-polaron mobility in nonstoi-
chiometric cerium dioxide, J. Phys. Chem. Solids 39, 311
(1978).
[9] K. Lee, S. Kim, S. Sun, G. Lee, J. Kwon, J. Hwang,
J. Seo,
U. Paik, and T. Song, Hydrogenated ceria
nanoparticles for high-eﬃciency silicate adsorption, New
J. Chem. 46, 20572 (2022).
[10] J. Fierro, J. Soria, J. Sanz, and J. Rojo, Induced changes
in ceria by thermal treatments under vacuum or hydro-
gen, J. Solid State Chem. 66, 154 (1987).
[11] L. A. Bruce, M. Hoang, A. E. Hughes, and T. W. Turney,
Surface area control during the synthesis and reduction
of high area ceria catalyst supports, Appl. Catal. A: Gen.
134, 351 (1996).
[12] W. Mao, W. Gong, Z. Gu, M. Wilde, J. Chen, K. Fuku-
tani, H. Matsuzaki, B. Fugetsu, I. Sakata, and T. Terai,
Hydrogen diﬀusion in cerium oxide thin ﬁlms fabricated
by pulsed laser deposition, Int. J. Hydrogen Energy 50,
969 (2024).
[13] S. Zhang, C. Zhao, Y. Liu, W. Li, J. Wang, G. Wang,
Y. Zhang, H. Zhang, and H. Zhao, Cu doping in CeO2
to form multiple oxygen vacancies for dramatically en-
hanced ambient N2 reduction performance, Chem. Com-
mun. 55, 2952 (2019).
[14] K. S. Ranjith, C.-L. Dong, Y.-R. Lu, Y.-C. Huang, C.-L.
Chen, P. Saravanan, K. Asokan, and R. T. Rajendra Ku-
mar, Evolution of Visible Photocatalytic Properties of
Cu-Doped CeO2 Nanoparticles: Role of Cu2+-Mediated
Oxygen Vacancies and the Mixed-Valence States of Ce
Ions, ACS Sustain. Chem. Eng. 6, 8536 (2018).
[15] E. Sartoretti, C. Novara, M. C. Paganini, M. Chiesa,
M. Castellino, F. Giorgis, M. Piumetti, S. Bensaid,
D. Fino, and N. Russo, Investigation of Cu-doped ce-
ria through a combined spectroscopic approach: Involve-
ment of diﬀerent catalytic sites in CO oxidation, Catal.
Today 420, 114037 (2023).
[16] A.
Dav´o-Qui˜nonero,
E.
Bail´on-Garc´ıa,
S.
L´opez-
Rodr´ıguez, J. Juan-Juan, D. Lozano-Castell´o, M. Garc´ıa-
Melchor, F. C. Herrera, E. Pellegrin, C. Escudero, and
A. Bueno-L´opez, Insights into the Oxygen Vacancy Fill-
ing Mechanism in CuO/CeO2 Catalysts:
A Key Step
Toward High Selectivity in Preferential CO Oxidation,
ACS Catal. 10, 6532 (2020).
[17] K. Polychronopoulou, A. A. AlKhoori, A. M. Efstathiou,
M. A. Jaoude, C. M. Damaskinos, M. A. Baker, A. Al-
mutawa, D. H. Anjum, M. A. Vasiliades, A. Belabbes,
L. F. Vega, A. F. Zedan, and S. J. Hinder, Design As-
pects of Doped CeO2 for Low-Temperature Catalytic CO
Oxidation: Transient Kinetics and DFT Approach, ACS
Appl. Mater. Interfaces 13, 22391 (2021).
[18] G. Wrobel, C. Lamonier, A. Bennani, A. D’Huysser, and
A. Abouka¨ıs, Eﬀect of incorporation of copper or nickel
on hydrogen storage in ceria. Mechanism of reduction, J.
Chem. Soc., Faraday Trans. 92, 2001 (1996).
[19] A. Thurber, K. M. Reddy, V. Shutthanandan, M. H. En-
gelhard, C. Wang, J. Hays, and A. Punnoose, Ferromag-
netism in chemically synthesized CeO2 nanoparticles by
Ni doping, Phys. Rev. B 76, 165206 (2007).
[20] W. Derafa, F. Paloukis, B. Mewafy, W. Baaziz, O. Ersen,
C. Petit, G. Corbel, and S. Zafeiratos, Synthesis and
characterization of nickel-doped ceria nanoparticles with
improved surface reducibility, RSC Adv. 8, 40712 (2018).
[21] K. Fuda, K. Kishio, S. Yamauchi, K. Fueki, and Y. On-
oda,
17O NMR study of Y2O3-doped CeO2, J. Phys.
Chem. Solids 45, 1253 (1984).
[22] D. Y. Wang, D. Park, J. Griﬃth, and A. Nowick, Oxygen-
ion conductivity and defect interactions in yttria-doped
ceria, Solid State Ion. 2, 95 (1981).
[23] W. Lee, S.-Y. Chen, Y.-S. Chen, C.-L. Dong, H.-J. Lin,
C.-T. Chen, and A. Gloter, Defect Structure Guided
Room Temperature Ferromagnetism of Y-Doped CeO2
Nanoparticles, J. Phys. Chem. C 118, 26359 (2014).
[24] N. V. Skorodumova, S. I. Simak, B. I. Lundqvist, I. A.
Abrikosov, and B. Johansson, Quantum Origin of the
Oxygen Storage Capability of Ceria, Phys. Rev. Lett. 89,
166601 (2002).
[25] P. R. L. Keating, D. O. Scanlon, B. J. Morgan, N. M.
Galea, and G. W. Watson, Analysis of Intrinsic Defects
in CeO2 Using a Koopmans-Like GGA+U Approach, J.
Phys. Chem. C 116, 2443 (2012).
[26] T. Zacherle, A. Schriever, R. A. De Souza, and M. Mar-
tin, Ab initio analysis of the defect structure of ceria,
Phys. Rev. B 87, 134104 (2013).
[27] B. Huang, R. Gillen, and J. Robertson, Study of CeO2
and Its Native Defects by Density Functional Theory
with Repulsive Potential, J. Phys. Chem. C 118, 24248
(2014).
[28] J. J. Plata, A. M. M´arquez, and J. F. Sanz, Electron
Mobility via Polaron Hopping in Bulk Ceria: A First-
Principles Study, J. Phys. Chem. C 117, 14502 (2013).
[29] L. Sun, X. Huang, L. Wang, and A. Janotti, Disentan-
gling the role of small polarons and oxygen vacancies in
CeO2, Phys. Rev. B 95, 245101 (2017).
[30] L. Sun and B. Yildiz, Solubility Limit of Cu and Fac-
tors Governing the Reactivity of Cu–CeO2 Assessed from
First-Principles Defect Chemistry and Thermodynamics,
J. Phys. Chem. C 123, 399 (2019).
[31] L. Sun, X. Hao, Q. Meng, L. Wang, F. Liu, and M. Zhou,
Polaronic Resistive Switching in Ceria-Based Memory
Devices, Adv. Electron. Mater. 5, 1900271 (2019).
[32] X. Zhang, L. Zhu, Q. Hou, J. Guan, Y. Lu, T. W. Keal,
J. Buckeridge, C. R. A. Catlow, and A. A. Sokol, Toward
a Consistent Prediction of Defect Chemistry in CeO2,
Chem. Mater. 35, 207 (2023).
[33] K. Sohlberg, S. T. Pantelides, and S. J. Pennycook, In-
teractions of Hydrogen with CeO2, J. Am. Chem. Soc.
123, 6609 (2001).
[34] J. C. Stimac and N. Goldman, Quantum Calculations of
Hydrogen Absorption and Diﬀusivity in Bulk CeO2, ACS
Omega 10, 12385 (2025).
[35] X. Wang, M. Shen, J. Wang, and S. Fabris, Enhanced
Oxygen Buﬀering by Substitutional and Interstitial Ni
Point Defects in Ceria:
A First-Principles DFT+U
Study, J. Phys. Chem. C 114, 10221 (2010).
[36] V. I. Anisimov, J. Zaanen, and O. K. Andersen, Band
theory and Mott insulators: Hubbard U instead of Stoner
I, Phys. Rev. B 44, 943 (1991).
[37] A. I. Liechtenstein, V. I. Anisimov, and J. Zaanen,
Density-functional theory and strong interactions: Or-
bital ordering in Mott-Hubbard insulators, Phys. Rev. B
52, R5467 (1995).
[38] J. Heyd, G. E. Scuseria, and M. Ernzerhof, Hybrid func-
tionals based on a screened Coulomb potential, J. Chem.


---

## Page 9

9
Phys. 118, 8207 (2003).
[39] J. Paier, M. Marsman, K. Hummer, G. Kresse, I. C. Ger-
ber, and J. G. ´Angy´an, Screened hybrid density function-
als applied to solids, J. Chem. Phys. 124, 154709 (2006).
[40] P. E. Bl¨ochl, Projector augmented-wave method, Phys.
Rev. B 50, 17953 (1994).
[41] G. Kresse and J. Hafner, Ab initio molecular dynamics
for liquid metals, Phys. Rev. B 47, 558 (1993).
[42] G. Kresse and J. Furthm¨uller, Eﬃcient iterative schemes
for ab initio total-energy calculations using a plane-wave
basis set, Phys. Rev. B 54, 11169 (1996).
[43] G. Kresse and J. Furthm¨uller, Eﬃciency of ab-initio total
energy calculations for metals and semiconductors using
a plane-wave basis set, Comput. Mat. Sci. 6, 15 (1996).
[44] C. G. Van de Walle and J. Neugebauer, First-principles
calculations for defects and impurities: Applications to
III-nitrides, J. Appl. Phys. 95, 3851 (2004).
[45] C. Freysoldt, B. Grabowski, T. Hickel, J. Neugebauer,
G. Kresse, A. Janotti, and C. G. Van de Walle, First-
principles calculations for point defects in solids, Rev.
Mod. Phys. 86, 253 (2014).
[46] C. Freysoldt, J. Neugebauer, and C. G. Van de Walle,
Fully ab initio ﬁnite-size corrections for charged-defect
supercell calculations, Phys. Rev. Lett. 102, 016402
(2009).
[47] M. W. Chase, Jr., NIST-JANAF Themochemical Tables,
Fourth Edition (J. Phys. Chem. Ref. Data, Monograph
9, 1998) pp. 1–1951.
[48] K. M. Rosso, D. M. A. Smith, and M. Dupuis, An ab
initio model of electron transport in hematite (α-Fe2O3)
basal planes, J. Chem. Phys. 118, 6455 (2003).
[49] G. Henkelman, B. P. Uberuaga, and H. J´onsson, A climb-
ing image nudged elastic band method for ﬁnding saddle
points and minimum energy paths, J. Chem. Phys. 113,
9901 (2000).
[50] J. P. Perdew, K. Burke, and M. Ernzerhof, Generalized
gradient approximation made simple, Phys. Rev. Lett.
77, 3865 (1996).
[51] C. W. M. Castleton, A. Lee, and J. Kullgren, Benchmark-
ing Density Functional Theory Functionals for Polarons
in Oxides: Properties of CeO2, J. Phys. Chem. C 123,
5164 (2019).
[52] K. Hoang, Tuning the valence and concentration of eu-
ropium and luminescence centers in GaN through co-
doping and defect association, Phys. Rev. Materials 5,
034601 (2021).
[53] M. L. Gupta and S. Singh, Thermal Expansion of CeO2,
Ho2O3, and Lu2O3 from 100◦to 300◦K by an X-Ray
Method, J. Am. Ceram. Soc. 53, 663 (1970).
[54] M. Gajdoˇs, K. Hummer, G. Kresse, J. Furthm¨uller, and
F. Bechstedt, Linear optical properties in the projector-
augmented wave methodology, Phys. Rev. B 73, 045112
(2006).
[55] S. Lany, Chemical Potential Analysis as an Alternative
to the van’t HoﬀMethod: Hypothetical Limits of So-
lar Thermochemical Hydrogen, J. Am. Chem. Soc. 146,
14114 (2024).
[56] K. Momma and F. Izumi, VESTA3 for three-dimensional
visualization of crystal, volumetric and morphology data,
J. Appl. Cryst. 44, 1272 (2011).
[57] E. Mamontov and T. Egami, Structural defects in a nano-
scale powder of CeO2 studied by pulsed neutron diﬀrac-
tion, J. Phys. Chem. Solids 61, 1345 (2000).
[58] S. Luo, M. Li, V. Fung, B. G. Sumpter, J. Liu, Z. Wu,
and K. Page, New Insights into the Bulk and Surface
Defect Structures of Ceria Nanocrystals from Neutron
Scattering Study, Chem. Mater. 33, 3959 (2021).
[59] H. F. Wardenga and A. Klein, Surface potentials of (111),
(110) and (100) oriented CeO2−x thin ﬁlms, Appl. Surf.
Sci. 377, 1 (2016).
[60] A. Crovetto, C. Yan, B. Iandolo, F. Zhou, J. Stride,
J. Schou, X. Hao, and O. Hansen, Lattice-matched
Cu2ZnSnS4/CeO2 solar cell with open circuit voltage
boost, Appl. Phys. Lett. 109, 233904 (2016).
[61] H. L. Tuller and A. S. Nowick, Defect Structure and Elec-
trical Properties of Nonstoichiometric CeO2 Single Crys-
tals, J. Electrochem. Soc. 126, 209 (1979).
[62] A. T. Nelson, D. R. Rittman, J. T. White, J. T. Dun-
woody, M. Kato, and K. J. McClellan, An Evaluation of
the Thermophysical Properties of Stoichiometric CeO2 in
Comparison to UO2 and PuO2, J. Am. Ceram. Soc. 97,
3652 (2014).
[63] K. Huang, M. Feng, and J. B. Goodenough, Synthesis
and Electrical Properties of Dense Ce0.9Gd0.1O1.95 Ce-
ramics, J. Am. Ceram. Soc. 81, 357 (1998).
[64] B. Steele, Appraisal of Ce1−yGdyO2−y/2 electrolytes for
IT-SOFC operation at 500◦C, Solid State Ion. 129, 95
(2000).
[65] W. Lai and S. M. Haile, Impedance Spectroscopy as a
Tool for Chemical and Electrochemical Analysis of Mixed
Conductors: A Case Study of Ceria, J. Am. Ceram. Soc.
88, 2979 (2005).
[66] N. Sakai, K. Yamaji, T. Horita, H. Yokokawa, Y. Hirata,
S. Sameshima, Y. Nigara, and J. Mizusaki, Determina-
tion of hydrogen solubility in oxide ceramics by using
SIMS analyses, Solid State Ion. 125, 325 (1999).
[67] Z. Wu, Y. Cheng, F. Tao, L. Daemen, G. S. Foo,
L. Nguyen, X. Zhang, A. Beste, and A. J. Ramirez-
Cuesta, Direct Neutron Spectroscopy Observation of
Cerium Hydride Species on a Cerium Oxide Catalyst,
J. Am. Chem. Soc. 139, 9721 (2017).
[68] R. D. Shannon, Revised eﬀective ionic radii and sys-
tematic studies of interatomic distances in halides and
chalcogenides, Acta Crystallogr., Sect. A: Found. Crys-
tallogr. 32, 751 (1976).
