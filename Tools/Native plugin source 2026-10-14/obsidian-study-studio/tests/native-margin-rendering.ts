// Run the bundled script in study_studio_lab only.
import {Component,MarkdownRenderer} from 'obsidian';
import {registerReadingContext,readingEquationAnchor} from '../src/margin-anchors';
declare const app:any;
(async()=>{
 if(app.vault.getName()!=='study_studio_lab')throw Error('Lab only');
 const source='Top $a$.\n\n- Parent $b$\n    - Child $CO_{2}$\n\nLast $c$.',path='Margin rendering acceptance 2026-10-14.md';
 const host=document.createElement('div'),owner=new Component();owner.load();host.dataset.studyCommentSection='test';document.body.append(host);
 try{
  await MarkdownRenderer.render(app,source,host,path,owner);
  // Model a renderer-owned section with the real MathJax nodes.
  host.querySelectorAll('[data-study-comment-section]').forEach(n=>n.removeAttribute('data-study-comment-section'));
  registerReadingContext(host,()=>path,{getSectionInfo:()=>({text:source,lineStart:0,lineEnd:source.split('\n').length-1})} as any);
  const mapped=[...host.querySelectorAll<HTMLElement>('.math')].map(n=>readingEquationAnchor(n,path)?.quote);
  if(JSON.stringify(mapped)!==JSON.stringify(['$a$','$b$','$CO_{2}$','$c$']))throw Error('Incorrect math anchor mapping: '+JSON.stringify(mapped));
  (window as any).require('fs').writeFileSync('/Users/gradyclopton/Projects/obsidian-study-studio/outputs/margin-rendering-20261014/math-mapping.json',JSON.stringify({pass:true,mapped}));
 }finally{owner.unload();host.remove();}
})().catch(console.error);
