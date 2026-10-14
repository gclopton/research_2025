# Exams in Study Studio

Use **Study Studio: Create exam** in the command palette to build an exam. Add sections and groups, choose questions, and choose whether each slot uses the exact question or one or more versions from its family. Use Move up / Move down for fixed order, or enable shuffling. Optional ordering constraints keep selected items after their prerequisites.

The saved exam is a Markdown note in `Study Studio/Exams`. Its **Start new exam** button freezes the question versions and option order. **Edit exam** changes the definition for future sessions. It does not change sessions already started.

Choose whole-exam or section-by-section display in the builder. Responses save locally; finish any open Math Studio equation and wait for **Exam saved locally** before closing. **Study Studio: Resume exam or view exam results** restores the saved section, responses and order, including after restarting Obsidian.

Solutions stay hidden until **Submit exam**. Unanswered questions earn zero; each blank is one point and each multiple-choice question is one point. Results include question, section and overall scores. Expand each result to inspect the frozen prompt, submitted response, correct answers and explanation.

Exam sessions and results are stored separately under `Study Studio/Exam sessions`. They do not create duplicate practice-history records. AI grading and symbolic equivalence are not part of this version.

Try [[Study Studio/Exams/Foundations and calculus]] for a synthetic two-section example.
