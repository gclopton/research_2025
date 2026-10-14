# Study Studio guide

Open [[Study Studio playground]] to try a choice question, a blank and a table. Cards start collapsed. Expand one, type an answer or select an option, and press **Ctrl+Enter** to check it. Tab moves among controls. Revealing an answer records a reveal without awarding a score.

## Create and edit

In a normal note, select optional prompt text and run **Study Studio: Create question from selection** from Obsidian's command palette. Choose a title and type. The command creates a question note, opens its authoring editor and inserts its reusable card below the selection; it does not remove your source text. Edit the question's Prompt and Explanation as normal Markdown. All commands can receive your own bindings under Obsidian Settings → Hotkeys.

Use Math Studio's **Edit equation visually** or **Insert display equation** while editing the question note. This uses the existing Markdown editor, preserving native LaTeX. Text answer fields in practice cards are currently plain text; they do not embed Math Studio's visual editor.

The question's YAML `study` property stores answer rules, but **Edit current question** now provides a form for editing them. See [[Question editor guide]]. Keep its `id` unchanged when moving or renaming a question. If you deliberately duplicate a question, give the copy a new ID. Unknown or duplicate IDs produce an error rather than selecting an arbitrary question.

Choice questions list stable choice IDs with Markdown text. `correct` contains one or more IDs; `shuffle: true` randomizes their display. Scoring currently requires the exact correct set, with no partial credit.

Blank questions use `{{blank:a}}` in prose and an `answers` entry with `id: a` and `accepted: [answer, alternative]`. Select text in the Prompt and run **Turn selected answer into a blank** to store its answer automatically. Markers must be outside math/code. Matching trims and normalizes whitespace and ignores case unless `caseSensitive: true`. It does not test symbolic mathematical equivalence.

Table questions use `table.columns` and `table.rows`. Each cell contains either `text` (Markdown, including math) or a `blank` ID with a matching answer rule. The basic grid is rectangular; merged cells and spanning headers are future work. Answer fields follow row order with Tab. Each blank has equal weight; supplied cells do not count toward the score.

## Reuse and review

Use **Insert question card** to find an existing question and embed it in another note. A card stores only its stable ID; question content stays in one place. Use **Review questions in this note** for a sequential session, or **Choose a question to practice** for the question bank. An already-open card/session keeps its loaded version; reopen the note/session after editing a question to load its newest version.

Use **Show review history** for recent scores. Every submitted attempt creates a new JSON record in `Study Studio/Attempts` with the original question, response and option order. These are local records. No AI calls, account or database server is involved. Closing an unfinished card/session does not save its draft response yet; completed attempts remain saved.

## This milestone

This is the first working slice, not the full exam system. Section/group assembly, saved unfinished sessions, review scheduling, richer metrics, ordering, code completion, diagram tasks and AI grading remain planned. Existing Ink/Math/Slide Studio plugins coexist in this lab, but their installation is not a claim that every interaction has been tested.

## Question families and variants

Use **Create variant of current question** while editing a question note. The new file receives its own question ID and shares a `familyId` with the original. Change its title, prompt, answers or table blanks to make an LHS, RHS or mixed variant. Independent questions without `familyId` are their own family.

**Review questions in this note** includes the families referenced by its cards, discovers their other variants in the question bank and lets you select one, up to two, up to three, or all variants per family. Selection is random without repeating a variant. Directly expanding a card practices exactly that card's variant. Each attempt preserves the family/variant definition so later exam and concept summaries can distinguish them. This is separate from immutable edit snapshots in attempt history.
