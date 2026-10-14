export type FileKind = "all" | "notes" | "pdf" | "images" | "code";
export type FolderKind = "" | "images" | "assets" | "figures" | "scripts";
export const imagePath = (p: string) =>
  /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(p);
export const codePath = (p: string) =>
  /\.(py|lua|js|ts|tsx|jsx|c|cc|cpp|h|hpp|rs|go|sh|bash|zsh|fish|r|jl|m|f|f90|wls|wl|nb|tex|json|yaml|yml|toml|ini|cfg|csv|tsv|log|out|txt|sql|ipynb|vesta|blend)$/i.test(
    p,
  ) ||
  /(^|\/)(OUTCAR|INCAR|POSCAR|CONTCAR|OSZICAR|KPOINTS|DOSCAR|EIGENVAL|XDATCAR|Makefile|Dockerfile)$/.test(
    p,
  );
export function usefulFile(p: string) {
  return (
    !/(^|\/)(\.git|\.obsidian|\.code-links|__pycache__|node_modules|\.venv|venv)(\/|$)/.test(
      p,
    ) && !/\.(pyc|pyo|DS_Store)$/i.test(p)
  );
}
export function folderMatches(
  path: string,
  folder: string,
  category: FolderKind,
) {
  const clean = folder.trim().replace(/^\/+|\/+$/g, "");
  return (
    (!clean ||
      (clean.includes(":") ? path : path.replace(/^[^:]+:/, "")).startsWith(
        clean + "/",
      )) &&
    (!category ||
      path
        .split("/")
        .slice(0, -1)
        .some((p) => p.toLowerCase().replace(/^[^:]+:/, "") === category))
  );
}
export function kindMatches(path: string, kind: FileKind) {
  return (
    kind === "all" ||
    (kind === "notes"
      ? /\.md$/i.test(path)
      : kind === "pdf"
        ? /\.pdf$/i.test(path)
        : kind === "images"
          ? imagePath(path)
          : codePath(path))
  );
}
export type LinkSlot = {
  start: number;
  end: number;
  query: string;
  syntax: "wiki" | "code";
  suffix: string;
  closed: boolean;
};
// Scope replacement to the bracket pair containing the caret, including unfinished links.
export function linkAt(text: string, offset: number): LinkSlot | undefined {
  const start = text.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
  const tail = text.indexOf("\n", offset);
  const end = tail < 0 ? text.length : tail;
  const line = text.slice(start, end),
    at = offset - start;
  const re = /\[\[|\{\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const code = m[0] === "{{",
      close = code ? "}}" : "]]";
    const found = line.indexOf(close, m.index + 2);
    const stop = found < 0 ? line.length : found + 2;
    if (
      at < m.index + 2 ||
      at > stop ||
      line
        .slice(m.index + 2, found < 0 ? line.length : found)
        .includes(code ? "{{" : "[[")
    )
      continue;
    const body = line.slice(m.index + 2, found < 0 ? line.length : found);
    if (code && /^\s*blank:/i.test(body)) continue;
    const split = body.search(/[|#]/);
    return {
      start: start + m.index,
      end: start + stop,
      query: split < 0 ? body : body.slice(0, split),
      suffix: split < 0 ? "" : body.slice(split),
      syntax: code ? "code" : "wiki",
      closed: found >= 0,
    };
  }
}
export function pickedLink(target: string, code: boolean, slot?: LinkSlot) {
  if (/[\n\r|#{}\[\]]/.test(target))
    throw Error("This filename cannot be represented safely in a link.");
  const suffix = slot?.syntax === (code ? "code" : "wiki") ? slot.suffix : "";
  return code ? "{{" + target + suffix + "}}" : "[[" + target + suffix + "]]";
}
