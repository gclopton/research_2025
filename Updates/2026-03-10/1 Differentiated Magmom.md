

- $\begin{aligned} & 3 \mathrm{Ce}^{3+}(7 \text {-coord })+3 \mathrm{Ce}^{4+}(7 \text {-coord })+1 \mathrm{Ce}^{3+}(\text { octahedral })=4 \mathrm{Ce}^{3+} +3 \mathrm{Ce}^{4+}=7 \mathrm{Ce}\end{aligned}$
- In the $3 \times$ supercell $\left(\mathrm{Ce}_{21} \mathrm{O}_{36}\right): 9 \mathrm{Ce}^{3+}(7$-coord $)+9 \mathrm{Ce}^{4+}(7$-coord $)+3 \mathrm{Ce}^{3+}($ octahedral $)=12 \mathrm{Ce}^{3 *}$ with moments, $9 \mathrm{Ce}^{4 *}$ without.
- The 3 octahedral sites are easy to identify (sites $7,14,21$ -->are the high-symmetry positions). But all 18 seven-coordinate sites are symmetry-equivalent in R-3. 
	- The Materials Project structure doesn't encode which are $\mathrm{Ce}^{3+}$ vs $\mathrm{Ce}^{4+}$ - it labels them all $\mathrm{Ce}+3.43+$. Choosing which 9 get moments is a symmetry-breaking choice that imposes a specific charge ordering pattern.
- The 18 seven-coord sites form 3 groups of 6 related by the R-centering translations:
	- Group A: sites 1-6
	- Group B: sites 8-13
	- Group C: sites 15-20
- Within each group, we need $3 \mathrm{Ce}^{3+}$ and $3 \mathrm{Ce}^{4+}$. 
- We can alternate within each group--avoid clustering same-charge Ce neighbors.
	- Used `MAGMOM = 1 0 1 0 1 0   1   1 0 1 0 1 0   1   1 0 1 0 1 0   1   36*0` (FM Initialization)
	- within each group of 6 seven-coord sites, odd positions get $1\left(\mathrm{Ce}^{3+}\right)$, even get $0\left(\mathrm{Ce}^{4+}\right)$, plus all 3 octahedral sites get 1 . Total: $12 \times 1 \mu \mathrm{~B}=12 \mu \mathrm{~B}$ for the supercell ( $4 \mu \mathrm{~B} /$ f.u. $)$.
- MAGMOM correctly biases the initial spin density, but MAGMOM only influences the first SCF step
	- Does not constrain which f-orbital is occupied on each $Ce ^{3+}$ site (orbital ordering) or prevent charge redistribution during SCF
- We still see violent SCF oscillations (10-25 eV swings) at ENCUT ≥ 450 eV despite differentiated MAGMOM
- **This week:** Need direct control over orbital occupations. Need to try occupation matrix seeding or WAVECAR seeding to more reliably select the correct DFT+U basin





