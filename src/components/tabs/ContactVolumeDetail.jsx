import { Fragment, useMemo, useState } from 'react';
import {
  CONTACT_VOLUME_ROWS, CV_REGIONS, CV_OFFERINGS, CV_FY_KEYS, CV_FY_LABELS, CV_CHANNELS,
} from '../../data/contactVolumeDetail';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';
import { scaleDisplayValue } from '../../utils/displayScale';

const ALL = 'All';

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

export default function ContactVolumeDetail() {
  const [region, setRegion] = useState(ALL);
  const [subRegion, setSubRegion] = useState(ALL);
  const [offering, setOffering] = useState(ALL);

  const subRegionOptions = useMemo(() => {
    const src = region === ALL ? CONTACT_VOLUME_ROWS : CONTACT_VOLUME_ROWS.filter((r) => r.region === region);
    return [...new Set(src.map((r) => r.subRegion))];
  }, [region]);

  function handleRegionChange(v) {
    setRegion(v);
    setSubRegion(ALL);
  }

  const filteredRows = useMemo(() => CONTACT_VOLUME_ROWS.filter((r) => (
    (region === ALL || r.region === region)
    && (subRegion === ALL || r.subRegion === subRegion)
    && (offering === ALL || r.offering === offering)
  )), [region, subRegion, offering]);

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          📞 Contact Volume Detail
          <InfoBtn tip="<strong>Purpose</strong>FY24-FY27 contact volume, channel mix, YoY% and partner mix by Region/Sub Region/Offering." />
        </div>
        <div className="card-dd">
          <select className="f-sel" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
            <option value={ALL}>Global</option>
            {CV_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="f-sel" value={subRegion} onChange={(e) => setSubRegion(e.target.value)}>
            <option value={ALL}>All Sub Regions</option>
            {subRegionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="f-sel" value={offering} onChange={(e) => setOffering(e.target.value)}>
            <option value={ALL}>All Offerings</option>
            {CV_OFFERINGS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <DownloadBtn filename="contact-volume-detail" title="Download contact volume detail" rows={buildCsvRows(filteredRows)} />
        </div>
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
            {filteredRows.length === 0 && (
              <tr><td colSpan={5} className="cv-no-data">No data found. Please adjust your filters.</td></tr>
            )}
            {filteredRows.map((row, idx) => (
              <Fragment key={row.region + row.subRegion + row.offering}>
                <tr className="cv-section-header"><td colSpan={5}>{row.region} › {row.subRegion} › {row.offering}</td></tr>
                <tr>
                  <td className="cv-cat-label dark">Contact Volume</td>
                  {CV_FY_KEYS.map((fy) => (
                    <td key={fy} className={'cv-data-cell bold cv-shade-' + fy}>{row.contactVolume[fy]}</td>
                  ))}
                </tr>
                {CV_CHANNELS.map((ch) => (
                  <tr key={ch}>
                    <td className="cv-cat-label">{ch}</td>
                    {CV_FY_KEYS.map((fy) => (
                      <td key={fy} className={'cv-data-cell cv-shade-' + fy}>{row.channels[ch][fy]}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="cv-cat-label yoy">Vol YoY%</td>
                  {CV_FY_KEYS.map((fy) => (
                    <td key={fy} className={'cv-yoy-data cv-shade-' + fy}>{scaleDisplayValue(row.volYoY[fy])}</td>
                  ))}
                </tr>
                <tr>
                  <td className="cv-cat-label dark">Partner Mix</td>
                  {CV_FY_KEYS.map((fy) => (
                    <td key={fy} className={'cv-data-cell bold cv-shade-' + fy}>{scaleDisplayValue(row.partnerMix[fy])}</td>
                  ))}
                </tr>
                {idx < filteredRows.length - 1 && <tr className="cv-spacer"><td colSpan={5}></td></tr>}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
