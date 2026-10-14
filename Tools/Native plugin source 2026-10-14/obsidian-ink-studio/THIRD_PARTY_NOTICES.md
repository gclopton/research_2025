# Third-party components

This prototype embeds Excalidraw 0.18.1 (MIT), React/React DOM 19.0.0 (MIT), and their dependency graph recorded in package-lock.json. Obsidian and CodeMirror APIs are provided by the host. Excalidraw is an independent project; Ink Studio is not an official Excalidraw product.

Excalidraw source and license: https://github.com/excalidraw/excalidraw
React source and license: https://github.com/facebook/react

Excalidraw's bundled font families retain their upstream licenses and attribution. Before distributing a packaged release, include the full upstream license texts for the engine, dependencies and font families; this repository currently supplies a private local development build, not a public redistribution package. No license to the user's drawings or notes is changed.

The drawing frame bundles its JavaScript and fonts locally. Its content security policy disallows external network connections; embedding remote pages is disabled. Excalidraw library/import features beyond the tested drawing tools are not part of this prototype's acceptance checks.

Dependency overrides pin patched nanoid and lodash-es versions. npm audit reported zero vulnerabilities for the resolved dependency graph on 2026-09-28; this is a point-in-time result, not a guarantee about future disclosures.

Annotation capture uses html-to-image 1.11.13 (MIT): https://github.com/bubkoo/html-to-image. Include its license text when distributing a packaged release.
