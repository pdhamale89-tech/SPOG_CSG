export default function KpiCard({ label, value, delta, sub, onClick }) {
  return (
    <div
      className={'kpi-card' + (onClick ? ' kpi-card-clickable' : '')}
      onClick={onClick}
      title={onClick ? 'Click for details' : undefined}
    >
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && <div className="kpi-sub">{delta}</div>}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
