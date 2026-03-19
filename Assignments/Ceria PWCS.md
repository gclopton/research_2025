


If three step method works, try running it with AIMD. Check if all the AIMD steps are converging. If there is a poitn where convergence does not happen, can we try the multistep process at that point and keep going from there?



[Three Step Method](https://vasp.at/wiki/Troubleshooting_electronic_convergence?utm_source=chatgpt.com)






# Magnetism


**Keep the plane-wave and k-point sweeps on one consistent electronic/magnetic branch so the convergence curves are meaningful, and so the MD forces you generate come from a single, reproducible DFT(+U) state.**

This is important for the MLIP training pipeline. If your sweep hops between different polaron/local-moment arrangements (or collapses to a low-moment solution on one ENCUT point and not another), your “convergence” stops being a smooth numerical test and starts becoming “you changed the physics mid-sweep.” That will also poison MD training data, because the same geometry can produce different forces depending on which electronic minimum you landed in. So for the purposes of numerical convergence and data generation, it’s totally reasonable to define “success” as “stay near MP’s total magnetization,” even if another ordering might be slightly lower in energy in some other study


|          |                         | Magnetism Enabled? | expected_total_muB | MAGOM                    | expected_tolerance_m uB | delta_muB_tolerance | near_zero_muB | n_formula_units | Materials Project                                                            |
| -------- | :---------------------- | :----------------- | ------------------ | :----------------------- | :---------------------- | :------------------ | :------------ | :-------------- | ---------------------------------------------------------------------------- |
| Running  | **Ce11O20** `mp-505619` | Yes                | 4.00 μB/f.u.       | `4*1.0 7*0.0 20*0.0`     | 0.3                     | 0.2                 | 0.1           | 1               | [Link](https://chatgpt.com/c/6978c24a-e6f8-8330-ac54-32c0aa08f958)           |
| Complete | **Ce2O3** `mp-1182200`  | Yes                | 1.78 μB/f.u.       | `1*1.0 1*-1.0 3*0.0`     | 0.3                     | 0.2                 | 0.1           | 1               | [Link](https://chatgpt.com/c/6978c24a-e6f8-8330-ac54-32c0aa08f958)           |
|          | **Ce7012** `mp-2629`    | Yes                | 4.00 μB/f.u.       | `12*1.0 9*0.0 36*0.0`    | 0.3                     | 0.2                 | 0.1           | 3               | [Link](https://next-gen.materialsproject.org/materials?material_ids=mp-2629) |
| Complete | **CeO2** `mp-1018664`   | No                 | 0  μB/f.u.         | ==(ISPIN=1; no MAGMOM)== | 0.2                     | 0.2                 | 0.1           | 2               | [Link]                                                                       |
|          |                         |                    |                    |                          |                         |                     |               |                 |                                                                              |

