import type {MathPart} from './math-parts';
export interface MarginAnchor {id:string;path:string;quote:string;before:string;after:string;renderedRoot?:string;renderedQuote?:string;renderedBefore?:string;renderedAfter?:string;sectionSource?:string;kind?:'text'|'math';part?:MathPart}
export interface Critique {id:string;deletedAt?:string;deletedWasResolved?:boolean;conflictOf?:string;path:string;kind?:'sticky';anchors?:MarginAnchor[];markStyle?:'highlight'|'underline'|'text';created?:string;questionId?:string;context?:string;quote:string;before:string;after:string;comment:string;color:string;darkColor?:string;intent:string;updated:string;resolved:boolean}
export interface QuestionReview {questionId:string;path:string;title:string;context:string;remove:boolean;updated:string}
/** Resolve only a uniquely identifiable passage; never attach a critique by guesswork. */
export function locateQuote(text:string,a:Pick<Critique,'quote'|'before'|'after'>):{from:number;to:number}|undefined{
 if(!a.quote)return;const hits:number[]=[];let at=0;
 while((at=text.indexOf(a.quote,at))>=0){hits.push(at);at+=Math.max(1,a.quote.length);}
 const contextual=hits.filter(i=>(!a.before||text.slice(Math.max(0,i-a.before.length),i)===a.before)&&(!a.after||text.slice(i+a.quote.length,i+a.quote.length+a.after.length)===a.after));
 const candidates=contextual.length?contextual:hits;if(candidates.length!==1)return;return {from:candidates[0],to:candidates[0]+a.quote.length};
}
export function safeColor(color:string){return /^#[0-9a-f]{6}$/i.test(color)?color:'#55aa77';}
export function anchorRanges(text:string){const ranges:{from:number;to:number;id:string}[]=[];let offset=0,fence='';for(const line of text.split('\n')){const f=/^\s*(`{3,}|~{3,})/.exec(line);if(f){if(!fence)fence=f[1][0];else if(f[1][0]===fence)fence='';}else if(!fence){const m=/(?:^|\s)(\^[A-Za-z0-9-]+)\s*$/.exec(line);if(m){const from=offset+m.index+m[0].indexOf('^');ranges.push({from,to:from+m[1].length,id:m[1]});}}offset+=line.length+1;}return ranges;}
const anchorCache=new WeakMap<{toString():string},ReturnType<typeof anchorRanges>>();
export function anchorsFor(doc:{toString():string}){let result=anchorCache.get(doc);if(!result){result=anchorRanges(doc.toString());anchorCache.set(doc,result);}return result;}
export function touchesAnchorInterior(text:string,from:number,to:number){return anchorRanges(text).some(a=>from>=a.from&&to<=a.to&&(to>from||from>a.from&&from<a.to));}

export interface CommentColor {color:string;darkColor?:string;meaning:string}
export function defaultCommentPalette():CommentColor[]{return [
 {color:'#e2b714',darkColor:'#ffe066',meaning:'Definitions'},
 {color:'#398c50',darkColor:'#82d99b',meaning:'Examples / worked problems'},
 {color:'#2675bd',darkColor:'#8bc9ff',meaning:'Important mathematics'},
 {color:'#757575',darkColor:'#bdbdbd',meaning:'Research discrepancy'},
 {color:'#c94f86',darkColor:'#f3a1c5',meaning:'Main takeaway'},
 {color:'#b83b43',darkColor:'#ff6b6b',meaning:'Red'},
 {color:'#b56720',darkColor:'#ffb86b',meaning:'Orange'},
 {color:'#5146a3',darkColor:'#8c8cff',meaning:'Indigo'},
 {color:'#883da8',darkColor:'#d78cf5',meaning:'Violet'}
];}
export function commentPalette(value:unknown):CommentColor[]{if(!Array.isArray(value))return defaultCommentPalette();return value.filter((v):v is CommentColor=>!!v&&typeof v.color==='string'&&/^#[0-9a-f]{6}$/i.test(v.color)&&typeof v.meaning==='string').map(v=>({...v,darkColor:darkCommentColor(v)}));}

export function darkCommentColor(c:{color:string;darkColor?:string}){if(c.darkColor&&/^#[0-9a-f]{6}$/i.test(c.darkColor))return c.darkColor;const hex=safeColor(c.color).slice(1);return '#'+[0,2,4].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*.6+255*.4).toString(16).padStart(2,'0')).join('');}

export type AnnotationStyle='highlight'|'underline'|'text'|'sticky';
export const annotationStyles:AnnotationStyle[]=['highlight','underline','text','sticky'];
export const styleNames:Record<AnnotationStyle,string>={highlight:'Highlight',underline:'Underline',text:'Text color',sticky:'Post-it'};
export function styleOf(c:Pick<Critique,'kind'|'markStyle'>):AnnotationStyle{return c.kind==='sticky'?'sticky':c.markStyle??'highlight';}
export function typeKey(style:AnnotationStyle,meaning:string){return JSON.stringify([style,meaning]);}
export function defaultStylePalette(style:AnnotationStyle):CommentColor[]{const colors=defaultCommentPalette().map((p,i)=>({...p,...(style==='text'?{color:['#806400','#286c3c','#285c8d','#555555','#a33668','#a52a34','#995000','#5146a3','#883da8'][i]}:{}),meaning:style==='highlight'?p.meaning:['Yellow','Green','Blue','Grey','Pink','Red','Orange','Indigo','Violet'][i]}));return style==='highlight'?colors:[5,6,0,1,2,7,8,4,3].map(i=>colors[i]);}
export function stylePalettes(raw:unknown,legacy:unknown):Record<AnnotationStyle,CommentColor[]>{const p=raw as Partial<Record<AnnotationStyle,unknown>>|undefined;return Object.fromEntries(annotationStyles.map(style=>[style,Array.isArray(p?.[style])?commentPalette(p![style]):style==='highlight'?commentPalette(legacy):defaultStylePalette(style)])) as Record<AnnotationStyle,CommentColor[]>;}
