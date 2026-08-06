import { useApp } from '../../context/AppContext';
import { planYearLabel } from '../charts/chartConfigs';

export default function HeadcountDetailModal() {
  const { headcountDetailModal, closeHeadcountDetail } = useApp();
  const {
    open, label, periodA, periodB, year1, year2,
    aTotal, aAvg, aExit, aExcess,
    bTotal, bAvg, bExit, bExcess,
  } = headcountDetailModal;

  const rows = [
    { metric: 'Total HC', a: aTotal, b: bTotal, strong: true },
    { metric: 'L1 HC Avg', a: aAvg, b: bAvg },
    { metric: 'L1 HC Exit', a: aExit, b: bExit },
    { metric: 'Excess HC', a: aExcess, b: bExcess },
  ];

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeHeadcountDetail(); }}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Headcount Detail — {label}</h2>
          <button className="modal-close" onClick={closeHeadcountDetail}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="tw">
            <table>
              <thead>
                <tr><th>Metric</th><th>{planYearLabel(periodA, year1)}</th><th>{planYearLabel(periodB, year2)}</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.metric}>
                    <td>{r.metric}</td>
                    <td>{r.strong ? <strong>{r.a?.toLocaleString()}</strong> : r.a?.toLocaleString()}</td>
                    <td>{r.strong ? <strong>{r.b?.toLocaleString()}</strong> : r.b?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
