# Handoff

Last updated: after initial GitHub push + Pages deploy setup.

## What this project is

`SPOG_CSG` is a React (Vite) rebuild of a single-file HTML dashboard mockup (`Final SPOG.html`, lives one directory above this repo). The dashboard is a mock "Single Pane of Glass" for a contact-center forecasting org: forecast accuracy, shipment/ASU trends, forecast health, capacity, and fiscal/forecast calendars.

## Current state (done)

- Full React port of every tab, chart, modal, and the sidebar/topbar/filter-bar/RCA-panel shell. See `IMP_DOCS/tech_spec.md` for the file map.
- Verified in a headless browser (Playwright): navigation, filters, all charts re-rendering, dark/light theme toggle, world map choropleth, and the CLCA approval modal. Zero console errors.
- Fixed one bug during the port: the world map SVG overflowed its 300px container (missing `overflow: hidden`) — fixed in `src/theme.css`.
- GitHub repo created at `pdhamale89-tech/SPOG_CSG` (this folder only — the static HTML mockup was intentionally left out of the repo).
- `vite.config.js` has `base: '/SPOG_CSG/'` set for GitHub Pages project-site hosting.
- `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages automatically on every push to `main`.

## What's still manual (one-time only)

GitHub Pages needs its **Source** set to "GitHub Actions" once, in the repo's web UI:

1. Open the repo on github.com → **Settings** tab → **Pages** (left sidebar).
2. Under "Build and deployment" → "Source", choose **GitHub Actions**.

This can't be done from the command line without an authenticated `gh` CLI (not installed in this environment). After this one click, every future `git push` to `main` deploys automatically — no more manual steps.

## Known gaps / things a future session should know

- The React port intentionally preserves several "mock quirks" from the original HTML (documented in `design_choice.md`) — e.g. some per-chart region dropdowns exist in the UI but don't actually change the chart's data, because that's how the original behaved. Don't "fix" these without checking with the user first — they may want the mock's data wiring completed as a real next step.
- The decorative filter-bar selects (Segment/Product/Channel/DB-OSP/FY) don't affect any chart — same as the original.
- No test suite exists yet.
- Bundle is a single ~636KB JS chunk (Chart.js + jsvectormap are heavy) — flagged by Vite's build warning. Not addressed; would need code-splitting if it becomes a real concern.

## Where to look first

- `IMP_DOCS/tech_spec.md` — architecture, file map, state shape.
- `IMP_DOCS/design_choice.md` — why things are built the way they are, including trade-offs.
- `IMP_DOCS/prompt_trail.md` — chronological log of what was asked for, in case intent is unclear from the code alone.
