import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import InfoBtn from '../common/InfoBtn';
import KpiCard from '../common/KpiCard';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import { buildWpdVolumeConfig, buildWpdHcConfig, buildWpdCapHireConfig, buildWpdHireExitConfig } from '../charts/chartConfigs';
import { MONTHS, MONTH_LABELS, YRS, QL, VOL, HC } from '../../data/capacityOverviewNewData';
import { wpdVolumeInsight, wpdHcInsight, wpdCapHireInsight, wpdHireExitInsight } from '../../utils/insights';

// Same theme/components as the rest of Capacity Overview (KpiCard,
// ChartCanvas, .card/.card-header/.card-title, InfoBtn, InsightBox,
// .cap-plan-filters) instead of the reference HTML's own fixed dark-navy
// look -- this recreates the Workforce Planning Dashboard's functionality
// (Plan A/Plan B by month x Fiscal Year comparison, 4 charts, a tabbed
// detail explorer with expandable per-metric tables) inside the app's own
// design system.

const fmt = (n) => (n != null && n !== 0 ? n.toLocaleString() : '—');
const fmtM = (n) => (n != null ? (n / 1e6).toFixed(2) + 'M' : '—');
const fmtK = (n) => (n != null ? (n / 1e3).toFixed(0) + 'K' : '—');
const sum = (a) => a.reduce((s, v) => s + (v || 0), 0);
const pct = (a, b) => (a && b ? Number(((b - a) / Math.abs(a) * 100).toFixed(1)) : 0);
const dirArrow = (d) => (d >= 0 ? '▲' : '▼');
const badgeCls = (d) => (d >= 0 ? 'up' : 'down');

function CompCard({ title, arrA, arrB, pA, pB, formatFn = fmt, suffix = '' }) {
  const totA = sum(arrA), totB = sum(arrB);
  const d = totB - totA;
  const dp = pct(totA, totB);
  return (
    <div className="cmp-card">
      <div className="cmp-card-head">
        <span className="cmp-card-title">{title}</span>
        <span className={`cmp-badge ${badgeCls(d)}`}>{dirArrow(d)} {Math.abs(dp)}%</span>
      </div>
      <div className="cmp-vals">
        <div className="cmp-val-block">
          <div className="cmp-val-label">{pA}</div>
          <div className="cmp-val-num">{formatFn(totA)}{suffix}</div>
        </div>
        <span className="cmp-arrow">→</span>
        <div className="cmp-val-block">
          <div className="cmp-val-label">{pB}</div>
          <div className="cmp-val-num">{formatFn(totB)}{suffix}</div>
        </div>
      </div>
    </div>
  );
}

function DetailTable({ headers, rows, isOpen, onToggle }) {
  return (
    <div style={{ marginTop: '12px' }}>
      <div className="filter-panel-title" onClick={onToggle}>
        View Quarterly Details
        <span className={'filter-panel-caret' + (isOpen ? '' : ' collapsed')}>▾</span>
      </div>
      {isOpen && (
        <div className="tw" style={{ marginTop: '8px' }}>
          <table>
            <thead>
              <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={row.isTotal ? 'tbl-total' : undefined}>
                  {row.cells.map((cell, ci) => <td key={ci} className={cell.cls}>{cell.val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function deltaCell(d, suffix = '') {
  return { val: (d > 0 ? '+' : '') + d + suffix, cls: d > 0 ? 'tbl-pos' : d < 0 ? 'tbl-neg' : undefined };
}

function VolumeTab({ vA, vB, pA, pB, openDetail, toggle }) {
  const headers = ['Partner', `${pA} Q1`, `${pA} Q2`, `${pA} Q3`, `${pA} Q4`, `${pA} Total`, `${pB} Q1`, `${pB} Q2`, `${pB} Q3`, `${pB} Q4`, `${pB} Total`, 'Δ Total'];
  const rows = ['DB', 'OSP', 'Total'].map((p) => {
    const a = vA[p], b = vB[p];
    const tA = sum(a), tB = sum(b), d = tB - tA;
    const cells = [{ val: p }];
    a.forEach((v) => cells.push({ val: fmt(v) }));
    cells.push({ val: fmt(tA) });
    b.forEach((v) => cells.push({ val: fmt(v) }));
    cells.push({ val: fmt(tB) });
    cells.push(deltaCell(d));
    return { cells, isTotal: p === 'Total' };
  });
  return (
    <>
      <div className="cmp-grid">
        <CompCard title="DB Volume" arrA={vA.DB} arrB={vB.DB} pA={pA} pB={pB} formatFn={fmtK} />
        <CompCard title="OSP Volume" arrA={vA.OSP} arrB={vB.OSP} pA={pA} pB={pB} formatFn={fmtK} />
        <CompCard title="Total Volume" arrA={vA.Total} arrB={vB.Total} pA={pA} pB={pB} formatFn={fmtK} />
      </div>
      <DetailTable headers={headers} rows={rows} isOpen={!!openDetail.volume} onToggle={() => toggle('volume')} />
    </>
  );
}

function HeadcountTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const metrics = [
    { k: 'HC_Avg', l: 'L1 HC Avg' }, { k: 'HC_Exit', l: 'L1 HC Exit' }, { k: 'Total_HC', l: 'Total HC' },
    { k: 'Excess_HC', l: 'Excess HC' }, { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = ['Metric'];
  QL.forEach((q) => headers.push(`${pA} ${q}`, `${pB} ${q}`, 'Δ'));
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    QL.forEach((_, i) => {
      const d = (b[i] || 0) - (a[i] || 0);
      cells.push({ val: fmt(a[i]) }, { val: fmt(b[i]) }, deltaCell(d));
    });
    return { cells, isTotal: m.k === 'Total_HC' };
  });
  return (
    <>
      <div className="cmp-grid">
        <CompCard title="L1 HC Average" arrA={hA.HC_Avg} arrB={hB.HC_Avg} pA={pA} pB={pB} />
        <CompCard title="L1 HC Exit" arrA={hA.HC_Exit} arrB={hB.HC_Exit} pA={pA} pB={pB} />
        <CompCard title="Total HC" arrA={hA.Total_HC} arrB={hB.Total_HC} pA={pA} pB={pB} />
        <CompCard title="Excess HC" arrA={hA.Excess_HC} arrB={hB.Excess_HC} pA={pA} pB={pB} />
      </div>
      <DetailTable headers={headers} rows={rows} isOpen={!!openDetail.headcount} onToggle={() => toggle('headcount')} />
    </>
  );
}

function HiringTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const metrics = [
    { k: 'Hiring', l: 'Overall Hiring' }, { k: 'UR_Hire', l: 'UR Hiring' }, { k: 'Appr_Hire', l: 'Approved Hiring' },
    { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = ['Metric'];
  QL.forEach((q) => headers.push(`${pA} ${q}`, `${pB} ${q}`, 'Δ'));
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    QL.forEach((_, i) => {
      const d = (b[i] || 0) - (a[i] || 0);
      cells.push({ val: fmt(a[i]) }, { val: fmt(b[i]) }, deltaCell(d));
    });
    return { cells };
  });
  return (
    <>
      <div className="cmp-grid">
        <CompCard title="Overall Hiring" arrA={hA.Hiring} arrB={hB.Hiring} pA={pA} pB={pB} />
        <CompCard title="UR Hiring" arrA={hA.UR_Hire} arrB={hB.UR_Hire} pA={pA} pB={pB} />
        <CompCard title="Approved Hiring" arrA={hA.Appr_Hire} arrB={hB.Appr_Hire} pA={pA} pB={pB} />
        <CompCard title="LOA Exit" arrA={hA.LOA} arrB={hB.LOA} pA={pA} pB={pB} />
        <CompCard title="Training Exit" arrA={hA.Training} arrB={hB.Training} pA={pA} pB={pB} />
      </div>
      <DetailTable headers={headers} rows={rows} isOpen={!!openDetail.hiring} onToggle={() => toggle('hiring')} />
    </>
  );
}

function CapacityTab({ hA, hB, pA, pB, openDetail, toggle }) {
  const headers = ['Quarter', `${pA} Cap%`, `${pB} Cap%`, 'Δ pp', `${pA} ExHC`, `${pB} ExHC`, 'Δ ExHC'];
  const rows = QL.map((q, i) => {
    const ca = hA.Excess_Cap[i], cb = hB.Excess_Cap[i], dc = cb - ca;
    const ea = hA.Excess_HC[i], eb = hB.Excess_HC[i], de = eb - ea;
    return { cells: [{ val: q }, { val: ca + '%' }, { val: cb + '%' }, deltaCell(dc, 'pp'), { val: fmt(ea) }, { val: fmt(eb) }, deltaCell(de)] };
  });
  const avgCA = Math.round(sum(hA.Excess_Cap) / 4), avgCB = Math.round(sum(hB.Excess_Cap) / 4);
  const avgEA = Math.round(sum(hA.Excess_HC) / 4), avgEB = Math.round(sum(hB.Excess_HC) / 4);
  rows.push({
    isTotal: true,
    cells: [{ val: 'Average' }, { val: avgCA + '%' }, { val: avgCB + '%' }, deltaCell(avgCB - avgCA, 'pp'), { val: fmt(avgEA) }, { val: fmt(avgEB) }, deltaCell(avgEB - avgEA)],
  });
  return (
    <>
      <div className="cmp-grid">
        {QL.map((q, i) => {
          const capA = hA.Excess_Cap[i], capB = hB.Excess_Cap[i], d = capB - capA;
          return (
            <div className="cmp-card" key={q}>
              <div className="cmp-card-head">
                <span className="cmp-card-title">{q} Capacity</span>
                <span className={`cmp-badge ${badgeCls(d)}`}>{d > 0 ? '+' : ''}{d}pp</span>
              </div>
              <div className="cmp-vals">
                <div className="cmp-val-block"><div className="cmp-val-label">{pA}</div><div className="cmp-val-num">{capA}%</div></div>
                <span className="cmp-arrow">→</span>
                <div className="cmp-val-block"><div className="cmp-val-label">{pB}</div><div className="cmp-val-num">{capB}%</div></div>
              </div>
            </div>
          );
        })}
      </div>
      <DetailTable headers={headers} rows={rows} isOpen={!!openDetail.capacity} onToggle={() => toggle('capacity')} />
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
  const { theme, fiscalYear } = useApp();
  const [planA, setPlanA] = useState('Jan');
  const [planB, setPlanB] = useState('Feb');
  const [activeTab, setActiveTab] = useState('volume');
  const [openDetail, setOpenDetail] = useState({});

  // Fiscal Year now comes from the top Filters bar instead of its own
  // dropdown here -- but that bar's fiscal years (FY24-FY27) and this
  // page's ported dataset (FY25-FY28) only partly overlap, so fall back to
  // FY26 rather than crash on a year this dataset never had (FY24).
  const fy = YRS.includes(fiscalYear) ? fiscalYear : 'FY26';

  const vA = VOL[planA][fy], vB = VOL[planB][fy];
  const hA = HC[planA][fy], hB = HC[planB][fy];

  const dVol = useMemo(() => ({
    labels: QL, pA: planA, pB: planB, fy,
    aDb: vA.DB, aOsp: vA.OSP, aTotal: vA.Total, bDb: vB.DB, bOsp: vB.OSP, bTotal: vB.Total,
  }), [vA, vB, planA, planB, fy]);
  const dHc = useMemo(() => ({
    labels: QL, pA: planA, pB: planB,
    aHcAvg: hA.HC_Avg, bHcAvg: hB.HC_Avg, aHcExit: hA.HC_Exit, bHcExit: hB.HC_Exit, bExcessHc: hB.Excess_HC,
  }), [hA, hB, planA, planB]);
  const dCapHire = useMemo(() => ({
    labels: QL, pA: planA, pB: planB, aHiring: hA.Hiring, bHiring: hB.Hiring, aCap: hA.Excess_Cap, bCap: hB.Excess_Cap,
  }), [hA, hB, planA, planB]);
  const dHireExit = useMemo(() => ({
    labels: QL, pA: planA, pB: planB, aHiring: hA.Hiring, bHiring: hB.Hiring, aUrHire: hA.UR_Hire, bUrHire: hB.UR_Hire, bLoa: hB.LOA, bTraining: hB.Training,
  }), [hA, hB, planA, planB]);

  const volConfig = useMemo(() => buildWpdVolumeConfig(dVol, theme), [dVol, theme]);
  const hcConfig = useMemo(() => buildWpdHcConfig(dHc, theme), [dHc, theme]);
  const capHireConfig = useMemo(() => buildWpdCapHireConfig(dCapHire, theme), [dCapHire, theme]);
  const hireExitConfig = useMemo(() => buildWpdHireExitConfig(dHireExit, theme), [dHireExit, theme]);

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
      <div className="cap-plan-filters">
        <span className="cap-plan-filters-title">🎛️ Comparison Filter</span>
        <div className="filter-group">
          <label>Plan A</label>
          <select value={planA} onChange={(e) => setPlanA(e.target.value)}>
            {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Plan B</label>
          <select value={planB} onChange={(e) => setPlanB(e.target.value)}>
            {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label={`${fy} Total Volume`} value={`${fmtM(tA)} → ${fmtM(tB)}`} delta={`${dirArrow(vD)} ${Math.abs(vD)}%`} sub={`${planA} → ${planB}`} />
        <KpiCard label="Avg Headcount" value={`${fmt(hcA)} → ${fmt(hcB)}`} delta={`${dirArrow(hcD)} ${Math.abs(hcD)}%`} sub={`${planA} → ${planB}`} />
        <KpiCard label="Excess Capacity" value={`${cA}% → ${cB}%`} delta={`${dirArrow(cB - cA)} ${Math.abs(cB - cA)}pp`} sub={`${planA} → ${planB}`} />
        <KpiCard label="Total Hiring" value={`${fmt(hirA)} → ${fmt(hirB)}`} delta={`Δ ${hirB - hirA > 0 ? '+' : ''}${hirB - hirA}`} sub={`${planA} → ${planB}`} />
        <KpiCard label="Excess HC (Avg/Qtr)" value={`${fmt(exA)} → ${fmt(exB)}`} delta={`Δ ${exB - exA > 0 ? '+' : ''}${exB - exA}`} sub={`${planA} → ${planB}`} />
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Volume: {planA} vs {planB} — {fy}
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>DB/OSP volume (stacked per plan) plus the Total Volume trend and the period-over-period % delta between Plan A and Plan B." />
            </div>
          </div>
          <ChartCanvas config={volConfig} height="300px" />
          <InsightBox text={wpdVolumeInsight(dVol)} />
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              HC Avg, Exit &amp; Excess
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>Headcount average and exit trend for Plan A vs Plan B, with Plan B's Excess HC overlaid on a secondary axis." />
            </div>
          </div>
          <ChartCanvas config={hcConfig} height="300px" />
          <InsightBox text={wpdHcInsight(dHc)} />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Capacity % &amp; Hiring
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>Capacity % for Plan A vs Plan B against a 100% baseline, with hiring counts as bars on a secondary axis." />
            </div>
          </div>
          <ChartCanvas config={capHireConfig} height="300px" />
          <InsightBox text={wpdCapHireInsight(dCapHire)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Hiring Breakdown
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>Overall vs UR hiring for Plan A/Plan B, with Plan B's LOA and Training exits on a secondary axis." />
            </div>
          </div>
          <ChartCanvas config={hireExitConfig} height="300px" />
          <InsightBox text={wpdHireExitInsight(dHireExit)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">
            Detailed Data Explorer
            {' '}
            <InfoBtn tip="<strong>Purpose</strong>Per-quarter Plan A vs Plan B breakdown, by Volume, Headcount, Hiring &amp; Exits, or Capacity." />
          </div>
        </div>
        <div className="drilldown-toggle">
          {TABS.map((t) => (
            <button key={t.id} className={'drilldown-toggle-btn' + (activeTab === t.id ? ' active' : '')} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {activeTab === 'volume' && <VolumeTab {...tabProps} />}
        {activeTab === 'headcount' && <HeadcountTab {...tabProps} />}
        {activeTab === 'hiring' && <HiringTab {...tabProps} />}
        {activeTab === 'capacity' && <CapacityTab {...tabProps} />}
      </div>
    </div>
  );
}
