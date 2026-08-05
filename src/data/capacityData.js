import { buildPeriodLabels } from '../utils/periodLabels';

export const CAP_Q8 = ['FY27 Q1', 'FY27 Q2', 'FY27 Q3', 'FY27 Q4', 'FY28 Q1', 'FY28 Q2', 'FY28 Q3', 'FY28 Q4'];
export const CAP_Q6 = ['FY27 Q3', 'FY27 Q4', 'FY28 Q1', 'FY28 Q2', 'FY28 Q3', 'FY28 Q4'];
export const CAP_WK6 = ['Wk27', 'Wk28', 'Wk29', 'Wk30', 'Wk31', 'Wk32'];

// Same approach as forecastData.js's weekly/qtr clones: the numbers stay put,
// only the period axis labels change, so every chart can be re-labeled to
// match the Weekly/Monthly/QTR toggle (and the Fiscal Year filter) without a
// separate dataset per period.
export function capLabelsFor(period, length, fiscalYear) {
  return buildPeriodLabels(fiscalYear, period, length);
}
export const CAP_PERIOD_LABEL = { weekly: 'Week-on-Week', monthly: 'Month-on-Month', qtr: 'Quarter-on-Quarter' };
export const CAP_PERIOD_WORD = { weekly: 'Weekly', monthly: 'Monthly', qtr: 'Quarterly' };

// KPI values genuinely differ by period: volume/hiring/gap/CQN are flow metrics that
// scale with period length (weekly < monthly < quarterly), while headcount and the
// percentage metrics are point-in-time state and stay put (with a slightly different
// "from" comparison value so they don't look like an untouched copy-paste).
export const CAP_KPIS = {
  weekly: [
    { label: 'Volume (Week)', value: '179K', dir: 'dn', delta: '60.9% PoP', sub: 'DB: 23K · OSP: 156K' },
    { label: 'HC (Current Week)', value: '223', dir: 'dn', delta: 'From 227', sub: 'Avg: 217 · Exit: 210' },
    { label: 'Excess Capacity', value: '154%', dir: 'dn', delta: 'From 157%', sub: 'Excess HC: 76' },
    { label: 'Hiring (Week)', value: '2', dir: 'flat', delta: 'UR: 2', sub: 'Next Wk: 1' },
    { label: 'Gap (Week)', value: '-280K', dir: 'dn', delta: 'Under-cap', sub: 'Next Wk: -135K' },
    { label: 'OSP Mix', value: '88%', dir: 'up', delta: 'From 85%', sub: 'DB: 12%' },
    { label: 'Vol Next Week', value: '334K', dir: 'dn', delta: '61.1%', sub: 'DB: 46K · OSP: 288K' },
    { label: 'Weekly CQN', value: '-146K', dir: 'dn', delta: 'Worsening', sub: '~-150K trend' },
  ],
  monthly: [
    { label: 'Volume (Month)', value: '778K', dir: 'dn', delta: '60.9% PoP', sub: 'DB: 98K · OSP: 680K' },
    { label: 'HC (Current Month)', value: '223', dir: 'dn', delta: 'From 231', sub: 'Avg: 217 · Exit: 210' },
    { label: 'Excess Capacity', value: '154%', dir: 'dn', delta: 'From 159%', sub: 'Excess HC: 76' },
    { label: 'Hiring (Month)', value: '9', dir: 'flat', delta: 'UR: 9', sub: 'Next Mo: 6' },
    { label: 'Gap (Month)', value: '-1.21M', dir: 'dn', delta: 'Under-cap', sub: 'Next Mo: -583K' },
    { label: 'OSP Mix', value: '88%', dir: 'up', delta: 'From 76%', sub: 'DB: 12%' },
    { label: 'Vol Next Month', value: '1.45M', dir: 'dn', delta: '61.1%', sub: 'DB: 201K · OSP: 1.24M' },
    { label: 'Monthly CQN', value: '-633K', dir: 'dn', delta: 'Worsening', sub: '~-650K trend' },
  ],
  qtr: [
    { label: 'Volume (Quarter)', value: '2.33M', dir: 'dn', delta: '60.9% PoP', sub: 'DB: 295K · OSP: 2.04M' },
    { label: 'HC (Current Qtr)', value: '223', dir: 'dn', delta: 'From 238', sub: 'Avg: 217 · Exit: 210' },
    { label: 'Excess Capacity', value: '154%', dir: 'dn', delta: 'From 161%', sub: 'Excess HC: 76' },
    { label: 'Hiring (Quarter)', value: '26', dir: 'flat', delta: 'UR: 26', sub: 'Next Qtr: 19' },
    { label: 'Gap (Quarter)', value: '-3.64M', dir: 'dn', delta: 'Under-cap', sub: 'Next Qtr: -1.75M' },
    { label: 'OSP Mix', value: '88%', dir: 'up', delta: 'From 67%', sub: 'DB: 12%' },
    { label: 'Vol Next Qtr', value: '4.34M', dir: 'dn', delta: '61.1%', sub: 'DB: 603K · OSP: 3.73M' },
    { label: 'Quarterly CQN', value: '-1.90M', dir: 'dn', delta: 'Worsening', sub: '~-1.95M trend' },
  ],
};

export const CAP_MINI_STATS = {
  weekly: [
    { label: 'L1 HC Avg', value: '244', tone: 'b' },
    { label: 'L1 HC Exit', value: '210', tone: 'r' },
    { label: 'HC Next Wk', value: '221', tone: 'b' },
    { label: 'LOA Exit', value: '3', tone: 'y' },
  ],
  monthly: [
    { label: 'L1 HC Avg', value: '244', tone: 'b' },
    { label: 'L1 HC Exit', value: '210', tone: 'r' },
    { label: 'HC Next Mo', value: '209', tone: 'b' },
    { label: 'LOA Exit', value: '10', tone: 'y' },
  ],
  qtr: [
    { label: 'L1 HC Avg', value: '244', tone: 'b' },
    { label: 'L1 HC Exit', value: '210', tone: 'r' },
    { label: 'HC FY28Q4', value: '197', tone: 'b' },
    { label: 'LOA Exit', value: '13', tone: 'y' },
  ],
};

// ===== Overview charts =====

export const capC1 = {
  labels: CAP_Q6,
  julDb: [1034810, 925558, 937893, 942416, 948666, 833428],
  julOsp: [2102602, 1913352, 1871279, 1899600, 1928589, 1779520],
  augDb: [155886, 139238, 147572, 165982, 163947, 125798],
  augOsp: [1064622, 974322, 916339, 948023, 964461, 903996],
};

export const capC2 = {
  labels: CAP_Q6,
  julTotal: [3137412, 2838911, 2809172, 2842016, 2877255, 2612947],
  augTotal: [1220508, 1113560, 1063911, 1114005, 1128408, 1029793],
};

// Volume Comparison lets the user pick which two projection vintages to
// compare (was hardcoded Jul vs Aug); this maps a vintage name to its
// field names in capC1 (DB/OSP bars) and capC2 (Total Volume trend line).
export const CAP_VOL_PERIODS = ['Jul', 'Aug'];
export const CAP_VOL_KEYS = {
  Jul: { db: 'julDb', osp: 'julOsp', total: 'julTotal' },
  Aug: { db: 'augDb', osp: 'augOsp', total: 'augTotal' },
};

// Same Plan Name 1/Plan Name 2 selection above also drives which field each of
// these charts reads for its comparison series, so their legends say the plan
// that's actually selected instead of a hardcoded Jul/Aug.
export const CAP_HC_TOTAL_KEYS = { Jul: 'julTotalHc', Aug: 'augTotalHc' };
export const CAP_EXCESS_HC_KEYS = { Jul: 'julExcessHc', Aug: 'augExcessHc' };
export const CAP_LOA_EXIT_KEYS = { Jul: 'julLoaExit', Aug: 'augLoaExit' };
export const CAP_HIRING_KEYS = { Jul: 'julOld', Aug: 'augNew' };
export const CAP_L1_EXIT_KEYS = { Jul: 'julL1Exit', Aug: 'augL1Exit' };

export const capC3 = {
  labels: CAP_Q8,
  augHcAvg: [247, 251, 247, 231, 217, 210, 205, 190],
  augHcExit: [235, 256, 239, 223, 210, 211, 196, 184],
  julTotalHc: [1889, 1756, 1727, 1638, 1586, 1556, 1512, 1433],
  augTotalHc: [258, 274, 254, 238, 223, 224, 209, 197],
};

export const capC4 = {
  labels: CAP_Q8,
  julExcessHc: [294, 299, 202, 284, 215, 192, 160, 208],
  augExcessHc: [81, 108, 94, 86, 76, 64, 55, 64],
  julLoaExit: [79, 60, 56, 56, 52, 52, 52, 52],
  augLoaExit: [23, 18, 15, 15, 13, 13, 13, 13],
  julTraining: [13, 9, 11, 0, 10, 16, 1, 0],
};

export const capC5 = {
  labels: CAP_Q8,
  julOld: [63, 9, 92, 16, 67, 52, 47, 9],
  augNew: [22, 0, 4, 0, 19, 0, 0, 0],
};

export const capC6 = {
  labels: CAP_Q8,
  julApproved: [3, 9, 5, 0, 0, 0, 0, 0],
  julUrHiring: [60, 0, 32, 0, 19, 0, 0, 0],
  julNonApproved: [0, 0, 55, 16, 48, 52, 47, 9],
  augUrHiring: [22, 0, 4, 0, 19, 0, 0, 0],
  julOverall: [63, 9, 92, 16, 67, 52, 47, 9],
  augOverall: [22, 0, 4, 0, 19, 0, 0, 0],
};

export const capC7 = {
  labels: CAP_Q8,
  capPctOld: [119, 120, 114, 121, 116, 115, 112, 117],
  capPctNew: [149, 176, 162, 159, 154, 144, 137, 151],
  ospPctOld: [null, null, 67, 67, 67, 67, 67, 68],
  ospPctNew: [null, null, 87, 87, 86, 85, 85, 88],
};

export const capC8 = {
  labels: CAP_Q8,
  julL1Exit: [1797, 1687, 1660, 1582, 1524, 1488, 1459, 1381],
  augL1Exit: [235, 256, 239, 223, 210, 211, 196, 184],
  exitPopPct: [-86.9, -84.8, -85.6, -85.9, -86.2, -85.8, -86.5, -86.7],
};

// ===== Analytics charts =====

export const capA1 = {
  labels: CAP_Q8,
  dbVolPop: [null, null, -84.9, -85, -84.3, -82.4, -82.7, -84.9],
  ospVolPop: [null, null, -49.4, -49.1, -51, -50.1, -50, -49.2],
  totalVolPop: [null, null, -61.1, -60.8, -62.1, -60.8, -60.8, -60.6],
  hcAvgPop: [-86.5, -85.7, -85.1, -85.8, -86, -86.1, -86.2, -86.6],
  hcExitPop: [-86.9, -84.8, -85.6, -85.9, -86.2, -85.8, -86.5, -86.7],
};

export const capWeeklyTable = {
  cols: CAP_WK6,
  rows: [
    { queue: 'ANZ Client Core Chat', vals: [-38, -29, -32, -31, -31, -29] },
    { queue: 'ANZ Client Core Email', vals: [-717, -663, -651, -660, -653, -697] },
    { queue: 'ANZ CommClient OOP Email', vals: [-787, -805, -804, -810, -803, -808] },
    { queue: 'ANZ Commercial Client', vals: [-266, -267, -261, -261, -263, -262] },
    { queue: 'ANZ Consumer OOP Email', vals: [-202, -201, -201, -206, -210, -200] },
    { queue: 'ANZ OOP', vals: [-123, -116, -116, -113, -120, -115] },
    { queue: 'ANZ Tech Cons Chat', vals: [-139, -144, -135, -133, -122, -126] },
    { queue: 'ANZ Tech Cons CNX', vals: [-339, -336, -334, -339, -333, -328] },
    { queue: 'ANZ Tech Cons Email', vals: [-253, -274, -258, -270, -268, -283] },
    { queue: 'ANZ Cons Retail', vals: [-13, -13, -14, -13, -13, -13] },
  ],
  total: { queue: 'Total', vals: [-146042, -144068, -145781, -145859, -150564, -150486] },
};
