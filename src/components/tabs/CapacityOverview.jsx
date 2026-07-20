import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import InfoBtn from '../common/InfoBtn';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import { buildCapacityTrendConfig } from '../charts/chartConfigs';
import { capacityInsight } from '../../utils/insights';

export default function CapacityOverview() {
  const { theme, curPeriod, curRegion } = useApp();
  const d = D[curPeriod][curRegion];
  const cp1Config = useMemo(() => buildCapacityTrendConfig(d, theme), [d, theme]);

  return (
    <div className="tab-panel active">
      <div className="ai-story">
        <div className="ai-icon-box">✦</div>
        <div><div className="ai-story-title">Capacity</div><div className="ai-story-text">SL 72%. Gap −5.8%.</div></div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">SERVICE LEVEL</div><div className="kpi-value">{d.kpi.sl}</div><div className="kpi-sub">▼ 8%</div></div>
        <div className="kpi-card"><div className="kpi-label">HC GAP</div><div className="kpi-value">{d.kpi.hc}</div><div className="kpi-sub">~26 FTEs</div></div>
        <div className="kpi-card"><div className="kpi-label">AHT</div><div className="kpi-value">{d.kpi.aht}</div><div className="kpi-sub">Target 10.0</div></div>
        <div className="kpi-card"><div className="kpi-label">UTIL</div><div className="kpi-value">{d.kpi.util}</div><div className="kpi-sub">Healthy</div></div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Capacity Trend <InfoBtn tip="<strong>Purpose</strong>Capacity vs demand." /></div></div>
          <ChartCanvas config={cp1Config} />
          <InsightBox text={capacityInsight(d)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Utilization <InfoBtn tip="<strong>Purpose</strong>Regional utilization." /></div></div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>AMER — 78%</div>
            <div className="util-track"><div className="util-fill" style={{ width: '78%', background: 'var(--accent-green)' }}>78%</div></div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '6px' }}>EMEA — 71%</div>
            <div className="util-track"><div className="util-fill" style={{ width: '71%', background: 'var(--accent-blue)' }}>71%</div></div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '6px' }}>APJ — 96%</div>
            <div className="util-track"><div className="util-fill" style={{ width: '96%', background: 'var(--accent-red)' }}>96%</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
