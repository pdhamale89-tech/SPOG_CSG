import { Fragment, useState } from 'react';
import { hvData } from '../../data/forecastData';
import { scaleDisplayValue } from '../../utils/displayScale';

export default function HistVolTable({ period }) {
  const [expanded, setExpanded] = useState(false);
  const pd = hvData[period] || hvData.monthly;

  return (
    <div className="tw">
      <table className="hv-table">
        <thead>
          <tr>{pd.cols.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {pd.groups.map((g, gi) => (
            <Fragment key={gi}>
              <tr>
                <td className="hv-expand" onClick={() => setExpanded((e) => !e)}>{expanded ? '▼' : '▶'} {g.total[0]}</td>
                {g.total.slice(1).map((v, i) => {
                  const isNegPct = v.indexOf('-') === 0 && v.indexOf('%') > 0;
                  return <td key={i} className={isNegPct ? 'hv-red' : ''}><strong>{scaleDisplayValue(v)}</strong></td>;
                })}
              </tr>
              {expanded && g.rows.map((row, ri) => (
                <tr key={ri} className="hv-child open">
                  {row.map((v, ci) => {
                    const isLast = ci === row.length - 1;
                    const isNeg = isLast && v.indexOf('-') === 0;
                    return <td key={ci} className={isNeg ? 'hv-red' : ''}>{scaleDisplayValue(v)}</td>;
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
