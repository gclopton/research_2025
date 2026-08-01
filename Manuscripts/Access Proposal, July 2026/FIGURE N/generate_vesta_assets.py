#!/usr/bin/env python3
"""Generate VESTA scene files for Figure N structure insets.

These are intended to be opened in VESTA and exported via
File -> Export Raster Image or File -> Export Vector Image.  The structures are
derived from the completed BDM Stage 0 CeO2 and Ce2O3 calculations.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import acos, degrees, sqrt
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCENE_DIR = ROOT / "vesta-scenes"
POSCAR_DIR = ROOT / "structure-files"

CEO2_CONTCAR = Path(
    "/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/"
    "bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockB/B02_cellrelax2/CONTCAR"
)
CE2O3_CONTCAR = Path(
    "/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/"
    "bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockC/C05_Ce2O3_static550/CONTCAR"
)


@dataclass
class Atom:
    kind: str
    label: str
    frac: tuple[float, float, float]


@dataclass
class Structure:
    title: str
    lattice: list[list[float]]
    atoms: list[Atom]
    source: Path


def norm(v: list[float] | tuple[float, float, float]) -> float:
    return sqrt(sum(x * x for x in v))


def dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def cell_params(lattice: list[list[float]]) -> tuple[float, float, float, float, float, float]:
    a, b, c = lattice
    la, lb, lc = norm(a), norm(b), norm(c)
    alpha = degrees(acos(max(-1.0, min(1.0, dot(b, c) / (lb * lc)))))
    beta = degrees(acos(max(-1.0, min(1.0, dot(a, c) / (la * lc)))))
    gamma = degrees(acos(max(-1.0, min(1.0, dot(a, b) / (la * lb)))))
    return la, lb, lc, alpha, beta, gamma


def parse_poscar(path: Path) -> Structure:
    raw = [line.rstrip() for line in path.read_text().splitlines() if line.strip()]
    title = raw[0].strip()
    scale = float(raw[1].split()[0])
    lattice = [[scale * float(x) for x in raw[i].split()[:3]] for i in range(2, 5)]
    species = raw[5].split()
    counts = [int(x) for x in raw[6].split()]
    coord_line = 7
    if raw[coord_line].strip().lower().startswith("s"):
        coord_line += 1
    if not raw[coord_line].strip().lower().startswith("d"):
        raise ValueError(f"{path} must use Direct coordinates")
    atoms: list[Atom] = []
    idx = coord_line + 1
    n = 1
    for sp, count in zip(species, counts):
        for _ in range(count):
            frac = tuple(float(x) % 1.0 for x in raw[idx].split()[:3])
            atoms.append(Atom(sp, f"{sp}_{n}", frac))
            idx += 1
            n += 1
    return Structure(title, lattice, atoms, path)


def repeat_structure(structure: Structure, repeats: tuple[int, int, int], title: str) -> Structure:
    rx, ry, rz = repeats
    lattice = [
        [rx * x for x in structure.lattice[0]],
        [ry * x for x in structure.lattice[1]],
        [rz * x for x in structure.lattice[2]],
    ]
    atoms: list[Atom] = []
    counters: dict[str, int] = {}
    for ix in range(rx):
        for iy in range(ry):
            for iz in range(rz):
                for atom in structure.atoms:
                    counters[atom.kind] = counters.get(atom.kind, 0) + 1
                    frac = (
                        (atom.frac[0] + ix) / rx,
                        (atom.frac[1] + iy) / ry,
                        (atom.frac[2] + iz) / rz,
                    )
                    atoms.append(Atom(atom.kind, f"{atom.kind}_{counters[atom.kind]}", frac))
    return Structure(title, lattice, atoms, structure.source)


def dist2_frac(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    d = []
    for x, y in zip(a, b):
        q = abs(x - y)
        d.append(min(q, 1.0 - q))
    return sum(x * x for x in d)


def vacancy_site(ceo2: Structure) -> Atom:
    oxy = [a for a in ceo2.atoms if a.kind == "O"]
    target = (0.25, 0.25, 0.25)
    return min(oxy, key=lambda a: dist2_frac(a.frac, target))


def ce_neighbors(ceo2: Structure, vac_frac: tuple[float, float, float], n: int = 2) -> list[Atom]:
    ce = [a for a in ceo2.atoms if a.kind == "Ce"]
    return sorted(ce, key=lambda a: dist2_frac(a.frac, vac_frac))[:n]


def make_ceo2_variants() -> dict[str, Structure]:
    ceo2_unit = parse_poscar(CEO2_CONTCAR)
    ceo2 = repeat_structure(ceo2_unit, (1, 2, 2), "FigureN_pristine_CeO2_2D_slab")
    # Put the motif in the middle tile of the 2D patch, away from the visual edge.
    target_vacancy = (0.25, (0.25 + 1.0) / 2.0, (0.25 + 1.0) / 2.0)
    vac = min([a for a in ceo2.atoms if a.kind == "O"], key=lambda a: dist2_frac(a.frac, target_vacancy))
    nearest_ce2 = ce_neighbors(ceo2, vac.frac, 2)
    nearest_ce4 = ce_neighbors(ceo2, vac.frac, 4)

    def without_vac() -> list[Atom]:
        atoms = []
        for atom in ceo2.atoms:
            if atom is vac:
                continue
            atoms.append(Atom(atom.kind, atom.label, atom.frac))
        return atoms

    pristine = Structure("FigureN_pristine_CeO2_2D_slab", ceo2.lattice, [Atom(a.kind, a.label, a.frac) for a in ceo2.atoms], ceo2.source)

    vac_atoms = without_vac()
    vacancy = Structure("FigureN_CeO2_oxygen_vacancy_2D_slab", ceo2.lattice, vac_atoms, ceo2.source)

    ce3_labels = {a.label for a in nearest_ce2}
    ce3_atoms = []
    for atom in without_vac():
        kind = "Ce3" if atom.label in ce3_labels else atom.kind
        ce3_atoms.append(Atom(kind, atom.label.replace("Ce", "Ce3") if kind == "Ce3" else atom.label, atom.frac))
    ce3 = Structure("FigureN_VO_with_localized_Ce3_2D_slab", ceo2.lattice, ce3_atoms, ceo2.source)

    def displaced(name: str, scale: float) -> Structure:
        atoms = []
        labels = {a.label for a in nearest_ce4}
        for atom in without_vac():
            frac = atom.frac
            kind = "Ce3" if atom.label in labels else atom.kind
            label = atom.label.replace("Ce", "Ce3") if kind == "Ce3" else atom.label
            if atom.label in labels:
                vec = []
                for x, y in zip(atom.frac, vac.frac):
                    d = x - y
                    if d > 0.5:
                        d -= 1.0
                    if d < -0.5:
                        d += 1.0
                    vec.append(d)
                frac = tuple((x + scale * d) % 1.0 for x, d in zip(atom.frac, vec))
            atoms.append(Atom(kind, label, frac))
        return Structure(f"{name}_2D_slab", ceo2.lattice, atoms, ceo2.source)

    return {
        "01_pristine_ceo2.vesta": pristine,
        "02_oxygen_vacancy_ceo2x.vesta": vacancy,
        "03_vo_localized_ce3.vesta": ce3,
        "04a_bond_distortion_compressed.vesta": displaced("FigureN_BDM_compressed", -0.10),
        "04b_bond_distortion_unperturbed.vesta": displaced("FigureN_BDM_unperturbed", 0.00),
        "04c_bond_distortion_expanded.vesta": displaced("FigureN_BDM_expanded", 0.10),
    }


def make_ce2o3() -> Structure:
    src = parse_poscar(CE2O3_CONTCAR)
    atoms = []
    for atom in src.atoms:
        kind = "Ce3" if atom.kind == "Ce" else atom.kind
        label = atom.label.replace("Ce", "Ce3") if kind == "Ce3" else atom.label
        atoms.append(Atom(kind, label, atom.frac))
    return Structure("FigureN_Ce2O3_reduced_reference", src.lattice, atoms, src.source)


def make_ceo2_3d_lattice() -> Structure:
    ceo2_unit = parse_poscar(CEO2_CONTCAR)
    return repeat_structure(ceo2_unit, (2, 2, 2), "FigureN_pristine_CeO2_3D_lattice")


def write_poscar(name: str, structure: Structure) -> None:
    by_kind: dict[str, list[Atom]] = {}
    for atom in structure.atoms:
        if atom.kind == "X":
            continue
        poscar_kind = "Ce" if atom.kind == "Ce3" else atom.kind
        by_kind.setdefault(poscar_kind, []).append(atom)
    order = [k for k in ["Ce", "O"] if k in by_kind] + [k for k in by_kind if k not in {"Ce", "O"}]
    lines = [structure.title, "1.0"]
    lines += ["  " + "  ".join(f"{v:16.10f}" for v in row) for row in structure.lattice]
    lines.append("  " + "  ".join(order))
    lines.append("  " + "  ".join(str(len(by_kind[k])) for k in order))
    lines.append("Direct")
    for kind in order:
        for atom in by_kind[kind]:
            lines.append("  " + "  ".join(f"{x:16.10f}" for x in atom.frac))
    (POSCAR_DIR / name.replace(".vesta", ".POSCAR")).write_text("\n".join(lines) + "\n")


def sitet_entry(i: int, atom: Atom) -> str:
    # VESTA-style colors chosen to resemble groupmate structure insets.
    if atom.kind == "Ce":
        radius, rgb = 1.20, (112, 174, 206)
    elif atom.kind == "Ce3":
        radius, rgb = 1.24, (87, 155, 92)
    elif atom.kind == "O":
        radius, rgb = 0.52, (230, 45, 37)
    elif atom.kind == "X":
        radius, rgb = 0.70, (255, 255, 255)
    else:
        radius, rgb = 0.70, (180, 180, 180)
    r, g, b = rgb
    return f"{i:3d} {atom.label:>10s} {radius:7.4f} {r:3d} {g:3d} {b:3d} {r:3d} {g:3d} {b:3d} 204  0"


def atomt_entries(structure: Structure) -> list[str]:
    seen = []
    for atom in structure.atoms:
        if atom.kind not in seen:
            seen.append(atom.kind)
    out = []
    for i, kind in enumerate(seen, 1):
        dummy = Atom(kind, kind, (0, 0, 0))
        parts = sitet_entry(1, dummy).split()
        radius = parts[2]
        rgb = parts[3:9]
        out.append(f"{i:3d} {kind:>10s} {float(radius):7.4f} " + " ".join(f"{int(x):3d}" for x in rgb) + " 204")
    out.append("  0 0 0 0 0 0")
    return out


def write_vesta(name: str, structure: Structure, boundary: tuple[float, float, float, float, float, float]) -> None:
    a, b, c, alpha, beta, gamma = cell_params(structure.lattice)
    lines: list[str] = []
    lines += [
        "#VESTA_FORMAT_VERSION 3.5.4",
        "",
        "",
        "CRYSTAL",
        "",
        "TITLE",
        structure.title,
        "",
        "GROUP",
        "1 1 P 1",
        "SYMOP",
        "0 0 0 1 0 0 0 1 0 0 0 1 1",
        " -1.0 -1.0 -1.0  0 0 0  0 0 0  0 0 0",
        "TRANM 0",
        "0 0 0 1 0 0 0 1 0 0 0 1 1",
        "LTRANSL",
        " -1",
        " 0.000000  0.000000  0.000000  0.000000  0.000000  0.000000",
        "LORIENT",
        " -1   0   0   0   0",
        " 1.000000  0.000000  0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000  0.000000  1.000000",
        "LMATRIX",
        " 1.000000  0.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        " 0.000000  0.000000  0.000000",
        "PHASON",
        " 1.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000",
        " 0.000000  0.000000  1.000000",
        "CELLP",
        f" {a:9.6f} {b:9.6f} {c:9.6f} {alpha:9.6f} {beta:9.6f} {gamma:9.6f}",
        "  0.000000   0.000000   0.000000   0.000000   0.000000   0.000000",
        "STRUC",
    ]
    for i, atom in enumerate(structure.atoms, 1):
        element = "Ce" if atom.kind in {"Ce", "Ce3"} else ("O" if atom.kind == "O" else "X")
        x, y, z = atom.frac
        lines.append(f"{i:3d} {element:>2s} {atom.label:>10s}  1.0000 {x:10.6f} {y:10.6f} {z:10.6f}    1a       1")
        lines.append("                            0.000000   0.000000   0.000000  0.00")
    lines += [
        "  0 0 0 0 0 0 0",
        "THERI 1",
    ]
    for i, atom in enumerate(structure.atoms, 1):
        lines.append(f"{i:3d} {atom.label:>10s} -0.000000")
    lines += [
        "  0 0 0",
        "SHAPE",
        "  0       0       0       0   0.000000  0   192   192   192   192",
        "BOUND",
        f"{boundary[0]:.3f} {boundary[1]:.3f} {boundary[2]:.3f} {boundary[3]:.3f} {boundary[4]:.3f} {boundary[5]:.3f} ",
        "  0   0   0   0  0",
        "QCORIG",
        "        0         0         0",
        "SBOND",
        "  1    Ce     O    0.00000    2.90000  0  0  1  0  1  0.180  2.000 135 183 205",
        "  0 0 0 0",
        "SITET",
    ]
    for i, atom in enumerate(structure.atoms, 1):
        lines.append(sitet_entry(i, atom))
    lines += [
        "  0 0 0 0 0 0",
        "VECTR",
        " 0 0 0 0 0",
        "VECTT",
        " 0 0 0 0 0",
        "SPLAN",
        "  0   0   0   0",
        "LBLAT",
        " -1",
        "LBLSP",
        " -1",
        "DLATM",
        " -1",
        "DLBND",
        " -1",
        "DLPLY",
        " -1",
        "PLN2D",
        "  0   0   0   0",
        "ATOMT",
        *atomt_entries(structure),
        "SCENE",
        " 0.866025 -0.353553  0.353553  0.000000",
        " 0.500000  0.612372 -0.612372  0.000000",
        " 0.000000  0.707107  0.707107  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        "  0.000   0.000",
        "  0.000",
        "  0.850",
        "HBOND 0 2",
        "",
        "STYLE",
        "DISPF 37753794",
        "MODEL   0  1  0",
        "SURFS   0  1  1",
        "SECTS  32  1",
        "FORMS   0  1",
        "ATOMS   0  0  1",
        "BONDS   1",
        "POLYS   1",
        "VECTS 1.000000",
        "FORMP",
        "  1  1.0   0   0   0",
        "ATOMP",
        " 24  24   0  50  2.0   0",
        "BONDP",
        "  1  16  0.180  2.000 135 183 205",
        "POLYP",
        " 204 1  1.000 180 180 180",
        "ISURF",
        "  0   0   0   0",
        "TEX3P",
        "  1  0.00000E+00  1.00000E+00",
        "SECTP",
        "  1  0.00000E+00  1.00000E+00  0.00000E+00  0.00000E+00  0.00000E+00  0.00000E+00",
        "CONTR",
        " 0.1 -1 1 1 10 -1 2 5",
        " 2 1 2 1",
        "   0   0   0",
        "   0   0   0",
        "   0   0   0",
        "   0   0   0",
        "HKLPP",
        " 192 1  1.000 255   0 255",
        "UCOLP",
        "   0   1  1.000   0   0   0",
        "COMPS 1",
        "LABEL 1    12  1.000 0",
        "PROJT 0  0.962",
        "BKGRC",
        " 255 255 255",
        "DPTHQ 1 -0.5000  3.5000",
        "LIGHT0 1",
        " 1.000000  0.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        " 0.000000  0.000000 20.000000  0.000000",
        " 0.000000  0.000000 -1.000000",
        "  36  36  36 255",
        " 179 179 179 255",
        " 255 255 255 255",
        "LIGHT1",
        " 1.000000  0.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        " 0.000000  0.000000 20.000000  0.000000",
        " 0.000000  0.000000 -1.000000",
        "   0   0   0   0",
        "   0   0   0   0",
        "   0   0   0   0",
        "LIGHT2",
        " 1.000000  0.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        " 0.000000  0.000000 20.000000  0.000000",
        " 0.000000  0.000000 -1.000000",
        "   0   0   0   0",
        "   0   0   0   0",
        "   0   0   0   0",
        "LIGHT3",
        " 1.000000  0.000000  0.000000  0.000000",
        " 0.000000  1.000000  0.000000  0.000000",
        " 0.000000  0.000000  1.000000  0.000000",
        " 0.000000  0.000000  0.000000  1.000000",
        " 0.000000  0.000000 20.000000  0.000000",
        " 0.000000  0.000000 -1.000000",
        "   0   0   0   0",
        "   0   0   0   0",
        "   0   0   0   0",
        "SECCL 0",
        "",
        "TEXCL 0",
        "",
        "ATOMM",
        " 204 204 204 255",
        "  25.600",
        "BONDM",
        " 255 255 255 255",
        " 128.000",
        "POLYM",
        " 255 255 255 255",
        " 128.000",
        "SURFM",
        "   0   0   0 255",
        " 128.000",
        "FORMM",
        " 255 255 255 255",
        " 128.000",
        "HKLPM",
        " 255 255 255 255",
        " 128.000",
    ]
    (SCENE_DIR / name).write_text("\n".join(lines) + "\n")


def write_readme() -> None:
    content = f"""# Figure N VESTA Assets

These files replace the earlier placeholder SVG sketches. Open the `.vesta` files in VESTA and export figure-ready insets using `File -> Export Vector Image`.

## Recommended Export Settings

- Use a white background.
- Export each scene as SVG, PDF, or EPS. Illustrator can edit all three.
- Crop the exported image tightly in Illustrator/Preview.
- Add panel letters, arrows, and labels in Illustrator/Overleaf rather than inside VESTA.

## Scene Files

- `vesta-scenes/01_pristine_ceo2.vesta` — 1×2×2, slab-clipped CeO2 patch from `{CEO2_CONTCAR}`.
- `vesta-scenes/02_oxygen_vacancy_ceo2x.vesta` — same CeO2 patch with one centered schematic O vacancy marker.
- `vesta-scenes/03_vo_localized_ce3.vesta` — centered O vacancy with two nearby Ce sites colored as Ce3+.
- `vesta-scenes/04a_bond_distortion_compressed.vesta`
- `vesta-scenes/04b_bond_distortion_unperturbed.vesta`
- `vesta-scenes/04c_bond_distortion_expanded.vesta`
- `vesta-scenes/05_ce2o3_reduced_reference.vesta` — Ce2O3 from `{CE2O3_CONTCAR}`.
- `vesta-scenes/06_pristine_ceo2_3d_lattice.vesta` — 2×2×2 pristine CeO2 lattice for SHI cylinder overlays.

The CeO2-derived scenes use a moderate 1×2×2 patch clipped as a slab: enough atoms to read as a 2D sheet, without crowding the figure. The vacancy and bond-distortion scenes are schematic derivatives of the completed relaxed CeO2 cell because the full BDM defect pool has not yet been generated.
"""
    (ROOT / "README_VESTA.md").write_text(content)


def main() -> None:
    SCENE_DIR.mkdir(parents=True, exist_ok=True)
    POSCAR_DIR.mkdir(parents=True, exist_ok=True)
    variants = make_ceo2_variants()
    variants["05_ce2o3_reduced_reference.vesta"] = make_ce2o3()
    variants["06_pristine_ceo2_3d_lattice.vesta"] = make_ceo2_3d_lattice()
    for name, structure in variants.items():
        boundary = (0.0, 0.999, 0.0, 0.999, 0.0, 0.999)
        if (
            "3d_lattice" not in name.lower()
            and ("ceo2" in name.lower() or "distortion" in name.lower() or "vo_" in name.lower())
        ):
            boundary = (0.0, 0.55, 0.0, 0.999, 0.0, 0.999)
        write_vesta(name, structure, boundary)
        write_poscar(name, structure)
    write_readme()


if __name__ == "__main__":
    main()
