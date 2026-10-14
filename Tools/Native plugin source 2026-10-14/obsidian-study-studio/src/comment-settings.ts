import {App,Plugin,PluginSettingTab,Setting,Notice} from 'obsidian';
import {ReviewStore} from './review';
import {AnnotationStyle,annotationStyles,styleNames,defaultStylePalette,darkCommentColor} from './review-model';
export class CommentSettings extends PluginSettingTab{
 private style:AnnotationStyle='highlight';
 constructor(app:App,plugin:Plugin,readonly store:ReviewStore){super(app,plugin);}
 display(){const el=this.containerEl;el.empty();el.createEl('h2',{text:'Annotation colors and meanings'});el.createEl('p',{text:'Each annotation style has its own color meanings. Existing notes keep their saved meaning and colors.'});
 new Setting(el).setName('Annotation style').addDropdown(d=>{for(const style of annotationStyles)d.addOption(style,styleNames[style]);d.setValue(this.style).onChange(value=>{this.style=value as AnnotationStyle;this.display();});});
 const persist=()=>void this.store.save({paths:new Set(),commentIds:new Set(),annotations:false}).catch(e=>new Notice(String(e)));const palette=this.store.paletteFor(this.style);
 for(const [index,entry] of palette.entries()){
  const row=new Setting(el).setName(`Color ${index+1}`).setDesc('Light · Dark · Meaning').addColorPicker(c=>c.setValue(entry.color).onChange(value=>{entry.color=value;persist();})).addColorPicker(c=>c.setValue(darkCommentColor(entry)).onChange(value=>{entry.darkColor=value;persist();})).addText(t=>{t.setPlaceholder('Meaning').setValue(entry.meaning);t.inputEl.addEventListener('change',()=>{const value=t.getValue();this.store.renameVisibilityType(this.style,entry.meaning,value);entry.meaning=value;persist();});t.inputEl.setAttribute('aria-label',`Meaning for ${styleNames[this.style]} color ${index+1}`);}).addExtraButton(b=>b.setIcon('trash').setTooltip(`Remove color ${index+1}`).onClick(()=>{palette.splice(index,1);persist();this.display();}));
  row.controlEl.querySelectorAll('input[type=color]').forEach((input,i)=>input.setAttribute('aria-label',`${i?'Dark':'Light'} color ${index+1}`));
 }
 new Setting(el).addButton(b=>b.setButtonText('Add color').onClick(()=>{palette.push({color:'#55aa77',meaning:''});persist();this.display();})).addButton(b=>b.setButtonText('Reset this palette').onClick(()=>{this.store.data.palettes![this.style]=defaultStylePalette(this.style);persist();this.display();}));
 }
}
