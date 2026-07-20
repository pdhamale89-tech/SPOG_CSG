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
  return { position: 'bottom', align: 'center', labels: { color: tc, font: { size: 9 }, usePointStyle: true, pointStyle: 'circle', padding: 5 } };
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
        { label: 'Attainment%', data: att, borderColor: '#f59e0b', tension: 0.4, fill: false, yAxisID: 'y1', pointRadius: 3, borderWidth: 2 },
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

export function buildCapacityTrendConfig(d, theme) {
  const S = baseScales(theme);
  const LP = legendPos(theme);
  const DL = dataLabelsDefault(theme);
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Available', data: d.capAv, borderColor: '#10b981', tension: 0.4, fill: false },
        { label: 'Allocated', data: d.capAl, borderColor: '#3b82f6', tension: 0.4, fill: false },
        { label: 'Demand', data: d.capDm, borderColor: '#ef4444', borderDash: [5, 3], tension: 0.4, fill: false },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, layout: TOP_LABEL_LAYOUT, scales: S, plugins: { legend: LP, datalabels: DL } },
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
