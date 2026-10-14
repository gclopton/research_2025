# Math Studio

A desktop Obsidian plugin for editing typeset equations directly while retaining ordinary Markdown and LaTeX as the source of truth.

Status: version 0.1.1 is implemented and installed in the docs vault; see VERIFICATION.md for tested workflows and remaining checks.

Source project: `/Users/gradyclopton/Projects/obsidian-math-studio`.
Test vault: `/Users/gradyclopton/ObsidianVaults/math_studio_lab`.

Read [SPEC.md](SPEC.md) for the bounded implementation plan and [VERIFICATION.md](VERIFICATION.md) for evidence and pending checks. Mathcha is the interaction reference; MathLive supplies the visual editor. Math Studio is separate from Slide Studio and also runs in its native Markdown editor. Equation edits save ordinary LaTeX in the active note or slide.

The fixtures are synthetic and tracked here. Run `python3 scripts/create_lab.py` to create missing fixture files in the lab; existing files are never overwritten. Lab edits are disposable experiments but are not automatically reset.

## Current keyboard and theme behavior (0.1.1)

Place the caret inside inline or display math and press **Cmd+Shift+M** (Ctrl+Shift+M on non-Mac keyboards). The command palette entry is **Math Studio: Edit equation visually**; the editor context menu exposes the same action. The binding also works in Slide Studio's embedded native Markdown editor. Cmd+M is deliberately left to macOS.

Visual-editor controls: backslash or Ctrl+Space opens the palette; Tab/Shift+Tab traverses placeholders; Cmd/Ctrl+Shift+C opens math color controls; Shift+Enter or Cmd/Ctrl+Enter saves; Escape cancels. Storage remains ordinary LaTeX.

Inline math inherits Markdown emphasis color in notes. The parser masks TeX before finding Markdown emphasis, so TeX underscores and stars do not become formatting delimiters. Live Preview's sibling math widgets receive theme-derived colors without source edits. Explicit LaTeX colors remain intact. Gradient bold/italic math uses the theme's first gradient color because clipping a parent text gradient can make nested MathJax glyphs disappear.

The optional `integration/quiet-outline-heading-colors.css` snippet gives Quiet Outline the vault's heading colors without modifying its vendor bundle.
