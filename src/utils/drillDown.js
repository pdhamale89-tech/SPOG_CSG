// Clicking a chart opens the SAME chart (same series, same legend) relabeled
// for whichever two period granularities are NOT the active toggle (weekly /
// monthly / qtr), each honoring the Fiscal Year filter. Nothing is invented:
// these are the exact datasets already on screen, just relabeled the way the
// period toggle already relabels every chart elsewhere in this app. A chart
// with fewer than two real points can't be charted at all, so no panels are
// returned for it.

import { buildPeriodLabels } from './periodLabels';

const PERIODS = ['weekly', 'monthly', 'qtr'];
const PERIOD_TITLE = { weekly: 'Weekly Trend', monthly: 'Monthly Trend', qtr: 'Quarterly Trend' };

function otherPeriods(curPeriod) {
  return PERIODS.filter((p) => p !== curPeriod);
}

function relabel(config, period, fiscalYear) {
  const n = config.data.labels.length;
  return {
    ...config,
    data: { ...config.data, labels: buildPeriodLabels(fiscalYear, period, n) },
  };
}

// config: the Chart.js config passed to ChartCanvas (its full data.labels +
// data.datasets, so every legend entry on the original chart carries over).
// curPeriod/fiscalYear: from AppContext.
export function computeChartTrendPanels({ config, curPeriod, fiscalYear }) {
  const labels = config?.data?.labels || [];
  const datasets = config?.data?.datasets || [];
  const numericPoints = datasets.reduce((n, ds) => n + (ds.data || []).filter((v) => typeof v === 'number').length, 0);
  if (labels.length < 2 || numericPoints < 2) return { panels: [] };

  const panels = otherPeriods(curPeriod).map((period) => ({
    title: PERIOD_TITLE[period],
    config: relabel(config, period, fiscalYear),
  }));

  return { panels };
}
