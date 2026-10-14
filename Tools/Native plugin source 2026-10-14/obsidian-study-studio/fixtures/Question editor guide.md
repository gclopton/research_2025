# Question editor

Click **Edit question** on a practice card, or run **Study Studio: Edit current question** while its question note is open. Creating a question opens this editor automatically. You can edit the title, concepts, prompt, explanation and answer rules without YAML.

The editor holds a draft. **Ctrl+Enter** saves it; Escape or Cancel discards it. If the source question changes elsewhere while the editor is open, saving stops with a conflict message and retains the visible draft. Existing cards and review sessions keep their frozen version; reopen them to load your saved edits.

## Tables

Each cell has its supplied Markdown content and a Blank checkbox. Focus a cell and press **Ctrl+Shift+B** to toggle it. When a filled cell first becomes a blank, its content seeds the accepted answer; surrounding math dollar delimiters are removed for text matching. Enter alternatives one per line. Original cell Markdown is retained so it can become supplied content again after saving and reopening.

Use **Alt+arrow keys** to move between cell content fields. Tab reaches each cell's controls and answer alternatives. Add row/column and remove row/column controls change only the draft until saved. Removing a row or column removes its corresponding answer rules on save. At least one blank and a rectangular grid are required. Merged cells remain planned.

Changing a blank's content does not automatically change its accepted alternatives; edit those explicitly. A saved blank keeps its original supplied text independently of its grading rules.

## Choices and prose blanks

Edit choices in their text boxes and check Correct for one or several. Space toggles a focused checkbox; Tab moves through the form. Add/remove choices and toggle shuffling without editing properties. Save requires at least two nonempty choices and at least one correct answer.

For prose blanks, select the answer text in the Prompt box and press **Ctrl+Shift+B**, or click **Make selected prompt text a blank**. Its answer is stored automatically. Accepted alternatives use one line each. **Restore answer to prompt** replaces that blank's marker with its first accepted answer and removes its rule.

## Mathematics

Text boxes accept Markdown/LaTeX source. The expandable preview renders the prompt and explanation. **Save and open note for Math Studio** saves the draft and opens the normal note, where the existing visual equation editor can be used. Math Studio is not embedded inside these form text boxes. The table form edits cell Markdown; rendered mathematics is visible when practicing the question.

## Math inside the question editor

All content fields now include a live rendered preview. Click a rendered equation to open Math Studio directly under that field, or place the cursor in its text box and press Ctrl+M. Use Edit / insert math for inline math or Insert display math for multiline equations. The existing palette, matrix, color and equation controls work here. Shift+Enter finishes the equation and returns to the question draft; Ctrl+Enter then saves the question. Escape inside Math Studio cancels only that equation edit.

Accepted answers show each line as math for editing, but keep their original stored format (plain LaTeX stays plain; dollar-delimited math stays delimited). Matching remains text based, so include alternative acceptable spellings where needed. Titles and concept tags are plain text metadata.

## Try the student view

Choose Preview question at the top or bottom of any question editor. It uses your unsaved draft. Enter answers, press Ctrl+Enter or Check answer, reveal the explanation, and Try again as needed. Preview activity never enters study history. Back to editing (or Escape) returns to the draft; Save question is still required to keep edits.

## Make a question while taking notes

Select a passage, then run Study Studio: Create question from selection (or right-click the selection and choose Create study question from selection). Enter a title, choose the type and continue with Ctrl+Enter. Edit and preview the draft, then Ctrl+Enter saves it and adds its collapsible card after the selected passage. Your original text stays intact. Cancelling creates no question.

For a table, select its full Markdown source including the header separator and all rows. The table type is selected automatically. Use Ctrl+Shift+B in the imported grid to hide cells; their contents seed the accepted answers. For a prose blank question, select the answer inside the Prompt field and press Ctrl+Shift+B. Finish any active Math Studio equation with Shift+Enter before saving the question.

Selections inside standard callouts now copy without the enclosing callout heading or quote markers. Math and Markdown formatting remain intact. The new card is placed after the whole callout (and its block ID, if present), keeping the original definition together.
