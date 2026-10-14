# Reviewed plugin differences

2026-10-08: all 56 third-party main.js files in docs were compared to their same-version official release assets. The ten locally authored plugins are listed separately in inventory.json. Shared copies were also snapshotted and hash-compared to docs.

The sole functional JavaScript customization found was Colored Text: font-weight:bold added to both color-selection insertion paths. Research Colors preserves this in a source fork. All other JavaScript byte differences normalize to original content after line-ending and source-map annotation cleanup. All available manifest objects matched. CSS differences were line endings, blank-line whitespace or source-map annotations, including the initially flagged Advanced Slides line.

Quiet Outline 0.3.24 matched its release exactly. Note heading colors came from our separate Math Studio snippet. Research Outline now incorporates those colors and provides explicit Slide Studio support.

Both private forks use distinct plugin IDs and retain source history, MIT license, author attribution, and an upstream reference remote. Originals remain installed and disabled for rollback in docs. Native code_links_lab validation preceded deployment. Personal settings were copied locally, never committed or uploaded. Existing notes and syntax remain unchanged.

Private fork sources: /Users/gradyclopton/Projects/obsidian-research-outline and /Users/gradyclopton/Projects/obsidian-research-colors. No public release or push was performed. Migration is limited to docs and code_links_lab. Other vaults and the shared configuration directory were inventoried and backed up, not migrated.

See inventory.json for snapshot hashes, upstream-comparison.json for asset-level evidence, and upstream/ for downloaded originals and diffs. The byte-level AUDIT.md is preliminary; use this reviewed report for conclusions.
