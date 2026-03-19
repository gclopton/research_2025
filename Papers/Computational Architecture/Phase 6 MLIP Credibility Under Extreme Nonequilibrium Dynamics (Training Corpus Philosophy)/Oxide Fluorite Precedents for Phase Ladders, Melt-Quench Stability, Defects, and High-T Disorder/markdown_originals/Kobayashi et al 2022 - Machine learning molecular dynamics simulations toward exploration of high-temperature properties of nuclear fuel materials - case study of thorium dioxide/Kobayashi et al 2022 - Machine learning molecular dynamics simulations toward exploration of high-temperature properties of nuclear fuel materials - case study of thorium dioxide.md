# Machine learning molecular dynamics simulations toward exploration of high-temperature properties of nuclear fuel materials: case study of thorium dioxide 

Keita Kobayashi $^{1 \text { ® }}$, Masahiko Okumura ${ }^{1,3}$, Hiroki Nakamura ${ }^{1,3}$, Mitsuhiro Itakura ${ }^{1,3}$, Masahiko Machida ${ }^{\mathbf{1} \boldsymbol{,} \mathbf{3}}$ \& Michael W. D. Cooper ${ }^{\mathbf{2 , 3}}$

Predicting materials properties of nuclear fuel compounds is a challenging task in materials science. Their thermodynamical behaviors around and above the operational temperature are essential for the design of nuclear reactors. However, they are not easy to measure, because the target temperature range is too high to perform various standard experiments safely and accurately. Moreover, theoretical methods such as first-principles calculations also suffer from the computational limitations in calculating thermodynamical properties due to their high calculation-costs and complicated electronic structures stemming from $f$-orbital occupations of valence electrons in actinide elements. Here, we demonstrate, for the first time, machine-learning molecular-dynamics to theoretically explore high-temperature thermodynamical properties of a nuclear fuel material, thorium dioxide. The target compound satisfies first-principles calculation accuracy because $f$-electron occupation coincidentally diminishes and the scheme meets sampling sufficiency because it works at the computational cost of classical molecular-dynamics levels. We prepare a set of training data using first-principles molecular dynamics with small number of atoms, which cannot directly evaluate thermodynamical properties but captures essential atomistic dynamics at the high temperature range. Then, we construct a machine-learning molecular-dynamics potential and carry out large-scale molecular-dynamics calculations. Consequently, we successfully access two kinds of thermodynamic phase transitions, namely the melting and the anomalous $\lambda$ transition induced by large diffusions of oxygen atoms. Furthermore, we quantitatively reproduce various experimental data in the best agreement manner by selecting a density functional scheme known as SCAN. Our results suggest that the present scale-up simulation-scheme using machine-learning techniques opens up a new pathway on theoretical studies of not only nuclear fuel compounds, but also a variety of similar materials that contain both heavy and light elements, like thorium dioxide.

Thorium has attracted much attention as a potential nuclear fuel ${ }^{1,2}$. Thorium is now estimated to be three to four times more abundant in nature than uranium the shortage of which might become a concern in the coming future. Moreover, its nuclear-fuel material form, thorium dioxide, is chemically more stable than the uraniumbased counterpart ${ }^{3}$. Owing to the above primary and other several advantages, thorium dioxide is considered to be a promising candidate fuel material in next-generation nuclear reactors.

The detailed information of nuclear fuel materials in a high temperature range around its melting point is prerequisite for not only design of reactors but also nuclear safety. However, it is generally difficult to measure

[^0]physical properties in such a high temperature range due to limitation of durability of experiment instruments and resultant concern about safety. It is also difficult to maintain the stoichiometry of some fuel compounds at such high temperatures (e.g. $\mathrm{PuO}_{2}$ ). Therefore, the experimental data of thermal properties of thorium dioxide as well as other fuel materials has not been still accumulated sufficiently in the temperature region. Thus, a theoretical approach accurately examining material properties in atomic-levels, i.e., molecular dynamics (MD) simulation has been intensively employed as an alternative important tool to complement insufficient experimental data ${ }^{4,5}$.

Calculations of thermal properties through MD simulation require large-size and long-time runs in order to achieve statistical-mechanically reliable accuracy. Then, classical MD using empirical atomic force fields has been a primary scheme among various ones, because it allows statistically convergent properties to be obtained with reasonable computational costs. Indeed, several authors ${ }^{6-13}$ studied thermal properties of thorium compounds using classical MD. However, it should be noted that the obtained results strongly depend on the empirical parameters of the force field. This fact clearly indicates that careful development of atomic potentials is crucial for reliability of the calculated thermal properties. Then, their comparative studies among possible potential candidates are essential together with experimental results ${ }^{14}$.

An alternative way to calculate thermal properties of materials is using first-principles calculations based on density functional theory (DFT) ${ }^{15}$. Its ab-initio style has made a great impact on atomic-level simulation studies because of their non-empirical modeling. However, first-principles calculations for thorium dioxide have been so far limited only in a few literatures ${ }^{16-19}$. In the previous study ${ }^{19}$, two of the authors have explicitly shown that first-principles molecular dynamics (FPMD) simulations provide reliable data of thermal properties of thorium dioxides in the high temperature range, but the system size and averaging time were severely restricted due to its huge computational costs.

In the last decade, machine learning has been used as a tool to construct atomic potentials. The machine learning techniques are utilized to train potential energy surfaces (PES) with first principles accuracy by interpolation among a large number of reference data obtained by first principles calculations ${ }^{20-23}$. One of promising machine learning approaches is a method using artificial neural networks (ANN) proposed by Behler and Parrinello ${ }^{20,22}$. We call the ANN Behler-Parrinello neural networks (BPNN) throughout this paper. In contrast to empirical atomic force fields, BPNN is not based on any physical modeling but have a large number of adjustable parameters. The rich flexibility in BPNN enables us to make PES of which accuracy is comparable to those calculated from first-principles.

Generally, machine learning molecular dynamics (MLMD) using BPNN is expected to access thermal properties with first-principles accuracy even in unavailable large system sizes and long average times for FPMD. Actually, using the advantage of MLMD, structural phase transitions have been successfully examined by MLMD ${ }^{24}$. However, these cases demand not so large system size because the phase transition among different solid phases can be well captured with periodic boundary conditions. On the contrary, mixture of phases including liquids and/or gases require large systems to evaluate physical processes. In this paper, using MLMD with BPNN, we evaluate thermal properties of thorium dioxide, as an example of nuclear fuels, with first principles accuracy in a wide temperature range, whose upper limit is beyond the melting point.

Thorium dioxide has a fluorite structure with space group $\mathrm{Fm} \overline{3} \mathrm{~m}$, in which the 4 a and 8 c positions are occupied by thorium and oxygen ions, respectively. The lattice constant at room temperature is $5.592 \AA^{25}$, and the melting point is $3651 \mathrm{~K}^{26}$. In addition, another kind of phase transition was reported below the melting point as a pre-melting phase transition ${ }^{27,28}$. The transition is expected as a diffuse transition of 8 c position elements, which is called the Bredig transition ${ }^{29}$ or simply $\lambda$-transition. Recently, anomalous oxygen dynamics around the transition has been intensively studied using classical MD motivated by a close resemblance to anomalous atomic dynamics widely seen in glass forming systems ${ }^{30,31}$. The electron structure of thorium dioxide is rather simple. The localized $f$-electrons of actinide oxides usually influence thermal properties at high temperature due to their strongly-correlated features as seen in the cases of plutonium dioxide ${ }^{32}$. On the other hand, Th cations in thorium dioxide principally loose all electrons in the outer- - -shell, resulting no $f$-occupation. Then, the thermal properties of thorium dioxide are regarded to be well described by only the movement of atoms by the valence electrons. However, the ionic interaction is actually affected by atomic-charge polarizations and emergent interactions. In DFT calculation, their descriptions depend on the choice of exchange-correlation (XC) functional. Therefore, we train BPNN using DFT reference data sets based on different typical XC functionals. Using MLMD with several BPNNs, we conduct a systematic study on the high-temperature thermal properties of thorium dioxide.

## Methods

Vienna ab initio Simulation Package (VASP) ${ }^{33,34}$ is used for obtaining reference data sets for BPNN. In all calculations, the projector-augmented wave method ${ }^{35}$ is employed, and 500 eV energy cutoff is chosen. In this study, we use three types of XC functionals: the local density approximation (LDA) in the parametrization of Ceperly and Alder ${ }^{36}$, the generalized gradient approximation of Perdew-Burke-Ernzerhof for solids (GGA-PBEsol) ${ }^{37}$, and the strongly constrained and appropriately normed (SCAN) meta-GGA XC functional ${ }^{38}$.

First, we perform FPMD NPT simulations with PBEsol functional from 300 to 5000 K with a 100 K temperature step. The combination of the Langevin thermostat and Parrinello-Rahman barostat is adopted to generate the NPT ensemble. The time step and simulation total time at each temperature are 2 fs and 16 ps , respectively. Potashnikov et al. ${ }^{14}$ pointed out that the smallest cell size to capture the Bredig transition in MD simulations is $3 \times 3 \times 3$ of the unit cell. Thus, we also choose $3 \times 3 \times 3$ supercell of thorium dioxide ( 324 atoms) and only $\Gamma$ point is used as a k-point mesh. We randomly pick up 9000 snapshots of the MD simulations as the reference data based on PBEsol. For creating the reference data based on LDA and SCAN functionals, we randomly select 3000 structures from the dataset based on PBEsol, and evaluate the energies and forces of the 3000 configurations by DFT calculations with LDA and SCAN. The 3000 structures recalculated by DFT with LDA and SCAN

|  | BPNN-LDA |  | BPNN-PBEsol |  | BPNN-SCAN |  |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|  | Training | Test | Training | Test | Training | Test |
| Energy $(\mathrm{meV} /$ atom $)$ | 2.085 | 2.108 | 2.297 | 2.357 | 1.207 | 1.264 |
| Force $\left(10^{-2} \mathrm{eV} / \AA\right)$ | 5.705 | 6.551 | 7.906 | 8.239 | 5.812 | 5.769 |

Table 1. RMSE of BPNN-LDA, BPNN-PBEsol and BPNN-SCAN for the training and test data.

are used as the reference data sets for BPNNs based on LDA and SCAN. Furthermore, the adaptive learning scheme ${ }^{39-43}$ is used to improve the quality of the reference datasets. In this scheme, we create two BPNNs with different initial weights and conduct MLMD simulations to generate various structures of $\mathrm{ThO}_{2}$. Next, we select structures with large force differences between the outputs of the two BPNNs from the generated structures. Finally, we re-evaluate the energies and forces for the selected structures by DFT and add these to the reference data. As a result, the total numbers of the reference data based on LDA and SCAN XC functionals are 7749 and 7007 structures, respectively.

We use the n2p2 code ${ }^{44}$ for training BPNN. In BPNN, a local environment of each atom with a cutoff radius $R_{\mathrm{c}}$ is encoded to descriptor vectors. We adopt the following type-2 and type-4 symmetry functions ${ }^{22}$ as the descriptors of the distances and the angles of atoms, respectively, i.e.,

$$
\begin{gathered}
G_{i}^{(2)}=\sum_{j} e^{-\eta^{(2)}\left(R_{i j}-R_{\mathrm{s}}\right)^{2}} f_{\mathrm{c}}\left(R_{i j}\right), \\
G_{i}^{(4)}=2^{1-\xi} \sum_{j \neq i} \sum_{k \neq i, j}\left(1+\lambda \cos \theta_{i j k}\right)^{\xi} e^{-\eta^{(4)}\left(R_{i j}^{2}+R_{i k}^{2}+R_{j k}^{2}\right)} f_{\mathrm{c}}\left(R_{i j}\right) f_{\mathrm{c}}\left(R_{i k}\right) f_{\mathrm{c}}\left(R_{j k}\right),
\end{gathered}
$$

with the cutoff function

$$
f_{\mathrm{c}}(R)=\left\{\begin{array}{ll}
0.5 \cos \left(\frac{\pi R}{R_{\mathrm{c}}}+1\right) & \text { for } \quad R \leq R_{\mathrm{c}} \\
0 & \text { for } \quad R_{\mathrm{c}}<R
\end{array},\right.
$$

where $R_{i j}$ is the distance between the $i$-th and $j$-th atoms, $\theta_{i j k}$ is the angle formed by line segments between the $i$-th and $j$-th atoms and the $i$-th and $k$-th ones. The cutoff radius $R_{\mathrm{c}}$ for $G_{i}^{(2)}$ and $G_{i}^{(4)}$ are taken as $8.0 \AA$ and $6.5 \AA$, respectively. We choose the parameter $R_{\mathrm{s}}=0.0$, and the other parameters were selected by CUR decomposition ${ }^{45}$. First, we creat symmetry functions with a total $N_{\mathrm{SF}}=240$ dimension and construct $N_{\text {sample }} \times N_{\mathrm{SF}}$ feature matrix $X$, where each column vector consist of the symmetry function of the corresponding sample. Then, we perform a CUR decomposition for the feature matrix $X$ and select the symmetry functions that satisfies the following criteria: $\|\boldsymbol{X}-\boldsymbol{C} \boldsymbol{U R}\|_{\mathrm{F}} /\|\boldsymbol{X}\|_{\mathrm{F}} \leq 10^{-4}$, where $\|\cdot\|_{\mathrm{F}}$ denote the Frobenius norm. The detailed lists of the selected symmetry functions are shown in the Supplemental Materials. Using a dataset consisting of a selected descriptor vector and corresponding first-principles energy and forces, BPNNs are trained. We use two hidden layers with hyperbolic tangent activation functions with 30 nodes. The multistream Kalman filter method ${ }^{46}$ is adopted as an optimizer for BPNN. 90\% of the reference data is assigned to training data and the remaining 10\% as test data. We construct three machine learning potentials using data generated by DFT with the LDA, PBEsol and SCAN XC functionals, which are referred to as BPNN-LDA, BPNN-PBEsol and BPNN-SCAN, respectively.

In this paper, all MD simulations are carried out by LAMMPS ${ }^{47}$. NPT simulations are performed with Nosè-Hoover thermostat and barostat relaxation times being 0.1 ps and 0.5 ps , respectively.

## Results

Accuracy of machine learning potentials. Table 1 summarizes the root mean square errors (RMSE) of energy and force for the training and test data. The RMSEs of the present BPNNs for the reference data are below $2.4 \mathrm{meV} /$ atom for the reference energies and $8.3 \times 10^{-2} \mathrm{eV} / \AA$ for the forces, which are comparable with the typical RMSEs in previous studies ${ }^{20,43,48-50}$. In order to test the accuracy of BPNNs, we compare physical quantities obtained by DFTs, BPNNs, empirical atomic potentials, and experiments data. In this paper, we choose BD08 ${ }^{8}$ and the Cooper, Rushton and Grimes (CRG) ${ }^{9}$ empirical atomic potentials for comparison with DFTs and BPNNs. BD08 atomic potential is a relatively simple pairwise potential consisting of the Coulombic and the Buckingham potentials ${ }^{51}$. On the other hand, CRG atomic potential includes many-body EAM-type potential ${ }^{52}$ in addition to the pairwise potentials.

We compute the lattice constant, elastic properties, and phonon dispersion curves at zero temperature using DFTs, BPNNs, and empirical atomic potentials. The elastic constants are calculated by a numerical differential of the stress tensors with respect to finite strains. The phonon bands within the harmonic approximation are obtained using Phonopy ${ }^{58}$ with the finite difference method. In phonon calculations, to treat long range interaction of macroscopic electric field induced by polarization of atomic displacement near $\Gamma$ point, we add non-analytical correction by dipole-dipole interaction to dynamical matrix ${ }^{59,60}$ (see also the Supplementary Materials). The computed results are shown in Table 2 and Fig. 1. The lattice constant and elastic data of BPNN calculations agree well with those by DFT ones. The results computed by (BPNN-)PBEsol and (BPNN-)SCAN show similar lattice and elastic constants, which also agree with the experiment ones ${ }^{25,53-55}$, whereas (BPNN-) LDA slightly underestimates the lattice constant. Comparing the results obtained by DFTs, BPNNs and empirical

|  | DFT |  |  | BPNN |  |  | Empirical potential |  | Exp. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|  | LDA | PBEsol | SCAN | LDA | PBEsol | SCAN | BD08 | CRG |  |
| Lattice constant (Å) | 5.529 | 5.576 | 5.598 | 5.531 (0.04) | 5.565 (0.20) | 5.610 (0.21) | 5.600 | 5.580 | $5.592^{25}$ |
| $C_{11}(\mathrm{GPa})$ | 385.6 | 373.0 | 378.9 | 374.0 (3.01) | 370.8 (0.59) | 348.7 (7.97) | 367 | 352.3 | $367.0^{53}$ |
| $C_{12}(\mathrm{GPa})$ | 130.2 | 120.7 | 118.2 | 142.2 (9.22) | 122.7 (1.66) | 124.2 (5.08) | 106 | 113.4 | $106.0^{53}$ |
| $C_{44}(\mathrm{GPa})$ | 82.0 | 80.7 | 83.7 | 75.9 (7.44) | 73.9 (8.43) | 74.3 (11.23) | 95 | 71.7 | $79.6{ }^{53}$ |
| Bulk modulus (GPa) | 215.3 | 204.8 | 205.1 | 219.5 (1.95) | 199.0 (2.83) | 205.4 (0.15) | 193 | 193.0 | $193.0^{53}$ |
|  |  |  |  |  |  |  |  |  | $195.0 \pm 2^{54}$ |
|  |  |  |  |  |  |  |  |  | $198.0 \pm 2^{55}$ |
| Shear modulus (GPa) | 98.0 | 96.6 | 100.0 | 90.0 (8.16) | 91.1 (5.69) | 87.7 ( 12.30) | 107.9 | 88.1 | 95.6-100.6 ${ }^{53}$ |
|  |  |  |  |  |  |  |  |  | $103 \pm 2^{56}$ |

Table 2. Lattice constant and elastic properties of $\mathrm{ThO}_{2}$ obtained by DFTs, BPNNs, emprical potentials, and experiments (Exp.). The round brackets ( ⋅ ) in the BPNN columns represent the percentage errors of the BPNN results against the DFT results.

![](./images/02d605a0-cb5d-4790-a16a-561efeb93ac3-04_994_1697_904_241.jpg)
Figure 1. Phonon dispersion curves for $\mathrm{ThO}_{2}$. (a-c) Phonon dispersion obtained by (BPNN-)LDA, (BPNN-) PBEsol, and (BPNN-)SCAN where black and red line are the results computed by DFT and BPNN, respectively. (d) Are the results obtained by BD08 (green line) and CRG potential (purple line). Circle dots in (a-d) represent the experimental data. ${ }^{57}$

atomic potentials, the lattice constant and elastic data calculated by BD08 and CRG potentials seem to be more accurate than the results obtained by DFTs and BPNNs. Note that this is not necessarily surprising given that the empirical potentials are fitted to these experimental properties. The phonon dispersion curves calculated by BPNNs are also in good agreement with the curves obtained by DFTs, as shown in Fig. 1a,b. Furthermore, DFTs and BPNNs reproduce the experimental data ${ }^{57}$ almost completely. Especially, we note that optical modes in the phonon dispersion curves calculated by the empirical atomic potentials show large deviation from the experimental data as shown in Fig. 1c though the results of DFTs and BPNNs are almost perfect in these modes.

So far, we have validated the BPNN potentials using static calculations. However, the validations for dynamical calculation are also required, since inappropriate BPNN potentials sometimes cause unstable MLMD and result in structural collapse with a long simulation period, especially at high temperatures ${ }^{61}$. On the other hand, MLMDs using the present BPNNs show good stability in long-period NVE simulations as shown in the supplementary

|  | BPNN-LDA | BPNN-PBEsol | BPNN-SCAN | BD08 | CRG | Exp. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $L(300 \mathrm{~K})$ | 5.545 | 5.580 | 5.624 | 5.616 | 5.595 | $5.592^{25}$ |
| ACLTE ( $10^{-6} \mathrm{~K}^{-1}$ ) | 9.95 | 10.65 | 9.71 | 10.84 | 10.05 | $9.5^{62}, 9.67^{63}, 11.07^{26}$ |
| $T_{\alpha}(\mathrm{K})$ | 2360 | 2350 | 2460 | 2760 | 2450 |  |
| $T_{\mathrm{c}}(\mathrm{K})$ | 3040 | 2980 | 3200 | 3440 | 2930 | 2950 ${ }^{27}$, $3090^{28}$ |

Table 3. The lattice constant $L(T)$ at 300 K , the averaged coefficient of linear thermal expansion (ACLTE), the onset temperature of heat capacity anomaly $T_{\alpha}$, and the $\lambda$-peak temperature $T_{\mathrm{c}}$ are summarized.

materials. Thus, BPNNs trained in the present study enable us to conduct MLMD simulations over a long period with no anomalies.

Thermal expansion, enthalpy and specific heat capacity. In the above, BPNNs are found to have accuracy comparable to DFTs. Next, we apply MLMD to large-scale simulations, which are difficult to perform by FPMD. The present MLMD is about several hundred thousand times faster than FPMD (see the computational efficiency of BPNNs summarized in the Supplementary Materials). MLMD enables us to easily evaluate the thermal properties of $\mathrm{ThO}_{2}$ with the almost FPMD accuracy.

Here, we focus on a linear thermal expansion (LTE)

$$
\mathrm{LTE}=\frac{L(T)-L(300 \mathrm{~K})}{L(300 \mathrm{~K})},
$$

and an averaged coefficient of linear thermal expansion (ACLTE)

$$
\operatorname{ACLTE}=\frac{1}{T_{2}-T_{1}} \int_{T_{1}}^{T_{2}} \frac{1}{L(T)} \frac{\partial L(T)}{\partial T} d T=\frac{\log L\left(T_{2}\right)-\log L\left(T_{1}\right)}{T_{2}-T_{1}},
$$

where $L(T)$ is a lattice constant at temperature $T$. The values of the lattice constant at 300 K are listed in Table 3 . We also calculate enthalpy $H(T)$ and molar specific heat capacity at constant pressure, which is a critical quantity for discussion of the $\lambda$-transition,

$$
C_{p}=\frac{1}{n} \frac{\partial H(T)}{\partial T},
$$

where $n$ is the amount of substance in moles. Calculations of these properties require large system size and long averaging time to avoid the finite size effects. In addition, computations of the heat capacity and ACLTE require numerical measurements at a large number of temperature points with a tiny temperature step elevation for smooth numerical differentials. Therefore, it is difficult to evaluate these quantities by FPMD. Then, we perform MLMD NPT simulations using $6 \times 6 \times 6$ supercell ( 2592 atoms) and totally 200 ps run per 10 K temperature step. The $6 \times 6 \times 6$ supercell is large enough to neglect finite size effects and to evaluate the thermal properties of $\mathrm{ThO}_{2}$ as shown in the supplementary material. Moreover, in order to smooth the curves of heat capacity and ACLTE, we average their values over the interval of $\pm 100 \mathrm{~K}$ twice as performed in reference ${ }^{14}$ (see also the Supplementary Material). For the comparison, we also calculate the thermal properties using classical MD with BD08 and CRG empirical potentials.

Figure 2 shows the temperature dependence of LTE, enthalpy, and specific heat capacity $C_{p}$. Among the LTEs obtained by MLMDs and classical MDs as shown in Fig. 2a, the results computed by BPNN-SCAN show the best agreement with the Touloukian fitting of the experimental results, which is available up to 2000 K . The ACLTEs in the range from 300 to 1600 K are listed in Table 3. The ACLTE computed by BPNN-SCAN also shows good agreement with the experimental data $9.5 \times 10^{-6} \mathrm{~K}^{-1}$ from Momin ( $\left.298-1600 \mathrm{~K}\right)^{62}$ and $9.67 \times 10^{-6} \mathrm{~K}^{-1}$ by Rodriguez ( $293-2273 \mathrm{~K}$ ) ${ }^{63}$.

In enthalpy calculation as shown in Fig. 2a, the results computed by BPNN-SCAN and CRG potential provide close values to the Bekker fitting of the experiment ${ }^{64}$ over the entire temperature range. All computed enthalpies give close values in the low-temperature range, but show different behavior in the high-temperature range where the specific heat anomaly emerges as shown in Fig. 2b. The onset temperature of the specific heat anomaly can be characterized as $T_{\alpha}$, which is defined as the temperature giving the minimum value of $C_{p} / T^{65} . T_{\alpha}$ are ordered as BPNN-LDA, BPNN-PBEsol < CRG, BPNN-SCAN < BD08 as listed in Table 3. The peak position of $C_{p}$ obtained by BPNNs and CRG potential are in good agreement with the experimental results $2950 \mathrm{~K}^{27}$ and $3090 \mathrm{~K}^{28}$ reported as the Bredig transition temperature.

Oxygen diffusion and defect concentration. We evaluate the mean square displacements (MSD) defined as

$$
\operatorname{MSD}(t)=\frac{1}{N_{\alpha}} \sum_{i}^{N_{\alpha}}\left|\boldsymbol{r}_{i}(t)-\boldsymbol{r}_{i}(0)\right|^{2},
$$

![](./images/02d605a0-cb5d-4790-a16a-561efeb93ac3-06_617_1733_152_227.jpg)
Figure 2. (a-c) Temperature dependence of the LTE, the enthalpy and the molar specific heat capacity. The solid lines are the results obtained by MLMD with BPNN-LDA (black line), BPNN-PBEsol (blue line), and BPNN-SCAN (red line), respectively, whereas the dashed lines are the results computed by MD with BD08 (green line) and CRG potential (purple line). The black dashed-dot line in ( $\mathbf{a , b}$ ) represent the Touloukian ${ }^{62}$ and the Bekker fitting ${ }^{64}$ equations for the experiment.

![](./images/02d605a0-cb5d-4790-a16a-561efeb93ac3-06_595_1718_1023_229.jpg)
Figure 3. (a) MSD obtained by MLMD with BPNN-SCAN. (b) Temperature dependence of the self-diffusion constant for oxygen. (c) Temperature dependence of the vacancy concentration.

where $\boldsymbol{r}_{i}(t)$ is the position of the $i$-th atom at time $t$ and $N_{\alpha}$ is the total number of $\alpha$ atoms ( $\alpha$ is Th or O ). The employed system size and total time-step are the same as the cases computing the thermal expansion and the molar specific heat capacity. We conduct NVE simulations with 1 fs time-step at various temperatures using the volumes previously calculated in NPT ensemble. Figure 3a shows the MSD computed by MLMD with BPNNSCAN. In the previous study using FPMD ${ }^{19}$, accurate evaluations of MSD could not be performed due to its high computational costs. In contrast, MLMD easily overcomes such a limitation, and then sufficiently long simulations allow us to detect the diffusive regime even in the temperature region below $T_{\mathrm{c}}=3200 \mathrm{~K}$ (see MSD of oxygen at 2300 K in Fig. 3a). It should also be mentioned that The shows vibrational motions below and above the transition temperature. We evaluate the self-diffusion constant $D$ for the oxygen atoms from the slope of MSD in the range 25 to 100 ps . Figure 3b shows the temperature dependence of the self-diffusion constant for the oxygen atom. In all MLMD and clasical MD simulations, one can find the bending of the Arrhenius plot of the self-diffusion constant above $T_{\mathrm{c}}$. The deviation of the self-diffusion constant from Arrhenius law was experimentally reported in $\mathrm{PbF}_{2}{ }^{66,67}$, which belongs to the fluorite-type structure like $\mathrm{ThO}_{2}$. We calculate the activation energy of diffusion below $T_{\mathrm{c}}$ using the Arrhenius relation, $D=D_{0} \exp \left(-E_{\mathrm{AE}} / k T\right)$. Table 4 shows the values of the activation energy obtained by MLMDs and empirical MDs. All BPNNs give similar activation energies, which are lower than those obtained by the empirical atomic potential.

The specific heat anomaly and dynamics of anions have been investigated related to the disorders in fluorite, and defect cluster models have been proposed so far ${ }^{68,69}$. In this study, we focus on the vacancy concentration of oxygen in the regular site. In an ideal fluorite structure, one oxygen exits within a cube with vertices: ( $0,0,0$ ), $(0,0,1 / 2),(0,1 / 2,0),(1 / 2,0,0),(0,1 / 2,1 / 2),(1 / 2,1 / 2,0),(1 / 2,0,1 / 2)$, and $(1 / 2,1 / 2,1 / 2)$. Thus, we count a number of cubes not including oxygen from MD trajectories and define the vacancy concentration as the ratio of the empty cubes. As with the self-diffusion constant for oxygen, the temperature dependence of the oxygen

|  | BPNN-LDA | BPNN-PBEsol | BPNN-SCAN | BD08 | CRG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Activation energy below $T_{\mathrm{c}}(\mathrm{eV})$ | 4.851 | 4.446 | 4.400 | 7.049 | 6.696 |
| Vacancy concentration at $T_{\mathrm{c}}(\%)$ | 2.5 | 1.7 | 2.3 | 1.3 | 1.5 |

Table 4. Activation energy of diffusion below $T_{\mathrm{c}}$ and vacancy concentration at $T_{\mathrm{c}}$.

![](./images/02d605a0-cb5d-4790-a16a-561efeb93ac3-07_686_1703_456_244.jpg)
Figure 4. (a) Configuration of $6 \times 6 \times 12$ supercell including solid (left) and liquid phase (right). (b) Temperature dependence of the enthalpy obtained by the two-phase simulation approach using MLMD with BPNN-SCAN. The blue filled circles and the open green squares and red circles represent the enthalpies calculated in the periods as 0 ps to $100 \mathrm{ps}, 200 \mathrm{ps}$ to 300 ps and 400 ps to 500 ps , respectively.

|  | BPNN-LDA | BPNN-PBEsol | BPNN-SCAN | BD08 | CRG | Exp. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $T_{\mathrm{m}}(\mathrm{K})$ | $3450-3460$ | $3250-3260$ | $3610-3620$ | $3810-3820$ | $3640-3650$ | $3651^{27}$ |

Table 5. The melting points evaluated by two phase simulations.

vacancy concentrations obeys the Arrhenius law below $T_{\mathrm{c}}$, and the Arrhenius plots bent downwards above $T_{\mathrm{c}}$ as shown in Fig. 3c. These results indicate that the origin of the lambda transition and anion dynamics are closely related to the defect formation. The vacancy concentration of oxygen obtained by MLMDs and classical MDs are from 1 to $3 \%$ at $T_{\mathrm{c}}$ and are within $10 \%$ above $T_{\mathrm{c}}$. The low defect concentration of $\mathrm{ThO}_{2}$ below $T_{\mathrm{c}}$ is consistent with the experimental results of fluorite materials ${ }^{70-72}$.

Melting temperature. The melting temperature of thorium dioxide can be determined by the so-called two-phase simulation approach. A $6 \times 6 \times 12$ supercell ( 5184 atoms) including both solid and liquid phases is prepared as an initial configuration as shown in Fig. 4a. MLMD NPT simulations are performed from 3000 to 4000 K , in which the simulation time is taken over 500 ps . Figure 4 b shows averaged enthalpy calculated by BPNN-SCAN in the periods from 0 to $100 \mathrm{ps}, 200$ to 300 ps , and 400 to 500 ps , respectively. From Fig. 4b, we can confirm that the enthalpy jump at 3620 K and the melting point evaluated by MLMD with BPNN-SCAN lies between $3610-3620 \mathrm{~K}$. The melting temperatures evaluated by MLMDs and classical MDs are also summarized in Table 5. BPNN-SCAN closely reproduce the experimental melting point ( 3651 K ) while BPNN-LDA give somewhat lower melting point ( $3450-3460 \mathrm{~K}$ ) and BPNN-PBEsol significantly underestimate it as $3250-3260$ K . The choice of XC functional seems to be sensitive in evaluating accurate melting temperature. In calculation using empirical potentials, CRG potential provides accurate melting temperature, whereas BD08 potential overestimates it as shown in Table 5.

## Conclusion

MLMD simulations using BPNN were extensively performed to evaluate the thermal properties of a fuel material, thorium dioxide. In this paper, we made three types of BPNNs based on DFT reference data with LDA, PBEsol, and SCAN XC-functionals. We confirmed that the constructed BPNNs have close accuracy with DFTs through the comparisons of lattice constant, elastic properties, and phonon dispersion, which also well agree with the experimental data. Moreover, large-size and long-run simulations being inaccessible for FPMD were successfully performed by using MLMD. Through the systematic studies for thermal properties of thorium
dioxide, the BPNN-SCAN especially gave the closest results to the experimental fitting data for the thermal expansion and the enthalpy, and well reproduced the experimental melting temperature. Therefore, we judge that the BPNN-SCAN provides reasonable results for all testable experimental data. The BPNN-LDA and -PBEsol also showed reasonable results for several thermal properties of thorium dioxide, but they underestimated the experimental melting temperature. Comparing the XC functionals employed in this study, SCAN functional includes intermediate-range attractive dispersion interaction ${ }^{73}$, which is absent in other standard DFT functionals. Actually, it has been reported that the inclusion of dispersion interaction improves not only the description of the structural properties ${ }^{73,74}$ but also melting temperature and liquid properties ${ }^{75}$. Therefore, it turns out that the intermediate-range attractive dispersion interaction of the BPNN-SCAN leads to a correct description of the thermal properties of thorium dioxide.

In this study, we focused on the perfect bulk system and did not explicitly include the defect structures of thorium dioxide in the reference data. However, the present BPNNs can predict the defect formation energies for various defect structures with a certain degree of accuracy as shown in the Supplementary Material. The inclusion of liquid structures and the structures with oxygen diffusion at high temperatures is considered to make BPNNs possible to describe the various defect structures. Therefore, by adding some DFT data on defect structures to the reference data, the present BPNNs is expected to be applied to damage analysis under high radiation fields intrinsic to nuclear fuels. Further extension of the BPNNs to describe irradiation damage and surface state of thorium dioxide is an important future work.

In conclusion, we confirmed that the present MLMD is a powerful computation tool to explore high-temperature materials properties of thorium dioxide, one of oxide fuel compounds, with keeping first-principles accuracy. The state-of-the-art simulation scheme is further expected to find out the detailed physics of some unsolved phenomena just below the melting transition from microscopic levels. In principle, MLMD can be applicable for the calculation of thermal properties of other actinide dioxides. A key issue will be the construction of the reference dataset based on XC functionals describing strongly correlated $f$-electrons correctly. For example, to reproduce the insulator phase of other actinide dioxides, it is essential to use more sophisticated methods such as DFT+U or hybrid functional approach ${ }^{76-79}$. Once the reference dataset based on proper DFT methods is created, MLMD can capture high-temperature thermodynamical features in the first-principles accuracy as shown in the present study.

## Data availibility

The machine learning potentials (BPNNs) created in this study are included in the Supplementary Information files. The datasets generated during the current study are available from the corresponding author on reasonable request.

Received: 12 December 2021; Accepted: 30 May 2022
Published online: 13 June 2022

## References

1. International Atomic Energy Agency. Role of Thorium to Supplement Fuel Cycles of Future Nuclear Energy Systems. No. NF-T-2.4 in Nuclear Energy Series (International Atomic Energy Agency, 2012).
2. OECD. Introduction of Thorium in the Nuclear Fuel Cycle (OECD, 2015).
3. Herring, J. S., MacDonald, P. E., Weaver, K. D. \& Kullberg, C. Low cost proliferation resistant uranium-thorium dioxide fuels for light water reactors. Nucl. Eng. Des. 203, 65-85 (2001).
4. Govers, K., Lemehov, S., Hou, M. \& Verwerft, M. Comparison of interatomic potentials for uo2. Part I: Static calculations. J. Nucl. Mater. 366, 161-177. https://doi.org/10.1016/j.jnucmat.2006.12.070 (2007).
5. Govers, K., Lemehov, S., Hou, M. \& Verwerft, M. Comparison of interatomic potentials for uo2: Part II: Molecular dynamics simulations. J. Nucl. Mater. 376, 66-77. https://doi.org/10.1016/j.jnucmat.2008.01.023 (2008).
6. Adachi, J., Kurosaki, K., Uno, M. \& Yamanaka, S. A molecular dynamics study of thorium nitride. J. Alloy. Compd. 394, 312-316. https://doi.org/10.1016/j.jallcom.2004.11.005 (2005).
7. Arima, T., Yoshida, K., Matsumoto, T., Inagaki, Y. \& Idemitsu, K. Thermal conductivities of tho2, npo2 and their related oxides: Molecular dynamics study. J. Nucl. Mater. 445, 175-180. https://doi.org/10.1016/j.jnucmat.2013.11.006 (2014).
8. Behera, R. K. \& Deo, C. S. Atomistic models to investigate thorium dioxide (ThO2). J. Phys.: Condens. Matter 24, 215405. https:// doi.org/10.1088/0953-8984/24/21/215405 (2012).
9. Cooper, M. W. D., Rushton, M. J. D. \& Grimes, R. W. A many-body potential approach to modelling the thermomechanical properties of actinide oxides. J. Phys.: Condens. Matter 26, 105401. https://doi.org/10.1088/0953-8984/26/10/105401 (2014).
10. Ma, J.-J., Du, J.-G., Wan, M.-J. \& Jiang, G. Molecular dynamics study on thermal properties of tho2 doped with u and pu in high temperature range. J. Alloy. Compd. 627, 476-482. https://doi.org/10.1016/j.jallcom.2014.11.223 (2015).
11. Martin, P., Cooke, D. J. \& Cywinski, R. A molecular dynamics study of the thermal properties of thorium oxide. J. Appl. Phys. 112, 073507. https://doi.org/10.1063/1.4754430 (2012).
12. Shields, A. E., Ruiz Hernandez, S. E. \& de Leeuw, N. H. Theoretical analysis of uranium-doped thorium dioxide: Introduction of a thoria force field with explicit polarization. AIP Adv. 5, 087118. https://doi.org/10.1063/1.4928438 (2015).
13. Galvin, C. O. T., Cooper, M. W. D., Rushton, M. J. D. \& Grimes, R. W. Thermophysical properties and oxygen transport in (thx, pu1-x)o2. Sci. Rep. 6, 1-10. https://doi.org/10.1038/srep36024 (2016).
14. Potashnikov, S., Boyarchenkov, A., Nekrasov, K. \& Kupryazhkin, A. High-precision molecular dynamics simulation of uo2-puo2: Pair potentials comparison in uo2. J. Nucl. Mater. 419, 217-225. https://doi.org/10.1016/j.jnucmat.2011.08.033 (2011).
15. Kohn, W. \& Sham, L. J. Self-consistent equations including exchange and correlation effects. Phys. Rev. 140, A1133-A1138. https:// doi.org/10.1103/PhysRev.140.A1133 (1965).
16. Lu, Y., Yang, Y. \& Zhang, P. Thermodynamic properties and structural stability of thorium dioxide. J. Phys.: Condens. Matter 24, 225801. https://doi.org/10.1088/0953-8984/24/22/225801 (2012).
17. Szpunar, B. \& Szpunar, J. Theoretical investigation of structural and thermo-mechanical properties of thoria up to 3300 k temperature. Solid State Sci. 36, 35-40. https://doi.org/10.1016/j.solidstatesciences.2014.07.004 (2014).
18. Szpunar, B., Szpunar, J. \& Sim, K.-S. Theoretical investigation of structural and thermo-mechanical properties of thoria. J. Phys. Chem. Solids 90, 114-120. https://doi.org/10.1016/j.jpcs.2015.10.011 (2016).
19. Nakamura, H. \& Machida, M. High-temperature properties of thorium dioxide: A first-principles molecular dynamics study. J. Nucl. Mater. 478, 56-60. https://doi.org/10.1016/j.jnucmat.2016.05.042 (2016).
20. Behler, J. \& Parrinello, M. Generalized neural-network representation of high-dimensional potential-energy surfaces. Phys. Rev. Lett. 98, 146401. https://doi.org/10.1103/PhysRevLett.98.146401 (2007).
21. Bartók, A. P., Payne, M. C., Kondor, R. \& Csányi, G. Gaussian approximation potentials: The accuracy of quantum mechanics, without the electrons. Phys. Rev. Lett. 104, 136403. https://doi.org/10.1103/PhysRevLett.104.136403 (2010).
22. Behler, J. Constructing high-dimensional neural network potentials: A tutorial review. Int. J. Quantum Chem. 115, 1032-1050 (2015).
23. Bartók, A. P. \& Csányi, G. Gaussian approximation potentials: A brief tutorial introduction. Int. J. Quantum Chem. 115, 1051-1057 (2015).
24. Jinnouchi, R., Lahnsteiner, J., Karsai, F., Kresse, G. \& Bokdam, M. Phase transitions of hybrid perovskites simulated by machinelearning force fields trained on the fly with bayesian inference. Phys. Rev. Lett. 122, 225701 (2019).
25. Wolf, S. The Chemistry of the Actinide and Transactinide Elements 3273-3338 (Springer, 2006).
26. IAEA. Thermophysical Properties Database of Materials for Light Water Reactors and Heavy Water Reactors No 1496 in TECDOC Series (International Atomic Energy Agency, 2006).
27. Fischer, D., Fink, J. \& Leibowitz, L. Enthalpy of thorium dioxide to 3400 k. J. Nucl. Mater. 102, 220-222. https://doi.org/10.1016/ 0022-3115(81)90562-6 (1981).
28. Ronchi, C. \& Hiernaut, J. Experimental measurement of pre-melting and melting of thorium dioxide. J. Alloy. Compd. 240, 179-185. https://doi.org/10.1016/0925-8388(96)02329-8 (1996).
29. Dworkin, A. S. \& Bredig, M. A. Diffuse transition and melting in fluorite and antifluorite type of compounds. heat content of potassium sulfide from 298 to 1260 degree k. J. Phys. Chem. 72, 1277-1281. https://doi.org/10.1021/j100850a035 (1968).
30. Annamareddy, A. \& Eapen, J. Low dimensional string-like relaxation underpins superionic conduction in fluorites and related structures. Sci. Rep. 7, 1-12. https://doi.org/10.1038/srep44149 (2017).
31. Zhang, H., Wang, X., Chremos, A. \& Douglas, J. F. Superionic uo2: A model anharmonic crystalline material. J. Chem. Phys. 150, 174506. https://doi.org/10.1063/1.5091042 (2019).
32. Nakamura, H., Machida, M. \& Kato, M. First-principles calculation of phonon and Schottky heat capacities of plutonium dioxide. J. Phys. Soc. Jpn. 84, 053602. https://doi.org/10.7566/JPSJ.84.053602 (2015).
33. Kresse, G. \& Hafner, J. Ab initio molecular dynamics for liquid metals. Phys. Rev. B 47, 558 (1993).
34. Kresse, G. \& Furthmüller, J. Efficient iterative schemes for ab initio total-energy calculations using a plane-wave basis set. Phys. Rev. B 54, 11169 (1996).
35. Perdew, J. P. Accurate density functional for the energy: Real-space cutoff of the gradient expansion for the exchange hole. Phys. Rev. Lett. 55, 1665 (1985).
36. Ceperley, D. M. \& Alder, B. J. Ground state of the electron gas by a stochastic method. Phys. Rev. Lett. 45, 566-569. https://doi. org/10.1103/PhysRevLett.45.566 (1980).
37. Csonka, G. I. et al. Assessing the performance of recent density functionals for bulk solids. Phys. Rev. B 79, 155107. https://doi. org/10.1103/PhysRevB.79.155107 (2009).
38. Sun, J., Ruzsinszky, A. \& Perdew, J. P. Strongly constrained and appropriately normed semilocal density functional. Phys. Rev. Lett. 115, 036402 (2015).
39. Botu, V. \& Ramprasad, R. Adaptive machine learning framework to accelerate ab initio molecular dynamics. Int. J. Quantum Chem. 115, 1074-1083 (2015).
40. Li, Z., Kermode, J. R. \& De Vita, A. Molecular dynamics with on-the-fly machine learning of quantum-mechanical forces. Phys. Rev. Lett. 114, 096405 (2015).
41. Gastegger, M., Behler, J. \& Marquetand, P. Machine learning molecular dynamics for the simulation of infrared spectra. Chem. Sci. 8, 6924-6935 (2017).
42. Jacobsen, T. L., Jørgensen, M. S. \& Hammer, B. On-the-fly machine learning of atomic potential in density functional theory structure optimization. Phys. Rev. Lett. 120, 026102 (2018).
43. Li, W. \& Ando, Y. Dependence of a cooling rate on structural and vibrational properties of amorphous silicon: A neural network potential-based molecular dynamics study. J. Chem. Phys. 151, 114101 (2019).
44. Singraber, A., Behler, J. \& Dellago, C. Library-based lammps implementation of high-dimensional neural network potentials. J. Chem. Theory Comput. 15, 1827-1840 (2019).
45. Imbalzano, G. et al. Automatic selection of atomic fingerprints and reference configurations for machine-learning potentials. J. Chem. Phys. 148, 241730. https://doi.org/10.1063/1.5024611 (2018).
46. Singraber, A., Morawietz, T., Behler, J. \& Dellago, C. Parallel multistream training of high-dimensional neural network potentials. J. Chem. Theory Comput. 15, 3075-3092 (2019).
47. Plimpton, S. Fast parallel algorithms for short-range molecular dynamics. J. Comput. Phys. 117, 1-19 (1995).
48. Khaliullin, R. Z., Eshet, H., Kühne, T. D., Behler, J. \& Parrinello, M. Nucleation mechanism for the direct graphite-to-diamond phase transition. Nat. Mater. 10, 693-697 (2011).
49. Morawietz, T., Singraber, A., Dellago, C. \& Behler, J. How van der Waals interactions determine the unique properties of water. Proc. Natl. Acad. Sci. 113, 8368-8373 (2016).
50. Artrith, N. \& Urban, A. An implementation of artificial neural-network potentials for atomistic materials simulations: Performance for $\mathrm{TiO}_{2}$. Comput. Mater. Sci. 114, 135-150 (2016).
51. Buckingham, R. A. \& Lennard-Jones, J. E. The classical equation of state of gaseous helium, neon and argon. Proc. R. Soc. Lond. Ser. A Math. Phys. Sci. 168, 264-283. https://doi.org/10.1098/rspa. 1938.0173 (1938).
52. Daw, M. S. \& Baskes, M. I. Embedded-atom method: Derivation and application to impurities, surfaces, and other defects in metals. Phys. Rev. B 29, 6443-6453 (1984).
53. Macedo, P. M., Capps, W. \& Wachtman, J. O. Elastic constants of single crystal tho2 at $25^{\circ}$ c. J. Am. Ceram. Soc. 47, 651. https:// doi.org/10.1111/j.1151-2916.1964.tb13130.x (1964).
54. Staun Olsen, J., Gerward, L., Kanchana, V. \& Vaitheeswaran, G. The bulk modulus of tho2-An experimental and theoretical study. J. Alloy. Compd. 381, 37-40. https://doi.org/10.1016/j.jallcom.2004.04.099 (2004).
55. Idiri, M., Le Bihan, T., Heathman, S. \& Rebizant, J. Behavior of actinide dioxides under pressure: Uo ${ }_{2}$ and Tho 2 . Phys. Rev. B 70, 014113. https://doi.org/10.1103/PhysRevB.70.014113 (2004).
56. Benson, G. C., Freeman, P. J. \& Dempsey, E. Calculation of cohesive and surface energies of thorium and uranium dioxides. J. Am. Ceram. Soc. 46, 43-47. https://doi.org/10.1111/j.1151-2916.1963.tb13769.x (1963).
57. Clausen, K. et al. Inelastic neutron scattering investigation of the lattice dynamics of tho2 and ceo2. J. Chem. Soc. Faraday Trans. II 83, 1109 (1987).
58. Togo, A., Oba, F. \& Tanaka, I. First-principles calculations of the ferroelastic transition between rutile-type and cacl 2-type sio 2 at high pressures. Phys. Rev. B 78, 134106 (2008).
59. Gonze, X., Charlier, J.-C., Allan, D. \& Teter, M. Interatomic force constants from first principles: The case of $\alpha$-quartz. Phys. Rev. B 50, 13035-13038. https://doi.org/10.1103/PhysRevB.50.13035 (1994).
60. Gonze, X. \& Lee, C. Dynamical matrices, born effective charges, dielectric permittivity tensors, and interatomic force constants from density-functional perturbation theory. Phys. Rev. B 55, 10355-10368. https://doi.org/10.1103/PhysRevB.55.10355 (1997).
61. Kobayashi, K., Nagai, Y., Itakura, M. \& Shiga, M. Self-learning hybrid Monte Carlo method for isothermal-isobaric ensemble: Application to liquid silica. J. Chem. Phys. 155, 034106. https://doi.org/10.1063/5.0055341 (2021).
62. Momin, A., Mirza, E. \& Mathews, M. High temperature x-ray diffractometric studies on the lattice thermal expansion behaviour of uo2, tho2 and (u0.2th0.8)o2 doped with fission product oxides. J. Nucl. Mater. 185, 308-310. https://doi.org/10.1016/0022-3115(91)90521-8 (1991).
63. Rodriguez, P. \& Sundaram, C. Nuclear and materials aspects of the thorium fuel cycle. J. Nucl. Mater. 100, 227-249. https://doi. org/10.1016/0022-3115(81)90534-1 (1981).
64. Bakker, K., Cordfunke, E., Konings, R. \& Schram, R. Critical evaluation of the thermal properties of th02 and thl $-y \mathrm{u}_{y} 0_{2}$ and a survey of the literature data on $\mathrm{th}_{1-y} \mathrm{pu}_{y} 0_{2}$. J. Nucl. Mater. 250, 1-12. https://doi.org/10.1016/S0022-3115(97)00241-9 (1997).
65. Eapen, J. \& Annamareddy, A. Entropic crossovers in superionic fluorites from specific heat. Ionics 23, 1043-1047. https://doi.org/ 10.1007/s11581-017-2007-z (2017).
66. Benz, R. Electrical conductivity of pbf2. Z. Phys. Chem. 95, 25-32. https://doi.org/10.1524/zpch.1975.95.1-3.025 (1975).
67. Lunghammer, S. et al. Self-diffusion and ionic exchange in mechanosynthesized, nanocrystalline solid solutions of pbf2 and caf2 19f2d nmr visualizes the flourine hopping preferences. Solid State Ionics 343, 115067. https://doi.org/10.1016/j.ssi.2019.115067 (2019).
68. Hutchings, M. T. et al. Investigation of thermally induced anion disorder in fluorites using neutron scattering techniques. J. Phys. C Solid State Phys. 17, 3903-3940. https://doi.org/10.1088/0022-3719/17/22/011 (1984).
69. Clausen, K., Hayes, W., Macdonald, J. E., Osborn, R. \& Hutchings, M. T. Observation of oxygen frenkel disorder in uranium dioxide above 2000 k by use of neutron-scattering techniques. Phys. Rev. Lett. 52, 1238-1241. https://doi.org/10.1103/PhysRevLett.52.1238 (1984).
70. Agency., I. A. E. Neutron inelastic scattering 1977: Proceedings of a Symposium on Neutron Inelastic Scattering/Held By the International Atomic Energy Agency in Vienna, 17-21 Oct. 1977 (International Atomic Energy Agency, 1978).
71. Dickens, M. H., Hayes, W., Hutchings, M. T. \& Kleppmann, W. G. Neutron scattering studies of acoustic phonon modes in PbF2up to high temperatures. J. Phys. C Solid State Phys. 12, 17-25. https://doi.org/10.1088/0022-3719/12/1/015 (1979).
72. Dickens, M. H., Hayes, W., Hutchings, M. T. \& Smith, C. Investigation of anion disorder in PbF2at high temperatures by neutron diffraction. J. Phys. C Solid State Phys. 15, 4043-4060. https://doi.org/10.1088/0022-3719/15/19/006 (1982).
73. Yang, J. H., Kitchaev, D. A. \& Ceder, G. Rationalizing accurate structure prediction in the meta-gga scan functional. Phys. Rev. B 100, 035132. https://doi.org/10.1103/PhysRevB.100.035132 (2019).
74. Hinuma, Y., Hayashi, H., Kumagai, Y., Tanaka, I. \& Oba, F. Comparison of approximations in density functional theory calculations: Energetics and structure of binary oxides. Phys. Rev. B 96, 094102. https://doi.org/10.1103/PhysRevB.96.094102 (2017).
75. Morawietz, T., Singraber, A., Dellago, C. \& Behler, J. How van der Waals interactions determine the unique properties of water. Proc. Natl. Acad. Sci. 113, 8368-8373. https://doi.org/10.1073/pnas.1602375113 (2016).
76. Nakamura, H., Machida, M. \& Kato, M. Effects of spin-orbit coupling and strong correlation on the paramagnetic insulating state in plutonium dioxides. Phys. Rev. B 82, 155131. https://doi.org/10.1103/PhysRevB.82.155131 (2010).
77. Suzuki, M.-T., Magnani, N. \& Oppeneer, P. M. Microscopic theory of the insulating electronic ground states of the actinide dioxides $\mathrm{ano}_{2}(\mathrm{an}=\mathrm{u}, \mathrm{np}, \mathrm{pu}, \mathrm{am}$, and cm). Phys. Rev. B 88, 195146. https://doi.org/10.1103/PhysRevB. 88.195146 (2013).
78. Nakamura, H. \& Machida, M. Hybrid density functional study on plutonium dioxide. In Proceedings of the International Conference on Strongly Correlated Electron Systems (SCES2013), Vol. 3, 017034, https://doi.org/10.7566/JPSCP.3.017034 (2014).
79. Pegg, J. T., Aparicio-Anglès, X., Storr, M. \& de Leeuw, N. H. Dft+u study of the structures and properties of the actinide dioxides. J. Nucl. Mater. 492, 269-278. https://doi.org/10.1016/j.jnucmat.2017.05.025 (2017).
80. Momma, K. \& Izumi, F. Vesta: a three-dimensional visualization system for electronic and structural analysis. J. Appl. Crystallogr. 41, 653-658 (2008).

## Acknowledgements

H.N. and M.M. acknowledge fruitful discussion with M. Kato. We would also thank the director of CCSE, H. Takemiya, and all other staff members for computational support. M.W.D.C. acknowledges support from the U.S. Department of Energy, Office of Nuclear Energy, Nuclear Energy Advanced Modeling Simulation (NEAMS) Program. A part of the present work was planned through discussions among members (M.W.D.C, H.N., and M.M.) of US-Japan Civil Nuclear Energy Research and Development Working Group (CNWG). This work was partially supported by JSPS KAKENHI Grant Number 18 K 05208 (M.O.) and 18 K 11345 (M.M.). This calculations were performed on the supercomputing system HPE SGI8600 in the Japan Atomic Energy Agency. The crystal structures were drawn with VESTA ${ }^{80}$.

## Author contributions

K.K., M.O. and H.N. performed the simulations under the supervision of H.N. and M.M. K.K. and M.M. wrote the main manuscript. M.O., H.N. M.I. and M.W.D.C. improved the idea and revised the manuscript. All authors reviewed and approved the final manuscript.

## Competing interests

The authors declare no competing interests.

## Additional information

Supplementary Information The online version contains supplementary material available at https://doi.org/ $10.1038 / \mathrm{s} 41598-022-13869-9$.

Correspondence and requests for materials should be addressed to K.K.
Reprints and permissions information is available at www.nature.com/reprints.
Publisher's note Springer Nature remains neutral with regard to jurisdictional claims in published maps and institutional affiliations.

Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the Creative Commons licence, and indicate if changes were made. The images or other third party material in this article are included in the article's Creative Commons licence, unless indicated otherwise in a credit line to the material. If material is not included in the article's Creative Commons licence and your intended use is not permitted by statutory regulation or exceeds the permitted use, you will need to obtain permission directly from the copyright holder. To view a copy of this licence, visit http://creativecommons.org/licenses/by/4.0/.
© The Author(s) 2022


[^0]:    ${ }^{1}$ CCSE, Japan Atomic Energy Agency, Kashiwa, Chiba 277-0871, Japan. ${ }^{2}$ Materials Science and Technology Division, Los Alamos National Laboratory, P.O. Box 1663, Los Alamos, NM 87545, USA. ${ }^{3}$ These authors contributed equally: Masahiko Okumura, Hiroki Nakamura, Mitsuhiro Itakura, Masahiko Machida and Michael W. D. Cooper. ${ }^{\boxtimes}$ email: kobayashi.keita@jaea.go.jp

