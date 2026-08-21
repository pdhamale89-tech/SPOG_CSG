import { Fragment, useState } from 'react';
import {
  ASU_TIERS, ASU_TIER_LABELS, ASU_REGIONS, ASU_SUBREGIONS_BY_REGION, ASU_ROWS, ASU_REGION_TOTALS, ASU_GLOBAL_TOTAL,
} from '../../data/asuRegionalMetrics';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';
import { scaleDisplayValue } from '../../utils/displayScale';

const ALL = 'All';
const ALL_SUBREGIONS = Object.values(ASU_SUBREGIONS_BY_REGION).flat();

function pctClass(pct) {
  if (pct >= 100) return 'arm-good';
  if (pct < 90) return 'arm-bad';
  return 'arm-mid';
}

function tierCells(tierData) {
  return (
    <>
      <td className="arm-vol">{scaleDisplayValue(tierData.vol)}</td>
      <td className={'arm-pct ' + pctClass(tierData.pct)}>{tierData.pct}%</td>
    </>
  );
}

function buildCsvRows(visibleRegions, subRegion) {
  const header = ['Region', 'Sub Region', ...ASU_TIERS.flatMap((t) => [`${ASU_TIER_LABELS[t]} Vol`, `${ASU_TIER_LABELS[t]} %`])];
  const csv = [header];
  const rowToCsv = (region, subRegionLabel, data) => [region, subRegionLabel, ...ASU_TIERS.flatMap((t) => [data[t].vol, data[t].pct + '%'])];

  visibleRegions.forEach((region) => {
    const rows = ASU_ROWS.filter((r) => r.region === region && (subRegion === ALL || r.subRegion === subRegion));
    if (!rows.length) return;
    rows.forEach((r) => csv.push(rowToCsv(region, r.subRegion, r)));
    csv.push(rowToCsv(region, `${region} Total`, ASU_REGION_TOTALS[region]));
  });
  if (subRegion === ALL && visibleRegions.length === ASU_REGIONS.length) {
    csv.push(rowToCsv('Global', 'Global Total', ASU_GLOBAL_TOTAL));
  }
  return csv;
}

export default function AsuRegionalMetrics() {
  const [region, setRegion] = useState(ALL);
  const [subRegion, setSubRegion] = useState(ALL);
  const [expanded, setExpanded] = useState({});

  const subRegionOptions = region === ALL ? ALL_SUBREGIONS : ASU_SUBREGIONS_BY_REGION[region];

  function handleRegionChange(v) {
    setRegion(v);
    setSubRegion(ALL);
  }

  function toggleRegion(reg) {
    setExpanded((prev) => ({ ...prev, [reg]: prev[reg] === false ? true : false }));
  }

  const visibleRegions = region === ALL ? ASU_REGIONS : [region];
  const showGlobalTotal = region === ALL && subRegion === ALL;

  const csvRows = buildCsvRows(visibleRegions, subRegion);

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          🌐 Regional Performance Metrics
          <InfoBtn tip="<strong>Purpose</strong>Basic/Pro/Premium volume and Achievement Target% by Region and Sub-Region.<strong>Tip</strong>💡 ≥100% is on/above target, &lt;90% is at risk." />
        </div>
        <div className="card-dd">
          <select className="f-sel" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
            <option value={ALL}>All Regions</option>
            {ASU_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="f-sel" value={subRegion} onChange={(e) => setSubRegion(e.target.value)}>
            <option value={ALL}>All Sub-Regions</option>
            {subRegionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <DownloadBtn filename="asu-regional-metrics" title="Download regional performance metrics" rows={csvRows} />
        </div>
      </div>

      <div className="arm-tbl-wrap">
        <table className="arm-tbl">
          <thead>
            <tr>
              <th rowSpan={2}>Sub Region</th>
              {ASU_TIERS.map((t) => <th key={t} colSpan={2}>{ASU_TIER_LABELS[t]}</th>)}
            </tr>
            <tr>
              {ASU_TIERS.map((t) => (
                <Fragment key={t}>
                  <th>Vol</th>
                  <th>%</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRegions.map((reg) => {
              const rows = ASU_ROWS.filter((r) => r.region === reg && (subRegion === ALL || r.subRegion === subRegion));
              if (!rows.length) return null;
              const isOpen = expanded[reg] !== false;
              return (
                <Fragment key={reg}>
                  <tr className="arm-section-header">
                    <td colSpan={7}>
                      <button type="button" className="mtx-toggle" onClick={() => toggleRegion(reg)} title={isOpen ? 'Collapse' : 'Expand'}>
                        <span className="mtx-toggle-ic">{isOpen ? '▾' : '▸'}</span>{reg}
                      </button>
                    </td>
                  </tr>
                  {isOpen && rows.map((r) => (
                    <tr key={r.subRegion}>
                      <td className="arm-label">{r.subRegion}</td>
                      {ASU_TIERS.map((t) => <Fragment key={t}>{tierCells(r[t])}</Fragment>)}
                    </tr>
                  ))}
                  <tr className="arm-total-row">
                    <td className="arm-label">{reg} Total</td>
                    {ASU_TIERS.map((t) => <Fragment key={t}>{tierCells(ASU_REGION_TOTALS[reg][t])}</Fragment>)}
                  </tr>
                </Fragment>
              );
            })}
            {showGlobalTotal && (
              <tr className="arm-global-row">
                <td className="arm-label">Global Total</td>
                {ASU_TIERS.map((t) => <Fragment key={t}>{tierCells(ASU_GLOBAL_TOTAL[t])}</Fragment>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
