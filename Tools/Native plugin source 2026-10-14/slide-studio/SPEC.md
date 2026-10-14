# Purpose and first release

Slide Studio lets a researcher create a slide while developing an argument in Obsidian, place a link beside that argument, and later assemble linked slides into a presentation. Mathematics remains Markdown/LaTeX. Slides have a bounded 16:9 page and freely positioned content. The first release is a desktop Obsidian plugin installed in the dedicated Slide Studio Lab test vault, with its independent source project in `/Users/gradyclopton/Projects/obsidian-slide-studio`.

# Authoring workflow

A slide is an independent Markdown file with a permanent UUID, title, page type, optional source link, and movable blocks. A command creates a blank slide or a slide from selected text. Selection-based creation copies the selected text, preserves the original passage, and inserts a normal wiki link after it. A linked-note block is a separate explicit option for content that should update from its source. The editor supports Markdown/math, images from the vault, and linked note/heading/block content. Native Markdown rendering is used. A plain Markdown source view remains available.

The slide editor has a small toolbar, a central page, and a block inspector. Users drag a dedicated block handle, resize from a corner, double-click text to edit directly on the slide using Obsidian’s native Markdown editor, and control font size, alignment, position and size. Escape or Done returns the block to rendered view. Live Preview math follows cursor position and the vault editor setting. The inspector also exposes raw Markdown. The embedded editor uses a small isolated adapter over an undocumented Obsidian API; it is tested on 1.13.7 and may need updating for future releases. Compatibility with third-party editor extensions is not guaranteed. Heading levels retain a consistent hierarchy. Undo/redo covers block edits and layout changes. Overflow is flagged in the editor; text is never silently shrunk. Source content remains available if the plugin is disabled.

# Page types and theme

Main introduction slides emphasize the title with an author/subtitle area. Section introduction slides emphasize the new part. Content slides have a title and a flexible content area. Layout templates are defaults, not restrictions on block movement.

The first theme follows the supplied footer: navy logo panel, orange section tab with a rounded upper-right corner, a light geometric line pattern, and right-aligned automatic page numbering. The official orange-and-white Illinois Block I SVG is bundled offline. A configurable local image can replace it. The geometric footer pattern is optional and off by default. Light UIUC intro and section titles are orange; the decorative title accent is omitted. Theme options include navy/accent colors, logo path, footer visibility and pagination visibility. Presentation section assignments override a slide's default section label.

# Slides, links and presentations

Slides and decks are independently linkable Markdown files. Opening a marked note routes it into the plugin view; Open Markdown shows the backing note explicitly. A slide UUID survives title/file changes. A deck stores ordered entries with both slide UUID and file hint; resolution prefers UUID so moving a slide does not invalidate a deck. Duplicate IDs are errors rather than silently choosing a file.

A presentation is a Markdown file containing its own UUID, title, theme and ordered slide references. References are also written as wiki links for backlinks and ordinary vault navigation. Reusing a slide shares its content; Duplicate slide creates an independent UUID and content copy. Deck entries can be added, removed and reordered without deleting or rewriting the referenced slide. A command gathers slide links from the current outline in source order, deduplicates first occurrences and opens the resulting deck for review.

A normal link opens the editor. Copy presentation link creates an Obsidian protocol link for playback; a link may address a stable slide ID within a deck. A missing slide stays visibly missing at its numbered position. Renumbering is computed from deck order and never becomes the identity of a slide.

# Presentation behavior

Present opens a clean overlay with one page scaled proportionally to available space. Left/right, Page Up/Page Down and Space navigate; Home/End jump to bounds. Typing a slide number and Enter jumps to that position. G opens a slide-title search. Escape closes search first or exits playback. Navigation keys are scoped to the presentation so ordinary note editing is unaffected. Clickable content links remain usable. A small control strip is available on pointer interaction and hidden when idle. Browser fullscreen is requested when supported, with a clean overlay fallback.

# Light/dark appearance and separate windows

Slides and decks support light and dark page appearances. Switching appearance changes page and text neutrals while retaining navy/orange branding, logo, footer geometry and layout. Theme colors are stored with the deck; standalone slide appearance is stored with the slide. An Open in new window action opens the slide/deck in a native Obsidian popout. Presentation playback belongs to the originating window. Separate editor windows use conflict checks rather than overwriting one another.

# Persistence and failure behavior

Slide content is ordinary Markdown separated by block-ID comments. Frontmatter stores layout, type, title, source and identity. Deck frontmatter stores its identity, theme and ordered references. No private app database is required. User edits autosave through serialized writes, with visible saving/saved/error states. A compare-before-write check refuses to overwrite external edits; a recoverable copy of the local draft is available when a conflict occurs. Unknown schema versions are rejected. A corrupt file is reported without rewriting it.

Rendering components are unloaded when a slide changes. Internal links and relative images resolve using the source note path. Rendering arbitrary third-party plugin blocks is best effort and will be reported as unverified unless directly tested. No network service, telemetry or external publishing is introduced.

# Acceptance checks

The implementation is ready for first use when a fresh slide can be created, edited, moved, resized, saved and reopened with the same geometry; LaTeX and a local image visibly render in Obsidian; all three page types render; the footer and slide number follow deck context; arrows, number jump and title search work in playback; an outline link opens its slide; gathering outline links builds an ordered deck; reordering the deck does not change slide identity; a duplicate is independent; and conflicting external edits are not overwritten. Pure model tests cover document round trips, validation, geometry bounds, stable-ID resolution and ordering. Live inspection covers rendering and interaction.

# Scope boundary

Today’s implementation includes the workflow above and a small BDM example deck in `/Users/gradyclopton/ObsidianVaults/slide_studio_lab/Presentations`. Test inputs are copied from the research vault; existing vaults are not modified. The research outline will not be rewritten to serve as a demo. PPTX import/export, PDF export, animation timelines, real-time collaboration, mobile editing, nested decks, arbitrary Canvas migration and a theme marketplace are deferred. These are not prerequisites for the first usable release. The built plugin and a short usage guide are delivered with a truthful record of tested behavior and remaining limitations.

# Version 0.2 styling and sections

The footer label supports direct double-click editing, autosave, Enter/blur completion, and Escape cancellation. Its orange tab grows to fit the label, bounded by space reserved for pagination, then wraps. In a deck this edits the section boundary associated with the current slide, not each slide file. The slide rail displays section headings and the inspector shows the affected range and an action to start a new section. Existing section introduction slides remain automatic boundaries.

UIUC styling and inherited vault styling are explicit options on both slides and decks. Vault styling avoids overriding native heading and highlight colors, fonts, links and callout colors; it follows the active vault appearance. User CSS classes remain available through native Markdown rendering. Blocks optionally store a custom hex text color. Existing version-1 Markdown files load with UIUC styling and the pattern disabled.
