import {Menu} from 'obsidian';
import {AnnotationStyle,CommentColor,darkCommentColor,safeColor} from './review-model';
export function swatchTitle(style:AnnotationStyle,p:CommentColor,label=p.meaning):DocumentFragment{
 const f=document.createDocumentFragment(),s=document.createElement('span');s.className='study-palette-swatch';s.dataset.style=style;s.setAttribute('aria-hidden','true');s.style.setProperty('--swatch-light',safeColor(p.color));s.style.setProperty('--swatch-dark',darkCommentColor(p));f.append(s,document.createTextNode(label||p.color));return f;
}
export function paletteItems(menu:Menu,style:AnnotationStyle,palette:CommentColor[],pick:(p:CommentColor)=>void,current?:{intent:string;color:string;darkColor?:string}){
 menu.setUseNativeMenu(false);
 if(current&&!palette.some(p=>p.meaning===current.intent&&p.color===current.color))menu.addItem(i=>i.setTitle(swatchTitle(style,{...current,meaning:current.intent},current.intent+' (saved)')).setChecked(true).onClick(()=>{}));
 for(const p of palette)menu.addItem(i=>i.setTitle(swatchTitle(style,p)).setChecked(!!current&&p.meaning===current.intent&&p.color===current.color).onClick(()=>pick(p)));
 if(!palette.length)menu.addItem(i=>i.setTitle('Add colors in Study Studio settings').setDisabled(true));
}
