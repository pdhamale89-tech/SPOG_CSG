import { uppData, drillData } from '../../data/forecastData';
import { getColors } from '../../theme/colors';
import { buildPeriodLabels } from '../../utils/periodLabels';

function fK(v) { return v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v; }

function baseScales(theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  return {
    x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
    y: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
  };
}
function legendPos(theme) {
  const { textSecondary: tc } = getColors(theme);
  return {
    position: 'bottom',
    align: 'center',
    maxHeight: 32,
    labels: { color: tc, font: { size: 9 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 5 },
  };
}
function dataLabelsDefault(theme) {
  const { textPrimary: tp, bgCard: bg } = getColors(theme);
  return {
    display: true,
    color: tp,
    font: { size: 9, weight: 'bold' },
    anchor: 'end',
    align: 'top',
    offset: 4,
    textStrokeColor: bg,
    textStrokeWidth: 3,
    formatter: (v) => (v >= 1000 ? fK(v) : v),
  };
}
function dataLabelsPercent(theme) {
  const { textPrimary: tp, bgCard: bg } = getColors(theme);
  return {
    display: true,
    color: tp,
    font: { size: 9, weight: 'bold' },
    anchor: 'end',
    align: 'top',
    offset: 4,
    textStrokeColor: bg,
    textStrokeWidth: 3,
    formatter: (v) => (v == null ? '' : v + '%'),
  };
}
const TOP_LABEL_LAYOUT = { padding: { top: 16 } };

export function buildPlanOfferedConfig(d, theme) {
  const S = baseScales(theme);
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const PDL = dataLabelsPercent(theme);
  const offeredPct = d.offered.map((o, i) => (d.forecast[i] ? Math.round((o / d.forecast[i]) * 100) : 0));
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Plan', data: d.forecast, backgroundColor: 'rgba(139,92,246,.55)', borderRadius: 3, order: 2 },
        { label: 'Actual Offered', data: d.offered, backgroundColor: 'rgba(59,130,246,.8)', borderRadius: 3, order: 3 },
        { label: 'Offered%', data: offeredPct, type: 'line', borderColor: '#10b981', borderWidth: 2.5, pointRadius: 4, tension: 0.3, fill: false, yAxisID: 'y1', order: 1, datalabels: PDL },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: S.x,
        y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } },
        y1: { position: 'right', ticks: { color: '#10b981', font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false }, min: 0, max: 100 },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCallVolumeConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const PDL = dataLabelsPercent(theme);
  const att = d.handled.map((h, i) => Math.round((h / d.offered[i]) * 100));
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Offered', data: d.offered, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,.08)', tension: 0.4 },
        { label: 'Handled', data: d.handled, borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,.08)', tension: 0.4 },
        { label: 'Abandonment%', data: d.abandon, borderColor: '#ef4444', borderDash: [5, 3], tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 4, borderWidth: 2.5, datalabels: PDL },
        { label: 'Offered%', data: att, borderColor: '#f59e0b', tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 3, borderWidth: 2, datalabels: PDL },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: S.x, y: S.y, y1: { position: 'right', ticks: { color: '#ef4444', font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false }, min: 0, max: 100 } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

const CHANNEL_MIX_REF_TOTAL = 5500;

export function buildChannelMixConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const voiceN = d.voice.map((v) => Math.round((CHANNEL_MIX_REF_TOTAL * v) / 100));
  const casesN = d.cases;
  const emailN = d.email.map((v) => Math.round((CHANNEL_MIX_REF_TOTAL * v) / 100));
  const chatN = d.chat.map((v) => Math.round((CHANNEL_MIX_REF_TOTAL * v) / 100));
  const socialN = d.social.map((v) => Math.round((CHANNEL_MIX_REF_TOTAL * v) / 100));
  const totals = d.labels.map((_, i) => voiceN[i] + casesN[i] + emailN[i] + chatN[i] + socialN[i]);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Voice', data: voiceN, backgroundColor: '#e0517a', borderRadius: 2 },
        { label: 'Cases', data: casesN, backgroundColor: '#2f8fd1', borderRadius: 2 },
        { label: 'Email', data: emailN, backgroundColor: '#d4a94a', borderRadius: 2 },
        { label: 'Chat', data: chatN, backgroundColor: '#2ea89b', borderRadius: 2 },
        { label: 'Social', data: socialN, backgroundColor: '#8b5cf6', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: {
          ticks: { color: tc, font: { size: 9 }, callback: fK },
          grid: { color: gc },
          stacked: true,
          title: { display: true, text: 'Number of Interactions', color: tc, font: { size: 9 } },
        },
      },
      plugins: {
        legend: LP,
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            afterBody: (items) => [`Total: ${totals[items[0].dataIndex].toLocaleString()}`],
          },
        },
        datalabels: {
          display: true,
          color: tp,
          font: { size: 8, weight: 'bold' },
          anchor: 'center',
          textStrokeColor: bg,
          textStrokeWidth: 2,
          formatter: (v) => (v > 150 ? fK(v) : ''),
        },
      },
    },
  };
}

export function buildDbOspVolumeConfig(d, theme) {
  const S = baseScales(theme);
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'DB', data: d.dbVol, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 3 },
        { label: 'OSP', data: d.ospVol, backgroundColor: 'rgba(245,158,11,.75)', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: S.x, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildDmsConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Unassisted', data: d.dmsUn, backgroundColor: '#10b981' },
        { label: 'Augmented', data: d.dmsAu, backgroundColor: '#3b82f6' },
        { label: 'Assisted', data: d.dmsAs, backgroundColor: '#ef4444' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, stacked: true, max: 100 },
      },
      plugins: { legend: LP, datalabels: { display: true, color: '#fff', font: { size: 9, weight: 'bold' }, anchor: 'center', formatter: (v) => v + '%' } },
    },
  };
}

// Partner Minimum / Partner Lock: horizontal Lock% bars colored by a flat
// threshold (green ≥ target, orange ≥ 50%, red below) with a matching flat
// dashed Target line. data comes from partnerLockData.js's
// partnerAgg/queueAgg; targetPct is the single flat threshold (80%).
export function buildPartnerLockConfig(data, theme, isPartnerView, targetPct) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, accentGreen, accentOrange, accentRed } = getColors(theme);

  function barColor(pct) {
    if (pct >= targetPct) return accentGreen;
    if (pct >= 50) return accentOrange;
    return accentRed;
  }

  const labels = data.map((d) => d.name);
  const datasets = [
    {
      label: 'Lock%',
      data: data.map((d) => d.pct),
      backgroundColor: data.map((d) => barColor(d.pct)),
      borderRadius: 5,
      barPercentage: 0.55,
      categoryPercentage: 0.75,
      datalabels: { display: true, color: tp, font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'right', offset: 4, formatter: (v) => v + '%' },
    },
    {
      label: 'Target',
      data: data.map(() => targetPct),
      type: 'line',
      borderColor: accentOrange,
      borderWidth: 2,
      borderDash: [6, 4],
      pointBackgroundColor: accentOrange,
      pointBorderColor: accentOrange,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      tension: 0,
      datalabels: { display: false },
    },
  ];

  return {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onHover: (evt, elements) => {
        const overBar = elements.length > 0 && elements[0].datasetIndex === 0;
        evt.native.target.style.cursor = isPartnerView && overBar ? 'pointer' : 'default';
      },
      scales: {
        x: { min: 0, max: 110, grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, stepSize: 20, callback: (v) => v + '%' } },
        y: { grid: { display: false }, ticks: { color: tc, font: { size: isPartnerView ? 11 : 10 } } },
      },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => data[items[0].dataIndex].name,
            label: () => '',
            afterBody: (items) => {
              const d = data[items[0].dataIndex];
              const lines = [
                `Lock Offered: ${d.lock.toLocaleString()}`,
                `Actual Offered: ${d.actual.toLocaleString()}`,
                `Lock%: ${d.pct}%`,
                `Target: ${targetPct}%`,
              ];
              if (d.queues) lines.push(`Queues: ${d.queues}`);
              if (d.regions) lines.push(`Region(s): ${d.regions}`);
              if (isPartnerView) lines.push('Click to drill down');
              return lines;
            },
          },
        },
      },
    },
  };
}

export function buildHistTrendConfig(d, theme, curHistPlan) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const pd = d[curHistPlan] || d.plan1;
  const planLabel = curHistPlan === 'plan1' ? 'Jul Pro' : curHistPlan === 'plan2' ? 'Jun Pro' : 'Aug Pro';
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'FY2026', data: d.fy26, borderColor: '#166534', tension: 0.3, borderWidth: 2.5, pointRadius: 2, fill: false },
        { label: 'FY2027', data: d.fy27act, borderColor: '#7c3aed', tension: 0.3, borderWidth: 2.5, pointRadius: 3, fill: false },
        { label: planLabel, data: pd, borderColor: '#06b6d4', tension: 0.3, borderWidth: 2, pointRadius: 2, fill: false },
        { label: 'ML Forecast', data: d.mlfc, borderColor: '#f59e0b', tension: 0.3, borderWidth: 2, pointRadius: 2, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildShipmentTrendStaticConfig(theme, curPeriod, fiscalYear) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'Actual', data: [55,58,52,60,62,65,59,64], borderColor: '#3b82f6', tension: 0.4, fill: false },
        { label: 'AOP', data: [58,60,58,63,65,68,64,68], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

// Offered vs total Tag Count (Web+Phone+Chat+Email combined) with the
// resulting Tags% on a secondary axis, matching the reference "Offered /
// Tag Count / Tags%" combo chart.
export function buildTagRouted2Config(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const valueLabels = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 2, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => v.toLocaleString() };
  const tagCount = d.labels.map((_, i) => d.tagWeb[i] + d.tagPhone[i] + d.tagChat[i] + d.tagEmail[i]);
  const tagsPct = tagCount.map((c, i) => (d.offered[i] ? Math.round((c / d.offered[i]) * 1000) / 10 : 0));
  const minPct = Math.floor(Math.min(...tagsPct));
  const maxPct = Math.ceil(Math.max(...tagsPct));
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Offered', data: d.offered, backgroundColor: 'rgba(59,130,246,.8)', borderRadius: 3, order: 3, datalabels: valueLabels },
        { label: 'Tag Count', data: tagCount, backgroundColor: 'rgba(16,185,129,.75)', borderRadius: 3, order: 2, datalabels: valueLabels },
        {
          label: 'Tags %', data: tagsPct, type: 'line', borderColor: '#1a1f36', backgroundColor: '#1a1f36', pointBackgroundColor: '#1a1f36',
          borderWidth: 2.5, pointRadius: 4, tension: 0.2, fill: false, yAxisID: 'y1', order: 1,
          datalabels: { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => v + '%' },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
        y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false }, min: minPct === maxPct ? minPct - 1 : minPct, max: minPct === maxPct ? maxPct + 1 : maxPct },
      },
      plugins: { legend: LP, datalabels: { display: false } },
    },
  };
}

// Six most recent fiscal years ending at the selected Fiscal Year filter —
// annual, not tied to the Weekly/Monthly/QTR toggle, matching the reference
// "Total Expiring Assets / Total Shipment / ASU Exit Actual / ASU Exit FCST"
// trend view.
function fyYearLabels(fiscalYear, count) {
  const end = parseInt(String(fiscalYear ?? '').match(/(\d+)/)?.[1] ?? '26', 10);
  return Array.from({ length: count }, (_, i) => `FY${end - count + 1 + i}`);
}

export function buildExitTrendConfig(theme, fiscalYear) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const labels = fyYearLabels(fiscalYear, 6);

  const expiringAssets = [11200, 13600, 14200, 11300, 11000, 9900];
  const shipment = [14500, 14790, 11090, 9090, 8910, 8820];
  const shipmentPct = shipment.map((v, i) => (i === 0 ? null : Math.round(((v - shipment[i - 1]) / shipment[i - 1]) * 100)));
  const lastIdx = shipment.length - 1;
  const exitActual = [29, 30, 27, 25.5, 23, null];
  const exitFcst = [null, null, null, null, 23, 22];

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Total Expiring Assets', data: expiringAssets, backgroundColor: '#1e3a5f', borderRadius: 2, order: 3 },
        {
          label: 'Total Shipment', data: shipment, order: 2,
          backgroundColor: shipment.map((_, i) => (i === lastIdx ? 'rgba(96,165,250,.4)' : 'rgba(96,165,250,.85)')),
          borderColor: '#60a5fa',
          borderWidth: shipment.map((_, i) => (i === lastIdx ? 2 : 0)),
          borderDash: [4, 3],
          borderRadius: 2,
          datalabels: {
            display: true, color: '#1a1f36', font: { size: 9, weight: 'bold' }, anchor: 'start', align: 'end', offset: 6,
            formatter: (v, ctx) => { const p = shipmentPct[ctx.dataIndex]; return p == null ? '' : `${p >= 0 ? '+' : ''}${p}%`; },
          },
        },
        { label: 'ASU Exit Actual', data: exitActual, type: 'line', borderColor: '#dc2626', borderWidth: 2.5, pointRadius: 0, tension: 0.35, fill: false, yAxisID: 'y1', order: 1, spanGaps: false },
        { label: 'ASU Exit FCST', data: exitFcst, type: 'line', borderColor: '#f59e0b', borderWidth: 2.5, pointRadius: 0, tension: 0, fill: false, yAxisID: 'y1', order: 0, spanGaps: false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
        y: { title: { display: true, text: 'Millions', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, min: 0, max: 16 },
        y1: { position: 'right', title: { display: true, text: 'Millions', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 } }, grid: { display: false }, min: 0, max: 35 },
      },
      plugins: { legend: LP, datalabels: { display: false } },
    },
  };
}

export function buildShipUppConfig(region, theme, curPeriod, fiscalYear) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const ud = uppData[region] || uppData.Global;
  return {
    type: 'bar',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, ud.shipAct.length),
      datasets: [
        { label: 'Ship_Actual', data: ud.shipAct, backgroundColor: 'rgba(59,130,246,.85)', borderRadius: 2, order: 3 },
        { label: 'Projection', data: ud.projection, backgroundColor: 'rgba(245,158,11,.85)', borderRadius: 2, order: 2 },
        { label: 'UPP1', data: ud.upp1, borderColor: '#9ca3af', borderWidth: 2, type: 'line', tension: 0.3, fill: false, pointRadius: 2, spanGaps: false, order: 1 },
        { label: 'UPP2', data: ud.upp2, borderColor: '#eab308', borderWidth: 2, type: 'line', tension: 0.3, fill: false, pointRadius: 2, spanGaps: false, order: 0 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: tc, font: { size: 7 }, maxRotation: 45 }, grid: { color: gc } },
        y: { title: { display: true, text: 'Thousands', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildShipDrillConfig(region, level, offering, theme, curPeriod, fiscalYear) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const dd = drillData[region] || drillData.Global;
  const key = level === 'overall' ? 'overall' : offering;
  const sd = dd[key] || dd.overall;
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, sd.act.length),
      datasets: [
        { label: 'Ship_Actual', data: sd.act, borderColor: '#3b82f6', borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 3 },
        { label: 'Projection', data: sd.proj, borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      interaction: { mode: 'index', intersect: false },
      scales: { x: { ticks: { color: tc, font: { size: 8 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildSegmentSoldConfig(theme, curPeriod, fiscalYear) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'Consumer', data: [18,19,17,20,21,22,20,21], backgroundColor: 'rgba(59,130,246,.6)', borderRadius: 2 },
        { label: 'Commercial', data: [22,24,22,25,26,27,24,27], backgroundColor: 'rgba(16,185,129,.6)', borderRadius: 2 },
        { label: 'Enterprise', data: [15,15,13,15,15,16,15,16], backgroundColor: 'rgba(139,92,246,.6)', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
      },
      plugins: { legend: LP, datalabels: { display: false } },
    },
  };
}

export function buildProductTrendConfig(theme, curPeriod, fiscalYear) {
  const { textSecondary: tc, textPrimary: tp, bgCard: bg } = getColors(theme);
  return {
    type: 'bar',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'Latitude', data: [22,24,21,25,26,28,24,27], backgroundColor: 'rgba(59,130,246,.7)', borderRadius: 2 },
        { label: 'Precision', data: [12,13,11,14,14,15,13,15], backgroundColor: 'rgba(245,158,11,.7)', borderRadius: 2 },
        { label: 'OptiPlex', data: [18,18,17,18,19,20,19,20], backgroundColor: 'rgba(16,185,129,.7)', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      plugins: {
        legend: { position: 'bottom', labels: { color: tc, font: { size: 9 } } },
        datalabels: { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3 },
      },
    },
  };
}

export function buildShipmentGrowthConfig(theme) {
  const S = baseScales(theme);
  const { textPrimary: tp } = getColors(theme);
  return {
    type: 'bar',
    data: { labels: ['AMER', 'EMEA', 'APJ'], datasets: [{ data: [42, 28, 30], backgroundColor: ['rgba(59,130,246,.7)', 'rgba(245,158,11,.7)', 'rgba(16,185,129,.7)'], borderRadius: 4 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      layout: { padding: { right: 24 } },
      scales: S,
      plugins: { legend: { display: false }, datalabels: { display: true, color: tp, font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'right', formatter: (v) => v + '%' } },
    },
  };
}

export function buildAsuTrendConfig(theme, curPeriod, fiscalYear) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'ASU', data: [1120,1135,1140,1150,1160,1175,1185,1200], borderColor: '#10b981', tension: 0.4, fill: false },
        { label: 'Plan', data: [1130,1145,1160,1175,1190,1200,1215,1230], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildAsuCpasuConfig(theme, curPeriod, fiscalYear) {
  const { textSecondary: tc } = getColors(theme);
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'ASU', type: 'bar', data: [1120,1135,1140,1150,1160,1175,1185,1200], backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 3, order: 2 },
        { label: 'CPASU', data: [980,990,995,1005,1015,1030,1040,1055], borderColor: '#8b5cf6', tension: 0.4, fill: false, order: 1 },
        { label: 'Contacts', data: [98000,95500,99000,93500,90500,88000,85500,87000], borderColor: '#f59e0b', tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 3, order: 0, datalabels: { display: false } },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { ...S, y1: { position: 'right', title: { display: true, text: 'Contact Volume', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { display: false } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

// Deterministic decline-with-wiggle generator so the multi-year trend below
// renders identically on every re-render (no Math.random/Date.now — those
// would make the "same" chart repaint with different numbers each time).
function genTrend(n, start, end, amp, freq, spikes = []) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0 : i / (n - 1);
    let v = start + (end - start) * t + Math.sin(i * freq) * amp;
    const spike = spikes.find((s) => s.i === i);
    if (spike) v += spike.d;
    arr.push(Math.max(0, Math.round(v * 10) / 10));
  }
  return arr;
}

// Selectable forecast vintages for the Contact Volume trend below: each
// later month's projection is a small downward revision of the previous
// one, matching how a rolling forecast typically firms up over time. More
// than one can be shown at once so vintages can be compared directly.
export const PROJECTION_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan'];
const PROJECTION_FACTORS = { Oct: 1.03, Nov: 1.0, Dec: 0.985, Jan: 0.97 };
const PROJECTION_COLORS = { Oct: '#f59e0b', Nov: '#8b5cf6', Dec: '#9ca3af', Jan: '#22c55e' };

// Draws a dashed vertical divider where Actual hands off to the projection
// lines, so the historical/forecast boundary reads at a glance instead of
// being implied only by a change in line style.
function buildCutoverPlugin(cutoverIndex) {
  return {
    id: 'volumeCutoverLine',
    afterDatasetsDraw(chart) {
      const { x: xScale, y: yScale } = chart.scales;
      if (!xScale || !yScale) return;
      const xPos = xScale.getPixelForTick(cutoverIndex);
      const { ctx } = chart;
      ctx.save();
      ctx.strokeStyle = 'rgba(107,114,128,.55)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xPos, yScale.top);
      ctx.lineTo(xPos, yScale.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
}

// Multi-year Contact Volume (Actual solid / one dashed line per selected
// projection vintage) over ASU / ASU Proj context bars on a secondary axis,
// spanning 3 fiscal years at whatever granularity the Weekly/Monthly/QTR
// toggle is set to. ASU moved from an overlapping filled area to a thin bar
// layer (the standard "line + column" dual-axis pairing) so it reads as
// background context rather than competing with the Contact Volume lines,
// and both axes start at 0 instead of a tightly cropped range.
// Value labels for the trend lines, thinned to roughly one per ~16 points
// (plus the final point) so a 156-point weekly view doesn't drown in text;
// monthly/quarterly views have few enough points to label every one.
function trendDatalabels(color, bg, n) {
  const step = Math.max(1, Math.ceil(n / 16));
  return {
    display: (ctx) => {
      const v = ctx.dataset.data[ctx.dataIndex];
      if (v == null) return false;
      return ctx.dataIndex % step === 0 || ctx.dataIndex === n - 1;
    },
    color,
    font: { size: 8, weight: 'bold' },
    anchor: 'end',
    align: 'top',
    offset: 4,
    textStrokeColor: bg,
    textStrokeWidth: 3,
    formatter: (v) => (v == null ? '' : v.toLocaleString()),
  };
}

export function buildAsuVolumeTrendConfig(theme, curPeriod, fiscalYear, projMonths) {
  const { textSecondary: tc, gridColor: gc, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const perYear = curPeriod === 'weekly' ? 52 : curPeriod === 'monthly' ? 12 : 4;
  const n = perYear * 3;
  const cutover = perYear * 2;
  const labels = buildPeriodLabels(fiscalYear, curPeriod, n);
  const months = projMonths && projMonths.length ? projMonths : ['Jan'];

  const contactFull = genTrend(n, 19, 7.5, 1.6, 0.35, [
    { i: Math.round(n * 0.28), d: n > 20 ? 3 : 1.2 },
    { i: Math.round(n * 0.30), d: n > 20 ? -4 : -1.5 },
  ]);
  const asuFull = genTrend(n, 28, 23.8, 0.3, 0.15);
  const overlapStart = Math.max(0, cutover - Math.min(3, perYear));

  const actual = contactFull.map((v, i) => (i < cutover ? v : null));
  const asu = asuFull.map((v, i) => (i < cutover ? v : null));
  const asuProj = asuFull.map((v, i) => (i >= cutover ? v : null));
  const projectionDatasets = months.map((m, idx) => {
    const factor = PROJECTION_FACTORS[m] ?? 1;
    const color = PROJECTION_COLORS[m] || '#22c55e';
    const data = contactFull.map((v, i) => (i >= overlapStart ? Math.round(v * factor * 10) / 10 : null));
    return {
      label: `${m} Projection`, type: 'line', data, borderColor: color, backgroundColor: color, fill: false,
      pointRadius: 0, borderWidth: 2, borderDash: [6, 3], tension: 0.2, yAxisID: 'y', order: idx, spanGaps: false,
      datalabels: trendDatalabels(color, bg, n),
    };
  });

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'ASU', type: 'bar', data: asu, backgroundColor: 'rgba(59,130,246,.32)', borderWidth: 0, yAxisID: 'y1', order: 5, barPercentage: 1, categoryPercentage: 1 },
        { label: 'ASU Proj', type: 'bar', data: asuProj, backgroundColor: 'rgba(245,158,11,.28)', borderWidth: 0, yAxisID: 'y1', order: 4, barPercentage: 1, categoryPercentage: 1 },
        {
          label: 'Actual', type: 'line', data: actual, borderColor: '#1a1f36', backgroundColor: '#1a1f36', fill: false,
          pointRadius: 0, borderWidth: 2.5, tension: 0.2, yAxisID: 'y', order: 1, spanGaps: false,
          datalabels: trendDatalabels('#1a1f36', bg, n),
        },
        ...projectionDatasets,
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: tc, font: { size: 7 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 18 }, grid: { display: false } },
        y: { min: 0, title: { display: true, text: 'Contact Volume', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
        y1: { position: 'right', min: 0, title: { display: true, text: 'Tech Support ASU', color: tc, font: { size: 9 } }, ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: { display: false } },
    },
    plugins: [buildCutoverPlugin(cutover)],
  };
}

// ===== Capacity — Workforce Planning =====

export function buildCapVolumeConfig(d, theme) {
  const S = baseScales(theme);
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul DB', data: d.julDb, backgroundColor: 'rgba(59,130,246,.45)', borderRadius: 3 },
        { label: 'Jul OSP', data: d.julOsp, backgroundColor: 'rgba(59,130,246,.85)', borderRadius: 3 },
        { label: 'Aug DB', data: d.augDb, backgroundColor: 'rgba(139,92,246,.45)', borderRadius: 3 },
        { label: 'Aug OSP', data: d.augOsp, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: S.x, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapVolumeTrendConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul Total Vol', data: d.julTotal, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.08)', fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2.5 },
        { label: 'Aug Total Vol', data: d.augTotal, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)', fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2.5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapHcConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Aug HC Avg', data: d.augHcAvg, backgroundColor: 'rgba(139,92,246,.6)', borderRadius: 3 },
        { label: 'Aug HC Exit', data: d.augHcExit, backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 3 },
        { label: 'Jul Total HC', data: d.julTotalHc, type: 'line', borderColor: '#3b82f6', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false },
        { label: 'Aug Total HC', data: d.augTotalHc, type: 'line', borderColor: '#8b5cf6', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapExcessConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul Excess HC', data: d.julExcessHc, backgroundColor: 'rgba(59,130,246,.55)', borderRadius: 3 },
        { label: 'Aug Excess HC', data: d.augExcessHc, backgroundColor: 'rgba(139,92,246,.7)', borderRadius: 3 },
        { label: 'Jul LOA Exit', data: d.julLoaExit, type: 'line', borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false },
        { label: 'Aug LOA Exit', data: d.augLoaExit, type: 'line', borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false },
        { label: 'Jul Training', data: d.julTraining, type: 'line', borderColor: '#8b5cf6', borderDash: [4, 3], pointRadius: 2, tension: 0.3, borderWidth: 1.5, fill: false, datalabels: { display: false } },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapHiringConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul (Old)', data: d.julOld, backgroundColor: 'rgba(59,130,246,.6)', borderRadius: 3 },
        { label: 'Aug (New)', data: d.augNew, backgroundColor: 'rgba(139,92,246,.75)', borderRadius: 3 },
        { label: 'Jul Total', data: d.julOld, type: 'line', borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
        { label: 'Aug Total', data: d.augNew, type: 'line', borderColor: '#7c3aed', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapHiringBreakdownConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const approved = d.labels.map((_, i) => d.julApproved[i] + d.julUrHiring[i] + d.augUrHiring[i]);
  const nonApproved = d.julNonApproved;
  const total = d.labels.map((_, i) => approved[i] + nonApproved[i]);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Approved Hiring', data: approved, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 3 },
        { label: 'Non-Approved Hiring', data: nonApproved, backgroundColor: 'rgba(245,158,11,.8)', borderRadius: 3 },
        { label: 'Total Hiring', data: total, type: 'line', borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapCapOspConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const pctDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Cap% Old', data: d.capPctOld, backgroundColor: 'rgba(59,130,246,.3)', yAxisID: 'y', borderRadius: 3 },
        { label: 'Cap% New', data: d.capPctNew, backgroundColor: 'rgba(59,130,246,.8)', yAxisID: 'y', borderRadius: 3 },
        { label: 'OSP% Old', data: d.ospPctOld, type: 'line', borderColor: '#f59e0b', pointRadius: 4, tension: 0.3, borderWidth: 2.5, yAxisID: 'y1' },
        { label: 'OSP% New', data: d.ospPctNew, type: 'line', borderColor: '#10b981', pointRadius: 4, tension: 0.3, borderWidth: 2.5, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        y: { beginAtZero: true, max: 200, ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, title: { display: true, text: 'Capacity %', color: tc, font: { size: 9 } } },
        y1: { position: 'right', beginAtZero: true, max: 100, ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false }, title: { display: true, text: 'OSP Mix %', color: tc, font: { size: 9 } } },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: pctDL },
    },
  };
}

export function buildCapExitConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul L1 Exit', data: d.julL1Exit, backgroundColor: 'rgba(59,130,246,.7)', borderRadius: 3, yAxisID: 'y' },
        { label: 'Aug L1 Exit', data: d.augL1Exit, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 3, yAxisID: 'y' },
        { label: 'Exit PoP%', data: d.exitPopPct, type: 'line', borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, yAxisID: 'y1', datalabels: { display: false } },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false } },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapPopConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const PDL = dataLabelsPercent(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'DB Vol PoP%', data: d.dbVolPop, borderColor: '#ef4444', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: PDL },
        { label: 'OSP Vol PoP%', data: d.ospVolPop, borderColor: '#f59e0b', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: PDL },
        { label: 'Total Vol PoP%', data: d.totalVolPop, borderColor: '#3b82f6', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: PDL },
        { label: 'HC Avg PoP%', data: d.hcAvgPop, borderColor: '#8b5cf6', borderDash: [5, 3], pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: PDL },
        { label: 'HC Exit PoP%', data: d.hcExitPop, borderColor: '#06b6d4', borderDash: [5, 3], pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapHiringPopConfig(d, theme) {
  const S = baseScales(theme);
  const { textPrimary: tp, bgCard: bg } = getColors(theme);
  const negDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'start', align: 'bottom', offset: 4, textStrokeColor: bg, textStrokeWidth: 3 };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        {
          label: 'Hiring PoP Δ',
          data: d.hiringPopDelta,
          backgroundColor: d.hiringPopDelta.map((v) => (Math.abs(v) > 50 ? 'rgba(239,68,68,.8)' : 'rgba(245,158,11,.75)')),
          borderRadius: 3,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: S, plugins: { legend: { display: false }, datalabels: negDL } },
  };
}

export function buildCapPlannerGapConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const palette = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: d.planners.map((p, i) => ({ label: p.name, data: p.data, borderColor: palette[i % palette.length], tension: 0.3, pointRadius: 4, borderWidth: 2.5, fill: false })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapTopGapsConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const leftDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'start', align: 'left', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => fK(v) };
  return {
    type: 'bar',
    data: { labels: d.labels, datasets: [{ label: 'FY27Q3 Gap', data: d.gaps, backgroundColor: 'rgba(239,68,68,.75)', borderRadius: 3 }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
      plugins: { legend: { display: false }, datalabels: leftDL },
    },
  };
}

export function buildCapOfferingGapConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const condDL = { display: (ctx) => ctx.dataset.data[ctx.dataIndex] !== 0, color: tp, font: { size: 8, weight: 'bold' }, anchor: 'end', align: 'top', textStrokeColor: bg, textStrokeWidth: 2 };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Pro', data: d.pro, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 2 },
        { label: 'Premium', data: d.premium, backgroundColor: 'rgba(245,158,11,.8)', borderRadius: 2 },
        { label: 'OOP', data: d.oop, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 2 },
        { label: 'Basic', data: d.basic, backgroundColor: 'rgba(16,185,129,.75)', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { stacked: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, x: { stacked: true, ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
      plugins: { legend: LP, datalabels: condDL },
    },
  };
}

export function buildCapPlannerSubtotalsConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const condDL = { display: (ctx) => ctx.dataset.data[ctx.dataIndex] !== 0, color: tp, font: { size: 8, weight: 'bold' }, textStrokeColor: bg, textStrokeWidth: 2 };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'FY27 Total', data: d.fy27Total, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 2 },
        { label: 'FY28 Q1', data: d.fy28Q1, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 2 },
        { label: 'FY28 Q2', data: d.fy28Q2, backgroundColor: 'rgba(245,158,11,.8)', borderRadius: 2 },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
      plugins: { legend: LP, datalabels: condDL },
    },
  };
}

export function buildCapWeeklyGapConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Total Gap', data: d.totalGap, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)', fill: true, tension: 0.3, pointRadius: 5, borderWidth: 3, yAxisID: 'y' },
        { label: 'CommClient OOP', data: d.commClientOop, borderColor: '#3b82f6', tension: 0.3, pointRadius: 2, borderWidth: 1.5, yAxisID: 'y1', datalabels: { display: false } },
        { label: 'Core Email', data: d.coreEmail, borderColor: '#f59e0b', tension: 0.3, pointRadius: 2, borderWidth: 1.5, yAxisID: 'y1', datalabels: { display: false } },
        { label: 'Tech Cons CNX', data: d.techConsCnx, borderColor: '#8b5cf6', tension: 0.3, pointRadius: 2, borderWidth: 1.5, yAxisID: 'y1', datalabels: { display: false } },
        { label: 'Tech Cons Email', data: d.techConsEmail, borderColor: '#06b6d4', tension: 0.3, pointRadius: 2, borderWidth: 1.5, yAxisID: 'y1', datalabels: { display: false } },
        { label: 'Commercial', data: d.commercial, borderColor: '#10b981', tension: 0.3, pointRadius: 2, borderWidth: 1.5, yAxisID: 'y1', datalabels: { display: false } },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc }, title: { display: true, text: 'Total Gap', color: tc, font: { size: 9 } } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 } }, grid: { display: false }, title: { display: true, text: 'Queue Gap', color: tc, font: { size: 9 } } },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

