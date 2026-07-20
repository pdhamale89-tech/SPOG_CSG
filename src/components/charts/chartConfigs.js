import { M8, FM, uppData, drillData, drillLabels } from '../../data/forecastData';
import { getColors } from '../../theme/colors';

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
const TOP_LABEL_LAYOUT = { padding: { top: 16 } };

export function buildCallVolumeConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const att = d.handled.map((h, i) => Math.round((h / d.offered[i]) * 100));
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Offered', data: d.offered, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,.08)', tension: 0.4 },
        { label: 'Handled', data: d.handled, borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,.08)', tension: 0.4 },
        { label: 'Abandonment%', data: d.abandon, borderColor: '#ef4444', borderDash: [5, 3], tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 4, borderWidth: 2.5 },
        { label: 'Offered%', data: att, borderColor: '#f59e0b', tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 3, borderWidth: 2 },
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

export function buildChannelMixConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Voice', data: d.voice, backgroundColor: '#3b82f6' },
        { label: 'Chat', data: d.chat, backgroundColor: '#10b981' },
        { label: 'Email', data: d.email, backgroundColor: '#f59e0b' },
        { label: 'Social', data: d.social, backgroundColor: '#8b5cf6' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gc }, stacked: true },
      },
      plugins: { legend: LP, datalabels: { display: true, color: '#fff', font: { size: 8, weight: 'bold' }, anchor: 'center', formatter: (v) => (v > 10 ? v + '%' : '') } },
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

export function buildPartnerConfig(d, theme) {
  const S = baseScales(theme);
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const pct = d.partActual.map((a, i) => (d.partForecast[i] ? Math.round((a / d.partForecast[i]) * 100) : 0));
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Actual', data: d.partActual, backgroundColor: 'rgba(59,130,246,.7)', borderRadius: 3, order: 2 },
        { label: 'Forecast', data: d.partForecast, backgroundColor: 'rgba(139,92,246,.5)', borderRadius: 3, order: 3 },
        { label: 'Actual/Forecast %', data: pct, type: 'line', borderColor: '#10b981', borderWidth: 2.5, pointRadius: 4, fill: false, yAxisID: 'y1', order: 1 },
        { label: '80% Threshold', data: d.labels.map(() => 80), type: 'line', borderColor: '#ef4444', borderDash: [6, 3], borderWidth: 2, pointRadius: 0, fill: false, yAxisID: 'y1', order: 0 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; },
      scales: { x: S.x, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } }, y1: { position: 'right', ticks: { color: '#ef4444', font: { size: 9 }, callback: (v) => v + '%' }, grid: { display: false }, min: 40, max: 120 } },
      plugins: { legend: LP, datalabels: { display: false } },
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
        { label: 'Linear', data: d.linTr, borderColor: '#9ca3af', borderDash: [4, 4], tension: 0, borderWidth: 1.5, pointRadius: 0, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildShipmentTrendStaticConfig(theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: M8,
      datasets: [
        { label: 'Actual', data: [55,58,52,60,62,65,59,64], borderColor: '#3b82f6', tension: 0.4, fill: false },
        { label: 'AOP', data: [58,60,58,63,65,68,64,68], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildTagRoutedConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Web', data: d.tagWeb, backgroundColor: 'rgba(59,130,246,.75)', borderRadius: 2 },
        { label: 'Phone', data: d.tagPhone, backgroundColor: 'rgba(139,92,246,.75)', borderRadius: 2 },
        { label: 'Chat', data: d.tagChat, backgroundColor: 'rgba(245,158,11,.75)', borderRadius: 2 },
        { label: 'Email', data: d.tagEmail, backgroundColor: 'rgba(16,185,129,.75)', borderRadius: 2 },
        { label: 'Social', data: d.tagSocial, backgroundColor: 'rgba(239,68,68,.75)', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc } } },
      plugins: { legend: LP, datalabels: { display: false } },
    },
  };
}

export function buildExpiryConfig(d, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Expiring', data: d.expAssets, backgroundColor: 'rgba(239,68,68,.75)' },
        { label: 'Shipped', data: d.expShipped, backgroundColor: 'rgba(245,158,11,.75)' },
        { label: 'Tech ASUs', data: d.expASU, backgroundColor: 'rgba(16,185,129,.75)' },
        { label: 'Forecast', data: d.expFcASU, backgroundColor: 'rgba(59,130,246,.75)' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tc, font: { size: 9 } }, grid: { color: gc }, stacked: true },
        y: { ticks: { color: tc, font: { size: 9 }, callback: fK }, grid: { color: gc }, stacked: true },
      },
      plugins: { legend: LP, datalabels: { display: false } },
    },
  };
}

export function buildShipUppConfig(region, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const ud = uppData[region] || uppData.Global;
  return {
    type: 'bar',
    data: {
      labels: FM,
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

export function buildShipDrillConfig(region, level, offering, theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  const dd = drillData[region] || drillData.Global;
  const key = level === 'overall' ? 'overall' : offering;
  const sd = dd[key] || dd.overall;
  return {
    type: 'line',
    data: {
      labels: drillLabels,
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

export function buildSegmentSoldConfig(theme) {
  const { textSecondary: tc, gridColor: gc } = getColors(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: M8,
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

export function buildProductTrendConfig(theme) {
  const { textSecondary: tc, textPrimary: tp, bgCard: bg } = getColors(theme);
  return {
    type: 'bar',
    data: {
      labels: M8,
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

export function buildAsuTrendConfig(theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: M8,
      datasets: [
        { label: 'ASU', data: [1120,1135,1140,1150,1160,1175,1185,1200], borderColor: '#10b981', tension: 0.4, fill: false },
        { label: 'Plan', data: [1130,1145,1160,1175,1190,1200,1215,1230], borderColor: '#f59e0b', borderDash: [5, 3], tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildAsuCpasuConfig(theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: M8,
      datasets: [
        { label: 'ASU', data: [1120,1135,1140,1150,1160,1175,1185,1200], borderColor: '#3b82f6', tension: 0.4, fill: false },
        { label: 'CPASU', data: [980,990,995,1005,1015,1030,1040,1055], borderColor: '#8b5cf6', tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildAsuAcqExitConfig(theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'bar',
    data: {
      labels: M8,
      datasets: [
        { label: 'New', data: [18,22,15,20,24,19,21,25], backgroundColor: 'rgba(16,185,129,.7)', borderRadius: 2 },
        { label: 'Exit', data: [-12,-14,-10,-13,-15,-11,-14,-13], backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 2 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
  };
}

export function buildAsuLifecycleConfig(theme) {
  const S = baseScales(theme);
  const { textPrimary: tp } = getColors(theme);
  return {
    type: 'bar',
    data: { labels: ['Activated', 'Active', 'Retained', 'Renewed'], datasets: [{ data: [280,1200,950,820], backgroundColor: ['rgba(59,130,246,.7)', 'rgba(16,185,129,.7)', 'rgba(139,92,246,.7)', 'rgba(245,158,11,.7)'], borderRadius: 5 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      layout: { padding: { right: 24 } },
      scales: S,
      plugins: { legend: { display: false }, datalabels: { display: true, color: tp, font: { size: 9, weight: 'bold' }, anchor: 'end', align: 'right', formatter: (v) => v + 'K' } },
    },
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
        { label: 'Demand Fcst', data: d.demandFcst, borderColor: '#10b981', borderDash: [6, 3], tension: 0.3, pointRadius: 2, borderWidth: 2, fill: false, datalabels: { display: false } },
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
  const { textPrimary: tp, bgCard: bg } = getColors(theme);
  const stackDL = { display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0, color: tp, font: { size: 8, weight: 'bold' }, textStrokeColor: bg, textStrokeWidth: 2 };
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Jul Approved', data: d.julApproved, backgroundColor: 'rgba(59,130,246,.45)', stack: 'jul', borderRadius: 2 },
        { label: 'Jul UR Hiring', data: d.julUrHiring, backgroundColor: 'rgba(59,130,246,.85)', stack: 'jul', borderRadius: 2 },
        { label: 'Jul Non-Approved', data: d.julNonApproved, backgroundColor: 'rgba(245,158,11,.8)', stack: 'jul', borderRadius: 2 },
        { label: 'Aug UR Hiring', data: d.augUrHiring, backgroundColor: 'rgba(139,92,246,.85)', stack: 'aug', borderRadius: 2 },
        { label: 'Jul Overall', data: d.julOverall, type: 'line', borderColor: '#ef4444', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
        { label: 'Aug Overall', data: d.augOverall, type: 'line', borderColor: '#7c3aed', pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false, datalabels: { display: false } },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: S, plugins: { legend: LP, datalabels: stackDL } },
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
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'DB Vol PoP%', data: d.dbVolPop, borderColor: '#ef4444', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false },
        { label: 'OSP Vol PoP%', data: d.ospVolPop, borderColor: '#f59e0b', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false },
        { label: 'Total Vol PoP%', data: d.totalVolPop, borderColor: '#3b82f6', pointRadius: 4, tension: 0.3, borderWidth: 2.5, fill: false },
        { label: 'HC Avg PoP%', data: d.hcAvgPop, borderColor: '#8b5cf6', borderDash: [5, 3], pointRadius: 3, tension: 0.3, borderWidth: 2, fill: false },
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

export function buildBiasConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Over', data: d.labels.map((_, i) => Math.max(0, d.bias[i] * -0.5)), backgroundColor: 'rgba(59,130,246,.6)', borderRadius: 2 },
        { label: 'Under', data: d.labels.map((_, i) => Math.abs(Math.min(0, d.bias[i]))), backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 2 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: S, plugins: { legend: LP, datalabels: { display: false } } },
  };
}

export function buildStabilityConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Stability', data: [85,82,78,72,68,65,62,64], borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.1)', fill: true, tension: 0.4 },
        { label: 'Threshold', data: d.labels.map(() => 70), borderColor: '#ef4444', borderDash: [5, 3], pointRadius: 0, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: S, plugins: { legend: LP, datalabels: { display: false } } },
  };
}

export function buildDriftConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Drift%', data: [8,10,13,16,18,20,22,19], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', fill: true, tension: 0.4 },
        { label: 'Baseline', data: d.labels.map(() => 8), borderColor: '#10b981', borderDash: [5, 3], pointRadius: 0, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: S, plugins: { legend: LP, datalabels: { display: false } } },
  };
}
