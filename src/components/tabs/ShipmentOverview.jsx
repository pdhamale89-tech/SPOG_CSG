import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import { buildPeriodLabels } from '../../utils/periodLabels';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import SubRegionSelect from '../common/SubRegionSelect';
import CountrySelect from '../common/CountrySelect';
import KpiCard from '../common/KpiCard';
import DownloadBtn from '../common/DownloadBtn';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildShipUppConfig, buildShipDrillConfig, buildShipmentTrendStaticConfig, buildSegmentSoldConfig,
  buildProductTrendConfig, buildShipmentGrowthConfig,
} from '../charts/chartConfigs';
import {
  shipUppInsight, shipDrillInsight, shipmentTrendInsight, segmentSoldInsight, productTrendInsight,
  shipmentGrowthInsight,
} from '../../utils/insights';

const OFFERINGS = ['pro', 'premium', 'basic', 'oop'];
const SEGMENTS = ['consumer', 'commercial', 'enterprise'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const QUEUE_DETAIL_ROWS = [
  { id: 'Q-101', name: 'Enterprise Voice T1', region: 'AMER', offering: 'Pro', segment: 'Enterprise', forecast: 42000, actual: 40320 },
  { id: 'Q-102', name: 'Commercial Voice T2', region: 'EMEA', offering: 'Premium', segment: 'Commercial', forecast: 28500, actual: 27100 },
  { id: 'Q-103', name: 'Consumer Chat', region: 'APJ', offering: 'Basic', segment: 'Consumer', forecast: 18700, actual: 14350 },
  { id: 'Q-104', name: 'OOP Support', region: 'AMER', offering: 'OOP', segment: 'Enterprise', forecast: 9600, actual: 9800 },
  { id: 'Q-105', name: 'Enterprise Email', region: 'EMEA', offering: 'Pro', segment: 'Enterprise', forecast: 15400, actual: 14100 },
  { id: 'Q-106', name: 'Commercial Chat', region: 'APJ', offering: 'Premium', segment: 'Commercial', forecast: 21200, actual: 20650 },
];

// Same underlying queue detail, rolled up by segment (region/offering shown
// as the distinct set contributing to that segment) instead of per queue.
const SEGMENT_ORDER = ['Enterprise', 'Commercial', 'Consumer'];
const SEGMENT_DETAIL_ROWS = SEGMENT_ORDER.map((segment) => {
  const rows = QUEUE_DETAIL_ROWS.filter((q) => q.segment === segment);
  return {
    segment,
    regions: [...new Set(rows.map((q) => q.region))].join(', '),
    offerings: [...new Set(rows.map((q) => q.offering))].join(', '),
    forecast: rows.reduce((s, q) => s + q.forecast, 0),
    actual: rows.reduce((s, q) => s + q.actual, 0),
  };
});

const TOTAL_FORECAST = QUEUE_DETAIL_ROWS.reduce((s, q) => s + q.forecast, 0);
const TOTAL_ACTUAL = QUEUE_DETAIL_ROWS.reduce((s, q) => s + q.actual, 0);
const SHIPMENT_ADHERENCE = Math.round((TOTAL_ACTUAL / TOTAL_FORECAST) * 1000) / 10;

export default function ShipmentOverview() {
  const {
    theme, curPeriod, fiscalYear, chartRegionFor, setChartRegion, chartSubRegionFor, setChartSubRegion,
    chartCountryFor, setChartCountry, drill, setDrill,
  } = useApp();
  const [prodView, setProdView] = useState('top5');

  const d = { ...D[curPeriod].Global, labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod].Global.labels.length) };

  const regionShipUpp = chartRegionFor('shipUpp');
  const regionShipDrill = chartRegionFor('shipDrill');
  const regionS1 = chartRegionFor('s1');

  const shipUppConfig = useMemo(() => buildShipUppConfig(regionShipUpp, theme, curPeriod, fiscalYear), [regionShipUpp, theme, curPeriod, fiscalYear]);
  const shipDrillConfig = useMemo(() => buildShipDrillConfig(regionShipDrill, drill.level, drill.offering, theme, curPeriod, fiscalYear), [regionShipDrill, drill.level, drill.offering, theme, curPeriod, fiscalYear]);
  const s1Config = useMemo(() => buildShipmentTrendStaticConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const s2Config = useMemo(() => buildSegmentSoldConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const s3Config = useMemo(() => buildProductTrendConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const s5Config = useMemo(() => buildShipmentGrowthConfig(theme), [theme]);

  function drillTo(offering) {
    setDrill({ level: 'offering', offering, segment: '' });
  }
  function drillToSeg(offering, segment) {
    setDrill({ level: 'segment', offering, segment });
  }
  function drillBack(target) {
    if (target === 'overall') setDrill({ level: 'overall', offering: '', segment: '' });
    else drillTo(target);
  }

  return (
    <div className="tab-panel active">
      <div className="kpi-grid">
        <KpiCard label="TOTAL SHIPMENTS" value={d.kpi.ship} delta="▼ 4% vs AOP" />
        <KpiCard label="SHIPMENT GROWTH" value={d.kpi.shgr} sub="YoY" />
        <KpiCard label="SHIPMENT VARIANCE" value={d.kpi.shvar} sub="Plan vs Actual" />
        <KpiCard label="SHIPMENT ADHERENCE" value={`${SHIPMENT_ADHERENCE}%`} delta="Actual vs Forecast" />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📦 Ship vs Projections/UPP <InfoBtn tip="<strong>Purpose</strong>Actual vs projections with UPP lines." /></div>
          <div className="card-dd">
            <RegionSelect value={regionShipUpp} onChange={(v) => setChartRegion('shipUpp', v)} />
            <SubRegionSelect value={chartSubRegionFor('shipUpp')} onChange={(v) => setChartSubRegion('shipUpp', v)} />
            <CountrySelect value={chartCountryFor('shipUpp')} onChange={(v) => setChartCountry('shipUpp', v)} />
          </div>
        </div>
        <ChartCanvas config={shipUppConfig} height="260px" />
        <InsightBox text={shipUppInsight(regionShipUpp, shipUppConfig.data.labels)} />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📈 Overall Shipment <InfoBtn tip="<strong>Purpose</strong>Drill-down: Overall → Offering → Segment." /></div>
          <div className="card-dd">
            <RegionSelect value={regionShipDrill} onChange={(v) => setChartRegion('shipDrill', v)} />
            <SubRegionSelect value={chartSubRegionFor('shipDrill')} onChange={(v) => setChartSubRegion('shipDrill', v)} />
            <CountrySelect value={chartCountryFor('shipDrill')} onChange={(v) => setChartCountry('shipDrill', v)} />
          </div>
        </div>
        <div className="drill-bc">
          {drill.level === 'overall' && <span className="current">Overall Shipment</span>}
          {drill.level === 'offering' && (
            <>
              <span onClick={() => drillBack('overall')}>Overall</span><span className="sep">›</span>
              <span className="current">{cap(drill.offering)}</span>
            </>
          )}
          {drill.level === 'segment' && (
            <>
              <span onClick={() => drillBack('overall')}>Overall</span><span className="sep">›</span>
              <span onClick={() => drillBack(drill.offering)}>{cap(drill.offering)}</span><span className="sep">›</span>
              <span className="current">{cap(drill.segment)}</span>
            </>
          )}
        </div>
        <ChartCanvas config={shipDrillConfig} height="240px" />
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
          {drill.level === 'overall' && OFFERINGS.map((o) => (
            <button key={o} className="btn-a" onClick={() => drillTo(o)}>{o === 'oop' ? 'OOP' : cap(o)}</button>
          ))}
          {drill.level === 'offering' && SEGMENTS.map((s) => (
            <button key={s} className="btn-a" onClick={() => drillToSeg(drill.offering, s)}>{cap(s)}</button>
          ))}
        </div>
        <InsightBox text={shipDrillInsight(regionShipDrill, drill.level, drill.offering, shipDrillConfig.data.labels)} />
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Shipment Trend <InfoBtn tip="<strong>Purpose</strong>Track shipment vs plan." /></div>
            <div className="card-dd">
              <RegionSelect value={regionS1} onChange={(v) => setChartRegion('s1', v)} />
              <SubRegionSelect value={chartSubRegionFor('s1')} onChange={(v) => setChartSubRegion('s1', v)} />
              <CountrySelect value={chartCountryFor('s1')} onChange={(v) => setChartCountry('s1', v)} />
            </div>
          </div>
          <ChartCanvas config={s1Config} />
          <InsightBox text={shipmentTrendInsight()} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Segment Sold <InfoBtn tip="<strong>Purpose</strong>Segment growth." /></div></div>
          <ChartCanvas config={s2Config} />
          <InsightBox text={segmentSoldInsight()} />
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Product Trend <InfoBtn tip="<strong>Purpose</strong>Product performance." /></div>
            <div className="card-dd">
              <select className="f-sel" value={prodView} onChange={(e) => setProdView(e.target.value)}>
                <option value="top5">Top 5</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <ChartCanvas config={s3Config} />
          <InsightBox text={productTrendInsight()} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Shipment Growth <InfoBtn tip="<strong>Purpose</strong>Growth by region." /></div></div>
          <ChartCanvas config={s5Config} />
          <InsightBox text={shipmentGrowthInsight()} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📋 Segment-wise Shipment Detail <InfoBtn tip="<strong>Purpose</strong>Forecast vs actual shipments rolled up by segment, with the regions and offerings contributing to each." /></div>
          <DownloadBtn
            filename="segment-wise-shipment-detail"
            title="Download segment-wise shipment detail"
            rows={[
              ['Segment', 'Region', 'Offering', 'Forecast', 'Actual', 'Adh%'],
              ...SEGMENT_DETAIL_ROWS.map((s) => [s.segment, s.regions, s.offerings, s.forecast, s.actual, ((s.actual / s.forecast) * 100).toFixed(1) + '%']),
            ]}
          />
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Segment</th><th>Region</th><th>Offering</th><th>Forecast</th><th>Actual</th><th>Adh%</th><th>St</th></tr></thead>
            <tbody>
              {SEGMENT_DETAIL_ROWS.map((s) => {
                const adh = (s.actual / s.forecast) * 100;
                const tier = adh >= 95 ? 'g' : adh >= 80 ? 'o' : 'r';
                return (
                  <tr key={s.segment}>
                    <td>{s.segment}</td><td>{s.regions}</td><td>{s.offerings}</td>
                    <td>{s.forecast.toLocaleString()}</td><td>{s.actual.toLocaleString()}</td>
                    <td style={tier === 'r' ? { color: 'var(--accent-red)' } : undefined}>{adh.toFixed(1)}%</td>
                    <td><span className={'dot dot-' + tier}></span></td>
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
