export default function CalendarForecast() {
  return (
    <div className="tab-panel active">
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>📅 Forecast Calendar — FY25</h2>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Key deadlines.</p>
      <div className="fcal-grid">
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', textAlign: 'center', marginBottom: '8px' }}>FY25 Q1</p>
          <div className="fcal-month" style={{ marginBottom: '10px' }}>
            <div className="fcal-month-title" style={{ color: 'var(--accent-blue)' }}>FEBRUARY 2024</div>
            <table className="fcal-table">
              <thead><tr><th>SAT</th><th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th></tr></thead>
              <tbody>
                <tr><td>3<div className="wk-label">Wk1</div></td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>
                <tr>
                  <td>10<div className="wk-label">Wk2</div></td><td>11</td><td>12</td>
                  <td>13<span className="fcal-event ev-alt">ALT-UPP</span></td><td>14</td><td>15</td>
                  <td>16<span className="fcal-event ev-internal">Internal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', textAlign: 'center', marginBottom: '8px' }}>FY25 Q2</p>
          <div className="fcal-month">
            <div className="fcal-month-title" style={{ color: 'var(--accent-blue)' }}>MAY</div>
            <table className="fcal-table">
              <thead><tr><th>SAT</th><th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th></tr></thead>
              <tbody>
                <tr><td>3<div className="wk-label">Wk1</div></td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="fcal-legend">
        <span><span className="leg-box ev-alt"></span>ALT-UPP</span>
        <span><span className="leg-box ev-internal"></span>Internal</span>
        <span><span className="leg-box ev-biz"></span>Business</span>
        <span><span className="leg-box ev-demand"></span>Demand</span>
        <span><span className="leg-box ev-osp"></span>OSP</span>
        <span><span className="leg-box ev-capacity"></span>Capacity</span>
        <span><span className="leg-box ev-scaling"></span>Scaling</span>
        <span><span className="leg-box ev-finance"></span>Finance</span>
        <span><span className="leg-box ev-upp"></span>UPP</span>
      </div>
    </div>
  );
}
