import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { D } from '../../data/forecastData';

const ROOT_CAUSES = ['Demand Surge', 'OSP Staffing Gap', 'Seasonality Impact', 'Model Drift', 'Data Quality Issue', 'Other'];

function suggestCause(gapPct) {
  if (gapPct == null) return ROOT_CAUSES[0];
  if (gapPct >= 30) return 'Demand Surge';
  if (gapPct >= 20) return 'OSP Staffing Gap';
  if (gapPct >= 10) return 'Seasonality Impact';
  return 'Model Drift';
}

function priorityFromGap(gapPct) {
  if (gapPct == null) return 'Medium';
  if (gapPct >= 25) return 'High';
  if (gapPct >= 12) return 'Medium';
  return 'Low';
}

export default function PartnerRcaModal() {
  const { partnerRcaModal, closePartnerRca, chartRegionFor, curPeriod, actionLog, logAction, openApproval, showToast } = useApp();
  const region = chartRegionFor('nPartner');
  const d = D[curPeriod][region];
  const idx = partnerRcaModal.idx;
  const period = d?.labels?.[idx];
  const actual = d?.partActual?.[idx];
  const forecast = d?.partForecast?.[idx];
  const threshold = Number.isFinite(forecast) ? Math.round(forecast * 0.8) : null;
  const gapPct = Number.isFinite(actual) && Number.isFinite(forecast) && forecast > 0
    ? Math.round(((forecast - actual) / forecast) * 100)
    : null;
  const suggested = suggestCause(gapPct);
  const logKey = `PARTNER-${region}-${period ?? idx}`;
  const existing = actionLog[logKey];

  const [rootCause, setRootCause] = useState(suggested);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (partnerRcaModal.open) {
      setRootCause(existing?.rootCause || suggested);
      setNotes(existing?.notes || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerRcaModal.open, logKey]);

  function logRca() {
    logAction(logKey, { type: 'rca', rootCause, notes, period, actual, forecast, gapPct, timestamp: new Date().toLocaleString() });
    showToast('✓ RCA Logged', 'toast-success');
    closePartnerRca();
  }

  function escalateToClca() {
    logAction(logKey, { type: 'rca', rootCause, notes, period, actual, forecast, gapPct, timestamp: new Date().toLocaleString() });
    closePartnerRca();
    openApproval({ id: logKey, area: `Partner Minimum · ${region} · ${period ?? ''}`, priority: priorityFromGap(gapPct), prefillRootCause: rootCause });
  }

  return (
    <div className={'modal-overlay' + (partnerRcaModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closePartnerRca(); }}>
      <div className="modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Partner RCA</h2>
          <button className="modal-close" onClick={closePartnerRca}>&times;</button>
        </div>
        <div className="modal-body">
          {existing && (
            <div className="insight-box" style={{ marginBottom: '10px' }}>
              <span className="ins-ic">✓</span>
              <span>RCA logged {existing.timestamp} — root cause: {existing.rootCause}.</span>
            </div>
          )}
          <div className="approval-grid">
            <div className="approval-field"><label>Period</label><span>{period ?? '—'}</span></div>
            <div className="approval-field"><label>Actual</label><span>{Number.isFinite(actual) ? actual.toLocaleString() : '—'}</span></div>
            <div className="approval-field"><label>Forecast</label><span>{Number.isFinite(forecast) ? forecast.toLocaleString() : '—'}</span></div>
            <div className="approval-field"><label>80% Threshold</label><span>{threshold != null ? threshold.toLocaleString() : '—'}</span></div>
          </div>
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '6px', textTransform: 'uppercase' }}>Root Cause Analysis</h3>
            {gapPct != null && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Actual trailed forecast by <strong>{gapPct}%</strong> — suggested cause: <strong>{suggested}</strong>.
              </div>
            )}
            <select className="approval-select" value={rootCause} onChange={(e) => setRootCause(e.target.value)}>
              {ROOT_CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              className="approval-comment" style={{ marginTop: '8px' }} placeholder="Notes on the analysis..."
              value={notes} onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="approval-btn btn-approve" onClick={logRca}>✓ Log RCA</button>
            <button className="approval-btn btn-forward" onClick={escalateToClca}>→ Escalate to CLCA</button>
          </div>
        </div>
      </div>
    </div>
  );
}
