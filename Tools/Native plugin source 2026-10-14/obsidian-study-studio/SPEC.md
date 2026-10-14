# Study Studio — accepted design

## Purpose and scope

A keyboard-first personal practice and review system inside Obsidian, intended to replace the user's Anki/Quizlet-style study workflows. It is not a classroom administration, surveillance or high-stakes grading system. Prepare factual and conceptual knowledge before blackboarding, diagnose gaps after time away from a subject, and expose useful evidence for optional AI-assisted learning.

Current stage: first author-attempt-feedback-review slice implemented for choices, prose blanks and rectangular table completion. The exam_8 repository was inspected read-only through GitHub; content_metadata.py confirms stable question IDs and section/group/block organization. The first exam assembly/session milestone is now implemented as described below.

## Questions, notes and exams

Questions have stable IDs independent of exams. Store editable prompts, response definitions, answers/rubrics, source-note links, concept tags and schema versions in portable vault files. Prefer Markdown plus explicit structured metadata; an index/database may be a rebuildable cache, not the only authoritative copy. Choose exact schema during the first vertical slice. Questions can appear inline in notes as collapsible interactive embeds, in note-specific review sections, in targeted review sessions or in assembled exams. Revealing an answer is distinct from a scored retrieval attempt.

Reuse one question across contexts without duplicating its identity. Attempt history follows that identity, but records the exact question version, displayed choices/order, response, scoring rule and feedback. Editing today's answer must not rewrite yesterday's attempt. References between notes/questions should survive rename/move. Provide keyboard commands to create/edit/embed questions and mark selected content as blanks. A human or AI should be able to author/import a validated question file without driving a point-and-click form.

## Collapsible question groups inside notes — implemented

A note can embed a named, collapsible review group containing multiple question references. Expanding the group shows its questions together without requiring the learner to expand each card separately. Individual collapsible question cards remain available. This note-level grouping complements the exam section/group hierarchy.

Provide Expand all and Collapse all commands for question cards and review groups in the current note, available through Obsidian's command palette and vault-wide hotkey assignments. Do not add expansion buttons above embeds; the user wants that space kept clear. Expanding all exposes the questions, not their answers or solutions. Collapsing and reopening a group must preserve in-progress responses and feedback without submitting, revealing, resetting, or recording additional attempts.

Each question retains its stable identity, answer rules and individual attempt history when reused in a group. Group membership references existing question IDs rather than duplicating question content, and uses a portable format that humans and AI can author and validate. Implemented as `study-group` fences with a title and ordered question IDs, an Insert question group command, and note-wide expansion commands. Review questions in this note includes group references.

## Required question types

Multiple choice supports one or several correct options, optional shuffled order, stable option IDs and explicit partial-credit policy. Fill-in-the-blank supports several blanks and accepted alternatives. Ordering questions preserve the reference order separately from shuffled presentation. Code completion converts selected parts of a syntax-highlighted code block into answer fields, including scattered keywords, partial or complete lines, multiline selections, and whole or partial blocks such as loops; support accepted alternatives and, where appropriate, isolated executable tests rather than string equality alone. Do not run arbitrary answer code inside the vault host process.

Short answer compares a response against a stored rubric/reference using optional AI feedback, with user override and an explicit distinction from deterministic scores. Diagram labeling places blanks and optional leader arrows on an image; store positions relative to its dimensions. Drawing questions reuse Ink Studio once available and compare against required features/relationships plus reference drawings, not pixel similarity. Table completion supports selected blank cells and per-cell answer rules.

Math Studio should edit math in prompts, solutions and mathematical responses while keeping ordinary LaTeX. Native Obsidian rendering should preserve math, links, embeds, code, callouts and theme styling where supported. Integration inside a custom response field needs an explicit supported editor interface; installation alone does not provide it.

## Exam structure and sessions

Exam definitions reference questions. Hierarchy is exam → sections → groups → question references. Each appropriate level can retain order or shuffle; fixed groups and dependencies must remain intact. A question that reveals another answer must not appear early because of randomization. Validate conflicting dependencies instead of silently ignoring them. Offer entire-exam and section-by-section presentation, with explicit back-navigation and answer-reveal behavior. Save the realized ordering and session progress so resume is consistent.

Report question, section and overall scores. Preserve original responses, partial credit and manual adjustments. Define treatment of unanswered questions and pending AI grades; pending is not zero and not correct. Edits to a question during an active attempt must not change its frozen version.

## Learning and review

Track concept/topic associations, attempt times, outcomes, hints/reveals, time spent where meaningful, last review and suggested next review. Keep metrics transparent: question performance is evidence about a concept, not proof of mastery. Review scheduling should be replaceable and tested, with user controls. Note review sections can show linked or due questions. AI can help draft questions and analyze gaps, but generated questions require validation/review and cloud grading must be explicitly configured. Credentials stay out of note files, exported question banks and Git. No provider selected or API calls enabled during setup.

## First implementation milestone

Implement portable question files, collapsed note embeds, keyboard blank/choice authoring, answer submission, feedback and immutable attempt records. Prove math rendering and a supported Math Studio editing route in this workflow. Then add exam assembly and ordering, concept metrics/review, code/table types, and diagram/AI types. These milestones preserve the full accepted scope without requiring every feature in the first build.

## Compatibility and verification

Use this project's isolated lab and synthetic questions. Verify Blue Topaz, Style Settings, selected visual plugins, Math Studio and Slide Studio together; later repeat with an expanded plugin set from COMPATIBILITY.json. Test inline math, display rows, matrices, colors, hotkeys/focus, undo, popouts, light/dark, printing without solutions/controls when requested, corrupted data and interrupted/resumed sessions. Question/exam features remain pending until observed working. Do not alter existing research vaults or the user's old study app.

## Implemented storage and table boundary

Question notes are Markdown with a versioned `study` YAML property and Prompt/Explanation body sections. Notes embed a question ID in a `study` code fence. IDs resolve through question definitions, independent of file names; duplicate IDs fail explicitly. Invalid bank definitions fail with an error rather than being silently excluded. Active cards/reviews freeze the loaded question; reopening loads updates. Questions in the managed Questions folder are discovered directly; moved questions use Obsidian metadata discovery.

Choices use stable option IDs and exact-set scoring; prose/table blanks have explicit text alternatives and optional case sensitivity. Table rows consist of cells with Markdown text or an answer ID. Merged cells, row/column spans and nested layouts are deliberately rejected in schema 1 rather than flattened. A future version can introduce explicit span/layout metadata without making Markdown tables the storage authority. Mathematical equivalence grading is not implied by rendered LaTeX.

Completed attempts and reveals create separate UUID JSON files under Study Studio/Attempts, including the complete loaded question, realized choice order, response and versioned scoring rule. Reveals have no score. In-progress card responses and completed card feedback now persist locally as described below. Whole-exam/session resume remains outside this milestone. Review history displays the latest 100 records, with all records retained on disk.

## Question families and selectable variants

User-requested variants (LHS hidden, RHS hidden, mixed) have distinct question IDs and a shared familyId. An original without familyId is its own family using its question ID. Create variant clones the definition with a new ID and that family identity. Each variant has independent answer rules and attempt history. This is distinct from preserving earlier edited question snapshots in historical attempts.

Note review discovers the entire family of each referenced question and samples one variant per family by default, with up-to-two, up-to-three and all options. Sampling is without replacement. A directly expanded inline card always shows its specified variant. Future exams reuse this selection policy while respecting section/group order and dependencies. Cross-variant scheduling and family performance summaries are not yet implemented.

## Question authoring editor

Provide a workspace-tab authoring route from the card Edit question button, the Edit current question command and after new-question creation. Title, concepts, prompt/explanation source, choice correctness/shuffle, blank alternatives/case and table headers/cells/rows/columns are editable without YAML. Table cells toggle blanks via Ctrl+Shift+B, Alt+arrows move cells, Ctrl+Enter saves; prose selection uses the same blank shortcut. Table blank cells preserve optional sourceText separately from accepted answers for reversible supplied/blank conversion. Prose blank removal restores its first accepted answer into the prompt.

Draft-only changes until explicit Save; Cancel or closing the authoring tab discards unsaved changes. Atomic vault.process compares the original raw source and rejects concurrent modifications. Unrelated YAML properties/comments are retained (formatting may normalize); unchanged body bytes are retained. Active practice cards retain their loaded question version until reopened. Each content field has a live rendered preview and embedded Math Studio equation editing. Prompt, explanation, choice, table heading/cell and accepted-answer fields share this component. Ctrl+M opens math at the cursor (or inserts); clicking rendered math opens that expression. Shift+Enter returns to the question draft. Question save remains explicit. Accepted-answer lines keep their raw-versus-delimited storage form; grading stays text based. The installed Math Studio frame/assets are reused with source/id-checked messages and no network calls. Missing Math Studio leaves Markdown editing available. Structural and save controls are disabled until the active equation is finished or cancelled. Titles/concepts remain ordinary metadata inputs.

## Interactive author preview

Every question editor has Preview question at the top and in its action bar. It validates and snapshots the unsaved draft, then opens the same Card renderer used in practice, including choice shuffling, response inputs, scoring, reveal, explanation and retry. Preview mode suppresses attempt persistence (including retry), hides the recursive Edit question action and identifies itself as a preview. Back to editing returns to the unchanged draft. Ctrl+Enter checks the preview and must not invoke the underlying question Save. Invalid/incomplete drafts show validation errors in the editor.

## Note-to-question intake

Create question from selection and the editor context menu capture the selection and source snapshot, then open a type/title chooser. A complete Markdown pipe table defaults to the table type and imports its headers and fixed cells. No cells are hidden automatically; select blanks in the authoring grid. Prose fill-blank intake starts with the exact selected passage and no invented blank, requiring the author to mark answer text. Choice intake uses the selected prompt with editable placeholder options. Empty selections retain starter templates.

Continue opens a draft without creating a note or inserting a card. Ctrl+Enter advances the chooser. First successful question Save creates the reusable Markdown file and inserts a study fence after the selected line while preserving source content. It remains in the source note unless Save and open note is chosen. A changed source snapshot blocks creation; if the source view disappears during the asynchronous save, the question is retained and a notice directs manual card insertion. Cancellation discards the draft. Plain rectangular pipe tables are supported; merged/HTML tables and automatic rewriting of relative links in copied content are outside this milestone.

Callout intake uses source offsets: remove the enclosing quoted callout prefix and its heading from selected content, preserving partial text, Markdown, math and deeper quoted content. Insert after the full explicitly quoted callout and any following block-ID anchor. Ordinary blockquotes and fenced callout examples stay literal. This parser targets standard explicitly quoted Obsidian callouts; lazy unquoted continuations are not interpreted as callout body.

Practice responses: prose blanks and table blanks offer Math Studio through a Math button or Ctrl+M. Visual editing operates only on the learner's response; Shift+Enter returns raw LaTeX to the field and shows a rendered preview. Grading remains accepted text alternatives, without symbolic equivalence. Math Studio is optional; ordinary typing remains available.

Filled visual math responses use one rendered answer control in place of the raw input, Math button and separate preview. Click, Enter, or Ctrl+M reopens Math Studio; empty answers return to ordinary input controls.

After checking or revealing, fill-blank and table response fields display an accepted correct answer. Math is rendered in the field. A scored result uses green/check for an originally correct response and red/cross for an incorrect response; unscored reveal stays neutral. These colors describe the submitted response, not the replacement answer now displayed. Multiple-choice controls show the correct selection after completion. Original responses and grades remain in the immutable attempt snapshot; showing corrections does not mutate them.

## Local practice recovery

Practice drafts save in the plugin's local data.json, keyed by source-note path (or review context) and stable question ID. Preserve typed responses, finished Math Studio answers, visual-math mode, start time and realized choice order. Display Saving draft / Draft saved locally and report failures. Writes are serialized; wait for the saved indication before intentionally restarting. Preview questions never save drafts or attempts.

Validate a restored draft against the current question definition, prompt and explanation. If the question changed, leave the old draft stored and start an empty response with a notice rather than applying potentially incompatible answers. Completed feedback is cached separately and restored without resubmitting an attempt. Try again clears that completed state; historical attempts remain immutable. Multiple appearances of the same question in one note share a recovery key; different source notes have separate drafts. Simultaneously open copies are not live-synchronized, and the latest edit wins their stored draft. Renaming a source note does not migrate its draft key yet.

An equation still open inside the Math Studio frame must be finished to enter the recoverable response. Unsaved authoring-modal edits, expansion state across restarts, and whole-exam sessions are not covered by card recovery. Expand all applies to rendered cards plus cards mounted later in the current app session; it never reveals solutions.

## Incremental question index

Question lookup uses a rebuildable in-memory path/ID index instead of reading and parsing the entire bank for each card. Initial discovery uses the question folder and study frontmatter; late metadata discovery adds newly recognized files. Vault create/modify/delete/rename and metadata changes invalidate affected paths. Reads are coalesced across simultaneous requests, with at most eight concurrent source reads; edits arriving during a read invalidate the stale result. Folder renames invalidate old descendant paths and discover new ones. Warm ID lookups use the ID map; sorted bank listings are cached until a change.

Malformed question definitions and duplicate IDs still produce explicit errors, and fixing/removing the offending file clears them on the next lookup. Active cards retain their loaded question snapshot; reopen to load edits. Show question index status is a diagnostic command with question/read/flush/error counts. The index is not a database and does not replace Markdown. Full-bank pickers still list all items; large-bank UI virtualization remains separate work.

## Exam builder and frozen sessions — first implementation

Exam notes use a versioned studyExam YAML property and a study-exam launch fence. Create exam / Edit current exam provide section/group/question-slot controls, family variant counts, fixed ordering and shuffle settings at each level, whole-exam versus section-at-a-time display, and backward-navigation policy. Ordering constraints refer to sibling items; unknown dependencies, cycles and conflicts with fixed ordering fail validation. Selected variants remain together within their slot. Duplicate realized questions fail instead of silently appearing twice. Each exam note remains editable by humans and AI; builder edits preserve unrelated frontmatter and note body, with concurrent-source conflict checking.

Starting creates a distinct JSON session under Study Studio/Exam sessions with frozen exam definition, question snapshots, chosen variants, section/group/slot order, option order and start time. Responses and current section save through serialized local writes. Resume exam or view exam results lists saved sessions; only one window for a given session can be opened by this plugin instance. Finish open Math Studio edits before navigating or closing. Existing question practice cards supply response widgets and visual math; per-question check/reveal and question editing are suppressed during an exam.

Submit grades all frozen responses together, treating unanswered items as zero. Each blank is one point and a choice question is one point. The session stores original responses and per-question results, and displays section and overall totals. Solutions and explanations become available only after whole-exam submission, including in section mode. Submitted sessions reopen as results, without regrading current question files. Exam session records are separate from practice attempt records; future concept metrics must include both sources. Imported sessions are checked against their frozen answer rules and option order.

Current limits: no AI-graded question types, custom point weights, timed exams, export, live cross-window collaboration or adaptive scheduling. Builder question selectors still enumerate the bank. Pending equation-frame changes are not recoverable until finished. Ordering constraints between sections, groups or slots must be expressed at their respective level; there is no automatic inference that one prompt reveals another answer.

## Workspace tabs — implemented

Question authoring, question preview, exam building, and exam taking/results open as native Obsidian workspace tabs. Each can move into a separate window through its header action or the command `Move current Study Studio tab to new window`; the native window can then be maximized/full-screened. Switching tabs or moving the existing leaf preserves the mounted controls, unsaved authoring values, and in-progress exam responses. Preview has a Back to editing action. Question editing retains Ctrl+Enter saving; exam building also supports Ctrl+Enter. Small pickers and equation dialogs remain popups.

Authoring drafts are currently in memory while their tab is open. Closing a draft tab, reloading, or disabling the plugin discards unsaved authoring changes; the editor explicitly states this. Saved exam responses still resume through the existing session command. Restored workspace tabs whose in-memory panel no longer exists show recovery instructions instead of silently creating an empty draft. Persistent authoring-draft recovery remains a future enhancement.


## Course gradebooks and learning dashboard — planned

A vault may contain several courses. Introduce stable course identities and explicit membership for questions and exams, with an unassigned state for existing material. Course membership must not depend solely on folder names. A reusable question may belong to several courses without duplicating its identity or history. Record the course context of a new attempt/session; retain historical context when membership later changes. A vault overview must not count the same attempt twice because its question belongs to multiple courses. Legacy records with unknown course context remain visible as unassigned rather than receiving invented historical assignments.

Provide a gradebook for each course and a vault-wide dashboard. Show exam and section scores, question/family and concept performance, trends, attempt counts, last practice, and eventually recommended next review. Aggregate both practice attempts and exam-session entries without duplicating records. Keep first attempts, retries, unscored reveals, and author previews distinct; previews do not enter analytics. Display pending AI/manual grades separately from zero and distinguish unavailable data from failure. Explain score weighting, denominators and filters. Preserve original responses and historical scoring; any later adjustment must be explicit and traceable.

Timing and pacing should measure active study where meaningful. Wall-clock time from opening an editor to submission is not evidence of uninterrupted work. Define pause/idle/background behavior before collecting duration metrics, preserve known timing separately from unknown legacy durations, and show sample sizes. Concept performance is evidence of strengths and gaps rather than a claim of mastery. Rebuild analytics from portable authoritative records; indexes remain caches.

## Review scheduling and calendar — planned

Add a transparent, versioned and replaceable review scheduler after trustworthy attempt/course data and basic analytics exist. Recommendations should consider observed performance, recency and question-family coverage, with understandable reasons and user controls. Do not choose or claim an implemented algorithm yet. A calendar inside Study Studio should show planned review sessions and course pacing, respect available study time and workload limits, and update recommendations as practice is completed. Support manual moves, overrides, pausing and locking a session; an automatic update must respect these choices.

Missed sessions should be rescheduled into a manageable workload rather than creating an ever-growing pile of overdue work. Keep planned sessions distinct from completed learning records. Dates, time zones, daylight-saving transitions, missed sessions, workload caps and repeated regeneration require tests before scheduling is considered reliable. External calendar synchronization, notifications and cloud services are separate optional future scope, not implied by the local calendar.

Implementation order and milestone boundaries are tracked in ROADMAP.md. These sections record accepted direction, not completed functionality.


## Course and history foundation — implemented

Course notes store a versioned `studyCourse` property with stable ID and title. Manage courses creates and renames course titles; renaming does not change IDs. Assign current note to courses edits optional `courseIds` on a question or exam note, preserving unrelated frontmatter and body and rejecting concurrent source edits. Membership is independent of directory names; course discovery includes the managed Courses folder and studyCourse metadata. Duplicate course IDs are explicit errors. Reopen already-mounted question cards/editors after membership changes; new exam launches reread their source definition.

Practice cards offer an explicit Course for this attempt selector, defaulting to Unassigned and listing the question's memberships. Finished course selections survive practice draft recovery and retries. Exam launch offers its memberships plus Unassigned, and freezes that one choice for all entries in the session. New records store an optional `{id,title}` course snapshot or explicit null. Old records with no context remain Unassigned; neither current memberships nor directories backfill historical context. Shared questions retain one identity. Frozen historical course labels remain as recorded even after a rename; filters group by stable ID.

Show review history opens a workspace tab containing practice events and submitted exam entries, with course and first-attempt/retry/reveal filters and links to original records. Active exams are reported separately, not scored as completed. Classification uses chronological scored events for the same exact question and course across both sources; a reveal does not increment the scored attempt count. Variants have independent question IDs, with their family identity available for future family-level analytics. First means first in available retained history, not a guaranteed lifetime first attempt. Equal timestamps use a deterministic identity tie-break.

Practice event IDs and exam session/entry IDs determine identity. Identical copied files are counted once; conflicting copies are excluded with visible errors. Corrupt files and grades inconsistent with frozen responses are reported rather than silently included. Completion caches and author previews are not analytics inputs. History reads authoritative files on demand in batches of eight and displays 100 rows at a time; it is not yet an incremental large-history index. Active durations are unknown, not derived from time between opening and submission. This milestone supplies a course/history foundation, not a gradebook dashboard, aggregate grade calculation, scheduler or calendar.


## Code completion — first implementation

Questions support `type: code` with a `code` object containing language (`python`, `bash`, `mathematica`, or `cpp`) and source text. Unique `{{blank:id}}` markers reference ordinary answer records. Source can contain scattered keyword blanks, partial-line expressions, selections crossing lines, or entire/partial blocks. Literal use of this reserved marker syntax is outside the format. Validation rejects missing, duplicate, malformed or unmatched blank references. The source and answers remain portable Markdown/YAML for direct AI generation.

The authoring tab offers a code-source textarea, language selector, highlighted skeleton preview, Ctrl+Shift+B selection-to-blank, restoration of blank content, and separate multiline fields for each accepted alternative. Source selection stores the exact selected bytes; code is not routed through Math Studio. Prompt and explanation retain their normal Markdown/math editors. Fenced-code or raw-code intake supports the code type and starts without invented blanks; saving requires the author to mark at least one blank. Raw-code intake defaults to Python; the language selector can change it.

Practice uses syntax-highlighted supplied code with inline, resizable textarea answer fields. Multiline fields are sized for the reference structure. Tab navigates between fields; Enter inserts a newline without submitting. Code source is rendered as text, not executable HTML, and accepted answers are not inserted into active fields before check/reveal. Syntax highlighting uses Obsidian's bundled Prism grammar, with a plain-code fallback if unavailable. The fields themselves are plain monospace text, not a full IDE or syntax-highlighted editor.

Code matching is case-sensitive. The default exact policy normalizes CRLF/CR line endings to LF but preserves all other whitespace, including indentation. An explicit per-answer `whitespace: trim-outer` policy trims only outer whitespace; it never collapses internal spaces or line boundaries. Alternatives are separate complete strings, including multiline ones. Each blank has equal weight. Other semantically correct programs may be marked wrong unless listed; no program-equivalence claim or learner-code execution is provided. Reference programs are executed only by a separate development verification script against synthetic examples, outside the plugin.

Checking/revealing fills the inline fields with accepted answers and uses the existing scored/neutral feedback; immutable records retain original responses. Code questions reuse course context, drafts, note groups, author previews, variants, exams and history. Example fixtures include sixteen questions across the four languages and an eight-question Code sampler exam. Executable grading and broader language support remain separate future milestones.

## Diagram labeling (first implementation)

`type: diagram` reuses answer IDs, alternatives, scoring, practice recovery, courses and exam snapshots. `diagram` contains a vault image path, nonempty alt description, opaque rectangular `covers` (hex colors), and ordered `labels` with an optional math flag and leader endpoint. Every rectangle stores normalized x/y/width/height coordinates in 0–1; endpoint coordinates use the same scale. Image data remains separate and unchanged. Labels match answer IDs one-to-one. Math grading remains explicit alternatives, not symbolic equivalence.

The workspace editor supports vault-image selection or attachment import, adding/removing covers and labels, dragging rectangles, arrow-key nudging (Shift accelerates), percent size/position controls, label order, optional leader lines and Math Studio answer authoring. Accepted alternatives use one line each. Existing learner fields support Ctrl+M and rendered equation editing. Reveals/checks fill the positions with solutions and retain original submitted responses. Exam results also show solutions on the diagram. No cloud services, OCR, image rewriting or AI grading are involved.

Narrow containers scroll horizontally below 760px to preserve usable controls. Images scale up to 1200px with overlay geometry attached. A changed image file is not snapshotted in historical records: use versioned asset filenames for immutable visual history. Covers are a learning aid, not a security boundary; the unmodified source image remains accessible in the vault. Import creates a vault attachment immediately and leaves it available if the author cancels. Rename tracking for paths inside custom YAML is not yet implemented. Complex overlapping labels, polygon masks and direct drag resizing are later refinements.

Dense diagrams can specify `diagram.minWidth` (760–2400 CSS pixels). The author editor exposes this value; below that width the image scrolls without compressing its labels. Text-only diagram labels omit the Math button so Tab goes directly between answers; Ctrl+M remains available. Mathematical labels retain their Math button.

## Ordering questions

`type: ordering` stores Markdown/math steps in `choices` and a complete unique ID permutation in `correct`. `shuffle: true` randomizes the learner's initial sequence and rotates an accidentally correct shuffle. `response.choices` stores the chosen sequence; an empty array means unanswered. Moving a step records the sequence, while Confirm order explicitly accepts it unchanged. Drafts and exams retain both initial and response orders. Scoring is exact sequence (one point, no partial credit); practice records use `exact-sequence-v1` while existing grading rules remain unchanged.

The author editor lists steps in answer-key order, with Math Studio fields and add/remove/move controls. Learners use Alt+Up/Down on a focused step, arrow buttons, or a draggable handle. Feedback replaces the visible list with the correct sequence without overwriting original responses. Reveals remain unscored. Multiple valid sequences, interchangeable/tied steps, and partial-order grading are future extensions; this first version requires one unambiguous sequence.


## Short answer and essay — first implementation

`type: short-answer` uses `written.reference` (Markdown/LaTeX) and `written.rubric` (unique stable IDs and criterion text). Each criterion is worth one point: 0, 0.5, or 1. The question author edits the prompt, reference, criteria, and explanation in the same single-field editor with Math Studio support. Responses use `blanks.response` as ordinary Markdown, preserving code and math. AI can generate the same portable schema; no cloud grading is enabled.

The learner uses one CodeMirror field. `$...$` and `$$...$$` render as editable Math Studio widgets within prose. Ctrl+M opens math at the caret. Fenced code remains directly editable with syntax highlighting for Python, Bash/shell, C/C++, and Mathematica/Wolfram; unknown languages keep plain code styling. Backtick fences remain visible. Code is never executed. Normal prose Markdown is preserved but this is not a complete replica of Obsidian Live Preview for every Markdown construct. Undo/redo belongs to the field.

Practice submission locks the answer and reveals reference/rubric; Ctrl/Cmd+Enter submits. Review-stage drafts restore locked. All rubric criteria must be rated before saving a self-assessed attempt. Reveal remains unscored. Exam submission freezes responses; nonempty written responses remain pending until assessed in the results view. Pending responses are excluded from graded totals and marked in history; empty responses receive zero. Scores explicitly identify self-assessment (`self-rubric-v1`). Exam assessment can be updated without editing the submitted prose or reference snapshot. AI/rubric feedback with user overrides remains a future integration.


### Native equation typing

An equation stays in source form while the focused editor selection touches its delimiters/body. Moving the cursor out, or leaving the field, renders it. Empty equations remain editable source. Keyboard navigation can enter the source; equation widgets still open Math Studio on click. Inline and display delimiters do not close one another. Unfinished display math cannot scan through a blank paragraph or code fence. Existing valid equation ranges remain parse boundaries during edits elsewhere, including adjacent lines without blank separators.

## Drawing responses

The `drawing` question type reuses the installed Ink Studio frame for freehand strokes, shapes, text, colors, pen width and undo. An optional `drawing` reference holds editable scene JSON and SVG; `written.reference` holds the explanatory answer and `written.rubric` the required features. Authoring supports drawing the reference directly. Text references are valid without an image.

The learner response stores a JSON string in `blanks.response` containing `scene` (Ink Studio JSON string) and `svg` (frozen preview). Drafts retain editable strokes; Done or Cmd/Ctrl+Enter closes the surface before submission. Empty/deleted-only drawings are unanswered. Submission locks the original drawing; feature-based self-assessment uses 0, 0.5 or 1 per criterion. Exam submission preserves pending assessment, excluded from graded totals until reviewed. No pixel matching or cloud calls occur. Attempt snapshots retain the scene, preview, question and rubric independently of later edits. Preview SVG is displayed through an image element, never injected as active markup.

Drawing and essay AI review should share a portable review packet: stable attempt identity, original response, reference and criterion IDs. A future import must validate scores and preserve AI provenance and user overrides. External assistant review is the intended initial workflow; provider API integration is not required. Export/import UI is not yet implemented.

The frame depends on the installed Ink Studio runtime and its current protocol. Missing Ink Studio leaves existing previews readable and gives an enable-plugin message. Embedded images increase snapshot size; large imported images and long drawing sessions have not been benchmarked. Draft preview can lag the newest strokes while drawing; Done waits for a current preview before allowing submission.

## Course lab, practice resets and submission policies

Synthetic courses live under `Courses/Calculus`, `Courses/French`, `Courses/Python` and `Courses/Fluid Dynamics`, each with a Course.md identity, lesson, Questions and Exams. Question and exam discovery uses frontmatter throughout the vault, retaining legacy Study Studio folder support. A practice question with exactly one course membership defaults to that course. The real Fluid Kinematics chapter and 50 figures were copied into the isolated lab only, with an import/hash manifest, and are excluded from the repository. Its source files are unchanged.

Practice offers Reset question, a group-heading context menu action Reset group practice, and the command Reset all practice questions in this note. Resets clear the current note/question draft and completion caches, then reload rendered cards. They do not delete attempt records, affect other notes, or alter exams. Active editors/submissions block a reset until finished. Existing expand/collapse commands stay available without adding a toolbar above each group.

`studyExam.grading` is optional: absent or `on-submit` grades at final exam submission; `immediate` enables a Submit this question action. Immediate submission freezes the response and writes `submittedAt` plus a result. The other responses remain drafts. Essays/drawings await rubric assessment after individual submission. Final exam submission retains prior individual grades and marks remaining unanswered responses zero. Active questions cannot carry results. Active immediate exam submissions appear in history once, with the same event ID/time after final submission. Exam display (`all`/`sections`) is independent of grading policy.

## Performance dashboard and scheduling data foundation

Open study dashboard provides a course selector, latest scored response per question, first-attempt/retry summaries, concept evidence, a question score grid showing the last five events, an exam/section gradebook, and daily scores. Unseen questions stay visible as unmeasured. Reveals and pending assessments do not enter score percentages. Partial immediate exams contribute only submitted entries and remain counted as unfinished. Exact matching, self-assessment, pending and unanswered states retain their provenance. Concept scores use the tags frozen with each attempt; later retagging does not invent earlier evidence. Refresh reloads authoritative records; the cache is not the gradebook. Grid search and pagination bound displayed question rows.

Spaced-repetition design must retain stable question/family/course identities, concept snapshots, response and reference versions, original answers, per-blank or rubric criterion results, practice versus exam context, submission/exposure timestamps, reveal versus scored outcome, and grading provenance. Existing snapshots provide those foundations; reveals are exposures, not successes. An algorithm must decide deliberately how family variants share scheduling, how rubric/partial scores map to review quality, and how immediate exam feedback affects later evidence.

Future data additions: explicit hint usage, confidence/difficulty ratings if useful, verified active-response timing with focus/pause/idle rules, append-only assessment revisions (including AI/model/rubric versions and overrides), and scheduling state containing algorithm version, last review, interval, due date, stability/difficulty or other algorithm-specific parameters, and manual overrides. Do not infer active time from start/finish wall time, convert absent values to zero, call performance mastery, or generate due dates before the algorithm is selected and tested. Existing source snapshots remain authoritative and support migrations. Calendar and automated scheduling are later milestones.

### Dashboard hierarchy and chapters

The main dashboard lists every course's overall score, scored-question coverage, first-attempt score, pending count and last practice. A course opens its own dashboard with overall metrics first, then chapter breakdown, concept performance, score grid, gradebook and daily scores. Clicking a chapter opens its detail page. Overall means the sum of latest scored points per question divided by their possible points; it is not a scheduler mastery estimate or an average of exam percentages. Coverage counts recorded scores, including unanswered submitted exam items scored zero. Course/chapter inventories remain visible before any answers exist.

Optional question `chapters` is a list of `{courseId, chapterId, title}` placements, at most one per assigned course. IDs are stable across folder moves. The question editor offers chapter assignments with existing-title suggestions, and preserves an existing chapter identity on rename. Attempts freeze placements; moving a question never transfers old scores to a new chapter. Legacy records appear under Unassigned chapter. Historical placements can make chapter coverage counts non-additive; course totals deduplicate questions independently. No backfill of historical assignments occurs. `study-dashboard` fences contain `all` or a course ID and provide a launcher on Course.md and Course lab home.md.

## Chapter-local files and move-safe practice

Chapter-specific question and exam notes live under their chapter folder; exams spanning chapters remain at course level. Question/exam IDs and explicit chapter assignments are independent of file paths. Practice caches use persisted note identities and follow Obsidian rename events, including folder moves. Legacy path-keyed drafts/completions migrate without rewriting attempt history. External moves while the plugin is disabled are not guaranteed to preserve the note identity. The isolated lab organizer validates identities and destination conflicts before moving, updates explicit course links, and never overwrites an existing destination.

## Chapter authoring workflow — Sections 1–4

A nearest ancestor Chapter.md containing studyChapter (courseId, chapterId, title) determines the Questions folder and inherited membership for new questions. A nearest Course.md with studyCourse provides a course-only fallback. The lab fixtures contain descriptors for all existing course chapters. A new question is explicitly indexed before inserting its embed, avoiding metadata-discovery races.

Creation preserves the selected passage and offers an individual card or existing group. Keyboard defaults are Ctrl+N for creation, Mod+Alt+G for note question controls, and Mod+Alt+/ for the shortcut guide. The searchable, paginated guide reads the runtime registry plus vault hotkey overrides through guarded Obsidian internals. Local editor shortcuts are documented separately.

Question insertion and group addition default to current chapter, fall back to current course when no chapter is configured, and expose All courses explicitly. Alt+1/2/3 switches fuzzy-picker scope. No-result scopes remain empty. The multi-question group builder also has scope and text filters.

Note controls address a specific embed occurrence and support editing, removal, moving to a group, converting to a group, renaming, adding an existing question, and ungrouping. Removal does not delete the reusable file or history. Source edits reject concurrent note changes. Fenced examples are excluded from top-level embed discovery. Existing cards load edited definitions when reopened; frozen attempt and exam snapshots remain unchanged.

The lab has 42 original Kinematics questions across 20 placements in Sections 1–4, covering recall, application, reasoning, a numeric tensor table, and a drawing response. The real imported chapter stays lab-only. Generated questions and the compact practice page are reproducible fixtures.

Generation cleanup: temporary kinematics comments are optional and removable through a lab-only, dry-run-first script. Existing embedded IDs prevent duplicate insertion after cleanup; partially present sections are left for manual review.

Compact authoring: use a single Markdown editing surface with in-field math and code rendering for question text fields. Keep student preview optional. Authoring math uses Ctrl+M and Ctrl+Shift+M; save uses Ctrl+Enter, save/open source uses Ctrl+Shift+Enter. Multiple-choice drafts begin with empty options and no assumed correct choice. Right-click choice labels or Shift+F10 within a choice opens add/reorder/remove actions; native text context menus stay available inside the editing surface. The compact creation dialog numbers types 1–8 and keeps group placement optional. Numeric shortcuts never intercept title typing.

Next authoring stage: reuse the compact editor inside chapter question cards, retaining an optional workspace editor. Prefer screen-local shortcuts and context menus for secondary actions; extend the shortcut guide with current-screen bindings. Inline mounting and the context-aware guide are not implemented by this compact-layout milestone.

Practice cards foreground the prompt and answers. Single embeds use the collapse summary as their title; groups retain individual headings. Reset/edit/grouping/course/reveal and scoring information use a numbered context menu (Shift+F10, number, Enter). Native text menus remain available in answer fields. Keep Check answer visible. Preserve focus through keyboard submit/retry and avoid moving focus on restored completions. Keyboard-only traversal and mouse interaction are acceptance checks for UI changes.

Choice cards use radio/checkbox shapes without visible selection instructions; the fieldset retains an accessible label.

Practice-card context menus also use Ctrl+Space, scoped to the focused card or its loaded single-question summary. Shift+F10 remains an alternative. Do not handle the shortcut while a math/drawing editor is active or an inner editor has already handled the event.

Multiple-choice authoring supports Option/Alt+Enter insertion with immediate field focus. Ctrl+Space choice menus use stable numbers for add, correctness, reorder, and removal; unavailable moves remain disabled. These shortcuts are local to the question editor and do not operate during an active Math Studio edit.

Save shortcuts in question authoring are handled before nested text editors consume Enter: Ctrl+Enter saves; Ctrl+Shift+Enter saves and opens the source question file. Validation errors receive focus and scroll into view. Capture the source note and selection before opening the creation dialog. Saving a reusable question is independent of changes to its source chapter; only automatic card placement requires the original text to match. A placement conflict leaves the changed chapter intact, saves the question, and tells the user to place the card. Existing question-file edit conflicts remain protected.

## Question removal and deletion

Practice context menus distinguish **Remove from this note** from **Delete question everywhere**. Local removal preserves the reusable Markdown question, other notes, exam templates, attempts, and assets. Selecting a repeated question removes its placements within that note only. Removing a group's last member removes its empty fence; surviving group members and surrounding prose remain.

**Remove multiple questions from this note** activates temporary checkboxes directly beside the rendered questions. Groups open so their individual questions can be selected. Selection persists as Live Preview mounts/unmounts cards; repeated IDs show synchronized checkboxes. Arrow keys move between selection boxes, Space toggles, Ctrl+Enter reviews the removal, and Escape cancels. A temporary selection bar disappears on completion, cancellation, or navigation away. Final confirmation shows the number of cards affected and keeps titles/paths in expandable details. Selection does not occur in a modal list.

The editor's context menu offers **Delete question everywhere** for saved questions. Practice menus expose that separately from local removal. Whole-question deletion checks current question/placement text, blocks exam-template dependencies (including random variants), records a local recovery JSON, removes live top-level study embeds, and moves question files to vault-local trash. Frozen exam sessions, historical attempts, and shared drawing/image assets remain untouched. Concurrent deletion operations are serialized; detected stale data refuses mutation. Partial failures attempt guarded rollback and identify the recovery file. Local removal has the same note/recovery guards but never trashes a question or blocks on an exam reference.

## Table authoring defaults and validation

New table drafts have no filler prompt, explanation, headings, or cell values. Body cells are required answers by default, including newly inserted rows/columns and imported table body cells. Typing an answer supplies the first accepted grading answer automatically; alternative answers and case sensitivity live under the cell's collapsed Answer options. Check Given / formatting to keep supplied text visible or to leave a cell intentionally empty. Existing saved questions preserve their answer/given roles. Column headings are optional strings, including empty headings.

Save and Preview identify missing prompt/title and required table answers with field-level error text and invalid styling, moving focus to the first issue. Formatting cells may be empty; a graded table still needs at least one answer cell. Ctrl+Shift+B toggles answer/given mode. Alt+Enter inserts a row after the focused row; Alt+Shift+Enter inserts a column after the focused column. Alt+Backspace deletes the focused row; Alt+Shift+Backspace deletes the focused column. Keep at least one row and column. New columns focus their optional heading; new rows focus the corresponding cell. These shortcuts apply only in table authoring and defer while a math/drawing editor is active. Alt+arrows moves between cells.

## Highlighted prose blanks

The fill-in-the-blank prompt editor replaces internal markers with atomic highlighted answer text, including rendered math. Markers remain in portable Markdown but are never exposed by moving the editing caret through a highlight. Click a highlight or focus it and press Enter/Space to edit its accepted answers. Answer labels use ordinal numbers, not IDs. Highlights update when the first accepted answer changes. Undo/redo retains draft metadata; saved answer rules include only markers still present in the prompt. New prose-blank drafts start without filler answers or explanation.

Ctrl+Shift+B creates a blank. Whole math selections, including equation-body selections or surrounding whitespace, replace the full equation and store delimiter-free LaTeX plus its inline/display mode. Partial equations are refused with a message to select the whole equation. Restoring a math blank restores delimiters. Grading accepts wrapped/unwrapped LaTeX for math answers, including legacy answers stored with dollar delimiters; this does not add symbolic equivalence checking.

### Shared parent prompts in note groups

A `study-group` can include an optional Markdown `prompt` alongside its title and ordered question IDs. The shared passage, table, math, or image embed renders once above the mixed-type questions, with image links resolved relative to the containing note. Existing groups remain valid. Insert question group opens a workspace editor with empty title/prompt, chapter-scoped searchable member checkboxes, selection-order membership, and Ctrl+Enter save from the parent field. The group summary's right-click / Ctrl+Space menu exposes Edit group and parent prompt (3, Enter). Note management exposes the same editor.

Rename, add, move, and deletion operations preserve the parent prompt. Ungrouping or removing the last member leaves the parent Markdown in the note. Saving an edited group tolerates unrelated note edits but refuses an altered or ambiguously duplicated group. New insertion refuses a changed source rather than replacing unrelated writing. Generated YAML quotes multiline strings to keep nested code fences inside the parent from closing the outer study-group fence.

This milestone covers note groups. Exam groups still need shared-stimulus snapshots and image-source context; selecting these dependent child questions individually for an exam does not yet carry their parent passage. Tables, images, and mathematics render in the parent editor as described below. The group editor supports creating children and reordering members.

### Rendered prompt editing and image import

The shared written editor now renders rectangular Markdown tables as directly editable cells in the same field. Cells use the existing math editor, including `$…$`, `$$…$$`, and Ctrl+M. Tab moves between cells; Escape returns focus to the surrounding prompt. Right-click or Ctrl+Space in a cell exposes Edit table Markdown for row/column structure. Moving the outer caret away from that source region restores the rendered table. Ragged tables and code examples remain source rather than losing content. Cell values escape structural pipes and convert line breaks to `<br>`.

Markdown images and Obsidian image embeds render in the field. Clipboard image files and external image-file drops use the same importer: unique filenames in the nearest chapter's `figures` folder, or a sibling `assets` folder outside a chapter. Imports preserve the original bytes. Importing temporarily locks the field and blocks save to prevent writing a half-imported prompt. Undo removes the embed, not the asset, so redo remains valid; closing an unsaved draft can leave an unused asset. No remote upload is involved.

Image right-click / Ctrl+Space actions provide numbered Left, Center, Right, and Edit Markdown. Alignment persists in a small HTML wrapper around the original embed; Study Studio applies it after native Markdown rendering in editors, practice and review surfaces. Inline images become their own block when aligned. This does not provide image resizing handles or a full native Obsidian editor; Markdown image sizing remains available through Edit Markdown.

Math entry uses Ctrl+M in the focused answer or authoring field; Ctrl+Shift+M inserts display math in prose editors. Persistent Math/Edit math/Insert display math buttons are omitted throughout questions. Existing rendered equations remain clickable to edit.

Short answer inputs in blanks, tables, and diagrams recognize a complete nonempty `$…$` or `$$…$$` expression. Source stays visible while typing; leaving the input renders the expression in place. Incomplete delimiters stay as text. Math Studio receives the expression body without duplicated delimiters.

Rendered blank/table/diagram answers activate inline source editing on click or Enter/Space; Ctrl+M explicitly opens Math Studio. Rendered answer boxes fit their content with compact padding; diagram labels retain their authored geometry.

Single-equation response previews mount the native math node directly, without Markdown paragraph wrappers, so paragraph line spacing cannot inflate their height.

### Group-first authoring and contextual grouping
Groups may be saved with a title and zero questions, allowing shared material to be written first. The group editor shows only its ordered members by default. Alt+Enter opens a numbered question-type menu, creates a blank child draft with chapter/course placement inherited from the source note, and returns the saved question to the pending group. Saving the group persists membership; a child already saved remains a reusable question if the group draft is closed. Reordering uses Alt+Up/Down on a member; Ctrl+Space/right-click offers move and remove actions. Removing a member here does not delete its question file.

Add existing questions is a collapsed browser, scoped to the current chapter by default. It searches titles, prompts, and concepts, renders five prompt previews per page, and provides an expandable interactive full question preview for each result. Tab/Space selects, Up/Down moves among result checkboxes, Alt+Left/Right pages, and Previous/Next are available. Selections persist across searches/pages and appear in the ordered member list.

Group questions on this note is available from the command palette, note context menu, and question menus. It temporarily places checkboxes on standalone cards and opens them for recognition in context. Space selects, Up/Down moves, Ctrl+Enter proceeds, Escape cancels. Selected occurrences are replaced by one group at the first selected location in page order; intervening prose and unselected occurrences stay intact. Existing groups are excluded so their shared prompts are not silently detached. Duplicate references within the selection are rejected because groups require unique members. Source changes during selection/editing block the write and preserve the group draft for review.

## Review, comments, and print surfaces (2026-09-30)
Question cards, including active exam cards and submitted-result cards, expose author-review actions from the context menu. A removal mark is a review decision scoped to the placement/session; it does not delete a reusable question or mutate a running exam snapshot. Selection comments retain the selected quote, question identity when applicable, source path, and context. A vault-local `.obsidian/study-studio-review.json` stores review marks and Markdown critiques separately from responses and scores. The review queue is available from the command palette. No cloud service is involved.

Comments use the existing single-surface rich Markdown editor: inline/display equations, editable tables, highlighted fenced code, images and Ctrl+M. Green Clarify, pink Remove, grey Vague phrasing and Other are starting meanings; each comment has a color picker. Clicking a bordered highlight edits only its own critique; hovering renders only that critique. Resolve retains the record. Note comments are also available through the editor selection menu/command and rendered-passage context menu. Unique quote/context matching preserves a highlight after unrelated preceding changes. Missing or ambiguous quotes remain in the queue without guessing a new location. Partial edits within a quote may detach the highlight; automatic fuzzy anchoring and a reattachment UI are not yet implemented. Repeated rendered snippets across separate renderer blocks may still require explicit source selection.

The first comment implementation lives in Study Studio. It uses native Markdown postprocessing, also used by Slide Studio; a separately packaged general annotation plugin and full slide-editor regression are not yet released. Structured storage is intended to be readable by local AI tools without parsing bracketed comments from prose.

In Live Preview, block IDs at line ends appear as small atomic markers. Partial changes to the ID are rejected; whole paragraph edits remain allowed. Source mode permits deliberate ID editing. IDs remain native Obsidian source and continue serving links. This does not introduce a separate anchor database or change footnotes.

Chapter `study` and `study-group` embeds are omitted by print CSS without source mutation. Exam launcher notes build a print-only question sheet from their definition and current question bank, independent of any user attempt. Native Export to PDF prints this question sheet; launcher controls, review highlights, popovers, and anchor decorations are hidden. The sheet contains questions and blank response space, never grading keys or explanations. Diagram masks/labels use the existing diagram renderer. This is a new question sheet, not a printout of a learner's saved responses or an exact randomized active attempt. The launcher context menu can show the sheet onscreen.

Text answers measure the learner's own input with a hidden text span and grow from a 156px minimum up to the available container width. Rendered equations retain natural height and content width; oversized equations scroll inside the available width. Answer keys never influence field size.

### Standalone sticky comments
Insert sticky note (command palette or editor context menu) creates a 26px colored square at the cursor after saving. It requires no selection. The placement uses a study-sticky block containing an ID; comment Markdown and color stay in the existing review store. The icon opens the shared rich editor; hover or keyboard focus shows its rendered contents. Resolved notes remain accessible as dimmed icons. Placement and popup are hidden from native PDF output. Source mode exposes the placement block.

Sticky-note markers use the selected color as a solid background, including hover and focus.

### Comment window and theme palette
The shared sticky/highlight comment editor supports dragging any edge/corner and maximize/restore without recreating its draft. Content scrolls at small sizes; the rich editor no longer has a separate height cap. Study Studio settings contains Comments and sticky notes: unlimited palette rows with light/dark colors and editable meanings, add/remove and ROYGBIV reset. Purpose options use those meanings. Existing comments retain their saved color/meaning; old comments derive a brighter dark fallback. New comments save both variants. Theme CSS switches highlights and solid sticky fills immediately with the vault theme. This remains part of Study Studio, not a separately packaged plugin.

## Study Home — accepted next milestone

Provide a vault-wide course grid for testing and review, with optional covers/colors, pinned courses, search, and existing score/coverage evidence. Ordinary notes retain Obsidian navigation. Default hierarchy is Home → Course → Chapter, with links to exams/quizzes, practice, saved attempts/results, and dashboards. Investigate a supported Home sidebar tab beside Files/Search/Bookmarks that opens the main workspace view. Keyboard navigation, scoped Ctrl+Space menus, native links/tabs/back-forward behavior, and theme support are acceptance requirements. Reuse course identities, the existing question catalog, and validated metrics; no separate server or duplicated grade history. Detailed unchecked tasks and release checks are maintained in ROADMAP.md. Advanced dashboard visualizations and scheduling remain separate milestones.

## Study Home (2026-09-30)

Native `study-studio-home` ItemView provides a responsive course grid. A supported left sidebar tab and Open Study Home command reuse its workspace tab. Search, arrow navigation, Enter, and Ctrl+Space context actions are scoped to Home. Pins and sort are stored by course ID in a separate vault configuration file; query and course restore with workspace state. Course pages discover chapter notes and exam definitions through current metadata and open native source tabs, dashboards, new sessions, or saved sessions using existing workflows. Scores use normalized authoritative history and exclude pending/unscored responses.

Optional `studyHome` frontmatter on course notes accepts `color` (six-digit hex), `symbol`, and a vault-local `cover` link. Missing covers use a gradient. Course cards and dashboards read the same standard attempt history. The development vault includes seeded student history without a separate demo mode.

The additive `scripts/seed_home_curricula.ts` generator creates 28 questions, nine checkpoint exams and nine chapters across eight curricula, preserving pre-existing notes. It validates serializers, all accepted answers, wrong choices, unanswered responses, exam references, and isolated demo history before writes. An existing Foundation lab fixture remains visible as an additional course.

## French I learning tools (2026-09-30)

Course Home opens a local study calendar, vocabulary browser and review queue. Scheduling v1 derives from validated frozen history, separately for each course/question (so recognition and production remain distinct). Scored days advance through 1/3/7/14/30/60-day intervals; any failed score on a local calendar day resets to one day. Same-day repetitions cannot extend the interval. Pending work, reveals, unanswered exam items, future records and written/drawing rubrics are excluded. Intervals are transparent heuristics, not predicted retention. New, due, overdue and scheduled states remain distinct.

Calendar dates use local civil days, with arrow-key movement. User plans persist in `.obsidian/study-studio-calendar.json`; moving between months does not mutate scores. The development vault imports generated semester records into standard attempt/session storage and plans into the normal calendar. All course actions remain available, with no simulation banners or demo switches. Seed artifacts are retained only as development inputs.

Vocabulary notes use `studyVocabulary` metadata (version, stable ID, courseId, term, meaning, categories, questionIds; optional formOf). User categories are arbitrary, multiple and editable in Markdown. Add vocabulary creates a source note and reusable no-hint typed-recall question with optional accepted alternatives. Accents are required; straight/curly apostrophes and NFC/NFD spellings are authored as alternatives. Editing metadata alone does not rewrite questions or historical snapshots. Entry count includes phrases/forms and is not labeled unique words or proficiency.


## Course library navigation
Home always opens the all-course grid and clears the course search. The Study library sidebar exposes a current-course picker, book-open course overview, gradebook, exams, quizzes, attempts/results, calendar, vocabulary and spaced review. Course overview shows searchable chapter cards with coverage and contextual gradebook/practice actions. Optional `studyChapter.unit` strings create collapsible unit groups; without that property chapters render directly with no unit heading. Search includes unit titles and all chapters; all matching chapters are immediately available without pagination or Show more controls. Optional `studyAssessment.kind: quiz` or `exam` classifies assessment destinations; legacy checkpoint/vocabulary/quiz titles use the quiz destination by default. Assessment definitions and scoring remain unchanged.


Interface copy uses direct descriptive labels: Courses, Search courses, Chapters and Study planner. Avoid promotional slogans and motivational taglines.


Chapter galleries use colored vector-icon covers, chapter numbering, readable titles, question counts, scored coverage and recorded score. Optional studyChapter.icon, color (hex), and cover (vault-local image link) customize any course; no network image request is needed. French I chapter notes supply topic-specific icons. Search and complete chapter visibility remain unchanged.


## Gradebook presentation
Course/chapter dashboards use four summary metrics, SVG daily-performance and scored-activity charts, and reusable searchable/sortable HTML data tables. Chapter titles open chapter detail; assessment titles open frozen submitted responses. Concepts/skills and question history have keyboard-operable view tabs and consistent tables. Tables use native semantics, sticky headers, numeric sorting, horizontal overflow and no pagination. Charts show all retained active UTC days with actual date spacing and accessible exact-value tables. Daily performance is points earned divided by possible points across that day's scored responses, including retries; it is not a weighted course grade. Weighted grading policy remains separate unfinished work.

The all-course library grid, heading, search toolbar and navigation share a centered 1250px maximum-width column within the workspace pane.

Gradebook colors use unrounded ratios: 90% and above green, 85% to below 90% yellow, below 85% red. Unscored/pending-only entries remain neutral. Light and dark palettes cover score cells, score bars, summary score and scored response buttons; counts and coverage are not grades.

Performance chart lines and points retain a uniform blue/accent color rather than grade-threshold colors.

### Assessment attempts and chapter scope
Assessment grade grids use complete submitted session snapshots, grouped by frozen assessment ID, with chronological attempt columns. Each cell opens the submitted record and shows date, scored points, percentage and pending count. First-to-latest change is in percentage points and is withheld when either endpoint is pending or unscored. Active sessions are excluded; duplicate/conflicting history handling remains authoritative.

`studyExam.scope` optionally records `{kind: course}` or `{kind: chapter, chapterId: ...}` and is frozen with a session. Older sessions belong to a chapter only when all frozen questions share exactly one chapter in the selected course. Mixed-chapter and unplaced assessments stay on the course page; a chapter must never display partial midterm/final scores as independent assessments. Optional `studyExam.kind` supports assignment, quiz, test and exam; legacy unspecified types display Assessment. Scope/type authoring controls remain future work; these fields can be authored in YAML. The overall page includes all course assessments. Existing question-level learning metrics still include responses across practice and assessments and are not weighted cumulative grades.

The Chapter 1 dashboard dataset can be additively reproduced with `scripts/expand_chapter_history.ts` against study_studio_lab only. It reuses the existing French I Chapter 1 questions, adds four assessments, 26 submitted sessions and 162 practice attempts, and preserves all existing files. Records include improving and declining scores, variable retry counts, written self-assessment and pending grading, using standard authoritative history without simulation labels in the UI.

Gradebook tables use compact spreadsheet styling: aligned numeric percentages with grade colors, subtle cell borders and alternating rows. Score tables contain no per-cell progress meters. Assessment labels stay fixed during horizontal scrolling; attempt cells show a percentage and short date, with points/time in a tooltip and accessible label. Pending grading has a visible asterisk and legend. Existing chart and course-coverage visualizations remain available.

Recorded responses opened from gradebook cells share a course-independent review renderer. The view shows the assessment title, submission metadata, scored-point summary, numbered question cards and per-question status. Submitted answers render Markdown/math, code, tables, diagram context and drawing previews using existing components. Blank markers use readable numbered placeholders rather than internal IDs. Feedback is expandable and initially open for incorrect/partial responses. Search and All/Needs review/Correct/Pending filters operate without changing saved history. Written rubric scores are read-only in this review view. Unscored reveals and pending grades are distinct from correct answers.

Grade colors use the same rounded whole percentage displayed to the user: displayed 90–100 green, 85–89 yellow, below 85 red. This replaces unrounded color thresholds that could show a yellow 90%. Stored points and calculated scores remain unchanged.

The Study library no longer includes Attempts & results. Completed attempt review belongs in the gradebook. Exams and Quizzes list matching active course sessions under In progress with dated Resume controls, including sessions whose source assessment was removed. Existing active sessions are preserved; Start new attempt distinguishes a new session from Resume. Legacy saved Home results routes restore to the course overview. The existing command-palette session recovery remains available.


## Practice library and multipart chapter integration — 2026-09-30

Practice uses a chapter index and source-section/concept sets, with separate per-chapter response history. Gradebook summaries filter to assessment history; no weighted course grading policy is implied. Explicit chapter numbers support zero and gaps. Multipart chapters currently use an index note linking separate part notes. Authored practice-assessment definitions and first-class part metadata remain follow-up work.


## Practice competency table and workspace — 2026-09-30

Practice sets use the shared sortable/searchable data-grid component, with part, section, competency, measured coverage, status, scored responses, last practice, and open actions. Filters include below 90%, needs work, developing, incomplete coverage, unmeasured, proficient. Competency aggregates latest scored practice response per question, excluding assessments, reveals and pending responses; proficient requires rounded 90% and complete question coverage. Short-answer self-assessment is included and stated. Sets open in persistent workspace tabs with all questions visible, a question navigator, existing draft persistence, per-question submission and retry. Saved panel state includes ordered question IDs and course context.


## Practice attempts — 2026-09-30

The practice table omits the status column and displays explicitly grouped run grades in Attempt 1, Attempt 2, etc., with dates and pending/partial coverage annotations. Change in percentage points requires complete scored endpoints. The competency filter remains available. Practice workspace pages store a run context in restoration state and provide New set attempt; per-question retries update that run's latest response. Legacy ungrouped records contribute to competency but do not manufacture set attempts. Chapter 0 fixtures now have three explicit practice rounds. Build and 151 tests passed; runtime verified three attempt columns, pending and partial labels, and no status column. Grade colors were visually verified after reload.

Chapter landing pages use a reusable `study-chapter-home` block. The containing note’s `studyChapter` frontmatter supplies courseId, chapterId, and either `material` (a vault link path) or `parts` (ordered objects with number, title, path, and optional description). The renderer supplies Practice, chapter Gradebook, and Course overview navigation; parts render as a responsive gallery only when present. Practice links select the owning chapter in the shared attempt grid, and that selection persists in workspace state. Landing pages do not embed practice questions.


## Accepted learning workflow — 2026-09-30

The canonical pedagogical policy is in the lab at `Project docs/Learning and assessment policy.md`; the bounded implementation checklist is `Project docs/Learning workflow implementation.md`. The assistant-independent authoring/results guide is `Project docs/Authoring and results guide.md`. Implement the six foundational practice categories, optional end-of-chapter walkthroughs, rehearsal tests, category-weighted chapter exam draws, and latest-fully-graded-exam chapter grading according to that policy. These are accepted requirements, not completed capabilities. Existing broad assessment aggregates must not be described as the new course-grade policy. Keep policy edits in the canonical vault document rather than duplicating percentages here.

Practice question ordering: optional validated `study.sourceOrder` is a nonnegative finite number. New practice runs use ascending sourceOrder, with natural path order as a legacy fallback. Before starting a practice set, a Practice settings dialog offers Chapter order (default) or Random order. The realized question-ID order is fixed for that run and saved for reload. New set attempt returns to these settings. Active questions show numbers/prompts without authoring titles; author previews retain titles. Multiple questions may assess one definition; a question may contain multiple independently scored blanks.

Practice question-number badges and navigator buttons use an accent color before answering. Deterministically checked correct responses use green, incorrect responses red, and mixed multi-blank responses amber; numeric feedback and per-blank feedback remain visible. These correctness states are distinct from gradebook percentage thresholds. Authoring titles stay hidden in active response cards, including screen-reader labels; author previews keep them. Practice order is chosen before Start practice, never changed mid-run.

Whole-set practice submission: individual Check answer controls remain available. Submit practice at the bottom grades remaining responses in one action, preserving previously checked results. Before submission, a dialog lists displayed question numbers with unanswered fields and offers Return to questions or Submit anyway. Missing fields earn zero while completed blanks retain credit. Correct answers populate deterministic response fields after saving original responses. A large circled final percentage appears at the top using the shared rounded grade thresholds (90+ green, 85–89 yellow, below 85 red). Pending written rubrics delay the final percentage. Submitted exams reuse the circled-grade display once grading is complete.

Practice feedback displays the saved original response under Your answer before corrections and explanation. Multiple blanks retain per-blank labels; empty responses say No answer given. Markdown, math and code render through the shared renderer. Restored completions use the saved attempt response, never the corrected field values.

Missed-question practice: after full submission and grading, Practice missed questions opens a full workspace containing wrong, unanswered, and partially correct questions. Multi-blank questions repeat in full. Pre-start settings select one correct answer (default) or two consecutive correct review rounds to clear a question. Failure resets that question's streak. Each submitted round contributes once; review contexts are distinct from practice-set contexts and never replace original attempt-column scores. Latest competency can reflect later review responses. New set attempt resolves the original full question IDs and starts a fresh queue with chapter order by default. Review queue, streaks, ordering preference, and root attempt are restored with the workspace.

Practice submission is an immutable boundary. Before submission, individual retries replace the current response within that active session. Submit practice saves a complete ordered snapshot in Study Studio/Practice sessions, including frozen question content, responses, grades, choice order, course and review configuration. All questions must be checked and graded; written rubrics must be completed before freezing. A submitted workspace becomes a read-only response page with the circled overall grade. Practice-grid submitted grade buttons reopen that snapshot; live question edits, retries in new sessions and review rounds do not change it. Reset and attempt-save operations reject frozen contexts. Older sessions without snapshots remain labelled Not frozen; they are not retroactively represented as immutable submissions.

Assessment and practice attempt grids display at most five most recent attempts per row, oldest visible to newest. Relative column headings align Latest across rows with different attempt counts; each populated cell retains its lifetime attempt number and date. Older records remain stored. Change since first (pp) continues to compare the original and latest scores across full history.

### Bulk answer visibility in response review

Recorded-response pages provide Expand all answers and Collapse all answers beside search and filtering. These affect all response explanations on the page, including filtered-out rows, and remain in effect as asynchronous rendering finishes. Individual answer disclosures remain available. The shared renderer applies this to practice and exam reviews across courses.

Written practice accepts an empty response through Submit response or its keyboard shortcut. An empty submission records zero with an unanswered basis, reveals the reference and explanation, and offers Try again. Retry restores the editable question within the active session. This shared behavior applies to definition recall and defining-expression practice across courses. Nonempty responses retain rubric self-assessment, and Reveal without scoring remains available.

Practice pages show written-response keyboard and draft instructions once in the page header, when relevant question types are present. Individual response cards reserve their status area for feedback and errors, with no repeated idle instructions.

Written practice uses the shared question-number and navigation outcome colors: full rubric credit green, nonzero partial credit yellow, zero credit (including empty submitted responses) red. Pending self-assessment and unscored reveals remain neutral. Retry resets the outcome. The score status uses the same color.

## Practice-set links

Practice tabs offer Copy link in their native tab context menu (also available in the pane menu), with no extra page button, using the native obsidian://study-studio protocol. Version 1 links carry the vault name, title, stable question IDs and optional course ID; they contain no responses or attempt context. Opening validates the selection against the local bank and opens practice settings before starting a new attempt. Missing questions or courses produce a notice rather than silently opening a partial set. Links reference current question contents and the selected membership at copy time; matching files and this plugin version must be present on the receiving Mac. No service, link database or new dependency is required.

## Citation evidence navigation

Study Studio supports versioned YAML evidence records and compact `obsidian://study-evidence` file/claim links. A claim may cite several papers, each with multiple exact prose selections, whole or partial figures, and whole tables or individual cells. Each selection has an optional comment, explicit color/dark color and opacity. Image bytes and original table source are fingerprinted. Missing or ambiguous text and changed objects are reported explicitly.

Ordinary Pandoc citations retain their source syntax. An adjacent source link identifies the exact evidence occurrence; the rendered citation becomes the navigation control and hides the extra label after matching citekeys. Reading mode and Live Preview support groups. The Live Preview adapter uses the existing Pandoc Reference List cache and native Obsidian CodeMirror instances, not the separate bundled CodeMirror used by standalone editors. Export can omit navigation metadata with `scripts/evidence-export.lua`.

A dedicated full-paper reader avoids viewport virtualization, opens in a tab/window, and displays only the current claim’s temporary selections. It supports comments, jump-to-selection, clear/show and opening the unchanged original. Mouse selection can add or replace a prose passage; figure rectangles are drawn with the mouse. Draggable text endpoints are not implemented. The large resizable comment editor keeps record details collapsible and offers custom colors, named presets and user defaults. Serialized saves compare the record with its loaded snapshot before writing.

Markdown links are blue, TSV red, code purple, citation navigation green, with light/dark palettes. Annotation colors are independent of these link colors. Native PDF annotations, automatic claim verification and aggregated incoming-citation views are deferred. The plan and usage instructions are in `EVIDENCE-DEVELOPMENT-PLAN.md`.


## Protected block anchors

Live Preview and Source mode reject editor changes that remove or invalidate existing block IDs, including deletion of a larger selected passage. Whole-document transformations preserving the IDs remain possible. Right-click a Live Preview anchor chip (or select the ID in Source mode and use the editor menu) to deliberately remove it. A dialog lists indexed incoming wiki/Markdown links and embeds from the current vault, names the note and ID, and requires typing `REMOVE ^id`. The separate command `Remove all block anchors from current note…` requires `REMOVE N ANCHORS`. It has no vault-wide mode. Both operations remove only ID tokens, preserve passage text and are undoable. The dialog refuses stale note/reference state. These are editor safeguards; direct disk edits, other vaults, unindexed content, and plugins explicitly bypassing editor transaction filters are outside their reach. Redo that would remove restored anchors is blocked again and requires deliberate removal.


## Citation Source Viewer — formatting cleanup resilience (2026-10-08)

Use Citation Source Viewer as the visible name while retaining existing view, command and URI identifiers. Resolve saved prose quotations through whitespace, typographic quotation marks, common ligatures, soft hyphens and zero-width spaces. Do not normalize scientific signs, numbers or wording. Repeated quotations require matching context; a unique quotation with changed context stays visible with an explicit review warning. Missing or ambiguous quotations remain unresolved, with review/edit/reselection available even when no highlight can be drawn. Comments remain in citation records, and annotation UI text must not enter source-text matching.

## Citation cleanup and AI review reports (2026-10-08)

Citation matching tolerates Unicode composition, extraction ligatures, soft hyphens, whitespace and markup changes while retaining word/number/sign boundaries. Table selections relocate by unique source digest; newly captured selections additionally retain a rendered fingerprint including cell content, header role and spans. Ambiguous or scientifically changed selections remain flagged.

Export citation review report is available from the viewer context menu and command palette. It creates Markdown and schema-versioned JSON for the current source, with record/claim/citekey identity, source and record SHA256, full flagged selections and annotation metadata, reasons, unverified candidate passages and original line locations, table inventory and figure digests. Export requires a completed highlighted review. It does not edit citations or call an AI.

Margin notes occupy a resizable native side leaf. Notes use horizontal rules, semantic color rails and immediate inline Markdown/math editing. Context menus provide color meanings, underline/highlight, recoverable deletion and resolution. Math excerpts support semantic subexpression anchors, preserving the equation source and layout; source and rendered captures converge on the same MathJax node descriptors. Whole and part notes can overlap. Math repaints are deferred during continuous chapter typing.

### Main-note annotation visibility

Provide a context-menu choice and keyboard commands to toggle every annotation or selected semantic meanings. Preferences are per vault and stored independently of annotation/evidence records. All annotation painters filter the same predicate before composing overlaps; hiding one highlight must preserve a visible underline underneath. Notes remain readable in the margin. No toolbar buttons are required.

## Vault identity in desktop window titles

Desktop workspace windows show the vault name before the active note/view name, so macOS window labels retain vault identity when long chapter titles are truncated. A title-only observer follows native title updates and covers popouts. Unloading restores the latest native title. Note files, workspace layout, and page rendering are unchanged.

## Annotation palette (2026-10-13)

A persistent, draggable palette exposes Highlight, Underline, Text color and Post-it. Each style owns an editable color/meaning palette; defaults include ROYGBIV plus grey and pink. Existing annotations retain their saved colors and meanings. Option+J opens and focuses the palette; H/U/T/P switches style, 1–9 selects a color, arrows and Enter/Space select a swatch, and Escape returns focus to the note. Each action is registered with the command palette and supports assignable hotkeys. Reading and Live Preview use the same captured passage/equation-term anchors.

Colored context-menu swatches use Obsidian-drawn menus through its public API. Annotation style choices are one submenu deep. Related plugins share an Embed or link submenu; visibility stays separate. Empty margin notes produce no hover preview.

Reading-mode marks reveal and emphasize their corresponding margin note. Live Preview retains ordinary cursor/selection behavior and offers Open margin note in the context menu. The selected margin note also emphasizes its equation term. Hover previews use an opaque shell outside Markdown theme rules.

Equation annotations retain saved quotations; if color or formatting edits change TeX, a unique before/after context locates the equation. Parts then resolve through MathJax semantic signatures that ignore color/layout wrappers but preserve mathematical slots. New parts retain semantic occurrence and count; ambiguous legacy matches remain unresolved. Rendering never rewrites saved annotations.

## Protected paper annotations

Image Gallery's `api.library.isProtected(path)` identifies cleaned canonical sources. Post-its on those sources use a quote/context placement in the review sidecar and render a small native marker in Reading and Live Preview; creating and editing one never inserts a `study-sticky` fence. Ordinary notes retain their existing fenced post-it behavior. The margin retains direct editing, rendered math, placement navigation and visibility filtering. Source text protection does not lock the annotation layer.

Highlight fills use 40% color strength in light mode and 34% in dark mode, including overlapping bands and margin excerpts. Math parts follow the same theme strength; a whole-equation context behind selected parts uses a softer fill. Underlines and text-only marks retain their distinct appearance. Evidence-reader marks retain their independent settings.

### Margin list editing (2026-10-13)
Margin note editors support Tab/Shift-Tab and Cmd/Ctrl-]/[ to nest or promote list items, carrying their continuation paragraphs and child items. Ordered lists start or join the destination numbering. Enter retains Markdown continuation for bullets, numbers and task lists; Enter inside a multiline display equation does not insert list markup. Cmd/Ctrl-Enter saves without adding a blank line; Escape saves and returns to rendered notes. Outside lists, Tab retains focus navigation. Quoted lists are left unchanged by indentation. Rendered task checkboxes are read-only; edit their Markdown in the note. No new toolbar is added, and this keymap is scoped to margins, not table cells or answer editors.

### Margin rendering — 2026-10-14
Margin cards show native rendered Markdown when focus leaves the card or Escape is pressed. Clicking text or pressing Enter reopens the retained editor without resetting source, caret or undo. Up to six clean inactive editors remain retained; busy editors and drafts are never evicted. Preview renders offscreen and swaps atomically, with generation guards against stale results. Math Studio, image import, composition, context menus and application switches do not hide an active editor. Save failure keeps and displays the current draft.

Editing supports bold, italic, strikethrough, inline code, Markdown link labels and headings, plus existing math/table/image widgets and nested-list commands. Selected formatting delimiters remain visible for editing; list markers and wikilink brackets remain source while editing. Bare URLs have no additional live styling. This is a bounded editor, not full native Live Preview parity. CommonMark code boundaries distinguish indented list math from literal code; small-field caches cannot evict the main note's incremental parse. Existing equation anchors release when their delimiters change or they move into code.


## Source-mode paper review — 2026-10-14

Source mode retains text and equation annotation decorations. Raw Markdown and block IDs remain visible; Live Preview retains its existing chips and math overlays. In Source mode, a math annotation marks its source equation, including semantic sub-equation annotations whose rendered selection is not a contiguous TeX span.
