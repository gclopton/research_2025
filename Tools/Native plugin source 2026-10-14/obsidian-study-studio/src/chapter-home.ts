import {Plugin, setIcon} from 'obsidian';

/** A chapter landing page reads its structure from frontmatter, never its course name. */
export function registerChapterHome(plugin:Plugin, navigate:{course:(id:string)=>void;practice:(id:string,chapter:string)=>void;grades:(id:string,chapter:string)=>void}){
 plugin.registerMarkdownCodeBlockProcessor('study-chapter-home',(_source,el,ctx)=>{
  const file=plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
  const chapter=file&&plugin.app.metadataCache.getCache(ctx.sourcePath)?.frontmatter?.studyChapter;
  if(!chapter?.courseId||!chapter?.chapterId){el.createEl('p',{text:'Add studyChapter courseId and chapterId to this note’s properties.'});return;}
  const root=el.createDiv('study-chapter-home');
  const actions=root.createDiv('study-chapter-home-actions');
  const action=(label:string,icon:string,detail:string,run:()=>void)=>{const b=actions.createEl('button');setIcon(b.createSpan('study-chapter-action-icon'),icon);const text=b.createSpan();text.createEl('strong',{text:label});text.createEl('small',{text:detail});b.onclick=run;};
  action('Practice','pencil','Practice sets and attempt scores',()=>navigate.practice(chapter.courseId,chapter.chapterId));
  action('Gradebook','table','Chapter assessments and grades',()=>navigate.grades(chapter.courseId,chapter.chapterId));
  action('Course overview','book-open','Return to all chapters',()=>navigate.course(chapter.courseId));
  const open=(path:string)=>void plugin.app.workspace.openLinkText(path,ctx.sourcePath,true);
  const parts=Array.isArray(chapter.parts)?chapter.parts.filter((p:any)=>p&&typeof p.path==='string'&&typeof p.title==='string'):[];
  if(parts.length){root.createEl('h2',{text:'Chapter parts'});const grid=root.createDiv('study-chapter-parts');
   parts.forEach((p:any,i:number)=>{const card=grid.createEl('button',{cls:'study-part-card'});card.style.setProperty('--part-color',['#507b98','#786494','#4b8177','#966958'][i%4]);const cover=card.createDiv('study-part-cover');cover.createSpan({text:String(p.number??i+1).padStart(2,'0')});setIcon(cover.createSpan(),'book-open');const body=card.createDiv('study-part-body');body.createEl('small',{text:`PART ${p.number??i+1}`});body.createEl('strong',{text:p.title});if(typeof p.description==='string')body.createEl('span',{text:p.description});card.onclick=()=>open(p.path);});
  }else if(typeof chapter.material==='string'){const section=root.createDiv('study-chapter-reading');section.createEl('h2',{text:'Chapter material'});section.createEl('button',{text:'Read chapter',cls:'mod-cta'}).onclick=()=>open(chapter.material);}
 });
}
