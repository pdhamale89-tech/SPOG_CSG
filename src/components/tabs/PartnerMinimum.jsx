import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_PERIODS, partnerAgg, queueAgg } from '../../data/partnerLockData';
import { buildPartnerLockConfig } from '../charts/chartConfigs';
import ChartCanvas from '../charts/ChartCanvas';

const GRANULARITIES = [
  { key: 'weekly', label: '📅 Weekly' },
  { key: 'monthly', label: '📆 Monthly' },
  { key: 'quarterly', label: '📊 Quarterly' },
];

function sum(arr, key) {
  return arr.reduce((s, x) => s + x[key], 0);
}

function changeTone(diff) {
  if (diff > 2) return { symbol: '▲', color: 'var(--accent-green)' };
  if (diff < -2) return { symbol: '▼', color: 'var(--accent-red)' };
  return { symbol: '●', color: 'var(--text-secondary)' };
}

export default function PartnerMinimum() {
  const { theme } = useApp();
  const [gran, setGran] = useState('weekly');
  const [periodIdx, setPeriodIdx] = useState(PARTNER_PERIODS.weekly.default);
  const [compareKey, setCompareKey] = useState('none');
  const [view, setView] = useState('partner');
  const [selPartner, setSelPartner] = useState(null);

  const period = PARTNER_PERIODS[gran];
  const pKey = period.keys[periodIdx];
  const cKey = compareKey === 'none' ? null : compareKey;
  const prevKey = periodIdx > 0 ? period.keys[periodIdx - 1] : null;
  const isPartnerView = view === 'partner';

  const data = useMemo(
    () => (isPartnerView ? partnerAgg(pKey) : queueAgg(pKey, selPartner)),
    [pKey, isPartnerView, selPartner],
  );
  const compData = useMemo(
    () => (cKey ? (isPartnerView ? partnerAgg(cKey) : queueAgg(cKey, selPartner)) : null),
    [cKey, isPartnerView, selPartner],
  );
  const config = useMemo(
    () => buildPartnerLockConfig(data, compData, theme, isPartnerView),
    [data, compData, theme, isPartnerView],
  );
  const height = Math.max(280, data.length * 55 + 60);

  const totalLock = sum(data, 'lock');
  const totalActual = sum(data, 'actual');
  const overallPct = totalLock > 0 ? Math.round((totalActual / totalLock) * 100) : 0;
  const gap = totalLock - totalActual;
  const meetTarget = data.filter((d) => d.pct >= d.target).length;

  let change = null;
  if (prevKey) {
    const prevData = isPartnerView ? partnerAgg(prevKey) : queueAgg(prevKey, selPartner);
    const prevLock = sum(prevData, 'lock');
    const prevActual = sum(prevData, 'actual');
    const prevPct = prevLock > 0 ? Math.round((prevActual / prevLock) * 100) : 0;
    change = { diff: overallPct - prevPct, ...changeTone(overallPct - prevPct) };
  }

  const compareOptions = period.labels
    .map((label, i) => ({ key: period.keys[i], label }))
    .filter((_, i) => i !== periodIdx);

  function switchGran(g) {
    setGran(g);
    setPeriodIdx(PARTNER_PERIODS[g].default);
    setCompareKey('none');
    setView('partner');
    setSelPartner(null);
  }
  function handlePeriodChange(e) {
    setPeriodIdx(Number(e.target.value));
    setCompareKey('none');
  }
  function handleBarClick(evt, els) {
    if (isPartnerView && els.length && els[0].datasetIndex === 0) {
      setSelPartner(data[els[0].index].name);
      setView('queue');
    }
  }
  function goBack() {
    setView('partner');
    setSelPartner(null);
  }

  return (
    <div>
      <div className="plan-sel" style={{ marginBottom: '10px' }}>
        {GRANULARITIES.map((g) => (
          <button key={g.key} className={'plan-btn' + (gran === g.key ? ' active' : '')} onClick={() => switchGran(g.key)}>{g.label}</button>
        ))}
      </div>

      <div className="drill-bc">
        {isPartnerView
          ? <span className="current">All Partners</span>
          : <><span onClick={goBack}>All Partners</span><span className="sep">›</span><span className="current">{selPartner}</span></>}
        <span className="sep">|</span>{period.labels[periodIdx]}
      </div>

      <div className="card-dd" style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Period</span>
        <select className="f-sel" value={periodIdx} onChange={handlePeriodChange}>
          {period.labels.map((l, i) => <option key={l} value={i}>{l}</option>)}
        </select>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginLeft: '6px' }}>Compare</span>
        <select className="f-sel" value={compareKey} onChange={(e) => setCompareKey(e.target.value)}>
          <option value="none">None</option>
          {compareOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        {!isPartnerView && <button className="btn-a" style={{ marginLeft: 'auto' }} onClick={goBack}>← Back to Partners</button>}
      </div>

      <ChartCanvas config={config} height={`${height}px`} onClick={handleBarClick} />

      <div className="pm-legend-row">
        <div className="pm-legend-item"><span className="dot dot-g"></span>≥ Target</div>
        <div className="pm-legend-item"><span className="dot dot-o"></span>50%–Target</div>
        <div className="pm-legend-item"><span className="dot dot-r"></span>&lt; 50%</div>
        {cKey && <div className="pm-legend-item"><span className="pm-swatch-compare"></span>Compare</div>}
        <div className="pm-legend-item"><span className="pm-swatch-target"></span>Target</div>
        {isPartnerView && <div className="pm-hint">💡 Click a partner bar to drill down</div>}
      </div>

      <div className="pm-summary">
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-blue)' }}>{data.length}</div><div className="pm-summary-lbl">{isPartnerView ? 'Partners' : 'Queues'}</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-orange)' }}>{totalLock.toLocaleString()}</div><div className="pm-summary-lbl">Lock Offered</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-purple)' }}>{totalActual.toLocaleString()}</div><div className="pm-summary-lbl">Actual Offered</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: overallPct >= 70 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{overallPct}%</div><div className="pm-summary-lbl">Lock%</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: change ? change.color : 'var(--text-muted)' }}>{change ? `${change.symbol}${change.diff >= 0 ? '+' : ''}${change.diff}%` : '—'}</div><div className="pm-summary-lbl">vs Prev</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-red)' }}>{gap.toLocaleString()}</div><div className="pm-summary-lbl">Gap</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: meetTarget >= data.length / 2 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{meetTarget}/{data.length}</div><div className="pm-summary-lbl">On Target</div></div>
      </div>
    </div>
  );
}
