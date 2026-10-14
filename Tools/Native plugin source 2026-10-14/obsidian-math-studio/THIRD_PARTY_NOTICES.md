# Third-party notices

Math Studio uses MathLive 0.110.0 by Arno Gourdol, distributed under the MIT license. Its original license is included in every packaged plugin as vendor/MATHLIVE-LICENSE.txt. Source: https://github.com/arnog/mathlive

The bundled MathLive math fonts and styles ship from that pinned package. Fonts are embedded into local CSS to avoid runtime network requests.

scripts/mathlive-patch.mjs contains a narrow, version-checked modification to the rendering of closed double and triple integrals. It composes the existing sized integral glyphs with an SVG ellipse because the original closed-integral code points do not have matching sized glyphs. It does not change equation source or serialization. Mathcha's source code, icons, fonts and assets are not incorporated.
