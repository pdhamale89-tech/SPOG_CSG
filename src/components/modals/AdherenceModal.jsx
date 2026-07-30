import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ADHERENCE_ROWS } from '../../data/adherenceDetail';
import DownloadBtn from '../common/DownloadBtn';

const ALL = 'All';

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function tierColor(v) {
  if (v >= 90) return 'var(--accent-green)';
  if (v >= 80) return 'var(--accent-blue)';
  if (v >= 70) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

export default function AdherenceModal() {
  const { adherenceModal, closeAdherence } = useApp();
  const [region, setRegion] = useState(ALL);
  const [subRegion, setSubRegion] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [offering, setOffering] = useState(ALL);

  const regionOptions = useMemo(() => uniqueSorted(ADHERENCE_ROWS.map((r) => r.region)), []);
  const subRegionOptions = useMemo(
    () => uniqueSorted(ADHERENCE_ROWS.filter((r) => region === ALL || r.region === region).map((r) => r.subRegion)),
    [region],
  );
  const countryOptions = useMemo(
    () => uniqueSorted(ADHERENCE_ROWS.filter((r) => (region === ALL || r.region === region) && (subRegion === ALL || r.subRegion === subRegion)).map((r) => r.country)),
    [region, subRegion],
  );
  const offeringOptions = useMemo(() => uniqueSorted(ADHERENCE_ROWS.map((r) => r.offering)), []);

  function handleRegionChange(v) {
    setRegion(v);
    setSubRegion(ALL);
    setCountry(ALL);
  }
  function handleSubRegionChange(v) {
    setSubRegion(v);
    setCountry(ALL);
  }

  const rows = useMemo(() => ADHERENCE_ROWS
    .filter((r) => region === ALL || r.region === region)
    .filter((r) => subRegion === ALL || r.subRegion === subRegion)
    .filter((r) => country === ALL || r.country === country)
    .filter((r) => offering === ALL || r.offering === offering)
    .slice()
    .sort((a, b) => b.adherence - a.adherence), [region, subRegion, country, offering]);

  return (
    <div className={'modal-overlay' + (adherenceModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeAdherence(); }}>
      <div className="modal adherence-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌍 Forecast Adherence Detail</h2>
          <button className="modal-close" onClick={closeAdherence}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <DownloadBtn
              filename="forecast-adherence"
              title="Download forecast adherence"
              rows={[
                ['Region', 'Sub Region', 'Country', 'Offering', 'Adherence%'],
                ...rows.map((r) => [r.region, r.subRegion, r.country, r.offering, r.adherence + '%']),
              ]}
            />
          </div>

          <div className="filter-grid" style={{ marginBottom: '10px' }}>
            <div className="filter-group">
              <label>Region</label>
              <select value={region} onChange={(e) => handleRegionChange(e.target.value)}>
                <option value={ALL}>All Regions</option>
                {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Sub Region</label>
              <select value={subRegion} onChange={(e) => handleSubRegionChange(e.target.value)}>
                <option value={ALL}>All Sub-Regions</option>
                {subRegionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value={ALL}>All Countries</option>
                {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Offering</label>
              <select value={offering} onChange={(e) => setOffering(e.target.value)}>
                <option value={ALL}>All Offerings</option>
                {offeringOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="tw holiday-tbl-wrap">
            <table>
              <thead>
                <tr><th>Region</th><th>Sub Region</th><th>Country</th><th>Offering</th><th>Adherence%</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.region}</td>
                    <td>{r.subRegion}</td>
                    <td>{r.country}</td>
                    <td>{r.offering}</td>
                    <td style={{ color: tierColor(r.adherence), fontWeight: 700 }}>{r.adherence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
