# Design Choices

Rationale for decisions made while porting `Final SPOG.html` to React, so future changes don't accidentally undo an intentional trade-off.

## 1. Fidelity over cleanup

The brief was "regenerate the same dashboard in React" — not "improve" it. So the port deliberately preserves quirks from the original mockup rather than fixing them:

- **Some per-chart region dropdowns don't do anything.** E.g. the Shipment Trend chart (`s1`) and Product Trend chart (`s3`) have a region/view dropdown in the UI, but the original's `buildSingleChart`/`buildProductChart` used hardcoded static arrays regardless of the selected value. The React port keeps the dropdown (for visual/UX parity) but the chart data still doesn't change — same as the original.
- **Decorative filter-bar selects.** Segment/Product/Channel/DB-OSP/FY selects in the top filter bar never affected any chart in the original (only Region and Period did). Kept as local component state in `FilterBar.jsx`, not wired to anything.
- **Static mock numbers.** Things like the DB vs OSP metric cards, risk-assessment grid, utilization bars, and risk heatmap were hardcoded `<div>`s in the original HTML, not chart-driven or data-driven. Ported as-is (hardcoded JSX), not generalized into a data model.

If a future request is "make the region dropdown on the Shipment Trend chart actually work," that's a real scope change, not a bug fix — flag it back to the user rather than assuming.

## 2. Static color palettes instead of `getComputedStyle`

The original vanilla-JS dashboard read CSS custom properties directly (`getComputedStyle(document.documentElement).getPropertyValue('--accent-green')`) at chart-build time, because it manually called `rebuildCharts()` *after* toggling the `data-theme` attribute — the DOM read always happened after the theme had already changed.

In React, that ordering isn't guaranteed: the `theme` state change, the `data-theme` attribute update (done in a `useEffect` in `AppContext`), and the chart components' re-render can all be scheduled in the same commit, so a `getComputedStyle` call inside a chart's render/effect can race the attribute update and read stale colors for one frame (or persistently, depending on effect order).

**Decision:** `src/theme/colors.js` hardcodes the same hex values as `theme.css`'s `:root` and `[data-theme="dark"]` blocks, keyed by the `theme` string that's already in React state. Chart configs, the gauge, and the world map all read from this instead of the DOM. This makes color lookup a pure function of state — no DOM read, no timing dependency, always correct on the render it's needed.

**Trade-off:** the two files (`theme.css` and `theme/colors.js`) must be kept in sync manually. If someone changes an accent color in `theme.css`, they need to also update `colors.js` or charts/gauges/map will silently use the old color. This is called out here specifically so it isn't missed.

## 3. One `ChartCanvas` wrapper, not `react-chartjs-2`

Considered using `react-chartjs-2` (the common React wrapper for Chart.js) but chose a thin custom wrapper instead:

- The original's chart-building logic (`buildSingleChart`) was already written as "build a full Chart.js config object, then `new Chart(...)`" — porting that 1:1 into plain builder functions (`chartConfigs.js`) that return a config object was the most direct, lowest-risk translation. Wrapping in `react-chartjs-2`'s per-chart-type components (`<Line>`, `<Bar>`, etc.) would have meant re-expressing every config through a different API shape for no real benefit, since several charts (Partner Minimum, Ship vs Projections/UPP) mix bar and line datasets in one chart, which is more naturally expressed as a raw Chart.js config than through type-specific wrapper components.
- `ChartCanvas` just does what the original's `updateSingleChart`/`buildSingleChart` did: destroy the previous instance, create a new one from the current config. `useMemo` on the config (keyed on the real dependencies: region, period, theme, etc.) replaces the original's manual `chartRegions[id] = region; CI[id].destroy(); buildSingleChart(id)` calls.

## 4. Global state via one React Context, not Redux/Zustand

The original had a handful of global `var`s (`curRegion`, `curPeriod`, `chartRegions`, `curHistPlan`, `CI`, modal state via DOM classes). That's a small, flat state graph. One `AppContext` with `useState` hooks mirrors it directly without introducing a new dependency or abstraction the project doesn't need yet. Revisit only if state genuinely grows past what prop-drilling-via-context can handle cleanly.

## 5. jsvectormap kept for the world map (not re-derived)

The world map was added to the original HTML in an earlier step of this project (see `prompt_trail.md` #2) using `jsvectormap` loaded from a CDN, with countries grouped into AMER/EMEA/APJ via a hand-built ISO-3166 alpha-2 list (`src/data/regions.js`) and colored to match the existing accuracy-tier colors. The React port keeps the same library and country-grouping data, just swaps the CDN `<script>` tags for npm imports (`jsvectormap` + `jsvectormap/dist/maps/world.js`, imported in that order because the map data file expects `window.jsVectorMap` to already exist — see `WorldMap.jsx` comment-free but the import order itself is load-bearing, don't reorder it).

## 6. Repo scope: `spog-react/` only

The static original mockup (`Final SPOG.html`) was intentionally **not** included in the `SPOG_CSG` GitHub repo — the user chose to scope the repo to just the buildable React app, which is also the only piece that makes sense to deploy to GitHub Pages. The HTML mockup remains a local reference file one directory above this repo.

## 7. GitHub Pages via GitHub Actions, not a manual `gh-pages` branch

The user asked for a "set it and forget it" deploy — pushing to `main` should be the only step required going forward, with no separate build-and-push-to-a-branch step to remember. A GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys on every push satisfies that directly. The only one-time manual step that couldn't be scripted (no authenticated `gh` CLI in this environment) is flipping the repo's Pages "Source" setting to **GitHub Actions** once in the GitHub web UI — documented in `handoff.md`.
