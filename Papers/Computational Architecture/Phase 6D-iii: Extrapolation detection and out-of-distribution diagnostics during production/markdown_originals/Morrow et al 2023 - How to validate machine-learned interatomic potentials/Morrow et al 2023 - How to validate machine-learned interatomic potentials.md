## How to validate machine-learned interatomic potentials ©

Joe D. Morrow © ; John L. A. Gardner (D) ; Volker L. Deringer (B)
Check for updates
J. Chem. Phys. 158, 121501 (2023)
https://doi.org/10.1063/5.0139611

## Articles You May Be Interested In

Fine-tuning universal machine-learned interatomic potentials: A Tutorial on methods and applications
J. Appl. Phys. (January 2026)

PANNA 2.0: Efficient neural network interatomic potentials and new architectures
J. Chem. Phys. (August 2023)

Machine learning for interatomic potential models
J. Chem. Phys. (February 2020)
![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-01_419_1522_2234_445.jpg)

# How to validate machine-learned interatomic potentials ( ${ }^{3}$ 

Cite as: J. Chem. Phys. 158, 121501 (2023); doi: $10.1063 / 5.0139611$<br>Submitted: 21 December 2022 • Accepted: 28 February 2023 •<br>Published Online: 24 March 2023

Joe D. Morrow, (D) John L. A. Gardner, (D) and Volker L. Deringer ${ }^{\text {a) }}$ (D)<br>AFFILIATIONS<br>Department of Chemistry, Inorganic Chemistry Laboratory, University of Oxford, Oxford OX1 3QR, United Kingdom<br>${ }^{\text {a) }}$ Author to whom correspondence should be addressed: volker.deringer@chem.ox.ac.uk


#### Abstract

Machine learning (ML) approaches enable large-scale atomistic simulations with near-quantum-mechanical accuracy. With the growing availability of these methods, there arises a need for careful validation, particularly for physically agnostic models-that is, for potentials that extract the nature of atomic interactions from reference data. Here, we review the basic principles behind ML potentials and their validation for atomic-scale material modeling. We discuss the best practice in defining error metrics based on numerical performance, as well as physically guided validation. We give specific recommendations that we hope will be useful for the wider community, including those researchers who intend to use ML potentials for materials "off the shelf."


© 2023 Author(s). All article content, except where otherwise noted, is licensed under a Creative Commons Attribution (CC BY) license (http://creativecommons.org/licenses/by/4.0/). https://doi.org/10.1063/5.0139611

## I. INTRODUCTION

Machine learning (ML)-based interatomic potentials are becoming increasingly popular for mainstream material modeling. ${ }^{1-5}$ ML potentials are "trained" using quantum-mechanical reference data (energies and forces on atoms) and, once developed and properly validated, enable large-scale atomistic simulations at a similar level of quality while requiring only a small fraction of the computational cost. In recent years, ML potentials have been used to address fundamental research questions that would otherwise have been inaccessible for quantum-accurate studies: the complex high-pressure phase behavior of seemingly simple elements, ${ }^{6-8}$ the microscopic growth mechanism of amorphous carbon films, ${ }^{9}$ or the photodynamics of a biologically relevant molecule. ${ }^{10}$ At the same time, ML potentials are being developed for diverse functional materials, with applications including phase-change chalcogenides, ${ }^{11,12}$ battery electrodes and solid-state electrolytes, ${ }^{13-16}$ and multicomponent alloys. ${ }^{17,18}$ The field is thriving, without any doubt.

With ML potentials becoming increasingly available, it becomes important to ensure careful validation of both the overall methods and specific models. This requirement is particularly important for machine-learned data-driven models, which do not have (much) physical information "built in" by construction. A key step in validation was reported by Zuo et al., who performed
a detailed study of numerical energy and force prediction errors across different types of ML potentials. ${ }^{19}$ The focus of that work was on the fair comparison on different fitting frameworks, and on the identification of a "Pareto front" of efficiency, i.e., of the respective most accurate methods and settings at a given level of computational cost. The validation tests used by Zuo et al. included liquid and crystalline structures for a number of elements, ${ }^{19}$ and an advantage of this protocol is that it could, in principle, be applied to any elemental system. In contrast, a recent publication on a carbon ML potential includes various more subject-specific (or "domainspecific") tests, such as the formation energies of specific topological defects in graphene, ${ }^{20}$ and extended benchmarking and more complex tests were later carried out by other groups. ${ }^{21-23}$ Earlier, de Tomas et al. had stressed the importance of careful property-based validation for carbon potentials, including an ML-based example, as well as established empirical potentials. ${ }^{24,25}$ Indeed, many questions on validation are relevant for any type of interatomic potential, machine-learned or otherwise. Finally, the importance of validating ML potentials based not only on numerical error values but also on the predicted physical behavior is being pointed out increasingly in the literature.

The aim of the present work is to review and discuss the validation criteria for ML potentials in a "tutorial" style. It covers both numerical and physically guided validation, while being clearly
focused on ML potential models for atomistic simulations. We aim to complement related works by others: more generally on error and uncertainty measures for ML models of various types, ${ }^{30-32}$ and recently published general best-practice guidelines for the use of ML in chemistry. ${ }^{33,34}$ Our work focuses strongly on inorganic materials, and we refer the reader to an excellent tutorial on neural network (NN) potentials, which places stronger emphasis on molecular force fields-for example, for water. ${ }^{35}$ In what follows, we provide a brief overview of relevant methods and concepts, illustrative examples, and best-practice recommendations.

## II. WHAT ARE ML POTENTIALS?

To set the scene, we start by briefly reviewing what ML potentials are in the first place. We will focus on the major types of choices to be made in developing ML potentials and how these choices affect the quality of the model. A reader who is familiar with the methodology may wish to skip to Sec. III.

Machine learning means extracting information from large datasets-in this case, from quantum-mechanical energies and forces. An ML potential is, therefore, a complex mathematical model for a given potential energy surface (PES) whose parameters have been learned from reference data (the ground truth). There are three main ingredients for doing so, ${ }^{2}$ as shown in Fig. 1(a).

The first step in constructing an ML potential is building the reference database to which the fit is made: devising and selecting small-scale structural models that contain enough "relevant" chemical environments to give the model high accuracy where needed, as well as sufficient constraints for it to be valid. Once representative structures (in ML terms, data locations) have been chosen, they are given reference values (data labels): energies, forces, and stresses as computed with the ground-truth method. For inorganic materials, the latter is typically some flavor of the density-functional theory (DFT). Higher-level, beyond-DFT computations are beginning to be used as well. ${ }^{37}$

In terms of how reference data determine the quality of an ML potential [Fig. 1(b)], two aspects are relevant-corresponding to the horizontal and vertical axes in the sketches of Fig. 1, respectively. On one hand, the judicious choice of data locations (for which configurations exactly do we want to fit?) is important: this choice can be guided by the practitioner's physical and chemical knowledge, or by automated active learning approaches for steering the database building, ${ }^{38-40}$ or both. However, even with carefully crafted datasets, there remains a risk of potentials not having "seen" what they need, resulting in poor extrapolation outside the training domain and, consequently, in incorrect behavior. On the other hand, the nature and quality of the data labels are important. Any ML potential will reproduce at best the level of data on which it has been trained: for

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-03_914_1744_1226_158.jpg)
FIG. 1. Machine learning interatomic potentials. (a) General overview of the methodology, with the three main "ingredients" highlighted. ${ }^{2,36}$ The database (point 1) contains representative structural models that are labeled with ground-truth energies and forces [typically obtained using the density-functional theory (DFT)]. The representation encodes the atomic environment, expressed by the general vector $\boldsymbol{q}$. The regression task creates the model, $\tilde{E}$, and in current ML potential models, it is common to predict the total energy as a sum of machine-learned local energies, $\tilde{\varepsilon}_{j}$. (b) Criteria and choices that affect the quality of an ML potential, indicated by highly schematic sketches. The color-coding corresponds to panel (a) and indicates the effects of reference databases in green, representations (descriptors) in turquoise, and the regression framework in blue. Panel (a) is adapted from earlier overview articles in V. L. Deringer, M. A. Caro, and G. Csányi, Adv. Mater. 31, 1902765 (2019). Copyright 2019 Wiley-VCH Verlag GmbH \& Co. KGaA, Weinheim and V. L. Deringer, J. Phys. Energy 2, 041003 (2020). Copyright 2020 Author(s) licensed under a Creative Commons Attribution 4.0 License.

example, if the reference data labels have been computed with a simple DFT functional that does not correctly capture van der Waals interactions, neither will the resulting ML potential. The role of the numerical quality of the data (e.g., the fact that strict convergence with $k$-point sampling is required) has been pointed out in Ref. 41, and has been systematically analyzed recently. ${ }^{42}$

The second step is to represent the local environments of the atoms in the database in a mathematical form that is suitable for learning. The tool for this task is most commonly called a descriptor in the community and is analogous to a set of features in ML research. A good descriptor is invariant (unchanged) with respect to translations, rotations, and permutations of atoms, and is as complete as possible ${ }^{45}$ while remaining numerically efficient. Many currently established ML potentials rely on hand-crafted descriptors constructed from radial and angular basis functions, ${ }^{46-48}$ and other recent approaches "learn" a structural representation as part of the potential fit. ${ }^{49,50}$ The construction of structural descriptors for atomistic ML has been reviewed in Ref. 51.

Again, the user's choices here will affect the quality of the resulting potential [central panels in Fig. 1(b)]. For example, models based purely on pair-wise, "2-body" descriptors may work well for bulk metals but not for covalent systems. ${ }^{52}$ Then, there is the choice of hyperparameters, i.e., of those parameters that are not directly optimized when training a single instance of a model. As one of many examples, the cartoon in Fig. 1(b) indicates the
varied atomic density broadening that can be chosen in the Smooth Overlap of Atomic Positions (SOAP) descriptor: ${ }^{47}$ larger values can make potentials robust enough for structure searching, while smaller values are needed for highly accurate predictions. ${ }^{53}$

The third step is to fit a flexible (highly parameterized) function to the reference data. Among the main classes of fitting approaches currently used for ML potentials, there are (i) artificial neural network (NN) models such as Behler-Parrinello-type NNs ${ }^{54-56}$ or the DeepMD, ${ }^{57}$ SchNet, ${ }^{49}$ and NequIP ${ }^{50}$ schemes; (ii) kernel-based methods such as the Gaussian Approximation Potentials (GAP) framework; ${ }^{58}$ and (iii) linear models including the Spectral Neighbor Analysis Potential (SNAP), ${ }^{48}$ Moment Tensor Potential (MTP), ${ }^{59}$ and Atomic Cluster Expansion (ACE) ${ }^{60}$ techniques. There are interesting connections between the different methodologies-for example, a recently proposed "multi-layer" ACE approach ${ }^{61}$ combines the ACE descriptors with message-passing NN architectures. We leave details of the available fitting methodologies to recent review articles. ${ }^{4,41,62}$

The third set of user choices, therefore, concerns the regression framework itself. ${ }^{63}$ Does one want a highly flexible deep learning model requiring lots of data, or a "tailored" kernel-based approach that can make do with fewer examples? What are the hyperparameters of the fit: in GAPs, the regularization ("expected error") is important; ${ }^{41}$ NNs depend on the learning rate and batch size; other methods will be affected by other aspects. For the purpose of the

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-04_890_1711_1252_176.jpg)
FIG. 2. Validity of interatomic potentials and the effect of false maxima or minima. (a)-(c) Schematic drawings indicating the fit between a reference potential energy surface (PES), sketched as dashed lines, and the potential model that approximates it, sketched as solid blue lines. If a false maximum exists, the simulation is not able to reach the relevant local minimum. If a false minimum exists, the potential will readily visit a spurious minimum that corresponds to a physically incorrect structure, and once there, the simulation cannot easily revert to other regions of the PES (even if those were correctly described). Drawn following Ref. 43. (d)-(f) Examples from compression simulations for silicon. The reference is a recent study of the high-pressure structural changes. ${ }^{7}$ The "false maximum" scenario is indicated by a simulation of the same type with an empirical interatomic potential, which does not access the very high-density amorphous (VHDA) phase. The "false minimum" scenario is exemplified by a candidate potential model that shows spurious formation of an unphysical highly coordinated structure, and was, therefore, identified as a non-valid candidate. ${ }^{44}$ Panels (d) and (e) were drawn with data from Ref. 7, and panel (f) with data from Ref. 44.

present paper and the following discussion, any ML potential fitting framework will be relevant in equal parts.

## III. WHAT MAKES A POTENTIAL "VALID"?

Overall, the answer to this question seems to be easy. A new ML potential, and, indeed, any interatomic potential model, has to pass two tests. Does it qualitatively predict what it should (to the extent that is comparable with experiment)? Does it quantitatively do so-say, in predicting measurable properties?

In practice, it is often very difficult to determine the quality of a potential, and to connect the numerical performance to its physical meaning. Therefore, validation tests become important. Figure 2 summarizes a way to think about the qualitative "correctness" of a potential in terms of false maxima and minima and their respective effect on predictions. This issue was discussed in recent reviews and perspective articles, ${ }^{41,43}$ and we illustrate it here using representative examples (throughout this work, we show data from our own studies, which deliberately include examples of "failed" potentials).

Qualitatively correct potentials are expected to show the correct behavior for a given system-with respect to either experiment, or a high-quality quantum-mechanical prediction, or ideally both. We illustrate this expectation on the right-hand side of Fig. 2(d), which shows snapshots from the simulated compression of amorphous silicon, as taken from a recent work. ${ }^{7}$ The key observation in that study-and thus, the benchmark that a "correct" simulation will need to reproduce-was the pressure-induced crystallization to form simple hexagonal (sh) silicon. The atomic coordination number in that phase is 8 , and so the final polycrystalline structure is rendered in orange in Fig. 2(d).

The figure then compares the "correct" prediction [Fig. 2(d)] to the same simulation with a more limited, yet much faster, empirical interatomic potential [Fig. 2(e)], and also to the result of a candidate ML potential that is deliberately chosen as an example of one that is not correct [Fig. 2(f)]. In the former case, which we take to illustrate a false maximum, the structure remains relatively similar to the lowcoordinated low-density form of amorphous silicon (purple)-no structural collapse or crystallization happens. ${ }^{7}$ We presume that this is because the functional form of the empirical potential used is not as flexible as that of a typical ML potential, instead favoring the tetrahedral local geometry inherent to low-density silicon. For the latter case [Fig. 2(f)], we show a candidate ML potential that predicts an unphysical structure: "unphysical" is here taken to mean that the system does not crystallize, rather getting stuck in a fully disordered configuration with coordination numbers of $\geq 10$ (Ref. 44).

A potential that is not qualitatively valid [such as the one in Fig. 2(f)] should not be used for simulations. A potential that is qualitatively valid next needs to be assessed with regard to its quantitative, numerical accuracy. This will be the topic of Sec. IV.

## IV. NUMERICAL ERRORS

Numerical error metrics are of central importance in many areas of ML-for example, in quantifying the performance of a new model compared to the existing state-of-the-art (SOTA). We briefly review relevant techniques for numerical validation and error definitions that are commonly used in the ML literature (and described in introductory textbooks in more detail). ${ }^{64}$ We then discuss the
application of these error metrics to interatomic potential models specifically.

## A. Error measures

When testing any ML regression model, a predicted label, $\hat{y}_{i}$, is generated for each entry (each data location) in a test set of data that have not been included in training the model. Each predicted label corresponds to a correct ground-truth value, $y_{i}$, and numerical error metrics are designed to summarize, in a single measure, the disparity between prediction and ground truth as taken over all data points in the test set. Different error metrics capture different qualities of this disparity.

Two of the most commonly used metrics are the mean absolute error (MAE) and the root mean square error (RMSE), defined, respectively, as

$$
\begin{aligned}
\mathrm{MAE} & =\frac{1}{N} \sum_{i}\left|y_{i}-\hat{y}_{i}\right|, \\
\mathrm{RMSE} & =\sqrt{\frac{1}{N} \sum_{i}\left(y_{i}-\hat{y}_{i}\right)^{2}} .
\end{aligned}
$$

While these metrics both attempt to measure the average error, the RMSE is strictly $\geq$ MAE and is skewed upward by higher errors. Related to the MAE is a measure for the model bias, viz., $1 / N \sum_{i}\left(y_{i}-\hat{y}_{i}\right)$, which becomes 0 if positive and negative deviations cancel.

In many settings, one prefers robust statistics, i.e., those that are not skewed by extreme values. However, we argue that robust statistics should not be used on their own in validating ML potentials, based on the following scenario [Fig. 3(a)]: consider a potential (A) that performs reasonably well over all relevant configurational space, and compare it to another potential (B) that performs extremely well on $90 \%$ of the data points but poorly on the remaining $10 \%$. A robust error metric such as the median would identify $\mathbf{B}$ as being "better" than $\mathbf{A}$. This is shown in Fig. 3(b), where the middle horizontal line in the box plots indicates the median value. In computational practice, however, a potential that fails dramatically to capture the true nature of the PES in a physically relevant region (B) is not valid, and is, therefore, significantly worse than the one that performs reasonably over all of configurational space (A).

The above-mentioned metrics summarize the distribution of residual errors using a single value. While offering a practical way to compare different models, they necessarily lose information about the overall distribution of errors. Using a kernel density estimation or "violin" plot is a graphically succinct way to more completely describe the error distribution [Fig. 3(c)], and in the context of ML potentials, seems preferable to a box plot [Fig. 3(b)] that incorporates robust statistics. Note how in this numerical example, both the violin plot [Fig. 3(c)] and individual RMSE and MAE values [Fig. 3(d)] provide an indication of unfavorable errors in $\mathbf{B}$ compared to $\mathbf{A}$.

## B. Subtleties (I): Errors for forces

When dealing with collections of errors for scalar properties (such as energies), the individual errors, $y_{i}-\hat{y}_{i}$, are scalar values, and, therefore, summary metrics such as the above-mentioned MAE

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-06_972_864_279_146.jpg)
FIG. 3. Numerical errors and their visualization. The figure compares various ways to graphically explore errors for two hypothetical ML potentials, A on the left and in blue, and $\mathbf{B}$ on the right and in red: (a) data points generated using a random number generator, in arbitrary order, (b) box and (c) violin plots, together with (d) error metrics on the same axes (absolute error). Graphical methods provide information on the distribution of errors, as opposed to error metrics that summarize this information into a single measure. As discussed in the text, we argue that model $\mathbf{B}$ is worse than model A for the purpose of material modeling, due to its large departure from the true PES in some places. However, if non-robust metrics such as median and percentile errors were used to quantify performance [cf. the median values shown as horizontal lines in panel (b)], they would suggest the opposite.

and RMSE are easy to apply. When dealing with errors in vector properties-in the context of ML potentials, forces on atoms-, there are two main ways to apply summary metrics. Both involve converting the individual error vectors, $\mathbf{r}_{i}=\mathbf{F}_{i}-\hat{\mathbf{F}}_{i}$, to a collection of scalar values, before calculating metrics for those. While both approaches are used in the literature, they give different absolute results.

One way to summarize error vectors is to use their magnitude (L2 norm), defined as

$$
\left\|\mathbf{r}_{i}\right\|_{2}=\sqrt{\left(r_{i, x}\right)^{2}+\left(r_{i, y}\right)^{2}+\left(r_{i, z}\right)^{2}}
$$

for a three-dimensional vector. Error metrics for the resulting (positive) quantities, $\left\|\mathbf{r}_{i}\right\|_{2}$, can then be calculated as

$$
\begin{gathered}
\mathrm{MAE}_{\mathrm{mag}}=\frac{1}{N} \sum_{i}\left\|\mathbf{r}_{i}\right\|_{2} \\
\mathrm{RMSE}_{\mathrm{mag}}=\sqrt{\frac{1}{N} \sum_{i}\left(\left\|\mathbf{r}_{i}\right\|_{2}\right)^{2}}
\end{gathered}
$$

The interpretation of these metrics is as the mean absolute and root mean square magnitude of the force errors, respectively. (Note that these metrics are applied to the magnitude of the force errors. This is not the same as applying them to the errors in the force magnitudes.)

Another way that these metrics are applied in the literature is to each component of the error vectors separately. In this case, one concatenates all $x, y$, and $z$ components before applying error metrics, such as the MAE, to summarize the $3 N$ resulting scalar values,

$$
\begin{aligned}
\operatorname{MAE}_{\text {comp }} & =\frac{1}{3 N} \sum_{i}\left(\left|r_{i, x}\right|+\left|r_{i, y}\right|+\left|r_{i, z}\right|\right) \\
& =\frac{1}{3}\left(\frac{1}{N} \sum_{i}\left\|\mathbf{r}_{i}\right\|_{1}\right)
\end{aligned}
$$

In the second line, we used the definition of the Manhattan distance (L1 norm), $\left\|\mathbf{r}_{i}\right\|_{1}=\left|r_{i, x}\right|+\left|r_{i, y}\right|+\left|r_{i, z}\right|$, in three dimensions. A geometric interpretation of the component-wise MAE is, therefore, one-third of the mean of the Manhattan distance between the predicted and true atom-wise force vectors.

Analogously to Eq. (4), a component-wise RMSE can be obtained as

$$
\begin{aligned}
\text { RMSE }_{\text {comp }} & =\sqrt{\frac{1}{3 N} \sum_{i}\left[\left(r_{i, x}\right)^{2}+\left(r_{i, y}\right)^{2}+\left(r_{i, z}\right)^{2}\right]} \\
& =\sqrt{\frac{1}{3 N} \sum_{i}\left(\left\|\mathbf{r}_{i}\right\|_{2}\right)^{2}} \\
& \equiv \frac{1}{\sqrt{3}} \text { RMSE }_{\text {mag. }}
\end{aligned}
$$

Hence, the $\mathrm{RMSE}_{\text {mag }}$ and $\mathrm{RMSE}_{\text {comp }}$ are related by a factor of $\sqrt{3}$-this is not the case for the MAE.

An important property of an error metric should be rotational invariance: rotating the structure, and corresponding predicted and actual force labels, should not lead to any change in the error metric. Summary metrics applied to the L2 norm of the force error (i.e., the Euclidean distance between true and predicted force) necessarily have this property-formally expressed as

$$
\|\mathbf{r}\|_{2} \equiv\|\mathcal{R}(\mathbf{r})\|_{2} \quad \forall \mathcal{R} \in \mathrm{SO}(3) .
$$

Crucially, however, the L1 norm is not rotationally invariant, and hence, neither is the component-wise MAE: for an $N$-dimensional vector of Euclidean length 1, the L1 norm takes values between 1 and $\sqrt{N}$ depending on its orientation relative to the Cartesian axes. This can have a strong effect even for $N=3$. For example, the component-wise MAE varies by $0.15 \mathrm{eV} \AA^{-1}$ (a $43 \%$ relative difference!) when applied to variously rotated predictions for a distorted graphite structure (429th structure in the test set of the C-GAP-17 ML potential for carbon; Ref. 65). In more isotropic structures, the effect is less pronounced, but in principle remains. We, therefore, recommend that component-wise MAE values are not used when determining force errors for ML potentials, instead using component-wise RMSE values or metrics for the magnitude.

Finally, we stress that each of these metrics, applied to the same set of force errors, results in a different absolute value. For the complete C-GAP-17 test set, we obtain values of MAE $_{\text {mag }}=1.67 \mathrm{eV} \AA^{-1}$ and $\mathrm{RMSE}_{\text {mag }}=1.89 \mathrm{eV} \AA^{-1}$ for the magnitude of per atom force errors, and a component-wise RMSE ${ }_{\text {comp }}=1.09 \mathrm{eV} \AA^{-1}$. (A Python implementation of this analysis is provided alongside the paper; see the Data Availability statement.) It is, therefore, critical to include the exact type of metric used when reporting force errors and to compare like with like.

## C. Subtleties (II): Scaling with system size

ML potential models typically make atom-wise predictions: atomic energies (that are then summed up to give the total energy ${ }^{54,58}$ ) and forces on atoms. When predicting per atom properties, such as the magnitude or Cartesian components of forces, where there is a one-to-one correspondence between DFT ground truth and ML-predicted values, no further considerations regarding the number of atoms in the cell(s) are, therefore, required when reporting errors. However, for energies, DFT does not normally provide per atom values, and the ground truth in this case is the DFT total energy for a given simulation cell. When predicting system-wide properties, such as the total energy, $N$ individual ML model predictions are, therefore, summed and compared to a single true label. In these cases, the system size does have an effect on the behavior of the numerical errors.

Figure 4 illustrates this point using again a practical example: a set of structures from the reference database of the C-GAP-17 potential for carbon (Ref. 65). We evaluated the model errors for different system sizes and investigated if, and how, they change with $N$. The prediction errors for the entire cells trivially increase with $N$ [Fig. 4(a)]. In contrast, when the energy error is reported as a per atom value (by dividing the predicted total energy by $N$ ), the result systematically decreases with $N$ [Fig. 4(c)]. Figure 4(b) illustrates that scaling the predictions by $\sqrt{N}$ would alleviate this problem.

We, therefore, recommend that, when comparing model performance for per-cell properties such as the total energy, datasets containing structures of the same size are used. If this is not possible, it would seem desirable to use the statistically justified normalization procedure of dividing by $\sqrt{N}$. We do note, in practical terms, that per-cell energies normalized in this way have different absolute values from the commonly quoted error values in eV per atom (which one would obtain by dividing by $N$ ), and are, therefore, not directly comparable-as seen from the different $y$-axis values in the panels of Fig. 4.

The most important message of this figure, rather than specific error values for a specific potential, is that numerical errors do need to be evaluated with care. Errors for a given ML potential, if quoted in isolation, will likely be of limited use; however, the evolution of a well-defined error measures across different types of fitting methods, database compositions, hyperparameters, etc., and the use of such measures in systematic benchmarks will be (and will continue to be) highly informative.

## D. Cross-validation and external test sets

Many ML model classes can nearly perfectly fit to the data on which they have been trained. To measure a model's true capabilities and, in particular, its ability to generalize, it is, therefore, important to test on data points that have not been included in the training.

A popular way to numerically validate an ML model is to use $k$-fold cross-validation [Fig. 5(a)]. This procedure involves separating the complete dataset into $k$ non-overlapping sets (or "folds") and training $k$ separate models, each using the remaining data when the $k$-th set is held out for testing. Averaging an error metric over all $k$ folds yields a measure that is less affected by random noise induced by the exact choice of train-/test-set splitting. In Fig. 5(a), we sketch this process schematically for a database that consists of three clusters of data. For an ML potential, these could correspond, say, to bulk crystalline, liquid, and surface structural models, respectively-see

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-07_525_1447_1654_302.jpg)
FIG. 4. Error scaling with system size. Moving from left to right, we plot errors for the total structure energy predicted by an existing ML potential, ${ }^{65}$ as normalized using no scaling factor, scaling of $1 / \sqrt{N}$, and the commonly used scaling of $1 / N$. Raw data points, i.e., errors for individual structures, are plotted using small symbols, with their corresponding distributions represented in the light-gray violin plots. Mean errors for each structure size are plotted on top of these. Both the violin and mean plots show that a scaling of $1 / \sqrt{N}$ leads to a distribution of normalized errors that are independent of system size. The same is not true for either of the other cases. Errors were evaluated for predictions made by the C-GAP-17 ML potential (as a sum of local energies) compared to ground-truth DFT total energies. A subset of the full C-GAP-17 reference database (Ref. 65 ) was selected for this exercise, such that the type and energy distribution of structures is the same for all $N$.

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-08_886_1696_277_180.jpg)
FIG. 5. Schematic cartoons depicting two approaches to creating test sets for numerical validation, as are commonly used in ML research and in the development of ML potentials. The central panel of each section illustrates the location of various training and testing datasets in a dimensionally reduced space; the right illustrates a parity plot comparing the ML model predictions against the ground-truth data. (a) K-fold ("internal") cross-validation: the entire reference database is used to test the model, where $k$ successive folds are held out during training. (b) Independent ("external") test sets: a separate dataset is created explicitly for testing. Typically, this test set derives from a different distribution to that used to train the model.

Ref. 20 for an example of how such a dataset might look in practice. The sketches in dashed boxes indicate the distribution of the data points in a 2D projection of structural similarity (similar structures being close together and vice versa), with the three types of data forming three clusters, and different points being used as the test data (green) in each of the $k$ folds. The prediction of the ML model is then plotted against the ground-truth value for every point as measured when it was used for testing, and error metrics such as the RMSE (Sec. IV A) can be calculated.

An alternative and more time-consuming procedure for numerical validation involves generating one or more "external" test sets. These test sets could be generated in similar ways to the training data, that is, be independent yet structurally related-or they could extend to different types of data [Fig. 5(b)].

In atomistic material modeling, an example of a general systemagnostic approach is a standardized random structure search (RSS) protocol; ${ }^{66-68}$ these searches explore a wide range of configurations, thus generating an unbiased sample of diverse atomic structures, including local minima in the PES. We discuss RSS-based test sets in more detail in Sec. V C. The creation of more specific test sets can be guided using domain knowledge about the chemical system-for instance, surfaces, defects, transition paths, and polymorphs not seen during training. To more fully understand the behavior in a particular domain, these sets can be highly specialized, for instance, containing solely a set of manually distorted crystal structures or snapshots from an MD simulation at high temperature and pressure.

The error values obtained using this technique will depend strongly on the nature of the test set, and baselining using several different test sets offers a way to more comprehensively understand model behavior.

We note that our wording "external" in Fig. 5(b) refers to the construction process of the test set, rather than to its location relative to the training set. Comparing the two test sets shown in Fig. 5(b), data located in regions close to training points (upper panel) will typically be modeled more accurately than those further away (lower panel). Such "training example data leakage" can lead to overly optimistic error estimates, unless the test set accurately reflects the data to which the model will be applied.

## E. Uncertainty quantification

While the present work is focused on the validation of ML potentials before they are used in production simulations, we also briefly mention numerical techniques that can be used to test the quality of a model during a simulation itself. These techniques fall in the wider remit of uncertainty quantification (UQ) and are increasingly relevant to atomistic ML. ${ }^{69}$ Some of them are specific to certain classes of models-for example, the use of the Gaussian process variance in "on-the-fly" fitting of ML potentials, ${ }^{70}$ or of dropout neural networks. ${ }^{71}$ Some are more general, such as the use of committee models (comparing predictions from multiple separately fitted models at a given data location): an early application of this idea to

NN potentials was described by Artrith and Behler in 2012, ${ }^{72}$ but committee models, in general, can be built for other ML potential fitting frameworks as well.

For an introduction to UQ methodology for atomistic modeling, we refer the interested reader to a comprehensive survey in Ref. 30. Using adsorption energies on surfaces as the application case, the authors provide an introduction, discussion, and evaluation of different types of relevant UQ methods.

## V. PHYSICALLY GUIDED VALIDATION

In this section, we discuss a series of physically guided tests for ML potentials for materials. This area is one where the validation becomes very different from techniques used in "standard" ML research and relies on the practitioner's domain knowledge. We argue that such physically guided validation plays an important role in making an ML potential applicable in practice.

## A. Domain-specific error analysis

The first of our proposed physically guided tests is actually still to do with energy and force errors. The key difference is that we generate external testing data entirely separately, in a setting that is informed by physical and chemical knowledge as far as possible.

In Fig. 6, we show the construction and use of such a physically motivated test set for ML potentials, taken from the original work in Ref. 26. The idea is to carry out a small-scale molecular dynamics (MD) simulation that mimics the "real thing"-small enough so that structural snapshots from that MD trajectory can be evaluated (labeled) in subsequent single-point computations with the groundtruth method. In this case, the reference MD simulation was run with an ML potential (referred to as the "original model" in Fig. 6), and an important prerequisite for doing so was that that potential had itself been validated in earlier work. ${ }^{73,74}$ In the study of Ref. 26, the aim was to test the behavior of modified GAP models for elemental silicon, which were based on the original GAP-18 potential ${ }^{73}$ and included additional data and custom regularization to more accurately describe diverse crystalline allotropes and their vibrational properties. ${ }^{26}$

In this example, two new candidate ML potentials are tested, which only differ in one aspect of the fit, namely, in the choice of the regularization hyperparameters corresponding to the "expected error" in the input data [in Fig. 1(b), all aspects would, therefore, be the same except for the last one in the series]. Candidate potential 1 is a model where new structures have been added to the existing GAP-18 database, but not all too much weight is placed on them. Candidate 2 is a model where the regularization is "tighter" by a factor of 10 , and so the potential is very good indeed at describing phonons, but at the expense of physically reasonable behavior outside that scope. In particular, an MD melt-quench simulation using candidate 1 reproduced the behavior of the original GAP-18 model, whereas the same simulation using candidate 2 failed entirely. ${ }^{26}$

Force errors on a physically motivated test set can be predictive of this behavior, as shown in Fig. 6(c). By contrast, we emphasize that the energy errors on their own do not reveal any trouble [Fig. 6(b)], other than a slightly larger scatter than the original GAP-18 model. In fact, candidate 2 was found to have a lower numerical energy error for the liquid configurations in this test set ( 8.4 meV /atom) than candidate 1 ( 11.5 meV /atom). ${ }^{26}$

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-09_1627_873_275_1048.jpg)
19 March 2026 09:39:39

FIG. 6. A physically motivated DFT benchmark for silicon ML potentials. ${ }^{26}$ (a) Schematic of an ML-driven melt-quench simulation that is designed to encompass a range of relevant scenarios: the description of a highly defective crystalline phase, as well as melting and quenching. The simulation proceeds over a total of 600 ps for a system of 500 atoms. (b) Energy errors for 61 snapshots along the trajectory, evaluated for the original model (GAP-18, from Ref. 73, taken as the current state-of-the-art) and two candidate potentials. As discussed in the original work, ${ }^{26}$ these two potentials are optimized for accurate phonon predictions, and the test here is designed to see whether they still remain valid for a different application case. (c) Same, but for errors of the Cartesian force components (which are important to distinguish from force magnitudes or directions). This plot reveals how the first candidate potential performs well (blue line), whereas the second fails severely for the description of disordered silicon (gray line). Adapted with permission from George et al., J. Chem. Phys. 153, 044104 (2020). Copyright 2020 Author(s) licensed under a Creative Commons Attribution 4.0 License.

Albeit the present work is focused on inorganic materials modeling, the general message about low-error-yet-unstable-MD is fully in line with recent studies on molecular systems: see, for example, Ref. 27 (linear ACE models) or Ref. 29 (graph neural network potentials). Both in materials and molecular simulation, the question whether there can be a "better," more predictive external test set for numerical evaluation will likely be of continuing and, indeed, growing interest.

## B. Domain-specific structural benchmarks

The second type of physically motivated tests concerns structural similarity analysis, which we carry out using the SOAP kernel. ${ }^{47}$ As in Sec. V A, we suggest to validate a candidate potential by comparing its behavior to an accurate reference simulation, which could be based on DFT (small-scale), or driven by an existing and previously validated ML potential (large-scale). ${ }^{44}$

As an illustrative example, similar to Fig. 2, we use as a benchmark the results of large-scale ( 100000 -atom) MD simulations of the pressure-induced crystallization of amorphous silicon. ${ }^{7}$ In Fig. 7(a), we color-selected structural snapshots by the atomistic SOAP kernel similarity to the crystalline sh phase, which ranges from 0 to 1. This color-coding clearly highlights the two significant structural changes: collapse of the 4 -fold-coordinated amorphous phase, followed by nucleation of sh crystallites. Figure 7(a) shows the average SOAP similarity, taken over the whole simulation cell at each

a Define structural benchmarks
(based on AIMD or ML-driven reference simulation)
![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-10_772_1604_1383_266.jpg)

time step. The interpretation of this similarity measure is intuitive: the atomic environments in the low-density amorphous phase are mainly tetrahedral-like, and similar to the diamond-type crystalline form (high SOAP similarity value), and then become dramatically less diamond-like upon structural collapse. The similarity to sh silicon follows the opposite trend, with very high similarity at the end of the simulation positively identifying the sh crystallites compared to other possible competing phases (see Ref. 44 for more details).

There is a subtle detail in constructing these similarity plots. For the solid lines in Fig. 7(a), we relax the reference crystal structure under an external pressure that matches that of the corresponding frame in the MD simulation. This approach accounts for the change in bond lengths with pressure, which is most evident in the SOAP similarity of the low-density amorphous phase to diamond at $0-10 \mathrm{GPa}$. Even though no significant structural rearrangement occurs, the similarity to the fixed reference crystal at ambient pressure decreases linearly (dashed line)-in contrast, if a pressureadjusted crystal is used as the reference, almost no change in the SOAP similarity is seen up to about 10 GPa (solid line).

Once a structural similarity benchmark has been developed, it can be used to assess new candidate ML potentials. In the case we review here, originally reported in Ref. 44, the aim was to train computationally much cheaper potentials that still show the same physical behavior as their "teacher" model. In Fig. 7(b), we use the quantitative structural metric provided by SOAP to compare predictions of candidate "student" potentials to the previously validated

## b Validate candidate potentials

FIG. 7. Structural similarity-based validation against a reference simulation using the SOAP kernel to quantify similarity. (a) Snapshots from the compression simulation of Ref. 7, taken at $0,12,15$, and 20 GPa , respectively. Atoms are colored according to their SOAP similarity to crystalline simple hexagonal (sh) Si. The panels below show the average SOAP similarity of the compression trajectory to (left) diamond-type and (right) sh silicon during compression. Dashed lines correspond to comparisons to a fixed reference crystal at ambient pressure, solid lines to a crystal with an external stress that is equivalent to the pressure at each snapshot during the MD trajectory. (b) As before, but now comparing two types of candidate potentials, each row with different hyperparameter settings, as used to perform an MD simulation of the same protocol as panel (a). Comparisons of SOAP similarity to sh silicon reveal qualitatively incorrect trajectories predicted by candidate 2 , including unstable MD marked by an asterisk, and acceptable predictions from candidate 1. Adapted from Ref. 44. Original work published under a Creative Commons Attribution license (http://creativecommons.org/licenses/by/4.0/).
reference simulation of Ref. 7. Specifically, we generated two sets of MTP models that are controlled by their maximum level, $L$, fitted separately to a large database of structures (candidate 1) and to a comparatively small one (candidate 2). Unreasonable, highly coordinated false minima (of differing kinds) are detected by the SOAP analysis for candidate 2 . Instead, candidate 1 passed the test and could, therefore, be used for large-scale MD simulations with confidence. ${ }^{44}$

More generally, we think that compression MD simulations starting from some highly disordered structures can provide an insightful test for the physical behavior of ML potentialsparticularly if a large system size is used, allowing for the frequent sampling of a range of configurations involving the close approach of atoms. The increasing comprehensiveness of easily accessible structural databases, such as the Materials Project, ${ }^{75}$ means that reference crystal structure data are readily available for many chemical systems, and structural similarity analyses such as those exemplified in Fig. 7 can be set up easily.

To illustrate this type of analysis, in practice, we provide a Python (Jupyter) notebook that implements it for a 10000 -atom system-the smaller system size means that the code can be quickly run on standard computer hardware, and we invite the reader to use and adapt this code as they wish. A link to this notebook, as well as others supporting the present work, is provided in the Data Availability statement as follows.

## C. Random search and exploration

Random searching was first introduced as an approach to first-principle crystal structure prediction, in the $A b$ Initio Random Structure Searching (AIRSS) framework by Pickard and Needs. ${ }^{66,67}$ AIRSS aims to discover previously unknown crystal structures by generating and relaxing (with DFT) large numbers of random structures that satisfy some simple constraints, such as the minimum separation between atoms, ${ }^{67}$ and a similar approach can be taken
with ML potentials. ${ }^{53,77}$ The task of relaxing random structures into their local, often high-energy, minima provides a stringent test for an interatomic potential. This type of test has been introduced for silicon, where a range of widely used empirical potentials do not reproduce the energy distribution of the RSS minima as closely as an ML potential. ${ }^{73}$

To illustrate the use of RSS in assessing and validating interatomic potentials, we show in Fig. 8 the energies and volumes of 10000 random silicon structures that have been relaxed into local minima separately with (a) the general-purpose GAP-18 model taken from Ref. 73, which had previously been shown to reproduce AIRSS results well; ${ }^{73}$ (b) a candidate indirectly learned potential (GAP → MTP) that has been trained on GAP-18 data; ${ }^{44}$ and (c) the empirically fitted Stillinger-Weber (SW) potential, ${ }^{76}$ which is widely used for modeling silicon. For both ML potentials, a distinct basin at low volumes can be observed (arrows in Fig. 8), corresponding to structures similar to simple hexagonal-like phases at high pressures. The empirical SW potential, by contrast, fails to relax the same corresponding random structures into this chemically sensible local minimum because it strongly favors diamond-like, lower-density structures [this observation is consistent with the fact that SW predicts no structural collapse under pressure; Fig. 2(e) and Ref. 7]. All three potentials do find diamond-like minima, which we define by the relaxed structure having a SOAP similarity of $>0.99$ to the ideal crystalline form; however, the empirical potential finds considerably fewer: 112 (GAP-18), 135 (MTP), and 55 (SW).

In a different vein, we mention that the structures produced by an RSS run-both the relaxed ones and the points along the minimization trajectory-also constitute an unbiased set that can be useful for out-of-sample testing. To this end, the RSS structures can be "labeled" with the ground-truth method, and any candidate potential can be compared against this set. The numerical errors in this case will likely be relatively high for these rather unusual structures, underscoring the need for viewing the absolute error values in context. We have shown an example of this in a recent work. ${ }^{44}$

![](./images/b45a69c5-2454-4478-adeb-2be1f8400206-11_609_1713_1650_174.jpg)
FIG. 8. Random structure search (RSS) for silicon with 10000 structures with (a) the GAP-18 model from Ref. 73, (b) the "candidate 1" $L=16$ MTP model characterized in Fig. 7 (from Ref. 44), and (c) the empirical Stillinger-Weber potential. ${ }^{76}$ The contours represent the density of datapoints, and the histograms show their corresponding distributions in energy and volume, respectively. Arrows highlight the presence or absence of RSS minima similar to the high-pressure forms of silicon. This test is inspired by Ref. 73; however, all searches were newly conducted in the present study.

## D. Experimental data

Ultimately, the test for a simulation is whether it agrees with (and explains) experimental observations. Therefore, the direct validation against experimental data is perhaps the most important and relevant test for an ML potential, especially when combined with thorough validation against the reference (ground-truth) method. Often, the validation of ML potentials for materials includes some comparisons with previously published experimental data. There is, however, a wide range of ways how exactly this comparison might be made.

We summarize relevant techniques in Table I. Crystalline materials are widely characterized by x-ray and neutron diffraction experiments, yielding lattice parameters that may be compared to those of a computationally optimized structure. The comparison is straightforward, and yet it is important to choose the most appropriate reference data: low-temperature measurements are closer to the "zero-Kelvin" simulation than those at room temperature; high-resolution data from synchrotron experiments are better (but much more scarce) than data from in-house diffractometers; powder diffraction data are preferable for lattice parameters, while single-crystal diffraction yields the most accurate atomic positions, all else being equal. The Inorganic Crystal Structure Database (ICSD; Ref. 78 and references therein) can be helpful in locating experimental data.

Calorimetric measurements give information about enthalpy ( $\approx$ energy) differences between different phases, say, two crystalline polymorphs of a material or an amorphous phase compared to its crystalline counterpart. In Ref. 79, for example, when validating an ML potential for $\mathrm{SiO}_{2}$, it was shown that a particular DFT level gives energetics compatible with the experiment, and this good performance is inherited by the ML model. In this case, the DFT level in question was the Strongly Constrained Appropriately Normed (SCAN) functional. ${ }^{80}$ We note that with regard to validation, there are two separate effects here, viz., the error of the ground-truth computation compared to the experiment, and the error of the ML fit to the reference database. It is, therefore, important to disentangle both.

The vibrational properties are another useful quantity, and the phonon dispersions for crystalline phases are now easy to predict computationally-for example, using the phonopy software. ${ }^{81}$ The experimental data are somewhat more difficult to come by if one is interested in the full phonon spectrum. While measuring the entirety of the vibrational density of states (VDOS) requires inelastic neutron scattering techniques, the much more common infrared and Raman spectroscopy are routine characterization tools in the laboratory. In turn, the latter types of spectra are more difficult to predict computationally: they require the (rather intricate) computation of absorption intensities associated with given phonon modes. ML models have begun to be developed for this purpose, ${ }^{82}$ and it is likely that "integrated" ML models that combine electronic predictions with potentials will become useful in this context. ${ }^{83,84}$

With vibrational properties available, the thermal conductivity can be predicted-and ML potentials are an increasingly popular approach for this task. ${ }^{85}$ In 2012, Sosso et al. demonstrated the use of a neural network potential for studying thermal transport in the phase-change memory material $\mathrm{GeTe},^{86}$ and more recent studies revealed good agreement for diverse crystalline materials such as gallium sesquioxide, $\mathrm{Ga}_{2} \mathrm{O}_{3}$, ${ }^{87}$ zirconia, $\mathrm{ZrO}_{2}$, ${ }^{88}$ or the skutterudite-type compound $\mathrm{Y}_{x} \mathrm{Co}_{4} \mathrm{Sb}_{12}$ (Ref. 89). The latter, a thermoelectric material, is an example of a practical application of ML potentials-and we believe that even in the absence of a direct application, carefully performed thermal conductivity measurements can provide challenging benchmarks for the development and validation of new ML potential models. Thermal property evaluations for complex structures can be prohibitively expensive with DFT, but they can be carried out, say, for a range of candidate ML potentials with different settings.

Spectroscopic techniques more generally are widely used to characterize materials. Emerging ML models are being built that, for example, enable comparison with x-ray photoelectron spectroscopy data, ${ }^{90-92}$ and even in the absence of those models, DFTbased predictions are often readily available (as long as a relatively small simulation cell is deemed to be sufficient). The application

TABLE I. Experimental observables against which predictions from an ML potential may be compared. Dots indicate the somewhat subjectively evaluated difficulty of a given experiment or computation, from easy ( • ) to challenging ( $\bullet \bullet \bullet$ ).
| Quantity | Experimental technique | Computational counterpart |
| :--- | :--- | :--- |
| Lattice parameters | X-ray $(\bullet)$ or neutron diffraction $(\bullet \bullet \bullet)$ | Structural relaxation (•) |
| Thermodynamic stability | Calorimetry ( • • ) | Energy ( $\Delta E, \bullet$ ) or enthalpy ( $\Delta H, \bullet$ • ) |
| Vibrational spectroscopy | Inelastic neutron scattering (•••) | Vibrational density of states from MD or phonon computations ( ⋅ 啫) |
|  | Infrared or Raman spectroscopy (•) | As above-mentioned, but with IR/Raman intensities predicted ( • • • ) or ignored ( $\bullet \bullet$ ) |
| Thermal properties | Thermal conductivity measurements ( • • ) | Phonon computations and post-processing ( • • |
| Atomic spectroscopy | NMR ( $\bullet \bullet$ ), x-ray spectroscopy ( $\bullet \bullet \bullet)$ | Not normally directly, but can be computed using DFT on small ML-generated structural models ( • • ) |
| Disordered structure | Pair distribution function (PDF) analysis ( $\bullet \bullet \bullet$ ) | Radial distribution function from MD simulation (•) |
|  | X-ray or neutron structure factor, $S(q)$, for liquid and amorphous phases ( • • • ) | Fourier transform of radial distribution function (•) |


of such computational spectroscopy techniques to validating potentials against experiments is beginning to be explored. Shapeev et al. have shown how to validate ML potentials, in this case, built using the MTP framework, against experimental extended x-ray absorption fine structure (EXAFS) data, which provide a fingerprint of local structure. ${ }^{93}$ The authors found that a major source of possible discrepancies was the nature of the DFT reference data, which corresponds to the "quality of data labels" point in Fig. 1(b).

For liquid and amorphous phases, structural information is difficult to obtain and only typically accessible through indirect observations. A primary type of analysis involves inspecting the structure factor from x-ray or neutron diffraction, and its Fourier transform, which yields the pair distribution function (PDF). One key example is in the study of battery materials, such as nanoporous carbons, which can be experimentally characterized by PDF analysis (among other techniques). ${ }^{94}$ A recent ML-driven study compared computational predictions against those quantities. ${ }^{95}$ We emphasize that these types of studies are typically focused on validating the structural model itself, not nuances of the potential. Nevertheless, the potential itself is influential in generating the structural model, so that the quality of the latter can act as a metric for the performance of a potential. We also emphasize that for amorphous materials, it will be particularly challenging to create accurate and reproducible experimental benchmarks, and it would be interesting to see whether more benchmarks of this type can be created in the future. ${ }^{36,96}$

The computational speed of ML potentials makes it possible to generate structural models on the length scale of several nanometers and more, and with a nanoscale structure, that would not be possible to describe with DFT-based simulations. For example, such ML-based structural models can include grain boundaries and inhomogeneity arising from the coexistence of different phases. The accessibility of accurate large-scale simulations allows for the convergence of structural metrics, such as the predicted structure factor, with system size. It is important to test this convergence, which is often not feasible with DFT, to ensure that any conclusions on the quality of the potential are reliable. It is also important to ensure that those tests that can be carried out with DFT are done beforehand: a fully polycrystalline sample cannot be described at that level, but small and representative structural models can. This way, the user will have energetic validation on small-scale computations, and physics-guided validation on larger-scale structures-together giving high confidence in the quality of a prediction.

## VI. BEST-PRACTICE RECOMMENDATIONS

We suggest that the following should be included in publications that introduce an ML potential:

- Energy and force errors from internal ( $k$-fold) crossvalidation, including a definition of how these errors have been obtained (RMSE or MAE, absolute force or force component error, etc.).
- Energy and force errors for one or more external (out-ofsample) test sets, for example, from separate MD simulations or random search.
- Comparison with experimental data wherever these are available from previous literature (Table I), including a brief
discussion of the errors or uncertainty of the literature values.

We suggest that the following should be included in publications that use an existing ML potential:

- A mention of the above-mentioned error metrics, if defined in the original publication.
- A brief comment on how, and to what extent, these previously given errors are applicable to the problem studied in the new work.
- If possible, benchmarks using a small-scale DFT simulation that is representative of the problem at hand (see Fig. 6 for an example).
- Wherever available, comparison with experimental data sourced from previous literature (Table I).

We hope that these points will not only increase the confidence of the computational practitioner themselves (knowing that they are operating slightly away from the security of quantum mechanics) but also of experimental colleagues who will read the work.

We also emphasize the importance, and the expected long-term advantages, of openly sharing training and benchmark data, as well as testing workflows especially as they become more complex. We refer again to a recently published set of best-practice guidelines for ML models more generally, in Refs. 33 and 34, beyond the case of interatomic potentials discussed herein.

## VII. CONCLUSIONS AND OUTLOOK

We have provided a tutorial-style overview of the multi-faceted problem of validating ML potential models for material simulations. There has always been a need to ensure the validity and accuracy of interatomic potentials, and this need is becoming more acute as ML potentials are becoming increasingly widely used outside their specialized community of developers.

Looking forward, it would seem desirable to create openly available "packaged" tests that can be run directly from an openly available and easily accessible code, say, a Python script or automated workflow. The testing framework for elemental silicon described in Ref. 73 is an excellent example of this, and we have benefited from it ourselves during the work described in Ref. 44.

We expect that, with properly chosen reference configurations, numerical errors will remain important and, indeed, become more important. The question on which data exactly to carry out numerical validation, and whether there can be an optimized set of out-of-sample testing data for one material (or for many materials) constitutes a key challenge. We envision the increased use of random (RSS) configurations in this, as well as the creation and sharing of dedicated benchmark simulations, such as that in Fig. 6. Once suitable structural snapshots are found, which are representative of a given physical problem, anyone can download these structures, re-label them with the specific reference method used in their new potential, and evaluate the error on those (the re-labeling step will be required in most cases because usually, ML potentials are fitted to data at different computational levels). We believe that errors on a specified, physically guided benchmark will be useful in evaluating future generations of ML potentials, and that they will convey information that simple cross-validation cannot.

We hope that the ideas and approaches discussed in this Tutorial will help establish ML potentials as everyday tools in material
modeling, in the same way that DFT-based simulation methods are abundantly and very successfully used today. We look forward to seeing how, in the years ahead, carefully crafted and validated ML potentials will accelerate scientific discovery in physics, chemistry, and related fields.

## ACKNOWLEDGMENTS

We thank J. George, A. V. Shapeev, and Y. Zhou for helpful comments on the manuscript. J.D.M. acknowledges funding from the EPSRC Centre for Doctoral Training in Inorganic Chemistry for Future Manufacturing (OxICFM), Grant No. EP/S023828/1. J.L.A.G. acknowledges a UKRI Linacre-The EPA Cephalosporin Scholarship, support from an EPSRC DTP (Award No. EP/T517811/1), and from the Department of Chemistry, University of Oxford. V.L.D. acknowledges a UK Research and Innovation Frontier Research grant (Grant No. EP/X016188/1). Structural drawings were created with the help of OVITO. ${ }^{97}$

## AUTHOR DECLARATIONS

## Conflict of Interest

The authors have no conflicts to disclose.

## Author Contributions

Joe D. Morrow: Investigation (lead); Writing - original draft (equal); Writing - review \& editing (equal). John L. A. Gardner: Investigation (supporting); Writing - original draft (equal); Writing - review \& editing (equal). Volker L. Deringer: Supervision (lead); Writing - original draft (lead); Writing - review \& editing (equal).

## DATA AVAILABILITY

Data generated in this work, as well as Python code to reproduce relevant figures, are provided in openly available repositories. Specifically, Jupyter notebooks implementing numerical error measures and methods for physical validation are provided at https:// github.com/MorrowChem/how-to-validate-potentials. A copy has been deposited in Zenodo and is available at https://doi.org/ 10.5281/zenodo. 7675642.

## REFERENCES

${ }^{1}$ J. Behler, "First principles neural network potentials for reactive simulations of large molecular and condensed systems," Angew. Chem., Int. Ed. 56, 12828-12840 (2017).
${ }^{2}$ V. L. Deringer, M. A. Caro, and G. Csányi, "Machine learning interatomic potentials as emerging tools for materials science," Adv. Mater. 31, 1902765 (2019).
${ }^{3}$ F. Noé, A. Tkatchenko, K.-R. Müller, and C. Clementi, "Machine learning for molecular simulation," Annu. Rev. Phys. Chem. 71, 361-390 (2020).
${ }^{4}$ O. T. Unke, S. Chmiela, H. E. Sauceda, M. Gastegger, I. Poltavsky, K. T. Schütt, A. Tkatchenko, and K.-R. Müller, "Machine learning force fields," Chem. Rev. 121, 10142-10186 (2021).
${ }^{5}$ P. Friederich, F. Häse, J. Proppe, and A. Aspuru-Guzik, "Machine-learned potentials for next-generation matter simulations," Nat. Mater. 20, 750-761 (2021).
${ }^{6}$ B. Cheng, G. Mazzola, C. J. Pickard, and M. Ceriotti, "Evidence for supercritical behaviour of high-pressure liquid hydrogen," Nature 585, 217-220 (2020).
${ }^{7}$ V. L. Deringer, N. Bernstein, G. Csányi, C. Ben Mahmoud, M. Ceriotti, M. Wilson, D. A. Drabold, and S. R. Elliott, "Origins of structural and electronic transitions in disordered silicon," Nature 589, 59-64 (2021).
${ }^{8}$ H. Zong, V. N. Robinson, A. Hermann, L. Zhao, S. Scandolo, X. Ding, and G. J. Ackland, "Free electron to electride transition in dense liquid potassium," Nat. Phys. 17, 955-960 (2021).
${ }^{9}$ M. A. Caro, V. L. Deringer, J. Koskinen, T. Laurila, and G. Csányi, "Growth mechanism and origin of high $s p^{3}$ content in tetrahedral amorphous carbon," Phys. Rev. Lett. 120, 166101 (2018).
${ }^{10}$ J. Westermayr, M. Gastegger, D. Vörös, L. Panzenboeck, F. Joerg, L. González, and P. Marquetand, "Deep learning study of tyrosine reveals that roaming can lead to photodamage," Nat. Chem. 14, 914-919 (2022).
${ }^{11}$ G. C. Sosso, G. Miceli, S. Caravati, F. Giberti, J. Behler, and M. Bernasconi, "Fast crystallization of the phase change compound GeTe by large-scale molecular dynamics simulations," J. Phys. Chem. Lett. 4, 4241-4246 (2013).
${ }^{12}$ K. Konstantinou, F. C. Mocanu, T.-H. Lee, and S. R. Elliott, "Revealing the intrinsic nature of the mid-gap defects in amorphous $\mathrm{Ge}_{2} \mathrm{Sb}_{2} \mathrm{Te}_{5}$," Nat. Commun. 10, 3065 (2019).
${ }^{13}$ N. Artrith, A. Urban, and G. Ceder, "Constructing first-principles phase diagrams of amorphous $\mathrm{Li}_{x} \mathrm{Si}$ using machine-learning-assisted sampling with an evolutionary algorithm," J. Chem. Phys. 148, 241711 (2018).
${ }^{14}$ C. Wang, K. Aoyagi, P. Wisesa, and T. Mueller, "Lithium ion conduction in cathode coating materials from on-the-fly machine learning," Chem. Mater. 32, 3741-3752 (2020).
${ }^{15}$ J. Wang, A. A. Panchal, G. S. Gautam, and P. Canepa, "The resistive nature of decomposing interfaces of solid electrolytes with alkali metal electrodes," J. Mater. Chem. A 10, 19732-19742 (2022).
${ }^{16}$ C. G. Staacke, T. Huss, J. T. Margraf, K. Reuter, and C. Scheurer, "Tackling structural complexity in $\mathrm{Li}_{2} \mathrm{~S}-\mathrm{P}_{2} \mathrm{~S}_{5}$ solid-state electrolytes using machine learning potentials," Nanomaterials 12, 2950 (2022).
${ }^{17}$ K. Gubaev, E. V. Podryabinkin, G. L. W. Hart, and A. V. Shapeev, "Accelerating high-throughput searches for new alloys with active learning of interatomic potentials," Comput. Mater. Sci. 156, 148-156 (2019).
${ }^{18}$ D. Marchand and W. A. Curtin, "Machine learning for metallurgy IV: A neural network potential for $\mathrm{Al}-\mathrm{Cu}-\mathrm{Mg}$ and $\mathrm{Al}-\mathrm{Cu}-\mathrm{Mg}-\mathrm{Zn}$," Phys. Rev. Mater. 6, 053803 (2022).
${ }^{19}$ Y. Zuo, C. Chen, X. Li, Z. Deng, Y. Chen, J. Behler, G. Csányi, A. V. Shapeev, A. P. Thompson, M. A. Wood, and S. P. Ong, "Performance and cost assessment of machine learning interatomic potentials," J. Phys. Chem. A 124, 731-745 (2020).
${ }^{20}$ P. Rowe, V. L. Deringer, P. Gasparotto, G. Csányi, and A. Michaelides, "An accurate and transferable machine learning potential for carbon," J. Chem. Phys. 153, 034702 (2020).
${ }^{21}$ C. Qian, B. McLean, D. Hedman, and F. Ding, "A comprehensive assessment of empirical potentials for carbon materials," APL Mater. 9, 061102 (2021).
${ }^{22}$ A. Aghajamali and A. Karton, "Can force fields developed for carbon nanomaterials describe the isomerization energies of fullerenes?," Chem. Phys. Lett. 779, 138853 (2021).
${ }^{23}$ M. Qamar, M. Mrovec, Y. Lysogorskiy, A. Bochkarev, and R. Drautz, "Atomic cluster expansion for quantum-accurate large-scale simulations of carbon," arXiv:2210.09161 [cond-mat.mtrl-sci] (2022).
${ }^{24}$ C. de Tomas, I. Suarez-Martinez, and N. A. Marks, "Graphitization of amorphous carbons: A comparative study of interatomic potentials," Carbon 109, 681-693 (2016).
${ }^{25}$ C. de Tomas, A. Aghajamali, J. L. Jones, D. J. Lim, M. J. López, I. SuarezMartinez, and N. A. Marks, "Transferability in interatomic potentials for carbon," Carbon 155, 624-634 (2019).
${ }^{\mathbf{2 6}}$ J. George, G. Hautier, A. P. Bartók, G. Csányi, and V. L. Deringer, "Combining phonon accuracy with high transferability in Gaussian approximation potential models," J. Chem. Phys. 153, 044104 (2020).
${ }^{27}$ D. P. Kovács, C. van der Oord, J. Kucera, A. E. A. Allen, D. J. Cole, C. Ortner, and G. Csányi, "Linear atomic cluster expansion force fields for organic molecules: Beyond RMSE," J. Chem. Theory Comput. 17, 7696-7711 (2021).
${ }^{28}$ X. Fu, Z. Wu, W. Wang, T. Xie, S. Keten, R. Gomez-Bombarelli, and T. Jaakkola, "Forces are not enough: Benchmark and critical evaluation for machine learning force fields with molecular simulations," arXiv:2210.07237 [physics.comp-ph] (2022).
${ }^{29}$ S. Stocker, J. Gasteiger, F. Becker, S. Günnemann, and J. T. Margraf, "How robust are modern graph neural network potentials in long and hot molecular dynamics simulations?," Mach. Learn.: Sci. Technol. 3, 045010 (2022).
${ }^{30}$ K. Tran, W. Neiswanger, J. Yoon, Q. Zhang, E. Xing, and Z. W. Ulissi, "Methods for comparing uncertainty quantifications for material property predictions," Mach. Learn.: Sci. Technol. 1, 025006 (2020).
${ }^{31}$ G. Vishwakarma, A. Sonpal, and J. Hachmann, "Metrics for benchmarking and uncertainty quantification: Quality, applicability, and best practices for machine learning in chemistry," Trends Chem. 3, 146-156 (2021).
${ }^{32}$ E. Heid, C. J. McGill, F. H. Vermeire, and W. H. Green, "Characterizing uncertainty in machine learning for chemistry," ChemRxiv:2023-00vcg-v2 (2023).
${ }^{33}$ N. Artrith, K. T. Butler, F.-X. Coudert, S. Han, O. Isayev, A. Jain, and A. Walsh, "Best practices in machine learning for chemistry," Nat. Chem. 13, 505-508 (2021).
${ }^{34}$ A. Bender, N. Schneider, M. Segler, W. Patrick Walters, O. Engkvist, and T. Rodrigues, "Evaluation guidelines for machine learning tools in the chemical sciences," Nat. Rev. Chem. 6, 428-442 (2022).
${ }^{35}$ A. M. Miksch, T. Morawietz, J. Kästner, A. Urban, and N. Artrith, "Strategies for the construction of machine-learning potentials for accurate and efficient atomicscale simulations," Mach. Learn.: Sci. Technol. 2, 031001 (2021).
${ }^{36}$ V. L. Deringer, "Modelling and understanding battery materials with machine-learning-driven atomistic simulations," J. Phys. Energy 2, 041003 (2020).
${ }^{37}$ P. Liu, C. Verdi, F. Karsai, and G. Kresse, "Phase transitions of zirconia: Machine-learned force fields beyond density functional theory," Phys. Rev. B 105, L060102 (2022).
${ }^{38}$ E. V. Podryabinkin and A. V. Shapeev, "Active learning of linearly parametrized interatomic potentials," Comput. Mater. Sci. 140, 171-180 (2017).
${ }^{39}$ L. Zhang, D.-Y. Lin, H. Wang, R. Car, and W. E, "Active learning of uniformly accurate interatomic potentials for materials simulation," Phys. Rev. Mater. 3, 023804 (2019).
${ }^{40}$ J. Vandermause, S. B. Torrisi, S. Batzner, Y. Xie, L. Sun, A. M. Kolpak, and B. Kozinsky, "On-the-fly active learning of interpretable Bayesian force fields for atomistic rare events," npj Comput. Mater. 6, 20 (2020).
${ }^{41}$ V. L. Deringer, A. P. Bartók, N. Bernstein, D. M. Wilkins, M. Ceriotti, and G. Csányi, "Gaussian process regression for materials and molecules," Chem. Rev. 121, 10073-10141 (2021).
${ }^{42}$ D. Bayerl, C. M. Andolina, S. Dwaraknath, and W. A. Saidi, "Convergence acceleration in machine learning potentials for atomistic simulations," Digital Discovery 1, 61-69 (2022).
${ }^{43}$ J. Behler and G. Csányi, "Machine learning potentials for extended systems: A perspective," Eur. Phys. J. B 94, 142 (2021).
${ }^{44}$ J. D. Morrow and V. L. Deringer, "Indirect learning and physically guided validation of interatomic potential models," J. Chem. Phys. 157, 104105 (2022).
${ }^{45}$ S. N. Pozdnyakov, M. J. Willatt, A. P. Bartók, C. Ortner, G. Csányi, and M. Ceriotti, "Incompleteness of atomic structure representations," Phys. Rev. Lett. 125, 166001 (2020).
${ }^{46}$ J. Behler, "Atom-centered symmetry functions for constructing highdimensional neural network potentials," J. Chem. Phys. 134, 074106 (2011).
${ }^{47}$ A. P. Bartók, R. Kondor, and G. Csányi, "On representing chemical environments," Phys. Rev. B 87, 184115 (2013).
${ }^{48}$ A. P. Thompson, L. P. Swiler, C. R. Trott, S. M. Foiles, and G. J. Tucker, "Spectral neighbor analysis method for automated generation of quantum-accurate interatomic potentials," J. Comput. Phys. 285, 316-330 (2015).
${ }^{49}$ K. T. Schütt, H. E. Sauceda, P.-J. Kindermans, A. Tkatchenko, and K.-R. Müller, "SchNet - A deep learning architecture for molecules and materials," J. Chem. Phys. 148, 241722 (2018).
${ }^{50}$ S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt, and B. Kozinsky, "E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials," Nat. Commun. 13, 2453 (2022).
${ }^{51}$ F. Musil, A. Grisafi, A. P. Bartók, C. Ortner, G. Csányi, and M. Ceriotti, "Physics-inspired structural representations for molecules and materials," Chem. Rev. 121, 9759-9815 (2021).
${ }^{52}$ A. Glielmo, C. Zeni, and A. De Vita, "Efficient nonparametric $n$-body force fields from machine learning," Phys. Rev. B 97, 184307 (2018).
${ }^{53}$ V. L. Deringer, C. J. Pickard, and G. Csányi, "Data-driven learning of total and local energies in elemental boron," Phys. Rev. Lett. 120, 156001 (2018).
${ }^{54}$ J. Behler and M. Parrinello, "Generalized neural-network representation of high-dimensional potential-energy surfaces," Phys. Rev. Lett. 98, 146401 (2007).
${ }^{55}$ N. Artrith and A. Urban, "An implementation of artificial neural-network potentials for atomistic materials simulations: Performance for $\mathrm{TiO}_{2}$," Comput. Mater. Sci. 114, 135-150 (2016).
${ }^{56}$ J. S. Smith, O. Isayev, and A. E. Roitberg, "ANI-1: An extensible neural network potential with DFT accuracy at force field computational cost," Chem. Sci. 8, 3192-3203 (2017).
${ }^{57}$ L. Zhang, J. Han, H. Wang, R. Car, and W. E, "Deep potential molecular dynamics: A scalable model with the accuracy of quantum mechanics," Phys. Rev. Lett. 120, 143001 (2018).
${ }^{58}$ A. P. Bartók, M. C. Payne, R. Kondor, and G. Csányi, "Gaussian approximation potentials: The accuracy of quantum mechanics, without the electrons," Phys. Rev. Lett. 104, 136403 (2010).
${ }^{59}$ A. Shapeev, "Moment tensor potentials: A class of systematically improvable interatomic potentials," Multiscale Model. Simul. 14, 1153-1173 (2016).
${ }^{60}$ R. Drautz, "Atomic cluster expansion for accurate and transferable interatomic potentials," Phys. Rev. B 99, 014104 (2019).
${ }^{61}$ A. Bochkarev, Y. Lysogorskiy, C. Ortner, G. Csányi, and R. Drautz, "Multilayer atomic cluster expansion for semilocal interactions," Phys. Rev. Res. 4, L042019 (2022).
${ }^{62} \mathrm{~J}$. Behler, "Four generations of high-dimensional neural network potentials," Chem. Rev. 121, 10037-10072 (2021).
${ }^{63}$ M. Pinheiro, F. Ge, N. Ferré, P. O. Dral, and M. Barbatti, "Choosing the right molecular machine learning potential," Chem. Sci. 12, 14396-14413 (2021).
${ }^{64}$ C. M. Bishop, Pattern Recognition and Machine Learning (Springer, New York, 2006).
${ }^{65}$ V. L. Deringer and G. Csányi, "Machine learning based interatomic potential for amorphous carbon," Phys. Rev. B 95, 094203 (2017).
${ }^{66}$ C. J. Pickard and R. J. Needs, "High-pressure phases of silane," Phys. Rev. Lett. 97, 045504 (2006).
${ }^{67}$ C. J. Pickard and R. J. Needs, "Ab initio random structure searching," J. Phys.: Condens. Matter 23, 053201 (2011).
${ }^{68}$ N. Bernstein, G. Csányi, and V. L. Deringer, "De novo exploration and selfguided learning of potential-energy surfaces," npj Comput. Mater. 5, 99 (2019).
${ }^{69}$ A. A. Peterson, R. Christensen, and A. Khorshidi, "Addressing uncertainty in atomistic machine learning," Phys. Chem. Chem. Phys. 19, 10978-10985 (2017).
${ }^{70}$ R. Jinnouchi, J. Lahnsteiner, F. Karsai, G. Kresse, and M. Bokdam, "Phase transitions of hybrid perovskites simulated by machine-learning force fields trained on the fly with Bayesian inference," Phys. Rev. Lett. 122, 225701 (2019).
${ }^{71}$ M. Wen and E. B. Tadmor, "Uncertainty quantification in molecular simulations with dropout neural network potentials," npj Comput. Mater. 6, 124 (2020).
${ }^{72}$ N. Artrith and J. Behler, "High-dimensional neural network potentials for metal surfaces: A prototype study for copper," Phys. Rev. B 85, 045439 (2012).
${ }^{73}$ A. P. Bartók, J. Kermode, N. Bernstein, and G. Csányi, "Machine learning a general-purpose interatomic potential for silicon," Phys. Rev. X 8, 041048 (2018).
${ }^{74}$ V. L. Deringer, N. Bernstein, A. P. Bartók, M. J. Cliffe, R. N. Kerber, L. E. Marbella, C. P. Grey, S. R. Elliott, and G. Csányi, "Realistic atomistic structure of
amorphous silicon from machine-learning-driven molecular dynamics," J. Phys. Chem. Lett. 9, 2879-2885 (2018).
${ }^{75}$ A. Jain, S. P. Ong, G. Hautier, W. Chen, W. D. Richards, S. Dacek, S. Cholia, D. Gunter, D. Skinner, G. Ceder, and K. A. Persson, "Commentary: The Materials Project: A materials genome approach to accelerating materials innovation," APL Mater. 1, 011002 (2013).
${ }^{76}$ F. H. Stillinger and T. A. Weber, "Computer simulation of local order in condensed phases of silicon," Phys. Rev. B 31, 5262-5271 (1985).
${ }^{77}$ C. J. Pickard, "Ephemeral data derived potentials for random structure search," Phys. Rev. B 106, 014102 (2022).
${ }^{78}$ D. Zagorac, H. Müller, S. Ruehl, J. Zagorac, and S. Rehme, "Recent developments in the inorganic crystal structure database: Theoretical crystal structure data and related features," J. Appl. Crystallogr. 52, 918-925 (2019).
${ }^{79}$ L. C. Erhard, J. Rohrer, K. Albe, and V. L. Deringer, "A machine-learned interatomic potential for silica and its relation to empirical models," npj Comput. Mater. 8, 90 (2022).
${ }^{80}$ J. Sun, A. Ruzsinszky, and J. P. Perdew, "Strongly constrained and appropriately nomred semilocal density functional," Phys. Rev. Lett. 115, 036402 (2020).
${ }^{81}$ A. Togo and I. Tanaka, "First principles phonon calculations in materials science," Scr. Mater. 108, 1-5 (2015).
${ }^{82}$ M. Gastegger, J. Behler, and P. Marquetand, "Machine learning molecular dynamics for the simulation of infrared spectra," Chem. Sci. 8, 6924-6935 (2017).
${ }^{83}$ J. Westermayr, M. Gastegger, K. T. Schütt, and R. J. Maurer, "Perspective on integrating machine learning into computational chemistry and materials science," J. Chem. Phys. 154, 230903 (2021).
${ }^{84}$ M. Ceriotti, "Beyond potentials: Integrated machine-learning models for materials," MRS Bull. 47, 1045-1053 (2022).
${ }^{85}$ Y. Luo, M. Li, H. Yuan, H. Liu, and Y. Fang, "Predicting lattice thermal conductivity via machine learning: A mini review," npj Comput. Mater. 9, 4 (2023).
${ }^{86}$ G. C. Sosso, D. Donadio, S. Caravati, J. Behler, and M. Bernasconi, "Thermal transport in phase-change materials from atomistic simulations," Phys. Rev. B 86, 104301 (2012).
${ }^{87}$ Y.-B. Liu, J.-Y. Yang, G.-M. Xin, L.-H. Liu, G. Csányi, and B.-Y. Cao, "Machine learning interatomic potential developed for molecular simulations on thermal properties of $\beta-\mathrm{Ga}_{2} \mathrm{O}_{3}$," J. Chem. Phys. 153, 144501 (2020).
${ }^{88}$ C. Verdi, F. Karsai, P. Liu, R. Jinnouchi, and G. Kresse, "Thermal transport and phase transitions of zirconia by on-the-fly machine-learned interatomic potentials," npj Comput. Mater. 7, 156 (2021).
${ }^{89} \mathrm{P}$. Korotaev and A. Shapeev, "Lattice dynamics of $\mathrm{Yb}_{x} \mathrm{Co}_{4} \mathrm{Sb}_{12}$ skutterudite by machine-learning interatomic potentials: Effect of filler concentration and disorder," Phys. Rev. B 102, 184305 (2020).
${ }^{90}$ M. R. Carbone, M. Topsakal, D. Lu, and S. Yoo, "Machine-learning X-ray absorption spectra to quantitative accuracy," Phys. Rev. Lett. 124, 156401 (2020).
${ }^{91}$ C. D. Rankine, M. M. M. Madkhali, and T. J. Penfold, "A deep neural network for the rapid prediction of X-ray absorption spectra," J. Phys. Chem. A 124, 4263-4270 (2020).
${ }^{92}$ D. Golze, M. Hirvensalo, P. Hernández-León, A. Aarva, J. Etula, T. Susi, P. Rinke, T. Laurila, and M. A. Caro, "Accurate computational prediction of coreelectron binding energies in carbon-based materials: A machine-learning model combining density-functional theory and GW," Chem. Mater. 34, 6240-6254 (2022).
${ }^{93}$ A. V. Shapeev, D. Bocharov, and A. Kuzmin, "Validation of moment tensor potentials for fcc and bcc metals using EXAFS spectra," Comput. Mater. Sci. 210, 111028 (2022).
${ }^{94}$ A. C. Forse, C. Merlet, P. K. Allan, E. K. Humphreys, J. M. Griffin, M. Aslan, M. Zeiger, V. Presser, Y. Gogotsi, and C. P. Grey, "New insights into the structure of nanoporous carbons from NMR, Raman, and pair distribution function analysis," Chem. Mater. 27, 6848-6857 (2015).
${ }^{95}$ Y. Wang, Z. Fan, P. Qian, T. Ala-Nissila, and M. A. Caro, "Structure and pore size distribution in nanoporous carbon," Chem. Mater. 34, 617-628 (2022).
${ }^{96}$ R. A. Mata and M. A. Suhm, "Benchmarking quantum chemical methods: Are we heading in the right direction?," Angew. Chem., Int. Ed. 56, 11011-11018 (2017).
${ }^{97}$ A. Stukowski, "Visualization and analysis of atomistic simulation data with OVITO-the Open Visualization Tool," Model. Simul. Mater. Sci. Eng. 18, 015012 (2009).

