import { useApp } from '../../context/AppContext';
import { computeKpiDrillDown } from '../../utils/drillDown';

const DRILLDOWN_SUBTITLE = 'Plan over Plan · Year on Year · Month on Month · Week on Week';

export default function MiniStat({ label, value, tone }) {
  const { curPeriod, openDrillDown } = useApp();

  function handleClick() {
    const { rows } = computeKpiDrillDown({ label, value }, curPeriod);
    if (!rows.length) return;
    openDrillDown(label, DRILLDOWN_SUBTITLE, rows);
  }

  return (
    <div className="mini-stat" onClick={handleClick}>
      <div className="mini-stat-lbl">{label}</div>
      <div className={'mini-stat-val tone-' + tone}>{value}</div>
    </div>
  );
}
