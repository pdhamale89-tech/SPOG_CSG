export const CAP_Q8 = ['FY27 Q1', 'FY27 Q2', 'FY27 Q3', 'FY27 Q4', 'FY28 Q1', 'FY28 Q2', 'FY28 Q3', 'FY28 Q4'];
export const CAP_Q6 = ['FY27 Q3', 'FY27 Q4', 'FY28 Q1', 'FY28 Q2', 'FY28 Q3', 'FY28 Q4'];
export const CAP_WK6 = ['Wk27', 'Wk28', 'Wk29', 'Wk30', 'Wk31', 'Wk32'];

export const capKpis = [
  { label: 'Volume (FY27)', value: '2.33M', dir: 'dn', delta: '60.9% PoP', sub: 'DB: 295K · OSP: 2.04M' },
  { label: 'HC (FY28 Q1)', value: '223', dir: 'dn', delta: 'From 238', sub: 'Avg: 217 · Exit: 210' },
  { label: 'Excess Capacity', value: '154%', dir: 'dn', delta: 'From 161%', sub: 'Excess HC: 76' },
  { label: 'Hiring (FY27)', value: '26', dir: 'flat', delta: 'UR: 26', sub: 'FY28: 19' },
  { label: 'Gap (FY27)', value: '-3.64M', dir: 'dn', delta: 'Under-cap', sub: 'FY28Q4: -1.75M' },
  { label: 'OSP Mix', value: '88%', dir: 'up', delta: 'From 67%', sub: 'DB: 12%' },
  { label: 'Vol FY28', value: '4.34M', dir: 'dn', delta: '61.1%', sub: 'DB: 603K · OSP: 3.73M' },
  { label: 'Weekly CQN', value: '-146K', dir: 'dn', delta: 'Worsening', sub: '~-150K trend' },
];

export const capMiniStats = [
  { label: 'L1 HC Avg', value: '244', tone: 'b' },
  { label: 'L1 HC Exit', value: '210', tone: 'r' },
  { label: 'HC FY28Q4', value: '197', tone: 'b' },
  { label: 'LOA Exit', value: '13', tone: 'y' },
];

export const capAlerts = [
  { tone: 'c', text: 'Critical: Volume gap -3.64M. Demand exceeds capacity.', time: 'Now' },
  { tone: 'c', text: 'Critical: Hiring PoP = 0 in Q2 & Q4.', time: 'Today' },
  { tone: 'w', text: 'Warning: Excess capacity 154%. Rebalance needed.', time: '2h ago' },
  { tone: 'i', text: 'Info: OSP Mix 88% — partner dependency risk.', time: '4h ago' },
];

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
  demandFcst: [3137412, 2838910, 2809172, 2842016, 2877255, 2612947],
};

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

export const capA2 = {
  labels: CAP_Q8,
  hiringPopDelta: [-41, -9, -88, -16, -48, -52, -47, -9],
};

export const capA3 = {
  labels: CAP_Q6,
  planners: [
    { name: 'Geeta Tolani', data: [-449890, -390813, -382664, -436541, -436807, -376059] },
    { name: 'Keser Singh', data: [-507767, -463583, -446079, -422334, -422601, -384782] },
    { name: 'Manish G.', data: [-232366, -208743, -221380, -218435, -224693, -208866] },
    { name: 'Michael Y.', data: [-313003, -293957, -309308, -293053, -300018, -286846] },
  ],
};

export const capA4 = {
  labels: ['ProSup IND OMNI', 'ProSup IND', 'Core Email CNX', 'Core CNX', 'SMB CGS', 'Core Chat CNX', 'LE-PUB', 'Comm OOP', 'Cons Retail', 'DSP CGS'],
  gaps: [-93333, -73344, -47140, -43720, -32502, -28358, -26593, -20633, -18908, -13912],
};

export const capA5 = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4', 'FY28 Q1', 'FY28 Q2', 'FY28 Q3', 'FY28 Q4'],
  pro: [-41, -9, -61, -16, -36, -41, -3, -8],
  premium: [0, 0, -17, 0, 0, 0, 0, 0],
  oop: [0, 0, -10, 0, -10, -10, -1, 0],
  basic: [0, 0, 0, 0, -2, -1, -1, -1],
};

export const capA6 = {
  labels: ['ProSup IND', 'India Premium', 'Pro/Core VN', 'ANZ/SA OMNI', 'ID AOH', 'ProSup TH', 'NA PON', 'ANZ Email', 'EMEA ProSupp', 'EMEA LCAT', 'UKI ProSupp'],
  fy27Total: [-7, -3, 0, 0, -5, -5, -10, -1, -10, 0, -3],
  fy28Q1: [0, 0, -1, -3, 0, -1, -10, 0, -7, -2, 0],
  fy28Q2: [0, 0, -1, -4, 0, -2, -10, 0, -5, -6, 0],
};

export const capA7 = {
  labels: CAP_WK6,
  totalGap: [-146042, -144068, -145781, -145859, -150564, -150486],
  commClientOop: [-787, -805, -804, -810, -803, -808],
  coreEmail: [-717, -663, -651, -660, -653, -697],
  techConsCnx: [-339, -336, -334, -339, -333, -328],
  techConsEmail: [-253, -274, -258, -270, -268, -283],
  commercial: [-266, -267, -261, -261, -263, -262],
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
