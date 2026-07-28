import { useApp } from '../../context/AppContext';

function rowToneClass(value) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('+')) return 'up';
  if (value.startsWith('-')) return 'down';
  return '';
}

export default function DrillDownModal() {
  const { drillDownModal, closeDrillDown } = useApp();
  const { open, title, subtitle, rows } = drillDownModal;

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeDrillDown(); }}>
      <div className="modal drilldown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Drill-Down'}</h2>
          <button className="modal-close" onClick={closeDrillDown}>&times;</button>
        </div>
        <div className="modal-body">
          {subtitle && <div className="drilldown-subtitle">{subtitle}</div>}
          <div className="drilldown-rows">
            {(rows || []).map((r) => (
              <div className="drilldown-row" key={r.label}>
                <div className="drilldown-row-label">{r.label}</div>
                <div className={'drilldown-row-value ' + rowToneClass(r.value)}>{r.value}</div>
                <div className="drilldown-row-sub">{r.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
