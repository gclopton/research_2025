# On-the-fly machine learning force field generation: Application to melting points 

Ryosuke Jinnouchi<br>University of Vienna, Department of Physics, Sensengasse 8/16, Vienna, Austria<br>and<br>Toyota Central Research and Development Laboratories, Inc., 41-1 Yokomichi, Nagakute, Aichi 480-1192, Japan<br>Ferenc Karsai<br>VASP Software GmbH, Sensengasse 8, Vienna, Austria<br>Georg Kresse<br>University of Vienna, Department of Physics, Sensengasse 8, Vienna, Austria


#### Abstract

An efficient and robust on-the-fly machine learning force field method is developed and integrated into an electronic-structure code. This method realizes automatic generation of machine learning force fields on the basis of Bayesian inference during molecular dynamics simulations, where the first principles calculations are only executed, when new configurations out of already sampled datasets appear. The developed method is applied to the calculation of melting points of $\mathrm{Al}, \mathrm{Si}$, Ge , Sn and MgO . The applications indicate that more than $99 \%$ of the first principles calculations are bypassed during the force field generation. This allows the machine to quickly construct first principles datasets over wide phase spaces. Furthermore, with the help of the generated machine learning force fields, simulations are accelerated by a factor of thousand compared with first principles calculations. Accuracies of the melting points calculated by the force fields are examined by thermodynamic perturbation theory, and the examination indicates that the machine learning force fields can quantitatively reproduce the first principles melting points.


## I. INTRODUCTION

The quantitative prediction of first-order phase transitions of real materials from first principles (FP) calculations is a long-standing issue in condensed matter physics. The phase transition point is simply located at a temperature-pressure point where Gibbs free energies of two phases become identical. Its prediction is, however, quite challenging. Direct simulations using molecular dynamics (MD) and Monte Carlo methods are not computationally tractable because of the long time-scale nature of the phase transitions. Several approaches were proposed in order to solve this time-scale issue. One is an indirect approach on the basis of the thermodynamic integration method ${ }^{\underline{1}-\underline{3}}$. In this approach, the Gibbs free energy of a single phase is calculated by integrating a chemical potential derivative along a reversible thermodynamic path that connects from a simple statistical model to a realistic interacting model. Another one is a direct approach, where the co-existence point of the solid-liquid interface is directly explored by MD ${ }^{4-9}$. There is an alternative approach ${ }^{10}$ that transforms this out-of-equilibrium direct simulation to an equilibrium simulation by introducing a bias potential pinning the system in an interfacial state. In this third approach, the co-existence point is determined by using the free energy difference obtained
from the mean force of the bias potential. However, all these methods need significant computational resources.

Recently developed machine learning force field (MLFF) techniques $\underline{11-15}$ have the potential to solve this problem. In those techniques, the potential energy of the system is described as a function of structural descriptors that map the $3 N$-dimensional structural information onto a lower-dimensional descriptor space, and the function is optimized to reproduce the FP data. High flexibility of the descriptors and this function allow for an accurate reproduction of the FP data, and the simulations are orders of magnitude faster using the generated force fields than the FP simulations.

However, applications of machine learning (ML) approaches are still limited to few simple materials. The difficulties are mainly in the force field generation process. Carefully selected reference datasets and a tremendous amount of FP calculations on typically 2000-12000 structures $\underline{11,15} \underline{-19}$ are needed in order to train force fields. Furthermore, the data selection and parameter optimization are complex and involve a quite large number of trial and error steps.

On-the-fly force field generation $\underline{20}^{\underline{23}}$ has the potential to overcome these limitations. In this method, energy, forces, and the stress tensor as well as their uncertainties are computed by Bayesian inference during an MD sim-
ulation. If the uncertainties are judged to be small, the computed energy, forces, and the stress tensor are used to integrate the equations of motions. If the uncertainties are judged to be large, FP calculations are executed in order to obtain new data that are then used to refine the force field. This error estimation and judgment step can realize efficient explorations of wide phase spaces and systematic data selection.

In this article, we present an efficient and robust algorithm that can be applied to liquid-solid phase transitions of a wide variety of materials. In Section II, theories and equations used in our on-the-fly algorithm are presented. In Section III, method and parameters used in the simulations of the phase transitions are described. In section IV the calculated melting points are presented before we finally conclude the paper in section V.

## II. METHOD: ON-THE-FLY FORCE FIELD GENERATION

In this section, after describing an outline of our on-the-fly MLFF generation scheme, the necessary methodologies composing this scheme are presented. For a concise presentation of the methodologies, we define structure datasets and local configurations. A single structure dataset consists of the Bravais lattice, the atomic positions, the total energy, the forces and the stress tensor for one specific structure calculated by the FP method. We will label these datasets using the superscript $\alpha$. For each atom in the structure, a local configuration around this atom can be determined. This local configuration is mapped onto a set of descriptors describing the local environment around each atom as will be explained later on. Local structures and the central atom in a local structure are labeled using indices $i$ or $i_{\mathrm{B}}$. Several structure datasets and local configurations are selected, and the ML force field is fitted to those. The selected datasets and configurations are referred to as reference structure datasets and local reference configurations, respectively.

## A. Outline of the on-the-fly force field generation

Figure 1 shows the flowchart of our on-the-fly force field generation scheme. In our scheme, a force field is generated during MD simulations, as outlined below:

1) The machine predicts the energy, forces, stress tensor and their uncertainties on a given structure using the yet available force field.
2) The machine decides whether to execute the FP calculation or not. The decision is done on the basis of the uncertainty in the prediction and a history of previous samplings. If the machine decides not to execute the FP calculations, the algorithm skips to step 5). Otherwise, it continues with step 3).

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-02_1025_715_176_1168.jpg)
FIG. 1: Flowchart of our on-the-fly machine learning force field generation scheme.

3) The FP calculation is executed on the given structure, and the obtained structure dataset is stored as a candidate for a new reference structure dataset.
4) If the number of the newly collected structures reaches a certain threshold, or if the uncertainty in the prediction becomes too large, the machine updates the set of reference structure datasets and local reference configurations and generates a new force field.
5) Atomic positions and velocities are updated. If the machine judges that the force field is unreliable, the FP energy, forces and stress tensor are used. Otherwise those provided by the force field are used. Afterwards the machine returns to step 1) until the end of the MD simulation is reached ( $I=N_{\mathrm{MD}}$ in Fig. 1).

This scheme needs several key methodologies: an accurate description of the potential energy surface, an optimization of the parameters in the force field, evaluation of the uncertainty, setting of the threshold for the uncertainty, and sparsification and data selections. All these ingredients were implemented within the Vienna Ab initio Simulation Package (VASP) $\underline{24,25}$. Their details are explained in the following subsections.

## B. Descriptor

Our description of the potential energy surface is similar to that adopted in the Gaussian Approximation Potential (GAP) ${ }^{12}$ with the Smooth Overlap of Atomic Positions (SOAP) ${ }^{\underline{26}}$ as a similarity measure. Several new features are, however, introduced to make the on-the-fly force field generation process more efficient and robust. In order to explain them in a concise manner, we formulate the energy and descriptor in this subsection. Here, we show for simplicity the equations only for single element systems, however, the extension to multi-element systems is straightforward.

In the method presented in this work, the potential energy $U$ of a structure with $N_{\mathrm{a}}$ atoms is approximated as a summation of local energies $U_{i}$ as

$$
U=\sum_{i=1}^{N_{\mathrm{a}}} U_{i} .
$$

Each local energy $U_{i}$ is assumed to be fully determined by the local environment around atom $i$. To represent the local environment, the distribution of other atoms around the atom $i$ is an obvious starting point. This distribution is represented by the probability density $\rho_{i}$ to find another atom $j$ at the position $\mathbf{r}$ around the atom $i$ within a radius $R_{\text {cut }}$. It is defined as

$$
\rho_{i}(\mathbf{r})=\sum_{j=1}^{N_{\mathrm{a}}} f_{\mathrm{cut}}\left(r_{i j}\right) g\left(\mathbf{r}-\mathbf{r}_{i j}\right),
$$

where $f_{\text {cut }}$ is a cutoff function that smoothly removes the information outside the radius $R_{\text {cut }}$. The position vector of the atom $i$ is denoted by $\mathbf{r}_{i}$, and $r_{i j}=\left|\mathbf{r}_{i j}\right|=\left|\mathbf{r}_{j}-\mathbf{r}_{i}\right|$ is the distance between two atoms, and $g(\mathbf{r})$ is the delta function $\delta(\mathbf{r})$. In SOAP, the delta function is replaced by a normalized Gaussian function as

$$
g(\mathbf{r})=\frac{1}{\sqrt{2 \sigma_{\mathrm{atom}} \pi}} \exp \left(-\frac{|\mathbf{r}|^{2}}{2 \sigma_{\mathrm{atom}}^{2}}\right) .
$$

The local energies $U_{i}$ are functionals of the density $\rho_{i}$, $U_{i}=F\left[\rho_{i}(\mathbf{r})\right]$. So the simplest numerical approach to implement this procedure would be to develop $\rho_{i}(\mathbf{r})$ into a finite basis set and express $F$ as a function of the coefficients. The drawback of this is that $F$ would not possess rotational invariance. Therefore, it is expedient to introduce intermediate functions- usually called descriptors -that depend on $\rho_{i}(\mathbf{r})$. These intermediate functions should be invariant under rotations (as well as translations). The simplest rotationally invariant descriptor is the radial distribution function defined as

$$
\rho_{i}^{(2)}(r)=\frac{1}{4 \pi} \int \rho_{i}(r \hat{\mathbf{r}}) d \hat{\mathbf{r}},
$$

which measures pairwise distances from the atom $i$ within $R_{\text {cut }}$ as schematically shown in Fig.2(a). Here, $\hat{\mathbf{r}}$ denotes

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-03_248_529_176_1274.jpg)
FIG. 2: (a) Radial and (b) angular descriptors.

the unit vector of $\mathbf{r}$. This function, however, cannot accurately describe the potential energy surface because of the lack of angular information. Specifically two different probability densities $\rho_{i}$ can yield an identical $\rho_{i}^{(2)}$, which would then yield the same local energy $U_{i}$. The necessary angular information can be incorporated by using the probability to find an atom $j$ at a distance $r$ from the $i$ th atom and another atom $k$ at a distance $s$ from the $i$ th atom along the angle $\angle k i j=\theta$ as schematically shown in Fig. 2(b). Starting from $\rho_{i}(\mathbf{r})$, this probability can be determined as

$$
\rho_{i}^{(3)}(r, s, \theta)=\iint \delta(\hat{\mathbf{r}} \cdot \hat{\mathbf{s}}-\cos \theta) \rho_{i}(r \hat{\mathbf{r}}) \rho_{i}^{*}(s \hat{\mathbf{s}}) d \hat{\mathbf{r}} d \hat{\mathbf{s}}
$$

This function, commonly referred to as angular distribution function, is equivalent to the power spectrum used in practical applications of the GAP $\underline{16,27-29}$. In order to show this equivalence, $\rho_{i}$ is expanded as

$$
\rho_{i}(\mathbf{r})=\sum_{l=1}^{L_{\max }} \sum_{m=-l}^{l} \sum_{n=1}^{N_{\mathrm{R}}^{l}} c_{n l m}^{i} \chi_{n l}(r) Y_{l m}(\hat{\mathbf{r}}) .
$$

Here, $\left\{\chi_{n l} \mid n=1, \ldots, N_{\mathrm{R}}^{l}, l=0, \ldots, L_{\max }\right\}$ denote radial basis functions that satisfy the following orthonormal relation

$$
4 \pi \int_{0}^{\infty} \chi_{n l}(r) \chi_{n^{\prime} l}(r) r^{2} d r=\delta\left(n-n^{\prime}\right)
$$

$Y_{l m}$ are the spherical harmonics. By using Eq. (6), Eqs. (4) and (5) can be rewritten as

$$
\begin{aligned}
\rho_{i}^{(2)}(r) & =\frac{1}{\sqrt{4 \pi}} \sum_{n=1}^{N_{\mathrm{R}}^{0}} c_{n}^{i} \chi_{n l}(r), \\
c_{n}^{i} & =c_{n 00}^{i}, \\
\rho_{i}^{(3)}(r, s, \theta) & =\sum_{l=1}^{L_{\max }} \sum_{n=1}^{N_{\mathrm{R}}^{l}} \sum_{\nu=1}^{N_{\mathrm{R}}^{l}} \sqrt{\frac{2 l+1}{2}} \\
& \times p_{n \nu l}^{i} \chi_{n l}(r) \chi_{\nu l}(s) P_{l}(\cos \theta), \\
p_{n \nu l}^{i} & =\sqrt{\frac{8 \pi^{2}}{2 l+1}} \sum_{m=-l}^{l} c_{n l m}^{i} c_{\nu l m}^{i *},
\end{aligned}
$$

where $P_{l}$ is a Legendre polynomial of order $l$. Eq. (11) is the same as the equation for the power spectrum described in Refs. 26. 30]. Eqs. (10) and (11) indicate that
$p_{n \nu l}^{i}$ corresponds to the expansion coefficients of $\rho_{i}^{(3)}$ with respect to the orthonormal radial and angular basis functions. Thus, $p_{n \nu l}^{i}$ contains the same information as the angular distribution defined in Eq. (5).

## C. Potential energy, Gaussian approximation potential

In our ML algorithm, we use the distributions $\rho_{i}^{(2)}$ and $\rho_{i}^{(3)}$ to parameterize the potential energy surface $U$. This means that $U_{i}$ is described as a functional of $\rho_{i}^{(2)}$ and $\rho_{i}^{(3)}$,

$$
U_{i}=F\left[\rho_{i}^{(2)}, \rho_{i}^{(3)}\right]
$$

Obviously, it is not generally a simple matter to find a suitable functional form, although neural networks and the moment tensor potentials (MTP) have been found to yield an excellent approximation for total energies $11,31,32$. In the present work we adopt the Gaussian approximation potential as pioneered by Bartók and coworkers ${ }^{12}$. In this approach a set of $N_{\mathrm{B}}$ local reference structures $\left\{\rho_{i_{\mathrm{B}}} \mid i_{\mathrm{B}}=1, \ldots, N_{\mathrm{B}}\right\}$ are chosen. These reference configurations are converted to a set of coefficients in the descriptor space $\left\{\mathbf{X}_{i_{\mathrm{B}}} \mid i_{\mathrm{B}}=1, \ldots, N_{\mathrm{B}}\right\}$ and the potential energy is approximated by fitting a set of coefficients $\left\{w_{i_{\mathrm{B}}} \mid i_{\mathrm{B}}=1, \ldots, N_{\mathrm{B}}\right\}$ :

$$
F\left[\rho_{i}^{(2)}, \rho_{i}^{(3)}\right]=\sum_{i_{\mathrm{B}}=1}^{N_{\mathrm{B}}} w_{i_{\mathrm{B}}} K\left(\mathbf{X}_{i}, \mathbf{X}_{i_{\mathrm{B}}}\right)
$$

Here each vector $\mathbf{X}_{i}$ collects all coefficients $c_{n}^{i}$ and $p_{n \nu l}^{i}$ for a specific local configuration $\rho_{i}(\mathbf{r})$ [Eqs. (9) and (11)]. The kernel $K$ is supposed to measure the similarity between a local configuration of interest $\rho_{i}(\mathbf{r})$ and the reference configurations $\rho_{i_{\mathrm{B}}}(\mathbf{r})$. It usually approaches unity if two configurations are similar and decays towards a small value if the two configurations are different.

In the present case, the following polynomial function is used

$$
K\left(\mathbf{X}_{i}, \mathbf{X}_{i_{\mathrm{B}}}\right)=\beta^{(2)}\left(\mathbf{X}_{i}^{(2)} \cdot \mathbf{X}_{i_{\mathrm{B}}}^{(2)}\right)+\beta^{(3)}\left(\overline{\mathbf{X}}_{i}^{(3)} \cdot \overline{\mathbf{X}}_{i_{\mathrm{B}}}^{(3)}\right)^{\zeta^{(3)}} .
$$

Here, $\mathbf{X}_{i}^{(2)}$ and $\mathbf{X}_{i}^{(3)}$ are the vectors containing $c_{n}^{i}$ and $p_{n \nu l}^{i}$, respectively. The vector $\overline{\mathbf{X}}_{i}^{(3)}$ denotes a normalized vector of $\mathbf{X}_{i}^{(3)}, \beta^{(2)}$ and $\beta^{(3)}$ are weighting parameters, and $\zeta^{(3)}$ is a parameter to control the sharpness of the kernel. Phenomenologically, the first term in Eq. (14) can be regarded as a pairwise linear interaction term, which is suited to describe long-range radial interactions, such as Coulomb and Lennard-Jones interactions. In contrast, the second term provides non-linear many-body interaction terms as discussed by Glielmo et al. $\underline{33}$. The latter term is known as the SOAP ${ }^{26}$. The name SOAP relates
to the fact that the dot product $\mathbf{X}_{i}^{(3)} \cdot \mathbf{X}_{i_{\mathrm{B}}}^{(3)}$ can be related to the Haar integra ${ }^{\underline{34}}$ of the square of an overlap between two probability distributions as

$$
\begin{aligned}
\mathbf{X}_{i}^{(3)} \cdot \mathbf{X}_{i_{\mathrm{B}}}^{(3)} & =\int\left|S_{i i_{\mathrm{B}}}(\hat{R})\right|^{2} d \hat{R} \\
S_{i i_{\mathrm{B}}} & =\int \rho_{i}(\mathbf{r}) \rho_{i_{\mathrm{B}}}(\hat{R} \mathbf{r}) d \mathbf{r}
\end{aligned}
$$

where $\hat{R}$ denotes the rotational operator, and the integral in (15) needs to be performed over all possible rotations defined by this operator. In this sense, SOAP measures the structural similarity between the structure $i$ and the reference structure $i_{\mathrm{B}}$ as an overlap of two probability distributions. Similarly, the dot product $\mathbf{X}_{i}^{(2)} \cdot \mathbf{X}_{i_{\mathrm{B}}}^{(2)}$ can be rewritten as an overlap integral between the radial distribution functions as

$$
\mathbf{X}_{i}^{(2)} \cdot \mathbf{X}_{i_{\mathrm{B}}}^{(2)}=4 \pi \int_{0}^{R_{\mathrm{cut}}} \rho_{i}^{(2)}(r) \rho_{i_{\mathrm{B}}}^{(2)}(r) r^{2} d r
$$

In this study, in order to examine the efficiency of the on-the-fly scheme in a manner comparable to previous publications using the SOAP scheme, we only use the SOAP kernel $K\left(\mathbf{X}_{i}, \mathbf{X}_{i_{\mathrm{B}}}\right)$ by setting $\beta^{(2)}=0$ for all materials. An application including the radial descriptor is presented elsewhere ${ }^{23}$.

Before ending this subsection, we briefly explain some key points where our implementation differs from the previous SOAP implementations. At every MD step, the expansion coefficients $c_{n l m}^{i}$ and their partial derivatives with respect to the atomic positions need to be calculated in order to compute the potential energy $U$ and its partial derivatives. In the $\mathrm{SOAP}^{26}, c_{n l m}^{i}$ can be analytically formulated using the Gaussian function of Eq. (3) as

$$
\begin{aligned}
c_{n l m}^{i} & =\sum_{j=1}^{N_{\mathrm{a}}} h_{n l}\left(r_{i j}\right) Y_{l m}^{*}\left(\hat{\mathbf{r}}_{i j}\right) \\
h_{n l}(r) & =\frac{4 \pi}{\left(\sqrt{2 \sigma_{\mathrm{atom}}^{2} \pi}\right)^{3}} f_{\mathrm{cut}}(r) \int_{0}^{\infty} \chi_{n l}\left(r^{\prime}\right) \\
& \times \exp \left(-\frac{r^{\prime 2}+r^{2}}{2 \sigma_{\mathrm{atom}}^{2}}\right) \iota_{l}\left(\frac{r r^{\prime}}{\sigma_{\mathrm{atom}}^{2}}\right) r^{\prime 2} d r^{\prime}
\end{aligned}
$$

where $\iota_{l}$ denotes the modified spherical Bessel function of the first kind. However, the calculation of $h_{n l}$ and $d h_{n l} / d r$ by Eq. (19) would be computationally rather demanding. In order to accelerate the calculations, we adopt a spline interpolation. In this method, $h_{n l}(r)$ is calculated on a radial mesh over $r$ once at the beginning of the training or MD simulation. The calculated function is spline-interpolated, and the interpolated function is used to calculate the coefficients $c_{n l m}^{i}$ and their derivatives later. Another difference to previous implementations is in the choice of the radial basis functions. In our method, normalized spherical Bessel functions $\chi_{n l}=j_{l}\left(q_{n l} r\right)$ are used as the radial basis functions,
because their mutual orthogonality allows for a systematic improvement by simply increasing the number $N_{\mathrm{R}}^{l}$ of the radial functions as described in Appendix A. Finally, we use the cutoff function proposed by Behler and Parrinello 11 defined as

$$
f_{\mathrm{cut}}\left(r_{i j}\right)= \begin{cases}\frac{1}{2}\left[\cos \left(\pi \frac{r_{i j}}{R_{\mathrm{cut}}}\right)+1\right] & \text { if } r_{i j} \leq R_{\mathrm{cut}} \\ 0, & \text { otherwise }\end{cases}
$$

This cutoff function weights atoms close to the central atom $i$ more strongly. This radially scaled weight enables the descriptor to efficiently describe the structural differences that strongly influence the potential energy of atom $i$ similarly to the radially scaled kernel proposed by Willat and co-workers ${ }^{35}$. In Table S1 in the Supplemental Material (SM) ${ }^{\underline{36}}$ all parameters described in the subsections A and B are tabulated.

## D. Fitting of energy, forces and stress tensor and their uncertainty

In order to determine the fitting parameters $w_{i_{\mathrm{B}}}$, the energies, forces and stress tensor for a set of reference structural datasets labeled by a superscript $\alpha=1, \ldots, N_{\text {st }}$ must be fitted. Combining Eqs (1), (12) and (13) yields for the total energy per atom the following equation that must be fulfilled in a least square sense:

$$
\begin{aligned}
\frac{U^{\alpha}}{N_{\mathrm{a}}^{\alpha}} & \stackrel{!}{=} \sum_{i=1}^{N_{\mathrm{a}}^{\alpha}} \frac{U_{i}^{\alpha}}{N_{\mathrm{a}}^{\alpha}} \\
& =\sum_{i_{\mathrm{B}}=1}^{N_{\mathrm{B}}} w_{i_{\mathrm{B}}} \sum_{i=1}^{N_{\mathrm{a}}^{\alpha}} \frac{K\left(\mathbf{X}_{i}^{\alpha}, \mathbf{X}_{i_{\mathrm{B}}}\right)}{N_{\mathrm{a}}^{\alpha}} \quad \forall \alpha=1, \ldots, N_{\mathrm{st}}
\end{aligned}
$$

Here $U_{i}^{\alpha}$ is the local energy of atom $i$ in the structure $\alpha$, and $\mathbf{X}_{i}^{\alpha}$ is the vector of coefficients in the descriptor space for atom $i$ in structure $\alpha$, and $U^{\alpha}$ is the actual FP energy. In practice, we simultaneously fit the energy per atom, forces and the stress tensor for reference structures $\alpha$, for which FP calculations have yet been performed (see below for details). The previous equation indicates that the total potential energy $U^{\alpha}$ is a linear function of the coefficients $w_{i_{\mathrm{B}}}$. It is also straightforward to see that the forces and the stress tensor components are described as linear functions of the coefficients $w_{i_{\mathrm{B}}}$. These linear equations can be collected into a matrix-vector form as

$$
\mathbf{y}^{\alpha} \stackrel{!}{=} \phi^{\alpha} \mathbf{w} \quad \forall \alpha
$$

Here, $\left\{\mathbf{y}^{\alpha} \mid \alpha=1, \ldots, N_{\text {st }}\right\}$ denotes column vectors containing the dimensionless FP potential energy per atom in the first line, the forces and the components of the stress tensor in the subsequent lines for a single structure $\alpha$ in the reference structure dataset, in total

$$
m^{\alpha}=1+3 N_{\mathrm{a}}^{\alpha}+6
$$

components for $N_{\mathrm{a}}^{\alpha}$ atoms. The entries are made dimensionless by dividing their values by the standard deviations of the FP energies per atom, forces and stress tensors in the reference structure datasets. The column vector $\mathbf{w}$ is comprised of the $N_{\mathrm{B}}$ coefficients $w_{i_{\mathrm{B}}}$, and $\phi^{\alpha}$ is a $m^{\alpha} \times N_{\mathrm{B}}$ matrix. The first line of the matrix is made up by $\sum_{i} K\left(\mathbf{X}_{i}^{\alpha}, \mathbf{X}_{i_{\mathrm{B}}}\right) / N_{\mathrm{a}}^{\alpha}$, the second line is made up by the derivative of the energy with respect to the first atomic coordinate in the structure $\alpha$ and so on.

After the fitting, the energies and forces of a new structure with the descriptor $\mathbf{X}_{i}$ can be efficiently obtained calculating

$$
\mathbf{y}=\phi \mathbf{w}
$$

where $\boldsymbol{\phi}$ comprises $\sum_{i} K\left(\mathbf{X}_{i}, \mathbf{X}_{i_{\mathrm{B}}}\right)$ in the first row, and the partial derivatives of the kernel with respect to the coordinates in the structure in the subsequent rows.

In the conventional schemes, FP calculations are carried out on a wide variety of structures in advance, local configurations are chosen from each structure in the dataset, and the coefficients $\mathbf{w}$ are optimized to optimally reproduce the reference structure datasets. In our scheme, the FP data generation, selection, and parameter optimization are carried out on the fly during the MD simulations. A key component that makes this algorithm extremely efficient is the evaluation of the uncertainty in the prediction. This is used to decide whether the FP calculations are necessary or not at step 2). In our scheme, both the optimization of $\mathbf{w}$ and the uncertainties are estimated by a Bayesian linear-regression method ${ }^{37}$.

The Bayesian linear regression assumes the presence of a set of the coefficients that exactly reproduce the exact energy, forces and stress tensor without any numerical noises. Then, this method determines the probability to find this exact set of coefficients at $\mathbf{w}$ on the basis of the observation of a limited number of FP datasets $\left\{\mathbf{y}^{\alpha} \mid \alpha=1, \ldots, N_{\text {st }}\right\}$ containing numerical noises. In practice, the FP data usually carry comparatively small errors, however, the finite cutoff $R_{\text {cut }}$ implies that the model can never exactly describe the FP data. In other words, as the atoms outside the cutoff radius move, the local energies and forces should change, but since the model assumes that the local energy depends only on the position of the atoms inside the cutoff sphere, residual errors are introduced. We assume that these errors can be modeled by the presence of noise with a Gaussian distribution in the FP data. This assumption also implies some errors in the model parameters $\mathbf{w}$. The so-called posterior distribution $p(\mathbf{w} \mid \mathbf{Y})$ is determined as a Gaussian distribution written as (see necessary assumptions in Appendix B):

$$
\begin{aligned}
p(\mathbf{w} \mid \mathbf{Y}) & =\mathcal{N}(\overline{\mathbf{w}}, \boldsymbol{\Sigma}), \\
\overline{\mathbf{w}} & =\frac{1}{\sigma_{\mathrm{v}}^{2}} \boldsymbol{\Sigma} \boldsymbol{\Phi}^{\mathrm{T}} \mathbf{Y}, \\
\boldsymbol{\Sigma}^{-1} & =\frac{1}{\sigma_{\mathrm{w}}^{2}} \mathbf{I}+\frac{1}{\sigma_{\mathrm{v}}^{2}} \boldsymbol{\Phi}^{\mathrm{T}} \boldsymbol{\Phi} .
\end{aligned}
$$

Here, $\mathbf{Y}$ is a super vector with size $M=\sum_{\alpha} m^{\alpha}$ [compare Eq. (23)] collecting all FP energies per atom, forces and stress tensors $\left\{\mathbf{y}^{\alpha} \mid \alpha=1, \ldots, N_{\text {st }}\right\}$ in the reference structure datasets. Similarly, the $M \times N_{\mathrm{B}}$ design matrix $\boldsymbol{\Phi}$ is a collection of all matrices $\phi^{\alpha}$ on all reference structure datasets, and $\mathbf{I}$ denotes the unit matrix. The symbols $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ denote parameters optimized to balance the accuracy and robustness of the evolving force field as explained later on. The symbol $\mathcal{N}(\overline{\mathbf{w}}, \boldsymbol{\Sigma})$ is a multidimensional normalized Gaussian centered at $\overline{\mathbf{w}}$ and defined as

$$
\begin{aligned}
\mathcal{N}(\overline{\mathbf{w}}, \boldsymbol{\Sigma}) & =\frac{1}{\sqrt{(2 \pi)^{N_{\mathrm{B}}}\|\boldsymbol{\Sigma}\|}} \\
& \times \exp \left[-\frac{(\mathbf{w}-\overline{\mathbf{w}})^{\mathrm{T}} \mathbf{\Sigma}^{-1}(\mathbf{w}-\overline{\mathbf{w}})}{2}\right]
\end{aligned}
$$

where $\|\boldsymbol{\Sigma}\|$ means the determinant of the matrix $\boldsymbol{\Sigma}$. The desired optimal coefficients are determined at the center of the Gaussian distribution $\mathbf{w}=\overline{\mathbf{w}}$, where the posterior probability is maximized. It is straightforward to show that the vector $\overline{\mathbf{w}}$ is identical to the vector obtained by the ridge regression, with the ratio of $\sigma_{\mathrm{v}}^{2}$ to $\sigma_{\mathrm{w}}^{2}$ being equivalent to the Tikhonov regularization parameter.

The uncertainty in the predictions is provided from the probability to find the exact FP energy per atom, forces and stress tensor at $\mathbf{y}$. This posterior distribution $p(\mathbf{y} \mid \mathbf{Y})$ is obtained from the posterior distribution $p(\mathbf{w} \mid \mathbf{Y})$ as (see also Appendix B)

$$
\begin{aligned}
p(\mathbf{y} \mid \mathbf{Y}) & =\mathcal{N}(\boldsymbol{\phi} \overline{\mathbf{w}}, \boldsymbol{\sigma}) \\
\boldsymbol{\sigma} & =\sigma_{\mathrm{v}}^{2} \mathbf{I}+\boldsymbol{\phi}^{\mathrm{T}} \boldsymbol{\Sigma} \boldsymbol{\phi}
\end{aligned}
$$

The mean vector $\phi \overline{\mathbf{w}}$ contains the results of the predictions on the dimensionless energy per atom, forces and stress tensor. The diagonal elements of $\boldsymbol{\sigma}$, which correspond to the variances of the predicted results, are used as the uncertainty in the prediction.

As in the ridge regression, the optimization of the parameters $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ is important to prevent overfitting. In our algorithm, they are optimized by the evidence approximation $\underline{38-40}$. In this scheme, the parameters $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ are determined by maximizing the marginal likelihood function called evidence function. This evidence function corresponds to a probability that the regression model with specific parameters $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ provides the reference data $\mathbf{Y}$, and it is calculated as

$$
\begin{aligned}
p\left(\mathbf{Y} \mid \sigma_{\mathrm{v}}^{2}, \sigma_{\mathrm{w}}^{2}\right) & =\left(\frac{1}{\sqrt{2 \pi \sigma_{\mathrm{v}}^{2}}}\right)^{M}\left(\frac{1}{\sqrt{2 \pi \sigma_{\mathrm{w}}^{2}}}\right)^{N_{\mathrm{B}}} \\
& \times \int \exp [-E(\mathbf{w})] d \mathbf{w} \\
E(\mathbf{w}) & =\frac{1}{2 \sigma_{\mathrm{v}}^{2}}\|\mathbf{\Phi} \mathbf{w}-\mathbf{Y}\|^{2}+\frac{1}{2 \sigma_{\mathrm{w}}^{2}}\|\mathbf{w}\|^{2}
\end{aligned}
$$

Hence, the optimization over $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ can be regarded as the maximization of the probability to provide the correct answer $\mathbf{Y}$ at any regression coefficient w. Details of

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-06_952_721_174_1164.jpg)
FIG. 3: Errors during a finite temperature simulation of rocksalt MgO at 300 K . (a) Actual difference between the FP forces and the forces calculated by the MLFF. Solid line shows the maximum difference on a single atom, dotted line shows the root mean square difference averaged over all atoms. (b) The maximum Bayesian error of the dimensionless force on a single atom calculated by Eq. (30) and scaled to the real error. (c) The maximum spilling factor on a single atom. Open circles and black squares indicate step 3) and step 4), respectively. Dark gray triangles indicate the Bayesian errors stored as $\sigma_{\text {max }, I}$. These are used to determine the threshold for the Bayesian error $\epsilon_{\mathrm{BE}}$ as explained in Section E. Gray dashed lines indicate the threshold for the Bayesian error.

the maximization method are documented in Appendix C.

In addition to the Bayesian error, we also calculate the spilling factor suggested by Miwa and Ohno ${ }^{\underline{41}}$. The spilling factor is a measure of the density of local reference configurations $i_{\mathrm{B}}$ near the new local configuration $\mathbf{X}$ in the descriptor space, and its equation is formulated as

$$
\begin{aligned}
s & =1 \\
& -\frac{\sum_{i_{\mathrm{B}}=1}^{N_{\mathrm{B}}} \sum_{i_{\mathrm{B}}^{\prime}=1}^{N_{\mathrm{B}}} K\left(\mathbf{X}, \mathbf{X}_{i_{\mathrm{B}}}\right) K^{-1}\left(\mathbf{X}_{i_{\mathrm{B}}}, \mathbf{X}_{i_{\mathrm{B}}^{\prime}}\right) K\left(\mathbf{X}_{i_{\mathrm{B}}^{\prime}}, \mathbf{X}\right)}{K(\mathbf{X}, \mathbf{X})}
\end{aligned}
$$

It should be noted that the equation is slightly modified from its original equation in order to make it applicable to a non-normalized similarity measure such as the one used by us, see Eq. (14). If the density of the reference configuration is great enough to provide complete overlap
among the configurations, $s$ approaches zero, otherwise $s$ approaches unity.

Trends of these two estimated errors are illustrated in Fig. 3. where the real errors, Bayesian errors and spilling factors are shown as a function of the MD simulation time during on-the-fly force field generations for the MgO solid at 300 K . The Bayesian error estimation can correctly detect the large errors at the beginning of the training because of the presence of the regularization parameters $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$, which can describe the uncertainty in the coefficients $\mathbf{w}$ caused by too few reference data. The regularization parameters also stabilize the computations of the covariance matrix $\boldsymbol{\Sigma}$. These parameters, however, make the Bayesian error less sensitive to structural differences. In contrast, because of the lack of these regularization parameters, the spilling factor can more sensitively detect the uncertainty caused by the structural difference. However, numerical instabilities can occur in its computation because the matrix $K$ is not regularized. This problem is critical particularly in simple materials examined in this study, where the diversity is small in the appearing local configurations, and the spilling factor is less than $10^{-4}$ in most cases because of strong overlap among the selected local reference configurations. As indicated in Fig. 3, the small spilling factor does not mean that the data sampling is unnecessary. The real error can be relatively large, and the spilling factor captures only the qualitative trends of the real error. Thus, the machine needs to make the decision at step 2) on the basis of the unreliable small spilling factor interfered by the numerical instability.

Details of the decision scheme at step 2) are explained in the following subsection. Here we briefly note that the criterion for the spilling factor is set to a relatively large value of 0.02 as in Ref. [37]. For the applications reported here, the threshold for the spilling factor is hardly ever passed. Only for liquid and interfacial MgO , the calculated spilling factors exceeded this criterion. But even then only $2 \%$ of the total FP calculations are executed because of the spilling factor criterion. So in the present work, the Bayesian error criterion is more relevant.

## E. Decision to perform FP calculation

The decision whether to perform a FP calculation in step 2) or not (see section II A) is obviously an important one. Figure 4 shows the flowchart of our decision scheme. As shown in the dark gray square in this figure, the decision is done on the basis of the estimated errors and the history of the previous samplings. First, the machine checks the previous data sampling step. If the current step is within 10 MD steps from the previous sampling step, the machine skips the FP calculations. This process avoids too dense sampling within a narrow phase space. If more than 10 MD steps have passed since the previous sampling, the machine examines the estimated errors. If the maximum Bayesian error in one of the forces or the

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-07_1131_712_178_1168.jpg)
FIG. 4: Flowchart of the decision step whether to perform FP simulations or not. The symbol $\vec{\sigma}$ and $\vec{s}$ denote the vectors containing the Bayesian errors in the forces and spilling factors, respectively, for all atoms. $\|\vec{x}\|_{\infty}$ denotes the infinity norm (also called supremum norm) of the vector $\vec{x}, \epsilon_{\mathrm{BE}}$ denotes the criterion for the Bayesian error, and $\operatorname{Var}(x)$ and $\mathrm{E}(x)$ refer to the the variance and the average of the data $x$. At the beginning of every training simulation, the criterion $\epsilon_{\mathrm{BE}}$ is set to zero.

spilling factor is larger than the chosen threshold, the machine performs the FP calculation, otherwise the FP calculation is skipped.

The threshold for the spilling factor is set to 0.02 following Ref. [41]. For the Bayesian error, which exhibits a descriptor- and materials-dependent non-zero value, the threshold $\epsilon_{\mathrm{BE}}$ is automatically determined on the fly. The corresponding scheme is shown in the light gray square in Fig. 44 At the MD step $I$ just after the refinement of the force field (shown as the gray triangles in Fig. 3), the machine stores the maximum value $\sigma_{\max , I}$ of the Bayesian errors of the forces predicted for the new structure $I$. Because this new structure does not significantly differ from the structure sampled at the training step, the calculated Bayesian errors are nearly identical to the Bayesian errors on the previously sampled structure. Hence, this maximum Bayesian error $\sigma_{\text {max }, I}$ can be regarded as a measure of the lowest currently attainable Bayesian error and can provide a reasonable threshold for the future. In our al-

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-08_1172_712_176_257.jpg)
FIG. 5: Flowchart of the sparsification and data selection step. The symbol $K$ denotes the matrix comprised of the elements $K(i, j)$ defined as Eq. (14). The leverage scoring $\omega_{i}$ is calculated by Eq. (D5) in Appendix D.

gorithm, the threshold is updated to be the average of the last $10 \sigma_{\text {max }, I}$, if their relative standard deviation is smaller than 0.2 (empirically set). The dashed gray lines in Fig. 3 (b) illustrate the criteria determined by this on-the-fly scheme during the training on the MgO solid as an example.

## F. Sparsification and data selection

As previously explained, whenever the machine decides that for a specific structure insufficient information is stored in the machine, FP calculations are performed for that structure. To reduce the computational demands, the machine is not retrained after each FP calculation, but instead retraining is done typically after $n=5$ FP calculations or when the estimated errors are twice larger than the determined criteria. This allows to block many of the computationally expensive steps in the training. When $n$ FP calculations have been performed, the reference structure datasets and local reference configurations are selected, and the force field is refined. Figure 5
shows the flowchart corresponding to this data selection. As shown in the dark gray square, the data selection is done in a two step procedure. First, the machine selects those local configurations that exhibit Bayesian errors on forces and spilling factors that are larger than the threshold. Although this step is already a sparsification process, numerical instabilities sometimes occur because of the overcompleteness among the remaining local configurations. In order to avoid those numerical instabilities, another sparsification process is performed using a CUR algorithm $\underline{28,42}$. In our implementation, the machine examines correlations between the local configurations and eigenvalues of the matrix $K$ smaller than $10^{-10}$ using leverage scoring $\omega_{i}$. For details we refer to Appendix D. Starting from the largest $\omega_{i}$ in descending order, $N_{\text {low }}$ configurations are discarded, where $N_{\text {low }}$ denotes the number of the eigenvalues smaller than $10^{-10}$. Finally, as shown in the light gray square in Fig. 5, the machine discards those structure datasets that do not provide any local reference configurations to speed up the computations and to reduce the memory usage.

## III. TECHNICAL DETAILS OF MELTING POINT CALCULATIONS

## A. Training conditions

For each material, the local reference configurations and the datasets were collected during the MD simulations on solid, liquid and interfacial systems. The Al solid and liquid were modeled by unit cells with 108 atoms, and the Al interface was modeled by a unit cell with 144 atoms. For the other materials, solids and liquids were modeled by unit cells with 64 atoms, and the interfaces were modeled by unit cells with 128 atoms. A $3 \times 3 \times 3 \mathbf{k}$-point mesh was used for the Al solid and liquid, and a $3 \times 3 \times 2 \mathbf{k}$-point mesh was used for the Al interface. For the other materials, a $2 \times 2 \times 2$ mesh was used for the solids and liquids, and a $2 \times 2 \times 1$ mesh was used for the interfaces. Plane-wave basis sets and the projector augmented wave (PAW) method were used in all FP calculations. The PAW atomic reference configuration was $2 \mathrm{~s}^{2} 2 \mathrm{p}^{4}$ for $\mathrm{O}, 3 \mathrm{~s}^{2} 3 \mathrm{p}^{0}$ for $\mathrm{Mg}, 3 \mathrm{~s}^{2} 3 \mathrm{p}^{1}$ for $\mathrm{Al}, 3 \mathrm{~s}^{2} 3 \mathrm{p}^{2}$ for $\mathrm{Si}, 4 \mathrm{~s}^{2} 4 \mathrm{p}^{2}$ for Ge , and $5 \mathrm{~s}^{2} 5 \mathrm{p}^{2}$ for Sn . The planewave cutoff energy was set to $325,325,225,135$ and 520 eV for $\mathrm{Al}, \mathrm{Si}, \mathrm{Ge}, \mathrm{Sn}$ and MgO , respectively. Training was performed for several functionals: the local density approximation (LDA) in the parametrization of Ceperly and Alder ${ }^{43}$, the Perdew-Burke-Ernzerhof (PBE) functional ${ }^{44}$, its variant for solids (PBEsol) ${ }^{45}$ and the strongly constrained appropriately normed (SCAN) functional ${ }^{\underline{46}}$. For each material, the local reference configurations and the datasets were collected during the MD simulations on solid, liquid and interfacial systems. For each condition within all phases, the MD simulation was executed for 100 ps . The MD time step was set to 3 fs for all materials except for Ge and Sn , where the time step was

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-09_749_727_171_249.jpg)
FIG. 6: Mean absolute errors in the energy per atom (meVatom ${ }^{-1}$ ) (a), force ( $\mathrm{eV} \AA^{-1}$ ) and stress tensor (GPa) predicted by the force fields on 200 configurations of solids and liquids at the melting points.

set to 10 fs . Further details of the MD parameters and snapshots of the models are shown in Section S2 in the $\mathrm{SM}^{36}$.

## B. Efficiency and accuracy

During the on-the-fly force field generation, more than $99 \%$ of the FP calculations were skipped reducing the computational time by a factor of more than 200 . These accelerations allow the machine to efficiently collect reference configurations in a wide phase space. The details of the skipping ratio and the acceleration are summarized in Table S3 in the SM ${ }^{36}$.

The number of structures in the reference structure datasets is typically less than 500 , and the number of local reference configurations is less than 1000 as shown in Table S4 in the SM ${ }^{36}$. Both are much smaller than the reference configurations used in previous studies $11,15-19$. It should be mentioned though that we train our force fields essentially to the specific application, here liquids, solids and interfaces.

By the efficient sampling of the local reference configurations, MD simulations by the force fields are noticeably accelerated. Table S5 in the SM ${ }^{36}$ tabulates the elapsed time per MD step by the force fields and FP calculations. The force fields accelerate the MD simulations by factors of 2000 to 5000.

In addition to the significant acceleration of the computational speed, the adaptable reference datasets and flexible functional form allows for accurate predictions of the potential energy surfaces. The error analysis summarized in Fig. 6 indicates that the mean absolute errors (in
parentheses root mean square errors) in energies, forces and stress tensors are 5.5 (6.2) meVatom ${ }^{-1}$, 0.07 (0.09) $\mathrm{eV} \AA^{-1}$ and $0.18(0.27) \mathrm{GPa}$, on average, respectively.

## C. Interface pinning

The melting-point calculations are carried out using force fields and using the interface pinning method ${ }^{10}$. This method has shown to be able to accurately predict the melting temperature and pressure ${ }^{10}$. In the interface pinning method, an MD simulation with constant temperature and pressure $\underline{56.57}$ is carried out on a solid-liquid interface. During the MD simulation, a harmonic bias potential is added to the potential energy $U$ in order to constrain the order parameter $Q$ of the system to an intermediate order parameter $a$ between the solid and the liquid phases as

$$
U^{\prime}=U+\frac{\kappa}{2}(Q-a)^{2}
$$

where $\kappa$ is a force constant. From the mean force that keeps the order parameter close to $a$, the difference in the chemical potential $\Delta \mu$ between two phases is calculated as

$$
\Delta \mu=-\kappa\left(\langle Q\rangle^{\prime}-a\right) \frac{\Delta Q}{N_{\mathrm{a}}}
$$

where $\langle Q\rangle^{\prime}$ is the order parameter of the interfacial system averaged over the biased MD simulation. $\Delta Q$ is the difference in the order parameter between the solid and liquid. The melting temperature is determined as the point where $\Delta \mu$ becomes zero by using Newton's root finding method. As order parameters, the collective density proposed in Ref. [10] is adopted. Further details of the used parameters and interfacial systems are summarized in Section S4 in the SM ${ }^{36}$.

Once the melting temperature has been calculated, one can obtain the entropy of fusion $S_{\mathrm{ls}}$ from the difference in the enthalpy between two phases at the melting temperature. Furthermore, the slope of the melting curve $d T_{\mathrm{m}} / d p$ can be calculated as $S_{\mathrm{ls}} / V_{\mathrm{ls}}$ by the Clausius-Clapeyron relation, where $V_{\mathrm{ls}}$ denotes the volume difference between the liquid and solid. These thermodynamic properties were also evaluated and compared with previously reported values as well as experimental results.

Although the generated force fields are very precise, they necessarily deviate from the FP data as shown in Fig. 6. The effects of these errors on the melting points were also evaluated by thermodynamic perturbation theory. Details of the thermodynamic perturbation method are described in Ref. [15]. From both the liquid and solid trajectories obtained by 100 ps MD simulations with the MLFF at the calculated melting temperatures, 500-1000 structures are selected. FP calculations on the selected structures are performed, and the energy difference between the FP and ML potentials are used in thermodynamic perturbation theory. In these calculations, the

TABLE I: Melting temperatures (K) of $\mathrm{Al}, \mathrm{Si}, \mathrm{Ge}, \mathrm{Sn}$ and MgO . CORR and MLFF denote the results with and without the thermodynamic perturbation corrections, respectively. CORR- $3^{3}$ denotes the results for $\mathrm{Si}, \mathrm{Ge}$ and Sn with the thermodynamic perturbation using a $3 \times 3 \times 3 \mathrm{k}$-point mesh. Values in the parentheses indicate the uncertainties estimated by the block averaging method described in Refs. [47, 48]. Reference calculations with tight error tolerance and similar PAW potential are underlined.
|  | XC | MLFF | CORR | CORR- $3^{3}$ | DFT | Exp |  | XC | MLFF | CORR | DFT | Exp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $\overline{\mathrm{Si}}$ | LDA | 1207( 5) | 1298( 5) | 1283( 5) | $1350(100)^{a} 1300(50)^{e} 1241(20){ }^{f}$ | $1685(2)^{b}$ | Al | LDA | 918( 7) | 909( 8) | $890(20)^{c}$ | $933.47^{d}$ |
|  | PBE | 1409( 6) | 1431( 9) | 1450( 9) | $\underline{1449}(10)^{g}$ |  |  | PBE | 871( 8) | 837( 9) |  |  |
|  | PBEsol | 1145(10) | 1172(21) | 1213(21) |  |  |  | PBEsol | 986( 5) | 954( 6) | $985(30)^{f}$ |  |
|  | SCAN | 1786( 7) | 1825( 7) | 1833( 7) | $\underline{1842}(10)^{g}$ |  |  | SCAN | 1017(12) | 981(16) |  |  |
| Ge | LDA | 814( 7) | 814( 9) | 841( 9) |  | $1210.4^{\circ}$ | MgO | LDA | 3165(20) | 3243(21) |  | $3040(100)^{h}$ |
|  | PBE | 843( 5) | 876( 5) | 893( 5) |  |  |  | PBE | 2652(20) | 2698(23) | $\underline{2747}(34)^{i}$ | 3250( 25$)^{j}$ |
|  | PBEsol | 758( 8) | 759( 8) | 792( 8) |  |  |  | PBEsol | 2916(19) | 2981(20) |  |  |
|  | SCAN | 1060( 2) | 1065( 3) | 1081( 3) |  |  |  | SCAN | 3079(23) | 3072(25) | $\underline{3032}(54)^{i}$ |  |
| Sn | SCAN | 468(11) | 459(13) | 459(13) |  | $505^{k}$ |  |  |  |  |  |  |
|  | ${ }^{a}$ Data from Ref. [1]. |  |  | ${ }^{b}$ Data from Ref. [49]. |  | ${ }^{c}$ |  | Data from Ref. [2]. |  | ${ }^{d}$ Data from Ref. [50]. |  |  |
|  | ${ }^{e}$ Data from Ref. 3 . |  |  | ${ }^{f}$ Data from Ref. [10]. |  |  |  |  |  |  |  |  |
|  | ${ }^{g}$ Data from Ref. [51] |  |  |  | using the same PAW and $3 \times 3 \times 3 \times \mathbf{k}$-points. |  |  |  |  |  | ${ }^{h}$ Data from Ref. 52]. |  |
|  | ${ }^{i}$ Data from Ref. [53] |  | using $2 \mathrm{p}^{6} 3 \mathrm{~s}^{2}$ | PAWs for Mg. |  | ${ }^{j}$ |  | Data from Ref. | 54]. |  | ${ }^{k}$ Data from Ref. [55] |  |


same supercells and $\mathbf{k}$-points as for the training simulations are employed. For Si , Ge and Sn , we also performed thermodynamic perturbation theory to $3 \times 3 \times 3 \mathrm{k}$-points in order to obtain more accurate results and, for Si , to allow for direct comparison with previous literature values ${ }^{51}$.

## IV. RESULTS: MELTING POINTS

Table 1 summarizes the melting points $T_{\mathrm{m}}$ of Al, Si, Ge , Sn and MgO with and without the thermodynamic perturbation corrections. The entropy of fusion, volume change and slopes of the melting curves calculated by the force fields are summarized in Tables II. The uncorrected melting temperatures of Al (LDA and PBEsol), Si (LDA, PBE and SCAN) and MgO (PBE and SCAN) already agree well with the reported DFT results. The thermodynamic perturbation corrections improve the agreement further. We observe that the perturbational corrections (difference between MLFF and CORR in Table 1) are more strongly correlated with the errors in the total energy than with the errors in forces and the stress tensor, indicating that accurate predictions of the total energies are essential for the predictions of the melting points. For Si (LDA and PBE) and MgO (PBE and SCAN), the entropies of fusion, volume changes at the phase transition temperature and slopes of the melting curves also agree well with the recently published reference values 51,53 . These results also indicate that our on-the-fly scheme can efficiently generate force fields applicable to the quantitative predictions of thermodynamic properties.

Comparison of the theoretical melting points with the experimental results indicates that LDA significantly underestimates the melting point of Si . PBE improves the

![](./images/ba44454d-8ced-4c27-9748-c504ecc43660-10_581_723_1102_1164.jpg)
FIG. 7: Melting point $T_{\mathrm{m}}$ calculated by the interface pinning method using the machine learning force fields and the thermodynamic perturbation corrections vs. the energy difference $\Delta E$ between the $\alpha$ - and $\beta$-tin structures obtained from DFT calculations at $0 \mathrm{~K} . \Delta E$ is defined to be negative when the $\alpha$-tin structure is more stable than the $\beta$-tin structure.

calculated value, but the melting point is still too low compared to experiment. SCAN, while slightly overestimating the melting point, provides the best agreement with experiment. The worst agreement compared with experiment is obtained by PBEsol, which strongly underestimates the melting point. The trend among PBE, PBEsol and SCAN for Ge is similar to that observed for Si , with the only exception that now even SCAN underestimates the melting point.

As opposed to Si and Ge , Sn crystallizes in the $\beta$ tin structure. For Sn, PBE and PBEsol do not provide a stable solid within a reasonable temperature range

TABLE II: Entropies of fusion, $S_{\mathrm{ls}}\left(k_{\mathrm{B}}\right)$, volumetric changes, $\Delta V_{\mathrm{m}}=V_{1}-V_{s}\left(\AA^{3}\right.$ atom $\left.^{-1}\right)$, or its relative value to the volume of solid, $V_{\mathrm{s}}$, and slopes of the melting curves $d T_{\mathrm{m}} / d p\left(\mathrm{KGPa}^{-1}\right)$ for $\mathrm{Al}, \mathrm{Si}, \mathrm{Ge}, \mathrm{Sn}$ and MgO . Errors in our results are within $\pm 0.03$ ( $k_{\mathrm{B}}$ ) for $S_{\mathrm{ls}}, \pm 0.02\left(\AA^{3}\right.$ atom $\left.^{-1}\right)$ for $\Delta V_{\mathrm{m}}, \pm 0.003$ for $\Delta V_{\mathrm{m}} / V_{\mathrm{s}}$ and $\pm 3\left(\mathrm{KGPa}^{-1}\right)$ for $d T_{\mathrm{m}} / d p$. Recent reference calculations with tight error tolerance and similar PAW potential are underlined.
| Property | XC | MLFF | DFT | Exp | Property | XC | MLFF | DFT | Exp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $S_{\mathrm{ls}}$ | LDA | 3.18 | $3.0^{a}, 3.5^{b}, 3.5^{c}$ | $3.3^{d}$ | Al $\quad S_{\text {ls }}$ | LDA | 1.31 | $1.36^{e}$ | $1.38^{f}$ |
|  | PBE | 3.36 | $\underline{3.3}^{g}$ | $3.6{ }^{h}$ |  | PBE | 1.33 |  |  |
|  | PBEsol | 3.13 |  |  |  | PBEsol | 1.27 |  |  |
|  | SCAN | 3.47 | $3.3^{g}$ |  |  | SCAN | 1.25 |  |  |
| $\Delta V_{l s} / V_{s}$ <br> $d T_{\mathrm{m}} / d p$ | LDA | -0.151 | $-0.10^{a},-0.142^{b}$ | $-0.119^{i}$ | $\Delta V_{\mathrm{ls}}$ | LDA | 1.20 | $1.26^{e}$ | $1.24^{e}$ |
|  | PBE | -0.128 | $-0.120^{g}$ | $-0.095^{d}$ |  | PBE | 1.11 |  |  |
|  | PBEsol | -0.172 |  |  |  | PBEsol | 1.25 |  |  |
|  | SCAN | -0.089 | $-0.091^{g}$ |  |  | SCAN | 1.11 |  |  |
|  | LDA | -69 | $-50^{a},-58^{b},-51^{c}$ | $-38^{k}$ | $d T_{\mathrm{m}} / d p$ | LDA | 67 |  | $65^{j}$ |
|  | PBE | -57 | $-55^{g}$ |  |  | PBE | 68 |  |  |
|  | PBEsol | -81 |  |  |  | PBEsol | 63 |  |  |
|  | SCAN | -38 | $-40^{g}$ |  |  | SCAN | 64 |  |  |
| $S_{\mathrm{ls}}$ | LDA | 3.30 |  | $3.7^{k}$ | $\mathrm{MgO} S_{\text {ls }}$ | LDA | 1.58 |  |  |
|  | PBE | 3.50 |  |  |  | PBE | 1.57 | $\underline{1.62}^{l}$ |  |
|  | PBEsol | 3.38 |  |  |  | PBEsol | 1.57 |  |  |
|  | SCAN | 3.53 |  |  |  | SCAN | 1.50 | $\underline{1.70}^{l}$ |  |
| $\Delta V_{\mathrm{m}} / V_{\mathrm{s}}$ | LDA | -0.124 |  | $-0.055^{m}$ | $\Delta V_{\mathrm{m}} / V_{\mathrm{s}}$ | LDA | 0.254 |  |  |
|  | PBE | -0.111 |  |  |  | PBE | 0.297 | $\underline{0.305}^{l}$ |  |
|  | PBEsol | -0.125 |  |  |  | PBEsol | 0.267 |  |  |
|  | SCAN | -0.091 |  |  |  | SCAN | 0.269 | $\underline{0.291}^{l}$ |  |
| $d T_{\mathrm{m}} / d p$ | LDA | -63 |  | $-20^{k}$ | $d T_{\mathrm{m}} / d p$ | LDA | 123 |  |  |
|  | PBE | -57 |  | $-38^{m}$ |  | PBE | 153 | $\underline{153}^{l}$ |  |
|  | PBEsol | -63 |  |  |  | PBEsol | 137 |  |  |
|  | SCAN | -44 |  |  |  | SCAN | 140 | $\underline{134^{l}}$ |  |
| Sn | SCAN | 1.81 |  | $1.7^{h}$ |  |  |  |  |  |
| $\Delta V_{\mathrm{m}} / V_{\mathrm{s}}$ | SCAN | 0.039 |  | $0.023{ }^{h}$ |  |  |  |  |  |
| $d T_{\mathrm{m}} / d p$ | SCAN | 45 |  | $27^{n}$ |  |  |  |  |  |
| ${ }^{a}$ Data from Ref. | 1]. |  | ${ }^{b}$ Data from Ref. 3]. |  | ${ }^{c}$ Data from Ref. 10]. | ${ }^{d}$ Data from Ref. [58]. |  |  |  |
| ${ }^{e}$ Data from Ref. | 2 ]. |  | ${ }^{f}$ Data from Ref. [59]. |  | ${ }^{g}$ Data from Ref. [51]. |  | ${ }^{h}$ Data from Ref. [55]. |  |  |
| ${ }^{i}$ Data from Ref. | 60 . |  | ${ }^{j}$ Data from Ref. [61]. |  | ${ }^{k}$ Data from Ref. [49]. |  | ${ }^{l}$ Data from Ref. [53]. |  |  |
| ${ }^{m}$ Data from Ref. 62]. |  |  |  |  |  |  |  |  |  |
| ${ }^{n}$ The melting curve of tin was calculated from the volume of $\beta$-tin at 453 K reported in Ref. [63], the volume change by the fusion written in Ref. [64], and the heat of fusion and melting temperature reported in Ref. [55]. |  |  |  |  |  |  |  |  |  |


compared to experiment; the melting point seems to be placed at way too low temperatures. Hence, the melting point of Sn has only be determined for SCAN, which still underestimates the melting temperature. As shown in Fig. 7, the observed trend among different functionals and materials can be reasonably well correlated to the energy difference between the $\alpha$-tin (the cubic diamond structure) and the $\beta$-tin structures. A similar correlation was already observed in the melting point studies of Si in previous publications ${ }^{3,51}$, where the trends in the melting points among different functionals were well described by the trends in the energy differences. This is because the energy and structure of liquid Si and Ge can be qualitatively described by the six-fold coordinated structure observed in the $\beta$-tin structure. The results summarized in Fig. 7 indicate that this empirical rule is also roughly applicable to Ge . For Ge , the energy difference between
the $\alpha$-tin and $\beta$-tin structure is significantly smaller, and thus, its melting temperature is lower than that of Si . In the case of Sn , the $\alpha$-tin structure is less stable than the $\beta$-tin structure, and melting is obviously from the $\beta$-tin structure itself. This implies that the energy difference between both structures might not have a direct relevance for the melting temperature, nevertheless, the linear relation between the melting temperature and energy difference still seems to apply approximately.

For Al, LDA, PBEsol and SCAN closely reproduce the experimental melting point while PBE underestimates it. Similarly for MgO , LDA, PBEsol and SCAN reproduce the experimental melting point well while PBE underestimates it.

In summary, SCAN is judged to provide the most balanced accuracy within the tested functionals for thermodynamic properties of metallic, covalent and ionic materi-
als. Semilocal functionals always yield lower melting temperatures, but whether LDA, PBEsol or PBE performs better is not a priori clear. For the tetrahedrally coordinated semiconductors LDA and PBEsol are worse (obviously they underbind the diamond structure), whereas for densely packed materials such as Al , the melting temperature is increased towards the experiment. Since LDA and PBEsol increase the binding energy on average, an increase of the melting temperature for phase transitions where the local structure changes little is in line with what one would expect.

## V. CONCLUSION

An on-the-fly MLFF generation method has been developed and integrated into an electronic structure code. In the developed method, the machine predicts not only the energy, forces and the stress tensor but also the uncertainty on the basis of Bayesian inference. The predicted error is used to decide whether FP calculations are required or can be bypassed. This error estimation and decision scheme enhances the self-learning ability in the MLFF generation and dramatically reduces the need for human intervention and supervision. The developed method was applied to the calculation of melting points of $\mathrm{Al}, \mathrm{Si}, \mathrm{Ge}, \mathrm{Sn}$ and MgO . The application demonstrates that the on-the-fly method indeed enables the efficient generation of accurate MLFFs for metallic, covalent and ionic materials. The MD simulations are more than two orders of magnitude accelerated by the on-the-fly scheme even during learning. Furthermore, for large unit cells, the generated force fields are more than three orders of magnitude faster for MD simulations than FP calculations. This made it possible to calculate the melting points of five materials using the interface pinning method in a fraction of the compute time that would have been required without ML. The melting temperatures predicted by the MLFFs already agree well with the FP results, but it is straightforward and involves only little overhead to employ thermodynamic perturbation theory and correct for the remaining errors. Our on-thefly method is universally applicable to a wide variety of multi-element complex materials. We believe that this has the potential to become a new working paradigm in the materials science community.

Concerning melting temperatures, we observe that the SCAN functional is clearly a step forward in accurate predictions compared to experiments. SCAN consistently outperforms the semi-local functionals tested in the present work. A general trend between the semi-local functionals can not be made out. For Al , where the local structure remains 12 -fold coordinated upon melting, the melting temperature increases from PBE over LDA to PBEsol towards experiment, in line with the increased cohesive energies predicted by PBEsol and LDA. For Si and Ge , however, the melting temperature decreases from PBE over LDA to PBEsol away from experiment. This
trend is related to a destabilization of the cubic diamond structure by PBEsol. Clearly, melting temperatures are a tough test for the performance of density functionals, and only SCAN is quite satisfactory in this regard.

## Acknowledgments

All authors gratefully thank Ryoji Asahi for his many suggestions on the application and use of machinelearning methods to materials sciences.

## Appendix A: Radial basis functions

The number of the radial basis functions $N_{\mathrm{R}}^{l}$ is automatically determined such that a linear combination of the radial basis functions reproduces the radial functions $f_{l m}\left(r, r_{i j}\right)$ with a predefined accuracy. The functions $f_{l m}\left(r, r_{i j}\right)$ are obtained by expanding the broadened atomic distribution $\rho_{i}$ [see Eqs. (3) and (2)] in products of spherical harmonics and the radial functions as

$$
\begin{aligned}
\rho_{i}(\mathbf{r}) & =\sum_{l=0}^{L_{\text {max }}} \sum_{m=-l}^{l} \sum_{j=1}^{N_{\mathrm{a}}} f_{l m}\left(r, r_{i j}\right) Y_{l m}^{*}\left(\hat{\mathbf{r}}_{i j}\right) Y_{l m}(\hat{\mathbf{r}}), \\
f_{l m}\left(r, r_{i j}\right) & =\frac{4 \pi}{\left(\sqrt{2 \sigma_{\text {atom }}^{2} \pi}\right)^{3}} f_{\mathrm{cut}}\left(r_{i j}\right) \\
& \times \exp \left(-\frac{r^{2}+r_{i j}^{2}}{2 \sigma_{\text {atom }}^{2}}\right) \iota_{l}\left(\frac{r r_{i j}}{\sigma_{\text {atom }}^{2}}\right) .
\end{aligned}
$$

To derive this equation, the following theorem has been used:

$$
\begin{aligned}
\exp \left(\frac{-\left|\mathbf{r}-\mathbf{r}_{i j}\right|^{2}}{2 \sigma_{\text {atom }}^{2}}\right) & =4 \pi \exp \left(-\frac{r^{2}+r_{i j}^{2}}{2 \sigma_{\text {atom }}^{2}}\right) \\
& \times \sum_{l=0}^{L_{\text {max }}} \sum_{m=-l}^{l} l_{l}\left(\frac{r r_{i j}}{\sigma_{\text {atom }}^{2}}\right) \\
& \times Y_{l m}^{*}\left(\hat{\mathbf{r}}_{i j}\right) Y_{l m}(\hat{\mathbf{r}})
\end{aligned}
$$

The radial part is expanded in a set of radial basis functions $\chi_{n l}(r)=j_{l}\left(q_{n l} r\right)$ as:

$$
\sum_{j=1}^{N_{\mathrm{a}}} f_{l m}\left(r, r_{i j}\right)=\sum_{n=1}^{N_{\mathrm{R}}^{l}} c_{n l m}^{i} \chi_{n l}(r)
$$

Here the parameters $q_{n l}$ are set such that $j_{l}\left(q_{n l} R_{\text {cut }}\right)=0$. The number of the radial basis functions $N_{\mathrm{R}}^{l}$ is determined to satisfy Eq. (A4) within a desired precision. In our implementation, in advance of the MD simulation, the radial function $f_{l m}\left(r, r_{i j}\right)$ is calculated using Eq. (A2) on 100 radial grid points for $r$ ranging from 0 to $R_{\text {cut }}$ and
$r_{i j}$ ranging from $0.5 \AA$ to $R_{\text {cut }}$. The number of radial basis functions $N_{\mathrm{R}}^{l}$ is determined to reproduce the original values of $f_{l m}\left(r, r_{i j}\right)$ within an error of $\pm 0.02$. This means that the width of the broadening $\sigma_{\text {atom }}$ in Eq. (2) alone determines the number of basis functions.

## Appendix B: Assumptions necessary for deriving the posterior distributions

The formulation of the posterior distributions $p(\mathbf{w} \mid \mathbf{Y})$ and $p(\mathbf{y} \mid \mathbf{Y})$ starts from two assumptions:
i) The FP data vector $\mathbf{y}^{\alpha}$ deviates from the model vector $\phi^{\alpha} \mathbf{w}$. The distribution of the deviation is assumed to be described by a Gaussian function with a covariance matrix of $\sigma_{\mathrm{v}}^{2} \mathbf{I}$ :

$$
p(\mathbf{Y} \mid \mathbf{w})=\mathcal{N}\left(\mathbf{\Phi} \mathbf{w}, \sigma_{\mathrm{v}}^{2} \mathbf{I}\right)
$$

$p(\mathbf{Y} \mid \mathbf{w})$ denotes the probability to observe the FP data $\mathbf{Y}$ after the determination of the coefficients $\mathbf{w}$.
ii) The prior probability to find the vector $\mathbf{w}$ is assumed to be described by a Gaussian distribution with a mean vector at zero and a covariance matrix of $\sigma_{\mathrm{w}}^{2} \mathbf{I}$ :

$$
p(\mathbf{w})=\mathcal{N}\left(\mathbf{0}, \sigma_{\mathrm{w}}^{2} \mathbf{I}\right)
$$

On the basis of these two assumptions and the Bayesian theorem, the posterior distribution $p(\mathbf{w} \mid \mathbf{Y})$ is derived as

$$
\begin{aligned}
& p(\mathbf{w} \mid \mathbf{Y})=\frac{p(\mathbf{Y} \mid \mathbf{w}) p(\mathbf{w})}{p(\mathbf{Y})} \\
& p(\mathbf{Y})=\int p(\mathbf{Y} \mid \mathbf{w}) p(\mathbf{w}) d \mathbf{w}
\end{aligned}
$$

The equation can be converted to the Gaussian distribution written as Eq. (25) by the completing square method ${ }^{37}$. From this posterior distribution, another posterior distribution $p(\mathbf{y} \mid \mathbf{Y})$ is obtained as

$$
p(\mathbf{y} \mid \mathbf{Y})=\int p(\mathbf{y} \mid \mathbf{w}) p(\mathbf{w} \mid \mathbf{Y}) d \mathbf{w}
$$

Similarly to $p(\mathbf{w} \mid \mathbf{Y})$, this distribution can be converted to a Gaussian distribution specified in Eq. (29) ${ }^{37}$.

## Appendix C: Maximization of evidence function

The maximization of the evidence function Eq. (31) with respect to the parameters $\sigma_{\mathrm{v}}^{2}$ and $\sigma_{\mathrm{w}}^{2}$ is carried out by simultaneously solving the following equations derived from $\partial p / \partial \sigma_{\mathrm{v}}^{2}=\partial p / \partial \sigma_{\mathrm{w}}^{2}=0$ (see Ref.[37]):

$$
\begin{aligned}
\sigma_{\mathrm{w}}^{2} & =\frac{|\overline{\mathbf{w}}|^{2}}{\gamma} \\
\sigma_{\mathrm{v}}^{2} & =\frac{|\mathbf{T}-\boldsymbol{\phi} \overline{\mathbf{w}}|^{2}}{M-\gamma} \\
\gamma & =\sum_{k=1}^{N_{\mathrm{B}}} \frac{\lambda_{k}}{\lambda_{k}+1 / \sigma_{\mathrm{w}}^{2}}
\end{aligned}
$$

Here $\lambda_{k}$ are the eigenvalues of the matrix $\boldsymbol{\Phi}^{\mathrm{T}} \boldsymbol{\Phi} / \sigma_{\mathrm{v}}^{2}$. As described in Ref. [40], if all eigenvalues are used in the actual computations of Eqs. (C1), (C2) and (C3), numerical instabilities happen because the non-regularized matrix $\boldsymbol{\Phi}^{\mathrm{T}} \boldsymbol{\Phi} / \sigma_{\mathrm{v}}^{2}$ can become non-positive definite. In order to avoid this problem, eigenvalues smaller than $10^{-10}$ are excluded from the calculations.

## Appendix D: CUR algorithm

In the following, we denote the element $K(i, j)$ in Eq. (13) as $K_{i j}$ and the matrix comprised of $K_{i j}$ for all candidates of the local reference configurations as $\mathbf{K}$ (both the column and row dimensions of $\mathbf{K}$ are equal to the number of the candidates). The formulation of the CUR algorithm starts from the diagonalization of the matrix $\mathbf{K}$.

$$
\mathbf{U}^{\mathrm{T}} \mathbf{K U}=\mathbf{L}=\operatorname{diag}\left(l_{1}, \ldots, l_{N_{\mathrm{B}}}\right)
$$

where $\mathbf{U}$ is the eigenvector matrix defined as

$$
\begin{aligned}
\mathbf{U} & =\left(\mathbf{u}_{1}, \ldots, \mathbf{u}_{N_{\mathrm{B}}}\right) \\
\mathbf{u}_{j}^{\mathrm{T}} & =\left(u_{1 j}, \ldots, u_{N_{\mathrm{B}} j}\right)
\end{aligned}
$$

By using the notations in Eq. (D2), Eq. (D1) can be rewritten as follows

$$
\mathbf{k}_{j}=\sum_{\xi=1}^{N_{\mathrm{B}}}\left(u_{j \xi} l_{\xi}\right) \mathbf{u}_{\xi}
$$

where $\mathbf{k}_{j}$ denotes the $j$ th column vector of the matrix $\mathbf{K}$. In the original CUR algorithm ${ }^{42}$, the columns of the matrix $\mathbf{K}$ are maintained when they are strongly correlated to the eigenvectors $\mathbf{u}_{\xi}$ with large eigenvalues $l_{\xi}$. This algorithm was originally developed to efficiently select a few significant local reference configurations from many configurations. However, in our on-the-fly force field generation, we need an efficient algorithm that can select few insignificant configurations, because the number of configurations discarded by the sparsification is usually small. To this end, we have modified the algorithm. In our implementation, we dispose of those columns of $\mathbf{K}$ that are strongly correlated with the $N_{\text {low }}$ eigenvectors $\mathbf{u}_{\xi}$ with the small eigenvalues $l_{\xi}$. The local configurations corresponding to those columns are disregarded. Similarly to the original CUR algorithm, the correlation is measured by the statistical leverage scoring determined for each column of $\mathbf{K}$ as

$$
\begin{aligned}
\omega_{j} & =\frac{1}{N_{\mathrm{low}}} \sum_{\xi=1}^{N_{\mathrm{B}}} \gamma_{\xi j} \\
\gamma_{\xi j} & = \begin{cases}u_{j \xi}^{2}, & \text { if } l_{\xi}<10^{-10} \\
0, & \text { otherwise }\end{cases}
\end{aligned}
$$

${ }^{1}$ O. Sugino and R. Car, Phys. Rev. Lett. 74, 1823 (1995).
${ }^{2}$ G. A. de Wijs, G. Kresse, and M. J. Gillan, Phys. Rev. B 57, 8223 (1998).
${ }^{3}$ D. Alfè and M. J. Gillan, Phys. Rev. B 68, 205212 (2003).
${ }^{4}$ A. Ladd and L. Woodcock, Chemical Physics Letters 51, 155 (1977).
${ }^{5}$ U. Landman, W. D. Luedtke, R. N. Barnett, C. L. Cleveland, M. W. Ribarsky, E. Arnold, S. Ramesh, H. Baumgart, A. Martinez, and B. Khan, Phys. Rev. Lett. 56, 155 (1986).
${ }^{6}$ P. M. Agrawal, B. M. Rice, and D. L. Thompson, The Journal of Chemical Physics 119, 9617 (2003).
${ }^{7}$ J. R. Morris and X. Song, The Journal of Chemical Physics 116, 9352 (2002).
${ }^{8}$ J. J. Hoyt and M. Asta, Phys. Rev. B 65, 214106 (2002).
${ }^{9}$ R. Garca Fernndez, J. L. F. Abascal, and C. Vega, The Journal of Chemical Physics 124, 144506 (2006).
${ }^{10}$ U. R. Pedersen, F. Hummel, G. Kresse, G. Kahl, and C. Dellago, Phys. Rev. B 88, 094101 (2013).
${ }^{11}$ J. Behler and M. Parrinello, Phys. Rev. Lett. 98, 146401 (2007).
${ }^{12}$ A. P. Bartók, M. C. Payne, R. Kondor, and G. Csányi, Phys. Rev. Lett. 104, 136403 (2010).
${ }^{13}$ A. P. Bartók, J. Kermode, N. Bernstein, and G. Csányi, Phys. Rev. X 8, 041048 (2018).
${ }^{14}$ L. Bonati and M. Parrinello, Phys. Rev. Lett. 121, 265701 (2018).
$15^{15}$ T. Morawietz, A. Singraber, C. Dellago, and J. Behler, Proceedings of the National Academy of Sciences 113, 8368 (2016).
${ }^{16}$ V. L. Deringer, N. Bernstein, A. P. Bartók, M. J. Cliffe, R. N. Kerber, L. E. Marbella, C. P. Grey, S. R. Elliott, and G. Csányi, The Journal of Physical Chemistry Letters 9, 2879 (2018).
${ }^{17}$ N. Artrith and A. Urban, Computational Materials Science 114, 135 (2016).
${ }^{18}$ S. Chiriki, S. Jindal, and S. Bulusu, The Journal of Chemical Physics 146, 84314 (2017).
${ }^{19}$ S. Faraji, S. A. Ghasemi, S. Rostami, R. Rasoulkhani, B. Schaefer, S. Goedecker, and M. Amsler, Phys. Rev. B 95, 104105 (2017).
${ }^{20}$ Z. Li, J. R. Kermode, and A. De Vita, Phys. Rev. Lett. 114, 096405 (2015).
${ }^{21}$ K. Miwa and H. Ohno, Phys. Rev. Materials 1, 053801 (2017).
${ }^{22}$ T. L. Jacobsen, M. S. Jørgensen, and B. Hammer, Phys. Rev. Lett. 120, 026102 (2018).
${ }^{23}$ R. Jinnouchi, J. Lahnsteiner, F. Karsai, G. Kresse, and M. Bokdam, arXiv:1903.09613.
${ }^{24}$ G. Kresse and J. Furthmüller, Phys. Rev. B 54, 11169 (1996).
${ }^{25}$ G. Kresse and J. Furthmller, Computational Materials Science 6, 15 (1996).
${ }^{26}$ A. P. Bartók, R. Kondor, and G. Csányi, Phys. Rev. B 87, 184115 (2013).
${ }^{27}$ W. J. Szlachta, A. P. Bartók, and G. Csányi, Phys. Rev. B 90, 104108 (2014).
${ }^{28}$ V. L. Deringer and G. Csányi, Phys. Rev. B 95, 094203 (2017).
${ }^{29}$ A. P. Bartók, S. De, C. Poelking, N. Bernstein, J. R. Kermode, G. Csányi, and M. Ceriotti, Science Advances 3,
e1701816 (2017).
${ }^{30}$ A. P. Bartók, Ph.D. thesis, University of Cambridge (2009).
${ }^{31}$ K. Gubaev, E. V. Podryabinkin, and A. V. Shapeev, The Journal of Chemical Physics 148, 241727 (2018).
${ }^{32}$ K. Gubaev, E. V. Podryabinkin, G. L. Hart, and A. V. Shapeev, Computational Materials Science 156, 148 (2019).

33 A. Glielmo, C. Zeni, and A. De Vita, Phys. Rev. B 97, 184307 (2018).
${ }^{34}$ L. Nachbin and L. Bechtolsheim, The Haar Integral (Princeton, N. J., Van Nostrand, 1965).
${ }^{35}$ M. J. Willatt, F. Musil, and M. Ceriotti, Phys. Chem. Chem. Phys. 20, 29661 (2018).
${ }^{36}$ See Supplemental Material [url] for a detailed description of the applied computational techniques and settings.
${ }^{37}$ C. M. Bishop, Pattern Recognition and Machine Learning (Information Science and Statistics) (Springer, New York, 2006).
${ }^{38}$ S. F. Gull and J. Skilling, Maximum Entropy Bayesian Methods. Fundam. Theor. Phys., 28th ed. (Springer, Dordrecht, 1989).
${ }^{39}$ D. J. C. MacKay, Neural Computation 4, 415 (1992).
${ }^{40}$ R. Jinnouchi and R. Asahi, Journal of Physical Chemistry Letters 8, 4279 (2017).
${ }^{41}$ K. Miwa and H. Ohno, Phys. Rev. B 94, 184109 (2016).
${ }^{42}$ M. W. Mahoney and P. Drineas, Proceedings of the National Academy of Sciences 106, 697 (2009).
${ }^{43}$ D. M. Ceperley and B. J. Alder, Phys. Rev. Lett. 45, 566 (1980).
${ }^{44}$ J. P. Perdew, K. Burke, and M. Ernzerhof, Phys. Rev. Lett. 77, 3865 (1996).
${ }^{45}$ J. P. Perdew, A. Ruzsinszky, G. I. Csonka, O. A. Vydrov, G. E. Scuseria, L. A. Constantin, X. Zhou, and K. Burke, Phys. Rev. Lett. 100, 136406 (2008).
${ }^{46}$ J. Sun, A. Ruzsinszky, and J. P. Perdew, Phys. Rev. Lett. 115, 036402 (2015).
${ }^{47}$ in Understanding Molecular Simulation (Second Edition), edited by D. Frenkel and B. Smit (Academic Press, San Diego, 2002), pp. 525-532, second edition ed.
${ }^{48}$ M. P. Allen and D. J. Tildesley, Computer Simulation of Liquids (Oxford University Press, Inc., New York, NY, USA, 2017), 2nd ed.
${ }^{49}$ D. Bimberg, R. Blachnik, M. Cardona, P. J. Dean, T. Grave, G. Harbeke, K. Hübner, U. Kaufmann, W. Kress, O. Madelung, et al., Physics of Group IV Elements and III-V Compounds / Physik der Elemente der IV. Gruppe und der III-V Verbindungen (Springer, Berlin, 1981).
${ }^{50}$ R. Lide, CRC Handbook of Chemistry and Physics, 74th ed. (CRC, Boca Raton, 1994).
${ }^{51}$ F. Dorner, Z. Sukurma, C. Dellago, and G. Kresse, Phys. Rev. Lett. 121, 195701 (2018).
${ }^{52}$ A. Zerr and R. Boehler, Nature 371, 506 (1994).
${ }^{53}$ M. Rang and G. Kresse, arXiv:1902.08119.
${ }^{54}$ C. Ronchi and M. Sheindlin, Journal of Applied Physics 90, 3325 (2001).
${ }^{55}$ O. Barin, O. K. I.and Knacke, Thermochemical Properties of Inorganic Substances (Springer, Berlin, 1973).
${ }^{56}$ M. Parrinello and A. Rahman, Phys. Rev. Lett. 45, 1196 (1980).
${ }^{57}$ M. Parrinello and A. Rahman, Journal of Applied Physics 52, 7182 (1981).
58 A. R. Ubbelohde, The Molten State of Matter (Wiley, New York, 1978).
${ }^{59}$ M. W. Chase, C. A. Davies, J. R. Downey, D. J. Frurip, M. R. A., and A. N. Syverud, J. Phys. Chem. Ref. Data Suppl. 14, 1 (1985).
${ }^{60}$ J. Gabathuler and S. Steeb, Zeitschrift fur Naturforschung - Section A Journal of Physical Sciences 34, 1314 (1979).
${ }^{61}$ J. F. Cannon, Journal of Physical and Chemical Reference Data 3, 781 (1974).
62 A. Jayaraman, W. Klement, and G. C. Kennedy, Phys. Rev. 130, 540 (1963).
${ }^{63}$ E. A. Brandes, Smihells Metals Reference Book, 6th ed. (Butterworths, London, 1983).
${ }^{64}$ P. G. Harrison, Chemistry of Tin (Blackie, Glasgow, 1989).

