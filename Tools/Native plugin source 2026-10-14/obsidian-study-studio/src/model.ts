import {ChapterPlacement,validatePlacements} from "./chapter-model";
import {validateDrawingResponse} from "./drawing-model";
import {DiagramDefinition,validateDiagram} from "./diagram-model";
import {CodeDefinition,codeLanguages,codeMarkers,normalizeCodeAnswer} from "./code-model";
import {CourseContext, validateMembership, validateCourseContext} from "./course-model";
import { parse, stringify } from "yaml";
export type Kind = "choice" | "blank" | "table" | "code" | "diagram" | "ordering" | "short-answer" | "drawing";
export interface Answer {
  id: string;
  accepted: string[];
  math?: "inline"|"display";
  caseSensitive?: boolean;
  whitespace?: "exact" | "trim-outer";
}
export interface Choice {
  id: string;
  text: string;
}
export interface Cell {
  sourceText?: string;
  text?: string;
  blank?: string;
}
export interface Definition {
  version: 1;
  id: string;
  title: string;
  familyId?: string;
  sourceOrder?: number;
  courseIds?: string[];
  chapters?: ChapterPlacement[];
  type: Kind;
  concepts: string[];
  choices?: Choice[];
  correct?: string[];
  shuffle?: boolean;
  answers?: Answer[];
  table?: { columns: string[]; rows: Cell[][] };
  code?: CodeDefinition;
  diagram?: DiagramDefinition;
  drawing?: { scene: string; svg: string };
  written?: { reference: string; rubric: {id:string; text:string}[] };
}
export interface Question {
  definition: Definition;
  prompt: string;
  explanation: string;
  raw: string;
  path: string;
}
export type Response = { choices: string[]; blanks: Record<string, string>; reviewed?: boolean; selfAssessment?: Record<string, number> };
export interface Grade {
  pending?: boolean;
  basis?: "self-assessed" | "unanswered";
  earned: number;
  possible: number;
  details: { id: string; correct: boolean; expected: string[] }[];
}
export interface Attempt {
  version: 1;
  id: string;
  questionId: string;
  started: string;
  finished: string;
  context: string;
  course?: CourseContext;
  mode: "attempt" | "reveal";
  question: Question;
  choiceOrder: string[];
  response: Response;
  grade: Grade | null;
  gradingRule: "exact-choice-set-or-equal-weight-blanks-v1" | "exact-sequence-v1" | "self-rubric-v1";
}
function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
const validId = (x: unknown): x is string =>
  typeof x === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(x);
const text = (x: unknown): x is string =>
  typeof x === "string" && x.trim().length > 0;
export function validate(d: any, prompt: string): asserts d is Definition {
  check(d && d.version === 1, "Expected study schema version 1.");
  check(
    validId(d.id),
    "Question needs a stable ID (letters, numbers, hyphens).",
  );
  validateMembership(d.courseIds);
  validatePlacements(d.chapters,d.courseIds);
  check(text(d.title), "Question needs a title.");
  check(d.sourceOrder===undefined||(Number.isFinite(d.sourceOrder)&&d.sourceOrder>=0), "sourceOrder must be a nonnegative finite number.");
  check(
    d.familyId === undefined || validId(d.familyId),
    "familyId must be a stable ID.",
  );
  check(
    ["choice", "blank", "table", "code", "diagram", "ordering", "short-answer", "drawing"].includes(d.type),
    "Unsupported question type.",
  );
  check(
    Array.isArray(d.concepts) && d.concepts.every(text),
    "concepts must be a list of strings.",
  );
  check(text(prompt), "Prompt cannot be empty.");
  if((["short-answer","drawing"].includes(d.type))) {
    if(d.type==="drawing"&&d.drawing){validateDrawingResponse(JSON.stringify(d.drawing));check(text(d.drawing.scene)&&text(d.drawing.svg),"Reference drawing needs strokes and a preview.");}
    check(d.written && text(d.written.reference), "Provide a reference answer.");
    check(Array.isArray(d.written.rubric) && d.written.rubric.length > 0 && d.written.rubric.every((r:any)=>r && validId(r.id) && text(r.text)), "Provide at least one rubric criterion with an ID and text.");
    check(new Set(d.written.rubric.map((r:any)=>r.id)).size===d.written.rubric.length, "Duplicate rubric IDs.");
  } else if (d.type === "choice" || d.type === "ordering") {
    check(
      Array.isArray(d.choices) && d.choices.length >= 2,
      "Provide at least two choices.",
    );
    const ids = d.choices.map((c: any) => {
      check(
        c && validId(c.id) && text(c.text),
        "Each choice needs an ID and text.",
      );
      return c.id;
    });
    check(new Set(ids).size === ids.length, "Duplicate choice IDs.");
    check(
      Array.isArray(d.correct) && d.correct.length > 0,
      "Choose at least one correct answer.",
    );
    check(
      Array.isArray(d.correct) &&
        d.correct.length > 0 &&
        d.correct.every((id: any) => ids.includes(id)),
      "Correct answers must reference choice IDs.",
    );
    check(
      new Set(d.correct).size === d.correct.length,
      "Duplicate correct IDs.",
    );
    if(d.type === "ordering")check(d.correct.length===ids.length,"Correct sequence must include every step exactly once.");
    check(
      d.shuffle === undefined || typeof d.shuffle === "boolean",
      "shuffle must be true or false.",
    );
  } else {
    check(
      Array.isArray(d.answers) && d.answers.length > 0,
      "Provide at least one blank answer.",
    );
    const ids = d.answers.map((a: any) => {
      check(a?.math===undefined||["inline","display"].includes(a.math),"Invalid math answer mode.");
      check(
        a &&
          validId(a.id) &&
          Array.isArray(a.accepted) &&
          a.accepted.length > 0 &&
          a.accepted.every(text),
        "Each answer needs an ID and nonempty accepted alternatives.",
      );
      check(
        a.caseSensitive === undefined || typeof a.caseSensitive === "boolean",
        "caseSensitive must be true or false.",
      );
      return a.id;
    });
    check(new Set(ids).size === ids.length, "Duplicate blank IDs.");
    let refs: string[] = [];
    if (d.type === "blank")
      refs = [...prompt.matchAll(/\{\{blank:([\w-]+)\}\}/g)].map((m) => m[1]);
    else if(d.type === "diagram") refs=validateDiagram(d.diagram);
    else if(d.type === "code") {
      check(d.code && Object.hasOwn(codeLanguages,d.code.language) && text(d.code.source),"Code needs a supported language and nonempty source.");
      refs=codeMarkers(d.code.source).map(m=>m.id);
      check(!d.code.source.replace(/\{\{blank:([\w-]+)\}\}/g,"").includes("{{blank:"),"Malformed code blank marker.");
      check(d.answers.every((a:any)=>a.whitespace===undefined||["exact","trim-outer"].includes(a.whitespace)),"Unknown code whitespace policy.");
    } else {
      check(
        d.table &&
          Array.isArray(d.table.columns) &&
          d.table.columns.length > 0 &&
          d.table.columns.every((heading:unknown)=>typeof heading==="string"),
        "Table needs at least one column; headings may be empty.",
      );
      check(
        Array.isArray(d.table.rows) && d.table.rows.length > 0,
        "Table needs rows.",
      );
      for (const row of d.table.rows) {
        check(
          Array.isArray(row) && row.length === d.table.columns.length,
          "Each table row must match the column count. Merged cells are not supported yet.",
        );
        for (const c of row) {
          check(
            c && typeof c === "object" && !Array.isArray(c),
            "Invalid table cell.",
          );
          check(
            !("rowspan" in c) && !("colspan" in c),
            "Merged cells are not supported yet.",
          );
          check(
            (typeof c.text === "string" && c.blank === undefined) ||
              (validId(c.blank) && c.text === undefined),
            "Each cell needs text or a blank ID.",
          );
          check(
            c.sourceText === undefined || typeof c.sourceText === "string",
            "Cell sourceText must be text.",
          );
          if (c.blank) refs.push(c.blank);
        }
      }
    }
    check(
      refs.length > 0 &&
        refs.every((id) => ids.includes(id)) &&
        ids.every((id: string) => refs.includes(id)),
      "Blank IDs and answer rules must match.",
    );
    check(
      new Set(refs).size === refs.length,
      "Use a unique ID for each blank.",
    );
  }
}
export function parseQuestion(raw: string, path: string): Question {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  check(m, "Question must start with YAML frontmatter.");
  const front = parse(m[1]);
  check(front?.study, "Missing study definition.");
  const parts = m[2].split(/^## Explanation\s*$/m);
  check(parts.length <= 2, "Use only one Explanation heading.");
  const prompt = parts[0].replace(/^\s*## Prompt\s*\n/, "").trim();
  validate(front.study, prompt);
  return {
    definition: front.study,
    prompt,
    explanation: (parts[1] ?? "").trim(),
    raw,
    path,
  };
}
export function serialize(
  d: Definition,
  prompt: string,
  explanation = "",
): string {
  validate(d, prompt);
  return `---\n${stringify({ study: d })}---\n\n## Prompt\n\n${prompt}\n\n## Explanation\n\n${explanation}\n`;
}
export function grade(q: Question, response: Response): Grade {
  const d = q.definition;
  if((["short-answer","drawing"].includes(d.type))) {
    validateSelfAssessment(q,response);
    const rubric=d.written!.rubric, possible=rubric.length;
    if(!response.blanks.response?.trim())return {earned:0,possible,details:[],basis:"unanswered"};
    if(!response.selfAssessment)return {earned:0,possible,details:[],pending:true};
    return {earned:Object.values(response.selfAssessment).reduce((a,b)=>a+b,0),possible,basis:"self-assessed",details:rubric.map(r=>({id:r.id,correct:response.selfAssessment![r.id]===1,expected:[r.text]}))};
  }
  if(d.type === "ordering"){const correct=response.choices.length===d.correct!.length&&response.choices.every((id,i)=>id===d.correct![i]);return {earned:correct?1:0,possible:1,details:[{id:"sequence",correct,expected:d.correct!}]};}
  if (d.type === "choice") {
    const chosen = new Set(response.choices);
    const expected = d.correct!;
    const correct =
      chosen.size === expected.length && expected.every((id) => chosen.has(id));
    return {
      earned: correct ? 1 : 0,
      possible: 1,
      details: [{ id: "choices", correct, expected }],
    };
  }
  const details = d.answers!.map((a) => {
    const mathAnswer=!!a.math||a.accepted.some(s=>/^\$\$?[\s\S]+\$\$?$/.test(s.trim()));
    const normalize = (s: string) => {
      if(d.type==="code")return normalizeCodeAnswer(s,a.whitespace);
      const v = (mathAnswer?s.trim().replace(/^\$\$?([\s\S]*?)\$\$?$/,"$1"):s).trim().replace(/\s+/g, " ");
      return a.caseSensitive ? v : v.toLocaleLowerCase("en-US");
    };
    const value = response.blanks[a.id] ?? "";
    return {
      id: a.id,
      correct:
        value.trim().length > 0 &&
        a.accepted.some((s) => normalize(s) === normalize(value)),
      expected: a.accepted,
    };
  });
  return {
    earned: details.filter((x) => x.correct).length,
    possible: details.length,
    details,
  };
}
export function orderChoices(
  q: Question,
  random: () => number = Math.random,
): string[] {
  const ids = q.definition.choices?.map((c) => c.id) ?? [];
  if (q.definition.shuffle)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
  if(q.definition.type==="ordering"&&q.definition.shuffle&&ids.every((id,i)=>id===q.definition.correct![i]))ids.push(ids.shift()!);
  return ids;
}
export function makeAttempt(
  q: Question,
  response: Response,
  order: string[],
  mode: Attempt["mode"],
  context: string,
  started: string,
  id: string,
  course: CourseContext = null,
): Attempt {
  validateCourseContext(course);
  return structuredClone({
    version: 1,
    id,
    questionId: q.definition.id,
    started,
    finished: new Date().toISOString(),
    context,
    course,
    mode,
    question: q,
    choiceOrder: order,
    response,
    grade: mode === "attempt" ? grade(q, response) : null,
    gradingRule: gradingRule(q),
  }) as Attempt;
}
export function template(
  type: Kind,
  id: string,
  title: string,
  prompt?: string,
): string {
  const d: Definition = { version: 1, id, title, type, concepts: [] };
  if(type==="drawing")return serialize({...d,written:{reference:"Compare the drawing against the required features.",rubric:[{id:"structure",text:"Includes the required objects and labels."},{id:"relationships",text:"Shows their relationships and directions correctly."}]}},prompt||"Draw and label the requested diagram.","");
  if(type==="short-answer")return serialize({...d,written:{reference:"Describe a complete answer here, using Markdown and LaTeX.",rubric:[{id:"reasoning",text:"Explains the central idea with correct reasoning."},{id:"detail",text:"Includes the required supporting details or equations."}]}},prompt||"Explain your reasoning in your own words.","");
  if(type==="ordering")return serialize({...d,choices:[{id:"a",text:"First step"},{id:"b",text:"Second step"},{id:"c",text:"Third step"}],correct:["a","b","c"],shuffle:true},prompt||"Arrange the steps in the correct order.","Explain why this sequence is necessary.");
  if (type === "choice") {
    Object.assign(d, {
      choices: [
        { id: "a", text: "First option" },
        { id: "b", text: "Second option" },
      ],
      correct: ["a"],
      shuffle: true,
    });
    return serialize(
      d,
      prompt || "Which option is correct?",
      "Explain why the answer is correct.",
    );
  }
  if(type==="code")return serialize({...d,answers:[{id:"a",accepted:["print"],whitespace:"exact"}],code:{language:"python",source:'{{blank:a}}("Hello")'}},prompt||"Complete the missing code.","The print function writes the message.");
  if(type === "diagram") return serialize({...d,answers:[{id:"a",accepted:["answer"]}],diagram:{image:"choose-image.png",alt:"Diagram to label",covers:[],labels:[{id:"a",x:0.1,y:0.1,width:0.2,height:0.08}]}},prompt||"Label the diagram.","");
  d.answers = [{ id: "a", accepted: ["answer"] }];
  if (type === "blank")
    return serialize(
      d,
      (prompt ? prompt + "\n\n" : "") + "Complete this: {{blank:a}}.",
      "Explain the missing term.",
    );
  d.table = {
    columns: ["Quantity", "Value"],
    rows: [
      [{ text: "Given example" }, { text: "$2$" }],
      [{ text: "Complete this" }, { blank: "a" }],
    ],
  };
  return serialize(
    d,
    prompt || "Complete the missing table entry.",
    "Explain the missing entry.",
  );
}

export function selectVariants(
  questions: Question[],
  count: number,
  random: () => number = Math.random,
): Question[] {
  check(
    Number.isInteger(count) && count >= 1,
    "Variants per family must be a positive integer.",
  );
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const key = q.definition.familyId ?? q.definition.id;
    const group = groups.get(key) ?? [];
    if (!group.some((x) => x.definition.id === q.definition.id)) group.push(q);
    groups.set(key, group);
  }
  const selected: Question[] = [];
  for (const group of groups.values()) {
    const pool = [...group];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    selected.push(...pool.slice(0, count));
  }
  return selected;
}

export function answerLabel(q: Question, id: string): string {
  if(q.definition.type==="diagram")return `Label ${q.definition.diagram!.labels.findIndex(l=>l.id===id)+1}`;
  if(q.definition.type==="code")return `Code blank ${codeMarkers(q.definition.code!.source).findIndex(m=>m.id===id)+1}`;
  if (q.definition.type === "table") {
    for (const [r, row] of q.definition.table!.rows.entries()) {
      const c = row.findIndex((cell) => cell.blank === id);
      if (c >= 0) return `Row ${r + 1}, column ${c + 1}`;
    }
  }
  const ids = [...q.prompt.matchAll(/\{\{blank:([\w-]+)\}\}/g)].map(
    (m) => m[1],
  );
  return `Blank ${ids.indexOf(id) + 1}`;
}

export function gradingRule(q:Question):Attempt["gradingRule"] {return (["short-answer","drawing"].includes(q.definition.type))?"self-rubric-v1":q.definition.type==="ordering"?"exact-sequence-v1":"exact-choice-set-or-equal-weight-blanks-v1";}
export function validateSelfAssessment(q:Question,r:Response){
 if(q.definition.type==="drawing")validateDrawingResponse(r.blanks.response??"");
 if(r.reviewed!==undefined)check((["short-answer","drawing"].includes(q.definition.type))&&typeof r.reviewed==="boolean","Invalid response review state.");
 if(r.selfAssessment===undefined)return;
 check((["short-answer","drawing"].includes(q.definition.type))&&r.reviewed===true&&!!r.blanks.response?.trim(),"Self-assessment requires a submitted written response.");
 const ids=q.definition.written!.rubric.map(x=>x.id),a=r.selfAssessment;
 check(a&&typeof a==="object"&&!Array.isArray(a)&&Object.keys(a).length===ids.length&&ids.every(id=>Object.hasOwn(a,id)&&[0,0.5,1].includes(a[id])),"Score every rubric criterion with 0, 0.5 or 1.");
}
