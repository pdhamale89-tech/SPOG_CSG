export default function MiniStat({ label, value, tone }) {
  return (
    <div className="mini-stat">
      <div className="mini-stat-lbl">{label}</div>
      <div className={'mini-stat-val tone-' + tone}>{value}</div>
    </div>
  );
}
