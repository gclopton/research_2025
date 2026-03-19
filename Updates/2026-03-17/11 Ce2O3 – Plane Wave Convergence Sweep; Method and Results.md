
**The sweep design:**

- **Range:** 450 to 1200 eV in 50 eV steps — 16 total calculations
- **Type:** Static SCF only (NSW=0, IBRION=-1) — no geometry relaxation. We are measuring the basis set dependence of the electronic energy at fixed atomic positions, not finding the equilibrium structure.
- **System:** Ce2O3 primitive cell, 5 atoms (2 Ce + 3 O), PBE+U (U=5.0 eV on Ce 4f), ISPIN=2, MAGMOM = 2×1.0 (FM)
- **Convergence criterion:** ΔE < 2 meV/formula unit relative to the high-ENCUT reference tail


