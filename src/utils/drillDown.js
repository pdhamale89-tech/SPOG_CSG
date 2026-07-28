// Clicking a chart opens trend graphs of that same clicked series, relabeled
// for whichever two period granularities are NOT the active toggle (weekly /
// monthly / qtr). Nothing is invented: these are the exact values already on
// screen, just viewed at the other two granularities the period toggle
// switches between elsewhere in this app. A series with fewer than two real
// points can't be charted at all, so no panels are returned for it.

import { M8 } from '../data/forecastData';
import { getColors } from '../theme/colors';

const PERIODS = ['weekly', 'monthly', 'qtr'];
const PERIOD_TITLE = { weekly: 'Weekly Trend', monthly: 'Monthly Trend', qtr: 'Quarterly Trend' };

function otherPeriods(curPeriod) {
  return PERIODS.filter((p) => p !== curPeriod);
}

function synthLabels(period, n) {
  if (period === 'weekly') return Array.from({ length: n }, (_, i) => `W${i + 1}`);
  if (period === 'qtr') {
    return Array.from({ length: n }, (_, i) => {
      const q = (i % 4) + 1;
      const yr = Math.floor(i / 4);
      return yr === 0 ? `Q${q}` : `Q${q} · Yr${yr + 1}`;
    });
  }
  return Array.from({ length: n }, (_, i) => {
    const m = M8[i % M8.length];
    const yr = Math.floor(i / M8.length);
    return yr === 0 ? m : `${m} · Yr${yr + 1}`;
  });
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function shade(rgbStr, amt) {
  const m = rgbStr.match(/\d+/g).map(Number);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `rgb(${f(m[0])},${f(m[1])},${f(m[2])})`;
}

// Gives each bar its own blue-to-green hue (matching the reference "Year over
// Year" chart) with a vertical gradient so bars read as glossy, not flat.
function barGradient(ctx, n) {
  const base = mix('#2563eb', '#10b981', n <= 1 ? 0 : ctx.dataIndex / (n - 1));
  const area = ctx.chart.chartArea;
  if (!area) return base;
  const g = ctx.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
  g.addColorStop(0, shade(base, -0.35));
  g.addColorStop(1, shade(base, 0.3));
  return g;
}

function buildTrendPanelConfig(values, period, theme) {
  const n = values.length;
  const { textSecondary, gridColor } = getColors(theme);
  return {
    type: 'bar',
    data: {
      labels: synthLabels(period, n),
      datasets: [{
        data: values,
        backgroundColor: (ctx) => barGradient(ctx, n),
        borderRadius: 6,
        maxBarThickness: 46,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { display: false } },
      scales: {
        x: { ticks: { color: textSecondary, font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: textSecondary, font: { size: 9 } }, grid: { color: gridColor } },
      },
    },
  };
}

// config: the Chart.js config passed to ChartCanvas. datasetIndex: from the
// click event's elements[0]. curPeriod/theme: from AppContext.
export function computeChartTrendPanels({ config, datasetIndex, curPeriod, theme }) {
  const datasets = config?.data?.datasets || [];
  const clicked = datasets[datasetIndex];
  const raw = clicked?.data || [];
  const numericCount = raw.filter((v) => typeof v === 'number').length;
  if (numericCount < 2) return { seriesLabel: clicked?.label, panels: [] };

  const panels = otherPeriods(curPeriod).map((period) => ({
    title: PERIOD_TITLE[period],
    config: buildTrendPanelConfig(raw, period, theme),
  }));

  return { seriesLabel: clicked?.label, panels };
}
