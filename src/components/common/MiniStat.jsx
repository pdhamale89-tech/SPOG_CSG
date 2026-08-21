import InfoBtn from './InfoBtn';
import { scaleDisplayValue } from '../../utils/displayScale';

export default function MiniStat({ label, value, tone, tip }) {
  return (
    <div className="mini-stat">
      <div className="mini-stat-lbl">
        {label}
        {tip && <InfoBtn tip={`<strong>Purpose</strong>${tip}`} />}
      </div>
      <div className={'mini-stat-val tone-' + tone}>{scaleDisplayValue(value)}</div>
    </div>
  );
}
