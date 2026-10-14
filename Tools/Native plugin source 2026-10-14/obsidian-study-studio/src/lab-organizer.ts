import {App,TFile,TFolder} from 'obsidian';
import {labChapterMoves} from './lab-chapter-moves';
import {parseQuestion} from './model';import {parseExam} from './exam-model';
export async function organizeCourseLab(app:App){
 if(app.vault.getName()!=='study_studio_lab')throw Error('This organizer is restricted to study_studio_lab.');
 const pending:{file:TFile;to:string}[]=[];
 // Validate every existing source and destination before moving anything.
 for(const move of labChapterMoves){const source=app.vault.getAbstractFileByPath(move.from),destination=app.vault.getAbstractFileByPath(move.to);if(source&&destination)throw Error(`Both source and destination exist: ${move.from}. Resolve the duplicate first.`);const file=source??destination;if(!(file instanceof TFile))throw Error(`Missing lab note: ${move.from}`);if('kind' in move){const raw=await app.vault.read(file);const id=move.kind==='question'?parseQuestion(raw,file.path).definition.id:parseExam(raw).id;if(id!==move.id)throw Error(`Unexpected note identity: ${file.path}`);}if(source instanceof TFile)pending.push({file:source,to:move.to});}
 for(const {file,to}of pending){const parts=to.split('/');parts.pop();let parent='';for(const part of parts){parent=parent?parent+'/'+part:part;if(!app.vault.getAbstractFileByPath(parent))await app.vault.createFolder(parent);}await app.fileManager.renameFile(file,to);}
 // Update explicit vault-root links even when the user's automatic-link preference is off.
 for(const file of app.vault.getMarkdownFiles().filter(f=>f.path.startsWith('Courses/')||f.path==='Course lab home.md'))await app.vault.process(file,raw=>{let text=raw;for(const move of labChapterMoves){const old=move.from.replace(/\.md$/,''),next=move.to.replace(/\.md$/,'');text=text.replaceAll('[['+old+'|','[['+next+'|').replaceAll('[['+old+']]','[['+next+']]').replaceAll('[['+move.from+'|','[['+move.to+'|').replaceAll('[['+move.from+']]','[['+move.to+']]');}return text;});
 for(const path of ['Courses/Calculus/Questions','Courses/French/Questions','Courses/Python/Questions','Courses/Fluid Dynamics/Questions','Courses/Fluid Dynamics/Exams']){const f=app.vault.getAbstractFileByPath(path);if(f instanceof TFolder&&!f.children.length)await app.vault.trash(f,true);}
 return pending.length;
}
