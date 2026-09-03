import { useApp } from '../../context/AppContext';
import DownloadBtn from '../common/DownloadBtn';
import { channelBreakdown, regionLocationBreakdown } from '../../data/capacityKpiDrillData';
import { scaleByRelativePercent } from '../../utils/displayScale';

// Same flat 15% cut Capacity Overview uses everywhere else, applied to the
// raw (pre-split) totals passed in and to each split-out row individually.
const CAP_CUT_PCT = 15;
const fmt = (n) => scaleByRelativePercent(n != null ? n.toLocaleString() : '0', CAP_CUT_PCT);

export default function CapacityKpiDrillModal() {
  const { kpiDrillModal, closeKpiDrill } = useApp();
  const { open, kind, aTotal, bTotal, pA, pB } = kpiDrillModal;
  const isChannel = kind === 'hcAvg';
  const title = isChannel ? 'HC Avg — Channel-wise Breakdown' : 'Excess HC — Region & Agent Location-wise Breakdown';

  const aRows = isChannel ? channelBreakdown(aTotal, `${pA}-a`) : regionLocationBreakdown(aTotal, `${pA}-a`);
  const bRows = isChannel ? channelBreakdown(bTotal, `${pB}-b`) : regionLocationBreakdown(bTotal, `${pB}-b`);

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeKpiDrill(); }}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isChannel ? '🎧' : '📍'} {title}</h2>
          <button className="modal-close" onClick={closeKpiDrill}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <DownloadBtn
              filename={isChannel ? 'hc-avg-channel-breakdown' : 'excess-hc-region-location-breakdown'}
              title={`Download ${title.replace(/—/g, '-').toLowerCase()}`}
              rows={isChannel
                ? [['Channel', pA, pB], ...aRows.map((r, i) => [r.label, r.value, bRows[i].value]), ['Total', aTotal, bTotal]]
                : [['Region', 'Agent Location', pA, pB], ...aRows.map((r, i) => [r.region, r.location, r.value, bRows[i].value]), ['', 'Total', aTotal, bTotal]]}
            />
          </div>

          <div className="tw holiday-tbl-wrap">
            <table>
              <thead>
                {isChannel
                  ? <tr><th>Channel</th><th>{pA}</th><th>{pB}</th></tr>
                  : <tr><th>Region</th><th>Agent Location</th><th>{pA}</th><th>{pB}</th></tr>}
              </thead>
              <tbody>
                {aRows.map((r, i) => (
                  isChannel ? (
                    <tr key={r.label}>
                      <td>{r.label}</td><td>{fmt(r.value)}</td><td>{fmt(bRows[i].value)}</td>
                    </tr>
                  ) : (
                    <tr key={`${r.region}-${r.location}`}>
                      <td>{r.region}</td><td>{r.location}</td><td>{fmt(r.value)}</td><td>{fmt(bRows[i].value)}</td>
                    </tr>
                  )
                ))}
                <tr className="tbl-total">
                  {isChannel
                    ? <><td>Total</td><td>{fmt(aTotal)}</td><td>{fmt(bTotal)}</td></>
                    : <><td colSpan={2}>Total</td><td>{fmt(aTotal)}</td><td>{fmt(bTotal)}</td></>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
