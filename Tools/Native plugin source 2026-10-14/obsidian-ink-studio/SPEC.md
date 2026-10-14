# Ink Studio — accepted design

## Purpose and scope

Draw inside Obsidian lecture notes without switching applications or transferring screenshots. Write over selected passages to communicate contextual corrections and ideas to AI. Preserve editable ink and native Markdown. Primary hardware is the user's iPad used as an extended desktop display, with their existing pen workflow. Test that configuration rather than assuming desktop mouse behavior proves pen quality.

Current stage: inline drawing prototype implemented and smoke-tested in the isolated lab. See VERIFICATION.md for actual checks and limitations. Frozen-passage annotation cards are now implemented and smoke-tested with text and display math. Study Studio will reuse the drawing component once its interface is stable.

## Inline drawing mode

An assignable Obsidian command inserts a bounded drawing surface at the caret. Edit directly in the note, save automatically, return to typing from the keyboard, and reopen the same drawing later. Provide pen, eraser, undo/redo, colors and stroke widths; evaluate an existing drawing engine before inventing one. Basic shapes, arrows and text support diagram work. Distinguish editable scene/stroke data from its generated SVG/PNG preview. Persist assets in a note-adjacent folder, respecting the attachment preference where practical. Default attachments in the lab are ./images.

Only an active drawing requires an interactive editor. Inactive/offscreen drawings display cached previews. Preserve editable data through close/reopen; use stable asset IDs and avoid filename collisions. Test note rename/move, missing assets, save errors, undo and interrupted sessions before calling storage dependable. Source remains usable as a preview without the plugin. Do not flatten the only editable copy into a bitmap.

## Annotation card mode

Select a passage and invoke a context-menu item or assignable command. Capture a fixed visual representation of the selected content and place editable transparent ink above it. Save the exact source excerpt, source path, stable block/range anchor where available, source fingerprint, capture dimensions and annotation scene. Original Markdown stays intact. Card remains embedded or linked in the note and can be reopened; it may be collapsed when inactive.

The accepted first version freezes the passage's appearance at capture time. If source text changes, show that the card refers to an earlier version. Never silently reposition ink over different text. Refreshing the background must preserve the old annotated version until explicitly replaced. Fully reflow-aware handwriting over arbitrarily edited live text is deferred.

Provide a composite image export plus source excerpt/location for AI review; exporting does not automatically transmit it to an AI provider. PDF/printing should include the intended image and omit editing controls. Test equations, callouts, tables, code and mixed passages during capture; explicitly identify unsupported captures.

## Integration boundary

Keep the drawing scene/storage API reusable by Study Studio for diagram prompts, labels and drawing answers. Math Studio and Slide Studio are compatibility dependencies in the lab, not mandatory architectural dependencies. Preserve Blue Topaz and Style Settings. Do not override global styles or native editor keys outside active ink mode. Handle popout owner windows correctly. Excalidraw is present for comparison and coexistence testing; whether to embed its engine is an implementation decision still to evaluate.

## Acceptance and development sequence

First prove insertion, pen strokes, autosave, preview, reopening and asset recovery with synthetic notes. Then implement annotation capture and stale-source detection. Validate keyboard-to-pen-to-keyboard transitions on the actual iPad extended display, including pressure, latency, palm behavior and scroll/zoom. Run light/dark, heading/highlight, Math Studio editing, Slide Studio editing/presentation, popout, print and long-note performance checks. Installation alone is not compatibility evidence.

Keep code/spec/verification history in Git, with private GitHub backup. Existing vaults are read-only references. Use synthetic content; do not copy credentials, automation settings or research material into the repository. Future features require a separate milestone so initial delivery stays bounded.

Image alignment addition: provide image context menus in Live Preview and Reading mode for left, center, right and default center. Persist per-embed flags while retaining labels and dimensions. Refuse ambiguous source mapping rather than edit an unrelated occurrence.

Fine-pen refinement: new drawings start at 0.5 drawing units; a continuous width slider and numeric input allow fine strokes down to 0.1, persisted per scene. Clicking outside the editor into the same note requests final preview save before closing, preserving the clicked caret. Existing marks retain their widths.

Preview appearance: default to matching the editor theme at save time using native Excalidraw export color conversion; retain a per-drawing Light override. Do not mutate editable stroke colors to generate either preview.

Annotation palette: follow the owner document light/dark theme when opening an editor, including frozen annotations. Use native Excalidraw image compensation to retain the captured PNG appearance. An already-open editor does not live-switch themes; finish and reopen after changing Obsidian appearance. Saved previews retain their last export appearance.

## Context menu integration (2026-10-13)

Drawing actions share a single Embed or link submenu with the other Studio plugins. Group state belongs to each Menu instance; public DOM-menu rendering preserves annotation swatches contributed by Study Studio.
