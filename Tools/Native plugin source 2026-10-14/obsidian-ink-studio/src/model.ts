import type { AnnotationSource } from "./annotation";
export interface InkScene {
  format: "ink-studio";
  version: 1;
  annotation?: AnnotationSource;
  previewAppearance?: "editor" | "light";
  id: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
  updated: string;
}
export const blankSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="480" viewBox="0 0 960 480"><rect width="960" height="480" fill="white"/><text x="480" y="240" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#686868">Double-click to draw · Ink Studio</text></svg>';
export function blankScene(id: string): InkScene {
  return {
    format: "ink-studio",
    version: 1,
    id,
    elements: [],
    appState: { viewBackgroundColor: "#ffffff", currentItemStrokeWidth: 0.5 },
    files: {},
    updated: new Date().toISOString(),
  };
}
export function readScene(text: string): InkScene {
  const s = JSON.parse(text);
  if (
    s?.format !== "ink-studio" ||
    s.version !== 1 ||
    typeof s.id !== "string" ||
    !Array.isArray(s.elements) ||
    !s.appState ||
    typeof s.appState !== "object" ||
    !s.files ||
    typeof s.files !== "object"
  )
    throw new Error(
      "This is not a supported Ink Studio scene. The file has not been changed.",
    );
  return s;
}
export function scenePath(preview: string) {
  if (!preview.endsWith(".ink.svg"))
    throw new Error("Not an Ink Studio preview.");
  return preview.slice(0, -4) + ".json";
}
export function assertUnchanged(current: string, expected: string) {
  if (current !== expected)
    throw new Error(
      "The drawing changed outside this editor. Your draft is retained; finish in the other editor first or recover this draft separately.",
    );
}
// A serialized writer prevents an older asynchronous save from winning.
export class SaveQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(work: () => Promise<T>): Promise<T> {
    const result = this.tail.then(work);
    this.tail = result.catch(() => {});
    return result;
  }
}
