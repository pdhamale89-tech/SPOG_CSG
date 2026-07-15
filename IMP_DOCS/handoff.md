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

## Deploy status: IN PROGRESS — live site not yet working

First deploy attempt failed with `Failed to create deployment (status: 404)... Ensure GitHub Pages has been enabled`. This is the standard error `actions/deploy-pages` throws when the repo's Pages **Source** is still "Deploy from a branch" instead of "GitHub Actions" — until that's switched, the workflow's build step succeeds but the deploy step 404s, and the live URL just serves the raw (unbuilt) `index.html` from the branch, which is why the page is blank (`<script src="/src/main.jsx">` is unparsed JSX with a wrong path — nothing renders).

Steps to actually fix:
1. On github.com → repo → **Settings** → **Pages** → under "Build and deployment" → "Source" → pick **GitHub Actions**.
2. Push any new commit (changing the Source setting alone does not redeploy the already-failed run) — this re-triggers `.github/workflows/deploy.yml`.
3. Confirm the new run's `deploy` job succeeds (not just `build`), and re-check https://pdhamale89-tech.github.io/SPOG_CSG/ actually serves the built `dist/index.html` (it will reference `/SPOG_CSG/assets/...`, not `/src/main.jsx`).

This can't be scripted end-to-end from the command line without an authenticated `gh` CLI (not installed in this environment) — the Source toggle specifically requires the GitHub web UI. Everything else (push, workflow, verifying via the public Actions API) can be done from the CLI.

## Known gaps / things a future session should know

- The React port intentionally preserves several "mock quirks" from the original HTML (documented in `design_choice.md`) — e.g. some per-chart region dropdowns exist in the UI but don't actually change the chart's data, because that's how the original behaved. Don't "fix" these without checking with the user first — they may want the mock's data wiring completed as a real next step.
- The decorative filter-bar selects (Segment/Product/Channel/DB-OSP/FY) don't affect any chart — same as the original.
- No test suite exists yet.
- Bundle is a single ~636KB JS chunk (Chart.js + jsvectormap are heavy) — flagged by Vite's build warning. Not addressed; would need code-splitting if it becomes a real concern.

## Where to look first

- `IMP_DOCS/tech_spec.md` — architecture, file map, state shape.
- `IMP_DOCS/design_choice.md` — why things are built the way they are, including trade-offs.
- `IMP_DOCS/prompt_trail.md` — chronological log of what was asked for, in case intent is unclear from the code alone.
