import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import CountrySelect from '../common/CountrySelect';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildAsuTrendConfig, buildAsuCpasuConfig, buildTagRoutedConfig, buildExpiryConfig,
  buildAsuAcqExitConfig, buildAsuLifecycleConfig,
} from '../charts/chartConfigs';
import {
  asuTrendInsight, asuCpasuInsight, tagRoutedInsight, expiryInsight,
  asuAcqExitInsight, asuLifecycleInsight,
} from '../../utils/insights';

export default function AsuOverview() {
  const { theme, curPeriod, chartRegionFor, setChartRegion, chartCountryFor, setChartCountry } = useApp();

  const d = D[curPeriod].Global;

  const regionNTag = chartRegionFor('nTag');
  const regionNExpiry = chartRegionFor('nExpiry');

  const a1Config = useMemo(() => buildAsuTrendConfig(theme), [theme]);
  const a2Config = useMemo(() => buildAsuCpasuConfig(theme), [theme]);
  const dNTag = D[curPeriod][regionNTag];
  const dNExpiry = D[curPeriod][regionNExpiry];
  const nTagConfig = useMemo(() => buildTagRoutedConfig(dNTag, theme), [dNTag, theme]);
  const nExpiryConfig = useMemo(() => buildExpiryConfig(dNExpiry, theme), [dNExpiry, theme]);
  const a3Config = useMemo(() => buildAsuAcqExitConfig(theme), [theme]);
  const a4Config = useMemo(() => buildAsuLifecycleConfig(theme), [theme]);

  return (
    <div className="tab-panel active">
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">TOTAL ASUs</div><div className="kpi-value">{d.kpi.asu}</div><div className="kpi-sub">+45K</div></div>
        <div className="kpi-card"><div className="kpi-label">ASU GROWTH</div><div className="kpi-value">+3.8%</div><div className="kpi-sub">vs plan</div></div>
        <div className="kpi-card"><div className="kpi-label">ASU VARIANCE</div><div className="kpi-value">{d.kpi.asuvar}</div><div className="kpi-sub">Plan vs Actual</div></div>
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
            <div className="card-dd">
              <RegionSelect value={regionNTag} onChange={(v) => setChartRegion('nTag', v)} />
              <CountrySelect value={chartCountryFor('nTag')} onChange={(v) => setChartCountry('nTag', v)} />
            </div>
          </div>
          <ChartCanvas config={nTagConfig} height="220px" />
          <InsightBox text={tagRoutedInsight(dNTag)} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 Weekly Expiring <InfoBtn tip="<strong>Purpose</strong>Expiry projections." /></div>
            <div className="card-dd">
              <RegionSelect value={regionNExpiry} onChange={(v) => setChartRegion('nExpiry', v)} />
              <CountrySelect value={chartCountryFor('nExpiry')} onChange={(v) => setChartCountry('nExpiry', v)} />
            </div>
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
