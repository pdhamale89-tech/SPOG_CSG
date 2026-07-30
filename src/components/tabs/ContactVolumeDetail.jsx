import { Fragment, useMemo, useState } from 'react';
import {
  CONTACT_VOLUME_ROWS, CV_REGIONS, CV_SUBREGIONS, CV_OFFERINGS, CV_FY_KEYS, CV_FY_LABELS, CV_CHANNELS,
} from '../../data/contactVolumeDetail';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';
import MultiSelectDropdown from '../common/MultiSelectDropdown';

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
  const [selRegions, setSelRegions] = useState([]);
  const [selSubRegions, setSelSubRegions] = useState([]);
  const [selOfferings, setSelOfferings] = useState([]);

  const subRegionOptions = useMemo(() => {
    const src = selRegions.length ? CONTACT_VOLUME_ROWS.filter((r) => selRegions.includes(r.region)) : CONTACT_VOLUME_ROWS;
    return [...new Set(src.map((r) => r.subRegion))];
  }, [selRegions]);

  function handleRegionChange(vals) {
    setSelRegions(vals);
    const validSubs = vals.length
      ? [...new Set(CONTACT_VOLUME_ROWS.filter((r) => vals.includes(r.region)).map((r) => r.subRegion))]
      : CV_SUBREGIONS;
    setSelSubRegions((prev) => prev.filter((s) => validSubs.includes(s)));
  }

  const filteredRows = useMemo(() => CONTACT_VOLUME_ROWS.filter((r) => (
    (selRegions.length === 0 || selRegions.includes(r.region))
    && (selSubRegions.length === 0 || selSubRegions.includes(r.subRegion))
    && (selOfferings.length === 0 || selOfferings.includes(r.offering))
  )), [selRegions, selSubRegions, selOfferings]);

  const tags = [
    ...selRegions.map((v) => ({ k: 'Region', v })),
    ...selSubRegions.map((v) => ({ k: 'Sub Region', v })),
    ...selOfferings.map((v) => ({ k: 'Offering', v })),
  ];

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          📞 Contact Volume Detail
          <InfoBtn tip="<strong>Purpose</strong>FY24-FY27 contact volume, channel mix, YoY% and partner mix by Region/Sub Region/Offering.<strong>Tip</strong>💡 FY27 is boxed as the current-year focus column." />
        </div>
        <div className="card-dd">
          <DownloadBtn filename="contact-volume-detail" title="Download contact volume detail" rows={buildCsvRows(filteredRows)} />
        </div>
      </div>

      <div className="cv-filters">
        <div className="cv-filter-group">
          <label>Region</label>
          <MultiSelectDropdown options={CV_REGIONS} selected={selRegions} onChange={handleRegionChange} />
        </div>
        <div className="cv-filter-group">
          <label>Sub Region</label>
          <MultiSelectDropdown options={subRegionOptions} selected={selSubRegions} onChange={setSelSubRegions} />
        </div>
        <div className="cv-filter-group">
          <label>Offering</label>
          <MultiSelectDropdown options={CV_OFFERINGS} selected={selOfferings} onChange={setSelOfferings} />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="cv-tags">
          {tags.map((t) => <span key={t.k + t.v} className="cv-tag">{t.k}: {t.v}</span>)}
        </div>
      )}

      <div className="cv-tbl-wrap">
        <table className="cv-tbl">
          <thead>
            <tr>
              <th className="cv-empty-header"></th>
              {CV_FY_LABELS.map((fy, i) => (
                <th key={fy} className={'cv-fy-header' + (i === CV_FY_LABELS.length - 1 ? ' cv-fy27-header' : '')}>{fy}</th>
              ))}
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
                  {CV_FY_KEYS.map((fy, i) => (
                    <td key={fy} className={'cv-data-cell bold cv-shade-' + fy + (i === 3 ? ' cv-fy27-left cv-fy27-right' : '')}>{row.contactVolume[fy]}</td>
                  ))}
                </tr>
                {CV_CHANNELS.map((ch) => (
                  <tr key={ch}>
                    <td className="cv-cat-label">{ch}</td>
                    {CV_FY_KEYS.map((fy, i) => (
                      <td key={fy} className={'cv-data-cell cv-shade-' + fy + (i === 3 ? ' cv-fy27-left cv-fy27-right' : '')}>{row.channels[ch][fy]}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="cv-cat-label yoy">Vol YoY%</td>
                  {CV_FY_KEYS.map((fy, i) => (
                    <td key={fy} className={'cv-yoy-data cv-shade-' + fy + (i === 3 ? ' cv-fy27-left cv-fy27-right' : '')}>{row.volYoY[fy]}</td>
                  ))}
                </tr>
                <tr>
                  <td className="cv-cat-label dark">Partner Mix</td>
                  {CV_FY_KEYS.map((fy, i) => (
                    <td key={fy} className={'cv-data-cell bold cv-shade-' + fy + (i === 3 ? ' cv-fy27-left cv-fy27-right cv-fy27-bottom' : '')}>{row.partnerMix[fy]}</td>
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
