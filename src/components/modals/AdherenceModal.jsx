import { Fragment } from 'react';
import { useApp } from '../../context/AppContext';
import { ADHERENCE_MATRIX } from '../../data/adherenceDetail';
import DownloadBtn from '../common/DownloadBtn';

const { regions, subsByRegion, groups, overall } = ADHERENCE_MATRIX;

function cellClass(v) {
  return v >= 0 ? 'mtx-pos' : 'mtx-neg';
}

function buildCsvRows() {
  const header = ['Offering', 'Segment'];
  regions.forEach((r) => { subsByRegion[r].forEach((s) => header.push(`${r} ${s}`)); header.push(`${r} Total`); });
  header.push('Grand Total');

  const rowToCsv = (offeringLabel, row) => {
    const cells = [offeringLabel, row.label];
    regions.forEach((r) => {
      subsByRegion[r].forEach((s) => cells.push(row.byRegion[r][s] + '%'));
      cells.push(row.byRegion[r].Total + '%');
    });
    cells.push(row.grandTotal + '%');
    return cells;
  };

  const rows = [header];
  groups.forEach((g) => g.rows.forEach((row) => rows.push(rowToCsv(g.label, row))));
  rows.push(rowToCsv('Overall', { label: '', ...overall }));
  return rows;
}

export default function AdherenceModal() {
  const { adherenceModal, closeAdherence } = useApp();

  return (
    <div className={'modal-overlay' + (adherenceModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeAdherence(); }}>
      <div className="modal adherence-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌍 Forecast Adherence Detail</h2>
          <button className="modal-close" onClick={closeAdherence}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <DownloadBtn filename="forecast-adherence-matrix" title="Download forecast adherence matrix" rows={buildCsvRows()} />
          </div>

          <div className="matrix-wrap">
            <table className="matrix-tbl">
              <thead>
                <tr>
                  <th colSpan={2}></th>
                  {regions.map((r) => <th key={r} colSpan={subsByRegion[r].length + 1}>{r}</th>)}
                  <th rowSpan={2}>TOTAL</th>
                </tr>
                <tr>
                  <th></th><th></th>
                  {regions.map((r) => (
                    <Fragment key={r}>
                      {subsByRegion[r].map((s) => <th key={r + s}>{s}</th>)}
                      <th>Total</th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => g.rows.map((row, i) => (
                  <tr key={g.label + row.label}>
                    {i === 0 && <th rowSpan={g.rows.length}>{g.label}</th>}
                    <th>{row.label}</th>
                    {regions.map((r) => (
                      <Fragment key={r}>
                        {subsByRegion[r].map((s) => (
                          <td key={s} className={cellClass(row.byRegion[r][s])}>{row.byRegion[r][s]}%</td>
                        ))}
                        <td className={cellClass(row.byRegion[r].Total)}>{row.byRegion[r].Total}%</td>
                      </Fragment>
                    ))}
                    <td className={cellClass(row.grandTotal)}>{row.grandTotal}%</td>
                  </tr>
                )))}
                <tr className="mtx-overall-row">
                  <th colSpan={2}>Overall</th>
                  {regions.map((r) => (
                    <Fragment key={r}>
                      {subsByRegion[r].map((s) => (
                        <td key={s} className={cellClass(overall.byRegion[r][s])}>{overall.byRegion[r][s]}%</td>
                      ))}
                      <td className={cellClass(overall.byRegion[r].Total)}>{overall.byRegion[r].Total}%</td>
                    </Fragment>
                  ))}
                  <td className={cellClass(overall.grandTotal)}>{overall.grandTotal}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
