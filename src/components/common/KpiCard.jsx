export default function KpiCard({ label, value, delta, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && <div className="kpi-sub">{delta}</div>}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
