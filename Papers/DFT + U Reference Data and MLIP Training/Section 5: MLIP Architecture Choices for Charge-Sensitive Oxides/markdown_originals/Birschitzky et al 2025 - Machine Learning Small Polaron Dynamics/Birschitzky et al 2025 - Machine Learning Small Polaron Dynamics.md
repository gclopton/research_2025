---
citekey: birschitzkyMachineLearningSmall2025
doi: 10.1103/PhysRevLett.134.216301
zotero_item_type: journalArticle
source_version: arXiv author version; journal metadata used for citation
---

# Machine Learning Small Polaron Dynamics 

Viktor C. Birschitzky*, ${ }^{1}$ Luca Leoni*, ${ }^{2}$ Michele Reticcioli, ${ }^{1}$ and Cesare Franchini ${ }^{1,2}$<br>${ }^{1}$ University of Vienna, Faculty of Physics and Center for Computational Materials Science, Vienna, Austria<br>${ }^{2}$ Department of Physics and Astronomy "Augusto Righi", Alma Mater Studiorum - Università di Bologna, Bologna, 40127 Italy


#### Abstract

Polarons are crucial for charge transport in semiconductors, significantly impacting material properties and device performance. The dynamics of small polarons can be investigated using first-principles molecular dynamics (FPMD). However, the limited timescale of these simulations presents a challenge for adequately sampling infrequent polaron hopping events. Here, we introduce a message-passing neural network combined with FPMD within the Born-Oppenheimer approximation, that learns the polaronic potential energy surface by encoding the polaronic state, allowing for simulations of polaron hopping dynamics at the nanosecond scale. By leveraging the statistical significance of the long timescale, our framework can accurately estimate polaron (anisotropic) mobilities and activation barriers in prototypical polaronic oxides across different scenarios (hole polarons in rocksalt MgO and electron polarons in pristine and F-doped rutile $\mathrm{TiO}_{2}$ ) within exper-imentally measured ranges.


Introduction. A small polaron is a spatially localized quasiparticle that forms in polarizable materials due to the attraction of an excess charge carrier to its own self-induced lattice distortion. [1-5]. When thermally activated, small polarons can travel through the crystal, constituting one of the primary charge transport mechanisms. In addition, they play a crucial role in various physical and technologically significant processes, such as optical excitations [6-8], (photo)catalysis [9-12], photovoltaic applications [13] and device functioning [14]. Several theories have been developed to understand and predict small polaron mobility [5] including Marcus-Emin-Holstein-Austin-Mott (MEHAM) theory [15-19], density functional theory (DFT) [20, 21], Diagrammatic Monte Carlo [22] and dynamical mean field theory [23]. Moreover, alternative approaches have been proposed to study large or intermediate polaron mobility [5, 24-30].

Small polaron transfer can occur either via hopping mechanism or through delocalization in the conduction band. [31-33] As depicted in Fig. 1(a), thermally activated small polaron hopping is either adiabatic or diabatic, depending on the strength of the electronic coupling between the initial and final states. In the adiabatic regime, the polaron charge transfers smoothly to a neighboring site, while in the diabatic regime, the charge is transferred instantaneously [16, 19]. Unlike conduction band diffusion, for which mobility is difficult to estimate [34], polaron hopping mobility can be obtained using MEHAM theory and the Einstein relation [35], typically by calculating the activation energy through quasi-static linear interpolation between initial and final states along specific polaron transport paths [20]. While MEHAM-theory allows for a rigorous treatment of the electronic coupling of initial and final states and quantitatively describes both adiabatic and diabatic polaron transfer, the approach limits the comprehensive exploration of diffusion pathways and introduces approximations for the pre-exponential factor [33].

The dynamical aspects of polarons can be explored using first principles molecular dynamics (FPMD), which is typically based on DFT within the Born-Oppenheimer (BO) approximation. FPMD has proven highly successful in assessing dynamical properties of materials [36] and has been extensively used to study small polarons, offering insights into their activation energies, hopping dynamics, configurational space and charge recombination [21, 37-44]. While a rigorous treatment of diabatic electron transfer (i.e., tunneling) requires methods beyond the BO approximation [20, 45-47], FPMD remains a powerful tool for accurately describing adiabatic electron transfer. FPMD can qualitatively capture diabatic transfer (hopping from one polaronic potential energy surface to another) when the transfer occurs rapidly enough [48]. However, despite its renowned computational efficiency, FPMD is limited by the accessible timescale, typically spanning only a few picoseconds.

Since the pioneering works on neural network potentials [49] and Gaussian approximation potentials [50], machine learning (ML) has transformed FPMD [51, 52]. Contemporary ML-based potential energy surface (PES) models often employ message-passing neural networks (MPNN) and incorporate equivariance into their architecture [53, 54], enhancing both accuracy and data efficiency in learning the PES. These models enable the assessment of material properties at a fraction of the cost of direct DFT evaluation, extending simulation times or system sizes while preserving DFT accuracy.

Enhancing the capability of ML-based MD (MLMD) to account for polaron dynamics is complex and remains an open challenge. While effects such as the prediction of local magnetic moments [55] and non-local charge transfer [56] have been incorporated into ML-based force fields using local environment descriptors, these methods do not explicitly enforce charge conservation, rendering them unsuitable for simulating small polaron dynamics. To address charge conservation, global charge

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-02_913_699_171_264.jpg)
FIG. 1: (a) Schematic description of adiabatic and non-adiabatic hopping transitions from one site to its neighbor, with activation energy $E_{a}^{\text {adia }}$ and $E_{a}^{\text {dia }}$. Small filled circles symbolize lattice sites, whereas the light clouds represent the polaron charge. (b) Overview of workflow and model architecture. The left side shows the applied MLMD workflow, where predicted energies $E$ and forces F are used to integrate the nuclei's equations of motion, while predicted occupations $\operatorname{Tr}\left[\mathbf{n}_{i}^{\sigma}\right]$ and derived magnetizations m determine the charge state $\mathbf{c}^{j+1}$ at the next timestep. The right side shows the model architecture of Leopold. Positions $\mathbf{r}^{j}$, nuclear charges Z, and charge states $\mathbf{c}^{j}$ are fed into the neural network. The polaron encoding appends the one-hot-encoded nuclear charge $Z_{j}$ and charge state $c_{j}$ of each atom to represent the polaronic state of the system (the zoom-in shows possible vectors in a binary polaronic compound, where $Z_{n}^{\text {pol }}$ encodes a polaronic atom).

equilibration schemes have been proposed that allocate charge based on the electronegativity at each site [57, 58]. However, these approaches may lead to unphysical charge transport mechanisms due to their global nature and the potential for spurious responses to thermal fluctuations in local environments.

In this letter, we present the ML package Leopold (LEarning Of POLaron Dynamics), designed to accurately model small polaron dynamics. The architecture, implemented in JAX [59], is built on a modified version of the Neural Equivariant Interatomic Potential (NequIP) architecture [54] trained on Vienna Ab initio Simulation Package (VASP) data [60, 61]. We introduce two key features to account for polaron transport: (i) explicit charge state encoding [62] to ensure charge conservation and identify polaronic sites, and (ii) direct prediction of site occupation to track polaron hopping and regularize the descriptor [56]. The model is assessed by considering three different systems: hole polaron in rocksalt $\mathrm{MgO}\left(\mathrm{MgO}+\mathrm{h}^{+}\right.$in oxygen $p$ orbitals $)$, electron polaron in rutile $\mathrm{TiO}_{2}\left(\mathrm{TiO}_{2}+\mathrm{e}^{-}\right.$in titanium $d$ orbitals), and combined electron polaron-defect dynamics in F-doped $\mathrm{TiO}_{2}\left(\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}\right)$. To describe the coupled dopantpolaron system, we employ an active learning scheme that effectively addresses the configurational sampling problem and accurately reproduces the correct polaron distribution in a defective system (see SM for details on the employed methodology [63]). Our approach can predict polaron hopping events, thereby enhancing the sampling of hopping trajectories and enabling nanosecondscale simulations to extract polaronic mobility, activation energies $\left(E_{\mathrm{a}}\right)$, and transition pathways.

Model. Most ML models, including MPNNs, distinguish atoms based on their chemical species using a onehot encoded vector of the nuclear charge $Z_{i}$ but do not account for oxidation states. Since small polarons discretely alter the oxidation state by ±1, we can encode each atom's charge state in the input one-hot-encoded vector of Leopold. The charge state c is determined through the following relation:

$$
c_{i}= \begin{cases}1, & \text { if } i=\arg \max _{j}\left|m_{j}\right| \\ 0, & \text { otherwise }\end{cases}
$$

where $c_{i}$ is the charge state of atom $i$ ( $c_{i}=1$ for polaronic site, 0 for non-polaronic sites) and $m_{j}$ is the magnetization of atom $j$. In the "polaron encoding" (as shown in Figure 1b), the value $c_{i}$ is appended to the one-hot encoded vector representing the species of atom $i$. The resulting encoding vectors in a polaronic binary compound is a three-dimensional vector (e.g., in $\mathrm{TiO}_{2}: \mathrm{Ti}=(1,0,0)$, $\left.\mathrm{O}=(0,1,0), \mathrm{Ti}^{\mathrm{pol}}=(1,0,1)\right)$. The description can easily be generalized to systems with $n$ polarons by assigning $c_{i}=1$ to the $n$ maximally magnetized atoms.

Polarons can hop to adjacent sites when more favorable local bonding geometries enhance the adiabatic electronic coupling. To capture these dynamics, which are not reflected in the discrete encoding of charge states, Leopold learns the local charge occupation of each site through the architecture reported in Fig. 1(b). This approach serves two key purposes: it enables tracking and updating of the polaronic states, while also regularizing the learned representation to incorporate polaronic state information. This is done by learning the occupation matrix n, defined as:

$$
n_{l m m^{\prime}}^{\sigma}=\sum_{i} f_{i}\left\langle\psi_{i}^{\sigma}\right| P_{l m m^{\prime}}^{\sigma}\left|\psi_{i}^{\sigma}\right\rangle
$$

where $\psi_{i}$ are the Kohn-Sham states, $f_{i}$ their occupations, $l$ the atom index, $m$ the specific projector function, and $\sigma$
the spin channel. We use $p$-state-projectors for $\mathrm{MgO}+\mathrm{h}^{+}$ and $d$-state-projectors for pristine and F -doped $\mathrm{TiO}_{2}$, as defined in DFT+U [64]. We checked that, instead of predicting the full occupation matrix, it is sufficient to learn the invariant atomic quantity $\operatorname{Tr}\left[\mathbf{n}_{i}^{\sigma}\right]$ for each atom $i$ and spin channel $\sigma$, denoted as $n_{i}^{\sigma}$. Since small polarons carry a spin, to stabilize the prediction of the charge occupations, we impose constraints ensuring that the total occupation $n_{i}^{\uparrow}+n_{i}^{\downarrow}$, the magnetization $n_{i}^{\uparrow}-n_{i}^{\downarrow}=m_{i}$, and the total magnetization of the system $\sum_{i} n_{i}^{\uparrow}-n_{i}^{\downarrow}$ are also fitted to the reference data. For details on the machine learning methodology see the SM [63].

Results. Fig. 2(a) displays a hopping event - as generated by Leopold in an MLMD-simulation and reproduced in DFT - based on the dynamical magnetization and demagnetization of two neighboring sites in $\mathrm{MgO}+\mathrm{h}^{+}$(other site's magnetizations are close to 0 and omitted for clarity). Initially $(t=0)$, the polaron charge is localized on one site and becomes progressively destabilized due to thermal motion. At the crossing point, the polaron is shared between two sites until it fully localizes on the final site ( $t \approx 40 \mathrm{fs}$ ). To accurately reproduce these hopping processes by our ML model, we initially train Leopold on one FPMD run unavoidably including only a few hopping events and concurrently use the trained model to simulate polaron dynamics in an ML-based MD run. As hopping is a relatively rare event in the ps time-scale, the initial dataset may not capture all possible transition pathways. To address this, we employ an active learning scheme by extracting hopping processes from the ML-based run and calculating them at the reference $\mathrm{DFT}+U$ level. This extended dataset is then used to retrain the model iteratively. While this approach is not necessarily comprehensive, we found that after a few active learning loops, hopping events were well sampled and the model did not produce new symmetrically-inequivalent transition pathways.

The results are presented in Fig. 2(b), showing the local magnetization of sites involved in hopping events as produced by Leopold and confirmed by DFT for $\mathrm{MgO}+\mathrm{h}^{+}$. Achieved errors are within the expected ranges [55, 56] as detailed in the SM [63]. From approximately 50 hopping events extracted at temperatures ranging from 100 K to 600 K from 10 ns MLMD runs, we identified two key characteristics of the hopping behavior in $\mathrm{MgO}+\mathrm{h}^{+}$: (i) In the rocksalt octahedral symmetry, the oxygen $p$-states hosting the hole polaron are three-fold degenerate, which allows for only one symmetrically inequivalent nearest-neighbor hopping pathway along the [110] direction; (ii) The polaronic transition between sites occurs adiabatically [16] following an hopping mechanism similar to the one shown in Fig. 2(a).

In contrast, rutile $\mathrm{TiO}_{2}$ exhibits more complex structural symmetries and hopping processes. Figs. 2(c-d) summarize the results, where we focus our discussion to the [001], [110] and [111] hoping paths within a single $(1 \overline{1} 0)$ plane for simplicity. The electron polaron occupies a single $t_{2 g}$ orbital, where the triple degeneracy is lifted by an axial elongation of the octahedron [65, 66]. This orbital symmetry favors polaron migration along the [001] and [110] pathways. Polaron transport along [111] requires a 90-degree rotation of the polaron orientation, making these transport directions less probable [20]. These considerations are well reflected in our MLMD data at high temperatures, showing 74.3\% of transitions along the [001] direction, 25.5\% along the [110] direction, and 0.2\% along the [111] direction.

Interestingly, unlike MgO, hops along both adiabatic and diabatic transition pathways (as previously determined by MEHAM-theory [20]) are observed. To better describe these different processes, we performed quasi static calculations, i.e., we calculated energy and polaron localization on structures obtained by linear interpolation of atomic coordinates between initial and final states. As shown in Fig. 2(d) the ML results are in excellent agreement with DFT calculations. Transport along the dominant [001] direction is adiabatic, as deduced by the continuous change of the site-projected magnetization during the hopping process for intermediate interpolated structures between nearest neighbour Ti sites (see gradient bar in Fig. 2(d) or the SM [63]). Transitions along the less favorable [110] direction between third nearest-neighbor Ti sites can still be classified as adiabatic, as indicated by the smooth charge transfer, as depicted by the color coding in Fig. 2(d). However, the electronic coupling between the initial and final states, which are $6.4 \AA$ apart, is low, as suggested by the more pronounced peak in the corresponding energy curve. The less frequent migration pathway along the [111] direction, which requires a modification of the polaron orbital symmetry, is characterized by a diabatic process [20], associated with a sudden change in the magnetic moment and instantaneous hop from the initial and final states.

Remarkably, even though electron delocalization associated with migrations along the [110] and [111] directions is not fully captured by our integer charge state assumption, Leopold is still able to qualitatively reproduce the relative frequency of adiabatic and diabatic events [20]. In particular, while the hopping events that exhibit some degree of charge delocalization may cause nonphysical oscillations in our ML model, they remain meaningful as long as the final localization site is consistent with DFT predictions and the transition features a well-sampled energetic barrier. Furthermore, the small time scale of unphysical oscillations, compared to the large time scales considered, renders the impact on physical observables computed on the obtained polaron trajectory insignificant (see the SM for further discussion[63])

The polaron transport data generated by Leopold enable an accurate evaluation of diffusion properties. By using statistical quantities such as the mean squared displacement (MSD) (see SM for details [63]), we can evalu-

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-04_967_1423_175_355.jpg)
FIG. 2: Polaron hopping from ML and DFT for hole polarons in MgO and electron polarons in $\mathrm{TiO}_{2}$. (a) Hopping event extracted from MLMD through the evolution of the local site-projected magnetization $m$. Polaron charge isosurfaces are shown for the initial, intermediate (crossing point), and final states. (b) Comparison of $m_{\mathrm{DFT}}$ and $m_{\mathrm{ML}}$ of 50 hopping events extracted from MLMD at various temperatures. $m$ is only displayed for the involved sites ( $m>0.3$ at any timestep in the hopping event) and the data point density is encoded via the color scale. (c) Possible polaron transitions to neighboring sites along three different directions ([001], [110], [111]) in $\mathrm{TiO}_{2}$ shown for a single $\mathrm{TiO}_{2}(1 \overline{1} 0)$ layer. (d) Comparison between DFT (full lines, square marker) and ML (dashed lines, round marker) activation energies for the three different transition directions as approximated by linear interpolation. The color code indicates the site-projected charge localization defined through the magnetization $m$ as $\left(m_{\text {final }}-m_{\text {initial }}+1\right) / 2$ (0=full localization on the initial site, $1=$ full localization on the final site). At DFT-level [001] and [110] pathways show adiabatically coupled transition states (polaron shared between initial and final sites), while [111] transition is characterized by an instantaneous hopping at the crossing point.

ate polaron mobility and activation energies, refining the results obtained by quasi-statical models. Fig. 3 collects the mobility computed from NVT simulations at various temperatures in $\mathrm{MgO}, \mathrm{TiO}_{2}$ and $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ for up to 10 ns. Mobility increases with temperature, as expected for small polaron transport [5]. The predicted $\mu$ and $E_{\mathrm{a}}$ for rutile $\mathrm{TiO}_{2}$ fall within the experimentally reported range of $0.01-10.0 \mathrm{~cm}^{2} / \mathrm{Vs}$ [67-71] and agree with previous MEHAM theory work [20]. The reduced mobility in $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ is attributed to the attractive interaction between electron polarons and positively charged defects, which typically decreases polaron diffusion. Activation energies in $\mathrm{TiO}_{2}+\mathrm{e}^{-}$align with theoretical values nudged elastic band (NEB) calculations ( $E_{\mathrm{a}}=58 \mathrm{meV}$ using hybrid functional) [67]. We note that our model takes into account several types of hopping processes, with different energy barriers, while quasi-static approaches typically consider only one or few processes. Near room temperature conductivity measurements for MgO reported difficulties in obtaining reproducible results [72-74], but activation energies from MLMD simulations agree well with theoretical values based on NEB for $\mathrm{MgO}+\mathrm{h}^{+}$[72] $\left(E_{\mathrm{a}}=110 \mathrm{meV}\right)$.

We now consider in greater detail a more realistic scenario in which the excess charge forming the polaron is introduced via chemical doping, specifically by substituting an oxygen atom with a fluorine atom in rutile $\mathrm{TiO}_{2}$ $\left(\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}\right)$. In this case, identifying polaronic configurations requires a specialized approach to capture the complex interactions between polarons and defects, and to determine the most favorable polaron-defect coupled configuration. [75-78].

Polaron trajectory data collected from 10 ns MLMD simulations indicate a strong attractive interaction between the mobile electron polaron and the immobile fluorine impurity, as suggested by the short distance peak

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-05_608_661_186_282.jpg)
FIG. 3: Polaron mobility $\mu$ extracted from the MSD through the Einstein-relation from ns MLMD NVT-simulations at various temperatures for $\mathrm{TiO}_{2}+\mathrm{e}^{-}$, $\mathrm{MgO}+\mathrm{h}^{+}$and $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$.

in the polaron-fluorine radial distribution function shown in Fig. 4(a). The attractive interaction between the electron polaron and the positively charged F defect is evident in the tendency of the polaron to remain near the F defect, restricting its movement within the ( $1 \overline{1} 0$ ) basal plane containing the F atom. The polaron probability distribution displayed in Fig. 4(b) reveals that the polaron predominantly occupies the Ti sites along the [001] direction adjacent to the F defect. As the temperature increases, the probability of the polaron visiting other sites, including adjacent planes, also increases. However, the short-distance polaron-F complex remains the most favorable configuration. This result is in good agreement with previous experiments based on electron paramagnetic resonance and electron-nuclear double resonance, which identified the polaronic ground state at low temperatures as the $\mathrm{Ti}^{3+}$ ion adjacent to a $\mathrm{F}^{-}$ion [65].

Finally, we show the direction resolved analysis of polaron mobility on $(1 \overline{1} 0)$ plane. The resulting polar plot displayed in in Fig. 4(c) indicates a strong anisotropy with a preference of the polaron to diffuse in the [001] in agreement with the direction-dependent activation energies in $\mathrm{TiO}_{2}$ shown in Fig 2(d). This behavior is in very good agreement with bulk conductivity measurement [79].

Conclusions. To conclude, we developed a machine learning approach to study small polarons dynamics at the nanosecond time scale. Training our model on polaronic FPMD data reproduces the adiabatic and diabatic polaron transport in two structurally different polaronic materials, MgO and $\mathrm{TiO}_{2}$, capturing both electron and hole polaron dynamics, as well as polaron-defect correlation. Our model enables an efficient and comprehensive exploration of polaron hopping pathways, providing

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-05_947_682_187_1188.jpg)
FIG. 4: Polaron-Defect-Interaction and charge mobility anisotropy in $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ from 10 ns long MLMD at different temperatures. (a) F-polaron distance distribution; light (yellow) and dark (pink) planes show contributions from different planes highlighting preferential polaron localization in the F-aligned $(110)_{\mathrm{F}}$-plane and increasing inter-layer mobility with rising temperature. (b) Layer-projected site distributions of polaron in $(110)_{\mathrm{F}}$. Innermost circles show distribution at 200 K and consecutively larger circles show distribution at 300, 400, 500, and 600 K. (c) Polar plot of the polaron mobility $\mu$ in the $(110)_{\mathrm{F}}$-plane at different temperatures along [001] and [110] directions.

substantially increased statistical sampling compared to first-principles MD and offering a dynamic representation of the hopping process. Mobilities, activation barriers and diffusion anisotropies are in good qualitative agreement with previous theoretical results and explain measured experimental data. The designed ML-aided architecture is general and applicable to other systems including charge transport in organic semiconductors and Li-ion battery materials, and can be extended to even more complex situations, such as multi-polaron systems, surfaces with adsorbates and exciton-polaron materials. More efficient generation of training data could eliminate the need for initial FPMD runs, thereby reducing the number of required DFT calculations, allowing for the use of more accurate functionals and further expanding the length scale. Furthermore, the generality of the model could be enhanced by incorporating diabatic ef-
fects in a more rigorous form by going beyond the BO-approximation.

Acknowledgments - We thank Dominik Freinberger for useful discussions and initial contributions. This research was funded by the Austrian Science Fund (FWF) 10.55776/F81 project TACO. C.F. and L.L. acknowledge support by the National Recovery and Resilience Plan (NRRP), Mission 4 Component 2 Investment 1.3 - Project NEST (Network 4 Energy Sustainable Transition) and CN-HPC grant no. (CUP) J33C22001170001, SPOKE 7, of Ministero dell'Università e della Ricerca (MUR), funded by the European Union - NextGenerationEU. V.B. gratefully acknowledges funding from the Vienna Doctoral School in Physics (VDSP). The computational results presented have been achieved using the Vienna Scientific Cluster (VSC). We acknowledge access to LEONARDO at CINECA, Italy, via an AURELEO (Austrian Users at LEONARDO supercomputer) project. * V.B. and L.L. contributed equally to this work.

Data availability - The supporting data and code for this article will be made available upon publication.

[1] L. D. Landau, Phys. Z. Sowjet. 664 (1933).
[2] S. I. Pekar, Zh. Eksp. Teor. Fiz 16, 341 (1946).
[3] A. S. Alexandrov and J. T. Devreese, Advances in Polaron Physics (Springer, 2010).
[4] A. L. Shluger and A. M. Stoneham, Journal of Physics: Condensed Matter 5, 3049 (1993).
[5] C. Franchini, M. Reticcioli, M. Setvin, and U. Diebold, Nature Reviews Materials (2021), 10.1038/s41578-021-00289-w.
[6] J. B. Varley, A. Janotti, C. Franchini, and C. G. Van de Walle, Phys. Rev. B 85, 081109 (2012).
[7] M. Baskurt, P. Erhart, and J. Wiktor, "Direct, indirect, and self-trapped excitons in $\mathrm{cs}_{2} \mathrm{agbibr}_{6}$," (2024), arXiv:2405.20017 [cond-mat.mtrl-sci].
[8] A. J. Tanner, B. Wen, Y. Zhang, L.-M. Liu, H. H. Fielding, A. Selloni, and G. Thornton, Phys. Rev. B 103, L121402 (2021).
[9] C. Di Valentin, G. Pacchioni, and A. Selloni, The Journal of Physical Chemistry C 113, 20543 (2009).
[10] M. Reticcioli, I. Sokolović, M. Schmid, U. Diebold, M. Setvin, and C. Franchini, Physical Review Letters 122, 016805 (2019).
[11] Z. Ren, Z. Shi, H. Feng, Z. Xu, and W. Hao, Advanced Science n/a, 2305139 (2023).
[12] S. Bandaranayake, A. Patnaik, E. Hruska, Q. Zhu, S. Das, and L. R. Baker, ACS Applied Materials \& Interfaces 16, 41616 (2024), pMID: 39052931.
[13] H. Zhang and N.-G. Park, Journal of Physics: Energy 5, 024002 (2023).
[14] H. D. Luong, T. L. Tran, V. B. T. Phung, and V. A. Dinh, Journal of Science: Advanced Materials and Devices 7, 100410 (2022).
[15] I. Austin and N. Mott, Advances in Physics 18, 41 (1969).
[16] R. Marcus and N. Sutin, Biochimica et Biophysica Acta(BBA) - Reviews on Bioenergetics 811, 265 (1985).
[17] D. Emin and T. Holstein, Annals of Physics 53, 439 (1969).
[18] T. Holstein, Ann. Phys. 8, 343 (1959).
[19] R. A. Marcus, Rev. Mod. Phys. 65, 599 (1993).
[20] N. A. Deskins and M. Dupuis, Physical Review B 75, 195212 (2007).
[21] P. M. Kowalski, M. F. Camellone, N. N. Nair, B. Meyer, and D. Marx, Physical Review Letters 105, 146405 (2010), publisher: American Physical Society.
[22] A. S. Mishchenko, N. Nagaosa, G. De Filippis, A. de Candia, and V. Cataudella, Phys. Rev. Lett. 114, 146401 (2015).
[23] S. Fratini and S. Ciuchi, Phys. Rev. Lett. 91, 256403 (2003).
[24] S. Giannini, A. Carof, M. Ellis, H. Yang, O. G. Ziogos, S. Ghosh, and J. Blumberger, Nature Communications 10, 3843 (2019).
[25] A. Troisi, Chem. Soc. Rev. 40, 2347 (2011).
[26] B. K. Chang, J.-J. Zhou, N.-E. Lee, and M. Bernardi, npj Computational Materials 8, 1 (2022).
[27] M. J. Schilcher, P. J. Robinson, D. J. Abramovitch, L. Z. Tan, A. M. Rappe, D. R. Reichman, and D. A. Egger, ACS Energy Letters 6, 2162 (2021).
[28] J. M. Frost, Phys. Rev. B 96, 195202 (2017).
[29] J.-J. Zhou and M. Bernardi, Phys. Rev. Res. 1, 033138 (2019).
[30] S. Miladić and N. Vukmirović, Phys. Rev. B 107, 184315 (2023).
[31] V. Coropceanu, J. Cornil, D. A. da Silva Filho, Y. Olivier, R. Silbey, and J.-L. Brédas, Chemical Reviews 107, 926 (2007), pMID: 17378615.
[32] F. Ortmann, F. Bechstedt, and K. Hannewald, physica status solidi (b) 248, 511 (2011).
[33] Y. Natanzon, A. Azulay, and Y. Amouyal, Israel Journal of Chemistry 60, 768 (2020).
[34] C. Spreafico and J. VandeVondele, Phys. Chem. Chem. Phys. 16, 26144 (2014).
[35] A. Einstein, Investigations on the Theory of Brownian Movement (Dover Publications, New York, 1956).
[36] R. Car and M. Parrinello, Physical Review Letters 55, 2471 (1985), publisher: American Physical Society.
[37] M. Setvin, C. Franchini, X. Hao, M. Schmid, A. Janotti, M. Kaltak, C. G. Van de Walle, G. Kresse, and U. Diebold, Physical Review Letters 113, 086402 (2014), publisher: American Physical Society.
[38] X. Hao, Z. Wang, M. Schmid, U. Diebold, and C. Franchini, Phys. Rev. B 91, 085204 (2015).
[39] M. Reticcioli, M. Setvin, X. Hao, P. Flauger, G. Kresse, M. Schmid, U. Diebold, and C. Franchini, Physical Review X 7, 031053 (2017), publisher: American Physical Society.
[40] M. Reticcioli, M. Setvin, M. Schmid, U. Diebold, and C. Franchini, Physical Review B 98, 045306 (2018).
[41] D. Zhang, Z.-K. Han, G. E. Murgida, M. V. Ganduglia-Pirovano, and Y. Gao, Phys. Rev. Lett. 122, 096101 (2019).
[42] J. Wiktor, F. Ambrosio, and A. Pasquarello, ACS Energy Letters 3, 1693 (2018).
[43] S. Selcuk and A. Selloni, Nature Materials 15, 1107 (2016).
[44] C. Cheng, Y. Zhu, Z. Zhou, R. Long, and W.-H. Fang, npj Computational Materials 8, 1 (2022), number: 1 Publisher: Nature Publishing Group.

[45] Z.-F. Xu, C.-J. Tong, R.-t. Si, G. Teobaldi, and L.-M. Liu, The Journal of Physical Chemistry Letters 13, 857 (2022), pMID: 35045256, https://doi.org/10.1021/acs.jpclett.1c04231.
[46] Z. Xu, C. Tong, R. Si, G. Teobaldi, and L. Liu, ChemPhysMater 2, 331 (2023).
[47] H.-M. Wang, X.-B. Liu, S.-Q. Hu, D.-Q. Chen, Q. Chen, C. Zhang, M.-X. Guan, and S. Meng, Science Advances 9, eadg3833 (2023), https://www.science.org/doi/pdf/10.1126/sciadv.adg3833.
[48] A. Stuchebrukhov, The Journal of Physical Chemistry B 120, 1408 (2016), pMID: 26322381, https://doi.org/10.1021/acs.jpcb.5b00862.
[49] J. Behler and M. Parrinello, Physical Review Letters 98, 146401 (2007), publisher: American Physical Society.
[50] A. P. Bartók, M. C. Payne, R. Kondor, and G. Csányi, Physical Review Letters 104, 136403 (2010), publisher: American Physical Society.
[51] P. Friederich, F. Häse, J. Proppe, and A. Aspuru-Guzik, Nature Materials 20, 750 (2021), publisher: Nature Publishing Group.
[52] O. T. Unke, S. Chmiela, H. E. Sauceda, M. Gastegger, I. Poltavsky, K. T. Schütt, A. Tkatchenko, and K.-R. Müller, Chemical Reviews 121, 10142 (2021), publisher: American Chemical Society.
[53] I. Batatia, D. P. Kovacs, G. Simm, C. Ortner, and G. Csanyi, Advances in Neural Information Processing Systems 35, 11423 (2022).
[54] S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt, and B. Kozinsky, Nature Communications 13, 2453 (2022), publisher: Nature Publishing Group.
[55] M. Eckhoff, K. N. Lausch, P. E. Blöchl, and J. Behler, The Journal of Chemical Physics 153, 164107 (2020), publisher: American Institute of Physics.
[56] B. Deng, P. Zhong, K. Jun, J. Riebesell, K. Han, C. J. Bartel, and G. Ceder, Nature Machine Intelligence 5, 1031 (2023), publisher: Nature Publishing Group.
[57] T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, Nature Communications 12, 398 (2021), number: 1 Publisher: Nature Publishing Group.
[58] T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, Journal of Chemical Theory and Computation 19, 3567 (2023), pMID: 37289440.
[59] J. Bradbury, R. Frostig, P. Hawkins, M. J. Johnson, C. Leary, D. Maclaurin, G. Necula, A. Paszke, J. Vander-Plas, S. Wanderman-Milne, and Q. Zhang, "JAX: composable transformations of Python+NumPy programs," (2018).
[60] G. Kresse and J. Furthmüller, Phys. Rev. B 54, 11169 (1996).
[61] G. Kresse and J. Furthmüller, Computational Materials Science 6, 15 (1996).
[62] R. Zubatyuk, J. S. Smith, B. T. Nebgen, S. Tretiak, and O. Isayev, Nature Communications 12, 4870 (2021), number: 1 Publisher: Nature Publishing Group.
[63] See Supplemental Material at [URL will be inserted by publisher] for detailed description of the NF architectureand DFT computations, which includes Ref. [70-76].
[64] S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys, and A. P. Sutton, Phys. Rev. B 57, 1505 (1998).
[65] S. Yang and L. E. Halliburton, Physical Review B 81, 035204 (2010), publisher: American Physical Society.
[66] S. Yang, A. T. Brant, N. C. Giles, and L. E. Halliburton, Phys. Rev. B 87, 125201 (2013).
[67] K. Morita, M. J. Golomb, M. Rivera, and A. Walsh, Chemistry of Materials (2023), 10.1021/acs.chemmater.3c00322, publisher: American Chemical Society.
[68] E. Yagi, R. R. Hasiguti, and M. Aono, Phys. Rev. B 54, 7945 (1996).
[69] E. Hendry, F. Wang, J. Shan, T. F. Heinz, and M. Bonn, Phys. Rev. B 69, 081101 (2004).
[70] A. Fujishima, X. Zhang, and D. A. Tryk, Surface Science Reports 63, 515 (2008).
[71] H. Tang, K. Prasad, R. Sanjinès, P. E. Schmid, and F. Lévy, Journal of Applied Physics 75, 2042 (1994).
[72] J. G. Smith, J. Naruse, H. Hiramatsu, and D. J. Siegel, Chemistry of Materials 29, 3152 (2017).
[73] A. Lempicki, Proceedings of the Physical Society. Section B 66, 281 (1953).
[74] H. Kathrein and F. Freund, Journal of Physics and Chemistry of Solids 44, 177 (1983).
[75] V. C. Birschitzky, F. Ellinger, U. Diebold, M. Reticcioli, and C. Franchini, npj Computational Materials 8, 1 (2022), number: 1 Publisher: Nature Publishing Group.
[76] V. C. Birschitzky, I. Sokolović, M. Prezzi, K. Palotás, M. Setvín, U. Diebold, M. Reticcioli, and C. Franchini, npj Computational Materials 10, 1 (2024), publisher: Nature Publishing Group.
[77] Z. Li, N. Xu, Y. Zhang, W. Liu, J. Wang, M. Ma, X. Fu, X. Hu, W. Xu, and Z.-K. Han, The Journal of Physical Chemistry Letters 15, 5868 (2024), pMID: 38804522.
[78] Y. Zhang, Z.-K. Han, B. Zhu, X. Hu, M. Troppenz, S. Rigamonti, H. Li, C. Draxl, M. V. Ganduglia-Pirovano, and Y. Gao, "Decoupling many-body interactions in ceo2 (111) oxygen vacancy structure: Insights from machine-learning and cluster expansion," (2024), arXiv:2406.15956 [cond-mat.mtrl-sci].
[79] O. Byl and J. T. Yates, The Journal of Physical Chemistry B 110, 22966 (2006), pMID: 17107127.
[80] G. Kresse and D. Joubert, Phys. Rev. B 59, 1758 (1999).
[81] P. E. Blöchl, Phys. Rev. B 50, 17953 (1994).
[82] J. P. Perdew, K. Burke, and M. Ernzerhof, Phys. Rev. Lett. 77, 3865 (1996).
[83] S. Falletta and A. Pasquarello, npj Computational Materials 8, 1 (2022), publisher: Nature Publishing Group.
[84] S. Nosé, The Journal of Chemical Physics 81, 511 (1984).
[85] D. P. Kingma and J. Ba, "Adam: A method for stochastic optimization," (2017), arXiv:1412.6980 [cs.LG].
[86] S. S. Schoenholz and E. D. Cubuk, in Advances in Neural Information Processing Systems, Vol. 33 (Curran Associates, Inc., 2020).

# Supplementary material for 'Machine Learning of Small Polaron Dynamics' 

Viktor C. Birschitzky, ${ }^{1}$ Luca Leoni, ${ }^{2}$ Michele Reticcioli, ${ }^{1}$ and Cesare Franchini ${ }^{1,2}$<br>${ }^{1}$ University of Vienna, Faculty of Physics and Center for Computational Materials Science, Vienna, Austria<br>${ }^{2}$ Department of Physics and Astronomy "Augusto Righi", Alma Mater Studiorum - Università di Bologna, Bologna, 40127 Italy

(Dated: December 17, 2024)

## I. DATA GENERATION

## A. Density Functional Theory Methods


#### Abstract

All computations were performed using the Vienna Ab initio Simulation package (VASP) ${ }^{1-4}$ and using Perdew-Burke-Ernzerhof functionals ${ }^{5}$ within the rotationally invariant $\mathrm{DFT}+U$ formalism ${ }^{6}$. The bulk systems taken into consideration are rocksalt $\mathrm{MgO}+\mathrm{h}^{+}$, rutile $\mathrm{TiO}_{2}+\mathrm{e}^{-}$, and F-doped rutile $\mathrm{TiO}_{2}$ with a doping concentration of 1/192. In particular, to allow the simulation of polarons, we used a 2 × 2 × 2 supercell for MgO (resulting in a supercell with $8.449 \times 8.449 \times 8.449 \AA^{3}$ and 64 atoms) and a $2 \times 2 \times 6$ supercell for the other two $\mathrm{TiO}_{2}$-systems (resulting in a supercell with $12.973 \times 12.973 \times 17.724 \AA^{3}$ and 288 atoms). We used a $\Gamma$-centered $2 \times 2 \times 2$ k-points mesh for the former and $\Gamma$ only mesh for the latter materials. Spin-polarized calculations were performed for every material and the energy cutoff was set to 300 eV for $\mathrm{TiO}_{2}$-systems and 500 eV for MgO , respectively. We used standard projector augmented wave pseudopotentials ${ }^{4}$ for MgO , whereas in $\mathrm{TiO}_{2}$-compounds we used standard pseudopotentials for Ti (treating d- and s-orbitals as valence) and soft O and F pseudopotentials. Effective $U$ values for the different materials were set to 10 eV for the $p$-orbitals of O atoms in MgO within the suggested range of $U$-values ${ }^{7}$ and 3.9 eV for the $d$-orbitals of Ti atoms in $\mathrm{TiO}_{2}$ materials as previously determined by constrained RPA ${ }^{8}$. Polarons were induced by either adding one excess electron for $\mathrm{TiO}_{2}$, removing an electron in MgO , or by replacing 1 of the 192 O with an F-dopant in $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$.


## B. Initial Dataset

The training dataset for every material was constructed from frames of Molecular Dynamics (MD) runs in the NVT ensemble using Nosé-Hoover thermostat ${ }^{9}$ with a 1 fs timestep and the computational setup described in the previous section. The systems were first thermalized in a shorter run performing a temperature ramping through a velocity rescaling that increased the temperature by 0.5 K at every step until the desired temperature. MgO data were collected at 600 K, $\mathrm{TiO}_{2}$ and $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ data at 500 K. The temperature was chosen to provide a sufficient number of polaron hopping events within the initial dataset generation. In particular, the chosen temperatures resulted in ~20 hopping events for every material after the thermalization.

The 10 ps FPMD dataset consisting of $10^{4}$ structures was first divided by reserving the last $20 \%$ of the frames as test set, while the training and validation set were constructed from the inital 80\%. To sufficiently represent the possible hopping pathways in the training dataset, we extracted all jumps frames from the remaining 80\%, where we selected 20 frames before and after maximal magnetization changed from one site to another. Randomly selected structures and two randomly selected hopping events were used in the validation set. The remaining hopping structures in combination with randomly selected structures were used for training. For train and validation datasets, a 1 to 2 proportion of hopping to random structures was used.

## C. Active learning data generation

We extract hopping events from long initial MLMD runs performed with a model trained on the initial training dataset to enhance polaron transition sampling. This process might be unnecessary for simple materials with few symmetrically inequivalent transition pathways (i.e., MgO ), but becomes necessary in more complex materials such as $\mathrm{TiO}_{2}$. Polaron hopping events are extracted from the MLMD simulations by identifying timesteps in which argmax(m) changed. Similarly to the previous section, we extracted configurations of 40 timesteps centered around the hopping event in MLMD and fed them back into DFT. For every series of extracted configurations $\left\{\mathbf{r}_{i}\right\}_{i=1}^{40}$, we performed self consistent computations on all $\mathbf{r}_{i}$ using the charge density and wavefunction of the previous timestep $\mathbf{r}_{i-1}$, reproducing the operating principle of FPMD. Additionally, we diversified our sampling by extracting hopping events

| RMSE | $E$ in meV/Atom |  |  | F in meV/Å |  |  | n |  |  |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|  | Train | Validation | Test | Train | Validation | Test | Train | Validation | Test |
| $\mathrm{TiO}_{2}+\mathrm{e}^{-}$ | 0.074 | 0.069 | 0.056 | 16.421 | 17.154 | 16.481 | 0.002 | 0.002 | 0.002 |
| $\mathrm{MgO}+\mathrm{h}^{+}$ | 0.116 | 0.112 | 0.129 | 20.640 | 26.895 | 25.730 | 0.002 | 0.003 | 0.003 |
| $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ | 0.114 | 0.139 | 0.133 | 17.651 | 19.591 | 15.871 | 0.002 | 0.002 | 0.001 |
| $\mathbf{F}_{\text {pol }}$ in meV/Å |  |  |  | $n_{\text {pol }}^{\uparrow}+n_{\text {pol }}^{\downarrow}$ |  |  | $m_{\text {pol }}$ |  |  |
|  | Train | Validation | Test | Train | Validation | Test | Train | Validation | Test |
| $\mathrm{TiO}_{2}+\mathrm{e}^{-}$ | 38.330 | 46.186 | 48.038 | 0.010 | 0.009 | 0.011 | 0.032 | 0.028 | 0.034 |
| $\mathrm{MgO}+\mathrm{h}^{+}$ | 29.199 | 45.035 | 44.592 | 0.003 | 0.005 | 0.004 | 0.012 | 0.020 | 0.015 |
| $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ | 46.206 | 65.600 | 40.274 | 0.011 | 0.015 | 0.009 | 0.025 | 0.040 | 0.022 |

Supplementary Table I: Root mean squared errors of the models for energy $E$, forces $\mathbf{F}$ and occupations $\mathbf{n}$ and root mean squared errors of the models at the polaronic site for forces $\mathbf{F}_{\text {pol }}$, the total occupation $n_{\text {pol }}^{\uparrow}+n_{\text {pol }}^{\downarrow}$, and the magnetization $m_{\text {pol }}$.

with distinct transition pathways (e.g., regarding the crystallographic direction or the relation to other symmetry-breaking features such as dopants) and utilizing hoppings from various temperatures. Randomly sampled structures from this hopping database were then fed back to the training, validation, and test set to retrain the model. In cases of multiple symmetry-breaking features (such as in $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ ), extrapolation issues become more severe because many polaronic configurations are not sampled during the initial FPMD run. To address this, we augment the training database with snapshots of transitions to and from each site, as well as random snapshots of the polaron residing at a site for extended periods, ensuring coverage of all distinct polaronic configurations.

## II. MACHINE LEARNING METHODS

## A. Training

The model was optimized to fit energies $E$, forces F and the occupation of each site. While fitting energies and forces is a standard procedure to fit potential energy surface models, fitting the occupation requires additional loss terms. In particular, we fit the invariant quantity $\operatorname{Tr}\left[\mathbf{n}_{i}^{\sigma}\right]$, whose difference in spin channels $\sigma=\uparrow, \downarrow$ equal the magnetization of the $i$-th atom. For simplicity of notation, we shorten $\operatorname{Tr}\left[\mathbf{n}_{i}^{\sigma}\right]$ as $n_{i}^{\sigma}$, and the difference $n_{i}^{\uparrow}-n_{i}^{\downarrow}$ as the magnetization $m_{i}$. The total magnetization of a configuration $\sum_{i} m_{i}$ is labeled as $M$. We found that fitting and predicting $n_{i}^{\uparrow}$ and $n_{i}^{\downarrow}$ directly resulted in the most stable model. Remaining quantities such as the atomic magnetization $m_{i}$, the total magnetization $M$, or the total atomic occupation $n_{i}^{\uparrow}+n_{i}^{\downarrow}$ can be derived from these model outputs and are fitted by soft constraints implemented in our loss function. By assuming a batch of $K$ structures, each containing $N$ atoms, we can write the loss function $\mathcal{L}$ used to fit the model as follows:

$$
\begin{aligned}
\mathcal{L}=\frac{1}{K} \sum_{k=1}^{K} & \left\{\lambda_{E}\left(E_{k}^{\mathrm{ML}}-E_{k}^{\mathrm{DFT}}\right)^{2}+\frac{\lambda_{F}}{3 N} \sum_{i=1}^{N} \sum_{j=1}^{3}\left(F_{k i j}^{\mathrm{ML}}-F_{k i j}^{\mathrm{DFT}}\right)^{2}+\lambda_{M}\left(M_{k}^{\mathrm{ML}}-M_{k}^{\mathrm{DFT}}\right)^{2}+\right. \\
& \left.\frac{\lambda_{T}}{N} \sum_{i=1}^{N}\left[\sum_{\sigma=\uparrow, \downarrow}\left(n_{k i}^{\sigma, \mathrm{ML}}-n_{k i}^{\sigma, \mathrm{DFT}}\right)^{2}+\left(m_{k i}^{\mathrm{ML}}-m_{k i}^{\mathrm{DFT}}\right)^{2}+\left(\sum_{\sigma=\uparrow, \downarrow} n_{k i}^{\sigma, \mathrm{ML}}-n_{k i}^{\sigma, \mathrm{DFT}}\right)^{2}\right]\right\} .
\end{aligned}
$$

The weight parameters $\lambda$ are set based on whether they apply to global or atomic quantities. Following the same approach as the NequIP paper ${ }^{10}$, we set the weight parameters of atomic quantities (i.e., $\lambda_{F}$ for forces and $\lambda_{T}$ for occupations) to $N^{2}$, while for global quantities (i.e., $\lambda_{E}$ for energies and $\lambda_{M}$ for the total magnetization) the weight is set to 1. Similarly to the suggestions of the paper we used a batch size of 1, which we found to produce the lowest fitting errors. The model was implemented in $\mathrm{JAX}^{11}$ and optimization was performed using the optax-library's implementation of the Adam optimizer ${ }^{12}$ with a learning rate of $5 \times 10^{-4}$. A decrease on plateau procedure was used during training - halving the learning rate if fitting errors did not improve in 5 consecutive epochs. Using this procedure the model usually converged after ~7 hours of training on an Nvidia Ampere 100 graphic card, requiring on the order of $10^{3}-10^{4}$ epochs.

Supplementary Table I presents the achieved RMSE for key quantities within our test systems, which are within the expected range for the NequiP architecture ${ }^{10}$.

## B. Machine-learned molecular dynamics

The machine-learned molecular dynamics (MLMD) was performed using the JAX-MD framework ${ }^{13}$. To be consistent with the training dataset every simulation was performed in the NVT ensemble using the Nosé-Hoover thermostat and with a timestep to 1 fs. Simulations were performed at various temperatures ranging from 100 K to 600 K in steps of 100 K. At 100 K polaron hopping was usually too infrequent to perform statistical analysis. Stable simulations for the full 10 ns where achieved for $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$ and $\mathrm{MgO}+\mathrm{h}^{+}$at every temperature, while MLMD simulations in $\mathrm{TiO}_{2}+\mathrm{e}^{-}$became unstable for 500 K and 600 K, still allowing to collect statistics for 4 ns and 1.3 ns, respectively.

## C. Hopping at the ML-level

Small polaron dynamics within FPMD is driven by thermally activated hops, where transitions occur in few time steps (tens of fs) of the dynamical simulation. Most of the time, the polaron remains localized at a specific site. During these intervals, our assumption of an integer charge state holds well, as the polaron can be assigned to a single site. However, during the transition steps of the rare hopping events, this approximation may break down. In these cases, the polaron hopping occurs through the coupling of the initial and final polaronic states, forming an adiabatic transition state where the charge is briefly delocalized across two sites. Additionally, due to thermal distortions, the polaronic band can approach the conduction band, resulting in partial occupations of the conduction band. During electronic minimization, this can lead to the localization of the polaron at a different site.

In both of these instances, our approximation complicates the explicit treatment of these events using machine learning, as the model is trained under the assumption that the polaron is localized on a single site. Nevertheless, we have found that this assumption produces the most reliable models in terms of long-term stability. The artifacts

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-10_1143_1645_1210_238.jpg)
Supplementary Figure 1: Comparison of DFT- and ML-predicted magnetizations $m$ along different hopping pathways within $\mathrm{TiO}_{2}+\mathrm{e}^{-}$.

![](./images/014e8f47-bf45-4f6d-b0ff-b1fa24871461-11_991_1616_207_259.jpg)
Supplementary Figure 2: Oscillations in ML-predicted magnetization $m$ in $\mathrm{TiO}_{2}+\mathrm{e}^{-}$associated to partial delocalization of the polaron. The total magnetization $\sum_{i} m_{i}$ is shown in dashed black and indicates partial delocalization of the polaron.

resulting from this issue are evident in the figures below.
In Supplementary Figure 1 the magnetization along the reaction coordinate as predicted from DFT and ML for three distinct transition pathways ([001], [110], [111]) in rutile $\mathrm{TiO}_{2}+\mathrm{e}^{-}$are displayed. Reaction coordinates are determined by linear interpolation of the relaxed initial and final polaronic configurations:

$$
\mathbf{r}_{\text {int }}=\alpha \mathbf{r}_{\text {init }}+(1-\alpha) \mathbf{r}_{\text {final }}
$$

It is apparent that for the [110] and [001] transitions, the central interpolated structure (i.e., $\alpha=0.5$ ) cannot reproduce the desired shared state at the ML level, due to the assumption that the polaronic state is assigned to either site. This is reflected in the ML model, which produces two distinct sets of magnetizations at the central structure, depending on the assignment of the polaronic state. Nevertheless, we found that the model yields well-defined energies for these states, independent of the specific polaronic state. Furthermore, polaronic hopping still occurs during the MLMD, with well-reproducible magnetizations for these adiabatic transitions at the DFT level.

We also found that Leopold can reliably detect partial delocalization in the conduction band. This behavior is primarily associated with migrations along [110] and [111]. There, a drop of ML-predicted total magnetization during MLMD is an indicator for small energy differences between the polaronic and conduction band in $\mathrm{TiO}_{2}$ at the DFT-level. In these cases the model might produce non-physical oscillations as depicted in Supplementary Figure 2. At DFT reference level a partial occupation of the conduction band might result in a favorable initialization of the electronic wavefunction to instantaneously transfer a polaron to a different site. In MLMD, we found that explicitly searching for a suitable polaron localization site did not offer any additional benefit. The simpler criterion outlined in the maintext in Figure 1b (assigning the polaron to the maximally magnetized site) was found to enhance long term stability of the simulations and reproducibly transfers polarons adiabatically at the DFT-reference level. We note that it might be beneficial to include a search for the most stable polaronic sites to mimic the behavior observed in the reference DFT simulations.

## III. POLARON MOBILITY

Resulting long MLMD simulations give access to the dynamical properties of the polaron, which we study through the computation of its mean squared displacement $\mathrm{MSD}(t)$, defined as:

$$
\operatorname{MSD}(t)=\left\langle\frac{1}{T-t} \int_{0}^{T-t}[\mathbf{r}(t+\Delta)-\mathbf{r}(\Delta)]^{2} \mathrm{~d} \Delta\right\rangle .
$$

Here, $\langle\cdot\rangle$ represents an ensemble average over all polarons in the system while $\mathbf{r}(t)$ are the polarons trajectories in a simulation with length $T$. Since only a single polaron is present in our system, the ensemble average in the formula can be omitted, as the dynamics of a single polaron fully characterize the charge transport properties in this case. From the obtained MSD we extracted the polaron diffusion coefficient $D$ by using the known relationship

$$
\operatorname{MSD}(t)=2 n D t,
$$

where $n$ is the dimensionality of the considered trajectory r (in our case $n=3$ ). Following Eq. (3) the diffusion coefficient was extracted by linearly interpolating the MSD function obtained in the linear regime. Once $D$ has been extracted, we can transform using the Einstein relation $\mu=q D / k_{\mathrm{B}} T^{14}$ to obtain the final estimate for the polaron mobility.

In this work, we also studied the angular dependence of the mobility in rutile $\mathrm{TiO}_{1.99} \mathrm{~F}_{0.01}$. To obtain $\mu(\theta)$ within the (110)-plane containing the dopant, we projected the trajectory $\mathbf{r}(t)$ onto $\hat{\mathbf{n}}(\theta)$ giving access to the direction-dependent trajectory $r_{\theta}(t)$. We compute the MSD as follows:

$$
\operatorname{MSD}(t, \theta)=\left\langle\frac{1}{T-t} \int_{0}^{T-t}\left[r_{\theta}(t+\Delta)-r_{\theta}(\Delta)\right]^{2} \mathrm{~d} \Delta\right\rangle \quad \text { with } \quad r_{\theta}(t)=\mathbf{r}(t) \cdot \hat{\mathbf{n}}(\theta) .
$$

In this way we reduce the MSD computation to a 1D trajectory in a certain direction in space, rendering Eq. (3) into the form

$$
\operatorname{MSD}(t, \theta)=2 D(\theta) t,
$$

from which $D(\theta)$ can be extracted and transformed into $\mu(\theta)$ using the same approach described before.

[^0]
[^0]:    ${ }^{1}$ G. Kresse and J. Furthmüller, Phys. Rev. B 54, 11169 (1996).
    ${ }^{2}$ G. Kresse and J. Furthmüller, Computational Materials Science 6, 15 (1996).
    ${ }^{3}$ G. Kresse and D. Joubert, Phys. Rev. B 59, 1758 (1999).
    ${ }^{4}$ P. E. Blöchl, Phys. Rev. B 50, 17953 (1994).
    ${ }^{5}$ J. P. Perdew, K. Burke, and M. Ernzerhof, Phys. Rev. Lett. 77, 3865 (1996).
    ${ }^{6}$ S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys, and A. P. Sutton, Phys. Rev. B 57, 1505 (1998).
    ${ }^{7}$ S. Falletta and A. Pasquarello, npj Computational Materials 8, 1 (2022), publisher: Nature Publishing Group.
    ${ }^{8}$ M. Setvin, C. Franchini, X. Hao, M. Schmid, A. Janotti, M. Kaltak, C. G. Van de Walle, G. Kresse, and U. Diebold, Physical Review Letters 113, 086402 (2014), publisher: American Physical Society.
    ${ }^{9}$ S. Nosé, The Journal of Chemical Physics 81, 511 (1984).
    ${ }^{10}$ S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt, and B. Kozinsky, Nature Communications 13, 2453 (2022), publisher: Nature Publishing Group.
    ${ }^{11}$ J. Bradbury, R. Frostig, P. Hawkins, M. J. Johnson, C. Leary, D. Maclaurin, G. Necula, A. Paszke, J. VanderPlas, S. Wanderman-Milne, and Q. Zhang, "JAX: composable transformations of Python+NumPy programs," (2018).
    ${ }^{12}$ D. P. Kingma and J. Ba, "Adam: A method for stochastic optimization," (2017), arXiv:1412.6980 [cs.LG].
    ${ }^{13}$ S. S. Schoenholz and E. D. Cubuk, in Advances in Neural Information Processing Systems, Vol. 33 (Curran Associates, Inc., 2020).
    ${ }^{14}$ A. Einstein, Investigations on the theory of the brownian movement (Dover Publications, New York, 1956).

