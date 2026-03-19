<INSTRUCTIONS>
# GENERAL WRITING STYLE
Write most answers in an article style. Avoid tables and bullet points unless necessary.

## EXCEPTIONS
You may use bullet points when:
1) I say “Outline Mode” or ask you to “outline” a section/paper.
2) I ask for step-by-step instructions (installing software, procedures, etc.).

When I say "Derivation Mode" (or "show every step"), write the math as an unbroken chain of aligned equalities where every manipulation is explicit. That means you must show substitutions, distribution, factoring, re-indexing, cancellations, and even simple arithmetic (like combining constants), and you should keep prose to a minimum (only short labels like "substitute," "factor," "use orthonormality," etc., if needed). Don't skip intermediate lines.

When I ask you to transcribe my handwritten math notes, you must transcribe faithfully: preserve my notation, ordering, line breaks, and every intermediate step exactly as written. Do not simplify, compress, or "clean up" the derivation, and do not remove steps I explicitly included. If you detect a mistake, you should fix it, but you must flag the change clearly (for example: [corrected], [typo fixed], or a short oneline note right where the correction occurs). If something is ambiguous, keep my version and add a short [unclear] note rather than guessing.

trigger: when I say “outline” or “Outline Mode.” For each paragraph: write ONE central question as the heading. Then 3–5 bullets; each starts with a sub-question and a concise answer (factoids may be fragments; otherwise one sentence). Use (Inference) when a sub-question is implied, not stated. Preserve authors’ technical terms/parameters; include eq/fig refs. Put definitions as separate bullets: (Definition) Term — short gloss. Merge adjacent micro-paragraphs doing one job; split paragraphs doing two jobs. Optional anchors: (p. X, ¶Y). Do not repeat the headline inside bullets. Prefer fewer, denser bullets.

Definitions: Include as many as needed (0–N), each as its own bullet at the end of the block. Prioritize new/non-standard terms, symbols, or notations; skip obvious background unless the paper uses a special meaning.



# Editing Research Papers

## Dated Tags

When a note contains a `[DATED: ...]` tag, treat it as an explicit request to check whether the tagged claim has been superseded or materially revised by later literature.

### Resolution workflow

1) Verify the claim against the most current literature available (prefer reviews, well-cited benchmark papers, and primary sources as needed).

2) If the claim is **still accurate**:
- Update the paper note by removing the `[DATED: ...]` tag (and/or legacy `[ACCURACY: ...]` tag).
- Optionally tell the user the claim is still accurate, but do **not** create any companion “dated claims” entry for it.

3) If the claim is **outdated or partly outdated** (any material change needed):
- Update the paper note inline so the statement is accurate according to up-to-date research.
- Create or extend the companion note named `<paper>–dated claims.md` and add the **original statement verbatim** there, along with:
  - an “as of <Month YYYY>” status (partly outdated / outdated / unclear),
  - the updated wording you used in the paper,
  - links to the newer sources supporting the update.
- Add a lightweight Obsidian link near the updated inline text pointing to the relevant entry in the companion note (avoid callouts unless the user explicitly asks).

### Bibliography updates (paper notes)

If the paper note has a bibliography section at the end:
- Extend it rather than creating a separate reference list.
- Continue numbering sequentially (e.g., if it ends at 30, add 31, 32, ...).
- Use Obsidian link syntax ` [31](<URL>)`.
- When listing several references back-to-back on a single line, separate them with commas so they render correctly (e.g., `[31](<URL>), [32](<URL>), [33](<URL>)`).

## Question Callouts (paper reviews)

Some paper notes have “review” companions that add question callouts above paragraphs.

When you create or edit these question callouts:
- Use the callout type `> [!question]` and put a short title after it. Do **not** prefix titles with `Questions:` (bad: `> [!question] Questions: ...`; good: `> [!question] Reference electrodes`).
- Exactly **one** question per callout. Do not include multiple questions, numbered lists, or multi-part questions in a single callout.
- Callouts contain **questions only**. Do not include answers, summaries, definitions, or “lessons” inside the callout; place answers in the surrounding prose outside the callout.
- Callout boundary rule: each callout must be its own blockquote. Insert a blank line that does **not** start with `>` between callouts; do not chain multiple `> [!question] ...` headers inside one continuous blockquote.
- Do not ask glossary/definition prompts (avoid “Define X” / “What is X?” when the intent is just a definition). Leave definitions to the glossary; questions should target what the paragraph is doing or what the author is claiming/arguing.
- Do not force an arbitrary number of questions (e.g., always 2 or always 3). Let the paragraph content determine how many questions are needed. Prefer the **minimum** number needed, but add more when the paragraph is doing multiple linked jobs.
- Do not bundle unrelated questions in one callout. If the paragraph (or your intended reading) splits into distinct questions, split them into separate callouts placed immediately above the relevant text.
- Quality bar: each question should map to a distinct claim/step in the surrounding text and should be answerable from that text (or by targeted follow-up reading), not a filler rephrase.

Legacy tag handling: treat `[ACCURACY: ...]` as equivalent to `[DATED: ...]` (ACCURACY is deprecated).


# # Rules for Editing Chapters


## Editing Comments

Editing comments are surrounded by square brackets, e.g., `[editing comment]`. Treat these as actionable revision notes about the immediately surrounding passage (often the sentence or paragraph directly above).

When you revise a passage in response to an editing comment, use the surrounding chapter context to keep terminology, scope, and conventions consistent. After revising, remove the bracketed comment (or incorporate the concern into the prose) so the chapter reads cleanly.

When editing a passage that includes an equation callout (a block beginning with `> [!equation]`), ensure the callout has a specific, context-appropriate title. Be specific enough to distinguish different forms that may recur across the chapter (e.g., “activity form” vs “concentration form”), so you do not end up with many different equations sharing the same generic title.

## Equations

When editing or adding equations, prioritize symbolic clarity and consistency over terseness.

If a symbol is used for more than one quantity within a chapter (for example, $R$ as the gas constant and $R$ as an electrical resistance), treat this as an overloaded symbol that must be disambiguated in the chapter’s `Symbol Index.md`. Do not “merge” meanings into a single row or pack multiple unit systems into a single Units cell.

For constants, record the numerical value in the `Value` column of the chapter symbol index. If multiple unit conventions are commonly useful in the context of the notebook, add an additional row immediately below the constant with the alternative value and units. In that alternative-units row, leave the `Meaning` and `Description` cells blank so the row reads as a unit conversion rather than a second definition.

When you revise an equation callout, scan the equation for symbols and update the symbol index (and, when applicable, the chapter glossary) so the chapter remains self-contained.

Whenever you see an equation callout (a block beginning with `> [!equation]`), try to give it a specific, context-appropriate name in the callout header (e.g., `> [!equation] Nernst equation (concentration form)`), rather than leaving it untitled. Choose names that are specific enough to distinguish closely related forms that may recur across the chapter (e.g., “activity form” vs “concentration form,” “standard-state form,” “linearized/approximate form,” “integrated form,” “cell form” vs “half-cell form”), so you do not end up with many different equations sharing the same generic title.

Each chapter should maintain an `Equation Index.md` file in the chapter folder. When you add or revise an equation callout, copy that equation (keeping the same callout type and title) into the equation index and add a short explanation immediately below the callout. The explanation should, where it makes sense, state the verbal meaning of the equation (“this equation says that …”) and identify the meaning of important chunks (common grouped factors or terms) that help with interpretation or dimensional checking. Keep the equation index in alphabetical order by the callout titles (case-insensitive).


## Conventions

Some chapters use convention callouts (blocks beginning with `> [!convention]`) to capture local rules that readers must apply consistently (sign conventions, reference directions, electrode/cell-schematic conventions, “left vs right” definitions, what is held constant, naming/labeling conventions, etc.).

When you see a convention callout, replace any placeholder text with a short, self-contained description of the convention as stated in the immediately surrounding passage. The goal is that a student can apply the convention correctly by reading only the callout.

Write convention callouts in concise prose (or a few short labeled lines) and keep every line inside the callout prefixed with `>`. Do not introduce new conventions that are not supported by the text; if the passage is ambiguous, align with the nearest explicit convention already established in the chapter and add one clarifying sentence that resolves the ambiguity.

If the chapter uses multiple distinct conventions of the same “type” (for example, more than one sign convention depending on a defined direction), make the callout title specific (e.g., `> [!convention] Convention: Cell-reaction sign convention`) so it does not read like a generic “Convention” repeated many times.

## Questions

Some chapters use questions callouts (blocks beginning with `> [!Questions]`) to help students review the key ideas introduced in the passage that follows the callout.

When you see a questions callout, replace placeholder text with a set of short prompts that test recall and light application of the most important principles, assumptions, distinctions, and conventions in the immediately following passage (until the next major break such as a new subsection heading or a shift to a different topic).

Questions must be substantive: they should target transferable takeaways that a student can apply repeatedly when solving problems (assumptions, limiting cases, model-vs-device distinctions, sign/reference conventions, and “how to proceed” rules). Avoid trivia-style prompts that only test memorization (historical asides, citation numbers, incidental adjectives, or details that are not used later for reasoning).

Questions should be self-contained and should not include solutions. Do not introduce new symbols, definitions, or conventions that are not supported by the text that follows the callout; instead, use the chapter’s existing notation and terminology. It is fine for a questions callout to have only 1–3 prompts if that is what the passage warrants.




## Problem Areas

Problem areas are delimited by `*==...==*` (italic + highlight). This markup flags prose that is unclear, inaccurate, or poorly structured and should be refined. Problem areas are often followed by an editing comment in square brackets that explains what to fix.

When you refine a problem area, preserve important content and structure: do not delete or break definitions, equations, callouts, or other marked-up material. If such elements are adjacent to (or embedded in) the flagged passage, rewrite the surrounding prose without changing their meaning or formatting. After revision, remove the `*==...==*` delimiters from the passage you fixed.

## Section Titles

Some sections may be left with placeholder headers like `#### ???` to indicate that a title is missing. Replace these with a clear, descriptive title that matches the surrounding material.

When adding or fixing a title, do not change the heading level. If the parent section uses a numbering scheme, include numbering while keeping the same level (e.g., under `### (c) ...`, use `#### (c.1) ...`, `#### (c.2) ...` for new subheadings). If the parent section has no such scheme, use an unnumbered descriptive title.

If a heading uses only a letter label (e.g., `### (c) ...`) and the parent section has an explicit numeric identifier in its title (e.g., `## 2.1.1 ...`), you may optionally prefix the letter with the parent numbering for clarity (e.g., `### (2.1.1.c) ...`). Keep the chosen convention consistent within the chapter.

## Definitions

Definitions in chapter text are indicated only by terms surrounded by double equals signs, like `==thermodynamically reversible==`. Other delimiter patterns (e.g., `*==...==*`, `**==...==**`) are emphasis or other markup and must not be treated as glossary terms unless the term itself is exactly wrapped in `==...==`.

Maintain a single glossary for the chapter you are editing, located in that chapter’s folder as `Glossary.md`. Add entries as they appear while editing, and keep the glossary alphabetized by term (case-insensitive).

Write each entry as a short, formal definition in the context of the surrounding material. Prefer reusable, chapter-wide meaning over local paraphrase, and avoid examples unless they are necessary to prevent ambiguity.

Format each entry as `## Term` on its own line, followed by one or more prose paragraphs defining the term. Preserve the term’s wording as it appears in the text (including capitalization), but place it in alphabetical order in the glossary.

Glossary headings must be unique and searchable. Never create a single heading that contains multiple alternative terms (no “Term A (or Term B)” headings). If several terms are used synonymously, choose one canonical heading for the full definition (usually the most precise or most frequently used), and create separate headings for each alternative term that say `See **Canonical Term**.`.

Do not “hide” synonyms by removing them from the chapter text. If the prose lists multiple synonymous terms, keep all of them in the passage so readers can recognize them later. When marking such synonyms for the glossary, prefer to wrap each term in its own `==...==` marker rather than wrapping a whole multi-term phrase in a single marker.

Be careful about scope and granularity. If the chapter uses an adjective as shorthand for a more specific concept (e.g., “electrochemically reversible” meaning an electrode-process behavior), make that explicit in the glossary entry, and put the precise term in its own heading (spelled out, not in parentheses). Do not redefine a broad adjective in a way that falsely implies it always refers to one specific object in every context.


## Symbol Index

Each chapter should maintain a `Symbol Index.md` file in the chapter folder. This file is a compact reference for the meaning of symbols used throughout the chapter, especially those appearing in important equations.

Important equations are typically marked with an equation callout (for example, a block that begins with `> [!equation]`). When you add or revise an important equation, scan it for symbols (including subscripts/superscripts, Greek letters, and named species like $\mathrm{O}$ and $\mathrm{R}$ in generic half-reactions) and add any missing symbols to the chapter’s symbol index. If a symbol is already defined in the index, do not duplicate it; instead, ensure the existing definition matches the chapter’s usage.

Keep the symbol index table sorted in alphabetical order by the symbol as written in the `Symbol` column (case-insensitive), and keep definitions consistent with the chapter’s conventions. Populate all columns: a short `Meaning`, a precise `Description` that reflects how the symbol is used in the chapter (including equation references when helpful), a `Value` when the symbol denotes a constant (leave blank otherwise), and `Units` (use `—` for dimensionless quantities or where units are not applicable).

## Problems

When editing chapters, each exercise must have a self-contained problem statement that reads like a textbook prompt. Write the problem statement inside the exercise callout (the block that begins with `> [!exercise] Exercise N`) and assume the prose and equations that follow the callout are the solution. The statement should supply only the minimum information needed to make the solution well-posed, and it must not include intermediate results or conclusions that the student is supposed to derive.

Match the solution’s notation exactly. Do not introduce new symbols, sign conventions, or reference states unless the solution already defines them. If the solution uses a figure or cell diagram already shown immediately below, you may refer to it (e.g., “Figure 1.1.1b”) rather than re-explaining it. If a numerical value, condition (standard state, temperature, pressure), or polarity assignment is essential to determine directions or signs in the solution, include it explicitly; otherwise omit it.

Prefer short, direct prompts that specify deliverables: what to compute, what to write (balanced net reaction, half-reactions, direction of electron flow, classification), and under what conditions. Use multipart structure only when the solution naturally breaks into distinct tasks; avoid adding extra subparts that are not used. Avoid hinting language (“show that,” “it can be shown,” “hence”) unless the goal is explicitly to verify a claim already stated in the text.

Formatting rules: every line of the problem statement, including display equations and blank lines, must be prefixed with `>` so it stays inside the callout. Replace placeholder text like “Contents” with the actual prompt. If the question has multiple parts, label them as bold headers on their own lines (e.g., `**Part A:** ...`, `**Part B:** ...`) and include at least one blank callout line (`> `) between parts so the separation is visible at a glance.

Self-contained rule: do not require the student to look below the exercise callout (into the solution) to retrieve essential information. If the prompt references an equation/reaction by number (e.g., “Eq. (2.1.69)”), include the needed equation(s) explicitly inside the callout. Likewise, if a figure or diagram is required for the prompt, include it in the callout (or restate the required information from it) rather than relying on the student to scroll into the solution.

Title rule: every exercise callout must have a skill-focused title in the callout header. Use the format `> [!exercise] Exercise N: <Skill Title>` where `<Skill Title>` is short and names the transferable skill (e.g., “Chemical Reversibility,” “Balancing Half-Reactions,” “Applying the Nernst Equation”), not the specific numerical answer or a reference to “this problem.”

### Lessons

When editing chapters, each exercise should have a “Lessons Learned” callout that captures general rules or principles a student can reuse throughout the chapter, not a recap of the specific numerical result. Prefer lessons that state reusable workflows (e.g., sign conventions, mapping between representations, order-of-operations rules, or classification criteria) and avoid lesson statements that depend on the particular figure or values in the exercise unless the chapter repeatedly relies on that same convention.

Do not repeat lessons that have already appeared earlier in the chapter unless repetition is essential for the chapter’s pedagogy. If a “Lessons Learned” panel would add no genuinely new, reusable principle, delete that panel rather than filling it with redundant content.

Formatting rules: write lessons inside a `> [!Lessons] ...` callout. You may include a short title after `[!Lessons]` if it summarizes the set. Number each item as `> **Lesson 1:** ...`, `> **Lesson 2:** ...`, etc., and include at least one blank callout line (`> `) between lessons so the separation is visible at a glance. Replace placeholder text like “Contents” with the actual lessons.





</INSTRUCTIONS>
