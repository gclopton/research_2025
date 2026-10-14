import {EditorState} from '@codemirror/state';
import {Decoration} from '@codemirror/view';
import {markdownContext} from './markdown-context';
/** Formatting is scoped to margin editors. Never interpret Markdown inside
 * math or another replacement widget; selected tokens remain editable. */
export function marginFormatting(state:EditorState,covered:readonly {from:number;to:number}[]){
 const ranges:ReturnType<Decoration['range']>[]=[],source=state.doc.toString();
 const {tree}=markdownContext(source);
 tree.iterate({enter:n=>{
  const intersects=covered.filter(r=>n.from<r.to&&n.to>r.from);
  let unsafe=intersects.some(r=>r.from<=n.from||r.to>=n.to);
  for(let child=n.node.firstChild;child;child=child.nextSibling)if(['EmphasisMark','StrikethroughMark','CodeMark','LinkMark','URL'].includes(child.name)&&intersects.some(r=>child!.from<r.to&&child!.to>r.from))unsafe=true;
  if(unsafe&&['Strikethrough','StrongEmphasis','Emphasis','InlineCode','Link','Image'].includes(n.name))return false;
  if(['FencedCode','CodeBlock','HTMLBlock','CommentBlock'].includes(n.name))return false;
  const cls:Record<string,string>={Strikethrough:'study-live-strike',StrongEmphasis:'study-live-strong',Emphasis:'study-live-em',InlineCode:'study-live-code',Link:'study-live-link'};
  if(cls[n.name]&&!unsafe){
   ranges.push(Decoration.mark({class:cls[n.name]}).range(n.from,n.to));
   if(!(n.name==='Link'&&source[n.from-1]==='['&&source[n.to]===']')&&!state.selection.ranges.some(r=>r.from<=n.to&&r.to>=n.from)){
    for(let child=n.node.firstChild;child;child=child.nextSibling)if(['StrikethroughMark','EmphasisMark','CodeMark','LinkMark','URL'].includes(child.name))ranges.push(Decoration.replace({}).range(child.from,child.to));
   }
   if(n.name==='InlineCode')return false;
  }
  if(/^ATXHeading[1-6]$/.test(n.name)&&!unsafe)ranges.push(Decoration.line({class:'study-live-heading'}).range(state.doc.lineAt(n.from).from));
  if(n.name==='ListMark')ranges.push(Decoration.mark({class:'study-live-list-mark'}).range(n.from,n.to));
 }});return ranges;
}
