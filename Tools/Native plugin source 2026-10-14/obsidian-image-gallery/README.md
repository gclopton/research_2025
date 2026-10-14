# Image Gallery

A standalone Obsidian desktop plugin for finding local vault images by thumbnail, filename, or path. Tested in Obsidian 1.13.7 on macOS with Blue Topaz and nested callouts.

Place the cursor on the desired line and run **Image Gallery: Insert image from gallery**. In a callout, use an existing blank quoted line. Right-click a rendered image to replace that occurrence, align it, set a pixel width, or reset its dimensions. Width changes preserve the image's aspect ratio. Existing explicit width × height metadata is retained until a width/reset action is requested. The default insertion is centered at 600 px; natural-size images remain bounded by the reading column.

The picker starts in the current image's folder, the configured Images folder, or the note's attachment folder. Select **All vault images** to search the whole vault. A gallery choice changes the embed only; it never overwrites, renames, deletes, uploads, or downloads image files. Markdown link titles, captions, callout prefixes, unrelated text, and other references to the same file are retained. Unsaved/stale note changes cause an explanatory refusal instead of an overwrite.

Inline Markdown images and Obsidian wiki image embeds are supported in Reading view and Live Preview, including nested callouts. Existing `![center|800](path)` conventions are retained. Same-line repeated images are independently editable in Reading view. When Live Preview cannot map a widget uniquely, use Reading view as prompted. Reference-style Markdown images, arbitrary HTML images, Canvas, and external-image browsing are outside this version. Disable the plugin to remove its controls; note links remain ordinary Markdown/wiki embeds.

## Keyboard controls

Right-click an image and press a number: **1** replace, **2** layout and width, **3** left, **4** center, **5** right, **6** natural size. Escape dismisses the menu. These keys are active only while that menu is open.

For mouse-free use, place the editor cursor inside the image link (or anywhere on a line containing only one image), open the command palette with Cmd+P, and run **Image Gallery: Open image controls at cursor**. You can assign that command a hotkey in Obsidian Settings. Ambiguous same-line images require placing the cursor inside the intended link.

Version 0.1.1 aligns the embed wrapper as well as the image, including Live Preview's extra image-wrapper and callout embeds. An image that fills the available column has no horizontal space to move; reduce its width to see alignment differences.

## Installation and build

Copy `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/image-gallery/` in the intended vault, then enable Image Gallery. Keep existing `data.json` when updating. `npm ci`, `npm test`, and `npm run build` reproduce the build. No network service or account is required by the plugin.

## Optional picker API

Other plugins can discover `app.plugins.getPlugin('image-gallery')?.api`. Check `api.version === 1`, then call `await api.pickImage({ sourcePath, currentPath, title })`. It resolves to the selected Obsidian `TFile`, or `null` on cancellation. All options are optional vault-relative strings. The picker itself does not edit any document. Consumers must retain their own stale-state guards and provide their own fallback when this plugin is absent. Do not treat cancellation as a reason to launch a second picker.

## File galleries in notes and slides

Right-click in a note's editor and choose **Insert image from gallery**, **Browse files to link**, or **Browse code to link**. Inside `[[...]]` or `{{...}}`, **Browse this link in gallery** starts with the existing target as the search. Selecting a result replaces that target and retains its alias or selection suffix. Native Obsidian autocomplete remains available. Ordinary files use wiki links; code and data use Code Links. Unsafe filename characters produce an explicit message rather than a malformed link.

The image picker searches nested folders. **Images folders**, **Assets folders**, and **Figures folders** filter by folder name at any depth; **All image locations** combines them and other locations. The folder-prefix field limits the search to a subtree.

The file gallery uses Obsidian's fuzzy filename/path matcher. Notes, PDFs, images, and code have separate filters and individually scrollable previews. Each card has its own **Insert link** button. **Code and data** enables the source selector for configured Code Links folders. Those folders are indexed individually, so one large archive cannot exhaust another folder's allowance. Hidden directories, Python caches, virtual environments and node_modules are excluded. A selected linked folder is limited to 50,000 files with a visible notice; use a smaller configured root for larger archives. Directory symlinks are not followed.

Code previews have language labels and theme-aware syntax highlighting, including Python, Wolfram Language (`.wl`, `.wls`, notebook source `.nb`), JavaScript, TypeScript, C/C++, Julia, R, Fortran, MATLAB, shell, Lua, JSON, YAML and TOML. VASP outputs and plain text remain plain. A private Prism instance prevents interference with Obsidian's own highlighting.

Previews are bounded: notes show the first 40,000 characters, code/text the first 256 KB, and PDFs up to 60 MB render one page at a time with a **Load page** button. Limits are stated in the card. Unsupported binary formats offer insertion without pretending to render their contents. Previews never execute code.

In Slide Studio 0.3.2, right-click the canvas to add an image, file link, or code link. **Add linked note** uses the gallery to select a note to embed. To replace a link inside slide text, choose **Edit on slide**, then right-click inside the brackets. Insertion uses the native editor and Slide Studio's save/undo path; stale or closed editors cannot overwrite another block. The inspector's plain textarea does not expose the native editor menu; use **Edit on slide** for that interaction.

The optional API also exposes `pickFile({sourcePath, query, kind, title})`, returning `{path, link, code}` or `null`. Feature-detect `pickFile`; existing `pickImage` callers remain compatible. The caller owns saving and stale-state checks.

Both galleries provide **☆ Favorite folder** and a **Favorite folders** menu. Favorites save to this vault’s plugin settings and are shared between notes and slides. Code favorites retain the linked-root alias and optional subfolder; vault favorites can also be recalled in the image picker. Click **★ Favorited** to remove a shortcut. Selecting a favorite clears the search and folder-category filters while retaining the file type.

## Browse folders without typing paths

Both pickers have **Browse folders…**. Navigate by child folders, **Up**, or the breadcrumb buttons, then select **Use this folder**. Only the current directory's children are listed; navigating does not render file previews. The file gallery also browses nav-linked external roots. **Include subfolders** controls recursive results. A newly selected external root starts with direct children only, so opening a large archive does not trigger a full recursive scan. Typed external folder paths now scope the actual scan instead of merely filtering a scan of the entire root.

Folder and search typing waits 250 ms before filtering, stale preview work is cancelled, and pagination reuses the filtered list. Syntax-colored code starts with 24 KB; **Load more code** adds the next chunk, up to the existing 256 KB preview limit. The source link still opens the complete file. External scans retain the 50,000-file bound within the chosen folder.

## Paper cleanup status

Paper-library cards show ✨ for a recorded OCR cleanup review and 🤢 while awaiting review. Hovering the icon gives its meaning and the review date. A conversion alone does not qualify. After comparing the Markdown with the published PDF and checking its equations, figures, tables, references and evidence selections, run `python3 scripts/paper-library.py --vault VAULT mark-cleaned SOURCE_ID`. The catalog records the reviewed PDF and Markdown hashes. The sparkle records a dated review, not continuous certification of later edits; repeat the review after replacing or substantially revising the conversion. Card rendering reads metadata only.

### Cleaned paper protection

A registered cleanup review makes the canonical PDF, Markdown conversion and sibling `images/` assets read-only through Obsidian. Markdown notes inside `images/` remain ordinary notes. Highlights, underlines, text-color annotations, math annotations, margin notes and post-its remain in Study Studio's separate review layer. Source text and source-file timestamps do not change when annotating.

Use **Create working copy of paper…** in the command palette, or **Create working copy…** on a paper card/file menu. A descriptive suffix is required; the copy is placed in `Paper notes/`, records `workingCopyOf` and a source link, and rebases local image links. Canonical paper titles, filenames and retired aliases are reserved throughout a catalog-enabled vault. Existing conflicting notes are reported rather than renamed. Same-file section links remain local to a working copy.

Move a cleaned conversion's whole folder to retain relative assets. Automatic link shortening after such a move is ignored only for 15 seconds on that relocated path, when both link spellings resolve to the same file and all other content is identical. Protected bytes are never rewritten for that maintenance operation.

Protection applies while Image Gallery is enabled. Direct filesystem/Git writes bypass Obsidian; changed open files are reported and stay protected, without automatic reversion. The explicit integrity check hashes reviewed conversions and scans reserved names across the vault. Opening the library does not hash every paper. A missing plugin or disabled plugin is not an operating-system lock.

Acceptance (2026-10-13): 52 TypeScript tests and two Python intake tests pass. Native Obsidian 1.14.4 lab checks cover rejected source writes/deletes/copies, image protection, unchanged annotation bytes and mtime, same-tab read-only transitions, post-it creation with editable math, working-copy edits and images, whole-folder moves, PDF intake, and reporting an external modification without unlocking or reverting it. Light/dark annotation rendering was inspected with Study Studio.
