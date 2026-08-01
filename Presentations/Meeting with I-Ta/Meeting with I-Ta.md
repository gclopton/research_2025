
# Introduction: the Ce₇O₁₂ reference branch

The goal of this work is to determine the ground‑state Ce³⁺/Ce⁴⁺ ordering of Ce₇O₁₂ — to establish, and document, a single **reference branch**.

That framing needs unpacking, because the deliverable is not what people usually expect. We are not primarily after a relaxed structure or a number. We are after a _documented electronic state_: which cerium carry the localized f electrons, how that state was prepared and released, how robust it is against restarts and reasonable perturbations, and which competing arrangements were checked and rejected. The structure and the energy fall out of that; the branch is the thing.

**Why this deserves an entire campaign rather than a single calculation** comes down to what the data is for. Ce₇O₁₂ is one of the reduced‑ceria phases we are building DFT reference data for — data that will train machine‑learned interatomic potentials and seed ab initio molecular dynamics. The quality of any such potential is bounded by the internal consistency of the data it learns from. And here is the failure mode: if two reference calculations sit on _different_ Ce³⁺/Ce⁴⁺ branches, their energies are no longer comparable. Two nearly identical structures get labeled with energies that differ for reasons that have nothing to do with their geometry. A potential trained on that mixture is learning contradictions — spurious barriers, wrong relative stabilities, forces that don't integrate to the energies. And it happens **silently**, because each individual calculation looks converged and entirely reasonable on its own. Establishing one branch up front, and holding every downstream calculation to it, is what makes the reference data trustworthy at all.

**The difficulty is that the ordering is genuinely underdetermined.** Charge balance fixes _how many_ cerium are reduced — twelve O²⁻ demand +24 from seven cerium, and only four Ce³⁺ with three Ce⁴⁺ satisfies that — but it says nothing about _which_ four. What fills that gap is not physics but accident: the DFT+U self‑consistency cycle settles into whichever arrangement happens to lie nearest its initial guess, and the polaronic self‑trapping then holds it there. There are many such arrangements, separated by real energy barriers, and each is a perfectly valid self‑consistent solution.

That last point is the one worth pausing on, because it is what makes this problem insidious rather than merely annoying. **This is not a convergence problem.** Nothing is broken. No warning is printed. Every branch converges beautifully, reports sensible forces, and looks entirely publishable on its own. You cannot fix it by tightening `EDIFF` or raising the plane‑wave cutoff — and, as we will see, doing exactly that turns out to _change the answer_, which is the tell.

**So the approach follows from the diagnosis.** If the calculation will not reveal the branch, we cannot _discover_ the ordering — we have to **impose** it. That is what occupation‑matrix control gives us: a way to pin each cerium's 4f occupation matrix to a chosen Ce³⁺/Ce⁴⁺ pattern, relax the lattice around it so the polaron can form, then release the constraint and see which patterns survive on their own. Do that for every symmetry‑distinct arrangement, rank the survivors by their released energies, and an uncontrolled metastability problem becomes a controlled, exhaustive search.




# Before OMC: what ordinary DFT+U told us about Ce₇O₁₂

## Introduction

These three calculations were not meant to be interesting. Their purpose was housekeeping: establish a working DFT+U setup for Ce₇O₁₂ and converge the plane‑wave cutoff, the sort of thing you do before any production science. What came out instead was a diagnosis. Read together, they are the clearest empirical case we have for why occupation‑matrix control is necessary at all — and they made the argument using our own data rather than someone else's.

All three share the same skeleton. They use the 57‑atom conventional cell, Dudarev DFT+U with U = 5 eV on the Ce 4f and none on oxygen, `LMAXMIX = 6`, a conservative mixing floor, and — this turns out to be the whole story — **`NSW = 0`**. The ions never move. And none of them uses occupation‑matrix control: despite one being named `manual_occmatrix`, there is no `OCCMATRIX` file and no `OCCEXT` anywhere in the set. The only thing steering the electrons is the initial `MAGMOM`, which places a moment on twelve cerium and none on the other nine.

One detail in that seed matters later. It puts the octahedral, axial cerium — sites 7, 14, 21, the ones sitting on the oxygen‑vacancy string — into the Ce³⁺ set.

## 1. Static DFT+U, cold start (900 eV)

The simplest case: a single‑stage, cold‑start calculation (`ISTART = 0`, `ICHARG = 2`) at 900 eV, with the ions held fixed. It converged to `EDIFF = 1E‑4` in 94 electronic iterations. On its face, a healthy run.

The electron count came out right, too. The total magnetization settled at **12.0** — exactly four unpaired electrons per formula unit, which is what charge balance demands. Whatever else is going on, the calculation is not losing or gaining electrons.

But look at _where_ those electrons went. Per formula unit, the 4f moments on the seven cerium are **0.66, 0.75, 0.86, 0.86, 0.04, 0.81, 0.02**. Four electrons are spread across **five** cerium at partial occupancy — not four cerium carrying one electron each. This is a partially delocalized state: the f electrons are being _shared_, not localized.

Two things stand out. First, the axial site came back at **0.02** — it rejected the electron our seed handed it. That is not a bug, and it is worth saying out loud: it agrees with the bond‑valence and DFT+U literature, which finds the excess charge localizes _away_ from the oxygen vacancies. The calculation quietly corrected our seed. Second, and more importantly, **no cerium reaches a clean integer moment.** Nothing in this run is a Ce³⁺ in the sense we actually need.

## 2. Staged DFT+U, non‑seeded (ENCUT 400–800 eV)

The purpose here was a plane‑wave cutoff convergence scan — the same recipe run at nine cutoffs from 400 to 800 eV, each staged as a rough pass followed by a final pass, each starting without a seed wavefunction. All nine reached their convergence criterion, which by the usual standards means the scan "worked."

It didn't. The localization pattern is **not stable against the cutoff**:

|ENCUT|Ce 1–7 f‑moments|
|---|---|
|400 eV|**0.05** · 0.84 · 0.79 · 0.83 · 0.69 · 0.82 · 0.02|
|500 eV|0.78 · 0.77 · 0.81 · 0.77 · **0.05** · 0.80 · 0.02|
|650 eV|0.80 · 0.77 · 0.81 · 0.77 · **0.04** · 0.79 · 0.02|
|800 eV|0.57 · 0.80 · **0.06** · 0.89 · 0.86 · 0.88 · 0.02|

At 400 eV the un‑reduced cerium is site 1. At 500 and 650 it is site 5. At 800 it is site 3 — and site 1 has collapsed to a half‑occupied 0.57.

Read that again, because it is the crux: **which cerium are reduced changes when we change the plane‑wave cutoff.** `ENCUT` is a numerical convergence parameter. It controls basis‑set completeness and nothing else. It has no business changing the physical answer. But it does — because the SCF is not converging to _the_ solution. It is falling into whichever metastable arrangement happens to lie nearest wherever it started, and changing the cutoff moves the starting point.

There is a second, quieter casualty here: **the cutoff scan itself is compromised.** The total energies do not settle smoothly with increasing cutoff (−468.67 eV at 400, −467.83 at 500, −468.02 at 650). You cannot converge a basis set against a moving target — and the target is moving, because the electronic state keeps changing underneath the scan.

## 3. Staged DFT+U, seeded (ENCUT 400–800 eV)

Same recipe again, with one change: each calculation is handed an explicit **seed WAVECAR** — a converged wavefunction from a prior run — instead of starting cold. All nine converged, generally faster and more cleanly than the non‑seeded series.

And in the narrow sense it was meant to, it works. The localization pattern is now **stable across every cutoff**: 0.81, 0.78, 0.80, 0.77, 0.04, 0.79, 0.02, essentially unchanged from 400 to 800 eV. Seeding buys reproducibility.

But it does not buy _correctness_, and the difference matters. The state is still smeared — four electrons over five cerium at roughly 0.8 μB apiece. And the reproducibility we gained is the reproducibility of a **choice**, not of a discovery: we get the same answer every time because we keep handing the calculation the same starting wavefunction. Change the starting point and the answer changes again.

Which is exactly what happens at 800 eV. The non‑seeded run lands about **10 meV lower** than the seeded one, on a _different_ pattern. Same INCAR, same cutoff, different starting wavefunction, different final state — and the state we so carefully "stabilized" is not even the lower of the two. Stability is not the same as being right.

## 4. What it all means

Three sets of calculations. All of them converged. All of them reported the correct number of unpaired electrons. **None of them produced a clean Ce³⁺/Ce⁴⁺ branch.**

The cause is sitting in plain sight in every one of these INCARs: **`NSW = 0`**. The ions never move.

A Ce³⁺ is a small polaron. The localized electron and the outward relaxation of the oxygens around it hold each other up; neither is stable alone. Freeze the lattice and you have removed the very thing that anchors an electron to a site. What is left is an electron with no reason to prefer any particular cerium — so it smears across several, and _which_ several gets decided by numerical accidents: the plane‑wave cutoff, the starting wavefunction. **Both symptoms — the smearing and the branch‑flipping — come from the same missing ingredient.**

The contrast with the occupation‑matrix‑controlled run is stark. Constrain the occupation matrix, let the ions relax _under_ that constraint, and the moments come back at **0.98 μB on exactly four cerium and 0.008 μB on the other three**, with the imposed pattern intact and the total energy having fallen **0.47 eV** as the distortion formed. That is what a localized branch actually looks like. Nothing above is one.

So these calculations did not fail. They **diagnosed**. They told us three things, and OMC is the response to all three: that seeding the magnetic moments is not sufficient; that the answer we were getting was an artifact of where we happened to start; and that our seed had the axial site backwards. The method we adopted next was not a preference — it was the conclusion these runs forced on us.


# Occupation Matrix Control


- https://github.com/SMTG-Bham/doped

- https://shakenbreak.readthedocs.io/en/latest/



We determine the number of reduced cerium from the charge balance. We have twelve O²⁻ contribute −24, so the seven cerium have to supply +24, and the only way to do that is **four Ce³⁺ and three Ce⁴⁺**: 4(+3) + 3(+4) = 24. So every valid arrangement has exactly four reduced cerium.


Now we need to figure out which of the four seven cerium atoms carry the localized f electron. There are a total of seven choose 4, or 35 possibilites. Most of these arrangements are the crystallographically identical, so they have the same energy by construction. The relevant symmetry group here has six operations: the identity, two 3-fold rotations about the trigonal axis, inversion, and two S6 improper rotations. Under them, the seven cerium sites fall into three groups — **site 7 sits on the 3‑fold axis** and is fixed by every operation, while sites **{1, 2, 3}** and **{4, 5, 6}** each form a triangle, the two triangles being related by inversion.


## Elimination of Crystallographically Identical Arrangements through Symmetry

To count the genuinely distinct arrangements, we use Burnside's lemma: the number of inequivalent arrangements is the _average_ number of arrangements left unchanged by each symmetry operation.


The identity leaves every arrangement untouched, so all **35** survive it.

Next, the two 3‑fold rotations about the trigonal axis. A rotation cycles sites 1→2→3 among themselves, cycles 4→5→6 among themselves, and leaves site 7 alone on the axis. So an arrangement survives a rotation only if the reduced set is built from whole orbits — the single site {7}, the triangle {1, 2, 3}, or the triangle {4, 5, 6}. The only way to assemble exactly four reduced sites from pieces of size 1, 3, and 3 is one triangle plus the axial site. That gives **two** surviving arrangements for each rotation.

Then inversion. Inversion fixes site 7 and swaps the sites in pairs: 1↔4, 2↔5, 3↔6. So a surviving arrangement must be made of whole pairs. Two pairs give exactly four sites, and there are three ways to pick two pairs out of three — so **three** arrangements survive inversion. (You can't use site 7 here: adding it to one pair gives three sites, and to two pairs gives five.)

Finally, the two S₆ improper rotations — a 3‑fold rotation combined with inversion. These sweep all six outer sites into a **single six‑cycle**, leaving only site 7 fixed. So the available orbits have sizes 1 and 6, and there is simply no way to build a set of exactly four out of them. **Zero** arrangements survive either S₆.

Averaging over the six operations: (35 + 2 + 2 + 3 + 0 + 0) / 6 = 42 / 6 = **seven**. For each of these seven stages, we run three calculations. **Stage A** switches the occupation-matrix constraint on and relaxes the lattice under it — that _prepares_ the branch, but its energy is contaminated by the constraint and can never be used for comparison. **Stage B** releases the constraint and restarts from Stage A's state — that's the energy we actually rank on. **Stage C** releases from the relaxed geometry alone, discarding the wavefunction — a robustness check. _A prepares, B measures, C verifies._



The numbers shown in the Ewald pre-rank column are from a _point-charge electrostatic sort_ — Ce³⁺ = +3, Ce⁴⁺ = +4, O = −2, frozen ideal geometry, no quantum mechanics, no relaxation, no polaron. This serves as a cheap ordering that motivated which candidate to run first, but it is not a prediction.


## Stage A

Stage A is where we _manufacture_ one of the seven arrangements. It's the only stage with the constraint switched on, and its job is to hand the later stages a converged, physically distorted state sitting in that candidate's basin.

In ordinary DFT+U, each cerium's 4f occupation matrix — a 7×7 matrix per spin, one row per f orbital — emerges from the density during the SCF cycle, and the +U energy is built from whatever comes out. The Watson OMC patch changes that: with `OCCEXT = 1`, VASP reads an external `OCCMATRIX` file and, at ===every electronic step===, **resets each cerium's 4f occupation matrix toward the target we supplied**. So the +U potential is built from the _imposed_ matrix, not the freely-evolving one, and the calculation cannot drift to a different Ce³⁺/Ce⁴⁺ arrangement while the ions move.


### Building the OCCMATRIX

The file controls all seven cerium. Each gets a header — atom index, `L = 3` for the f shell, and 2 spin components — followed by a 7×7 spin-up block and a 7×7 spin-down block.

For a **Ce³⁺** we put a single **1.0 on one diagonal entry of the spin-up block** and zeros everywhere else; the spin-down block is entirely zero. For a **Ce⁴⁺**, both blocks are all zeros.

The spin-down block is zero for a simple reason: a Ce³⁺ has exactly _one_ f electron, and one electron lives in one spin channel. Putting anything in the down block would be asking for a second f electron — an f² Ce²⁺ that doesn't exist here.

Which diagonal entry? We seed **position 6**, which in VASP's internal f-orbital ordering (`M = m − L − 1`, so the seven positions run M = −3 … +3) is **M = +2**. We call it `diag_f2`. I want to be precise about what we verified: we confirmed the _index convention_ — that position 6 really is M = +2 — but which 4f orbital the electron physically _prefers_ is a question only the release run can answer.


The single most important setting is that the ions relax while the constraint is held — `NSW = 60`, `IBRION = 2` (conjugate gradient). Here's why. The reason is that Ce³⁺ is a small polaron: the localized electron and the outward relaxation of its neighboring oxygens hold each other up, and neither is stable alone. If you pin the occupation matrix on a _frozen_ lattice, the distortion never forms — so when you lift the constraint, the electrons have nothing anchoring them and they scatter. The release looks unstable, but for a purely geometric reason, not a physical one. 



- **The number of reduced cerium
    - 12 O²⁻ contribute **−24**, so the 7 Ce must supply **+24**
    - Only solution: **4 Ce³⁺ + 3 Ce⁴⁺** → 4(+3) + 3(+4) = 24
    - So every valid arrangement has exactly **four** reduced cerium
- **The open question: which four carry the localized f electron?
    - "Seven choose four" → **35** possible arrangements
- **But most of those 35 are crystallographically identical**
    - Related by the crystal's own symmetry → **same energy by construction**
    - → symmetry reduction 



- **The symmetry group has six operations**
    - identity · two 3‑fold rotations (about the trigonal axis) · inversion · two S₆ improper rotations
- **The seven Ce sites fall into three groups**
    - **Site 7** — sits on the 3‑fold axis, fixed by _every_ operation
    - **{1, 2, 3}** and **{4, 5, 6}** — two triangles, related to each other by inversion
- **Burnside's lemma:** the number of distinct arrangements = the _average_ number left unchanged by each operation



## Stage B


Stage A prepared a state, but its energy is contaminated by the constraint we imposed, so it can't be compared to anything. Stage B removes the constraint and lets the calculation run as an ordinary DFT+U relaxation. So we restart from Stage A's endpoint — the distorted geometry, the wavefunction, and the charge density ((`ISTART = 1` reads the `WAVECAR` (the converged wavefunction); `ICHARG = 1` reads the `CHGCAR` (the converged charge density)). 


`NUPDOWN = 4` stays on. Releasing the occupation-matrix constraint frees _where_ and _in which orbital_ the electrons localize — but the total collinear spin polarization is still fixed at four unpaired electrons. And I want to be exact about what that does and doesn't do. The composition fixes the _number_ of localized f electrons at four, but it does **not** fix the net moment — four unpaired electrons could be aligned ferromagnetically (net 4 μB) or antiferromagnetically (net 0 or 2). So `NUPDOWN = 4` is not a compositional necessity; it's a deliberate choice of the **ferromagnetic baseline**. Magnetic ordering is a separate axis we sweep later. Stage B is testing whether the _site-localization_ branch survives, not comparing spin arrangements.


This stage asks: **left to itself, does the prepared branch survive?** A good Stage B converges cleanly and _stays on the branch_: the four Ce³⁺ moments intact, total moment still 4, the same four cerium still reduced. Only then is the energy usable

If the four Ce³⁺ stay localized where we seeded them once nothing is holding them there, then this ordering is a genuine self-consistent solution, and its converged energy is the honest, comparable number we rank candidates by. Stage B is where "we prepared a state" becomes "here is what that state is worth."



# Stage C


Stage B releases the constraint, but it hands the calculation Stage A's own converged wavefunction and charge density. That's a _warm_ start: the prepared electronic state is already sitting there, and the calculation only has to decide whether to keep it. That's the right test of survival, but it leaves a loophole — a branch could persist merely because it was spoon-fed its own answer, not because the physics genuinely supports it.

Stage C closes that loophole. It throws the electronic state away and keeps **only the geometry** — the polaronically distorted lattice Stage A produced. Then it asks the stricter question: **can the distortion, by itself, re-localize the electrons into the same branch?** Stage C is **not** a blind electronic start. It still carries `MAGMOM` — initial moments placed on the intended Ce³⁺ sites — and `NUPDOWN = 4`. So the accurate statement is **"structure plus a simple initial-moment guess, with no converged wavefunction or charge density"** — not "the structure with no electronic hint at all."





