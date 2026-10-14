/** Lossless, bounded edits of inline images. Offsets always refer to the original document. */
export type Alignment = "left" | "center" | "right";
export type Embed = {
  start: number;
  end: number;
  raw: string;
  kind: "markdown" | "wiki";
  label: string;
  destination: string;
  labelStart: number;
  labelEnd: number;
  pathStart: number;
  pathEnd: number;
};
const escaped = (s: string, i: number) => {
  let n = 0;
  while (i > 0 && s[--i] === "\\") n++;
  return n % 2 === 1;
};
export function scanEmbeds(text: string): Embed[] {
  const result: Embed[] = [];
  let fence = "",
    inline = 0,
    comment = "";
  let frontmatter = text.startsWith("---\n") || text.startsWith("---\r\n");
  for (let i = 0; i < text.length; i++) {
    if (i === 0 || text[i - 1] === "\n") {
      const line = text.slice(
        i,
        text.indexOf("\n", i) < 0 ? text.length : text.indexOf("\n", i),
      );
      if (frontmatter) {
        if (i > 0 && /^(---|\.\.\.)\s*$/.test(line)) frontmatter = false;
        i += line.length;
        continue;
      }
      const f = /^(?:\s*>\s*)*\s{0,3}(`{3,}|~{3,})/.exec(line);
      if (f) {
        if (!fence) fence = f[1];
        else if (f[1][0] === fence[0] && f[1].length >= fence.length)
          fence = "";
        i += line.length;
        inline = 0;
        continue;
      }
      if (fence) {
        i += line.length;
        continue;
      }
    }
    if (comment) {
      if (text.startsWith(comment, i)) {
        i += comment.length - 1;
        comment = "";
      }
      continue;
    }
    if (!inline && (text.startsWith("<!--", i) || text.startsWith("%%", i))) {
      comment = text.startsWith("<!--", i) ? "-->" : "%%";
      i += text.startsWith("<!--", i) ? 3 : 1;
      continue;
    }
    if (text[i] === "`" && !escaped(text, i)) {
      let n = 1;
      while (text[i + n] === "`") n++;
      if (!inline) inline = n;
      else if (inline === n) inline = 0;
      i += n - 1;
      continue;
    }
    if (inline || text[i] !== "!" || text[i + 1] !== "[" || escaped(text, i))
      continue;
    if (text[i + 2] === "[") {
      let end = i + 3;
      while (
        end < text.length &&
        !(text.slice(end, end + 2) === "]]" && !escaped(text, end)) &&
        text[end] !== "\n"
      )
        end++;
      if (text.slice(end, end + 2) !== "]]") continue;
      let sep = i + 3;
      while (sep < end && (text[sep] !== "|" || escaped(text, sep))) sep++;
      const finish = end + 2;
      result.push({
        start: i,
        end: finish,
        raw: text.slice(i, finish),
        kind: "wiki",
        destination: text.slice(i + 3, sep),
        label: sep < end ? text.slice(sep + 1, end) : "",
        pathStart: i + 3,
        pathEnd: sep,
        labelStart: sep < end ? sep + 1 : end,
        labelEnd: end,
      });
      i = finish - 1;
      continue;
    }
    let close = i + 2,
      depth = 1;
    for (; close < text.length; close++) {
      if (escaped(text, close)) continue;
      if (text[close] === "[") depth++;
      if (text[close] === "]" && !--depth) break;
    }
    if (depth || text[close + 1] !== "(") continue;
    let p = close + 2;
    while (/[ \t]/.test(text[p] ?? "") && p < text.length) p++;
    const angled = text[p] === "<";
    const start = p + (angled ? 1 : 0);
    let end = start;
    if (angled) {
      while (
        end < text.length &&
        (text[end] !== ">" || escaped(text, end)) &&
        text[end] !== "\n"
      )
        end++;
      if (text[end] !== ">") continue;
    } else {
      let nesting = 0;
      for (; end < text.length; end++) {
        const c = text[end];
        if (escaped(text, end)) continue;
        if (c === "(") nesting++;
        else if (c === ")") {
          if (!nesting) break;
          nesting--;
        } else if (/\s/.test(c) && !nesting) break;
      }
    }
    let finish = angled ? end + 1 : end;
    while (/[ \t\r\n]/.test(text[finish] ?? "") && finish < text.length)
      finish++;
    if (text[finish] === '"' || text[finish] === "'") {
      const q = text[finish++];
      while (
        finish < text.length &&
        (text[finish] !== q || escaped(text, finish))
      )
        finish++;
      if (text[finish] !== q) continue;
      finish++;
      while (/[ \t\r\n]/.test(text[finish] ?? "") && finish < text.length)
        finish++;
    }
    if (text[finish] !== ")") continue;
    finish++;
    result.push({
      start: i,
      end: finish,
      raw: text.slice(i, finish),
      kind: "markdown",
      label: text.slice(i + 2, close),
      destination: text.slice(start, end),
      labelStart: i + 2,
      labelEnd: close,
      pathStart: start,
      pathEnd: end,
    });
    i = finish - 1;
  }
  return result;
}
export function layout(label: string) {
  const parts = label.split("|");
  let width: number | undefined,
    height: number | undefined,
    align: Alignment | undefined;
  const last = parts.at(-1) ?? "";
  if (/^\d+(?:x\d+)?$/.test(last)) {
    const dims = parts.pop()!.split("x").map(Number);
    [width, height] = dims;
  }
  const kept = parts.filter((p) => {
    if (/^(left|center|right)$/.test(p)) {
      align = p as Alignment;
      return false;
    }
    return true;
  });
  return { alt: kept.join("|"), width, height, align };
}
export function changedEmbed(
  e: Embed,
  change: { destination?: string; align?: Alignment; width?: number | null },
): string {
  let raw = e.raw;
  const edits: { from: number; to: number; value: string }[] = [];
  if (change.destination !== undefined) {
    const path =
      e.kind === "markdown"
        ? change.destination
            .replace(/%/g, "%25")
            .replace(/#/g, "%23")
            .replace(/\?/g, "%3F")
            .replace(/ /g, "%20")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/</g, "%3C")
            .replace(/>/g, "%3E")
        : change.destination;
    if (/[\r\n]/.test(path) || (e.kind === "wiki" && /[|\[\]]/.test(path)))
      throw Error(
        "This filename cannot be represented safely as a wiki image.",
      );
    edits.push({
      from: e.pathStart - e.start,
      to: e.pathEnd - e.start,
      value: path,
    });
  }
  if (change.align !== undefined || change.width !== undefined) {
    const l = layout(e.label);
    const width = change.width === undefined ? l.width : change.width;
    if (
      width !== undefined &&
      width !== null &&
      (!Number.isInteger(width) || width < 1 || width > 10000)
    )
      throw Error("Width must be a whole number from 1 to 10000 pixels.");
    const parts = [l.alt, change.align ?? l.align].filter(Boolean) as string[];
    if (width != null)
      parts.push(
        String(width) +
          (change.width === undefined && l.height ? `x${l.height}` : ""),
      );
    let value = parts.join("|");
    if (
      e.kind === "wiki" &&
      e.labelStart === e.labelEnd &&
      e.pathEnd === e.labelEnd &&
      value
    )
      value = "|" + value;
    // Empty wiki metadata removes the separator as well.
    let from = e.labelStart - e.start;
    if (e.kind === "wiki" && !value && e.pathEnd < e.labelStart) from--;
    edits.push({ from, to: e.labelEnd - e.start, value });
  }
  for (const x of edits.sort((a, b) => b.from - a.from))
    raw = raw.slice(0, x.from) + x.value + raw.slice(x.to);
  return raw;
}
export function replaceExact(
  current: string,
  snapshot: string,
  e: Embed,
  replacement: string,
): string {
  if (current !== snapshot || current.slice(e.start, e.end) !== e.raw)
    throw Error(
      "The note changed while the image controls were open. Reopen them on the current image.",
    );
  return current.slice(0, e.start) + replacement + current.slice(e.end);
}
export function imageFile(path: string) {
  return /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(path);
}
export function foldersFor(
  source: string,
  attachment: string,
  configured: string,
) {
  const parent = source.includes("/")
    ? source.slice(0, source.lastIndexOf("/"))
    : "";
  const join = (a: string, b: string) =>
    [a, b].filter(Boolean).join("/").replace(/\/+/g, "/");
  return [
    ...new Set(
      [
        configured.trim().replace(/^\/+|\/+$/g, ""),
        attachment === "."
          ? parent
          : attachment.startsWith("./")
            ? join(parent, attachment.slice(2))
            : attachment,
        parent ? join(parent, "images") : "images",
        parent ? join(parent, "attachments") : "attachments",
      ].filter((x) => x && x !== "/"),
    ),
  ];
}

/** Resolve an explicit cursor occurrence; never guess between same-line duplicates. */
export function embedAtCursor(text: string, offset: number): Embed | undefined {
  const all = scanEmbeds(text);
  const inside = all.find((e) => offset >= e.start && offset < e.end);
  if (inside) return inside;
  const start = text.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
  const next = text.indexOf("\n", offset);
  const end = next < 0 ? text.length : next;
  const line = all.filter((e) => e.start >= start && e.end <= end);
  return line.length === 1 ? line[0] : undefined;
}
