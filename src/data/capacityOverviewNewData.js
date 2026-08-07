// Ported from the standalone Workforce Planning Dashboard HTML this page
// recreates. BASE_VOL/BASE_HC are the two "seed" months (Jan/Feb) with real
// authored numbers per fiscal year; every other month is derived from one of
// those two seeds via sv()/svH(), exactly as the original page did, so all
// 12 months + 4 fiscal years have data without hand-authoring 48 datasets.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_LABELS = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
  Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};
export const YRS = ['FY25', 'FY26', 'FY27', 'FY28'];
export const QL = ['Q1', 'Q2', 'Q3', 'Q4'];

const BASE_VOL = {
  Jan: {
    FY25: { DB: [1250000, 1230000, 1200000, 1180000], OSP: [2400000, 2380000, 2350000, 2310000], Total: [3650000, 3610000, 3550000, 3490000] },
    FY26: { DB: [1180634, 1160000, 1140000, 1120000], OSP: [2252763, 2280000, 2270000, 2250000], Total: [3433397, 3440000, 3410000, 3370000] },
    FY27: { DB: [1130889, 1116844, 1024642, 1010000], OSP: [2303275, 2304829, 2101257, 2080000], Total: [3434164, 3421672, 3125899, 3090000] },
    FY28: { DB: [1079734, 1070000, 1050000, 1030000], OSP: [2115618, 2100000, 2080000, 2060000], Total: [3195353, 3170000, 3130000, 3090000] },
  },
  Feb: {
    FY25: { DB: [1245000, 1225000, 1195000, 1175000], OSP: [2395000, 2375000, 2345000, 2305000], Total: [3640000, 3600000, 3540000, 3480000] },
    FY26: { DB: [1180634, 1155000, 1135000, 1115000], OSP: [2252763, 2275000, 2265000, 2245000], Total: [3433397, 3430000, 3400000, 3360000] },
    FY27: { DB: [1135011, 1078354, 1065204, 969148], OSP: [2281402, 2305525, 2278607, 2051396], Total: [3416413, 3383879, 3343811, 3020544] },
    FY28: { DB: [1033537, 1026270, 1015000, 995000], OSP: [2117913, 2152917, 2130000, 2110000], Total: [3151450, 3179187, 3145000, 3105000] },
  },
};

const BASE_HC = {
  Jan: {
    FY25: { HC_Avg: [2850, 2780, 2700, 2690], HC_Exit: [2800, 2720, 2650, 2640], Excess_Cap: [118, 122, 125, 120], Excess_HC: [380, 460, 450, 390], LOA: [55, 58, 65, 60], Training: [10, 50, 8, 5], Total_HC: [2860, 2790, 2710, 2700], Hiring: [60, 90, 10, 8], UR_Hire: [50, 75, 5, 3], Appr_Hire: [10, 15, 5, 5] },
    FY26: { HC_Avg: [2679, 2579, 2339, 2040], HC_Exit: [2624, 2515, 2166, 1969], Excess_Cap: [115, 120, 123, 122], Excess_HC: [355, 438, 438, 367], LOA: [57, 59, 68, 61], Training: [8, 55, 5, 2], Total_HC: [2689, 2629, 2239, 2032], Hiring: [52, 82, 2, 5], UR_Hire: [43, 70, 1, 2], Appr_Hire: [9, 12, 1, 3] },
    FY27: { HC_Avg: [1908, 1845, 1804, 1745], HC_Exit: [1877, 1819, 1778, 1711], Excess_Cap: [119, 120, 118, 122], Excess_HC: [302, 307, 272, 314], LOA: [62, 60, 60, 51], Training: [13, 24, 14, 0], Total_HC: [1952, 1903, 1852, 1762], Hiring: [82, 48, 48, 27], UR_Hire: [51, 38, 4, 0], Appr_Hire: [3, 0, 0, 0] },
    FY28: { HC_Avg: [1700, 1680, 1660, 1640], HC_Exit: [1670, 1650, 1630, 1610], Excess_Cap: [120, 121, 119, 118], Excess_HC: [290, 285, 275, 270], LOA: [50, 48, 47, 45], Training: [10, 20, 12, 0], Total_HC: [1710, 1690, 1670, 1650], Hiring: [40, 35, 30, 20], UR_Hire: [30, 25, 20, 10], Appr_Hire: [5, 5, 5, 5] },
  },
  Feb: {
    FY25: { HC_Avg: [2845, 2775, 2695, 2685], HC_Exit: [2795, 2715, 2645, 2635], Excess_Cap: [117, 121, 124, 119], Excess_HC: [375, 455, 445, 385], LOA: [56, 57, 64, 59], Training: [9, 48, 7, 4], Total_HC: [2855, 2785, 2705, 2695], Hiring: [58, 88, 8, 6], UR_Hire: [48, 73, 4, 2], Appr_Hire: [10, 15, 4, 4] },
    FY26: { HC_Avg: [2679, 2579, 2339, 2041], HC_Exit: [2624, 2515, 2166, 1921], Excess_Cap: [115, 120, 123, 122], Excess_HC: [355, 438, 438, 374], LOA: [57, 59, 68, 63], Training: [8, 55, 5, 2], Total_HC: [2689, 2629, 2239, 1986], Hiring: [52, 82, 2, 5], UR_Hire: [43, 70, 1, 2], Appr_Hire: [9, 12, 1, 3] },
    FY27: { HC_Avg: [1809, 1748, 1709, 1641], HC_Exit: [1771, 1728, 1677, 1604], Excess_Cap: [116, 119, 117, 121], Excess_HC: [246, 279, 244, 280], LOA: [65, 61, 61, 52], Training: [12, 24, 10, 0], Total_HC: [1813, 1748, 1656, 1656], Hiring: [72, 47, 27, 21], UR_Hire: [50, 38, 4, 0], Appr_Hire: [3, 0, 0, 0] },
    FY28: { HC_Avg: [1690, 1670, 1650, 1630], HC_Exit: [1660, 1640, 1620, 1600], Excess_Cap: [119, 120, 118, 117], Excess_HC: [285, 280, 270, 265], LOA: [49, 47, 46, 44], Training: [9, 19, 11, 0], Total_HC: [1700, 1680, 1660, 1640], Hiring: [38, 33, 28, 18], UR_Hire: [28, 23, 18, 8], Appr_Hire: [5, 5, 5, 5] },
  },
};

function sv(base, mi) {
  const f = 0.01 + (mi % 5) * 0.005;
  const sgn = mi % 3 === 0 ? -1 : 1;
  const r = {};
  for (const y in base) {
    r[y] = {};
    for (const p in base[y]) {
      r[y][p] = base[y][p].map((v) => (v ? Math.round(v * (1 + sgn * f * (1 + Math.sin(mi + YRS.indexOf(y)) * 0.5))) : v));
    }
  }
  return r;
}

function svH(base, mi) {
  const f = 0.008 + (mi % 4) * 0.004;
  const sgn = mi % 3 === 1 ? -1 : 1;
  const r = {};
  for (const y in base) {
    r[y] = {};
    for (const m in base[y]) {
      r[y][m] = m.includes('Cap')
        ? base[y][m].map((v) => Math.round(v + sgn * (mi % 5) * 0.5))
        : base[y][m].map((v) => (v ? Math.round(v * (1 + sgn * f)) : v));
    }
  }
  return r;
}

export const VOL = {};
export const HC = {};
MONTHS.forEach((m, i) => {
  if (BASE_VOL[m]) {
    VOL[m] = BASE_VOL[m];
    HC[m] = BASE_HC[m];
  } else {
    VOL[m] = sv(i < 6 ? BASE_VOL.Jan : BASE_VOL.Feb, i);
    HC[m] = svH(i < 6 ? BASE_HC.Jan : BASE_HC.Feb, i);
  }
});
