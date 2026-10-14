import { parseDocument } from "yaml";
import { Definition, Question, validate } from "./model";
export interface DraftCell {
  id: string;
  text: string;
  blank: boolean;
  accepted: string;
  caseSensitive: boolean;
}
export interface TableDraft {
  columns: string[];
  rows: DraftCell[][];
}
export const alternatives = (value: string) =>
  value
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
export function tableDraft(q: Question): TableDraft {
  const table = q.definition.table!;
  return {
    columns: [...table.columns],
    rows: table.rows.map((row) =>
      row.map((cell) => {
        const answer = q.definition.answers?.find((a) => a.id === cell.blank);
        return {
          id: cell.blank ?? `cell-${crypto.randomUUID()}`,
          text: cell.text ?? cell.sourceText ?? answer?.accepted[0] ?? "",
          blank: !!cell.blank,
          accepted: answer?.accepted.join("\n") ?? "",
          caseSensitive: answer?.caseSensitive ?? false,
        };
      }),
    ),
  };
}
export function toggleBlank(cell: DraftCell) {
  cell.blank = !cell.blank;
  if (cell.blank && !cell.accepted.trim())
    cell.accepted = cell.text
      .trim()
      .replace(/^\$\$?([\s\S]*?)\$\$?$/, "$1")
      .trim();
}
export function applyTable(d: Definition, grid: TableDraft): Definition {
  const next = structuredClone(d);
  next.table = {
    columns: [...grid.columns],
    rows: grid.rows.map((row) =>
      row.map((c) =>
        c.blank ? { blank: c.id, sourceText: c.text } : { text: c.text },
      ),
    ),
  };
  next.answers = grid.rows
    .flat()
    .filter((c) => c.blank)
    .map((c) => ({
      id: c.id,
      accepted: alternatives(c.accepted),
      caseSensitive: c.caseSensitive,
    }));
  return next;
}
export function editedSource(
  q: Question,
  definition: Definition,
  prompt: string,
  explanation: string,
): string {
  validate(definition, prompt);
  const m = q.raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!m) throw new Error("Missing question properties.");
  const front = parseDocument(m[1]);
  if (front.errors.length) throw new Error("Invalid question properties.");
  front.set("study", definition);
  const body =
    prompt === q.prompt && explanation === q.explanation
      ? m[2]
      : `\n## Prompt\n\n${prompt}\n\n## Explanation\n\n${explanation}\n`;
  return `---\n${front.toString()}---\n${body}`;
}
export function checkedReplacement(
  current: string,
  expected: string,
  next: string,
) {
  if (current !== expected)
    throw new Error(
      "This question changed outside this editor. Your draft is still here. Copy it before reopening the latest version; nothing was overwritten.",
    );
  return next;
}

export function tableIssues(grid:TableDraft):{field:string;message:string}[]{
 const issues:{field:string;message:string}[]=[];
 if(!grid.rows.flat().some(c=>c.blank))issues.push({field:'blanks',message:'Keep at least one answer cell: uncheck Given / formatting or press Ctrl+Shift+B in that cell.'});
 grid.rows.forEach((row,r)=>row.forEach((cell,c)=>{if(cell.blank&&!alternatives(cell.accepted).length)issues.push({field:`answer:${r}:${c}`,message:'Enter at least one accepted answer for this blank.'});}));
 return issues;
}

export function setTableCellText(cell:DraftCell,text:string){
 cell.text=text;
 if(cell.blank||cell.accepted){const rest=alternatives(cell.accepted).slice(1);const answer=text.trim().replace(/^\$\$?([\s\S]*?)\$\$?$/,'$1').trim();cell.accepted=[answer,...rest].join('\n');}
}
export function newAnswerCell():DraftCell{return {id:`cell-${crypto.randomUUID()}`,text:'',blank:true,accepted:'',caseSensitive:false};}
