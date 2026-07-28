import { useApp } from '../../context/AppContext';
import { computeKpiDrillDown } from '../../utils/drillDown';

const DRILLDOWN_SUBTITLE = 'Plan over Plan · Year on Year · Month on Month · Week on Week';

export default function KpiCard({ label, value, delta, sub }) {
  const { curPeriod, openDrillDown } = useApp();

  function handleClick() {
    const { rows } = computeKpiDrillDown({ label, value, delta, sub }, curPeriod);
    openDrillDown(label, DRILLDOWN_SUBTITLE, rows);
  }

  return (
    <div className="kpi-card" onClick={handleClick}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && <div className="kpi-sub">{delta}</div>}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
