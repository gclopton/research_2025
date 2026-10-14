# Ink Studio

Ink Studio 0.1 is a desktop Obsidian prototype for drawing directly inside notes. It embeds the Excalidraw engine in an isolated inline editor. Freehand ink, eraser, shapes, arrows, text, colors and drawing undo/redo come from that engine.

## Using the lab

Open `ink_studio_lab`. Place the caret on an empty line and run **Ink Studio: Insert drawing here** from Obsidian's command palette, or use the note's right-click menu. Assign this command a vault hotkey in Settings → Hotkeys for lecture use. Draw inside the note. Click elsewhere in the same note to finish and restore the preview without moving the clicked caret. **Cmd/Ctrl+Enter** or **Done** also finishes and returns to typing. Changes autosave while editing; Done waits for the latest preview to save.

The header has a **Pen width** slider (0.1–4) and numeric field (0.1–8), in drawing units. New drawings start at 0.5. Width controls affect future strokes/shapes, preserve existing marks, and are remembered per drawing.

Double-click a saved preview to reopen it. From Reading mode, this switches the note into editing and opens the inline editor. A keyboard command, **Edit drawing on current line**, reopens a standard Ink Studio wiki embed at the caret. Drawing shortcuts include P for pen, E for eraser, R for rectangle, A for arrow, T for text and Cmd/Ctrl+Z for undo. These operate inside the drawing editor.

The note contains a normal SVG image embed. Assets follow the vault attachment preference (`./images` in the lab). Each drawing has a `.ink.json` editable scene and `.ink.svg` image preview. Keep the pair together. Removing the image embed does not delete its drawing files. Scenes include pasted image data when present. Preview text fonts are embedded in the SVG. The editor follows the vault's light/dark mode when opened; previews default to **Match editor**, preserving the editor's dark/light rendering at save time. Choose **Preview → Light** in the drawing header for a light export, useful for printing. The choice is stored per drawing. Existing previews update when reopened and saved; saved SVGs do not switch appearance automatically when the vault theme changes.

## Annotation overlays

Select complete paragraphs, equations or other static Markdown blocks in editing mode. Run **Ink Studio: Annotate selected passage**, or right-click the selection and choose **Annotate selected passage**. The original text remains editable. A foldable **Annotation — frozen passage** callout is inserted below it, containing a rendered snapshot with editable ink above it. Click the callout header to hide or show the card; double-click its image to edit. While editing, the callout temporarily becomes the drawing surface, then returns when finished.

Captures use a fixed 900px layout at double resolution and preserve the captured theme colors. This is a rendered snapshot of the selected Markdown, not a pixel copy of the selection's exact current screen layout. The background is locked; ink stays editable. Both are embedded in the SVG preview for sharing, while the scene retains the original text, source path/range, capture timestamp, dimensions and SHA-256 excerpt fingerprint. No AI service is contacted.

Opening a card checks whether its source still matches. It reports **Earlier snapshot** when the passage has changed or its new location is ambiguous. The original captured background stays intact. The editor's **Open source passage** link opens the source and selects the matching excerpt when locatable. Missing/renamed sources are reported without discarding annotations. Source status is checked on opening, not continuously while a card is collapsed. To capture updated prose, create another card; automatic background replacement is intentionally absent.

Text, headings and display mathematics have passed live checks. Interactive embeds and remote images are rejected; tables, code, callouts, local-image captures, printing and broader plugin combinations still need visual testing. Select complete Markdown constructs for faithful rendering. Very tall passages (over 6000px) are rejected. The first version uses an expanded native callout (`[!note]+`); use Obsidian's normal callout folding controls, or change `+` to `-` to start collapsed.

## Image alignment

Right-click an image in Live Preview or Reading mode and choose **Align image left**, **Center image**, **Align image right**, or **Use default (center)**. Images without an explicit alignment are centered by default. This works with ordinary images as well as saved drawing previews. Alignment is stored on that particular embed, preserving its caption and dimensions; another occurrence of the same image can have a different alignment. Editing-mode changes use native editor undo. Wiki embeds and inline Markdown image links are supported. Images inside transcluded notes, HTML images and reference-style links are not handled by this menu. Alignment styling requires Ink Studio or a compatible image-flags snippet.

## Saving and recovery

Writes are serialized and older queued drafts are skipped. The scene is saved before its preview. If preview generation fails, editable strokes remain in the scene. If the scene changes outside the editor, saving stops with an error instead of silently overwriting it. A recovery action saves the current scene as a separate `.ink.json` attachment. Recovery files can be paired with a copied `.ink.svg` under the same basename, then opened through a normal image embed. The SVG preview will regenerate on successful editing. Automated tests cover scene validation, external-change detection and queued writes.

Only active inline editors load the drawing engine; inactive drawings are ordinary images. Wait for **Saved locally** before quitting Obsidian. Abrupt process termination during an unacknowledged write is not a guaranteed save. Independent renaming of one member of a drawing pair is not yet supported. Whole-folder moves preserve pairing; broader move/sync/recovery scenarios still need validation. History inside the drawing editor belongs to that editing session; reopening retains the drawing, not the entire prior undo stack.

## Scope and verification

Inline drawing and frozen-passage annotation cards are implemented as lab prototypes. iPad extended-display pressure, latency and palm behavior need hands-on testing. Popout/printing/light-mode and broad cross-plugin integration testing remain pending. The lab includes Blue Topaz and selected visual plugins plus Math Studio and Slide Studio; this is a compatibility baseline, not a claim that every interaction has passed.

See SPEC.md, VERIFICATION.md and COMPATIBILITY.json. The local test vault is `/Users/gradyclopton/ObsidianVaults/ink_studio_lab`; original research vaults are untouched. Documentation, code and synthetic fixtures are versioned here, while local plugin settings and personal notes stay outside Git.

## Development

Run `npm ci`, `npm run build`, `npm test`, then `python3 scripts/install_lab.py`. The installer targets only the Ink Studio lab and never replaces note content. Reload Obsidian after finishing any active drawing. Build output and bundled vendor fonts remain local; package-lock.json pins dependencies for rebuilding.
