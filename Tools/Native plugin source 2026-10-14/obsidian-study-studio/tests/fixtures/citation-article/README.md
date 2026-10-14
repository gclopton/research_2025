# Article citation cleanup fixture

This is a synthetic scientific article, not a published paper or research result. It combines analytic planar flow, numerical convergence, equations, two generated figures, captions, a Markdown data table, a merged HTML header table, references, and repeated wording.

`converted.md` simulates extraction artifacts. `cleaned.md` repairs formatting, moves a figure, inserts a new table before the originals, and reformats the numeric table without changing its values. `changed-content.md` additionally removes a negation, changes a table value by a factor of ten, and repeats a figure. The original saved selections are in `records.json`.

In Obsidian, the original and cleaned versions match selections 1–14 and 16–19. Selection 15 is intentionally ambiguous. The changed-content version flags 13, 15, 16, and 18; the remaining selections still match. Table 18 uses a newly captured rendered fingerprint; table 19 exercises legacy raw-hash relocation. Old table records without fingerprints can survive relocation but may require review after source reformatting.

Generate baseline/cleaned Markdown, figures, and data with `python scripts/citation-article-fixture.py` in an environment with NumPy and Matplotlib. The changed-content variant is a checked-in adversarial fixture. Native verification copies fixtures only into study_studio_lab, with images in `Citation article assets` and a record pointing at `Citation article simulation.md`. Automated tests use the repository fixtures and do not modify a vault.

The lab currently contains the changed-content example and an exported review report, so all four expected problems can be inspected. Reports describe one source at a time. Their saved hashes identify the reviewed version; check them before using line locations after subsequent edits. Candidate passages are unverified search suggestions, never automatic repairs.
