# Cloudy page spacing

Keep the homepage's vertical rhythm on every existing and new public page. Use the shared values in `app/globals.css`: `--cloudy-page-pad` at page edges, `--cloudy-section-gap` between major sections, `--cloudy-section-half-gap` when two adjacent sections each contribute half, and `--cloudy-card-gap` only between related cards. The mobile values are defined at 700px and below. Do not introduce fixed page or section spacing when one of these values applies. Keep the smaller spacing inside cards, forms, and controls independent of the page rhythm.

For new pages, apply `cloudy-page-shell` to the outer content container or use `--cloudy-page-pad` in its CSS module. Use the shared section tokens for each major transition and check both phone and desktop layouts before publishing.

# Authorship

Everything is Dylano's (owner's choice): commits are authored as `Dylano24` with the owner's own email from the existing history, never as an AI tool. Commit messages, PR titles and descriptions, comments, branch names, code and docs carry no AI attribution: no `Co-Authored-By` or session-link lines, no "Generated with/by ..." footers, no AI tool, assistant or review bot (such as CodeRabbit) named as author, helper or reviewer (the website assistant's own answers about its identity are product behaviour and stay). A work branch that was given such a name is renamed or deleted once its work is merged. The whole history was rewritten for this on 2026-11-19; a backup of the old `master` is the branch `backup-master-2026-11-19`.
