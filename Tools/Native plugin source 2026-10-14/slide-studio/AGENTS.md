# Slide Studio interaction conventions

Keyboard shortcuts and contextual menus are primary navigation; buttons are secondary and should be few. Every meaningful button action should also have a menu or command-palette route where reasonable. Common actions should have keyboard shortcuts and appear in the in-app shortcut guide. Reuse the same action implementation across these routes.

Keep overview, editing, and playback controls context-sensitive. Preserve native text, math, citation, and code-link menus. Presentation navigation uses a searchable thumbnail gallery, including in fullscreen playback. Never make Escape from slide editing unexpectedly activate the note containing an embed.

Keep changes in Git checkpoints. Run relevant tests/build, validate in code_links_lab, then inspect the affected docs-vault workflow after plugin reload. Keep installed bundles equal to source builds. Preserve user slides and content during acceptance tests; cancel creation/import/destructive dialogs unless the test explicitly requires a disposable fixture.
