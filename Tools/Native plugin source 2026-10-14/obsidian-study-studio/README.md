# Study Studio

An Obsidian plugin for reusable Markdown questions, collapsed practice cards and local review history. A keyboard-friendly question editor handles choices, blanks and table cells without YAML. See **Question editor guide** in the lab. First runtime supports single/multiple choice, prose blanks, rectangular fill-in tables and selectable question-family variants. This is an initial working slice; full exam assembly, scheduling, diagram tasks and AI grading remain planned.

The isolated lab is `/Users/gradyclopton/ObsidianVaults/study_studio_lab`. Open **Study Studio playground** there. **Study Studio guide** explains keyboard commands and the question format. Blue Topaz, Style Settings, Math Studio, Ink Studio and Slide Studio are installed locally; full compatibility is not implied.

Run `npm ci`, `npm test`, `npm run build`, then `python3 scripts/install_lab.py`. The installer targets only the existing lab and adds missing synthetic fixtures without overwriting notes. User settings, plugin binaries and personal content are excluded from Git.

See [SPEC.md](SPEC.md) for accepted scope and [VERIFICATION.md](VERIFICATION.md) for evidence and limitations.

Chapter authoring: see [Chapter authoring guide](fixtures/Chapter-authoring-guide.md). The lab includes 42 original Fluid Kinematics questions for Sections 1–4, scoped pickers, keyboard note controls, and a live shortcut guide. Generate missing fixtures with npx tsx scripts/kinematics-practice.ts --write. Optional --embed-lab inserts missing practice blocks only into the isolated lab's copied chapter.

Temporary chapter comments can be removed with `npx tsx scripts/cleanup-kinematics-markers.ts "<absolute lab note path>"`. This previews the count; add `--write` to apply. Only the exact kinematics marker comments are removed; question blocks and other text stay intact. The insertion script recognizes existing question IDs after cleanup and skips any section already containing one of its generated questions.

Question authoring now renders math inside each text field without duplicate previews or math toolbars. Ctrl+M edits math; Ctrl+Shift+M inserts display math; Ctrl+Enter saves; Ctrl+Shift+Enter saves and opens the source note. New multiple-choice options are empty. Right-click a choice label (or Shift+F10 in its field) to add, reorder, or remove choices. In New question, Tab out of the title and use 1–8 to choose the type. Group placement is optional and collapsed.

Practice-card actions: right-click the card or use Ctrl+Space (Shift+F10 also works), then a number and Enter: 1 reveal, 2 reset, 3 edit, 4 group/remove occurrence, 5 course, 6 question information. Unavailable actions are disabled or omitted. Text inputs retain their native context menus; Shift+F10 still opens question actions. Tab and arrow keys navigate answers; Ctrl+Enter checks the answer.

Choice editor: Option/Alt+Enter inserts an empty choice after the focused choice and focuses it; outside a choice it appends. Ctrl+Space opens numbered actions: 1 add, 2 toggle correct, 3 move up, 4 move down, 5 remove. Shift+F10 remains available.

You can save while typing in any authoring field: Ctrl+Enter saves; Ctrl+Shift+Enter saves and opens the question note. Source chapter edits never block question creation. If the original placement is no longer safe, the question saves and a notice asks you to insert its card separately.

Ctrl+N opens Create question from selection in a Markdown note. This uses Control on Mac, not Command.
