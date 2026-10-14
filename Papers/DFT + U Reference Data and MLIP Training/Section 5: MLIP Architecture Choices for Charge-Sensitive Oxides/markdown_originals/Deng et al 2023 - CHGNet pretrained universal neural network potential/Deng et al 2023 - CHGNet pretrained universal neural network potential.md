---
citekey: dengCHGNetPretrainedUniversal2023
doi: 10.1038/s42256-023-00716-3
zotero_item_type: journalArticle
source_version: arXiv author version; journal metadata used for citation
---

# CHGNet: Pretrained universal neural network potential for charge-informed atomistic modeling 

Bowen Deng, ${ }^{1,2}$ Peichen Zhong, ${ }^{1,2, *}$ KyuJung Jun, ${ }^{1,2}$ Janosh Riebesell, ${ }^{2,3}$ Kevin Han, ${ }^{2}$ Christopher J. Bartel, ${ }^{1,4}$ and Gerbrand Ceder ${ }^{1,2, \dagger}$<br>${ }^{1}$ Department of Materials Science and Engineering, University of California, Berkeley, California 94720, United States<br>${ }^{2}$ Materials Sciences Division, Lawrence Berkeley National Laboratory, California 94720, United States<br>${ }^{3}$ Cavendish Laboratory, University of Cambridge, United Kingdom<br>${ }^{4}$ Department of Chemical Engineering and Materials Science, University of Minnesota, Minneapolis, Minnesota 55455, United States

(Dated: June 22, 2023)


#### Abstract

The simulation of large-scale systems with complex electron interactions remains one of the greatest challenges for the atomistic modeling of materials. Although classical force fields often fail to describe the coupling between electronic states and ionic rearrangements, the more accurate ab-initio molecular dynamics suffers from computational complexity that prevents long-time and large-scale simulations, which are essential to study many technologically relevant phenomena, such as reactions, ion migrations, phase transformations, and degradation.

In this work, we present the Crystal Hamiltonian Graph neural Network (CHGNet) as a novel machine-learning interatomic potential (MLIP), using a graph-neural-network-based force field to model a universal potential energy surface. CHGNet is pretrained on the energies, forces, stresses, and magnetic moments from the Materials Project Trajectory Dataset, which consists of over 10 years of density functional theory static and relaxation trajectories of ~ 1.5 million inorganic structures. The explicit inclusion of magnetic moments enables CHGNet to learn and accurately represent the orbital occupancy of electrons, enhancing its capability to describe both atomic and electronic degrees of freedom. We demonstrate several applications of CHGNet in solid-state materials, including charge-informed molecular dynamics in $\mathrm{Li}_{x} \mathrm{MnO}_{2}$, the finite temperature phase diagram for $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ and Li diffusion in garnet conductors. We critically analyze the significance of including charge information for capturing appropriate chemistry, and we provide new insights into ionic systems with additional electronic degrees of freedom that can not be observed by previous MLIPs.


## I. INTRODUCTION

Large-scale simulations, such as molecular dynamics (MD), are essential tools in the computational exploration of solid-state materials [1]. They enable the study of reactivity, degradation, interfacial reactions, transport in partially disordered structures, and other heterogeneous phenomena relevant for the application of complex materials in technology. Technological relevance of such simulations requires rigorous chemical specificity which originates from the orbital occupancy of atoms. Despite their importance, accurate modeling of electron interactions or their subtle effects in MD simulations remains a major challenge. Classical force fields treat the charge as an atomic property that is assigned to every atom a-priori [2, 3]. Methodology developments in the field of polarizable force fields such as the electronegativity equalization method (EEM) [4], chemical potential equalization (CPE) [5], and charge equilibration (Qeq) [6] realize charge evolution via the redistribution of atomic partial charge. However, these empirical methods are often not accurate enough to capture complex electron interactions.

[^0]Ab-initio molecular dynamics (AIMD) with density functional theory (DFT) can produce high-fidelity results with quantum-mechanical accuracy by explicitly computing the electronic structure within the density functional approximation. The charge-density distribution and corresponding energy can be obtained by solving the Kohn-Sham equation [7]. Long-time and large-scale spin-polarized AIMD simulations critical for studying ion migrations, phase transformations and chemical reactions are challenging and extremely computing intensive [8, 9]. These difficulties underscore the need for more efficient computational methods in the field that can account for charged ions and their orbital occupancy at sufficient time and length scales needed to model important phenomena.

Machine-learning interatomic potentials (MLIPs) such as ænet [10, 11] and DeepMD [12] have provided promising solutions to bridge the gap between expensive electronic structure methods and efficient classical interatomic potentials. Specifically, graph neural network (GNN)-based MLIPs such as DimeNet [13], NequIP [14], TeaNet [15], and MACE [16] have been shown to achieve state-of-the-art performance by incorporating invariant/equivariant symmetry constraints and long-range interaction through graph convolution [17]. Most recently, GNN-based MLIPs trained on the periodic table (e.g., M3GNet) have demonstrated the possibility

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-02_1072_1743_193_212.jpg)
FIG. 1. CHGNet model architecture (a) CHGNet workflow: a crystal structure with unknown atomic charge is used as input to predict the energy, force, stress, and magnetic moments, resulting in a charge-decorated structure. (b) Atom graph: The pairwise bond information is drawn between atoms; Bond graph: the pairwise angle information is drawn between bonds. (c) Graphs run through basis expansions and embedding layers to create atom, bond, angle features. The features are updated through several interaction blocks, and the properties are predicted at output layers. (d) Interaction block in which the atom, bond, and angle share and update information. (e) Atom convolution layer where neighboring atom and bond information is calculated through weighted message passing and aggregates to the atoms.

of universal interatomic potentials that may not require chemistry-specific training for each new application [18-[20]. However, the inclusion of the important effects that valences have on chemical bonding remains a challenge for MLIPs, and the early success derived mostly from the inclusion of electrostatics for long-range interactions [21-23].

The importance of an ion's valence derives from the fact that it can engage in very different bonding with its environment depending on its electron count. While traditional MLIPs treat the elemental label as the basic chemical identity, different valence states of transition metal ions behave as different from each other as different elements. For example, high spin $\mathrm{Mn}^{4+}$ is a non-bonding spherical ion which almost always resides in octahedral coordination by oxygen atoms, whereas $\mathrm{Mn}^{3+}$ is a Jahn-Teller active ion that radically distorts its environment, and $\mathrm{Mn}^{2+}$ is an ion that strongly prefers tetrahedral coordination [8]. Such strong chemical interaction variability across different valence states exists for almost all transition metal ions and requires specification of an ion beyond its chemical identity. In addition, the charge state is a degree of freedom that can create configurational entropy and whose dynamic optimization can lead to strongly coupled charge and ion motion, which is impossible to capture with a MLIP that only carries elemental labels. The relevance of explicit electron physics motivates the development of a robust MLIP model with charge information built in.

Charge has been represented in a variety of ways, from a simple oxidation state label to continuous wave functions derived from quantum mechanics [24]. Challenges in incorporating charge information into MLIPs arise from many factors, such as the ambiguity of representations [25], complexity of interpretation [26], scarcity of labels [22], and impracticality of taking charge as an input $\left(E\left(\left\{\boldsymbol{r}_{i}\right\},\left\{q_{i}\right\}\right)\right.$, as the labels $\left\{q_{i}\right\}$ are generally not a-priori available) [21]. In this work, we define charge as an atomic property (atomic charge) that can be inferred from the inclusion of magnetic moments (magmoms). We show that by explicitly incorporating the site-specific magmoms as the charge-state constraints
into the Crystal Hamiltonian Graph neural-Network (CHGNet), one can both enhance the latent-space regularization and accurately capture electron interactions.

We demonstrate the charge constraints and latentspace regularization of atomic charge in $\mathrm{Na}_{2} \mathrm{~V}_{2}\left(\mathrm{PO}_{4}\right)_{3}$ and show the applications of CHGNet in the study of charge-transfer and phase transformation in $\mathrm{Li}_{x} \mathrm{MnO}_{2}$, electronic entropy in the $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ phase diagram, and Li diffusivity in garnet-type Li-superionic conductors $\mathrm{Li}_{3+x} \mathrm{La}_{3} \mathrm{Te}_{2} \mathrm{O}_{12}$. By critically comparing and evaluating the importance of incorporating charge information in the construction of CHGNet, we offer new insights into the materials modeling of ionic systems with additional electronic degrees of freedom. Our analysis highlights the essential role that charge information plays in atomistic simulations for solid-state materials.

## II. RESULTS

## A. CHGNet architecture

The foundation of CHGNet is a GNN, as shown in Fig. 1, where the graph convolution layer is used to propagate atomic information via a set of nodes $\left\{v_{i}\right\}$ connected by edges $\left\{e_{i j}\right\}$. The translation, rotation, and permutation invariance are preserved in GNNs [27-29]. Figure 1(a) shows the workflow of CHGNet which takes a crystal structure with unknown atomic charges as input and outputs the corresponding energy, forces, stress, and magmoms. The charge-decorated structure can be inferred from the on-site magnetic moments and atomic orbital theory. The details are described in the following section.

In CHGNet, a periodic crystal structure is converted into an atom graph $G^{a}$ by searching for neighboring atoms $v_{j}$ within $r_{\text {cut }}$ of each atom $v_{i}$ in the primitive cell. The edges $e_{i j}$ are drawn with information from the pairwise distance between $v_{i}$ and $v_{j}$, as shown in Fig. 1(b). Three-body interaction can be computed by using an auxiliary bond graph $G^{b}$, which can be similarly constructed by taking the angle $a_{i j k}$ as the pairwise information between bonds $e_{i j}$ and $e_{j k}$ (see Methods). We adopt similar approaches to include the angular/three-body information as other recent GNN MLIPs [13, 18, 30].

Figure 1(c) shows the architecture of CHGNet, which consists of a sequence of basis expansions, embeddings, interaction blocks, and outputs layers (see Methods for details). Figure 1(d) illustrates the components within an interaction block, where the atomic interaction is simulated with the update of atom, bond, and angle features via the convolution layers. Figure 1(e) presents the convolution layer in the atom graph. Weighted message passing is used to propagate information between atoms, where the message weight $\tilde{e}_{i j}^{a}$ from node $j$ to node $i$ decays to zero at the graph cutoff radius to ensure smoothness of the potential energy surface [13].

Unlike other GNNs, where the updated atom features $\left\{v_{i}^{n}\right\}$ after $n$ convolution layers are directly used to predict energies, CHGNet regularizes the node-wise features $\left\{v_{i}^{n-1}\right\}$ at the $n-1$ convolution layer to contain the information about magnetic moments. The regularized features $\left\{v_{i}^{n-1}\right\}$ carry rich information about both local ionic environments and charge distribution. Therefore, the atom features $\left\{v_{i}^{n}\right\}$ used to predict energy, force, and stress are charge-constrained by their charge-state information. As a result, CHGNet can provide charge-state information using only the nuclear positions and atomic identities as input, allowing the study of charge distribution in atomistic modeling.

## B. Materials Project Trajectory Dataset

The Materials Project database contains a vast collection of DFT calculations on ~ 146,000 inorganic materials composed of 94 elements [31]. To accurately sample the universal potential energy surface, we extracted ~ 1.37 million Materials Project tasks of structure relaxation and static calculations using either the generalized gradient approximation (GGA) or GGA+U exchange-correlation (see Methods). This effort resulted in a comprehensive dataset with 1,580,395 atom configurations, 1,580,395 energies, 7,944,833 magnetic moments, 49,295,660 forces, and 14,223,555 stresses. To ensure the consistency of energies within the MPtrj dataset, we applied the GGA/GGA+U mixing compatibility correction, as described by Wang et al. [32].

The distribution of elements in the MPtrj dataset is illustrated in Fig. 2. The lower-left triangle (warm color) in an element's box indicates the frequency of occurrence of that element in the dataset, and the upper-right triangle (cold color) represents the number of instances where magnetic information is available for the element. With over 100,000 occurrences for 60 different elements and more than 10,000 instances with magnetic information for 76 different elements, the MPtrj dataset provides comprehensive coverage of all chemistries, excluding only the noble gases and actinoids. The lower boxes in Fig. 2 present the counts and mean absolute deviations of energy, force, stress, and magmoms in the MPtrj dataset.

## C. Performance Evaluation

CHGNet with 400,438 trainable parameters was trained on the MPtrj dataset with an 8:1:1 training, validation, and test set ratio, partitioned by materials (see Methods). The statistics of the mean absolute errors of the energy, force, stress, and magmoms on the MPtrj test set structures are shown in Table I. We observe a similar test set error with slight improvements in the model trained with magmoms.

To evaluate the robustness of CHGNet as a universal force field, we submitted CHGNet to Matbench Discovery [33] for out-of-distribution material stability predic-

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-04_1120_1692_291_223.jpg)
FIG. 2. Element distribution of Materials Project Trajectory (MPtrj) Dataset. The color on the lower-left triangle indicates the total number of atoms/ions of an element. The color on the upper right indicates the number of times the atoms/ions are incorporated with magnetic moment labels in the MPtrj dataset. On the lower part of the plot is the count and mean absolute deviation (MAD) of energy, magmoms, force, and stress

tion. CHGNet achieves state-of-the-art performance in high-throughput stable inorganic crystal discovery compared to 8 other models submitted to this benchmark at the time of writing.

For a benchmark on CHGNet molecular dynamic simulations, we applied the pretrained CHGNet to MD simulations on Li superionic conductors that were previously reported with AIMD [34]. Supplementary Fig. 1 shows that CHGNet systematically agrees with AIMD results on room temperature conductivities and activation energies within the AIMD error bar, and CHGNet successfully distinguishes the faster and slower conductors that were identified with DFT.

TABLE I. Mean-absolute-errors (MAEs) of CHGNet on MPtrj test set of 157,955 structures from 14,572 materials. 'With mag' and 'No mag' indicate whether the model is trained with magmoms ( $\mu_{B}$ is the Bohr magneton).
|  | Energy (meV/atom) | Force $(\mathrm{meV} / \AA)$ | Stress (GPa) | Magmom ( $\mu_{B}$ ) |
| :--- | :--- | :--- | :--- | :--- |
| With mag | 30 | 77 | 0.348 | 0.032 |
| No mag | 33 | 79 | 0.351 | N/A |


## D. Charge-constraints and charge-inference from magnetic moments

In solid-state materials that contain heterovalent ions, it is crucial to distinguish the atomic charge of the ions,

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-05_405_846_181_194.jpg)
FIG. 3. Magmom and hidden-space regularization in $\mathbf{N a}_{2} \mathbf{V}_{2}\left(\mathbf{P O}_{4}\right)_{3}$. (a) Magmom distribution of the 216 V ions in the unrelaxed structure (blue) and CHGNet-relaxed structure (orange). (b) A two-dimensional visualization of the PCA on V-ion embedding vectors before the magmom projection layer indicates the latent space clustering is highly correlated with magmoms and charge information. The PCA reduction is calculated for both unrelaxed and relaxed structures.

as an element's interaction with its environment can depend strongly on its valence state. It is well known that the valence of heterovalent ions cannot be directly calculated through the DFT charge density because the charge density is almost invariant to the valence state due to the hybridization shift with neighboring ligand ions [35, 36]. Furthermore, the accurate representation and encoding of the full charge density is another demanding task requiring substantial computational resources [26, 37]. An established approach is to rely on the magnetic moment for a given atom site as an indicator of its atomic charge, which can be derived from the difference in localized upspin and down-spin electron densities in spin-polarized DFT calculations [8, 38]. Compared with the direct use of charge density, magmoms are found to contain more comprehensive information regarding the electron orbital occupancy and therefore the chemical behavior of ions, as demonstrated in previous studies.

To rationalize our treatment of the atomic charge, we used a NASICON-type Na-ion cathode material $\mathrm{Na}_{4} \mathrm{~V}_{2}\left(\mathrm{PO}_{4}\right)_{3}$ as an illustrative example. The phase stability of the (de-)intercalated material $\mathrm{Na}_{4-x} \mathrm{~V}_{2}\left(\mathrm{PO}_{4}\right)_{3}$ is associated with Na/vacancy ordering and is highly correlated to the charge ordering on the vanadium sites [39]. We generated a supercell structure of $\mathrm{Na}_{4} \mathrm{~V}_{2}\left(\mathrm{PO}_{4}\right)_{3}$ with 2268 atoms and randomly removed half of the Na ions to generate the structure with composition $\mathrm{Na}_{2} \mathrm{~V}_{2}\left(\mathrm{PO}_{4}\right)_{3}$, where half of the V ions are oxidized to a $\mathrm{V}^{4+}$ state. We used CHGNet to relax the (de-)intercalated structure and analyze its capability to distinguish the valence states of V atoms with the ionic relaxation (see Methods).

Figure 3(a) shows the distribution of predicted magmoms on all V ions in the unrelaxed (blue) and relaxed (orange) structures. Without any prior knowledge about the V-ion charge distribution other than learning from the spatial coordination of the V nuclei, CHGNet successfully differentiated the V ions into two groups of $\mathrm{V}^{3+}$ and $\mathrm{V}^{4+}$. Figure 3(b) shows the two-dimensional principal component analysis (PCA) of all the latent space feature vectors of V ions for both unrelaxed and relaxed structures after three interaction blocks. The PCA analysis demonstrates two well-separated distributions, indicating the latent space feature vectors of V ions are strongly correlated to the different valence states of V. Hence, imposing different magmom labels to the latent space (i.e., forcing the two orange peaks to converge to the red dashed lines in Fig. 3(a)) would act as the charge constraints for the model by regularizing the latent-space features.

Because energy, force, and stress are calculated from the same feature vectors, the inclusion of magmoms can improve the featurization of the heterovalent atoms in different local chemical environments (e.g., $\mathrm{V}^{3+}$ and $\mathrm{V}^{4+}$ displays very distinct physics and chemistry) and therefore improve the accuracy and expressibility of CHGNet.

## E. Charge disproportionation in $\mathbf{L i}_{x} \mathbf{M n O}_{2}$ phase transformation

The long-time and large-scale simulation of CHGNet enables studies of ionic rearrangements coupled with charge transfer [40, 41], which is crucial for ion mobility and the accurate representation of the interaction between ionic species. As an example, in the $\mathrm{LiMnO}_{2}$ battery cathode material, transition-metal migration plays a central role in its phase transformations, which cause irreversible capacity loss [42, 43]. The mechanism of Mn migration is strongly coupled with charge transfer, with $\mathrm{Mn}^{4+}$ being an immobile ion, and $\mathrm{Mn}^{3+}$ and $\mathrm{Mn}^{2+}$ generally considered to be more mobile [44-46]. The dynamics of the coupling of the electronic degrees of freedom with those of the ions has been challenging to study but is crucial to understand the phase transformation from orthorhombic $\mathrm{LiMnO}_{2}$ ( $o$-LMO, shown in Fig. 4(a)) to spinel $\mathrm{LiMnO}_{2}(s-\mathrm{LMO})$, as the time scale and computational cost of such phenomena are far beyond any possible ab-initio methods.

In early quasi-static ab-initio studies, Reed et al. [40] rationalized the remarkable speed at which the phase transformation proceeds at room temperature using a charge disproportionation mechanism: $2 \mathrm{Mn}_{\text {oct }}^{3+} \rightarrow$ $\mathrm{Mn}_{\text {tet }}^{2+}+\mathrm{Mn}_{\text {oct }}^{4+}$, where the subscript indicates location in the tetrahedral or octahedral site of a face-centered cubic oxygen packing, as shown in Fig. 4(a). The hypothesis based on DFT calculations was that $\mathrm{Mn}^{2+}$ had a lower energy barrier for migration between tetrahedral and octahedral sites and preferred to occupy the tetrahedral site. The ability therefore for Mn to dynamically change its valence would explain its remarkable room temperature mobility. However, Jang et al. [44] showed in a later magnetic characterization experiment that the electrochemically transformed spinel $\mathrm{LiMnO}_{2}$ has lower-spin (high-valence) Mn ions on the tetrahedral sites, which suggested the possibility that Mn with higher valence can

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-06_1414_1720_200_197.jpg)
FIG. 4. $\mathbf{L i}_{0.5} \mathbf{M n O}_{2}$ phase transformation and charge disproportionation (a) orthorhombic $\mathrm{LiMnO}_{2}$ ( $o$-LMO) unit cell plotted with the tetrahedral site and the octahedral site. (b) Simulated XRD pattern of CHGNet MD structures as the system transforms from the $o$-LMO phase to the $s$-LMO. (c) Average magmoms of tetrahedral and octahedral Mn ions vs. time. (d) Top: total potential energy and the relative intensity of $o$-LMO and $s$-LMO characteristic peaks $v s$. time. The solid black line is averaged over every 10 ps. Bottom: the histogram of magmoms on all Mn ions vs. time. The brighter color indicates more Mn ions distributed at the magmom. (e) Predicted magmoms of tetrahedral Mn ions using GGA+U-DFT (black) and CHGNet (blue), where the structures are drawn from MD simulation at 0.4 ns (left) and 1.5 ns (right).

be stable on tetrahedral sites during the phase transformation.

To demonstrate the ability of CHGNet to fully describe such a process, we used CHGNet to run a chargeinformed MD simulation at 1100 K for 1.5 ns (see Methods). The MD simulation started from a partially delithiated supercell structure with the $o$-LMO structure $\left(\mathrm{Li}_{20} \mathrm{Mn}_{40} \mathrm{O}_{80}\right)$, which is characterized by peaks at 15°, 26°, and 40° in the X-ray diffraction (XRD) pattern (the bottom line in Fig. 4(b)). As the simulation proceeded, a phase transformation from orthorhombic ordering to spinel-like ordering was observed. Figure 4(b) presents the simulated XRD pattern of MD structures at different time intervals from 0 to 1.5 ns, with a clear increase in the characteristic spinel peaks (18°, 35°) and a decrease in the orthorhombic peak. The simulated results agree well with the experimental in-situ XRD results [42, 44 ].

Figure 4(d) presents the CHGNet-predicted energy of the LMO supercell structure as a function of simulation time, together with the peak strength at $2 \theta=15^{\circ}$ and 18°. An explicit correlation between the structural transformation and energy landscape is observed. The predicted average potential energy of the spinel phase is approximately 50 meV/oxygen lower than that of the start-
ing $o$-LMO, suggesting that the phase transformation to spinel is indeed, thermodynamically favored.

The advantage of CHGNet is shown in its ability to predict charge-coupled physics, as evidenced by the lower plot in Fig. 4(d). A histogram of the magmoms of all the Mn ions in the structure is presented against time. In the early part of the simulation, the magmoms of Mn ions are mostly distributed between $3 \mu_{B}$ and $4 \mu_{B}$, which correspond to $\mathrm{Mn}^{4+}$ and $\mathrm{Mn}^{3+}$. At approximately 0.8 ns, there is a significant increase in the amount of $\mathrm{Mn}^{2+}$, which is accompanied by a decrease in the potential energy and changes in the XRD peaks. Following this major transformation point, the $\mathrm{Mn}^{3+}$ ions undergo charge disproportionation, resulting in the coexistence of $\mathrm{Mn}^{2+}$, $\mathrm{Mn}^{3+}$, and $\mathrm{Mn}^{4+}$ in the transformed spinel-like structure.

One important observation from the long-time charge-informed MD simulation is the correlation between ionic rearrangements and the charge-state evolution. Specifically, we noticed that the time scale of charge disproportionation (~ ns for the emergence of $\mathrm{Mn}^{2+}$ ) is far longer than the time scale of ion hops (~ ps for the emergence of $\mathrm{Mn}_{\text {tet }}$ ), indicating that the migration of Mn to the tetrahedral coordination is less likely related to the emergence of $\mathrm{Mn}^{2+}$. Instead, our result indicates that the emergence of $\mathrm{Mn}_{\text {tet }}^{2+}$ is correlated to the formation of the long-range spinel-like ordering. Figure 4(c) shows the average magmoms of $\mathrm{Mn}_{\text {tet }}$ and $\mathrm{Mn}_{\text {oct }}$ as a function of time. The result reveals that $\mathrm{Mn}_{\text {tet }}^{2+}$ only forms over a long time period, which cannot be observed using any conventional simulation techniques.

To further validate this hypothesis and the accuracy of CHGNet prediction, we used GGA $+U$ and $\mathrm{r}^{2} \mathrm{SCAN}$ -DFT (see Supplementary Information) static calculations to get the magmoms of the structures at 0.4 and 1.5 ns, where the GGA+U results are shown in Fig. 4(e). CHGNet (blue) shows highly accurate agreement with GGA $+U$ magmoms (black) and infers the same $\mathrm{Mn}_{\text {tet }}$ valence states.

## F. Electronic entropy effect in the phase diagram of $\mathbf{L i}_{x} \mathbf{F e P O}_{4}$

The configurational electronic entropy has a significant effect on the temperature-dependent phase stability of mixed-valence oxides, and its equilibrium modeling therefore requires an explicit indication of the atomic charge. However, no current MLIPs can provide such information. We demonstrate that using CHGNet one can infer the atomic charge and include the electronic entropy in the computation of the temperature-dependent phase diagram (PD) of $\mathrm{Li}_{x} \mathrm{FePO}_{4}$.

Previous research has shown that the formation of a solid solution in $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ is mainly driven by electronic entropy rather than by $\mathrm{Li}^{+}$/vacancy configurational entropy [47]. We applied CHGNet as an energy calculator to generate two distinct cluster expansions (CEs), which is a typical approach to studying configurational

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-07_797_803_188_1112.jpg)
FIG. 5. $\mathbf{L i}_{x} \mathbf{F e P O}_{4}$ phase diagram from CHGNet. The phase diagrams in (a) and (b) are calculated with and without electronic entropy on $\mathrm{Fe}^{2+}$ and $\mathrm{Fe}^{3+}$. The colored dots represent the stable phases obtained in semi-grand canonical MC. The dashed lines indicate the two-phase equilibria between solid solution phases.

entropy [48]. One of these is charge-decorated (consid-ering $\mathrm{Li}^{+}$/vacancy and $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ ) and another is non-charge-decorated (only considering $\mathrm{Li}^{+}$/vacancy without consideration of the Fe valence). Semi-grand canonical Monte Carlo was used to sample these cluster expansions and construct $\mathrm{Li}_{x} \mathrm{FePO}_{4} \mathrm{PDs}$ (see Methods). The calculated PD with charge decoration in Fig. 5(a) features a miscibility gap between $\mathrm{FePO}_{4}$ and $\mathrm{LiFePO}_{4}$, with a eutectoid-like transition to the solid-solution phase at intermediate Li concentration, qualitatively matching the experiment result [49, 50]. In contrast, the calculated PD without charge decoration in Fig. 5(b) features only a single miscibility gap without any eutectoid transitions, in disagreement with experiments. This comparison highlights the importance of explicit inclusion of the electronic degrees of freedom, as failure to do so can result in incorrect physics. These experiments show how practitioners may benefit from CHGNet with atomic charge inference for equilibrium modeling of configurationally and electronically disordered systems.

## G. Activated Li diffusion network in $\mathbf{L i}_{3} \mathbf{L a}_{3} \mathbf{T e}_{2} \mathbf{O}_{12}$

In this section, we showcase the precision of CHGNet for general-purpose MD. Lithium-ion diffusivity in fast Li-ion conductors is known to show a drastic non-linear response to compositional change. For example, stuffing a small amount of excess lithium into stoichiometric com-

![](./images/f5501c6d-ac8c-4750-93f1-0a62f422082e-08_595_776_207_219.jpg)
FIG. 6. Li diffusivity in garnet $\mathbf{L i}_{3} \mathbf{L a}_{3} \mathbf{T e}_{2} \mathbf{O}_{12}$. The CHGNet simulation accurately reproduces the dramatic increase in Li-ion diffusivity when a small amount of extra Li is stuffed into the garnet structure, qualitatively matching the activated diffusion network theory and agreeing well with the DFT-computed activation energy.

positions can result in orders-of-magnitude improvement of the ionic conductivity [34]. Xiao et al. [51] reported that the activation energy of Li diffusion in stoichiometric garnet $\mathrm{Li}_{3} \mathrm{La}_{3} \mathrm{Te}_{2} \mathrm{O}_{12}$ decreases from more than 1 eV to $\sim 160 \mathrm{meV}$ in a slightly stuffed $\mathrm{Li}_{3+\delta}$ garnet $(\delta=$ 1/48), owing to the activated Li diffusion network of face-sharing tetrahedral and octahedral sites.

We performed a zero-shot test to assess the ability of CHGNet to capture the effect of such slight compositional change on the diffusivity and its activation energy. Figure 6 shows the Arrhenius plot from CHGNet-based MD simulations and compares it to AIMD results. Our results indicate that not only is the activated diffusion network effect precisely captured, the activation energies from CHGNet are also in excellent agreement with the DFT results [51]. This effort demonstrates the capability of CHGNet to precisely capture the strong interactions between Li ions in activated local environments and the ability to simulate highly non-linear diffusion behavior. Moreover, CHGNet can dramatically decrease the error on simulated diffusivity and enable studies in systems with poor diffusivity such as the unstuffed $\mathrm{Li}_{3}$ garnet by extending to nano-second-scale simulations [52].

## III. DISCUSSION

Large-scale computational modeling has proven essential in providing atomic-level information in materials science, medical science, and molecular biology. Many technologically relevant applications contain heterovalent species, for which a comprehensive understanding of the atomic charge involved in the dynamics of processes is of great interest. The importance of assigning a valence to ions derives from the fundamentally different electronic and bonding behavior ions can exhibit when their electron count changes. Ab-initio calculations based on DFT are useful for these problems, but the $\sim \mathcal{O}\left(N^{3}\right)$ scaling intrinsically prohibits its application to large time- and length-scales. Recent development of MLIPs provides new opportunities to increase computational efficiency while maintaining near DFT accuracy. The present work presents an MLIP that combines the need to include the electronic degrees of freedom with computational efficiency.

In this work, we developed CHGNet and demonstrated the effectiveness of incorporating magnetic moments as a proxy for inferring the atomic charge in atomistic simulations, which results in the integration of electronic information and the imposition of additional charge constraints as a regularization of the MLIP. We highlight the capability of CHGNet in distinguishing $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ in the study of $\mathrm{Li}_{x} \mathrm{FePO}_{4}$, which is essential for the inclusion of electronic entropy and finite temperature phase stability. In the study of $\mathrm{LiMnO}_{2}$, we demonstrate CHGNet's ability to gain new insights into the relation between charge disproportionation and phase transformation in a heterovalent transition-metal oxide system from long-time charge-informed MD.

CHGNet builds on recent advances in graph-based MLIPs [13, 18], but is pretrained with electronic degrees of freedom built in, which provides an ideal solution for high-throughput screening and atomistic modeling of a variety of technologically relevant oxides, including high-entropy materials [53, 54]. As CHGNet is already generalized to broad chemistry during pretraining, it can also serve as a data-efficient model for high-precision simulations when augmented with fine-tuning to specific chemistries.

Despite these advances, further improvements can be achieved through several efforts. First, the use of magnetic moments for valence states inference does not strictly ensure global charge neutrality. The formal valence assignment depends on how the atomic charges are partitioned [24]. Second, although magnetic moments are good heuristics for the atomic charge from spin-polarized calculations in ionic systems, it is recognized that the atomic charge inference for non-magnetic ions may be ambiguous and thus requires extra domain knowledge. As a result, for ions with no magnetic moment, the atom-centered magnetic moments cannot accurately reflect their atomic charges and CHGNet will infer charge from the environment similar to how other MLIP's function. It may also be possible to enhance the model further by incorporating other approaches to charge representation, such as an electron localization function [55], electric polarization [56], and atomic orbital-based partitioning (e.g., Wannier functions [57]). These approaches could be used for atom feature engineering in latent space.

In conclusion, CHGNet enables charge-informed atom-
istic simulations amenable to the study of heterovalent systems using large-scale computational simulations, expanding opportunities to study charge-transfer-coupled phenomena in computational chemistry, physics, biology, and materials science.

## IV. ACKNOWLEDGMENTS

This work was funded by the U.S. Department of Energy, Office of Science, Office of Basic Energy Sciences, Materials Sciences and Engineering Division under Contract No. DE-AC0205CH11231 (Materials Project program KC23MP). The work was also supported by the computational resources provided by the Extreme Science and Engineering Discovery Environment (XSEDE), supported by National Science Foundation grant number ACI1053575; the National Energy Research Scientific Computing Center (NERSC), a U.S. Department of Energy Office of Science User Facility located at Lawrence Berkeley National Laboratory; and the Lawrencium Computational Cluster resource provided by the IT Division at the Lawrence Berkeley National Laboratory. The authors would also like to thank Jason Munro and Luis Barroso-Luque for helpful discussions.

## V. METHODS

## A. Data parsing

The Materials Project Trajectory Dataset (MPtrj) was parsed from the September 2022 Materials Project database version. We collected all the GGA and GGA $+U$ task trajectories under each material-id and followed the criteria below:

1. We removed deprecated tasks and only kept tasks with the same calculation settings as the primary task, from which the material could be searched on the Materials Project website. To verify if the calculation settings were equal, we confirmed the following: (1) The $+U$ setting must be the same as the primary task. (2) The energy of the final frame cannot differ by more than 20 meV/atom from the primary task.
2. Structures without energy and forces or electronic step convergence were removed.
3. Structures with energy higher than 1 eV/atom or lower than 10 meV/atom relative to the relaxed structure from Materials Project's ThermoDoc were filtered out to eliminate large energy differences caused by variations in VASP settings, etc.
4. Duplicate structures were removed to maintain a healthy data distribution. This removal was achieved using a pymatgen StructureMatcher and an energy matcher to tell the difference between structures. The screening criteria of the structure and energy matchers became more stringent as more structures under the same materials-id were added to the MPtrj dataset.

Training, validation, and test sets of the MPtrj dataset were randomly selected based on the 145,923 compounds (based on the mp-id). As a result, different DFT tasks and their trajectory frames can only be included in the same set conditioned on the compound.

## B. Model design

In constructing the crystal graph, the default $r_{\text {cut }}$ is set to $5 \AA$, which has been shown adequate enough for capturing long-range interactions [18]. The bond graph is constructed with a cutoff of $3 \AA$ for computational efficiency. The bond distances $r_{i j}$ were expanded to $\tilde{e}_{i j}$ by a trainable smooth radial Bessel function (SmoothRBF), as proposed in Gasteiger et al. [13]. The SmoothRBF forces the radial Bessel function and its derivative to approach zero at the graph cutoff radius, thus guaranteeing a smooth potential energy surface. The angles $\theta_{i j k}$ were expanded by Fourier basis functions to create $\tilde{a}_{i j k}$ with trainable frequency. The atomic numbers $Z_{i}, \tilde{e}_{i j}$, and $\tilde{a}_{i j k}$ were then embedded into node $v_{i}^{0}$, edge $e_{i j}^{0}$, and angle features $a_{i j k}^{0}$ (all have 64 feature dimensions by default):

$$
\begin{aligned}
v_{i}^{0} & =Z_{i} \boldsymbol{W}_{\boldsymbol{v}}+\boldsymbol{b}_{\boldsymbol{v}}, \\
e_{i j, n}^{0} & =\tilde{e}_{i j} \boldsymbol{W}_{\boldsymbol{e}}, \tilde{e}_{i j}=\sqrt{\frac{2}{5}} \frac{\sin \left(\frac{n \pi r_{i j}}{5}\right)}{r_{i j}} \odot u\left(r_{i j}\right) \\
a_{i j k, \ell}^{0} & =\left\{\begin{array}{ll}
\frac{1}{\sqrt{2 \pi}} & \text { if } \ell=0 \\
\frac{1}{\sqrt{\pi}} \cos \left[\ell \theta_{i j k}\right] & \text { if } \ell=[1, N] \\
\frac{1}{\sqrt{\pi}} \sin \left[(\ell-N) \theta_{i j k}\right] & \text { if } \ell=[N+1,2 N]
\end{array},\right.
\end{aligned}
$$

where $\{\boldsymbol{W}, \boldsymbol{b}\}$ are the trainable weights and bias. The angle is computed using $\theta_{i j k}=\arccos \frac{e_{i j} \cdot e_{j k}}{\left|e_{i j}\right|\left|e_{j k}\right|}$. The $u\left(r_{i j}\right)$ is a polynomial envelope function to enforce the value, the first and second derivative of $\tilde{e}_{i j}$, smoothly toward 0 at the graph cutoff radius [13]. The subscripts $n, \ell$ are the expansion orders, and we set the maximum orders for both $n$ and $\ell$ to be $2 N+1=9$. The superscript denotes the index of the interaction block. The ⊙ represents the element-wise multiplication. The edge vectors $e_{i j}^{t}$ are bi-directional, which is essential for $e_{i j}^{t}$ and $e_{j i}^{t}$ to be represented as a single node in the bond graph [30].

Different from previous GNN models such as M3GNet [18], where three-body spherical harmonics features are used to update bond features, we explicitly encode and update atoms, bonds, and angles embeddings through the pair-wise connections pre-defined in atom graph and bond graph. For the atom graph convolution, a weighted message passing layer is applied to the concatenated feature vectors $\left(v_{i}^{t}\left\|v_{j}^{t}\right\| e_{i j}^{t}\right)$ from two atoms and one bond.

For the bond graph convolution, the weighted message passing layer is applied to the concatenated feature vectors $\left(e_{i j}^{t}\left\|e_{j k}^{t}\right\| a_{i j k}^{t} \| v_{j}^{t+1}\right)$ from two bonds, the angle between them, and the atom where the angle is located. For the angle update function, we used the same construction for the bond graph message vector but without the weighted aggregation step. The mathematical form of the atom, bond, and angle updates are formulated below:

$$
\begin{aligned}
v_{i}^{t+1} & =v_{i}^{t}+L_{v}^{t}\left[\sum_{j} \tilde{e}_{i j} \cdot \phi_{v}^{t}\left(v_{i}^{t}\left\|v_{j}^{t}\right\| e_{i j}^{t}\right)\right], \\
e_{j k}^{t+1} & =e_{j k}^{t}+L_{v}^{t}\left[\sum_{i} \tilde{e}_{i j} \cdot \tilde{e}_{j k} \cdot \phi_{e}^{t}\left(e_{i j}^{t}\left\|e_{j k}^{t}\right\| a_{i j k}^{t} \| v_{j}^{t+1}\right)\right], \\
a_{i j k, f}^{t+1} & =a_{i j k}^{t}+\phi_{a}^{t}\left(e_{i j}^{t+1}\left\|e_{j k}^{t+1}\right\| a_{i j k}^{t} \| v_{j}^{t+1}\right) .
\end{aligned}
$$

The $L$ is a linear layer and $\phi$ is the gated multilayer perceptron (gatedMLP) [29]:

$$
\begin{aligned}
& L(x)=x \boldsymbol{W}+\boldsymbol{b} \\
& \phi(x)=\left(\sigma \circ L_{\text {gate }}(x)\right) \odot\left(g \circ L_{\text {core }}(x)\right),
\end{aligned}
$$

where $\sigma$ and $g$ are the Sigmoid and SiLU activation functions, respectively. The magnetic moments are predicted by a linear projection of the atom features $v_{i}^{3}$ after three interaction blocks by

$$
m_{i}=L_{m}\left(v_{i}^{3}\right) .
$$

Instead of using a full interaction block, the last convolution layer only includes atom graph convolution

$$
v_{i}^{4}=v_{i}^{3}+\sum_{j} \tilde{e}_{i j} \cdot \phi_{v}^{3}\left(v_{i}^{3}\left\|v_{j}^{3}\right\| e_{i j}^{3}\right) .
$$

The energy is calculated by a non-linear projection of the site-wise averaged feature vector over all atoms $\left\{v_{i}^{4}\right\}$. The forces and stress are calculated via auto-differentiation of the energy with respect to the atomic Cartesian coordinates and strain:

$$
\begin{aligned}
E_{\mathrm{tot}} & =\sum_{i} L_{3} \circ g \circ L_{2} \circ g \circ L_{1}\left(v_{i}^{4}\right), \\
\vec{f}_{i} & =-\frac{\partial E_{\mathrm{tot}}}{\partial \vec{x}_{i}}, \\
\sigma & =\frac{1}{V} \frac{\partial E_{\mathrm{tot}}}{\partial \varepsilon} .
\end{aligned}
$$

Overall, with four atom convolution layers, the pretrained CHGNet can capture long-range interaction up to $20 \AA$ with a small computation cost.

## C. Model training

The model is trained to minimize the summation of Huber loss (with $\delta=0.1)$ of energy, force, stress, and magmoms:

$$
\mathcal{L}(x, \hat{x})=\left\{\begin{array}{ll}
0.5 \cdot(x-\hat{x})^{2} & \text { if }|x-\hat{x}|<\delta \\
\delta \cdot(|x-\hat{x}|-0.5 \delta) & \text { otherwise }
\end{array} .\right.
$$

The loss function is a weighted sum of the contributions from energy, forces, stress, and magmoms:

$$
\mathcal{L}=\mathcal{L}(E, \hat{E})+w_{f} \mathcal{L}(\boldsymbol{f}, \hat{\boldsymbol{f}})+w_{\sigma} \mathcal{L}(\boldsymbol{\sigma}, \hat{\boldsymbol{\sigma}})+w_{m} \mathcal{L}(m, \hat{m}),
$$

where the weights for the forces, stress, and magmoms are set to $w_{f}=1, w_{\sigma}=0.1$, and $w_{m}=0.1$, respectively. The DFT energies are normalized with elemental reference energies before fitting to CHGNet to decrease variances [18]. The absolute values of DFT magmoms are used for training. The batch size is set to 40 and the Adam optimizer is used with $10^{-3}$ as the initial learning rate. The CosineAnnealingLR scheduler is used to adjust the learning rate 10 times per epoch, and the final learning rate decays to $10^{-5}$ after 20 epochs.

## D. Software interface

CHGNet was implemented using pytorch 1.12.0 [58], with crystal structure processing from pymatgen [59]. Molecular dynamics and structure relaxation were simulated using the interface to Atomic Simulation Environment (ASE) [60]. The cluster expansions were performed using the smol package [61].

## E. Structure relaxation and molecular dynamics

All the structure relaxations were optimized by the FIRE optimizer over the potential energy surface provided by CHGNet [62], where the atom positions, cell shape, and cell volume were simultaneously optimized to reach converged interatomic forces of 0.1 eV $/ \AA$.

For the MD simulations of the $o$-LMO to $s$-LMO phase transformation, the initial structure $\mathrm{Li}_{20} \mathrm{Mn}_{40} \mathrm{O}_{80}$ was generated by randomly removing Li from a $\mathrm{Li}_{40} \mathrm{Mn}_{40} \mathrm{O}_{80}$ supercell of the orthorhombic structure and relaxing with DFT. The MD simulation was run under the NVT ensemble, with a time step of 2 fs at $\mathrm{T}=1100 \mathrm{~K}$ for 1.5 ns. For the simulated XRD in Fig. 4(b), the structures at 0.0, 0.3, 0.6, 0.9, 1.2, and 1.5 ns were coarse-grained to their nearest Wyckoff positions to remove noisy peaks. In Fig. 4(c), $\mathrm{Mn}_{\text {oct }}$ and $\mathrm{Mn}_{\text {tet }}$ were determined by counting the number of bonding oxygen ions within $2.52 \AA$. If six bonding oxygen ions were found, then the Mn ion is categorized into $\mathrm{Mn}_{\text {oct }}$; if less than six bonding oxygen ions were found, the Mn ion is coarse-grained into $\mathrm{Mn}_{\text {tet }}$ for representation of lower coordinated environments. In Fig. 4(e), $\mathrm{Mn}^{2+}$ and $\mathrm{Mn}^{3+}$ are classified by CHGNet magmom threshold of $4.2 \mu_{B}$ [38].

For the MD simulations of garnet $\mathrm{Li}_{3} \mathrm{La}_{3} \mathrm{Te}_{2} \mathrm{O}_{12}$ systems, a time step of 2 fs was used. We ramped up the
temperature to the targeted temperature in the NVT ensemble with at least 1 ps. Then, after equilibrating the system for 50 ps, the lithium self-diffusion coefficients were obtained by calculating the mean squared displacements of trajectories for at least 2.3 ns. The uncertainty analysis of the diffusion coefficient values was conducted following the empirical error estimation scheme proposed by He et al. [63]. In $\mathrm{Li}_{3+\delta}$, the excess lithium was stuffed to an intermediate octahedral $(48 g)$ site to face-share with the fully occupied $24 d$ tetrahedral sites.

## F. Phase diagram calculations

The cluster expansions (CEs) of $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ were performed with pair interactions up to $11 \AA$ and triplet interactions up to $7 \AA$ based on the relaxed unit cell of $\mathrm{LiFePO}_{4}$. For better energy accuracy, we first fine-tuned CHGNet with the Materials Project structures in the Li-Fe-P-O chemical space, which decreased the test error from 23 meV/atom to 15 meV/atom (see Supplementary Information). We applied CHGNet to relax 456 different structures in $\mathrm{Li}_{x} \mathrm{FePO}_{4}(0 \leq x \leq 1)$ and predict the energies and magmoms, where the 456 structures were generated via an automatic workflow including CE fitting, canonical CE Monte Carlo for searching the ground state at varied $\mathrm{Li}^{+}$composition and CHGNet relaxation. The charge-decorated CE is defined on coupled sublattices over $\mathrm{Li}^{+}$/vacancy and $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ sites, where $\mathrm{Fe}^{2+}$ and $\mathrm{Fe}^{3+}$ are treated as different species. In addition, the non-charge-decorated CE is defined only on $\mathrm{Li}^{+}$/vacancy sites. In the charge-decorated CE, $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ is classified with magmom in $\left[3 \mu_{B}, 4 \mu_{B}\right]$ and $\left[4 \mu_{B}, 5 \mu_{B}\right]$, respectively [38].

The semigrand canonical Monte Carlo simulations were implemented using the Metropolis-Hastings algorithm, where 20\% of the MC steps were implemented canonically (swapping $\mathrm{Li}^{+}$/vacancy or $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ ) and 80\% of the MC steps were implemented grand-canonically using the table-exchange method [64, 65]. The simulations were implemented on a 8 × 6 × 4 of the unit cell of $\mathrm{LiFePO}_{4}$. In each MC simulation, we scanned the chemical potential in the [-5.6, -4.8] range with a step of 0.01 and sampled the temperatures from 0 to 1000 K . The boundary for the solid solution stable phases is determined with a difference in the Li concentration $<0.05$ by $\Delta \mu=0.01 \mathrm{eV}$.

The effects of configurational and electronic entropy can be investigated via $S(\mathrm{Li}, e)=S^{\prime}(\mathrm{Li})+S^{\prime}(e)+I(\mathrm{Li}, e)$ as described in Ref. [47]. $S^{\prime}$ represents the conditional entropy $S(X \mid Y)$ from X (either Li or $e$ ) degree of freedom given fixed Y ( $e$ or Li), and $I(\mathrm{Li}, e)$ denotes the mutual information of the two degrees of freedom. $S^{\prime}(e / \mathrm{Li})$ can be acquired from a canonical MC with frozen configuration of either Li/vacancy or $\mathrm{Fe}^{2+} / \mathrm{Fe}^{3+}$ ordering. This operation is facilitated by explicitly incorporating the charge decoration degree of freedom with the cluster expansion, a necessity substantiated by the atomic charge inference derived from CHGNet.

## G. DFT calculations

DFT calculations were performed with the Vienna ab initio simulation package (VASP) using the projector-augmented wave method [66, 67], a plane-wave basis set with an energy cutoff of 520 eV, and a reciprocal space discretization of $25 k$-points per $\AA^{-1}$. All the calculations were converged to $10^{-6} \mathrm{eV}$ in total energy for electronic loops and $0.02 \mathrm{eV} / \AA$ in interatomic forces for ionic loops. We used the Perdew-Burke-Ernzerhof (PBE) generalized gradient approximation exchange-correlation functional [68] with rotationally-averaged Hubbard U correction $(\mathrm{GGA}+U)$ to compensate for the self-interaction error on transition metal atoms (3.9 eV for Mn) [69].

## VI. AVAILABILITY

## A. Code availability

The source code, pretrained weights, and example notebooks of CHGNet on the MPtrj dataset are available at https://github.com/CederGroupHub/chgnet.

## B. Data availability

The dataset will be released after review.

## VII. COMPETING INTERESTS

The authors declare no competing interests.
[1] D. Frenkel and B. Smit, Understanding molecular simulation: from algorithms to applications, Vol. 1 (Elsevier, 2001).
[2] T. R. Lucas, B. A. Bauer, and S. Patel, Charge equilibration force fields for molecular dynamics simulations of lipids, bilayers, and integral membrane protein systems, Biochimica et Biophysica Acta (BBA) - Biomembranes 1818, 318-329 (2012)

[3] R. Drautz, Atomic cluster expansion of scalar, vectorial, and tensorial properties including magnetism and charge transfer, Physical Review B 102, 024104 (2020).
[4] W. J. Mortier, S. K. Ghosh, and S. Shankar, Electronegativity-equalization method for the calculation of atomic charges in molecules, Journal of the American

Chemical Society 108, 4315-4320 (1986)

[5] D. M. York and W. Yang, A chemical potential equalization method for molecular simulations, The Journal of Chemical Physics 104, 159-172 (1996)
[6] A. K. Rappe and W. A. Goddard, Charge equilibration for molecular dynamics simulations, The Journal of Physical Chemistry 95, 3358-3363 (1991)
[7] W. Kohn and L. J. Sham, Self-consistent equations including exchange and correlation effects, Physical Review 140, A1133 (1965)
[8] J. Reed and G. Ceder, Role of electronic structure in the susceptibility of metastable transition-metal oxide structures to transformation, Chemical Reviews 104, 4513 (2004)
[9] D. Eum, B. Kim, S. J. Kim, H. Park, J. Wu, S.-P. Cho, G. Yoon, M. H. Lee, S.-K. Jung, W. Yang, W. M. Seong, K. Ku, O. Tamwattana, S. K. Park, I. Hwang, and K. Kang, Voltage decay and redox asymmetry mitigation by reversible cation migration in lithium-rich layered oxide electrodes, Nature Materials 19, 419 (2020)
[10] N. Artrith, T. Morawietz, and J. Behler, High-dimensional neural-network potentials for multicomponent systems: Applications to zinc oxide, Physical Review B 83, 153101 (2011)
[11] J. Lopez-Zorrilla, X. M. Aretxabaleta, I. Yue, I. Etxebarria, H. Manzano, and N. Artrith, ænet-PyTorch: a GPU-supported implementation for machine learning atomic potentials training, arXiv preprint arXiv:2302.09406 (2023)
[12] L. Zhang, H. Wang, R. Car, and W. E, Phase Diagram of a Deep Potential Water Model, Physical Review Letters 126, 236001 (2021)
[13] J. Gasteiger, J. Groß, and S. Günnemann, Directional message passing for molecular graphs, in International Conference on Learning Representations (ICLR) (2020).
[14] S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt, and B. Kozinsky, E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials, Nature Communications 13, 2453 (2022)
[15] S. Takamoto, S. Izumi, and J. Li, Teanet: Universal neural network interatomic potential inspired by iterative electronic relaxations, Computational Materials Science 207, 111280 (2022)
[16] I. Batatia, D. P. Kovacs, G. N. C. Simm, C. Ortner, and G. Csanyi, MACE: Higher order equivariant message passing neural networks for fast and accurate force fields, in Advances in Neural Information Processing Systems, edited by A. H. Oh, A. Agarwal, D. Belgrave, and K. Cho (2022).
[17] X. Fu, Z. Wu, W. Wang, T. Xie, S. Keten, R. Gomez-Bombarelli, and T. Jaakkola, Forces are not Enough: Benchmark and Critical Evaluation for Machine Learning Force Fields with Molecular Simulations, arXiv preprint arXiv:2210.07237 (2022)
[18] C. Chen and S. P. Ong, A universal graph deep learning interatomic potential for the periodic table, Nature Computational Science 2, 718-728 (2022).
[19] K. Choudhary, B. DeCost, L. Major, K. Butler, J. Thiyagalingam, and F. Tavazza, Unified graph neural network force-field for the periodic table: solid state applications, Digital Discovery (2023)
[20] S. Takamoto, C. Shinagawa, D. Motoki, K. Nakago, W. Li, I. Kurata, T. Watanabe, Y. Yayama, H. Iriguchi, Y. Asano, T. Onodera, T. Ishii, T. Kudo, H. Ono, R. Sawada, R. Ishitani, M. Ong, T. Yamaguchi, T. Kataoka, A. Hayashi, N. Charoenphakdee, and T. Ibuka, Towards universal neural network potential for material discovery applicable to arbitrary combination of 45 elements, Nature Communications 13, 2991 (2022)
[21] O. T. Unke, S. Chmiela, M. Gastegger, K. T. Schütt, H. E. Sauceda, and K.-R. Müller, Spookynet: Learning force fields with electronic degrees of freedom and nonlocal effects, Nature Communications 12, 7273 (2021).
[22] T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, A fourth-generation high-dimensional neural network potential with accurate electrostatics including non-local charge transfer, Nature Communications 12, 398 (2021)
[23] R. Zubatyuk, J. S. Smith, B. T. Nebgen, S. Tretiak, and O. Isayev, Teaching a neural network to attach and detach electrons from molecules, Nature Communications 12, 4870 (2021).
[24] A. Walsh, A. A. Sokol, J. Buckeridge, D. O. Scanlon, and C. R. A. Catlow, Oxidation states and ionicity, Nature Materials 17, 958 (2018)
[25] X. Xie, K. A. Persson, and D. W. Small, Incorporating electronic information into machine learning potential energy surfaces via approaching the ground-state electronic energy as a function of atom-based electronic populations, Journal of Chemical Theory and Computation 16, 4256-4270 (2020)
[26] S. Gong, T. Xie, T. Zhu, S. Wang, E. R. Fadel, Y. Li, and J. C. Grossman, Predicting charge density distribution of materials using a local-environment-based graph convolutional network, Physical Review B 100, 184103 (2019)
[27] J. Bruna, W. Zaremba, A. Szlam, and Y. LeCun, Spectral networks and locally connected networks on graphs, arXiv preprint arXiv:1312.6203 (2013).
[28] M. Geiger and T. Smidt, e3nn: Euclidean neural networks, arXiv preprint arXiv:2207.09453 (2022).
[29] T. Xie and J. C. Grossman, Crystal graph convolutional neural networks for an accurate and interpretable prediction of material properties, Physical Review Letters 120, 145301 (2018)
[30] K. Choudhary and B. DeCost, Atomistic line graph neural network for improved materials property predictions, npj Computational Materials 7, 185 (2021)
[31] A. Jain, S. P. Ong, G. Hautier, W. Chen, W. D. Richards, S. Dacek, S. Cholia, D. Gunter, D. Skinner, G. Ceder, and K. A. Persson, Commentary: The Materials Project: A materials genome approach to accelerating materials innovation, APL Materials 1, 011002 (2013).
[32] A. Wang, R. Kingsbury, M. McDermott, M. Horton, A. Jain, S. P. Ong, S. Dwaraknath, and K. A. Persson, A framework for quantifying uncertainty in DFT energy corrections, Scientific Reports 11, 15496 (2021)
[33] J. Riebesell, Rhy. Goodall, A. Jain, K. Persson, A. Lee, Matbench Discovery: Can machine learning identify stable crystals? https://matbench-discovery.materialsproject.org.
[34] K. Jun, Y. Sun, Y. Xiao, Y. Zeng, R. Kim, H. Kim, L. J. Miara, D. Im, Y. Wang, and G. Ceder, Lithium superionic conductors with corner-sharing frameworks, Nature Materials 21, 924-931 (2022)
[35] W. Mackrodt, N. Harrison, V. Saunders, N. Allan, and M. Towler, Direct evidence of O(p) holes in Li-doped NiO from Hartree-Fock calculations, Chemical Physics Letters

250, 66 (1996)

[36] C. Wolverton and A. Zunger, First-principles prediction of vacancy order-disorder and intercalation battery voltages in $\mathrm{Li}_{x} \mathrm{CoO} 2$, Physical Review Letters 81, 606 (1998)
[37] Z. Qiao, A. S. Christensen, M. Welborn, F. R. Manby, A. Anandkumar, and T. F. Miller, Informing geometric deep learning with electronic interactions to accelerate quantum chemistry, Proceedings of the National Academy of Sciences 119, 1 (2022)
[38] L. Barroso-Luque, P. Zhong, J. H. Yang, F. Xie, T. Chen, B. Ouyang, and G. Ceder, Cluster expansions of multicomponent ionic materials: Formalism and methodology, Physical Review B 106, 144202 (2022).
[39] Z. Wang, S. Park, Z. Deng, D. Carlier, J.-N. Chotard, L. Croguennec, G. S. Gautam, A. K. Cheetham, C. Masquelier, and P. Canepa, Phase stability and sodium-vacancy orderings in a NaSICON electrode, Journal of Materials Chemistry A 10, 209 (2022)
[40] J. Reed, G. Ceder, and A. V. D. Ven, Layered-to-Spinel Phase Transition in $\mathrm{Li}_{x} \mathrm{MnO}_{2}$, Electrochemical and Solid-State Letters 4, A78 (2001)
[41] K. Kang and G. Ceder, Factors that affect Li mobility in layered lithium transition metal oxides, Physical Review B 74, 094105 (2006)
[42] J. N. Reimers, E. W. Fuller, E. Rossen, and J. R. Dahn, Synthesis and Electrochemical Studies of LiMnO2 Prepared at Low Temperatures, Journal of The Electrochemical Society 140, 3396-3401 (1993)
[43] I. Koetschau, M. N. Richard, J. R. Dahn, J. B. Soupart, and J. C. Rousche, Orthorhombic LiMnO2 as a High Capacity Cathode for Li-Ion Cells, Journal of The Electrochemical Society 142, 2906-2910 (1995)
[44] Y.-I. Jang, F. Chou, B. Huang, D. R. Sadoway, and Y.-M. Chiang, Magnetic characterization of orthorhombic $\mathrm{LiMnO}_{2}$ and electrochemically transformed spinel $\mathrm{Li}_{x} \mathrm{MnO}_{2}(x<1)$, Journal of Physics and Chemistry of Solids 64, 2525-2533 (2003)
[45] M. R. Jo, Y. Kim, J. Yang, M. Jeong, K. Song, Y.-I. Kim, J.-M. Lim, M. Cho, J.-H. Shim, Y.-M. Kim, W.-S. Yoon, and Y.-M. Kang, Triggered reversible phase transformation between layered and spinel structure in manganese-based layered compounds, Nature Communications 10, 3385 (2019)
[46] M. D. Radin, J. Vinckeviciute, R. Seshadri, and A. Van der Ven, Manganese oxidation as the origin of the anomalous capacity of Mn-containing Li-excess cathode materials, Nature Energy 4, 639 (2019).
[47] F. Zhou, T. Maxisch, and G. Ceder, Configurational Electronic Entropy and the Phase Diagram of Mixed-Valence Oxides: The Case of $\mathrm{Li}_{x} \mathrm{FePO}_{4}$, Physical Review Letters 97, 155704 (2006).
[48] A. Walle and G. Ceder, Automating first-principles phase diagram calculations, Journal of Phase Equilibria 23, 348 (2002)
[49] C. Delacourt, P. Poizot, J.-M. Tarascon, and C. Masquelier, The existence of a temperature-driven solid solution in $\mathrm{Li}_{x} \mathrm{FePO}_{4}$ for $0 \leq x \leq 1$, Nature Materials 4, 254-260 (2005)
[50] J. L. Dodd, R. Yazami, and B. Fultz, Phase Diagram of $\mathrm{Li}_{x} \mathrm{FePO}_{4}$, Electrochemical and Solid-State Letters 9, A151 (2006)
[51] Y. Xiao, K. Jun, Y. Wang, L. J. Miara, Q. Tu, and G. Ceder, Lithium Oxide Superionic Conductors Inspired by Garnet and NASICON Structures, Advanced EnergyMaterials 11, 2101437 (2021)
[52] J. Huang, L. Zhang, H. Wang, J. Zhao, J. Cheng, and W. E, Deep potential generation scheme and simulation protocol for the $\mathrm{Li}_{10} \mathrm{GeP}_{2} \mathrm{~S}_{12}$-type superionic conductors, The Journal of Chemical Physics 154, 094703 (2021).
[53] Z. Lun, B. Ouyang, D.-h. Kwon, Y. Ha, E. E. Foley, T.-Y. Huang, Z. Cai, H. Kim, M. Balasubramanian, Y. Sun, J. Huang, Y. Tian, H. Kim, B. D. McCloskey, W. Yang, R. J. Clément, H. Ji, and G. Ceder, Cation-disordered rocksalt-type high-entropy cathodes for Li-ion batteries, Nature Materials 20, 214 (2021)
[54] Y. Sun and S. Dai, High-entropy materials for catalysis: A new frontier, Science Advances 7, 1 (2021)
[55] B. Silvi and A. Savin, Classification of chemical bonds based on topological analysis of electron localization functions, Nature 371, 683 (1994).
[56] R. King-Smith and D. Vanderbilt, Theory of polarization of crystalline solids, Physical Review B 47, 1651 (1993)
[57] L. Zhang, H. Wang, M. C. Muniz, A. Z. Panagiotopoulos, R. Car, and W. E, A deep potential model with longrange electrostatic interactions, The Journal of Chemical Physics 156, 124107 (2022).
[58] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, G. Chanan, T. Killeen, Z. Lin, N. Gimelshein, L. Antiga, et al., Pytorch: An imperative style, high-performance deep learning library, Advances in neural information processing systems 32 (2019)
[59] S. P. Ong, W. D. Richards, A. Jain, G. Hautier, M. Kocher, S. Cholia, D. Gunter, V. L. Chevrier, K. A. Persson, and G. Ceder, Python Materials Genomics (pymatgen): A robust, open-source python library for materials analysis, Computational Materials Science 68, 314 (2013)
[60] A. H. Larsen, J. J. Mortensen, J. Blomqvist, I. E. Castelli, R. Christensen, M. Dułak, J. Friis, M. N. Groves, B. Hammer, C. Hargus, et al., The atomic simulation environment-a Python library for working with atoms, Journal of Physics: Condensed Matter 29, 273002 (2017)
[61] L. Barroso-Luque, J. H. Yang, F. Xie, T. Chen, R. L. Kam, Z. Jadidi, P. Zhong, and G. Ceder, smol: A Python package for cluster expansions and beyond, Journal of Open Source Software 7, 4504 (2022).
[62] E. Bitzek, P. Koskinen, F. Gähler, M. Moseler, and P. Gumbsch, Structural relaxation made simple, Physical Review Letters 97, 1 (2006)
[63] X. He, Y. Zhu, A. Epstein, and Y. Mo, Statistical variances of diffusional properties from ab initio molecular dynamics simulations, npj Computational Materials 4, 18 (2018)
[64] F. Xie, P. Zhong, L. Barroso-Luque, B. Ouyang, and G. Ceder, Semigrand-canonical Monte-Carlo simulation methods for charge-decorated cluster expansions, Computational Materials Science 218, 112000 (2023)
[65] Z. Deng, G. Sai Gautam, S. K. Kolli, J.-N. Chotard, A. K. Cheetham, C. Masquelier, and P. Canepa, Phase Behavior in Rhombohedral NaSiCON Electrolytes and Electrodes, Chemistry of Materials 32, 7908 (2020).
[66] G. Kresse and J. Furthmüller, Efficiency of ab-initio total energy calculations for metals and semiconductors using a plane-wave basis set, Computational Materials Science 6, 15 (1996)
[67] G. Kresse and D. Joubert, From ultrasoft pseudopotentials to the projector augmented-wave method, Physical

Review B 59, 1758 (1999)
[68] J. P. Perdew, K. Burke, and M. Ernzerhof, Generalized Gradient Approximation Made Simple, Physical Review Letters 77, 3865 (1996)
[69] L. Wang, T. Maxisch, and G. Ceder, Oxidation energies of transition metal oxides within the GGA+U framework, Physical Review B 73, 195107 (2006)


[^0]:    * zhongpc@berkeley.edu
    ${ }^{\dagger}$ gceder@berkeley.edu

