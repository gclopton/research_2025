# Verification

2026-09-28: Created isolated lab using synthetic content. Copied Blue Topaz, enabled CSS snippets, appearance/app preferences, selected visual-plugin settings and runtime files. Installed Math Studio and Slide Studio from existing local builds. Recorded versions and build hashes in COMPATIBILITY.json. No research vault modified.

Pending: open lab in Obsidian, confirm plugin loading and theme, then run editor/presentation/popout/print/undo checks. New plugin functionality and interoperability have not yet been implemented or tested.

Setup verification: both lab plugin manifests and Studio build hashes match the recorded baseline. Synthetic fixture is unchanged. Blue Topaz and ./images preferences verified on disk. Vault registered/opened through Obsidian. Three stale snippet references were absent in the source: S - Images Adjustments, pub-Image Flags, S - Callouts; omitted from lab enabled list and recorded in COMPATIBILITY.json.

Live smoke check: Math Studio opened and cancelled on the display equation in Compatibility playground with the visual plugins loaded. Slide Studio ribbon visible. This is only a loading/opening smoke check, not full drawing/study/presentation interoperability validation.

## Inline drawing prototype — 2026-09-28

Implemented a normal SVG embed backed by an editable Excalidraw scene, rendered as a replacement widget while active. Assets use Obsidian's attachment path API. The engine runs inside an iframe with local bundled fonts and scoped CSS; no external network connections are permitted by frame CSP.

Live checks in ink_studio_lab under Blue Topaz: invoked Insert drawing here, drew a freehand stroke, inspected persisted JSON points and generated SVG, finished with Cmd+Enter, reloaded Obsidian, and reopened the preview with the original stroke visible. Added rectangle and text "Inline ink"; inspected all three scene elements and SVG text plus embedded font data. Cmd+Z marked the text deleted; Cmd+Shift+Z restored it. Finished to native preview and reopened from Reading mode (which intentionally switches to editing). Fixed Blue Topaz image-zoom interception and duplicate preview/editor layout discovered during these checks. Original synthetic note prose remained intact; only its image embed was inserted.

Build/typecheck and five meaningful model tests pass: scene round-trip including pressure/image data, invalid-version rejection, sibling paths, conflict detection, and queued-write ordering/error recovery. npm audit reports zero vulnerabilities after patched transitive dependency overrides.

Not yet verified: actual iPad pressure/palm/latency, eraser/arrow behavior beyond engine support, light mode, popouts, printing, long-note memory/performance, concurrent external sync, missing-asset live recovery and note/asset move workflows. Math Studio and Slide Studio are loaded but full interaction tests with the new widget remain pending. Annotation cards are the next milestone and are not implemented.

## Image alignment — 2026-09-28

Live Blue Topaz checks: right-aligned the second of three identical image occurrences in Live Preview without changing the others; centered the Markdown image (encoded space in its path); switched to Reading mode and left-aligned the first wiki image. Inspected saved Markdown for all three distinct flags and preserved 320px sizes. Three transformation tests cover wiki paths/captions/dimensions, escaped Markdown alt text and destinations, and resetting alignment. Eight tests total pass.

Default updated to center at user request. Reloaded lab, used Use default (center) on the Markdown image in Reading mode, and visually confirmed the unflagged image centered while explicit left and right images retained their positions.

## Fine pen and click-out preview — 2026-09-28

Built/typechecked; eight tests pass. In a separate synthetic Pen width check note, typed 0.2 in the width field, drew a stroke, and clicked note prose. Editor closed to a native image preview. JSON inspection confirmed freedraw strokeWidth 0.2 and a generated SVG. Reopened editor retained 0.2. Slider keyboard Home set both controls to 0.1; clicking prose again restored the preview. User reports the previous drawing build works through iPad extended display; fine-width Pencil feel still awaits their test. Click-out finishing is scoped to the same note, not arbitrary app/window changes.

## Cached placeholder repair — 2026-09-28

User screenshot showed that the earlier click-out check established editor closure, not visible SVG freshness. Disk inspection confirmed all three saved drawings contained non-placeholder SVGs, while the displayed embed was stale. Added mtime-versioned image URLs refreshed on SVG modification and insertion of drawing image nodes, including cached embeds restored after widget removal. Loaded fix, reopened the synthetic Pen width check drawing, added a second stroke, clicked note prose, and inspected a screenshot: both actual strokes were visible immediately in the native image, without another reload. Typecheck/build and eight tests pass.

## Preview appearance — 2026-09-28

Added per-scene Match editor (default) and Light preview options using Excalidraw native dark export. Loaded updated plugin, reopened the existing Pen width check drawing, saved with Match editor, and visually inspected the resulting handwritten matrix as light ink on a dark background. Existing strokes were not recolored in the editable scene. Build and eight tests pass. Theme matching is captured at save time, not live theme-switching of inactive SVGs. Light override control implemented; separate live override test remains pending.

## Frozen annotation cards and folding — 2026-09-28

Implemented selection command/context menu, native Markdown rendering to a 900px-wide PNG snapshot, locked Excalidraw background with independent ink, composite SVG, source excerpt/range/path/time/dimensions/fingerprint, and source-status comparison on reopen. Added html-to-image 1.11.13; npm audit reported zero vulnerabilities. Nine tests pass, including unchanged/moved/changed/ambiguous/missing source cases.

Live: selected a synthetic note containing heading, prose and a display fraction equation; captured successfully in Blue Topaz dark mode; visually inspected original colors and rendered mathematics inside the drawing editor. Added a red underline, clicked out, and inspected the saved composite image with both frozen math and ink visible. Changed only the fixture's original sentence, reopened the card, and observed Earlier snapshot while the original excerpt and underline remained intact. Reopen persisted one locked image background plus a separate freedraw element. Fixed background ID regeneration discovered during initial testing.

Wrapped the fixture in a native foldable callout. Reading-mode header click hid the source link and image; expanding restored them. Tested Live Preview reopening, found its callout widget obscured the ink editor, and fixed replacement of the whole quote plus moving the caret into that range. Reopening then visibly mounted the drawing editor with the stale-source warning. Original source Markdown stays present outside the card. Controls are desktop Obsidian through the user's extended-display setup; actual Pencil overlay feel remains a user test.

Limits: source status is shown on opening; inactive cards do not display a live stale badge. Snapshot layout is fixed width. Tables/code/callouts/local images, source-link exact-selection UI, source renames, popouts and print are not yet live-verified. Frozen snapshots do not refresh automatically. Existing user drawings/research vaults were not modified by fixture testing.

Final folding check: after reopening and finishing the card, clicked its chevron in Live Preview and verified the source link and composite image disappeared, leaving the annotation header.

## Callout focus regression repair — 2026-09-28

User reported reopening could leave an invisible active drawing and the finish-first notice. Previous tests did not establish stability after the iframe gained focus. Set the Ink Studio decoration field to highest CodeMirror precedence so the native callout replacement cannot obscure it on focus changes. Reloaded lab, double-clicked the annotation image, waited through save, selected the Draw tool, finished, and reopened a second time successfully. A subsequent screenshot confirmed the active editor and original red underline remained visible with Saved locally after iframe focus. Build and nine tests pass. Source link remains navigation to the source, not the annotation editing trigger.

## Annotation palette and lab callout shortcut — 2026-09-28

Removed forced light mode for annotation editors. Native dark palette is now used with a dark-rendered canvas background and PNG image compensation. Build/typecheck and nine tests passed; installed and reloaded in ink_studio_lab. Live screenshot confirmed dark controls, the light first stroke swatch, readable frozen prose/math and existing ink. Selected the light swatch and finished with Command+Enter. No new test stroke was added to the user-modified annotation. Separate light-mode runtime check remains pending; theme is selected at editor open, not updated in an already-open iframe.

Read-only comparison of calc-manager and fluid-dynamics hotkeys found editor:insert-callout bound to Mod+Shift+1. Restored only that binding in the lab local hotkeys.json. In the synthetic Palette and hotkey check note, Command+Shift+1 inserted the native NOTE callout; verified both UI and saved Markdown. Personal settings and fixture notes remain outside Git.

2026-10-13: TypeScript/build and nine tests passed. Cooperative menu integration inspected with Image Gallery, Slide Studio and Study Studio in the isolated code_links_lab. Drawing editor and asset schema are unchanged.
