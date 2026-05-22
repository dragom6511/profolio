# 吳享龍 Dragom ／ 作品集 ／ Portfolio

藝術作品集網站，以手繪作品的陳列為主。

## Tech

- Vanilla HTML / CSS / JavaScript (no build step)
- React 18 via UMD + Babel-standalone for inline JSX
- Bilingual (繁中 / English)

## Local preview

Open `index.html` in a browser. No build needed.

## Deploy to GitHub Pages

1. In repo Settings → Pages
2. Source: `main` branch, folder `/ (root)`
3. After a minute, your site is at `https://<username>.github.io/<repo>/`

## Structure

- `index.html` — entry, loads all scripts
- `styles.css` — full stylesheet
- `data.js` / `copy.js` — artworks + UI copy (zh / en)
- `app.jsx` — main shell, routing, tweaks, scroll-snap nav
- `components/` — page-level components
  - `landing.jsx` — three home variants (museum / manifesto / index)
  - `gallery.jsx` — works page with 4 layouts
  - `pages.jsx` — statement / about / contact
  - `journal.jsx` — process / behind-the-scenes
  - `artwork.jsx` — artwork image / frame helpers
- `tweaks-panel.jsx` / `image-slot.js` — utilities
- `assets/` — paintings + portrait

© 2024–2026 吳享龍 / Dragom. All artwork all rights reserved.
