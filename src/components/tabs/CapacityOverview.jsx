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
  buildCapHiringConfig, buildCapHiringBreakdownConfig, buildCapCapacityConfig, buildCapOspMixConfig,
  buildCapHeadcountBifurcationConfig, buildCapPopConfig,
} from '../charts/chartConfigs';
import {
  CAP_KPIS, CAP_MINI_STATS, capC1, capC2, capC3, capC4, capC5, capC6, capC7, capHcBifurcation,
  capA1, capWeeklyTable,
  capLabelsFor, CAP_PERIOD_LABEL, CAP_PERIOD_WORD, CAP_OVERALL, CAP_VOL_PERIODS, CAP_VOL_KEYS,
  CAP_YEARS, CAP_YEAR_FACTOR,
  CAP_HC_TOTAL_KEYS, CAP_EXCESS_HC_KEYS, CAP_LOA_EXIT_KEYS, CAP_TRAINING_KEYS, CAP_HIRING_KEYS,
  CAP_APPROVED_HIRING_KEYS, CAP_NONAPPROVED_HIRING_KEYS,
  CAP_CAPACITY_KEYS, CAP_OSP_PCT_KEYS,
  CAP_HC_BIF_TOTAL_KEYS, CAP_HC_BIF_AVG_KEYS, CAP_HC_BIF_EXIT_KEYS, CAP_HC_BIF_EXCESS_KEYS,
} from '../../data/capacityData';
import {
  capVolumeInsight, capHcInsight, capExcessInsight, capHiringInsight,
  capHiringBreakdownInsight, capCapacityInsight, capOspMixInsight, capHeadcountBifurcationInsight, capPopInsight,
} from '../../utils/insights';

const DIR_ARROW = { up: '▲ ', dn: '▼ ', flat: '— ' };

// Overall isn't "no plan selected" -- Jul and Aug are two alternate plan
// vintages forecasting the same periods, not additive sub-totals, so
// Overall is their average (a blended baseline), not a sum and not a blank
// state. Every metric below is that same kind of "two forecasts of one
// number" relationship, so average is the correct blend in all of them.
function overallSeries(julArr, augArr) {
  return julArr.map((v, i) => {
    const b = augArr[i];
    return v == null || b == null ? null : Math.round((v + b) / 2);
  });
}

// Looks up a single metric's array for a given plan slot (Jul/Aug/Overall)
// given the {Jul: 'fieldName', Aug: 'fieldName'} key map for that metric.
function seriesFor(keyMap, dataObj, plan) {
  if (plan === CAP_OVERALL) return overallSeries(dataObj[keyMap.Jul], dataObj[keyMap.Aug]);
  return dataObj[keyMap[plan]];
}

function volumeSeriesFor(plan) {
  if (plan === CAP_OVERALL) {
    return {
      db: overallSeries(capC1[CAP_VOL_KEYS.Jul.db], capC1[CAP_VOL_KEYS.Aug.db]),
      osp: overallSeries(capC1[CAP_VOL_KEYS.Jul.osp], capC1[CAP_VOL_KEYS.Aug.osp]),
      total: overallSeries(capC2[CAP_VOL_KEYS.Jul.total], capC2[CAP_VOL_KEYS.Aug.total]),
    };
  }
  const k = CAP_VOL_KEYS[plan];
  return { db: capC1[k.db], osp: capC1[k.osp], total: capC2[k.total] };
}

// Year 1/Year 2 are a second comparison axis alongside Plan Name 1/Plan
// Name 2: every chart's "A" series is Plan Name 1 as of Year 1, and "B" is
// Plan Name 2 as of Year 2. There's no separate per-year dataset -- this
// just scales the same base numbers by CAP_YEAR_FACTOR (FY26 = 1, the
// dataset's native scale), same "numbers stay put" approach as the period
// (Weekly/Monthly/QTR/Yearly) relabeling elsewhere in this file.
function scaleForYear(arr, year) {
  const factor = CAP_YEAR_FACTOR[year] ?? 1;
  if (factor === 1) return arr;
  return arr.map((v) => (v == null ? null : Math.round(v * factor)));
}

export default function CapacityOverview() {
  const { theme, curPeriod, fiscalYear, openHeadcountDetail } = useApp();
  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [planName1, setPlanName1] = useState(CAP_VOL_PERIODS[0]);
  const [planName2, setPlanName2] = useState(CAP_OVERALL);
  const [year1, setYear1] = useState('FY26');
  const [year2, setYear2] = useState('FY26');
  // Comparing years only makes sense once you're already looking at yearly
  // cadence -- so the Year 1/Year 2 dropdowns (and their effect on every
  // chart below) only kick in when the Weekly/Monthly/QTR/Yearly toggle is
  // set to Yearly. Otherwise both effectively pin to FY26 (factor 1, no-op)
  // regardless of what's stored, so flipping back to Yearly later doesn't
  // resurrect a stale year pick from an unrelated session.
  const yearFilterActive = curPeriod === 'yearly';
  const effectiveYear1 = yearFilterActive ? year1 : 'FY26';
  const effectiveYear2 = yearFilterActive ? year2 : 'FY26';

  const periodLabel = CAP_PERIOD_LABEL[curPeriod];
  const periodWord = CAP_PERIOD_WORD[curPeriod];
  const capKpis = CAP_KPIS[curPeriod];
  const capMiniStats = CAP_MINI_STATS[curPeriod];
  const L6 = useMemo(() => capLabelsFor(curPeriod, 6, fiscalYear), [curPeriod, fiscalYear]);
  const L8 = useMemo(() => capLabelsFor(curPeriod, 8, fiscalYear), [curPeriod, fiscalYear]);
  // Headcount Bifurcation is its own standalone trend (not a Jul/Aug plan
  // comparison), with one more period than the other charts on this page,
  // so it gets its own period-label array sized to match.
  const L9 = useMemo(() => capLabelsFor(curPeriod, 9, fiscalYear), [curPeriod, fiscalYear]);

  const dC1 = useMemo(() => {
    const a = volumeSeriesFor(planName1);
    const b = volumeSeriesFor(planName2);
    return {
      labels: L6, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
      aDb: scaleForYear(a.db, effectiveYear1), aOsp: scaleForYear(a.osp, effectiveYear1),
      bDb: scaleForYear(b.db, effectiveYear2), bOsp: scaleForYear(b.osp, effectiveYear2),
      aTotal: scaleForYear(a.total, effectiveYear1), bTotal: scaleForYear(b.total, effectiveYear2),
    };
  }, [L6, planName1, planName2, effectiveYear1, effectiveYear2]);
  // The charts below don't have their own Compare Plans selector -- they
  // read the same Plan Name 1/Plan Name 2/Year 1/Year 2 chosen above the
  // Volume Comparison chart, so their legends and values stay in sync with
  // that one control.
  const dC3 = useMemo(() => ({
    ...capC3, labels: L8, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aTotalHc: scaleForYear(seriesFor(CAP_HC_TOTAL_KEYS, capC3, planName1), effectiveYear1),
    bTotalHc: scaleForYear(seriesFor(CAP_HC_TOTAL_KEYS, capC3, planName2), effectiveYear2),
  }), [L8, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dC4 = useMemo(() => ({
    ...capC4, labels: L8, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aExcessHc: scaleForYear(seriesFor(CAP_EXCESS_HC_KEYS, capC4, planName1), effectiveYear1),
    bExcessHc: scaleForYear(seriesFor(CAP_EXCESS_HC_KEYS, capC4, planName2), effectiveYear2),
    aLoaExit: scaleForYear(seriesFor(CAP_LOA_EXIT_KEYS, capC4, planName1), effectiveYear1),
    bLoaExit: scaleForYear(seriesFor(CAP_LOA_EXIT_KEYS, capC4, planName2), effectiveYear2),
    aTraining: scaleForYear(seriesFor(CAP_TRAINING_KEYS, capC4, planName1), effectiveYear1),
    bTraining: scaleForYear(seriesFor(CAP_TRAINING_KEYS, capC4, planName2), effectiveYear2),
  }), [L8, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dC5 = useMemo(() => ({
    ...capC5, labels: L8, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aHiring: scaleForYear(seriesFor(CAP_HIRING_KEYS, capC5, planName1), effectiveYear1),
    bHiring: scaleForYear(seriesFor(CAP_HIRING_KEYS, capC5, planName2), effectiveYear2),
  }), [L8, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dC6 = useMemo(() => ({
    labels: L8, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aApproved: scaleForYear(seriesFor(CAP_APPROVED_HIRING_KEYS, capC6, planName1), effectiveYear1),
    bApproved: scaleForYear(seriesFor(CAP_APPROVED_HIRING_KEYS, capC6, planName2), effectiveYear2),
    aNonApproved: scaleForYear(seriesFor(CAP_NONAPPROVED_HIRING_KEYS, capC6, planName1), effectiveYear1),
    bNonApproved: scaleForYear(seriesFor(CAP_NONAPPROVED_HIRING_KEYS, capC6, planName2), effectiveYear2),
  }), [L8, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dC7 = useMemo(() => ({
    ...capC7, labels: L8, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aCapPct: scaleForYear(seriesFor(CAP_CAPACITY_KEYS, capC7, planName1), effectiveYear1),
    bCapPct: scaleForYear(seriesFor(CAP_CAPACITY_KEYS, capC7, planName2), effectiveYear2),
    aOspPct: scaleForYear(seriesFor(CAP_OSP_PCT_KEYS, capC7, planName1), effectiveYear1),
    bOspPct: scaleForYear(seriesFor(CAP_OSP_PCT_KEYS, capC7, planName2), effectiveYear2),
  }), [L8, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dHc = useMemo(() => ({
    labels: L9, periodA: planName1, periodB: planName2, year1: effectiveYear1, year2: effectiveYear2,
    aTotalHc: scaleForYear(seriesFor(CAP_HC_BIF_TOTAL_KEYS, capHcBifurcation, planName1), effectiveYear1),
    bTotalHc: scaleForYear(seriesFor(CAP_HC_BIF_TOTAL_KEYS, capHcBifurcation, planName2), effectiveYear2),
    aL1HcAvg: scaleForYear(seriesFor(CAP_HC_BIF_AVG_KEYS, capHcBifurcation, planName1), effectiveYear1),
    bL1HcAvg: scaleForYear(seriesFor(CAP_HC_BIF_AVG_KEYS, capHcBifurcation, planName2), effectiveYear2),
    aL1HcExit: scaleForYear(seriesFor(CAP_HC_BIF_EXIT_KEYS, capHcBifurcation, planName1), effectiveYear1),
    bL1HcExit: scaleForYear(seriesFor(CAP_HC_BIF_EXIT_KEYS, capHcBifurcation, planName2), effectiveYear2),
    aExcessHc: scaleForYear(seriesFor(CAP_HC_BIF_EXCESS_KEYS, capHcBifurcation, planName1), effectiveYear1),
    bExcessHc: scaleForYear(seriesFor(CAP_HC_BIF_EXCESS_KEYS, capHcBifurcation, planName2), effectiveYear2),
  }), [L9, planName1, planName2, effectiveYear1, effectiveYear2]);
  const dA1 = useMemo(() => ({ ...capA1, labels: L8 }), [L8]);
  const detailTable = useMemo(() => ({ ...capWeeklyTable, cols: L6 }), [L6]);

  const c1Config = useMemo(() => buildCapVolumeConfig(dC1, theme), [dC1, theme]);
  const c3Config = useMemo(() => buildCapHcConfig(dC3, theme), [dC3, theme]);
  const c4Config = useMemo(() => buildCapExcessConfig(dC4, theme), [dC4, theme]);
  const c5Config = useMemo(() => buildCapHiringConfig(dC5, theme), [dC5, theme]);
  const c6Config = useMemo(() => buildCapHiringBreakdownConfig(dC6, theme), [dC6, theme]);
  const c7Config = useMemo(() => buildCapCapacityConfig(dC7, theme), [dC7, theme]);
  const c7bConfig = useMemo(() => buildCapOspMixConfig(dC7, theme), [dC7, theme]);
  const c8Config = useMemo(() => buildCapHeadcountBifurcationConfig(dHc, theme), [dHc, theme]);
  const a1Config = useMemo(() => buildCapPopConfig(dA1, theme), [dA1, theme]);

  function handleHcClick(evt, els) {
    if (!els.length) return;
    const idx = els[0].index;
    openHeadcountDetail({
      label: dHc.labels[idx], periodA: dHc.periodA, periodB: dHc.periodB, year1: dHc.year1, year2: dHc.year2,
      aAvg: dHc.aL1HcAvg[idx], aExit: dHc.aL1HcExit[idx], aExcess: dHc.aExcessHc[idx], aTotal: dHc.aTotalHc[idx],
      bAvg: dHc.bL1HcAvg[idx], bExit: dHc.bL1HcExit[idx], bExcess: dHc.bExcessHc[idx], bTotal: dHc.bTotalHc[idx],
    });
  }

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
            <option value={CAP_OVERALL}>Overall</option>
            {CAP_VOL_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Plan Name 2</label>
          <select value={planName2} onChange={(e) => setPlanName2(e.target.value)}>
            <option value={CAP_OVERALL}>Overall</option>
            {CAP_VOL_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {yearFilterActive && (
          <>
            <div className="filter-group">
              <label>Year 1</label>
              <select value={year1} onChange={(e) => setYear1(e.target.value)}>
                {CAP_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Year 2</label>
              <select value={year2} onChange={(e) => setYear2(e.target.value)}>
                {CAP_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="kpi-grid">
        {capKpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={DIR_ARROW[k.dir] + k.delta} sub={k.sub} />
        ))}
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Volume Comparison
              {' '}
              <InfoBtn tip="<strong>Purpose</strong>DB/OSP volume plus the Total Volume trend for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above; Overall is the average of Jul and Aug." />
            </div>
          </div>
          <ChartCanvas config={c1Config} height="300px" />
          <InsightBox text={capVolumeInsight(dC1)} />
        </div>
      </div>

      <div className="mini-row">
        {capMiniStats.map((m) => (
          <MiniStat key={m.label} label={m.label} value={m.value} tone={m.tone} tip={m.tip} />
        ))}
      </div>
      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">HC Avg, Exit &amp; Total <InfoBtn tip="<strong>Purpose</strong>Headcount average and exit trend with total headcount overlay." /></div></div>
          <ChartCanvas config={c3Config} height="300px" />
          <InsightBox text={capHcInsight(dC3)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Excess HC + LOA + Training <InfoBtn tip="<strong>Purpose</strong>Excess headcount, LOA exits and training load for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above." /></div></div>
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
          <div className="card-header"><div className="card-title">Hiring Breakdown <InfoBtn tip="<strong>Purpose</strong>Approved vs non-approved hiring, with total hiring as a trend line, for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above." /></div></div>
          <ChartCanvas config={c6Config} height="300px" />
          <InsightBox text={capHiringBreakdownInsight(dC6)} />
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Capacity Comparison <InfoBtn tip="<strong>Purpose</strong>Capacity % for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above, plus the variance between them." /></div></div>
          <ChartCanvas config={c7Config} height="300px" />
          <InsightBox text={capCapacityInsight(dC7)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">OSP Mix Comparison <InfoBtn tip="<strong>Purpose</strong>OSP mix % for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above." /></div></div>
          <ChartCanvas config={c7bConfig} height="300px" />
          <InsightBox text={capOspMixInsight(dC7)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Headcount Bifurcation{' '}
              <InfoBtn tip="<strong>Purpose</strong>Total HC alongside L1 HC Avg/Exit and Excess HC for the Plan Name 1/Plan Name 2 and Year 1/Year 2 selection above.<strong>Tip</strong>💡 Click a bar or point for that period's full breakdown." />
            </div>
          </div>
          <ChartCanvas config={c8Config} height="300px" onClick={handleHcClick} />
          <InsightBox text={capHeadcountBifurcationInsight(dHc)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header"><div className="card-title">Volume PoP% and HC PoP% <InfoBtn tip="<strong>Purpose</strong>HC Avg/Exit PoP% as bars on the left axis; DB/OSP/Total Volume PoP% as lines on the right axis." /></div></div>
          <ChartCanvas config={a1Config} height="300px" />
          <InsightBox text={capPopInsight(dA1)} />
        </div>
      </div>

      {cqnDetailCard}
    </div>
  );
}
