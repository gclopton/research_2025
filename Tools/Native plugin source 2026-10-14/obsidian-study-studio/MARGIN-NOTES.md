# Margin notes

Notes are stored as Markdown text in `.obsidian/study-studio-review.json`. Each note has an immutable `id`, a source `path`, a `comment`, a color and its user-defined `intent`, and a `resolved` flag. Multiple `anchors` can connect one note to several excerpts. The first anchor is mirrored in the legacy `quote`, `before`, `after`, and `path` fields. Draft recovery lives separately in `.obsidian/study-studio-margin-drafts.json`.

## Editing with an agent

Read the current file immediately before writing. Preserve unrelated records and unknown fields. Use a fresh UUID for each new note and excerpt; keep existing IDs when editing. Write the file atomically. Each anchor contains `id`, `path`, the exact source `quote`, and up to 48 characters of source text immediately `before` and `after`. `kind` is `text` or `math`; math quotations include their Markdown delimiters. A note's `markStyle` is `highlight` or `underline`. Set `updated` to an ISO timestamp. Do not delete notes authored by someone else without the user's instruction.

`comment` is ordinary Markdown and may include equations and links. The pane imports external changes on focus or through the Refresh margin notes command. Unrelated changes merge. Concurrent edits of one note retain the disk version and create a second local version with `conflictOf` pointing to the original. Invalid records stay intact on disk and are excluded from rendering. A concurrent palette edit uses the disk palette; a concurrent question-review status uses the disk status.

Reading-view capture can additionally store `renderedQuote`, `renderedBefore`, and `renderedAfter` for formatted text. Complex rendered captions or table cells may use `sectionSource` and `renderedRoot`; these excerpts are labeled as Reading-view excerpts and require the enclosing source block to remain intact. Prefer exact source anchors when creating notes programmatically.

## Color meanings

New defaults are yellow for definitions, green for examples or worked problems, blue for important mathematics, grey for research discrepancies, and pink for main takeaways. Each stored note retains its own meaning and color. Changing the palette changes the choices for new notes; it does not relabel existing notes. Meanings and light/dark colors are editable in Study Studio settings.

Overlapping excerpts remain separate notes. The overlap displays their colors in bands and offers a menu to choose the intended note. A larger sentence highlight does not remove a word-level definition.

The source excerpt reflects its marking: background for a highlight, underline for an underline, and a folded-corner symbol for a post-it (`kind: "sticky"`). The side rail carries the semantic color. Mixed overlaps retain both background and underline. JSON key order has no semantic effect; preserving it makes manual diffs easier to read.

Click a margin note to write. Changes save after a short pause or when focus leaves the note. Escape returns to rendered text. Equations remain editable with Math Studio. Right-click or Shift+F10 opens note actions; Ctrl/Cmd+Enter saves immediately. Ctrl/Cmd+Shift+F focuses margin search. Plain internal links reuse the most recent note tab; Ctrl/Cmd-click opens a new tab.

Margin notes and citation evidence are separate records. The Citation Source Viewer and evidence editors do not render margin-note highlights or import margin notes as supporting evidence.

Right-click a margin note to change its color/meaning, switch highlight/underline, or delete it. Delete offers Undo; the margin's background menu can undo the latest deletion in the current file. Deleted records retain `deletedAt` and `deletedWasResolved` for recovery. Agents must not modify or reopen deleted records unless asked.

Rendered equation notes can target a superscript, a constant, or a selected term. Drag-select within the equation and use the selection menu, or right-click a symbol. The whole-equation option remains available. In Live Preview, right-click opens attached notes while ordinary clicks retain the equation editor. A source selection inside an equation is mapped through MathJax's semantic tree; unsupported mappings ask for selection in rendered math.

Math anchors retain the full, unchanged equation source and optional `part.nodes`, an ordered array of `{latex,parentLatex,occurrence}`. These identify semantic MathJax nodes, independently of spacing and layout wrappers. Do not replace them with pixel positions. The source excerpt shows the selected part in equation context. Whole-equation and part notes remain separate. If the equation source changes or its original part cannot be resolved, the saved note remains available in the margin; automatic reattachment does not guess a different target. Older MathJax renderers without semantic `data-latex` support whole equations only.

## Showing and hiding marks

Right-click in a main note or in the margin and choose **Annotation visibility…**. **Show annotations in notes** toggles all main-note marks; the checked meanings toggle individual types such as Definitions or Important mathematics. The menu stays open for successive choices. **Show all types** restores everything. The command palette also has **Toggle annotations in notes** and **Choose visible annotation types…**, which can be assigned hotkeys.

These are per-vault reading preferences in `.obsidian/study-studio-annotation-visibility.json`, separate from annotation records and evidence. They apply to Reading and Live Preview text, equation parts, and post-its. Margin notes remain accessible and say “Hidden in main note” when appropriate. Filtering the margin remains a separate action. Hidden records retain their content, anchors, and meaning. Agents should preserve this preference file and should not treat hidden annotations as resolved or deleted.

Post-its save an empty record, insert a `study-sticky` marker at the editor cursor, and open immediate margin editing. Undoing the placement leaves the recoverable note in the margin; a missing placement is identified there.

Click an existing note's prose in the margin to edit it. Escape returns that editor to rendered Markdown and retains the current text. The equation menu's **Open note** actions open existing annotations; **Add another comment** creates a separate one. Overlapping notes intentionally remain separate records.
