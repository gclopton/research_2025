
- Introduces a general occupation-matrix control (OMC) method for plane-wave DFT+U in VASP, extending Dorado et al.'s $UO_{2}$ approach
- Goal: Steer which orbital and which site an excess electron localizes on, so that you can find the true ground states rather than getting trapped in metastable minima caused by SIE-corrected DFT+U.


# How OMC Works

- **OMC involves a three-phase relaxation:**
	1. Relax with the constraint applied every electronic step (energy from this phase is unusable – artificially manipulated).
	2. Lift the constraint, restart from that structure + wavefunction, relax to a real minimum
	3. (optional) restart from the distorted structure alone (wavefunction discarded) to give the orbital freedom to rotate/distort – this is what reveals polaronic distortions


The method used here goes beyond Dorado (who constrained only the first ~10 SCF steps and only f orbitals) buy allowing full geometry relaxation under constraint and covering d (and in principle s/p).


# Material Families

The whole study is organized as a $2 \times 3$ matrix: two material families - Ti (a $d^1$ system) and Ce (an $f^1$ system) - each tested in three settings of increasing complexity: isolated high-symmetry clusters, a single excess electron in the bulk crystal, and a neutral oxygen vacancy in the bulk crystal. That gives six groups. The two axes are deliberate: the cluster → single-electron → vacancy progression ramps up complexity (high symmetry → periodic ⇒ multi-electron defect), and the Ti-vs-Ce pairing is the $d$-vs- $f$ contrast that delivers the paper's main conclusion.





|                        | Isolated-high symmetry clusters                                                                                             | single excess electron in the  bulk crystal | neutral oxygen vacancy in the bulk crystal |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| Ti (a $d^{1}$ system)  | Octahedral $\left[\mathrm{Ti}(\mathrm{CO})_6\right]^{3+}$ and tetrahedral $\left[\operatorname{Ti}(\mathrm{CO})_4\right]^3$ |                                             |                                            |
| Ce (an $f^{1}$ system) |                                                                                                                             |                                             |                                            |

## Group 1 Ti Compounds (§3.1.1)

**Goal:**
- show that OMC can force occupation of a chosen $d$ orbital and that the resulting energies reproduce textbook crystal-field splitting, in a clean high symmetry environment with no structural complications



**Systems:** Octahedral $\left[\mathrm{Ti}(\mathrm{CO})_6\right]^{3+}$ and Tetrahedral $\left[\operatorname{Ti}(\mathrm{CO})_4\right]^3$
- both $d^{1}$
- 25 $Å$ boxes
- single $\Gamma$ k-point
- geometry held fixed (so degeneracies aren't perturbed by relaxation)


**Calculations:** for each cluster, one OMC run targeting each of the five d orbitals $\left(\mathrm{d}_{-2}, \mathrm{~d}_{-1}, \mathrm{~d}_0, \mathrm{~d}_1, \mathrm{~d}_2\right)$, plus one no-control run $\rightarrow 6$ per cluster, ==12 total==.


## Group 2 Anatase-$TiO_{2}$ + Once Excess Electron (§ 3.1.2)

**Purpose:** 
- move OMC from a cluster into a periodic crystal; test whether high-energy d orbitals can be held as metastable states in a real solid. (Anatase chosen over rutile because its Ti-O bonds already lie in the principal-axis planes, so no cell/matrix rotation is needed.)


**System:** $3 \times 3 \times 1$, 108-atom anatase supercell, $2 \times 2 \times 2$ k-mesh, add one electron → a single Ti(III), now with structural relaxation.


**Calculations:** one OMC run per $d$ orbital (5) + one no-control run = ==6 total==.



## Group 3 - Anatase- $\mathrm{TiO}_2+$ oxygen vacancy (§3.1.3).

**Purpose:** test control of site of localization (and orbital) with two electrons, and demonstrate OMC as a screening tool over site combinations. 


**System:** Same 108-atom cell, neutral O vacancy → two excess electrons → two Ti(III); ferromagnetic only (FM $\approx \mathrm{AFM}$ ).


**Calculations, in two parts:**
- _Site scan:_ SOD enumerated 202 symmetry-inequivalent ways to place the two Ti(III) in the cell. Each config went through the multi-stage workflow - OMC-constrained relax (all electrons seeded $\mathrm{d}_{-2}$ ) → release keeping structure+wavefunction (the 202 closed black squares) → then restart from the distorted structure alone, wavefunction removed (the 202 open circles).
- _Orbital-combination scan:_ for the three notable configs (166, 154, 156), trial all d-orbital combinations on the two sites.
- Plus a single no-control run (only total spin fixed to +2 ), which let one electron delocalize.



# Site Occupancy Disorder Code (Grau-Crespo et al., 2007)

SOD is a program used to do symmetry reduction.

- **How it works:**
	- hand it a parent crystal structure and tell it which sites get substituted (here, "place 2 Ti (III) among the 36 Ti sites of the oxygen-deficient supercell"). 
	- It generates the full combinatorial set of arrangements, then uses the symmetry operations of the parent cell to sort them into equivalence classes — arrangements that map onto one another under a symmetry operation are the same structure - and returns one representative per class along with how many raw configurations that representative stands for (its degeneracy). That's how the 630 raw Ti-pair choices became 202 distinct ones to actually compute.






> [!NOTE]
> 1.) **The SOD code** — the official repository is from the Grau-Crespo group:  
> [github.com/gcmt-group/sod](https://github.com/gcmt-group/sod)
> 2.) **The paper** (reference 58, Grau-Crespo, Hamad, Catlow & de Leeuw 2007 — "Symmetry-adapted configurational modelling of fractional site occupancy in solids," _J. Phys.: Condens. Matter_ **19**, 256201):  
> [IOPscience (publisher)](https://iopscience.iop.org/article/10.1088/0953-8984/19/25/256201) — DOI: 10.1088/0953-8984/19/25/256201


# ???

**Which of the two available Ti sites host the two excess electrons (the two Ti(III) ions)?**





![[Pasted image 20260619225809.png|500]]


- **Figure 4:** the $anatase-TiO_(2)$ oxygen-vacancy site scane over all 202 configurations.

- _Closed Black Squares_- the energy of each configuration after the first release stage: the constraint is lifted but the calculations restarts from both the distorted structure and the wavefunction carried over from the OMC-constrained (d_(-2)-seeded) run. All energies are relative to the lowest of this set, configuration 166 - which is why the black dashed line sits at 0.0.
- _Open Circles_- energy of each configuration after the first release stage: The wavefunction Is thrown away and the cell is allowed to relax from the distorted structure alone, giving the d orbital freedom to rotate/distort. These come in two colors
	- _Blue open circles_: configurations with a least one T-(III) ion nearest-neighbor to the oxygen vacancy
	- _Red open circles_- All other configurations (both Ti(III) ions beyond a nearestneighbor position).
	
- _Blue Dashed Line_- ( -0.12 eV marks the new minimum reached once the wavefunction is discarded.
- Configs 154/156, which drop below 166 because the NN-to-vacancy electron distorts a lobe into the vacancy and gains energy
- The blue points (NN-to-vacancy) are the ones that fall substantially when the wavefunction is removed. You can see them plunge around configs 150-170



# Ceria Complexity Ladder


1. $\mathrm{CeO}_2$ (stoichiometric, $\mathrm{f}^{\mathrm{o}}$ ) - no localization at all. This is your numerics/convergence baseline (ENCUT, k-density) and the cleanest cell to pin shared parameters.
2. $\mathrm{CeO}_2+$ one excess electron (single $\mathrm{Ce}^{3+}$, cubic) - the single-electron localization rung. Clean high-symmetry environment, known answer (you can check your $\mathrm{t}_2 \mathrm{u}<\mathrm{t}_1 \mathrm{u}< \mathrm{a}_2 \mathrm{u}$ ordering and f-orbital shapes directly against AW's Group 5). This is where you validate that your OCCMATRIX generator produces correct f-seeds — including the tricky off-diagonal cubic matrices - before any of it matters. It replaces AW's cluster rung but in your actual material and periodically.
3. $\mathrm{Ce}_2 \mathrm{O}_3\left(\right.$ all $\left.\mathrm{Ce}^{3+}\right)$ - every Ce is reduced, so there's no site/valence-ordering choice, but you now have many localized f electrons at once. This isolates the multielectron machinery - many simultaneous seeds, MAGMOM/spin setup, holding a dense localized state to convergence - without the site combinatorics confounding it. And it's one of your target compounds anyway, so it's on the critical path, not extra work.
4. $\mathrm{Ce}_7 \mathrm{O}_{12} / \mathrm{Ce}_{11} \mathrm{O}_{20}$ (mixed valence, ordered) - only here do all three difficulties hit together: multiple $\mathrm{Ce}^{3+}, \mathrm{Ce}^{3+} / \mathrm{Ce}^{4+}$ coexistence, and the site-ordering selection. By the time you arrive, your seeds, spin convention, convergence, and branch-propagation workflow are all proven, so the only genuinely new thing is the ordering - which you decide in the small cell and tile, per the earlier discussion.



# Rotation of $\mathrm{Ce}_7 \mathrm{O}_{12}$ and $\mathrm{Ce}_{11} \mathrm{O}_{20}$

Unlike AW's anatase, the Ce–O bonds in these phases do not lie in the principal-axis planes, so a global-frame diagonal seed does not map cleanly onto a crystal-field orbital. Be precise about what this forces, though: rotation is required *only if you want the seed itself to be a clean, named crystal-field orbital* (AW's aim). It is **not** strictly required to obtain a defensible localization branch — the release step (Simplification 2 below) lets the orbital find its own orientation. So treat rotation as a robustness knob, not a hard prerequisite.

$\mathrm{Ce}_7 \mathrm{O}_{12}$ and $\mathrm{Ce}_{11} \mathrm{O}_{20}$ are low-symmetry ordered phases (rhombohedral and triclinic respectively — confirm against your own CIF/structure files). Their Ce coordination polyhedra are distorted and vacancy-disrupted, and *different* Ce sites have *different* local orientations relative to the cell axes. So there's no single axis-aligned choice that works, and a global-frame diagonal f-seed won't be aligned to any particular Ce, let alone all of them.

One option AW mention — **rotating the cell** instead of the matrix — does *not* transfer to your case. A rigid cell rotation rotates every site together, so it can align at most one site's frame; AW could use that route only because all their Ti sites were symmetry-equivalent and shared one orientation. With inequivalent, differently-oriented Ce sites, **per-site occupation-matrix rotation is the only general tool** — cell rotation is off the table. This is precisely why your case is harder than even rutile would have been for AW.


## Simplifications:
1.  First, you care about the site/branch (which Ce are Ce³+), not about occupying a specific named f orbital with a specific orientation. So the seed only has to be good enough to localize one f electron on the intended Ce and keep it there. The exact orientation of the seed matters far less than for AW, who were deliberately trying to occupy and characterize each individual crystal-field orbital.
2. The methodology already handles final orientation at the release stage. AW's Run C (discard wavefunction, relax from the distorted structure) exists precisely so the orbital can rotate and distort freely to its true ground-state orientation. So your workflow is: seed a reasonable low-energy localized f on each target Ce, then release and let the physical state find its own orientation per site. You don't need a surgically pre-rotated seed to get a defensible branch.


## Fixing seeds that won't target or converge
1. **Seed robustness/targeting.** A badly misaligned global seed (lobes pointed straight into the coordinating oxygens of a tilted site) is a poor starting point and may converge slowly or wander to the wrong site/delocalize. If you see that, aligning the seed to that site's local Ce-O frame fixes it. That means building the local frame from the coordinating oxygen positions and applying an $\ell=3$ rotation (a Wigner-D / similarity transform R $\cdot \mathrm{n} \cdot \mathrm{R}^{\mathrm{T}}$ ) to a reference matrix - more involved than the d case ( $7 \times 7, \ell=3$ ) but scriptable, and worth wiring into your OCCMATRIX generator as an option. One convention trap to watch: $R$ is the $7\times7$ Wigner-D matrix in the **real** spherical-harmonic basis that VASP uses, and your reference matrix $n$ must be in that same real-harmonic convention — silently mixing real vs complex harmonics is the usual way this goes wrong.
2. **Orbital-character reporting.** When you want to state what orbital each $\mathrm{Ce}^{3+}$ ended up in, do it post-hoc by diagonalizing the converged occupation matrix and reading the eigenvector (AW's Eq. 13 approach), not by prerotating. That's frame-aware by construction and sidesteps the "name it by eye" trap we discussed.



# Symmetry Reduction in $\mathrm{Ce}_7 \mathrm{O}_{12}$ and $\mathrm{Ce}_{11} \mathrm{O}_{20}$ Using Site Occupancy Code

-
- Since $\mathrm{Ce}_7 \mathrm{O}_{12}$ and $\mathrm{Ce}_{11} \mathrm{O}_{20}$ are the mixed-valence phases ( $4 \mathrm{Ce}^{3+}+3 \mathrm{Ce}^{4+}$ and $4 \mathrm{Ce}^{3+}+7 \mathrm{Ce}^{4+}$ ), we need to know which Ce sites carry the 4f electron. In this scenario, DFT+U can get trapped in different localization patterns. 
- SOD enumerates the symmetry-inequivalent ways to choose your 4 $\mathrm{Ce}^{3+}$ sites among the Ce sublattice on a fixed oxygen framework binom $(7,4)=35$ and binom $(11,4)=330$ raw choices per formula unit, reduced by the (low) symmetry of the ordered cell. That's precisely the AW use case.

## Three Important Details

**1.) Fix the oxygen/vacancy ordering before running SOD.** 
- $\mathrm{Ce}_7 \mathrm{O}_{12}$ and $\mathrm{Ce}_{11} \mathrm{O}_{20}$ are defined crystallographic phases - take the experimentally-determined ordered structure. 
- Don't let SOD also enumerate vacancy arrangements; its job here is only the electronic ( $\mathrm{Ce}^{3+}$ ) distribution on top of that fixed framework.


**2.) Second, SOD enumerates a label, you translate the label into an OMC seed.** 
- $\mathrm{Ce}^{3+}$ and $\mathrm{Ce}^{4+}$ are the same atom in the POSCAR with different f occupations, so you can't literally "substitute" one for the other and have VASP know. 
- _The workflow is:_ 
	- 1.) treat $\mathrm{Ce}^{3+}$ as a marker species for enumeration
	- 2.) let SOD return the inequivalent marker patterns plus their degeneracies
	- 3.) then map each pattern onto an OCCMATRIX seed ( $\mathrm{f}^1$ on the marked $\mathrm{Ce}, \mathrm{f}^0$ on the rest) and MAGMOM.


3.) **Third, anchor to the known ordering.** 
- These phases have literature on where $\mathrm{Ce}^{3+}$ sits relative to the ordered vacancies. Use SOD to generate the full inequivalent set, but cross-check that the experimentally-implied ordering is in it and comes out lowest that's the validation, and it's far more efficient than treating it as a blind search.