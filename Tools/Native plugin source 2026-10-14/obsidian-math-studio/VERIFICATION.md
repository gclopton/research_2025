# Verification record

2026-09-28: Created the specification, tracked synthetic fixture corpus and isolated lab initialization script. Plugin implementation has not started. All engine compatibility, host editing, rendering, palette, numbering, theme, popout and Slide Studio checks remain pending.

The lab initializer refuses to overwrite any existing fixture. Research vaults and the Slide Studio lab are outside its destination.

## Host checks completed during implementation

Obsidian 1.13.7, isolated Math Studio Lab, default dark theme, readable line length disabled at the user's request.

Edited the first of two identical inline expressions; added keyboard text and a palette alpha; saved only that expression; native Cmd+Z restored it. Clicked a rendered display integral to open the visual editor. Chose automatic numbering and verified the saved Markdown contains a standard tag plus an automatic-number marker, and that native MathJax renders (1).

Edited a cell of the nested 2x2 matrix from 1 to 19, inserted a row below it, entered 5 and 6 using Tab, saved, and observed the nested 3x2 matrix rendered natively with all outer cells retained. Reloaded the note and verified persistence.

Reproduced native unrecognized oiint/oiiint commands. Added a narrowly scoped renderer fallback and a pinned-engine glyph patch: use sized double/triple integral glyphs with a contour ellipse, preserving original commands. Visually compared height against native single and contour integrals in Integral comparison.md. Verified the fallback in Live Preview and Reading view and opened the correct closed integral from its Reading-view action. Mathematical fonts are bundled as data URLs for offline loading.

Remaining at this checkpoint: complete keyboard-only flow, conflict/no-op host checks, separate-window and theme testing, Slide Studio integration, final packaging and audit. Automated model/engine suite currently passes 8 tests; this is not yet a release-complete claim.

## Palette and unfinished equations — 2026-09-28

Used Mathcha's documented Suggestion Box screenshot (https://www.mathcha.io/documentation/img/docs/getting-started/basic/b7.png) as the layout reference: compact named rows with typeset previews, right-side categories, and All/Composite/Categories modes. Added the missing MathLive static stylesheet to the iframe. Visually checked calculus previews in Obsidian and the isolated browser preview.

Verified keyboard search and Enter insertion, then Cmd+Enter saving a fraction with both slots empty. Inspected saved Markdown: `\\frac{{}}{{}}`, with no placeholder command. Native Undo restored the pre-test equation. Preserved the user's existing unfinished draft separately in the lab before reload. Automated tests cover empty fractions, bounds, and matrix cells; nine tests pass.

## Keyboard spacing and finishing — 2026-09-28

Space inserts explicit TeX thick spacing (`\\;`) in math mode. Shift+Enter finishes the draft, alongside Cmd/Ctrl+Enter. Clicking elsewhere inside the same note editor also commits and closes the draft; toolbar interaction and switching apps do not trigger this. Esc remains cancel. In the live lab, inserted Space then z, finished with Shift+Enter, reopened and appended +1, then clicked the surrounding paragraph. Inspected persisted source `x+y\\;z+1`; both finish paths saved correctly. Existing nine tests and build pass.

## Selection color — 2026-09-28

Added a Color panel with named swatches, native custom picker, six-digit hex input, and Default text color. Cmd/Ctrl+Shift+C opens the panel from the mathfield; arrows navigate swatches and Enter applies. The panel snapshots the math selection so focusing its controls does not recolor the wrong part. With an empty selection, MathLive applies the style to subsequent input.

Live Obsidian verification: keyboard-selected plus sign saved as `\\textcolor{#ff5f05}{+}`; selected exponent independently saved as `x^{\\textcolor{#4285f4}{2}}`. Both rendered with their colors in native Live Preview. Selected only matrix entry a, applied custom #22bb88, saved, reopened and observed the scoped color in the selection. Default text color removed that override from saved Markdown. No plugin-specific color markup is used. Build and existing nine tests pass.

## Display rows and alignment — 2026-09-28

Reviewed Mathcha's layouts/matrix and align documentation. Implemented Enter/add-line using MathLive structural row commands and explicit left/center/right/equals layout conversion. Live lab: typed three rows with Enter, aligned equals, saved with Shift+Enter, reopened and added a fourth row. Verified saved native source. Switched right, center, left and back to equals, then saved: all four equations persisted with aligned equals. Fixed a discovered MathLive selection replacement issue that initially left blank root rows: layout changes now use replaceAll insertion. The caret moves back inside the resulting environment. Tests cover nested matrices, colors containing equals, empty rows, repeated equals, new alignment cells, refusal of custom row spacing/multiple pairs/adjacent environments. Build and 14 tests pass. The existing inline-trigger inconsistency remains deferred by user request.

2026-09-30 evaluation bar: build and all 14 tests passed. Installed main.js and frame.js in study_studio_lab and reloaded. In the embedded Study Studio editor, searched evaluation, inserted Evaluation bar, entered f and tabbed to x. Screenshot confirmed f with right evaluation bar and x subscript. Cancelled without saving the test equation.

2026-09-30 evaluation-bar preview follow-up: replaced preview letters with square boxes; insertion retains the already verified two MathLive placeholders. Build passed and updated bundles installed in lab.

## 2026-10-08 — Keyboard and emphasis repair

Version 0.1.1: build succeeds; 19 tests pass, including caret lookup, empty delimiters, code exclusion and Markdown emphasis around TeX. Installed bundles match source in docs. Native checks in code_links_lab opened inline and display equations via Cmd+Shift+M and saved/cancelled the editor. The same shortcut opened math in Slide Studio's native editor; changing x^2 to x^2+1 survived saving to the slide Markdown. Escape then left the slide open.

Dark-mode native inspection: green bold prose and its equation match; ordinary math remains its normal color; explicit red y inside green bold math remains red. Nested bold/italic math remains visible in both Live Preview and Reading View. Research-vault guide inspected after reload: green bold math, red H1 and orange H2 in Quiet Outline, and a rendered alpha-squared heading. Full light-mode and arbitrary custom-theme coverage remains open.

## 2026-10-08 — Empty inline pair before display math

Caret lookup now prioritizes an isolated `$|$` over the scanner's apparent display equation spanning subsequent prose. Code/frontmatter exclusion is retained through the scanner probe. The empty editor mounts before the opener so native Live Preview cannot hide its widget inside a larger math replacement; opening/cancelling never inserts placeholder source.

21 tests pass, including exact replacement bounds, prose preservation, code/escape/frontmatter exclusions and normal display lookup. Native checks in math_studio_lab and docs opened a blank inline editor with Cmd+Shift+M, typed x+1, saved with Shift+Enter and restored the following heading, prose and display equation. Lab Undo and Escape cancellation preserved the original fixture byte-for-byte. Docs test note was moved to the external backup folder after verification. Existing research notes were not edited.
