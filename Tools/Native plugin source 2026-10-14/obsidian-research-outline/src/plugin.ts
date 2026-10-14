import {
	debounce,
	FileView,
	MarkdownView,
	Notice,
	Plugin,
	View,
} from 'obsidian';

import { OutlineView, VIEW_TYPE } from './view';
import { store } from './store';

import { SettingTab, QuietOutlineSettings, DEFAULT_SETTINGS } from "./settings";
import { editorEvent } from "./editorExt"
import {EditorView} from "@codemirror/view"


export class QuietOutline extends Plugin {
	settings: QuietOutlineSettings;
	current_note: FileView;
	current_file: string;
	heading_states: Record<string, string[]> = {};

	async onload() {
		await this.loadSettings();

		// TEST: 测试插件功能
		// this.addRibbonIcon('bot', 'test something', (evt) => {
		// 	const view = this.app.workspace.getActiveViewOfType(MarkdownView)
		// 	console.dir(view.getState())
		// })

		this.initStore();

		this.registerView(
			VIEW_TYPE,
			(leaf) => new OutlineView(leaf, this)
		);

		this.registerListener();

		this.registerCommand();

		this.addSettingTab(new SettingTab(this.app, this));
		
		this.registerExt();
		
		this.activateView();
	}

	initStore() {
		store.headers = [];
		store.dark = document.body.hasClass("theme-dark");
		store.markdown = this.settings.markdown;
		store.ellipsis = this.settings.ellipsis;
		store.labelDirection = this.settings.label_direction;
		store.leafChange = false;
		store.searchSupport = this.settings.search_support;
		store.levelSwitch = this.settings.level_switch;
		store.hideUnsearched = this.settings.hide_unsearched;
		store.regexSearch = this.settings.regex_search;
		store.autoExpand = this.settings.auto_expand;
		store.dragModify = this.settings.drag_modify;
		store.patchColor = this.settings.patch_color;
		store.primaryColorLight = this.settings.primary_color_light;
		store.primaryColorDark = this.settings.primary_color_dark;
		store.rainbowLine = this.settings.rainbow_line;
		store.rainbowColor1 = this.settings.rainbow_color_1;
		store.rainbowColor2 = this.settings.rainbow_color_2;
		store.rainbowColor3 = this.settings.rainbow_color_3;
		store.rainbowColor4 = this.settings.rainbow_color_4;
		store.rainbowColor5 = this.settings.rainbow_color_5;
	}
	/** Public, read-only provider contract. No vendor or Markdown-cache spoofing. */
	refreshOutline = () => {
		const view = this.app.workspace.getMostRecentLeaf()?.view as View & {
			getResearchOutline?: () => {
				version: 1; key: string; entries: {heading: string; level: number}[];
				active: number; jump: (index: number) => void | Promise<void>;
			};
		};
		if (!view || view.getViewType() === VIEW_TYPE) return;
		const outline = view.getResearchOutline?.();
		const oldKey = this.current_file;
		if (outline?.version === 1) {
			store.external = true;
			this.current_note = null;
			this.current_file = outline.key;
			const headers = outline.entries.map((entry, index) => ({
				heading: entry.heading, level: entry.level,
				position: {start: {line: index, col: 0, offset: index}, end: {line: index, col: 0, offset: index}}
			}));
			// Navigation updates do not rebuild the tree or discard search/collapse state.
			if (JSON.stringify(store.headers) !== JSON.stringify(headers)) store.headers = headers;
			store.externalActive = outline.active;
			store.jumpBy = (_plugin, index) => {
				Promise.resolve(outline.jump(index)).catch(error => {
					console.error('Research Outline navigation', error);
					new Notice('Could not navigate. Your editor was kept open.');
				});
			};
		} else {
			store.external = false;
			store.externalActive = -1;
			const fileView = view as FileView;
			this.current_note = fileView.file ? fileView : null;
			this.current_file = fileView.file?.path || '';
			store.jumpBy = view.getViewType() === 'markdown' ? markdownJump : view.getViewType() === 'kanban' ? kanbanJump : dummyJump;
			store.headers = fileView.file ? this.app.metadataCache.getFileCache(fileView.file)?.headings || [] : [];
		}
		if (oldKey !== this.current_file) store.refreshTree();
	};
	registerListener() {
		this.registerEvent(this.app.workspace.on('css-change', () => {
			store.dark = document.body.hasClass('theme-dark');
			store.cssChange = !store.cssChange;
		}));
		this.registerEvent(this.app.workspace.on('active-leaf-change', this.refreshOutline));
		this.registerEvent(this.app.workspace.on('layout-change', this.refreshOutline));
		const refresh = debounce(this.refreshOutline, 100, true);
		this.registerEvent(this.app.metadataCache.on('changed', refresh));
		// Workspace custom events are intentionally extensible beyond the core typings.
		this.registerEvent((this.app.workspace as any).on('research-outline:changed', this.refreshOutline));
		this.app.workspace.onLayoutReady(this.refreshOutline);
	}

	registerCommand() {
		this.addCommand({
			id: "quiet-outline",
			name: "Open Research Outline",
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: "quiet-outline-reset",
			name: "Reset expanding level",
			callback: () => {
				dispatchEvent(new CustomEvent("quiet-outline-reset"));
			}
		});

		this.addCommand({
			id: "quiet-outline-focus-input",
			name: "Focus on input",
			callback: () => {
				let input = document.querySelector(".quiet-outline input.n-input__input-el") as HTMLInputElement;
				if (input) {
					input.focus();
				}
			}
		});

		this.addCommand({
			id: "quiet-outline-copy-as-text",
			name: "Copy as plain text",
			callback: async () => {
				let headers = store.headers.map((h) => {
					return "    ".repeat(h.level - 1) + h.heading;
				});
				await navigator.clipboard.writeText(headers.join("\n"));
				new Notice("Headings copied");
			}
		});

	}
	
	registerExt() {
		this.registerEditorExtension([
			editorEvent
		]);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		// fix console error
		// https://github.com/guopenghui/obsidian-quiet-outline/issues/154
		if (this.app.workspace.rightSplit === null) return;

		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 0
		) {
			await this.app.workspace.getRightLeaf(false).setViewState({
				type: VIEW_TYPE,
				active: true,
			});
		}
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
		);
	}

}
export function dummyJump(plugin: QuietOutline, key: number) {}

function markdownJump(plugin: QuietOutline, key: number) {
    let line: number = store.headers[key].position.start.line;

    // const view = store.plugin.app.workspace.getActiveViewOfType(MarkdownView)
    const view = plugin.current_note;
    if (view) {
        view.setEphemeralState({ line });
        setTimeout(() => { view.setEphemeralState({ line }); }, 100);
    }
}

function kanbanJump(plugin: QuietOutline, key: number) {
	const panes = document.querySelectorAll(
		'.workspace-leaf[style=""] .kanban-plugin__lane-wrapper'
	);
	
	panes[key]?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
}

