# SPOG_CSG

React + Vite port of the SPOG (Single Pane of Glass) forecast/shipment/ASU/capacity dashboard, originally built as a static HTML mockup (`Final SPOG.html`).

Live site (GitHub Pages): https://pdhamale89-tech.github.io/SPOG_CSG/

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages automatically. No manual steps needed after the first-time repo setup.

## Project docs

See [`IMP_DOCS/`](./IMP_DOCS) for the handoff notes, prompt history, tech spec, and design-choice log — kept up to date as the project evolves.
