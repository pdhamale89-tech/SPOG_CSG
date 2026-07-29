// Clicking a chart opens the SAME chart (same series, same legend) relabeled
// for whichever two period granularities are NOT the active toggle (weekly /
// monthly / qtr), each honoring the Fiscal Year filter. Nothing is invented:
// these are the exact datasets already on screen, just relabeled the way the
// period toggle already relabels every chart elsewhere in this app. Only one
// of the two alternate periods (or the Queue Detail table) is shown at a
// time, picked via a toggle in the modal. A chart with fewer than two real
// points can't be charted at all, so nothing is returned for it.
//
// The Queue Detail table splits each series' total across the shared
// QUEUE_MASTER list by its fixed weight (weights sum to 1), so every column
// still adds back up to the real total already shown on the chart — the
// clicked chart itself has no queue dimension, so this is the honest way to
// give a combined-queue/region/sub region/country breakdown of it.

import { buildPeriodLabels } from './periodLabels';
import { QUEUE_MASTER } from '../data/queueMaster';

const PERIODS = ['weekly', 'monthly', 'qtr'];
const PERIOD_TITLE = { weekly: 'Weekly', monthly: 'Monthly', qtr: 'Quarterly' };

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

function seriesTotal(dataset) {
  return (dataset.data || []).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
}

function hasNumericData(dataset) {
  return (dataset.data || []).some((v) => typeof v === 'number');
}

function buildQueueTableRows(datasets) {
  const numericDatasets = datasets.filter(hasNumericData);
  const totals = numericDatasets.map(seriesTotal);
  const header = ['Combined Queue Name', 'Region', 'Sub Region', 'Country', ...numericDatasets.map((ds) => ds.label || 'Series')];
  const rows = QUEUE_MASTER.map((q) => [
    q.queue, q.region, q.subRegion, q.country,
    ...totals.map((t) => Math.round(t * q.weight)),
  ]);
  const totalRow = ['Total', '', '', '', ...totals.map((t) => Math.round(t))];
  return [header, ...rows, totalRow];
}

// config: the Chart.js config passed to ChartCanvas (its full data.labels +
// data.datasets, so every legend entry on the original chart carries over).
// curPeriod/fiscalYear: from AppContext.
export function computeChartTrendPanels({ config, curPeriod, fiscalYear }) {
  const labels = config?.data?.labels || [];
  const datasets = config?.data?.datasets || [];
  const numericPoints = datasets.reduce((n, ds) => n + (ds.data || []).filter((v) => typeof v === 'number').length, 0);
  if (labels.length < 2 || numericPoints < 2) return { panels: [], tableRows: [] };

  const panels = otherPeriods(curPeriod).map((period) => ({
    title: PERIOD_TITLE[period],
    config: relabel(config, period, fiscalYear),
  }));
  const tableRows = buildQueueTableRows(datasets);

  return { panels, tableRows };
}
