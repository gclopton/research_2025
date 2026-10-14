# Research paper library

This vault keeps one PDF and one Markdown reading conversion per paper. A paper can belong to several nested libraries through `.paper-library/catalog.json`. Other note types may have multiple copies. Preserve the registered source path and evidence selections.

Before acquiring a paper, query the catalog by title and DOI with `python3 .paper-library/paper-library.py --vault . find --title "Title" --doi "DOI"`. Reuse an existing source and add its library membership. After downloading a new PDF outside the vault, use the gallery’s Add PDF command or the script’s `import PDF --library LIBRARY_ID`. Exact and recorded equivalent hashes reuse the original. Review title/DOI candidates before choosing an existing source.

Use `libraries` to inspect library IDs and `add SOURCE_ID LIBRARY_ID` to assign additional categories. Membership changes do not copy files. Sources have stable IDs; library names and parents can change independently of physical source paths.

For conversion, run `python3 .paper-library/paper-library.py --vault . convert SOURCE_ID`. It reuses a registered reading copy, otherwise invokes the installed Mathpix chapter converter with local images and registers the resulting Markdown. Supply `--converter PATH` when the converter lives elsewhere on this machine. This command may incur Mathpix API costs when a conversion is needed. For an already completed conversion, use `register-conversion SOURCE_ID VAULT_RELATIVE_MD_PATH`; this refuses to replace an existing reading copy. Never create a second category-specific conversion.

Run `check` after intake or a catalog change. The gallery also reports possible duplicates arriving through Finder or other scripts. These arrivals require review; they are never silently deleted. The research-only catalog is enabled by its presence in this vault. Do not create catalogs or enforce this paper rule in other vaults.

Migration receipt and recovery snapshot are outside this vault under `Documents/ChatGPT/BDM Calculation Campaign/Diagnostics/Paper library - 2026-10-13`. The catalog retains retired paths as aliases. Evidence files and all canonical source content were retained unchanged during consolidation.

Move paper folders through Obsidian while Image Gallery is running. The vault-root catalog tracks those moves, keeps evidence redirects, and updates the intake destination. Run the integrity check after a move. External moves made while Obsidian is closed require path repair before further intake.

After completing OCR cleanup against the published PDF and verifying math, figures, tables, references and saved evidence selections, run `python3 .paper-library/paper-library.py --vault . mark-cleaned SOURCE_ID`. This records a dated cleanup review and the PDF/Markdown hashes. Library cards show ✨ for reviewed papers and 🤢 for those awaiting cleanup. Do not stamp a conversion merely because Mathpix completed. Repeat review after replacing or substantially revising the reading copy.
