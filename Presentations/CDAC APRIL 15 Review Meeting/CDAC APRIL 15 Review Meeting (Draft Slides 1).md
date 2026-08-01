


# Classical MD Results

- Tried SHI track simulations in LAMMPS with a classical rigid-ion Buckingham + Coulomb potential
- Simulations captured thermal disorder, point defects, and local rearrangements
- But they did not reproduce the chemically realistic track response suggested by experiment
- Core limitation: fixed-charge classical ceria cannot represent $\mathrm{Ce}^{4+}\rightarrow\mathrm{Ce}^{3+}$ reduction
- Oxygen vacancy formation in real ceria leaves two electrons that localize on nearby Ce sites as $\mathrm{Ce}^{3+}$-like centers
- That redox step changes local bonding, defect energetics, migration barriers, strain, and recovery behavior
- Classical force field keeps every Ce on the same effective charge state, so reduced environments are described on the wrong energy surface
- Conclusion: the model misses the redox-coupled chemistry likely controlling early SHI track formation and recovery in ceria
- This motivated the shift to a DFT+U-informed, redox-capable MLIP workflow


![[Pasted image 20260407114451.png|500]]



![[Pasted image 20260407114507.png|500]]



# MLIP Generation

- MLIP = machine-learning interatomic potential trained on first-principles energies and forces
- Goal: retain near-DFT fidelity for bonding and defect energetics at MD-accessible length and time scales
- Needed here because DFT+U captures ceria redox physics but is too expensive for full SHI track simulations
- Allegro is an equivariant neural interatomic potential
- It learns not just distances, but the geometry of the local coordination environment
- Important for ceria because oxidized and reduced environments differ through subtle changes in coordination, distortion, and vacancy-centered bonding
- Allegro is also strictly local and computationally efficient
- That makes it practical for large-scale TTM-MD in LAMMPS, where we need long trajectories and many atoms
- Training strategy: calibrate a consistent DFT+U reference, then generate labeled structures across the ceria reduction series
- Include $\mathrm{CeO}_{2}$, $\mathrm{Ce}_{11}\mathrm{O}_{20}$, $\mathrm{Ce}_{7}\mathrm{O}_{12}$, and $\mathrm{Ce}_{2}\mathrm{O}_{3}$ to expose the model to both $\mathrm{Ce}^{4+}$-rich and $\mathrm{Ce}^{3+}$-rich environments
- Train on DFT+U energies, forces, and stresses; validate on held-out structures and physically meaningful targets before deployment in TTM-MD


![[Pasted image 20260407114652.png|500]]



# Data Generation

- Main challenge: in ceria, oxygen vacancies are coupled to $\mathrm{Ce}^{4+}/\mathrm{Ce}^{3+}$ redox changes
- Training data must therefore capture both atomic distortions and the correct localized $4f$ electronic state
- DFT+U can describe this physics, but reduced ceria often has multiple metastable $4f$ occupation patterns
- If spin initialization and convergence are not controlled, similar structures can receive inconsistent labels
- We therefore generate data across the ceria reduction series, not just near stoichiometric $\mathrm{CeO}_{2}$
- $\mathrm{CeO}_{2}$ = oxidized fluorite reference
- $\mathrm{Ce}_{11}\mathrm{O}_{20}$ and $\mathrm{Ce}_{7}\mathrm{O}_{12}$ = intermediate oxygen-deficient, mixed-valence phases
- $\mathrm{Ce}_{2}\mathrm{O}_{3}$ = strongly reduced, $\mathrm{Ce}^{3+}$-rich endpoint
- Together these phases span the oxidized, mixed-valence, vacancy-rich, and reduced environments relevant to SHI tracks
- Data generation workflow: relax each phase with one consistent DFT+U setup, then generate strained, vacancy-containing, and thermally distorted structures
- Use ab initio molecular dynamics at multiple temperatures to sample anharmonic, non-equilibrium local environments
- Label each configuration with total energies, atomic forces, and when useful virial stresses
- Curate the raw data by removing near-duplicates and balancing across phases, temperatures, and defect motifs
- Split by trajectory/structural family so validation tests transfer to unseen local environments


![[Pasted image 20260407115053.png]]
