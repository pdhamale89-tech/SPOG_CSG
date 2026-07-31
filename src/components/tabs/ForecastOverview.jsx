import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D, dmsDrillData, hvData } from '../../data/forecastData';
import { buildPeriodLabels } from '../../utils/periodLabels';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import CountrySelect from '../common/CountrySelect';
import KpiCard from '../common/KpiCard';
import DownloadBtn from '../common/DownloadBtn';
import ChartCanvas from '../charts/ChartCanvas';
import WorldMap from '../charts/WorldMap';
import HistVolTable from './HistVolTable';
import PartnerMinimum from './PartnerMinimum';
import ContactVolumeDetail from './ContactVolumeDetail';
import VolumeByPeriodTable from './VolumeByPeriodTable';
import InsightBox from '../common/InsightBox';
import {
  buildPlanOfferedConfig, buildCallVolumeConfig, buildChannelMixConfig, buildDbOspVolumeConfig,
  buildDmsConfig, buildHistTrendConfig,
} from '../charts/chartConfigs';
import {
  geoMapInsight, planOfferedInsight, callVolumeInsight, channelMixInsight, dbOspInsight, dmsInsight,
  histTrendInsight,
} from '../../utils/insights';

const QUEUE_ROWS = [
  { id: 'Q-001', name: 'Enterprise Voice T1', region: 'AMER', forecast: 12400, actual: 12100 },
  { id: 'Q-027', name: 'Commercial Voice T2', region: 'APJ', forecast: 15600, actual: 9200 },
];

const DMS_COUNTRIES = Object.keys(dmsDrillData.country);
const DMS_OFFERINGS = Object.keys(dmsDrillData.offering);
const cap = (s) => (s === 'oop' ? 'OOP' : s.charAt(0).toUpperCase() + s.slice(1));

export default function ForecastOverview() {
  const {
    theme, curPeriod, fiscalYear, curRegion, chartRegionFor, setChartRegion, chartCountryFor, setChartCountry,
    curHistPlan, setCurHistPlan, openApproval, openAdherence, actionLog,
  } = useApp();
  const [geoView, setGeoView] = useState('region');
  const [dmsDrill, setDmsDrill] = useState({ level: 'overall', country: '', offering: '' });
  const [h1Queue, setH1Queue] = useState('All Queues');
  const [h1ForecastQueue, setH1ForecastQueue] = useState('All Queues');

  const kpi = D[curPeriod][curRegion].kpi;

  const regionC0 = chartRegionFor('c0');
  const regionC1 = chartRegionFor('c1');
  const regionH1 = chartRegionFor('h1');
  const regionC5 = chartRegionFor('c5');
  const regionNDms = chartRegionFor('nDms');
  const regionNHist = chartRegionFor('nHist');

  const dC0 = useMemo(() => ({ ...D[curPeriod][regionC0], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionC0].labels.length) }), [curPeriod, regionC0, fiscalYear]);
  const dC1 = useMemo(() => ({ ...D[curPeriod][regionC1], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionC1].labels.length) }), [curPeriod, regionC1, fiscalYear]);
  const dH1 = useMemo(() => ({ ...D[curPeriod][regionH1], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionH1].labels.length) }), [curPeriod, regionH1, fiscalYear]);
  const dC5 = useMemo(() => ({ ...D[curPeriod][regionC5], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionC5].labels.length) }), [curPeriod, regionC5, fiscalYear]);
  const dNDms = useMemo(() => ({ ...D[curPeriod][regionNDms], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNDms].labels.length) }), [curPeriod, regionNDms, fiscalYear]);
  const dNHist = useMemo(() => ({ ...D[curPeriod][regionNHist], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNHist].labels.length) }), [curPeriod, regionNHist, fiscalYear]);

  const c0Config = useMemo(() => buildPlanOfferedConfig(dC0, theme), [dC0, theme]);
  const c1Config = useMemo(() => buildCallVolumeConfig(dC1, theme), [dC1, theme]);
  const h1Config = useMemo(() => buildChannelMixConfig(dH1, theme), [dH1, theme]);
  const c5Config = useMemo(() => buildDbOspVolumeConfig(dC5, theme), [dC5, theme]);
  const nDmsData = useMemo(() => {
    const dmsLabels = buildPeriodLabels(fiscalYear, curPeriod, 8);
    if (dmsDrill.level === 'country') return { labels: dmsLabels, ...dmsDrillData.country[dmsDrill.country] };
    if (dmsDrill.level === 'offering') return { labels: dmsLabels, ...dmsDrillData.offering[dmsDrill.offering] };
    return dNDms;
  }, [dmsDrill, dNDms, curPeriod, fiscalYear]);
  const nDmsConfig = useMemo(() => buildDmsConfig(nDmsData, theme), [nDmsData, theme]);
  const nHistConfig = useMemo(() => buildHistTrendConfig(dNHist, theme, curHistPlan), [dNHist, theme, curHistPlan]);

  function dmsDrillReset() {
    setDmsDrill({ level: 'overall', country: '', offering: '' });
  }

  return (
    <div className="tab-panel active">
      <div className="kpi-grid">
        <KpiCard label="FORECAST ACCURACY" value={kpi.acc} delta={kpi.accSub} />
        <KpiCard label="CALL VOLUME" value={kpi.vol} delta={kpi.volSub} />
        <KpiCard label="SHIPMENT VARIANCE" value={kpi.shvar} sub="Plan vs Actual" />
        <KpiCard label="ASU VARIANCE" value={kpi.asuvar} sub="vs Plan" />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">🌍 Forecast Adherence <InfoBtn tip="<strong>Purpose</strong>Forecast accuracy by geography. Toggle Region/Sub Region to change map granularity; % labels shown directly on the map.<strong>Tip</strong>💡 Click the map for a Region/Sub Region/Country/Offering adherence table." /></div>
          <div className="card-dd">
            <div className="plan-sel">
              <button className={'plan-btn' + (geoView === 'region' ? ' active' : '')} onClick={() => setGeoView('region')}>Region</button>
              <button className={'plan-btn' + (geoView === 'subregion' ? ' active' : '')} onClick={() => setGeoView('subregion')}>Sub Region</button>
            </div>
          </div>
        </div>
        <WorldMap theme={theme} mode={geoView} onOpenDetail={openAdherence} />
        <InsightBox text={geoMapInsight()} />
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan vs Actual Offered <InfoBtn tip="<strong>Purpose</strong>Planned volume vs actual offered volume, with Offered% (actual/plan) on the right axis." /></div>
            <div className="card-dd">
              <RegionSelect value={regionC0} onChange={(v) => setChartRegion('c0', v)} />
              <CountrySelect value={chartCountryFor('c0')} onChange={(v) => setChartCountry('c0', v)} />
            </div>
          </div>
          <ChartCanvas config={c0Config} height="220px" />
          <InsightBox text={planOfferedInsight(dC0)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Call Volume Trend <InfoBtn tip="<strong>Purpose</strong>Workload vs handle rate with Abandonment% and Attainment%." /></div>
            <div className="card-dd">
              <RegionSelect value={regionC1} onChange={(v) => setChartRegion('c1', v)} />
              <CountrySelect value={chartCountryFor('c1')} onChange={(v) => setChartCountry('c1', v)} />
            </div>
          </div>
          <ChartCanvas config={c1Config} height="220px" />
          <InsightBox text={callVolumeInsight(dC1)} />
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
            <CountrySelect value={chartCountryFor('nHist')} onChange={(v) => setChartCountry('nHist', v)} />
          </div>
        </div>
        <ChartCanvas config={nHistConfig} height="240px" />
        <InsightBox text={histTrendInsight(dNHist, curHistPlan)} />
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
            <DownloadBtn
              filename="historical-volume"
              title="Download historical volume"
              rows={[(hvData[curPeriod] || hvData.monthly).cols, (hvData[curPeriod] || hvData.monthly).total, ...(hvData[curPeriod] || hvData.monthly).rows]}
            />
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
              <CountrySelect value={chartCountryFor('h1')} onChange={(v) => setChartCountry('h1', v)} />
              <select className="f-sel" value={h1Queue} onChange={(e) => setH1Queue(e.target.value)}>
                <option>All Queues</option>
                {QUEUE_ROWS.map((q) => <option key={q.id}>{q.name}</option>)}
              </select>
              <select className="f-sel" value={h1ForecastQueue} onChange={(e) => setH1ForecastQueue(e.target.value)}>
                <option>All Queues</option>
                {QUEUE_ROWS.map((q) => <option key={q.id}>{q.name}</option>)}
              </select>
            </div>
          </div>
          <ChartCanvas config={h1Config} height="290px" />
          <InsightBox text={channelMixInsight(dH1)} />
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
          <ChartCanvas config={c5Config} height="190px" />
          <InsightBox text={dbOspInsight(dC5)} />
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

      <div className="s-grid full">
        <div className="card">
          <PartnerMinimum />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 DMS Scorecard <InfoBtn tip="<strong>Purpose</strong>Contact disposition categories. Drill into a country or offering." /></div>
            <div className="card-dd">
              <RegionSelect value={regionNDms} onChange={(v) => setChartRegion('nDms', v)} />
              <select
                className="f-sel"
                value={dmsDrill.level === 'country' ? dmsDrill.country : 'All'}
                onChange={(e) => {
                  const v = e.target.value;
                  setDmsDrill(v === 'All' ? { level: 'overall', country: '', offering: '' } : { level: 'country', country: v, offering: '' });
                }}
              >
                <option value="All">All Countries</option>
                {DMS_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                className="f-sel"
                value={dmsDrill.level === 'offering' ? dmsDrill.offering : 'All'}
                onChange={(e) => {
                  const v = e.target.value;
                  setDmsDrill(v === 'All' ? { level: 'overall', country: '', offering: '' } : { level: 'offering', country: '', offering: v });
                }}
              >
                <option value="All">All Offerings</option>
                {DMS_OFFERINGS.map((o) => <option key={o} value={o}>{cap(o)}</option>)}
              </select>
            </div>
          </div>
          <div className="drill-bc">
            {dmsDrill.level === 'overall' && <span className="current">Overall</span>}
            {dmsDrill.level === 'country' && (
              <>
                <span onClick={dmsDrillReset}>Overall</span><span className="sep">›</span>
                <span className="current">{dmsDrill.country}</span>
              </>
            )}
            {dmsDrill.level === 'offering' && (
              <>
                <span onClick={dmsDrillReset}>Overall</span><span className="sep">›</span>
                <span className="current">{cap(dmsDrill.offering)}</span>
              </>
            )}
          </div>
          <ChartCanvas config={nDmsConfig} height="210px" />
          <InsightBox text={dmsInsight(nDmsData)} />
        </div>
      </div>

      <VolumeByPeriodTable />

      <ContactVolumeDetail />

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">Queue Performance <InfoBtn tip="<strong>Purpose</strong>Queue-level data." /></div>
          <DownloadBtn
            filename="queue-performance"
            title="Download queue performance"
            rows={[
              ['Queue', 'Name', 'Region', 'Forecast', 'Actual', 'Acc%'],
              ...QUEUE_ROWS.map((q) => [q.id, q.name, q.region, q.forecast, q.actual, ((q.actual / q.forecast) * 100).toFixed(1) + '%']),
            ]}
          />
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Queue</th><th>Name</th><th>Region</th><th>Forecast</th><th>Actual</th><th>Acc%</th><th>Status</th><th>RCA/CLCA</th></tr></thead>
            <tbody>
              {QUEUE_ROWS.map((q) => {
                const accRaw = (q.actual / q.forecast) * 100;
                const tier = accRaw >= 95 ? 'g' : accRaw >= 80 ? 'o' : 'r';
                const priority = accRaw >= 95 ? 'Low' : accRaw >= 80 ? 'Medium' : 'High';
                const actioned = actionLog[q.id];
                return (
                  <tr key={q.id}>
                    <td>{q.id}</td><td>{q.name}</td><td>{q.region}</td>
                    <td>{q.forecast.toLocaleString()}</td><td>{q.actual.toLocaleString()}</td><td>{accRaw.toFixed(1)}%</td>
                    <td><span className={'dot dot-' + tier}></span></td>
                    <td>
                      <button className="btn-a" onClick={() => openApproval({ id: q.id, area: q.name, priority })}>RCA/CLCA</button>
                      {actioned && <span className="action-badge" title={`Actioned ${actioned.timestamp}`}>✓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
