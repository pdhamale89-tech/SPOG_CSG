import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import InfoBtn from '../common/InfoBtn';
import KpiCard from '../common/KpiCard';
import MiniStat from '../common/MiniStat';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildCapVolumeConfig, buildCapVolumeTrendConfig, buildCapHcConfig, buildCapExcessConfig,
  buildCapHiringConfig, buildCapHiringBreakdownConfig, buildCapCapOspConfig, buildCapExitConfig,
  buildCapPopConfig, buildCapHiringPopConfig, buildCapPlannerGapConfig, buildCapTopGapsConfig,
  buildCapOfferingGapConfig, buildCapPlannerSubtotalsConfig, buildCapWeeklyGapConfig,
} from '../charts/chartConfigs';
import {
  CAP_KPIS, CAP_MINI_STATS, capC1, capC2, capC3, capC4, capC5, capC6, capC7, capC8,
  capA1, capA2, capA3, capA4, capA5, capA6, capA7, capWeeklyTable,
  capLabelsFor, CAP_PERIOD_LABEL, CAP_PERIOD_WORD,
} from '../../data/capacityData';
import {
  capVolumeInsight, capVolumeTrendInsight, capHcInsight, capExcessInsight, capHiringInsight,
  capHiringBreakdownInsight, capCapOspInsight, capExitInsight, capPopInsight, capHiringPopInsight,
  capPlannerGapInsight, capTopGapsInsight, capOfferingGapInsight, capPlannerSubtotalsInsight,
  capWeeklyGapInsight,
} from '../../utils/insights';

const DIR_ARROW = { up: '▲ ', dn: '▼ ', flat: '— ' };

export default function CapacityOverview() {
  const { theme, curPeriod } = useApp();
  const [capTab, setCapTab] = useState('overview');
  const [sort, setSort] = useState({ col: null, dir: 'asc' });

  const periodLabel = CAP_PERIOD_LABEL[curPeriod];
  const periodWord = CAP_PERIOD_WORD[curPeriod];
  const capKpis = CAP_KPIS[curPeriod];
  const capMiniStats = CAP_MINI_STATS[curPeriod];
  const L6 = useMemo(() => capLabelsFor(curPeriod, 6), [curPeriod]);
  const L8 = useMemo(() => capLabelsFor(curPeriod, 8), [curPeriod]);

  const dC1 = useMemo(() => ({ ...capC1, labels: L6 }), [L6]);
  const dC2 = useMemo(() => ({ ...capC2, labels: L6 }), [L6]);
  const dC3 = useMemo(() => ({ ...capC3, labels: L8 }), [L8]);
  const dC4 = useMemo(() => ({ ...capC4, labels: L8 }), [L8]);
  const dC5 = useMemo(() => ({ ...capC5, labels: L8 }), [L8]);
  const dC6 = useMemo(() => ({ ...capC6, labels: L8 }), [L8]);
  const dC7 = useMemo(() => ({ ...capC7, labels: L8 }), [L8]);
  const dC8 = useMemo(() => ({ ...capC8, labels: L8 }), [L8]);
  const dA1 = useMemo(() => ({ ...capA1, labels: L8 }), [L8]);
  const dA2 = useMemo(() => ({ ...capA2, labels: L8 }), [L8]);
  const dA3 = useMemo(() => ({ ...capA3, labels: L6 }), [L6]);
  const dA5 = useMemo(() => ({ ...capA5, labels: L8 }), [L8]);
  const dA7 = useMemo(() => ({ ...capA7, labels: L6 }), [L6]);
  const detailTable = useMemo(() => ({ ...capWeeklyTable, cols: L6 }), [L6]);

  const c1Config = useMemo(() => buildCapVolumeConfig(dC1, theme), [dC1, theme]);
  const c2Config = useMemo(() => buildCapVolumeTrendConfig(dC2, theme), [dC2, theme]);
  const c3Config = useMemo(() => buildCapHcConfig(dC3, theme), [dC3, theme]);
  const c4Config = useMemo(() => buildCapExcessConfig(dC4, theme), [dC4, theme]);
  const c5Config = useMemo(() => buildCapHiringConfig(dC5, theme), [dC5, theme]);
  const c6Config = useMemo(() => buildCapHiringBreakdownConfig(dC6, theme), [dC6, theme]);
  const c7Config = useMemo(() => buildCapCapOspConfig(dC7, theme), [dC7, theme]);
  const c8Config = useMemo(() => buildCapExitConfig(dC8, theme), [dC8, theme]);
  const a1Config = useMemo(() => buildCapPopConfig(dA1, theme), [dA1, theme]);
  const a2Config = useMemo(() => buildCapHiringPopConfig(dA2, theme), [dA2, theme]);
  const a3Config = useMemo(() => buildCapPlannerGapConfig(dA3, theme), [dA3, theme]);
  const a4Config = useMemo(() => buildCapTopGapsConfig(capA4, theme), [theme]);
  const a5Config = useMemo(() => buildCapOfferingGapConfig(dA5, theme), [dA5, theme]);
  const a6Config = useMemo(() => buildCapPlannerSubtotalsConfig(capA6, theme), [theme]);
  const a7Config = useMemo(() => buildCapWeeklyGapConfig(dA7, theme), [dA7, theme]);

  function toggleSort(col) {
    setSort((s) => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  }
  const sortIcon = (col) => (sort.col === col ? (sort.dir === 'asc' ? '▲' : '▼') : '');
  const sortedRows = useMemo(() => {
    if (sort.col === null) return capWeeklyTable.rows;
    const copy = [...capWeeklyTable.rows];
    copy.sort((a, b) => {
      const av = sort.col === 'queue' ? a.queue : a.vals[sort.col];
      const bv = sort.col === 'queue' ? b.queue : b.vals[sort.col];
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [sort]);

  const cqnDetailCard = (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header"><div className="card-title">{periodWord} CQN Detail <InfoBtn tip="<strong>Purpose</strong>Per-queue gap detail. Click a column header to sort." /></div></div>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => toggleSort('queue')}>Queue<span className="sort-ic">{sortIcon('queue')}</span></th>
              {detailTable.cols.map((c, i) => (
                <th className="sortable-th" key={c} onClick={() => toggleSort(i)}>{c}<span className="sort-ic">{sortIcon(i)}</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.queue}>
                <td>{r.queue}</td>
                {r.vals.map((v, i) => <td className="tbl-neg" key={i}>{v.toLocaleString()}</td>)}
              </tr>
            ))}
            <tr className="tbl-total">
              <td>{capWeeklyTable.total.queue}</td>
              {capWeeklyTable.total.vals.map((v, i) => <td className="tbl-neg" key={i}>{v.toLocaleString()}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="tab-panel active">
      <div className="plan-sel" style={{ marginBottom: '14px' }}>
        <button className={'plan-btn' + (capTab === 'overview' ? ' active' : '')} onClick={() => setCapTab('overview')}>Overview</button>
        <button className={'plan-btn' + (capTab === 'analytics' ? ' active' : '')} onClick={() => setCapTab('analytics')}>Analytics</button>
      </div>

      <div className="kpi-grid">
        {capKpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={DIR_ARROW[k.dir] + k.delta} sub={k.sub} />
        ))}
      </div>

      {capTab === 'overview' ? (
        <>
          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Volume Comparison <InfoBtn tip="<strong>Purpose</strong>DB/OSP volume comparison between the Jul and Aug projections." /></div></div>
              <ChartCanvas config={c1Config} height="300px" />
              <InsightBox text={capVolumeInsight(dC1)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Total Volume Trend <InfoBtn tip="<strong>Purpose</strong>Total volume trend across Jul and Aug projections." /></div></div>
              <ChartCanvas config={c2Config} height="300px" />
              <InsightBox text={capVolumeTrendInsight(dC2)} />
            </div>
          </div>

          <div className="mini-row">
            {capMiniStats.map((m) => (
              <MiniStat key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>
          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">HC Avg, Exit &amp; Total — Jul vs Aug <InfoBtn tip="<strong>Purpose</strong>Headcount average and exit trend with total headcount overlay." /></div></div>
              <ChartCanvas config={c3Config} height="300px" />
              <InsightBox text={capHcInsight(dC3)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Excess HC + LOA + Training <InfoBtn tip="<strong>Purpose</strong>Excess headcount alongside LOA exits and training load." /></div></div>
              <ChartCanvas config={c4Config} height="300px" />
              <InsightBox text={capExcessInsight(dC4)} />
            </div>
          </div>

          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Hiring PoP — Old vs New + Annual ({periodLabel}) <InfoBtn tip="<strong>Purpose</strong>Old vs new hiring plan comparison." /></div></div>
              <ChartCanvas config={c5Config} height="300px" />
              <InsightBox text={capHiringInsight(dC5)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Hiring Breakdown <InfoBtn tip="<strong>Purpose</strong>Approved vs non-approved hiring, with total hiring as a trend line." /></div></div>
              <ChartCanvas config={c6Config} height="300px" />
              <InsightBox text={capHiringBreakdownInsight(dC6)} />
            </div>
          </div>

          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Capacity % + OSP Mix % — Old vs New <InfoBtn tip="<strong>Purpose</strong>Capacity % on the left axis, OSP mix % on the right." /></div></div>
              <ChartCanvas config={c7Config} height="300px" />
              <InsightBox text={capCapOspInsight(dC7)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">L1 Exit HC + DB/OSP Split <InfoBtn tip="<strong>Purpose</strong>L1 exit headcount with exit PoP% overlay." /></div></div>
              <ChartCanvas config={c8Config} height="300px" />
              <InsightBox text={capExitInsight(dC8)} />
            </div>
          </div>

          {cqnDetailCard}
        </>
      ) : (
        <>
          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Volume PoP% + HC PoP% Combined ({periodLabel}) <InfoBtn tip="<strong>Purpose</strong>Volume and headcount period-over-period % change." /></div></div>
              <ChartCanvas config={a1Config} height="300px" />
              <InsightBox text={capPopInsight(dA1)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Hiring PoP Absolute Change ({periodLabel}) <InfoBtn tip="<strong>Purpose</strong>Absolute period-over-period hiring change." /></div></div>
              <ChartCanvas config={a2Config} height="300px" />
              <InsightBox text={capHiringPopInsight(dA2)} />
            </div>
          </div>

          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Planner Gap Distribution + {periodWord} Trend <InfoBtn tip="<strong>Purpose</strong>Gap trend by planner across periods." /></div></div>
              <ChartCanvas config={a3Config} height="360px" />
              <InsightBox text={capPlannerGapInsight(dA3)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Top CQN Gaps <InfoBtn tip="<strong>Purpose</strong>Largest queue gaps this period." /></div></div>
              <ChartCanvas config={a4Config} height="360px" />
              <InsightBox text={capTopGapsInsight(capA4)} />
            </div>
          </div>

          <div className="s-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Offering Gap + {periodWord} Breakdown <InfoBtn tip="<strong>Purpose</strong>Gap contribution by offering, stacked by period." /></div></div>
              <ChartCanvas config={a5Config} height="300px" />
              <InsightBox text={capOfferingGapInsight(dA5)} />
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Planner Queue Gaps + Subtotals <InfoBtn tip="<strong>Purpose</strong>Planner-level queue gap subtotals by period." /></div></div>
              <ChartCanvas config={a6Config} height="360px" />
              <InsightBox text={capPlannerSubtotalsInsight(capA6)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '14px' }}>
            <div className="card-header"><div className="card-title">{periodWord} Gap Trend + Top Queue Breakdown <InfoBtn tip="<strong>Purpose</strong>Total gap trend with the top contributing queues overlaid." /></div></div>
            <ChartCanvas config={a7Config} height="360px" />
            <InsightBox text={capWeeklyGapInsight(dA7)} />
          </div>

          {cqnDetailCard}
        </>
      )}
    </div>
  );
}
