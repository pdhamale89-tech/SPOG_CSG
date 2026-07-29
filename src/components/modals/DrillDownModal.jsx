import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ChartCanvas from '../charts/ChartCanvas';

function noop() {}

export default function DrillDownModal() {
  const { drillDownModal, closeDrillDown } = useApp();
  const { open, title, subtitle, panels, tableRows } = drillDownModal;
  const [view, setView] = useState(0);

  useEffect(() => {
    if (open) setView(0);
  }, [open]);

  const activePanel = typeof view === 'number' ? panels?.[view] : null;
  const [header, ...bodyRows] = tableRows || [];

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeDrillDown(); }}>
      <div className="modal drilldown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Drill-Down'}</h2>
          <button className="modal-close" onClick={closeDrillDown}>&times;</button>
        </div>
        <div className="modal-body">
          {subtitle && <div className="drilldown-subtitle">{subtitle}</div>}

          <div className="drilldown-toggle">
            {(panels || []).map((p, i) => (
              <button key={p.title} className={'drilldown-toggle-btn' + (view === i ? ' active' : '')} onClick={() => setView(i)}>{p.title}</button>
            ))}
            <button className={'drilldown-toggle-btn' + (view === 'table' ? ' active' : '')} onClick={() => setView('table')}>Table</button>
          </div>

          {activePanel && <ChartCanvas config={activePanel.config} height="280px" onClick={noop} />}

          {view === 'table' && (
            <div className="tw drilldown-tbl-wrap">
              <table>
                <thead>
                  <tr>{(header || []).map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
