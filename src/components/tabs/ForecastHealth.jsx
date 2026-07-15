import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import InfoBtn from '../common/InfoBtn';
import ChartCanvas from '../charts/ChartCanvas';
import Gauge from '../charts/Gauge';
import InsightBox from '../common/InsightBox';
import { buildBiasConfig, buildStabilityConfig, buildDriftConfig } from '../charts/chartConfigs';
import { biasInsight, stabilityInsight, driftInsight } from '../../utils/insights';

export default function ForecastHealth() {
  const { theme, curPeriod, curRegion } = useApp();
  const d = D[curPeriod][curRegion];

  const biasConfig = useMemo(() => buildBiasConfig(d, theme), [d, theme]);
  const stabilityConfig = useMemo(() => buildStabilityConfig(d, theme), [d, theme]);
  const driftConfig = useMemo(() => buildDriftConfig(d, theme), [d, theme]);

  return (
    <div className="tab-panel active">
      <div className="ai-story">
        <div className="ai-icon-box">🏥</div>
        <div><div className="ai-story-title">Forecast Health</div><div className="ai-story-text">Score: <strong>62/100</strong>.</div></div>
      </div>

      <div className="health-grid">
        <div className="health-card">
          <div className="health-card-title">Overall</div>
          <Gauge value={62} max={100} theme={theme} />
          <div className="health-card-value" style={{ color: 'var(--accent-orange)' }}>62</div>
          <div className="health-status status-warning">⚠ Warning</div>
        </div>
        <div className="health-card">
          <div className="health-card-title">Confidence</div>
          <Gauge value={68} max={100} theme={theme} />
          <div className="health-card-value" style={{ color: 'var(--accent-orange)' }}>68%</div>
        </div>
        <div className="health-card">
          <div className="health-card-title">Data Quality</div>
          <Gauge value={87} max={100} theme={theme} />
          <div className="health-card-value" style={{ color: 'var(--accent-green)' }}>87%</div>
          <div className="health-status status-healthy">✓ Good</div>
        </div>
        <div className="health-card">
          <div className="health-card-title">Risk</div>
          <div className="traffic-light">
            <div className="tl-dot tl-green"></div>
            <div className="tl-dot tl-yellow on"></div>
            <div className="tl-dot tl-red"></div>
          </div>
          <div className="health-card-value" style={{ color: 'var(--accent-orange)', marginTop: '5px' }}>Medium</div>
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Bias Detection <InfoBtn tip="<strong>Purpose</strong>Over/under forecast." /></div></div>
          <div className="chart-container"><ChartCanvas config={biasConfig} /></div>
          <InsightBox text={biasInsight(d)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Stability <InfoBtn tip="<strong>Purpose</strong>Forecast consistency." /></div></div>
          <div className="chart-container"><ChartCanvas config={stabilityConfig} /></div>
          <InsightBox text={stabilityInsight(d)} />
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Drift <InfoBtn tip="<strong>Purpose</strong>Model degradation." /></div></div>
          <div className="chart-container"><ChartCanvas config={driftConfig} /></div>
          <InsightBox text={driftInsight(d)} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Risk Heat Map <InfoBtn tip="<strong>Purpose</strong>Regional risk matrix." /></div></div>
          <div className="risk-heatmap">
            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Region</div>
            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Acc</div>
            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Bias</div>
            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Stab</div>
            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Drift</div>

            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}>AMER</div>
            <div className="risk-cell" style={{ background: 'var(--accent-green)' }}>Low</div>
            <div className="risk-cell" style={{ background: 'var(--accent-green)' }}>Low</div>
            <div className="risk-cell" style={{ background: 'var(--accent-green)' }}>Low</div>
            <div className="risk-cell" style={{ background: 'var(--accent-orange)' }}>Med</div>

            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}>EMEA</div>
            <div className="risk-cell" style={{ background: 'var(--accent-orange)' }}>Med</div>
            <div className="risk-cell" style={{ background: 'var(--accent-orange)' }}>Med</div>
            <div className="risk-cell" style={{ background: 'var(--accent-orange)' }}>Med</div>
            <div className="risk-cell" style={{ background: 'var(--accent-orange)' }}>Med</div>

            <div className="risk-cell" style={{ background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}>APJ</div>
            <div className="risk-cell" style={{ background: 'var(--accent-red)' }}>High</div>
            <div className="risk-cell" style={{ background: 'var(--accent-red)' }}>High</div>
            <div className="risk-cell" style={{ background: 'var(--accent-red)' }}>High</div>
            <div className="risk-cell" style={{ background: 'var(--accent-red)' }}>High</div>
          </div>
        </div>
      </div>
    </div>
  );
}
