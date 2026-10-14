import type { AnnotationSource } from "./annotation";
export function sourceStatus(
  text: string | null,
  source: AnnotationSource,
): string {
  if (text === null) return "Source note is missing";
  if (text.slice(source.from, source.to) === source.excerpt)
    return "Source unchanged";
  const first = text.indexOf(source.excerpt);
  if (first >= 0 && text.indexOf(source.excerpt, first + 1) < 0)
    return "Source unchanged (moved)";
  return "Earlier snapshot — source changed or location is ambiguous";
}
