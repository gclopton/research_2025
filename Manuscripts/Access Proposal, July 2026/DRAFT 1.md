# Section 2.10 


### 2.10 Does redox chemistry govern swift-heavy-ion track formation in ceria?

Swift heavy ions — fission fragments and their accelerator surrogates — deposit tens of keV per nanometer into the electronic system of a ceramic, and within picoseconds that energy thermalizes into a nanometer-wide cylindrical melt that quenches into a permanent ion track. In cerium dioxide, irradiation drives redox chemistry alongside the structural damage: X-ray absorption spectroscopy shows $\mathrm{Ce}^{4+} \rightarrow \mathrm{Ce}^{3+}$ reduction in swift-heavy-ion-irradiated $\mathrm{CeO_2}$ [1], electron microscopy of track cores reveals a disordered oxygen sublattice inside a largely intact cation lattice [2], and comparative irradiation experiments show that damage accumulation couples to cation valence flexibility — fixed-valence $\mathrm{ThO_2}$ accumulates damage differently than redox-active $\mathrm{CeO_2}$, with radiation tolerance tracking the efficiency of the redox response [3]. These observations establish a correlation between redox chemistry and radiation response in the material that serves as the standard surrogate for $\mathrm{PuO_2}$ in mixed-oxide fuel development [4]. However, they do not establish the mechanism. Whether $\mathrm{Ce}^{4+}/\mathrm{Ce}^{3+}$ interconversion actively shapes how tracks form and anneal — and by what pathway — is an open question that only atomistic simulation can reach, because the deciding events span nanometers and picoseconds inside bulk material. No interatomic potential for ceria currently represents the redox degree of freedom on equal footing with the lattice; we propose to build one and use it to answer this question (Figure N).

Track-scale dynamics — $10^5$–$10^6$ atoms over picoseconds to nanoseconds [5] — are far beyond any first-principles method, so the simulations must run on a machine-learned interatomic potential (MLIP) trained on density-functional reference data [6]. For ceria, generating that reference data is the central technical obstacle. The redox chemistry is carried by $\mathrm{Ce}^{3+}$ small polarons — localized $4f$ electrons that exist only at the DFT+U or hybrid level — and DFT+U admits multiple self-consistent electronic solutions at fixed geometry, so a calculation can converge cleanly to the wrong electronic state. Our work under previous allocations demonstrated this directly: even with staged electronic-state preparation, finite-temperature AIMD of reduced ceria proved unstable to uncontrolled switching between these solutions, and occupation-constrained control, which we have explored directly, does impose the desired state but is too cumbersome for data generation at the scale an MLIP requires. We have since adopted the systematic bond-distortion structure search of Mosquera-Lois et al. to locate ground-state defect configurations with standard VASP machinery [7], [8], following the demonstration by Das et al. that geometry- and spin-biased GGA+U converges correctly localized oxygen-vacancy states in ceria without electronic constraints [9].

We propose a four-stage method (Figure N). First, complete the intrinsic-defect dataset for fluorite $\mathrm{CeO_2}$: bond-distortion searches for $V_{\mathrm{O}}$, $V_{\mathrm{Ce}}$, $\mathrm{O_i}$, and $\mathrm{Ce_i}$ across their physical charge states in 96-atom supercells — ~400 $\Gamma$-point screening relaxations, with production re-relaxation of every distinct low-energy minimum — yielding ground-state defect structures, formation energies, and the local geometric signatures of $\mathrm{Ce}^{3+}$ that serve later as structural fingerprints. Second, generate an AIMD training corpus spanning the composition and damage states a track visits: stoichiometric $\mathrm{CeO_2}$, three vacancy-reduced $\mathrm{CeO_{2-x}}$ cells built from the relaxed vacancy structures, $\mathrm{Ce_2O_3}$, and three pre-damaged/vacancy-clustered cells drawn from the lowest-energy defect motifs. These eight state points will be sampled from 300 K through melt-relevant temperatures, including rapid-quench trajectories; each configuration is screened for the intended electronic state (site moments, $f$-occupations) before entering the corpus. Third, train an Allegro potential on this corpus through 2–3 active-learning cycles. Fourth, simulate track formation: two-temperature-model energy deposition [10] into MLIP molecular dynamics at the $10^6$-atom scale, across stopping powers spanning the experimental track-formation threshold and across an oxygen-stoichiometry and pre-damage series, followed by annealing simulations [11]. Comparing tracks across this stoichiometry series tests whether track threshold, morphology, and recovery depend on the redox channel, and the trajectories show where and when $\mathrm{Ce}^{3+}$-like environments form, how disorder partitions between the oxygen and cation sublattices [2], and whether reduction reverses during annealing. We will validate against measurements the potential is not fit to: track sizes and the formation threshold versus stopping power [12] and the $\mathrm{Ce}^{3+}$ spectroscopic signatures of irradiated ceria [1]. Existing simulations of swift-heavy-ion tracks in ceria use fixed-charge potentials [5]; ours will be the first to include the redox degree of freedom. The result will be a redox-aware potential for ceria, reusable across fluorite-oxide radiation problems.

**Resource Request:**

**Bridges-2 — Regular Memory**

| Item | Count | SUs each | Sub-total (SUs) |
|---|---:|---:|---:|
| Defect screening relaxations ($\Gamma$-point, 96-atom cells) | 400 | 256 | 102,400 |
| Production re-relaxations (2×2×2 k-mesh) | 60 | 1,024 | 61,440 |
| AIMD trajectories (8 composition/damage states × 5 temperatures × 5 seeds, 10 ps each) | 200 | 6,144 | 1,228,800 |
| Active-learning relabeling (single points) | 2,000 | 32 | 64,000 |
| **Total, Bridges-2 RM** | | | **1,456,640** |

Screening and production costs scale from our Bridges-2 timing history to the 96-atom defect cells: 64 cores × 4 hours per $\Gamma$-point relaxation (256 SUs) and 64 cores × 16 hours per 2×2×2 re-relaxation (1,024 SUs). AIMD is budgeted at 6,144 SUs (64 cores × 96 hours) per 10 ps trajectory, consistent with our completed $\mathrm{CeO_2}$ AIMD segments on Bridges-2; 200 trajectories give 200 × 6,144 = 1,228,800 SUs. The total request is 1,456,640 Bridges-2 RM SUs.





## References

Section-local numbering in order of first citation; renumber against the main document's global list at Overleaf merge (Allegro is already ref [18] there). Entries marked (v) need volume/page verification against the PDFs before submission.

[1] H. Ohno, A. Iwase, D. Matsumura, Y. Nishihata, J. Mizuki, N. Ishikawa, Y. Baba, N. Hirao, T. Sonoda, and M. Kinoshita, "Study on effects of swift heavy ion irradiation in cerium dioxide using synchrotron radiation X-ray absorption spectroscopy," *Nuclear Instruments and Methods in Physics Research Section B*, vol. 266, pp. 3013–3017, 2008. (v)

[2] S. Takaki, K. Yasuda, T. Yamamoto, S. Matsumura, and N. Ishikawa, "Atomic structure of ion tracks in ceria," *Nuclear Instruments and Methods in Physics Research Section B*, vol. 326, pp. 140–144, 2014. (v)

[3] C. L. Tracy, M. Lang, J. M. Pray, F. Zhang, D. Popov, C. Park, C. Trautmann, M. Bender, D. Severin, V. A. Skuratov, et al., "Redox response of actinide materials to highly ionizing radiation," *Nature Communications*, vol. 6, p. 6133, 2015.

[4] H. S. Kim, C. Y. Joung, B. H. Lee, J. Y. Oh, Y. H. Koo, and P. Heimgartner, "Applicability of CeO2 as a surrogate for PuO2 in a MOX fuel development," *Journal of Nuclear Materials*, vol. 378, pp. 98–104, 2008. (v)

[5] R. A. Rymzhanov, A. E. Volkov, and V. A. Skuratov, "Bulk, overlap and surface effects of swift heavy ions in CeO2," *Nuclear Instruments and Methods in Physics Research Section B*, 2025. (v — volume/pages)

[6] A. Musaelian, S. Batzner, A. Johansson, L. Sun, C. J. Owen, M. Kornbluth, and B. Kozinsky, "Learning local equivariant representations for large-scale atomistic dynamics," *Nature Communications*, vol. 14, p. 579, 2023. *(Allegro — collapses into global ref [18] at merge.)*

[7] I. Mosquera-Lois, S. R. Kavanagh, A. Walsh, and D. O. Scanlon, "Identifying the ground state structures of point defects in solids," *npj Computational Materials*, vol. 9, p. 25, 2023.

[8] I. Mosquera-Lois, S. R. Kavanagh, A. Walsh, and D. O. Scanlon, "ShakeNBreak: Navigating the defect configurational landscape," *Journal of Open Source Software*, vol. 7, no. 80, p. 4817, 2022.

[9] T. Das, J. D. Nicholas, B. W. Sheldon, and Y. Qi, "Anisotropic chemical strain in cubic ceria due to oxygen-vacancy-induced elastic dipoles," *Physical Chemistry Chemical Physics*, vol. 20, p. 15293, 2018. (v — end page)

[10] R. Darkins and D. M. Duffy, "Modelling radiation effects in solids with two-temperature molecular dynamics," *Computational Materials Science*, vol. 147, pp. 145–153, 2018.

[11] R. I. Palomares, C. L. Tracy, F. Zhang, C. Park, D. Popov, C. Trautmann, R. C. Ewing, and M. Lang, "In situ defect annealing of swift heavy ion irradiated CeO2 and ThO2 using synchrotron X-ray diffraction and a hydrothermal diamond anvil cell," *Journal of Applied Crystallography*, vol. 48, pp. 711–717, 2015. (v)

[12] T. Sonoda, M. Kinoshita, N. Ishikawa, M. Sataka, Y. Chimi, N. Okubo, A. Iwase, and K. Yasunaga, "Clarification of the properties and accumulation effects of ion tracks in CeO2," *Nuclear Instruments and Methods in Physics Research Section B*, vol. 266, pp. 2882–2886, 2008. (v)
