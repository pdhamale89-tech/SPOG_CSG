import { DAY_COLUMNS, FISCAL_CALENDAR } from '../../data/calendarData';

const LEGEND = [
  { cls: 'cal-ev-alt', label: 'ALT-UPP Due' },
  { cls: 'cal-ev-demand', label: 'Demand Due' },
  { cls: 'cal-ev-osp', label: 'OSP Locks Due' },
  { cls: 'cal-ev-scaling', label: 'Scaling Review / HC Plan Due' },
  { cls: 'cal-ev-finance', label: 'Finance Summaries Due' },
  { cls: 'cal-ev-plain', label: 'UPP Out' },
  { cls: 'cal-ev-holiday', label: 'Holiday' },
];

function WeekRow({ week }) {
  const holiday = week.events.HOLIDAY;
  return (
    <tr>
      {DAY_COLUMNS.map((col, i) => {
        if (holiday && holiday.span.includes(col)) {
          if (col !== holiday.span[0]) return null;
          return (
            <td key={col} colSpan={holiday.span.length} className={holiday.cls}>
              <div className="cal-daynum">{week.days[i]}</div>
              <div className="cal-ev-text">{holiday.text}</div>
            </td>
          );
        }
        const ev = week.events[col];
        return (
          <td key={col} className={ev ? ev.cls : ''}>
            <div className="cal-daynum">{week.days[i]}</div>
            {col === 'SAT' && <div className="cal-wk">{week.wk} <span className="cal-wk-cum">({week.cum})</span></div>}
            {ev && <div className="cal-ev-text">{ev.text}{ev.text2 ? `\n${ev.text2}` : ''}</div>}
          </td>
        );
      })}
    </tr>
  );
}

function MonthBlock({ month }) {
  return (
    <div className="cal-month">
      <div className="cal-month-side">{month.name}{month.tag && <small>{month.tag}</small>}</div>
      <div className="cal-month-body">
        <table className="cal-table">
          <thead><tr>{DAY_COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {month.weeks.map((w) => <WeekRow key={w.cum} week={w} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CalendarForecast() {
  return (
    <div className="tab-panel active">
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>📅 Forecast Calendar — FY27</h2>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        Fiscal weeks and key planning deadlines across all four quarters (4-4-5 calendar).
      </p>
      <div className="cal-quarter-grid">
        {FISCAL_CALENDAR.map((q) => (
          <div className="cal-quarter" key={q.label}>
            <div className="cal-quarter-title">{q.label}</div>
            {q.months.map((m) => <MonthBlock key={m.name} month={m} />)}
          </div>
        ))}
      </div>
      <div className="cal-legend">
        {LEGEND.map((l) => (
          <span className="cal-legend-item" key={l.cls}>
            <span className={'cal-legend-dot ' + l.cls}></span>{l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
