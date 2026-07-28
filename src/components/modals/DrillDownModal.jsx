import { useApp } from '../../context/AppContext';
import ChartCanvas from '../charts/ChartCanvas';

function noop() {}

export default function DrillDownModal() {
  const { drillDownModal, closeDrillDown } = useApp();
  const { open, title, subtitle, panels } = drillDownModal;

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeDrillDown(); }}>
      <div className="modal drilldown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Drill-Down'}</h2>
          <button className="modal-close" onClick={closeDrillDown}>&times;</button>
        </div>
        <div className="modal-body">
          {subtitle && <div className="drilldown-subtitle">{subtitle}</div>}
          {(panels || []).map((p) => (
            <div className="drilldown-panel" key={p.title}>
              <div className="drilldown-panel-title">{p.title}</div>
              <ChartCanvas config={p.config} height="200px" onClick={noop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
