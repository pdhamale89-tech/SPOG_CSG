import { useEffect, useRef, useState } from 'react';
import { Chart } from '../charts/chartSetup';
import { MONTHS, MONTH_LABELS, YRS, QL, VOL, HC, COMMENTS } from '../../data/capacityOverviewNewData';
import './capacityOverviewNew.css';

// Direct port of the standalone Workforce Planning Dashboard HTML -- same
// Plan A/Plan B (by month) x Fiscal Year comparison, same 4 charts, same
// tabbed Detailed Data Explorer with comparison cards + expandable tables.
// See capacityOverviewNew.css for why every class name is wpd-prefixed.

const GC = 'rgba(148,163,184,.08)';
const fmt = (n) => (n != null && n !== 0 ? n.toLocaleString() : '—');
const fmtM = (n) => (n != null ? (n / 1e6).toFixed(2) + 'M' : '—');
const fmtK = (n) => (n != null ? (n / 1e3).toFixed(0) + 'K' : '—');
const sum = (a) => a.reduce((s, v) => s + (v || 0), 0);
const pct = (a, b) => (a && b ? Number(((b - a) / Math.abs(a) * 100).toFixed(1)) : null);
const dCls = (d) => (d > 0 ? 'up' : d < 0 ? 'down' : 'flat');
const dlO = (c = '#cbd5e1', sz = 9, an = 'end', al = 'top') => ({
  display: true, color: c, font: { size: sz, weight: '600' }, anchor: an, align: al,
  formatter: (v) => (v != null ? (v >= 1e5 ? fmtK(v) : v.toLocaleString()) : ''),
  clamp: true, clip: false,
});
const dlH = { display: false };

function buildVolumeConfig(vA, vB, pA, pB) {
  const delta = vA.Total.map((v, i) => (vB.Total[i] && v ? parseFloat(((vB.Total[i] - v) / v * 100).toFixed(1)) : null));
  return {
    type: 'bar',
    data: {
      labels: QL,
      datasets: [
        { label: `DB — ${pA}`, data: vA.DB, backgroundColor: 'rgba(59,130,246,.65)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 5, stack: 'a', datalabels: dlO('#93c5fd', 8.5) },
        { label: `OSP — ${pA}`, data: vA.OSP, backgroundColor: 'rgba(139,92,246,.65)', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 5, stack: 'a', datalabels: dlO('#c4b5fd', 8.5) },
        { label: `DB — ${pB}`, data: vB.DB, backgroundColor: 'rgba(6,182,212,.65)', borderColor: '#06b6d4', borderWidth: 1, borderRadius: 5, stack: 'b', datalabels: dlO('#67e8f9', 8.5) },
        { label: `OSP — ${pB}`, data: vB.OSP, backgroundColor: 'rgba(245,158,11,.65)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 5, stack: 'b', datalabels: dlO('#fde68a', 8.5) },
        { label: `Total — ${pA}`, data: vA.Total, type: 'line', borderColor: '#10b981', pointBackgroundColor: '#10b981', pointRadius: 7, borderWidth: 3, tension: 0.3, fill: false, datalabels: dlO('#6ee7b7', 10.5) },
        { label: `Total — ${pB}`, data: vB.Total, type: 'line', borderColor: '#fbbf24', pointBackgroundColor: '#fbbf24', pointRadius: 7, borderWidth: 3, tension: 0.3, borderDash: [6, 3], fill: false, datalabels: dlO('#fde68a', 10.5, 'start', 'bottom') },
        {
          label: 'PoP Δ%', data: delta, type: 'line', borderColor: '#a78bfa', pointBackgroundColor: '#a78bfa', pointRadius: 8, borderWidth: 2, tension: 0.3, borderDash: [3, 3], fill: false, yAxisID: 'y1',
          datalabels: { display: true, color: '#e9d5ff', font: { size: 11, weight: '800' }, formatter: (v) => (v != null ? v + '%' : ''), backgroundColor: 'rgba(139,92,246,.25)', borderRadius: 4, padding: 4 },
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', font: { size: 10 } } } },
      scales: {
        x: { grid: { color: GC }, stacked: true },
        y: { grid: { color: GC }, stacked: true, ticks: { callback: (v) => (v / 1e6).toFixed(1) + 'M' }, position: 'left' },
        y1: { grid: { display: false }, position: 'right', ticks: { callback: (v) => v + '%', color: '#a78bfa' } },
      },
    },
  };
}

function buildHcConfig(hA, hB, pA, pB) {
  return {
    type: 'line',
    data: {
      labels: QL,
      datasets: [
        { label: `HC Avg — ${pA}`, data: hA.HC_Avg, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.08)', fill: true, tension: 0.4, pointRadius: 6, borderWidth: 2.5, pointBackgroundColor: '#3b82f6', datalabels: dlO('#93c5fd', 9) },
        { label: `HC Avg — ${pB}`, data: hB.HC_Avg, borderColor: '#06b6d4', fill: false, tension: 0.4, pointRadius: 6, borderWidth: 2.5, borderDash: [6, 3], pointBackgroundColor: '#06b6d4', datalabels: dlO('#67e8f9', 9, 'start', 'bottom') },
        { label: `HC Exit — ${pA}`, data: hA.HC_Exit, borderColor: '#f59e0b', fill: false, tension: 0.4, pointRadius: 5, borderWidth: 2, pointBackgroundColor: '#f59e0b', datalabels: dlH },
        { label: `HC Exit — ${pB}`, data: hB.HC_Exit, borderColor: '#ef4444', fill: false, tension: 0.4, pointRadius: 5, borderWidth: 2, borderDash: [6, 3], pointBackgroundColor: '#ef4444', datalabels: dlH },
        { label: `Excess HC — ${pB}`, data: hB.Excess_HC, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,.12)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2, pointBackgroundColor: '#a78bfa', yAxisID: 'y1', datalabels: dlO('#c4b5fd', 9) },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 9.5 } } } },
      scales: {
        x: { grid: { color: GC } },
        y: { grid: { color: GC }, position: 'left', title: { display: true, text: 'HC Count', color: '#64748b' } },
        y1: { grid: { display: false }, position: 'right', title: { display: true, text: 'Excess HC', color: '#a78bfa' }, ticks: { color: '#a78bfa' } },
      },
    },
  };
}

function buildCapHireConfig(hA, hB, pA, pB) {
  return {
    type: 'bar',
    data: {
      labels: QL,
      datasets: [
        { label: `Hiring — ${pA}`, data: hA.Hiring, backgroundColor: 'rgba(16,185,129,.6)', borderColor: '#10b981', borderWidth: 1, borderRadius: 5, yAxisID: 'y1', datalabels: dlO('#6ee7b7', 9.5) },
        { label: `Hiring — ${pB}`, data: hB.Hiring, backgroundColor: 'rgba(239,68,68,.6)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 5, yAxisID: 'y1', datalabels: dlO('#fca5a5', 9.5) },
        { label: `Cap% — ${pA}`, data: hA.Excess_Cap, type: 'line', borderColor: '#3b82f6', pointBackgroundColor: '#3b82f6', pointRadius: 6, borderWidth: 3, tension: 0.4, yAxisID: 'y', datalabels: { display: true, color: '#93c5fd', font: { size: 10, weight: '700' }, formatter: (v) => v + '%', anchor: 'end', align: 'top' } },
        { label: `Cap% — ${pB}`, data: hB.Excess_Cap, type: 'line', borderColor: '#f59e0b', pointBackgroundColor: '#f59e0b', pointRadius: 6, borderWidth: 3, tension: 0.4, borderDash: [6, 3], yAxisID: 'y', datalabels: { display: true, color: '#fde68a', font: { size: 10, weight: '700' }, formatter: (v) => v + '%', anchor: 'start', align: 'bottom' } },
        { label: '100%', data: [100, 100, 100, 100], type: 'line', borderColor: 'rgba(239,68,68,.3)', borderWidth: 2, borderDash: [10, 5], pointRadius: 0, yAxisID: 'y', datalabels: dlH },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', font: { size: 9.5 } } } },
      scales: {
        x: { grid: { color: GC } },
        y: { grid: { color: GC }, position: 'left', min: 90, max: 135, ticks: { callback: (v) => v + '%' } },
        y1: { grid: { display: false }, position: 'right', ticks: { color: '#10b981' } },
      },
    },
  };
}

function buildHireExitConfig(hA, hB, pA, pB) {
  return {
    type: 'bar',
    data: {
      labels: QL,
      datasets: [
        { label: `Overall — ${pA}`, data: hA.Hiring, backgroundColor: 'rgba(16,185,129,.7)', borderColor: '#10b981', borderWidth: 1, borderRadius: 5, datalabels: dlO('#6ee7b7', 10) },
        { label: `Overall — ${pB}`, data: hB.Hiring, backgroundColor: 'rgba(6,182,212,.7)', borderColor: '#06b6d4', borderWidth: 1, borderRadius: 5, datalabels: dlO('#67e8f9', 10) },
        { label: `UR — ${pA}`, data: hA.UR_Hire, backgroundColor: 'rgba(59,130,246,.5)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 5, datalabels: dlO('#93c5fd', 8.5) },
        { label: `UR — ${pB}`, data: hB.UR_Hire, backgroundColor: 'rgba(139,92,246,.5)', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 5, datalabels: dlO('#c4b5fd', 8.5) },
        { label: 'LOA Exit', data: hB.LOA, type: 'line', borderColor: '#fbbf24', pointBackgroundColor: '#fbbf24', pointRadius: 6, borderWidth: 2.5, tension: 0.3, yAxisID: 'y1', datalabels: { display: true, color: '#fde68a', font: { size: 10, weight: '700' }, anchor: 'end', align: 'top' } },
        { label: 'Training Exit', data: hB.Training, type: 'line', borderColor: '#f87171', pointBackgroundColor: '#f87171', pointRadius: 6, borderWidth: 2.5, tension: 0.3, borderDash: [6, 3], yAxisID: 'y1', datalabels: { display: true, color: '#fca5a5', font: { size: 10, weight: '700' }, anchor: 'start', align: 'bottom' } },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', font: { size: 10 } } } },
      scales: {
        x: { grid: { color: GC } },
        y: { grid: { color: GC }, position: 'left' },
        y1: { grid: { display: false }, position: 'right', ticks: { color: '#fbbf24' } },
      },
    },
  };
}

function CompCard({ title, arrA, arrB, formatFn = fmt, suffix = '' }) {
  const totA = sum(arrA), totB = sum(arrB);
  const d = totB - totA;
  const dp = totA ? Number(((d / Math.abs(totA)) * 100).toFixed(1)) : 0;
  const maxVal = Math.max(...arrA, ...arrB) || 1;
  return (
    <div className="wpd-comp-card">
      <div className="wpd-comp-card-header">
        <span className="wpd-comp-card-title">{title}</span>
        <span className={`wpd-comp-card-badge ${dCls(d)}`}>{d > 0 ? '▲' : '▼'} {Math.abs(dp)}%</span>
      </div>
      <div className="wpd-comp-card-values">
        <div className="wpd-comp-val-block plan-a">
          <div className="wpd-comp-val-label">Plan A</div>
          <div className="wpd-comp-val-num">{formatFn(totA)}{suffix}</div>
        </div>
        <span className="wpd-comp-arrow">→</span>
        <div className="wpd-comp-val-block plan-b">
          <div className="wpd-comp-val-label">Plan B</div>
          <div className="wpd-comp-val-num">{formatFn(totB)}{suffix}</div>
        </div>
      </div>
      <div className="wpd-q-bars">
        {QL.map((q, i) => {
          const barA = Math.max(5, (arrA[i] / maxVal) * 28);
          const barB = Math.max(5, (arrB[i] / maxVal) * 28);
          const qd = arrB[i] - arrA[i];
          const qdCls = qd > 0 ? 'wpd-cell-up' : qd < 0 ? 'wpd-cell-down' : 'wpd-cell-neutral';
          return (
            <div className="wpd-q-bar-group" key={q}>
              <div className="wpd-q-bar-label">{q}</div>
              <div className="wpd-q-bar-wrap">
                <div className="wpd-q-bar a" style={{ height: barA }} />
                <div className="wpd-q-bar b" style={{ height: barB }} />
              </div>
              <div className="wpd-q-bar-val">{formatFn(arrA[i])}{suffix}</div>
              <div className="wpd-q-bar-val">{formatFn(arrB[i])}{suffix}</div>
              <div className={`wpd-q-delta ${qdCls}`}>{qd > 0 ? '+' : ''}{formatFn(qd)}{suffix}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailTable({ headers, rows, isOpen, onToggle }) {
  return (
    <div className="wpd-detail-section">
      <div className="wpd-detail-toggle" onClick={onToggle}>
        <span className={`wpd-detail-toggle-icon${isOpen ? ' open' : ''}`}>▶</span>
        <span className="wpd-detail-toggle-label">View Quarterly Details</span>
        <span className="wpd-detail-toggle-sub">Click to expand</span>
      </div>
      <div className={`wpd-detail-table-wrap${isOpen ? ' open' : ''}`}>
        <table className="wpd-clean-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className={h.type === 'a' ? 'col-plan-a' : h.type === 'b' ? 'col-plan-b' : h.type === 'd' ? 'col-delta' : undefined}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={row.isTotal ? 'row-total' : undefined}>
                {row.cells.map((cell, ci) => <td key={ci} className={cell.cls}>{cell.val}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VolumeTab({ vA, vB, pA, pB, openDetail, toggle }) {
  const headers = [
    { label: 'Partner' },
    { label: `${pA} Q1`, type: 'a' }, { label: `${pA} Q2`, type: 'a' }, { label: `${pA} Q3`, type: 'a' }, { label: `${pA} Q4`, type: 'a' }, { label: `${pA} Total`, type: 'a' },
    { label: `${pB} Q1`, type: 'b' }, { label: `${pB} Q2`, type: 'b' }, { label: `${pB} Q3`, type: 'b' }, { label: `${pB} Q4`, type: 'b' }, { label: `${pB} Total`, type: 'b' },
    { label: 'Δ Total', type: 'd' },
  ];
  const rows = ['DB', 'OSP', 'Total'].map((p) => {
    const a = vA[p], b = vB[p];
    const tA = sum(a), tB = sum(b), d = tB - tA;
    const cells = [{ val: p }];
    a.forEach((v) => cells.push({ val: fmt(v) }));
    cells.push({ val: fmt(tA), cls: 'wpd-cell-highlight' });
    b.forEach((v) => cells.push({ val: fmt(v) }));
    cells.push({ val: fmt(tB), cls: 'wpd-cell-highlight' });
    cells.push({ val: (d > 0 ? '+' : '') + fmt(d), cls: d > 0 ? 'wpd-cell-up' : 'wpd-cell-down' });
    return { cells, isTotal: p === 'Total' };
  });
  return (
    <>
      <div className="wpd-comp-grid">
        <CompCard title="DB Volume" arrA={vA.DB} arrB={vB.DB} formatFn={fmtK} />
        <CompCard title="OSP Volume" arrA={vA.OSP} arrB={vB.OSP} formatFn={fmtK} />
        <CompCard title="Total Volume" arrA={vA.Total} arrB={vB.Total} formatFn={fmtK} />
      </div>
      <DetailTable id="vol-detail" headers={headers} rows={rows} isOpen={!!openDetail['vol-detail']} onToggle={() => toggle('vol-detail')} />
    </>
  );
}

function HeadcountTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const metrics = [
    { k: 'HC_Avg', l: 'L1 HC Avg' }, { k: 'HC_Exit', l: 'L1 HC Exit' }, { k: 'Total_HC', l: 'Total HC' },
    { k: 'Excess_HC', l: 'Excess HC' }, { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = [{ label: 'Metric' }];
  QL.forEach((q) => { headers.push({ label: `${pA} ${q}`, type: 'a' }); headers.push({ label: `${pB} ${q}`, type: 'b' }); headers.push({ label: 'Δ', type: 'd' }); });
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    QL.forEach((_, i) => {
      const d = (b[i] || 0) - (a[i] || 0);
      cells.push({ val: fmt(a[i]) });
      cells.push({ val: fmt(b[i]) });
      cells.push({ val: d !== 0 ? (d > 0 ? '+' : '') + d : '0', cls: d > 0 ? 'wpd-cell-up' : d < 0 ? 'wpd-cell-down' : 'wpd-cell-neutral' });
    });
    return { cells, isTotal: m.k === 'Total_HC' };
  });
  return (
    <>
      <div className="wpd-comp-grid">
        <CompCard title="L1 HC Average" arrA={hA.HC_Avg} arrB={hB.HC_Avg} />
        <CompCard title="L1 HC Exit" arrA={hA.HC_Exit} arrB={hB.HC_Exit} />
        <CompCard title="Total HC" arrA={hA.Total_HC} arrB={hB.Total_HC} />
        <CompCard title="Excess HC" arrA={hA.Excess_HC} arrB={hB.Excess_HC} />
      </div>
      <DetailTable id="hc-detail" headers={headers} rows={rows} isOpen={!!openDetail['hc-detail']} onToggle={() => toggle('hc-detail')} />
    </>
  );
}

function HiringTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const metrics = [
    { k: 'Hiring', l: 'Overall Hiring' }, { k: 'UR_Hire', l: 'UR Hiring' }, { k: 'Appr_Hire', l: 'Approved Hiring' },
    { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = [{ label: 'Metric' }];
  QL.forEach((q) => { headers.push({ label: `${pA} ${q}`, type: 'a' }); headers.push({ label: `${pB} ${q}`, type: 'b' }); headers.push({ label: 'Δ', type: 'd' }); });
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    QL.forEach((_, i) => {
      const d = (b[i] || 0) - (a[i] || 0);
      cells.push({ val: fmt(a[i]) });
      cells.push({ val: fmt(b[i]) });
      cells.push({ val: d !== 0 ? (d > 0 ? '+' : '') + d : '0', cls: d > 0 ? 'wpd-cell-up' : d < 0 ? 'wpd-cell-down' : 'wpd-cell-neutral' });
    });
    return { cells };
  });
  return (
    <>
      <div className="wpd-comp-grid">
        <CompCard title="Overall Hiring" arrA={hA.Hiring} arrB={hB.Hiring} />
        <CompCard title="UR Hiring" arrA={hA.UR_Hire} arrB={hB.UR_Hire} />
        <CompCard title="Approved Hiring" arrA={hA.Appr_Hire} arrB={hB.Appr_Hire} />
        <CompCard title="LOA Exit" arrA={hA.LOA} arrB={hB.LOA} />
        <CompCard title="Training Exit" arrA={hA.Training} arrB={hB.Training} />
      </div>
      <DetailTable id="hire-detail" headers={headers} rows={rows} isOpen={!!openDetail['hire-detail']} onToggle={() => toggle('hire-detail')} />
    </>
  );
}

function CapacityTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const headers = [
    { label: 'Quarter' }, { label: `${pA} Cap%`, type: 'a' }, { label: `${pB} Cap%`, type: 'b' }, { label: 'Δ pp', type: 'd' },
    { label: `${pA} ExHC`, type: 'a' }, { label: `${pB} ExHC`, type: 'b' }, { label: 'Δ ExHC', type: 'd' },
  ];
  const rows = QL.map((q, i) => {
    const ca = hA.Excess_Cap[i], cb = hB.Excess_Cap[i], dc = cb - ca;
    const ea = hA.Excess_HC[i], eb = hB.Excess_HC[i], de = eb - ea;
    const heatA = ca >= 120 ? 'wpd-heat-high' : ca >= 110 ? 'wpd-heat-mid' : 'wpd-heat-low';
    const heatB = cb >= 120 ? 'wpd-heat-high' : cb >= 110 ? 'wpd-heat-mid' : 'wpd-heat-low';
    return {
      cells: [
        { val: q },
        { val: ca + '%', cls: heatA }, { val: cb + '%', cls: heatB },
        { val: (dc > 0 ? '+' : '') + dc + 'pp', cls: dc > 0 ? 'wpd-cell-up' : dc < 0 ? 'wpd-cell-down' : 'wpd-cell-neutral' },
        { val: fmt(ea) }, { val: fmt(eb) },
        { val: (de > 0 ? '+' : '') + de, cls: de > 0 ? 'wpd-cell-up' : de < 0 ? 'wpd-cell-down' : 'wpd-cell-neutral' },
      ],
    };
  });
  const avgCA = Math.round(sum(hA.Excess_Cap) / 4), avgCB = Math.round(sum(hB.Excess_Cap) / 4), avgDC = avgCB - avgCA;
  const avgEA = Math.round(sum(hA.Excess_HC) / 4), avgEB = Math.round(sum(hB.Excess_HC) / 4), avgDE = avgEB - avgEA;
  rows.push({
    isTotal: true,
    cells: [
      { val: 'Average' }, { val: avgCA + '%' }, { val: avgCB + '%' },
      { val: (avgDC > 0 ? '+' : '') + avgDC + 'pp', cls: avgDC > 0 ? 'wpd-cell-up' : 'wpd-cell-down' },
      { val: fmt(avgEA) }, { val: fmt(avgEB) },
      { val: (avgDE > 0 ? '+' : '') + avgDE, cls: avgDE > 0 ? 'wpd-cell-up' : 'wpd-cell-down' },
    ],
  });
  return (
    <>
      <p style={{ fontSize: '.78em', color: '#94a3b8', marginBottom: '12px' }}>Excess capacity percentage by quarter — bars show relative capacity over 100% baseline</p>
      <div className="wpd-comp-grid">
        {QL.map((q, i) => {
          const capA = hA.Excess_Cap[i], capB = hB.Excess_Cap[i], d = capB - capA;
          const fillA = Math.min(100, Math.max(0, (capA - 90) / 50 * 100));
          const fillB = Math.min(100, Math.max(0, (capB - 90) / 50 * 100));
          const colA = capA >= 120 ? '#10b981' : capA >= 110 ? '#f59e0b' : '#ef4444';
          const colB = capB >= 120 ? '#10b981' : capB >= 110 ? '#f59e0b' : '#ef4444';
          const exDelta = hB.Excess_HC[i] - hA.Excess_HC[i];
          return (
            <div className="wpd-comp-card" key={q}>
              <div className="wpd-comp-card-header">
                <span className="wpd-comp-card-title">{q} Capacity</span>
                <span className={`wpd-comp-card-badge ${dCls(d)}`}>{d > 0 ? '+' : ''}{d}pp</span>
              </div>
              <div style={{ margin: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '.7em', color: '#64748b', minWidth: 40, fontWeight: 600 }}>{pA}</span>
                  <div className="wpd-cap-bar"><div className="wpd-cap-bar-fill" style={{ width: `${fillA}%`, background: colA }} /></div>
                  <span className="wpd-cap-val" style={{ color: colA }}>{capA}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '.7em', color: '#64748b', minWidth: 40, fontWeight: 600 }}>{pB}</span>
                  <div className="wpd-cap-bar"><div className="wpd-cap-bar-fill" style={{ width: `${fillB}%`, background: colB }} /></div>
                  <span className="wpd-cap-val" style={{ color: colB }}>{capB}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.65em', color: '#475569', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <span>Excess HC: {fmt(hA.Excess_HC[i])} → {fmt(hB.Excess_HC[i])}</span>
                <span className={exDelta > 0 ? 'wpd-cell-up' : 'wpd-cell-down'}>{exDelta > 0 ? '+' : ''}{exDelta}</span>
              </div>
            </div>
          );
        })}
      </div>
      <DetailTable id="cap-detail" headers={headers} rows={rows} isOpen={!!openDetail['cap-detail']} onToggle={() => toggle('cap-detail')} />
    </>
  );
}

const TABS = [
  { id: 'volume', icon: '📦', label: 'Volume' },
  { id: 'headcount', icon: '👥', label: 'Headcount' },
  { id: 'hiring', icon: '📋', label: 'Hiring & Exits' },
  { id: 'capacity', icon: '📊', label: 'Capacity' },
];

export default function CapacityOverviewNew() {
  const [planA, setPlanA] = useState('Jan');
  const [planB, setPlanB] = useState('Feb');
  const [fiscalYear, setFiscalYear] = useState('FY27');
  const [activeTab, setActiveTab] = useState('volume');
  const [openDetail, setOpenDetail] = useState({});

  const volumeRef = useRef(null);
  const hcRef = useRef(null);
  const capHireRef = useRef(null);
  const hireExitRef = useRef(null);

  const vA = VOL[planA][fiscalYear], vB = VOL[planB][fiscalYear];
  const hA = HC[planA][fiscalYear], hB = HC[planB][fiscalYear];

  useEffect(() => {
    const instances = [
      new Chart(volumeRef.current, buildVolumeConfig(vA, vB, planA, planB)),
      new Chart(hcRef.current, buildHcConfig(hA, hB, planA, planB)),
      new Chart(capHireRef.current, buildCapHireConfig(hA, hB, planA, planB)),
      new Chart(hireExitRef.current, buildHireExitConfig(hA, hB, planA, planB)),
    ];
    return () => instances.forEach((c) => c.destroy());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planA, planB, fiscalYear]);

  const tA = sum(vA.Total), tB = sum(vB.Total);
  const vD = pct(tA, tB);
  const hcA = Math.round(sum(hA.HC_Avg) / 4), hcB = Math.round(sum(hB.HC_Avg) / 4);
  const hcD = pct(hcA, hcB);
  const cA = Math.round(sum(hA.Excess_Cap) / 4), cB = Math.round(sum(hB.Excess_Cap) / 4);
  const hirA = sum(hA.Hiring), hirB = sum(hB.Hiring);
  const exA = Math.round(sum(hA.Excess_HC) / 4), exB = Math.round(sum(hB.Excess_HC) / 4);

  function toggleDetail(id) {
    setOpenDetail((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const tabProps = { hA, hB, vA, vB, pA: planA, pB: planB, openDetail, toggle: toggleDetail };

  return (
    <div className="tab-panel active">
      <div className="wpd-root">
        <div className="wpd-header">
          <h1>📊 Workforce Planning Dashboard</h1>
          <p>Plan-over-Plan Comparison — Volume, Headcount &amp; Hiring Analysis</p>
        </div>

        <div className="wpd-control-panel">
          <h3>🎛️ Plan-over-Plan Comparison</h3>
          <div className="wpd-control-inner">
            <label>Plan A:</label>
            <select value={planA} onChange={(e) => setPlanA(e.target.value)}>
              {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
            <span className="wpd-vs-badge">VS</span>
            <label>Plan B:</label>
            <select value={planB} onChange={(e) => setPlanB(e.target.value)}>
              {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
            <div className="wpd-fy-select">
              <label>Fiscal Year:</label>
              <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
                {YRS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="wpd-kpi-row">
          <div className="wpd-kpi-card c1">
            <div className="wpd-kpi-label">{fiscalYear} Total Volume</div>
            <div className="wpd-kpi-main"><span className="wpd-kpi-val">{fmtM(tA)}</span><span className="wpd-kpi-arrow">→</span><span className="wpd-kpi-val-b">{fmtM(tB)}</span></div>
            <div className={`wpd-kpi-delta ${dCls(vD)}`}>{vD > 0 ? '▲' : '▼'} {Math.abs(vD || 0)}%</div>
          </div>
          <div className="wpd-kpi-card c3">
            <div className="wpd-kpi-label">Avg Headcount</div>
            <div className="wpd-kpi-main"><span className="wpd-kpi-val">{fmt(hcA)}</span><span className="wpd-kpi-arrow">→</span><span className="wpd-kpi-val-b">{fmt(hcB)}</span></div>
            <div className={`wpd-kpi-delta ${dCls(hcD)}`}>{hcD > 0 ? '▲' : '▼'} {Math.abs(hcD || 0)}%</div>
          </div>
          <div className="wpd-kpi-card c4">
            <div className="wpd-kpi-label">Excess Capacity</div>
            <div className="wpd-kpi-main"><span className="wpd-kpi-val">{cA}%</span><span className="wpd-kpi-arrow">→</span><span className="wpd-kpi-val-b">{cB}%</span></div>
            <div className={`wpd-kpi-delta ${dCls(cB - cA)}`}>{cB - cA > 0 ? '▲' : '▼'} {Math.abs(cB - cA)}pp</div>
          </div>
          <div className="wpd-kpi-card c2">
            <div className="wpd-kpi-label">Total Hiring</div>
            <div className="wpd-kpi-main"><span className="wpd-kpi-val">{fmt(hirA)}</span><span className="wpd-kpi-arrow">→</span><span className="wpd-kpi-val-b">{fmt(hirB)}</span></div>
            <div className={`wpd-kpi-delta ${dCls(hirB - hirA)}`}>Δ {hirB - hirA > 0 ? '+' : ''}{hirB - hirA}</div>
          </div>
          <div className="wpd-kpi-card c5">
            <div className="wpd-kpi-label">Excess HC (Avg/Qtr)</div>
            <div className="wpd-kpi-main"><span className="wpd-kpi-val">{fmt(exA)}</span><span className="wpd-kpi-arrow">→</span><span className="wpd-kpi-val-b">{fmt(exB)}</span></div>
            <div className={`wpd-kpi-delta ${dCls(exB - exA)}`}>Δ {exB - exA > 0 ? '+' : ''}{exB - exA}</div>
          </div>
        </div>

        <div className="wpd-section-title">Volume Comparison</div>
        <div className="wpd-grid-full">
          <div className="wpd-card">
            <h3><span className="wpd-dot blue" /> Volume: <span className="wpd-plan-tag a">{planA}</span> vs <span className="wpd-plan-tag b">{planB}</span> — {fiscalYear}</h3>
            <div className="wpd-chart-container tall"><canvas ref={volumeRef}></canvas></div>
          </div>
        </div>

        <div className="wpd-section-title">Headcount &amp; Capacity</div>
        <div className="wpd-grid-2">
          <div className="wpd-card">
            <h3><span className="wpd-dot green" /> HC Avg, Exit &amp; Excess: <span className="wpd-plan-tag a">{planA}</span> vs <span className="wpd-plan-tag b">{planB}</span></h3>
            <div className="wpd-chart-container"><canvas ref={hcRef}></canvas></div>
          </div>
          <div className="wpd-card">
            <h3><span className="wpd-dot orange" /> Capacity % &amp; Hiring: <span className="wpd-plan-tag a">{planA}</span> vs <span className="wpd-plan-tag b">{planB}</span></h3>
            <div className="wpd-chart-container"><canvas ref={capHireRef}></canvas></div>
          </div>
        </div>

        <div className="wpd-section-title">Hiring &amp; Exits</div>
        <div className="wpd-grid-full">
          <div className="wpd-card">
            <h3><span className="wpd-dot purple" /> Hiring Breakdown: <span className="wpd-plan-tag a">{planA}</span> vs <span className="wpd-plan-tag b">{planB}</span></h3>
            <div className="wpd-chart-container"><canvas ref={hireExitRef}></canvas></div>
          </div>
        </div>

        <div className="wpd-section-title">Detailed Data Explorer</div>
        <div className="wpd-tab-nav">
          {TABS.map((t) => (
            <button key={t.id} className={`wpd-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <span className="wpd-tab-icon">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="wpd-tab-body">
          {activeTab === 'volume' && <VolumeTab {...tabProps} />}
          {activeTab === 'headcount' && <HeadcountTab {...tabProps} />}
          {activeTab === 'hiring' && <HiringTab {...tabProps} />}
          {activeTab === 'capacity' && <CapacityTab {...tabProps} />}
        </div>

        <div className="wpd-card" style={{ marginTop: 20 }}>
          <div className="wpd-comments-box">
            <h4>📝 Comments &amp; Notes</h4>
            <ul>
              {COMMENTS.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>

        <div className="wpd-footer">Workforce Planning Dashboard — Plan-over-Plan Analysis</div>
      </div>
    </div>
  );
}
