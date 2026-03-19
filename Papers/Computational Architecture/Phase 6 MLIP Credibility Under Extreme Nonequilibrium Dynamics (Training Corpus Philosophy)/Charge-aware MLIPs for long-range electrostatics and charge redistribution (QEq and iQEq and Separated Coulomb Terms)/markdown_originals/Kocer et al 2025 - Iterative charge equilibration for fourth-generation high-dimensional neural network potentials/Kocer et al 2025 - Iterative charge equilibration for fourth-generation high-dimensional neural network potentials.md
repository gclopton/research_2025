## RESEARCH ARTICLE | MARCH 252025

## Iterative charge equilibration for fourth-generation highdimensional neural network potentials

Special Collection: Michele Parrinello Festschrift
Emir Kocer (D); Andreas Singraber (D); Jonas A. Finkler (D); Philipp Misof (D); Tsz Wai Ko (D); Christoph Dellago (D ; Jörg Behler $\mathbf{O}$ (D)
J. Chem. Phys. 162, 124106 (2025)
https://doi.org/10.1063/5.0252566
![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-01_106_107_769_1541.jpg)

View Online
![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-01_118_100_769_1685.jpg)

## Articles You May Be Interested In

Free energy profiles for chemical reactions in solution from high-dimensional neural network potentials: The case of the Strecker synthesis
J. Chem. Phys. (May 2025)
wACSF-Weighted atom-centered symmetry functions as descriptors in machine learning potentials
J. Chem. Phys. (March 2018)

Computation of the heat capacity of water from first principles
J. Chem. Phys. (October 2025)

## AIP Advances

## Why Publish With Us?

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-01_417_412_2236_445.jpg)
![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-01_131_115_2407_1592.jpg)

# Iterative charge equilibration for fourth-generation high-dimensional neural network potentials 

Cite as: J. Chem. Phys. 162, 124106 (2025); doi: $10.1063 / 5.0252566$<br>Submitted: 10 December 2024 • Accepted: 2 March 2025 •<br>Published Online: 25 March 2025

Emir Kocer, ${ }^{1,2}$ (D) Andreas Singraber, ${ }^{3}$ (D) Jonas A. Finkler, ${ }^{4}$ (D) Philipp Misof, ${ }^{3}$ (D) Tsz Wai Ko, ${ }^{5}$ (D) Christoph Dellago, ${ }^{3}$ (D) and Jörg Behler ${ }^{1,2, a)}$ (D)

AFFILIATIONS<br>${ }^{1}$ Lehrstuhl für Theoretische Chemie II, Ruhr-Universität Bochum, 44780 Bochum, Germany<br>${ }^{2}$ Research Center Chemical Sciences and Sustainability, Research Alliance Ruhr, 44780 Bochum, Germany<br>${ }^{3}$ University of Vienna, Faculty of Physics, Boltzmanngasse 5, A-1090 Vienna, Austria<br>${ }^{4}$ Department of Chemistry and Bioscience, Aalborg University, 9220 Aalborg, Denmark<br>${ }^{5}$ Aiiso Yufeng Li Family Department of Chemical and Nano Engineering, UC San Diego, 9500 Gilman Dr., La Jolla, California 92093-0448, USA

Note: This paper is part of the JCP Special Topic, Michele Parrinello Festschrift.
${ }^{\text {a) }}$ Author to whom correspondence should be addressed: joerg.behler@rub.de


#### Abstract

Machine learning potentials allow performing large-scale molecular dynamics simulations with about the same accuracy as electronic structure calculations, provided that the selected model is able to capture the relevant physics of the system. For systems exhibiting long-range charge transfer, fourth-generation machine learning potentials need to be used, which take global information about the system and electrostatic interactions into account. This can be achieved in a charge equilibration step, but the direct solution of the set of linear equations results in an unfavorable cubic scaling with system size, making this step computationally demanding for large systems. In this work, we propose an alternative approach that is based on the iterative solution of the charge equilibration problem (iQEq) to determine the atomic partial charges. We have implemented the iQEq method, which scales quadratically with system size, in the parallel molecular dynamics software LAMMPS for the example of a fourth-generation high-dimensional neural network potential (4G-HDNNP) intended to be used in combination with the n2p2 library. The method itself is general and applicable to many different types of fourth-generation MLPs. An assessment of the accuracy and the efficiency is presented for a benchmark system of $\mathrm{FeCl}_{3}$ in water.


Published under an exclusive license by AIP Publishing. https://doi.org/10.1063/5.0252566

## I. INTRODUCTION

The accurate description of potential energy surfaces (PES) in an efficient way remains one of the central challenges in computational chemistry and materials science. Established electronic structure methods, such as density functional theory (DFT), ${ }^{1}$ offer high accuracy but are prohibitively expensive for large systems. To address this challenge, machine learning potentials (MLPs) ${ }^{2-8}$ have emerged as a powerful alternative, offering an accuracy comparable to first-principles methods at strongly reduced computational costs, making them a useful tool for atomistic simulations. Since the first

MLP was proposed in 1995, ${ }^{9}$ significant advances have been made in the development of MLPs, which may now, for instance, be classified into four generations. ${ }^{10}$

Early first-generation MLPs are applicable to low-dimensional systems and typically employ feed-forward neural networks to describe the potential energy of the system. ${ }^{9,11-13}$ The extension of MLPs to large condensed systems containing thousands of atoms became possible with the second generation of MLPs, which is based on representing the energy of the system as a sum of environment-dependent atomic energies. The first example of this generation has been high-dimensional neural network potentials
(HDNNPs) introduced by Behler and Parrinello in $2007 .{ }^{14}$ To distinguish these HDNNPs from extended versions introduced in the following years, the term 2G-HDNNP is often used for these HDNNPs. At present, many very accurate MLPs of this generation are available. ${ }^{14-20}$ Moreover, the introduction of MLPs employing modern message passing neural networks ${ }^{21}$ enables the extension of the atomic environments by passing information from atom to atom. ${ }^{22-25}$ Still, these potentials remain (semi-)local due to the limited number of passing steps employed in practical applications.

In spite of many successful applications, second-generation MLPs rely on environment-dependent atomic energies only and, therefore, do not incorporate any long-range interactions. This gap has been filled by the third generation that extends MLPs by modeling the electrostatic energy and forces through environmentdependent atomic charges. ${ }^{26-33}$ While these potentials offer some improvements in accuracy for some systems, ${ }^{34}$ the computational cost is often increased by the need for computing machine learned charges and the explicit calculation of electrostatics, e.g., via an Ewald sum, ${ }^{35,36}$ which can become the bottleneck in large-scale molecular dynamics (MD) simulations. As a comment, it should be noted that the representation of charges and electrostatic multipoles by machine learning has been suggested as early as $2007^{26}$ to improve the accuracy of the electrostatic energy in classical force fields, i.e., at about the same time as the introduction of second generation MLPs ${ }^{14}$ according to the classification scheme employed here.

Despite the inclusion of long-range electrostatics in thirdgeneration MLPs, these potentials are still "local" in the sense that they exclusively make use of environment-dependent properties such as atomic energies and charges. As a consequence, they are unable to describe dependencies on distant changes in a system such as (de)protonation reactions ${ }^{37}$ or electron transfer in redox processes, ${ }^{38}$ which may result in long-range charge transfer within the system. Such nonlocal phenomena are included in fourthgeneration MLPs, in which the atomic charges depend on the entire system.

The Charge Equilibration Neural Network Technique (CENT) ${ }^{39}$ was the first MLP to incorporate long-range charge transfer by using atomic electronegativities as environment-dependent properties learned via neural networks. These electronegativities are then used in a global charge equilibration (QEq) ${ }^{40}$ step to predict the charges of all atoms in the system. ${ }^{41-43}$ In recent years, fourth-generation MLPs have become an active field of research, and several methods have been proposed. ${ }^{37,44-49}$ An important example is the fourth-generation high-dimensional neural network potential (4G-HDNNP), ${ }^{37}$ which combines the advantages of CENT, i.e., global charges and electrostatics determined from QEq, and of 2G-HDNNPs, i.e., the accurate description of arbitrary local interactions within the atomic environments. Like in CENT, the QEq step in 4G-HDNNPs makes use of environment-dependent electronegativities expressed by atomic neural networks, but unlike CENT, the training of these neural networks does not aim to directly minimize the electrostatic energy. Instead, the electronegativities are optimized to match a set of reference charges derived from DFT calculations. As these charges are determined from all electronegativities, they account for the structure and composition of the entire system, which ensures a globally correct distribution of charges. It is
important to note that the equilibration of the charge density also affects local bonding. Therefore, the atomic charges serve-next to determining long-range electrostatics-also as additional global descriptors to compute the atomic energies in combination with atom-centered symmetry functions, ${ }^{50}$ which provide local structural fingerprints of the environments.

A disadvantage of the direct charge equilibration step (dQEq) used in CENT and 4G-HDNNPs is the cubic scaling of solving the underlying matrix equations with respect to the number of atoms, which becomes computationally demanding for large systems. These costs thus restrict the system size in molecular dynamics (MD) simulations, which require updated atomic charges at each new step. In a very recent study, Gubler et al. ${ }^{51}$ reformulated the QEq problem to avoid the explicit computation of coefficient matrix elements, leading to a quasi-linear scaling of the method. In this work, we adopt a similar strategy and present a modified 4G-HDNNP method that builds upon the original method but focuses on an efficient solution for the charge and force calculation. This improved efficiency compared to the original dQEq is achieved by iteratively minimizing a multidimensional function of the atomic partial charges using a gradient based method, which provides essentially the same results. This iterative charge equilibration (iQEq) thus avoids the construction and solution of the extended Coulomb matrix and, therefore, reduces the scaling from cubic to approximately quadratic.

In this paper, we introduce the technical details and a benchmark application of the iQEq method, which we have implemented in the open-source software Large-scale Atomic/Molecular Massively Parallel Simulator (LAMMPS), ${ }^{52}$ allowing for large-scale MD simulations of periodic systems using the 4G-HDNNP method. This new pair style can be used on multiple cores and is developed as an interface to the n2p2 library ${ }^{53}$ for HDNNPs, which to date did not offer the option to run MD simulations based on 4G-HDNNPs. In Sec. II, we provide a concise summary of the 4G-HDNNP method based on conventional dQEq. Then, we describe the iterative iQEq methodology and its implementation in LAMMPS. To illustrate the accuracy and performance of iQEq, we have carried out MD simulations of aqueous $\mathrm{FeCl}_{3}$ solutions with different concentrations and compositions employing a recently reported 4G-HDNNP potential ${ }^{38}$ for this system. Iron chloride solutions are challenging for MLPs, since the iron ions can adopt two different oxidation states in solution, $\mathrm{Fe}^{2+}$ and $\mathrm{Fe}^{3+}$. If data for both ions is combined in a single data set, in local second-generation and third-generation MLPs, the oxidation state is ill-defined, since chloride ions may be located outside the local environments, resulting in insufficient information to define the iron oxidation state. As shown in Ref. 38, 4G-HDNNPs are able to overcome this problem and to describe both aqueous $\mathrm{FeCl}_{2}$ and $\mathrm{FeCl}_{3}$ solutions correctly.

## II. METHODS

## A. 4G-HDNNP with direct charge equilibration

A 4G-HDNNP ${ }^{37}$ is a nonlocal MLP of the fourth-generation ${ }^{54}$ containing atomic energies to represent local interactions and long-range electrostatic interactions based on structure-dependent atomic charges. In contrast to strictly local second-generation 2GHDNNPs, ${ }^{14}$ in which the atomic interactions are environmentdependent and smoothly truncated at a fixed cutoff radius, ${ }^{50}$ the atomic energy contributions in 4G-HDNNPs also depend on the
respective atomic charges that serve as global descriptors and are determined in a direct charge equilibration step ${ }^{40}$ distributing the atomic charge density globally within the system. Therefore, this method can describe long-range charge transfer, which can give rise to local charge density changes throughout the system in response to very distant structural features or chemical reactions. The purpose of using the atomic charges as additional descriptors for the atomic energies is to consistently account for the effects of these charge density changes on local bonding.

The workflow of a 4G-HDNNP is shown schematically in Fig. 1. Starting from the Cartesian coordinate vectors $\left\{\mathbf{R}_{i}\right\}$, first a vector $\mathbf{G}_{i}$ of atom-centered symmetry functions (ACSF) ${ }^{50}$ is computed for each atom $i$, which is invariant with respect to translation and rotation of the system as well as permutation of like atoms and provides a local structure fingerprint of the atomic environment up to a cutoff radius $R_{\mathrm{c}}$. Then, a first set of atomic feed-forward neural networks (NNs) is used to compute environment-dependent atomic

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-04_1030_770_996_189.jpg)
FIG. 1. Schematic structure of the direct 4G-HDNNP method for a binary system. ${ }^{37}$ The $\mathbf{R}_{i}$ are the Cartesian coordinate vectors of the $N$ atoms of element A and $M$ atoms of element B, which are first transformed to atom-centered symmetry function vectors $\mathbf{G}_{i}$ describing the atomic environments. These vectors then serve as inputs for the atomic neural networks predicting the atomic electronegativities $X_{i}$ that are used in a global charge equilibration step to yield the atomic charges $Q_{i}$. These charges determine the electrostatic energy $E_{\text {elec }}$. Moreover, the $Q_{i}$ and $\mathbf{G}_{i}$ of each atom are used as input for a second atomic neural network providing its atomic energy $E_{i}$. The sum of all atomic energies $E_{\text {short }}$ is then combined with the electrostatic energy to the total potential energy $E_{\text {total }}$ of the system.

electronegativities $\chi_{i}$, which allow the computation of the atomic charges $Q_{i}$ in a global charge equilibration step. These charges are used for two purposes: first, to calculate the electrostatic energy $E_{\text {elec }}$; and second, together with the respective $\mathbf{G}$-vector as an additional input neuron for a second atomic NN providing the atomic energy contributions $E_{i}$, which are added to yield $E_{\text {short }}$. The total potential energy $E_{\text {total }}$ of the system is then given by

$$
E_{\text {total }}=E_{\text {elec }}+E_{\text {short }} .
$$

The mapping from atomic electronegativities $\chi_{i}$ to atomic partial charges $Q_{i}$ via QEq is the key step of the 4G-HDNNP method. In the original 4G-HDNNP method, ${ }^{37}$ this is achieved by solving a system of linear equations, and here we will refer to this approach as direct dQEq, which is commonly used in different charge equilibration methods. ${ }^{3}$

The linear equations of dQEq are obtained as first derivatives of the charge equilibration energy

$$
E_{\mathrm{QEq}}=E_{\mathrm{Coulomb}}+\sum_{i=1}^{N_{\text {atoms }}} \chi_{i} Q_{i}+\frac{1}{2} J_{i} Q_{i}^{2}
$$

i.e., by minimizing this energy expression with respect to the atomic partial charges. Specifically, $E_{\mathrm{QEq}}$ consists of the classical Coulomb energy $E_{\text {Coulomb }}$ of the Gaussian-broadened atomic charges and a second-order Taylor expansion of the atomic energies in terms of the $Q_{i}$. $J_{i}$, which is an element-specific hardness to be optimized, as well as the parameters of the NNs determining the electronegativities $\chi_{i}$, are obtained in a training process, in which they are adapted to reproduce reference charges from electronic structure calculations. Often, Hirshfeld charges ${ }^{57}$ are used for this purpose. However, the quality of the final potential does not significantly depend on the particular choice of partitioning method, as the main purpose of the charges is the use as additional input features of the atomic neural networks. Moreover, long-range electrostatic interactions are efficiently screened in aqueous electrolytes, while at short interatomic distances, i.e., within the cutoff radius of the ACSFs, any error in the electrostatic energy can be corrected by the atomic energies.

The energy $E_{\mathrm{QEq}}$ can be rewritten in matrix notation as

$$
E_{\mathrm{QEq}}=\frac{1}{2} \mathbf{Q}^{T} \mathbf{A} \mathbf{Q}+\mathbf{Q}^{T} \boldsymbol{\chi}
$$

where the matrix $\mathbf{A}$ with dimensions $N_{\text {atoms }} \times N_{\text {atoms }}$ represents $E_{\text {Coulomb }}$ as well as the atomic hardness. The elements of $\mathbf{A}$ have different forms for non-periodic and periodic systems:

- Non-periodic system:

$$
A_{i j}= \begin{cases}J_{i}+\frac{1}{\sqrt{\pi} \sigma_{i}} & \text { for } i=j, \\ \frac{\operatorname{erf}\left(\frac{R_{i j}}{\sqrt{2} \gamma_{i j}}\right)}{R_{i j}} & \text { for } i \neq j .\end{cases}
$$

- Periodic system (Ewald summation ${ }^{36}$ ):

$$
\begin{aligned}
A_{i j}= & \underbrace{\frac{4 \pi}{V} \sum_{\mathbf{k} \neq \mathbf{0}} \frac{e^{\frac{-\eta^{2}|\mathbf{k}|^{2}}{2}}}{|\mathbf{k}|^{2}} \cos \left[\mathbf{k}\left(\mathbf{R}_{i}-\mathbf{R}_{j}\right)\right]}_{=: A_{i j}^{\text {recip }}} \\
& + \begin{cases}J_{i}-\frac{2}{\sqrt{2 \pi} \eta}+\frac{1}{\sqrt{\pi} \sigma_{i}} & \text { for } i=j, \\
\frac{\operatorname{erfc}\left(\frac{R_{i j}}{\sqrt{2} \eta}\right)}{R_{i j}}-\frac{\operatorname{erfc}\left(\frac{R_{i j}}{\sqrt{2} \gamma_{i j}}\right)}{R_{i j}} & \text { for } i \neq j, R_{i j}<R_{\text {cut }}^{\text {real }}\end{cases}
\end{aligned}
$$

The parameters $\sigma_{i}$ determine the widths of the Gaussians representing the atomic charges for the computation of $E_{\text {Coulomb }}$ and $\gamma_{i j}=\sqrt{\sigma_{i}^{2}+\sigma_{j}^{2}}$, whereas $\eta$ is a hyperparameter defining the spatial extension of the real space part in the Ewald sum. To obtain the atomic charges, $E_{\mathrm{QEq}}$ is minimized by solving

$$
\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}=0,
$$

with the constraint $\sum_{i} Q_{i}=Q_{\text {tot }}$ for each atom $i$. This total charge conservation constraint is enforced by a Lagrange multiplier $\lambda$ and leads to an extended matrix $\mathbf{A}^{\prime}$ with dimension ( $N_{\text {atoms }}+1$ ) $\times\left(N_{\text {atoms }}+1\right)$,

$$
\left(\begin{array}{ccc|c} 
& & & 1 \\
& A_{i, j} & \vdots \\
& & 1 \\
\hline 1 & \ldots & 1 & 0
\end{array}\right)\left(\begin{array}{c}
Q_{1} \\
\vdots \\
Q_{N_{\text {atoms }}} \\
\hline \lambda
\end{array}\right)=\left(\begin{array}{c}
-\chi_{1} \\
\vdots \\
-\chi_{N_{\text {atoms }}} \\
\hline Q_{\text {tot }}
\end{array}\right)
$$

or, introducing a solution vector $\boldsymbol{b}$ representing the right hand side of Eq. (7),

$$
\mathbf{A}^{\prime} \mathbf{Q}^{\prime}=\boldsymbol{b} .
$$

This equation can then be solved to determine the atomic partial charges by calculating the inverse of the matrix $\mathbf{A}^{\prime}$. Once the atomic charges have been obtained, atomic forces can be calculated as described in Ref. 37.

## B. Iterative charge equilibration

To improve the computational performance of 4G-HDNNPs, an increased efficiency of the charge equilibration step is central. We address this problem by replacing the cubically scaling dQEq method with an iterative iQEq algorithm, which performs a multidimensional function minimization for calculating the atomic charges and force components. Solving a system of linear equations iteratively via gradient-based optimizations such as the conjugate gradient algorithm has been proposed in the literature before, ${ }^{58}$ and it has been shown that the scaling of the solution can be enhanced significantly. Recently, Gubler et al. ${ }^{51}$ also discussed this issue and showed that an iterative solution using a rapidly converging conjugate gradient method in combination with a particle mesh solver leads to
substantially improved scaling with respect to the number of atoms in the system.

In dQEq, constructing the matrix $\mathbf{A}^{\prime}$ scales quadratically with the number of atoms, while the solution of Eq. (7) exhibits cubic scaling. In the iQEq method, this solution is replaced by a multidimensional function minimization scheme, exploiting that the charge equilibration energy $E_{\mathrm{QEq}}$ is a multidimensional function of the atomic charges,

$$
E_{\mathrm{QEq}}=E_{\mathrm{QEq}}\left(Q_{1}, \ldots, Q_{N_{\text {atoms }}}\right)
$$

Minimizing this function using a gradient-based approach in combination with a total charge constraint

$$
Q_{\mathrm{tot}}=\sum_{i=1}^{N_{\mathrm{atoms}}} Q_{i}
$$

yields the atomic charge vector. The gradient vector of the charge equilibration energy with respect to the charge vector $\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}$ can be obtained for both non-periodic and periodic systems as follows:

- Non-periodic system:

$$
\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}=\frac{Q_{i}}{\sigma_{i} \sqrt{\pi}}+\chi_{i}+J_{i} Q_{i}+\sum_{j \neq i}^{N_{\text {atoms }}} \frac{\operatorname{erf}\left(\frac{r_{i j}}{\sqrt{2} \gamma_{i j}}\right)}{r_{i j}} Q_{j} .
$$

- Periodic system:

$$
\begin{aligned}
\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}= & \chi_{i}+J_{i} Q_{i}+\frac{2 \pi}{V} \sum_{\overrightarrow{\mathbf{k}}+\mathbf{0}} \frac{e^{\frac{-\eta^{2}|\mathbf{k}|^{2}}{2}}}{|\overrightarrow{\mathbf{k}}|^{2}} 2 \operatorname{Re}\left(S(\mathbf{k}) e^{i \mathbf{k} \cdot \mathbf{r}_{i}}\right) \\
& +\sum_{j}^{N_{\text {neig }}} \frac{\operatorname{erfc}\left(\frac{R_{i j}}{\sqrt{2} \eta}\right)-\operatorname{erfc}\left(\frac{R_{i j}}{\sqrt{2} \gamma}\right)}{R_{i j}} Q_{j} \\
& +\frac{Q_{i}}{\sqrt{\pi} \sigma_{i}}-\frac{2 Q_{i}}{\sqrt{2 \pi} \eta},
\end{aligned}
$$

where $S(\mathbf{k})$ is the structure factor defined as

$$
S(\mathbf{k})=\sum_{i=1}^{N_{\text {atoms }}} Q_{i} \exp \left(i \mathbf{k} \cdot \mathbf{r}_{i}\right)
$$

Using the gradient vector, the QEq energy can then be minimized using any gradient-based algorithm. This minimization is an iterative process, and the number of iterations depends on the selected gradient algorithm and tolerance values. Two different tolerance parameters need to be selected in the iQEq approach: one is the tolerance for the line minimization, and the other is the tolerance for convergence (i.e., gradient tolerance). The former sets the accuracy for the line search process within the minimization algorithm. During each iteration, the algorithm searches along a particular direction defined by the gradient or other optimization criteria to find a step size that minimizes the function in that direction. The latter sets the convergence criterion for the entire minimization process. It
ensures that the norm of the gradient falls below a certain threshold, meaning that a local minimum has been reached. In this study, these tolerances are set to $10^{-2} \mathrm{eV}$ and $10^{-5} \mathrm{eV} / \mathrm{e}$, respectively, and in general the values to be chosen depend on the desired accuracy and performance as discussed below. It has been observed that the iterative solution significantly improves the scaling of the method with system size, making it attractive for simulations of large systems. The detailed performance comparison between iQEq and dQEq methods is provided in Sec. III.

After calculating the atomic charges, the next step is to compute the electrostatic energy and forces. For the computation of the forces, in principle, the partial derivatives of the charges with respect to all atomic coordinates are required. However, this approach is computationally demanding as it requires solving a system of linear equations for each force component, i.e., $3 \times N_{\text {atoms }}$ systems of linear equations, since the matrix elements are different for each component. To avoid this demanding step, an efficient Lagrange formalism is utilized that allows for the calculation of forces by solving only a single system of linear equations as derived in the supplementary information of Ref. 37.

First, to simplify the force calculation, we introduce an auxiliary function $L$ defined as

$$
L=E_{\text {total }}+\sum_{i=1}^{N_{\text {atoms }}+1} \lambda_{i}\left(\sum_{j=1}^{N_{\text {atoms }}+1} A_{i j}^{\prime} Q_{j}^{\prime}-b_{i}\right),
$$

where $E_{\text {total }}$, i.e., $E_{\text {elec }}+E_{\text {short }}$, depends on both the atomic coordinates and the charges, which themselves are functions of the atomic coordinates. Here, $\sum_{j=1}^{N_{\text {atoms }}+1} A_{i j}^{\prime} Q_{j}^{\prime}-b_{i}$ represents the differences between the left-hand side and the right-hand side of Eq. (8) that is used to compute the charges $Q_{i}$, ensuring that $L$ is always equal to $E_{\text {total }}$. The multipliers $\lambda$ can be chosen such that the partial derivatives $\frac{\partial L}{\partial Q_{i}}$ are zero,

$$
\frac{\partial L}{\partial Q_{i}^{\prime}}=\frac{\partial E_{\text {total }}}{\partial Q_{i}^{\prime}}+\sum_{j=1}^{N_{\text {atoms }}+1} A_{i j}^{\prime} \lambda_{j}=0
$$

This results in a system of linear equations that can be solved as

$$
\sum_{j=1}^{N_{\text {atoms }}+1} A_{i j}^{\prime} \lambda_{j}=-\frac{\partial E_{\text {total }}}{\partial Q_{i}^{\prime}}
$$

Since $\mathbf{A}^{\prime}$ is a symmetric matrix, the computational complexity is reduced significantly.

The derivative $\frac{d L}{d R_{\alpha}}$ corresponds to $\frac{d E_{\text {total }}}{d R_{\alpha}}$, which is the derivative of the total energy with respect to the atomic coordinates, i.e., an atomic force. This derivative can then be written as

$$
\begin{aligned}
\frac{d E_{\text {total }}}{d R_{\alpha}}= & \frac{\partial E_{\text {total }}}{\partial R_{\alpha}}+\sum_{i=1}^{N_{\text {atoms }}+1} \frac{\partial E_{\text {total }}}{\partial Q_{i}^{\prime}} \frac{\partial Q_{i}^{\prime}}{\partial R_{\alpha}}+\sum_{i=1}^{N_{\text {atoms }}+1} \lambda_{i} \\
& \times\left(\sum_{j=1}^{N_{\text {atoms }}+1} \frac{\partial A_{i j}^{\prime}}{\partial R_{\alpha}} Q_{j}^{\prime}+\sum_{j=1}^{N_{\text {atoms }}+1} A_{i j}^{\prime} \frac{\partial Q_{j}^{\prime}}{\partial R_{\alpha}}-\frac{\partial b_{i}}{\partial R_{\alpha}}\right) .
\end{aligned}
$$

By rearranging this equation and eliminating terms that are zero by definition of $\lambda$, the final expression for the atomic forces is obtained as

$$
\frac{d E_{\text {total }}}{d R_{\alpha}}=\frac{\partial E_{\text {total }}}{\partial R_{\alpha}}+\sum_{i=1}^{N_{\text {atoms }}+1} \lambda_{i}\left(\sum_{j=1}^{N_{\text {atoms }}+1} \frac{\partial A_{i j}^{\prime}}{\partial R_{\alpha}} Q_{j}^{\prime}-\frac{\partial b_{i}}{\partial R_{\alpha}}\right) .
$$

This approach significantly reduces the computational cost, making it an efficient method for calculating atomic forces in large-scale simulations. In the original 4G-HDNNP method, a second matrix solution was necessary to obtain $\lambda_{i}$ and to calculate the electrostatic forces. The matrix solution for $\lambda_{i}$ in Eq. (16) is replaced by an iterative solution using a gradient-based function minimization. Similar to Eq. (9), the fact that Eq. (18) can be reformulated as a multidimensional function of $\lambda_{i}$ can be exploited to yield

$$
\frac{d E_{\text {total }}}{d R_{\alpha}}=\frac{\partial E_{\text {total }}}{\partial R_{\alpha}}+f\left(\lambda_{i}\right)
$$

## C. Implementation

We have implemented the iQEq method in the LAMMPS software, ${ }^{52}$ building upon the n 2 p 2 library, ${ }^{53}$ which provides the HDNNP method in LAMMPS as a pair style. The primary objective of the current implementation was to extend the n 2 p 2 library to include 4G-HDNNPs and to parallelize the global charge equilibration and force calculation steps to enable running large-scale MD simulations. An overview of the workflow of the 4G-HDNNP interface is given in Fig. 2.

In LAMMPS, all computations other than atomic forces are carried out by entities known as fix or compute, executing specific tasks at designated points, i.e., before or after the force calculation, during an MD timestep. The iQEq process is implemented as a pre-force fix style, labeled as FixHDNNP, in order to make atomic charges available in the second-stage, where the short-range forces and energies are predicted using atomic charges as additional input neurons. This fix interfaces with n2p2 like the PairHDNNP pair

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-06_487_820_1692_1070.jpg)
FIG. 2. Schematic workflow of the 4G-HDNNP implementation within the framework of LAMMPS and n 2 p 2 . The global iQEq is used in the calculation of the charges $\left\{Q_{i}\right\}$ and of the electrostatic energy and forces. The arrows illustrate the flow of data and computational steps, where $\mathbf{R}_{i}$ are Cartesian coordinates, $\left\{\mathbf{G}_{i}\right\}$ the atom-centered symmetry function vectors, $\left\{\chi_{i}\right\}$ the atomic electronegativities, $\left\{E_{i}\right\}$ the atomic energies, and $\left\{\mathbf{F}_{i}\right\}$ the atomic force vectors.

style and initiates the execution of the initial set of neural networks to predict the atomic electronegativities. Atomic charges are calculated in parallel in this fix style through the iQEq method as described in Sec. II B. For this calculation, the multidimensional function minimization algorithm in the open-source GNU Scientific Library (GSL) ${ }^{59}$ has been used. Specifically, we found the best performance for the BFGS-2 algorithm. ${ }^{60}$ After calculating the atomic charges iteratively, the next step involves the calculation of the electrostatic contributions to the forces. For this, a new KSpaceHDNNP class was inherited from the native KSpace class in LAMMPS. This class is equipped with the necessary data structures and routines to calculate the electrostatic force contributions, thereby facilitating the incorporation of long-range interactions. The final steps of the 4G-HDNNP method are realized in the PairHDNNP class, which inherits from the Pair class and acts as a pair style. This class interfaces with the n 2 p 2 library and forwards the computed atomic charges to the n 2 p 2 library. Like the first set of atomic NNs, the second set of atomic NNs is evaluated on the n 2 p 2 side and predicts the short-range atomic energies and forces. These are then transferred back to LAMMPS and added to the electrostatic contributions that have already been calculated. Once the complete atomic force vectors have been determined, the equations of motion are integrated, and the next MD time step of the MD simulation is executed.

For an efficient parallelization of the charge equilibration method, the MPI (Message Passing Interface) library ${ }^{61}$ is used to manage communications across processors. The GSL multidimensional function minimization algorithm ${ }^{59}$ is employed to run the optimization process, exploiting the fact that the charge equilibration energy $E_{\mathrm{QEq}}$ in Eq. (9) can be expressed as a multidimensional function of atomic charges $Q_{i}$. For the minimization of $E_{\mathrm{QEq}}$, the gradient vector $\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}$ in Eq. (12) needs to be calculated as well. Since each processor contains only a fraction of the global atom vector in LAMMPS (i.e., "local atoms"), one can distribute the calculation of $E_{\mathrm{QEq}}$ and $\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}$ using only the charges and position vectors of these local atoms. Two key functions are necessary within this framework: one for calculating the charge equilibration energy as a scalar and another for computing the gradient vector of the charge equilibration energy with respect to the charge vector. Both $E_{\mathrm{QEq}}$ and $\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}$ have one real space, one reciprocal space, and one self-correction term as given in Eqs. (5) and (12). No additional communication is necessary for real space contributions and selfcorrection terms, as all local atoms have neighbor lists attached to them. However, an additional communication step is necessary for the calculation of reciprocal space energy and gradient contributions on each processor. This is because of global structure factors in Eq. (13) that can be calculated by looping over all atoms within the system. After defining these functions, local contributions are communicated from each processor. Specifically, the local energy contributions and the local gradient vectors are communicated and aggregated to obtain the global energy and gradient values $E_{\mathrm{QEq}}$ and $\frac{\partial E_{\mathrm{QEq}}}{\partial Q_{i}}$. This communication ensures that each processor has the cumulative global quantities, and then the gradient-based optimization of GSL finds the charge vector $Q_{i}$ with the selected gradient tolerance across all processors. The same parallelization approach is applied for the calculation of the parameters $\lambda_{i}$ necessary for the efficient electrostatic force calculation. Local energies and gradient
vectors are computed and similarly communicated across processors before the gradient-based optimization step.

## III. RESULTS

## A. Performance

In a first step, we investigate the computational efficiency and scaling behavior of the iQEq implementation in LAMMPS with respect to the original dQEq matrix solution for an increasing number of atoms and assess how the method benefits from multiple central processing unit (CPU) cores in parallel runs.

The original 4G-HDNNP approach computes atomic charges by the dQEq method and, therefore, involves building and inverting a $\left(N_{\text {atoms }}+1\right) \times\left(N_{\text {atoms }}+1\right) \mathbf{A}^{\prime}$ matrix that holds information about every atom in the system. As the number of atoms increases, this approach becomes computationally demanding, as the costs of constructing and inverting the matrix scale quadratically and cubically, respectively, with the size of the system.

The modified 4G-HDNNP method uses the iQEq scheme introduced in Sec. II B and is expected to show a higher computational performance. The timings of the dQEq and iQEq methods on a single CPU core are compared in Fig. 3 using six different cubic boxes of water, each of which contains a single formula unit of $\mathrm{FeCl}_{3}$ resulting in overall $103,376,752,1504,3008$, and 4512 atoms, respectively. For small systems up to about 400 atoms, the dQEq method exhibits smaller computation times, but as the number of atoms increases, the iQEq method benefits from a quadratic scaling behavior. The matrix-based dQEq method scales cubically for larger system sizes, resulting in a steep increase in computational cost. These results are consistent with the findings of Gubler et al. ${ }^{51}$

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-07_729_731_1482_1117.jpg)
FIG. 3. Calculation times for the charge determination in the iQEq and dQEq methods as a function of system size on a single CPU core (Intel i7-12700). Six different systems have been used, consisting of 103, 376, 752, 1505, 3008, and 4512 atoms, respectively. Reference lines for $N^{2}$ and $N^{3}$ scaling are included to illustrate the performance of both approaches.

and underline the advantages of using iterative solvers for the charge equilibration step in 4G-HDNNPs.

When measuring the CPU times of the iQEq method, it is important to note that a tolerance value has to be chosen, defining the accuracy of the iterative charge determination. Moreover, a maximum number of iterations for terminating the iterative minimization needs to be specified. These parameters need to be tested for a given system, and depending on the choice of these parameters, the absolute timings of the iQEq algorithm are necessarily different. For our particular analysis, we chose $10^{-5} \mathrm{eV} / \mathrm{e}$ as the gradient tolerance and used up to 15 iterations. As discussed in detail below, the required settings depend on the desired accuracy; here, we achieve a typical convergence up to the fifth decimal for both atomic charges and forces in units of e and eV/Å, respectively.

The parallelization speedup of the iQEq implementation has been tested in the range from 1 to 32 CPU cores for cubic $\mathrm{FeCl}_{3}$-water boxes using four different system sizes. The time required to complete the simulation is measured for each core count, and the speedup factor is then calculated as the ratio of the computation time on a single core to the computation time with a given number of cores. A linear speedup would correspond to a perfect scaling without any notable overhead due to communication between processes, with the computation time being inversely proportional to the number of cores. In real calculations, the speedup curve starts to saturate after a certain number of cores. In LAMMPS, this saturation behavior in general strongly depends on the number of atoms per core. There is an optimal number of atoms per core when running MD simulations, and this optimal number depends on several factors like hardware and employed potential. Therefore, it is usually required to test different numbers of cores to determine the optimal setup for a specific case.

Figure 4 shows the speedup of the 4G-HDNNP iQEq step for various system sizes with respect to the ideal speedup line. For a given number of cores, the parallelization efficiency improves significantly with an increasing number of atoms in the system. For the smallest system, the speedup curve deviates most rapidly from the ideal line as a consequence of the small number of atoms per core and the resulting relatively high impact of communication between processes. Therefore, it is essential to balance the number of cores with the size of the system to achieve the best parallel performance for a given setup. The fact that the speedup curve gradually saturates for all system sizes is attributed to the underlying QEq approach, which requires inter-core communications during the iterative charge optimization.

## B. Accuracy

In this section, the accuracy of the iQEq 4G-HDNNP method is assessed by comparing the calculated atomic charges and forces to those obtained from the original dQEq matrix-based solution. Both the charges and forces are derived iteratively in the new method, where the charges are computed through a multidimensional function minimization scheme, and the forces require a second iteration cycle in which the parameter $\lambda$ is calculated as described in Sec. II B. It is important to make sure that both quantities converge to the desired accuracy for the predefined number of iterations $N_{i}$, which is a parameter that needs to be specified by the user.

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-08_762_772_285_1095.jpg)
FIG. 4. Speedup curves for three different system sizes with $N_{\text {atoms }}=1504,3008$, and 4512. The iQEq execution times are measured on $1,2,4,8,16$, and 32 CPU cores (Intel Xeon 4514Y CPU, dual-CPU system). The speedup is calculated by averaging the iQEq execution times of multiple runs for each core count needed to determine the charges, relative to the baseline performance with a single core. The ideal speedup line is included for reference, representing a linear increase in performance as the number of cores increases.

The effect of the number of iterations $N_{i}$ on the convergence of the atomic charges is illustrated in Fig. 5, where charge predictions made by the iterative iQEq method are compared to those from the original direct dQEq method for a cubic $\mathrm{FeCl}_{3}$-water box containing 376 atoms. To assess the convergence behavior, a series of correlation plots is provided, showing results for $1,3,5$, and 10 iterations. As observed, the predicted charges increasingly align with the dQEq values as the number of iterations increases. Our findings indicate that within ten iterations, the iterative solution provides atomic charges that match the matrix solution with a root mean squared error (RMSE) of 0.0132 me for the $\mathrm{FeCl}_{3}$-water system.

A second parameter that needs to be defined is the gradient tolerance as described in Sec. II B. The effect of this parameter on the convergence of the atomic charges is shown in Fig. 6, where again charge predictions made by the iQEq method are compared to the dQEq values for the same system. Four different tolerances have been tested, which are $0.5,0.2,0.1$, and $0.001 \mathrm{eV} / \mathrm{e}$. We find that the iQEq predictions already converge to the dQEq results for tol $=0.1 \mathrm{eV} / \mathrm{e}$. Moreover, we observed that a tighter convergence threshold (such as tol $=10^{-5} \mathrm{eV} / \mathrm{e}$ ) might be required for achieving an RMSE of 0.01 me . Therefore, we recommend using a gradient tolerance of $10^{-5} \mathrm{eV} / \mathrm{e}$ to avoid the accumulation of errors that can lead to extrapolations and unstable trajectories.

Similarly, the convergence of the total atomic forces, i.e., the sum of the short-range and electrostatic parts, with respect to $N_{i}$ is shown in Fig. 7, where force predictions from the 4G-HDNNP method that utilizes the iterative iQEq approach are compared to the original method that utilizes the direct dQEq approach for the

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-09_2130_1114_279_137.jpg)
FIG. 5. Comparison of the charges $Q_{\text {iQEq }}$ predicted by the iterative iQEq method after $N_{i}=1,3,5$, and 10 iterations [panels (a), (b), (c), and (d), respectively] with the charges $Q_{\text {dQEq }}$ predicted by the direct dQEq method for a system of $\mathrm{FeCl}_{3}$ in water containing a total of 376 atoms.

FIG. 6. Comparison of the charges $Q_{\text {QEq }}$ predicted by the iterative iQEq method with gradient tolerance being equal to $0.5,0.2,0.1$, and $0.001 \mathrm{eV} / \mathrm{e}$ [panels (a), (b), (c), and (d), respectively] with the charges $Q_{\mathrm{dQEq}}$ predicted by the direct dQEq method for a system of $\mathrm{FeCl}_{3}$ in water containing a total of 376 atoms. The root mean squared errors of the $Q_{\text {iQEq }}$ with respect to the $Q_{\text {dQEq }}$ are shown in the inset.

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-10_1107_1123_277_139.jpg)
FIG. 7. Comparison of total atomic force components $F_{\text {iQEq }}$ predicted by the iterative iQEq method after $N_{i}=1,3,5$, and 10 iterations [panels (a), (b), (c), and (d), respectively] with the atomic force components $F_{\text {dQEq }}$ predicted by the direct dQEq method for a system of $\mathrm{FeCl}_{3}$ in water containing a total of 376 atoms.

same $\mathrm{FeCl}_{3}$-water system. A series of correlation plots is presented for one, three, five, and ten iterations, illustrating the convergence behavior of the forces. The predicted forces converge to the reference values as the number of iterations increases. Already after five iterations, the forces predicted by the iterative approach match within $0.001 \mathrm{eV} / \AA$ those from the direct solution, confirming the accuracy of the iterative solution. The RMSE of forces after ten iterations is $0.059 \mathrm{meV} / \mathrm{A}$.

## C. Molecular dynamics simulations

To further validate the iQEq 4G-HDNNP method, a 500 ps long MD simulation has been performed in the NVE ensemble with a $\mathrm{FeCl}_{3}$-water system containing 376 atoms using the LAMMPS 4G-HDNNP interface. The gradient tolerance parameter of the iterative solver has been selected as $10^{-5} \mathrm{eV} / \mathrm{e}$, whereas the maximum number of iterations has been set to 30 ; however, we find that the method usually converges much earlier. One goal of this simulation has been to test the long-term stability of the implemented algorithm. Moreover, the $\mathrm{FeCl}_{3}$ system has been selected to assess the ability of the method to accurately predict atomic charges given that the 4G-HDNNP has been trained on a dataset containing iron atoms in the $\mathrm{Fe}^{2+}$ as well as $\mathrm{Fe}^{3+}$ oxidation states. ${ }^{38}$ The aim of including structures of both oxidation states during training has
been to challenge the 4G-HDNNP method with information that cannot be captured by the short-range part of the method alone, since the iron oxidation state is defined by the number of chloride counter ions, which might be located outside the local environments of the Fe atoms. Instead, a global QEq approach is needed for this purpose. ${ }^{38}$

The time evolution of the atomic charges for the Fe and Cl ions along the trajectory is presented in Fig. 8(a). The predicted charges remain consistent with the expected values for all ions throughout the simulation. We note that the numerical values of these charges correspond to the values of DFT Hirshfeld charges, ${ }^{57}$ which have been used in constructing the 4G-HDNNP. To further assess the stability of the simulation, the time evolution of the potential energy and of the total, i.e., kinetic and potential, energy is examined. As shown in Fig. 8(b), both the total and potential energies fluctuate slightly around stable mean values, indicating that the system has reached an equilibrium and remains stable throughout the simulation. This demonstrates that the iQEq method not only accurately predicts charges but also conserves energy over time, which is crucial for long-term stability in MD simulations. The ability of the iQEq method to model complex ionic systems over long MD trajectories, even when trained on a mixed dataset containing multiple oxidation states, demonstrates the robustness of the 4G-HDNNP method for use within LAMMPS.

![](./images/2b6fe545-3cf0-40ff-bb2a-bb2b87346d82-11_1046_787_277_180.jpg)
FIG. 8. Time evolution of (a) atomic charges for the Fe and Cl ions and (b) the total and potential energy for a 500 ps long $\mathrm{FeCl}_{3}$-water system trajectory containing 376 atoms. The simulation has been performed in the NVE ensemble using the iQEq 4G-HDNNP method after a 5 ps long NVT equilibration at 300 K . The 4 G HDNNP has been trained on a mixed dataset containing both $\mathrm{Fe}^{2+}$ and $\mathrm{Fe}^{3+}$ oxidation states. ${ }^{38}$

## IV. CONCLUSION

In this paper, a modified version of the fourth-generation high-dimensional neural network potential ( 4 G -HDNNP) has been presented that incorporates an iterative charge equilibration (iQEq) method representing an efficient alternative to the direct matrixbased solution (dQEq). The modified charge equilibration algorithm has been implemented in the open source molecular dynamics software LAMMPS as a new pair style using the n 2 p 2 library as an interface.

We showed that the iQEq method provides atomic charges and forces converging to the respective values of the dQEq method. While conserving the accuracy of the original method, the iQEq approach offers significant computational benefits, particularly for large-scale systems, by avoiding the need to solve a global matrix with cubic scaling at every step. This improvement in computational efficiency is crucial for enabling the use of the 4G-HDNNP in large-scale molecular dynamics simulations while maintaining the accuracy necessary for complex chemical environments and might also be of benefit for other similar fourth-generation machine learning potentials. ${ }^{49}$ The implementation of the iQEq method into

LAMMPS is a significant step forward in the application of the 4 G HDNNP method for large-scale, long-range interaction modeling in molecular dynamics simulations. In future work, further performance gains could be expected by replacing the Ewald sum with a particle mesh solver. ${ }^{51}$

## ACKNOWLEDGMENTS

We are grateful for support by the Deutsche Forschungsgemeinschaft (DFG) (BE3264/16-1, Project No. 495842446 in priority program SPP 2363 "Utilization and Development of Machine Learning for Molecular Applications-Molecular Machine Learning") and under Germany's Excellence Strategy-EXC 2033 RESOLV (Project-ID 390677874). This research was funded in part by the Austrian Science Fund (FWF) Grant No. 10.55776/F81. Discussions with Gunnar Schmitz are gratefully acknowledged.

## AUTHOR DECLARATIONS

## Conflict of Interest

The authors have no conflicts to disclose.

## Author Contributions

Emir Kocer: Data curation (lead); Formal analysis (lead); Methodology (lead); Software (lead); Visualization (lead); Writing - original draft (lead); Writing - review \& editing (equal). Andreas Singraber: Formal analysis (supporting); Methodology (supporting); Software (supporting); Writing - review \& editing (equal). Jonas A. Finkler: Formal analysis (supporting); Methodology (supporting); Software (supporting); Writing - review \& editing (equal). Philipp Misof: Formal analysis (supporting); Methodology (supporting); Writing - review \& editing (equal). Tsz Wai Ko: Formal analysis (supporting); Methodology (supporting); Writing - review \& editing (equal). Christoph Dellago: Conceptualization (equal); Funding acquisition (equal); Project administration (equal); Supervision (equal); Writing - review \& editing (equal). Jörg Behler: Conceptualization (equal); Funding acquisition (equal); Project administration (equal); Supervision (equal); Writing - review \& editing (equal).

## DATA AVAILABILITY

The data that support the findings of this study are available from the corresponding author upon reasonable request. The implementation of the iQEq method is available as open-source software at https://compphysvienna.github.io/n2p2.

## REFERENCES

${ }^{1}$ K. Burke, "Perspective on density functional theory," J. Chem. Phys. 136, 150901 (2012).
${ }^{2}$ J. Behler, "Perspective: Machine learning potentials for atomistic simulations," J. Chem. Phys. 145, 170901 (2016).
${ }^{3}$ J. Behler and G. Csányi, "Machine learning potentials for extended systems - A perspective," Eur. Phys. J. B 94, 142 (2021).
${ }^{4}$ V. L. Deringer, M. A. Caro, and G. Csányi, "Machine learning interatomic potentials as emerging tools for materials science," Adv. Mater. 31, 1902765 (2019).
${ }^{5}$ F. Noé, A. Tkatchenko, K.-R. Müller, and C. Clementi, "Machine learning for molecular simulation," Annu. Rev. Phys. Chem. 71, 361-390 (2020).
${ }^{6}$ O. T. Unke, S. Chmiela, H. E. Sauceda, M. Gastegger, I. Poltavsky, K. T. Schütt, A. Tkatchenko, and K.-R. Müller, "Machine learning force fields," Chem. Rev. 121, 10142-10186 (2021).
${ }^{7}$ P. Friederich, F. Häse, J. Proppe, and A. Aspuru-Guzik, "Machine-learned potentials for next-generation matter simulations," Nat. Mater. 20, 750-761 (2021).
${ }^{8}$ E. Kocer, T. W. Ko, and J. Behler, "Neural network potentials: A concise overview of methods," Annu. Rev. Phys. Chem. 73, 163-186 (2022).
${ }^{9}$ T. B. Blank, S. D. Brown, A. W. Calhoun, and D. J. Doren, "Neural network models of potential energy surfaces," J. Chem. Phys. 103, 4129-4137 (1995).
${ }^{10}$ T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, "General-purpose machine learning potentials capturing nonlocal charge transfer," Acc. Chem. Res. 54, 808-817 (2021).
${ }^{11}$ S. Lorenz, A. Groß, and M. Scheffler, "Representing high-dimensional potentialenergy surfaces for reactions at surfaces by neural networks," Chem. Phys. Lett. 395, 210-215 (2004).
${ }^{12}$ J. Behler, S. Lorenz, and K. Reuter, "Representing molecule-surface interactions with symmetry-adapted neural networks," J. Chem. Phys. 127, 014705 (2007).
${ }^{13}$ H. Gassner, M. Probst, A. Lauenstein, and K. Hermansson, "Representation of intermolecular potential functions by neural networks," J. Phys. Chem. A 102, 4596-4605 (1998).
${ }^{14}$ J. Behler and M. Parrinello, "Generalized neural-network representation of high-dimensional potential-energy surfaces," Phys. Rev. Lett. 98, 146401 (2007).
${ }^{15}$ A. P. Bartók, M. C. Payne, R. Kondor, and G. Csányi, "Gaussian approximation potentials: The accuracy of quantum mechanics, without the electrons," Phys. Rev. Lett. 104, 136403 (2010).
${ }^{16}$ A. P. Thompson, L. P. Swiler, C. R. Trott, S. M. Foiles, and G. J. Tucker, "Spectral neighbor analysis method for automated generation of quantum-accurate interatomic potentials," J. Comput. Phys. 285, 316-330 (2015).
${ }^{17}$ A. V. Shapeev, "Moment tensor potentials: A class of systematically improvable interatomic potentials," Multiscale Model. Simul. 14, 1153-1173 (2016).
${ }^{18}$ R. Drautz, "Atomic cluster expansion for accurate and transferable interatomic potentials," Phys. Rev. B 99, 014104 (2019).
${ }^{19}$ J. S. Smith, O. Isayev, and A. E. Roitberg, "ANI-1: An extensible neural network potential with DFT accuracy at force field computational cost," Chem. Sci. 8, 3192-3203 (2017).
${ }^{\mathbf{2 0}}$ M. Liu and J. R. Kitchin, "SingleNN: Modified Behler-Parrinello neural network with shared weights for atomistic simulations with transferability," J. Phys. Chem. C 124, 17811-17818 (2020).
${ }^{21}$ J. Gilmer, S. S. Schoenholz, P. F. Riley, O. Vinyals, and G. E. Dahl, "Neural message passing for quantum chemistry," in Proceedings of the 34th International Conference on Machine Learning, Proceedings of Machine Learning Research, edited by D. Precup and Y. W. Teh (PMLR, 2017), Vol. 70, pp. 1263-1272.
${ }^{22}$ K. T. Schütt, H. E. Sauceda, P.-J. Kindermans, A. Tkatchenko, and K.-R. Müller, "SchNet - A deep learning architecture for molecules and materials," J. Chem. Phys. 148, 241722 (2018).
${ }^{23}$ R. Zubatyuk, J. S. Smith, J. Leszczynski, and O. Isayev, "Accurate and transferable multitask prediction of chemical properties with an atoms-in-molecules neural network," Sci. Adv. 5, eaav6490 (2019).
${ }^{24}$ S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt, and B. Kozinsky, "E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials," Nat. Commun. 13, 2453 (2022).
${ }^{\mathbf{2 5}}$ I. Batatia, D. P. Kovacs, G. Simm, C. Ortner, and G. Csanyi, "MACE: Higher order equivariant message passing neural networks for fast and accurate force fields," in Advances in Neural Information Processing Systems, edited by S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho and A. Oh (Curran Associates, Inc., 2022), Vol. 35, pp. 11423-11436.
${ }^{26}$ S. Houlding, S. Y. Liem, and P. L. A. Popelier, "A polarizable high-rank quantum topological electrostatic potential developed using neural networks: Molecular dynamics simulations on the hydrogen fluoride dimer," Int. J. Quantum Chem. 107, 2817-2827 (2007).
${ }^{27}$ N. Artrith, T. Morawietz, and J. Behler, "High-dimensional neural-network potentials for multicomponent systems: Applications to zinc oxide," Phys. Rev. B 83, 153101 (2011).
${ }^{28}$ T. Morawietz, V. Sharma, and J. Behler, "A neural network potential-energy surface for the water dimer based on environment-dependent atomic energies and charges," J. Chem. Phys. 136, 064103 (2012).
${ }^{29}$ O. T. Unke and M. Meuwly, "PhysNet: A neural network for predicting energies, forces, dipole moments, and partial charges," J. Chem. Theory Comput. 15, 3678-3693 (2019).
${ }^{30}$ K. Yao, J. E. Herr, D. W. Toth, R. Mckintyre, and J. Parkhill, "The TensorMol0.1 model chemistry: A neural network augmented with long-range physics," Chem. Sci. 9, 2261-2269 (2018).
${ }^{31}$ A. Grisafi and M. Ceriotti, "Incorporating long-range physics in atomic-scale machine learning," J. Chem. Phys. 151, 204105 (2019).
${ }^{32}$ A. Gao and R. C. Remsing, "Self-consistent determination of long-range electrostatics in neural network potentials," Nat. Commun. 13, 1572 (2022).
${ }^{33}$ L. Zhang, H. Wang, M. C. Muniz, A. Z. Panagiotopoulos, R. Car, and W. E, "A deep potential model with long-range electrostatic interactions," J. Chem. Phys. 156, 124107 (2022).
${ }^{34}$ S. Yue, M. C. Muniz, M. F. Calegari Andrade, L. Zhang, R. Car, and A. Z. Panagiotopoulos, "When do short-range atomistic machine-learning models fall short?," J. Chem. Phys. 154, 034111 (2021).
${ }^{35}$ P. P. Ewald, "Die Berechnung optischer und elektrostatischer Gitterpotentiale," Ann. Phys. 369, 253-287 (1921).
${ }^{36}$ A. Y. Toukmaji and J. A. Board, Jr., "Ewald summation techniques in perspective: A survey," Comput. Phys. Commun. 95, 73-92 (1996).
${ }^{37}$ T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, "A fourth-generation highdimensional neural network potential with accurate electrostatics including nonlocal charge transfer," Nat. Commun. 12, 398 (2021).
${ }^{38}$ E. Kocer, R. El Haouari, C. Dellago, and J. Behler, "Machine learning potentials for redox chemistry in solution," arXiv:2410.03299 (2024).
${ }^{39}$ S. A. Ghasemi, A. Hofstetter, S. Saha, and S. Goedecker, "Interatomic potentials for ionic systems with density functional accuracy based on charge densities obtained by a neural network," Phys. Rev. B 92, 045131 (2015).
${ }^{40}$ A. K. Rappe and W. A. Goddard III, "Charge equilibration for molecular dynamics simulations," J. Phys. Chem. 95, 3358-3363 (1991).
${ }^{41}$ S. Faraji, S. A. Ghasemi, S. Rostami, R. Rasoulkhani, B. Schaefer, S. Goedecker, and M. Amsler, "High accuracy and transferability of a neural network potential through charge equilibration for calcium fluoride," Phys. Rev. B 95, 104105 (2017).
${ }^{42}$ S. Faraji, S. A. Ghasemi, B. Parsaeifard, and S. Goedecker, "Surface reconstructions and premelting of the (100)CaF ${ }_{2}$ surface," Phys. Chem. Chem. Phys. 21, 16270-16281 (2019).
${ }^{43}$ H. A. Eivari, S. A. Ghasemi, H. Tahmasbi, S. Rostami, S. Faraji, R. Rasoulkhani, S. Goedecker, and M. Amsler, "Two-dimensional hexagonal sheet of $\mathrm{TiO}_{2}$," Chem. Mater. 29, 8594-8603 (2017).
${ }^{44}$ C. G. Staacke, S. Wengert, C. Kunkel, G. Csányi, K. Reuter, and J. T. Margraf, "Kernel charge equilibration: Efficient and accurate prediction of molecular dipole moments with a machine-learning enhanced electron density model," Mach. Learn.: Sci. Technol. 3, 015032 (2022).
${ }^{45}$ L. D. Jacobson, J. M. Stevenson, F. Ramezanghorbani, D. Ghoreishi, K. Leswing, E. D. Harder, and R. Abel, "Transferable neural network potential energy surfaces for closed-shell organic molecules: Extension to ions," J. Chem. Theory Comput. 18, 2354-2366 (2022).
${ }^{46}$ E. R. Khajehpasha, J. A. Finkler, T. D. Kühne, and S. A. Ghasemi, "CENT2: Improved charge equilibration via neural network technique," Phys. Rev. B 105, 144106 (2022).
${ }^{47}$ T. W. Ko, J. A. Finkler, S. Goedecker, and J. Behler, "Accurate fourthgeneration machine learning potentials by electrostatic embedding," J. Chem. Theory Comput. 19, 3567-3579 (2023).
${ }^{48}$ X. Xie, K. A. Persson, and D. W. Small, "Incorporating electronic information into machine learning potential energy surfaces via approaching the ground-state electronic energy as a function of atom-based electronic populations," J. Chem. Theory Comput. 16, 4256-4270 (2020).
${ }^{49}$ Y. Shaidu, F. Pellegrini, E. Küçükbenli, R. Lot, and S. de Gironcoli, "Incorporating long-range electrostatics in neural network potentials via variational charge equilibration from shortsighted ingredients," npj Comput. Mater. 10, 47 (2024).
${ }^{50} \mathrm{~J}$. Behler, "Atom-centered symmetry functions for constructing highdimensional neural network potentials," J. Chem. Phys. 134, 074106 (2011).
${ }^{51}$ M. Gubler, J. A. Finkler, M. R. Schäfer, J. Behler, and S. Goedecker, "Accelerating fourth-generation machine learning potentials using quasi-linear scaling particle mesh charge equilibration," J. Chem. Theory Comput. 20, 7264-7271 (2024).
${ }^{52}$ S. Plimpton, "Fast parallel algorithms for short-range molecular dynamics," J. Comput. Phys. 117, 1 (1995).
${ }^{53}$ A. Singraber, J. Behler, and C. Dellago, "Library-based LAMMPS implementation of high-dimensional neural network potentials," J. Chem. Theory Comput. 15, 1827-1840 (2019).
${ }^{54}$ J. Behler, "Four generations of high-dimensional neural network potentials," Chem. Rev. 121, 10037-10072 (2021).
${ }^{55}$ T. Verstraelen, V. Van Speybroeck, and M. Waroquier, "The electronegativity equalization method and the split charge equilibration applied to organic systems: Parametrization, validation, and comparison," J. Chem. Phys. 131, 044127 (2009).
${ }^{56}$ C. E. Wilmer, K. C. Kim, and R. Q. Snurr, "An extended charge equilibration method," J. Phys. Chem. Lett. 3, 2506-2511 (2012).
${ }^{57}$ F. L. Hirshfeld, "Bonded-atom fragments for describing molecular charge densities," Theor. Chim. Acta 44, 129-138 (1977).
${ }^{58}$ A. Nakano, "Parallel multilevel preconditioned conjugate-gradient approach to variable-charge molecular dynamics," Comput. Phys. Commun. 104, 59-69 (1997).
${ }^{59}$ M. Galassi, J. Davies, J. Theiler, B. Gough, G. Jungman, P. Alken, M. Booth, F. Rossi, and R. Ulerich, GNU Scientific Library (Network Theory Limited Godalming, 2002).
${ }^{60}$ R. Fletcher, Practical Methods of Optimization (John Wiley \& Sons, 2000).
${ }^{61}$ Message Passing Interface Forum, MPI: A Message-Passing Interface Standard Version 4.0 (2021).

