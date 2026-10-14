# Creating chapter questions

The lab chapters contain a Chapter.md descriptor. Create a question while editing a note in one of those chapters and Study Studio saves it inside that chapter's Questions folder, with its course and chapter already assigned. A course-level note uses the course Questions folder. Notes outside a configured course use Study Studio/Questions.

## Work from the keyboard

Control-N opens Create question from selection. Select a passage first to copy it into the prompt, or leave the selection empty to start a new prompt. The original passage stays in the note. Enter a title and choose a type; the placement field offers an individual card or an existing group. Control-Enter continues to the editor and saves from the editor. Canceling creates no question file.

Command-Option-G opens Manage questions in this note. Type part of a title, use arrows to select it, and press Enter. Then type the action: edit, remove, move into a group, or make a group. A group also offers rename, add an existing question, and ungroup. Removing a question removes only that occurrence. Its reusable source, references in other notes/exams, and recorded attempts remain intact. Removing the last question removes the empty group.

In question pickers, the default scope is the current chapter, or the current course when the note has no chapter. Option-1, Option-2, and Option-3 select chapter, course, and all courses. There is no silent fallback to other courses when a chapter has no questions. The group builder also has scope and text filters.

Command-Option-/ opens the keyboard shortcut guide. Its Study Studio and All Obsidian commands views show current registered bindings, including vault overrides. Search narrows the list; Option-Left and Option-Right turn pages. Unassigned commands can be bound in Obsidian Settings → Hotkeys. On Windows/Linux, replace Command with Control and Option with Alt for global bindings.

## Try Sections 1–4

Open Courses/Fluid Dynamics/Chapter 02 - Fluid Kinematics/Sections 1–4 practice. Its 42 original questions cover particle descriptions, flow visualization, the material derivative, and fluid-element motion. The copied chapter in this lab contains the same questions beside the corresponding sections. Single questions remain standalone; related questions share collapsible groups. Expand/collapse all through the command palette.

Authoring workflow check in that chapter is a disposable surface for practicing creation, grouping and removal. It shares reusable IDs with other notes, so editing a shared question changes what those notes load next. Existing open cards currently need reopening to load an edited definition. Previous attempts keep their original snapshots.

## AI authoring

Questions are ordinary Markdown files with validated study frontmatter and stable IDs. Existing question files demonstrate the schema. AI can create files in the chapter Questions folder and insert study or study-group fences containing their IDs. Preserve IDs when revising a question; assign a new ID to a new question or variant. Carry courseIds and chapters into each definition for dashboard grouping.

Use literal-safe serialization for LaTeX: a backslash in a JSON string must be escaped. Parse and validate generated files, then inspect their rendered equations. The repository's kinematics-questions.json and kinematics-practice.ts provide a reproducible example with round-trip tests. The generator creates missing files only and does not overwrite edited questions.

Automatic blank grading compares accepted text forms, not general symbolic equivalence. Essays and drawings use self-assessment rubrics; no automatic AI grading is implied.

## Remove or delete questions

Right-click a question or press Control-Space to remove it from this note. Remove multiple questions shows temporary checkboxes on the actual questions: use arrows and Space to select, Control-Enter to review, and Escape to cancel. Reusable question files, other notes, exams, and history stay intact. Repeated placements of a selected question in the same note are removed together.

Delete question everywhere is a separate context-menu action, also available from the saved-question editor. It reviews affected notes and moves the reusable file to vault trash. Exam templates that still depend on the question must be changed first. Recorded attempts and started exams remain available. Local recovery JSON files preserve removed placements.
