import {App,Modal,Notice,Setting} from 'obsidian';
import {stringify} from 'yaml';
import {serialize,Definition} from './model';
export class AddVocabulary extends Modal {
 constructor(app:App,private courseId:string,private onSaved:()=>void){super(app);}
 onOpen(){this.titleEl.setText('Add vocabulary');let term='',meaning='',categories='',alternatives='';
 this.contentEl.createEl('p',{text:'Describe one meaning clearly. This creates an editable vocabulary note and a linked typed-recall question. Include the article in the term if you want it required.'});
 new Setting(this.contentEl).setName('French term or expression').addText(t=>t.onChange(v=>term=v));
 new Setting(this.contentEl).setName('Meaning and context').addText(t=>t.onChange(v=>meaning=v));
 new Setting(this.contentEl).setName('Categories').setDesc('Comma-separated; create any category you need.').addText(t=>t.onChange(v=>categories=v));
 new Setting(this.contentEl).setName('Other accepted French answers').setDesc('Optional, one complete alternative per line.').addTextArea(t=>t.onChange(v=>alternatives=v));
 const error=this.contentEl.createEl('p',{cls:'study-error',attr:{role:'alert'}});let saving=false;
 const save=async()=>{if(saving)return;if(!term.trim()||!meaning.trim()){error.setText('Enter the French expression and a clear meaning.');return;}saving=true;try{
 const id=`vocab-${crypto.randomUUID()}`,qid=`${id}-recall`,base=`Study Studio/Vocabulary/${this.courseId}`,path=`${base}/${id}.md`,qbase=`Study Studio/Questions/Vocabulary/${this.courseId}`,qpath=`${qbase}/${qid}.md`;
 const accepted=[...new Set([term.trim(),...alternatives.split('\n').map(s=>s.trim()).filter(Boolean)].flatMap(s=>[s,s.replaceAll('’',"'"),s.normalize('NFD'),s.replaceAll('’',"'").normalize('NFD')]))];
 const definition:Definition={version:1,id:qid,title:`Recall: ${meaning.trim()}`,type:'blank',courseIds:[this.courseId],concepts:[`Vocabulary: ${id}`,'Skill: production',...categories.split(',').map(s=>s.trim()).filter(Boolean)],answers:[{id:'a',accepted}]};
 const raw=serialize(definition,`Write the French expression for **${meaning.trim()}**. Include the article if it is part of your vocabulary entry.\n\n{{blank:a}}`,`The recorded expression is **${term.trim()}**.\n\n[[${path.slice(0,-3)}|Vocabulary entry]]`);
 const fm={studyVocabulary:{version:1,id,courseId:this.courseId,term:term.trim(),meaning:meaning.trim(),categories:categories.split(',').map(s=>s.trim()).filter(Boolean),questionIds:[qid]}};
 for(const folder of ['Study Studio','Study Studio/Vocabulary',base,'Study Studio/Questions','Study Studio/Questions/Vocabulary',qbase])if(!await this.app.vault.adapter.exists(folder))await this.app.vault.createFolder(folder);
 const question=await this.app.vault.create(qpath,raw);try{await this.app.vault.create(path,`---\n${stringify(fm)}---\n\n# ${term.trim()}\n\n${meaning.trim()}\n\n## Examples and sources\n\n`);}catch(e){await this.app.vault.trash(question,true);throw e;}
 this.close();this.onSaved();new Notice('Vocabulary and recall question saved.');
 }catch(e){error.setText(`Could not save: ${e}`);}finally{saving=false;}};
 new Setting(this.contentEl).addButton(b=>b.setButtonText('Save · Ctrl+Enter').setCta().onClick(()=>void save()));this.contentEl.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();e.stopPropagation();void save();}},true);
 this.contentEl.querySelector('input')?.focus();
 }
 onClose(){this.contentEl.empty();}
}
