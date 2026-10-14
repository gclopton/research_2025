# Code Links

Use **Code Links: Syntax and actions** in the command palette to reopen this guide.

## Code, scripts and results

```text
{{scripts/analysis.py|Analysis}}
{{bdm-campus:screening/run/OUTCAR#L20-L35|Forces}}
!{{scripts/analysis.py#L10-L20,L50-L60|Selected steps}}{height=10}
```

Code is purple; CSV and TSV links are red. Clicking a whole CSV or TSV file opens the Mac’s default application (currently Numbers). Links to selected source lines and explicit **Open in Neovim** actions still open Neovim. Aliases come from the shared `nav` registry. The right-click menu opens sources at a line, in a split, tab or new window, and opens the containing folder in Neovim. Excerpts may contain separate line ranges or a saved regular-expression selection.

## Create a missing file

```text
{{something.py}}
{{calculation.wls|New calculation}}
```

A bare filename first checks the vault root, then the vault's `scripts` directory. If neither exists, its creation destination is `scripts/filename`. Explicit relative paths and named aliases select their own destination. A missing file is yellow in dark mode and dark gold in light mode. Click to create and open it, or right-click to choose a vault or shared alias and browse to another folder. The saved link changes to the chosen path. Existing content is never overwritten. Hovering does not create anything. Missing excerpts and binary scenes are not created as empty files.

## Mathematica / Wolfram

`.wl`, `.wls`, and `.nb` links open in Wolfram. A new `.nb` gets a valid empty notebook with an input cell. Right-click a `.wl`, `.wls`, or `.m` link for **Run Wolfram script in Terminal**, which runs the whole file with `wolframscript -file` from its containing folder. Running is a separate explicit action. Ordinary clicks do not evaluate code. `.m` is ambiguous with MATLAB, so it defaults to Neovim and offers Wolfram in its menu. Notebooks are evaluated inside Wolfram, not treated as command-line scripts.

## Directories

```text
``dir:bdm-campus:screening|Screening runs``
{{dir:scripts|Scripts}}
```

These two forms are equivalent. Orange text identifies a directory. Hover shows its absolute path. Click opens its Neovim file explorer; right-click opens Finder. For an alias's root, use `dir:alias:.`. Ordinary single or double-backtick inline code remains ordinary code unless explicitly marked `dir:`. Triple backticks and triple tildes keep their standard fenced-code meanings.

## Reference groups

Select code, note, PDF, or web links in the editor and choose **Combine selected links…** from the right-click menu or command palette. Give the group a display label. **Add from gallery…** lets you preview and select more references. Save to replace the selected links with a single red label.

```text
{{links:Evidence|{{scripts/analysis.py|Code}}; [[Theory#Model|Derivation]]; [[papers/source.pdf|Paper]]; [Publisher](https://example.com/paper)}}
```

Click the label to open its references. Right-click to edit or ungroup them. The underlying links remain in the note's source, including their labels and line selections. Semicolons separate members. Directory links use their `{{dir:...}}` form inside a group. Groups remain on one source line, contain at most 40 references, and do not nest other groups. Web members use HTTP(S) links. A label is not a nav alias; it is only the visible name of this group.

## Copying and slides

Right-click ordinary inline code and choose **Copy code**. The inline clipboard decorations are hidden. Both light and dark colors are provided. Slide Studio's rendered text and native **Edit on slide** editor share the link controls. Use the native editor for selecting and combining links; the inspector textarea is simpler. Presentation mode offers navigation; use **Close references** to return to the slide (Escape can exit full screen). Exit presentation to edit groups or change saved paths.

## Moving files

Moving the note within its vault preserves vault-relative and alias-relative links. Moving a linked source is different: individual in-vault file renames have reference repair, but external moves and folder moves do not. Reindexing is discovery, not link repair. If an entire aliased tree moves while its internal paths stay the same, update that alias in nav.
