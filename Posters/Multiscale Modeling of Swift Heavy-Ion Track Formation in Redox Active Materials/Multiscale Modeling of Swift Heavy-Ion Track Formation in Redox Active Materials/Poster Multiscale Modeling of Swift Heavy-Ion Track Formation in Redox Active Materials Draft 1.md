
# Introduction

Swift heavy ions (SHIs) deposit energy in ceramics mainly through electronic stopping, creating transient thermal spikes that can form nanometer-scale latent tracks and defects that influence swelling, stress evolution, thermal transport, and microstructural stability in fluorite oxides. Cerium oxide is widely used as a surrogate for actinide oxides because it shares the fluorite structure and similar thermomechanical behavior, while also retaining a chemically active oxygen sublattice and a multivalent cerium sublattice capable of $\mathrm{Ce} 4^{+} \rightarrow \mathrm{Ce} 3+$ reduction/reoxidation. Experimentally, SHI tracks in ceria are often clearly resolved yet remain largely crystalline and only modestly underdense, with reported oxygen disorder/redistribution and partial $\mathrm{Ce}^{4+} \rightarrow \mathrm{Ce}^{3+}$ reduction inside the track region. This raises a mechanism-level question that fixed-charge atomistic models cannot answer cleanly: are redox flexibility and oxygen nonstoichiometry merely passive byproducts of the spike, or do they feed back on oxygen vacancy/polaron energetics and early recovery strongly enough to change emergent track morphology? To enable a controlled comparison, we first calibrate a DFT+U reference using DOS/band-alignment targets (relative placement of $\mathrm{O}(2 \mathrm{p}), \mathrm{Ce}(4 \mathrm{f})$, and $\mathrm{Ce}(5 \mathrm{~d})$ states and defect-formation energetics), then use that reference to build a training set that explicitly spans the oxidized and reduced end members and representative intermediate oxygen-deficient phases $\left(\mathrm{CeO}_2, \mathrm{Ce}_{11} \mathrm{O}_{20}, \mathrm{Ce}_7 \mathrm{O}_{12}, \mathrm{Ce}_2 \mathrm{O}_3\right.$; Fig. 1), ensuring the resulting redox-capable ML interatomic potential can represent the distinct local coordination and charge states that may be accessed during spike-driven disordering and subsequent recovery.



![[Pasted image 20260223092610.png|500]]



# AlM

This work establishes the electronic-structure and dataset foundations needed for redox-capable ML interatomic potentials in ceria. We calibrate and validate a DFT+U description against key spectral/energetic signatures (e.g., $\mathrm{O}(2 \mathrm{p})-\mathrm{Ce}(4 \mathrm{f}) / \mathrm{Ce}(5 \mathrm{~d})$ separations and the placement of $\mathrm{Ce}(4 \mathrm{f})$ states) and use it to generate a training set spanning relevant stoichiometries and local redox environments. The resulting dataset and validation plots define the parameter space and reference fidelity required for subsequent two-temperature-driven SHI simulations of track formation and early recovery.



# Redox-Capable Ce-O MLIP Training with DFT+U and Allegro


![[Pasted image 20260223092733.png|500]]


- Compute DFT+U reference states for CeO2, Ce11O20, Ce7O12, and Ce2O3, then run AIMD using DFT+U forces to sample finite-T snapshots; export labels $\left\{E_i, \mathrm{~F}_i\right\}$.
- Deduplicate near-identical structures, balance phase coverage across ceria reduction series, and split into train/validation/test.
- Allegro learns local equivariant features from neighbor graphs to predict $E=\sum_i E_i$ and $\mathrm{F}_i=-\nabla_i E$; fit with $\mathcal{L}=w_E\|\Delta E\|^2+w_F\|\Delta \mathrm{~F}\|^2$


# Swift Heavy Ion Track Simulations with TwoTemperature Molecular Dynamics



![[Screenshot 2026-02-23 at 9.28.21 AM.png|500]]


- SHI electronic stopping is represented as a spatiotemporal source term Se(r, t) applied on a coarse electronic mesh surrounding the ion path.
- Model evolves an electronic temperature $\operatorname{Te}(r, t)$ and a lattice temperature $\mathrm{Tl}(\mathrm{r}, \mathrm{t})$ with electron heat diffusion and elec-tron-phonon energy exchange.
- Lattice temperature field TI(r, t) is mapped onto the MD region to impose a time- and radius-dependent thermal spike that generates defects and structural disorder.
- Langevin rim at To with damping $\gamma_L$ absorbs outgoing energy/pressure waves and limits finite-size and reflection artifacts.
- Track descriptors are extracted from the MD cell.



# RESULTS


![[Pasted image 20260223092942.png|500]]


![[Pasted image 20260223093005.png|500]]

- $\mathrm{CeO}_2$ is relatively insensitive to $U_{\text {eff. }}$ The calculations remain non-magnetic (reported magnetization $=0$ ) and preserve a clear insulating DOS with the $\mathrm{O}(2 \mathrm{p})$ valence manifold separated from Ce-derived unoccupied states.
- Reduced compositions are strongly spin-polarized, consistent with localized 4 f physics. $\mathrm{Ce}_2 \mathrm{O}_3$ and $\mathrm{Ce}_7 \mathrm{O}_{12}$ exhibit large moments (see table) and prominent $\mathrm{Ce}(4 \mathrm{f})$ features near the gap region, indicating substantially stronger correlation sensitivity than $\mathrm{CeO}_2$.



![[Pasted image 20260223093042.png|700]]


- Literature benchmarks mirror this hierarchy of sensitivity. $\mathrm{CeO}_2$ trends weakly with U , whereas reduced $\mathrm{Ce}_2 \mathrm{O}_3$ exhibits stronger $\mathrm{U}_{\text {eff }}$ dependence, reinforcing that U-choice is highly important in $\mathrm{Ce}^{3+}$-rich / oxygen-deficient environments (Löschen et al., 2007).
- Implication for MLIP reference generation: training data must span $\mathrm{CeO}_2$ reduced phases and include configurations that probe 4f localization (magnetization + near-gap features), because the largest U-driven variations occur precisely where redox chemistry changes the bonding/electronic structure.


# Oxygen Vacancies and Reduction in CeO2-x
- Oxygen-deficiency sweep: model CeO2-x from CeO2( $\mathrm{x}=0$ ) toward reduced compositions.
- Charge neutrality: $\overline{\mathrm{v}}_{\mathrm{Ce}}=4-2 \mathrm{x}$ (so the averageCe3+ fraction $\sim 2 \mathrm{x}$
- These stoichiometries define the reduced chemistries that must be included in the DFT + U reference set and the MLIP training data set.




![[Pasted image 20260223093141.png|700]]



# CONCLUSION
- Establishes a DFT+U reference level for ceria MLIP training by scanning $\mathrm{U}_{\text {eff }}=4-6 \mathrm{eV}$ across $\mathrm{CeO}_2, \mathrm{Ce}_7 \mathrm{O}_{12}$, and $\mathrm{Ce}_2 \mathrm{O}_3$ and comparing trends to literature benchmarks (Löschen et al.).
- Shows that $U_{\text {eff }}$ choice matters most in reduced/vacan-cy-rich chemistry, where Ce 4 f localization and near-gap features change substantially, while $\mathrm{CeO}_2$ remains comparatively stable (non-magnetic and insulating) across the same range.
- Converts the Ueff calibration into concrete training-set requirements. The MLIP corpus must span oxidized and reduced stoichiometries and include oxygen-vacancy/ $\mathrm{Ce}^{3+}$ -rich local environments, plus strained and high-T disordered snapshots that stress the same 4 f -driven physics seen in the DOS.



