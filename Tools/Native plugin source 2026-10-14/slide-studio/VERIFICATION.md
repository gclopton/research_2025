# First-use verification — 2026-09-28

Environment: macOS, Obsidian 1.13.7, isolated `slide_studio_lab` vault. The copied research outline and figure were used locally. Original source file hashes matched the captured baseline after testing. Research copies and screenshots are not committed to the source repository.

## Automated checks

The TypeScript build passes. Eleven tests cover Markdown/math/YAML round trips, malformed and future schema rejection, geometry bounds, stable-ID resolution including duplicate detection, outline link collection/order, section inheritance, dark appearance persistence, compare-before-write protection, stale second-editor writes, and acknowledged successive saves.

## Observed in Obsidian

The three page templates render. The content demo displays a LaTeX equation, inline math, a local research figure, and the supplied footer-inspired theme. Light and dark page modes preserve branding. Deck reordering changes page numbers while retaining slide identity. A deck gathered through the command palette contains the four linked outline slides.

Mouse dragging and resizing changed block geometry, and the saved Markdown coordinates matched. Undo restored resize geometry. Reload restored the saved deck and appearance. Creation from selected note text copied the selection, preserved the source passage, and inserted a reusable slide link.

The native editor opened within the slide and displayed rendered math. Moving the caret into the equation exposed its LaTeX source alongside the native preview. Pasting revised Markdown directly in the block and exiting with Escape updated the rendered slide, inspector, and saved file. Slide Undo restored the original block text. The editor uses the vault's Live Preview preference.

Presentation mode displayed a clean full-screen page. Arrow navigation, numeric jump, and title search were exercised. A native popout opened the slide and successfully presented it in that window. A protocol link launched the gathered deck directly at the equation slide, now at position four after reordering. An ordinary wiki link opened the corresponding slide editor.

Duplicate created a separate slide file. A linked-note block added to that copy rendered its source equation; modifying the source note updated the visible block. Overflow was visibly flagged when the linked content exceeded its initial block bounds.

## Remaining validation boundaries

Conflict protection is covered by automated persistence tests; simultaneous human typing in two native windows has not been separately exercised. Third-party editor extensions, alternate community themes, external monitors/projectors, Windows/Linux, and other Obsidian releases are unverified. The version 0.1 footer used an approximate I; version 0.2 replaces it with the official SVG. Native editor integration uses an undocumented API and must be rechecked after Obsidian upgrades. There is no claim of PowerPoint feature parity.

# Version 0.2 verification

Thirteen automated tests pass, including section renaming from a member slide, section boundaries, and backward-compatible theme defaults/round trips. The official SVG visibly replaces the font glyph. Live inspection confirmed a light intro title becomes orange with no decorative bar, while the dark palette remains intact.

Double-clicking the standalone footer and typing a longer label enlarged the orange tab; Enter ended editing and the inspector reflected the same text. Undo restored the previous footer. Editing the footer on slide three of a deck updated the section heading and the footer on slide four; reload preserved the change. The inspector identified the group as slides two through four.

A temporary CSS snippet in the lab set three distinct heading colors, a Markdown highlight color, and a custom highlight class. Vault-theme rendering visibly retained all five styles. This checks inherited CSS behavior; the user's specific style plugin has not been installed or tested in another vault.

# Blue Topaz configuration check

Copied the installed Blue Topaz theme and Style Settings 1.0.8 configuration from the calc-manager docs vault into the isolated lab. The source vault was read only. Copied the three enabled snippet files that actually exist; the source appearance configuration also references three absent legacy snippet files.

Live inspection of the added Blue Topaz demo confirmed the user's red/orange/yellow/green/blue/violet heading colors, mint bold accent, and normal/bold/italic/combined highlight styles. Removed the remaining Arial override from vault styling. The footer now follows the slide background and foreground, including page-number contrast, with a 400-unit minimum orange tab width that can expand.

Footer geometry follow-up: removed the 12-unit top margins and footer border seam. The navy panel and orange tab now fill the 90-unit footer height. The panel is 72 units wide and the unmodified logo is 58 units high, centered with balanced clearance. Reloaded the lab and visually confirmed the full-height strip and logo inset.

List editing follow-up: removed the blanket `padding: 0 !important` override on native CodeMirror lines. Overflow measurement now skips actively edited blocks so it does not force layout reads during CodeMirror DOM updates. Typing autosave waits 650 ms rather than 220 ms. In the live lab, corrected the reported list's missing marker space and mixed indentation without changing its wording. Tested Shift+Tab followed by Tab using consistent native tabs; exiting editing produced a three-level list, confirmed by screenshot and accessibility hierarchy. These checks establish correct tested nesting, not a comprehensive performance benchmark.

UIUC palette isolation: under the real Blue Topaz configuration, visually checked light presentation bold text and equations now use navy rather than mint/gray. Checked dark preview and native editor emphasis, highlights, links, code, and math, and checked the native editor in light mode. Corrected a remaining inline-code background specificity conflict. Keyboard arrows left presentation controls hidden; numeric entry revealed the prompt at the upper-right, clear of the footer.

## Image imports — September 28

Implemented file drops onto the slide stage (capture phase, so the embedded editor does not also consume the file), plus a native multi-file picker using the same importer. The attachment setting comes from the receiving vault; unset/root defaults fall back to `images` beside the slide without changing global settings. Imports allocate paths serially, copy binary contents, add scaled image blocks, and save slide references. Navigating away during import cannot add a block to another slide; any already-saved file is reported for recovery.

Build and 16 tests pass, including image recognition, safe names, root/nested attachment fallback paths, and edge-of-slide geometry. In the lab vault, the native file picker imported the first-shell PNG and rendered it on `Image import check`; saved Markdown references `Slides/images/first_shell_bond_roles.png`. SHA-1 comparison confirmed identical binary contents. Repeating the import produced `Slides/images/first_shell_bond_roles 2.png`, visibly rendered and saved, preserving the original. A physical OS drag was not exercised: Finder had no available window through the UI tool. The drop handler uses the same verified importer; its coordinate conversion and capture routing were code-reviewed.

## Right-click menus — September 28

Added native Obsidian context menus for blocks and empty slide space. Block menus offer inline editing or opening the referenced file, duplication, four stacking actions, deletion, insertion, and undo/redo. Background menus offer insertion at the scaled click coordinates with geometry clamped inside the content area. Native editor and editable footer context menus are preserved. Menu callbacks reject stale documents, and file pickers preserve the target document and insertion coordinates.

Live lab verification: right-clicked empty slide space, selected Add text / math, and observed a new block with clamped X=950/Y=492 near the bottom-right click. Right-clicking that block showed all block actions with frontward actions disabled for the top block. Delete removed it; right-click background > Undo restored it. TypeScript build and the existing 16 regression tests passed.

## Presentation-wide themes — September 28

Added a visible toolbar selector for UIUC light, UIUC dark, Vault theme, and Use individual slide themes. Shared theme resolution is used by deck preview and playback. The individual option preserves deck branding/footer settings while taking style, appearance, and pattern from each slide. Standalone slide notes are never rewritten.

17 tests pass, including uniform theme application across slides with different settings, restoring individual styles, preservation of slide Markdown, and serialization roundtrip. Live lab UI confirmed the selector, Vault theme and UIUC dark selections, dark intro preview, and dark intro/section slides during playback. Removed the redundant deck light/dark button after inspection showed the vault CSS overriding its hidden attribute.

## Keyboard commands and navy backdrop — September 28

Registered context-aware block insertion, import, edit, duplicate, delete, stacking, and new-window commands through Obsidian's addCommand API, without assigning or replacing hotkeys. Live command-palette inspection on a slide confirmed the new Add image, Add linked note, and Add text/math commands.

Changed UIUC dark page color to #13294b and added a CSS/SVG geometric grid masked from transparent on the left to visible on the right. Background pattern is opt-in, separate from the footer pattern, and excluded from light/vault styles. Visually inspected the navy title slide with the pattern enabled against the supplied reference; switched it back to Hide and confirmed the UI selection. Added persistence/default-off/individual-theme regression coverage; 18 tests and build pass.

## Title wordmark and transparent footer — September 28

Bundled official formal wordmarks for light/dark backgrounds as SVG data URLs. Only Intro slides receive the full wordmark; Section and Content slides retain the regular Block I and editable orange label. Footer and pagination backing are transparent; orange section labels stay fully opaque and have square corners. Custom logos and existing footer/pagination switches are respected. Live lab inspection confirmed the full wordmark on the Intro and the regular solid rectangular orange banner on the Section slide, with the geometric background visible through the former footer strip and behind the page number. Build and existing 18 tests pass.

## Dark banner palette — September 28

Scoped UIUC dark section banners to white with accent-orange text. Navy Block I backing, square geometry, transparent surrounding footer, title wordmark, and light/vault styling remain as before. Build/package passed. Visually verified in the lab section slide after reload: white banner, orange text, orange Block I on navy, and continuous background pattern.

## Unified dark banner — September 28

UIUC dark now uses one visually continuous white backing for the mark and section label, with the official orange-and-blue Block I variant. Light and vault themes retain their prior logo asset and backing; Intro wordmarks are unaffected. Build/package passed. Live lab screenshot verified the continuous white banner and navy-outlined orange I beside the orange section text, with the surrounding slide pattern visible.

## Dark footer seam — September 28

The dark logo and label now share a single white parent surface instead of adjacent painted rectangles, preventing a subpixel dark seam when the slide is scaled. Child backgrounds/borders/shadows are cleared within that dark-only wrapper. Light/vault and Intro markup are unchanged. Build/package passed; live section-slide screenshot after reload showed a continuous white banner without the vertical divider.


## 2026-10-07: Create presentation from note (0.3.3)

27 automated tests and TypeScript/esbuild passed. Installed matching bundles in docs and code_links_lab; reloaded docs through Community plugins. In the copied Fluid Kinematics chapter's Live Preview context menu, opened Create presentation from this note, changed the suggested title to Fluid Kinematics, and created it. Inspected the saved deck/slide: exactly one matching slide ID/path, intro type, four separate title/author/affiliation/date blocks, and the original source-note path. The docs UI showed Saved, SLIDES · 1, all four fields, and the rendered UIUC title-slide layout without overlaps. The starter files remain in docs for the user's workflow trial. Reading-view and file-menu entry points are implemented but have not been exercised in this UI pass.

## 2026-10-07 — Grady Convention (0.3.4)

28 tests and TypeScript/bundle build pass. Installed matching bundles in docs and code_links_lab. Verified the docs Fluid Kinematics title has no number by default; changing Slide numbering to Wrong Convention adds 1, and restoring Grady Convention removes it. Verified the two-slide Numbering Check lab deck in both editor preview and presentation mode: title unnumbered, next slide 1. Navigation controls retain physical slide positions. Legacy decks default to Grady Convention; explicit setting roundtrips.

## 2026-10-07 — Presentation folders and independent versions (0.3.5)

32 tests pass; TypeScript and bundle build pass. Store tests cover simultaneous same-title creation, separate title slides, independent slide/block IDs, repeated slide references, preserved order/themes/sections/source resolution, explicit sharing, missing-source and failed-write handling, and legacy migration with shared slides. In code_links_lab, duplicated Numbering check through the independent-copy action and created a third slide using + Add slide → Create a new slide. The copy and all three slide documents are in its dedicated folder; the original has two entries and remains unchanged. Both Copy and Share choices are visible in the Add slide menu. In docs, used Organize into presentation folder for Fluid Kinematics; title renders from the new nested path, deck/slide IDs retained, original slide bytes preserved. Bundles deployed identically to lab and docs. External scientific assets remain referenced, not duplicated.

## 2026-10-07 — Floating settings, filmstrip and trash (0.3.6)

35 automated tests pass and TypeScript/bundle build passes. In code_links_lab, inspected actual thumbnails and Style/Presentation/Section tabs; dragged the settings title bar and resized its bottom-right corner, confirming new bounds visually. Verified Cmd+Shift+, opens the modeless settings palette; Cmd+, remains Obsidian’s native settings. Dragged a single thumbnail and then a two-slide selection; order updated and Cmd+Z restored it. Shift+Down selected a range; Backspace moved both selected slides to the saved presentation trash, and Restore all restored original order. Duplicated a disposable lab slide, trashed it and confirmed Empty Trash; the file moved to recoverable vault trash and the bin became empty. Unit tests cover group-order preservation, trash roundtrip/restore, and retaining shared/note-linked files during emptying. Final refinements keep newly added/duplicated slides selected and keep modal keystrokes out of editor Undo.

Final gallery check: inspected the two-card presentation trash in the live lab UI, including rendered slide thumbnails, titles, prior positions, and Restore controls. Restore all returned all three fixture slides in their original order with an empty bin. Reloaded the docs plugin, opened Fluid Kinematics, and verified the thumbnail sidebar and Cmd+Shift+, settings palette with Presentation/Section/Style tabs in the dark vault theme.

## 2026-10-07 — Organizer, nested sections, and presentation reuse (0.3.7)

40 automated tests and TypeScript/esbuild pass. New tests cover legacy section migration without reordering, nested footer inheritance/override, cycle rejection, multi-slide movement into empty sections, trash membership, fragment ancestor retention, independent imports with remapped IDs, explicit sharing, and missing-source rejection before file creation. In the live lab UI, grouped the third slide as Results, changed its footer to Measured results and inspected the rendered thumbnail, browsed/imported a whole earlier presentation as independent copies, dragged Results before the opening section, moved a slide between sections, and nested Results using Move section into. Then selected one source slide in the gallery, chose Results as destination and Slides only, and verified insertion without an extra wrapper. The saved lab deck retains the nested demonstration; source presentation remains separate. The latest build also avoids a redundant same-name wrapper when a legacy source already has one section representing the entire presentation.

Installed matching 0.3.7 bundles in lab and docs. Reloaded docs, opened Fluid Kinematics, entered Organize and inspected the saved full-width thumbnail grid and controls in the dark vault theme. Its existing title slide remains the sole slide; only the compatible section metadata was added. Previous presentation-mode rendering reads the same flat slide order and the section-aware footer function. Option-drag nesting is implemented but this pass tested nesting through the explicit menu, not that modifier gesture.

## 0.3.8 — organizer dragging and free canvas

Fixed the reproduced failure where dragging slide 3 into the gutter between slides 1 and 2 instead appended it to the same position. Slot selection now includes gutters and wrapped rows. Native drag initiation is suppressed, pending click timers are cancelled on press, and a ghost plus insertion/landing marker provides drag feedback. Section headers accept before/after drops; free-canvas slide positions persist independently of order.

43 automated tests passed; TypeScript and bundle build passed. New tests cover gutter insertion, wrapped rows, empty/trailing space, group position clamping, unchanged order, and position serialization through trash/restore. Live lab checks: gutter drag changed [Folder workflow, Title, First numbered] to [Folder workflow, First numbered, Title]; free drag moved the second thumbnail into blank space and saved x=780,y=276; grid mode retained the order; dragging Results above its parent made it a preceding top-level section, and Undo restored hierarchy. Reloading the plugin preserved the free position. Two selected slides moved by the same x=125,y=110 and both saved coordinates. Updated plugin enabled in docs; Organizer layout selector and controls confirmed in the user's Fluid Kinematics presentation. No test slides added to the research deck.


## 0.3.9 — compact ordered sorter

Removed the Free canvas UI and spatial drag branch. Kept position metadata readable so existing presentation files remain compatible. Fixed-size 150 px thumbnails, 100–240 px size control, numbered hierarchical headers, collapse/expand all, and section selection checkboxes replace the oversized layout. Added slide-position insertion for selections and section-position insert/swap/reparent controls. Group selected now explicitly chooses section or subsection parent. Dragging uses a small label, dimmed source, insertion marker, nearest-section handling in gaps, and animation-frame edge scrolling.

45 tests passed and TypeScript/bundle build passed. Live lab checks: slide 3 inserted at position 1; section 3 swapped with section 1 with its subtree preserved; Collapse all reduced the gallery to three compact headers; dragging the last collapsed header before the first reordered it; the section checkbox selected three slides and Move selected transferred all three into Results, giving counts 0 and 4. Presentation changes were saved. Research deployment uses the identical bundle and styles. No research slide content modified.


## 0.3.10 — automatic themed outlines

49 tests passed; TypeScript and bundle build passed. Added coverage for immutable derived playback sequences, nested ancestors, title-first ordering, no-section/empty/title-only decks, legacy sections, saved option roundtrip, original content numbering, and bounded lists that retain the current section.

Live lab checks: enabled Show outlines through Settings → Outlines and verified the saved rail links. Inspected light and dark Shear strain outline previews with current section/subsection highlights, section progress, theme branding, and no slide number. Playback proceeded from the unnumbered title to an unnumbered Motivation outline and then content slide 1. Final dark preview showed all six top-level sections with Local deformation active and Shear strain highlighted.

Installed matching main.js, styles.css, and manifest.json in code_links_lab and docs. Reloaded docs through Community plugins, reopened Fluid Kinematics in Slide Studio, and inspected the Outlines tab and Show outlines control. Its one-title-slide deck remains unchanged with the option Off. Both installed plugins are enabled.


### Outline simplification and hierarchy labels

Removed the repeated current-title/breadcrumb/Next subsection block and Section X of Y counter. Section numbers now omit leading zeros and subsection labels carry the full hierarchy. Sections without children have no detail column. TypeScript/build and all 49 tests passed, including hierarchy labels at three levels and numbering after excluded empty/title-only groups. Live lab previews verified sections 1, 3, and 6 with subsections numbered 1.x, 3.x, and 6.x; the subsection column retains a stable top alignment. Matching updated files copied to docs.


### Visual connection between outline columns

Added a thin theme-accent connector from the active root row to a lightly tinted subsection panel, which retains its fixed top alignment. The panel has a matching accent edge. ResizeObserver follows wrapped row heights and panel size and disconnects with the renderer component. TypeScript/build passed. Live dark previews confirmed the connector and orange active subsection numbers for 3.2 and 6.3, including the long connector from the final section without overlapping text or footer. Parent section outlines intentionally do not select an individual subsection. Updated bundle/styles copied to both vaults.


Outline alignment correction: both root and subsection flex rows now use baseline alignment. Reloaded lab plugin and visually checked the 6 / 6.1–6.3 preview: small numbers align to the first text baseline in both columns. Source CSS copied to docs.

Inactive outline entries now share the same .58 opacity for both numbers and names in both columns, including future entries. Removed the additional number-only dimming. Live reloaded lab preview at 3.2 confirmed 3/3.2 emphasized and every other root/subsection label uniformly dimmed.


Consecutive ancestor outlines now collapse into a single transition highlighting the deepest newly entered subsection. Occupied ancestors remain in the outline hierarchy and numbering. 50 tests and TypeScript/build passed, covering three-level collapse, a title followed immediately by subsection content, and preservation of separate parent outlines when content intervenes. Live lab playback verified title → outline with 1.1 highlighted → subsection content numbered 1.

## 2026-10-07 — Citation integration

Citation fixtures: `Citation integration check` in code_links_lab; `Presentations/Citation integration check` in docs. Bibliographic entries there are explicitly labelled interface test sources, not research evidence.

Verified in the native Obsidian UI: numbered citations, the three-reference footer, unchanged normal footer on an uncited slide, repeated-paper numbering, six-source overflow link, two generated reference sheets, and full-screen reference details. In docs, the same reference number on two slides opened two distinct Study Studio evidence readers, labelled First claim and Second claim, with the respective passage selected. The older Study Studio in code_links_lab does not register study-evidence; this was checked in docs instead without modifying Study Studio.

Automated regression coverage includes citation grouping/locators, literal-code exclusion, exact evidence-key matching, per-occurrence evidence identities, bibliography deduplication, explicit missing entries, pagination and bibliography-frontmatter round trips, along with the existing slide/section/outline tests.

Final checks: 56 automated tests passed. Light and dark native views were inspected, including all five entries of the first References sheet without clipping. Citation colors inherit the vault's `--pwc-citation-color` with a darker shade on light slides. Both installed bundles were compared to the source build. The docs plugin was reloaded for live acceptance.

Follow-up acceptance: clicking the first footer reference opened the First claim evidence reader directly. Clicking the same paper on the References page opened the two-passage chooser; selecting its second slide opened the Second claim reader with the correct selected passage. Footer and bibliography source clicks retain the existing colors; right-click retains access to full reference details.

Final requested interaction: normal citation clicks now prefer the vault PDF; web version is the fallback when the local PDF is absent. All citation context menus offer Open PDF, Open web version, Reference details, and Open evidence viewer when an evidence record is linked. Verified against real bibliography entries for Sun et al. (2017) and Hoang & Johannes (2025): a normal Sun footer click resolved the evidence record in research_2025 and opened the existing `pdfs/Sun et al 2017 - Disentangling the role of small polarons and oxygen vacancies in CeO2.pdf` in Obsidian's PDF reader. The menu labels and resolved bibliographic metadata were checked in docs. Source paths were discovered, not manually added to the bibliography. The final suite has 57 passing tests.

## 2026-10-07 — presentation embeds (0.3.12)

Built with TypeScript/esbuild; all 60 tests pass. Installed matching main.js, styles.css and manifest.json in code_links_lab and calc-manager/docs; both remain enabled.

Native Obsidian acceptance in code_links_lab: two note embeds rendered in Live Preview and Reading View, advancing the dark deck left the light deck on its original page, and clicking the dark slide opened its Slide Studio presentation. The note editor's right-click menu displayed Embed presentation…; its gallery displayed four preview cards per page, independent arrows, a folder selector and search. Searching Direct subsection returned one deck; Next displayed its generated outline; Insert presentation inserted a third block and preserved the original note and both existing embeds. Inspected native screenshots of both the note and gallery in the light vault theme. In docs, the embedded Published sources deck rendered in the dark vault theme, and Next displayed its generated references page with both real bibliography records. The source slide, deck, and reference renderers are reused rather than screenshot exports.

Generated embed blocks include a stable ID with a human-readable path. Direct editing of path-only handwritten blocks has no automatic rename repair; generated embeds resolve by ID when the recorded path changes. Navigation position is component-local, not saved in note contents. Slides within preview surfaces open the deck; their internal source controls are accessed in Slide Studio. No research presentation content was changed; test notes reference existing decks.


## 2026-10-07 — Fluid dynamics course themes (0.3.13)

Added Fluid dynamics light/dark using the Viscous Fluid Flow scripts (appended-stage-figures.py and create-flow-visualization-vector.py) as color sources. All 61 tests pass, including theme serialization and switching back to UIUC/individual themes. Native lab previews rendered the light title and outline and dark outline; docs Settings > Style exposed both presets and applying Fluid dynamics light updated the demo and saved its palette. Source and both installed bundles match. Fixed note-level image rules exposing both title logo variants, recorded in the vault plugin issue log.

## 2026-10-08 — 0.3.14 editing fidelity

Build and 61 tests pass. Native code_links_lab checks: opening Edit slide from a Fluid Dynamics deck retains its palette; title text keeps its size on entering native editing; Escape leaves the slide open; Back to presentation is available. Context preserves deck-relative footers, page labels and citation preparation. The single appropriate light title logo renders. Math Studio 0.1.1 opens from Cmd+Shift+M in the embedded editor; x^2+1 persisted as native LaTeX. Docs plugin files match the built source and were reloaded. Context is a view state, not a rewrite of the shared slide's default theme. Live synchronization of a parent deck changed in another editor remains unimplemented and is recorded in the vault issue log.

## 2026-10-08 — Direct editing from the presentation (0.3.15)

The main slide preview now opens the double-clicked block in the slide editor with presentation context. Escape and Done save before returning to the same deck occurrence and restore the slide-rail scroll position. Images open selected with move/resize handles. A native View scope handles Escape before global Obsidian shortcuts; inline text retains its own editor scope. Failed or conflicting saves prevent navigation.

All 67 automated tests pass, including deferred saves, duplicate activation, save conflicts, failure/retry, standalone exit, repeated slide occurrences, theme context, and scoped Escape. TypeScript/build and git diff whitespace checks pass. Native Obsidian 1.14.4 acceptance covered dark Fluid Dynamics text in code_links_lab (temporary marker saved, returned, then removed) and docs seminar title/body/image double-clicks with Escape. The docs image test initially exposed global Escape switching tabs; after using a View scope, the image returned to slide 2, and text returned to selected slide 3. Visual inspection confirmed light/dark Fluid Dynamics styling, footer, page number and block dimensions. Final native view is the user's seminar slide 3. Nested third-party modals were not re-tested in this pass.

Source and installed main.js/styles.css/manifest.json match in docs and code_links_lab. The final scoped Escape build was reloaded and exercised in docs; the lab bundle is updated on disk (earlier native text test used the preceding build). Source and previous installed bundles were backed up under ~/Library/Application Support/SlideStudio/backups/2026-10-08-direct-edit.

Git recovery: the active integration source had no .git directory. It now has local history based on the existing obsidian-slide-studio repository's 4a2a00d checkpoint. Commit 7f7230a preserves the accumulated source through 0.3.14; the direct-edit change is a separate subsequent commit. The old checkout is untouched. These recovered commits have not been pushed; the last verified remote codex/slide-studio commit remains 4a2a00d (September 28).


## 2026-10-08 — Escape remains inside Slide Studio (0.3.16)

Reproduced from the docs Start here embedded seminar: the first Escape returned from title editing to the deck, but an additional Escape fell through the view scope to a global Obsidian action and activated Start here. The prior 0.3.15 checks had tested the editing exit without exercising further Escape presses on the returned preview.

The view now consumes Escape on the deck and standalone-slide surfaces, including repeat events; it explicitly focuses the returned deck stage. Footer cancellation is routed through its existing restore-and-blur action, while nested dialogs retain their own scopes. Build and all 69 tests pass, with regression cases for repeated Escape and deck focus. Native checks started from note embeds in code_links_lab and docs. In docs, opened seminar slide 3, edited its body without changing text, pressed Escape and then Escape twice more: the same deck/slide stayed active. A separate double-clicked footer also exited its local text field with Escape. No slide content was changed during these checks. Final native view remains seminar slide 3 with the user's modified title preserved.

Both vaults have matching 0.3.16 source bundles. Final footer integration was reloaded and verified in docs; the preceding repeat-Escape behavior was verified in the lab, whose on-disk bundle is also updated. Rollback bundle: ~/Library/Application Support/SlideStudio/backups/2026-10-08-escape-containment. This fix is committed locally; no push was performed.


## 2026-10-08 — Context menus, keyboard navigation, and Go to slide gallery (0.3.17)

Removed Add slide, Bring in, and Trash from the slide rail. Registered named commands and shared handlers for creation, import, trash, navigation, organization, guide/menu access, and section/selection operations. Existing document actions and block/text context menus remain available. Section-header right-click exposes the existing section actions. Native view/editor scopes resolve shortcut conflicts within Slide Studio; testing caught Study Studio intercepting Cmd+Option+G before the scoped routing was added. Saved custom bindings override defaults. Keyboard documentation is accessible from both a command and context menu; playback has a separate navigation-only menu/help.

Go to slide is a shared, lazily rendered thumbnail gallery in overview and fullscreen playback. Numeric filtering is exact; title filtering is case-insensitive. Playback includes outline/reference previews with their own captions. Thumbnail rendering and observers are owned by the gallery component and unloaded on filtering/close. Source Markdown is not changed by navigation.

All 73 tests and TypeScript/build pass. New cases cover selected-slide trash membership, save-conflict prevention before deck actions, numeric/title gallery filtering, and platform-specific shortcut matching. Native lab acceptance: clean rail, Cmd+Option+G gallery, searchable shortcut guide, title search to Shear strain, numeric jump to Conclusions, thumbnail click to Shear strain, and fullscreen G/right-click navigation gallery. Playback menu had only navigation/help/exit actions. Native docs acceptance: menu at slide 12 after scrolling, Add slide/Bring in/Trash shortcuts (dialogs cancelled, no content created/imported/deleted), gallery jump to slide 3, and invoking the gallery from its native text editor. Screenshots visually inspected thumbnail themes and scientific content. Final docs view is the seminar gallery. Both installations match source main.js/styles.css/manifest.json. No Git push performed in this change.

## 2026-10-08 — Slide zoom and fullscreen image detail (0.3.18)

Added a shared transform-only viewport with pointer-anchored zoom, bounded pan, fit/reset, resize handling, and component-owned gesture cleanup. The main overview/editor retains its zoom through editing transitions without altering slide geometry. Context commands and the shortcut guide expose conventional Cmd/Ctrl+=, −, and 0 bindings; the initially attempted Cmd+Option+= conflicts with macOS accessibility zoom and was replaced before release.

Playback figures open an original-resource image viewer inside the fullscreen presentation. It supports mouse/pinch zoom, drag and keyboard pan, context actions, keyboard activation, and return to the exact slide. Native acceptance exposed Chromium leaving fullscreen on Escape before the image handler ran; the presenter now owns an Escape scope and handles fullscreen exit while closing image detail, restoring fullscreen where supported and retaining maximized playback otherwise. Linked images and footer logos retain existing behavior.

Build and all 86 tests pass. New coverage includes anchored/clamped zoom, pan constraints, resize bounds, wheel routing, pointer capture and cleanup, no layout reads while dragging, preservation of native text scrolling, command routing without edits/saves, and image-layer isolation from slide navigation. Lab fixture: Zoom inspection check/Slide.md (disposable, existing K-point convergence image). Native lab checks: keyboard zoom/fit, menu zoom, image click and Tab/Enter activation, image +/- and arrow pan, fit, and Escape returning to fullscreen playback. Native docs checks: main-view zoom on seminar slide 2, editor/Escape return, image detail on the actual lagrangian-motion-blender figure, visually verified arrow panning, viewer context-menu zoom, Escape returning to slide 2, and playback gallery still working. Native wheel/drag automation on the docs external display was blocked by the computer-use coordinate targeting error; those event paths were exercised in automated controller tests instead. Pinch needs a physical trackpad check.

All 84 Markdown files in the docs playground retained their pre-test SHA256 hashes. Installed main.js/styles.css/manifest.json match source in lab and docs. Rollback bundle: ~/Library/Application Support/SlideStudio/backups/2026-10-08-zoom. This change is checkpointed locally; no Git push performed.

## 2026-10-08 — Direct gallery resizing and thumbnail zoom (0.3.19)

Kept the original 1100px opening-width ceiling and 230px default thumbnail minimum. Added direct corner resizing to the overview modal and fullscreen gallery, a draggable thumbnail-size slider, and pinch/Ctrl/Cmd-wheel zoom. Ordinary scrolling remains browsing. Thumbnail columns respond to the actual available width; existing rendered slide surfaces resize without reconstructing their Markdown. Gallery-specific keyboard bindings and context actions are removed when it closes. Fill-window/reset remain optional context/keyboard actions without adding toggle buttons. Closing/reopening starts at the original compact default.

Build and all 91 tests pass. Layout tests cover the unchanged default, narrow and wide windows, exact column/gap boundaries, bounded thumbnail sizing, and accumulation of small pinch deltas. Native lab checks verified the original four-column gallery, larger previews, corner dragging in both overview and fullscreen playback, thumbnail dragging from 100% to 250%, reset, and scoped zoom shortcuts while the search field is focused. The native range drag did not continue reliably during testing; explicit pointer capture fixed continuous mouse dragging. Docs acceptance verified scientific thumbnails, responsive fill-window layout, reset, slide-number selection, playback gallery enlargement, and sizing context actions. Physical trackpad pinch is implemented via Chromium pinch wheel events but not manually verified with a trackpad.

All 84 docs playground Markdown files remained byte-identical to their pre-test hashes. Source and installed bundles match in docs and code_links_lab. Rollback bundle: ~/Library/Application Support/SlideStudio/backups/2026-10-08-gallery-size. Local Git checkpoint only; no push performed.

## 2026-10-08 — Remove the gallery slider (0.3.20)

Removed the thumbnail slider and its pointer handlers at the user's request. Pinch/Ctrl/Cmd-wheel, gallery-corner resizing, keyboard shortcuts, and context actions remain. The slide count shows a small zoom percentage only when the gallery differs from its default scale. Updated help and removed the unused slider styles. Build and all 91 tests pass. Native lab verified slider absence and keyboard thumbnail zoom; docs gallery was reloaded and visually inspected with the original compact layout and no slider. Both installed bundles match source. Physical pinch remains unverified, as documented above.


## 2026-10-08 — Numeric titles and convention-aware slide search (0.3.21)

Gallery numeric search prioritizes the printed slide number, then includes matching titles without duplicates. #69 restricts results to printed number 69. Overview and playback gallery captions share the renderer's numbering calculation, following Grady Convention or Wrong Convention; unnumbered slides remain searchable by title. Direct numeric entry during playback now uses the same numbering, skipping generated outline/reference pages. Organizer/rail positions remain physical ordering controls. Updated gallery hints and shortcut documentation.

Build and all 95 tests pass. Regression coverage includes number/title collisions, leading zero and spaced exact queries, titles when a matching printed number is absent, both numbering conventions, later title slides, disabled pagination, and direct playback navigation across generated pages. Native lab acceptance used 69-entry disposable decks with a title beginning “69” at physical position 67: Grady gallery shows number 66 and #1 selects physical slide 2; Wrong Convention shows number 67 and #1 finds the opening title. Bare 69 finds the title under both conventions and prioritizes printed slide 69 when present. Playback gallery and direct 1+Enter were verified under Grady Convention. Native docs #2 opens physical slide 3 and its visible footer reads 2; the user's modified content remains intact.

All 84 docs playground Markdown files retained their pre-test hashes. Source and installed bundles match in docs and code_links_lab and both plugins are enabled. Rollback bundle: ~/Library/Application Support/SlideStudio/backups/2026-10-08-numeric-search. Local Git checkpoint only; no push performed.


## 2026-10-08 — Current/total footer numbering (0.3.22)

Added Settings → Style → Number display, with Current/total as the requested default for new presentations and existing decks without an explicit format. Current remains an explicit per-presentation option. Numerator and denominator use the same Grady/Wrong Convention calculation. Generated outlines and reference sheets contribute to neither value. Grady Convention also excludes title slides. There is no separate backup-slide designation; saved slide entries count under the chosen convention. Gallery captions/search and direct numeric playback navigation use the current number independently of the formatted footer.

Build and all 99 tests pass, covering serialization, legacy/default/explicit format behavior, both conventions, title-only/empty decks, repeated occurrences and missing entries, totals after removal, hidden pagination, outline exclusion, and numeric navigation with outline and reference pages. Native lab settings verified keyboard access, Current/total selection, 67/68 under Grady changing to 68/69 under Wrong Convention, and 1/69 on the title during Wrong Convention playback. The final default build was reloaded in docs: the existing seminar (one title and 11 content slides, plus four derived outlines) displayed 2/11 after #2 navigation without editing its source. All 84 docs playground Markdown files remained byte-identical. Both installed bundles match source and plugins remain enabled. Rollback bundles: ~/Library/Application Support/SlideStudio/backups/2026-10-08-number-total. Local Git checkpoints only; no push performed.

## 0.3.23 — Research Outline integration

105 tests pass; build passes. Versioned read-only outline provider emits sections/subsections/slide occurrences in presentation order, preserves printed numbering, and skips title-only/empty section numbers. Research Outline private fork consumes the provider, retains note colors/math/search/collapse, and restores notes when Studio is left. Navigation from editing waits for draft save and aborts on conflicts. Sidebar jumps reveal the matching thumbnail on the left.

Native lab and docs full-lecture checks: section and subsection jumps, three-level hierarchy, note restoration, editor Escape, and distant Conclusions jump with visible selected thumbnail. All 84 playground Markdown hashes unchanged. Both installed Slide Studio copies match this source build. Private outline source and migration evidence are in /Users/gradyclopton/Projects/obsidian-research-outline.

## 2026-10-08 — Continuous presentation embed gallery (0.3.24)

Replaced four-card pagination with a scrolling grid; search and folder controls stay above the scrolling area. A single IntersectionObserver loads interactive previews within 200px of the viewport, with keyboard-focus loading as well. Loaded cards retain their preview position until filtering or closing; cleanup unloads child embeds and disconnects the observer.

Build and all 105 tests pass. Native lab: 14 decks, later rows load while scrolling, no-match search and Fluid filtering work. Native docs: all nine decks reachable, including the final Polaron Geometry deck; next-slide preview works. Both dialogs cancelled without insertion. Installed main.js/styles.css/manifest.json match source in both vaults. No presentation content edited.

## 2026-10-08 — Consistent insertion wording

Renamed the note context actions, command-palette label, picker title and recovery hint to Insert presentation. Retained the embed-presentation command ID and stored syntax for compatibility. Updated the gallery guide to describe scrolling. Build passes; native lab command search finds Slide Studio: Insert presentation and opens the renamed gallery.


## 2026-10-08 — Compact document windows (0.3.25)

Shared document-view Markdown processor supports same-vault notes and PDFs in Live Preview, Reading View, slide editing and playback. Insert note/PDF menus and commands offer heading/block or starting-page targets. Click the title to enlarge; context menus open the source or refresh. The default inline card is centered, 440px wide with a 560px scrolling body, responsive to available width/height, compact Markdown text, rounded corners and a subtle shadow. PDFs start at full-page fit using an isolated native-viewer adapter. Slide cards follow saved block geometry.

All 109 tests and the TypeScript/bundle build pass. Tests cover path serialization/validation, progressive paragraph batches preserving fenced code and display math, and document modal Escape ownership during playback. Native lab acceptance covered internal scrolling through 89 paragraphs, nested-document recursion guards, Markdown/math/theme preservation, a one-page plot PDF, an 18-page lecture PDF starting on page 2, page navigation, enlarged viewing, and returning to the same presentation with Escape. Final compact layout visually checked with both Markdown and a complete portrait PDF page.

Research-vault acceptance: Document windows - preview.md displays the formal-figures chapter and lecture PDF in narrow centered cards after app reload, in both Live Preview and Reading View. Insertion picker/options and panel context menus were checked without inserting into the chapter. Both installed bundles match source and Slide Studio remains enabled. Previous bundles and chapter copies are under ~/Library/Application Support/SlideStudio/backups/20261008-document-panels. Git checkpoint is local only; this checkout has no remote.

Limits: Markdown progressively appends content rather than virtualizing already loaded batches. Enlarging starts at the configured page/section; the underlying card retains its position. Source changes need Refresh for Markdown. Hover Editor itself was not modified. Two earlier research-window renderer crashes occurred before this feature was deployed there, including an idle crash at 15:44. Crash reports show a V8/cppgc fatal-allocation abort but do not identify a plugin or establish the cause. Workspace recovery preserved chapter contents; this feature is not a claimed crash fix.


## 2026-10-08 — Filtered document gallery and cross-vault PDFs (0.3.26)

All 112 tests and TypeScript/bundle build pass. New tests cover empty embed trigger boundaries, source replacement ranges, vault identity fallback/ambiguity, PDF-only scans, cancellation, and path/symlink containment. Native lab verified typing ![[ opens the gallery, image thumbnails/type filter, note search, selected-vault PDF scanning, and insertion of a research_2025 paper targeting physical page 2 without copying the PDF. The resulting window painted the page, scrolled internally to the next page, enlarged, and returned on Escape. Final gallery keyboard test traversed fifteen rows with focus retained after virtual row replacement. Full-width search and final Markdown previews visually inspected.

Installed and reloaded in docs. Insert note lists 1,876 notes; a name/path query returned 48 formal-figures documents with native themed previews. Only nearby rows are mounted and two preview jobs run concurrently. Research chapter and presentation sources were not edited by acceptance; the disposable lab Document gallery check.md contains the cross-vault example. No performance benchmark or crash-cause claim is made. Existing slide document renderer and commands reuse this gallery; cross-vault playback was not separately exercised in this change. Empty ![[ interception currently applies to ordinary Markdown views; slide editors retain their insertion commands.

Source/installed bundle equality checked in both vaults. Previous installed files are backed up under ~/Library/Application Support/SlideStudio/backups/20261008-document-gallery. Local Git checkpoint only: this checkout has no remote. External PDFs use read-only canvases; cross-vault Markdown/images remain unsupported. Resource limits and workflow are documented in README.md.


## 2026-10-08 — Scientific figures and tables (0.3.27)

120 tests and TypeScript/bundle build pass. New coverage exercises YAML roundtrips, separate numbering, excluded objects, literal fenced examples, merge/split text preservation, atomic TSV paste, span/crop validation, cell shading persistence and merged-cell range selection.

Native code_links_lab acceptance: note Live Preview and Reading View render numbered and unnumbered figures, panel labels, captions with math, and grouped tables. Context-menu editing saved a changed cell value/alignment and a slide figure title. Slide playback and editing were visually checked in vault dark, UIUC light and UIUC dark themes; Escape returned to the deck. The table context menu selected a complete row, applied a blue tint, and saved all six cell backgrounds in source. Neutral object frames and table typography were inspected. Cropped source images rendered; crop drag interaction was not separately exercised.

Native docs acceptance after reload: Scientific objects - preview.md renders all three synthetic objects, including the shaded row. Callout Outline lists the two figures and table with correct independent numbering; clicking Table 1 scrolls to it. Only the new synthetic preview and its two assets were created in docs. Existing research prose and slides were not edited.

The new scientific fences require Slide Studio to render; they do not migrate existing callouts or share numbering with legacy figure callouts. Tables support rectangular selections, whole-row/column expansion, tint presets/custom hex, clear fill, merge/split, alignment and TSV paste. Row/column removal is restricted to empty, unmerged rows/columns. Large-table performance has not been benchmarked. The optional Callout Outline integration wraps the active instance and restores it on unload; third-party plugin files are unchanged.

Installed main.js, styles.css and manifest.json match the source build in code_links_lab and docs. Rollback copies are under ~/Library/Application Support/SlideStudio/backups/20261008-scientific-blocks. This checkout has no Git remote, so its checkpoint is local.

## 2026-10-08 — Caption typography and Math Studio fields (0.3.28)

124 tests and TypeScript/bundle build pass. New tests cover integral replacement without changing adjacent prose/equations, empty inline delimiter caret handling, code exclusion, multiline display-math YAML roundtrip, stale replacement rejection and unsupported macros.

Native code_links_lab: titled Figure 1 and untitled Figure 2 render a bold label on the same line as title/caption. Integral captions and table cells render. Caption context menu opens Text and math with clickable equation previews. Ctrl+M on an existing caption integral opened the installed Math Studio frame; changed the integral from 0..1 to 0..2, saved the equation, applied text, saved the figure, then verified rendered output and persisted source. Math Studio was installed but disabled in this lab; it was enabled for this check. Production docs already had it enabled.

Installed and reloaded Slide Studio in docs. The existing Scientific objects - preview note renders the corrected caption line and Callout Outline still lists Figure 1/Table 1. Existing note content was not changed. Source/installed bundles match in both vaults. Rollback files are under ~/Library/Application Support/SlideStudio/backups/20261008-caption-math-and-citations. Native acceptance of this change covered notes; the shared slide renderer/editor is unchanged apart from this shared caption/field implementation, but playback was not separately exercised in this pass.


## 2026-10-08 — Christmas Eve theme (0.3.29)

125 tests pass; TypeScript and bundle build pass. Added model coverage for theme serialization, deck inheritance, preserved slide content/numbering, and clean switching back to existing presets.

Native code_links_lab acceptance inspected title, outline, equation, figure, table, closing scene, and presentation gallery. Playback snow was visible while gallery/editor previews stayed static. Visual checks caught newline-separated headings and short scientific-object frames in the disposable demo; the generator/fixtures were corrected. Complete table caption and frame were rechecked in the lab.

Installed and reloaded in docs, opened the new chapter-local Christmas Eve preview, and checked the corrected figure/caption, theme rendering and editing/Escape return to the deck. Original research slides were not changed. Main.js, styles.css and manifest.json match the source build in both vaults. Rollback files are under ~/Library/Application Support/SlideStudio/backups/20261008-christmas-theme. Reduced-motion, hidden-document pausing and print rules were code-inspected, not separately toggled in the OS. No frame-rate benchmark was performed. The Git checkpoint is local because this checkout has no remote.


## 2026-10-08 — Christmas Night and Christmas Light naming (0.3.30)

126 tests and the TypeScript/bundle build pass. New regression coverage checks legacy Christmas Eve compatibility, Light/Night roundtrips, custom-logo preservation, unchanged slide content/numbering, and restoring other presets without leaving the night palette behind.

Native code_links_lab: inspected static nighttime title/editor previews and active playback with snowfall and staggered bulb brightness. Equation contrast and the compact village footer were visually checked. Settings → Style listed both Christmas Light and Christmas Night; switched the disposable deck to Light and back to Night through that menu.

Installed/reloaded in docs, opened the new chapter-local Christmas Night preview and inspected the title during playback. The original green preview and user presentations were not edited. Both vaults have main.js/styles.css/manifest.json identical to source. Previous docs bundle is under ~/Library/Application Support/SlideStudio/backups/20261008-christmas-night/docs. Reduced-motion, print and hidden-document animation pausing were code-inspected rather than toggled in the OS. No formal performance benchmark was run. Git checkpoint remains local; this checkout has no remote.


## 2026-10-08 — Independent Christmas bulb rhythms (0.3.31)

126 tests and TypeScript/bundle build pass. Each bulb now uses its own unequal period and phase, with three irregular brightness patterns containing gentle pauses. Fixed samples keep previews reproducible; animation remains CSS opacity only, with no JavaScript frame loop. Existing playback-only, hidden-document, reduced-motion and print rules remain intact.

Native lab playback was inspected at different moments: individual bulbs change brightness independently. Installed/reloaded in docs and visually checked the nighttime title in playback. Both enabled installations match main.js, styles.css and manifest.json from source. Prior docs files are backed up under ~/Library/Application Support/SlideStudio/backups/20261008-christmas-twinkle/docs. No presentation content was changed. Checkpoint is local because the checkout has no remote.


## 2026-10-08 — Authorized local suite and new-vault rollout

User requested all of today's updates in the other vaults and the new-vault setup. Installed the exact writing-vault-verified release artifacts for Slide Studio 0.3.31, Math Studio 0.1.1, Study Studio 0.1.0, Image Gallery 0.3.1, Research Outline 0.1.0, Research Colors 0.1.0, Code Links 0.4.0 and Ink Studio 0.1.0. Existing configured registrations covered 46 local vaults, plus ~/utils/ObsidianConfig. Agenda, chemistry and finite_elements have no .obsidian configuration and were skipped. Lab directories outside the registration list were not included.

The installer preserves existing plugin data and appearance, copies each vault's own legacy settings only on first fork migration, remaps the corresponding hotkey prefixes, retains original third-party plugins disabled, and changes saved quiet-outline leaf types to research-outline. Existing intentionally disabled suite plugins stay disabled. New installations are enabled. No note/slide content is copied or rewritten. ocreate was inspected and copies this exact template; no new registered vault was created for testing.

All release files, including Math/Ink runtime assets and the citation export filter, were hash-checked against the tested writing-vault installation before rollout and verified at every destination. Final read-only rerun reports zero differences across all 47 configurations. Native research_2025 reload checked the 479-note document gallery, Math Studio commands in Markdown context and Research Outline following the open Paper Index. This is a representative startup/registration/rendering check, not exhaustive runtime testing of all vault combinations. Other already-open vaults require reload/reopen to use updated code.

Primary backup, receipt and immutable verified-release copies: ~/Library/Application Support/SlideStudio/backups/suite-rollout-20261009T023956Z. Saved-outline migration follow-up: suite-rollout-20261009T024103Z. Directory timestamps use UTC; the user-facing rollout date is October 8 in America/Chicago. Changes are on Little brother only; no remote Mac deployment or Git publication was performed.
