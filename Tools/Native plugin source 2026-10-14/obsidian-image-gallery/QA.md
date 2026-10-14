# Validation — Image Gallery 0.1.0 / Slide Studio 0.3.0

Verified on the secondary M1 Mac in Obsidian 1.13.7, exclusively in the copied Image Gallery Lab vault. Blue Topaz and the copied lab snippets remained enabled. The production Slide Studio checkout is unchanged at 4a2a00d9be310c1315773d706e4af95953e2e494. No production fluid_dynamics files or sync configuration were touched.

Both TypeScript builds pass. All 9 Image Gallery tests and all 22 Slide Studio tests pass. These cover lossless per-embed changes, titles and nested callouts, repeated attachments, stale-state rejection, code/comments/frontmatter exclusions, encoded paths, gallery cancellation/optional fallback, image geometry, older document formats, and concurrent-write protection.

Native Obsidian testing replaced the Markdown image inside a two-level callout using a thumbnail filtered by an opaque pasted filename. A direct before/after file comparison confirmed that only its destination changed: title, caption, quote prefixes and other references stayed identical. Alignment/width controls were exercised, a 180-pixel width entered, and natural-size reset executed from the nested figure in Live Preview. Replacing the second of two same-line wiki embeds in Reading view changed only that occurrence. The insert command and undo worked; another insertion on a blank quoted line remained inside its callout with the following caption unchanged. SHA256 checks confirmed that the two fixture image files were never altered.

A Blue Topaz image-active zoom rule moved the image between mouse-down and context-menu delivery. The plugin now retains the exact right-button-down image briefly at the same pointer coordinates, and captures the context menu before callout handlers. The repaired Reading-view and nested Live Preview menus were exercised successfully. Temporary diagnostic logging was removed before the final builds.

Slide Studio's native gallery opened in the existing slide-image directory, then successfully browsed All vault images. Replacement was compared against the saved original slide and changed exactly the image path: block identity, x=360, y=304, w=808, h=456, other blocks and theme stayed intact. Numeric width=200 yielded height=300 for a 240×360 image; natural-size reset restored 240×360. Reload preserved the saved state. With Image Gallery disabled, a real filename-picker selection added an image; cancellation no longer wins the close/selection race. Gallery was re-enabled afterward. The optional API also has cancellation and absent/incompatible-version tests.

UIUC orange titles were visually inspected in dark preview, full-screen playback, native inline editing, and light preview. More actions showed the relocated document commands. The original four-slide BDM presentation loaded all four linked slides. Image-only inspector controls omit font and text-color inputs. The shared title rules apply to print media and the stylesheet requests exact printed colors; there is no Slide Studio PDF/export feature and no end-to-end PDF export is claimed.

Compatibility boundaries: reference-style Markdown images and raw HTML embeds are not rewritten. Ambiguous Live Preview widget mappings fail closed with a Reading-view suggestion; repeated same-line images are verified in Reading view. Tests are not a claim of compatibility with every third-party theme or every Obsidian version. The supplied lab retains the test results and original fixtures are saved alongside it for comparison.

## 0.2.0 gallery verification — 2026-10-07

Observed in Obsidian 1.14.4 in code_links_lab: an unfinished wiki link seeded search; choosing the result replaced the bracket pair while preserving surrounding text. Editor context menu exposed all three gallery actions. A real screening-energy PDF rendered to a scrollable card. Python and Wolfram source previews rendered with distinct token colors and language labels. Code from the configured ceria root was previewed and inserted.

Observed in Slide Studio's native editor: right-click inside a link opened the gallery; selection saved `Keep this text. [[Gallery check.md]]` in its original block. A second Code Links selection saved the exact classifier target in that same block. Inspected the serialized Markdown file afterward.

Observed in the docs vault: the slide image gallery found 282 images across nested directories; selecting Assets reduced the list to 131, including nested presentation and operations folders. An image inserted and saved as a slide image block; Undo removed that test block. The slide canvas menu exposed file/code galleries. The final source selector listed the configured roots and independently indexed 14 ShakeNBreak source files, without the shared Code Links index's global 50,000-file cap.

Build and focused tests: Image Gallery 19 passed; Slide Studio 25 passed. Binary Blender scenes explicitly report no inline preview. Native note autocomplete is retained; the new gallery does not replace or register an editor suggester.

Favorites: saved the polaron figures folder from the docs slide image gallery, verified the settings JSON, closed and reopened the gallery, and recalled the folder with all 65 nested images. Saved the `snb` linked root from the code gallery and verified its separate root/empty-subfolder record. Both favorites appeared in the same file-gallery menu.

### 2026-10-07: nav shared aliases

Version 0.2.1 reads the same Code Links roots API, now backed by nav. Compatibility and retired names are omitted from new selections; saved links and favorites can still select those names. The lab gallery showed all 19 current shared aliases, including nav, nvim and code-links. Both lab and docs plugins are enabled after reload. All 19 gallery tests and the build pass.

## 0.3.0 folder navigation — 2026-10-07

In Obsidian 1.14.4, verified the shared folder browser in the lab file gallery: selected `demo`, disabled Include subfolders, and obtained exactly the three direct files. Inserted `{{demo/helper.js}}`, inspected the saved note, and undid the test insertion. Selected the external `code-links` alias, navigated to `core`, and obtained its one Python file with a syntax-highlighted preview and Load more code. The alias initially listed direct files only.

In the lab image gallery, selected `gallery-fixtures/assets` and saw the nested K-point image with Include subfolders enabled. In the docs vault's Slide Studio, reloaded Image Gallery, recalled the saved polaron figures folder, used Browse folders to enter Section 1, and visually verified its six images. Cancelled without inserting an image. Folder breadcrumbs and Up navigation were available.

All five existing installations (lab, fluid_dynamics, papers_2025, research_2025, docs) have matching main.js, styles.css and manifest.json and remain enabled. Lab and docs runtimes were reloaded; the other vaults load the new bundle when reopened. The 21 gallery tests, production build, and diff whitespace check passed. This verifies the bounded navigation paths above, not every directory size or filesystem latency.
