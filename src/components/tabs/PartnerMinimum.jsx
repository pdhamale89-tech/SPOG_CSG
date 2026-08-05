import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_PERIODS, partnerAgg, queueAgg } from '../../data/partnerLockData';
import { buildPartnerLockConfig } from '../charts/chartConfigs';
import ChartCanvas from '../charts/ChartCanvas';
import InfoBtn from '../common/InfoBtn';

// The chart follows the global Weekly/Monthly/QTR filter instead of owning
// its own granularity tabs; PARTNER_PERIODS just uses "quarterly" as the key.
const GRAN_MAP = { weekly: 'weekly', monthly: 'monthly', qtr: 'quarterly' };
const TARGET_PCT = 80;

function sum(arr, key) {
  return arr.reduce((s, x) => s + x[key], 0);
}

function changeTone(diff) {
  if (diff > 2) return { symbol: '▲', color: 'var(--accent-green)' };
  if (diff < -2) return { symbol: '▼', color: 'var(--accent-red)' };
  return { symbol: '●', color: 'var(--text-secondary)' };
}

export default function PartnerMinimum() {
  const { theme, curPeriod } = useApp();
  const gran = GRAN_MAP[curPeriod] || 'weekly';
  const period = PARTNER_PERIODS[gran];
  const [periodIdx, setPeriodIdx] = useState(period.default);
  const [view, setView] = useState('partner');
  const [selPartner, setSelPartner] = useState(null);
  const isPartnerView = view === 'partner';

  // Reset to this granularity's default period and back out of any queue
  // drill-down whenever the global Weekly/Monthly/QTR toggle changes.
  useEffect(() => {
    setPeriodIdx(PARTNER_PERIODS[gran].default);
    setView('partner');
    setSelPartner(null);
  }, [gran]);

  const pKey = period.keys[periodIdx] ?? period.keys[period.default];
  const prevKey = periodIdx > 0 ? period.keys[periodIdx - 1] : null;

  const data = useMemo(
    () => (isPartnerView ? partnerAgg(pKey) : queueAgg(pKey, selPartner)),
    [pKey, isPartnerView, selPartner],
  );
  const config = useMemo(
    () => buildPartnerLockConfig(data, theme, isPartnerView, TARGET_PCT),
    [data, theme, isPartnerView],
  );
  const height = Math.max(200, data.length * 30 + 40);

  const totalQueues = isPartnerView ? sum(data, 'queues') : data.length;
  const totalLock = sum(data, 'lock');
  const totalActual = sum(data, 'actual');
  const overallPct = totalLock > 0 ? Math.round((totalActual / totalLock) * 100) : 0;
  const gap = totalLock - totalActual;
  const meetTarget = data.filter((d) => d.pct >= TARGET_PCT).length;

  let change = null;
  if (prevKey) {
    const prevData = isPartnerView ? partnerAgg(prevKey) : queueAgg(prevKey, selPartner);
    const prevLock = sum(prevData, 'lock');
    const prevActual = sum(prevData, 'actual');
    const prevPct = prevLock > 0 ? Math.round((prevActual / prevLock) * 100) : 0;
    change = { diff: overallPct - prevPct, ...changeTone(overallPct - prevPct) };
  }

  function handlePeriodChange(e) {
    setPeriodIdx(Number(e.target.value));
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

  const tip = '<strong>Purpose</strong>Lock% by partner, compare periods against an 80% target.'
    + (isPartnerView ? '<strong>Tip</strong>💡 Click a partner bar for more information' : '');

  return (
    <div>
      <div className="card-header">
        <div className="card-title">📊 Partner Minimum <InfoBtn tip={tip} /></div>
      </div>

      <div className="pm-summary">
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-blue)' }}>{totalQueues}</div><div className="pm-summary-lbl">Total Queues</div></div>
        {isPartnerView && <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-blue)' }}>{data.length}</div><div className="pm-summary-lbl">Partners</div></div>}
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-orange)' }}>{totalLock.toLocaleString()}</div><div className="pm-summary-lbl">Lock Offered</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-purple)' }}>{totalActual.toLocaleString()}</div><div className="pm-summary-lbl">Actual Offered</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: overallPct >= 70 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{overallPct}%</div><div className="pm-summary-lbl">Lock%</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: change ? change.color : 'var(--text-muted)' }}>{change ? `${change.symbol}${change.diff >= 0 ? '+' : ''}${change.diff}%` : '—'}</div><div className="pm-summary-lbl">vs Prev</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: 'var(--accent-red)' }}>{gap.toLocaleString()}</div><div className="pm-summary-lbl">Gap</div></div>
        <div className="pm-summary-item"><div className="pm-summary-val" style={{ color: meetTarget >= data.length / 2 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{meetTarget}/{data.length}</div><div className="pm-summary-lbl">On Target</div></div>
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
        {!isPartnerView && <button className="btn-a" style={{ marginLeft: 'auto' }} onClick={goBack}>← Back to Partners</button>}
      </div>

      <ChartCanvas config={config} height={`${height}px`} onClick={handleBarClick} />

      <div className="pm-legend-row">
        <div className="pm-legend-item"><span className="dot dot-g"></span>≥ Target</div>
        <div className="pm-legend-item"><span className="dot dot-o"></span>50%–Target</div>
        <div className="pm-legend-item"><span className="dot dot-r"></span>&lt; 50%</div>
        <div className="pm-legend-item"><span className="pm-swatch-target"></span>Target ({TARGET_PCT}%)</div>
      </div>
    </div>
  );
}
