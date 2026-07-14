import { useState } from 'react';
import { hvData } from '../../data/forecastData';

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
          <tr>
            <td className="hv-expand" onClick={() => setExpanded((e) => !e)}>{expanded ? '▼' : '▶'} {pd.total[0]}</td>
            {pd.total.slice(1).map((v, i) => {
              const isNegPct = v.indexOf('-') === 0 && v.indexOf('%') > 0;
              return <td key={i} className={isNegPct ? 'hv-red' : ''}><strong>{v}</strong></td>;
            })}
          </tr>
          {expanded && pd.rows.map((row, ri) => (
            <tr key={ri} className="hv-child open">
              {row.map((v, ci) => {
                const isLast = ci === row.length - 1;
                const isNeg = isLast && v.indexOf('-') === 0;
                return <td key={ci} className={isNeg ? 'hv-red' : ''}>{v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
