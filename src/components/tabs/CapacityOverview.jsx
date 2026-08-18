import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import InfoBtn from '../common/InfoBtn';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import { buildWpdVolumeConfig, buildWpdHcConfig, buildWpdCapHireConfig, buildWpdHireExitConfig } from '../charts/chartConfigs';
import { YRS, VOL, HC } from '../../data/capacityOverviewNewData';
import { wpdVolumeInsight, wpdHcInsight, wpdCapHireInsight, wpdHireExitInsight } from '../../utils/insights';
import { buildPeriodLabels } from '../../utils/periodLabels';

// Workforce Planning Dashboard-style Capacity Overview: Plan A/Plan B by
// month x Fiscal Year comparison, 4 charts, a tabbed detail explorer with
// expandable per-metric tables, all built from the app's own shared
// components/theme (.card/.card-header/.card-title, InfoBtn, InsightBox,
// .cap-plan-filters).

const fmt = (n) => (n != null && n !== 0 ? n.toLocaleString() : '—');
const fmtM = (n) => (n != null ? (n / 1e6).toFixed(2) + 'M' : '—');
const fmtK = (n) => (n != null ? (n / 1e3).toFixed(0) + 'K' : '—');
const sum = (a) => a.reduce((s, v) => s + (v || 0), 0);
const pct = (a, b) => (a && b ? Number(((b - a) / Math.abs(a) * 100).toFixed(1)) : 0);
const dirArrow = (d) => (d >= 0 ? '▲' : '▼');
const badgeCls = (d) => (d >= 0 ? 'up' : 'down');

// This page's source data is quarterly-only (4 points per fiscal year), so
// Weekly/Monthly/QTR don't have real sub-quarter data to switch to. Instead,
// flow metrics (volume, hiring, exits) are scaled to approximate that
// period's slice of a quarter -- the same "flow vs stock" split the rest of
// the app already uses for its period-aware KPI cards (capacityData.js) --
// while stock metrics (HC Avg/Exit, Total HC, Excess HC/Capacity) are left
// unscaled since they're point-in-time state, not something to sum. Yearly
// is handled separately: it aggregates across this page's 4 fiscal years
// instead of scaling a single year's quarters.
const FLOW_VOL_FIELDS = ['DB', 'OSP', 'Total'];
const FLOW_HC_FIELDS = ['Hiring', 'UR_Hire', 'Appr_Hire', 'LOA', 'Training'];
const STOCK_HC_FIELDS = ['HC_Avg', 'HC_Exit', 'Excess_Cap', 'Excess_HC', 'Total_HC'];
const PERIOD_FLOW_FACTOR = { weekly: 1 / 13, monthly: 1 / 3, qtr: 1 };

function scaleFlowArr(arr, factor) {
  return arr.map((v) => (v == null ? v : Math.round(v * factor)));
}

function periodVol(rawVol, curPeriod) {
  const f = PERIOD_FLOW_FACTOR[curPeriod] ?? 1;
  const out = {};
  FLOW_VOL_FIELDS.forEach((k) => { out[k] = scaleFlowArr(rawVol[k], f); });
  return out;
}

function periodHc(rawHc, curPeriod) {
  const f = PERIOD_FLOW_FACTOR[curPeriod] ?? 1;
  const out = { ...rawHc };
  FLOW_HC_FIELDS.forEach((k) => { out[k] = scaleFlowArr(rawHc[k], f); });
  return out;
}

function yearlyVol(plan) {
  const out = {};
  FLOW_VOL_FIELDS.forEach((k) => { out[k] = YRS.map((y) => sum(VOL[plan][y][k])); });
  return out;
}

function yearlyHc(plan) {
  const out = {};
  FLOW_HC_FIELDS.forEach((k) => { out[k] = YRS.map((y) => sum(HC[plan][y][k])); });
  STOCK_HC_FIELDS.forEach((k) => { out[k] = YRS.map((y) => Math.round(sum(HC[plan][y][k]) / 4)); });
  return out;
}

function ComparisonKpi({ label, valueA, valueB, delta, suffix = '%', planA, planB }) {
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <div className="wpd-kpi-tile">
      <div className="wpd-kpi-tile-label">{label}</div>
      <div className="wpd-kpi-tile-main">
        <span className="wpd-kpi-tile-a">{valueA}</span>
        <span className="wpd-kpi-tile-arrow">→</span>
        <span className="wpd-kpi-tile-b">{valueB}</span>
      </div>
      <div className="wpd-kpi-tile-sub">
        {planA}→{planB} <span className={`wpd-kpi-tile-delta ${badgeCls(delta)}`}>{dirArrow(delta)} {signed}{suffix}</span>
      </div>
    </div>
  );
}

function CompCard({ title, arrA, arrB, pA, pB, formatFn = fmt, suffix = '' }) {
  const totA = sum(arrA), totB = sum(arrB);
  // arrA is always the Current Plan and arrB the Previous Plan, so the delta
  // reads as Current minus Previous, relative to Previous -- not "whichever
  // was picked second minus whichever was picked first".
  const d = totA - totB;
  const dp = pct(totB, totA);
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
        View Details
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

function VolumeTab({ vA, vB, pA, pB, labels, openDetail, toggle }) {
  const headers = ['Partner', ...labels.map((l) => `${pA} ${l}`), `${pA} Total`, ...labels.map((l) => `${pB} ${l}`), `${pB} Total`, 'Δ Total'];
  const rows = ['DB', 'OSP', 'Total'].map((p) => {
    const a = vA[p], b = vB[p];
    const tA = sum(a), tB = sum(b), d = tA - tB;
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

function HeadcountTab({ hA, hB, pA, pB, labels, openDetail, toggle }) {
  const metrics = [
    { k: 'HC_Avg', l: 'L1 HC Avg' }, { k: 'HC_Exit', l: 'L1 HC Exit' }, { k: 'Total_HC', l: 'Total HC' },
    { k: 'Excess_HC', l: 'Excess HC' }, { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = ['Metric'];
  labels.forEach((l) => headers.push(`${pA} ${l}`, `${pB} ${l}`, 'Δ'));
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    labels.forEach((_, i) => {
      const d = (a[i] || 0) - (b[i] || 0);
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

function HiringTab({ hA, hB, pA, pB, labels, openDetail, toggle }) {
  const metrics = [
    { k: 'Hiring', l: 'Overall Hiring' }, { k: 'UR_Hire', l: 'UR Hiring' }, { k: 'Appr_Hire', l: 'Approved Hiring' },
    { k: 'LOA', l: 'LOA Exit' }, { k: 'Training', l: 'Training Exit' },
  ];
  const headers = ['Metric'];
  labels.forEach((l) => headers.push(`${pA} ${l}`, `${pB} ${l}`, 'Δ'));
  const rows = metrics.map((m) => {
    const a = hA[m.k], b = hB[m.k];
    const cells = [{ val: m.l }];
    labels.forEach((_, i) => {
      const d = (a[i] || 0) - (b[i] || 0);
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

function CapacityTab({ hA, hB, pA, pB, labels, openDetail, toggle }) {
  const headers = ['Period', `${pA} Cap%`, `${pB} Cap%`, 'Δ pp', `${pA} ExHC`, `${pB} ExHC`, 'Δ ExHC'];
  const rows = labels.map((l, i) => {
    const ca = hA.Excess_Cap[i], cb = hB.Excess_Cap[i], dc = ca - cb;
    const ea = hA.Excess_HC[i], eb = hB.Excess_HC[i], de = ea - eb;
    return { cells: [{ val: l }, { val: ca + '%' }, { val: cb + '%' }, deltaCell(dc, 'pp'), { val: fmt(ea) }, { val: fmt(eb) }, deltaCell(de)] };
  });
  const avgCA = Math.round(sum(hA.Excess_Cap) / 4), avgCB = Math.round(sum(hB.Excess_Cap) / 4);
  const avgEA = Math.round(sum(hA.Excess_HC) / 4), avgEB = Math.round(sum(hB.Excess_HC) / 4);
  rows.push({
    isTotal: true,
    cells: [{ val: 'Average' }, { val: avgCA + '%' }, { val: avgCB + '%' }, deltaCell(avgCA - avgCB, 'pp'), { val: fmt(avgEA) }, { val: fmt(avgEB) }, deltaCell(avgEA - avgEB)],
  });
  return (
    <>
      <div className="cmp-grid">
        {labels.map((l, i) => {
          const capA = hA.Excess_Cap[i], capB = hB.Excess_Cap[i], d = capA - capB;
          return (
            <div className="cmp-card" key={l}>
              <div className="cmp-card-head">
                <span className="cmp-card-title">{l} Capacity</span>
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

export default function CapacityOverview() {
  const { theme, fiscalYear, curPeriod, compPlanA: planA, compPlanB: planB } = useApp();
  const [activeTab, setActiveTab] = useState('volume');
  const [openDetail, setOpenDetail] = useState({});

  // Fiscal Year comes from the top Filters bar -- but that bar's fiscal
  // years (FY24-FY27) and this page's dataset (FY25-FY28) only partly
  // overlap, so fall back to FY26 rather than crash on a year this dataset
  // never had (FY24).
  const fy = YRS.includes(fiscalYear) ? fiscalYear : 'FY26';

  // Weekly/Monthly/QTR/Yearly toggle: qtr is this page's native resolution
  // (4 quarters of the selected fiscal year); weekly/monthly scale flow
  // metrics down to approximate that period's slice of a quarter; yearly
  // swaps the whole 4-point axis to this page's 4 fiscal years instead.
  const isYearly = curPeriod === 'yearly';
  const labels = useMemo(() => (isYearly ? YRS : buildPeriodLabels(fy, curPeriod, 4)), [isYearly, fy, curPeriod]);
  const vA = useMemo(() => (isYearly ? yearlyVol(planA) : periodVol(VOL[planA][fy], curPeriod)), [isYearly, planA, fy, curPeriod]);
  const vB = useMemo(() => (isYearly ? yearlyVol(planB) : periodVol(VOL[planB][fy], curPeriod)), [isYearly, planB, fy, curPeriod]);
  const hA = useMemo(() => (isYearly ? yearlyHc(planA) : periodHc(HC[planA][fy], curPeriod)), [isYearly, planA, fy, curPeriod]);
  const hB = useMemo(() => (isYearly ? yearlyHc(planB) : periodHc(HC[planB][fy], curPeriod)), [isYearly, planB, fy, curPeriod]);

  const dVol = useMemo(() => ({
    labels, pA: planA, pB: planB, fy: isYearly ? `${YRS[0]}-${YRS[YRS.length - 1]}` : fy,
    aDb: vA.DB, aOsp: vA.OSP, aTotal: vA.Total, bDb: vB.DB, bOsp: vB.OSP, bTotal: vB.Total,
  }), [labels, vA, vB, planA, planB, fy, isYearly]);
  const dHc = useMemo(() => {
    // Plan-over-Plan: Current vs Previous's L1 HC Exit % difference each
    // period, so the line reacts to the Comparison Filter selection exactly
    // like the bars do, instead of a time-based quarter-over-quarter change.
    // Relative to Previous (the baseline), matching Current minus Previous.
    const bHcExitPop = hB.HC_Exit.map((prev, i) => {
      const cur = hA.HC_Exit[i];
      return prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;
    });
    return { labels, pA: planA, pB: planB, aHcAvg: hA.HC_Avg, bHcAvg: hB.HC_Avg, bHcExitPop };
  }, [labels, hA, hB, planA, planB]);
  const dCapHire = useMemo(() => ({
    labels, pA: planA, pB: planB, aHiring: hA.Hiring, bHiring: hB.Hiring, aCap: hA.Excess_Cap, bCap: hB.Excess_Cap,
  }), [labels, hA, hB, planA, planB]);
  const dHireExit = useMemo(() => ({
    labels, pA: planA, pB: planB, aHiring: hA.Hiring, bHiring: hB.Hiring, aUrHire: hA.UR_Hire, bUrHire: hB.UR_Hire, bLoa: hB.LOA, bTraining: hB.Training,
  }), [labels, hA, hB, planA, planB]);

  const volConfig = useMemo(() => buildWpdVolumeConfig(dVol, theme), [dVol, theme]);
  const hcConfig = useMemo(() => buildWpdHcConfig(dHc, theme), [dHc, theme]);
  const capHireConfig = useMemo(() => buildWpdCapHireConfig(dCapHire, theme), [dCapHire, theme]);
  const hireExitConfig = useMemo(() => buildWpdHireExitConfig(dHireExit, theme), [dHireExit, theme]);

  // planA/vA/hA is always the Current Plan and planB/vB/hB the Previous Plan
  // (see AppContext's compPlanA/compPlanB), so every delta below reads as
  // Current minus Previous -- not "whichever dropdown is B minus A".
  const tA = sum(vA.Total), tB = sum(vB.Total);
  const vD = pct(tB, tA);
  const hcA = Math.round(sum(hA.HC_Avg) / 4), hcB = Math.round(sum(hB.HC_Avg) / 4);
  const hcD = pct(hcB, hcA);
  const cA = Math.round(sum(hA.Excess_Cap) / 4), cB = Math.round(sum(hB.Excess_Cap) / 4);
  const hirA = sum(hA.Hiring), hirB = sum(hB.Hiring);
  const exA = Math.round(sum(hA.Excess_HC) / 4), exB = Math.round(sum(hB.Excess_HC) / 4);

  function toggleDetail(id) {
    setOpenDetail((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const tabProps = { hA, hB, vA, vB, pA: planA, pB: planB, labels, openDetail, toggle: toggleDetail };
  const fyLabel = isYearly ? `${YRS[0]}-${YRS[YRS.length - 1]}` : fy;

  return (
    <div className="tab-panel active">
      <div className="kpi-grid cols-5 wpd-kpi-grid">
        <ComparisonKpi label={`${fyLabel} Total Volume`} valueA={fmtM(tA)} valueB={fmtM(tB)} delta={vD} planA={planA} planB={planB} />
        <ComparisonKpi label={`${fyLabel} HC Avg`} valueA={fmt(hcA)} valueB={fmt(hcB)} delta={hcD} planA={planA} planB={planB} />
        <ComparisonKpi label={`${fyLabel} Excess Capacity`} valueA={`${cA}%`} valueB={`${cB}%`} delta={cA - cB} suffix="pp" planA={planA} planB={planB} />
        <ComparisonKpi label={`${fyLabel} Total Hiring`} valueA={fmt(hirA)} valueB={fmt(hirB)} delta={hirA - hirB} suffix="" planA={planA} planB={planB} />
        <ComparisonKpi label={`${fyLabel} Excess HC (Avg/Qtr)`} valueA={fmt(exA)} valueB={fmt(exB)} delta={exA - exB} suffix="" planA={planA} planB={planB} />
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Volume: {planA} vs {planB} — {fyLabel}
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>DB/OSP volume per plan (stacked) plus Total volume as its own bar, and the period-over-period % delta between the Current and Previous Plan." />
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
              HC Avg &amp; L1 HC Exit POP
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>HC Avg for the Current Plan vs the Previous Plan as bars, with L1 HC Exit Plan-over-Plan % difference (Current vs Previous) as a line on a secondary axis." />
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
            <InfoBtn tip="<strong>Purpose</strong>Per-period Plan A vs Plan B breakdown, by Volume, Headcount, Hiring &amp; Exits, or Capacity. Reacts to the Weekly/Monthly/QTR/Yearly toggle above." />
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
