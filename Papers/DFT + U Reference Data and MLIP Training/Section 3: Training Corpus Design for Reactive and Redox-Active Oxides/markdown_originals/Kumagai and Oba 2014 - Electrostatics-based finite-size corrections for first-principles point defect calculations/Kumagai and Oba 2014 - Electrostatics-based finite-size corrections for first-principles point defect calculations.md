# Electrostatics-based finite-size correction for first-principles point defect calculations

Yu Kumagai ${ }^{1, *}$ and Fumiyasu Oba ${ }^{1,2}$<br>${ }^{1}$ Materials Research Center for Element Strategy, Tokyo Institute of Technology, Yokohama 226-8503, Japan<br>${ }^{2}$ Department of Materials Science and Endineering, Kyoto University, Kyoto 606-8501, Japan

(Dated: February 7, 2014)


#### Abstract

Finite-size corrections for charged defect supercell calculations typically consist of image-charge and potential alignment corrections. A wide variety of schemes for both corrections have been proposed for decades. Regarding the image-charge correction, Freysoldt, Neugebauer, and Van de Walle (FNV) recently proposed a novel method that enables us to accurately estimate the correction energy a posteriori through alignment of the defect-induced potential to the model charge potential [C. Freysoldt, J. Neugebauer, and C. G. Van de Walle, Phys. Rev. Lett. 102, 016402 (2009).] This method, however, still has two issues in practice. Firstly, it uses planar-averaged electrostatic potential for determining the potential offset, which cannot be readily applied to relaxed atomic structure. Secondly, the long-range Coulomb interaction is assumed to be screened by a macroscopic dielectric constant. This is valid only for cubic systems and can bring forth huge errors for defects in anisotropic materials, particularly with layered and low-dimensional structures. In the present study, we use the atomic site electrostatic potential as a potential marker instead of the planar-averaged potential, and extend the FNV scheme by adopting the point charge model in an anisotropic medium for estimating long-range interactions. We also revisit the conventional potential alignment correction and show that it is fully included in the image-charge correction and therefore unnecessary. In addition, we show that the potential alignment corresponds to a part of first-order and full of third-order image-charge correction; thus the third-order imagecharge contribution is absent after the potential alignment. Finally, a systematic assessment of the accuracy of the extended FNV correction scheme is performed for a wide range of material classes: $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}, \mathrm{ZnO}, \mathrm{MgO}$, corundum $\mathrm{Al}_{2} \mathrm{O}_{3}$, monoclinic $\mathrm{HfO}_{2}$, cubic and hexagonal BN, Si, GaAs, and diamond. The defect formation energies with -6 to +3 charges calculated using around 100-atom supercells are successfully corrected even after atomic relaxation within a few tenths of eV compared to those in the dilute limit.


PACS numbers: 61.72.J-, 61.72.-y, 71.15.Mb, 71.55.-i

## I. INTRODUCTION: FIRST-PRINCIPLES CALCULATIONS OF POINT DEFECTS AND THEIR CORRECTION SCHEMES

Point defects and impurities are ubiquitous in semiconductors or insulators and strongly dominate a wide variety of materials properties such as optical, mechanical, electrical, and transport properties, having a decisive impact on their performance in applications, e.g. photovoltaics, photocatalysts, ionic conductors, transistors, and light emitting diodes. Therefore, knowledge and precise control of defects are inherently keys to the smart design of materials with superior performance. Despite the importance, it is difficult to directly and fully study point defects by experiments, and first-principles calculations have emerged as an invaluable tool for modeling and understanding the point defects. ${ }^{1-3}$ In particular, a rapid progress on the computational speed and electronic structure calculation methods as represented by hybrid functionals, quantum Monte Carlo, and the GW approximation allows us to predict the defect properties semi-quantitatively or even quantitatively in recent years. ${ }^{4-13}$ These calculations support and complement experimental findings.

The first-principles point defect calculations commonly rely on the supercell approach under periodic boundary conditions. However, the cell sizes are not usually sufficiently large for describing the low concentration of defects in realistic materials such as $10^{14}-10^{18} \mathrm{~cm}^{-3}$. Calculations using common approximations to density functional theory (DFT), viz. local density approximation (LDA) or generalized gradient approximation (GGA), can treat a few thousand atoms at most, and hybrid functionals such as the Heyd-ScuseriaErnzerhof functional (HSE06) ${ }^{14,15}$ up to a few hundred atoms, which corresponds to $10^{20}-10^{21} \mathrm{~cm}^{-3}$. It is notorious that the formation energy of the charged defect calculated with such smaller supercells could include huge convergence errors up to several eV. In case that the defect charge is encased in the supercell, the main source of the error comes from the spurious long-range Coulomb interactions between the defect charge, its periodic images and background charge, ${ }^{16,17}$ which is requisite for avoiding the divergence of the electrostatic energy. Consequently, the formation energy slowly converges with the supercell size. A correction for image-charge interactions is therefore inevitable for evaluating the defect formation energy in the isolated limit unless the dielectric constant is large enough to screen the spurious interactions. In addition, since the average electrostatic potential in the entire supercell is conventionally set to zero within the momentumspace formalism, the eigenvalues are defined only up to an undetermined constant. ${ }^{18}$ Whereas the total energy of a chargeneutral system is well defined, the charged system depends on the undetermined shift of the valence band maximum (VBM). Therefore, it has been believed that one needs to align the VBM in the calculations of charged defects to that of the pristine host for restoring physically meaningful formation energies. ${ }^{2,19}$ This is a so-called potential alignment correction.

The formation energy of defect $D$ in charge state $q$ is estimated as ${ }^{17,20}$

$$
E_{f}\left[D^{q}\right]=\left\{E\left[D^{q}\right]+E_{\mathrm{corr}}\left[D^{q}\right]\right\}-E_{P}-\sum n_{i} \mu_{i}
$$

$$
+q\left\{\left(\epsilon_{\mathrm{VBM}}+\Delta v\right)+\Delta \epsilon_{F}\right\} .
$$

Here $E\left[D^{q}\right]$ and $E_{P}$ are the total energies of the supercell with the defect $D$ in charge state $q$ and the perfect supercell without defect, respectively. $n_{i}$ is the number of removed ( $n_{i}<$ 0 ) or added $\left(n_{i}>0\right) i$-type atom and $\mu_{i}$ refers to the chemical potential. $\epsilon_{\text {VBM }}$ is the energy level of the VBM, and $\Delta \epsilon_{F}$ is the Fermi level referenced to $\epsilon_{\text {VBM }} . E_{\text {Corr }}\left[D^{q}\right]$ and $\Delta v$, corresponding to the image-charge correction and potential alignment correction, respectively, are for charged defects. Then $\epsilon_{\text {VBM }}+\Delta v+\Delta \epsilon_{F}\left(=\epsilon_{F}\right)$ represents the Fermi level.

A number of image-charge correction schemes have been proposed since a few decades ago. ${ }^{16,21-27}$ The simplest correction is the point charge (PC) correction, which is a leading term for correcting spurious electrostatic interactions. Unfortunately, in some cases the higher-order terms are not negligible, and then the defect formation energy has to be extrapolated to the infinite interdefect distance limit with a set of supercell calculations. This is, however, prohibited when computational costs severely limit the size of supercells as seen in hybrid functional calculations.

Recently, Freysoldt, Neugebauer, and Van de Walle (FNV) proposed a remarkable scheme, which allows us to correct the defect formation energies a posteriori. ${ }^{21,22}$ A great advantage of this scheme is to estimate a correction energy from two supercell calculations with and without a defect and require no additional first-principles calculations. Therefore it is useful especially when computationally expensive methods are employed. This correction scheme, however, still has two practical issues.

Firstly, it uses planar-averaged electrostatic potential for aligning the defect-induced potential, which is obtained by subtracting bulk supercell potential from defective supercell potential, to the model charge potential. This works well when the atomic positions are fixed. However, realistic defect calculations require relaxing the atomic positions, and the defectinduced potential becomes scraggly because of the atomic displacements. Consequently, the potential offset between defect-induced potential and model charge potential has to be determined, e.g. by convoluting the defect-induced potential with a suitable Gaussian function ${ }^{\underline{17}}$ Secondly, in the original paper, the long-range Coulomb interaction is assumed to be screened by a macroscopic dielectric constant. This is valid only for cubic systems, and the dielectric constant should be replaced by a dielectric tensor for other systems. In order to resolve these two practical issues and make FNV scheme applicable to broad classes of materials, we use atomic site electrostatic potential for evaluating the defect-induced potential and an anisotropic PC model for long-range Coulomb interactions. The extended FNV scheme is applied to the layered compounds, hexagonal BN (h-BN) and $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$, as well as three-dimensional systems. Details are discussed in Sec. III.

There also exist a wide variety of fashions for the potential alignment. In the most-used way, the potential is aligned so that the electrostatic potential at the outermost atomic sites in the supercell with a charged defect becomes the same as that of the bulk, ${ }^{2,28-30}$ Instead, Lany and Zunger adopted the reference by averaging potential differences from the perfect cell at all atomic sites except the immediate neighbors of defects. ${ }^{19}$ Taylor and Bruneval, however, demonstrated that the Madelung potential, which is taken into account by the firstorder image-charge correction, brings a potential shift and one cannot perform the image-charge correction and potential alignment independently. ${ }^{23}$ In order to remove the long-range Coulomb interactions, Komsa et al. proposed a way to align the potential at the outermost area of the neutral defect to that of the pristine bulk. ${ }^{17}$ Taylor and Bruneval also proposed to align the potential averaged over the entire supercell including exchange-correlation (XC) potential to the bulk potential. ${ }^{\underline{23}}$ In Sec. IV, we revisit the controversial potential alignment, and conclude that the potential alignment is unnecessary ( $\Delta v=0$ ) as long as the image-charge correction is properly adopted.

To our best knowledge, the cell size dependence of the FNV correction for relaxed defects has been reported only by Komsa et al. with $V_{\mathrm{O}}^{+1}$ in MgO. ${ }^{17}$ To assess the performance of the correction scheme is essential for practical applications. In Sec. V, we apply the extended FNV scheme introduced in this study to a wide variety of material classes: ZnO, MgO, corundum $\mathrm{Al}_{2} \mathrm{O}_{3}$, monoclinic $\mathrm{HfO}_{2}\left(\mathrm{~m}-\mathrm{HfO}_{2}\right)$, cubic $\mathrm{BN}(\mathrm{c}-\mathrm{BN})$, Si, GaAs, and diamond in addition to $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and h-BN with layered structures and estimate its accuracy for relaxed defects. In addition, we discuss the remaining error sources.

## II. DETAILS OF FIRST-PRINCIPLES CALCULATIONS

We here summarize the details of the first-principles calculations used in this study. Our calculations were performed using the projector augmented-wave (PAW) method ${ }^{31}$ as implemented in vasp. ${ }^{32,33}$ We adopted Perdew-Burke-Ernzerhof GGA (PBE-GGA) ${ }^{34}$ except for GaAs and diamond: GaAs was calculated with the LDA ${ }^{35}$ because the band gap is significantly underestimated with the PBE-GGA at the equilibrium lattice constant (0.16 eV with the GGA vs. 0.51 with the LDA), and diamond was calculated with the HSE06 hybrid functional for demonstrating the correction of HSE06 defect formation energy. A Hubbard $U$ correction was applied to Ce in c-BN $\left(U-J=4.5 \mathrm{eV}\right.$ for $f$ orbitals). ${ }^{36,37}$

In this study, Li $2 s$, B $2 s$ and $2 p$, C $2 s$ and $2 p$, N $2 s$ and $2 p$, O $2 s$ and $2 p$, Mg $3 s$, Al $3 s$ and $3 p$, Si $3 s$ and $3 p$, Ti $4 s$ and $3 d$, Zn $4 s$ and $3 d$, Ga $4 s$ and $4 p$, As $4 s$ and $4 p$, and Ce $4 f, 5 d$, and $6 s$, and Hf $6 s$ and $5 d$ were described as valence electrons. The PAW data set with radial cutoffs of 1.08, 0.90, 0.70, 0.79, 0.80, 1.06, 1.01, 1.01, 1.48, 1.22, 1.38, 1.11, 1.36, and $1.59 \AA$ was used for Li, B, C, N, O, Mg, Al, Si, Ti, Zn, Ga, As, Ce, and Hf, respectively. The average atomic site potential was evaluated within spheres of radii 0.97, 0.77, 0.79, $0.71,0.72,1.07,1.04,0.99,1.28,1.06,1.26,0.95$, and $1.25 \AA$ for Li, B, C, N, O, Mg, Al, Si, Ti, Zn, Ga, As, and Hf. Wave functions were expanded with plane waves up to energy cutoffs of 400 and 550 eV for the cases where lattice parameters were fixed and optimized, respectively. Integrations in reciprocal space were performed with $\Gamma$-centered grids so that the total energies sufficiently converge. In this study, atomic positions were relaxed, but the lattice parameters were fixed at the bulk optimized values for defect calculations unless oth-
erwise noted. Forces acting on the atoms and stresses were reduced to be less than $0.02 \mathrm{eV} / \AA$ and 0.05 GPa. The dielectric tensors are indispensable for the correction of the defect formation energies. Both ion-clamped dielectric tensors and ionic contributions to the dielectric tensors were calculated with density functional perturbation theory. ${ }^{38,39}$

The calculated lattice parameters and dielectric tensors are summarized in Table I. The lattice constants estimated with the PBE-GGA are systematically overestimated, which is a typical tendency in the PBE-GGA. The ion-clamped dielectric constants are overestimated compared to the experimental ones except for diamond that is treated using the HSE06. This would be related to underestimation of the calculated band gaps with the LDA and PBE-GGA. Note that only an ionclamped dielectric tensor, and the sum of an ion-clamped dielectric tensor and an ionic contribution should be used for the correction of unrelaxed and relaxed systems, respectively. ${ }^{\underline{17}}$

## III. IMAGE-CHARGE CORRECTION

Here, we address the image-charge correction schemes that have been devised since a few decades ago. In this study, we suppose that the defect charge is localized in the supercell. Following Ref. 17, we consider three systems: (1) a pristine bulk system, (2) a system with a periodic array of localized defects with charge $q$ and a neutralizing background charge with charge density $-\frac{q}{\Omega}$, where $\Omega$ is volume of the supercell, and (3) a system with a single isolated defect with charge $q$. The potential is represented with $V_{\text {bulk }}, V_{\text {defect }, q}$, and $V_{\text {isolated, } q}$, respectively. Here and hereafter, to avoid confusions, we preferentially adopt the signs based on conventional electrostatic potential following Ref. 17. The electron charge is then set to the negative value.

Assume that charge density of a single defect within the supercell $\rho_{d}(\boldsymbol{r})$, which satisfies $q=\int_{\Omega} \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}$, is the same in both periodic and isolated systems. In other words, the variation of $\rho_{d}(\boldsymbol{r})$ induced by the spurious potential caused by the periodic images and background charge is negligibly small. The electrostatic energy of a defect, its images, and the background charge of the periodic system is then written as

$$
E_{\text {periodic }}=\frac{1}{2} \int_{\Omega}\left(V_{\text {defect }, q}(\boldsymbol{r})-V_{\text {bulk }}(\boldsymbol{r})\right)\left(\rho_{d}(\boldsymbol{r})-\frac{q}{\Omega}\right) d \boldsymbol{r} .
$$

The factor $\frac{1}{2}$ accounts for removing double counting, and the integration is performed over the supercell. The electrostatic energy of an isolated defect reads

$$
E_{\text {isolated }}=\frac{1}{2} \int\left(V_{\text {isolated, } q}(\boldsymbol{r})-V_{\text {bulk }}(\boldsymbol{r})\right) \rho_{d}(\boldsymbol{r}) d \boldsymbol{r} .
$$

The integration is performed over entire space. Following $\int_{\Omega} V_{\text {defect }, q} d \boldsymbol{r}=0$ and $\int_{\Omega} V_{\text {bulk }} d \boldsymbol{r}=0$ by convention and the assumption that the defect charge is localized in the supercell, the correction to the defect formation energy is written as ${ }^{17,52}$

$$
E_{\text {cor }}=E_{\text {isolated }}-E_{\text {periodic }}=\frac{1}{2} \int_{\Omega} V_{\text {cor }}(\boldsymbol{r}) \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}
$$

TABLE I: Calculated lattice parameters in units of Å and degrees, the ion-clamped ( $\epsilon^{\text {ele }}$ ) macroscopic dielectric tensors and ionic contributions to the dielectric tensors $\left(\epsilon^{\text {ion }}\right)$ in ZnO (space group: $\left.P 6_{3} m c\right), \mathrm{MgO}(F m \overline{3} m), \mathrm{Al}_{2} \mathrm{O}_{3}(R \overline{3} c), \mathrm{HfO}_{2}\left(P 2_{1} / c\right), \mathrm{c}-\mathrm{BN}(F \overline{4} 3 m)$, h-BN $\left(P 6_{3} / m m c\right), \beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}(C 2 / c)$, Si $(F d 3 m)$, GaAs $(F \overline{4} 3 m)$, and diamond $(F d 3 m)$. Available experimental values are also shown. The experimental $\epsilon^{\text {ele }}$ are high-frequency dielectric constants $\epsilon^{\infty}$, and $\epsilon^{\text {ion }}$ are estimated by subtracting $\epsilon^{\infty}$ from static dielectric constants. Note that ionic contributions of elemental substances (Si and diamond) are null because Born effective charges are zero.
|  | Lattice param. | $\epsilon^{\text {ele }}$ | $\epsilon^{\text {ion }}$ |
| :--- | :--- | :--- | :--- |
| ZnO <br> exp. ${ }^{a}$ | $a=3.29$ | $\epsilon_{\perp}=5.20$ | $\epsilon_{\perp}=5.14$ |
|  | $b=5.31$ | $\epsilon_{\\|}=5.22$ | $\epsilon_{\\|}=6.02$ |
|  | $a=3.250$ | $\epsilon_{\perp}=3.70$ | $\epsilon_{\perp}=4.07$ |
|  | $b=5.207$ | $\epsilon_{\\|}=3.78$ | $\epsilon_{\\|}=5.13$ |
| MgO | $a=4.25$ | 3.16 | 7.50 |
| exp. ${ }^{b}$ | $a=4.211$ | 3.0 | 6.6 |
| $\mathrm{Al}_{2} \mathrm{O}_{3}$ <br> exp. ${ }^{c}$ | $a=4.81$ | $\epsilon_{\perp}=3.27$ | $\epsilon_{\perp}=6.74$ |
|  | $c=13.12$ | $\epsilon_{\\|}=3.24$ | $\epsilon_{\\|}=9.11$ |
|  | $a=4.76$ | $\epsilon_{\perp}=3.1$ | $\epsilon_{\perp}=6.3$ |
|  | $c=12.99$ | $\epsilon_{\\|}=3.1$ | $\epsilon_{\\|}=8.5$ |
| $\mathrm{HfO}_{2}$ | $a=5.14$ | $\epsilon_{11}=4.79$ | $\epsilon_{11}=15.17$ |
|  | $b=5.19$ | $\epsilon_{22}=4.77$ | $\epsilon_{22}=13.46$ |
|  | $c=5.32$ | $\epsilon_{33}=4.52$ | $\epsilon_{33}=10.74$ |
|  | $\beta=100$ | $\epsilon_{13}=-0.13$ | $\epsilon_{13}=-1.09$ |
|  | $a=5.117$ |  |  |
|  | $b=5.175$ | NA | NA |
|  | $c=5.292$ |  |  |
| $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ | $a=5.09$ | $\epsilon_{11}=5.45$ | $\epsilon_{11}=36.95$ |
|  | $b=8.85$ | $\epsilon_{22}=5.49$ | $\epsilon_{22}=36.32$ |
|  | $c=9.82$ | $\epsilon_{33}=3.74$ | $\epsilon_{33}=12.07$ |
|  | $\beta=100$ | $\epsilon_{13}=0.01$ | $\epsilon_{13}=-1.06$ |
|  | $a=5.06$ |  |  |
|  | $b=8.79$ | NA | NA |
|  | $c=9.75$ |  |  |
|  | $\beta=100$ |  |  |
| c-BN exp. ${ }^{f}$ | $a=3.63$ | 4.61 | 2.34 |
|  | $a=3.616$ | 4.46 | 2.6 |
| h-BN | $a=2.51$ | $\epsilon_{\perp}=4.76$ | $\epsilon_{\perp}=1.83$ |
|  | $c=6.66^{g}$ | $\epsilon_{\\|}=2.68$ | $\epsilon_{\\|}=0.44$ |
|  | $a=2.5$ | $\epsilon_{\perp}=4.3$ | $\epsilon_{\perp}=2.6$ |
|  | $c=6.66$ | $\epsilon_{\\|}=2.2$ | $\epsilon_{\\|}=2.9$ |
| Si | $a=5.47$ | 12.98 | - |
| exp. ${ }^{i}$ | $a=5.431$ | 11.7 | - |
| GaAs | $a=5.63$ | 15.9 | 1.95 |
| exp. ${ }^{j}$ | $a=5.654$ | 11.1 | 2.0 |
| diamond | $a=3.55$ | 5.58 | - |
| exp. ${ }^{k}$ | $a=3.567$ | 5.7 | - |


[^0]where $V_{\text {cor }}=V_{\text {isolated, } q}-V_{\text {defect, } q}$. This equation indicates that the image-charge correction is a potential correction for removing the spurious Coulomb potential caused by the defect images and background charge. Note that although the background charge density is also removed via the correction, it does not contribute to the correction energy due to the convention of the zero average potential.

## A. Point-charge correction

The simplest image-charge correction is to subtract the PC energy. Only $V_{\text {cor }}$ at the defect site is essential for the PC correction, and can be estimated by an Ewalt summation. Fuchs derived the Ewalt formalism for the Madelung energy of periodically repeating PCs immersed in a neutralizing background charge for the study of the stability of Cu metal. ${ }^{53}$ Leslie and Gillan employed it for the correction of defect formation energies. ${ }^{24}$ Suppose that the long-range Coulomb interaction is screened by a macroscopic dielectric constant $\epsilon$ in the isotropic medium. The potential at the defect site $\boldsymbol{R}_{0}$ caused by PCs with charge $q$ located at the periodic image sites $\boldsymbol{R}_{i}(i \neq 0)$ and the background charge with charge density $-\frac{q}{\Omega}$, namely Madelung potential, can be written for a cubic cell as

$$
\begin{aligned}
V_{\mathrm{PC}, q}^{\mathrm{iso}}= & -\frac{\alpha q}{\epsilon L}=\frac{q}{\epsilon}\left\{\sum_{\boldsymbol{R}_{i}}^{i \neq 0} \frac{\operatorname{erfc}\left(\gamma\left|\boldsymbol{R}_{i}\right|\right)}{\left|\boldsymbol{R}_{i}\right|}-\frac{\pi}{\Omega \gamma^{2}}\right. \\
& \left.+\sum_{\boldsymbol{G}_{i}}^{i \neq 0} \frac{4 \pi}{\Omega} \frac{\exp \left(-\boldsymbol{G}_{i}^{2} / 4 \gamma^{2}\right)}{\boldsymbol{G}_{i}^{2}}-\frac{2 \gamma}{\sqrt{\pi}}\right\},
\end{aligned}
$$

where the summation of $\boldsymbol{R}_{i}$ and $\boldsymbol{G}_{i}$ runs over all vectors of the direct and reciprocal lattices except $\boldsymbol{R}_{0}$ and $\boldsymbol{G}_{0}=\mathbf{0}$, and $L$ is the dimension of the supercell, $\alpha$ the Madelung constant which depends on the Bravais lattice, and $\gamma$ a suitably chosen convergence parameter which does not influence on the potential. ${ }^{24,53}$ Here and hereafter, we suppose that a single defect exists in the supercell, and the basis is taken to be the defect site at $\boldsymbol{r}=\boldsymbol{R}_{0}=\mathbf{0}$. The second term, which is absent in the charge neutral Ewalt summation without the background charge, is essential for correcting the potential shift introduced by a periodic array of Gaussian charges instead of PCs in the third term, ${ }^{53}$ and obtained by

$$
-\frac{1}{\Omega} \int_{0}^{\infty} \frac{\operatorname{erfc}(\gamma r)}{r} \cdot 4 \pi r^{2} d r=-\frac{\pi}{\Omega \gamma^{2}}
$$

The forth term corresponds to the cancellation of the potential introduced by the Gaussian located at $\boldsymbol{r}=\mathbf{0}$ which is included in the third term. The correction potential is then $V_{\mathrm{cor}}=-V_{\mathrm{PC}, q}^{\text {iso }}$. This is of course the same as the functional derivative of the PC correction energy with respect to the defect charge density. ${ }^{17,23}$ The PC correction energy is then written as

$$
E_{\mathrm{PC}}^{\mathrm{iso}}=\frac{1}{2} \int_{\Omega}\left(-V_{\mathrm{PC}, q}^{\mathrm{iso}}\right) \cdot q \delta(\boldsymbol{r}) d \boldsymbol{r}=-\frac{q}{2} V_{\mathrm{PC}, q}^{\mathrm{iso}}=\frac{q^{2} \alpha}{2 L} .
$$

Strictly, the use of a dielectric constant is valid only for cubic systems, and it must be replaced by a dielectric tensor $\bar{\epsilon}$ for the others. This extension is promising for layered and lowdimensional materials such as nanowires and nanosheets. ${ }^{54,55}$ The Madelung potential in Eq. (5) is then rewritten as ${ }^{54,55}$

$$
\begin{aligned}
V_{\mathrm{PC}, q}^{\mathrm{aniso}} & =\sum_{\boldsymbol{R}_{i}}^{i \neq 0} \frac{q}{\sqrt{|\bar{\epsilon}|}} \frac{\operatorname{erfc}\left(\gamma \sqrt{\boldsymbol{R}_{i} \cdot \bar{\epsilon}^{-1} \cdot \boldsymbol{R}_{i}}\right)}{\sqrt{\boldsymbol{R}_{i} \cdot \bar{\epsilon}^{-1} \cdot \boldsymbol{R}_{i}}}-\frac{\pi q}{\Omega \gamma^{2}} \\
& +\sum_{\boldsymbol{G}_{i}}^{i \neq 0} \frac{4 \pi q}{\Omega} \frac{\exp \left(-\boldsymbol{G}_{i} \cdot \bar{\epsilon} \cdot \boldsymbol{G}_{i} / 4 \gamma^{2}\right)}{\boldsymbol{G}_{i} \cdot \bar{\epsilon} \cdot \boldsymbol{G}_{i}}-\frac{2 \gamma q}{\sqrt{\pi|\bar{\epsilon}|}} .
\end{aligned}
$$

The correction energy is written as $E_{\mathrm{PC}}^{\text {aniso }}=-\frac{q}{2} V_{\mathrm{PC}, q}^{\text {aniso }}$. Rurali and Cartoixà calculated the Al substitution energy with this correction in one-dimensional Si nanowire, ${ }^{55}$ and Murphy and Hine corrected the formation energies of Ti vacancy $\left(V_{\mathrm{Ti}}^{-4}\right)$, Li antisite on Ti $\left(\mathrm{Li}_{\mathrm{Ti}}^{-3}\right)$, and oxygen interstitial $\left(\mathrm{O}_{i}^{-2}\right)$ in monoclinic $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}{ }^{54}$

## B. Makov-Payne correction

The PC correction is the leading term of the image-charge correction with the $L^{-1}$ order. Makov and Payne (MP) then derived the correction term with the $L^{-3}$ order. ${ }^{25}$ Dabo et al. also derived the same formula in a simpler and physically intuitive manner. ${ }^{52}$ Following Refs. 25 and 52, the correction potential $V_{\text {cor }}$ for a defect in a periodically repeated cubic cell is written as

$$
V_{\mathrm{MP}}^{\mathrm{iso}}(\boldsymbol{r})=-V_{\mathrm{PC}, \mathrm{q}}^{\mathrm{iso}}-\frac{2 \pi q}{3 \epsilon L^{3}} r^{2}+\frac{4 \pi}{3 \epsilon L^{3}} \boldsymbol{p} \cdot \boldsymbol{r}-\frac{2 \pi Q}{3 \epsilon L^{3}}+O\left(r^{4}\right) .
$$

Here, $\boldsymbol{p}=\int \boldsymbol{r} \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}$ is dipole moment and $Q=\int r^{2} \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}$ second radial moment. The correction energy under the cubic symmetry up to the $L^{-3}$ order is then

$$
E_{\mathrm{MP}}^{\mathrm{iso}}=\frac{1}{2} \int_{\Omega} V_{\mathrm{MP}}^{\mathrm{iso}}(\boldsymbol{r}) \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}=E_{\mathrm{PC}}^{\mathrm{iso}}-\frac{2 \pi q Q}{3 \epsilon L^{3}}+\frac{2 \pi \boldsymbol{p}^{2}}{3 \epsilon L^{3}}+O\left(L^{-5}\right)
$$

Assuming that the dipole moment is negligible, the third term is omitted. For charged ions and molecules in vacuum under periodic boundary conditions, we can exactly calculate $E_{\mathrm{MP}}^{\text {iso }}$ up to the third order as discussed in Sec. IV. However, there are some problems for defects in crystalline materials. Firstly, the defect charge $\rho_{d}$ is ill defined, because the immersed $\rho_{d}$ and screening charge are inseparable; thus $Q$ cannot be calculated directly. ${ }^{16,17,23}$ Secondly, the Coulomb interaction is assumed to be screened by a macroscopic dielectric constant, which is correct only for cubic systems. It is also doubtful that the short-range Coulomb interaction is assumed to be screened by the macroscopic dielectric constant. Therefore, $E_{\text {MP }}^{\text {iso }}$ is usually not applied and the correction energy is determined by fitting the energies calculated with various supercells with different sizes and shapes. ${ }^{5,27}$ Such calculations need plently of computational costs especially for larger supercells, to which advanced DFT and many-body theory calculations are not accessible.

## C. FNV correction

Later on, Freysoldt, Neugebauer, and Van de Walle proposed a novel correction scheme. ${ }^{\underline{21}}$ Our main purpose in this study is to extend this scheme to be applied to broad classes of materials and assess its performance. Following Refs. 22 and 56, the correction energy of the FNV scheme is expressed as

$$
E_{\mathrm{FNV}}=E_{\mathrm{PC}}-\left.q \Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}} .
$$

$\Delta V_{\mathrm{PC}, q / b}$ is the potential difference between the defect-induced potential

$$
V_{q / b}=V_{\text {defect }, q}-V_{\text {bulk }},
$$

and the PC potential $V_{\text {PC, } q},{ }^{17,21,22,56}$

$$
\Delta V_{\mathrm{PC}, q / b}=V_{q / b}-V_{\mathrm{PC}, q} .
$$

$\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ is $\Delta V_{\text {PC }, q / b}$ at a place far from the defect in the supercell. Instead of a Gaussian charge originally adopted in Ref. 21 as a model charge for the localized defect in the supercell, we use a PC. This is because the PC model can be readily rewritten in the anisotropic form, and the correction energy can be divided into physically-meaningful long-range Coulomb interaction part and short-range part. ${ }^{56}$ The latter can also be attained with Gaussian by redefining the longrange Coulomb interaction energy and alignmentlike term. ${ }^{\underline{22}}$

The second term in Eq. (11) is denoted as potential alignmentlike term. ${ }^{17,21}$ An important point is that this alignmentlike term is different from the conventional potential alignment correction and approximately corresponds to the MP third order term when the PC model is used. ${ }^{17,56}$ When $\rho_{d}$ has spherical distribution, the defect-induced potential outside of the defect coincides with the PC potential under the open boundary condition, whereas they are different under the periodic boundary conditions. This discrepancy is due to the convention that the potential average in the entire supercell is set to zero. Komsa et al. have discussed this point in detail in Ref. 17 and derived the relationship $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}=\frac{2 \pi Q}{3 \epsilon \Omega}$ in an isotropic medium. This spurious potential shift caused by the periodic boundary condition has to be removed for charged defects, and its correction corresponds to the alignmentlike term. The great advantage of the FNV scheme is that we do not have to know the details of microscopic screening and their coupling to the actual unscreened or partially screened charge distribution beyond the PC model because these effects are incorporated into the alignmentlike term. Another advantage is that any shapes of supercells are applicable as long as the defect charge is encased in the supercell.

Although it is originally proposed to use either neutral defect or pristine bulk for a reference potential for estimating $\Delta V_{\text {PC, } q / b}$, we use the pristine bulk only. This is because the defect-induced potential can be quantified as a variation of the potential relative to the pristine host, and there is no reason that a system with a neutral defect can be used as a reference. Especially, the alignmentlike term estimated with the neutral defect with delocalized carriers is erroneous. Komsa et al. proposed a way to estimate $\Delta V_{\mathrm{PC}, q / b}$ by using potential of a neutral defect system as a reference, and perform the conventional potential alignment between the neutral defect and pristine bulk systems. ${ }^{17}$ Their approach is conceptually different but the correction energy is the same as ours.

## D. Application of atomic site potential as a potential marker

Originally the FNV scheme uses planar-averaged electrostatic potential for determining $\Delta V_{\text {PC, } q / b \mid \text { far }} .{ }^{\underline{21}}$ This, however, does not work properly when geometry optimization is performed. It is especially significant for an ionic host, in which long-range Coulomb interaction is screened by the dipoles of polarizable ions. This is demonstrated in Figs. 1 (a) and (b) that show the planar-averaged defect-induced potential $V_{q / b}$, PC potential $V_{\text {PC, } q}$, and their difference $\Delta V_{\text {PC, } q / b}$ for the unrelaxed and relaxed B vacancy in the -3 charge state ( $V_{\mathrm{B}}^{-3}$ ) in c-BN. In the unrelaxed geometry, both $V_{q / b}$ and $V_{\mathrm{PC}, q}$ show parabolic shape far from the defect, which comes from the homogeneous background charge through the Poisson's equation. Their difference then reaches a plateau between the defect and its periodic image, and $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ can be defined with small uncertainty. On the other hand, $V_{q / b}$ becomes scraggly in the relaxed geometry reflecting the atomic displacements, whereas $V_{\text {PC, } \text { q }}$ remains parabolic. As a result $\left.\Delta V_{q / b}^{\mathrm{PC}}\right|_{\text {far }}$ cannot be determined properly.

An alternative way is to employ atomic site electrostatic potential. This is often utilized for the potential alignment in defect calculations ${ }^{16,30}$ as well as the determination of ionization potential and band offsets in semiconductors and insulators. ${ }^{13,57,58}$ Screened potential at the arbitrary position $\boldsymbol{r} \neq \mathbf{0}$ in an anisotropic dielectric medium reads

$$
\begin{aligned}
V_{\mathrm{PC}, q}^{\mathrm{aniso}}(\boldsymbol{r} & \neq \mathbf{0})=\sum_{\boldsymbol{R}_{i}} \frac{q}{\sqrt{|\bar{\epsilon}|}} \frac{\operatorname{erfc}\left(\gamma \sqrt{\boldsymbol{R}_{i} \cdot \bar{\epsilon}^{-1} \cdot \boldsymbol{R}_{i}}\right)}{\sqrt{\boldsymbol{R}_{i} \cdot \bar{\epsilon}^{-1} \cdot \boldsymbol{R}_{i}}}-\frac{\pi q}{V_{c} \gamma^{2}} \\
& +\sum_{\boldsymbol{G}_{i}}^{i \neq 0} \frac{4 \pi q}{V_{c}} \frac{\exp \left(-\boldsymbol{G}_{i} \cdot \bar{\epsilon} \cdot \boldsymbol{G}_{i} / 4 \gamma^{2}\right)}{\boldsymbol{G}_{i} \cdot \bar{\epsilon} \cdot \boldsymbol{G}_{i}} \cdot \exp \left(i \boldsymbol{G}_{i} \cdot \boldsymbol{r}\right)
\end{aligned}
$$

This is used for evaluating $\Delta V_{\mathrm{PC}, q / b}$ in Eq. (13). We should keep in mind that the farthest atomic site from the defect is not necessarily the best reference for evaluating $\left.\Delta V_{\mathrm{PC}, q / b \mid}\right|_{\text {far }}$. This is because (i) the farthest atom lies between the defect and its periodic image, and might be suffered from an artificial defect-defect interaction in smaller supercells, and (ii) the displacements of the polarizable ions as a result of the screening may bias the electrostatic potential as illustrated in the inset of Fig. 1(b). Thus, we instead propose to average $\Delta V_{\mathrm{PC}, q / b} /{ }_{\text {far }}$ at the atomic positions in the region outside of the sphere that is in contact with the Wigner-Seiz cell with radius $R_{W S}$ as illustrated in Fig. 1(c). We call this region sampling region. This averaging is justified by the assumption that the defect charge spherically distributes and is encased in the supercell. It is also advantageous that the sampling region does not depend on the choice of the supercell as long as the Bravais lattice is same. As an example, the atomic site $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-06_851_1783_174_176.jpg)
FIG. 1: (a-b) Planar-averaged defect-induced potential $V_{q / b}$, PC potential $V_{\mathrm{PC}, q}$, and their difference $\Delta V_{\mathrm{PC}, q / b}$ of (a) unrelaxed and (b) relaxed $V_{\mathrm{B}}^{-3}$ in c-BN with a $3 \times 3 \times 3$ supercell containing 215 atoms. The $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ obtained using atomic site potential is also depicted for comparison. Inset in (b): Schematic illustration showing the displacements of polarizable ions under electric field caused by the charged defect. (c) Schematic of sampling region used for estimating $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ by averaging atomic site $\Delta V_{\mathrm{PC}, q / b}$ at the region outside of the sphere in contact with the Wigner-Seiz cell. Note that the sampling region depends only on the Bravais lattice of the supercell. (d) $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$ at the atomic positions in the supercell of the relaxed $V_{\mathrm{B}}^{-3}$ in c-BN. The region for averaging $\Delta V_{\mathrm{PC}, q / b}$ and its averaged value are expressed in the width and height of the arrow, respectively. (e, f) $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$ at the atomic sites of the unrelaxed (e) $V_{\mathrm{Mg}}^{-2}$ in MgO and (f) $\mathrm{Si}_{i}^{+2}$ in Si with $2 \times 2 \times 2$ supercells constructed from the conventional unit cells. (g, h) Planar-averaged $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$ of the unrelaxed (g) $V_{\mathrm{Mg}}^{-2}$ and (h) $\mathrm{Si}_{i}^{+2}$ together with $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ in (e) and (f).

of $V_{\mathrm{B}}^{-3}$ in c-BN are shown in Fig. 1(d). $\Delta V_{\mathrm{PC}, q / b}$ shows scattering behavior near the defect, but it converges at the outside of $R_{W S}$.

A disadvantage of the use of the atomic site potential is that the number of atomic sites for determining $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ might not be sufficient in small supercells, and non-negligible sampling errors might be involved. To check the accuracy, we compare the averaged atomic site $\Delta V_{\mathrm{PC}, q / b \mid \text { far }}$ with planaraveraged $\left.\Delta V_{\text {PC, } q / b}\right|_{\text {far }}$. In Figs. 1(e-h), we show atomic site and planar-averaged $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$ of Mg vacancy $\left(V_{\mathrm{Mg}}^{-2}\right)$ in MgO and Si self-interstitial at the tetrahedral site $\left(\mathrm{Si}_{i}^{+2}\right)$ in Si. For comparison we used relatively small $2 \times 2 \times 2$ supercells constructed from the conventional unit cells and did not relax the atomic positions. Between the defect and its image, the planar-averaged $\Delta V_{\mathrm{PC}, q / b}$ almost converge in both defect systems, indicating the defect charge is well localized in the supercells. $\left.\Delta V_{\text {PC, } q / b}\right|_{\text {far }}$ determined from the atomic site potential at the sampling region are almost the same for $V_{\mathrm{Mg}}^{-2}$ in MgO and $\mathrm{Si}_{i}^{+2}$ in Si ; the differences are less than 40 meV in both systems. Note that $\Delta V_{\mathrm{PC}, q / b}$ at the farther atomic site is almost same as the averaged $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$. When the cell size increases, these differences and consequently sampling errors drastically reduce, owing to the increase of the sampling points for evaluating $\Delta V_{\text {PC, } q / b}$.

## E. Assessment of the performance of the extended FNV scheme

Here, we discuss the performance of the extended FNV scheme using the anisotropic PC model. The test calculations were performed for the Ti vacancy ( $V_{\mathrm{Ti}}^{-4}$ ) in $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and B antisite defect on $\mathrm{N}\left(\mathrm{B}_{\mathrm{N}}^{+2}\right)$ in h-BN. Their crystal structures are shown in Figs. 2(a) and (b). As can be inferred from the layered structures, the dielectric tensors have very different diagonal components as listed in Table I.

Figures 2(c) and (d) show the atomic site $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{\mathrm{PC}, q / b}$ of $V_{\mathrm{Ti}}^{-4}$ in the $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3} 2 \times 2 \times 2$ supercell and $\mathrm{B}_{\mathrm{N}}^{+2}$ in the h-BN 8 × 8 × 3 supercell. $V_{q / b}$ widely scatter even at the same distance from the defect, reflecting the anisotropic screening feature. Interestingly, $V_{q / b}$ in $\mathrm{B}_{\mathrm{N}}^{+2}$ can be clearly divided into layer-by-layer components. $\Delta V_{\mathrm{PC}, q / b}$ in $\mathrm{B}_{\mathrm{N}}^{+2}$ is almost constant except the immediate vicinity of the defect, indicating that the defect charge is very localized. On the other hand, $\Delta V_{\mathrm{PC}, q / b}$ of $V_{\mathrm{Ti}}^{-4}$ in $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ is widespread and converges in a region far from the defect.

We corrected their formation energies based on Eq. (11). $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$ in $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and $E_{f}\left[\mathrm{~B}_{\mathrm{N}}^{+2}\right]$ in h-BN without corrections, with FNV corrections in the isotropic form, where the average of the diagonal components of the dielectric tensor is used as a dielectric constant $\epsilon=\left\langle\epsilon_{i i}\right\rangle$, and PC and FNV cor-

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-07_1134_1783_172_176.jpg)
FIG. 2: (a-b) Crystal structures of (a) $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and (b) h-BN. The unit cells of $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and h-BN contain 48 and 4 atoms, respectively. (c-d) $V_{q / b}, V_{\mathrm{PC}, q}$, and $\Delta V_{q / b}^{\mathrm{PC}}$ at the atomic sites in (c) $V_{\mathrm{Ti}}^{-4}$ in the $2 \times 2 \times 2$ supercell of $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ (383 atoms) and (d) $\mathrm{B}_{\mathrm{N}}^{+2}$ in the $8 \times 8 \times 3$ supercell of h-BN (768 atoms). (e-f) Relative formation energies of (e) $V_{\mathrm{Ti}}^{-4}$ and (f) $\mathrm{B}_{\mathrm{N}}^{+2}$ as a function of the supercell size and shape. Zeros are set to the formation energies calculated with the largest supercells and anisotropic FNV corrections. Atomic relaxations are considered in any cases.

rections in the anisotropic form are plotted in Figs.2(e) and (f) for a range of supercell sizes and shapes. As discussed later, the potential alignment is not considered for avoiding double counting of the correction term.

Without corrections, $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$ in $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ widely scatters depending on the supercell size and shape. The isotropic FNV correction with a dielectric constant, which is a typical approximation, does not avail to correct $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$; in the elongated supecells, it makes $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$ even worse. On the other hand, the anisotropic PC drastically reduces the cell size/shape dependence of $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$ as also reported in Ref. 54. The potential alignmentlike term in the anisotropic FNV scheme corrects the remaining cell size/shape dependence, and it almost vanishes in large supercells. As a result we see the extension along $a$-axis is essential for accurate estimation of $E_{f}\left[V_{\mathrm{Ti}}^{-4}\right]$, and the $2 \times 1 \times 195$-atom supercell would be a good compromise for the computationally expensive first-principles calculations such as hybrid functional calculations. Similarly, the anisotropic PC correction significantly improves $E_{f}\left[\mathrm{~B}_{\mathrm{N}}^{+2}\right]$ in h-BN, but the alignmentlike term is quite small in this case. $E_{f}\left[\mathrm{~B}_{\mathrm{N}}^{+2}\right]$ is systematically overestimated when the $c$-axis is not expanded in the supercell. In this case, BN sheets with and without defects alternate layer-bylayer, and it would not be appropriate to use a static dielectric constant $\epsilon^{\text {ele }}+\epsilon^{\text {ion }}$ along $c$-direction. Thus, good compromise for $E_{f}\left[\mathrm{~B}_{\mathrm{N}}^{+2}\right]$ would be the $4 \times 4 \times 2$ 128-atom supercell, which is expected to have an error less than 0.15 eV.

## IV. POTENTIAL ALIGNMENT REVISITED

As mentioned above, there is a longstanding controversy over the potential alignment. We here demonstrate that the potential alignment is not needed when the image-charge correction is applied properly. Indeed, some authors refrain from adopting both potential alignment and image-charge corrections because it might include a part of double counting terms. ${ }^{5,23,59}$ As indicated in Eq. (4), image-charge correction is a potential correction, and it changes the potential $V_{\text {defect, } q}$ to $V_{\text {isolated }, q}$. Then, $V_{\text {isolated }, q}=V_{\text {defect }, q}+V_{\text {cor }}=V_{\text {bulk }}+V_{q / b}+V_{\text {cor }}$, and $V_{q / b}+V_{\text {cor }}$ is the potential induced by a single defect. The proper potential alignment is achieved at the point infinitely far from the defect, and $\lim _{|r| \rightarrow \infty}\left(V_{q / b}+V_{\text {cor }}\right)=0$. Hence, after adopting the image-charge correction, the potential of the
supercell with a single defect is aligned to the bulk potential, indicating that the potential alignment is unnecessary for estimating the charged defect formation energy.

The situation is analogous to the isolated charged ion in the cell under periodic boundary conditions, where the reference is not the pristine bulk but vacuum. In this case, the total energy depends on the undetermined shift of the eigenvalues, and thus the potential at vacuum must be aligned to be zero. Because the screening charge is absent and the ionic charge $\rho_{\text {ion }}$ is well definied, $Q=\int r^{2} \rho_{\text {ion }}(\boldsymbol{r}) d \boldsymbol{r}$ is calculated exactly. Figure 3(a) shows the planar-averaged electrostatic potential of a $\mathrm{Si}^{+}$ion obtained from a selfconsistent calculation with the PBE-GGA and of the PC model with the +1 charge, and their difference in a $10 \AA \times 10 \AA \times 10 \AA$ cell. Around the $\mathrm{Si}^{+}$ion, the electrostatic potential is substantially different from the PC potential because of the finite distribution of the electrons. It, however, becomes almost parallel to the PC potential at a distance of $\sim 2 \AA$ from the ion, and the difference converges to a constant of $\frac{2 \pi Q}{3 L^{3}}$. Therefore, after applying the PC correction and alignmentlike correction, i.e. the FNV correction the electrostatic potential far from the $\mathrm{Si}^{+}$ion changes to zero, meaning that the outermost potential from the $\mathrm{Si}^{+}$ion is already aligned to zero. Note that the alignmentlike correction is almost the same as the MP third order correction via an explicit calculation of $Q$ (the difference is 0.02 meV in $10 \AA \times 10 \AA \times 10 \AA$ cell) because no screening exists. Figure 3(b) shows the cell size dependence of the ionization energy of the Si atom. One can see that the ionization energy with the FNV correction (sum of the PC correction and potential alignmentlike correction) does not show the cell size dependence, indicating the unnecessity of the additional potential alignment from energetics viewpoint.

We should emphasize that when the potential alignment is performed at a particular atomic site before the image-charge correction, a part of the PC correction is included in addition to the alignmentlike term. This can be understood by writing the potential alignment term as

$$
\begin{aligned}
-q V_{q / b}(\boldsymbol{r}) & =-q\left(V_{\mathrm{PC}, q}^{\mathrm{iso}}(\boldsymbol{r})+\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}}\right) \\
& =\alpha(\boldsymbol{r}) E_{\mathrm{PC}}^{\mathrm{iso}}-\left.q \Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}}
\end{aligned}
$$

with Eq. (13), where the potential alignment is performed at $\boldsymbol{r}$ outside of the defect. Fractions $\alpha$ of the PC correction included in the potential alignment are calculated from $\alpha(\boldsymbol{r})=-q V_{\text {PC, } q}^{\text {iso }}(\boldsymbol{r}) / E_{\text {PC }}^{\text {iso }}$ in an isotropic medium. Note that $\alpha$ depends only on the fractional coordinates and supercell shape. Figure 3(c) shows $\alpha$ at (0.5 0 0), (0.5 0.5 0), and (0.5 $0.50 .5)$ in fractional coordinates in cubic systems. For instance, when the potential at ( 0.50 .50 .5 ) is aligned to the bulk potential, 57 \% of the PC correction and 100 \% of the alignmentlike term are incorporated. This is demonstrated for the Si ionization energy. Figure 3(b) shows the corrected ionization energies by the potential alignment at ( 0.50 .50 .5 ). They have cell size dependence linear to $L^{-1}$, and the rest of the correction energy corresponds to 43 \% of the PC correction. 41 \% and 7 \% of PC correction are included if the potential alignment is made at (0.5 0.50 ) and (0.5 0 0), respectively.

Lany and Zunger have reported that no significant thirdorder contribution of image-charge correction remains for the As vacancy with the +3 charge $\left(V_{\text {As }}^{+3}\right)$ in GaAs after the potential alignment. ${ }^{16,19}$ They explained it by calculating the second radial moment in the MP third order term using the total charge density difference between the charged and neutral DFT calculations. However, their explanation leads to some conceptual difficulties as pointed by Komsa et al ${ }^{17}$ and Lambrecht. ${ }^{\underline{3}}$ The FNV correction energy can be rewritten as

$$
\begin{aligned}
E_{\mathrm{FNV}} & =E_{\mathrm{PC}}-\left.q \Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}} \\
& =(1-\alpha(\boldsymbol{r})) E_{\mathrm{PC}}-q V_{q / b}(\boldsymbol{r}),
\end{aligned}
$$

and $(1-\alpha(\boldsymbol{r})) E_{\mathrm{PC}}$ has $L^{-1}$ dependence as long as the potential alignment is attained at the same fractional coordinates in the supercells with the same shape. Although in Ref. 19 the potential alignment was achieved by averaging the potential offset at atomic sites except for the immediate neighbors of the defect and therefore $\alpha$ is unclear, we believe the absence of the third-order contribution is explained with Eq. (16). Our results support this as shown in the next section.

## V. APPLICATIONS TO DEFECTS IN DIVERSE MATERIALS

To assess the accuracy of the extended FNV scheme, we calculated the formation energies of defects in a variety of host materials: $V_{\mathrm{Zn}}^{-2}, V_{\mathrm{O}}^{+2}$, and the Zn interstitial at the octahedral site $\left(\mathrm{Zn}_{i}^{+2}\right)$ in $\mathrm{ZnO},{ }^{5,16,60-62} V_{\mathrm{Mg}}^{-2}$ and $V_{\mathrm{O}}^{+2}$ in $\mathrm{MgO},{ }^{62,63}$ $V_{\mathrm{Al}}^{-3}$ and $V_{\mathrm{O}}^{+2}$ in $\mathrm{Al}_{2} \mathrm{O}_{3},{ }^{62,64} V_{\mathrm{Hf}}^{-4}$ and $V_{\mathrm{O}}^{+2}$ on the three-fold coordinated O site in $\mathrm{HfO}_{2}, V_{\mathrm{B}}^{-3}$ and a defect complex of Ce on the N site coupling with neighboring four B vacancies ( $\mathrm{Ce}_{\mathrm{N}}$ $4 V_{\mathrm{B}}^{-6}$ ) in c-BN, ${ }^{36} \mathrm{Si}_{i}^{+2}$ and $V_{\mathrm{Si}}^{+2}$ in $\mathrm{Si}^{23,65,66}$, $V_{\mathrm{As}}^{+3}$ in GaAs , ${ }^{16,19}$ and $V_{\mathrm{C}}^{+2}$ in diamond ${ }^{67}$ that cover a wide range of crystal structures, local structures, chemistry (covalency and ionicity), and defect type (vacancies, interstitials, and substitutional impurities). We checked these defects do not have delocalized perturbed host states with and without electron occupation for donorlike and acceptorlike states, respectively, which is a prerequisite of the electrostatics-based corrections including the FNV scheme; perturbed host states require special treatments, e.g. by considering effective defect charges. ${ }^{5,17}$ The uncorrected and corrected defect formation energies with the PC model and extended FNV scheme are shown in Fig. 4, The uncorrected defect formation energies are extrapolated to the dilute limit by fitting a function of the form $a N_{\text {atoms }}^{-1}+b N_{\text {atoms }}^{-1 / 3}+c$, where $N_{\text {atoms }}$ is the number of atoms in the supercell before introducing a defect. We find that the cell size dependences of the FNV corrected defect formation energies with large supercells are extremely small, indicating the validity as the reference energies for measuring the errors.

The PC correction basically improves the defect formation energies. Especially, $V_{\mathrm{Zn}}^{-2}$ and $\mathrm{Zn}_{i}^{+2}$ in ZnO and $V_{\mathrm{B}}^{-3}$ in c-BN are well corrected. However, it overshoots the energy of $V_{\mathrm{O}}^{+2}$ in $\mathrm{ZnO}, \mathrm{MgO}, \mathrm{Al}_{2} \mathrm{O}_{3}$, and $\mathrm{HfO}_{2}, V_{\mathrm{Si}}^{+2}$ in Si, $V_{\mathrm{As}}^{+3}$ in GaAs, and $V_{\mathrm{C}}^{+2}$ in diamond. The FNV correction, which is the sum of the PC correction and the alignmentlike term, greatly improves the defect formation energies in most cases, but $E\left[V_{\mathrm{Zn}}^{-2}\right]$ and

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-09_561_1790_174_174.jpg)
FIG. 3: (a) Planar-averaged electrostatic potential of a $\mathrm{Si}^{+}$ion calculated with the PBE-GGA located in a $10 \AA \times 10 \AA \times 10 \AA$ cell, the PC potential with the +1 charge, and their difference. The potential difference converges to $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}}=\frac{2 \pi Q}{3 L^{3}}(<0)$. (b) Cell size dependence of the uncorrected and corrected ionization energy of a Si atom, $E\left(\mathrm{Si}^{+}\right.$ion $)-E(\mathrm{Si}$ atom $)+E_{\text {cor }}$. The ionization energy becomes almost independent of the cell dimension after applying both the PC correction and alignmentlike correction (the FNV correction). (c) The fractions $\alpha$ of the PC correction implicitly included in the potential alignment at three points written in fractional coordinates in the cubic cell in an isotropic medium. Note that the alignmentlike term is fully included in the potential alignment at any point (see text).

$E\left[\mathrm{Zn}_{i}^{+2}\right]$ in ZnO are overshot. $E\left[V_{\mathrm{C}}^{+2}\right]$ in diamond calculated with the HSE06 hybrid functional are also well corrected by the FNV scheme.

As discussed in Sec. III an essential assumption is that the defect charge is encased in the supercell, and its distribution does not have cell size dependence. The absence of the delocalized perturbed host states is just an essential condition and not sufficient to confirm this assumption, and the cell size dependence of $E\left[V_{\mathrm{Si}}^{+2}\right]$ may reflect violation of the assumption. To check this, we plotted $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ in Fig. 5. Supposing that the defect charge remains the same in different supercells, $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega \approx \frac{2 \pi Q}{3 \epsilon}$ must be constant because $Q$ is constant.

One can see that $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ are positive in vacancies and negative in interstitials. This can be qualitatively understood as follows. Supposing the unrelaxed geometry, Table II shows the sign of second radial moment $Q$ and alignmentlike term $-\left.q \Delta V_{\text {PC, } q / b}\right|_{\text {far }}$ for charged vacancies and interstitials. In case of vacancies, the valence and core electrons of the removed atom are also removed, and hence $\rho_{d}(\boldsymbol{r} \neq \mathbf{0})>0$ and $Q=\int r^{2} \rho_{d}(\boldsymbol{r}) d \boldsymbol{r}>0$, because the nucleus of the removed atom located at the defect site $\boldsymbol{r}=\mathbf{0}$. On the contrary, in case of interstitials, due to the electrons of the interstitial atom, $\rho_{d}(\boldsymbol{r} \neq \mathbf{0})<0$ and $Q<0$. The alignmentlike term $-\left.q \Delta V_{\text {PC, } q / b}\right|_{\text {far }}$ of negatively (positively) charged vacancies or positively (negatively) charged interstitials is then positive (negative) as listed in Table. II.

Interestingly, $\left.\Delta V_{\text {PC, } q / b}\right|_{\text {far }} \cdot \Omega$ of $V_{\mathrm{O}}^{+2}$ are around $100\left[V \cdot \AA^{3}\right]$ in any binary oxides in this study, and that of $V_{\mathrm{B}}^{+3}$ in c-BN is very small, reflecting a significantly small $\mathrm{B}^{3+}$ ionic radius. $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ are almost constant except for $V_{\mathrm{Si}}^{+2}$ in Si and $V_{\mathrm{As}}^{+3}$ in GaAs; their $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ relate to the change of the defect charge distribution. The behavior of $V_{\mathrm{Si}}^{+2}$ is notorious; its atomic and electronic structures and energetics strongly depend on the supercell size and $k$-points sampling. ${ }^{65,66}$ In fact, $\Gamma$-only $k$-point is not sufficient even with a 1726-atom supercell, and Monkhorst-Pack ${ }^{68} 2 \times 2 \times 2 k$-point mesh was adopted in this study. This would be because the defect charge immersed in the valence band spread widely, and it leads to the erroneous defect-defect interactions. Indeed, planar-averaged $\left.\Delta V_{\text {PC, } q / b}\right|_{\text {far }}$ in the unrelaxed geometry does not reach plateau between the defect and its image. As a result, $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ increases as the supercell gets larger and larger, and more defect charge is encased. On the other hand, $E\left[V_{\mathrm{As}}^{+3}\right]$ in GaAs is well corrected with the FNV scheme even with small supercells. This may be because the defect states perturbed by the spurious potential are very similar in energy to the isolated defect state. Then, the defect formation energy can be well calculated although the defect charge distribution does not converge.

For $V_{\mathrm{Mg}}^{-2}$ and $V_{\mathrm{O}}^{+2}$ in MgO, we calculated the defect formation energies with two types of supercells constructed from conventional and primitive cells, respectively, which have simple cubic (sc) and face-centered-cubic (fcc) defect allocations. ${ }^{19}$ Intuitively, the fcc supercells seem suited for defect calculations since the defect-defect distance is longer than that of the sc supercells in the same volume because of the larger coordination number in the fcc allocation. Both $E\left[V_{\mathrm{Mg}}^{-2}\right]$ and $E\left[V_{\mathrm{O}}^{+2}\right]$ are, however, more accurately calculated with the sc supercells. The reason is unclear but the defect-defect interactions might be enhanced in fcc supercells. Such behavior has also been observed in $V_{\mathrm{As}}^{+3}$ in GaAs. ${ }^{19}$

The absolute error is of importance in practice, and thus we plot the relative defect formation energies calculated with small supercells containing around 100 atoms in Fig. 6. Such small supercells are convenient for computationally expensive calculations. It is found that the defect formation energies are excellently corrected by the extended FNV scheme and the differences from those in the dilute limit are less than 0.19 eV in our test set. Surprisingly the errors do not largely depend on the defect charge as Freysoldt et al. pointed out in Ref. 21.

The conventional potential alignment discussed in Sec. IV

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-10_2260_1787_174_176.jpg)
FIG. 4: Relative formation energies of (a) $V_{\mathrm{Zn}}^{-2}$, (b) $V_{\mathrm{O}}^{+2}$, and (c) $\mathrm{Zn}_{i}^{+2}$ in ZnO, (d) $V_{\mathrm{Mg}}^{-2}$ and (e) $V_{\mathrm{O}}^{+2}$ in MgO, (f) $V_{\mathrm{Al}}^{-3}$ and (g) $V_{\mathrm{O}}^{+2}$ in $\mathrm{Al}_{2} \mathrm{O}_{3}$, (h) $V_{\mathrm{Hf}}^{-4}$ and (i) $V_{\mathrm{O}}^{+2}$ in $\mathrm{HfO}_{2}$, (j) $V_{\mathrm{B}}^{-3}$ and (k) $\mathrm{Ce}_{\mathrm{N}}-4 V_{\mathrm{B}}^{-6}$ in c-BN, and (l) $\mathrm{Si}_{i}^{+2}$ and (m) $V_{\mathrm{Si}}^{+2}$ in Si, (n) $V_{\mathrm{As}}^{+3}$ in GaAs, and (o) $V_{\mathrm{C}}^{+2}$ in diamond with atomic relaxation considered. Zeros are set to the anisotropic FNV corrected defect formation energies calculated with the largest supercells. The horizontal axis is shown as a function of inverse of the cube root of the number of atoms. In cases where the cell dimension is isotropically expanded, the uncorrected defect formation energies are fitted with a function of $a N_{\text {atoms }}^{-1}+b N_{\text {atoms }}^{-1 / 3}+c$.

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-11_2269_1781_172_183.jpg)
FIG. 5: $\Delta V_{\mathrm{PC}, q / b} / \mathrm{far} \cdot \Omega$ of the defects shown in Fig. 4 For comparison, scales of the horizontal axes are set to be the same except for $V_{\mathrm{Si}}^{+2}$ in Si. Large changes of $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ are indicated by arrows for guides to the eye.

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-12_773_846_174_193.jpg)
FIG. 6: Relative defect formation energies estimated with supercells containing less than 100 atoms except for $\mathrm{B}_{\mathrm{N}}^{+2}$ antisite defects in hBN, compared to FNV corrected energies estimated with the largest supercells. Atomic relaxation is considered in any cases. The uncorrected energy of $\mathrm{Ce}_{\mathrm{N}}-4 V_{\mathrm{B}}^{-6}$ in c-BN is -11.6 eV. The defects in the shaded area have large cell size dependences of $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\mathrm{far}} \cdot \Omega$, indicating violation of the assumption that the defect charge distribution in the supercell is the same as the isolated one. Note that the corrected energies with the extended FNV scheme are located within ±0.19 eV.

is also reviewed with $\mathrm{Ce}_{\mathrm{N}}-4 V_{\mathrm{B}}^{-6}$ in c-BN, $\mathrm{Si}_{i}^{+2}$ in Si, and $V_{\mathrm{As}}^{+3}$ in GaAs in Fig. 7. The energies corrected with the potential alignment at the farthest atomic site from the defect and its images have nearly linear dependence against $L^{-1}$. The deviations from the linear dependence are, however, larger than that of the $\mathrm{Si}^{+}$ion shown in Fig. 3(b). This is because the farthest atoms do not always locate at (0.5 0.5 0.5) of the supercells. For instance, such atoms locates at ( 0.50 .50 .5 ) when $N$ in $N^{3}$ fold $\mathrm{Si}_{i}$ supercell is odd number, but it does not when $N$ is even number. One can find that a sum of the conventional potential alignment and $1-\alpha$ of the PC correction energy almost recovers the FNV corrected energies, consistent with the Si ionization energy in Sec IV The remaining differences observed in Fig. 7 correspond to the difference in potential sampling methods; the potential alignment is performed at the farthest atomic site whereas the FNV correction is performed with the potential in the sampling region in this study.

The FNV scheme can correct the defect formation energies up to the $L^{-3}$ order. We here discuss the origins of the remaining error. The error sources considered are as follows: (i) The defect charge spills out from the supercell. (ii) The defect charge distribution is affected by the spurious potential caused by the defect charges and background charge. ${ }^{25}$ (iii) Sampling error for the potential alignmentlike term. (iv) Correction energy with $L^{-5}$ or higher orders. (v) Defect-induced dipoles, which contributes to decrease the formation energy as shown in Eq. (10). (vi) Defect-induced elastics, which contributes to

TABLE II: Sign of charge $q$, second radial moment $Q$, and alignmentlike term $-\left.q \Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ for charged vacancies and interstitials in a $\mathrm{A}^{+N} \mathrm{~B}^{-N}$ binary compound.
|  | $V_{\mathrm{A}}^{-N}$ | $V_{\mathrm{B}}^{+N}$ | $X_{i}^{+N}$ | $X_{i}^{-N}$ |
| :--- | :--- | :--- | :--- | :--- |
| $q$ | - | + | + | - |
| $Q,\left.\Delta V_{\mathrm{PC}, q / b}\right\|_{\mathrm{far}}$ | + | + | - | - |
| $-\left.q \Delta V_{\mathrm{PC}, q / b}\right\|_{\mathrm{far}}$ | + | - | + | - |


increase the formation energy.
(i) - (iii) can be checked with $\left.\Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }} \cdot \Omega$ as shown in Fig.5. (iv) would be dominant when the fitting with a function of the form $a N_{\text {atoms }}^{-1}+b N_{\text {atoms }}^{-1 / 3}+c$ works poorly. (v) may be only related to the defects in ZnO without an inversion symmetry in the present study. The omission of the leading dipole term, however, should underestimate the defect formation energies and this is not true for the defects in ZnO. Roughly estimating the dipole energy, we calculate the dipole energy of the charges $\pm e$ separated $0.5 \AA$ from each other $(\boldsymbol{p}=0.5 \cdot \boldsymbol{z}[e \cdot \AA])$ in the $4 \times 4 \times 2$ supercell of $\mathrm{ZnO}\left(\Omega=1590 \AA \AA^{3}\right)$ with a theoretical dielectric constant $\epsilon=\left\langle\epsilon_{i i}\right\rangle=10.64$, and obtain $\frac{2 \pi p^{2}}{3 \epsilon \Omega}=5.6$ meV, which is negligibly small compared to the remaining error of the defects in ZnO. Only (vi) is not explicitly dependent on $q$. Since the remaining errors after the extended FNV correction are not strongly dependent on the defect charges, (vi) might be a main error source for the defects localized in the supercell. Note that the lattice optimization of the defective supercell is not useful to reduce the elastic energy in general, because the spurious elastic interactions occur under periodic boundary conditions, and can underestimate the defect formation energy. A combination of first-principles calculations and elastic theory might resolve this issue. ${ }^{69}$

## VI. CONCLUSIONS

In this paper, we have discussed the electrostatics-based finite cell size corrections for first-principles point defect calculations under periodic boundary conditions. In the beginning, the PC correction that is the leading term of the image-charge correction has been reviewed in detail. Then, we have introduced the higher order correction term $\mathrm{O}\left(L^{-3}\right)$ derived by the MP and FNV schemes. We then have proposed a way to extend the FNV scheme to be applicable to a wide variety of materials. Firstly, we have introduced atomic site potential for determining the potential offset between the defect-induced potential and PC potential, and compared it with the planaraveraged potential. Secondly, we have introduced a PC model with the anisotropic form for evaluating long-range Coulomb interactions. The FNV scheme with the anisotropic form has been tested with $V_{\mathrm{Ti}}^{-4}$ in $\beta-\mathrm{Li}_{2} \mathrm{TiO}_{3}$ and $\mathrm{B}_{\mathrm{N}}^{+2}$ in h-BN, and it is found that their formation energies are well corrected by the extended FNV scheme.

The potential alignment, which has been discussed by many

![](./images/b89b4a43-a807-423f-a2d9-6749350b72bc-13_518_1779_174_180.jpg)
FIG. 7: Relative formation energies of (a) $\mathrm{Ce}_{\mathrm{N}}-4 V_{\mathrm{B}}^{-6}$ in c-BN, (b) $\mathrm{Si}_{i}^{+2}$ in Si, (c) $V_{\mathrm{As}}^{+3}$ in GaAs, and their energies corrected with the FNV scheme, conventional potential alignment, and potential alignment plus $(1-\alpha(\boldsymbol{r})) E_{\mathrm{PC}}$. The potential alignment was performed at the farthest atomic site. In cases where the farthest atoms locate at (0.5 0.50 .5$), \alpha=0.57$. Otherwise, $\alpha$ values are shown.

authors for long time, has also been revisited in Sec. IV. We have concluded that the potential alignment is unnecessary when the image-charge correction is properly considered. This is confirmed by calculating the ionization energy of the Si atom. We also have discussed the physical meaning of the conventional potential alignment, and found that it contains a part of the PC correction energy and full of the potential alignmentlike term of the FNV scheme. We propose that this would be the origin of the absence of the $L^{-3}$ order term after applying the potential alignment previously reported. ${ }^{19}$ The amount of the PC correction energy included by the potential alignment depends on the coordinates where the potential alignment is attained.

In Sec. V, we have tested the accuracy of the extended FNV scheme with a test set composed of 17 defects in 10 materials, and found that it systematically improves the defect formation energies. The signs of the second radial moment $Q$ and alignmentlike term $-\left.q \Delta V_{\mathrm{PC}, q / b}\right|_{\text {far }}$ have also been discussed. The corrected defect formation energies with -6 to +3 charges calculated with around 100-atom supercells are within $\pm 0.19 \mathrm{eV}$ compared to those in the dilute limit. We believe that the extended FNV scheme is a powerful tool for correcting defect formation energies as long as the defect charges are encased in the supercells.

## Acknowledgments

We thank Atsuto Seko and Minseok Choi for valuable discussions. This work was supported by the MEXT Elements Strategy Initiative to Form Core Research Center Tokodai Institute for Element Strategy (TIES) and a Grant-in-Aid for Scientific Research on Innovative Areas "Nano Informatics" (grant number 25106005) from JSPS. Computing resources of ACCMS at Kyoto University were used in this work. The visualization of crystal structures were performed with VESTA. ${ }^{70}$

[^1]Lett. 102, 016402 (2009).
${ }^{22}$ C. Freysoldt, J. Neugebauer, and C. G. Van de Walle, Phys. Status Solidi B 248 (2011).
${ }^{23}$ S. E. Taylor and F. Bruneval, Phys. Rev. B 84, 075155 (2011).
${ }^{24}$ M. Leslie and N. J. Gillan, J. Phys. C 18, 973 (1985).
${ }^{25}$ G. Makov and M. C. Payne, Phys. Rev. B 51, 4014 (1995).
${ }^{26}$ P. A. Schultz, Phys. Rev. Lett. 84, 1942 (2000).
${ }^{27}$ C. W. M. Castleton, A. Höglund, and S. Mirbt, Phys. Rev. B 73, 035215 (2006).
${ }^{28}$ C. Persson, Y.-J. Zhao, S. Lany, and A. Zunger, Phys. Rev. B 72, 035211 (2005).
${ }^{29}$ Y. Kumagai, F. Oba, I. Yamada, M. Azuma, and I. Tanaka, Phys. Rev. B 80, 085120 (2009).
${ }^{30}$ M. Choi, F. Oba, Y. Kumagai, and I. Tanaka, Adv. Mater. 25, 86 (2013).
${ }^{31}$ P. E. Blöchl, Phys. Rev. B 50, 17953 (1994).
${ }^{32}$ G. Kresse and J. Hafner, Phys. Rev. B 47, 558 (1993).
${ }^{33}$ G. Kresse and J. Furthmüller, Phys. Rev. B 54, 11169 (1996).
${ }^{34}$ J. P. Perdew, K. Burke, and M. Ernzerhof, Phys. Rev. Lett. 77, 3865 (1996).
${ }^{35}$ J. P. Perdew and A. Zunger, Phys. Rev. B 23, 5048 (1981).
${ }^{36}$ R. Ishikawa, N. Shibata, F. Oba, T. Taniguchi, S. D. Findlay, I. Tanaka, and Y. Ikuhara, Phys. Rev. Lett. 110, 065504 (2013).
${ }^{37}$ S. L. Dudarev, G. A. Botton, S. Y. Savrasov, C. J. Humphreys, and A. P. Sutton, Phys. Rev. B 57, 1505 (1998).
${ }^{38}$ S. Baroni and R. Resta, Phys. Rev. B 33, 7017 (1986).
${ }^{39}$ M. Gajdoš, K. Hummer, G. Kresse, J. Furthmüller, and F. Bechstedt, Phys. Rev. B 73, 045112 (2006).
${ }^{40}$ J. Albertsson, S. C. Abrahams, and Å. Kvick, Acta Crystallogr. B 45, 34 (1989).
${ }^{41}$ N. Ashkenov, B. N. Mbenkum, C. Bundesmann, V. Riede, M. Lorenz, D. Spemann, E. M. Kaidashev, A. Kasic, M. Schubert, M. Grundmann, et al., J. Appl. Phys. 93, 126 (2003).
${ }^{42}$ D. Taylor, Trans. J. Br. Ceram. Soc. 83, 5 (1984).
${ }^{43}$ R. E. Newnham and Y. M. de Haan, Z. Kristallogr. 117, 235 (1962).
${ }^{44}$ M. Schubert, T. E. Tiwald, and C. M. Herzinger, Phys. Rev. B 61, 8187 (2000).
${ }^{45}$ R. E. Hann, P. R. Suitch, and J. L. Pentecost, J. Am. Ceram. Soc. 68, C (1985).
${ }^{46}$ K. Kataoka, Y. Takahashi, N. Kijima, H. Nagai, J. Akimoto, Y. Idemoto, and K. Ohshima, Mater. Res. Bull. 44, 168 (2009).
${ }^{47}$ K. Eichhorn, A. Kirfel, J. Grochowski, and P. Serda, Acta Crystallogr. B 47, 843 (1991).
${ }^{48}$ M. E. Levinshtein, S. L. Rumyantsev, and M. S. Shur, Properties of Advanced Semiconductor Materials: GaN, AIN, InN, BN, SiC, SiGe (2001).
${ }^{49}$ C. R. Hubbard, H. E. Swanson, and F. A. Mauer, J. Appl. Crystallogr. 8, 45 (1975).
${ }^{50}$ A. S. Cooper, Acta Crystallogr. 15, 578 (1962).
${ }^{51}$ T. Hom, W. Kiszenik, and B. Post, J. Appl. Crystallogr. 8, 457 (1975).
${ }^{52}$ I. Dabo, B. Kozinsky, N. Singh-Miller, and N. Marzari, Phys. Rev. B 77, 115139 (2008).
${ }^{53}$ K. Fuchs, Proc. R. Soc. A 151, 585 (1935).
${ }^{54}$ S. T. Murphy and N. D. M. Hine, Phys. Rev. B 87, 094111 (2013).
${ }^{55}$ R. Rurali and X. Cartoixà, Nano Lett. 9, 975 (2009).
${ }^{56}$ W. Chen and A. Pasquarello, Phys. Rev. B 88, 115104 (2013).
${ }^{57}$ Y. Hinuma, F. Oba, Y. Kumagai, and I. Tanaka, Phys. Rev. B 88, 035305 (2013).
${ }^{58}$ Y. Hinuma, F. Oba, Y. Kumagai, and I. Tanaka, Phys. Rev. B 86, 245433 (2012).
${ }^{59}$ W. Chen, C. Tegenkamp, H. Pfnür, and T. Bredow, Phys. Rev. B 82, 104106 (2010).
${ }^{60}$ F. Oba, M. Choi, A. Togo, A. Seko, and I. Tanaka, Phys.: Condens. Matter 22, 384211 (2010).
${ }^{61}$ F. Oba, M. Choi, A. Togo, and I. Tanaka, Sci. Tech. Adv. Mater. 12, 034302 (2011).
${ }^{62}$ J. Carrasco, N. Lopez, and F. Illas, Phys. Rev. Lett. 93, 225502 (2004).
${ }^{63}$ C. A. Gilbert, S. D. Kenny, R. Smith, and E. Sanville, Phys. Rev. B 76, 184103 (2007).
${ }^{64}$ M. Choi, A. Janotti, and C. G. Van de Walle, J. Appl. Phys. 113, 044501 (2013).
${ }^{65}$ M. Puska, S. Pöykkö, M. Pesola, and R. Nieminen, Phys. Rev. B 58, 1318 (1998).
${ }^{66}$ F. Corsetti and A. A. Mostofi, Phys. Rev. B 84, 035209 (2011).
${ }^{67}$ J. Shim, E.-K. Lee, Y. J. Lee, and R. M. Nieminen, Phys. Rev. B 71, 035206 (2005).
${ }^{68}$ H. J. Monkhorst and J. D. Pack, Phys. Rev. B 13, 5188 (1976).
${ }^{69}$ C. Varvenne, F. Bruneval, M.-C. Marinica, and E. Clouet, Phys. Rev. B 88, 134102 (2013).
${ }^{70}$ K. Momma and F. Izumi, J. Appl. Cryst. 41, 653 (2008).


[^0]:    ${ }^{a}$ References 4041
    ${ }^{b}$ References 1742
    ${ }^{c}$ References 4344
    ${ }^{d}$ Reference 45
    ${ }^{e}$ Reference 46
    ${ }^{\mathrm{f}}$ References 4748
    ${ }^{g}$ The lattice constant in the $c$-direction is fixed to the experimental value.
    ${ }^{h}$ Reference 48
    ${ }^{j}$ References 1750

[^1]:    * yuuukuma@gmail.com

    ${ }^{1}$ R. M. Nieminen, Modell. Simul. Mater. Sci. Eng. 17, 084001 (2009).
    ${ }^{2}$ C. G. Van de Walle and J. Neugebauer, J. Appl. Phys. 95, 3851 (2004).
    ${ }^{3}$ W. R. L. Lambrecht, Phys. Status Solidi B 248, 1547 (2010).
    ${ }^{4}$ P. Rinke, A. Janotti, M. Scheffler, and C. G. Van de Walle, Phys. Rev. Lett. 102, 026402 (2009).
    ${ }^{5}$ F. Oba, A. Togo, I. Tanaka, J. Paier, and G. Kresse, Phys. Rev. B 77, 245202 (2008).
    ${ }^{6}$ W. Chen and A. Pasquarello, Phys. Rev. B 86, 035134 (2012).
    ${ }^{7}$ W. M. C. Foulkes, L. Mitas, R. J. Needs, and G. Rajagopal, Rev. Mod. Phys. 73, 33 (2001).
    ${ }^{8}$ S. B. Zhang, S.-H. Wei, and A. Zunger, Phys. Rev. B 63, 075205 (2001).
    ${ }^{9}$ E. R. Batista, J. Heyd, R. G. Hennig, B. P. Uberuaga, R. L. Martin, G. E. Scuseria, C. J. Umrigar, and J. W. Wilkins, Phys. Rev. B 74, 121102 (2006).
    ${ }^{10}$ A. Alkauskas, P. Broqvist, and A. Pasquarello, Phys. Rev. Lett. 101, 046405 (2008).
    ${ }^{11}$ F. Bruneval, Phys. Rev. Lett. 103, 176403 (2009).
    ${ }^{12}$ S. Lany and A. Zunger, Phys. Rev. B 81, 113201 (2010).
    ${ }^{13}$ A. Grüneis, G. Kresse, Y. Hinuma, and F. Oba, Phys. Rev. Lett. (in press).
    ${ }^{14}$ J. Heyd, G. E. Scuseria, and M. Ernzerhof, J. Chem. Phys. 118, 8207 (2003).
    ${ }^{15}$ A. V. Krukau, O. A. Vydrov, A. F. Izmaylov, and G. E. Scuseria, J. Chem. Phys. 125, 224106 (2006).
    ${ }^{16}$ S. Lany and A. Zunger, Phys. Rev. B 78, 235104 (2008).
    ${ }^{17}$ H.-P. Komsa, T. T. Rantala, and A. Pasquarello, Phys. Rev. B 86, 045112 (2012).
    ${ }^{18}$ L. Kleinman, Phys. Rev. B 24, 7412 (1981).
    ${ }^{19}$ S. Lany and A. Zunger, Modell. Simul. Mater. Sci. Eng. 17, 084002 (2009).
    ${ }^{20}$ S. B. Zhang and J. E. Northrup, Phys. Rev. Lett. 67, 2339 (1991).
    ${ }^{21}$ C. Freysoldt, J. Neugebauer, and C. G. Van de Walle, Phys. Rev.
