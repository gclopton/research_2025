# Fast and Accurate Uncertainty Estimation in Chemical Machine Learning 

Felix Musil, ${ }^{*, \dagger}$ Michael J. Willatt, ${ }^{*, \dagger}$ Mikhail A. Langovoy, ${ }^{\ddagger}$ and Michele Ceriott ${ }^{\dagger}$<br>† Laboratory of Computational Science and Modeling, IMX, École Polytechnique Fédérale de Lausanne, 1015 Lausanne, Switzerland<br>‡ Machine Learning \& Optimization Laboratory, IC, École Polytechnique Fédérale de Lausanne, 1015 Lausanne, Switzerland<br>E-mail: felix.musil@epfl.ch; michael.willatt@epfl.ch


#### Abstract

We present a scheme to obtain an inexpensive and reliable estimate of the uncertainty associated with the predictions of a machine-learning model of atomic and molecular properties. The scheme is based on resampling, with multiple models being generated based on sub-sampling of the same training data. The accuracy of the uncertainty prediction can be benchmarked by maximum likelihood estimation, which can also be used to correct for correlations between resampled models, and to improve the performance of the uncertainty estimation by a cross-validation procedure. In the case of sparse Gaussian Process Regression models, this resampled estimator can be evaluated at negligible cost. We demonstrate the reliability of these estimates for the prediction of molecular energetics, and for the estimation of nuclear chemical shieldings in molecular crystals. Extension to estimate the uncertainty in energy differences, forces, or other correlated predictions is straightforward. This method can be easily applied to other machine learning schemes, and will be beneficial to make data-driven


predictions more reliable, and to facilitate training-set optimization and active-learning strategies.

口

## 1 Introduction

Much research over the last decade has explored the applicability of machine learning methods to materials science and computational chemistry. In particular, a very promising line of research involves using statistical regression models (artificial neural networks, kernel ridge regression, decision trees, etc.) to predict quantum mechanical properties of atomistic systems (energy, response functions, density, etc.) based on a small number of reference calculations, using only the atomic structure as input. $1 \cdot 4$ The main reason these methods have gained so much traction in recent years is their promise to achieve high accuracy predictions at an affordable computational cost. ${ }^{5}$ For example, it is possible to train a neural network to predict the formation energy of a crystal by providing it with a training set of atomic structure-energy pairs, derived from an electronic structure calculation. While the accuracy of the neural network is ultimately throttled by the accuracy of the underlying electronic structure method, it can be driven towards this theoretical maximum by increasing the size of the training set. ${ }^{617}$ Then, the trained neural network competes with the accuracy of the underlying electronic structure method despite having a computational expense that might be many orders of magnitude smaller. This enables a huge array of investigations that would otherwise be prohibitively expensive. 413

One of the possible approaches to quantify the accuracy of a machine learning model when presented with new inputs (the generalization error), involves measuring the residual error on a set of input-observation pairs (the test set) that are deliberately excluded from the training phase. These residual errors might be combined into a single score for the model, e.g.

[^0]the Root Mean Square Error (RMSE) or Mean Absolute Error (MAE), which provides an estimate of the magnitude of the expected residual for an arbitrary input on average. Scores like the RMSE and MAE are undoubtedly useful guides, but one would often like an estimate of the error or uncertainty associated with a particular input. $\stackrel{10 \mid 14-19}{-19}$ Roughly speaking, one would like to know when the model is interpolating and when it is extrapolating (and thus likely to be less reliable). Not only can such a measure of prediction uncertainty allow the computational chemist to draw conclusions more confidently from the model, it can also direct the construction of the training set by highlighting important regions of the input space that are underrepresented. $\lcm{2021}$

In this article we focus on Gaussian Process Regression (GPR) $\stackrel{20}{20}$ for the prediction of atomic structure properties with the well-established Smooth Overlap of Atomic Positions ${ }^{1111222223}$ (SOAP) framework to generate the kernels. In the GPR framework a prediction is the mean of a normal distribution that depends on the training set, and the standard deviation of this distribution provides an uncertainty estimate for each prediction. We compare this uncertainty estimator with another that is based on sub-sampling ${ }^{\underline{24 / 25}}$ of the training set, where multiple models are trained on different portions of the training set and the distribution of predictions across the models is used to estimate the prediction uncertainty. We discuss ways to assess the relative performance of different uncertainty estimators, and to improve the performance of an estimator by a calibration procedure based on cross-validation. We demonstrate this framework by assessing the accuracy of SOAP-GPR predictions of formation energies in the QM9 data set ${ }^{\underline{26}}$ and ${ }^{1} \mathrm{H}$ NMR chemical shieldings in the CSD data set. $\stackrel{27 \mid 28}{2}$

## 2 Methods

We start by giving a short summary of the GPR framework, the projected process (PP) approximation, and the associated uncertainty estimators. These are well-known results,
which can also be found e.g. in Refs. 20,29, but we report them here for completeness and to introduce our notation. We then discuss resampling estimators of sample statistics, and the use of maximum likelihood to compare and optimize the fitness of different statistical models.

### 2.1 Gaussian Process Regression

In regression, a target property $y$ of an input $\mathcal{X}$ is often assumed to be contaminated with noise,

$$
y(\mathcal{X})=f(\mathcal{X})+\epsilon
$$

In the GPR framework, we further assume that $\epsilon \sim \mathcal{N}(0, \sigma)$ is Gaussian random noise and the underlying function we wish to model $f \sim \mathcal{G} \mathcal{P}(0, K)$ is a Gaussian Process.

Effectively, a GPR model predicts the target property $y$ of an input $\mathcal{X}$, given a training set containing $N$ input and observation pairs $D \equiv\left\{\left(\mathcal{X}_{i}, y_{i}\right)\right\}$, as a linear combination of basis functions,

$$
y(\mathcal{X})=\sum_{i} x_{i} k\left(\mathcal{X}_{i}, \mathcal{X}\right)
$$

where the inputs $\left\{\mathcal{X}_{i}\right\}$ are those for which the target property has been observed. The function that serves as the basis $k\left(\mathcal{X}, \mathcal{X}^{\prime}\right)$ is called the kernel and should represent the similarity between its inputs, so that it is large if two inputs are similar and small if they are not.

Exact GPR models become computationally prohibitive for large training sets, so many sparse approximations have been developed to overcome this limitation in recent years. 20130 We use the Projected Process (PP) approximation, also called Projected Latent Variables, throughout this paper. 2031 A subset $M$ of the $N$ training inputs is selected as an 'active' or 'representative' set, and it is used as the new basis for the regression, enhanced by its correlations with the full training set. The utility of compressing the model in this way is strongly dependent on the choice of the representative set. Possible approaches include

Farthest Point Sampling (FPS), $\sqrt{32 \mid 33}$ to maximize the dissimilarity of the inputs in the representative set, and the use of CUR to minimize the effect of the PP approximation on the kernel matrix of the entire training set. ${ }^{34}$ The approximate GPR prediction for a new input $\mathcal{X}$ and the variance associated with this prediction are:

$$
\begin{aligned}
y_{P P}(\mathcal{X}) & =K_{\mathcal{X} M} \tilde{K}^{-1} K_{M N} \boldsymbol{y} \\
\sigma_{P P}^{2}(\mathcal{X}) & =\sigma^{2}+K_{\mathcal{X X}}-Q_{\mathcal{X X}}+K_{\mathcal{X} M} \tilde{K}^{-1} K_{\mathcal{X} M}^{T}
\end{aligned}
$$

where $K_{N M}$ and $K_{\mathcal{X} M}$ are the kernel matrices between the $M$ active inputs and the $N$ training inputs and the new input $\mathcal{X}$ respectively, $Q_{\mathcal{X} \mathcal{X}}=K_{\mathcal{X} M} K_{M M}^{-1} K_{\mathcal{X} M}^{T}$ and $\tilde{K}=\left(K_{M M}+\sigma^{-2} K_{N M}^{T} K_{N M}\right)$.

The probabilistic nature of the GPR model provides an uncertainty estimate of its predictions: if the Gaussian process assumption is correct, then the interval $\left[y(\mathcal{X})-\sigma_{P P}(\mathcal{X}), y(\mathcal{X})+\right. \left.\sigma_{P P}(\mathcal{X})\right]$ will contain the target $67 \%$ of the time. If the interval is particularly large, then the prediction is untrustworthy (though in many cases the actual error might be small), and the training set should be extended with points close to $\mathcal{X}$.

### 2.2 Resampling

Another approach to estimate the uncertainty associated with a prediction involves creating a family of models based on the same input data, which are representative of the statistical error associated with the finite amount of available training inputs. $\stackrel{[1524|25| 35]}{[ }$ Here we will discuss bootstrapping and sub-sampling techniques, which are applicable to any predictive statistical model.

Given the original training set $D$ of size $N$, one creates $N_{\mathrm{R}}$ new data sets by drawing $n$ input-observation pairs from $D$. In bootstrapping, the input-observation pairs are drawn from $D$ with replacement and $n=N$, whereas in sub-sampling the selection is performed without replacement and $n<N$. Models trained independently on this ensemble of resampling data sets produce a fully non-parametric estimate of the distribution of the prediction
for an input $\mathcal{X}, P(y \mid \mathcal{X})$, whose moments can be calculated, e.g.

$$
\begin{aligned}
y_{R S}(\mathcal{X}) & =\frac{1}{N_{\mathrm{R}}} \sum_{i} y^{(i)}(\mathcal{X}) \\
\sigma_{R S}^{2}(\mathcal{X}) & =\frac{1}{N_{\mathrm{R}}-1} \sum_{i}\left[y^{(i)}(\mathcal{X})-y_{R S}(\mathcal{X})\right]^{2}
\end{aligned}
$$

where $y^{(i)}(\mathcal{X})$ is the prediction for the $i^{\text {th }}$ resampling model. An advantage of this family of methods is that the ensemble of predictions $\left\{y^{(i)}(\mathcal{X})\right\}$ provides a full characterization of the error statistics which makes it possible to evaluate a non-parametric empirical model of $P(y \mid \mathcal{X})$. What is more, when considering multiple inputs $\left\{X_{n}\right\}$, the ensemble of predictions relates to the fully correlated prediction distribution $P\left(\boldsymbol{y} \mid\left\{\mathcal{X}_{n}\right\}\right)$, making it trivial to estimate the uncertainty for any combination of the predictions.

In bootstrapping, the procedure is called the pairs resampling algorithm (as opposed to the bootstrap residuals resampling algorithm), $\sqrt{1415}$ and it is commonly used in machine learning to construct committee models ${ }^{\frac{\sqrt{36}}{6}}$ and estimate prediction uncertainties. In the context of uncertainty estimation, the bootstrap variance $\sigma_{R S}^{2}(\mathcal{X})$ is sometimes used to estimate uncertainties in predictions from neural networks, where it has been found to be more reliable than alternative estimators because the variability of the predictions with respect to the initialization parameters of the neural network is incorporated automatically. ${ }^{\underline{15137}}$

Bootstrapping generates random samples of the right size $N$ from the wrong distribution. On the other hand, sub-sampling generates random samples of the wrong size $n<N$ from the right distribution, provided $n \ll N .{ }^{\underline{25}}$ There are a variety of approaches to correct for this shortcoming of the sub-sampling approach. The most common is to assume a power law relationship between the statistic one is interested in and the size of the sub-sample $n$. Linear regression for a variety of sub-sample sizes then allows one to infer the exponent in the power law and extrapolate to the $n \rightarrow N$ limit. 25

Instead, to extrapolate to the $n \rightarrow N$ limit, we apply a linear $(\sigma \rightarrow \alpha \sigma)$ or non-linear $(\sigma \rightarrow \left.\alpha \sigma^{\gamma}\right)$ transformation to the predicted uncertainties. For resampled estimators this can be
implemented as a transformation of the ensemble of predictions (see Eq. 19), which allows us to correct the distribution of predictions without assuming a particular functional form. The parameters of this transformation can be determined using maximum likelihood estimation described below. This procedure can be applied to sub-sampling and bootstrapping alike, but the criteria we use to assess uncertainty estimates suggest that bootstrapping offers no advantage over sub-sampling for uncertainty estimation with the GPR PP models presented here. Since sub-sampling is simpler and computationally cheaper, we focus on sub-sampling in the remainder of this article.

A practical concern regarding resampling algorithms is that they require $N_{\mathrm{R}}$ models to be trained, which increases the computational cost $N_{\mathrm{R}}$-fold. ${ }^{15116}$ However, this added computational cost is associated with the training phase, whereas calculating the GPR variance is expensive in the testing phase. In most situations where one would like an uncertainty estimate for each prediction, an extended training phase is often preferable over an increased cost of making predictions. Moreover, if one exploits the model compression scheme (GPR PP) outlined earlier, where the training set is partitioned into active and passive components, then the computational expense of training and testing can be reduced significantly for both the resampling and GPR approaches to uncertainty estimation. Furthermore, if one uses the same representative set for all models then the cost of predicting the uncertainty for a resampling estimator becomes effectively zero. In fact, one only needs to compute once the kernel between the new input and the representative set (which is typically the expensive step), and evaluating multiple models requires only the calculation of $N_{\mathrm{R}}$ scalar products. This is in stark contrast to similar approaches based on neural networks ${ }^{\sqrt{16138}}$ in which the evaluation of multiple models entails a substantial overhead. The PP approximation is, however, known to be detrimental to the quality of the GPR variance and, to a lesser extent, the prediction.

### 2.3 Log-likelihood assessment of uncertainty estimates

Assessing the prediction accuracy of a machine learning model is straightforward, as it suffices to compute some average of the prediction errors $y_{n}-y\left(\mathcal{X}_{n}\right)$ for an appropriate validation/test set of points. However, how should one assess the quality of a model that provides an estimate of the uncertainty $\sigma(\mathcal{X})$ as well as of the value of the property $y(\mathcal{X})$ ? Here, we use for this purpose a log-likelihood estimator that has also been adopted for the same purpose in some classical works on statistical regression. $\underline{1739}$

In a nutshell, we assume that the true values of the properties $\boldsymbol{y}$ associated with the test structures $\left\{\mathcal{\mathcal { X } _ { n }}\right\}_{n=0,1, \ldots}$ are uncorrelated and follow a Gaussian probability distribution,

$$
P\left(\boldsymbol{y} \mid\left\{\mathcal{X}_{n}\right\}_{n=0,1, \ldots}\right)=\prod_{n=0}^{N} \frac{1}{\sqrt{2 \pi \sigma^{2}\left(\mathcal{X}_{n}\right)}} \exp \left(-\frac{\left(y_{n}-y\left(\mathcal{X}_{n}\right)\right)^{2}}{2 \sigma^{2}\left(\mathcal{X}_{n}\right)}\right),
$$

whose means $y\left(\mathcal{X}_{n}\right)$ and variances $\sigma^{2}\left(\mathcal{X}_{n}\right)$ are determined with a statistical model - a Gaussian Process or a committee of Gaussian Processes in the present work (see Eqs. 3 ) and (4) respectively). The match between the predictions and the actual values of $y$ can be quantified by summing the logarithms of $P(y \mid \mathcal{X})$ over an appropriate test set - corresponding to the logarithm of the probability that the true targets are a realization of the model,

$$
L L=\frac{1}{N_{\text {test }}} \sum_{\mathcal{X}_{n} \in \text { test }} \log P\left(y_{n} \mid \mathcal{X}_{n}\right)
$$

When using the same test set to compare two models that only differ by the uncertainty estimate, the best model will yield the highest value of $L L$. Note that a more general discussion of the likelihood for Gaussian probability distributions can be found in Ref. 40 ,

### 2.4 Maximum likelihood estimation for scaling uncertainty estimates

Since sub-sampling models are trained with $n<N$ input-observation pairs, the distribution of predictions about the reference over a set of sub-sampling models is likely to be too broad or narrow in general. If we assume that the distributions for different inputs are broadened or narrowed by roughly the same amount, then this distortion can be corrected by scaling each distribution (or its moments) by the same constant. The same approach can of course be applied to the GPR variances, to correct for the detrimental effect of a small representative set, and also to bootstrapping to correct for artificial correlations between the resampled models.

Maximum likelihood estimation is a straightforward means of determining the constant. We suppose the reference prediction $y\left(\mathcal{X}_{n}\right)$ that corresponds to $\mathcal{X}_{n}$ is normally distributed about the target $y_{n}$ with a variance $\sigma^{2}\left(\mathcal{X}_{n}\right)$, which might correspond to GPR or resampling. Since this supposes the targets are uncorrelated, the total log likelihood of the targets is a sum of log likelihoods,

$$
L L(\mathbf{z})=-\frac{1}{2} \sum_{n} \frac{z_{n}^{2}}{\sigma^{2}\left(\mathcal{X}_{n}\right)}+\log \left(2 \pi \sigma^{2}\left(\mathcal{X}_{n}\right)\right)
$$

where $z_{n}=y_{n}-y\left(\mathcal{X}_{n}\right)$. In order to tune all the variances, we take $\sigma^{2}\left(\mathcal{X}_{n}\right) \rightarrow v \sigma^{2}\left(\mathcal{X}_{n}\right)$ so the log likelihood becomes

$$
L L(\mathbf{z}, v)=-\frac{1}{2} \sum_{n} \frac{z_{n}^{2}}{v \sigma^{2}\left(\mathcal{X}_{n}\right)}+\log \left(2 \pi v \sigma^{2}\left(\mathcal{X}_{n}\right)\right)
$$

The parameter $v$ can be optimized on a validation set of size $N_{\text {val }}$, where the residuals $\mathbf{z}$ are known. Demanding that the log likelihood is maximized over the validation set leads to

$$
v_{0}=\frac{1}{N_{\mathrm{val}}} \sum_{n} \frac{z_{n}^{2}}{\sigma^{2}\left(\mathcal{X}_{n}\right)}
$$

We then use the parameter $v_{0}$ to scale the GPR variances or resampling distributions when the model is later used for testing. Note that (as we will discuss in the results section) this scaling of the predicted variance is just one of the possible strategies that can be used to increase the accuracy of the uncertainty estimation. For instance, one can apply a more general transformation of $\sigma^{2}(\mathcal{X})$, computed from the GPR estimator or resampling.

As is often the case, one should be wary of overfitting. While we mitigate this risk by a cross-validation procedure, in the context of maximum likelihood estimation it is customary to introduce a penalty for the complexity of the model. Commonly used techniques, such as the Bayesian Information Criterion, ${ }^{41}$ or the Akaike Information Criterion, ${ }^{42}$ also allow for an information-theoretic interpretation that justifies a comparison between models of different complexity. For the Gaussian process case, the scaling factor $v_{0}$ is the scalar product norm of the score vector for the sub-problem with $N_{\text {val }}$ observations. The covariance matrix is the Gram matrix of the score vector. Therefore, in view of the Cauchy-Schwarz inequality for scalar products in Hilbert spaces, $v_{0}$ serves as a normalizing factor for the $L L$. This implies that $L L\left(\mathbf{z}, v_{0}\right)$ can be also used as a likelihood-based test statistic for testing the above assumption of uncorrelated normally distributed reference predictions. ${ }^{43}$

In a demanding, real application, removing input-observation pairs from the training set might be overly wasteful. In Ref. 37, Heskes points out that in a randomly-resampled data set $D_{i}$, many of the input-observation pairs in $D$ will be absent and can thus be used for validation. An attractive way of determining $v_{0}$ without explicitly constructing a validation set is therefore the following,

$$
\begin{gathered}
y_{\mathrm{INT}}\left(\mathcal{X}_{n}\right)=\frac{1}{N_{\mathrm{R}}(\mathcal{X})} \sum_{\mathcal{X} \notin D_{i}} y^{(i)}(\mathcal{X}) \\
\sigma_{\mathrm{INT}}^{2}\left(\mathcal{X}_{n}\right)=\frac{1}{N_{\mathrm{R}}(\mathcal{X})-1} \sum_{\substack{i \\
\mathcal{X} \notin D_{i}}}\left[y^{(i)}(\mathcal{X})-y_{\mathrm{INT}}(\mathcal{X})\right]^{2},
\end{gathered}
$$

where $N_{\mathrm{R}}(\mathcal{X})$ is the number of resampling models that do not contain $\mathcal{X}$ in the training set.

Then,

$$
v_{0}=\frac{1}{N_{\mathrm{int}}} \sum_{n} \frac{z_{n}^{2}}{\sigma^{2}\left(\mathcal{X}_{n}\right)}
$$

where the sum only includes an input $\mathcal{X}_{n}$ if it is absent from at least a few of the resampling data sets, $z_{n}$ is the difference between the target and the leave-one-out ${ }^{44}$ prediction and $N_{\text {int }}$ is the number of absent inputs. It is straightforward to show that, as the size $N$ of the training set grows, the fraction of absent inputs for a random bootstrap sample tends to $e^{-1}$, while for sub-sampling it is always $1-n / N$. This means for example that if one takes $N_{\mathrm{R}}=10$ and $n=N / 2$, slightly more than $50 \%$ of the training inputs are expected to be absent from at least five of the resampling models, and the size of the effective validation set for the procedure described above is therefore roughly half of the full training set. Note that this procedure cannot be applied to scaling GPR variances.

### 2.5 Smooth Overlap of Atomic Positions

We use the SOAP kernel in this work to compare atomic environments and structures, which is invariant under rotations, translations and permutations of identical atoms. $\stackrel{12|22| 23|45| 47 \mid}{4}$ For two atomic environments $\mathcal{X}_{i}$ and $\mathcal{X}_{j}$, the SOAP environmental kernel is given by an inner product between power spectra,

$$
k\left(\mathcal{X}_{i}, \mathcal{X}_{j}\right)=\sum_{n n^{\prime} l \alpha \alpha^{\prime}}\left\langle\mathcal{X}_{i}^{(2)} \mid \alpha n \alpha^{\prime} n^{\prime} l\right\rangle\left\langle\alpha n \alpha^{\prime} n^{\prime} \mid \mathcal{X}_{j}^{(2)}\right\rangle
$$

where

$$
\left\langle\alpha n \alpha^{\prime} n^{\prime} \mid \mathcal{X}_{j}^{(2)}\right\rangle=\sqrt{\frac{8 \pi^{2}}{2 l+1}} \sum_{m}\left\langle\mathcal{X}_{j} \mid \alpha n l m\right\rangle\left\langle\alpha^{\prime} n^{\prime} l m \mid \mathcal{X}_{j}\right\rangle,
$$

and the $\left\langle\alpha n l m \mid \mathcal{X}_{j}\right\rangle$ are linear expansion coefficients of the density associated with atoms of type $\alpha$ in the environment,

$$
\left\langle\alpha n l m \mid \mathcal{X}_{j}\right\rangle=\int d \mathbf{r} r^{2} \psi_{\mathcal{X}_{j}}^{\alpha}(\mathbf{r}) Y_{l}^{m}(\mathbf{r}) R_{n}(r)
$$

The $Y_{l}^{m}(\mathbf{r})$ are spherical harmonics, $R_{n}(r)$ are radial basis functions, and the density of atoms of type $\alpha$ in the environment is a linear combination of atom-centred Gaussians $g(\mathbf{r})$,

$$
\psi_{\mathcal{X}_{j}}^{\alpha}\left(\mathbf{r} ; \mathcal{X}_{i}\right)=\sum_{j \in \alpha} g\left(\mathbf{r}-\mathbf{r}_{i j}\right) f_{\mathrm{cut}}\left(r_{i j}\right)
$$

The cutoff function $f_{\text {cut }}\left(r_{i j}\right)$ restricts the sum to atoms that are close to the atom at the centre of $\mathcal{X}_{i}$, for which $r_{i j} \equiv\left|\mathbf{r}_{i}-\mathbf{r}_{j}\right|$ is small. For the ${ }^{1} \mathrm{H}$ NMR chemical shielding predictions and uncertainty analysis, the environmental kernel is used directly because chemical shieldings are associated with individual atoms. For the formation energy predictions and uncertainty analysis, the environmental kernel is averaged over all environments in each molecule, because the formation energy is a property of the entire molecule. ${ }^{23}$ See Ref. 12 for a detailed discussion of SOAP for regression.

Note that, by default, SOAP kernels are dimensionless. For the GPR interpretation of the kernel as a covariance to make sense, they must assume the squared units of the property one wants to predict. This is easily achieved by taking

$$
K \frac{\operatorname{Var}[\mathbf{y}]}{\operatorname{Tr}[K]} \rightarrow K
$$

and the regularization parameter $\sigma^{2}$ must then be scaled by the same amount. This procedure has absolutely no effect on the prediction $y(\mathcal{X})$ but is essential to make the uncertainty estimate $\sigma_{\text {GPR }}^{2}(\mathcal{X})$ dimensionally correct and therefore meaningful.

The SOAP framework has been adopted in many different applications in chemistry and materials science, including ligand binding classification, tensorial property prediction, property prediction for silicon, etc. Recently, Bartok et al. presented a comprehensive analysis of prediction errors in a silicon potential which uses the SOAP environmental kernel as a basis. $\underline{10}$ They found that the GPR variance (subset of data approximation instead of PP approximation) provides a fair measure of the uncertainties associated with the potential for different silicon atom configurations, and they recommend it as a guide when expanding

Gaussian approximation potential databases.

### 2.6 Benchmark Datasets

### 2.6.1 Molecular Crystals dataset

The CSD-61k data set ${ }^{[28]}$ is based on 61 k organic crystals extracted from the Cambridge Structural Database (CSD), ${ }^{27}$ containing only H, C, N and O atoms, and having fewer than 200 atoms in the unit cell. Out of the CSD-61k set, 500 randomly picked structures, the CSD500 dataset, were optimized at the DFT+VdW level of theory. ${ }^{[28]}$ To generate a benchmark database for this work, that includes a more diverse set of off-equilibrium environments, the structures from the CSD-500 dataset were randomly perturbed away from their optimal geometries, so that the Root Mean Squared Deviation (RMSD) between the positions of an optimized structure and its rattled counterparts is $0.25 \AA$ and $0.5 \AA$. We call this dataset, that contains 890 structures, the CSD-890-R. The ${ }^{1} \mathrm{H}$ chemical shieldings were calculated using the Quantum Espresso package. $\sqrt[48]{50}$ We used PBE ${ }^{51}$ ultrasoft pseudopotentials with GIPAW ${ }^{5253}$ reconstruction, H.pbe-kjpaw_psl.0.1.UPF, C.pbe-n-kjpaw_psl.0.1.UPF, N.pbe-n-kjpaw_psl.0.1.UPF and O.pbe-n-kjpaw_psl.0.1.UPF from the PSlibrary 0.3.1. ${ }^{54}$ The wavefunction and charge density energy cut-offs were set to 100 Ry and 400 Ry respectively, the convergence threshold of the self consistent cycle is set to $10^{-12}$ Ry and a Monkhorst-Pack grid of k -points ${ }^{55}$ corresponding to a maximum spacing of $0.06 \AA$ in the reciprocal space. The scalar chemical shieldings are obtained from the average of the diagonal of the chemical shielding tensor using a linear response wave-vector of 0.02 bohrradius $^{-1}$ and a convergence threshold of $10^{-14} R y^{2}$ for the Green's function solver.

We randomly partitioned 30 k of the H environments into $20 \mathrm{k}, 5 \mathrm{k}$ and 5 k sets. One of the 5k sets was used for validation and the other was used for testing. We sorted the 20k training environments using FPS and used the 10k most diverse environments as the representative set for the PP approach. For sub-sampling we selected 16 random sub-samples of the training set for each sub-sample size. When using the training set in the log likelihood
procedure described earlier, we only counted environments if they were absent from at least five realizations of each sub-sampling model.

### 2.6.2 QM9 data set

The QM9 data set ${ }^{\underline{26}}$ contains about 134k structures of small organic molecules optimized at the hybrid-DFT level ${ }^{\underline{56}}$ containing up to nine heavy atoms ( $\mathrm{C}, \mathrm{N}, \mathrm{O}$ and F ), in addition to hydrogen atoms. Following Ref. 26, we removed all the 3,054 structures for which the SMILES string describing the molecule after relaxation differed from the starting configuration. We used as a target for the model the formation energies that include a zero-point energy correction. We randomly partitioned 30k of the QM9 structures into 20k, 5k and 5k sets. One of the 5k sets was used for validation and the other was used for testing. We sorted the 361k environments present in the 20k training structures with FPS and used the 5k most distant environments as the representative set in the PP approach. For sub-sampling we selected 16 random sub-samples of the training set for each sub-sample size.

## 3 Results and Discussion

### 3.1 Prediction of CSD ${ }^{\mathbf{1}} \mathbf{H}$ NMR chemical shieldings

| Size | LL (Raw) | LL (CV) | LL (N-L) | LL (Int.) | LL (Int., N-L) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 k | -0.554 | -0.398 | -0.356 | -0.398 | -0.356 |
| 5 k | -0.389 | -0.381 | -0.338 | -0.382 | -0.337 |
| 10 k | -0.952 | -0.392 | -0.324 | -0.407 | -0.324 |
| 15 k | -4.102 | -0.394 | -0.312 | -0.470 | -0.320 |
| 18 k | -18.75 | -0.412 | -0.308 | -0.517 | -0.351 |
| GPR PP | -8.771 | -0.255 | -0.251 | N/A | N/A |

Table 1: Log likelihood (LL) of predictions on the test set for different sub-sample sizes. After scaling the variances through maximum likelihood estimation - internally (Int.) or on the validation set (CV) - the final log likelihood is insensitive to the sub-sample size. A non-linear scaling of the uncertainty (N-L) further improves the uncertainty model.

Table 1 shows the log likelihood on the test set (Eq. (6)) for different sub-sample sizes, before scaling with the maximum likelihood estimation scheme and after scaling, using either a validation set or internally with the training set as described earlier. It also shows the GPR log likelihoods before and after scaling with the validation set. Note that scaling the GPR variances using the training set for internal validation is impossible, hence the corresponding cells are empty.

We remark here that $L L$ (Raw) likelihoods in the first column of Table 1 can be directly compared to each other, when our goal is to evaluate relative efficiency of different sub-sample sizes. This is due to the fact that such comparison is equivalent to likelihood-based model selection with an Akaike information criterion-type (AIC) penalty. ${ }^{42}$ Indeed, AIC penalties depend only on the problem's dimensionality and not on the sub-sample size, so comparing penalized likelihoods in the AIC framework coincides with comparing $L L$ likelihoods in the first column of the Table.

This is a convenient feature of our approach, as, in general, values of log-likelihoods for different sub-problems cannot be directly compared to each other. ${ }^{4357}$ Strictly speaking, the powerful machinery of maximum likelihood only guarantees good properties of the best solution, but does not always directly induce a quality scale to rank other solutions via the use of the likelihood function.

Before scaling, the log likelihood shows considerable variability between resampling estimators obtained with different sample size. It appears that the estimator based on subsamples of 5 k environments (i.e. one quarter of the training set) strikes the best balance between resampling from the correct distribution but with the wrong size (small sub-sample sizes), and resampling from the wrong distribution but with the right size (large sub-sample sizes). Rescaling the uncertainty estimator leads to a substantially more stable, standardized version of the log-likelihood, and reduces greatly the impact of the sample size for RS estimators. Additionally, we observed that after rescaling, the GPR-PP estimator leads to noticeably higher log likelihood.

![](./images/769bcefe-4503-4a13-a4e7-2931ee530726-16_1247_1575_640_262.jpg)
Figure 1: Distribution of ${ }^{1} \mathrm{H}$ chemical shielding predictions. The solid line shows the distribution of $P\left(\ln \epsilon_{t} \mid \ln \sigma\right)$, while the dashed line shows the distribution of $P\left(\ln \epsilon_{m} \mid \ln \sigma\right)$ (see Eq. 18). The grayscale density plot corresponds to the marginal distribution of the predicted uncertainty $P(\ln \sigma)$.

The log likelihood provides a measure of the accuracy of the uncertainty estimation that is quantitative but hardly intuitive. To provide a more straightforward representation of the accuracy of an uncertainty estimator, we observe that in an ideal scenario, the distribution of actual errors relative to the reference should match the distribution of the predictions of RS models around their mean. The equality of the distributions should be true for an arbitrarilyselected subset of the test set. Based on this observation, we computed the distribution of actual errors $\epsilon_{t}\left(\mathcal{X}_{n}\right)=\left|y\left(\mathcal{X}_{n}\right)-y_{n}\right|$ conditioned on the value of the predicted uncertainty $\sigma\left(\mathcal{X}_{n}\right)$, and the distribution of model errors $\epsilon_{m}\left(\mathcal{X}_{n}\right)=\left|y^{(i)}\left(\mathcal{X}_{n}\right)-y\left(\mathcal{X}_{n}\right)\right|$. Given that the predicted (and actual) errors can span a broad range, we computed the conditional on a log scale, e.g.

$$
P(\ln \epsilon \mid \ln \sigma)=P(\ln \epsilon, \ln \sigma) / P(\ln \sigma)
$$

The plots comparing the predicted and actual error distributions from the re-scaled estimators are shown in Fig. 1. One sees in all cases there is a good qualitative agreement between the distribution of the model (which is Gaussian by construction for the GPR model, and in some cases strongly non-Gaussian for RS estimators), with essentially none of the samples with large true errors being associated with a small $\sigma(\mathcal{X})$.

On the other hand, there are also substantial differences between the various estimators. An obvious difference is the range spanned by the predicted $\sigma(\mathcal{X})$. One could argue that - for a given LL - the model that spans the broader range of values is the most useful, as it yields better resolution between more or less trustworthy predictions. From this point of view, large-sample-size RS estimators appear to be superior, spanning almost two orders of magnitude in the value of $\sigma(\mathcal{X})$. The GPR PP model, however, clearly displays the best agreement between predicted and actual error distributions, which is consistent with the higher LL.

Looking more carefully at the distributions for the RS models, one can see that the actual errors tend to increase monotonically as a function of $\sigma(\mathcal{X})$, even though they do not follow the trend predicted by the sample distribution. This suggests that the performance

![](./images/769bcefe-4503-4a13-a4e7-2931ee530726-18_1249_1583_614_259.jpg)
Figure 2: Distribution of ${ }^{1} \mathrm{H}$ chemical shielding predictions. The solid line shows the distribution of $P\left(\ln \epsilon_{t} \mid \ln \sigma\right)$, while the dashed line shows the distribution of $P\left(\ln \epsilon_{m} \mid \ln \sigma\right)$ (see Eq. 18), including a non-linear scaling of the uncertainty corresponding to Eq. (19). The grayscale density plot corresponds to the marginal distribution of the predicted uncertainty $P(\ln \sigma)$.

of the estimator can be improved by introducing a more general transformation of $\sigma(\mathcal{X})$, and optimizing the parameters with a cross-validation procedure. As an example of the application of this idea, we define

$$
y^{(i)}\left(\mathcal{X}_{n}\right) \rightarrow y\left(\mathcal{X}_{n}\right)+\alpha\left[y^{(i)}\left(\mathcal{X}_{n}\right)-y\left(\mathcal{X}_{n}\right)\right] \sigma\left(\mathcal{X}_{n}\right)^{\gamma-1} .
$$

This transformation does not change the mean of the models, but generates a non-linearly transformed $\sigma\left(\mathcal{X}_{n}\right) \rightarrow \alpha \sigma\left(\mathcal{X}_{n}\right)^{\gamma}$. The scaling $\alpha$ and exponent $\gamma$ are optimized by crossvalidation. As shown in Fig. 2 this procedure improves the agreement between the RS and the actual error distribution, and brings the LL close to the level of the GPR PP estimator (see also Table 1). The observed improvement in fit hints at the possibility that the data are a better match to a light heavy-tailed process ${ }^{58}$ rather than to a standard Gaussian process. This is entirely plausible due to the high complexity of molecular models and high dimensionality of related data.

### 3.2 Prediction of QM9 formation energies

| Size | LL (Raw) | LL (CV) | LL (N-L) | LL (Int.) | LL (Int., N-L) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 k | 4.310 | 4.651 | 4.647 | 4.654 | 4.652 |
| 5 k | 4.655 | 4.661 | 4.673 | 4.658 | 4.673 |
| 10 k | 4.319 | 4.670 | 4.680 | 4.634 | 4.665 |
| 15 k | 2.928 | 4.684 | 4.690 | 4.553 | 4.631 |
| 18 k | -0.807 | 4.681 | 4.686 | 4.462 | 4.568 |
| GPR PP | 4.349 | 4.374 | 4.421 | $\mathrm{~N} / \mathrm{A}$ | $\mathrm{N} / \mathrm{A}$ |

Table 2: Log likelihood (LL) of predictions on the test set for different sub-sample sizes. After scaling the variances through maximum likelihood estimation (internally or on the validation set), the final $\log$ likelihood is insensitive to the sub-sample size. A non-linear scaling of the uncertainty further improves the uncertainty model.

Table 2 is the analogue of Table 1 for the QM9 data set. The same trend is observed as for the CSD data set with the 5k sub-sampling estimator as the most reliable, before scaling through maximum likelihood estimation. Despite the differences between predicting chemical

![](./images/769bcefe-4503-4a13-a4e7-2931ee530726-20_1243_1573_279_264.jpg)
Figure 3: Distribution of formation energy differences. The solid line shows the distribution of $P\left(\ln \epsilon_{t} \mid \ln \sigma\right)$, while the dashed line shows the distribution of $P\left(\ln \epsilon_{m} \mid \ln \sigma\right)$ (see Eq. 18). The grayscale density plot corresponds to the marginal distribution of the predicted uncertainty $P(\ln \sigma)$.

shieldings (a local property) and formation energies (a global property), we see again that the (non-linear) scaling procedure with a validation set makes the GPR and the sub-sample uncertainty estimators more or less equally reliable. The GPR estimator is consistently worse than the sub-sample estimators, however, even after scaling. This underscores the importance of having an objective way of comparing different uncertainty models, so that barring considerations related to the computational cost - the best estimator can be selected by cross-validation.

Figure 3 is the QM9 analogue of Figure 1, reporting a more analytical representation of
the correspondence between predicted and actual errors for the non-linearly scaled models. Again, the fundamental assumption of sub-sampling - that the sub-samples are to the reference what the reference is to the target - appears to be reliable. As for the CSD chemical shielding results, we found the quality of this agreement to be roughly the same, regardless of the sub-sample size. In this case, even after non-linear scaling, the GPR estimator yields a very narrow uncertainty distribution, while the RS models accurately predict the uncertainty over a span of two orders of magnitude.

## 4 Conclusions

We have presented a scheme to obtain an inexpensive and reliable estimate of the uncertainty associated with the predictions of a machine-learning model of atomic and molecular properties. The scheme is based on sub-sampling and sparse Gaussian Process Regression. We have investigated the reliability of this approach for two applications: the prediction of ${ }^{1}$ H NMR chemical shieldings in organic crystals and the prediction of formation energies of small organic molecules. In both cases we found the sub-sampling estimator to be reliable on the basis of log likelihood results and the good agreement between the true and predicted distribution of errors on a test set. Besides the improvement of the method in comparison to the standard GPR uncertainty estimate from the point of view of computational scaling, it appears that the RS models remain accurate even when they are heavily compressed through the PP approach, which is encouraging since model compression is often required to accelerate model training and inference.

The framework we introduce to optimize the uncertainty model based on an objective measure of the accuracy of uncertainty estimation can be also applied easily to other machine learning schemes, e.g. neural networks etc., even though for many of these schemes the evaluation of the uncertainty may come at a substantial cost, contrary to the case of a sparse GPR model. Besides the computational savings, the fact that the sub-sampling
models generate an ensemble of predictions makes it trivial to predict uncertainties in derived properties, that are obtained by linear or non-linear combination of multiple predictions.

An accurate and inexpensive uncertainty estimation opens up promising research directions in terms of training-set optimization, and the development of active-learning strategies. $\stackrel{59}{59}$ It also suggests the possibility of developing committee models $\stackrel{3660}{60}$ in which multiple ML predictions are performed, differing in the definition of the kernel and/or regularization. These can then be combined based on their uncertainty estimation, which would allow for instance to develop schemes that degrade gently to less accurate but more robust models when entering an extrapolative regime.

## 5 Acknowledgements

MC and MJW were supported by the European Research Council under the European Union's Horizon 2020 research and innovation programme (grant agreement no. 677013HBMAP). FM and ML were supported by NCCR MARVEL, funded by the Swiss National Science Foundation. Insightful discussion with Martin Jaggi, Federico Paruzzo and Albert Hofstatter are gratefully acknowledged.

## References

(1) Behler, J.; Parrinello, M. Generalized Neural-Network Representation of HighDimensional Potential-Energy Surfaces. Phys. Rev. Lett. 2007, 98, 146401.
(2) Bartók, A. P.; Payne, M. C.; Kondor, R.; Csányi, G. Gaussian Approximation Potentials: The Accuracy of Quantum Mechanics, without the Electrons. Phys. Rev. Lett. 2010, 104, 136403.
(3) Rupp, M.; Tkatchenko, A.; Müller, K.-R.; von Lilienfeld, O. A. Fast and Accurate

Modeling of Molecular Atomization Energies with Machine Learning. Phys. Rev. Lett. 2012, 108, 058301.
(4) Ward, L.; Agrawal, A.; Choudhary, A.; Wolverton, C. A general-purpose machine learning framework for predicting properties of inorganic materials. npj Computational Materials 2016, 2, 16028.
(5) von Lilienfeld, O. A. Quantum Machine Learning in Chemical Compound Space. Angew. Chemie Int. Ed. 2018, 57, 4164-4169.
(6) Amari, S.-i.; Murata, N. Statistical Theory of Learning Curves under Entropic Loss Criterion. Neural Computation 1993, 5, 140-153.
(7) Müller, K.-R.; Finke, M.; Murata, N.; Schulten, K.; Amari, S. A numerical study on learning curves in stochastic multilayer feedforward networks. Neural Computation 1996, 8, 1085-1106.
(8) Behler, J. Perspective: Machine learning potentials for atomistic simulations. J. Chem. Phys. 2016, 145.
(9) Smith, J. S.; Isayev, O.; Roitberg, A. E. ANI-1, A data set of 20 million calculated off-equilibrium conformations for organic molecules. Sci. Data 2017, 4, 170193.
(10) Bartók, A. P.; Kermode, J.; Bernstein, N.; Csányi, G. Machine learning a general purpose interatomic potential for silicon. 2018,
(11) Deringer, V. L.; Csányi, G. Machine learning based interatomic potential for amorphous carbon. Phys. Rev. B 2017, 95, 094203.
(12) Bartók, A. P.; De, S.; Poelking, C.; Bernstein, N.; Kermode, J. R.; Csányi, G.; Ceriotti, M. Machine learning unifies the modeling of materials and molecules. Sci. Adv. 2017, 3, e1701816.
(13) Kobayashi, R.; Giofré, D.; Junge, T.; Ceriotti, M.; Curtin, W. A. Neural network potential for $\mathrm{Al}-\mathrm{Mg}-\mathrm{Si}$ alloys. Phys. Rev. Mater. 2017, 1, 053604.
(14) Fox, J. Applied regression analysis and generalized linear models; Sage Publications, 2015.
(15) Tibshirani, R. A Comparison of Some Error Estimates for Neural Network Models. Neural Comput. 1996, 8, 152-163.
(16) Peterson, A. A.; Christensen, R.; Khorshidi, A. Addressing uncertainty in atomistic machine learning. Phys. Chem. Chem. Phys. 2017, 19, 10978-10985.
(17) Bishop, C. M.; Qazaz, C. S. Regression with input-dependent noise: A Bayesian treatment. Adv. Neural Inf. Process. Syst. 9 1997, 9, 347-353.
(18) Goldberg, P.; Williams, C.; Bishop, C. M. Regression with input-dependent noise: A gaussian process treatment. Adv. Neural Inf. Process. Syst. 1997, 10, 493-499.
(19) Nix, D.; Weigend, A. Estimating the mean and variance of the target probability distribution. Proc. 1994 IEEE Int. Conf. Neural Networks 1994, 55-60 vol.1.
(20) Rasmussen, C. E.; Williams, C. K. I. International journal of neural systems; World Scientific Publishing Company, 2006; Vol. 14; pp 69-106.
(21) Titsias, M. Variational learning of inducing variables in sparse Gaussian processes. Proc. Twelth Int. Conf. Artif. Intell. Stat. 2009, 5, 567-574.
(22) Bartók, A. P.; Gillan, M. J.; Manby, F. R.; Csányi, G. Machine-learning approach for one- and two-body corrections to density functional theory: Applications to molecular and condensed water. Phys. Rev. B 2013, 88, 054104.
(23) De, S.; Bartók, A. P.; Csányi, G.; Ceriotti, M. Comparing molecules and solids across structural and alchemical space. Phys. Chem. Chem. Phys. 2016, 18, 13754-13769.
(24) Politis, D. N.; Romano, J. P. Large Sample Confidence Regions Based on Subsamples under Minimal Assumptions. Ann. Stat. 1994, 22, 2031-2050.
(25) Politis, D.; Romano, J. P.; Wolf, M. Weak convergence of dependent empirical measures with application to subsampling in function spaces. J. Stat. Plan. Inference 1999, 79, 179-190.
(26) Ramakrishnan, R.; Dral, P. O.; Rupp, M.; von Lilienfeld, O. A. Quantum chemistry structures and properties of 134 kilo molecules. Sci. Data 2014, 1, 1-7.
(27) Groom, C. R.; Bruno, I. J.; Lightfoot, M. P.; Ward, S. C. The Cambridge Structural Database. Acta Crystallogr. Sect. B Struct. Sci. Cryst. Eng. Mater. 2016, 72, 171-179.
(28) Paruzzo, F. M.; Hofstetter, A.; Musil, F.; De, S.; Ceriotti, M.; Emsley, L. Chemical Shifts in Molecular Solids by Machine Learning. 2018,
(29) Quiñonero-Candela, J.; Rasmussen, C. E. A Unifying View of Sparse Approximate Gaussian Process Regression. J. ofMachine Learn. Res. 2005, 6, 1939-1959.
(30) Liu, H.; Ong, Y.-S.; Shen, X.; Cai, J. When Gaussian Process Meets Big Data: A Review of Scalable GPs. 2018,
(31) Seeger, M.; Williams, C. K. I.; Lawrence, N. D. Fast forward selection to speed up sparse Gaussian process regression. Artificial Intelligence and . . . 2003.
(32) Ceriotti, M.; Tribello, G. A.; Parrinello, M. Demonstrating the Transferability and the Descriptive Power of Sketch-Map. J. Chem. Theory Comput. 2013, 9, 1521-1532.
(33) Imbalzano, G.; Anelli, A.; Giofré, D.; Klees, S.; Behler, J.; Ceriotti, M. Automatic selection of atomic fingerprints and reference configurations for machine-learning potentials. J. Chem. Phys. 2018, 148, 241730.
(34) Bartók, A. P.; Csányi, G. Gaussian approximation potentials: A brief tutorial introduction. International Journal of Quantum Chemistry 2015, 115, 1051-1057.
(35) Efron, B. Bootstrap Methods: Another Look at the Jackknife. Ann. Stat. 1979, 7, 1-26.
(36) Breiman, L. Bagging predictors. Mach. Learn. 1996, 24, 123-140.
(37) Heskes, T. Practical confidence and prediction intervals. Adv. Neural Inf. Process. Syst. 1997, 176-182.
(38) Behler, J. Representing potential energy surfaces by high-dimensional neural network potentials. J. Phys. Condens. Matter 2014, 26.
(39) Ibragimov, I.; Rozanov, I. Gaussian random processes; Applications of mathematics; Springer-Verlag, 1978.
(40) Bishop, C. M.; Others, Pattern recognition and machine learning; Springer, 2006; p 12.
(41) Schwarz, G. Estimating the Dimension of a Model. Ann. Statist. 1978, 6, 461-464.
(42) Akaike, H. A new look at the statistical model identification. IEEE Transactions on Automatic Control 1974, 19, 716-723.
(43) Langovoy, M. Data-driven goodness-of-fit tests; University of Göttingen: Göttingen, 2007; pp ix+89, Ph.D. thesis.
(44) Cawley, G. C.; Talbot, N. L. C.; Chapelle, O. Lect. Notes Comput. Sci. (including Subser. Lect. Notes Artif. Intell. Lect. Notes Bioinformatics); 2006; Vol. 3944 LNAI; pp 56-77.
(45) Bartók, A. P.; Kondor, R.; Csányi, G. On representing chemical environments. Phys. Rev. B 2013, 87, 184115.
(46) Grisafi, A.; Wilkins, D. M.; Csányi, G.; Ceriotti, M. Symmetry-Adapted Machine Learning for Tensorial Properties of Atomistic Systems. Phys. Rev. Lett. 2018, 120, 036002.
(47) Glielmo, A.; Zeni, C.; De Vita, A. Efficient non-parametric n-body force fields from machine learning. 2018, 1-13.
(48) Varini, N.; Ceresoli, D.; Martin-Samos, L.; Girotto, I.; Cavazzoni, C. Enhancement of DFT-calculations at petascale: Nuclear Magnetic Resonance, Hybrid Density Functional Theory and Car-Parrinello calculations. Computer Physics Communications 2013, 184, 1827-1833.
(49) Giannozzi, P.; Baroni, S.; Bonini, N.; Calandra, M.; Car, R.; Cavazzoni, C.; Ceresoli, D.; Chiarotti, G. L.; Cococcioni, M.; Dabo, I.; Dal Corso, A.; De Gironcoli, S.; Fabris, S.; Fratesi, G.; Gebauer, R.; Gerstmann, U.; Gougoussis, C.; Kokalj, A.; Lazzeri, M.; Martin-Samos, L.; Marzari, N.; Mauri, F.; Mazzarello, R.; Paolini, S.; Pasquarello, A.; Paulatto, L.; Sbraccia, C.; Scandolo, S.; Sclauzero, G.; Seitsonen, A. P.; Smogunov, A.; Umari, P.; Wentzcovitch, R. M. QUANTUM ESPRESSO: A modular and open-source software project for quantum simulations of materials. Journal of Physics Condensed Matter 2009, 21, 395502.
(50) Giannozzi, P.; Andreussi, O.; Brumme, T.; Bunau, O.; Buongiorno Nardelli, M.; Calandra, M.; Car, R.; Cavazzoni, C.; Ceresoli, D.; Cococcioni, M.; Colonna, N.; Carnimeo, I.; Dal Corso, A.; De Gironcoli, S.; Delugas, P.; Distasio, R. A.; Ferretti, A.; Floris, A.; Fratesi, G.; Fugallo, G.; Gebauer, R.; Gerstmann, U.; Giustino, F.; Gorni, T.; Jia, J.; Kawamura, M.; Ko, H. Y.; Kokalj, A.; Kücükbenli, E.; Lazzeri, M.; Marsili, M.; Marzari, N.; Mauri, F.; Nguyen, N. L.; Nguyen, H. V.; Otero-De-La-Roza, A.; Paulatto, L.; Poncé, S.; Rocca, D.; Sabatini, R.; Santra, B.; Schlipf, M.; Seitsonen, A. P.; Smogunov, A.; Timrov, I.; Thonhauser, T.; Umari, P.; Vast, N.; Wu, X.; Baroni, S. Advanced capabilities for materials modelling with Quantum ESPRESSO. Journal of Physics Condensed Matter 2017, 29, 465901.
(51) Perdew, J. P.; Burke, K.; Ernzerhof, M. Generalized gradient approximation made simple. Physical Review Letters 1996, 77, 3865-3868.
(52) Pickard, C. J.; Mauri, F. All-electron magnetic response with pseudopotentials: NMR chemical shifts. Physical Review B 2001, 63, 245101.
(53) Yates, J. R.; Pickard, C. J.; Mauri, F. Calculation of NMR chemical shifts for extended systems using ultrasoft pseudopotentials. Physical Review B - Condensed Matter and Materials Physics 2007, 76, 024401.
(54) Kucukbenli, E.; Monni, M.; Adetunji, B. I.; Ge, X.; Adebayo, G. A.; Marzari, N.; de Gironcoli, S.; Corso, A. D. Projector augmented-wave and all-electron calculations across the periodic table: a comparison of structural and energetic properties. 2014,
(55) Monkhorst, H.; Pack, J. Special points for Brillouin zone integrations. Physical Review B 1976, 13, 5188-5192.
(56) Stephens, P. J.; Devlin, F. J.; Chabalowski, C. F.; Frisch, M. J. Ab Initio calculation of vibrational absorption and circular dichroism spectra using density functional force fields. Journal of Physical Chemistry® 1994, 98, 11623-11627.
(57) Birgé, L.; Massart, P. Gaussian model selection. J. Eur. Math. Soc. (JEMS) 2001, 3, 203-268.
(58) Gnedenko, B.; Kolmogorov, A. Limit distributions for sums of independent random variables; Addison-Wesley series in statistics; Addison-Wesley, 1968.
(59) Li, Z.; Kermode, J. R.; De Vita, A. Molecular Dynamics with On-the-Fly Machine Learning of Quantum-Mechanical Forces. Phys. Rev. Lett. 2015, 114, 096405.
(60) Tresp, V. A Bayesian Committee Machine. Neural Comput. 2000, 12, 2719-2741.


[^0]:    *These authors contributed equally to this manuscript

