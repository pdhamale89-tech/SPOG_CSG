import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';

export default function PartnerRcaModal() {
  const { partnerRcaModal, closePartnerRca, chartRegionFor, curPeriod } = useApp();
  const region = chartRegionFor('nPartner');
  const d = D[curPeriod][region];
  const idx = partnerRcaModal.idx;
  const period = d?.labels?.[idx];
  const actual = d?.partActual?.[idx];
  const forecast = d?.partForecast?.[idx];
  const threshold = Number.isFinite(forecast) ? Math.round(forecast * 0.8) : null;

  return (
    <div className={'modal-overlay' + (partnerRcaModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closePartnerRca(); }}>
      <div className="modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Partner RCA/CLCA</h2>
          <button className="modal-close" onClick={closePartnerRca}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="approval-grid">
            <div className="approval-field"><label>Period</label><span>{period ?? '—'}</span></div>
            <div className="approval-field"><label>Actual</label><span>{Number.isFinite(actual) ? actual.toLocaleString() : '—'}</span></div>
            <div className="approval-field"><label>Forecast</label><span>{Number.isFinite(forecast) ? forecast.toLocaleString() : '—'}</span></div>
            <div className="approval-field"><label>80% Threshold</label><span>{threshold != null ? threshold.toLocaleString() : '—'}</span></div>
          </div>
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '6px' }}>RCA</h3>
            <table>
              <thead><tr><th>Factor</th><th>Impact</th></tr></thead>
              <tbody>
                <tr><td>Demand Surge</td><td style={{ color: 'var(--accent-red)' }}>High</td></tr>
                <tr><td>OSP Staffing</td><td style={{ color: 'var(--accent-orange)' }}>Medium</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
