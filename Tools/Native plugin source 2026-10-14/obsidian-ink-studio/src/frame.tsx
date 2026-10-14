import React from "react";
import { createRoot } from "react-dom/client";
import {
  Excalidraw,
  MainMenu,
  exportToSvg,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { blankSVG, type InkScene } from "./model";
const cfg = (window as any).inkConfig as {
  session: string;
  scene: InkScene;
  dark: boolean;
};
const annotation = cfg.scene.annotation;
const backgroundId = "annotation-background";
const background = annotation
  ? convertToExcalidrawElements(
      [
        {
          type: "image",
          id: backgroundId,
          x: 0,
          y: 0,
          width: annotation.width,
          height: annotation.height,
          fileId: backgroundId,
          status: "saved",
          locked: true,
        } as any,
      ],
      { regenerateIds: false },
    )[0]
  : undefined;
if (annotation && background) {
  cfg.scene.elements = [
    background,
    ...cfg.scene.elements.filter(
      (e: any) =>
        e.id !== backgroundId &&
        (e.type !== "image" || e.fileId !== backgroundId),
    ),
  ];
  cfg.scene.files = {
    ...cfg.scene.files,
    [backgroundId]: {
      id: backgroundId,
      dataURL: annotation.dataURL,
      mimeType: "image/png",
      created: Date.now(),
    },
  };
}
const send = (type: string, extra: Record<string, unknown> = {}) =>
  parent.postMessage({ inkStudio: cfg.session, type, ...extra }, "*");
let api: ExcalidrawImperativeAPI | undefined;
const widthInput = document.querySelector("#pen-width") as HTMLInputElement;
const widthSlider = document.querySelector("#pen-slider") as HTMLInputElement;
widthInput.value = String(cfg.scene.appState.currentItemStrokeWidth ?? 0.5);
widthSlider.value = widthInput.value;
widthSlider.oninput = () => {
  widthInput.value = widthSlider.value;
  api?.updateScene({
    appState: { currentItemStrokeWidth: Number(widthSlider.value) },
  });
};
widthInput.onchange = () => {
  const width = Number(widthInput.value);
  if (!Number.isFinite(width) || width < 0.1 || width > 8) {
    widthInput.value = String(api?.getAppState().currentItemStrokeWidth ?? 0.5);
    return;
  }
  widthSlider.value = String(width);
  api?.updateScene({ appState: { currentItemStrokeWidth: width } });
};
const appearance = document.querySelector(
  "#preview-appearance",
) as HTMLSelectElement;
appearance.value = cfg.scene.previewAppearance ?? "editor";
if (annotation) {
  appearance.disabled = true;
  appearance.title = "Annotation backgrounds keep their captured appearance.";
}
appearance.onchange = () => {
  if (api) snapshot(api.getSceneElements(), api.getAppState(), api.getFiles());
};
let revision = 0;
let signature = "";
let timer: ReturnType<typeof setTimeout>;
let current = cfg.scene;
let closing = false;
const status = document.querySelector("#status") as HTMLElement;
function snapshot(
  elements: readonly ExcalidrawElement[],
  state: AppState,
  files: BinaryFiles,
) {
  if (background) {
    const currentBackground = elements.find((e) => e.id === backgroundId);
    if (
      !currentBackground ||
      currentBackground.isDeleted ||
      !currentBackground.locked ||
      currentBackground.x !== 0 ||
      currentBackground.y !== 0 ||
      currentBackground.width !== background.width ||
      currentBackground.height !== background.height
    ) {
      api?.updateScene({
        elements: [
          background,
          ...elements.filter(
            (e) =>
              e.id !== backgroundId &&
              (e.type !== "image" || e.fileId !== backgroundId),
          ),
        ],
      });
      return;
    }
  }
  if (document.activeElement !== widthInput)
    widthInput.value = String(state.currentItemStrokeWidth);
  widthSlider.value = String(state.currentItemStrokeWidth);
  const appState = {
    viewBackgroundColor: state.viewBackgroundColor,
    gridSize: state.gridSize,
    gridModeEnabled: state.gridModeEnabled,
    currentItemStrokeColor: state.currentItemStrokeColor,
    currentItemBackgroundColor: state.currentItemBackgroundColor,
    currentItemStrokeWidth: state.currentItemStrokeWidth,
    currentItemFillStyle: state.currentItemFillStyle,
    currentItemRoughness: state.currentItemRoughness,
    currentItemFontFamily: state.currentItemFontFamily,
    currentItemFontSize: state.currentItemFontSize,
  };
  const key = JSON.stringify([elements, appState, files, appearance.value]);
  if (key === signature) return;
  signature = key;
  current = {
    ...cfg.scene,
    previewAppearance: appearance.value === "light" ? "light" : "editor",
    elements: [...elements],
    appState,
    files,
    updated: new Date().toISOString(),
  };
  revision++;
  status.textContent = "Saving strokes…";
  send("draft", { scene: current, revision });
  clearTimeout(timer);
  timer = setTimeout(() => void preview(), 600);
}
async function preview(finish = false) {
  clearTimeout(timer);
  const at = revision;
  const scene = current;
  try {
    const visible = scene.elements.filter(
      (e: any) => !e.isDeleted,
    ) as ExcalidrawElement[];
    const svg = visible.length
      ? (
          await exportToSvg({
            elements: visible,
            appState: {
              ...scene.appState,
              exportBackground: true,
              exportWithDarkMode:
                scene.previewAppearance !== "light" && cfg.dark,
              exportEmbedScene: false,
            },
            files: scene.files as BinaryFiles,
            exportPadding: 24,
          })
        ).outerHTML
      : scene.previewAppearance !== "light" && cfg.dark
        ? blankSVG
            .replace('fill="white"', 'fill="#121212"')
            .replace('fill="#686868"', 'fill="#b8b8b8"')
        : blankSVG;
    if (at !== revision) {
      if (finish) void preview(true);
      return;
    }
    send("preview", { scene, svg, revision: at, finish });
  } catch (e) {
    status.textContent = "Strokes saved; preview failed. Retry Done.";
    send("preview-error", { message: String(e) });
    closing = false;
  }
}
function finish() {
  if (closing) return;
  closing = true;
  status.textContent = "Finishing…";
  void preview(true);
}
(document.querySelector("#done") as HTMLButtonElement).onclick = finish;
(document.querySelector("#retry") as HTMLButtonElement).onclick = () => {
  send("draft", { scene: current, revision });
  void preview();
};
(document.querySelector("#recover") as HTMLButtonElement).onclick = () =>
  send("recover", { scene: current });
window.addEventListener("message", (e) => {
  if (e.source !== parent || e.data?.inkStudio !== cfg.session) return;
  const d = e.data;
  if (d.type === "saved" && d.revision === revision) {
    status.textContent = "Saved locally";
    closing = false;
  }
  if (d.type === "error") {
    status.textContent = d.message;
    status.title = d.message;
    for (const id of ["retry", "recover"])
      (document.getElementById(id) as HTMLElement).style.display =
        "inline-block";
    closing = false;
  }
  if (d.type === "finish") finish();
});
window.addEventListener(
  "keydown",
  (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      e.stopImmediatePropagation();
      finish();
    }
  },
  true,
);
window.addEventListener("pagehide", () =>
  send("draft", { scene: current, revision }),
);
createRoot(document.querySelector("#editor")!).render(
  <Excalidraw
    initialData={{
      elements: cfg.scene.elements as ExcalidrawElement[],
      appState: {
        currentItemStrokeWidth: 0.5,
        ...cfg.scene.appState,
        ...(annotation
          ? {
              viewBackgroundColor: cfg.dark ? "#ffffff" : annotation.background,
            }
          : {}),
        theme: cfg.dark ? "dark" : "light",
      },
      files: cfg.scene.files as BinaryFiles,
      scrollToContent: true,
    }}
    excalidrawAPI={(value) => {
      api = value;
      send("ready");
    }}
    onChange={snapshot}
    theme={cfg.dark ? "dark" : "light"}
    autoFocus={true}
    handleKeyboardGlobally={true}
    validateEmbeddable={false}
    UIOptions={{
      canvasActions: {
        loadScene: false,
        export: false,
        saveToActiveFile: false,
        saveAsImage: false,
        toggleTheme: false,
      },
    }}
  >
    <MainMenu>
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  </Excalidraw>,
);
