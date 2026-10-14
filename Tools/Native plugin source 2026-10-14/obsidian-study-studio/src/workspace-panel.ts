import {App, Component, ItemView, Menu, Notice, Plugin, Scope, WorkspaceLeaf, ViewStateResult} from 'obsidian';

const VIEW = 'study-studio-workspace';
export interface PanelRestoration {kind:string;[key:string]:unknown}
const restorers=new WeakMap<App,Map<string,(panel:StudioPanel,state:PanelRestoration)=>void>>();
export function registerPanelRestorer(app:App,kind:string,restore:(panel:StudioPanel,state:PanelRestoration)=>void){let map=restorers.get(app);if(!map){map=new Map();restorers.set(app,map);}map.set(kind,restore);}
const panels = new WeakMap<App, Map<string, StudioPanel>>();

/** A persistent workspace surface: changing active tabs never remounts its controls. */
export class StudioPanel extends Component {
  readonly modalEl = createDiv('study-workspace-panel');
  readonly titleEl = this.modalEl.createEl('h1');
  readonly contentEl = this.modalEl.createDiv('study-workspace-body');
  readonly scope: Scope;
  copyLink?: () => void;
  readonly id = crypto.randomUUID();
  private leaf?: WorkspaceLeaf;
  constructor(readonly app: App,public restoration?:PanelRestoration) { super(); this.scope = new Scope(app.scope); }
  onOpen(): void {}
  onClose(): void {}
  open() {
    const registry = panels.get(this.app);
    if (!registry) { new Notice('Study Studio workspace is unavailable.'); return; }
    if (this.leaf) { void this.app.workspace.revealLeaf(this.leaf); return; }
    registry.set(this.id, this);
    this.leaf = this.app.workspace.getLeaf('tab');
    void this.leaf.setViewState({type: VIEW, state: {id: this.id}, active: true}).then(
      () => this.leaf && this.app.workspace.revealLeaf(this.leaf),
      error => { registry.delete(this.id); this.leaf = undefined; new Notice(String(error)); },
    );
  }
  attach(leaf:WorkspaceLeaf){this.leaf=leaf;panels.get(this.app)?.set(this.id,this);}
  reveal() { if (this.leaf) void this.app.workspace.revealLeaf(this.leaf); }
  close() { this.leaf?.detach(); }
  mount() { this.load(); this.onOpen(); }
  dispose() { this.onClose(); this.unload(); panels.get(this.app)?.delete(this.id); this.leaf = undefined; }
}

class StudioView extends ItemView {
  private panel?: StudioPanel;
  private id = '';
  getViewType() { return VIEW; }
  getDisplayText() { return this.panel?.titleEl.textContent || 'Study Studio'; }
  getIcon() { return 'graduation-cap'; }
  onPaneMenu(menu:Menu,source:string) {
    super.onPaneMenu(menu,source);
    if(this.panel?.copyLink)menu.addItem(item=>item.setTitle('Copy link').setIcon('link').onClick(()=>this.panel?.copyLink?.()));
  }
  getState() { return {id: this.id,restoration:this.panel?.restoration}; }
  async setState(state: {id?: string;restoration?:PanelRestoration}, result: ViewStateResult) {
    if (this.panel) return;
    this.id = state?.id || '';
    this.panel = panels.get(this.app)?.get(this.id);
    if(!this.panel&&state.restoration){const restore=restorers.get(this.app)?.get(state.restoration.kind);if(restore){this.panel=new StudioPanel(this.app,state.restoration);this.id=this.panel.id;this.panel.attach(this.leaf);restore(this.panel,state.restoration);}}
    this.contentEl.empty();
    this.contentEl.addClass('study-workspace-view');
    if (!this.panel) {
      this.contentEl.createEl('h2', {text: 'Study Studio'});
      this.contentEl.createEl('p', {text: 'This workspace was closed or Obsidian restarted. Reopen a question or exam builder from its note. Saved exams can be resumed from the command palette. Authoring drafts are kept while their tab stays open, but are not recovered after a restart.'});
      this.contentEl.createEl('p', {text: 'Use the command “Study Studio: Resume exam or view exam results” to recover a saved exam.'});
    } else {
      this.scope = this.panel.scope;
      this.contentEl.append(this.panel.modalEl);
      this.panel.mount();
      this.addAction('external-link', 'Move to new window', () => { this.app.workspace.moveLeafToPopout(this.leaf); });
    }
    await super.setState(state, result);
  }
  async onClose() { this.panel?.dispose(); this.panel = undefined; this.contentEl.empty(); }
}

export function registerStudioWorkspace(plugin: Plugin) {
  panels.set(plugin.app, new Map());
  plugin.registerView(VIEW, leaf => new StudioView(leaf));
  plugin.addCommand({id: 'move-study-view-to-window', name: 'Move current Study Studio tab to new window', checkCallback: checking => {
    const view = plugin.app.workspace.getActiveViewOfType(StudioView);
    if (!view) return false;
    if (!checking) plugin.app.workspace.moveLeafToPopout(view.leaf);
    return true;
  }});
}
