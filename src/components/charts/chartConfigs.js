import { uppData } from '../../data/forecastData';
import { CAP_OVERALL } from '../../data/capacityData';
import { getColors } from '../../theme/colors';
import { buildPeriodLabels } from '../../utils/periodLabels';
import { scaleDisplayValue, scaleByRelativePercent } from '../../utils/displayScale';

// Overall's series is an average, not a specific plan's actual data -- tag
// its legend labels with (Avg) so it doesn't read as if Jul or Aug measured
// that number directly.
export function planLabel(plan) {
  return plan === CAP_OVERALL ? `${plan} (Avg)` : plan;
}

// Every Compare-Plans chart's "A" series is Plan Name 1 as of Year 1, and
// "B" is Plan Name 2 as of Year 2 (see CAP_YEAR_FACTOR in capacityData.js) --
// legends spell out both so a YoY difference doesn't read as unexplained
// drift in the plan-vintage numbers.
export function planYearLabel(plan, year) {
  return `${planLabel(plan)} ${year}`;
}

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
    formatter: (v) => scaleDisplayValue(String(v >= 1000 ? fK(v) : v)),
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
    formatter: (v) => (v == null ? '' : scaleDisplayValue(`${v}%`)),
  };
}
const TOP_LABEL_LAYOUT = { padding: { top: 16 } };

// Capacity Overview's charts (build Wpd*Config below) use a flat 15% cut
// instead of the rest of CSG's 10%/5pp split -- this mirrors dataLabelsDefault
// but through scaleByRelativePercent so this page's bars stay consistent
// with its own KPI tiles and tables.
function capDataLabelsDefault(theme) {
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
    formatter: (v) => scaleByRelativePercent(String(v >= 1000 ? fK(v) : v), 15),
  };
}

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
          formatter: (v) => (v > 150 ? scaleDisplayValue(String(fK(v))) : ''),
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
  // Segment backgrounds here are fixed brand colors, not theme-driven, so
  // each label color is chosen for contrast against its OWN segment (not
  // the page theme) and stays correct in both light and dark mode.
  const segLabel = (color) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'center', align: 'center', formatter: (v) => v + '%' });
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Unassisted', data: d.dmsUn, backgroundColor: '#FFA700', datalabels: segLabel('#000') },
        { label: 'Augmented', data: d.dmsAu, backgroundColor: '#B3CBE8', datalabels: segLabel('#000') },
        { label: 'Assisted', data: d.dmsAs, backgroundColor: '#0D4C91', datalabels: segLabel('#fff') },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, stacked: true, max: 100 },
      },
      plugins: { legend: LP },
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
      order: 2,
      // Label text only -- bar length/color threshold below still keys off
      // the real Lock% value, same as every other chart's geometry.
      datalabels: { display: true, color: tp, font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'right', offset: 4, formatter: (v) => scaleDisplayValue(`${v}%`) },
    },
    {
      label: 'Target',
      data: data.map(() => targetPct),
      type: 'line',
      order: 1,
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
              if (isPartnerView) lines.push('Click for more information');
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
  const { bgCard: bg } = getColors(theme);
  const pd = d[curHistPlan] || d.plan1;
  const planLabel = curHistPlan === 'plan1' ? 'Jul Pro' : curHistPlan === 'plan2' ? 'Jun Pro' : 'Aug Pro';
  // 4 lines sharing one anchor/align would collide wherever they run close
  // together, so each gets its own color, position (above/below), and
  // offset, spreading them out instead of stacking on the same spot.
  const lineDL = (color, align, offset) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align, offset, textStrokeColor: bg, textStrokeWidth: 3 });
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'FY2026', data: d.fy26, borderColor: '#166534', tension: 0.3, borderWidth: 2.5, pointRadius: 2, fill: false, datalabels: lineDL('#166534', 'top', 4) },
        { label: 'FY2027', data: d.fy27act, borderColor: '#7c3aed', tension: 0.3, borderWidth: 2.5, pointRadius: 3, fill: false, datalabels: lineDL('#7c3aed', 'top', 16) },
        { label: planLabel, data: pd, borderColor: '#06b6d4', tension: 0.3, borderWidth: 2, pointRadius: 2, fill: false, datalabels: lineDL('#06b6d4', 'bottom', 4) },
        { label: 'ML Forecast', data: d.mlfc, borderColor: '#f59e0b', tension: 0.3, borderWidth: 2, pointRadius: 2, fill: false, datalabels: lineDL('#f59e0b', 'bottom', 16) },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP } },
  };
}

export function buildShipmentTrendStaticConfig(theme, curPeriod, fiscalYear) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const { bgCard: bg } = getColors(theme);
  // Actual and AOP track within a few points of each other throughout, so
  // one is labeled above its line and the other below to keep them legible.
  const lineDL = (color, align) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align, offset: 4, textStrokeColor: bg, textStrokeWidth: 3 });
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'Actual', data: [55,58,52,60,62,65,59,64], borderColor: '#3b82f6', tension: 0.4, fill: false, datalabels: lineDL('#3b82f6', 'top') },
        { label: 'AOP', data: [58,60,58,63,65,68,64,68], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false, datalabels: lineDL('#f59e0b', 'bottom') },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP } },
  };
}

// Offered vs total Tag Count (Web+Phone+Chat+Email combined) with the
// resulting Tags% on a secondary axis, matching the reference "Offered /
// Tag Count / Tags%" combo chart.
export function buildTagRouted2Config(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const valueLabels = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 2, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => scaleDisplayValue(v.toLocaleString()) };
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
          datalabels: { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => scaleDisplayValue(`${v}%`) },
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
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
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
            display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'start', align: 'end', offset: 6, textStrokeColor: bg, textStrokeWidth: 3,
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

export const SEGMENT_SOLD_DATA = {
  Consumer: [18, 19, 17, 20, 21, 22, 20, 21],
  Commercial: [22, 24, 22, 25, 26, 27, 24, 27],
  Enterprise: [15, 15, 13, 15, 15, 16, 15, 16],
};

// Same total volume per period as SEGMENT_SOLD_DATA, split by offering
// instead of segment, so the two toggle views stay on the same scale.
export const OFFERING_SOLD_DATA = {
  Pro: [16, 17, 15, 18, 19, 20, 18, 19],
  Premium: [14, 15, 13, 15, 16, 17, 15, 16],
  Basic: [17, 18, 16, 19, 19, 20, 18, 20],
  OOP: [8, 8, 8, 8, 8, 8, 8, 9],
};

const SOLD_VIEW_DATA = {
  segment: { data: SEGMENT_SOLD_DATA, colors: ['rgba(59,130,246,.6)', 'rgba(16,185,129,.6)', 'rgba(139,92,246,.6)'] },
  offering: { data: OFFERING_SOLD_DATA, colors: ['rgba(59,130,246,.6)', 'rgba(139,92,246,.6)', 'rgba(16,185,129,.6)', 'rgba(245,158,11,.6)'] },
};

// Total sold volume growth from the first to the last period (same for
// either view, since both split the same per-period totals).
export function segmentSoldGrowthPct() {
  const n = SEGMENT_SOLD_DATA.Consumer.length;
  const totalAt = (i) => SEGMENT_SOLD_DATA.Consumer[i] + SEGMENT_SOLD_DATA.Commercial[i] + SEGMENT_SOLD_DATA.Enterprise[i];
  const first = totalAt(0);
  const last = totalAt(n - 1);
  return Math.round(((last - first) / first) * 1000) / 10;
}

export function buildSegmentSoldConfig(theme, curPeriod, fiscalYear, view = 'segment') {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const { data, colors } = SOLD_VIEW_DATA[view] || SOLD_VIEW_DATA.segment;
  return {
    type: 'bar',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: Object.entries(data).map(([label, values], i) => ({
        label, data: values, backgroundColor: colors[i % colors.length], borderRadius: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
      },
      plugins: {
        legend: LP,
        datalabels: {
          display: true,
          // Segment backgrounds here are a fixed brand palette (not
          // theme-driven), so white text is chosen for contrast against
          // those specific colors, with a dark halo as insurance against
          // any lighter segment in the palette.
          color: '#fff',
          textStrokeColor: 'rgba(0,0,0,.45)',
          textStrokeWidth: 2,
          font: { size: 9, weight: 'bold' },
          anchor: 'center',
          align: 'center',
          formatter: (v, ctx) => {
            const total = ctx.chart.data.datasets.reduce((s, ds) => s + ds.data[ctx.dataIndex], 0);
            return total ? `${Math.round((v / total) * 100)}%` : '';
          },
        },
      },
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
  const { bgCard: bg } = getColors(theme);
  // ASU and Plan stay within 10-30 units of each other throughout, so one
  // labels above its line and the other below to avoid collisions.
  const lineDL = (color, align) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align, offset: 4, textStrokeColor: bg, textStrokeWidth: 3 });
  return {
    type: 'line',
    data: {
      labels: buildPeriodLabels(fiscalYear, curPeriod, 8),
      datasets: [
        { label: 'ASU', data: [1120,1135,1140,1150,1160,1175,1185,1200], borderColor: '#10b981', tension: 0.4, fill: false, datalabels: lineDL('#10b981', 'top') },
        { label: 'Plan', data: [1130,1145,1160,1175,1190,1200,1215,1230], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false, datalabels: lineDL('#f59e0b', 'bottom') },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP } },
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
function trendDatalabels(color, bg, n, align = 'top') {
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
    align,
    offset: 4,
    textStrokeColor: bg,
    textStrokeWidth: 3,
    formatter: (v) => (v == null ? '' : scaleDisplayValue(v.toLocaleString())),
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
      // Bottom-anchored (vs Actual's top) so the two don't collide during
      // the few overlapping points right at the cutover.
      datalabels: trendDatalabels(color, bg, n, 'bottom'),
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
      layout: TOP_LABEL_LAYOUT,
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
  // Lines get a lower `order` than the bars so Chart.js always draws them
  // last (on top) instead of letting them get buried behind the bar fills.
  const datasets = [
    { label: `${planYearLabel(d.periodA, d.year1)} DB`, data: d.aDb, backgroundColor: 'rgba(59,130,246,.45)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodA, d.year1)} OSP`, data: d.aOsp, backgroundColor: 'rgba(59,130,246,.85)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodB, d.year2)} DB`, data: d.bDb, backgroundColor: 'rgba(139,92,246,.45)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodB, d.year2)} OSP`, data: d.bOsp, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 3, order: 2 },
    {
      label: `${planYearLabel(d.periodA, d.year1)} Total Volume`, data: d.aTotal, type: 'line', yAxisID: 'y', order: 1,
      borderColor: '#3b82f6', pointRadius: 3, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: { display: false },
    },
    {
      label: `${planYearLabel(d.periodB, d.year2)} Total Volume`, data: d.bTotal, type: 'line', yAxisID: 'y', order: 1,
      borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: { display: false },
    },
  ];
  return {
    type: 'bar',
    data: { labels: d.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: { x: S.x, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildCapHcConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const { bgCard: bg } = getColors(theme);
  // The two Total HC lines track close together, so one labels above and
  // the other below instead of both defaulting to the same top anchor.
  const lineDL = (color, align) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align, offset: 4, textStrokeColor: bg, textStrokeWidth: 3 });
  const datasets = [
    { label: 'Avg HC', data: d.augHcAvg, backgroundColor: 'rgba(139,92,246,.6)', borderRadius: 3, order: 2 },
    { label: 'Exit HC', data: d.augHcExit, backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodA, d.year1)} Total HC`, data: d.aTotalHc, type: 'line', order: 1, borderColor: '#3b82f6', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: lineDL('#3b82f6', 'top') },
    { label: `${planYearLabel(d.periodB, d.year2)} Total HC`, data: d.bTotalHc, type: 'line', order: 1, borderColor: '#8b5cf6', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: lineDL('#8b5cf6', 'bottom') },
  ];
  return {
    type: 'bar',
    data: { labels: d.labels, datasets },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapExcessConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const { bgCard: bg } = getColors(theme);
  // The two LOA Exit lines track close together, so one labels above and
  // the other below instead of both defaulting to the same top anchor.
  const lineDL = (color, align) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align, offset: 4, textStrokeColor: bg, textStrokeWidth: 3 });
  const datasets = [
    { label: `${planYearLabel(d.periodA, d.year1)} Excess HC`, data: d.aExcessHc, backgroundColor: 'rgba(59,130,246,.55)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodB, d.year2)} Excess HC`, data: d.bExcessHc, backgroundColor: 'rgba(139,92,246,.7)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodA, d.year1)} LOA Exit`, data: d.aLoaExit, type: 'line', order: 1, borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: lineDL('#f59e0b', 'top') },
    { label: `${planYearLabel(d.periodB, d.year2)} LOA Exit`, data: d.bLoaExit, type: 'line', order: 1, borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: lineDL('#ef4444', 'bottom') },
    { label: `${planYearLabel(d.periodA, d.year1)} Training`, data: d.aTraining, type: 'line', order: 1, borderColor: '#8b5cf6', borderDash: [4, 3], pointRadius: 2, tension: 0.3, borderWidth: 1.5, fill: false, datalabels: { display: false } },
    { label: `${planYearLabel(d.periodB, d.year2)} Training`, data: d.bTraining, type: 'line', order: 1, borderColor: '#0ea5e9', borderDash: [4, 3], pointRadius: 2, tension: 0.3, borderWidth: 1.5, fill: false, datalabels: { display: false } },
  ];
  return {
    type: 'bar',
    data: { labels: d.labels, datasets },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapHiringConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const datasets = [
    { label: `${planYearLabel(d.periodA, d.year1)} (Old)`, data: d.aHiring, backgroundColor: 'rgba(59,130,246,.6)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodB, d.year2)} (New)`, data: d.bHiring, backgroundColor: 'rgba(139,92,246,.75)', borderRadius: 3, order: 2 },
    { label: `${planYearLabel(d.periodA, d.year1)} Total`, data: d.aHiring, type: 'line', order: 1, borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
    { label: `${planYearLabel(d.periodB, d.year2)} Total`, data: d.bHiring, type: 'line', order: 1, borderColor: '#7c3aed', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
  ];
  return {
    type: 'bar',
    data: { labels: d.labels, datasets },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

// Approved/Non-Approved/Total Hiring now follow Plan Name 1/Plan Name 2
// the same way Excess HC + LOA + Training does, instead of a fixed single
// breakdown.
export function buildCapHiringBreakdownConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const aTotal = d.aApproved.map((v, i) => v + d.aNonApproved[i]);
  const bTotal = d.bApproved.map((v, i) => v + d.bNonApproved[i]);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${planYearLabel(d.periodA, d.year1)} Approved`, data: d.aApproved, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 3, order: 2 },
        { label: `${planYearLabel(d.periodB, d.year2)} Approved`, data: d.bApproved, backgroundColor: 'rgba(139,92,246,.75)', borderRadius: 3, order: 2 },
        { label: `${planYearLabel(d.periodA, d.year1)} Non-Approved`, data: d.aNonApproved, backgroundColor: 'rgba(245,158,11,.8)', borderRadius: 3, order: 2 },
        { label: `${planYearLabel(d.periodB, d.year2)} Non-Approved`, data: d.bNonApproved, backgroundColor: 'rgba(16,185,129,.8)', borderRadius: 3, order: 2 },
        { label: `${planYearLabel(d.periodA, d.year1)} Total`, data: aTotal, type: 'line', order: 1, borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
        { label: `${planYearLabel(d.periodB, d.year2)} Total`, data: bTotal, type: 'line', order: 1, borderColor: '#0ea5e9', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildCapCapacityConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const pctDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') };
  const variance = d.aCapPct.map((v, i) => (v == null || d.bCapPct[i] == null ? null : Math.round(d.bCapPct[i] - v)));
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${planYearLabel(d.periodA, d.year1)} Cap%`, data: d.aCapPct, backgroundColor: 'rgba(59,130,246,.3)', borderRadius: 3, order: 2 },
        { label: `${planYearLabel(d.periodB, d.year2)} Cap%`, data: d.bCapPct, backgroundColor: 'rgba(59,130,246,.8)', borderRadius: 3, order: 2 },
        {
          label: `Variance (${planYearLabel(d.periodB, d.year2)} − ${planYearLabel(d.periodA, d.year1)})`, data: variance, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#f59e0b', borderDash: [4, 3], pointRadius: 2, tension: 0.3, borderWidth: 1.5, fill: false, datalabels: { display: false },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        y: { beginAtZero: true, max: 200, ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, title: { display: true, text: 'Capacity %', color: tc, font: { size: 9 } } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => v + 'pp' }, grid: { display: false }, title: { display: true, text: 'Variance', color: tc, font: { size: 9 } } },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: pctDL },
    },
  };
}

export function buildCapOspMixConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const pctDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${planYearLabel(d.periodA, d.year1)} OSP%`, data: d.aOspPct, backgroundColor: 'rgba(245,158,11,.5)', borderRadius: 3 },
        { label: `${planYearLabel(d.periodB, d.year2)} OSP%`, data: d.bOspPct, backgroundColor: 'rgba(16,185,129,.8)', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, title: { display: true, text: 'OSP Mix %', color: tc, font: { size: 9 } } },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: pctDL },
    },
  };
}

// Total HC (bar) + L1 HC Avg/L1 HC Exit (lines, left axis) + Excess HC
// (dashed line, right axis, red per-point labels) -- a standalone trend,
// not a Jul-vs-Aug comparison, so no planLabel() involved here. Clicking a
// bar/point is wired up by the caller (CapacityOverview's ChartCanvas
// onClick) to open the per-period detail modal.
// Total HC / L1 HC Avg / L1 HC Exit / Excess HC now follow Plan Name 1/Plan
// Name 2 the same way Excess HC + LOA + Training does -- every metric shows
// both plans (dynamically labeled via planLabel), not just one static line.
export function buildCapHeadcountBifurcationConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const totalHcDL = (color) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => v.toLocaleString() });
  const excessDL = (color) => ({ display: true, color, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'bottom', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => v.toLocaleString() });
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${planYearLabel(d.periodA, d.year1)} Total HC`, data: d.aTotalHc, backgroundColor: 'rgba(59,130,246,.25)', borderRadius: 3, yAxisID: 'y', order: 2, datalabels: totalHcDL(tp) },
        { label: `${planYearLabel(d.periodB, d.year2)} Total HC`, data: d.bTotalHc, backgroundColor: 'rgba(139,92,246,.3)', borderRadius: 3, yAxisID: 'y', order: 2, datalabels: totalHcDL(tp) },
        {
          label: `${planYearLabel(d.periodA, d.year1)} L1 HC Avg`, data: d.aL1HcAvg, type: 'line', yAxisID: 'y', order: 1,
          borderColor: '#2563eb', backgroundColor: '#2563eb', pointRadius: 3, pointStyle: 'circle', tension: 0.25, borderWidth: 2, fill: false, datalabels: { display: false },
        },
        {
          label: `${planYearLabel(d.periodB, d.year2)} L1 HC Avg`, data: d.bL1HcAvg, type: 'line', yAxisID: 'y', order: 1,
          borderColor: '#7c3aed', backgroundColor: '#7c3aed', pointRadius: 3, pointStyle: 'circle', tension: 0.25, borderWidth: 2, fill: false, datalabels: { display: false },
        },
        {
          label: `${planYearLabel(d.periodA, d.year1)} L1 HC Exit`, data: d.aL1HcExit, type: 'line', yAxisID: 'y', order: 1,
          borderColor: '#16a34a', backgroundColor: '#16a34a', borderDash: [6, 3], pointRadius: 3, pointStyle: 'rect', tension: 0.25, borderWidth: 2, fill: false, datalabels: { display: false },
        },
        {
          label: `${planYearLabel(d.periodB, d.year2)} L1 HC Exit`, data: d.bL1HcExit, type: 'line', yAxisID: 'y', order: 1,
          borderColor: '#0d9488', backgroundColor: '#0d9488', borderDash: [6, 3], pointRadius: 3, pointStyle: 'rect', tension: 0.25, borderWidth: 2, fill: false, datalabels: { display: false },
        },
        {
          label: `${planYearLabel(d.periodA, d.year1)} Excess HC`, data: d.aExcessHc, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#ef4444', backgroundColor: '#ef4444', borderDash: [2, 2], pointRadius: 3, pointStyle: 'rectRot', tension: 0.25, borderWidth: 1.5, fill: false, datalabels: excessDL('#ef4444'),
        },
        {
          label: `${planYearLabel(d.periodB, d.year2)} Excess HC`, data: d.bExcessHc, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderDash: [2, 2], pointRadius: 3, pointStyle: 'rectRot', tension: 0.25, borderWidth: 1.5, fill: false, datalabels: excessDL('#f59e0b'),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: TOP_LABEL_LAYOUT,
      scales: {
        y: {
          beginAtZero: true, ticks: { color: tc, font: { size: 9 }, callback: (v) => v.toLocaleString() }, grid: { color: gc },
          title: { display: true, text: 'Headcount (Total / L1 Avg / L1 Exit)', color: tc, font: { size: 9 } },
        },
        y1: {
          position: 'right', beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { display: false },
          title: { display: true, text: 'Excess HC Scale', color: tc, font: { size: 9 } },
        },
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP },
    },
  };
}

// HC Avg/Exit PoP% render as bars on the left axis; DB/OSP/Total Volume
// PoP% stay lines but move to a right-side axis, so the two families of
// %s (headcount vs volume) aren't fighting for the same scale.
export function buildCapPopConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const PDL = dataLabelsPercent(theme);
  // PDL's align:'top' is an absolute screen direction, which works for line
  // points but pins a negative bar's label to the 0-line (its base) instead
  // of near its tip, crowding every bar's label into one row and clipping
  // them. align:'end' is bar-direction-aware -- it follows the bar outward
  // from its tip whichever way that is, so these two don't collide.
  const negBarDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'end', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') };
  // Three lines sharing PDL's identical top anchor would stack their labels
  // on top of each other -- each gets its own color and a distinct
  // align/offset instead.
  const volLineDL = (color, align, offset) => ({ ...PDL, color, align, offset });
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'HC Avg PoP%', data: d.hcAvgPop, backgroundColor: 'rgba(139,92,246,.6)', borderRadius: 3, yAxisID: 'y', order: 2, datalabels: negBarDL },
        { label: 'HC Exit PoP%', data: d.hcExitPop, backgroundColor: 'rgba(6,182,212,.6)', borderRadius: 3, yAxisID: 'y', order: 2, datalabels: negBarDL },
        {
          label: 'DB Vol PoP%', data: d.dbVolPop, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#ef4444', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: volLineDL('#ef4444', 'top', 4),
        },
        {
          label: 'OSP Vol PoP%', data: d.ospVolPop, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#f59e0b', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: volLineDL('#f59e0b', 'bottom', 4),
        },
        {
          label: 'Total Vol PoP%', data: d.totalVolPop, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: '#3b82f6', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false, datalabels: volLineDL('#3b82f6', 'top', 16),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 16, bottom: 16 } },
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
        y: {
          ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc },
          title: { display: true, text: 'HC PoP%', color: tc, font: { size: 9 } },
        },
        y1: {
          position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false },
          title: { display: true, text: 'Volume PoP%', color: tc, font: { size: 9 } },
        },
      },
      plugins: { legend: LP },
    },
  };
}

// ===== Capacity Overview New (Workforce Planning Dashboard port) =====
// Same theme/helpers as every chart above (getColors/baseScales/legendPos/
// dataLabelsDefault) instead of the reference HTML's own fixed dark-navy
// palette, so this page renders like the rest of Capacity Overview in both
// light and dark mode.

export function buildWpdVolumeConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, bgCard: bg, textPrimary: tp } = getColors(theme);
  const LP = legendPos(theme);
  // aTotal is always the Current Plan and bTotal the Previous Plan, so this
  // reads as Current minus Previous, relative to Previous.
  const delta = d.aTotal.map((v, i) => (d.bTotal[i] ? Math.round((v - d.bTotal[i]) / d.bTotal[i] * 1000) / 10 : null));
  // Explicit headroom above the tallest Total bar so its top data label
  // never gets clipped by the chart's top edge.
  const rawMax = Math.max(...d.aTotal, ...d.bTotal);
  const yMax = Math.ceil((rawMax * 1.15) / 1e5) * 1e5;
  const totalFmt = (v) => (v == null ? '' : scaleByRelativePercent((v / 1e6).toFixed(2) + 'M', 15));
  const segDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 2, textStrokeColor: bg, textStrokeWidth: 3 };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${d.pA} DB`, data: d.aDb, backgroundColor: 'rgba(59,130,246,.45)', borderRadius: 3, stack: 'a', order: 2, datalabels: segDL },
        { label: `${d.pA} OSP`, data: d.aOsp, backgroundColor: 'rgba(59,130,246,.85)', borderRadius: 3, stack: 'a', order: 2, datalabels: segDL },
        // Total gets its own stack group -- not summed into the DB+OSP bar --
        // so it renders as its own full-height bar right next to it.
        { label: `${d.pA} Total`, data: d.aTotal, backgroundColor: '#10b981', borderRadius: 3, stack: 'a-total', order: 2, datalabels: { ...segDL, color: '#10b981', formatter: totalFmt } },
        { label: `${d.pB} DB`, data: d.bDb, backgroundColor: 'rgba(139,92,246,.45)', borderRadius: 3, stack: 'b', order: 2, datalabels: segDL },
        { label: `${d.pB} OSP`, data: d.bOsp, backgroundColor: 'rgba(139,92,246,.85)', borderRadius: 3, stack: 'b', order: 2, datalabels: segDL },
        { label: `${d.pB} Total`, data: d.bTotal, backgroundColor: '#f59e0b', borderRadius: 3, stack: 'b-total', order: 2, datalabels: { ...segDL, color: '#f59e0b', formatter: totalFmt } },
        {
          // Lower order than every bar so the PoP% line always draws on top.
          label: 'PoP Δ%', data: delta, type: 'line', yAxisID: 'y1', order: 1, borderColor: '#8b5cf6', pointBackgroundColor: '#8b5cf6', borderDash: [3, 3], pointRadius: 4, tension: 0.3, borderWidth: 2, fill: false,
          datalabels: { display: true, color: '#8b5cf6', font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') },
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false }, stacked: true },
        y: { min: 0, max: yMax, ticks: { color: tc, font: { size: 9 }, callback: (v) => (v / 1e6).toFixed(1) + 'M' }, grid: { color: gc }, stacked: true },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => Number(v.toFixed(2)) + '%' }, grid: { display: false } },
      },
      plugins: { legend: LP },
    },
  };
}

export function buildWpdHcConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, textPrimary: tp, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const barDL = { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 2, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => scaleByRelativePercent(v.toLocaleString(), 15) };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${d.pA} HC`, data: d.aHcAvg, backgroundColor: '#38bdf8', borderRadius: 3, order: 2, datalabels: barDL },
        { label: `${d.pB} HC`, data: d.bHcAvg, backgroundColor: '#1e3a8a', borderRadius: 3, order: 2, datalabels: barDL },
        {
          // Lower order than the bars so the line (and its points/labels)
          // always draws on top of them instead of getting buried behind.
          label: 'L1 HC Exit', data: d.bHcExitPop, type: 'line', yAxisID: 'y1', order: 1, borderColor: '#f59e0b', backgroundColor: '#f59e0b', pointBackgroundColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2.5,
          datalabels: { display: true, color: '#f59e0b', font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => (v == null ? '' : v + '%') },
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
        y: { min: 0, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, title: { display: true, text: 'HC Count', color: tc, font: { size: 9 } } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false } },
      },
      plugins: { legend: LP },
    },
  };
}

export function buildWpdCapHireConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const DL = capDataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${d.pA} Hiring`, data: d.aHiring, backgroundColor: 'rgba(16,185,129,.6)', borderRadius: 3, yAxisID: 'y1', order: 2 },
        { label: `${d.pB} Hiring`, data: d.bHiring, backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 3, yAxisID: 'y1', order: 2 },
        { label: `${d.pA} Cap%`, data: d.aCap, type: 'line', yAxisID: 'y', order: 1, borderColor: '#3b82f6', pointRadius: 3, tension: 0.3, borderWidth: 2.5, datalabels: { color: '#3b82f6', anchor: 'end', align: 'top', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => scaleByRelativePercent(`${v}%`, 15) } },
        { label: `${d.pB} Cap%`, data: d.bCap, type: 'line', yAxisID: 'y', order: 1, borderColor: '#f59e0b', borderDash: [6, 3], pointRadius: 3, tension: 0.3, borderWidth: 2.5, datalabels: { color: '#f59e0b', anchor: 'end', align: 'bottom', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: (v) => scaleByRelativePercent(`${v}%`, 15) } },
        { label: '100% baseline', data: d.aCap.map(() => 100), type: 'line', yAxisID: 'y', order: 1, borderColor: 'rgba(239,68,68,.3)', borderWidth: 2, borderDash: [10, 5], pointRadius: 0, datalabels: { display: false } },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
        y: { min: 90, max: 135, ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}

export function buildWpdHireExitConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc, bgCard: bg } = getColors(theme);
  const LP = legendPos(theme);
  const DL = capDataLabelsDefault(theme);
  const capNumFmt = (v) => scaleByRelativePercent(v.toLocaleString(), 15);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: `${d.pA} Overall`, data: d.aHiring, backgroundColor: 'rgba(16,185,129,.7)', borderRadius: 3, order: 2 },
        { label: `${d.pB} Overall`, data: d.bHiring, backgroundColor: 'rgba(6,182,212,.7)', borderRadius: 3, order: 2 },
        { label: `${d.pA} UR`, data: d.aUrHire, backgroundColor: 'rgba(59,130,246,.5)', borderRadius: 3, order: 2 },
        { label: `${d.pB} UR`, data: d.bUrHire, backgroundColor: 'rgba(139,92,246,.5)', borderRadius: 3, order: 2 },
        {
          label: 'LOA Exit', data: d.bLoa, type: 'line', order: 1, borderColor: '#f59e0b', pointRadius: 3, tension: 0.3, borderWidth: 2, yAxisID: 'y1',
          datalabels: { display: true, color: '#f59e0b', font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'top', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: capNumFmt },
        },
        {
          label: 'Training Exit', data: d.bTraining, type: 'line', order: 1, borderColor: '#ef4444', borderDash: [6, 3], pointRadius: 3, tension: 0.3, borderWidth: 2, yAxisID: 'y1',
          datalabels: { display: true, color: '#ef4444', font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'bottom', offset: 6, textStrokeColor: bg, textStrokeWidth: 3, formatter: capNumFmt },
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
        y1: { position: 'right', ticks: { color: tc, font: { size: 9 } }, grid: { display: false } },
      },
      plugins: { legend: LP, datalabels: DL },
    },
  };
}
