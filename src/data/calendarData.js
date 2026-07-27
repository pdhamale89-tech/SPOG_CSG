// Standard 4-4-5 retail fiscal calendar: 52 weeks (Sat-Fri), grouped into 4
// quarters of 13 weeks, each quarter split into 3 "fiscal months" of 4/4/5
// weeks. Month names are fixed labels for each slot, not derived from the
// real calendar month the days fall in (the first week of "MARCH" starts on
// the last Saturday of February, exactly like the reference calendar).

const DAY_COLS = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
const WEEKS_PER_MONTH = [4, 4, 5];
const FISCAL_START = new Date(2026, 0, 31); // Saturday, Jan 31 2026

const QUARTER_DEFS = [
  { label: 'FY27 Q1', months: [{ name: 'FEBRUARY', tag: '(2026)' }, { name: 'MARCH' }, { name: 'APRIL' }] },
  { label: 'FY27 Q2', months: [{ name: 'MAY' }, { name: 'JUNE' }, { name: 'JULY' }] },
  { label: 'FY27 Q3', months: [{ name: 'AUGUST' }, { name: 'SEPTEMBER' }, { name: 'OCTOBER' }] },
  { label: 'FY27 Q4', months: [{ name: 'NOVEMBER' }, { name: 'DECEMBER' }, { name: 'JANUARY', tag: '(2026)' }] },
];

const DEMAND_TEXT = ['Demand due\nEffective wk 6', 'Demand due Eff-\nwk 10, Q3 FL', 'Demand due\nEffective wk 1'];
const OSP_TEXT = ['OSP locks due\nEffective wk 9', 'OSP locks due\nEffective wk 1', 'OSP locks due\nEffective wk 5'];

function buildEvents(posInMonth, monthIdx, isAugustWk1) {
  const events = {};
  if (posInMonth === 0) {
    if (monthIdx > 0) events.SAT = { text: 'Finance summaries due', cls: 'cal-ev-finance' };
    if (isAugustWk1) events.WED = { text: 'HC Plan Due', cls: 'cal-ev-hcplan' };
  } else if (posInMonth === 1) {
    events.TUE = { text: 'ALT-UPP Due', cls: 'cal-ev-alt' };
  } else if (posInMonth === 2) {
    events.WED = { text: 'UPP Out', cls: 'cal-ev-plain' };
    events.FRI = { text: DEMAND_TEXT[monthIdx], cls: 'cal-ev-demand' };
  } else if (posInMonth === 3) {
    events.TUE = { text: OSP_TEXT[monthIdx], cls: 'cal-ev-osp' };
    events.FRI = { text: 'Scaling review', text2: 'HC Plan Due', cls: 'cal-ev-scaling' };
  } else if (posInMonth === 4) {
    events.SAT = { text: 'Finance summaries due', cls: 'cal-ev-finance' };
  }
  return events;
}

// The Thanksgiving/Christmas holiday weeks (last week of NOVEMBER and last
// week of DECEMBER) get an extra lavender Holiday bar over Wed-Fri, on top
// of the regular OSP/Scaling pattern for that week position.
function applyHolidayOverlay(quarterLabel, monthName, posInMonth, events) {
  if (quarterLabel !== 'FY27 Q4') return events;
  if (monthName === 'NOVEMBER' && posInMonth === 3) {
    return { ...events, HOLIDAY: { text: 'Holiday', cls: 'cal-ev-holiday', span: ['WED', 'THU', 'FRI'] } };
  }
  if (monthName === 'DECEMBER' && posInMonth === 3) {
    return { ...events, HOLIDAY: { text: 'Holiday', cls: 'cal-ev-holiday', span: ['WED', 'THU', 'FRI'] }, SAT: { text: 'Finance Summary due', cls: 'cal-ev-finance' } };
  }
  return events;
}

function buildCalendar() {
  let cursor = new Date(FISCAL_START);
  let cumWeek = 0;
  return QUARTER_DEFS.map((qDef) => ({
    label: qDef.label,
    months: qDef.months.map((mDef, monthIdx) => {
      const weekCount = WEEKS_PER_MONTH[monthIdx];
      const weeks = [];
      for (let posInMonth = 0; posInMonth < weekCount; posInMonth++) {
        cumWeek += 1;
        const days = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(cursor);
          d.setDate(d.getDate() + i);
          days.push(d.getDate());
        }
        let events = buildEvents(posInMonth, monthIdx, qDef.label === 'FY27 Q3' && monthIdx === 0 && posInMonth === 0);
        events = applyHolidayOverlay(qDef.label, mDef.name, posInMonth, events);
        weeks.push({ days, wk: `Wk${posInMonth + 1}`, cum: cumWeek, events });
        cursor.setDate(cursor.getDate() + 7);
      }
      return { name: mDef.name, tag: mDef.tag || '', weeks };
    }),
  }));
}

export const DAY_COLUMNS = DAY_COLS;
export const FISCAL_CALENDAR = buildCalendar();
