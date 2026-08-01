#!/usr/bin/env python3
"""Generate editable SVG assets for Figure N.

The assets are schematic 2D structure diagrams built from projected fluorite-like
motifs. They are intended for Illustrator editing: every atom, bond, vacancy
marker, arrow, panel box, and text label is a normal SVG vector object.
"""

from __future__ import annotations

from pathlib import Path
import math
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "editable-svg"

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)

COLORS = {
    "ce4": "#dca93a",
    "ce4_stroke": "#8f6620",
    "ce3": "#5c86bf",
    "ce3_stroke": "#2e578d",
    "o": "#d9443e",
    "o_stroke": "#9d2422",
    "bond": "#4e91b5",
    "blue": "#4b80bd",
    "blue_dark": "#164b78",
    "panel_fill": "#f8fbff",
    "pill": "#dfeaf5",
    "track_fill": "#edf5fb",
    "gray": "#606060",
}


def svg_root(width: int, height: int, viewbox: str | None = None) -> ET.Element:
    root = ET.Element(
        f"{{{NS}}}svg",
        {
            "width": str(width),
            "height": str(height),
            "viewBox": viewbox or f"0 0 {width} {height}",
            "version": "1.1",
        },
    )
    defs = ET.SubElement(root, "defs")
    ET.SubElement(
        defs,
        "marker",
        {
            "id": "arrow-blue",
            "viewBox": "0 0 10 10",
            "refX": "8",
            "refY": "5",
            "markerWidth": "8",
            "markerHeight": "8",
            "orient": "auto-start-reverse",
        },
    ).append(ET.Element("path", {"d": "M 0 0 L 10 5 L 0 10 z", "fill": COLORS["blue"]}))
    grad = ET.SubElement(defs, "linearGradient", {"id": "track-grad", "x1": "0", "x2": "1", "y1": "0", "y2": "0"})
    for off, color, op in [
        ("0%", "#fff1c9", "0"),
        ("38%", "#f7c24b", "0.65"),
        ("50%", "#e65335", "0.95"),
        ("62%", "#f7c24b", "0.65"),
        ("100%", "#fff1c9", "0"),
    ]:
        ET.SubElement(grad, "stop", {"offset": off, "stop-color": color, "stop-opacity": op})
    return root


def add(parent: ET.Element, tag: str, **attrs: object) -> ET.Element:
    clean = {k.replace("_", "-"): str(v) for k, v in attrs.items() if v is not None}
    return ET.SubElement(parent, tag, clean)


def text(parent: ET.Element, x: float, y: float, value: str, size: int = 24, weight: str = "400",
         fill: str = "#333333", anchor: str = "start", style: str | None = None) -> ET.Element:
    e = add(
        parent,
        "text",
        x=f"{x:.1f}",
        y=f"{y:.1f}",
        font_family="Arial, Helvetica, sans-serif",
        font_size=size,
        font_weight=weight,
        fill=fill,
        text_anchor=anchor,
    )
    if style:
        e.set("style", style)
    e.text = value
    return e


def group(parent: ET.Element, transform: str | None = None, cls: str | None = None) -> ET.Element:
    attrs = {}
    if transform:
        attrs["transform"] = transform
    if cls:
        attrs["class"] = cls
    return add(parent, "g", **attrs)


def circle(parent: ET.Element, x: float, y: float, r: float, fill: str, stroke: str, sw: float = 2.0,
           opacity: float = 1.0, extra: dict[str, object] | None = None) -> ET.Element:
    attrs: dict[str, object] = {
        "cx": f"{x:.2f}",
        "cy": f"{y:.2f}",
        "r": f"{r:.2f}",
        "fill": fill,
        "stroke": stroke,
        "stroke_width": sw,
        "opacity": opacity,
    }
    if extra:
        attrs.update(extra)
    return add(parent, "circle", **attrs)


def line(parent: ET.Element, x1: float, y1: float, x2: float, y2: float, color: str,
         width: float = 3.0, dash: str | None = None, marker: bool = False, opacity: float = 1.0) -> ET.Element:
    return add(
        parent,
        "line",
        x1=f"{x1:.2f}",
        y1=f"{y1:.2f}",
        x2=f"{x2:.2f}",
        y2=f"{y2:.2f}",
        stroke=color,
        stroke_width=width,
        stroke_linecap="round",
        stroke_dasharray=dash,
        marker_end="url(#arrow-blue)" if marker else None,
        opacity=opacity,
    )


def path(parent: ET.Element, d: str, color: str, width: float = 3.0, fill: str = "none",
         dash: str | None = None, marker: bool = False, opacity: float = 1.0) -> ET.Element:
    return add(
        parent,
        "path",
        d=d,
        fill=fill,
        stroke=color,
        stroke_width=width,
        stroke_linecap="round",
        stroke_linejoin="round",
        stroke_dasharray=dash,
        marker_end="url(#arrow-blue)" if marker else None,
        opacity=opacity,
    )


def rounded_rect(parent: ET.Element, x: float, y: float, w: float, h: float, fill: str,
                 stroke: str = "none", sw: float = 2.0, r: float = 12, dash: str | None = None,
                 opacity: float = 1.0) -> ET.Element:
    return add(
        parent,
        "rect",
        x=x,
        y=y,
        width=w,
        height=h,
        rx=r,
        ry=r,
        fill=fill,
        stroke=stroke,
        stroke_width=sw,
        stroke_dasharray=dash,
        opacity=opacity,
    )


def fluorite_motif(parent: ET.Element, x: float, y: float, scale: float = 1.0, rows: int = 3,
                   cols: int = 3, vacancy: tuple[int, int] | None = None,
                   ce3: set[tuple[int, int]] | None = None, dashed_sites: list[tuple[float, float]] | None = None,
                   distort: float = 0.0, draw_bonds: bool = True, light: bool = False) -> ET.Element:
    ce3 = ce3 or set()
    dashed_sites = dashed_sites or []
    g = group(parent, f"translate({x:.1f},{y:.1f}) scale({scale:.4f})")
    dx, dy = 56, 48
    ce_positions: dict[tuple[int, int], tuple[float, float]] = {}
    o_positions: dict[tuple[int, int], tuple[float, float]] = {}

    for j in range(rows):
        for i in range(cols):
            px = i * dx + (j % 2) * dx * 0.5
            py = j * dy
            if (i, j) in ce3:
                vx = px - (cols - 1) * dx / 2
                vy = py - (rows - 1) * dy / 2
                length = math.hypot(vx, vy) or 1
                px += distort * 10 * vx / length
                py += distort * 10 * vy / length
            ce_positions[(i, j)] = (px, py)
            ox = px + dx * 0.45
            oy = py + dy * 0.42
            o_positions[(i, j)] = (ox, oy)

    if draw_bonds:
        for key, (ox, oy) in o_positions.items():
            if vacancy == key:
                continue
            i, j = key
            neighbors = [key, (i + 1, j), (i, j + 1)]
            for nb in neighbors:
                if nb in ce_positions:
                    cx, cy = ce_positions[nb]
                    line(g, cx, cy, ox, oy, COLORS["bond"], 3.2, opacity=0.85)

    for key, (ox, oy) in o_positions.items():
        if vacancy == key:
            circle(g, ox, oy, 12, "#ffffff", "#6f6f6f", 2.2, extra={"stroke_dasharray": "6 5"})
        else:
            circle(g, ox, oy, 9.0, COLORS["o"], COLORS["o_stroke"], 2.0, opacity=0.88 if light else 1)

    for key, (cx, cy) in ce_positions.items():
        if key in ce3:
            circle(g, cx, cy, 17.5, COLORS["ce3"], COLORS["ce3_stroke"], 2.2)
        else:
            circle(g, cx, cy, 16.0, COLORS["ce4"], COLORS["ce4_stroke"], 2.2, opacity=0.9 if light else 1)

    for sx, sy in dashed_sites:
        circle(g, sx, sy, 12, "#ffffff", "#6f6f6f", 2.0, extra={"stroke_dasharray": "6 5"})
    return g


def title_pill(parent: ET.Element, panel: str, label: str, x: float, y: float, w: float) -> None:
    text(parent, x, y + 39, panel, 30, "700", "#202020")
    rounded_rect(parent, x + 62, y + 8, w, 48, COLORS["pill"], "none", r=22)
    text(parent, x + 90, y + 42, label, 28, "700", COLORS["blue_dark"])


def panel_box(parent: ET.Element, x: float, y: float, w: float, h: float) -> ET.Element:
    rounded_rect(parent, x, y, w, h, "#ffffff", COLORS["blue"], 2.3, r=14, dash="10 8")
    return group(parent, f"translate({x:.1f},{y:.1f})")


def draw_panel_a(parent: ET.Element) -> None:
    p = panel_box(parent, 24, 24, 620, 830)
    title_pill(p, "(a)", "Branch-verified defect dataset", 22, 24, 430)
    text(p, 34, 130, "bond-distortion search", 24, fill="#575757")
    for k, yy in enumerate([190, 360, 530]):
        fluorite_motif(p, 88, yy, scale=0.72, rows=3, cols=3, vacancy=(1, 1), dashed_sites=[(76, 66)], distort=[-0.7, 0, 0.7][k])
        path(p, f"M 260 {yy + 50} C 310 {yy + 65}, 320 {yy + 98}, 350 {yy + 117}", COLORS["blue"], 3.2, marker=True)
    fluorite_motif(p, 368, 300, scale=1.08, rows=3, cols=3, vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.25)
    text(p, 336, 610, "verified ground state", 26, fill="#202020")
    text(p, 352, 650, "(Ce3+ fingerprint)", 24, fill=COLORS["blue_dark"])
    legend(p, 62, 765)


def legend(parent: ET.Element, x: float, y: float) -> None:
    circle(parent, x, y, 15, COLORS["ce4"], COLORS["ce4_stroke"], 2)
    text(parent, x + 28, y + 8, "Ce4+", 24)
    circle(parent, x + 135, y, 15, COLORS["ce3"], COLORS["ce3_stroke"], 2)
    text(parent, x + 163, y + 8, "Ce3+", 24)
    circle(parent, x + 285, y, 10, COLORS["o"], COLORS["o_stroke"], 2)
    text(parent, x + 309, y + 8, "O", 24)
    circle(parent, x + 408, y, 12, "#ffffff", "#6f6f6f", 2, extra={"stroke_dasharray": "6 5"})
    text(parent, x + 435, y + 8, "VO", 24)


def draw_panel_b(parent: ET.Element) -> None:
    p = panel_box(parent, 724, 24, 460, 830)
    title_pill(p, "(b)", "Redox-aware MLIP", 26, 24, 330)
    text(p, 38, 130, "training corpus", 24, fill="#575757")
    line(p, 46, 190, 46, 690, COLORS["gray"], 2.4, marker=True)
    text(p, 22, 520, "increasing reduction", 22, fill="#575757", anchor="middle",
         style="writing-mode: tb; glyph-orientation-vertical: 0;")
    fluorite_motif(p, 86, 180, scale=0.70, rows=3, cols=3)
    text(p, 286, 265, "CeO2", 26)
    fluorite_motif(p, 86, 375, scale=0.70, rows=3, cols=3, vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.2)
    text(p, 286, 462, "CeO2-x", 26)
    ce2o3_icon(p, 90, 598, 0.92)
    text(p, 286, 645, "Ce2O3", 26)
    text(p, 32, 718, "DFT labels", 20, fill="#575757")
    line(p, 165, 700, 165, 748, COLORS["blue"], 2.6, marker=True)
    rounded_rect(p, 110, 748, 240, 82, "#e7f1ff", COLORS["blue"], 2.0, r=10)
    text(p, 230, 780, "train Allegro", 24, "700", COLORS["blue_dark"], "middle")
    text(p, 230, 812, "MLIP", 24, "700", COLORS["blue_dark"], "middle")
    line(p, 332, 748, 332, 704, COLORS["blue"], 2.6, marker=True)
    text(p, 350, 724, "new configs", 18, fill="#575757")


def ce2o3_icon(parent: ET.Element, x: float, y: float, scale: float = 1.0) -> None:
    g = group(parent, f"translate({x},{y}) scale({scale})")
    for row, yy in enumerate([0, 42, 84]):
        for i, xx in enumerate([0, 42, 84, 126]):
            if row != 1:
                circle(g, xx, yy, 8, COLORS["o"], COLORS["o_stroke"], 1.8)
            else:
                circle(g, xx, yy, 12, COLORS["ce3"], COLORS["ce3_stroke"], 2)


def draw_panel_c(parent: ET.Element) -> None:
    p = panel_box(parent, 1264, 24, 630, 830)
    title_pill(p, "(c)", "Track simulations", 26, 24, 330)
    text(p, 300, 130, "increasing pre-reduction", 22, fill="#575757", anchor="middle")
    line(p, 96, 152, 540, 152, COLORS["gray"], 2.8, marker=True)
    for x, label, ntracks in [(70, "CeO2", 1), (265, "CeO2-x", 1), (460, "pre-damaged", 3)]:
        text(p, x + 78, 205, label, 26, anchor="middle")
        rounded_rect(p, x, 235, 160, 380, COLORS["track_fill"], "#adc1d5", 2.0, r=10)
        offsets = [80] if ntracks == 1 else [48, 80, 112]
        for ox in offsets:
            add(p, "rect", x=x + ox - 13, y=255, width=26, height=330, rx=13, fill="url(#track-grad)", stroke="none")
    rounded_rect(p, 170, 640, 340, 170, "#ffffff", "#333333", 2.2, r=12)
    line(p, 345, 520, 235, 640, "#555555", 1.8, dash="5 5")
    line(p, 345, 520, 445, 640, "#555555", 1.8, dash="5 5")
    add(p, "rect", x=326, y=505, width=38, height=44, fill="none", stroke="#333333", stroke_width=2.5)
    fluorite_motif(p, 188, 684, scale=0.80, rows=3, cols=3, vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.25)
    text(p, 430, 725, "Ce3+", 26, "700", COLORS["blue_dark"])
    text(p, 430, 763, "fingerprint in", 20, fill="#575757")
    text(p, 430, 790, "quenched track", 20, fill="#575757")


def draw_inter_panel_arrows(parent: ET.Element) -> None:
    line(parent, 653, 445, 710, 445, COLORS["blue"], 5.5, marker=True)
    line(parent, 1194, 445, 1250, 445, COLORS["blue"], 5.5, marker=True)


def write_full_figure() -> None:
    root = svg_root(1920, 880)
    add(root, "rect", x=0, y=0, width=1920, height=880, fill="#ffffff")
    draw_panel_a(root)
    draw_inter_panel_arrows(root)
    draw_panel_b(root)
    draw_panel_c(root)
    ET.ElementTree(root).write(OUT / "figure_n_full_editable.svg", encoding="utf-8", xml_declaration=True)


def write_structure_asset(name: str, **kwargs: object) -> None:
    root = svg_root(360, 310)
    add(root, "rect", x=0, y=0, width=360, height=310, fill="#ffffff")
    fluorite_motif(root, 60, 55, scale=1.25, rows=3, cols=3, **kwargs)
    ET.ElementTree(root).write(OUT / name, encoding="utf-8", xml_declaration=True)


def write_readme() -> None:
    content = """# Figure N Editable SVG Assets

These are Illustrator-editable SVGs for the proposal figure. They are schematic
2D motif diagrams, not VESTA raster screenshots. Every atom, bond, vacancy
marker, arrow, label, and panel outline is an editable SVG element.

Files:

- `figure_n_full_editable.svg` — full three-panel figure draft.
- `pristine_ceo2_patch.svg` — flat CeO2 motif.
- `oxygen_vacancy_patch.svg` — CeO2-x motif with one dashed vacancy site.
- `ce3_fingerprint_patch.svg` — CeO2-x motif with two Ce3+ sites.
- `bond_distortion_compressed.svg`
- `bond_distortion_unperturbed.svg`
- `bond_distortion_expanded.svg`
"""
    (OUT / "README.md").write_text(content)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_full_figure()
    write_structure_asset("pristine_ceo2_patch.svg")
    write_structure_asset("oxygen_vacancy_patch.svg", vacancy=(1, 1))
    write_structure_asset("ce3_fingerprint_patch.svg", vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.25)
    write_structure_asset("bond_distortion_compressed.svg", vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=-0.6)
    write_structure_asset("bond_distortion_unperturbed.svg", vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.0)
    write_structure_asset("bond_distortion_expanded.svg", vacancy=(1, 1), ce3={(1, 1), (2, 1)}, distort=0.6)
    write_readme()


if __name__ == "__main__":
    main()
