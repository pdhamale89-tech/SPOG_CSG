import { Fragment, useState } from 'react';
import { SHIP_ADHERENCE_MATRIX } from '../../data/shipmentAdherenceDetail';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';

const { regions, subsByRegion, groups, overall } = SHIP_ADHERENCE_MATRIX;

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

export default function ShipmentAdherenceDetail() {
  const [expanded, setExpanded] = useState({});

  function toggleGroup(key) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          🚚 Shipment Adherence Detail
          <InfoBtn tip="<strong>Purpose</strong>Shipment adherence by Region/Sub Region, broken down by Offering and Segment.<strong>Tip</strong>💡 Click an offering to expand its Enterprise/Commercial/Consumer split." />
        </div>
        <DownloadBtn filename="shipment-adherence-matrix" title="Download shipment adherence matrix" rows={buildCsvRows()} />
      </div>

      <div className="matrix-wrap">
        <table className="matrix-tbl">
          <thead>
            <tr>
              <th rowSpan={2}>Offering</th>
              <th rowSpan={2}>Segment</th>
              {regions.map((r) => <th key={r} colSpan={subsByRegion[r].length + 1}>{r}</th>)}
              <th rowSpan={2}>TOTAL</th>
            </tr>
            <tr>
              {regions.map((r) => (
                <Fragment key={r}>
                  {subsByRegion[r].map((s) => <th key={r + s}>{s}</th>)}
                  <th>Total</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const isOpen = !!expanded[g.key];
              const visibleRows = isOpen ? g.rows : g.rows.filter((row) => row.label === 'Overall');
              return visibleRows.map((row, i) => (
                <tr key={g.key + row.label}>
                  {i === 0 && (
                    <th rowSpan={visibleRows.length}>
                      <button type="button" className="mtx-toggle" onClick={() => toggleGroup(g.key)} title={isOpen ? 'Collapse' : 'Expand to see Enterprise/Commercial/Consumer split'}>
                        <span className="mtx-toggle-ic">{isOpen ? '▾' : '▸'}</span>{g.label}
                      </button>
                    </th>
                  )}
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
              ));
            })}
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
  );
}
