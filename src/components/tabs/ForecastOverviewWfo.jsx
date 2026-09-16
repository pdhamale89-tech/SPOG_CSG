import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D, dmsDrillData, hvData, hvDownloadRows } from '../../data/forecastData';
import { buildPeriodLabels } from '../../utils/periodLabels';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import CountrySelect from '../common/CountrySelect';
import DownloadBtn from '../common/DownloadBtn';
import ChartCanvas from '../charts/ChartCanvas';
import WorldMap from '../charts/WorldMap';
import HistVolTable from './HistVolTable';
import PartnerMinimum from './PartnerMinimum';
import ContactVolumeDetail from './ContactVolumeDetail';
import VolumeByPeriodTable from './VolumeByPeriodTable';
import InsightBox from '../common/InsightBox';
import { scaleDisplayValue } from '../../utils/displayScale';
import {
  buildPlanOfferedConfigWfo, buildCallVolumeConfigWfo, buildChannelMixConfigWfo,
  buildDmsConfigWfo, buildHistTrendConfigWfo,
} from '../charts/chartConfigs';
import {
  geoMapInsight, planOfferedInsight, callVolumeInsight, channelMixInsight, dmsInsight,
  histTrendInsight,
} from '../../utils/insights';

// Duplicate of ForecastOverview.jsx, restyled per
// workforce-ui-spec-controls-filters-combined.pdf (colour, typography,
// spacing, corner radii, elevation, chart series tokens -- see the
// "wfo-page" scoped block at the bottom of theme.css and the *Wfo chart
// builder variants in chartConfigs.js). Structure, data, and behavior are
// otherwise identical to Forecast Overview.
//
// Per-chart Region/Country filter state uses a distinct "Wfo"-suffixed id
// namespace (c0Wfo/c1Wfo/h1Wfo/nDmsWfo/nHistWfo) so picking a region here
// never bleeds into the original Forecast Overview tab's own chart filters,
// which key off the same AppContext store by id. The Historical Trend plan
// toggle is kept as page-local state (not AppContext's shared curHistPlan)
// for the same reason.

const QUEUE_ROWS = [
  { id: 'Q-001', name: 'Enterprise Voice T1', region: 'AMER', forecast: 12400, actual: 12100 },
  { id: 'Q-027', name: 'Commercial Voice T2', region: 'APJ', forecast: 15600, actual: 9200 },
];

const DMS_COUNTRIES = Object.keys(dmsDrillData.country);
const DMS_OFFERINGS = Object.keys(dmsDrillData.offering);
const cap = (s) => (s === 'oop' ? 'OOP' : s.charAt(0).toUpperCase() + s.slice(1));

// Spec's World Map legend tiers, passed as WorldMap's optional tierColors
// override -- every other WorldMap caller leaves this unset and keeps the
// app's own theme-driven palette.
const WFO_TIER_COLORS = { excellent: '#4F7D00', good: '#0D76B2', fair: '#F5CB6F', critical: '#AF0000' };

// Spec Accessibility Rules: 'Provide aria-label on the chart SVG/canvas
// element: "{ChartTitle} - {dateRange} - {seriesCount} data series"'.
function chartAriaLabel(title, config) {
  const labels = config?.data?.labels || [];
  const dateRange = labels.length ? `${labels[0]} to ${labels[labels.length - 1]}` : 'no data';
  const seriesCount = config?.data?.datasets?.length || 0;
  return `${title} - ${dateRange} - ${seriesCount} data series`;
}

// Spec Accessibility Rules: 'Expose a visually-hidden data table equivalent
// for each chart (toggle via "View table" button, 14 px fill #0D76B2)'.
// Built directly from the same Chart.js config already passed to
// ChartCanvas, so the table can never drift out of sync with what the chart
// itself is showing.
function ChartTableToggle({ config }) {
  const [open, setOpen] = useState(false);
  const labels = config?.data?.labels || [];
  const datasets = config?.data?.datasets || [];
  return (
    <div className="wfo-chart-table">
      <button type="button" className="wfo-view-table-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide table' : 'View table'}
      </button>
      {open && (
        <div className="tw">
          <table>
            <thead>
              <tr><th>Period</th>{datasets.map((ds) => <th key={ds.label}>{ds.label}</th>)}</tr>
            </thead>
            <tbody>
              {labels.map((lbl, i) => (
                <tr key={lbl}>
                  <td>{lbl}</td>
                  {datasets.map((ds) => <td key={ds.label}>{ds.data[i] == null ? '—' : ds.data[i]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Spec's KPI trend row: "a 12px arrow-up-right icon with positive delta
// text". The app's existing delta/sub strings already carry a leading
// unicode arrow (e.g. "▲ 22%"); this splits that glyph out and renders it as
// its own coloured icon span (Positive #4F7D00 for ▲, the spec's only other
// directional token, #AF0000/error, for ▼) instead of leaving it as plain
// inline text, without touching the shared KpiCard used by every other tab.
function WfoTrend({ text }) {
  const m = /^([▲▼])\s*(.*)$/.exec(text || '');
  if (!m) return <div className="kpi-sub">{text}</div>;
  const [, arrow, rest] = m;
  const color = arrow === '▲' ? '#4F7D00' : '#AF0000';
  return (
    <div className="kpi-sub">
      <span className="wfo-trend-icon" style={{ color }}>{arrow}</span> {rest}
    </div>
  );
}

// Same markup as the shared KpiCard, but routes delta/sub through WfoTrend
// above instead of KpiCard's own plain-text .kpi-sub, so this page's KPI row
// gets the spec's coloured trend icon without touching KpiCard itself.
function WfoKpiCard({ label, value, delta, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{scaleDisplayValue(value)}</div>
      {delta && <WfoTrend text={delta} />}
      {sub && <WfoTrend text={sub} />}
    </div>
  );
}

export default function ForecastOverviewWfo() {
  const {
    curPeriod, fiscalYear, curRegion, chartRegionFor, setChartRegion, chartCountryFor, setChartCountry,
    openApproval, openAdherence, actionLog,
  } = useApp();
  const [geoView, setGeoView] = useState('region');
  const [dmsDrill, setDmsDrill] = useState({ level: 'overall', country: '', offering: '' });
  const [h1Queue, setH1Queue] = useState('All Queues');
  const [h1ForecastQueue, setH1ForecastQueue] = useState('All Queues');
  const [curHistPlan, setCurHistPlan] = useState('plan1');

  const kpi = D[curPeriod][curRegion].kpi;

  const regionC0 = chartRegionFor('c0Wfo');
  const regionC1 = chartRegionFor('c1Wfo');
  const regionH1 = chartRegionFor('h1Wfo');
  const regionNDms = chartRegionFor('nDmsWfo');
  const regionNHist = chartRegionFor('nHistWfo');

  const dC0 = useMemo(() => ({ ...D[curPeriod][regionC0], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionC0].labels.length) }), [curPeriod, regionC0, fiscalYear]);
  const dC1 = useMemo(() => ({ ...D[curPeriod][regionC1], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionC1].labels.length) }), [curPeriod, regionC1, fiscalYear]);
  const dH1 = useMemo(() => ({ ...D[curPeriod][regionH1], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionH1].labels.length) }), [curPeriod, regionH1, fiscalYear]);
  const dNDms = useMemo(() => ({ ...D[curPeriod][regionNDms], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNDms].labels.length) }), [curPeriod, regionNDms, fiscalYear]);
  const dNHist = useMemo(() => ({ ...D[curPeriod][regionNHist], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNHist].labels.length) }), [curPeriod, regionNHist, fiscalYear]);

  const c0Config = useMemo(() => buildPlanOfferedConfigWfo(dC0), [dC0]);
  const c1Config = useMemo(() => buildCallVolumeConfigWfo(dC1), [dC1]);
  const h1Config = useMemo(() => buildChannelMixConfigWfo(dH1), [dH1]);
  const nDmsData = useMemo(() => {
    const dmsLabels = buildPeriodLabels(fiscalYear, curPeriod, 8);
    if (dmsDrill.level === 'country') return { labels: dmsLabels, ...dmsDrillData.country[dmsDrill.country] };
    if (dmsDrill.level === 'offering') return { labels: dmsLabels, ...dmsDrillData.offering[dmsDrill.offering] };
    return dNDms;
  }, [dmsDrill, dNDms, curPeriod, fiscalYear]);
  const nDmsConfig = useMemo(() => buildDmsConfigWfo(nDmsData), [nDmsData]);
  const nHistConfig = useMemo(() => buildHistTrendConfigWfo(dNHist, curHistPlan), [dNHist, curHistPlan]);

  function dmsDrillReset() {
    setDmsDrill({ level: 'overall', country: '', offering: '' });
  }

  return (
    <div className="tab-panel active wfo-page">
      <div className="kpi-grid">
        <WfoKpiCard label="FORECAST ACCURACY" value={kpi.acc} delta={kpi.accSub} />
        <WfoKpiCard label="CALL VOLUME" value={kpi.vol} delta={kpi.volSub} />
        <WfoKpiCard label="SHIPMENT VARIANCE" value={kpi.shvar} sub="Plan vs Actual" />
        <WfoKpiCard label="ASU VARIANCE" value={kpi.asuvar} sub="vs Plan" />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title"><span className="ic3d">🌍</span> Forecast Adherence <InfoBtn tip="<strong>Purpose</strong>Forecast accuracy by geography. Toggle Region/Sub Region to change map granularity; % labels shown directly on the map.<strong>Tip</strong>💡 Click the map for a Region/Sub Region/Country/Offering adherence table." /></div>
          <div className="card-dd">
            <div className="plan-sel">
              <button className={'plan-btn' + (geoView === 'region' ? ' active' : '')} aria-pressed={geoView === 'region'} onClick={() => setGeoView('region')}>Region</button>
              <button className={'plan-btn' + (geoView === 'subregion' ? ' active' : '')} aria-pressed={geoView === 'subregion'} onClick={() => setGeoView('subregion')}>Sub Region</button>
            </div>
          </div>
        </div>
        <WorldMap theme="light" mode={geoView} onOpenDetail={openAdherence} tierColors={WFO_TIER_COLORS} />
        <InsightBox text={geoMapInsight()} />
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan vs Actual Offered <InfoBtn tip="<strong>Purpose</strong>Planned volume vs actual offered volume, with Offered% (actual/plan) on the right axis." /></div>
            <div className="card-dd">
              <RegionSelect value={regionC0} onChange={(v) => setChartRegion('c0Wfo', v)} />
              <CountrySelect value={chartCountryFor('c0Wfo')} onChange={(v) => setChartCountry('c0Wfo', v)} />
            </div>
          </div>
          <ChartCanvas config={c0Config} height="220px" ariaLabel={chartAriaLabel('Plan vs Actual Offered', c0Config)} />
          <ChartTableToggle config={c0Config} />
          <InsightBox text={planOfferedInsight(dC0)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Call Volume Trend <InfoBtn tip="<strong>Purpose</strong>Workload vs handle rate with Abandonment% and Attainment%." /></div>
            <div className="card-dd">
              <RegionSelect value={regionC1} onChange={(v) => setChartRegion('c1Wfo', v)} />
              <CountrySelect value={chartCountryFor('c1Wfo')} onChange={(v) => setChartCountry('c1Wfo', v)} />
            </div>
          </div>
          <ChartCanvas config={c1Config} height="220px" ariaLabel={chartAriaLabel('Call Volume Trend', c1Config)} />
          <ChartTableToggle config={c1Config} />
          <InsightBox text={callVolumeInsight(dC1)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title"><span className="ic3d">📈</span> Historical Trend <InfoBtn tip="<strong>Purpose</strong>Multi-line historical comparison with plan toggle." /></div>
          <div className="card-dd">
            <div className="plan-sel">
              <button className={'plan-btn' + (curHistPlan === 'plan1' ? ' active' : '')} aria-pressed={curHistPlan === 'plan1'} onClick={() => setCurHistPlan('plan1')}>FY27 Jul Pro</button>
              <button className={'plan-btn' + (curHistPlan === 'plan2' ? ' active' : '')} aria-pressed={curHistPlan === 'plan2'} onClick={() => setCurHistPlan('plan2')}>FY27 Jun Pro</button>
              <button className={'plan-btn' + (curHistPlan === 'plan3' ? ' active' : '')} aria-pressed={curHistPlan === 'plan3'} onClick={() => setCurHistPlan('plan3')}>FY27 Aug Pro</button>
            </div>
            <RegionSelect value={regionNHist} onChange={(v) => setChartRegion('nHistWfo', v)} style={{ marginLeft: '4px' }} />
            <CountrySelect value={chartCountryFor('nHistWfo')} onChange={(v) => setChartCountry('nHistWfo', v)} />
          </div>
        </div>
        <ChartCanvas config={nHistConfig} height="240px" ariaLabel={chartAriaLabel('Historical Trend', nHistConfig)} />
        <ChartTableToggle config={nHistConfig} />
        <InsightBox text={histTrendInsight(dNHist, curHistPlan)} />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title"><span className="ic3d">📊</span> Historical Volume <InfoBtn tip="<strong>Purpose</strong>Volume data by period.<strong>Tip</strong>💡 Click for more information." /></div>
          <div className="card-dd">
            <select className="hv-queue-sel" defaultValue="all">
              <option value="all">All Queues</option>
              <option value="Q-001">Q-001</option>
              <option value="Q-027">Q-027</option>
            </select>
            <DownloadBtn
              filename="historical-volume-wfo"
              title="Download historical volume"
              rows={hvDownloadRows(hvData[curPeriod] || hvData.monthly)}
            />
          </div>
        </div>
        <HistVolTable period={curPeriod} />
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Channel Mix <InfoBtn tip="<strong>Purpose</strong>Channel volume split." /></div>
            <div className="card-dd">
              <select className="f-sel" defaultValue="All">
                <option value="All">All</option><option value="Pro">Pro</option><option value="Premium">Premium</option><option value="Basic">Basic</option><option value="PON">PON</option>
              </select>
              <RegionSelect value={regionH1} onChange={(v) => setChartRegion('h1Wfo', v)} />
              <CountrySelect value={chartCountryFor('h1Wfo')} onChange={(v) => setChartCountry('h1Wfo', v)} />
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
          <ChartCanvas config={h1Config} height="290px" ariaLabel={chartAriaLabel('Channel Mix', h1Config)} />
          <ChartTableToggle config={h1Config} />
          <InsightBox text={channelMixInsight(dH1)} />
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
            <div className="card-title"><span className="ic3d">🎯</span> DMS Scorecard <InfoBtn tip="<strong>Purpose</strong>Contact disposition categories.<strong>Tip</strong>💡 Click for more information on a country or offering." /></div>
            <div className="card-dd">
              <RegionSelect value={regionNDms} onChange={(v) => setChartRegion('nDmsWfo', v)} />
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
          <ChartCanvas config={nDmsConfig} height="210px" ariaLabel={chartAriaLabel('DMS Scorecard', nDmsConfig)} />
          <ChartTableToggle config={nDmsConfig} />
          <InsightBox text={dmsInsight(nDmsData)} />
        </div>
      </div>

      <VolumeByPeriodTable />

      <ContactVolumeDetail />

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">Queue Performance <InfoBtn tip="<strong>Purpose</strong>Queue-level data." /></div>
          <DownloadBtn
            filename="queue-performance-wfo"
            title="Download queue performance"
            rows={[
              ['Queue', 'Name', 'Region', 'Forecast', 'Actual', 'Acc%'],
              ...QUEUE_ROWS.map((q) => [q.id, q.name, q.region, q.forecast, q.actual, ((q.actual / q.forecast) * 100).toFixed(1) + '%']),
            ]}
          />
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Queue</th><th>Name</th><th>Region</th><th className="wfo-num">Forecast</th><th className="wfo-num">Actual</th><th className="wfo-num">Acc%</th><th>Status</th><th>RCA/CLCA</th></tr></thead>
            <tbody>
              {QUEUE_ROWS.map((q) => {
                const accRaw = (q.actual / q.forecast) * 100;
                // Classify off the reduced percentage, not the raw one, so
                // the status dot/priority always match what's shown.
                const accText = scaleDisplayValue(accRaw.toFixed(1) + '%');
                const accReduced = parseFloat(accText);
                const tier = accReduced >= 95 ? 'g' : accReduced >= 80 ? 'o' : 'r';
                const priority = accReduced >= 95 ? 'Low' : accReduced >= 80 ? 'Medium' : 'High';
                const actioned = actionLog[q.id];
                return (
                  <tr key={q.id}>
                    <td>{q.id}</td><td>{q.name}</td><td>{q.region}</td>
                    <td className="wfo-num">{scaleDisplayValue(q.forecast.toLocaleString())}</td><td className="wfo-num">{scaleDisplayValue(q.actual.toLocaleString())}</td><td className="wfo-num">{accText}</td>
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
