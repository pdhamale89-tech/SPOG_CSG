# Tech Spec

## Stack

- **React 19** + **Vite** (JS, not TypeScript)
- **Chart.js 4** + **chartjs-plugin-datalabels** for all charts (bar/line/combo)
- **jsvectormap** for the world map choropleth
- Plain CSS (`src/theme.css`) — no CSS framework, ported 1:1 from the original HTML's `<style>` block, using CSS custom properties for light/dark theming (`:root` vs `[data-theme="dark"]`)
- No router — tab switching is client-side state, not URL-based (matches the original single-page mockup)
- No backend — all data is static/mock, defined in `src/data/`

## Deployment

- GitHub Pages, project site at `/SPOG_CSG/` (hence `base: '/SPOG_CSG/'` in `vite.config.js`)
- `.github/workflows/deploy.yml`: on push to `main`, `npm ci && npm run build`, then `actions/upload-pages-artifact` + `actions/deploy-pages`

## Directory map

```
spog-react/
  IMP_DOCS/              # this doc set
  .github/workflows/deploy.yml
  index.html
  vite.config.js
  src/
    main.jsx             # entry point, imports theme.css
    App.jsx              # AppProvider + DashboardShell + tab router
    theme.css             # full design system (ported from Final SPOG.html)
    theme/colors.js        # static light/dark color palette (see design_choice.md)
    context/
      AppContext.jsx      # all global dashboard state (see "State shape" below)
    data/
      forecastData.js     # D (monthly/weekly/qtr per-region datasets), uppData, drillData, hvData
      holidays.js         # HOLIDAYS array + getHolidaysForWeek()
      regions.js          # REGION_COUNTRIES, REGION_ACC, COUNTRY_REGION (world map)
      fiscalCalendar.js   # FISCAL_QUARTERS (fiscal calendar table structure)
    components/
      charts/
        chartSetup.js     # Chart.js global registration (registerables + datalabels)
        ChartCanvas.jsx   # generic Chart.js lifecycle wrapper (create on mount/config change, destroy on unmount)
        chartConfigs.js   # one builder function per chart (22 total) — pure functions: (data, theme, ...) => Chart.js config
        Gauge.jsx         # canvas arc gauge (used 3x in Forecast Health)
        WorldMap.jsx      # jsvectormap wrapper, colors countries by region
      layout/
        Sidebar.jsx, Topbar.jsx, FilterBar.jsx, RCAPanel.jsx
      modals/
        DetailModal.jsx, ApprovalModal.jsx, ForwardModal.jsx, PartnerRcaModal.jsx
      common/
        InfoBtn.jsx, InfoTip.jsx, Toast.jsx, RegionSelect.jsx
      tabs/
        Home.jsx, ForecastOverview.jsx, ShipmentAsu.jsx, ForecastHealth.jsx,
        CapacityOverview.jsx, CalendarForecast.jsx, CalendarFiscal.jsx,
        Reports.jsx, Notifications.jsx, Settings.jsx, HistVolTable.jsx
```

## State shape (`AppContext`)

All global state lives in one context (`src/context/AppContext.jsx`) rather than Redux/Zustand — the app is single-user, single-page, and the state graph is shallow enough that prop drilling via one context is simpler than adding a state library.

| State | Purpose |
|---|---|
| `theme` | `'light' \| 'dark'`, synced to `document.documentElement[data-theme]` |
| `currentTab`, `openSubMenu`, `breadcrumb` | which tab panel is shown + sidebar submenu open state + topbar breadcrumb text |
| `curRegion`, `curPeriod` | the global filter-bar Region/Period selection |
| `chartRegions` (map) + `chartRegionFor(id)` | per-chart region override (charts with their own region dropdown fall back to `curRegion` if not overridden) |
| `curHistPlan` | Historical Trend chart's plan toggle (plan1/2/3) |
| `drill` (`{level, offering, segment}`) | Shipment drill-down breadcrumb state |
| `toast`, `detailModal`, `approvalModal`, `forwardModal`, `partnerRcaModal` | UI feedback + the 4 modals |

## Chart rendering pattern

Every chart follows the same shape:
1. A pure builder function in `chartConfigs.js`: `(regionData, theme, ...extraArgs) => ChartJsConfig`
2. The tab component computes the config via `useMemo(() => build...(...), [deps])`
3. `<ChartCanvas config={...} />` creates the Chart.js instance in a `useEffect`, destroys it on unmount/config change — this mirrors the original's `CI[id].destroy(); buildSingleChart(id)` pattern but lets React own the lifecycle instead of manual DOM bookkeeping.

`ChartCanvas` accepts an optional `onClick` prop for the one chart that needs it (Partner Minimum → opens the Partner RCA modal on bar click).

## Color handling (important gotcha)

Charts and the world map do **not** call `getComputedStyle(document.documentElement)` at render time. See `design_choice.md` for why — short version: React's effect timing means the `data-theme` attribute update and the chart's re-render can land in the same commit, so a DOM read can catch the *previous* theme's values. Instead, `src/theme/colors.js` hardcodes the same light/dark hex values as `theme.css`, keyed by the `theme` string already in React state, so color lookups are synchronous with render.
