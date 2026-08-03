import { useApp } from '../../context/AppContext';
import { buildPeriodLabels } from '../../utils/periodLabels';
import { SEGMENT_SOLD_DATA } from '../charts/chartConfigs';
import DownloadBtn from '../common/DownloadBtn';

const PERIOD_WORD = { weekly: 'Weekly', monthly: 'Monthly', qtr: 'QTR' };

export default function SegmentGrowthModal() {
  const { segmentGrowthModal, closeSegmentGrowth, curPeriod, fiscalYear } = useApp();

  const n = SEGMENT_SOLD_DATA.Consumer.length;
  const labels = buildPeriodLabels(fiscalYear, curPeriod, n);
  const rows = labels.map((label, i) => {
    const consumer = SEGMENT_SOLD_DATA.Consumer[i];
    const commercial = SEGMENT_SOLD_DATA.Commercial[i];
    const enterprise = SEGMENT_SOLD_DATA.Enterprise[i];
    return { label, consumer, commercial, enterprise, total: consumer + commercial + enterprise };
  });
  const firstRow = rows[0];
  const lastRow = rows[n - 1];
  const growth = Math.round(((lastRow.total - firstRow.total) / firstRow.total) * 1000) / 10;

  return (
    <div className={'modal-overlay' + (segmentGrowthModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeSegmentGrowth(); }}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📈 Segment Sold Growth Detail</h2>
          <button className="modal-close" onClick={closeSegmentGrowth}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <DownloadBtn
              filename="segment-sold-growth-detail"
              title="Download segment sold growth detail"
              rows={[
                ['Period', 'Consumer', 'Commercial', 'Enterprise', 'Total'],
                ...rows.map((r) => [r.label, r.consumer, r.commercial, r.enterprise, r.total]),
              ]}
            />
          </div>

          <div className="tw holiday-tbl-wrap">
            <table>
              <thead>
                <tr><th>{PERIOD_WORD[curPeriod] || 'Period'}</th><th>Consumer</th><th>Commercial</th><th>Enterprise</th><th>Total</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className={i === 0 || i === n - 1 ? 'sgm-highlight-row' : undefined}>
                    <td>{r.label}</td><td>{r.consumer}</td><td>{r.commercial}</td><td>{r.enterprise}</td><td><strong>{r.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sgm-calc">
            <div className="sgm-calc-title">🧮 How this is calculated</div>
            <ol>
              <li>First period ({firstRow.label}) total = {firstRow.consumer} + {firstRow.commercial} + {firstRow.enterprise} = <strong>{firstRow.total}</strong></li>
              <li>Last period ({lastRow.label}) total = {lastRow.consumer} + {lastRow.commercial} + {lastRow.enterprise} = <strong>{lastRow.total}</strong></li>
              <li>Growth% = (Last − First) ÷ First × 100 = ({lastRow.total} − {firstRow.total}) ÷ {firstRow.total} × 100 = <strong>{growth >= 0 ? '+' : ''}{growth}%</strong></li>
            </ol>
            <p className="sgm-calc-note">
              This compares the first period to the last period only — it is not a period-over-period average or a
              trend-line slope. The result is the same whichever Segment/Offering view the chart below is toggled to,
              since both split the exact same per-period totals shown here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
