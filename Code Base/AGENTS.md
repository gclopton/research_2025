# AGENTS.md — `/Code Base` (vendored cluster snapshots)

This directory is a **local mirror of code that lives on supercomputer clusters**. Treat it as a *read-only snapshot* used for inspection/debugging of tooling (e.g., understanding `vo` behavior), not as a source of truth.

## Non-negotiable rules

1) **Do not push or PR anything from `/Code Base` to any Git repository.**
   - Do not commit changes under `/Code Base` to the vault repo.
   - Do not push changes from this directory to any upstream repo (including `cluster_utilities`), regardless of which GitHub account is active.

2) **No nested Git repositories inside the vault.**
   - `/Code Base/**` must not contain a `.git/` directory and must not be added as a submodule.

3) **Source of truth is the clusters.**
   - If you need to change the code, make the change on the cluster(s) first, validate it there, then refresh this snapshot from the cluster-approved upstream.

## How to update the local snapshot safely

Preferred workflow (replace-in-place; keeps this directory “plain files”):

1) Clone the upstream snapshot repo to a temporary directory.
2) Delete the clone’s `.git/` directory.
3) Replace the corresponding folder under `/Code Base` with the clone contents.

Example (for `cluster_utilities`):

```bash
set -euo pipefail
CODEBASE="/Users/gradyclopton/ObsidianVaults/vasp/Code Base"
UPSTREAM="https://github.com/gclopton-at-illinois/cluster_utilities"
TMPDIR="$(mktemp -d)"

git clone --depth 1 "$UPSTREAM" "$TMPDIR/cluster_utilities"
rm -rf "$TMPDIR/cluster_utilities/.git"
rm -rf "$CODEBASE/cluster_utilities"
mv "$TMPDIR/cluster_utilities" "$CODEBASE/cluster_utilities"
```

After updating, you may inspect the code and report findings, but **do not commit/push** the snapshot changes.



| ENCUT (eV) | noU steps | Last \|dE\| (eV) | Last RMS | Mean s/iter |
| ---------: | --------: | ---------------: | -------: | ----------: |
|        450 |       128 |           0.0388 |   0.0588 |       224.7 |
|        500 |       109 |           0.5250 |   0.4080 |       262.6 |
|        550 |        83 |           0.0473 |   0.0922 |       345.4 |
|        600 |        68 |           2.5750 |   1.0900 |       420.0 |
|        650 |        57 |          16.2430 |   1.2500 |       501.3 |
