# Accelerating Fourth-Generation Machine Learning Potentials Using Quasi-Linear Scaling Particle Mesh Charge Equilibration 

Moritz Gubler,* Jonas A. Finkler, Moritz R. Schäfer, Jörg Behler, and Stefan Goedecker

Cite This: J. Chem. Theory Comput. 2024, 20, 7264-7271
Read Online
Downloaded via UNIV ILLINOIS URBANA-CHAMPAIGN on February 18, 2026 at 13:30:46 (UTC). See https://pubs.acs.org/sharingguidelines for options on how to legitimately share published articles.


#### Abstract

Machine learning potentials (MLPs) have revolutionized the field of atomistic simulations by describing atomic interactions with the accuracy of electronic structure methods at a small fraction of the cost. Most current MLPs construct the energy of a system as a sum of atomic energies, which depend on information about the atomic environments provided in the form of predefined or learnable feature vectors. If, in addition, nonlocal phenomena like long-range charge transfer are important, fourthgeneration MLPs need to be used, which include a charge equilibration (Qeq) step to take the global structure of the system into account. This Qeq can significantly increase the computational cost and thus can become a computational bottleneck for large ![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-1_453_824_821_1108.jpg) systems. In this Article, we present a highly efficient formulation of Qeq that does not require the explicit computation of the Coulomb matrix elements, resulting in a quasi-linear scaling method. Moreover, our approach also allows for the efficient calculation of energy derivatives, which explicitly consider the global structuredependence of the atomic charges as obtained from Qeq. Due to its generality, the method is not restricted to MLPs and can also be applied within a variety of other force fields.


## 1. INTRODUCTION

Obtaining accurate potential energy surfaces (PESs) at a reasonable computational expense is one of the greatest challenges in computational chemistry, physics, and materials science. Since even the most efficient electronic structure methods like density functional theory (DFT) are usually too demanding for large-scale simulations, the conventional approach taken in computer simulations of complex systems involves the use of heuristically derived force fields and empirical potentials. These are often able to capture the main features of the atomic interactions but are quantitatively less accurate than first-principles methods based on the direct solution of the quantum mechanical equations.

In recent years, the rapid development of data-driven machine learning potentials (MLPs), which offer accurate PESs with only a fraction of the computational costs of the underlying electronic structure calculations used in the training process, has paved the way to solve this dilemma. ${ }^{1-8}$ A key step in the development of MLPs for large condensed systems has been the construction of the total energy as a sum of atomic energies, which only depend on the atomic environments up to a cutoff radius. ${ }^{9}$ Many flavors of such local, second-generation MLPs ${ }^{10}$ have been proposed and successfully applied to a variety of systems to date. ${ }^{9,11-16}$ By construction, they show a favorable, essentially linear scaling with system size. In addition, third-generation MLPs include long-range electrostatic interactions based on environment-
dependent charges represented by machine learning. ${ }^{17-21}$ In spite of including these long-range electrostatic interactions without truncation, such third-generation MLPs are still "local" in the sense that they are unable to take nonlocal phenomena like long-range charge transfer beyond the local atomic environments into account. ${ }^{22}$

The need to consider long-range charge transfer, which is present in a variety of systems, in atomistic potentials has attracted a lot of attention for several years. For instance, charge equilibration (Qeq), which was initially developed by Rappe and Goddard III ${ }^{23}$ and later refined by Nakano, ${ }^{24}$ is a well-established method to approximate complicated electrostatics and charge transfer effects. As shown by Grimme et al., ${ }^{25}$ charge equilibration techniques can also be used in the context of dispersion corrections. Warren et al. ${ }^{26}$ demonstrated that the polarizability of long molecules is severely overestimated in the original Qeq approach ${ }^{23}$ and proposed the addition of charge constraints for subsystems to overcome this problem. An overview and comparison of popular charge

[^0]![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-1_220_155_2342_1777.jpg)
equilibration methods has been provided by Ongari et al., ${ }^{27}$ and nowadays modern variants of Qeq are routinely used in advanced force fields such as $\mathrm{ReaxFF}^{28}$ or $\mathrm{COMB}^{29}$ and are available in widely distributed simulation software packages like LAMMPS. ${ }^{30}$

The first use of charge equilibration in the framework of MLPs was the charge equilibration neural network technique (CENT) introduced in 2015 by Ghasemi et al., ${ }^{31}$ and this first fourth-generation MLP has been further improved in the following years. ${ }^{32,33}$ In CENT, the atomic electronegativities of the charge-equilibration approach are expressed as environ-ment-dependent atomic properties learned by atomic neural networks, with the goal of reproducing the correct total energy of the system. Due to the underlying total energy expression, the CENT approach is best suited for a description of systems with primarily ionic bonding. A fourth-generation highdimensional neural network potential ( $4 \mathrm{G}-\mathrm{HDNNP}$ ) that is more generally applicable to all types of systems has been proposed by Ko et al. ${ }^{34}$ by combining the advantages of CENT and second-generation HDNNPs. Here, the neural networks providing the atomic electronegativities are trained to reproduce reference atomic partial charges, and the resulting electrostatic energy is combined with modified atomic neural networks contributing atomic energies representing local bonding that explicitly takes charge transfer into account.

Incorporating long-range charge transfer and the resulting electrostatics into machine learning models has become increasingly popular over the last years, and many other approaches have been proposed. ${ }^{35-41}$ Still, so far, the application of fourth-generation MLPs has been restricted to small- and medium-sized systems, primarily due to the high computational cost of solving a set of linear equations, which is needed in the original charge equilibration method. In order to improve the scaling of charge equilibration, Nakano ${ }^{24}$ proposed a multilevel conjugate gradient approach that solves the set of equations iteratively. Because this approach requires the calculation of the Coulomb matrix, which is dense, the scaling is at least quadratic with respect to the number of atoms. The performance of iterative charge equilibration schemes can be enhanced by algorithms that do not require explicit knowledge of the matrix elements, as shown by Rostami et al. ${ }^{42}$ The efficiency of such an iterative scheme can be further improved if it is combined with the conjugate gradient method that allows a reduction of the number of iterations compared to a steepest descent approach.

Apart from the determination of the atomic charges, another important aspect that has to be considered in the development of more efficient methods is that fourth-generation MLPs often make use of the charges obtained from the charge equilibration step as input for calculating energy terms beyond simple electrostatics, which consequently also need to be taken into account in the determination of atomic forces and the stress tensor. ${ }^{34}$ This requires additional steps that also need to be implemented in a computationally efficient way.

In this work, we propose a formulation of the charge equilibration method, which combines a rapidly converging conjugate gradient with matrix times vector multiplications that do not require explicit knowledge of the Coulomb matrix elements. This results in quasi-linear scaling with respect to the number of atoms in the system. Moreover, with our ansatz, it is possible to calculate derivatives of energy terms that use charges obtained from charge equilibration as input in the quasi-linear time. Our method is therefore ideally suited for a
combination with 4G-HDNNPs ${ }^{34}$ and numerous other types of MLPs that depend on the atomic charges.

After a concise summary of the theoretical background in section 2 , we derive the equations for the efficient calculation of the electrostatic energy, forces, and stress for periodic systems using our particle mesh charge equilibration method in section 3. This approach is also expected to be very useful in other contexts requiring the solution of Poisson's equation in case the charge density has the same form of a smooth superposition of generic atom-centered spherically symmetric charge densities. After a discussion of our results for a reference implementation in section 4, we conclude our main findings in section 5.

## 2. THEORETICAL BACKGROUND

2.1. Charge Equilibration. In the charge equilibration formalism, the energy of the system $E_{\mathrm{Qeq}}$ is defined as the sum of the electrostatic energy $E_{\text {elec }}$ and a Taylor expansion of atomic energies that depend on atomic charges $\mathbf{Q}=\left\{q_{i}\right\}$

$$
E_{\mathrm{Qeq}}(\mathbf{R}, \mathbf{Q})=E_{\mathrm{elec}}(\mathbf{R}, \mathbf{Q})+\sum_{i=1}^{N_{\mathrm{at}}}\left(E_{i}+\chi_{i} q_{i}+\frac{1}{2} J_{i} q_{i}^{2}\right)
$$

with $\mathbf{R}=\left\{\mathbf{r}_{i}\right\}$ being the atomic coordinates and $\left\{E_{i}\right\}$ being the element-dependent atomic reference energy offsets. These energy offsets $E_{i}$ cause a shift in $E_{\text {Qeq }}$ but do not change the charges that are obtained by using the charge equilibration method. In eq 1 the Taylor expansion is truncated after the second-order terms, and the expansion coefficients $\left\{\chi_{i}\right\}$ and $\left\{J_{i}\right\}$ are called electronegativity and hardness, respectively. Moreover, the electrostatic energy is computed as $E_{\text {elec }}=1 / 2 \int \rho(\mathbf{r}) V(\mathbf{r}) \mathrm{d} \mathbf{r}$ and the charge density

$$
\rho(\mathbf{r})=\sum_{i=1}^{N_{\mathrm{at}}} q_{i} \rho_{i}\left(\left\|\mathbf{r}-\mathbf{r}_{i}\right\|\right)
$$

is a superposition of atomic charge densities $q_{i} \rho_{i}$ that are spherically symmetric around the position of atom $i$. The charge distributions $\rho_{i}$ are normalized to 1 , i.e., $\int \rho_{i} \mathrm{~d} \mathbf{r}=1$, and scaled by the respective atomic charge $q_{i} \cdot V(\mathbf{r})$ is the electrostatic potential of charge density $\rho$. The atomic charge densities are usually chosen to be either point charges or Gaussian charge distributions with an element-specific width $\sigma_{i}$.

Charge equilibration is defined as the minimization of $E_{\mathrm{Qeq}}$ with respect to atomic charges $\mathbf{Q}$ under the constraint of keeping the total charge $Q_{\text {tot }}$ of the system constant. Using the method of Lagrange multipliers, the function

$$
L=E_{\mathrm{elec}}+\sum_{i=1}^{N_{\mathrm{at}}}\left(E_{i}+\chi_{i} q_{i}+\frac{1}{2} J_{i} q_{i}^{2}\right)+\lambda\left(\sum_{i=1}^{N_{\mathrm{at}}} q_{i}-Q_{\mathrm{tot}}\right)
$$

has to be stationary. Differentiating eq 3 with respect to $q_{i}$ and $\lambda$ yields the set of equations

$$
\begin{aligned}
& \frac{\partial L}{\partial q_{i}}=\frac{\partial E_{\mathrm{elec}}}{\partial q_{i}}+\chi_{i}+J_{i} q_{i}+\lambda=0 \\
& \frac{\partial E_{\mathrm{Qeq}}}{\partial \lambda}=\sum_{i=1}^{N_{\mathrm{at}}} q_{i}-Q_{\mathrm{tot}}=0
\end{aligned}
$$

Inserting the definition of the charge density into the electrostatic energy yields

$$
E_{\mathrm{elec}}=\frac{1}{2} \sum_{i, j=1}^{N_{\mathrm{at}}} q_{i} q_{j} \underbrace{\iint \frac{\rho_{i}\left(\left\|\mathbf{r}-\mathbf{r}_{i}\right\|\right) \rho_{j}\left(\left\|\mathbf{r}^{\prime}-\mathbf{r}_{j}\right\|\right)}{\left\|\mathbf{r}-\mathbf{r}^{\prime}\right\|} \mathrm{d} \mathbf{r} \mathrm{~d} \mathbf{r}^{\prime}}_{=A_{i j}}
$$

The matrix $\mathbf{A}$ is symmetric and positive definite because $E_{\text {elec }}= 1 / 2 \mathbf{Q}^{T} \mathbf{A Q} \geq 0$ and $E_{\text {elec }}=0 \Leftrightarrow \mathbf{Q}=0$. The first inequality holds because the electrostatic interaction energy of a smooth charge density is always positive. Because of the spherical symmetry of the Gaussian density $\rho_{i}$ around atom $i, A_{i j}$ is a function of the distance between $\mathbf{r}_{i}$ and $\mathbf{r}_{j}$. Using the definitions from eqs 4 and 6 and $\frac{\partial E_{\text {elec }}}{\partial q_{i}}=\sum_{j=1}^{N_{\text {at }}} A_{\mathrm{ij}} q_{j}$, the derivative of the energy with respect to the atomic charges can be simplified to

$$
\frac{\partial E_{\mathrm{Qeq}}}{\partial q_{i}}=\sum_{j=1}^{N_{\mathrm{at}}} A_{i j} q_{j}+\chi_{i}+J_{i} q_{i}+\lambda=0
$$

Equations 4 and 5 can be written in matrix notation as follows:

$$
\left(\begin{array}{ccc|c} 
& & 1 \\
& \mathbf{M} & \vdots \\
& & 1 \\
\hline 1 & \ldots & 1 & 0
\end{array}\right) \cdot\left(\begin{array}{c}
q_{1} \\
\vdots \\
q_{N_{\mathrm{at}}} \\
\hline \lambda
\end{array}\right)=\left(\begin{array}{c}
-\chi_{1} \\
\vdots \\
-\chi_{N_{\mathrm{at}}} \\
\hline Q_{\mathrm{tot}}
\end{array}\right)
$$

where

$$
M_{i j}= \begin{cases}A_{i j} & \text { if } i \neq j \\ A_{i i}+J_{i} & \text { if } i=j\end{cases}
$$

This set of linear equations can be solved either directly with cubic scaling or using the iterative multilevel conjugate gradient approach. ${ }^{24,42}$ Since matrix $\mathbf{A}$ has to be calculated, the best scaling using the latter approach is $O\left(N_{a t}{ }^{2}\right)$ because the Coulomb matrix is dense and has $N_{\mathrm{at}}{ }^{2}$ elements.
2.2. Calculation of Total Derivatives. Since the charge equilibration energy depends on the atomic positions, both explicitly and implicitly, via the dependence of the charges on the atomic positions, the gradient is given by the expression

$$
\frac{\mathrm{d} E_{\text {elec }}(\mathbf{R}, \mathbf{Q}(\mathbf{R}))}{\mathrm{d} \mathbf{R}}=\frac{\partial E_{\text {elec }}(\mathbf{R}, \mathbf{Q})}{\partial \mathbf{R}}+\frac{\partial E_{\text {elec }}}{\partial \mathbf{Q}} \frac{\partial \mathbf{Q}}{\partial \mathbf{R}}
$$

Since in charge equilibration the energy $E_{\mathrm{Q} \text { eq }}$ is minimized with respect to the $q_{i}$, we have $\frac{\partial E_{\mathrm{Q} e q}}{\partial \mathbf{Q}}=0$ and hence the total derivative simplifies to

$$
\frac{\mathrm{d} E_{\mathrm{Qeq}}(\mathbf{R}, \mathbf{Q}(\mathbf{R}))}{\mathrm{d} \mathbf{R}}=\frac{\partial E_{\mathrm{Qeq}}(\mathbf{R}, \mathbf{Q})}{\partial \mathbf{R}}
$$

The situation is more complicated if the charges are not determined by a minimization of the total energy. For example, in 4G-HDNNPs ${ }^{34}$ the charges obtained by the charge equilibration are used as parameters to calculate the shortrange and electrostatic energies. In that case, the gradient of the total energy of the system is given by

$$
\frac{\mathrm{d} E(\mathbf{R}, \mathbf{Q}(\mathbf{R}))}{\mathrm{d} \mathbf{r}_{i}}=\frac{\partial E}{\partial \mathbf{r}_{i}}+\sum_{j=1}^{N_{\mathrm{at}}} \frac{\partial E}{\partial q_{j}} \frac{\partial q_{j}}{\partial \mathbf{r}_{i}}
$$

and the derivatives $\frac{\partial q_{j}}{\partial \mathbf{r}_{i}}$ are required. In total, there are $3 N_{\mathrm{at}}{ }^{2}$ derivatives of atomic charges with respect to atomic positions, which would result in at least quadratic scaling when the derivatives are calculated. However, the total derivative $\frac{\mathrm{d} E}{\mathrm{~d} \mathbf{r}_{i}}$ can be evaluated without calculating $\frac{\partial q_{j}}{\partial \mathbf{r}_{i}}$ explicitly. A similar approach has been used by Poier et al. ${ }^{43}$ in the context of polarizable force fields. Ko et al. ${ }^{34}$ derived an efficient way to calculate the forces in the 4G-HDNNP method. The resulting formulas for the forces and the strain derivatives $\frac{\mathrm{d}}{\mathrm{d} \varepsilon_{\mu \nu}}$ needed for calculating the stress are

$$
\begin{aligned}
& \frac{\mathrm{d} E}{\mathrm{~d} \mathbf{r}_{k}}=\frac{\partial E}{\partial \mathbf{r}_{k}}+\sum_{i=1}^{N_{\mathrm{at}}} \lambda_{i}\left(\sum_{j=1}^{N_{\mathrm{at}}} \frac{\partial A_{i j}}{\partial \mathbf{r}_{k}} q_{j}+\frac{\partial \chi_{i}}{\partial \mathbf{r}_{k}}\right) \\
& \frac{\mathrm{d} E}{\mathrm{~d} \varepsilon_{\mu \nu}}=\frac{\partial E}{\partial \varepsilon_{\mu \nu}}+\sum_{i=1}^{N_{\mathrm{at}}} \lambda_{i}\left(\sum_{j=1}^{N_{\mathrm{at}}} \frac{\partial A_{i j}}{\partial \varepsilon_{\mu \nu}} q_{j}+\frac{\partial \chi_{i}}{\partial \varepsilon_{\mu \nu}}\right)
\end{aligned}
$$

where $\lambda$ can be obtained by solving

$$
\mathbf{M} \lambda=-\frac{\partial E}{\partial \mathbf{Q}}
$$

under the constraint that the sum of the components of $\lambda$ is 0 .
In the derivation of the total derivatives, it is assumed that the electronegativities $\chi_{i}$ depend on the atomic positions, whereas the hardnesses $J_{i}$ are only element-specific quantities. While the derivation could also be extended to consider position-dependent hardnesses, we assume that the hardness is an element-specific parameter throughout this Article.

The cost of evaluating eqs 13 and 14 directly still scales at least quadratically. In section 3.4, it is discussed how these sums can be evaluated more efficiently.

## 3. PARTICLE MESH CHARGE EQUILIBRATION

3.1. Solving the System of Equations. We start by noting that, as shown in section 1 in the Supporting Information, $\frac{\partial E_{\text {elec }}}{\partial q_{i}}$ can be written as

$$
\frac{\partial E_{\mathrm{elec}}}{\partial q_{i}}=\int \rho_{i}\left(\left\|\mathbf{r}-\mathbf{r}_{i}\right\|\right) V(\mathbf{r}) \mathrm{d} \mathbf{r}=(\mathbf{A} \cdot \mathbf{Q})_{i}
$$

With this relation, the matrix-vector product $\mathbf{A} \cdot \mathbf{Q}$ can be calculated for an arbitrary $\mathbf{Q}$ without any explicit knowledge about the elements of matrix A. Being able to calculate matrixvector products for arbitrary vectors is sufficient to solve a system of equations iteratively.

As discussed in section 2.1, the Coulomb matrix is positive definite. The manifold of the charge equilibration constraint $\sum_{i} q_{i}=Q_{\text {tot }}$ is a hyperplane, meaning that an arbitrary large step along a constrained gradient will still fulfill the charge conservation constraint. Therefore, the standard conjugate gradient method can be used to solve the set of linear equations.

$$
(\mathbf{A} \cdot \mathbf{Q})_{i}+J_{i} q_{i}=(\mathbf{M} \cdot \mathbf{Q})_{i}=-\chi_{i}
$$

where

$$
(\mathbf{M} \cdot \mathbf{Q})_{i}=\frac{\partial E}{\partial q_{i}}+J_{i} q_{i}
$$

The constrained gradient $\frac{\widehat{\partial E_{\text {elec }}}}{\partial q_{i}}$ of eq 16 can be obtained by projecting the gradient onto the constraint

$$
\frac{\widehat{\partial E_{\mathrm{elec}}}}{\partial q_{i}}=\frac{\partial E_{\mathrm{elec}}}{\partial q_{i}}-\frac{1}{N_{\mathrm{at}}} \sum_{j=1}^{N_{\mathrm{at}}} \frac{\partial E_{\mathrm{elec}}}{\partial q_{j}}
$$

3.2. Plane Wave Methods. In order to minimize $E_{\mathrm{Qeq}}$ quickly, it is necessary to evaluate eq 16 efficiently. In the case of periodic boundary conditions, this can be done by solving Poisson's equation in Fourier space using plane waves. Let $\tilde{\rho}(\mathbf{G})$ and $V(\mathbf{G})$ be the Fourier transforms of $\rho$ and $V$, respectively, and $\mathbf{G}$ is a Fourier space vector. Because of the Plancherel theorem, $E_{\text {elec }}$ can be calculated in Fourier space as

$$
E_{\mathrm{elec}}=\frac{1}{2} \int \rho(\mathbf{r}) V(\mathbf{r}) \mathrm{d} \mathbf{r}=\frac{1}{2} \int \tilde{\rho}^{*}(\mathbf{G}) \tilde{\mathrm{V}}(\mathbf{G}) \mathrm{d} \mathbf{G}
$$

where the superscript * of $\rho$ represents complex conjugation. This is particularly useful because Poisson's equation can be solved analytically in Fourier space with the solution $\tilde{\mathrm{V}}(\mathbf{G})=-4 \pi \frac{\tilde{\rho}(\mathbf{G})}{\mathbf{G}^{2}}$. The electrostatic energy can be calculated by Fourier transforming $\rho$ and then solving the Fourier space integral in eq 20 . Then, the electrostatic potential $V(\mathbf{r})$ in real space can be obtained efficiently by back-transforming the Fourier coefficients $-4 \pi \frac{\tilde{\rho}(\mathbf{G})}{\mathbf{G}^{2}}$.

In case of periodic boundary conditions, the integral in eq 20 transforms into the following series:

$$
E_{\mathrm{elec}}=2 \pi \Omega \sum_{\mathbf{G}} \tilde{\rho}^{*}(\mathbf{G}) \frac{\tilde{\rho}(\mathbf{G})}{\mathbf{G}^{2}}
$$

where $\Omega$ is the unit cell volume. Also, Fourier transforms of any periodic function can be obtained numerically using the Fast Fourier transform (FFT), which can be calculated with a $O(N \ln N)$ scaling where $N$ is the number of gridpoints.

The electrostatic potential $V(\mathbf{r})$ can be obtained by using a forward and backward Fourier transform. The atomic charge densities $\rho_{i}$, which are present in eq 16, typically decay exponentially, which makes it possible to obtain $\frac{\partial E_{\text {elec }}}{\partial q_{i}}$ for all atoms in quasi-linear time because it is sufficient to integrate only over a small volume around each atom $i$ to obtain $\frac{\partial E_{\text {elec }}}{\partial q_{i}}$. Therefore, the matrix vector product $(\mathbf{M} \cdot \mathbf{Q})_{i}=\frac{\partial E}{\partial q_{i}}+J_{i} q_{i}$ can be evaluated for any $\mathbf{Q}$ in quasi-linear time.
3.3. Derivatives with Plane Wave Methods. Most materials science simulations require the calculation of the forces acting on the nuclei and the stress tensor acting on the periodic lattice. Using the definition of $\rho$ from eq 2 , the electrostatic force can be obtained by evaluating the real space integral

$$
\frac{\partial E_{\mathrm{elec}}\left(\mathbf{r}_{1}, \cdots, \mathbf{r}_{N_{\mathrm{at}}}\right)}{\partial \mathbf{r}_{i}}=q_{i} \int V(\mathbf{r}) \frac{\partial \rho_{i}\left(\| \mathbf{r}-\mathbf{r}_{i}\right) \|}{\partial \mathbf{r}_{i}} \mathrm{~d} \mathbf{r}
$$

which is derived in section 2 in the Supporting Information.
Regarding the electrostatic stress, two different definitions of stress are commonly in use: the microscopic stress and the
macroscopic stress. The microscopic stress tensor is a tensor field, and an example is the Maxwell stress $\sigma_{\mathrm{ij}}=\frac{1}{4 \pi}\left(E_{i} E_{j}-\frac{1}{2} \delta_{\mathrm{ij}} E^{2}\right)$ for systems without periodic boundary conditions. For periodic systems, the microscopic stress tensor is rarely used, since in bulk materials it is often sufficient to consider the macroscopic stress tensor, which corresponds to the average microscopic stress per unit volume. The symmetric strain tensor $\varepsilon_{\mu \nu}$ describes an infinitesimal deformation of a crystal $r_{\mu}^{\prime}=\left(\delta_{\mu \nu}+\varepsilon_{\mu \nu}\right) r_{\nu}$, where $\delta$ stands for the Kronecker $\delta$ and the Einstein summation convention is used. The macroscopic stress $\boldsymbol{\sigma}$ is the strain derivative of the total energy per unit volume ${ }^{44,45}$ with

$$
\sigma_{\mu \nu}=\left.\frac{1}{\Omega} \frac{\partial E\left(\mathbf{R}^{\prime}\right)}{\partial \varepsilon_{\mu \nu}}\right|_{\varepsilon=0}
$$

$\mathbf{R}^{\prime}$ contains the atomic positions $\mathbf{R}$ that are deformed with the strain tensor $\varepsilon_{\mu \nu}$. Because of the variational character of electronic structure calculations, the strain derivative of the charge density is zero, which reduces eq 23 to the average Maxwell stress that can easily be calculated when the total potential $V(\mathbf{r})$ is known. The strain derivative of the charge density is not zero in our case, and the total stress has to be evaluated in Fourier space where $\frac{\partial \rho}{\partial \varepsilon_{\mu \nu}}$ is given by

$$
\begin{aligned}
\sigma_{\mu \nu}= & \left.\frac{1}{\Omega} \frac{\partial E_{\mathrm{elec}}\left(\mathbf{R}^{\prime}\right)}{\partial \varepsilon_{\mu \nu}}\right|_{\varepsilon=0} \\
= & \delta_{\mu \nu} \frac{E}{\Omega}+2 \pi \sum_{\mathbf{G} \neq 0}\left(\frac { 1 } { \mathbf { G } ^ { 2 } } \left(\tilde{\rho}^{*}(\mathbf{G}) \frac{\partial \tilde{\rho}(\mathbf{G})}{\partial \varepsilon_{\mu \nu}}\right.\right. \\
& \left.\left.+\tilde{\rho}(\mathbf{G}) \frac{\partial \tilde{\rho}^{*}(\mathbf{G})}{\partial \varepsilon_{\mu \nu}}\right)+2 \frac{|\tilde{\rho}(\mathbf{G})|^{2}}{\mathbf{G}^{4}} G_{\mu} G_{\nu}\right)
\end{aligned}
$$

A derivation of eq 24 can be found in section 3 in the Supporting Information. The Fourier transform of the strain derivative $\frac{\partial \tilde{\rho}(\mathbf{G})}{\partial \varepsilon_{\mu \nu}}$ can be obtained by transforming the strain derivatives $\frac{\partial \rho}{\partial \varepsilon_{\mu \nu}}$ of the charge density into Fourier space, which requires six additional Fourier transforms as $\frac{\partial \rho}{\partial \varepsilon_{\mu \nu}}$ is symmetric. The periodic generalization of eq 2 for the lattice matrix $\mathbf{h}$ containing the three lattice vectors $\mathbf{h}_{1}, \mathbf{h}_{2}$, and $\mathbf{h}_{3}$ is given by

$$
\rho\left(\mathbf{r}, \mathbf{r}_{1}, \cdots, \mathbf{r}_{N_{\mathrm{at}}} \mathbf{h}\right)=\sum_{i, j, k=-\infty}^{\infty} \sum_{l=1}^{N_{\mathrm{at}}} q_{l} \rho_{l}\left(\left\|\mathbf{r}-\mathbf{r}_{l}-i \mathbf{h}_{1}-j \mathbf{h}_{2}-k \mathbf{h}_{3}\right\|^{2}\right)
$$

The calculation of the strain derivative of eq 25 is discussed in section 4 in the Supporting Information. It has the following form:

$$
\begin{aligned}
& \frac{\partial \rho\left(\mathbf{r}, \mathbf{r}_{1}, \cdots, \mathbf{r}_{N_{\mathrm{at}}}, \mathbf{h}\right)}{\partial \varepsilon_{\mu \nu}}=\sum_{i, j, k=-\infty}^{\infty} \sum_{l=1}^{N_{\mathrm{at}}}\left[2 q _ { l } \left(\mathbf{r}-\mathbf{r}_{l}-i \mathbf{h}_{1}-j \mathbf{h}_{2}\right.\right. \\
& \left.\quad-k \mathbf{h}_{3}\right)_{\mu}\left(\mathbf{r}-\mathbf{r}_{l}-i \mathbf{h}_{1}-j \mathbf{h}_{2}-k \mathbf{h}_{3}\right)_{\nu} \rho_{l}^{\prime}\left(\left(\mathbf{r}-\mathbf{r}_{l}-i \mathbf{h}_{1}\right.\right. \\
& \left.\left.\left.\quad-j \mathbf{h}_{2}-k \mathbf{h}_{3}\right)^{2}\right)\right]
\end{aligned}
$$

The sums over $i, j$, and $k$ in eqs 25 and 26 are over all periodic images of the simulation cell.
3.4. Particle Mesh Total Derivatives. Using the definitions in eq 27, the corresponding potentials $V^{\mathrm{Q}}$ and $V^{\lambda}$, and the electrostatic energies in eq 28,

$$
\begin{aligned}
\rho^{\lambda} & =\sum_{i=1}^{N_{\mathrm{at}}} \lambda_{i} \rho_{i} \text { and } \rho^{\mathbf{Q}}=\sum_{i=1}^{N_{\mathrm{at}}} q_{i} \rho_{i} \\
E^{\lambda} & =\frac{1}{2} \int \rho^{\lambda} V^{\lambda} \mathrm{d} \mathbf{r} \text { and } E^{\mathbf{Q}}=\frac{1}{2} \int \rho^{\mathbf{Q}} V^{\mathbf{Q}} \mathrm{d} \mathbf{r}
\end{aligned}
$$

the double sums in eqs 13 and 14 can be expressed in terms of the newly introduced variables as

$$
\sum_{i, j=1}^{N_{\mathrm{at}}} \lambda_{i} \frac{\partial A_{i j}}{\partial r_{k}} q_{j}=\int\left[V^{\mathbf{Q}}(\mathbf{r}) \frac{\partial \rho^{\lambda}(\mathbf{r})}{\partial \mathbf{r}_{k}}+V^{\lambda}(\mathbf{r}) \frac{\partial \rho^{\mathbf{Q}}(\mathbf{r})}{\partial \mathbf{r}_{k}}\right] \mathrm{d} \mathbf{r}
$$

and

$$
\sum_{i, j=1}^{N_{\mathrm{at}}} \lambda_{i} \frac{\partial A_{i j}}{\partial \varepsilon_{\mu \nu}} q_{j}=\sum_{i, j=1}^{N_{\mathrm{at}}} \int q_{i} \lambda_{j} \frac{\partial}{\partial \varepsilon_{\mu \nu}} \frac{\rho_{i}(\mathbf{r}) \rho_{j}\left(\mathbf{r}^{\prime}\right)}{\left\|\mathbf{r}-\mathbf{r}^{\prime}\right\|} \mathrm{d} \mathbf{r} \mathrm{~d} \mathbf{r}^{\prime}
$$

Equation 29 can be solved in real space, and eq 30 can be solved in Fourier space, in which the integral has the form

$$
\begin{aligned}
\sum_{i, j=1}^{N_{\mathrm{at}}} \lambda_{i} \frac{\partial A_{i j}}{\partial \varepsilon_{\mu \nu}} q_{j}= & 2 \pi \Omega \sum_{\mathbf{G} \neq 0} \frac{1}{\mathbf{G}^{2}}\left[\delta_{\mu \nu} \rho^{\lambda^{*}}(\mathbf{G}) \tilde{\rho}^{\mathbf{Q}}(\mathbf{G})+\frac{\partial \tilde{\rho}^{\lambda^{*}}(\mathbf{G})}{\partial \varepsilon_{\mu \nu}} \tilde{\rho}^{\mathbf{Q}}(\mathbf{G})\right. \\
& \left.+\tilde{\rho}^{\lambda^{*}}(\mathbf{G})\left(\frac{\partial \tilde{\rho}^{\mathbf{Q}}(\mathbf{G})}{\partial \varepsilon_{\mu \nu}}+\frac{2}{\mathbf{G}^{2}} G_{\mu} G_{\nu} \tilde{\rho}^{\mathbf{Q}}(\mathbf{G})\right)\right]
\end{aligned}
$$

which can all be evaluated with quasi-linear scaling. A derivation of eqs 29 and 31 is presented in section 5 in the Supporting Information.

The coefficients $\lambda_{i}$ can be obtained by solving $\mathbf{M} \cdot \lambda=-\frac{\partial E}{\partial \mathbf{Q}}$, where $E$ is an arbitrary energy that depends on charges obtained by minimizing $E_{\mathrm{Qeq}}$. Once again, the matrix-vector product $(\mathbf{A} \cdot \lambda)_{i}=\frac{\partial E^{\lambda}}{\partial \lambda_{i}}=\int \rho_{i}\left(\left\|\mathbf{r}-\mathbf{r}_{i}\right\|\right) V^{\lambda} \mathrm{d} \mathbf{r}$ can be evaluated without knowledge of the elements of $\mathbf{A}$. Therefore, it can also be solved iteratively using the conjugate gradient method.

## 4. RESULTS AND DISCUSSION

Overall, our iterative particle mesh charge equilibration method can be summarized as follows:

1. Charge equilibration: Solve $\mathbf{M} \cdot \mathbf{Q}=-\chi$ under the constant charge constraint using the conjugate gradient method.
$(\mathbf{M} \cdot \mathbf{Q})_{i}=\frac{\partial E_{\text {elec }}}{\partial q_{i}}+J_{i} q_{i}$.
2. Calculate $\lambda$ charges: Solve $\mathbf{M} \cdot \lambda=-\frac{\partial E\left(\mathbf{r}_{1}, \cdots, \mathbf{r}_{\mathrm{N}_{\mathrm{at}}} \mathbf{Q}\right)}{\partial \mathbf{Q}}$ under the constraint that $\sum_{i} \lambda_{i}=0$ using the conjugate gradient method.
3. Calculate forces and stress: Use eqs 13, 14, 29, and 31 to calculate the forces and the stress tensor.

In a first step, we have compared the computational efficiency of the particle mesh charge equilibration method with the conventional charge equilibration approach, i.e., the direct solution of a set of linear equations. For this purpose, the presented iterative particle mesh electrostatic method has been incorporated into our MLP software RuNNer, ${ }^{46,47}$ yielding a significant enhancement for molecular simulations employing 4G-HDNNPs. Results, comprehensively presented in Figure 1,

![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-5_577_714_199_1153.jpg)
Figure 1. Benchmark results illustrating the performance of the iterative particle mesh electrostatic method and the conventional direct method. The figure displays the average single core CPU times required for predicting the energies of 50 randomly selected periodic structures from a data set containing $\mathrm{Au}_{2}$ clusters on undoped and doped $\mathrm{MgO}(001)$ surfaces described by Ko et al. ${ }^{34}$ Each structure comprises 110 atoms, along with their respective supercells containing 220,440 , and 880 atoms. The benchmark includes both the direct method employed in their study on the right and the newly introduced iterative particle mesh method on the left. The simulations were conducted using the RuNNer code ${ }^{46,47}$ on a single-core CPU on a Intel Xeon 6430 processor with 32 cores operating at 2.10 GHz and a 270 W TDP. The system is equipped with 512 GB DDR5-4800 ECC REG RAM ( 16.32 GB ).

show large performance gains for the new iterative electrostatic approach compared to the conventional direct method. Examination of the computation time distribution reveals the significant contribution of the electrostatic component, highlighting its dominance in the overall computational costs.

Having confirmed the high performance of our new method with respect to the conventional approach, we now turn to the scaling behavior of the method. Assuming that the number of iterations needed in the conjugate gradient method does not depend on the system size, the computational costs for the iterative charge equilibration are determined by the cost of solving the electrostatic problem, which scales like $O\left(N_{\mathrm{at}} \ln N_{\mathrm{at}}\right)$ in our case. The number of conjugate gradient iterations needed to converge the charge equilibration charges slightly increases with the number of particles. Therefore, in reality the asymptotic behavior to some extent deviates from the ideal $O\left(N_{\mathrm{at}} \ln N_{\mathrm{at}}\right)$ scaling. Therefore, the charge equilibration and the computation of the derivatives have a quasi-linear scaling that is slightly higher than $O\left(N_{a t} \ln N_{a t}\right)$. Figure 2 shows the timing of our reference implementation of the iterative charge equilibration method presented in this Article. The asymptotic scaling appears to be approximately $O\left(N_{\mathrm{at}} \ln \left(N_{\mathrm{at}}\right)^{2}\right)$. The required calculation of the charge density and the 3 -dim FFT's can be efficiently parallelized with OpenMP, resulting in good overall parallel speed-ups. It would also be possible to use MPI-based domain decomposition to perform the charge equilibration on a parallel machine. Our OpenMP implementation is fast enough for processing systems containing tens of thousands of particles. Another interesting strategy would be to implement the iterative particle mesh charge equilibration on GPUs.

In Figure 3, the particle mesh iterative solver is compared with the standard direct approach to identify the system size at

![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-6_496_809_202_191.jpg)
Figure 2. Timings of our reference implementation of iterative particle mesh charge equilibration. Shown is the time to calculate the Qeq charges for a periodic system as a function of the number of atoms in the system for different numbers of OPENMP threads. The calculations were performed on an AMD EPYC 7742 64-core processor with 1 TB of RAM. Less than 30 GB of RAM was used in total for all threads for all benchmark calculations. The fitted yellow line shows the asymptotic scaling of the computational cost of the newly developed iterative method.

![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-6_492_796_1066_197.jpg)
Figure 3. Logarithmic plot of the iterative particle mesh charge equilibration timings in comparison with the standard direct approach employing a solution of the set of linear equations. The Coulomb matrix elements were calculated using standard Ewald techniques for the direct approach, which governs the scaling for the shown small system sizes, resulting in dominantly quadratic scaling here. The calculation was done on a desktop machine with an 11th generation Intel i7 CPU (11700) and 32 GB of RAM. The fitted blue line shows the scaling of the computational cost of the direct method.

which the new approach becomes more efficient. We find that the iterative method developed in this Article is faster than the direct solution when the test system exceeds a size of about 100 atoms. The computational cost of obtaining the solution for the conventional direct approach scales cubically because of the system of equations to be solved. Since there are highly efficient solvers available for systems of linear equations, the prefactor of the cubic term is small and the quadratic term is dominant in the relatively small system size range shown in Figure 3, while the cubic scaling is anticipated to become dominant for systems between 1000 and 10000 atoms. The quadratic term in the direct approach results from calculating the matrix elements of A. Our newly proposed iterative method therefore outperforms the direct approach even for system sizes where the cost of solving the system of equations is negligible and the most expensive part in the direct method is calculating all of the matrix elements $A_{i j}$. Being iterative, our approach can profit from a good input guess to reduce the
number of iterations. This effect was not taken into account in our tests but will exist in many real applications. In molecular dynamics (MD), for instance, the charges from the previous MD step form a good input guess for the next MD step. This will further increase the efficiency gains of our iterative method compared to the standard direct method.
4.1. Validation of the Iterative Particle Mesh Charge Equilibration. The iterative particle mesh charge equilibration proposed in this Article can be used as a replacement for the current direct charge equilibration solver in the 4 G HDNNP ${ }^{34}$ method. Our newly developed method solves exactly the same problem and therefore predicts exactly the same charges and electrostatic energies as the clearly slower traditional direct approach from Ko et al. ${ }^{34}$

To accentuate the stability of our newly developed iterative charge equilibration scheme, we created a difficult artificial test system with 800 atoms consisting of 60 different elements. The atomic coordinates were chosen randomly, and the shortest distance between two atoms is 0.4 bohr. Element specific hardnesses were drawn from a uniform random distribution in the interval between 0.4 and 1.4. Electronegativities and the charges for the initial charge guess were drawn from a standard normal distribution with mean zero and variance one.

As shown in Figure 4, various quantities are plotted during the minimization of $E_{\mathrm{Qeq}}$ by using the conjugate gradient

![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-6_527_816_1201_1103.jpg)
Figure 4. Convergence of various quantities during conjugate gradient minimization of $E_{\mathrm{Qeq}}$. The test system contains 800 atoms. To demonstrate the robustness of our method, 60 different elements, random element-specific hardnesses, and normal distributed electronegativities were used. The atomic positions were also chosen randomly, and the closest pairwise distance is 0.4 Bohr. Reference values were obtained using the direct approach. The maximum norm was used to measure the convergence of the gradient of $E_{\mathrm{Qeq}}$ with respect to that of $\mathbf{Q}$.

method. In spite of the inherent difficulty of the test system, the CG method converges rapidly after only 31 iterations, the maximum norm of $\frac{\partial E_{\mathrm{Q} \text { qq }}}{\partial \mathbf{Q}}$ is smaller than $10^{-9}$. Reference values for $E_{\mathrm{Q} \text { eq }}$, the charges, and the electrostatic approach were calculated using direct matrix inversion and Ewald techniques to calculate the Coulomb matrix. The iterative particle mesh charge equilibration was also tested and compared to realistic systems, where the convergence was even faster than in the difficult test example presented in Figure 4. This is the expected behavior, since the minimization problem from eq 3 has a unique solution and the conjugate gradient method guarantees convergence with a moderate number of steps.

This numerically confirms that our derivation of the iterative solver is correct and that one can use the newly developed iterative approach to speed up solving the charge equilibration problem in the 4G-HDNNP method.

## 5. CONCLUSIONS

In this work we have presented a quasi-linear, i.e., $N \log (N)^{2}$, scaling method for charge equilibration that allows us to speed up the evaluation of any atomistic potential that contains a charge equilibration part. The atomistic potential can be either a machine learning potential or a classical force field. The performance of our method has been investigated for the example of a fourth-generation high-dimensional neural network potential. We have shown that, due to the high efficiency of the method, it is now possible to perform simulations of systems containing thousands of atoms, which to date has been very demanding if long-range charge transfer has to be taken into account. Consequently, our method will allow to treat even complex systems with the latest generation of machine learning potentials to enable simulations of unprecedented accuracy.

## - ASSOCIATED CONTENT

## (5) Supporting Information

The Supporting Information is available free of charge at https://pubs.acs.org/doi/10.1021/acs.jctc.4c00334.

Detailed derivations of all the steps presented in section 3 (PDF)

## - AUTHOR INFORMATION

## Corresponding Author

Moritz Gubler - Department of Physics, University of Basel, CH-4056 Basel, Switzerland; © orcid.org/0000-0003-3113-2797; Email: moritz.gubler@unibas.ch

## Authors

Jonas A. Finkler - Department of Physics, University of Basel, CH-4056 Basel, Switzerland
Moritz R. Schäfer - Lehrstuhl für Theoretische Chemie II, Ruhr-Universität Bochum, 44780 Bochum, Germany; Research Center Chemical Sciences and Sustainability, Research Alliance Ruhr, 44780 Bochum, Germany
Jörg Behler - Lehrstuhl für Theoretische Chemie II, RuhrUniversität Bochum, 44780 Bochum, Germany; Research Center Chemical Sciences and Sustainability, Research Alliance Ruhr, 44780 Bochum, Germany; © orcid.org/ 0000-0002-1220-1542
Stefan Goedecker - Department of Physics, University of Basel, CH-4056 Basel, Switzerland
Complete contact information is available at:
https://pubs.acs.org/10.1021/acs.jctc.4c00334

## Notes

The authors declare no competing financial interest.

## - ACKNOWLEDGMENTS

Financial support was obtained from the Swiss National Science Foundation (project 200021 191994) and the Deutsche Forschungsgemeinschaft (DFG, German Research Foundation, project 495842446) in the framework of the DFG priority program SPP 2363. This work has been supported by the DFG under Germany's Excellence Strategy EXC 2033-

390677874-RESOLV. The calculations were performed using the computational resources of the Swiss National Supercomputer (CSCS) under project s1167 and at the Scicore (http://scicore.unibas.ch/) computing center of the University of Basel.

## REFERENCES

(1) Behler, J. Perspective: Machine Learning Potentials for Atomistic Simulations. J. Chem. Phys. 2016, 145, 170901.
(2) Deringer, V. L.; Caro, M. A.; Csányi, G. Machine Learning Interatomic Potentials as Emerging Tools for Materials Science. Adv. Mater. 2019, 31, 1902765.
(3) Noé, F.; Tkatchenko, A.; Müller, K.-R.; Clementi, C. Machine Learning for Molecular Simulation. Annu. Rev. Phys. Chem. 2020, 71, 361-390.
(4) Unke, O. T.; Chmiela, S.; Sauceda, H. E.; Gastegger, M.; Poltavsky, I.; Schütt, K. T.; Tkatchenko, A.; Müller, K.-R. Machine Learning Force Fields. Chem. Rev. 2021, 121, 10142-10186.
(5) Behler, J.; Csányi, G. Machine Learning Potentials for Extended Systems - A Perspective. Eur. Phys. J. B 2021, 94, 142.
(6) Kocer, E.; Ko, T. W.; Behler, J. Neural Network Potentials: A Concise Overview of Methods. Annu. Rev. Phys. Chem. 2022, 73, 163-186.
(7) Friederich, P.; Häse, F.; Proppe, J.; Aspuru-Guzik, A. Machinelearned potentials for next-generation matter simulations. Nat. Mater. 2021, 20, 750-761.
(8) Schütt, K. T.; Sauceda, H. E.; Kindermans, P.-J.; Tkatchenko, A.; Müller, K.-R. SchNet - A deep learning architecture for molecules and materials. J. Chem. Phys. 2018, 148, 241722.
(9) Behler, J.; Parrinello, M. Generalized Neural-Network Representation of High-Dimensional Potential-Energy Surfaces. Phys. Rev. Lett. 2007, 98, 146401.
(10) Behler, J. Four Generations of High-Dimensional Neural Network Potentials. Chem. Rev. 2021, 121, 10037-10072.
(11) Bartók, A. P.; Payne, M. C.; Kondor, R.; Csányi, G. Gaussian Approximation Potentials: The Accuracy of Quantum Mechanics, without the Electrons. Phys. Rev. Lett. 2010, 104, 136403.
(12) Shapeev, A. V. Moment Tensor Potentials: a class of systematically improvable interatomic potentials. Multiscale Model. Simul. 2016, 14, 1153-1173.
(13) Smith, J. S.; Isayev, O.; Roitberg, A. E. ANI-1: An extensible neural network potential with DFT accuracy at force field computational cost. Chem. Sci. 2017, 8, 3192-3203.
(14) Zhang, L.; Han, J.; Wang, H.; Car, R.; E, W. Deep Potential Molecular Dynamics: A Scalable Model with the Accuracy of Quantum Mechanics. Phys. Rev. Lett. 2018, 120, 143001.
(15) Drautz, R. Atomic cluster expansion for accurate and transferable interatomic potentials. Phys. Rev. B 2019, 99, 014104.
(16) Thompson, A. P.; Swiler, L. P.; Trott, C. R.; Foiles, S. M.; Tucker, G. J. Spectral neighbor analysis method for automated generation of quantum-accurate interatomic potentials. J. Comput. Phys. 2015, 285, 316-330.
(17) Darley, M. G.; Handley, C. M.; Popelier, P. L. A. Beyond Point Charges: Dynamic Polarization from Neural Net Predicted Multipole Moments. J. Chem. Theory Comput.h 2008, 4, 1435-1448.
(18) Artrith, N.; Morawietz, T.; Behler, J. High-dimensional neuralnetwork potentials for multicomponent systems: Applications to zinc oxide. Phys. Rev. B 2011, 83, 153101.
(19) Morawietz, T.; Sharma, V.; Behler, J. A neural network potential-energy surface for the water dimer based on environmentdependent atomic energies and charges. J. Chem. Phys. 2012, 136, 064103.
(20) Yao, K.; Herr, J. E.; Toth, D. W.; Mckintyre, R.; Parkhill, J. The TensorMol-0.1 model chemistry: a neural network augmented with long-range physics. Chem. Sci. 2018, 9, 2261-2269.
(21) Unke, O. T.; Meuwly, M. PhysNet: A Neural Network for Predicting Energies, Forces, Dipole Moments, and Partial Charges. J. Chem. Theory Comput. 2019, 15, 3678-3693.
(22) Ko, T. W.; Finkler, J. A.; Goedecker, S.; Behler, J. GeneralPurpose Machine Learning Potentials Capturing Nonlocal Charge Transfer. Acc. Chem. Res. 2021, 54, 808-817.
(23) Rappe, A. K.; Goddard, W. A., III Charge equilibration for molecular dynamics simulations. J. Phys. Chem. 1991, 95, 3358-3363.
(24) Nakano, A. Parallel multilevel preconditioned conjugategradient approach to variable-charge molecular dynamics. Comput.
Phys. Commun. 1997, 104, 59-69.
(25) Caldeweyher, E.; Ehlert, S.; Hansen, A.; Neugebauer, H.; Spicher, S.; Bannwarth, C.; Grimme, S. A generally applicable atomiccharge dependent London dispersion correction. J. Chem. Phys. 2019, 150, 154122.
(26) Warren, G. L.; Davis, J. E.; Patel, S. Origin and control of superlinear polarizability scaling in chemical potential equalization methods. J. Chem. Phys. 2008, 128, 144110.
(27) Ongari, D.; Boyd, P. G.; Kadioglu, O.; Mace, A. K.; Keskin, S.; Smit, B. Evaluating Charge Equilibration Methods To Generate Electrostatic Fields in Nanoporous Materials. J. Chem. Theory Comput. 2019, 15, 382-401. PMID: 30419163.
(28) van Duin, A. C. T.; Dasgupta, S.; Lorant, F.; Goddard, W. A. ReaxFF: A Reactive Force Field for Hydrocarbons. J. Phys. Chem. A 2001, 105, 9396-9409.
(29) Yu, J.; Sinnott, S. B.; Phillpot, S. R. Charge optimized manybody potential for the $\mathrm{Si} / \mathrm{SiO}_{2}$ system. Phys. Rev. B 2007, 75, 085311.
(30) Thompson, A. P.; Aktulga, H. M.; Berger, R.; Bolintineanu, D. S.; Brown, W. M.; Crozier, P. S.; in 't Veld, P. J.; Kohlmeyer, A.; Moore, S. G.; Nguyen, T. D.; Shan, R.; Stevens, M. J.; Tranchida, J.; Trott, C.; Plimpton, S. J. LAMMPS - a flexible simulation tool for particle-based materials modeling at the atomic, meso, and continuum scales. Comput. Phys. Commun. 2022, 271, 108171.
(31) Ghasemi, S. A.; Hofstetter, A.; Saha, S.; Goedecker, S. Interatomic potentials for ionic systems with density functional accuracy based on charge densities obtained by a neural network. Phys. Rev. B 2015, 92, 045131.
(32) Faraji, S.; Ghasemi, S. A.; Rostami, S.; Rasoulkhani, R.; Schaefer, B.; Goedecker, S.; Amsler, M. High accuracy and transferability of a neural network potential through charge equilibration for calcium fluoride. Phys. Rev. B 2017, 95, 104105.
(33) Khajehpasha, E. R.; Finkler, J. A.; Kühne, T. D.; Ghasemi, S. A. CENT2: Improved charge equilibration via neural network technique. Phys. Rev. B 2022, 105, 144106.
(34) Ko, T. W.; Finkler, J. A.; Goedecker, S.; Behler, J. A fourthgeneration high-dimensional neural network potential with accurate electrostatics including non-local charge transfer. Nat. Commun. 2021, 12, 398.
(35) Zubatiuk, T.; Isayev, O. Development of Multimodal Machine Learning Potentials: Toward a Physics-Aware Artificial Intelligence. Acc. Chem. Res. 2021, 54, 1575-1585. PMID: 33715355.
(36) Zubatyuk, R.; Smith, J. S.; Nebgen, B. T.; Tretiak, S.; Isayev, O. Teaching a neural network to attach and detach electrons from molecules. Nat. Commun. 2021, 12, 4870.
(37) Xie, X.; Persson, K. A.; Small, D. W. Incorporating Electronic Information into Machine Learning Potential Energy Surfaces via Approaching the Ground-State Electronic Energy as a Function of Atom-Based Electronic Populations. J. Chem. Theory Comput. 2020, 16, 4256-4270. PMID: 32502350.
(38) Jacobson, L. D.; Stevenson, J. M.; Ramezanghorbani, F.; Ghoreishi, D.; Leswing, K.; Harder, E. D.; Abel, R. Transferable Neural Network Potential Energy Surfaces for Closed-Shell Organic Molecules: Extension to Ions. J. Chem. Theory Comput. 2022, 18, 2354-2366. PMID: 35290063.
(39) Staacke, C. G.; Wengert, S.; Kunkel, C.; Csányi, G.; Reuter, K.; Margraf, J. T. Kernel charge equilibration: efficient and accurate prediction of molecular dipole moments with a machine-learning enhanced electron density model. Mach. Learn. Sci. Techn. 2022, 3, 015032.
(40) Anstine, D.; Zubatyuk, R.; Isayev, O. AIMNet2: A Neural Network Potential to Meet your Neutral, Charged, Organic, and

Elemental-Organic Needs. ChemRxiv 2023, DOI: 10.26434/chem-rxiv-2023-296ch.
(41) Metcalf, D. P.; Jiang, A.; Spronk, S. A.; Cheney, D. L.; Sherrill, C. D. Electron-Passing Neural Networks for Atomic Charge Prediction in Systems with Arbitrary Molecular Charge. J. Chem. Inf. Model. 2021, 61, 115-122.
(42) Rostami, S.; Amsler, M.; Ghasemi, S. A. Optimized symmetry functions for machine-learning interatomic potentials of multicomponent systems. J. Chem. Phys. 2018, 149, 124106.
(43) Poier, P. P.; Lagardère, L.; Piquemal, J.-P.; Jensen, F. Molecular Dynamics Using Nonvariational Polarizable Force Fields: Theory, Periodic Boundary Conditions Implementation, and Application to the Bond Capacity Model. J. Chem. Theory Comput. 2019, 15, 62136224. PMID: 31557014.
(44) Nielsen, O. H.; Martin, R. M. Stresses in semiconductors: Ab initio calculations on Si, Ge, and GaAs. Phys. Rev. B 1985, 32, 37923805.
(45) Nielsen, O. H.; Martin, R. M. Quantum-mechanical theory of stress and force. Phys. Rev. B 1985, 32, 3780-3791.
(46) Behler, J. Constructing High-Dimensional Neural Network Potentials: A Tutorial Review. Int. J. Quantum Chem. 2015, 115, 1032-1050.
(47) Behler, J. First Principles Neural Network Potentials for Reactive Simulations of Large Molecular and Condensed Systems. Angew. Chem., Int. Ed. 2017, 56, 12828-12840.
![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-8_553_851_1496_1090.jpg)
![](./images/6d9bc8e0-5f08-4551-8290-749ca5b9ce60-8_610_849_2022_1090.jpg)


[^0]:    Received: March 15, 2024
    Revised: July 16, 2024
    Accepted: July 17, 2024
    Published: August 16, 2024

