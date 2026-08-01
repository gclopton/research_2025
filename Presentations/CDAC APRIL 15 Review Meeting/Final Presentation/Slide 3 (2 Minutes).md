

![[Pasted image 20260415044727.png]]



Once trained, the MLIP enables irradiation simulations at essentially classical TTM-MD cost while remaining applicable across the local compositional changes that arise during quenching. This makes it possible to sweep the irradiation parameter space systematically. The resulting simulations define a response surface over these variables, with predicted observables including track radius, density deficit, core-shell morphology, spatial distribution of $\mathrm{Ce}^{3+}$, and defect-species populations.

A central advantage of this framework is that those observables emerge across multiple length scales from the same trajectory. At the atomic scale, the simulation resolves the formation of specific defect species, including Frenkel pairs, Schottky pairs, point-defect clusters, dislocation cores, stacking faults, and twin boundaries. At the nanoscale, these defects organize into a track morphology inherited from the radial energy profile of the spike, typically consisting of a highly disordered, oxygen-deficient core surrounded by a partially crystalline shell. At the mesoscale, the relevant question becomes the transport and eventual trapping of displaced oxygen, with grain boundaries setting the characteristic diffusion length. These scales are therefore not assembled by coupling separate models; they are different resolutions of a single dynamical event, and that internal consistency is what gives the framework predictive power across scales.

An individual track, however, is only a single non-equilibrium outcome: a metastable configuration selected by a particular dynamical pathway and frozen by quenching. To interpret such outcomes thermodynamically, they must be placed within a common coordinate system in which equilibrium and metastable states can be compared directly. Here that coordinate system is $P-T-\mu$, anchored by the $\mathrm{Ce}-\mathrm{O}$ phase diagram spanned by the reduction series in the MLIP training set: $\mathrm{CeO}_2, \mathrm{Ce}_{11} \mathrm{O}_{20}, \mathrm{Ce}_7 \mathrm{O}_{12}$, and $\mathrm{Ce}_2 \mathrm{O}_3$. Extending that equilibrium description into a defect phase diagram, in which configuration free energies are expressed as functions of pressure, temperature, and oxygen chemical potential, partitions the space into equilibrium regions together with their neighboring metastable states. Each simulated track can then be located within that space, typically as a metastable state selected by the quench. Repeated across irradiation conditions, those locations become a map of the defect phases that SHI events actually access, superimposed on the underlying equilibrium landscape.





