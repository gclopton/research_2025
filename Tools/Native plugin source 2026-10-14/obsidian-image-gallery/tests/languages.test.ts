import { test } from "node:test";
import assert from "node:assert/strict";
import { languageFor, highlightedCode } from "../src/languages";
test("Python and Wolfram use distinct language grammars", () => {
  assert.equal(languageFor("a.wls").id, "wolfram");
  assert.equal(languageFor("a.py").id, "python");
  assert.match(
    highlightedCode("def energy(x):\n    return 2 * x", "a.py"),
    /token keyword/,
  );
  assert.match(highlightedCode("Plot[Sin[x], {x, 0, Pi}]", "a.wls"), /token/);
});
test("plain outputs and code HTML remain inert", () => {
  assert.equal(languageFor("run/OUTCAR").label, "VASP · OUTCAR");
  assert.equal(
    highlightedCode("<script>alert(1)</script>", "x.txt"),
    "&lt;script>alert(1)&lt;/script>",
  );
  assert(
    !highlightedCode('x = "<img src=x onerror=alert(1)>"', "a.py").includes(
      "<img",
    ),
  );
});

test("private grammar does not replace host Prism", () => {
  assert.equal((globalThis as any).Prism, undefined);
});
