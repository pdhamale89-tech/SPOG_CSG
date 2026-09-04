import { Fragment, useMemo, useState } from 'react';
import {
  CONTACT_VOLUME_ROWS, CV_REGIONS, CV_OFFERINGS, CV_FY_KEYS, CV_FY_LABELS, CV_CHANNELS,
} from '../../data/contactVolumeDetail';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';
import { scaleDisplayValue } from '../../utils/displayScale';

const ALL = 'All';

function parseM(v) {
  return parseFloat(v) || 0;
}
function parsePct(v) {
  return v === '—' ? null : parseFloat(v) || 0;
}

// Rolls a set of rows up into one Global-level row: Contact Volume is a
// straight sum per FY, Vol YoY% is recomputed from those summed totals (not
// summed/averaged percentages), and Channel/Partner Mix are volume-weighted
// averages so a big region doesn't get diluted by a small one.
function buildGlobalRow(rows) {
  const contactVolume = {};
  const volYoY = {};
  const channels = {};
  const partnerMix = {};
  CV_CHANNELS.forEach((ch) => { channels[ch] = {}; });

  let prevTotal = null;
  CV_FY_KEYS.forEach((fy) => {
    const total = rows.reduce((s, r) => s + parseM(r.contactVolume[fy]), 0);
    contactVolume[fy] = `${total.toFixed(2)} M`;
    volYoY[fy] = prevTotal == null ? '—' : `${Math.round(((total - prevTotal) / prevTotal) * 100)}%`;
    prevTotal = total;

    CV_CHANNELS.forEach((ch) => {
      const weighted = rows.reduce((s, r) => s + (parsePct(r.channels[ch][fy]) / 100) * parseM(r.contactVolume[fy]), 0);
      channels[ch][fy] = `${total ? Math.round((weighted / total) * 100) : 0}%`;
    });

    const partnerWeighted = rows.reduce((s, r) => s + (parsePct(r.partnerMix[fy]) / 100) * parseM(r.contactVolume[fy]), 0);
    partnerMix[fy] = `${total ? Math.round((partnerWeighted / total) * 100) : 0}%`;
  });

  return { contactVolume, volYoY, channels, partnerMix };
}

function buildCsvRows(rows) {
  const header = ['Region', 'Sub Region', 'Offering', 'Metric', ...CV_FY_LABELS];
  const csv = [header];
  rows.forEach((r) => {
    csv.push([r.region, r.subRegion, r.offering, 'Contact Volume', ...CV_FY_KEYS.map((fy) => r.contactVolume[fy])]);
    CV_CHANNELS.forEach((ch) => csv.push([r.region, r.subRegion, r.offering, ch, ...CV_FY_KEYS.map((fy) => r.channels[ch][fy])]));
    csv.push([r.region, r.subRegion, r.offering, 'Vol YoY%', ...CV_FY_KEYS.map((fy) => r.volYoY[fy])]);
    csv.push([r.region, r.subRegion, r.offering, 'Partner Mix', ...CV_FY_KEYS.map((fy) => r.partnerMix[fy])]);
  });
  return csv;
}

// Same 5-row block (Contact Volume / channels / YoY / Partner Mix) that both
// the Global summary and the per-group Detail rows render, just with a
// different section-header label/onClick.
function DataBlock({ headerLabel, headerHint, onHeaderClick, data, isLast }) {
  return (
    <Fragment>
      <tr className={'cv-section-header' + (onHeaderClick ? ' cv-clickable' : '')} onClick={onHeaderClick}>
        <td colSpan={5}>
          {headerLabel}
          {headerHint && <span className="cv-header-hint">{headerHint}</span>}
        </td>
      </tr>
      <tr>
        <td className="cv-cat-label dark">Contact Volume</td>
        {CV_FY_KEYS.map((fy) => (
          <td key={fy} className={'cv-data-cell bold cv-shade-' + fy}>{data.contactVolume[fy]}</td>
        ))}
      </tr>
      {CV_CHANNELS.map((ch) => (
        <tr key={ch}>
          <td className="cv-cat-label">{ch}</td>
          {CV_FY_KEYS.map((fy) => (
            <td key={fy} className={'cv-data-cell cv-shade-' + fy}>{data.channels[ch][fy]}</td>
          ))}
        </tr>
      ))}
      <tr>
        <td className="cv-cat-label yoy">Vol YoY%</td>
        {CV_FY_KEYS.map((fy) => (
          <td key={fy} className={'cv-yoy-data cv-shade-' + fy}>{scaleDisplayValue(data.volYoY[fy])}</td>
        ))}
      </tr>
      <tr>
        <td className="cv-cat-label dark">Partner Mix</td>
        {CV_FY_KEYS.map((fy) => (
          <td key={fy} className={'cv-data-cell bold cv-shade-' + fy}>{scaleDisplayValue(data.partnerMix[fy])}</td>
        ))}
      </tr>
      {!isLast && <tr className="cv-spacer"><td colSpan={5}></td></tr>}
    </Fragment>
  );
}

export default function ContactVolumeDetail() {
  // Global mode only takes an Offering slice (Region/Sub Region don't mean
  // anything at a Global rollup) -- Detail mode gets the full Region/Sub
  // Region/Offering filter set.
  const [view, setView] = useState('global');
  const [offering, setOffering] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [subRegion, setSubRegion] = useState(ALL);

  const subRegionOptions = useMemo(() => {
    const src = region === ALL ? CONTACT_VOLUME_ROWS : CONTACT_VOLUME_ROWS.filter((r) => r.region === region);
    return [...new Set(src.map((r) => r.subRegion))];
  }, [region]);

  function handleRegionChange(v) {
    setRegion(v);
    setSubRegion(ALL);
  }

  const globalRows = useMemo(
    () => CONTACT_VOLUME_ROWS.filter((r) => offering === ALL || r.offering === offering),
    [offering],
  );
  const globalData = useMemo(() => buildGlobalRow(globalRows), [globalRows]);

  const filteredRows = useMemo(() => CONTACT_VOLUME_ROWS.filter((r) => (
    (region === ALL || r.region === region)
    && (subRegion === ALL || r.subRegion === subRegion)
    && (offering === ALL || r.offering === offering)
  )), [region, subRegion, offering]);

  const isDetail = view === 'detail';
  const csvRows = isDetail
    ? buildCsvRows(filteredRows)
    : buildCsvRows([{ region: 'Global', subRegion: 'All', offering, ...globalData }]);

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          📞 Contact Volume Detail
          <InfoBtn tip="<strong>Purpose</strong>Global rollup by default -- click the Global row (or Offering) for the Region/Sub Region/Offering breakdown." />
        </div>
        <div className="card-dd">
          {isDetail && (
            <>
              <select className="f-sel" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
                <option value={ALL}>Global</option>
                {CV_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="f-sel" value={subRegion} onChange={(e) => setSubRegion(e.target.value)}>
                <option value={ALL}>All Sub Regions</option>
                {subRegionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
          <select className="f-sel" value={offering} onChange={(e) => setOffering(e.target.value)}>
            <option value={ALL}>All Offerings</option>
            {CV_OFFERINGS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <DownloadBtn filename="contact-volume-detail" title="Download contact volume detail" rows={csvRows} />
        </div>
      </div>

      <div className="drill-bc">
        {isDetail
          ? <><span onClick={() => setView('global')}>Global</span><span className="sep">›</span><span className="current">Detail</span></>
          : <span className="current">Global</span>}
      </div>

      <div className="cv-tbl-wrap">
        <table className="cv-tbl">
          <thead>
            <tr>
              <th className="cv-empty-header"></th>
              {CV_FY_LABELS.map((fy) => <th key={fy} className="cv-fy-header">{fy}</th>)}
            </tr>
          </thead>
          <tbody>
            {!isDetail && (
              <DataBlock
                headerLabel={`🌍 Global${offering === ALL ? '' : ' › ' + offering}`}
                headerHint="Click for Region / Sub Region / Offering breakdown ▸"
                onHeaderClick={() => setView('detail')}
                data={globalData}
                isLast
              />
            )}
            {isDetail && filteredRows.length === 0 && (
              <tr><td colSpan={5} className="cv-no-data">No data found. Please adjust your filters.</td></tr>
            )}
            {isDetail && filteredRows.map((row, idx) => (
              <DataBlock
                key={row.region + row.subRegion + row.offering}
                headerLabel={`${row.region} › ${row.subRegion} › ${row.offering}`}
                data={row}
                isLast={idx === filteredRows.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
