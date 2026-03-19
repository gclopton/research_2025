# Active Learning of Linearly Parametrized Interatomic Potentials 

Evgeny V. Podryabinkin ${ }^{1}$, Alexander V. Shapeev ${ }^{2}$<br>Skolkovo Institute of Science and Technology, Moscow, Russia


#### Abstract

This paper introduces an active learning approach to the fitting of machine learning interatomic potentials. Our approach is based on the D-optimality criterion for selecting atomic configurations on which the potential is fitted. It is shown that the proposed active learning approach is highly efficient in training potentials on the fly, ensuring that no extrapolation is attempted and leading to a completely reliable atomistic simulation without any significant decrease in accuracy. We apply our approach to molecular dynamics and structure relaxation, and we argue that it can be applied, in principle, to any other type of atomistic simulation. The software, test cases, and examples of usage are published at http://gitlab.skoltech.ru/shapeev/mlip/.


Keywords: Interatomic potential, Active learning, Learning on the fly, Machine learning, Atomistic simulation, Moment tensor potentials

## 1. Introduction

Many research areas in materials science, molecular physics, chemistry, and biology involve atomistic modeling. For example, in molecular dynamics (MD), as a rule, one of the following two classes of interatomic interaction models is used. The first class is the empirical interatomic potentials-they are very computationally efficient and allow for simulating large atomistic systems for microseconds of simulation time. However, they typically yield only qualitative accuracy. The other class is quantum-mechanical (QM) models, such as the density functional theory (DFT). They are very accurate, but computationally expensive. Their applicability is typically limited to hundreds of atoms and hundreds of picoseconds of simulation time.

Several directions of developing the models that would be both accurate and computationally efficient have been pursued. They include the so-called linear scaling DFT [1, 2, 3] that ensures that the algorithmic complexity grows linearly when the size of the atomistic system increases beyond hundreds of atoms. Another direction is the development of semi-empirical models, such as the tight-binding model [4], whose accuracy and efficiency is between those of the empirical potentials and DFT. In this paper we pursue a more recent approach based on machine learning.

## Machine learning interatomic potentials

Application of machine learning (ML) has recently been put forward as a promising idea that would combine the accuracy of the QM models and the efficiency of the interatomic potentials $[5,6,7,8,9,10,11,12,13,14,15,16,17,18]$. Such machinelearning interatomic potentials (MLIPs) postulate a partitioning

[^0]of the interatomic interaction energy into individual contributions of the atoms (and sometimes bonds, bond angles, etc.) and assume a very flexible functional form for such a contribution, making it a function of the positions of the neighboring atoms, typically with hundreds or more parameters. These parameters are found by requiring the energy, forces and/or stresses predicted by a MLIP to be close to those obtained by a QM model on some atomic configurations. These configurations are called the training set, and finding the parameters of a MLIP is known as training or fitting. One of the important features of MLIPs are their ability to approximate potential energy surfaces with arbitrary accuracy (at least theoretically) by increasing the number of parameters and the training set. It should be noted that there are other, ML-based atomistic models of solids, including those predicting the energy directly without partitioning it [19, 20], or constructing a density functional in a DFT with machine learning [21]. A recent overview of ML-based models of materials can be found in [22].

Each of the existing MLIPs has a nontrivial functional form accounting for the physical symmetries of interatomic interaction. Namely, a MLIP should be invariant with respect to translation, rotation, and reflection of the space, and also permutation of chemically equivalent atoms. In addition, the potential should have a local support (i.e., depend on surrounding atoms only within a finite cut-off radius) and be smooth with respect to atoms coming and leaving the support. In many instances, it is achieved by designing a fixed number of descriptors [23, 24]-scalar functions that satisfy all the symmetries and uniquely encode each atomic environment, and assuming that a MLIP is an arbitrary function (which we call the regression model) of these descriptors. This idea was first put forward by Behler and Parrinello [10] proposing an ML model which they called a neural network potential (NNP), based on their descriptors and neural networks as the regression model. Since
then, there has been many works on NNPs, see the review papers [8, 9] and references therein, and also more recent works [5, 12, 13, 14, 15, 25, 26]. Another group of authors adopted the Gaussian process regression framework [7]. They used the coefficients of spherical harmonics expansion of the smeared atomic positions as descriptors and used the kernel-based ML model, where the kernel was based on the distance between the vectors comprised of those coefficients. In a follow-up paper, [17], the authors refined this idea by proposing the smooth overlap of atomic positions kernel, bypassing the step of designing the descriptors. For other examples of using Gaussian process regression for constructing interatomic potentials refer to [6, 27]. Three closely related works, [28, 29, 30], use Gaussian process regression to predict the forces on atoms directly, without predicting the energy and taking its gradient. Finally, [18] proposes a linear regression model with spherical harmonics coefficients as the basis functions. In the present work, we use the moment tensor potentials (MTPs) [16]. These potentials adopt a linear regression model with polynomial-like functions of atomic coordinates as the basis functions. The MTPs can be interpreted as having descriptors which are based on tensors of inertia of atomic environments.

The MLIPs described above allow for improving their accuracy through increasing the number of the fitting parameters. However, the approximation properties of ML potentials depend not only on their algebraic form, but also on the training set used to fit them. Choosing a good training set for a potential with many parameters (say, more than ten) proves to be a highly nontrivial practical problem. Indeed, all the existing MLIPs are interpolative, they fail to give reasonable answers outside their training domain. Therefore, a good training set should make a MLIP to be interpolative over all the relevant configurations. Obviously, the more parameters a MLIP involves, the larger and more diverse the training set is required in order to fit such a MLIP.

The problem of choosing a proper training set for the fitting of a reliable MLIP is related to the problem of transferabilitythe ability of interatomic potentials to extrapolate, i.e., give reasonable predictions outside the training domain (e.g., predict the double vacancy formation energy if only single vacancies are present in the training set). It is hardly expected that a MLIP can extrapolate beyond the training domain, but even developing a reliable problem-specific MLIP that would accurately interpolate within the training domain is nontrivial, as pointed out, for instance, by Behler [9, Section 4]. As an illustration of this, the authors of [17] sampled gamma surfaces (by shifting, in different ways, a part of a crystal along a glide plane) and included them in the training set, which allowed them to compute the properties of dislocations accurately with the exception of their Peierls barrier. To accurately reproduce the latter they devised a more complicated scheme of generating configurations from the MD trajectories using one version of their potential in order to fit a better version of their potential.

An attractive idea is to attempt to sample the entire space of atomic environments within, for example, a constraint on the minimal interatomic distance. It is, however, not clear how to do this with sufficient accuracy due to extremely high di-
mensionality of the space of atomic neighborhoods. Therefore, in practice, the training set is usually generated by specially designed sampling procedures such as, for example, random perturbations of ideal crystalline configurations [18], sampling from an ab-initio MD, or a classical MD with empirical potential or another (already fitted) MLIP [17]. These sampling procedures, however, do not ensure that the training set covers fully, without "gaps", the region in the configuration space required for training MLIPs reliably. In other words, a potential resulted from such a training procedure may later encounter configurations on which this potential will have to extrapolate.

## Active learning and learning on the fly

The problem of extrapolation could be resolved if a MLIP were able to detect extrapolative configurations, obtain the QM data for those configurations, and be re-trained. In this scenario, the extrapolation problem (or the transferability problem) would be solved by reliably predicting on the fly whether a potential is extrapolating on a given configuration. Alternatively, in the case when learning on the fly cannot be done, the selection of extrapolative configurations can be done offline yielding the training set that improves the transferability of the fitted potential.

Both scenarios are related to a set of ML techniques called active learning (AL). In contrast to passive learning in which a potential learns every configuration in the training set, in AL a potential is trained only on a set of selected configurations. The key component of any AL method is, thus, its query strategyan algorithmic criterion for deciding whether a given configuration can be treated reliably by an ML model, or we need to re-train our model by querying the QM data for this configuration. If such decision can be made reliably then, as we show in this paper, we do not have to ensure that the training set generated offline has all the representative configurations.

A general overview of AL approaches can be found in [31]. In the context of interatomic potentials, the first work that proposed AL was [32] putting forward a Bayesian query-by-committee strategy. AL was applied by Behler to the neural network potentials [9, Section 4], using the query by committee-type AL strategy. Finally, the authors of [33, 34] train a machine learning model predicting the force errors based on the distance between a given atomic configuration and the training set. A very natural AL approach applicable to force fields based on Gaussian process regression [7, 17, 6, 27, 29, 30], which has not yet been implemented in practice, would be to use the Bayesian predictive variance, shown to correlate with the actual error, e.g., in [21].

In this paper we propose another AL approach for MLIPs based on the D-optimality criterion [31, Section 3.5] allowing for detecting the configurations on which a MLIP extrapolates. This criterion was chosen because there exists an efficient algorithm for checking for D-optimality [35]. Also, as will be discussed in this paper, D-optimality has appealing mathematical interpretations, such as decreasing the uncertainty in determining the parameters or maximizing the volume spanned by the training set in the space of configurations, thus avoiding extrapolation. We apply our AL approach to the fitting of MTPs,
however, it is easily generalizable to a any other linear potential, i.e., a potential whose energy depends linearly on the parameters, such as SNAP [18] or GAP. In principle, we can apply AL to atomistic systems with any number of chemically different types of atoms, however, most linearly parametrized potentials developed to date are only applicable to systems with a single type of atoms. We demonstrate that our AL approach allows one to train potentials on the fly with a limited number of QM calculations (occurring, typically, in the initial stage of MD or another atomistic simulation) without loss in accuracy. In addition, we show that even without learning on the fly, AL can "optimize" the training set, in the sense of extracting a significantly smaller subset, training on which reduces the maximal error and improves transferability.

It should be emphasized that the idea of fitting interatomic potentials on-the-fly is not new. The motivation behind this idea is the same as for the MLIPs-to eliminate expensive QM calculations for those configurations (or atomic neighborhoods) which are similar to the configurations already computed. Earlier works [36, 37] proposed a "learning-and-forgetting" scheme, in which the interatomic potentials are fitted to the current QM data, and the old QM data are discarded. A significant step forward was recently done by Li, Kermode and De Vita [29], who proposed a "learning-and-remembering" scheme, in which the database of QM calculations continuously grows with time. It was demonstrated that this approach allows one to reduce the number of QM calculations by a factor of 30 [29]. In all cases, the decision to compute the QM data for a given configuration was taken every $n$ steps (e.g., $n=30$ steps), where $n$ is a fixed number depending on the system, the temperature at which it is simulated, etc. This is the main difference from the approach proposed in the present work: we formulate a query strategy that is based on geometrical information (atomic positions and supercell vectors) of a configuration and does not use the QM data, thus a well-trained potential will trigger the QM calculations very rarely.

## 2. Machine Learning Interatomic Potentials

Let $x$ be a periodic atomistic configuration with $N$ atoms in a supercell $L$. Suppose we can compute, for a given configuration $x$, its QM energy $E^{\mathrm{qm}}(x)$, forces $f_{i}^{\mathrm{qm}}(x)(1 \leq i \leq N)$ and stresses $\sigma^{\mathrm{qm}}(x)$. Such computation typically involves resolving the electronic structure and is very expensive. For the purpose of our paper, we treat such computation as a black box.

### 2.1. Linearly Parametrized Potentials

We next assume that each atom interacts with its neighborhood defined by a cut-off distance $R_{\text {cut }}>0$. The neighborhood $\boldsymbol{r}_{i}=\left(r_{i, 1}, \ldots, r_{i, n}\right)$ of atom $i$ is defined as a collection of vectors pointing from atom $i$ to all the atoms (and their periodic extensions), excluding the atom itself, that are not farther than $R_{\text {cut }}$. The number of atoms in the neighborhood, $n$, may depend on $i$.

We assume that the total interaction energy of a configuration is

$$
E(x)=\sum_{i=1}^{N} V\left(\boldsymbol{r}_{i}\right),
$$

where $V$ is the interatomic potential-a scalar function of the neighborhood $\boldsymbol{r}_{i}$. We define a linearly parametrized local potential as having linear dependence on the fitting parameters $\theta_{j}$ :

$$
V\left(\boldsymbol{r}_{i}\right)=\sum_{j=1}^{m} \theta_{j} B_{j}\left(\boldsymbol{r}_{i}\right)
$$

where $B_{j}$ are the fixed basis functions. The concrete form of the basis functions is not important for what follows, therefore we give the details in the Appendix A on how $B_{j}$ are constructed for the moment tensor potentials (MTPs) [16] used in this work. We define the configuration-dependent basis functions $b_{j}(x):= \sum_{i=1}^{N} B_{j}\left(\boldsymbol{r}_{i}\right)$ and, using (1) and (2), write

$$
E(x)=\sum_{j=1}^{m} \theta_{j} b_{j}(x)
$$

The force $f_{j}(x)$ is a derivative of $E(x)$ with respect to the position of the $j$-th atom, $x_{j}$ :

$$
f_{j}(x)=-\nabla_{x_{j}} E(x), \quad 1 \leq j \leq N,
$$

and the virial stresses are derivatives with respect to lattice vectors

$$
\sigma(x)=\frac{1}{|\operatorname{det}(L)|}\left(\nabla_{L} E(x)\right) L^{\top}
$$

### 2.2. Fitting (training)

A linearly parametrized potential is uniquely determined by the algebraic form, and the values of the fitting parameters $\theta_{j}$. The latter are found through the fitting to the quantummechanical energy, forces, and stresses on a set of configurations $X_{\mathrm{TS}}=\left\{x^{(1)}, \ldots, x^{(K)}\right\}$ which we call the training set.

The simplest form of fitting is requiring $E\left(x^{(k)}\right)=E^{\mathrm{qm}}\left(x^{(k)}\right)$. Expanding the left-hand side yields system of linear algebraic equations on the coefficients $\theta_{j}$ :

$$
\sum_{j=1}^{m} \theta_{j} b_{j}\left(x^{(k)}\right)=E^{\mathrm{qm}}\left(x^{(k)}\right)
$$

In the matrix notation, we can write this system as $\mathrm{A} \theta=R$, where

$$
\mathrm{A}=\left(\begin{array}{ccc}
b_{1}\left(x^{(1)}\right) & \ldots & b_{m}\left(x^{(1)}\right) \\
\vdots & \ddots & \vdots \\
b_{1}\left(x^{(K)}\right) & \ldots & b_{m}\left(x^{(K)}\right)
\end{array}\right)
$$

This system is typically overdetermined ( $K \geq m$ ), therefore we define the solution through the pseudoinverse by $\theta:=\left(\mathrm{A}^{\top} \mathrm{A}\right)^{-1} \mathrm{~A}^{\top} R$.

If the configurations in the training set $X_{\mathrm{TS}}$ are also provided with the forces $f^{\mathrm{qm}}\left(x^{(k)}\right)$ and stresses $\sigma^{\mathrm{qm}}\left(x^{(k)}\right)$ one can add two more families of equations in addition to fitting to the energy:

$$
\begin{aligned}
& C_{\mathrm{f}} f_{i}\left(x^{(k)}\right)=C_{\mathrm{f}} f_{i}^{\mathrm{qm}}\left(x^{(k)}\right), i=1, \ldots, N^{(k)} \\
& C_{\mathrm{s}} \sigma\left(x^{(k)}\right)=C_{\mathrm{s}} \sigma^{\mathrm{qm}}\left(x^{(k)}\right)
\end{aligned}
$$

These equations are combined into a single least-square minimization problem, therefore we need to introduce the coefficients $C_{\mathrm{f}}$ and $C_{\mathrm{s}}$ determining the relative importance of the
force- and stress-fitting equations relative to the energy-fitting equation. Expanding the left-hand side of (6) yields the following equations:

$$
\begin{aligned}
& C_{\mathrm{f}} \sum_{j=1}^{m} \theta_{j} \nabla_{x_{i}} b_{j}\left(x^{(k)}\right)=-C_{\mathrm{f}} f_{i}^{\mathrm{qm}}\left(x^{(k)}\right), \\
& C_{\mathrm{s}} \sum_{j=1}^{m} \frac{\theta_{j}\left(\nabla_{L} b_{j}\left(x^{(k)}\right)\right) L^{(k) \pi}}{\left|\operatorname{det}\left(L^{(k)}\right)\right|}=C_{\mathrm{s}} \sigma^{\mathrm{qm}}\left(x^{(k)}\right), \\
& i=1, \ldots, N^{(k)}, \quad 1 \leq k \leq K .
\end{aligned}
$$

## 3. Active Learning

Active learning allows one to select the training set from a given set of configurations or a stream of configurations. It is done only based on the unlabeled data, i.e., no quantummechanical energy, forces or stresses are required for making the decision about including a particular configuration $x^{*}$ into the training set $X_{\mathrm{TS}}$. In the learning-on-the-fly scenario this means that the quantum-mechanical calculations are done only when the configuration is indeed sufficiently "new". The criterion on whether a given configuration $x^{*}$ should be added to $X_{\mathrm{TS}}$ is called the query strategy.

An overview of various query strategies is presented in [31]. In the present work we employ the variance reduction query strategy based on the D-optimality criterion [31, Section 3.5] and a fast algorithm, called the maxvol algorithm, developed in [35]. A way to derive the D-optimality criterion is to assume that the right-hand side of the equations (5), (7) has a Gaussian random noise and we want to select $m$ out of $K$ equations such that the noise in the solution is minimized. This is equivalent to choosing a subset of equations (5), (7) such that its matrix $\mathrm{A} \in \mathbb{R}^{m \times m}$ has the maximal determinant by its absolute value. Those configurations $x^{(k)}$ that correspond to the selected equations hence form $X_{\mathrm{TS}}$.

The active learning algorithm is determined by the following two choices: what equations are used for the fitting and what equations are used for the selection of the configurations. It should be noted that the two sets of equations need not coincide: for instance, the fitting can be done over all the equations (5), (7), but the selection can be done only based on (5). In the present work we use all the equations for the fitting, and three different versions of the query strategy, as detailed below.

## Query strategy $Q S_{1}$ : Selection by the energy-fitting equation

The first query strategy, labeled as $\mathrm{QS}_{1}$, involves only the energy-fitting equation (5). Given some configuration $x^{*}$, we need to decide whether to insert it to $X_{\mathrm{TS}}=\left\{x^{(1)}, \ldots, x^{(m)}\right\}$. The rows of the matrix A corresponding to $x^{(i)} \in X_{\mathrm{TS}}$ are:

$$
\mathrm{A}=\left(\begin{array}{ccc}
b_{1}\left(x^{(1)}\right) & \ldots & b_{m}\left(x^{(1)}\right) \\
\vdots & \ddots & \vdots \\
b_{1}\left(x^{(m)}\right) & \ldots & b_{m}\left(x^{(m)}\right)
\end{array}\right)
$$

Following the maxvol algorithm [35], we form the row-vector

$$
C:=\left(\begin{array}{lll}
b_{1}\left(x^{*}\right) & \ldots & b_{m}\left(x^{*}\right)
\end{array}\right) \mathrm{A}^{-1}
$$

If we replace the $k$-th row of A by $\left(b_{1}\left(x^{*}\right) \ldots b_{m}\left(x^{*}\right)\right)$ then $|\operatorname{det} \mathrm{A}|$ will change by a factor of $\left|C_{k}\right|$ (the easiest way to see this is to use the Cramer's formula).

Our query strategy is thus as follows. If

$$
\gamma\left(x^{*}\right):=\max _{1 \leq k \leq m}\left|C_{k}\right|>\gamma_{\mathrm{th}},
$$

where we call $\gamma_{\text {th }} \geq 1$ a threshold, then we add $x^{*}$ to the training set and remove $x^{(k)}$ with $k=\arg \max _{k}\left|C_{k}\right|$; otherwise, we keep the $X_{\mathrm{TS}}$ as is. This procedure guarantees that if $x^{(k)}$ is replaced by $x^{*}$ in $X_{\mathrm{TS}}$ then $|\operatorname{det} \mathrm{A}|$ is increased at least by a factor of $\gamma_{\text {th }}$. If in the algorithm one stores $\mathrm{A}^{-1}$ instead of A then the complexity of computing $\gamma\left(x^{*}\right)$ is only $O\left(m^{2}\right)$. When A changes, it also takes $O\left(m^{2}\right)$ operations to update $\mathrm{A}^{-1}$ using the ShermanMorrison [38] rank-one update.

It is worthwhile noting that the elements of $C$ can be interpreted as the coefficients of expressing $E\left(x^{*}\right)$ through $E\left(x^{(k)}\right)$ :

$$
E\left(x^{*}\right)=\sum_{k=1}^{K} C_{k} E\left(x^{(k)}\right)
$$

Hence we can say that if all $\left|C_{k}\right| \leq 1$ then we are interpolating the predicted value of the energy, $E\left(x^{*}\right)$, through the energies $E\left(x^{(k)}\right)=E^{\mathrm{qm}}\left(x^{(k)}\right)$. Hence, $\gamma\left(x^{*}\right)$ defined by (9) has a meaning of a degree of extrapolation that we commit when evaluating $E\left(x^{*}\right)$. Hence we call $\gamma\left(x^{*}\right)$ the extrapolation grade and the parameter $\gamma_{\text {th }} \geq 1$ defines the maximal allowed extrapolation grade. It should be emphasized that $\gamma\left(x^{*}\right)$ does not depend on the QM data and is therefore a geometric feature of the configuration $x^{*}$ and configurations from $X_{\mathrm{TS}}$.

## Query strategy $Q S_{2}$ : Selection by all equations

The second query strategy, $\mathrm{QS}_{2}$, the matrix A is formed by $m$ equations chosen from (5), (7). Thus, each configuration $x^{*}$ yields $1+3 N+6$ rows in place of (8),

$$
\mathrm{C}=\underbrace{\left(\begin{array}{ccc}
b_{1}\left(x^{*}\right) & \ldots & b_{m}\left(x^{*}\right) \\
C_{\mathrm{f}} \nabla_{x_{1}} b_{1}\left(x^{*}\right) & \ldots & C_{\mathrm{f}} \nabla_{x_{1}} b_{m}\left(x^{*}\right) \\
\vdots & \vdots & \vdots
\end{array}\right)}_{=: \mathrm{B}} \mathrm{~A}^{-1},
$$

(here $\nabla_{x_{1}} b_{1}\left(x^{*}\right)$ comes from expanding the force in basis functions) and it is selected for training if

$$
\max _{k, j}\left|\mathrm{C}_{k j}\right|>\gamma_{\text {th }}
$$

We then use the maxvol algorithm [35] to maximize $|\operatorname{det} \mathrm{A}|$; it is a greedy algorithm replacing rows of $A$ with rows of $B$ until $\max _{k, j}\left|\mathrm{C}_{k j}\right| \leq \gamma_{\text {th }}$. The algorithm is detailed in Appendix B. Note that in this query strategy there may be more than one row of A corresponding to one configuration, and thus less than $m$ configurations may be selected into the training set. The algorithm complexity is $O\left(N m^{2}\right)$.

## Query strategy $Q S_{3}$ : Selection by neighborhoods

To formulate the last approach we suppose, for the sake of argument, that we could also fit to the site energies,

$$
\begin{gathered}
V\left(\boldsymbol{r}_{i}^{(k)}\right) \equiv \sum_{j=1}^{m} \theta_{j} B_{j}\left(\boldsymbol{r}_{i}^{(k)}\right)=V_{i}^{\mathrm{qm}(k)} \\
1 \leq k \leq K, \quad 1 \leq i \leq N^{(k)} .
\end{gathered}
$$

Thus, in the third approach, $\mathrm{QS}_{3}, \mathrm{~A}$ is formed by the equations (11). We proceed similarly to $\mathrm{QS}_{2}$ and compose

$$
\mathrm{C}=\underbrace{\left(\begin{array}{ccc}
B_{1}\left(\boldsymbol{r}_{1}^{*}\right) & \ldots & B_{m}\left(\boldsymbol{r}_{1}^{*}\right) \\
\vdots & \vdots & \vdots \\
B_{1}\left(\boldsymbol{r}_{N}^{*}\right) & \ldots & B_{m}\left(\boldsymbol{r}_{N}^{*}\right)
\end{array}\right)}_{=: \mathrm{B}} \mathrm{~A}^{-1} .
$$

Then if $\max _{k, j}\left|\mathrm{C}_{k j}\right|>\gamma_{\text {th }}$ then we replace the rows in A with the rows in B and update $X_{\mathrm{TS}}$ accordingly. As in $\mathrm{QS}_{2}$, there may be more than one row of $B$ corresponding to one configuration, and thus the training set may contain less than $m$ configurations. The algorithm complexity is the same as that of $\mathrm{QS}_{2}, O\left(N m^{2}\right)$. It should be emphasized that no site energies are actually required from quantum mechanical data for the implementation of $\mathrm{QS}_{3}$.

## Learning on the fly

The AL methodology naturally applies to learning on-thefly scenario that combines the interatomic potential evaluation and its learning into a single routine, see Fig. 1. At each iteration of an atomistic simulation, an unlabeled configuration $x^{*}$ comes as an input to an AL procedure, that does the following.

1. Calculate extrapolation grade, $\gamma\left(x^{*}\right)$. If $\gamma\left(x^{*}\right) \leq \gamma_{\text {th }}$ then go to step 5, else
2. Calculate $E^{\mathrm{qm}}\left(x^{*}\right), f^{\mathrm{qm}}\left(x^{*}\right)$, and $\sigma^{\mathrm{qm}}\left(x^{*}\right)$ with a quantum-mechanical model.
3. Update $X_{\mathrm{TS}}$ (and hence A ) with $x^{*}$.
4. Re-fit the MLIP and obtain new $\theta_{1}, \ldots, \theta_{m}$.
5. Return $E\left(x^{*}\right), f\left(x^{*}\right), \sigma\left(x^{*}\right)$ according to the current values of $\theta_{1}, \ldots, \theta_{m}$.

Note that in this scheme the parameter $\gamma_{\text {th }}$ controls the efficiency of the learning-on-the-fly scheme, effectively ignoring configurations which increase $|\operatorname{det} \mathrm{A}|$ only slightly and perform expensive QM calculations only for sufficiently "new" configurations. In practice, there is an optimal range of $\gamma_{\text {th }}$ for which the QM calculations are not done too often, and on the other hand, the extrapolation does not significantly decrease the accuracy of the potential, see Section 4.4.

As another application, AL can be applied to reducing the training set, for instance, when it contains many similar configurations. In Appendix C we show that such offline application of AL improves the transferability of a MLIP and reduces maximal errors as compared to learning from the full database.

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-05_634_613_283_1194.jpg)
Figure 1: Workflow in actively learning a potential on the fly. An activelearning scheme gets an atomistic configuration and returns its energy, forces, and stresses, by possibly retraining the interatomic potential.

## 4. Testing

In this section we test the proposed AL schemes. In Section 4.1 we give an illustratory example of how AL works for a system with one degree of freedom. Then, in Section 4.2 we test the accuracy of the fitting of the MTP potentials [16] on a crystalline Li system, and in Section 4.3 we show that the extrapolation grade $\gamma$ correlates with the error of fitting. Finally, in Section 4.4, we will test learning on the fly.

All the tests are done using the open-source software that we publish at http://gitlab.skoltech.ru/shapeev/mlip/ The distribution package includes the examples of applications described in this section.

### 4.1. A one-dimensional illustration

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-05_371_513_1772_1244.jpg)
Figure 2: A one-dimensional example. The dotted line is the exact energy $E^{\mathrm{qm}}(x)$, the red dashed line is the least-mean-square fit, and the blue solid line is the fit with active learning. The least-mean-square has the lowest possible energy (i.e., is closer to the exact energy in the energy well), but creates a spurious energy barrier around $x=-3$ that changes the correct long-term behavior of the system.

We start by illustrating how the proposed method works in a simple one-dimensional example. Suppose our system has only one degree of freedom, $x \in[-4,4]$, and is described by the energy $E^{\mathrm{qm}}(x)=x^{2}+x^{3} e^{-x^{2} / 2}$, shown in Figure 2, dotted line. We approximate it by a potential $E(x)=\theta_{1} x^{2}+\theta_{2} x^{3}$. Suppose
that we can sample the exact finite-temperature MD arbitrarily long, and we minimize the mean-square error of the fit on these MD samples. This is equivalent to minimizing the free-energy functional

$$
\int_{-4}^{4}\left(E(x)-E^{\mathrm{qm}}(x)\right)^{2} e^{-E^{\mathrm{qm}}(x)} \mathrm{d} x
$$

resulting from a Boltzmann distribution with the dimensionless temperature $k_{\mathrm{B}} T=1$. We then obtain the fit $E(x)= 0.93 x^{2}+0.21 x^{3}$, shown in Figure 2, red dashed line. The root-mean-square error of this fit, defined as the standard deviation of $E(x)-E^{\mathrm{qm}}(x)$ with respect to the Boltzmann distribution, is only 0.25 . However, the major problem is that this fit creates a finite energy barrier around $x=-3$, which would cause the system to occasionally escape the physical region and drive the system to a spurious minimum $x \rightarrow-\infty$.

We next apply the AL approach to this problem by selecting two points (since there are two basis functions) from the interval $[-4,4]$ for the fitting of $E(x)$. The most optimal points are $x_{1}=-4$ and $x_{2}=4$, as they maximize $\operatorname{det}\binom{x_{1}^{2} x_{1}^{3}}{x_{2}^{2} x_{2}^{3}}$. The fit is then $E(x)=x^{2}+3 \cdot 10^{-4} x^{3}$, shown in Figure 2, blue solid line. Its error is 0.46 , but it correctly predicts the barriers at the boundary of the region of interest, and hence the MD will not escape the region of interest.

It thus can be concluded that, at least in this one-dimensional example, AL offers reliability at the cost of a trade-off in accuracy as compared to passive learning. In the following subsections we will see that the difference between passive and active sampling is even more pronounced in a realistic MD-AL offers in practice a completely reliable model at the cost of a marginal error increase.

### 4.2. Accuracy of learning molecular dynamics

In this and the following subsections we perform atomistic simulations of Lithium. The tests are performed in a cubic supercell of 128 Lithium atoms arranged in a b.c.c. lattice. The length of the supercell in each direction is greater than twice the cut-off radius, $2 R_{\text {cut }}=10 \AA$. This ensures that each atomic neighborhood does not contain multiple periodic images of a single atom.

The energies, forces, and stresses were computed using DFT with the VASP code [39, 40, 41], a projected augmented wave (PAW) pseudopotential [42], and the Perdew-Burke-Ernzerhof exchange-correlation functional [43. Lithium is an alkaline metal with one valence electron and therefore its electronic structure can be computed faster than for the other elements, which is helpful in collecting large statistics for the tests.

Before testing our AL approach, we perform a test of accuracy of the MTP potential for Li by fitting to a fixed quantummechanical database. The database was comprised of four abinitio MD trajectories sampling an NVT-ensemble at temperature $T=300 \mathrm{~K}$, each trajectory ran for 6000 time steps, each time step was 1 fs . A sequence of MTPs with different number of basis functions, $m$, was generated; the more basis functions are included, the better is the accuracy. The fitting errors are given in the Table 1. Here and in what follows we report

Table 1: RMS fitting errors in energy, forces and stresses for MTPs with different number of basis functions, $m$. The root-mean-square (RMS) and the maximum errors are quoted.
| $m$ | Energy error | Force error |  | Stress error |  |
| ---: | :---: | :---: | :---: | :---: | :---: |
|  | $(\mathrm{meV} /$ atom $)$ | $(\mathrm{eV} / \AA)$ | $(\%)$ | $(\mathrm{GPa})$ | $(\%)$ |
| 10 | 0.35 | 0.023 | 7.4 | 0.073 | 7.0 |
| 30 | 0.22 | 0.018 | 5.8 | 0.060 | 5.8 |
| 100 | 0.19 | 0.016 | 5.1 | 0.052 | 5.2 |
| 300 | 0.17 | 0.015 | 4.9 | 0.045 | 4.4 |
| 1000 | 0.15 | 0.015 | 4.8 | 0.040 | 3.8 |


the root-mean-square (RMS) error and the maximum error. As can be seen, the potentials systematically converge, however, increasing the number of basis functions beyond 100 , essentially, does not reduce the error. Therefore the results for the subsequent tests will be quoted for the same set of 100 basis functions.

### 4.3. Correlation of the error and the extrapolation grade

We next show that the force error correlates with the extrapolation grade $\gamma\left(x^{*}\right)$. Note that the cost of evaluating $\gamma\left(x^{*}\right)$ is as cheap as a matrix-vector multiplication (or a matrix-matrix multiplication for $\mathrm{QS}_{2}$ and $\mathrm{QS}_{3}$ ), as we do not need to consider the cost of evaluating $\left(b_{1}\left(x^{*}\right) \ldots b_{m}\left(x^{*}\right)\right)$ in (8) (and B for $\mathrm{QS}_{2}$ and $\mathrm{QS}_{3}$ ) since it is required for computing $E(x)$ in any case. The correlation between the error and $\gamma\left(x^{*}\right)$ may be used to assess the applicability of a MLIP to a given configuration $x^{*}$ during an atomistic simulation. Even more important than simply knowing $\gamma$ for configurations appeared in MD, we can store the configurations with high $\gamma$ in order to perform the QM calculations and refit MLIP on them on-the-fly or after the simulation.

We compute the force errors and the extrapolation grade each time step of an MD at $T=300 \mathrm{~K}$. The force errors versus the extrapolation grade are plotted in Figure 3. A good correlation between the two can be observed-this indicates that in practice an extrapolation grade can predict the correct order of magnitude of the error a potential makes on a given configuration without performing a QM calculation.

### 4.4. Learning on the Fly

We next test our AL strategy in a realistic setting of MD and structure relaxation.

We run MD trajectories at $T=300 \mathrm{~K}$ for 100 ps , training an MTP on the fly. Graphs in Figure 4 (a) show the amount of QM calculations as a function of the simulation time. One can see that all query strategies require many QM calculations during an initial phase ( $1-5 \mathrm{ps}$ ) and then gradually move to the regime when QM calculations are required only rarely. $\mathrm{QS}_{1}$ requires about twice more QM calculations as compared to $\mathrm{QS}_{2}$ and $\mathrm{QS}_{3}$.

As one can see from the Figure 4 b) the amount of the QM calculations drops significantly as $\gamma_{\text {th }}$ increases (with $\gamma_{\text {th }}=2$ about four times less QM calculations are required as compared to $\gamma_{\mathrm{th}}=1$ ). On the other hand, as seen from Table 2, the errors

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-07_540_828_315_146.jpg)
Figure 3: Correlation between the extrapolation grade $\gamma(x)$ and the force error $\Delta f(x)=\left(\frac{1}{N} \sum_{i=1}^{N}\left|f_{i}(x)-f_{i}^{\mathrm{qm}}(x)\right|^{2}\right)^{1 / 2}$. Each point on the graph corresponds to an MD time step. For $95 \%$ of configurations the RMS force error is within $[0.04 \gamma, 0.22 \gamma] \mathrm{eV} / \AA$ (dashed lines)-this indicates a good correlation between the error and the extrapolation grade.

essentially do not increase up to $\gamma_{\text {th }}=2$ and only at $\gamma_{\text {th }}=11$ the maximum error exhibits a slight increase (for $\gamma_{\text {th }}>1$ only the errors of $\mathrm{QS}_{1}$ are tabulated, however, the behavior of $\mathrm{QS}_{2}$ and $\mathrm{QS}_{3}$ with increasing $\gamma_{\text {th }}$ is essentially the same). This indicates that one can easily tune the efficiency-versus-accuracy performance of an AL scheme by adjusting $\gamma_{\text {th }}$. Based on our experience, we find that a value for $\gamma_{\text {th }}$ between 2 and 11 is a good choice in practice-it does not significantly reduce the accuracy, while the number of the QM calculations is just a few times higher than the theoretical minimum (which is equal to the number of undetermined parameters).

Table 2: Accuracy for different query strategies and $\gamma_{\text {th }}$.
| Query |  | \#QM | force error |  |
| ---: | ---: | :---: | :---: | :---: |
| strategy | $\gamma_{\text {th }}$ | calcs | (eV/Å | RMS |
|  |  |  | max |  |
| QS $_{1}$ | 1 | 3712 | 0.015 | 0.13 |
| QS $_{1}$ | 1.01 | 3168 | 0.015 | 0.10 |
| QS $_{1}$ | 1.1 | 1958 | 0.016 | 0.19 |
| QS $_{1}$ | 2 | 873 | 0.016 | 0.13 |
| QS $_{1}$ | 11 | 397 | 0.016 | 0.31 |
| QS $_{2}$ | 1 | 1921 | 0.016 | 0.09 |
| QS $_{3}$ | 1 | 1900 | 0.015 | 0.12 |


## Comparison with classical learning on the fly

Next we test the reliability of our AL strategy in a scenario of learning-on-the-fly MD for bulk Li , as in the previous test case. We compare it to a the classical learning-on-the-fly algorithm inspired by [36, 37, 29]. In [29] the authors propose to: (1) learn from an initial, one or few picosecondlong AIMD trajectory, and (2) perform an MD with the trained potential, additionally adding configurations to the training set once in every $N_{\text {step }}$ time steps. For the purpose of illustration, we choose $N_{\text {step }}=100$ and run MD at the melting temperature,
although we note that the authors of [29] report their results for $N_{\text {step }}=30$ at a much lower temperature.

The results of this test are illustrated in Figure 5 . If a potential is trained on a fixed database, it is observed that once in about 15ps the atomistic system escapes into an unphysical region characterized by very low (below $1 \AA$ ) bond lengths. Therefore, to assess the reliability of a potential, we terminate the MD if after some simulation time the minimal distance between atoms becomes smaller than $1.5 \AA$. We call the simulation time after which half the trajectories are terminated (i.e., the trajectory half-life), the failure time. From the transition state theory, we estimate that in an AIMD, the failure time is of the order of $10^{10} \mathrm{~s}$-which is much larger than is accessible even with a classical MD.

Figure 5 illustrates the comparison of classical and active learning. The classical learning-on-the-fly scheme inspired by [29], increases the average failure time from about 15ps to 150 ps at a cost of 1500 additional QM calculations. In contrast, with the proposed active learning-on-the-fly scheme, we ran effectively a $0.5 \mu \mathrm{~s}$-long simulation, which has not failed a single time. We used parallel replica method [44] to access such a long timescale. During this $0.5 \mu \mathrm{~s}$-long trajectory the scheme required only about 50 additional QM calculations (out of them only 5 during the first 150 ps , as compared to 1500 for the classical learning). Thus, the AL approach offers, in practice, a completely reliable scheme as opposed to the classical learning approach at a much smaller cost.

We note that we have observed many classical learning-on-the-fly MD trajectories that fail within the first 5ps of learning of the fly. This means that, in the logic of [29], the initial MD trajectory should be extended beyond 1 ps , at the cost of more QM calculations. Instead, in this work we simply discarded those trajectories when estimating the failure time (otherwise the estimated failure time would be significantly smaller than 150 ps ). It should also be remarked that decreasing $N_{\text {step }}$ from 100 to 30, as suggested in [29], should further improve the reliability of the classical learning on the fly, but this would further increase its cost and will make its failure time more expensive to measure.

## Automatic expansion of the training region

In the next test, we illustrate how the AL scheme allows for an automatic expansion of the region spanned by the training set. We start with the potential from the previous test, trained on the fly for 500 ps at $450 K$. The training set contains 100 crystalline configuration. We then start a new learning-on-thefly MD at 900 K which is well above the melting point.

The performance of learning on the fly is shown in Figure 6. The solid-to-liquid transition occurs after about 200 fs of simulation time and most of learning takes place between 200fs and 300fs. We emphasize that the AL algorithm does not "know" of the temperature change-it makes the decision only based on incoming atomistic configurations.

After learning at 900 K , the prediction errors at lower temperatures somewhat increase. To test this, we actively selected three sets of configurations, sampled at $300 K, 450 K$, and $900 K$, and fitted three potentials on these sets, denoted by $\mathrm{MTP}_{300}$,

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-08_490_1587_264_127.jpg)
Figure 4: Amount of QM calculations in a learning-on-the-fly MD as a function of the MD time step. (a): Comparison of the query strategies; (b): $\mathrm{QS}_{1}$ with different thresholds $\gamma_{\text {th }}$ (first 30 ps ).

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-08_451_796_1005_169.jpg)
Figure 5: Comparison of $a b$ initio molecular dynamics (AIMD) with nolearning MD, classical learning on the fly (LOTF) inspired by [29], and active LOTF. The no-learning and classical LOTF MD are not completely reliable: on average every 15ps the no-learning MD fails, i.e., escapes into an unphysical region in the phase space. The classical LOTF makes this ten times more reliable (failure time of 150 ps ) at the expense of extra 1500 QM calculations. In contrast, the active LOTF makes MD completely reliable (i.e., failures are not observed) at the cost of only 50 QM calculations as measured over the first $0.5 \mu \mathrm{~s}$ of simulation time.

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-08_433_661_1950_237.jpg)
Figure 6: Learning after raising the temperature from 450 K to 900 K . The atomistic system takes about 200fs to liquify, and for the next 100fs the potential does most of learning of liquid configurations. After this, the QM calculations are done only occasionally.

Table 3: Errors of potentials trained at different temperatures when tested on configurations sampled at different temperatures. The absolute errors are in $\mathrm{eV} / \AA$. The relative errors are also given in parenthesis. The potential trained on crystalline configurations (at 300 K or 450 K ) fails on the liquid configurations $(900 K)$. When additionally trained on liquid configurations, the potential shows somewhat higher errors for crystalline configurations, but no longer fails on liquid configurations.
|  | Force error at: |  |  |
| :---: | :---: | :---: | :--- |
| Potential | $300 K$ | $450 K$ | $900 K$ |
| MTP $_{300}$ | $0.016(4.6 \%)$ | $0.022(5.7 \%)$ | 12.1 |
| MTP $_{450}$ | $0.017(4.7 \%)$ | $0.020(5.2 \%)$ | 11.7 |
| MTP $_{900}$ | $0.030(8.4 \%)$ | $0.033(8.5 \%)$ | $0.062(7.0 \%)$ |


$\mathrm{MTP}_{450}$, and $\mathrm{MTP}_{900}$, respectively. The errors of these potentials on these sets are shown in Table 3. The potentials trained on crystalline configurations (at 300 K or 450 K ) fail to predict forces for liquid configurations. Nevertheless, after additional training on liquid configurations, the potential became applicable to both, liquid and crystalline configurations; however, the errors on crystalline configurations became somewhat larger.

## Active learning beyond molecular dynamics

![](./images/83a9eef3-97ae-48ff-ac60-4bfa574528a2-08_410_638_1923_1174.jpg)
Figure 7: An illustration of configurations selected into the training set by active learning. The X -axis is the range of energies per atom of configurations after relaxation. The Y -axis is the number of configurations within a certain energy range. The training set features 24 crystalline configurations and 76 fully or partly liquid.

To illustrate that our AL approach is applicable to other, non-MD simulation, we use AL to relax (i.e., find the nearest local minimum of) the configurations selected in the training set while learning a 900 K MD from the previous test. Relaxation will additionally give us information about the composition of the training set: the configurations learned from MD at $450 K$ should preserve crystalline structure and relax to a perfect crystal, while the configurations learned from MD at 900 K should correspond to the liquid phase and relax to disordered (glasslike) configurations.

Thus, we take each configuration from the training set, relax while learning on the fly, and compare its energy to the energy of a relaxed ideal crystalline configurations. Only 1 of 100 configurations required additional QM calculations while relaxing, which indicates that there were practically no "new" configurations in the process. The result is shown in Figure 7 We see that 24 of 100 configurations in the training set are perfect crystals, some configurations correspond to the onset of melting (solid-liquid coexistence), and some correspond to fully liquid configurations.

It should be noted that extra care should be taken with regards to the fact that the interatomic potential may slightly change while learning on the fly during relaxation. Indeed, if a potential increased after treating a certain configuration, then this configuration may be falsely considered as a local minimum (since after the change in the potential energy, the nearby configurations have higher energies). This issue can be fixed either by re-running the relaxation or formulating the stopping criterion in terms of forces only.

## 5. Discussion

Our results suggest that the proposed learning-on-the-fly algorithms do not, essentially, reduce the accuracy of interatomic potentials while always keeping the MD trajectory within the physical region. It should also be emphasized that the AL algorithm introduces a computational overhead that, at least in our test examples, was less expensive than calculating the energy, forces and stresses. The overhead of retraining our potential was also small compared to the time of calculating the energy, forces and stresses.

Our AL algorithms is not specific to MD and can, in principle, be used with any other type of atomistic simulation, such as structure relaxation, Monte-Carlo sampling, nudge elastic band [45], or the accelerated MD methods [46]. Also, our algorithms can learn configurations with varying number of atoms. This may be important in many applications, including computational structure prediction [12] where the sought configurations may be of unknown size.

The choice of the D-optimality criterion, which our AL algorithms are based on, was motivated by reducing uncertainty in the parameters of potential. However, there is also another interpretation. For example, the elements of the matrix A in $\mathrm{QS}_{1}$, $b_{j}\left(x^{(k)}\right)$, can be considered as descriptors of the configuration $x^{(k)}$, each configuration is characterized by an $m$-dimensional descriptor vector. In this sense the D-optimality criterion maximizes the volume of the simplex in $\mathbb{R}^{m}$ formed by $m$ descrip-
tor vectors. In the same way $B_{j}\left(\boldsymbol{r}_{i}^{(k)}\right)$, which are the elements of matrix A in $\mathrm{QS}_{3}$, can be considered as the descriptors of a neighborhood of atom $i$ of $k$-th configuration. Therefore, $\mathrm{QS}_{3}$ "catches" configurations with the most different atomic neighborhoods in the sense of the D-optimality criterion. This property of $\mathrm{QS}_{3}$ can be useful in designing algorithms of a learning-on-the-fly MD with million or more atoms where training has to be done on local environments completed to small configurations.

## 6. Conclusion

Machine learning interatomic potentials offer a promising way of combining the accuracy of quantum mechanics and the computational efficiency of the empirical interatomic potentials. However, the weak point of the machine learning interatomic potentials is reliability-the more general and accurate they are required to be, the harder it is to generate offline the training dataset that ensures no extrapolation at the online evaluation stage. In the present work we have shown that this problem can be solved by applying active learning to the fitting of the machine learning interatomic potentials.

We have proposed a new active learning scheme based on the D-optimality criterion and have shown empirically that it yields an accurate, computationally efficient, and reliable interatomic interaction model. In particular, using active learning in the learning-on-the-fly scenario fully resolves the transferability problem-active learning detects when extrapolation is attempted and retrains the potential on those configurations. In the case when learning on the fly cannot be performed, the proposed active learning techniques allow one to control the degree of extrapolation. The software, test cases, and examples of usage are published at http://gitlab.skoltech. ru/shapeev/mlip/.

## Acknowledgments

The authors thank Prof. Ivan Oseledets for useful discussions of application of the D-optimality criterion in active learning, in particular for directing our attention to the maxvol algorithm [35]. This work was supported by the Skoltech NGP Program No. 2016-7/NGP (a Skoltech-MIT joint project). A part of the work was done by A.S. during the Fall 2016 long program at the Institute of Pure and Applied Mathematics, UCLA.

## References

## References

[1] E. Artacho, D. Snchez-Portal, P. Ordejn, A. Garca, J. M. Soler, Linearscaling ab-initio calculations for large and complex systems, physica status solidi (b) 215 (1) (1999) 809-817.
[2] C.-K. Skylaris, P. D. Haynes, A. A. Mostofi, M. C. Payne, Introducing ONETEP: Linear-scaling density functional simulations on parallel computers, The Journal of chemical physics 122 (8) (2005) 084119.
[3] D. R. Bowler, T. Miyazaki, Calculations for millions of atoms with density functional theory: linear scaling shows its potential, Journal of Physics: Condensed Matter 22 (7) (2010) 074207.
[4] M. Finnis, Interatomic forces in condensed matter, Vol. 1, OUP Oxford, 2003.
[5] N. Artrith, A. M. Kolpak, Grand canonical molecular dynamics simulations of $\mathrm{Cu}-\mathrm{Au}$ nanoalloys in thermal equilibrium using reactive ANN potentials, Computational Materials Science 110 (2015) 20-28.
[6] A. P. Bartók, M. J. Gillan, F. R. Manby, G. Csányi, Machine-learning approach for one-and two-body corrections to density functional theory: Applications to molecular and condensed water, Physical Review B 88 (5) (2013) 054104.
[7] A. P. Bartók, M. C. Payne, R. Kondor, G. Csányi, Gaussian approximation potentials: The accuracy of quantum mechanics, without the electrons, Phys. Rev. Lett. 104 (2010) 136403. doi:10.1103/PhysRevLett. 104.136403
[8] J. Behler, Neural network potential-energy surfaces in chemistry: a tool for large-scale simulations, Physical Chemistry Chemical Physics 13 (40) (2011) 17930-17955.
[9] J. Behler, Representing potential energy surfaces by high-dimensional neural network potentials, Journal of Physics: Condensed Matter 26 (18) (2014) 183001.
[10] J. Behler, M. Parrinello, Generalized neural-network representation of high-dimensional potential-energy surfaces, Physical review letters 98 (14) (2007) 146401.
[11] J. R. Boes, M. C. Groenenboom, J. A. Keith, J. R. Kitchin, Neural network and ReaxFF comparison for Au properties, International Journal of Quantum Chemistry 116 (13) (2016) 979-987 .
$[12]$ P. E. Dolgirev, I. A. Kruglov, A. R. Oganov, Machine learning scheme for fast extraction of chemically interpretable interatomic potentials, AIP Advances 6 (8) (2016) 085318.
[13] M. Gastegger, P. Marquetand, High-dimensional neural network potentials for organic reactions and an improved training algorithm, Journal of chemical theory and computation 11 (5) (2015) 2187-2198.
[14] S. Manzhos, R. Dawes, T. Carrington, Neural network-based approaches for building high dimensional and quantum dynamics-friendly potential energy surfaces, International Journal of Quantum Chemistry 115 (16) (2015) 1012-1020.
[15] S. K. Natarajan, T. Morawietz, J. Behler, Representing the potentialenergy surface of protonated water clusters by high-dimensional neural network potentials, Physical Chemistry Chemical Physics 17 (13) (2015) 8356-8371.
[16] A. V. Shapeev, Moment tensor potentials, Multiscale Model. Simul. 14 (3) (2016) 1153-1173.
[17] W. J. Szlachta, A. P. Bartók, G. Csányi, Accuracy and transferability of Gaussian approximation potential models for tungsten, Physical Review B 90 (10) (2014) 104108.
[18] A. Thompson, L. Swiler, C. Trott, S. Foiles, G. Tucker, Spectral neighbor analysis method for automated generation of quantum-accurate interatomic potentials, Journal of Computational Physics 285 (2015) 316330.doi:http://dx.doi.org/10.1016/j.jcp.2014.12.018
[19] F. Faber, A. Lindmaa, O. A. von Lilienfeld, R. Armiento, Crystal structure representations for machine learning models of formation energies, International Journal of Quantum Chemistry 115 (16) (2015) 1094-1101.
[20] M. Rupp, A. Tkatchenko, K.-R. Müller, O. A. Von Lilienfeld, Fast and accurate modeling of molecular atomization energies with machine learning, Physical review letters 108 (5) (2012) 058301.
[21] J. C. Snyder, M. Rupp, K. Hansen, K.-R. Müller, K. Burke, Finding density functionals with machine learning, Physical review letters 108 (25) (2012) 253002.
[22] T. Mueller, A. G. Kusne, R. Ramprasad, Machine learning in materials science: Recent progress and emerging applications, Rev. Comput. Chem.
[23] A. P. Bartók, R. Kondor, G. Csányi, On representing chemical environments, Physical Review B 87 (18) (2013) 184115.
[24] J. Behler, Atom-centered symmetry functions for constructing highdimensional neural network potentials, The Journal of chemical physics 134 (7) (2011) 074106.
[25] J. S. Smith, O. Isayev, A. E. Roitberg, Ani-1: an extensible neural network potential with DFT accuracy at force field computational cost, Chem. Sci. 21 (1) (2017) 124-127. doi:10.1039/C6SC05720A
[26] N. Artrith, A. Urban, An implementation of artificial neural-network potentials for atomistic materials simulations: Performance for tio 2, Computational Materials Science 114 (2016) 135-150.
[27] V. L. Deringer, G. Csányi, Machine learning based interatomic
potential for amorphous carbon Phys. Rev. B 95 (2017) 094203. doi:10.1103/PhysRevB.95.094203
URL https://link.aps.org/doi/10.1103/PhysRevB.95. 094203
[28] V. Botu, R. Ramprasad, Learning scheme to predict atomic forces and accelerate materials simulations, Physical Review B 92 (9) (2015) 094306.
[29] Z. Li, J. R. Kermode, A. De Vita, Molecular dynamics with on-the-fly machine learning of quantum-mechanical forces, Phys. Rev. Lett. 114 (2015) 096405. doi:10.1103/PhysRevLett.114.096405
[30] A. Glielmo, P. Sollich, A. De Vita, Accurate interatomic force fields via machine learning with covariant kernels Phys. Rev. B 95 (2017) 214302. doi:10.1103/PhysRevB.95.214302
URL https://link.aps.org/doi/10.1103/PhysRevB.95. 214302
[31] B. Settles, Active learning literature survey, Computer Sciences Technical Report 1648, University of Wisconsin-Madison (2009).
[32] S. L. Frederiksen, K. W. Jacobsen, K. S. Brown, J. P. Sethna, Bayesian ensemble approach to error estimation of interatomic potentials, Physical review letters 93 (16) (2004) 165501.
[33] V. Botu, R. Ramprasad, Adaptive machine learning framework to accelerate ab initio molecular dynamics, International Journal of Quantum Chemistry 115 (16) (2015) 1074-1083.
[34] V. Botu, J. Chapman, R. Ramprasad, A study of adatom ripening on an al (111) surface with machine learning force fields, Computational Materials Science 129 (2017) 332-335.
[35] S. Goreinov, I. Oseledets, D. Savostyanov, E. Tyrtyshnikov, N. Zamarashkin, How to find a good submatrix, in: Matrix Methods: Theory, Algorithms, Applications, Word Scientific, 2010, pp. 247-256.
[36] A. De Vita, R. Car, A novel scheme for accurate MD simulations of large systems, in: MRS Proceedings, Vol. 491, Cambridge Univ Press, 1997, p. 473.
[37] G. Csányi, T. Albaret, M. Payne, A. De Vita, learn on the fly: a hybrid classical and quantum-mechanical molecular dynamics simulation, Physical review letters 93 (17) (2004) 175503.
[38] J. Sherman, W. J. Morrison, Adjustment of an inverse matrix corresponding to a change in one element of a given matrix, The Annals of Mathematical Statistics 21 (1) (1950) 124-127.
[39] G. Kresse, J. Hafner, Ab initio molecular dynamics for liquid metals, Physical Review B 47 (1) (1993) 558.
[40] G. Kresse, J. Furthmüller, Efficiency of ab-initio total energy calculations for metals and semiconductors using a plane-wave basis set, Computational Materials Science 6 (1) (1996) 15-50.
[41] G. Kresse, J. Furthmüller, Efficient iterative schemes for ab initio totalenergy calculations using a plane-wave basis set, Physical review B 54 (16) (1996) 11169.
[42] P. E. Blöchl, Projector augmented-wave method, Physical Review B 50 (24) (1994) 17953. doi:10.1103/PhysRevB. 50.17953
[43] J. P. Perdew, K. Burke, M. Ernzerhof, Generalized gradient approximation made simple, Physical review letters 77 (18) (1996) 3865. doi: 10.1103/PhysRevLett. 77.3865
[44] A. F. Voter, Parallel replica method for dynamics of infrequent events, Physical Review B 57 (22) (1998) R13985.
[45] G. Mills, H. Jónsson, G. K. Schenter, Reversible work transition state theory: application to dissociative adsorption of hydrogen, Surface Science 324 (2-3) (1995) 305-337.
[46] A. F. Voter, M. R. Sørensen, Accelerating atomistic simulations of defect dynamics: hyperdynamics, parallel replica dynamics, and temperatureaccelerated dynamics, in: MRS Proceedings, Vol. 538, Cambridge Univ Press, 1998, p. 427.

## Appendix A: Functional Form of MTPs

We used the Moment Tensor Potentials (MTPs) [16] that have the following functional form

$$
V\left(\boldsymbol{r}_{i}\right)=\sum_{j=1}^{m} \theta_{j} B_{j}\left(\boldsymbol{r}_{i}\right),
$$

where $\theta_{j}$ are the model parameters and $B_{j}$ are the basis functions indexed by $k \times k$ integer symmetric matrices $\alpha_{j} \in \mathbb{N}^{k \times k}$, (where $\mathbb{N}=\{0,1, \ldots\}), j=1, \ldots, m$ as follows. We let $\mathcal{N}:= \{1, \ldots, N\}, \alpha \in \mathbb{N}^{k \times k}$ and define, with a slight abuse of notation, the functional form of the basis functions by

$$
B_{\alpha}\left(\boldsymbol{r}_{i}\right)=\sum_{\gamma \in \mathcal{N}^{k}}\left(\prod_{\ell, m=1}^{k}\left(r_{i, \gamma_{m}} \cdot r_{i, \gamma_{\ell}}\right)^{\alpha_{m, \ell}}\right)\left(\prod_{\ell} f_{\alpha_{\ell, \ell}}\left(\left|r_{i, \gamma_{\ell}}\right|\right)\right),
$$

where $f_{\mu}=f_{\mu}(\rho)(\mu \in \mathbb{N})$ is the set of radial basis functions that vanish for $\rho>R_{\text {cut }}$. If, for the sake of argument, we chose $f_{\mu}(\rho)=\rho^{2 \mu}$ then $B_{\alpha}$ is a polynomial of degree $\sum_{i, j=1}^{k} \alpha_{i, j}$. Therefore, the set of $\alpha$ is chosen to include all $\alpha$ such that $\sum_{i, j=1}^{k} \alpha_{i, j} \leq \operatorname{deg}$, where deg thus limits the "degree" of $B_{\alpha}$. From the definition it seems that computing $B_{\alpha}$ is very expensive, however, there is a fast algorithm for computing $B_{\alpha}$ and their derivatives, refer for the details to [16]. In particular, $B_{\alpha}$ are expressed as tensorial contractions of the following tensorvalued descriptors

$$
M_{\mu, v}\left(\boldsymbol{r}_{i}\right)=\sum_{j} f_{\mu}\left(r_{i j}\right) \underbrace{r_{i j} \otimes \ldots \otimes r_{i j}}_{v \text { times }},
$$

where $r_{i j} \otimes \ldots \otimes r_{i j}$ is the outer product of $r_{i j}$ with itself $v$ times, and $\mu, \nu$ depend on $\alpha$. These descriptors have an interpretation of moments of inertia of the atomic environment of $i$ th atom in the following sense. If $f_{\mu}\left(r_{i j}\right)$ is the weight of the atom $j$ in the neighborhood of the atom $i$ then $M_{\mu, 0}$ is the mass of the neighborhood (or, in other words, the 0-th moment of inertia), $M_{\mu, 1}$ is the vector of the first moments of inertia (then the center of mass of the neighborhood relative to the atom $i$ is $M_{\mu, 1} / M_{\mu, 0}$ ), $M_{\mu, 2}$ is the matrix of the second moments of inertia, etc.

## Appendix B: Maxvol algorithm

The query strategies $\mathrm{QS}_{2}$ and $\mathrm{QS}_{3}$ require finding the $m \times m$ submatrix A with maximal $|\operatorname{det} \mathrm{A}|$ (or, in other words, with the maximal volume) in an $k \times m$ matrix B . This is done by the maxvol algorithm [35]. This algorithm is based on greedy selection of rows from B. Each iteration of this algorithm has $O(m k)$ complexity. The algorithm is as follows.

1. Start with an initial (e.g., randomly chosen) $m \times m$ submatrix $A$ of $B$ and calculate $C=B A^{-1}$.
2. Find the maximal by absolute value element $\mathrm{C}_{i j}$ in this matrix.
3. If $\left|\mathrm{C}_{i j}\right|>\gamma_{\text {th }}$ then:
3.1 swap the $i$-th row of A with the $j$-th row of B ,
3.2 update $\mathrm{C}=\mathrm{BA}^{-1}$ using the Sherman-Morrison [38] rank-one update,
3.3 go to step 2.

The smaller the threshold parameter $\gamma_{\text {th }}>1$ is, the larger $|\operatorname{det} \mathrm{A}|$ will be, at the cost of making more iterations.

Table 4: Errors of fitting of different AL approaches.
| Query strategy | $\# X_{\mathrm{TS}}$ | energy error (meV/atom) |  | force error ( $\mathrm{eV} / \AA$ ) |  | stress error (GPa) |  |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|  |  | RMS | max | RMS | max | RMS | max |
| passive | 24000 | 0.19 | 0.82 | 0.016 | 0.13 | 0.052 | 0.13 |
| random | 100 | 0.21 | 0.92 | 0.017 | 0.28 | 0.057 | 0.14 |
| $\mathrm{QS}_{1}$ | 100 | 0.21 | 0.78 | 0.016 | 0.10 | 0.053 | 0.13 |
| $\mathrm{QS}_{2}$ | 84 | 0.25 | 0.89 | 0.016 | 0.10 | 0.056 | 0.13 |
| $\mathrm{QS}_{3}$ | 92 | 0.23 | 0.79 | 0.016 | 0.09 | 0.057 | 0.13 |


## Appendix C: Active Learning from a Database

In this section we show that AL offers some advantages when learning from a given database as opposed to passive learning.

## Errors of fitting

We compare the errors of the fitting of the MTP with 100 basis functions using five different strategies, namely fitting on the entire database (passive learning), selecting 100 random configurations, and three AL approaches. The result for the random selection was averaged over 16 independent samples.

As can be seen from Table 4 , all AL methods yield marginal increase in the RMS error as compared to passive learning and a significant decrease in the maximal error. Also, they produce smaller errors than the random selection query strategy. This indicates the efficiency of the AL methods. Thus, applying the proposed AL methods to offline learning allow one to reduce the size of $X_{\mathrm{TS}}$ (resulting in acceleration of the training stage) while keeping the accuracy essentially at the same level as for the fitting on the entire evaluation set.

## Reliability

Finally, we have performed a test of reliability when the potentials are trained offline. We use the potentials from the previous test fitted on MD trajectories at $T=300 \mathrm{~K}$ and use them in MD at $T=300 \mathrm{~K}$ and $T=450 \mathrm{~K}$. We measure the failure time, i.e., simulation time until the minimal interatomic distance becomes less then $1.5 \AA$. We performed 100 MD runs and calculated the expected failure time for different MTPs. These results are presented in Table 5.

Table 5: Average failure time, i.e., simulation time until some bond is compressed to $1.5 \AA$.
| Query |  | failure time (ns) |  |
| ---: | ---: | :---: | :---: |
| strategy | $\# X_{\text {TS }}$ | $T=300 \mathrm{~K}$ | $T=450 \mathrm{~K}$ |
| passive | 24000 | 0.18 | 0.06 |
| random | 100 | 0.17 | 0.03 |
| $\mathrm{QS}_{1}$ | 100 | 0.66 | 0.04 |
| $\mathrm{QS}_{2}$ | 84 | 1.29 | 0.06 |
| $\mathrm{QS}_{3}$ | 92 | 3.84 | 0.16 |


As one can see, the actively learned MTPs are more stable as compared to the passively learned ones. In other words, they have better transferability-the ability of the potential to make
a prediction for configurations sufficiently different from those in the training set. We argue that this is achieved because AL, in some sense, selects the "most different" configurations for training, resulting in a smaller degree of extrapolation if used on a different evaluation set. Interestingly the neighborhoodbased $\mathrm{AL}, \mathrm{QS}_{3}$, shows by far the best results then the other two AL approaches. We speculate that this is because the failure most likely happens locally, when two atoms come too close, and $\mathrm{QS}_{3}$ naturally selects such configurations for training.


[^0]:    ${ }^{1}$ e-mail: e.podryabinkin@skoltech.ru
    ${ }^{2}$ e-mail: a.shapeev @ skoltech.ru

