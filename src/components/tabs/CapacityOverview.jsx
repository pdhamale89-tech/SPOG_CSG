import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import InfoBtn from '../common/InfoBtn';
import KpiCard from '../common/KpiCard';
import MiniStat from '../common/MiniStat';
import DownloadBtn from '../common/DownloadBtn';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildCapVolumeConfig, buildCapHcConfig, buildCapExcessConfig,
  buildCapHiringConfig, buildCapHiringBreakdownConfig, buildCapCapacityConfig, buildCapOspMixConfig, buildCapExitConfig,
  buildCapPopConfig,
} from '../charts/chartConfigs';
import {
  CAP_KPIS, CAP_MINI_STATS, capC1, capC2, capC3, capC4, capC5, capC6, capC7, capC8,
  capA1, capWeeklyTable,
  capLabelsFor, CAP_PERIOD_LABEL, CAP_PERIOD_WORD, CAP_VOL_PERIODS, CAP_VOL_KEYS,
} from '../../data/capacityData';
import {
  capVolumeInsight, capHcInsight, capExcessInsight, capHiringInsight,
  capHiringBreakdownInsight, capCapacityInsight, capOspMixInsight, capExitInsight, capPopInsight,
} from '../../utils/insights';

const DIR_ARROW = { up: '▲ ', dn: '▼ ', flat: '— ' };

export default function CapacityOverview() {
  const { theme, curPeriod, fiscalYear } = useApp();
  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [planName1, setPlanName1] = useState(CAP_VOL_PERIODS[0]);
  const [planName2, setPlanName2] = useState(CAP_VOL_PERIODS[1]);

  const periodLabel = CAP_PERIOD_LABEL[curPeriod];
  const periodWord = CAP_PERIOD_WORD[curPeriod];
  const capKpis = CAP_KPIS[curPeriod];
  const capMiniStats = CAP_MINI_STATS[curPeriod];
  const L6 = useMemo(() => capLabelsFor(curPeriod, 6, fiscalYear), [curPeriod, fiscalYear]);
  const L8 = useMemo(() => capLabelsFor(curPeriod, 8, fiscalYear), [curPeriod, fiscalYear]);

  const dC1 = useMemo(() => {
    const a = CAP_VOL_KEYS[planName1];
    const b = CAP_VOL_KEYS[planName2];
    return {
      labels: L6,
      periodA: planName1,
      periodB: planName2,
      aDb: capC1[a.db], aOsp: capC1[a.osp], bDb: capC1[b.db], bOsp: capC1[b.osp],
      aTotal: capC2[a.total], bTotal: capC2[b.total],
    };
  }, [L6, planName1, planName2]);
  const dC3 = useMemo(() => ({ ...capC3, labels: L8 }), [L8]);
  const dC4 = useMemo(() => ({ ...capC4, labels: L8 }), [L8]);
  const dC5 = useMemo(() => ({ ...capC5, labels: L8 }), [L8]);
  const dC6 = useMemo(() => ({ ...capC6, labels: L8 }), [L8]);
  const dC7 = useMemo(() => ({ ...capC7, labels: L8 }), [L8]);
  const dC8 = useMemo(() => ({ ...capC8, labels: L8 }), [L8]);
  const dA1 = useMemo(() => ({ ...capA1, labels: L8 }), [L8]);
  const detailTable = useMemo(() => ({ ...capWeeklyTable, cols: L6 }), [L6]);

  const c1Config = useMemo(() => buildCapVolumeConfig(dC1, theme), [dC1, theme]);
  const c3Config = useMemo(() => buildCapHcConfig(dC3, theme), [dC3, theme]);
  const c4Config = useMemo(() => buildCapExcessConfig(dC4, theme), [dC4, theme]);
  const c5Config = useMemo(() => buildCapHiringConfig(dC5, theme), [dC5, theme]);
  const c6Config = useMemo(() => buildCapHiringBreakdownConfig(dC6, theme), [dC6, theme]);
  const c7Config = useMemo(() => buildCapCapacityConfig(dC7, theme), [dC7, theme]);
  const c7bConfig = useMemo(() => buildCapOspMixConfig(dC7, theme), [dC7, theme]);
  const c8Config = useMemo(() => buildCapExitConfig(dC8, theme), [dC8, theme]);
  const a1Config = useMemo(() => buildCapPopConfig(dA1, theme), [dA1, theme]);

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
      <div className="card-header">
        <div className="card-title">{periodWord} CQN Detail <InfoBtn tip="<strong>Purpose</strong>Per-queue gap detail. Click a column header to sort." /></div>
        <DownloadBtn
          filename="cqn-detail"
          title="Download CQN detail"
          rows={[
            ['Queue', ...detailTable.cols],
            ...sortedRows.map((r) => [r.queue, ...r.vals]),
            [capWeeklyTable.total.queue, ...capWeeklyTable.total.vals],
          ]}
        />
      </div>
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
      <div className="cap-plan-filters">
        <span className="cap-plan-filters-title">🆚 Compare Plans</span>
        <div className="filter-group">
          <label>Plan Name 1</label>
          <select value={planName1} onChange={(e) => setPlanName1(e.target.value)}>
            {CAP_VOL_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Plan Name 2</label>
          <select value={planName2} onChange={(e) => setPlanName2(e.target.value)}>
            {CAP_VOL_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        {capKpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={DIR_ARROW[k.dir] + k.delta} sub={k.sub} />
        ))}
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Volume Comparison <InfoBtn tip="<strong>Purpose</strong>DB/OSP volume plus the Total Volume trend, comparing the Plan Name 1/Plan Name 2 selection above." /></div>
          </div>
          <ChartCanvas config={c1Config} height="300px" />
          <InsightBox text={capVolumeInsight(dC1)} />
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
          <div className="card-header"><div className="card-title">Capacity % — Old vs New <InfoBtn tip="<strong>Purpose</strong>Capacity % under the old vs new plan." /></div></div>
          <ChartCanvas config={c7Config} height="300px" />
          <InsightBox text={capCapacityInsight(dC7)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">OSP Mix % — Old vs New <InfoBtn tip="<strong>Purpose</strong>OSP mix % under the old vs new plan." /></div></div>
          <ChartCanvas config={c7bConfig} height="300px" />
          <InsightBox text={capOspMixInsight(dC7)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header"><div className="card-title">L1 Exit HC + DB/OSP Split <InfoBtn tip="<strong>Purpose</strong>L1 exit headcount with exit PoP% overlay." /></div></div>
          <ChartCanvas config={c8Config} height="300px" />
          <InsightBox text={capExitInsight(dC8)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header"><div className="card-title">Volume PoP% + HC PoP% Combined ({periodLabel}) <InfoBtn tip="<strong>Purpose</strong>Volume and headcount period-over-period % change." /></div></div>
          <ChartCanvas config={a1Config} height="300px" />
          <InsightBox text={capPopInsight(dA1)} />
        </div>
      </div>

      {cqnDetailCard}
    </div>
  );
}
