
- All Ce are Ce4+ - completely empty 4 f shells. No localized f-electrons, no orbital occupation problem, no DFT+U local minima to worry about.
- All O are O2- - closed shell, fully ionic
- Nonmagnetic (ISPIN=1) - no unpaired electrons anywhere
- Wide-gap insulator - band gap of $\mathbf{2 . 9 6 8 ~ e V}$ (PBE $+\mathrm{U}, \mathrm{U}=5.0 \mathrm{eV}$ )
- The gap is between the $\mathbf{0 2 p}$ valence band ( $\mathrm{VBM}=3.17 \mathrm{eV}$ ) and the $\mathbf{C e} \mathbf{4 f}$ conduction band ( $\mathrm{CBM}=6.14 \mathrm{eV}$ )
- Experimental gap is $\sim 3.0 \mathrm{eV}$ - our value of 2.97 eV is within $1 \%$ of experiment, which is excellent for PBE+U

| ENCUT (eV) | VBM (eV) | CBM (eV) | Gap (eV) |
| :--------- | :------- | :------- | :------- |
| 600        | 3.1706   | 6.1388   | 2.9682   |
| 700        | 3.1689   | 6.1372   | 2.9683   |
| 850        | 3.1682   | 6.1368   | 2.9686   |
| 950        | 3.1682   | 6.1368   | 2.9686   |


```bash

for encut in 600 650 700 750 800 850 900 950; do
  outcar="ENCUT_${encut}/OUTCAR"
  efermi=$(grep "E-fermi" $outcar | tail -1 | awk '{print $3}')
  vbm_cbm=$(grep -A 50 "band No.  band energies" $outcar | tail -50 | awk '
    NF==3 && $3>0.5 {vbm=$2}
    NF==3 && $3<0.5 && cbm=="" {cbm=$2}
    END {printf "VBM=%.4f CBM=%.4f gap=%.4f", vbm, cbm, cbm-vbm}
  ')
  echo "ENCUT $encut: Efermi=$efermi  $vbm_cbm"
done

```