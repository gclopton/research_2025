

I need you to populate one of my paper-index folders in the same style as this example:

/Users/gradyclopton/ObsidianVaults/research_2025/Papers/Computational Architecture

Please use that folder as the model for naming, folder structure, and general organization.

Your task is:

1. Read this index file carefully:
/Users/gradyclopton/ObsidianVaults/research_2025/Papers/Ceria Radiation Chemistry and Hypothesis Anchors/Paper Index (Ceria Radiation Chemistry & Hypothesis Anchors).md

2. For each section/subsection in the index that is meant to correspond to a paper group, create a folder with the same section name if it does not already exist.

3. Inside each such section folder, create a `pdfs` folder if it does not already exist.

4. Then go through the paper entries in the index and try to find the original PDF for each paper online.

5. If you can download the paper directly:
- Download the PDF.
- Verify that it is the exact intended paper by checking the title/authors on the PDF itself.
- Move it into the correct section’s `pdfs` folder.
- Rename it in the same style used in the Computational Architecture example:
  `Author et al YEAR - Full Title.pdf`
  or
  `Author and Author YEAR - Full Title.pdf`
  depending on the paper.

6. If the file you downloaded is NOT actually the intended paper:
- Do NOT force it into that slot.
- Do NOT mislabel it.
- If it is a real paper but belongs somewhere else, rename it to its true title only if that is useful.
- Otherwise leave the intended paper as still missing.

7. If you cannot download the PDF because of a paywall, browser gate, library access issue, or redirect problem:
- Do NOT create a fake or empty file.
- Instead, give me:
  - the exact paper title,
  - DOI if available,
  - and the best web landing page link for me to click in the browser.
- I will download those manually into:
  `/Users/gradyclopton/Downloads/papers_mar_2026`
- After that, I may ask you to verify and move them to its proper pdfs folder.

8. Preserve any existing notes or index files already in the folder.
- Do NOT overwrite unrelated markdown files.
- Only add the section folders and the `pdfs` folders, and place verified PDFs there.

9. At the end, report:
- which papers were successfully downloaded and where you placed them,
- which papers are still missing,
- and the web links for the missing ones.

Important rules:
- Verify titles against the PDF itself before renaming/moving.
- Do not invent citations or filenames.
- Do not treat HTML pages or access-denied pages as PDFs.
- Do not use Git LFS or anything similar.
- Keep the structure consistent with the Computational Architecture example folder.

Please work carefully and prefer correctness over speed.
