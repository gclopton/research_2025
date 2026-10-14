# Slide Studio

Create reusable Markdown slides as you develop notes, link to them from your outline, and assemble them into presentations in Obsidian. Desktop first; version 0.3.6.

## Start using it

Open the Slide Studio ribbon icon, or run **Slide Studio: Create slide** from the command palette. Choose an intro, section, or content template. Double-click a text block to edit directly on the slide with Obsidian's native Markdown editor. **Escape** or **Done** returns to the rendered block. Live Preview follows the vault's editor setting: equations render away from the cursor and expose LaTeX when edited. The inspector provides raw Markdown as an alternative.

Drag the block's top handle to move it and its bottom-right corner to resize it. Placement snaps to an eight-unit grid; hold Alt to move freely. Adjust font size, alignment, and dimensions in the inspector. Heading levels work normally. The editor marks overflowing blocks so you can enlarge them or reduce their font size. Undo/Redo restores content and layout changes; native text undo works while editing.

Drag screenshots or image files directly onto the slide, or use **+ Import image**. Imports copy the image into the vault and add a movable image block linked to that file; the original stays untouched. The vault’s configured attachment folder is honored (including `./images` beside the slide note). When attachments are unset or use the vault-root default, Slide Studio uses `images` beside the slide instead, without changing global vault settings. Duplicate filenames receive a suffix. Undo removes the block but keeps the imported file.

Use **+ Image from vault** for an existing vault image, or **+ Linked note** for a live reference to a note, heading, or block. Edit the linked-note target as `Note#Heading` or `Note#^block-id` in the inspector. Linked-note content is edited in its original note; it is not rewritten by editing the slide. Changes in that source refresh the slide preview. Normal text blocks are independent Markdown stored with the slide.

## Start a presentation from a note

Right-click in a note and choose **Create presentation from this note…**. The same action is available from the file menu and command palette. Enter a title, author, affiliation, and date; the meeting/event field is optional. Blank author and affiliation fields become editable placeholders. The date starts at today’s date and can be changed or cleared. The note’s first level-one heading is suggested as the title, falling back to its filename; replace it if that heading names a section rather than the whole topic.

Creation opens a new tab containing a presentation with one title slide. Each presentation gets `Presentations/<name>/<name>.md` and its own `Slides/` subfolder. Reusing a title creates a separate numbered folder. Standalone slides live in `Slides/Library/`. The title slide retains the source note’s path, and the note itself is unchanged. Click **Edit this slide**, then double-click any text block to edit it. Ordinary **Create presentation** also starts with this title slide. **Build presentation from slide links** copies the collected slides into the new presentation folder.

## Work from an outline

Select a passage in a normal note and run **Slide Studio: Create slide from selection and insert link**. This copies the selection and adds a slide link after the enclosing paragraph, retaining the original text. You can also create slides separately and use **Copy note link** to place their links anywhere in your notes.

When ready, run **Slide Studio: Build presentation from slide links in current note** from the outline. This creates a presentation in first-occurrence order. Only direct links to slides are collected; embedded links and code examples are omitted. The deck editor lets you add slides, reorder them, and assign a section label from any slide onward. Right-click the Slide Studio workspace or slide list to create a slide, copy an existing slide, or explicitly share one. Editing a shared slide changes every presentation referencing it. **More actions → Duplicate presentation — independent slides** creates a new folder and copies all slide documents with new identities. The separate sharing option retains the existing slide references. Copies retain links to original images, notes, code and data; they are independent layouts, not self-contained asset archives. Legacy flat decks offer **Organize into presentation folder**, preserving IDs and moving only their exclusive flat-folder slides. Shared slides stay in their current locations.

## Present and navigate

Click **Present**. Arrow keys, Page Up/Down, and Space navigate; Home/End jump to the first/last slide. Type a number followed by Enter to jump. Press **G** to find a slide by title or number. Escape closes the search or exits presentation mode. Move the pointer into the upper-right corner to reveal presentation controls. They hide automatically and stay hidden during arrow-key navigation; number entry briefly shows its jump prompt in that corner.

**Copy presentation link** creates a playback link. In a deck, **Copy link to this slide in presentation** addresses the selected slide by permanent ID, so reordering doesn't break that target. Ordinary wiki links open slides and decks for editing. Obsidian links require the vault and plugin to be installed locally; they are not public hosted presentations.

**New window** opens the current slide or presentation in an Obsidian popout. Click Present there to use that window for playback. The editor follows the Obsidian UI theme; **Light page / Dark page** changes the slide's page and text colors while retaining the footer branding. A deck's page appearance overrides its constituent slides during playback.

## Theme and files

The footer uses the official orange-and-white Illinois Block I SVG, bundled for offline use, with a navy panel, orange section tab, and automatic pagination. Double-click the orange footer text to type directly. Enter or clicking away finishes; Escape restores the previous label. The tab starts at a 400-unit minimum width and expands with its text and wraps longer labels within the available footer width. Keep labels concise enough to fit the footer height.

In a presentation, editing the footer on any member slide renames the entire section. The inspector shows the affected slide range. Section headings appear in the slide list; **Start new section at this slide** creates a new group. Section-introduction slides automatically begin a section. Names belong to the presentation, so using the same slide in a different deck does not force the same section name. Standalone footer edits change only that slide’s default label.

**Text styling → UIUC** uses the presentation palette, with orange intro/section titles in light mode and pale titles in dark mode. **Vault theme** inherits the active vault’s page background, fonts, heading colors, links, callouts, and highlight styling. In that mode, appearance follows the vault rather than the UIUC light/dark switch. Custom CSS classes can carry through; compatibility with every third-party plugin or narrowly targeted CSS selector is not guaranteed. The block inspector also accepts a six-digit custom text color; blank restores theme colors.

The footer strip and page number follow the page background and foreground in both themes. The geometric footer pattern is off by default and can be enabled using **Footer pattern**. The decorative title accent has been removed. Deck settings also control navy/accent colors, a custom logo path, footer visibility, and pagination.

Slides and presentations are regular `.md` files in `Slides/` and `Presentations/`. Layout and permanent IDs are in YAML frontmatter; block contents remain ordinary Markdown. **Open Markdown** exposes the backing file. Keep the block-ID comments and IDs intact. Disabling the plugin leaves the source readable. Obsidian's normal automatic link updates handle wiki links when files move; decks additionally resolve permanent IDs.

Edits autosave. Concurrent edits are checked before writing: a stale draft cannot overwrite a newer file. If a conflict is detected, save the offered recovery copy and reconcile the two notes. Undo history lasts for the open editor session. Back up the vault with your normal workflow.

## Install or develop

The dedicated local test vault is already installed. For another desktop vault, build with `npm ci` and `npm run build`, then copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/slide-studio/`. Enable Slide Studio under Community plugins. The project does not modify other vaults automatically.

Run `npm test` for model/persistence checks. `npm run package` builds a zip in `dist/`. See [SPEC.md](SPEC.md) for the bounded release specification and [VERIFICATION.md](VERIFICATION.md) for observed checks.

## First-release limits

Tested on macOS with Obsidian 1.13.7. Native inline editing uses an isolated adapter over an undocumented Obsidian API, adapted from the established embedded-editor approach credited in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Future Obsidian versions may require an adapter update. If it cannot load, raw Markdown editing remains available in the inspector. Compatibility with arbitrary third-party editor extensions and rendering plugins has not been verified.

This version uses a fixed 16:9 canvas, UIUC or inherited vault styling, and text/image/linked-note blocks. It does not include PPTX/PDF export, animations, mobile editing, or real-time collaborative editing. A presentation loads its slide contents when playback starts; exit and restart playback after source edits to refresh them.

## UIUC content palette

Light UIUC pages use navy body text, bold, italics and mathematics on white, orange intro/section titles, and burnt-orange links. Dark pages use pale text and mathematics on deep navy, with soft-orange links. Highlights use an orange-tinted background; code uses a subtle neutral surface. These colors are shared by native inline editing, preview and playback, and override Blue Topaz emphasis/math/highlight colors only inside UIUC pages. Vault theme continues to inherit those personal styles.

Right-click a block to edit, duplicate, delete, or change its stacking order. Right-click empty slide space to add text/math, a vault image, an imported image, or a linked note at that position (kept within the slide content area). Both menus include Undo and Redo. While editing text, the normal Obsidian text context menu remains available.

In a presentation, use **Theme for all slides** in the top toolbar to choose **UIUC light**, **UIUC dark**, or **Vault theme** for the whole deck. This affects presentation preview and playback, including newly added slides. Choose **Use individual slide themes** to use each slide’s saved style and appearance again. This presentation override does not rewrite slide notes or change how those slides look when opened independently or reused in another presentation. Vault theme follows the vault’s active light/dark setting.

UIUC dark uses Illinois navy (`#13294b`) for title and content slides. **Dark background pattern** optionally adds a fine geometric grid fading toward the left, matching the reference presentation. It defaults to **Hide**, is separate from **Footer pattern**, and applies only to UIUC dark. Set it per slide or for the presentation; individual-theme mode uses each slide’s own pattern setting.

Keyboard users can assign vault-wide shortcuts in **Settings → Hotkeys**, searching **Slide Studio**. Commands include creating slides/presentations, presenting, adding text/math, images or linked notes, importing images, editing/duplicating/deleting the selected block, changing stacking order, and opening the current slide/presentation in a new window. New commands have no assigned shortcut by default. **Cmd/Ctrl+P** opens Obsidian’s command palette. Existing editing shortcuts include **Cmd/Ctrl+Z** (undo), **Cmd/Ctrl+Shift+Z** (redo), and **Delete/Backspace** for selected blocks outside text editing. Playback supports arrows, Page Up/Down, Home/End, slide numbers followed by Enter, **G** to search, and **Esc** to exit.

**Intro** slides use the full official University of Illinois Urbana-Champaign wordmark, with light/dark variants. **Section** and **Content** slides retain the Block I and editable solid orange section banner, now with square corners. The surrounding footer and page-number backgrounds are transparent so the slide pattern continues to the bottom. Custom logo paths and footer/pagination visibility remain available.

In UIUC dark mode, section/content footers use one continuous white banner with orange lettering and the orange Block I with its navy outline. UIUC light retains the orange banner with white lettering.

## Image Gallery integration (0.3.0)

When the separate Image Gallery plugin is enabled, **Image from vault** and **Replace image** open its thumbnail/search picker. Without it, the filename picker remains available. Replacement changes only the selected block's image path and preserves its identity, position, size, and alignment. Natural size restores intrinsic dimensions bounded to the slide. Image dimension edits and corner resizing preserve aspect ratio by default; turn off **Keep image aspect ratio** to resize the frame independently. Images use contain fitting inside the frame.

Document creation, link copying, duplication, Markdown, and new-window actions are collected under **More actions**. Block duplication, stacking, and deletion remain available in the block context menu and **More block actions**. Image blocks no longer show irrelevant font/color inputs.

UIUC H1 titles use orange consistently in the shared preview/playback renderer and native inline editor, unless an explicit block color is set. Shared print CSS requests exact colors. This release adds no PDF/export feature; the plugin did not have one. Existing version-1 slide and deck files remain compatible.

The default **Grady Convention** excludes title slides from visible numbering: the next slide is 1. In the presentation inspector, set **Slide numbering → Wrong Convention** to number and count title slides. The navigation list still shows slide positions. Under **Settings → Style → Number display**, choose **Current/total** (the default), such as **2/11**, or **Current**. Existing decks without an explicit choice also use Current/total. Both numbers follow the selected convention; generated outlines and references do not count. The total updates when slides are added, removed, or restored. All saved deck slides count under that convention; there is currently no separate backup-slide designation. Gallery search and direct numeric navigation continue to use the current number, not the total.

## Settings and slide thumbnails

**Settings** opens a draggable, resizable window inside Obsidian. Drag its title bar or resize its bottom-right corner; it stays open while you edit. **⌘⇧,** (Ctrl+Shift+, on Windows/Linux) opens it, and the command palette offers **Slide Studio: Open slide settings**. Obsidian’s own **⌘,** is unchanged. The settings window has Presentation, Section, and Style tabs for decks; slide and selected-block controls follow the active editor. Closing it frees the entire canvas width.

The sidebar shows live slide thumbnails. Click to select, double-click to edit, and drag to reorder. **⌘-click** (Ctrl-click) toggles individual slides; **Shift-click** or **Shift+Up/Down** selects a range. **⌘A** while a thumbnail is focused selects all slides. Dragging a selected thumbnail moves the selection in its original order. Right-click for Edit, Duplicate, Move up/down, and Move to trash; Delete/Backspace also sends selected slides to trash. Reordering and removal support Undo/Redo.

Each presentation has its own saved **Trash** gallery, with recognizable slide previews, Restore on each card, and Restore all. **Empty Trash** asks for confirmation, clears the editor’s Undo history, and moves unused slide files from that presentation’s own Slides folder to Obsidian’s recoverable vault trash. Files referenced by other decks (including their trash bins), linked from notes, or stored elsewhere are retained. Linked images and other scientific sources are not deleted.

## Organizer and reusable sections (0.3.7)

Open a presentation and choose **Organize** beside Present. The full-width thumbnail grid follows presentation order: direct slides in a section, then its subsections. Resize thumbnails with the slider; collapse section headers to work with the overall structure. Cmd/Ctrl-click selects individual slides and Shift-click selects a range. Drag thumbnails between sections or within their grid; the right half of a target thumbnail inserts after it. **Group selected** creates a section from the selection, and **Move selected…** supplies a destination picker. Double-click a thumbnail to return to that slide's preview; Edit slide opens its editor.

Drag section headers to place them before another section. Hold Option/Alt while dropping a header to nest it inside the target, or use the header's **⋯ → Move section into…** action. That menu also creates subsections, moves a section back to the top level, selects all its slides, and sends its slides to the existing recoverable trash gallery. Empty section containers can be removed separately. Undo and Redo include grouping, moves, footer edits, and imports.

Each header's **Footer…** window separates the section name from its footer text. A section can inherit the nearest parent's explicit footer, use its own text (including an empty footer), or apply one footer throughout its nested subsections. With no explicit ancestor footer, slides use their immediate section name. Existing presentations gain named sections from their old footer boundaries when first organized; their slide order and footer text are preserved.

**Right-click → Bring in slides, sections, or a presentation…** opens a searchable presentation browser with collapsible sections and slide thumbnails. Select slides, section checkboxes, or the whole presentation. Choose a destination and either keep the source hierarchy or import slides only. Independent copies are the default, with new slide and content-block IDs stored in the receiving presentation's Slides folder. Shared slides are explicit and keep the original IDs. Scientific source files and assets remain linked. Imported sections receive fresh IDs; an entire deck can become a section with its original subsections beneath it. The source presentation is not modified. Undo removes the imported entries while retaining the copied files for Redo and later reuse.

### Compact slide sorter (0.3.9)

The organizer is an ordered gallery. Thumbnail size defaults to 150 px and can be adjusted from 100–240 px; sparse rows do not expand the cards. Numbered section headers show hierarchy (1, 1.1, 1.2, 2). Collapse all makes the deck a compact section outline; Expand all restores the thumbnails. Free spatial layout has been removed; existing saved coordinates are retained for compatibility but ignored.

Drag thumbnails to insert them at the indicated line. Drop onto a section header to append the selection to that section, even when collapsed. Drag section headers before or after another section; hold Option during a section drag to nest it. The dragged items fade and a small label shows the operation. Edge scrolling continues while holding the pointer near the gallery edge.

Click a slide number, or select several slides and choose Move selected, to choose a destination section and an exact one-based position among that section’s direct slides. The selection stays together in its current order and the other slides shift. Section numbers open a similar dialog: choose a parent (Top level promotes a subsection), a position among siblings, and either Insert or Swap. Swap is limited to sections with the same parent. Nested subtrees travel with their section. Direct slides appear before subsections.

Cmd-click or Option-click toggles individual selections; Shift-click selects a range. Each section’s checkbox selects or deselects all its slides, including nested subsections. Group selected lets you name a new section and choose a parent, so the same control creates sections and subsections. To move slides out of a subsection, choose the parent in Move selected. Undo reverses structural changes.


## Automatic outline slides (0.3.10)

In a presentation, open **Settings → Outlines → Show outlines**. Slide Studio generates an unnumbered outline before each occupied section and subsection. These follow the deck theme and highlight the upcoming section, with a local subsection list. Preview them from the sidebar's **Outline** buttons or the section headers in **Organize**. Playback includes them automatically.

Outlines are derived from the presentation structure, not separate slide files. Renaming and reordering sections updates them automatically; turning the option off removes them from playback. They never contribute to visible slide numbering, under either numbering convention. A title remains before the first outline. Presentations without sections have no outlines; empty sections and sections containing only title slides are skipped. Long lists keep the current section visible and indicate how many earlier or later sections are outside the displayed window.

Outline entries use hierarchical numbering (3, 3.1, 3.2; deeper levels such as 3.2.1). The highlighted entries provide orientation without a separate current-section heading or progress counter.

A thin accent connector ties the highlighted section to its lightly shaded subsection panel. The panel stays at a fixed top alignment; the current subsection number uses the theme accent. Parent-section outlines do not highlight an individual subsection.

If a section begins directly with a subsection, their outlines combine into one with that subsection highlighted. This also collapses deeper ancestors with no intervening content, while retaining separate outlines when parent content precedes a subsection.

## Citations in slides (0.3.11)

Use the same Pandoc citation text as in notes: `[@citekey]`, `[@first; @second]`, or `@citekey`. Slide Studio displays superscript numbers and assigns one number per source, in first-appearance order across the presentation. Reordering slides recalculates the presentation's numbering. A slide opened on its own numbers its own sources locally.

The bibliography is read from the vault's Pandoc Reference List settings (including its loaded Zotero cache), or from `bibliography: Sources/library.json` frontmatter on a slide, source note, or presentation. Multiple bibliography paths are supported. Paths are absolute or relative to the vault root. CSL-JSON works directly; BibTeX requires the configured Pandoc executable. Missing entries remain visibly marked with their citekey rather than acquiring fabricated metadata. Bibliography errors appear in the presentation rail.

An adjacent Study Studio `[evidence](obsidian://study-evidence?...)` link with matching citation keys is folded into that citation. Right-click → **Open Citation Source Viewer** opens that occurrence's original evidence reader, including its highlights and comments. Keep the complete evidence URI when copying a claim. Different claims can use the same number while opening different passages. Evidence reading requires the current Study Studio plugin in the target vault. Normal clicks on inline citations, footer references, and References-page entries open the vault PDF first, falling back to the web version if no local PDF is found. Right-click provides **Open PDF**, **Open web version**, **Open Citation Source Viewer** when evidence is linked, and **Reference details**. PDF lookup uses an explicitly chosen PDF, source-note PDF metadata, or a verified matching file in the archive's `pdfs` directory. Cross-vault evidence links are resolved using Obsidian's registered vaults. PDF discovery does not invent publisher download URLs. If an explicit Open PDF action cannot find a PDF, a picker lets you associate a PDF from the current vault with the citekey.

Slides with citations replace the normal footer with the first three unique cited sources, using a compact author–journal–year format with DOI when supplied. Footer clicks use the same PDF-first behavior. **Open Citation Source Viewer** is scoped to that slide; when several passages support the source, a chooser lets you select one. The existing page-number convention is retained. Additional sources remain clickable in the slide text; **+N in References** opens the complete bibliography. Slides without citations retain their regular footer.

References are generated at the end of playback and are available from the editor rail. They use the presentation theme and do not count toward content-slide numbering. Longer bibliographies split across several sheets; no extra source files or editable slide copies are created. Click a full entry to open its vault PDF, with a web fallback. Right-click → **Open Citation Source Viewer** offers the paper's supporting passages across the presentation. The full entries include the available authors, title, publication information and DOI or URL. This is a fixed compact scientific format, not a reproduction of arbitrary user-selected CSL styles. Literal code, code links, math and email addresses are excluded from citation parsing.

## Embed presentations in notes

In an ordinary note's editor, right-click and choose **Insert presentation…** (or use **Slide Studio: Insert presentation** in the command palette). The gallery searches titles and paths, filters by folder, and shows a continuous scrolling gallery with previews loaded as you approach them. Flip through a preview, then choose **Insert presentation**. Reading View also offers **Insert presentation at end…** on ordinary note text.

Each embedded presentation has its own previous/next controls. Click its slide or title to open the presentation in Slide Studio. While a control is focused, Left/Right and Home/End navigate that embed. Multiple presentations, including multiple instances of the same deck, can appear in one note. Embeds follow saved deck and slide edits; **Refresh** also reloads source material. Their displayed sequence includes the generated outlines and references. The small counter counts viewer pages, while the slide itself retains its configured slide-number convention.

The presentation editor's **More actions… → Copy embed** copies a ready-to-paste block. Generated blocks carry a stable presentation ID, so renaming/moving the deck within the vault does not require changing the embed. You can also write a `slide-studio` fenced block containing `[[Presentations/My talk/My talk]]`. This handwritten path-only form has no stable-ID fallback. These are live views of existing presentations, not independent copies; they work in Live Preview and Reading View. The preview surface opens the deck; source links are available after opening the presentation.

## Fluid dynamics course themes

In presentation **Settings → Style → Theme for all slides**, choose **Fluid dynamics light** or **Fluid dynamics dark**. The presets draw on the Viscous Fluid Flow figure palette: slate `#233C4C`, pale teal `#D4E8ED`, blue `#216BB0`, copper `#BD692D`, and pale page `#F8FAFD`. Dark mode uses lighter blue and copper for contrast. Themes apply to saved slides, outlines, references and note embeds. Switching back to UIUC restores its base and accent colors; per-block text colors remain intact.

### Direct editing from a presentation

Double-click text in the large presentation preview to edit that block immediately. Double-click an image or linked-note block to select it in the slide editor for layout changes. Links inside blocks keep their existing actions. Press Escape or **Done · Esc** to save and return to the same presentation slide, retaining the presentation theme, section footer, numbering, and slide-list scroll position. A standalone slide exits text editing without navigating away. Further Escape presses stay inside Slide Studio; they do not return to the note containing an embed. Footer Escape still cancels its label edit. Save conflicts keep the draft open for recovery.


### Keyboard and context-menu navigation (0.3.17)

Right-click the workspace or slide list for presentation actions, even after scrolling. The former Add slide, Bring in, and Trash buttons no longer occupy the top of the slide rail. A slide-card menu retains its local edit/duplicate/move/trash actions, followed by presentation actions. Right-click a section header for that section's actions. In slide editing, block actions and Obsidian's native text menu remain primary; Slide Studio actions are available separately. Playback has navigation, its gallery, help, and exit, with no editing actions.

On macOS, Cmd+Option+G opens the Go to slide gallery, Cmd+Option+K opens the searchable shortcut guide, and Cmd+Option+M opens the context menu from the keyboard. Cmd+Option+N adds a new slide; I brings in slides/sections/presentations; T opens presentation trash; O toggles the organizer; E edits the current slide; P presents. On Windows/Linux, use Ctrl instead of Cmd and Alt instead of Option. Settings remains Cmd/Ctrl+Shift+comma. The guide also lists other registered commands and shows saved hotkey overrides, including unassigned commands. Change bindings in Obsidian Settings → Hotkeys → Slide Studio. View scopes prioritize these commands within Slide Studio so other plugins do not intercept the same combination; native text editing inherits that scope. During playback, G opens the gallery and ? opens playback help.

The same lazy thumbnail gallery supports overview and fullscreen playback. Click a card or search a title or number. A number such as `69` shows slide 69 first, followed by titles containing “69”; press Enter to open the first match. Use `#69` to search only for that exact printed slide number. Arrow keys navigate cards after Arrow Down moves focus from the search field. The current slide is outlined. Gallery numbers match the printed footer and follow Grady Convention or Wrong Convention. Unnumbered title slides and slides with pagination hidden have no numeric search label; find them by title. The organizer and rail retain physical positions for arranging slides. Playback additionally includes generated outlines and references, searchable by title. Escape dismisses the gallery without leaving playback; another Escape exits playback. In the editing/overview UI, Escape stays within Slide Studio.

## Zoom and image inspection

Slide Studio uses view-only zoom: Cmd/Ctrl+= (or +) enlarges the slide, Cmd/Ctrl+− reduces it, and Cmd/Ctrl+0 fits it to the workspace. The same actions are in the context menu and shortcut guide. Pinch or Cmd/Ctrl+scroll zooms around the pointer; when enlarged, scroll pans. With the canvas focused, Space+drag or middle-button drag pans without moving slide blocks. Native text editors keep their ordinary scrolling. Zoom does not change saved font sizes, geometry, theme, or source files, and is retained when entering and leaving editing.

In playback, click a figure to inspect the original image in a maximized viewer. Figures also accept Tab then Enter/Space, and their right-click menu has Inspect image. In the viewer, scroll/pinch or +/− zooms, dragging or arrow keys pans, 0 or double-click fits, and Escape returns to the same presentation slide. Its right-click menu provides zoom, fit, and return. Linked images retain their original link action, and footer logos are excluded. Gallery thumbnails are unaffected. Enlarging a raster image cannot add detail beyond its source resolution.

## Resizing the Go to slide gallery

The gallery still opens at its original compact size, with the same default thumbnail scale. Drag its bottom-right corner to resize the gallery directly. Pinch the trackpad or hold Ctrl/Cmd while scrolling to enlarge or reduce the previews; ordinary scrolling continues to browse the slides. The columns adapt to the available space, including after moving to a different-size display. These controls work in both Slide Studio and fullscreen playback. No mode or setting needs to be turned on.

Within the gallery, Cmd/Ctrl +/− changes thumbnail size and Cmd/Ctrl+0 restores the default thumbnail and window sizes. Cmd/Ctrl+Shift+F fills the window or restores its size. Right-click a thumbnail or gallery background for the same sizing actions. Resizing changes only the gallery layout and scales existing thumbnail surfaces; it does not re-render all slides or modify their source files.

### Scrollable note and PDF windows

Use **Slide Studio: Insert note** or **Insert PDF** in the command palette, or the matching note context-menu entries. Choose a vault file, a starting PDF page or note heading/block, and the panel height. In slides, use **Insert note window on slide** / **Insert PDF window on slide**, also available from the slide's context menu. These use the same renderer in Live Preview, Reading View, and playback.

The resulting `document-view` block is a centered, page-shaped card, 440px wide with a 560px scrolling body by default. It shrinks to the available note width and screen height. Compact 14px Markdown retains the vault colors and styling; PDFs initially fit a complete page. Slide blocks use their assigned geometry. Click its title to enlarge it. Right-click inside the panel to open the source in a tab or refresh; Escape closes the enlarged view and retains the current presentation. Editing the source remains a separate action. Commands can be assigned hotkeys in Obsidian and appear in Slide Studio's shortcut guide.

```document-view
path: Papers/Example.pdf#page=3
height: 560
```

For notes, use `path: Notes/Model.md#Assumptions` or `#^block-id`. Whole notes render progressively in paragraph batches; nested note/PDF transclusions stay as links and nested document windows do not recursively load. Images remain inline. Panels load when approaching the viewport and unload with their host. Already-read batches remain available until the panel closes; this is progressive loading, not a fixed-memory virtual document. The PDF adapter uses Obsidian's native renderer with an explicitly managed lifecycle.

These windows do not change existing native `![[...]]` embeds or Hover Editor settings. The new **Open in document viewer** file/link menu is available independently of Hover Editor.


### Visual document gallery (0.3.26)

Insert note / Insert PDF now open a searchable preview gallery. Typing an empty `![[` in an ordinary Markdown editor opens it too; existing embeds and ordinary `[[` links remain unchanged. Choose Notes, PDFs, Images, or All, then filter by source vault and folder. The name/path search spans its own full-width row. Arrow keys browse cards; Enter selects; Escape cancels without deleting the typed brackets. Images insert ordinary image embeds. Notes and PDFs offer the same compact document-window options as before. Slide insertion commands use the same gallery.

The current vault supplies notes, images, and PDFs. Other registered local vaults supply PDFs without copying them. Stored vault identity and relative paths are resolved on this computer; renamed/moved external files must be selected again. External Markdown and images are not supported. External PDFs use a read-only page canvas with internal scrolling and Ctrl/Cmd-wheel zoom, rather than the full native PDF toolset: open the source for selectable text, search, annotations, or editing.

Only visible gallery rows and a small margin are mounted, with at most two preview jobs at once. Filtering is debounced, stale work is cancelled, and closing releases viewers. Other vaults are scanned for filenames only when selected. Markdown thumbnails use small excerpts without embedded viewers or fenced-code processors; notes over 2 MB omit thumbnails. PDF thumbnails are limited to 60 MB and external document windows to 128 MB; larger files remain available through Open source. These are bounded rendering measures, not a guarantee against unrelated plugin or app memory problems.

## Scientific figures and tables

Use **Insert figure** or **Insert table** from the command palette or the note/slide context menu. Each object has independent title, caption, and automatic-numbering controls under **Title, caption, numbering and layout**. The frame uses the current theme's foreground color at low opacity, without the orange callout treatment. Titles support Markdown and math. Label/title/caption placement can be above, below, left, or right.

Figures support up to 26 panels in one to six columns. Panel labels follow the figure number (1a, 1b); unnumbered groups use a, b. Right-click a panel in the figure editor to crop, reorder, or remove it. Cropping stores a rectangle and never rewrites the image file. Individual panel captions are optional.

Tables support grouped headers, horizontal and vertical merged cells, row labels, left/center/right alignment, scientific rules, cell grids, and alternating rows. Tab moves between cells; Shift-click selects a rectangle; right-click or Shift+F10 opens cell actions. Use **Select rows**, **Select columns**, or **Select all cells** in the cell menu to expand a selection, then **Cell background…** to apply a preset/custom color and tint strength. **Clear cell background** restores the theme. Merged cells intersecting a selection receive the fill as one cell. Paste tab-separated spreadsheet cells into an unmerged area to expand the grid. Split a merge before merging it into a different region. Row/column removal requires empty cells to prevent accidental data loss. Cmd/Ctrl+Enter saves either editor; Cancel discards the draft.

Figure and table sequences are independent, follow source order in a note or presentation order across a deck, and skip unnumbered objects. Reusing the same object ID in a deck retains its number. A slide opened alone has a local sequence. Existing manually numbered callouts are not rewritten or combined with these sequences. With Callout Outline installed, scientific figures and tables also appear there using their titles/captions.

Data remains editable in `scientific-figure` and `scientific-table` fenced YAML blocks. Slide Studio is required to render these blocks; they are not ordinary Markdown pipe tables. Original notes/images and existing callouts are never automatically converted. Very large tables still need an appropriately sized slide block; text is not silently shrunk.

### Caption typography and visual math (0.3.28)

Scientific captions use one text size: **Figure 1: Title** (or **Table 1: Title**) on the first line, followed by the caption. Without a title, the bold label starts the first caption paragraph. Numbering and caption visibility remain independent.

In figure/table title, caption, panel-caption and cell fields, right-click **Edit text and math…** for an on-demand Markdown preview. Click a preview equation, or use **Ctrl+M** at the caret to insert/edit inline math; **Ctrl+Shift+M** inserts display math. Math Studio must be enabled. Finish the equation, apply the text, then save the figure/table. Escape/cancel discards the current draft layer. Native Markdown/LaTeX remains editable when Math Studio is unavailable. Only the requested field creates a preview and math frame, so a large table does not create an editor per cell.


### Christmas Light and Christmas Night (0.3.30)

Choose **Settings → Style → Theme for all slides → Christmas Light** for evergreen backgrounds, warm gold headings, soft cream text, festive lights, and an original snowy village. Title/section slides show the larger scene; content/outline slides keep it in the footer. Custom logos and existing slide numbering remain available. Theme changes do not rewrite slide content.

The active playback slide gets 28 faint, slow CSS snowflakes. Editing, embedded previews and gallery thumbnails are static; hidden documents pause animation, reduced-motion preferences suppress snow, and print hides it. Artwork is bundled as SVG and requires no network or external fonts. This is a bounded animation, not a measured performance guarantee.

Generate the six-slide synthetic example with `npx tsx scripts/christmas-preview.ts /absolute/new/folder`. It includes outlines, equations, a cooling plot, a numbered figure and a shaded scientific table. The generator refuses existing folders.

Visual inspiration: [Coding Artist's Christmas snow globe](https://codepen.io/Coding-Artist/pen/xmdOxB) and [Mark Sottek's Let it Snow](https://codepen.io/mark_sottek/pen/NPNeyEE). No third-party artwork or implementation is bundled; the village and animation were authored for this theme.


**Christmas Night** is a second preset with a deep blue starry sky, cool blue snow, warm glowing cottage windows and colored bulbs that slowly brighten and dim at staggered intervals. The original green theme is now named **Christmas Light**; existing Christmas Eve decks retain their appearance and saved palette. Both are available under Settings → Style → Theme for all slides. Night uses the same geometry, caption styles and numbering. Only playback animates; reduced-motion and print keep lights steady, and hidden documents pause them.

For the nighttime demo use `npx tsx scripts/christmas-preview.ts /absolute/new/folder night`. The two user-supplied Christmas reference images informed the night palette; neither image was copied into the plugin. All artwork remains original local SVG.
