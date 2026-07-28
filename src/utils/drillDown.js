// Generic Plan over Plan / Year on Year / Month on Month / Week on Week
// drill-down, derived from whatever a chart or KPI actually has data for.
// A comparison that cannot be computed from the clicked chart's own series
// (or a KPI's own fields) is left out entirely rather than guessed at.

function pctDelta(curr, prev) {
  if (typeof curr !== 'number' || typeof prev !== 'number' || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function periodRowLabel(curPeriod) {
  return curPeriod === 'weekly' ? 'Week on Week' : 'Month on Month';
}

// Pulls a signed percentage out of KPI display text such as "+3.8%",
// "▼ 4% vs AOP" or "▲ 12%". Returns null when the text carries no
// parseable percentage (e.g. "12K", "Below target").
function parsePct(text) {
  if (typeof text !== 'string') return null;
  const m = text.match(/([+-]?)\s*(\d+(?:\.\d+)?)\s*%/);
  if (!m) return null;
  let val = parseFloat(m[2]);
  if (m[1] === '-' || /▼/.test(text)) val = -val;
  return val;
}

// config: the Chart.js config passed to ChartCanvas. datasetIndex/dataIndex: from
// the click event's elements[0]. curPeriod: 'weekly' | 'monthly' | 'qtr' from AppContext.
export function computeChartDrillDown({ config, datasetIndex, dataIndex, curPeriod }) {
  const labels = config?.data?.labels || [];
  const datasets = config?.data?.datasets || [];
  const clicked = datasets[datasetIndex];
  const pointLabel = labels[dataIndex] ?? `point ${dataIndex + 1}`;
  const rows = [];

  const planDs = datasets.find((d) => /plan|forecast/i.test(d.label || ''));
  if (planDs && dataIndex > 0 && planDs.data[dataIndex] != null && planDs.data[dataIndex - 1] != null) {
    const pct = pctDelta(planDs.data[dataIndex], planDs.data[dataIndex - 1]);
    if (pct != null) rows.push({ label: 'Plan over Plan', pct, sub: `${planDs.label}: ${labels[dataIndex - 1]} → ${pointLabel}` });
  }

  if (dataIndex > 0 && clicked?.data[dataIndex] != null && clicked.data[0] != null) {
    const pct = pctDelta(clicked.data[dataIndex], clicked.data[0]);
    if (pct != null) rows.push({ label: 'Year on Year', pct, sub: `${labels[0]} → ${pointLabel} (full range shown)` });
  }

  if (dataIndex > 0 && clicked?.data[dataIndex] != null && clicked.data[dataIndex - 1] != null) {
    const pct = pctDelta(clicked.data[dataIndex], clicked.data[dataIndex - 1]);
    if (pct != null) rows.push({ label: periodRowLabel(curPeriod), pct, sub: `${labels[dataIndex - 1]} → ${pointLabel}` });
  }

  return { pointLabel, seriesLabel: clicked?.label, rows };
}

// kpi: one of this app's plain { label, value, delta, sub } KPI/mini-stat objects.
// These have no historical series, so only a comparison the KPI's own text
// actually carries a parseable percentage for gets a row.
export function computeKpiDrillDown(kpi, curPeriod) {
  const isPlanMetric = /plan/i.test(kpi.sub || '') || /plan/i.test(kpi.delta || '') || /variance/i.test(kpi.label || '');
  const isYoyMetric = !isPlanMetric && (/yoy|year/i.test(kpi.sub || '') || /yoy|year/i.test(kpi.delta || ''));
  const pct = parsePct(kpi.delta) ?? parsePct(kpi.value);

  const rows = [];
  if (pct != null) {
    const label = isPlanMetric ? 'Plan over Plan' : isYoyMetric ? 'Year on Year' : periodRowLabel(curPeriod);
    rows.push({ label, pct, sub: kpi.sub || '' });
  }

  return { rows };
}
