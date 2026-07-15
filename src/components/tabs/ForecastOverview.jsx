import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import ChartCanvas from '../charts/ChartCanvas';
import WorldMap from '../charts/WorldMap';
import HistVolTable from './HistVolTable';
import {
  buildCallVolumeConfig, buildChannelMixConfig, buildDbOspVolumeConfig, buildDmsConfig,
  buildPartnerConfig, buildHistTrendConfig,
} from '../charts/chartConfigs';

export default function ForecastOverview() {
  const { theme, curPeriod, curRegion, chartRegionFor, setChartRegion, curHistPlan, setCurHistPlan, openApproval, openPartnerRca } = useApp();
  const [geoView, setGeoView] = useState('region');

  const kpi = D[curPeriod][curRegion].kpi;

  const regionC1 = chartRegionFor('c1');
  const regionH1 = chartRegionFor('h1');
  const regionC5 = chartRegionFor('c5');
  const regionNDms = chartRegionFor('nDms');
  const regionNPartner = chartRegionFor('nPartner');
  const regionNHist = chartRegionFor('nHist');

  const c1Config = useMemo(() => buildCallVolumeConfig(D[curPeriod][regionC1], theme), [curPeriod, regionC1, theme]);
  const h1Config = useMemo(() => buildChannelMixConfig(D[curPeriod][regionH1], theme), [curPeriod, regionH1, theme]);
  const c5Config = useMemo(() => buildDbOspVolumeConfig(D[curPeriod][regionC5], theme), [curPeriod, regionC5, theme]);
  const nDmsConfig = useMemo(() => buildDmsConfig(D[curPeriod][regionNDms], theme), [curPeriod, regionNDms, theme]);
  const nPartnerConfig = useMemo(() => buildPartnerConfig(D[curPeriod][regionNPartner], theme), [curPeriod, regionNPartner, theme]);
  const nHistConfig = useMemo(() => buildHistTrendConfig(D[curPeriod][regionNHist], theme, curHistPlan), [curPeriod, regionNHist, theme, curHistPlan]);

  return (
    <div className="tab-panel active">
      <div className="ai-story">
        <div className="ai-icon-box">✦</div>
        <div>
          <div className="ai-story-title">AI Business Story</div>
          <div className="ai-story-text">This period, contact center handled <strong>{kpi.vol}</strong> calls. Accuracy at <strong>{kpi.acc}</strong> — below 80% target.</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">FORECAST ACCURACY</div><div className="kpi-value">{kpi.acc}</div><div className="kpi-sub">{kpi.accSub}</div></div>
        <div className="kpi-card"><div className="kpi-label">CALL VOLUME</div><div className="kpi-value">{kpi.vol}</div><div className="kpi-sub">{kpi.volSub}</div></div>
        <div className="kpi-card"><div className="kpi-label">ACTIVE QUEUES</div><div className="kpi-value">{kpi.q}</div><div className="kpi-sub">{kpi.qSub}</div></div>
        <div className="kpi-card"><div className="kpi-label">VARIANCE</div><div className="kpi-value">{kpi.var}</div><div className="kpi-sub">Over-forecast bias</div></div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">🌍 Country &amp; Region Forecast Accuracy <InfoBtn tip="<strong>Purpose</strong>Forecast accuracy by geography. Toggle Country/Region to change map granularity; % labels shown directly on the map." /></div>
          <div className="card-dd">
            <div className="plan-sel">
              <button className={'plan-btn' + (geoView === 'country' ? ' active' : '')} onClick={() => setGeoView('country')}>Country</button>
              <button className={'plan-btn' + (geoView === 'region' ? ' active' : '')} onClick={() => setGeoView('region')}>Region</button>
            </div>
          </div>
        </div>
        <WorldMap theme={theme} mode={geoView} />
        <div className="geo-grid">
          <div className="geo-card" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid var(--accent-green)' }}><div className="geo-label" style={{ color: 'var(--accent-green)' }}>AMER</div><div className="geo-value">78%</div></div>
          <div className="geo-card" style={{ background: 'rgba(245,158,11,.1)', border: '1px solid var(--accent-orange)' }}><div className="geo-label" style={{ color: 'var(--accent-orange)' }}>EMEA</div><div className="geo-value">66%</div></div>
          <div className="geo-card" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--accent-red)' }}><div className="geo-label" style={{ color: 'var(--accent-red)' }}>APJ</div><div className="geo-value">48%</div></div>
          <div className="geo-card" style={{ background: 'rgba(139,92,246,.1)', border: '1px solid var(--accent-purple)' }}><div className="geo-label" style={{ color: 'var(--accent-purple)' }}>GLOBAL</div><div className="geo-value">63%</div></div>
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Call Volume Trend <InfoBtn tip="<strong>Purpose</strong>Workload vs handle rate with Abandonment% and Attainment%." /></div>
            <div className="card-dd"><RegionSelect value={regionC1} onChange={(v) => setChartRegion('c1', v)} /></div>
          </div>
          <div className="chart-container" style={{ height: '220px' }}><ChartCanvas config={c1Config} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📈 Historical Trend <InfoBtn tip="<strong>Purpose</strong>Multi-line historical comparison with plan toggle." /></div>
          <div className="card-dd">
            <div className="plan-sel">
              <button className={'plan-btn' + (curHistPlan === 'plan1' ? ' active' : '')} onClick={() => setCurHistPlan('plan1')}>FY27 Jul Pro</button>
              <button className={'plan-btn' + (curHistPlan === 'plan2' ? ' active' : '')} onClick={() => setCurHistPlan('plan2')}>FY27 Jun Pro</button>
              <button className={'plan-btn' + (curHistPlan === 'plan3' ? ' active' : '')} onClick={() => setCurHistPlan('plan3')}>FY27 Aug Pro</button>
            </div>
            <RegionSelect value={regionNHist} onChange={(v) => setChartRegion('nHist', v)} style={{ marginLeft: '4px' }} />
          </div>
        </div>
        <div className="chart-container" style={{ height: '240px' }}><ChartCanvas config={nHistConfig} /></div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📊 Historical Volume <InfoBtn tip="<strong>Purpose</strong>Volume data by period with drill-down." /></div>
          <div className="card-dd">
            <select className="hv-queue-sel" defaultValue="all">
              <option value="all">All Queues</option>
              <option value="Q-001">Q-001</option>
              <option value="Q-027">Q-027</option>
            </select>
          </div>
        </div>
        <HistVolTable period={curPeriod} />
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Channel Mix <InfoBtn tip="<strong>Purpose</strong>Channel volume split." /></div>
            <div className="card-dd">
              <select className="f-sel" defaultValue="All">
                <option value="All">All</option><option value="Pro">Pro</option><option value="Premium">Premium</option><option value="Basic">Basic</option><option value="PON">PON</option>
              </select>
              <RegionSelect value={regionH1} onChange={(v) => setChartRegion('h1', v)} />
            </div>
          </div>
          <div className="chart-container"><ChartCanvas config={h1Config} /></div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 DB vs OSP <InfoBtn tip="<strong>Purpose</strong>DB vs OSP performance." /></div>
            <div className="card-dd">
              <select className="f-sel" defaultValue="All">
                <option value="All">All</option><option value="CNX">CNX</option><option value="Brightway">Brightway</option><option value="CGS">CGS</option>
              </select>
            </div>
          </div>
          <div className="chart-container" style={{ height: '140px' }}><ChartCanvas config={c5Config} /></div>
          <div className="dbosp-metrics">
            <div className="dbosp-metric-card">
              <div className="dbosp-metric-label">Accuracy</div>
              <div className="dbosp-metric-row"><span className="dbosp-metric-name">DB</span><span className="dbosp-metric-val" style={{ color: 'var(--accent-blue)' }}>72%</span></div>
              <div className="dbosp-bar-wrap"><div className="dbosp-bar" style={{ width: '72%', background: 'var(--accent-blue)' }}></div></div>
              <div className="dbosp-metric-row" style={{ marginTop: '6px' }}><span className="dbosp-metric-name">OSP</span><span className="dbosp-metric-val" style={{ color: 'var(--accent-orange)' }}>55%</span></div>
              <div className="dbosp-bar-wrap"><div className="dbosp-bar" style={{ width: '55%', background: 'var(--accent-orange)' }}></div></div>
            </div>
            <div className="dbosp-metric-card">
              <div className="dbosp-metric-label">Abandon Rate</div>
              <div className="dbosp-metric-row"><span className="dbosp-metric-name">DB</span><span className="dbosp-metric-val" style={{ color: 'var(--accent-green)' }}>5.2%</span></div>
              <div className="dbosp-bar-wrap"><div className="dbosp-bar" style={{ width: '17%', background: 'var(--accent-green)' }}></div></div>
              <div className="dbosp-metric-row" style={{ marginTop: '6px' }}><span className="dbosp-metric-name">OSP</span><span className="dbosp-metric-val" style={{ color: 'var(--accent-red)' }}>12.4%</span></div>
              <div className="dbosp-bar-wrap"><div className="dbosp-bar" style={{ width: '41%', background: 'var(--accent-red)' }}></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Partner Minimum <InfoBtn tip="<strong>Purpose</strong>Actual vs Forecast with % threshold. Click bar for RCA." /></div>
            <div className="card-dd"><RegionSelect value={regionNPartner} onChange={(v) => setChartRegion('nPartner', v)} /></div>
          </div>
          <div className="chart-container" style={{ height: '210px' }}>
            <ChartCanvas config={nPartnerConfig} onClick={(evt, els) => { if (els.length) openPartnerRca(els[0].index); }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 DMS Scorecard <InfoBtn tip="<strong>Purpose</strong>Contact disposition categories." /></div>
            <div className="card-dd"><RegionSelect value={regionNDms} onChange={(v) => setChartRegion('nDms', v)} /></div>
          </div>
          <div className="chart-container" style={{ height: '210px' }}><ChartCanvas config={nDmsConfig} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header"><div className="card-title">Queue Performance <InfoBtn tip="<strong>Purpose</strong>Queue-level data." /></div></div>
        <div className="tw">
          <table>
            <thead><tr><th>Queue</th><th>Name</th><th>Region</th><th>Forecast</th><th>Actual</th><th>Acc%</th><th>Status</th><th>CLCA</th></tr></thead>
            <tbody>
              <tr>
                <td>Q-001</td><td>Enterprise Voice T1</td><td>AMER</td><td>12,400</td><td>12,100</td><td>97.6%</td>
                <td><span className="dot dot-g"></span></td>
                <td><button className="btn-a" onClick={() => openApproval('CA-001', 'Q-001', 'Low')}>CLCA</button></td>
              </tr>
              <tr>
                <td>Q-027</td><td>Commercial Voice T2</td><td>APJ</td><td>15,600</td><td>9,200</td><td>59.0%</td>
                <td><span className="dot dot-r"></span></td>
                <td><button className="btn-a" onClick={() => openApproval('CA-003', 'Q-027', 'High')}>CLCA</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
