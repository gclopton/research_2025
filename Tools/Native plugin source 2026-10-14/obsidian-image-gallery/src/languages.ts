const Prism: typeof import("prismjs") = require("./vendor/prism.cjs");
const languages: Record<string, [string, string]> = {
  py: ["python", "Python"],
  wl: ["wolfram", "Wolfram Language"],
  wls: ["wolfram", "Wolfram Language"],
  nb: ["wolfram", "Mathematica notebook source"],
  js: ["javascript", "JavaScript"],
  ts: ["typescript", "TypeScript"],
  c: ["c", "C"],
  h: ["c", "C header"],
  cc: ["cpp", "C++"],
  cpp: ["cpp", "C++"],
  hpp: ["cpp", "C++ header"],
  sh: ["bash", "Shell"],
  bash: ["bash", "Bash"],
  zsh: ["bash", "Zsh"],
  lua: ["lua", "Lua"],
  json: ["json", "JSON"],
  ipynb: ["json", "Jupyter notebook source"],
  yaml: ["yaml", "YAML"],
  yml: ["yaml", "YAML"],
  toml: ["toml", "TOML"],
  r: ["r", "R"],
  jl: ["julia", "Julia"],
  rs: ["rust", "Rust"],
  go: ["go", "Go"],
  m: ["matlab", "MATLAB / Octave"],
  f: ["fortran", "Fortran"],
  f90: ["fortran", "Fortran"],
  tex: ["latex", "LaTeX"],
  sql: ["sql", "SQL"],
  blend: ["", "Blender scene"],
  vesta: ["", "VESTA structure"],
  csv: ["", "CSV data"],
  tsv: ["", "TSV data"],
  log: ["", "Log"],
  out: ["", "Text output"],
  txt: ["", "Plain text"],
  md: ["markdown", "Markdown"],
  pdf: ["", "PDF"],
};
export function languageFor(path: string) {
  const name = path.split("/").pop()!;
  if (
    /^(OUTCAR|INCAR|POSCAR|CONTCAR|OSZICAR|KPOINTS|DOSCAR|EIGENVAL|XDATCAR)$/.test(
      name,
    )
  )
    return { id: "", label: "VASP · " + name };
  const [id, label] = languages[name.split(".").pop()!.toLowerCase()] ?? [
    "",
    "Plain text",
  ];
  return { id, label };
}
export function highlightedCode(text: string, path: string) {
  const { id } = languageFor(path);
  return id && Prism.languages[id]
    ? Prism.highlight(text, Prism.languages[id], id)
    : (Prism.util.encode(text) as string);
}
