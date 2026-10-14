import {
  Component,
  MarkdownRenderer,
  finishRenderMath,
  type App,
} from "obsidian";
import { toPng } from "html-to-image";
export interface AnnotationSource {
  fingerprint?: string;
  path: string;
  excerpt: string;
  from: number;
  to: number;
  captured: string;
  width: number;
  height: number;
  dataURL: string;
  background: string;
}
export async function capturePassage(
  app: App,
  doc: Document,
  path: string,
  excerpt: string,
) {
  const owner = new Component();
  owner.load();
  const shell = doc.createElement("div");
  shell.style.cssText =
    "position:fixed;left:-20000px;top:0;width:900px;pointer-events:none;";
  const box = shell.createDiv({
    cls: "markdown-preview-view markdown-rendered",
  });
  box.style.cssText =
    "width:900px;height:auto;min-height:0;padding:32px;box-sizing:border-box;overflow:visible;";
  doc.body.append(shell);
  try {
    const background =
      doc
        .defaultView!.getComputedStyle(doc.body)
        .getPropertyValue("--background-primary")
        .trim() || "#fff";
    box.style.background = background;
    await MarkdownRenderer.render(app, excerpt, box, path, owner);
    await finishRenderMath();
    await doc.fonts.ready;
    if (box.querySelector("iframe,video,canvas"))
      throw new Error(
        "This passage contains an interactive embed. Select text, equations or static content instead.",
      );
    if (
      Array.from(box.querySelectorAll("img")).some((img) =>
        /^https?:/.test(img.src),
      )
    )
      throw new Error(
        "Remote images are not captured. Use a local attachment first.",
      );
    await Promise.all(
      Array.from(box.querySelectorAll("img")).map((img) => img.decode()),
    );
    const height = Math.ceil(box.getBoundingClientRect().height);
    if (height > 6000)
      throw new Error(
        "Select a shorter passage (snapshot height exceeds 6000 pixels).",
      );
    const dataURL = await toPng(box, {
      pixelRatio: 2,
      backgroundColor: background,
      cacheBust: false,
    });
    return { dataURL, width: 900, height, background };
  } finally {
    owner.unload();
    shell.remove();
  }
}
