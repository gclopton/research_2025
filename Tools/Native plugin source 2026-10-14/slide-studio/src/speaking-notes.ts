import {Component, ItemView, MarkdownRenderer, Modal, Notice, WorkspaceLeaf} from 'obsidian';
import type SlideStudio from './main';
import {StudioView} from './view';
import {clone} from './model';
import type {RecordDoc} from './store';
import {button, element} from './render';

export const SPEAKING_NOTES_VIEW = 'slide-studio-speaking-notes';
export class SpeakingNotesView extends ItemView {
  owner?: Component;
  revision = 0;
  constructor(leaf: WorkspaceLeaf, private plugin: SlideStudio) { super(leaf); }
  getViewType() { return SPEAKING_NOTES_VIEW; }
  getDisplayText() { return 'Speaking notes'; }
  getIcon() { return 'notebook-pen'; }
  async onOpen() { await this.show(this.plugin.notesRecord); }
  async onClose() { this.revision++; this.owner?.unload(); }
  async show(record: RecordDoc | null) {
    const ticket = ++this.revision;
    this.owner?.unload(); this.owner = new Component(); this.owner.load();
    this.contentEl.replaceChildren(); this.contentEl.classList.add('ss-speaking-notes');
    const bar = element(this.contentEl,'div','ss-notes-toolbar');
    element(bar,'strong','','Speaking notes');
    button(bar,'Hide',()=>this.leaf.detach());
    if (!record || record.doc.kind !== 'slide') {
      element(this.contentEl,'p','','Select a slide to see its speaking notes.'); return;
    }
    const title = element(this.contentEl,'h3','',record.doc.title);
    title.setAttribute('aria-label','Notes for '+record.doc.title);
    button(bar,'Edit',()=>new NotesEditor(this.plugin,record).open());
    const body = element(this.contentEl,'div','ss-notes-prose markdown-rendered');
    await MarkdownRenderer.render(this.app,record.doc.speakerNotes || '*No speaking notes yet. Choose Edit to add an explanation for this slide.*',body,record.file.path,this.owner);
    if(ticket !== this.revision) body.remove();
  }
}
class NotesEditor extends Modal {
  constructor(private plugin: SlideStudio, private record: RecordDoc) { super(plugin.app); }
  onOpen() {
    if(this.record.doc.kind !== 'slide')return;
    this.titleEl.textContent='Speaking notes · '+this.record.doc.title;
    this.modalEl.classList.add('ss-notes-editor');
    const original=this.record.doc.speakerNotes ?? '';
    const input=element(this.contentEl,'textarea');
    input.value=original; input.setAttribute('aria-label','Speaking notes Markdown');
    const status=element(this.contentEl,'p','','Markdown and equations are supported.');
    const save=button(this.contentEl,'Save notes',()=>void (async()=>{
      save.disabled=true;
      try {
        // Finish any pending slide edits, then merge only the notes field.
        for(const leaf of this.app.workspace.getLeavesOfType('slide-studio-view')) {
          const view=leaf.view;
          if(view instanceof StudioView && view.record?.file.path===this.record.file.path) {
            await view.flush(); if(view.locked)throw Error('Resolve the slide editing conflict before saving notes.');
          }
        }
        const latest=await this.plugin.store.read(this.record.file);
        if(latest.doc.kind!=='slide')throw Error('The selected file is no longer a slide.');
        if((latest.doc.speakerNotes??'')!==original)throw Error('These notes changed elsewhere. Copy your draft before reopening the editor.');
        const doc=clone(latest.doc);doc.speakerNotes=input.value;
        latest.raw=await this.plugin.store.save(latest,doc);latest.doc=doc;
        if(this.plugin.notesRecord?.file.path===latest.file.path)this.plugin.updateSpeakingNotes(latest);
        this.close();
      } catch(error) {status.textContent=String(error);new Notice(String(error));save.disabled=false;}
    })(),'mod-cta');
    button(this.contentEl,'Cancel',()=>this.close());input.focus();
  }
}
