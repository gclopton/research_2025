import {Question} from './model';
import {ExamSession} from './exam-model';
import {codeFence} from './code-model';
export function printableQuestion(q:Question,number:number){
 const d=q.definition;let body=q.prompt.replace(/\{\{blank:[\w-]+\}\}/g,' <span class="study-print-blank">&nbsp;</span> ');
 if(d.type==='choice')body+='\n\n'+(d.choices??[]).map((c,i)=>`${String.fromCharCode(65+i)}. ☐ ${c.text}`).join('\n\n');
 if(d.type==='ordering')body+='\n\n'+(d.choices??[]).map(c=>`___ ${c.text}`).join('\n\n');
 if(d.type==='table'){const t=d.table!;body+='\n\n| '+t.columns.join(' | ')+' |\n| '+t.columns.map(()=> '---').join(' | ')+' |\n'+t.rows.map(row=>'| '+row.map(cell=>cell.blank?'__________':cell.text).join(' | ')+' |').join('\n');}
 if(d.type==='code')body+='\n\n'+codeFence(d.code!.source.replace(/\{\{blank:[\w-]+\}\}/g,'__________'),d.code!.language);

 if(d.type==='short-answer'||d.type==='drawing')body+='\n\n________________________________________________________________\n\n________________________________________________________________\n\n________________________________________________________________';
 return `### Question ${number}\n\n${body}`;
}
export function printableExam(session:ExamSession){let section='';return `# ${session.exam.title}\n\nName: ____________________    Date: ____________________\n\n`+session.entries.map((entry,i)=>{const heading=section===entry.sectionId?'':`## ${entry.sectionTitle}\n\n`;section=entry.sectionId;return heading+printableQuestion(entry.question,i+1);}).join('\n\n');}

