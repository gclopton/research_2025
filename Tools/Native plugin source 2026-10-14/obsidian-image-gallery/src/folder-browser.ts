import { App, Modal, TFolder } from 'obsidian';
import { childFolders, cleanFolder } from './folders';

export class FolderBrowser extends Modal {
  private folder: string;
  private query = '';
  private children: string[] = [];
  private ticket = 0;
  private limit = 150;
  private closed = false;
  private selected = false;
  private crumbs!: HTMLElement;
  private list!: HTMLElement;
  private status!: HTMLElement;
  private search!: HTMLInputElement;
  private choose!: HTMLButtonElement;
  constructor(app: App, private label: string, start: string, private base: string | undefined,
    private done: (folder: string) => void, private cancelled?: () => void) {
    super(app);
    try { this.folder = cleanFolder(start); } catch { this.folder = ''; }
  }
  onOpen() {
    this.modalEl.classList.add('ig-folder-browser');
    this.titleEl.setText('Choose a folder');
    this.crumbs = this.contentEl.createDiv({cls:'ig-breadcrumbs'});
    this.search = this.contentEl.createEl('input', {type:'search', placeholder:'Filter these folders…', attr:{'aria-label':'Filter child folders'}});
    this.search.oninput = () => {this.query=this.search.value;this.limit=150;this.renderList();};
    this.status = this.contentEl.createDiv({cls:'ig-count', attr:{'aria-live':'polite'}});
    this.list = this.contentEl.createDiv({cls:'ig-folder-list'});
    const actions=this.contentEl.createDiv({cls:'ig-controls'});
    this.choose=actions.createEl('button',{text:'Use this folder',cls:'mod-cta'});
    this.choose.onclick=()=>{this.selected=true;this.done(this.folder);this.close();};
    actions.createEl('button',{text:'Cancel'}).onclick=()=>this.close();
    void this.navigate(this.folder);
  }
  private async navigate(folder: string) {
    const ticket=++this.ticket;
    this.folder=folder;this.query='';this.search.value='';this.limit=150;
    this.crumbs.empty();
    const up=this.crumbs.createEl('button',{text:'↑ Up'});
    up.disabled=!folder;up.onclick=()=>void this.navigate(folder.split('/').slice(0,-1).join('/'));
    this.crumbs.createEl('button',{text:this.label}).onclick=()=>void this.navigate('');
    const parts=folder ? folder.split('/') : [];
    parts.forEach((part,i)=>{
      this.crumbs.createSpan({text:'/'});
      this.crumbs.createEl('button',{text:part}).onclick=()=>void this.navigate(parts.slice(0,i+1).join('/'));
    });
    this.children=[];this.list.empty();this.status.setText('Reading folders…');this.choose.disabled=true;
    try {
      let children: string[];
      if(this.base) children=await childFolders(this.base,folder);
      else {
        const parent=folder ? this.app.vault.getAbstractFileByPath(folder) : this.app.vault.getRoot();
        if(!(parent instanceof TFolder)) throw Error('Folder not found. Use the breadcrumbs to choose its parent.');
        children=parent.children.filter((f): f is TFolder=>f instanceof TFolder && !f.name.startsWith('.')).map(f=>f.name).sort((a,b)=>a.localeCompare(b));
      }
      if(this.closed||ticket!==this.ticket)return;
      this.children=children;this.choose.disabled=false;this.renderList();
    }catch(e){if(ticket===this.ticket&&!this.closed)this.status.setText(String(e));}
  }
  private renderList() {
    this.list.empty();
    const children=this.children.filter(name=>name.toLowerCase().includes(this.query.toLowerCase()));
    this.status.setText(`${children.length} folder${children.length===1 ? "" : "s"}${children.length>this.limit ? ` · showing ${this.limit}` : ''}`);
    for(const name of children.slice(0,this.limit)) {
      this.list.createEl('button',{text:'📁 '+name,attr:{'aria-label':'Open folder '+name}}).onclick=()=>void this.navigate(this.folder ? this.folder+'/'+name : name);
    }
    if(!children.length)this.list.createEl('p',{text:'No subfolders here. You can use this folder or go up.'});
    if(children.length>this.limit)this.list.createEl('button',{text:'Show more folders'}).onclick=()=>{this.limit+=150;this.renderList();};
  }
  onClose(){if(!this.selected)this.cancelled?.();this.closed=true;++this.ticket;this.contentEl.empty();}
}
