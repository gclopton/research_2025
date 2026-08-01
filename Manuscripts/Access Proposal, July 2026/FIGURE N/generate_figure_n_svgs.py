#!/usr/bin/env python3
"""Generate editable SVG structure panels for Figure N.

The CeO2 and Ce2O3 coordinates are parsed from the local Bridges calculation
mirror. Vacancy and Ce3+ panels use the relaxed CeO2 cell as the crystallographic
base, with schematic annotations for the missing O site and localized Ce sites.
"""

from __future__ import annotations

from dataclasses import dataclass
from html import escape
from math import sqrt
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CEO2_CONTCAR = Path(
    "/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/"
    "bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockB/B02_cellrelax2/CONTCAR"
)
CE2O3_CONTCAR = Path(
    "/Users/gradyclopton/ResearchData/bridges/ocean/projects/mat260002p/clopton/scratch/"
    "bdm_campaigns/CeO2_BDM_PBEU5/stage0/blockC/C05_Ce2O3_static550/CONTCAR"
)


COLORS = {
    "Ce": "#8f72d8",
    "Ce3": "#f1b43c",
    "O": "#df3f35",
    "vacancy": "#1b1b1f",
    "bond": "#484852",
    "arrow": "#186f83",
    "panel": "#f7f8fb",
    "ink": "#1b1b1f",
    "muted": "#6c6e78",
}


@dataclass
class Atom:
    species: str
    frac: tuple[float, float, float]


@dataclass
class Structure:
    title: str
    lattice: list[list[float]]
    atoms: list[Atom]
    source: Path


def parse_poscar(path: Path) -> Structure:
    lines = [line.strip() for line in path.read_text().splitlines() if line.strip()]
    title = lines[0]
    scale = float(lines[1])
    lattice = [[scale * float(x) for x in lines[i].split()[:3]] for i in range(2, 5)]
    species = lines[5].split()
    counts = [int(x) for x in lines[6].split()]
    coord_line = 7
    if lines[coord_line].lower().startswith("s"):
        coord_line += 1
    mode = lines[coord_line].lower()
    if not mode.startswith("d"):
        raise ValueError(f"{path} is not in Direct coordinates")
    start = coord_line + 1
    atoms: list[Atom] = []
    idx = start
    for sp, count in zip(species, counts):
        for _ in range(count):
            frac = tuple(float(x) % 1.0 for x in lines[idx].split()[:3])
            atoms.append(Atom(sp, frac))
            idx += 1
    return Structure(title, lattice, atoms, path)


def frac_to_cart(frac: tuple[float, float, float], lattice: list[list[float]]) -> tuple[float, float, float]:
    return tuple(sum(frac[j] * lattice[j][i] for j in range(3)) for i in range(3))


def add(a: tuple[float, float], b: tuple[float, float]) -> tuple[float, float]:
    return (a[0] + b[0], a[1] + b[1])


def sub(a: tuple[float, float], b: tuple[float, float]) -> tuple[float, float]:
    return (a[0] - b[0], a[1] - b[1])


def mul(a: tuple[float, float], s: float) -> tuple[float, float]:
    return (a[0] * s, a[1] * s)


def norm(a: tuple[float, float]) -> float:
    return sqrt(a[0] * a[0] + a[1] * a[1])


def unit(a: tuple[float, float]) -> tuple[float, float]:
    n = norm(a)
    return (0.0, 0.0) if n == 0 else (a[0] / n, a[1] / n)


def svg_header(width: int, height: int, title: str, source: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{escape(title)}">',
        f"  <title>{escape(title)}</title>",
        f"  <desc>Editable vector structure panel generated from {escape(source)}.</desc>",
        f"  <!-- source: {escape(source)} -->",
        "  <defs>",
        '    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">',
        f'      <path d="M0,0 L0,6 L7,3 z" fill="{COLORS["arrow"]}"/>',
        "    </marker>",
        '    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">',
        '      <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.18"/>',
        "    </filter>",
        "  </defs>",
    ]


def svg_footer() -> str:
    return "</svg>\n"


def text(x: float, y: float, value: str, size: int = 14, weight: int = 600, anchor: str = "middle", color: str | None = None) -> str:
    color = color or COLORS["ink"]
    return f'<text x="{x:.2f}" y="{y:.2f}" text-anchor="{anchor}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(value)}</text>'


def circle(cx: float, cy: float, r: float, fill: str, stroke: str = "#222", sw: float = 1.6, cls: str = "") -> str:
    cls_attr = f' class="{cls}"' if cls else ""
    return f'<circle{cls_attr} cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw:.2f}" filter="url(#softShadow)"/>'


def dashed_vacancy(cx: float, cy: float, r: float = 12.5) -> list[str]:
    return [
        f'<circle class="vacancy-marker" cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="none" stroke="{COLORS["vacancy"]}" stroke-width="2.2" stroke-dasharray="5 4"/>',
        f'<line x1="{cx-r*0.62:.2f}" y1="{cy-r*0.62:.2f}" x2="{cx+r*0.62:.2f}" y2="{cy+r*0.62:.2f}" stroke="{COLORS["vacancy"]}" stroke-width="1.8"/>',
        f'<line x1="{cx-r*0.62:.2f}" y1="{cy+r*0.62:.2f}" x2="{cx+r*0.62:.2f}" y2="{cy-r*0.62:.2f}" stroke="{COLORS["vacancy"]}" stroke-width="1.8"/>',
    ]


def ceo2_projected_atoms(struct: Structure, repeats: int = 3, slab_max_x: float = 0.36) -> list[dict]:
    atoms = []
    for ty in range(repeats):
        for tz in range(repeats):
            for atom in struct.atoms:
                x, y, z = atom.frac
                if x <= slab_max_x or x >= 1.0 - 1e-6:
                    atoms.append(
                        {
                            "species": atom.species,
                            "frac": (x, y + ty, z + tz),
                            "proj": (y + ty, z + tz),
                            "depth": x,
                        }
                    )
    return atoms


def map_points(points: list[tuple[float, float]], width: int, height: int, margin: int = 54):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    scale = min((width - 2 * margin) / max(maxx - minx, 1e-9), (height - 2 * margin) / max(maxy - miny, 1e-9))

    def transform(p: tuple[float, float]) -> tuple[float, float]:
        x = margin + (p[0] - minx) * scale
        y = height - margin - (p[1] - miny) * scale
        return x, y

    return transform


def ceo2_panel(filename: str, title: str, mode: str = "pristine") -> None:
    struct = parse_poscar(CEO2_CONTCAR)
    atoms = ceo2_projected_atoms(struct)
    # Choose the central oxygen site to mark/remove.
    oxygen_sites = [a for a in atoms if a["species"] == "O"]
    vacancy_atom = min(oxygen_sites, key=lambda a: (a["proj"][0] - 1.25) ** 2 + (a["proj"][1] - 1.25) ** 2)
    vacancy_proj = vacancy_atom["proj"]

    if mode in {"vacancy", "ce3"}:
        atoms = [a for a in atoms if a is not vacancy_atom]

    points = [a["proj"] for a in atoms] + [vacancy_proj]
    transform = map_points(points, 420, 420)
    vacancy_xy = transform(vacancy_proj)

    ce_atoms = [a for a in atoms if a["species"] == "Ce"]
    ce3 = sorted(ce_atoms, key=lambda a: (a["proj"][0] - vacancy_proj[0]) ** 2 + (a["proj"][1] - vacancy_proj[1]) ** 2)[:2]
    ce3_ids = {id(a) for a in ce3}

    out = svg_header(420, 420, title, str(CEO2_CONTCAR))
    out.append(f'  <rect width="420" height="420" rx="0" fill="{COLORS["panel"]}"/>')
    out.append(f'  <g id="lattice-guides" stroke="{COLORS["bond"]}" stroke-width="0.8" opacity="0.18">')
    for v in [0, 0.5, 1, 1.5, 2, 2.5]:
        x1, y1 = transform((v, 0))
        x2, y2 = transform((v, 2.5))
        x3, y3 = transform((0, v))
        x4, y4 = transform((2.5, v))
        out.append(f'    <line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}"/>')
        out.append(f'    <line x1="{x3:.2f}" y1="{y3:.2f}" x2="{x4:.2f}" y2="{y4:.2f}"/>')
    out.append("  </g>")
    out.append('  <g id="atoms">')
    for a in sorted(atoms, key=lambda item: (item["species"] != "O", item["depth"])):
        x, y = transform(a["proj"])
        if a["species"] == "Ce":
            fill = COLORS["Ce3"] if mode == "ce3" and id(a) in ce3_ids else COLORS["Ce"]
            out.append(circle(x, y, 12.8, fill, "#2e245d", 1.7, "atom Ce3" if fill == COLORS["Ce3"] else "atom Ce"))
        else:
            out.append(circle(x, y, 8.2, COLORS["O"], "#84251f", 1.2, "atom O"))
    out.append("  </g>")
    if mode in {"vacancy", "ce3"}:
        out.append('  <g id="vacancy">')
        out.extend("    " + e for e in dashed_vacancy(*vacancy_xy))
        out.append("  </g>")
    if mode == "ce3":
        out.append('  <g id="Ce3-labels">')
        for a in ce3:
            x, y = transform(a["proj"])
            out.append(text(x, y - 20, "Ce3+", 13, 700, "middle", "#7a4c00"))
            out.append(f'<line x1="{x:.2f}" y1="{y-15:.2f}" x2="{vacancy_xy[0]:.2f}" y2="{vacancy_xy[1]:.2f}" stroke="{COLORS["arrow"]}" stroke-width="1.6" stroke-dasharray="4 4"/>')
        out.append("  </g>")
    out.append(text(210, 32, title, 17, 700))
    out.append(svg_footer())
    (ROOT / filename).write_text("\n".join(out))


def ce2o3_panel(filename: str) -> None:
    struct = parse_poscar(CE2O3_CONTCAR)
    projected = []
    for tx in range(3):
        for tz in range(2):
            for atom in struct.atoms:
                cart = frac_to_cart((atom.frac[0] + tx, atom.frac[1], atom.frac[2] + tz), struct.lattice)
                # View roughly down crystallographic b, showing a-z layering.
                projected.append({"species": atom.species, "proj": (cart[0], cart[2]), "depth": cart[1]})
    transform = map_points([p["proj"] for p in projected], 520, 360, 58)
    out = svg_header(520, 360, "Ce2O3 reference", str(CE2O3_CONTCAR))
    out.append(f'  <rect width="520" height="360" fill="{COLORS["panel"]}"/>')
    out.append('  <g id="layer-guides" opacity="0.24">')
    for zlabel in sorted(set(round(p["proj"][1], 2) for p in projected)):
        pts = [p["proj"] for p in projected if round(p["proj"][1], 2) == zlabel]
        if len(pts) > 1:
            y = transform(pts[0])[1]
            out.append(f'    <line x1="42" y1="{y:.2f}" x2="478" y2="{y:.2f}" stroke="{COLORS["bond"]}" stroke-width="1"/>')
    out.append("  </g>")
    out.append('  <g id="atoms">')
    for a in sorted(projected, key=lambda p: p["depth"]):
        x, y = transform(a["proj"])
        if a["species"] == "Ce":
            out.append(circle(x, y, 13.0, COLORS["Ce3"], "#7a4c00", 1.7, "atom Ce3"))
        else:
            out.append(circle(x, y, 8.0, COLORS["O"], "#84251f", 1.2, "atom O"))
    out.append("  </g>")
    out.append(text(260, 32, "Ce2O3 reduced reference", 17, 700))
    out.append('  <g id="legend" transform="translate(168 326)">')
    out.append(circle(0, 0, 6.8, COLORS["Ce3"], "#7a4c00", 1.1))
    out.append(text(18, 5, "Ce3+", 12, 500, "start", COLORS["muted"]))
    out.append(circle(76, 0, 5.0, COLORS["O"], "#84251f", 1.0))
    out.append(text(90, 5, "O", 12, 500, "start", COLORS["muted"]))
    out.append("  </g>")
    out.append(svg_footer())
    (ROOT / filename).write_text("\n".join(out))


def bond_distortion_panel(filename: str) -> None:
    struct = parse_poscar(CEO2_CONTCAR)
    base_atoms = ceo2_projected_atoms(struct, repeats=2)
    oxy = [a for a in base_atoms if a["species"] == "O"]
    vacancy = min(oxy, key=lambda a: (a["proj"][0] - 0.75) ** 2 + (a["proj"][1] - 0.75) ** 2)
    base_atoms = [a for a in base_atoms if a is not vacancy]
    ce = [a for a in base_atoms if a["species"] == "Ce"]
    near_ce = sorted(ce, key=lambda a: (a["proj"][0] - vacancy["proj"][0]) ** 2 + (a["proj"][1] - vacancy["proj"][1]) ** 2)[:4]
    near_ids = {id(a) for a in near_ce}
    transform = map_points([a["proj"] for a in base_atoms] + [vacancy["proj"]], 210, 230, 38)
    variants = [("compressed", 0.18), ("unperturbed", 0.0), ("expanded", -0.18)]
    width, height = 720, 330
    out = svg_header(width, height, "Bond-distortion variants around an oxygen vacancy", str(CEO2_CONTCAR))
    out.append(f'  <rect width="{width}" height="{height}" fill="#ffffff"/>')
    for i, (label, shift) in enumerate(variants):
        ox = 20 + i * 235
        out.append(f'  <g id="variant-{label}" transform="translate({ox} 74)">')
        out.append(f'    <rect width="210" height="230" fill="{COLORS["panel"]}" stroke="#d5d7df" stroke-width="1.1"/>')
        vac_xy = transform(vacancy["proj"])
        out.append('    <g id="atoms">')
        for a in sorted(base_atoms, key=lambda item: item["species"] != "O"):
            xy = transform(a["proj"])
            if id(a) in near_ids:
                direction = unit(sub(xy, vac_xy))
                xy = add(xy, mul(direction, shift * 55))
            if a["species"] == "Ce":
                fill = COLORS["Ce3"] if id(a) in near_ids else COLORS["Ce"]
                out.append("    " + circle(xy[0], xy[1], 10.8, fill, "#2e245d" if fill == COLORS["Ce"] else "#7a4c00", 1.5))
            else:
                out.append("    " + circle(xy[0], xy[1], 6.8, COLORS["O"], "#84251f", 1.0))
        out.append("    </g>")
        out.extend("    " + e for e in dashed_vacancy(vac_xy[0], vac_xy[1], 10.0))
        if shift != 0:
            for a in near_ce:
                xy0 = transform(a["proj"])
                direction = unit(sub(xy0, vac_xy))
                xy1 = add(xy0, mul(direction, shift * 55))
                out.append(f'    <line x1="{xy0[0]:.2f}" y1="{xy0[1]:.2f}" x2="{xy1[0]:.2f}" y2="{xy1[1]:.2f}" stroke="{COLORS["arrow"]}" stroke-width="1.6" marker-end="url(#arrowhead)"/>')
        out.append(text(105, -22, label, 15, 700))
        out.append("  </g>")
    out.append(text(width / 2, 28, "Bond-distortion search motifs", 18, 700))
    out.append(text(width / 2, 320, "Schematic displacement variants built on the relaxed CeO2 fluorite slab", 12, 500, "middle", COLORS["muted"]))
    out.append(svg_footer())
    (ROOT / filename).write_text("\n".join(out))


def workflow_panel(filename: str) -> None:
    width, height = 1060, 310
    out = svg_header(width, height, "Figure N workflow schematic", "generated schematic")
    out.append(f'  <rect width="{width}" height="{height}" fill="#ffffff"/>')
    stages = [
        ("DFT+U branch control", "Bond-distortion search\\nlocalized Ce3+ checks"),
        ("Defect dataset", "VO, VCe, Oi, Cei\\nformation energies"),
        ("AIMD corpus", "stoichiometric + reduced\\nquench trajectories"),
        ("MLIP training", "redox-aware local\\ngeometry fingerprints"),
        ("SHI tracks", "threshold, morphology\\nannealing response"),
    ]
    box_w, box_h = 162, 118
    y = 92
    for i, (head, body) in enumerate(stages):
        x = 42 + i * 202
        out.append(f'  <g id="stage-{i+1}">')
        out.append(f'    <rect x="{x}" y="{y}" width="{box_w}" height="{box_h}" rx="4" fill="{COLORS["panel"]}" stroke="#cfd2dc" stroke-width="1.3"/>')
        out.append(text(x + box_w / 2, y + 28, head, 14, 700))
        for j, line in enumerate(body.split("\\n")):
            out.append(text(x + box_w / 2, y + 62 + j * 18, line, 12, 500, "middle", COLORS["muted"]))
        out.append("  </g>")
        if i < len(stages) - 1:
            x1 = x + box_w + 12
            x2 = x + 202 - 16
            out.append(f'  <line x1="{x1}" y1="{y + box_h/2}" x2="{x2}" y2="{y + box_h/2}" stroke="{COLORS["arrow"]}" stroke-width="3" marker-end="url(#arrowhead)"/>')
    out.append(text(width / 2, 42, "Figure N: Redox-aware MLIP workflow for SHI tracks", 20, 700))
    out.append(text(width / 2, 260, "Structure panels can be placed above or beside this workflow in Illustrator/Overleaf.", 13, 500, "middle", COLORS["muted"]))
    out.append(svg_footer())
    (ROOT / filename).write_text("\n".join(out))


def readme() -> None:
    content = f"""# Figure N SVG Assets

Generated vector assets for the ACCESS proposal Figure N.

## Source Structures

- `01_pristine_ceo2_slab.svg`: relaxed fluorite CeO2 from `{CEO2_CONTCAR}`
- `02_oxygen_vacancy_ceo2x_slab.svg`: same CeO2 slab with one schematic oxygen vacancy marker
- `03_vo_ce3_localized_slab.svg`: same vacancy slab with two nearest Ce sites highlighted as schematic Ce3+
- `04_bond_distortion_variants.svg`: schematic compressed/unperturbed/expanded distortion motifs built on the relaxed CeO2 slab
- `05_ce2o3_reference_slab.svg`: Ce2O3 endpoint from `{CE2O3_CONTCAR}`
- `06_figure_n_workflow.svg`: editable workflow schematic

The defect/vacancy panels are schematic overlays because the later BDM defect pools are not yet present in the campaign tree. The bulk CeO2 and Ce2O3 coordinates come from completed Stage 0 calculations.

All SVGs use named groups for Illustrator editing.
"""
    (ROOT / "README.md").write_text(content)


def main() -> None:
    ceo2_panel("01_pristine_ceo2_slab.svg", "Pristine fluorite CeO2", "pristine")
    ceo2_panel("02_oxygen_vacancy_ceo2x_slab.svg", "Oxygen-vacancy CeO2-x", "vacancy")
    ceo2_panel("03_vo_ce3_localized_slab.svg", "VO with localized Ce3+", "ce3")
    bond_distortion_panel("04_bond_distortion_variants.svg")
    ce2o3_panel("05_ce2o3_reference_slab.svg")
    workflow_panel("06_figure_n_workflow.svg")
    readme()


if __name__ == "__main__":
    main()
