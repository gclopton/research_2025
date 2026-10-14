# Purpose

Make complicated equations pleasant to edit inside Obsidian. Clicking an equation should allow direct editing of its typeset structure, including nested matrices, integrals, fractions and aligned derivations, with a searchable visual palette available at the current cursor. Native Obsidian LaTeX editing remains available. An identical implementation of all Mathcha features is not promised.

# Scope and isolation

Develop an independent desktop plugin, provisionally called Math Studio, in its own Git repository. Install experimental builds only in Math Studio Lab. Use synthetic examples initially. Do not modify the research vault or the working Slide Studio installation. A later explicit compatibility test may install Slide Studio in the math lab. No remote service, account, telemetry, CDN or research upload is required at runtime. Bundle licensed engine assets locally and retain their notices.

# Interaction contract

Offer a vault command and assignable hotkey to edit the equation at the cursor. The first integration milestone must demonstrate an in-place visual editor in a Markdown note; a modal-only editor does not satisfy the intended experience. A small local action makes switching between native source and visual editing explicit, avoiding ambiguity with Obsidian's existing click-to-source behavior. Opening the palette must preserve the insertion point inside the current fraction, bound, matrix cell or nested structure. Searchable templates include integral variants, fractions, roots, derivatives, Greek symbols, delimiters, matrices, cases and aligned equations.

Matrix editing includes cell navigation, selectable brackets, nested expressions and row/column insertion and removal through discoverable controls. Destructive structural actions must support undo. Long equations can expand their editing area or scroll without silently changing size or content. Light and dark styles follow the vault and remain legible under Blue Topaz and Style Settings. Keyboard commands belong to the active editor only. Main-window and popout behavior must be tested separately.

# Source and save contract

Keep ordinary `$...$` and `$$...$$` content in the Markdown file. No parallel authoritative equation database, images in place of source, symbolic simplification or mandatory proprietary document format. Preserve delimiters, surrounding prose, neighboring equations and all intermediate derivation steps. Use the visual engine only while editing a supported expression; use Obsidian rendering otherwise.

Capture the exact source and editor range on entry. Cancel and an unchanged close preserve the original bytes. A committed edit updates only the intended math range through the editor transaction/undo mechanism. Track range changes and check the source again before committing; refuse a stale or ambiguous save rather than overwriting concurrent edits. Duplicate expressions must be distinguished by position, never a global text replacement. Renaming or closing a note during editing must not redirect a write to another note.

The visual engine may normalize edited LaTeX. Test semantic fidelity separately from byte preservation. Unsupported commands, macros or environments must produce a clear native-editor fallback without altering source. Do not assume successful rendering proves a lossless conversion. Compatibility detection and the supported subset are explicit deliverables of the first experiment.

# Numbering

Provide a small equation options control inspired by the Mathcha interaction. Start with manual visible tags that survive native rendering and source editing. Automatic document numbering is a separate milestone with defined document scope, stable equation identity, insertion/reordering behavior and duplicate-tag handling. Do not call numbering automatic if it merely writes sequential literals once. Do not require cross-document references for the first release. Verify behavior with Obsidian's actual MathJax environment before selecting storage syntax.

# Implementation sequence and decision gates

Milestone 1 proves engine compatibility and safe coexistence. Evaluate locally bundled MathLive using the fixture corpus, then implement one in-place editing path in Obsidian. Demonstrate ordinary native editing, opening a rendered equation, editing one matrix cell, saving, undoing, canceling, and rejecting a stale save. If the engine cannot preserve the required structures, reassess it before building a polished palette.

Milestone 2 supplies the daily workflow: palette at the current insertion point, nested templates, matrix controls, aligned equations, keyboard navigation and manual tags. Verify every interaction inside Obsidian rather than relying on the standalone engine demo.

Milestone 3 verifies theme inheritance, popout lifecycle, large-equation responsiveness, plugin disable/re-enable and Slide Studio integration in the lab. Add automatic document numbering only after its native-rendering/storage behavior is demonstrated. Ship a packaged build and concise usage instructions with limitations tied to observed evidence.

# Acceptance and testing

Use focused model tests for range resolution, escaped delimiters, inline code and fenced-code exclusion, exact no-op/cancel preservation, duplicate-equation targeting and conflicting edits. UI tests cover actual caret movement, nested insertion, matrix restructuring, focus retention while opening the palette, native/visual switching, equation tags, undo/redo, saving/reopening and rendering. A long aligned derivation tests that the editor does not collapse or simplify authored steps. Test both inline and display math.

The lab verification record distinguishes automated passes, manual visual observations, and unverified assumptions. Engine import/export tests must compare original and resulting mathematical structure and native rendering. The unsupported fixture must remain byte-identical when visual editing is refused. No performance or compatibility claim is made until tested in the host app.

# Boundaries

Do not rebuild Mathcha's document manager, drawing system, cloud collaboration or full TeX toolchain. Do not replace Obsidian's entire editor. Mobile support, symbolic algebra, handwriting recognition, AI equation generation and PDF/PPTX export are outside this effort. Keep implementation moving through the milestones rather than expanding this spec into weeks of planning.

# Research basis

Hands-on Mathcha scratch work demonstrated visual edits inside a nested matrix, row insertion, a palette inside math, insertion of an integral inside a matrix cell, and equation-tag controls. Complex baseline examples were imported as LaTeX before visual edits. These observations establish interaction goals, not compatibility evidence for this plugin.

MathLive integration: https://mathlive.io/mathfield/guides/integration/
MathLive matrix controls: https://mathlive.io/mathfield/matrix/
MathLive source and license: https://github.com/arnog/mathlive
Mathcha matrix reference: https://www.mathcha.io/documentation/components/matrix/
Mathcha import/export limitations: https://www.mathcha.io/documentation/export-import/

## Display rows and alignment

Display equations support Enter to add a row in the current structure; in a nested matrix this adds a matrix row. Shift+Enter and Cmd/Ctrl+Enter still finish. The Display layout toolbar provides Left, Center, Right and Align at =. Alignment applies to the outer equation rows, preserving nested matrices and grouped expressions. Equals alignment uses the first top-level equals sign; existing manual alignment points remain for rows without equals signs. Tab navigates alignment cells. After typing a complete new equation into one cell, Align at = reapplies the alignment. Native source uses standard aligned, gathered or array environments. Custom row spacing and multiple alignment pairs stay in Native LaTeX rather than being silently flattened.

Calculus palette includes Evaluation bar, with expression and subscript placeholders using an invisible left delimiter and a scalable right vertical bar. Also searchable in All and available in Composite.

Evaluation-bar preview uses two boxes to match its editable expression and subscript slots. Tab advances between slots.
