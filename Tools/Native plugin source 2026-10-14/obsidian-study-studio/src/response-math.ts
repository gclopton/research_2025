import {App, Component, Modal} from 'obsidian';
import {MathField} from './math-field';

/** Only the learner's draft enters Math Studio, never the question's answer key. */
export class AnswerMathEditor extends Modal {
  private owner = new Component();
  constructor(app: App, private value: string, private path: string,
    private apply: (value: string) => void, private restoreFocus: () => void) {
    super(app);
    this.modalEl.addClass('study-response-math-modal');
  }
  onOpen() {
    this.titleEl.setText('Edit your math answer');
    this.owner.load();
    this.contentEl.createEl('p', {text:'Shift+Enter finishes the equation and returns to your answer. Escape cancels the equation draft.', cls:'study-muted'});
    const input = this.contentEl.createEl('textarea', {attr:{'aria-label':'Your answer in LaTeX'}});
    input.value = this.value;
    let saved = false;
    const field = new MathField(this.app, input, this.path, true,
      () => {this.apply(input.value); saved = true;},
      active => {if(!active && saved) {saved = false; queueMicrotask(() => this.close());}});
    this.owner.addChild(field);
    const apply = this.contentEl.createEl('button', {text:'Use answer'});
    apply.onclick = () => {if(!input.disabled) {this.apply(input.value); this.close();}};
    void field.openAtCursor();
  }
  onClose() {this.owner.unload(); this.contentEl.empty(); this.restoreFocus();}
}
