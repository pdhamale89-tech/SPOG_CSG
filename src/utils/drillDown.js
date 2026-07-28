// Generic Plan over Plan / Year on Year / Month on Month / Week on Week
// drill-down, derived from whatever a chart or KPI actually has data for.
// Nothing here is invented: a row that cannot be computed from the clicked
// chart's own series (or a KPI's own fields) says so instead of guessing.

const ROW_ORDER = ['Plan over Plan', 'Year on Year', 'Month on Month', 'Week on Week'];

function pctDelta(curr, prev) {
  if (typeof curr !== 'number' || typeof prev !== 'number' || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function fmtDelta(pct) {
  if (pct == null || Number.isNaN(pct)) return null;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function periodRowLabel(curPeriod) {
  return curPeriod === 'weekly' ? 'Week on Week' : 'Month on Month';
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
    const pct = fmtDelta(pctDelta(planDs.data[dataIndex], planDs.data[dataIndex - 1]));
    rows.push({ label: 'Plan over Plan', value: pct ?? '—', sub: `${planDs.label}: ${labels[dataIndex - 1]} → ${pointLabel}` });
  } else {
    rows.push({ label: 'Plan over Plan', value: '—', sub: 'No plan/forecast series on this chart' });
  }

  if (dataIndex > 0 && clicked?.data[dataIndex] != null && clicked.data[0] != null) {
    const pct = fmtDelta(pctDelta(clicked.data[dataIndex], clicked.data[0]));
    rows.push({ label: 'Year on Year', value: pct ?? '—', sub: `${labels[0]} → ${pointLabel} (full range shown)` });
  } else {
    rows.push({ label: 'Year on Year', value: '—', sub: 'This is the first period in this view' });
  }

  const activeLabel = periodRowLabel(curPeriod);
  let adjacentValue = '—';
  let adjacentSub = 'No prior period in this view';
  if (dataIndex > 0 && clicked?.data[dataIndex] != null && clicked.data[dataIndex - 1] != null) {
    const pct = fmtDelta(pctDelta(clicked.data[dataIndex], clicked.data[dataIndex - 1]));
    adjacentValue = pct ?? '—';
    adjacentSub = `${labels[dataIndex - 1]} → ${pointLabel}`;
  }
  ROW_ORDER.slice(2).forEach((label) => {
    if (label === activeLabel) {
      rows.push({ label, value: adjacentValue, sub: adjacentSub });
    } else {
      rows.push({ label, value: '—', sub: `Currently viewing ${curPeriod === 'qtr' ? 'quarterly' : curPeriod} periods` });
    }
  });

  return { pointLabel, seriesLabel: clicked?.label, rows };
}

// kpi: one of this app's plain { label, value, delta, sub } KPI/mini-stat objects.
// These have no historical series, so only the delta the KPI already carries can
// be surfaced - everything else is honestly marked as not tracked.
export function computeKpiDrillDown(kpi, curPeriod) {
  const isPlanMetric = /plan/i.test(kpi.sub || '') || /plan/i.test(kpi.delta || '') || /variance/i.test(kpi.label || '');
  const isYoyMetric = !isPlanMetric && (/yoy|year/i.test(kpi.sub || '') || /yoy|year/i.test(kpi.delta || ''));
  const activeLabel = periodRowLabel(curPeriod);

  const rows = ROW_ORDER.map((label) => {
    if (label === 'Plan over Plan') {
      return isPlanMetric
        ? { label, value: kpi.delta || kpi.value, sub: kpi.sub || '' }
        : { label, value: '—', sub: 'Not tracked for this KPI' };
    }
    if (label === 'Year on Year') {
      return isYoyMetric
        ? { label, value: kpi.delta || kpi.value, sub: kpi.sub || '' }
        : { label, value: '—', sub: 'Not tracked for this KPI' };
    }
    // Month on Month / Week on Week
    if (isPlanMetric || isYoyMetric) return { label, value: '—', sub: 'Not tracked for this KPI' };
    return label === activeLabel
      ? { label, value: kpi.delta || '—', sub: kpi.sub || '' }
      : { label, value: '—', sub: `Currently viewing ${curPeriod === 'qtr' ? 'quarterly' : curPeriod} periods` };
  });

  return { rows };
}
