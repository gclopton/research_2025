from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


OUT = Path("/Users/gradyclopton/ObsidianVaults/research_2025/images")
OUT.mkdir(parents=True, exist_ok=True)


e_min = 0.02
amp = 2.5
e_peak = 3.0
width = 0.75
base = 0.08
e0_min = 0.4
e0_max = 8.0


def s_e(energy):
    return base + amp * np.exp(-((energy - e_peak) / width) ** 2)


def energy_at_fraction(u, e0):
    return e0 - u * (e0 - e_min)


def bragg_energy(e0):
    return np.minimum(e0, e_peak)


def bragg_fraction(e0):
    denom = np.maximum(e0 - e_min, np.finfo(float).eps)
    return np.where(e0 <= e_peak, 0.0, (e0 - e_peak) / denom)


u = np.linspace(0.0, 1.0, 180)
e0 = np.linspace(e0_min, e0_max, 220)
U, E0 = np.meshgrid(u, e0)
E = energy_at_fraction(U, E0)
SE = s_e(E)

ridge_e0 = np.linspace(e0_min, e0_max, 500)
ridge_u = bragg_fraction(ridge_e0)
ridge_se = s_e(bragg_energy(ridge_e0))

plt.rcParams.update(
    {
        "figure.dpi": 180,
        "font.size": 10,
        "axes.labelsize": 10,
        "axes.titlesize": 12,
        "axes.linewidth": 0.8,
    }
)

fig = plt.figure(figsize=(12.6, 5.8), constrained_layout=True)
gs = fig.add_gridspec(1, 2, width_ratios=[1.25, 1.0], wspace=0.20)

ax = fig.add_subplot(gs[0, 0], projection="3d")
surface = ax.plot_surface(
    U,
    E0,
    SE,
    cmap="turbo",
    linewidth=0.0,
    antialiased=True,
    alpha=0.92,
    rstride=2,
    cstride=2,
)
ax.plot(
    ridge_u,
    ridge_e0,
    ridge_se,
    color="black",
    linewidth=3.0,
    label="Bragg ridge",
)
ax.set_xlabel(r"fractional depth $u$", labelpad=8)
ax.set_ylabel(r"initial energy $E_0$", labelpad=8)
ax.set_zlabel(r"$S_e(u;E_0)$", labelpad=8)
ax.set_title("Normalized-depth Bragg surface")
ax.view_init(elev=28, azim=-58)
ax.set_box_aspect((1.25, 1.75, 0.75))
ax.legend(loc="upper left", frameon=False)

cbar = fig.colorbar(surface, ax=ax, shrink=0.72, pad=0.08)
cbar.set_label(r"$S_e(u;E_0)$")

ax2 = fig.add_subplot(gs[0, 1])
levels = np.linspace(SE.min(), SE.max(), 26)
contour = ax2.contourf(U, E0, SE, levels=levels, cmap="turbo")
ax2.contour(U, E0, SE, levels=levels[::3], colors="white", linewidths=0.45, alpha=0.65)
ax2.plot(ridge_u, ridge_e0, color="black", linewidth=2.6)
ax2.set_xlabel(r"fractional depth $u=z/R_{\rm CSDA}(E_0)$")
ax2.set_ylabel(r"initial energy $E_0$")
ax2.set_title("Top-down ridge check")
ax2.set_xlim(0.0, 1.0)
ax2.set_ylim(e0_min, e0_max)
ax2.grid(color="black", alpha=0.15, linewidth=0.5)
fig.colorbar(contour, ax=ax2, shrink=0.82, label=r"$S_e(u;E_0)$")

fig.suptitle(
    "Pulling an electronic stopping peak back into normalized depth",
    fontsize=14,
)
fig.savefig(OUT / "problem3b-normalized-bragg-surface-python.png", bbox_inches="tight")
plt.close(fig)

print(OUT / "problem3b-normalized-bragg-surface-python.png")
