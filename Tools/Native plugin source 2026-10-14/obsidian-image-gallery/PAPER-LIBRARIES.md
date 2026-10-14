# Paper libraries

The gallery enables this module only when `.paper-library/catalog.json` exists (an existing `Papers/.library/catalog.json` is migrated on startup). It stores one source identity per paper, one canonical PDF, one optional reading conversion, and many memberships in nested libraries. Files stay at their canonical paths; assigning a library never copies or moves them.

The native left-sidebar library icon and **Open paper libraries** command open the same gallery. Click a library tile to descend, use breadcrumbs to move up, or press Command K to jump. Search stays within the current library and its children. The title or cover opens the reading copy; PDF opens the original. Memberships are available on each card and in its context menu. Arrow keys move between cards, Backspace moves up, and Command +/− changes card size.

**Add PDF to paper library** hashes the incoming file and reuses a known identical or equivalent download. Filename/title and embedded or first-page DOI matches go through a review dialog. A reading conversion can be attached with **Register paper reading copy**. Files arriving through other tools are checked after arrival and flagged for review; the watcher never deletes them.

`scripts/paper-library.py` supplies the same local catalog workflow for scripted intake, including `find`, `import`, `add`, `conversion-input`, `convert`, `register-conversion`, and `check`. The conversion wrapper skips a registered reading copy and otherwise calls the established Mathpix chapter converter with local image assets. No Mathpix job is run by plugin installation.

Catalog edits use exclusive lock files, an optimistic raw-file comparison, and atomic replacement. Renames update canonical paths and retired aliases. A recovery command can clear an abandoned lock after the user has stopped other writers. Study Studio can feature-detect `api.library.resolve` to follow saved evidence paths after a rename. External catalog edits refresh within five seconds.

Validation: 43 TypeScript tests and an isolated Python intake test pass. Native lab checks covered the top-sidebar icon, responsive grid, nested navigation, keyboard focus, shared membership, and source opening. Research deployment verified 253 catalog sources and a single Zhang 2023 search card carrying both former categories. The migration receipt and recovery data live outside the vault; scientific content is not stored in this source repository.

Library navigation uses colored collection cards and matching sidebar branches. The landing page loads no PDF cards; its search spans the catalog. Results are paged at 40, with visible-area previews and two concurrent render jobs. A native synthetic 10,006-source test rendered 40 search cards in 35 ms and zero landing-page cards. This measures metadata and UI construction, not rendering 10,000 PDFs.

The catalog is vault-root relative, outside the movable paper tree. Obsidian folder renames update PDFs, conversions, retired aliases, library folder hints, the intake root, and evidence image redirects. Native lab testing nested the whole Papers folder, restarted the plugin, and restored the folder; identities and memberships survived. Moves made outside Obsidian while it is closed cannot generate rename events and require review with the integrity checker.
