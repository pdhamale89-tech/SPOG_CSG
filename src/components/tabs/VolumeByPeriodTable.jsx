import { useApp } from '../../context/AppContext';
import { buildPeriodLabels } from '../../utils/periodLabels';
import { VOL_OFFERINGS, VOL_ROWS_BY_PERIOD, VOL_GRAND_TOTAL, volRowTotal } from '../../data/volumeByPeriod';
import InfoBtn from '../common/InfoBtn';
import DownloadBtn from '../common/DownloadBtn';

const PERIOD_HEADER = { weekly: 'Fiscal Week', monthly: 'Fiscal Month', qtr: 'Fiscal Quarter' };

export default function VolumeByPeriodTable() {
  const { curPeriod, fiscalYear } = useApp();
  const rows = VOL_ROWS_BY_PERIOD[curPeriod] || VOL_ROWS_BY_PERIOD.qtr;
  const labels = buildPeriodLabels(fiscalYear, curPeriod, rows.length);
  const grandTotal = volRowTotal(VOL_GRAND_TOTAL);

  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="card-header">
        <div className="card-title">
          📦 Actual Volume by {PERIOD_HEADER[curPeriod] || 'Fiscal Quarter'}
          <InfoBtn tip="<strong>Purpose</strong>Actual volume by offering, broken out per period. Follows the top Weekly/Monthly/QTR toggle." />
        </div>
        <DownloadBtn
          filename="actual-volume-by-period"
          title="Download actual volume by period"
          rows={[
            [PERIOD_HEADER[curPeriod] || 'Fiscal Quarter', ...VOL_OFFERINGS, 'Total'],
            ...rows.map((r, i) => [labels[i], ...VOL_OFFERINGS.map((o) => r[o]), volRowTotal(r)]),
            ['Grand Total', ...VOL_OFFERINGS.map((o) => VOL_GRAND_TOTAL[o]), grandTotal],
          ]}
        />
      </div>
      <div className="tw vbp-tbl-wrap">
        <table className="vbp-tbl">
          <thead>
            <tr>
              <th>{PERIOD_HEADER[curPeriod] || 'Fiscal Quarter'}</th>
              {VOL_OFFERINGS.map((o) => <th key={o}>{o}</th>)}
              <th className="vbp-total-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={labels[i]}>
                <td>{labels[i]}</td>
                {VOL_OFFERINGS.map((o) => <td key={o}>{r[o].toLocaleString()}</td>)}
                <td className="vbp-total-col">{volRowTotal(r).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="vbp-grand-row">
              <td>Grand Total</td>
              {VOL_OFFERINGS.map((o) => <td key={o}>{VOL_GRAND_TOTAL[o].toLocaleString()}</td>)}
              <td>{grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
