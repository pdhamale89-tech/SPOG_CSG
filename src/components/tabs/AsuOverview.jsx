import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';
import { buildPeriodLabels } from '../../utils/periodLabels';
import InfoBtn from '../common/InfoBtn';
import RegionSelect from '../common/RegionSelect';
import CountrySelect from '../common/CountrySelect';
import KpiCard from '../common/KpiCard';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import ChartCanvas from '../charts/ChartCanvas';
import InsightBox from '../common/InsightBox';
import {
  buildAsuTrendConfig, buildAsuCpasuConfig, buildTagRouted2Config, buildExitTrendConfig,
  buildAsuVolumeTrendConfig, PROJECTION_MONTHS,
} from '../charts/chartConfigs';
import {
  asuTrendInsight, asuCpasuInsight, tagRouted2Insight, exitTrendInsight,
  asuVolumeTrendInsight,
} from '../../utils/insights';

const CASE_SOURCES = ['All Sources', 'Self-Service', 'Assisted', 'Automated', 'Escalated'];
const CASE_ORIGINS = ['All Origins', 'Web', 'Phone', 'Chat', 'Email'];
const TAG_PRODUCTS = ['All Products', 'Pro', 'Premium', 'Basic', 'OOP'];
// Temporarily hidden per request; flip back to true to restore.
const SHOW_TAG_ROUTED = false;

export default function AsuOverview() {
  const { theme, curPeriod, fiscalYear, chartRegionFor, setChartRegion, chartCountryFor, setChartCountry } = useApp();
  const [caseSource, setCaseSource] = useState(CASE_SOURCES[0]);
  const [caseOrigin, setCaseOrigin] = useState(CASE_ORIGINS[0]);
  const [tagProduct, setTagProduct] = useState(TAG_PRODUCTS[0]);
  const [projMonths, setProjMonths] = useState([PROJECTION_MONTHS[PROJECTION_MONTHS.length - 1]]);

  const d = { ...D[curPeriod].Global, labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod].Global.labels.length) };

  const regionNTag = chartRegionFor('nTag');

  const a1Config = useMemo(() => buildAsuTrendConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const a2Config = useMemo(() => buildAsuCpasuConfig(theme, curPeriod, fiscalYear), [theme, curPeriod, fiscalYear]);
  const dNTag = useMemo(
    () => ({ ...D[curPeriod][regionNTag], labels: buildPeriodLabels(fiscalYear, curPeriod, D[curPeriod][regionNTag].labels.length) }),
    [curPeriod, regionNTag, fiscalYear],
  );
  const nTag2Config = useMemo(() => buildTagRouted2Config(dNTag, theme), [dNTag, theme]);
  const nExitTrendConfig = useMemo(() => buildExitTrendConfig(theme, fiscalYear), [theme, fiscalYear]);
  const nVolumeTrendConfig = useMemo(
    () => buildAsuVolumeTrendConfig(theme, curPeriod, fiscalYear, projMonths),
    [theme, curPeriod, fiscalYear, projMonths],
  );

  return (
    <div className="tab-panel active">
      <div className="kpi-grid cols-5">
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
          <div className="card-header"><div className="card-title">ASU vs CPASU/Contacts <InfoBtn tip="<strong>Purpose</strong>ASU/CPASU." /></div></div>
          <ChartCanvas config={a2Config} />
          <InsightBox text={asuCpasuInsight()} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header"><div className="card-title">📉 Exit Trend <InfoBtn tip="<strong>Purpose</strong>Total Expiring Assets and Total Shipment by fiscal year against ASU Exit Actual/FCST." /></div></div>
          <ChartCanvas config={nExitTrendConfig} height="260px" />
          <InsightBox text={exitTrendInsight()} />
        </div>
      </div>

      <div className="s-grid full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Contact volume vs ASU <InfoBtn tip="<strong>Purpose</strong>Actual vs projected contact volume against Tech Support ASU across the last 3 fiscal years." /></div>
            <div className="card-dd">
              <MultiSelectDropdown options={PROJECTION_MONTHS} selected={projMonths} onChange={setProjMonths} suffix="Projection" />
            </div>
          </div>
          <ChartCanvas config={nVolumeTrendConfig} height="360px" />
          <InsightBox text={asuVolumeTrendInsight()} />
        </div>
      </div>

      {SHOW_TAG_ROUTED && (
        <div className="s-grid full">
          <div className="card">
            <div className="card-header">
              <div className="card-title">🏷️ Tag Routed <InfoBtn tip="<strong>Purpose</strong>Offered vs total Tag Count with the resulting Tags% trend." /></div>
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
      )}
    </div>
  );
}
