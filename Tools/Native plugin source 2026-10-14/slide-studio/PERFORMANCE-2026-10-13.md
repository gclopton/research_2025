# Scientific figure and table performance

Scientific object numbering shares a bounded note index, including in-flight reads and parsed unchanged blocks. Rendering prepares a detached object, commits once, reserves known image aspect ratios and keeps lazy loading. Stale work is cancelled and owners disposed; rename updates numbering paths.

Validation: 134 Slide Studio tests and build passed. Native code_links_lab and study_studio_lab checked a 1.15 MB synthetic note (93 figures, 186 image panels, 93 tables), add/edit/resolve comments, image identity, crop ratios, rename, reading/edit switching and selection deferral. Claude Desktop reviewed actual sources twice. Full research-vault disposable chapter then confirmed comment persistence, visible highlighting and zero image additions/removals. Initial failing measurements overlapped plugin reload and were repeated after reload completed.

Related Study Studio fixes remove forced full-page rerenders after comment saves; only affected annotation spans and editors refresh. Additional Math Studio and local Iconic repairs were reviewed separately. Research notes and existing comment data were preserved. Diagnostic reports and original installed bundles are outside this repository in the local Obsidian performance diagnostics folder.
