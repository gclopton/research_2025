import {EditorSelection,Prec,type StateCommand} from '@codemirror/state';
import {indentMore,indentLess,insertNewlineAndIndent,isolateHistory} from '@codemirror/commands';
import {indentUnit,syntaxTree} from '@codemirror/language';
import {keymap} from '@codemirror/view';

/** Keep list subtrees together while changing their level. Outside lists Tab
 * retains normal focus navigation. Markdown's own Enter/Backspace map handles
 * continuation, numbering, checkboxes and leaving an empty item. */
export function changeListLevel(outdent=false):StateCommand{return ({state,dispatch})=>{
 if(state.readOnly)return true;
 const range=state.selection.main;let first=state.doc.lineAt(range.from);
 const last=state.doc.lineAt(range.to>range.from&&state.doc.lineAt(range.to).from===range.to?range.to-1:range.to);
 const tree=syntaxTree(state);
 const itemAt=(pos:number)=>{for(let n=tree.resolveInner(pos,-1);n;n=n.parent!){if(n.name==='FencedCode'||n.name==='CodeBlock')return null;if(n.name==='ListItem')return n;}return null;};
 const item=itemAt(first.to);if(!item)return false;
 first=state.doc.lineAt(item.from);
 // Leading indentation must not change the blockquote itself.
 for(let n=item.parent;n;n=n.parent)if(n.name==='Blockquote')return true;
 // A first sibling cannot become a child without a preceding parent item.
 if(!outdent&&item.prevSibling?.name!=='ListItem')return true;
 let end=last.to;
 for(let line=first.number;line<=last.number;line++){
  const current=state.doc.line(line),node=itemAt(current.to);
  if(node&&state.doc.lineAt(node.from).number===line)end=Math.max(end,node.to);
 }
 let number=1;
 const ordered=item.parent?.name==='OrderedList';
 const valueOf=(node:typeof item)=>Number(/^\s*(\d+)/.exec(state.doc.sliceString(node.from,node.to))?.[1]??0);
 if(ordered){
  if(outdent){const parent=item.parent?.parent;if(parent?.name==='ListItem'&&parent.parent?.name==='OrderedList')number=valueOf(parent)+1;}
  else {const children=item.prevSibling?.lastChild;if(children?.name==='OrderedList'&&children.lastChild?.name==='ListItem')number=valueOf(children.lastChild)+1;}
 }
 const selection=EditorSelection.single(first.from,end);
 const selected=state.update({selection}).state;
 return (outdent?indentLess:indentMore)({state:selected,dispatch:tr=>{
  let changes=tr.changes;
  if(ordered&&!changes.empty){
   const numbers=[];for(let node:typeof item|null=item;node&&node.from<=last.to;node=node.nextSibling){
    if(node.name!=='ListItem')continue;
    const match=/^(\s*)(\d+)/.exec(state.doc.sliceString(node.from,node.to));if(!match)continue;
    const from=changes.mapPos(node.from+match[1].length,1);numbers.push({from,to:from+match[2].length,insert:String(number++)});
   }
   changes=changes.compose(tr.state.changes(numbers));
  }
  dispatch(state.update({changes,selection:state.selection.map(changes),scrollIntoView:true,userEvent:'input.indent',annotations:isolateHistory.of('full')}));
 }});
};}

export const newlineInMarginMath:StateCommand=target=>{
 const {state}=target,range=state.selection.main,tree=syntaxTree(state);
 let opening=-1,closing=-1;
 for(let i=1;i<=state.doc.lines;i++){
  const line=state.doc.line(i);let code=false;
  for(let node=tree.resolveInner(line.to,-1);node;node=node.parent!)if(node.name==='FencedCode'||node.name==='CodeBlock')code=true;
  if(code||!/^\s*\$\$\s*$/.test(line.text))continue;
  if(opening<0)opening=line.to;
  else {closing=line.from;if(range.from>=opening&&range.to<=closing)return insertNewlineAndIndent(target);opening=-1;}
 }
 return false;
};

export const marginListKeys=[
 {key:'Enter',run:newlineInMarginMath},
 // The card's bubbling handler saves; do not insert a blank line first.
 {key:'Mod-Enter',run:()=>true},
 {key:'Tab',run:changeListLevel()},
 {key:'Shift-Tab',run:changeListLevel(true)},
 {key:'Mod-]',run:changeListLevel()},
 {key:'Mod-[',run:changeListLevel(true)}
];
export const marginLists=[indentUnit.of('    '),Prec.high(keymap.of(marginListKeys))];
