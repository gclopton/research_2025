# Study Studio — implementation roadmap

Updated: 2026-09-30. This is the current completion map for the exam and study plugin. The immediate scope is Study Studio in `study_studio_lab`; a dedicated vault-management app and deployment to research vaults are separate projects. This document records the work without starting every milestone automatically.

**Next implementation: Study Home and keyboard navigation.** Follow with shared parent prompts in exams, the complete visual metrics dashboard, then the spaced-repetition engine and review workflow. AI grading and release hardening remain explicit work rather than implied capabilities.

## At a glance

- [x] Initial question types and reusable question bank.
- [x] Basic exam taking, saved responses, and rubric self-assessment.
- [x] Course/chapter metrics foundation and basic score grid.
- [x] Initial comments, sticky notes, and resizing.
- [ ] Study Home course grid and keyboard-first assessment navigation.
- [ ] Shared parent material and frozen assets in exams.
- [ ] Complete visual metrics dashboard.
- [ ] Spaced-repetition engine and daily review queue.
- [ ] Review planning and local calendar.
- [ ] AI grading export/import.
- [ ] Complete comment integration and remaining checks.
- [ ] Authoring recovery and release hardening.
- [ ] Integrated release verification.

## How to read and maintain this document

**Foundation implemented** means working code exists, often with lab verification, but the full intended feature is not finished. **Not implemented** means the feature still needs development. **Verification needed** identifies a specific gap in evidence. A feature becomes complete only after its acceptance workflow works in the lab, including save/reopen where applicable.

Checked boxes mark completed bounded work. Unchecked boxes mark unfinished implementation or verification. Check a milestone in “At a glance” only after its detailed tasks and acceptance check are complete. Update both copies when a milestone changes; preserve any boxes or notes you have edited in the lab. Record detailed test evidence in the repository's `VERIFICATION.md` and maintain this readable copy in the lab. The repository `ROADMAP.md` is the development source; the lab copy is its user-facing mirror. Older specification entries describe earlier stages and should not override this status map.

## What we already have

- [x] Stable question IDs, course/chapter assignments, note placements, and saved history.
- [x] First implementation of all eight question types.
- [x] Written/drawing rubric self-assessment.
- [x] Standalone practice and note groups with shared parent material.
- [x] Keyboard authoring, math/tables/images, and question removal/grouping.
- [x] Exam sections, ordering/randomization, resumption, final/immediate grading, and pending rubric states.
- [x] All-course/course/chapter metrics, concept evidence, basic score grid, and gradebooks.
- [x] Review flags, highlights, sticky notes, Markdown comments, and editable color meanings.
- [x] Resizable comment windows and maximize/restore; drag resizing confirmed by the user.

**Foundation implemented.** Reusable questions have stable identities, chapter/course assignments, note placements, and saved attempt history. The eight initial question types are multiple choice, prose blanks, table completion, code completion, diagram labeling, ordering, written responses, and drawing responses. Essays and drawings support rubric self-assessment; they do not yet have an AI grading exchange.

Questions can be practiced alone or in groups with shared parent material in notes. The authoring workflow includes keyboard shortcuts, rendered math, tables and images, local removal, whole-question deletion with recovery protections, and on-page selection for grouping/removal. A question's saved definition and a historical attempt are separate.

Exams support sections/groups, ordering and randomization, saved responses, resumption, final submission, optional immediate grading, and pending rubric assessment. Basic dashboards already expose all courses, individual courses, chapters, concept evidence, a recent question-score grid, and gradebooks.

Review flags, highlighted comments, standalone sticky notes, Markdown comment content, purpose/color settings, resizable comment windows, and print exclusion have first implementations. Comments currently live inside Study Studio. The user has confirmed smooth drag resizing; the automated suite most recently passed 140 tests. That count is evidence for the tested code, not proof that every planned workflow is complete.

## Next milestone: Study Home and keyboard navigation

**First working implementation installed in the lab (2026-09-30).** Course cards, curriculum links, search/pins, native sidebar entry, and recorded course scores are available. Remaining acceptance work stays unchecked below. Build a vault-wide entry point for testing and review. Vaults already separate subject areas, so the default hierarchy is Home → Course → Chapter. Ordinary notes continue to use Obsidian's file navigation, links, and search. This milestone is the navigation layer over existing assessments and metrics; advanced analytics and scheduling retain their own milestones below.

### Course grid

- [x] Build a responsive course-card grid from the existing course catalog, including courses with no attempts.
- [ ] Give each course an optional vault-local cover and color, with an attractive fallback when no image exists.
- [x] Show the course title, recorded score, scored-question coverage, pending assessments, and last practice with clear labels.
- [x] Keep unmeasured performance visibly distinct from a zero score; defer due counts until a real scheduler exists.
- [x] Support searching courses, pinning favorites, and choosing a useful sort order; persist those preferences by stable course ID.
- [x] Make the card's primary action open its course study overview; keep edit/pin/cover actions in a context menu.
- [ ] Build polished light/dark states, visible keyboard focus, and narrow-window layouts without hardcoded white backgrounds or large fixed header offsets.

### Assessment and dashboard destinations

- [ ] Provide course-level access to exams/quizzes, chapter practice, saved attempts, score pages, and the existing course dashboard.
- [x] Treat quizzes as shorter assessments using the existing exam workflow; avoid a duplicate question bank or grading implementation.
- [x] Distinguish starting a new assessment from resuming an unfinished attempt or opening submitted results.
- [ ] Provide Home → Course → Chapter breadcrumbs and an obvious route back to Home.
- [ ] Use chapter order rather than alphabetically sorting chapter titles; define deterministic handling for missing order information.
- [ ] Link assessments and results to their chapter/source notes, preserving native note-opening behavior.
- [ ] Preserve course/chapter identity through supported renames and moves; update or clearly flag unavailable destinations.

### Native Obsidian entry and keyboard workflow

- [x] Investigate a supported sidebar view with a home icon beside Files/Search/Bookmarks; use a native sidebar tab rather than injecting into Obsidian's private DOM.
- [x] Make the sidebar entry open the full Study Home in the main workspace, reusing an existing Home tab when appropriate.
- [x] Register an Open Study Home command that can receive a user-configurable Obsidian hotkey.
- [x] Provide fast search for courses and assessments, reusing the existing catalog/index and native commands/links where they fit.
- [x] Support arrow-key movement between cards/results, Enter to open, and a predictable Tab order with visible focus.
- [ ] Support right-click and Ctrl+Space for contextual actions; use numbered actions where suitable and keep normal typing intact in search fields.
- [ ] Respect native tab opening and back/forward navigation; retain search, scroll, and focused item when returning to the grid.
- [ ] Scope shortcuts to the focused Study Home surface, avoid conflicts with editors and Math Studio, and document them in the shortcut guide.

### Data and interaction reliability

- [x] Derive displayed metrics from current validated attempt data without copying score history onto course/question definitions.
- [x] Separate loading, empty, filtered-empty, and error states; provide clear recovery when an index or linked file is unavailable.
- [x] Clear stale course/chapter results immediately on navigation and ignore older asynchronous loads that finish afterward.
- [ ] Refresh after course/assessment changes without losing the current filter or focus; avoid rereading the whole history on every keystroke.
- [x] Preserve local notes, attempts, comments, and metadata; do not introduce a server dependency or a new note-management hierarchy.

### Acceptance checks

- [ ] From the sidebar or command palette, find a course, open an assessment, resume a saved attempt, inspect results, and return Home using the keyboard.
- [ ] Repeat the primary routes with mouse interaction and native links/tabs.
- [ ] Verify a course with no questions, a course with ungraded work, duplicate titles with different IDs, and a realistic multi-course catalog.
- [ ] Verify pin/sort preferences, rename/move behavior, restart restoration, and stale-load handling.
- [ ] Visually inspect covers, metric labels, focus states, and responsive layout in light/dark themes and a narrow window.
- [ ] Check the Study Home milestone complete only after the navigation workflows pass; do not mark advanced dashboards or scheduling complete with it.

The Exam/Exam 8 source review supplied the illustrated-card and breadcrumb ideas. Reuse those interaction ideas while retaining Study Studio's existing data model and immutable attempts. This checklist specifies new work; it does not claim the old app was run or the new homepage is already implemented.

## 1. Carry shared parent material into exams

- [ ] Add shared passage/image/table/math prompts to exam groups.
- [ ] Carry parent material and asset source paths when reusing a group.
- [ ] Keep dependent questions together through shuffle and section navigation.
- [ ] Freeze shared prompts and protect historical image assets.
- [ ] Verify create → save → start → reload → resume → submit → review → export, including later source edits.

**Not implemented; follows Study Home.** Exam groups need their own shared passage, plot, image, table, instructions, and mathematics. Reusing a group should carry that material with its children and retain its source path for resolving assets. A group must remain coherent when questions are shuffled or sections are shown separately.

Starting an exam must freeze its parent material along with the questions. Historical visual references also need a deliberate asset strategy: currently an image file changed in place can change what an older question displays. Versioned assets or snapshots must preserve the original exam stimulus.

**Complete when:** a mixed-type group with a passage, table, image, and equation survives creation, save, start, reload, resume, submission, review, and export. Editing the source afterward must not change the material in that saved attempt.

## 2. Finish the metrics dashboard

**Foundation implemented; dashboard experience unfinished.** The current tables and basic score grid provide real data. The next stage should make it easy to see where to study, what has improved, and what remains untested. The supplied dashboard screenshots establish a direction: compact cards, legible grids, restrained color, trends, and light/dark layouts.

### All-courses home

- [ ] Build compact course cards with score, coverage rings, pending count, and last practice.
- [ ] Connect due counts and the review action after scheduling exists.

Show one course card with its latest recorded performance, coverage, pending assessments, and last practice. A coverage ring can show “24 of 40 questions scored.” Keep the score beside it as a separate measure. Once scheduling exists, add due-review counts and a review action. Until then, do not show invented due dates or retention percentages.

### Course overview and chapter breakdown

- [x] Build the visual chapter grid and clearly labeled progress bars.
- [x] Keep drill-down navigation to question and concept evidence.

Place overall metrics first, then a chapter grid with performance, coverage, first-attempt scores, pending work, and last practice. Each chapter should open its question and concept evidence. Progress bars should name what progresses: questions attempted, questions scored, or planned review work completed. There is no automatic percentage for “chapter learned.”

### Grade grid and concept evidence

- [ ] Expand the existing grid with filters, readable values, and distinct ungraded/reveal/pending states.
- [ ] Open original answers and grading evidence from grid cells.
- [ ] Show concept evidence volume and recency alongside performance.

Develop the existing question grid into a searchable, filterable matrix. Rows identify questions or concepts; columns show attempts or a clearly chosen time grouping. Cells use both color and readable values. Unseen, revealed, pending, unanswered, and scored states must look distinct. Opening a cell should reveal the original answer and grading evidence.

A concept panel can show where performance is strong or weak, how much evidence exists, and how recent it is. Any later competency estimate must explain its inputs and uncertainty; one correct multiple-choice answer is weak evidence of durable understanding.

### Trends and workload

- [ ] Add score-trend charts with sample counts and first-attempt/retry distinctions.
- [ ] Add activity/workload views and meaningful actions.
- [ ] Define and implement active timing before displaying time-on-task metrics.

Use line charts for recorded score trends and bars or a calendar grid for review activity. Include sample counts and distinguish first attempts from retries. Comparing different question sets should not imply a controlled measurement of improvement. Show time spent only after active timing is implemented; leaving a tab open is not measured studying.

### Calculation rules and acceptance

- [ ] Audit every metric against known histories, including moved/shared questions and partial grading.
- [ ] Explain score denominators, coverage, and filters in the UI.
- [ ] Verify empty and realistic multi-course dashboards with keyboard/mouse in both themes.

The current overall score is the sum of latest scored points for each question divided by their possible points. It is neither a formal weighted course grade nor an average of exam percentages. Coverage includes scored unanswered exam items; pending assessments and reveals do not count as graded performance. Chapter histories retain their original placements, so moved questions need clear explanation and course totals must remain deduplicated.

**Complete when:** every displayed number matches a known synthetic history, filters and labels explain denominators, empty and partially graded courses remain useful, and a realistic multi-course bank works comfortably with mouse and keyboard in both themes. Widgets should lead to evidence or an action; decorative gauges are optional.

## 3. Implement spaced repetition

**Not implemented.** The attempt history provides a useful foundation, but no selected, validated scheduling algorithm or real due queue exists yet. Break the work into three bounded stages so the algorithm, user workflow, and calendar are independently testable.

### Define what counts as a review

- [ ] Define treatment of partial credit, rubrics, reveals, same-session retries, and exam answers.
- [ ] Choose shared versus independent scheduling for question variants.
- [ ] Define suspension and pending-assessment behavior.

Decide how partial credit, rubric judgments, revealed answers, retries in one sitting, and exam answers influence scheduling. Define whether related question variants share a schedule or remain separate, and how suspending a poor question affects the queue. A reveal is exposure, not successful recall. Pending assessments should not silently become failed reviews.

### Build the scheduling engine

- [ ] Select and document the review algorithm.
- [ ] Persist versioned scheduling state, intervals, and due dates.
- [ ] Support rebuilds/migrations from original events.
- [ ] Decide whether confidence, difficulty, and hints should be collected.

Select and document the algorithm before implementation. Store its version, review time, next due date, interval, and any algorithm-specific state. Preserve original events so schedules can be rebuilt or migrated. Separate performance scores from predicted retention. Confidence, difficulty ratings, and hints may be useful inputs, but collecting them should have a defined purpose.

### Make the daily review workflow useful

- [ ] Build due queue, daily workload limits, and new-question limits.
- [ ] Add suspend/resume, manual rescheduling, and explanations for due items.
- [ ] Preserve parent material in review sessions.
- [ ] Verify each review updates scheduling exactly once across save/restart.
- [ ] Test lapses, missing history, variants, partial/pending grades, time zones, daylight saving, and migrations.

Provide a due queue, a manageable daily workload, limits on new questions, suspend/resume, and manual rescheduling. Keep shared parent material with dependent questions. Explain why an item is due. Completing a review should update its schedule once, including after a restart or repeated save.

**Complete when:** deterministic tests cover lapses, missing history, repeated reviews, partial/pending grades, variant policies, timezone/daylight-saving changes, and schema migration. A user can complete a small review session, restart Obsidian, and see the correct remaining queue with no duplicated updates.

## 4. Add review planning and a local calendar

- [ ] Display planned sessions and daily workload.
- [ ] Support moving, pausing, and locking sessions.
- [ ] Redistribute missed work within workload limits.
- [ ] Verify regenerated plans preserve manual choices and historical scores.

**Not implemented; depends on scheduling.** Show planned review sessions and workload by day, allow sessions to move or pause, and preserve manually locked plans. Missed days should lead to manageable redistribution rather than an endless overdue pile. Planned work remains separate from completed attempts. Notifications and external calendar integration are optional later scope.

**Complete when:** moving, skipping, completing, and regenerating plans preserves user choices and respects the available workload without changing historical scores.

## 5. Finish the AI grading exchange

- [ ] Export response, question/parent snapshots, rubric, and stable attempt IDs.
- [ ] Validate and import criterion scores and explanations.
- [ ] Preserve AI provenance, assessment revisions, and user overrides.
- [ ] Verify essay/drawing round-trips and reject mismatched or duplicate feedback.

**Not implemented.** Export a portable review packet containing the original response, question and parent prompt snapshots, reference answer, rubric criteria, and stable attempt identity. Import criterion scores and explanations with validation, preserving the AI source and subsequent user overrides. Essays and drawings should use the same exchange where possible.

Start with local files that an assistant can review. Automatic provider calls are a separate option. Mathematical rendering does not currently provide symbolic equivalence grading, and code-completion answers are not executed.

**Complete when:** an assessment round-trip updates the intended attempt, rejects mismatched/duplicate feedback safely, records revisions, and never rewrites the learner's original response.

## 6. Complete review and comment integration

- [ ] Visually verify automatic light/dark color switching.
- [ ] Verify comments on exam/result selections and inside Slide Studio.
- [ ] Verify comment behavior after moving/renaming notes.
- [ ] Add orphaned-comment discovery and reattachment.
- [ ] Connect review flags to question revision/removal follow-through.
- [ ] Decide standalone comment-plugin packaging and implement migration if extracted.
- [ ] Verify resolve/reopen/restart, isolated popups, both themes, and narrow resized windows.

**Foundation implemented.** Finish dark-theme visual checks, comments on exam/result selections, Slide Studio interaction, and behavior after renaming/moving source notes. Add a way to find and reattach comments whose selected passage has changed. Review flags need a convenient follow-through workflow for revising or removing a question while preserving historical attempts.

Decide whether comments become a standalone shared plugin before broad release. If they move, migrate existing IDs, sticky placements, palette settings, and stored critiques. They should not require recreating comments.

**Complete when:** a critique can be created, reopened, located in the review queue, resolved, and retained after restart; only that critique appears in its popup; highlights and stickies stay out of print. Verify both color variants and resizable windows at narrow sizes.

## French pilot and expandable vocabulary

Detailed lab plan: `Project docs/French course and vocabulary plan.md`. Approved direction: source-grounded French pilot and an extensible vocabulary collection with genuine typed recall.

- [ ] Map and author two source-grounded pilot units before expanding the full course.
- [x] Add editable vocabulary entries, custom categories, and a separate vocabulary-test destination.
- [ ] Add no-hint full-answer recall and distinct recognition/production evidence.
- [x] Populate gradebooks and vocabulary views with semester-scale history.
- [ ] Complete large-catalog performance stress testing.
- [ ] Add a sourced engineering/materials-science reading extension.

## Course slides integration

**Approved direction; not implemented.** Study Studio discovers and launches course decks; Slide Studio owns slide editing and presentation. Start with chapter-linked decks, Create, Open, and Present before adding lecture-preparation shortcuts or AI drafting.

- [ ] Add a Slides destination to course overviews and show chapter-associated decks alongside chapter study content.
- [ ] Add Create slides for this chapter, creating an empty deck under the chapter's `Slides/` folder with stable course/chapter associations and a source-note link.
- [ ] Support course-wide decks covering multiple chapters without requiring a single chapter placement.
- [ ] Open a selected deck in Slide Studio and offer Present directly; use its stable-ID protocol routes rather than duplicating its editor or presenter.
- [ ] Add keyboard-accessible deck search/navigation and contextual rename, duplicate, move, and reassignment actions, consistent with existing Home shortcuts.
- [ ] Preserve deck/course/chapter associations after renames and moves; clearly report missing or duplicate IDs.
- [ ] Keep course navigation usable when Slide Studio is absent; explain unavailable slide actions without breaking course content.
- [ ] Validate create → edit → present → return to course, reuse across chapters, moves, restart, and keyboard/mouse workflows in the lab.
- [ ] Later: optional AI drafts from explicitly selected chapter content, reviewed before use; do not silently rewrite source chapters.
- [ ] Later: Continue preparing shortcut and critique-note integration, with private critiques hidden during presentation and printing.

**Interface check (2026-09-30):** Slide Studio already registers an `obsidian://slide-studio` handler taking a stable `id`, optional `vault`, and `mode=present` for playback; ordinary mode opens the editor. Its current `create(kind)` opens a generic creation modal. Chapter-targeted creation and course membership need an explicit integration contract rather than relying on private UI internals. These findings are source-code checks, not runtime integration verification.

## 7. Harden authoring, persistence, assets, and printing


### Compact chapter properties

- [ ] Replace the raw `studyChapter` object in the normal chapter view with a compact, readable chapter-details presentation (course and chapter names; technical IDs available only when needed).
- [ ] Make chapter details collapsible, collapsed by default, with a remembered option to hide them and an accessible way to show them again.
- [ ] Preserve the underlying frontmatter and native source editing; scope this presentation to Study Studio metadata without hiding unrelated user properties.
- [ ] Verify keyboard operation, light/dark themes, and print output without exposing raw metadata.


- [ ] Recover unsaved authoring drafts after restart.
- [ ] Finish direct in-page editing where useful.
- [ ] Audit shortcut conflicts and update the guide.
- [ ] Test actual image drag/drop, large banks, long answers, and long drawings.
- [ ] Handle custom-metadata asset paths and external moves deliberately.
- [ ] Verify upgrade preservation and recovery from corrupt/interrupted writes.
- [x] Verify chapter practice/comment print exclusion and basic exam-sheet export.
- [ ] Verify mixed-exam pagination, diagrams, tables, shared prompts, and both themes.
- [ ] Add exact randomized-attempt printing and graded response reports as separate export modes.
- [ ] Pass the complete author → take → interrupt → resume → submit → review → print upgrade workflow.

**Partly implemented.** Add recovery for unsaved authoring drafts after a restart. Finish direct in-page editing where useful, keeping the optional full editor. Audit shortcut conflicts and update the shortcut guide. Test actual image drag-and-drop, large banks, long responses, and longer drawing sessions.

Question IDs survive normal in-app moves, but asset paths in custom metadata and moves performed outside Obsidian need additional handling. Prevent an update from losing comment stores, response drafts, history, or course settings. Exercise corrupt records and interrupted saves with recoverable behavior.

Chapter practice exclusion and a basic exam question-sheet PDF are verified. Extend checks to mixed exams, long tables, diagrams, shared prompts, page breaks, and both themes. The current printable sheet comes from the exam definition/current bank; an exact randomized attempt printout or graded response report is separate unfinished work.

**Complete when:** a realistic exam is authored, taken, interrupted, resumed, submitted, reviewed, and printed successfully after an upgrade, with original responses and assets preserved.

## 8. Gate the first integrated release

- [ ] Create a versioned release with migration notes.
- [ ] Test the Studio plugins together with the intended theme/plugin set.
- [ ] Rehearse backup/restore and rollback.
- [ ] Verify keyboard, rendering, print, and saved-data compatibility before release.

**Not completed.** Establish a versioned release and migration notes, then test Study Studio with Math Studio, Ink Studio, Slide Studio, the theme, and the intended shared plugin set in an integrated test vault. Release readiness includes a backup/restore rehearsal and checks for keyboard, rendering, printing, and saved-data compatibility.

Vault inventory, a management application, template installation, and fleet-wide rollout belong to the later vault-management project. They must preserve each vault's own content and learning records. No production-vault rollout is authorized by this roadmap.

## Later enhancements that need their own scope

- [ ] Advanced table spans/layouts.
- [ ] Multiple valid ordering sequences.
- [ ] Richer diagram masks.
- [ ] Isolated executable code grading.
- [ ] Symbolic mathematics grading.
- [ ] Broader code-language support.

Advanced table spans, multiple valid ordering sequences, richer diagram masks, executable code grading, symbolic mathematics grading, and broader language support remain possible extensions. They should not be mistaken for capabilities of the current exact-answer question types or prerequisites for the first useful integrated release.

## Immediate checkpoint

Resume with the Study Home checklist above: a course grid, assessment/dashboard destinations, and native keyboard navigation. Then complete shared exam parent prompts, the visual metrics dashboard, and the first bounded scheduler. Keep AI review and durability work visible alongside those milestones. The next work session should update this page instead of reconstructing status from chat history.


## French I delivery — 2026-09-30

- [x] Build the bounded twelve-chapter French I curriculum with original readings, vocabulary, rubrics, checkpoints, midterm and final.
- [x] Validate 444 authored questions, 27 assessments and all internal destinations.
- [x] Populate standard study history and calendar plans for semester-scale testing.
- [x] Add chapter score cards, skill summaries, collapsible detailed grids and readable submitted-answer evidence.
- [x] Deliver a documented first version of spaced review with distinct new/due/overdue/scheduled states and same-day repetition protection.
- [x] Deliver a local month calendar with persistent plans, recorded activity, review dates and arrow-key movement.
- [x] Add searchable editable vocabulary categories and keyboard creation of no-hint recall questions.
- [x] Restore dashboard/planner tabs across app reloads.
- [ ] Finish the remaining advanced scheduling, audio assessment, theme/size and integrated-release checks above.

See the lab's `Project docs/French I build/Build status.md` for evidence and precise limits. The course and the working v1 study tools are available; this update does not close the entire plugin roadmap.


## Accepted learning workflow — 2026-09-30

The canonical pedagogical policy is in the lab at `Project docs/Learning and assessment policy.md`; the bounded implementation checklist is `Project docs/Learning workflow implementation.md`. The assistant-independent authoring/results guide is `Project docs/Authoring and results guide.md`. Implement the six foundational practice categories, optional end-of-chapter walkthroughs, rehearsal tests, category-weighted chapter exam draws, and latest-fully-graded-exam chapter grading according to that policy. These are accepted requirements, not completed capabilities. Existing broad assessment aggregates must not be described as the new course-grade policy. Keep policy edits in the canonical vault document rather than duplicating percentages here.
