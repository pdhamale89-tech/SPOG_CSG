import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildShipUppConfig, buildShipDrillConfig, buildShipmentTrendStaticConfig, buildSegmentSoldConfig,
  buildProductTrendConfig, buildShipmentGrowthConfig, buildAsuTrendConfig, buildAsuCpasuConfig,
  buildTagRoutedConfig, buildExpiryConfig, buildAsuAcqExitConfig, buildAsuLifecycleConfig,
} from '../charts/chartConfigs';
import {
  shipUppInsight, shipDrillInsight, shipmentTrendInsight, segmentSoldInsight, productTrendInsight,
  shipmentGrowthInsight, asuTrendInsight, asuCpasuInsight, tagRoutedInsight, expiryInsight,
  asuAcqExitInsight, asuLifecycleInsight,
} from '../../utils/insights';

const TIERS = ['All', 'Pro', 'Premium', 'Basic'];
const OFFERINGS = ['pro', 'premium', 'basic', 'oop'];
const SEGMENTS = ['consumer', 'commercial', 'enterprise'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ShipmentAsu() {
  const { theme, curPeriod, chartRegionFor, setChartRegion, drill, setDrill } = useApp();
  const [tier, setTier] = useState('All');
  const [prodView, setProdView] = useState('top5');

  const d = D[curPeriod].Global;

  const regionShipUpp = chartRegionFor('shipUpp');
  const regionShipDrill = chartRegionFor('shipDrill');
  const regionS1 = chartRegionFor('s1');
  const regionNTag = chartRegionFor('nTag');
  const regionNExpiry = chartRegionFor('nExpiry');

  const shipUppConfig = useMemo(() => buildShipUppConfig(regionShipUpp, theme), [regionShipUpp, theme]);
  const shipDrillConfig = useMemo(() => buildShipDrillConfig(regionShipDrill, drill.level, drill.offering, theme), [regionShipDrill, drill.level, drill.offering, theme]);
  const s1Config = useMemo(() => buildShipmentTrendStaticConfig(theme), [theme]);
  const s2Config = useMemo(() => buildSegmentSoldConfig(theme), [theme]);
  const s3Config = useMemo(() => buildProductTrendConfig(theme), [theme]);
  const s5Config = useMemo(() => buildShipmentGrowthConfig(theme), [theme]);
  const a1Config = useMemo(() => buildAsuTrendConfig(theme), [theme]);
  const a2Config = useMemo(() => buildAsuCpasuConfig(theme), [theme]);
  const dNTag = D[curPeriod][regionNTag];
  const dNExpiry = D[curPeriod][regionNExpiry];
  const nTagConfig = useMemo(() => buildTagRoutedConfig(dNTag, theme), [dNTag, theme]);
  const nExpiryConfig = useMemo(() => buildExpiryConfig(dNExpiry, theme), [dNExpiry, theme]);
  const a3Config = useMemo(() => buildAsuAcqExitConfig(theme), [theme]);
  const a4Config = useMemo(() => buildAsuLifecycleConfig(theme), [theme]);

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
      <div className="ai-story">
        <div className="ai-icon-box">✦</div>
        <div>
          <div className="ai-story-title">AI Shipment Summary</div>
          <div className="ai-story-text">Shipments 4% below AOP. Commercial leads +7% YoY. ASU base: 1.2M.</div>
        </div>
      </div>

      <div className="tier-sel">
        {TIERS.map((t) => (
          <button key={t} className={'tier-btn' + (tier === t ? ' active' : '')} onClick={() => setTier(t)}>{t}</button>
        ))}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">TOTAL SHIPMENTS</div><div className="kpi-value">{d.kpi.ship}</div><div className="kpi-sub">▼ 4% vs AOP</div></div>
        <div className="kpi-card"><div className="kpi-label">SHIPMENT GROWTH</div><div className="kpi-value">{d.kpi.shgr}</div><div className="kpi-sub">YoY</div></div>
        <div className="kpi-card"><div className="kpi-label">SHIPMENT VARIANCE</div><div className="kpi-value">{d.kpi.shvar}</div><div className="kpi-sub">Plan vs Actual</div></div>
        <div className="kpi-card"><div className="kpi-label">RISK INDICATOR</div><div className="kpi-value">3 Regions</div><div className="kpi-sub">Below target</div></div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📦 Ship vs Projections/UPP <InfoBtn tip="<strong>Purpose</strong>Actual vs projections with UPP lines." /></div>
          <div className="card-dd"><RegionSelect value={regionShipUpp} onChange={(v) => setChartRegion('shipUpp', v)} /></div>
        </div>
        <ChartCanvas config={shipUppConfig} height="260px" />
        <InsightBox text={shipUppInsight(regionShipUpp)} />
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="card-header">
          <div className="card-title">📈 Ship Drill Down <InfoBtn tip="<strong>Purpose</strong>Drill-down: Overall → Offering → Segment." /></div>
          <div className="card-dd"><RegionSelect value={regionShipDrill} onChange={(v) => setChartRegion('shipDrill', v)} /></div>
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
        <InsightBox text={shipDrillInsight(regionShipDrill, drill.level, drill.offering)} />
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Shipment Trend <InfoBtn tip="<strong>Purpose</strong>Track shipment vs plan." /></div>
            <div className="card-dd"><RegionSelect value={regionS1} onChange={(v) => setChartRegion('s1', v)} /></div>
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
          <div className="card-header"><div className="card-title">Adherence <InfoBtn tip="<strong>Purpose</strong>Plan adherence." /></div></div>
          <div className="tw">
            <table>
              <thead><tr><th>Region</th><th>Seg</th><th>Actual</th><th>Plan</th><th>Adh%</th><th>St</th></tr></thead>
              <tbody>
                <tr><td>AMER</td><td>Con</td><td>82K</td><td>85K</td><td>96.5%</td><td><span className="dot dot-g"></span></td></tr>
                <tr><td>APJ</td><td>Ent</td><td>38K</td><td>50K</td><td style={{ color: 'var(--accent-red)' }}>76.0%</td><td><span className="dot dot-r"></span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Shipment Growth <InfoBtn tip="<strong>Purpose</strong>Growth by region." /></div></div>
          <ChartCanvas config={s5Config} />
          <InsightBox text={shipmentGrowthInsight()} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">⚠ Risk Assessment <InfoBtn tip="<strong>Purpose</strong>Regional risk scores." /></div></div>
          <div className="risk-assess-grid">
            <div className="risk-assess-card risk-low">
              <div className="risk-region">AMER</div><div className="risk-score" style={{ color: 'var(--accent-green)' }}>82</div>
              <div className="risk-badge risk-badge-low">Low</div>
              <div className="risk-bar"><div className="risk-bar-fill" style={{ width: '82%', background: 'var(--accent-green)' }}></div></div>
            </div>
            <div className="risk-assess-card risk-med">
              <div className="risk-region">EMEA</div><div className="risk-score" style={{ color: 'var(--accent-orange)' }}>58</div>
              <div className="risk-badge risk-badge-med">Medium</div>
              <div className="risk-bar"><div className="risk-bar-fill" style={{ width: '58%', background: 'var(--accent-orange)' }}></div></div>
            </div>
            <div className="risk-assess-card risk-high">
              <div className="risk-region">APJ</div><div className="risk-score" style={{ color: 'var(--accent-red)' }}>35</div>
              <div className="risk-badge risk-badge-high">High</div>
              <div className="risk-bar"><div className="risk-bar-fill" style={{ width: '35%', background: 'var(--accent-red)' }}></div></div>
            </div>
          </div>
          <div className="risk-legend-row">
            <div className="risk-legend-item"><div className="risk-legend-dot" style={{ background: 'var(--accent-green)' }}></div>Low</div>
            <div className="risk-legend-item"><div className="risk-legend-dot" style={{ background: 'var(--accent-orange)' }}></div>Medium</div>
            <div className="risk-legend-item"><div className="risk-legend-dot" style={{ background: 'var(--accent-red)' }}></div>High</div>
          </div>
        </div>
      </div>

      <div className="section-div"><h2>📦 ASU</h2><p>ASU trend and risk.</p></div>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">TOTAL ASUs</div><div className="kpi-value">{d.kpi.asu}</div><div className="kpi-sub">+45K</div></div>
        <div className="kpi-card"><div className="kpi-label">ASU GROWTH</div><div className="kpi-value">+3.8%</div><div className="kpi-sub">vs plan</div></div>
        <div className="kpi-card"><div className="kpi-label">ASU EXIT</div><div className="kpi-value">12K</div><div className="kpi-sub">Expiring</div></div>
        <div className="kpi-card"><div className="kpi-label">EXPIRED</div><div className="kpi-value">8.4K</div><div className="kpi-sub">Lapsed</div></div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">ASU Trend <InfoBtn tip="<strong>Purpose</strong>ASU vs plan." /></div></div>
          <ChartCanvas config={a1Config} />
          <InsightBox text={asuTrendInsight()} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">ASU vs CPASU <InfoBtn tip="<strong>Purpose</strong>ASU/CPASU." /></div></div>
          <ChartCanvas config={a2Config} />
          <InsightBox text={asuCpasuInsight()} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏷️ Tag Routed <InfoBtn tip="<strong>Purpose</strong>Volume by case origin." /></div>
            <div className="card-dd"><RegionSelect value={regionNTag} onChange={(v) => setChartRegion('nTag', v)} /></div>
          </div>
          <ChartCanvas config={nTagConfig} height="220px" />
          <InsightBox text={tagRoutedInsight(dNTag)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 Weekly Expiring <InfoBtn tip="<strong>Purpose</strong>Expiry projections." /></div>
            <div className="card-dd"><RegionSelect value={regionNExpiry} onChange={(v) => setChartRegion('nExpiry', v)} /></div>
          </div>
          <ChartCanvas config={nExpiryConfig} height="220px" />
          <InsightBox text={expiryInsight(dNExpiry)} />
        </div>
      </div>

      <div className="s-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">ASU Acq vs Exit <InfoBtn tip="<strong>Purpose</strong>Net ASU growth." /></div></div>
          <ChartCanvas config={a3Config} />
          <InsightBox text={asuAcqExitInsight()} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">ASU Lifecycle <InfoBtn tip="<strong>Purpose</strong>Activation to renewal." /></div></div>
          <ChartCanvas config={a4Config} />
          <InsightBox text={asuLifecycleInsight()} />
        </div>
      </div>
    </div>
  );
}
