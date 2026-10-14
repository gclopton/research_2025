# Verification — 2026-10-08

Research Outline 0.1.0 builds with the upstream locked dependencies. Three provider tests pass: presentation selection and stable tree, restoration of note headings, sidebar focus and unsupported main views. Slide Studio 0.3.23 passes 105 tests, including nested section numbering, repeated slide occurrences, title-only/empty branches, editing save conflicts, and selected-thumbnail reveal requests.

Native code_links_lab inspection: note outline restored after leaving Studio; section and subsection clicks selected the corresponding slides; editor-to-section navigation returned to the deck; theme stayed intact. Native docs full-lecture inspection: all 12 occupied roots, deeper 6.1.1 hierarchy, active highlighting, click navigation and Escape back to the same slide. Clicking Conclusions selected saved slide 43 (printed 42/43) and scrolled its selected thumbnail into view on the left. Ctrl+I focused the new outline search input. Math Studio guide restored note headings and rendered math.

Installed main.js, manifest.json and styles.css match source builds in docs and code_links_lab. Research Outline enabled, Quiet Outline retained but disabled. Existing settings copied and command hotkeys remapped. All 84 playground Markdown files retained their exact pre-migration SHA-256 hashes.

Original third-party code and local migration configuration backups are at ~/Library/Application Support/ObsidianPluginSnapshots/20261008-143655. No note content, personal settings or credentials are committed. No public release or push performed. Other vaults/shared configuration remain unchanged.
