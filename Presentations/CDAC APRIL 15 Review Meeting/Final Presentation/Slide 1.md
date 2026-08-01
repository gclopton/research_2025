

![[Pasted image 20260415042001.png]]

## Transcript



# 1. What kind of problem is SHI damage in an insulating oxide, computationally speaking — a defect-production problem, a thermal-response problem, or something else?



![[Pasted image 20260415042001.png]]



When a fast ion traverses a crystal and leaves behind a nanometer-wide track, we can reach for the familiar language of radiation damage and start counting: Frenkel pairs, vacancies, interstitials. For a neutron or a heavy recoil, that language suffices. Energy is transferred directly from projectile to lattice through nuclear stopping, and the cascade that follows can be described by displacement statistics. The atoms that were kicked out are what one needs to characterize the damage.

A swift heavy ion operates under different physics. Moving fast enough that electronic stopping dominates, it deposits its energy first into the electrons along its path, in a cylinder no wider than a nanometer and in less than a femtosecond. The lattice does not yet register the impact. Any displacement cascade that eventually develops arises only later and only indirectly, as the excited electronic subsystem transfers energy to the phonons through electron-phonon coupling. Treating the problem as defect production in the classical sense skips past the mechanism that distributes the energy in the first place and determines where the damage will ultimately concentrate.

The second temptation is more sophisticated: treat the problem as heat flow. A localized source deposits energy, a temperature field develops, the lattice heats and melts and resolidifies. Two-temperature and thermal-spike models are built on precisely this intuition, and they are not wrong - only incomplete. The thermal-response picture is what remains after one has already averaged over the nonequilibrium electronic kinetics at the beginning of the sequence and coarse-grained past the chemistry that becomes active at the end of it. In a redox-active oxide like ceria, that terminal stage is where oxygen disorder, vacancy formation, and the reduction of $\mathrm{Ce}^{4+}$ to $\mathrm{Ce}^{3+}$ can reshape what freezes into the final track. These processes are not secondary corrections to a thermomechanical picture; they can determine the observed track morphology as strongly as the thermal spike itself does.

What the problem actually is, seen whole, is a hidden pathway. A swift heavy ion initiates a sequence of coupled electronic and atomic processes that unfolds across roughly fifteen orders of magnitude in time, each stage handing energy to the next, and what one eventually observes under the microscope — an underdense, mostly crystalline track — is the collapsed endpoint of that sequence. The pathway itself, not the endpoint, is what has to be reconstructed if one wants to know which physics produced the track.


# 2. Why does this have to be treated as a pathway problem rather than an endpoint problem — i.e., why isn't what we see in the microscopy image enough on its own?


The difficulty of the problem is not only that a swift heavy ion leaves a trail spanning fifteen orders of magnitude in time, but that the only trail one can ever actually see is the one left on the crystal after everything has cooled. Every experimental observation of a swift-heavy-ion track is a post-mortem. Electron microscopy, small-angle scattering, and electron-energy-loss spectroscopy all resolve the track only long after the ion has passed, the thermal spike has quenched, and the lattice has settled into whatever crystalline or amorphous state it will hold indefinitely. The observations are precise, but they are precise about a state that has already integrated over every dynamical process that produced it.

This is not a limitation of any particular technique. It is a limitation of what a single time slice can say about a multistage sequence. Two very different histories can land on the same final state. A track that appears modestly underdense and mostly crystalline in a TEM image could have arisen from a purely thermomechanical melt-and-quench, in which a transient molten cylinder resolidified epitaxially with only mild disorder; or from a redox-driven recovery, in which the quench stage actively restored fluorite order through oxygen redistribution and partial $\mathrm{Ce}^{3+}$ reoxidation; or from some weighted combination of the two. The structural signatures one can measure — density deficit, disorder profile, strain — are diagnostic of the outcome, not of the mechanism. Even the spectroscopic channels that read out Ce oxidation state report only the quenched-in $\mathrm{Ce}^{3+}$ fraction; they cannot distinguish a track in which $\mathrm{Ce}^{3+}$ was transiently abundant and then largely reoxidized during cooling from one in which $\mathrm{Ce}^{3+}$ was only ever present at a modest level.

Nor is there any prospect, at present, of watching the pathway directly. The earliest stages of the event occur on attosecond-to-femtosecond timescales in a cylindrical region only a nanometer wide; the thermal spike forms and collapses on a picosecond clock; and the chemical rearrangements of the quench extend into the nanosecond regime. No existing in-situ probe combines the spatial resolution required to follow a single track with the temporal resolution required to resolve its formation, and none is on a foreseeable horizon. The pathway is inaccessible to measurement.

The consequence is that the static image one recovers from experiment, however carefully characterized, cannot determine which mechanism produced the track it displays. The image records the outcome. The physics that produced it has to be reconstructed from somewhere else, and only computation — applied stagewise across the full pathway rather than to the final state alone — is in a position to do so.


# 3. What makes the pathway itself uniquely hard to reconstruct, such that no existing tool handles it alone?


The difficulty is not concentrated in any single stage of the event. It is distributed across stages whose governing physics differs qualitatively from one to the next and whose length and time scales differ by many orders of magnitude. Nonadiabatic electronic dynamics, coupled electron-lattice energy transfer, and the diffusive chemistry of the quench are three different physical problems, each with its own natural method of description, and no single description is simultaneously appropriate to all of them.

Each of the established computational tools fails when asked to carry the full pathway. First-principles electronic-structure methods, whether ground-state DFT or its real-time extensions, are accurate where the electronic excitations live, but even the most aggressive calculations are confined to systems of a few hundred atoms and trajectories of a few picoseconds. They cannot reach the length or time scales on which the thermal spike develops, let alone the nanosecond regime over which the quench resolves. Classical molecular dynamics can reach those scales readily, and two-temperature molecular dynamics schemes handle the electronic-to-lattice energy transfer at the level required. But classical potentials for oxides are built on fixed atomic charges and fixed bonding topologies. They cannot represent the migration of an oxygen atom that leaves behind a vacancy and a reduced cerium neighbor, because the act of leaving changes the charges and the bonding environment itself. Continuum-level thermal-spike treatments, for their part, coarse-grain past the atomic structure entirely and cannot produce a track morphology, let alone a chemical one.

This last failure is the decisive one for redox-active oxides. What shapes the final track is not only the thermal quench but the redistribution of charge and stoichiometry that accompanies it — the very chemistry that fixed-charge classical potentials are constitutionally unable to represent. A potential that cannot track variable oxidation state across a reduction series cannot describe the process that shapes the track, and a method that can describe it cannot reach the scales at which the track actually forms. The gap between where quantum accuracy is affordable and where the chemistry becomes decisive is exactly the gap that has prevented the pathway from being reconstructed.


# 4. Why is that hidden pathway the right place to look if we specifically care about redox-active oxides, as opposed to any insulating ceramic?

In most insulating ceramics, the chemistry available during the quench is narrow. The cations carry fixed oxidation states, the anion sublattice is stoichiometrically rigid, and the lattice response to a thermal spike reduces largely to thermomechanical bookkeeping: atoms displace, bonds stretch and break, the melt resolidifies with some frozen-in disorder. The configuration space the quench can explore is circumscribed in advance, and the track that emerges is essentially a mechanical artifact of the spike — a record of how much energy was deposited, how widely it spread, and how quickly it left.

Redox-active oxides are different in kind. Their cations have readily accessible oxidation states that are electrostatically coupled to the anion sublattice: in ceria, every oxygen vacancy can be compensated by the reduction of two $\mathrm{Ce}^{4+}$ to $\mathrm{Ce}^{3+}$, and every such reduction event opens further capacity for vacancy formation. The same thermal spike that in a non-redox ceramic drives only atomic displacement can here drive coupled chemistry, proceeding on the same picosecond clock as the lattice relaxation. The configuration space is larger, and its terminal choices involve not only where the atoms sit but what oxidation state they carry and what stoichiometry the oxygen sublattice holds.

This is why the pathway is the right place to look. The final track in a redox-active oxide is a chemical structure, inscribed by whatever sequence of reduction, migration, and reoxidation played out during the quench. And that chemistry is precisely the chemistry that makes these oxides technologically interesting in the first place: the $\mathrm{Ce}^{4+}/\mathrm{Ce}^{3+}$ couple that underwrites ceria's catalytic activity, the oxygen-vacancy population that controls ionic conductivity, the same redox flexibility that makes $\mathrm{UO}_2$ a viable nuclear fuel. To understand what an ion track does to such a material is therefore to understand what chemistry the quench selected, and that chemistry is written along the pathway.



