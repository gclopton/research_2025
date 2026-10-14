export type Alignment = "left" | "center" | "right" | "default";
export function alignImage(source: string, alignment: Alignment): string {
  const wiki = source.startsWith("![[") && source.endsWith("]]");
  const match = wiki
    ? null
    : source.match(/^!\[((?:\\.|[^\]\\])*)\](\([\s\S]*\))$/);
  if (!wiki && !match)
    throw new Error(
      "This image format is not supported by the alignment menu.",
    );
  const parts = (wiki ? source.slice(3, -2) : match![1]).split("|");
  const path = wiki ? parts.shift()! : null;
  const clean = parts.filter(
    (x) => !["left", "center", "right"].includes(x.trim()),
  );
  const size =
    clean.length && /^\d+(?:x\d+)?$/.test(clean[clean.length - 1].trim())
      ? clean.pop()
      : undefined;
  if (alignment !== "default") clean.push(alignment);
  if (size !== undefined) clean.push(size);
  return wiki
    ? "![[" + [path, ...clean].join("|") + "]]"
    : "![" + clean.join("|") + "]" + match![2];
}
