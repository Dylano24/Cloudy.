# Cloudy page spacing

Keep the homepage's vertical rhythm on every existing and new public page. Use the shared values in `app/globals.css`: `--cloudy-page-pad` at page edges, `--cloudy-section-gap` between major sections, `--cloudy-section-half-gap` when two adjacent sections each contribute half, and `--cloudy-card-gap` only between related cards. The mobile values are defined at 700px and below. Do not introduce fixed page or section spacing when one of these values applies. Keep the smaller spacing inside cards, forms, and controls independent of the page rhythm.

For new pages, apply `cloudy-page-shell` to the outer content container or use `--cloudy-page-pad` in its CSS module. Use the shared section tokens for each major transition and check both phone and desktop layouts before publishing.
