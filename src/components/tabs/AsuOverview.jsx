import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import { buildPeriodLabels } from '../../utils/periodLabels';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import CountrySelect from '../common/CountrySelect';
import KpiCard from '../common/KpiCard';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildAsuTrendConfig, buildAsuCpasuConfig, buildTagRoutedConfig, buildTagRouted2Config, buildExpiryConfig,
  buildAsuAcqExitConfig, buildAsuLifecycleConfig,
} from '../charts/chartConfigs';
import {
  asuTrendInsight, asuCpasuInsight, tagRoutedInsight, tagRouted2Insight, expiryInsight,
  asuAcqExitInsight, asuLifecycleInsight,
} from '../../utils/insights';

const CASE_SOURCES = ['All Sources', 'Self-Service', 'Assisted', 'Automated', 'Escalated'];
const CASE_ORIGINS = ['All Origins', 'Web', 'Phone', 'Chat', 'Email'];
const TAG_PRODUCTS = ['All Products', 'Pro', 'Premium', 'Basic', 'OOP'];

export default function AsuOverview() {
  const { theme, curPeriod, fiscalYear, chartRegionFor, setChartRegion, chartCountryFor, setChartCountry } = useApp();
  const [caseSource, setCaseSource] = useState(CASE_SOURCES[0]);
  const [caseOrigin, setCaseOrigin] = useState(CASE_ORIGINS[0]);
  const [tagProduct, setTagProduct] = useState(TAG_PRODUCTS[0]);

  const d = { ...D[curPeriod].Global, labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod].Global.labels.length) };

  const regionNTag = chartRegionFor('nTag');
  const regionNExpiry = chartRegionFor('nExpiry');

  const a1Config = useMemo(() => buildAsuTrendConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const a2Config = useMemo(() => buildAsuCpasuConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const dNTag = useMemo(
    () => ({ ...D[curPeriod][regionNTag], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNTag].labels.length) }),
    [curPeriod, regionNTag, fiscalYear],
  );
  const dNExpiry = useMemo(
    () => ({ ...D[curPeriod][regionNExpiry], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNExpiry].labels.length) }),
    [curPeriod, regionNExpiry, fiscalYear],
  );
  const nTagConfig = useMemo(() => buildTagRoutedConfig(dNTag, theme), [dNTag, theme]);
  const nTag2Config = useMemo(() => buildTagRouted2Config(dNTag, theme), [dNTag, theme]);
  const nExpiryConfig = useMemo(() => buildExpiryConfig(dNExpiry, theme), [dNExpiry, theme]);
  const a3Config = useMemo(() => buildAsuAcqExitConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const a4Config = useMemo(() => buildAsuLifecycleConfig(theme), [theme]);

  return (
    <div className="tab-panel active">
      <div className="kpi-grid">
        <KpiCard label="TOTAL ASUs" value={d.kpi.asu} delta="+45K" />
        <KpiCard label="ASU GROWTH" value="+3.8%" sub="vs plan" />
        <KpiCard label="ASU VARIANCE" value={d.kpi.asuvar} sub="Plan vs Actual" />
        <KpiCard label="ASU EXIT" value="12K" delta="Expiring" />
        <KpiCard label="EXPIRED" value="8.4K" delta="Lapsed" />
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
            <div className="card-title">🏷️ Case Origin wise Tag Count <InfoBtn tip="<strong>Purpose</strong>Volume by case origin." /></div>
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
            <div className="card-title">🏷️ Tag Routed 2 <InfoBtn tip="<strong>Purpose</strong>Offered vs total Tag Count with the resulting Tags% trend." /></div>
            <div className="card-dd">
              <RegionSelect value={regionNTag} onChange={(v) => setChartRegion('nTag', v)} />
              <CountrySelect value={chartCountryFor('nTag')} onChange={(v) => setChartCountry('nTag', v)} />
              <select className="f-sel" value={caseSource} onChange={(e) => setCaseSource(e.target.value)}>
                {CASE_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="f-sel" value={caseOrigin} onChange={(e) => setCaseOrigin(e.target.value)}>
                {CASE_ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select className="f-sel" value={tagProduct} onChange={(e) => setTagProduct(e.target.value)}>
                {TAG_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <ChartCanvas config={nTag2Config} height="220px" />
          <InsightBox text={tagRouted2Insight(dNTag)} />
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
          <div className="card-header"><div className="card-title">ASU Acquisition vs Exit <InfoBtn tip="<strong>Purpose</strong>Net ASU growth." /></div></div>
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
