# Citation evidence navigation: development plan

**Meeting target: October 5, 2026. Open a claim’s cited paper at the exact supporting text, figure or table, with temporary highlights and optional comments, while keeping the walkthrough visible and the source paper unchanged.**

## What we will build first

Build one usable release from the existing Study Studio prototype. Use ordinary Pandoc citations with clickable rendered citation numbers. Keep an adjacent evidence link in Markdown source as an inspectable navigation reference. Hide its label when the linked numbered citation is rendered; export omits the navigation link. A citation group opens a chooser showing each paper’s citekey and descriptive label; choosing a paper opens its own supporting selections. Different claims citing the same paper retain separate selections and comments. Opening the paper normally shows none of these temporary annotations.

The first release supports converted Markdown, selected text, whole figures, rectangular figure regions, whole tables and selected table cells. All selections can carry comments and an independently chosen highlight color. The paper opens in a separate window by default, with an option for a tab. Include a clear-highlights command and a visible explanation when evidence cannot be located. Never silently substitute an approximate match.

The user-facing result must be usable without hand-editing encoded URLs or calculating rectangle coordinates. The underlying records must also be readable and editable by an LLM or a human with a text editor.

## Citation syntax and evidence storage

Keep the actual citation unchanged, for example `[@paperA; @paperB]`. Beside it, use a generated Markdown link labelled `evidence`. Do not extend Pandoc’s citekey grammar or replace citekeys with proprietary syntax. The plugin connects the rendered citation to the adjacent evidence record and opens that record when the citation is clicked. This integration is part of the requested release. The ordinary evidence link remains visible and usable when citation rendering is unavailable. Match the exact occurrence and citekey group, not just a paper name: repeated citations of one paper may support different claims.

Store supporting selections in **one YAML evidence file per walkthrough**, in the paper vault. For this campaign the proposed file is `Evidence/22T.yaml` in `research_2025`. This is a functional record, not a work log. It contains only named claims, their citing-document location, papers, exact selections and optional explanatory comments. Do not create one file per claim or annotate the paper originals.

The proposed short protocol link is:

```text
obsidian://study-evidence?vault=research_2025&file=Evidence%2F22T.yaml&id=cage-expansion
```

Obsidian routes this to the paper vault; the receiving plugin reads the named record. Copy actions generate and encode the link. Humans and LLMs primarily edit descriptive IDs and the YAML, rather than the URL. The link must remain useful when the calling walkthrough is in a different vault.

Illustrative schema only; these are fictional papers and quotations, not scientific evidence:

```yaml
version: 1
claims:
  cage-expansion:
    label: Local structural expansion
    citedFrom:
      vault: docs
      path: path/to/22.T.md
      heading: "1.1"
    papers:
      - citekey: paperA
        label: Author A — paper title
        path: Papers/example-a.md
        selections:
          - quote: "Exact supporting sentence copied from the paper."
            comment: "What this sentence supports in the claim."
            color: "#c37b24"
            darkColor: "#efb565"
          - image: figures/example-a-figure-2.png
            whole: true
      - citekey: paperB
        label: Author B — paper title
        path: Papers/example-b.md
        selections:
          - image: figures/example-b-figure-4.png
            rect: [0.10, 0.20, 0.45, 0.30]
            comment: "The highlighted panel supplies the comparison."
```

A rectangle is `[left, top, width, height]` as fractions of the image dimensions. Drawing it fills those values automatically. Store generated content fingerprints alongside image targets to detect replacement of an image under the same name. Resolve image paths relative to the source Markdown file, normalize them once, and reject traversal outside the vault.

Text targets use exact quotations, including partial sentences. Optional `before` and `after` text disambiguates repeated quotations. Match across inline emphasis and links while retaining a mapping back to rendered text nodes. Line numbers may assist navigation but are not the identity of the supporting evidence: line wrapping and edits must not silently change the selected passage.

For rendered tables, store a table-content fingerprint and selected row/column coordinates; highlight cells by their actual rendered positions. Whole-table selection is explicit. Do not rely on a proportional rectangle for table cells, because column widths and wrapping change between windows. For tables that are images, use image-region selection.

The parser validates the schema, unique claim IDs, paper identity, target paths and selection bounds. Invalid records produce a specific message naming the affected claim and paper. A missing paper in a group must remain visibly unavailable rather than disappearing from the chooser.

## Human authoring and inspection

Provide source-view actions to save a selected passage, a whole figure/table, or a drawn figure region into an existing named claim. Ask for the claim ID, citekey and optional comment; remember the current evidence file for the session. Offer Copy evidence link after saving. Use a single small editor for selections and comments, not a new persistent panel or button beside every paragraph.

The reader sees a paper chooser only for groups. A single-paper claim opens directly. In the source window, show which claim and paper are active, offer Clear highlights, and allow the reader to reopen the paper chooser. Clicking a marked passage or region displays its comment. Opening the same paper for another claim must not combine the two claims’ annotations accidentally.

Retain ordinary Markdown links in blue, TSV links in red, code links in purple, and citation/evidence links in green. Use separate light and dark colors. Match destination type, including links with heading or line fragments, without changing existing Code Links navigation or Study Studio blank syntax.

## Highlight colors preserve the user’s meanings

Color is a property of each evidence selection, not a fixed green assigned by the plugin. Support a color picker, an exact hexadecimal value and reusable user-named presets. Text, whole-object and partial-area highlights use the same controls. A single citation may therefore open several selections with different colors and comments. Do not invent semantic categories or reinterpret the user’s existing colors.

Store explicit colors in the readable record, as `color` and optional `darkColor`; serialize the chosen values even when selected through a preset so that another vault can reproduce the appearance. If no dark variant is supplied, preserve the chosen color rather than silently substituting a different hue. Presets should offer optional light/dark variants and configurable fill opacity; the border remains distinguishable from the underlying figure. Defaults are user-configurable. Link-type colors remain separate from annotation colors.

Test at least two differently colored selections in the same paper, copy/save/reopen preservation, and custom light/dark variants. Inspect these on both ordinary paper text and figures with colored backgrounds. Color choices must survive cross-vault navigation and must not depend on the receiver having a same-named preset.

## Implementation sequence: one focused coding pass

1. Implement and test the versioned YAML schema, readable claim IDs, path handling, exact text/context matching and image/table integrity checks. Keep existing prototype links readable for the demo, but generate the new file-and-ID links for new evidence.
2. Add record loading and cross-vault protocol navigation, paper-group chooser, per-window highlight state, visible failures and cleanup on navigation or reload. Reuse an evidence window where appropriate to avoid accumulating identical popouts during the meeting.
3. Upgrade text rendering and whole/partial figure and table highlighting. Wait for the requested content to render; do not claim a successful highlight merely because a file opened. Detect unavailable selections and show the reader what could not be verified.
4. Add the small authoring/save/copy interface and whole-object shortcuts. Write only to the designated evidence record; preserve source Markdown, PDFs and image files. Serialize record saves and detect external edits before overwriting them.
5. Complete theme-aware link classification. Check reading mode and Live Preview link appearance; evidence targets open in reading mode for this release.
6. Run the finite acceptance checks below, install the tested build in the two required vaults, and rehearse one real claim from the walkthrough. Record the outcome in the existing VERIFICATION.md. Stop expanding the feature once these checks pass.

Development remains in the Study Studio repository on a dedicated Git branch. The user explicitly authorized separate test vaults containing copies of real documents; this expands the earlier lab-only development restriction for these test destinations. Production research vaults remain read-only during development. Production installation and creation of the evidence registry follow successful testing; identify the exact destination files before that step. Do not copy personal settings, modify the scientific outline or silently deploy the rest of an unrelated plugin’s development changes. Inspect the installed/source differences before choosing the deployment package.

## Acceptance checks for the meeting

- A single-paper claim and a three-paper claim open the correct source selections from a different vault. Two claims citing the same paper retain independent comments and highlights.
- A quotation spanning inline formatting, a partial sentence, a repeated quotation with context, and a missing quotation behave correctly. Missing or ambiguous text is visibly unresolved.
- Whole-figure and partial-figure highlights align after resizing a window. A replaced image is detected. Whole-table and selected-cell highlights stay on the intended table contents after reflow; changed table contents are detected.
- Comments open; highlights can be cleared; reopening an ordinary source view has no accumulated annotations. Closed or reloaded windows do not leave stale interactive state.
- The ordinary Pandoc citation group still exports correctly. Evidence links do not corrupt bibliography entries or printed prose. Use the existing export path and verify its actual output; do not rewrite the export pipeline for this release.
- Source Markdown, PDF and image hashes are unchanged by authoring/opening/clearing evidence. The new evidence registry contains the intended edits only.
- Inspect light and dark mode, then restore the user’s preferred appearance. Verify Markdown, TSV, code and citation link colors without changing their destinations.
- Rehearse one real claim using a paper already downloaded and converted in the vault. Check the selected Markdown passage/figure against its PDF. A working link is not evidence that the scientific assertion is supported.

## Explicitly deferred

Native PDF-page annotations, all-citations/backlink aggregation, automatic paper downloading/OCR, automatic scientific claim verification, custom Pandoc citation syntax, and general-purpose annotation management are outside this release. The existing research review process remains separate. This development does not authorize filling the entire theoretical review with unreviewed claims.

## Delivery and fallback

Treat this as one implementation pass followed by targeted fixes, not a promise of zero iteration. Test rendered citation clicks and the adjacent evidence link as two routes to the same record; do not silently omit the requested rendered-citation integration. If cross-vault highlighting cannot pass the rehearsal, use ordinary local paper links and explicit supporting quotations for the meeting rather than presenting an unreliable highlight as verified evidence.

A deployable result includes the tested plugin build, rendered-citation integration, one readable evidence registry, a short usage section in this document, and the real-claim rehearsal. No new tracking documents or per-claim scratch files are needed. The all-citations view can wait until after the meeting.

## Isolated real-document test environment

Use `citation_evidence_walkthrough_lab` and `citation_evidence_papers_lab` as separate local Obsidian vaults. Copy the existing 22.O and 22.W documents to the first, and the selected papers’ original converted Markdown, PDFs and local figure assets to the second. Preserve the copied paper directories and use copies, not symlinks to editable originals. Put demonstration citation paragraphs in a clearly labelled test note; do not invent citations in the scientific walkthrough or claim a literature review has been completed.

Each vault has independent `.obsidian` configuration and plugin installations. Install only the plugins required to reproduce the workflow: the citation renderer, evidence implementation and Code Links where needed. Copy the bibliography and citation style into the test vault. Give the test renderer a separate Pandoc executable and independent configuration. Do not copy credentials, personal plugin data, workspace state, unrelated plugins, or enable synchronization. Verify the separate executable runs before configuring the renderer.

Track development code, schema, tests and the plan in Git on `codex/citation-evidence`; preserve existing work rather than resetting the checkout. Keep real papers, personal settings and copied third-party binaries outside the code repository. Record source paths and SHA256 hashes in one test-fixture manifest so that the copies and untouched originals can be verified. Git provides code rollback; it does not by itself isolate an active vault’s plugin settings or protect untracked data.

The real-document acceptance run covers the full interaction, including rendered [1], [1, 2] and [1, 2, 3] groups, the same paper cited for different claims, partial sentences, whole figures, drawn figure regions, whole tables and table cells. Use a copied damaged or edited target to test failures, never the original. Check cross-vault navigation, separate windows, comments, reload/clear behavior, light/dark link colors and a real Pandoc export. Test selections against the copied PDF. Only report features verified in the running application as complete.

## Implemented release and use

The implementation is in Study Studio, on `codex/citation-evidence`. The two isolated vaults contain three real papers, independent Pandoc executables/configuration, copied walkthroughs with their selected code/data dependencies, and a Code Links installation in the walkthrough vault. `Evidence rehearsal.md` exercises the feature without changing the scientific outline or inventing a theoretical review.

For a new citation, open the converted paper and select text, then choose **Save selected text as evidence** from its context menu or command palette. Right-click a figure to select the whole figure or draw a rectangle; right-click a rendered table to select the whole table or one cell. Enter the claim ID, paper citekey and label in **Citation record and selected passage**. Save and paste the generated link immediately after the ordinary Pandoc citation. Add further papers to the same claim, and recopy the link after changing its paper group so that its keys agree with the citation.

Clicking the rendered number opens the reader, with a chooser for groups. **Edit selections** allows mouse selection of further passages in the same claim. Click a highlighted passage and choose **Replace passage using mouse** to change its extent. There are no draggable endpoint handles in this release. The comment editor provides a full-width, resizable writing area, an expandable record section, color controls and maximize/restore. Colors and comments belong to each selection. Named color presets and default colors are stored in the receiving vault’s plugin settings; the actual colors are also saved in each portable selection.

The reader’s jump menu navigates among scattered selections. **Clear highlights** removes session marks; **Open original** opens the unchanged source. After an app reload, a restored evidence tab asks for an evidence link instead of resurrecting unverified decorations. Reopen the citation to load and verify its selections again.

Reading mode hides an adjacent fallback only after the rendered citation and the link’s keys agree. Live Preview uses a high-precedence native CodeMirror widget combining that exact citation occurrence with its fallback. It obtains the formatted citation from Pandoc Reference List’s existing cache, checks its source offsets and citekeys, and shows the original source when editing the occurrence. This avoids a blank-widget interaction observed with the ordinary Live Preview renderer. No independent citation numbering is invented. Without a matching renderer cache, the fallback remains available.

For Pandoc export, add `--lua-filter=/Users/gradyclopton/Projects/obsidian-study-studio/scripts/evidence-export.lua` to the existing command. The filter removes only `obsidian://study-evidence` navigation links; citeproc generates the ordinary citations and bibliography. The filter is also shipped alongside the installed plugin. Export without this filter retains the Markdown fallback link; this is explicit configuration, not an automatic change to unrelated export workflows.

Text evidence supports exact prose across inline formatting, with optional context to distinguish repeated quotations. Math-renderer output is excluded from text matching: a mouse selection containing a formula is refused rather than silently losing that formula. Use a suitable prose passage or figure/table evidence. Table identity uses the original table source hash, and figures use file hashes. A changed source must be reviewed and reselected. Native PDF annotation and a paper-wide incoming-citation overview remain deferred.

See `VERIFICATION.md` for actual checks and remaining limits. The theoretical review has not been written by this software-development task.


### 2026-10-05 table-row preservation repair
The evidence reader now recognizes only complete Markdown delimiter rows before inserting a caption separator. Partially empty data rows previously matched a prefix and were split out of the table. Added a synthetic regression; all seven evidence-record tests and the TypeScript/build checks pass. Compiled change compared with the installed research build: only this renderer function differs. Runtime verified in research_2025 after reload: Das Table 1 remains one table through the final −1.3% row; figure and prose highlights remain visible.
