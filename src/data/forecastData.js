export const M8 = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
export const FM = ['2025M01','2025M03','2025M05','2025M07','2025M09','2025M11','2026M01','2026M03','2026M05','2026M07','2026M09','2026M11','2027M01','2027M03','2027M05','2027M07','2027M09','2027M11'];

export const uppData = {
  Global: { shipAct: [65,95,100,70,95,98,80,90,85,100,110,120,80,75,70,65,60,55], projection: [80,100,105,85,100,140,90,95,90,105,115,125,85,90,100,95,90,85], upp1: [null,null,null,null,null,null,null,null,null,null,null,null,75,72,70,68,65,62], upp2: [null,null,null,null,null,null,null,null,null,null,null,null,80,85,95,90,88,82] },
  AMER: { shipAct: [30,42,45,32,42,44,36,40,38,45,50,54,36,34,32,30,27,25], projection: [36,45,47,38,45,63,40,42,40,47,52,56,38,40,45,42,40,38], upp1: [null,null,null,null,null,null,null,null,null,null,null,null,34,33,32,31,30,28], upp2: [null,null,null,null,null,null,null,null,null,null,null,null,36,38,43,40,39,37] },
  EMEA: { shipAct: [20,30,32,22,30,31,26,29,27,32,35,38,26,24,22,20,19,18], projection: [25,32,33,27,32,45,29,31,29,33,37,40,27,29,32,30,29,27], upp1: [null,null,null,null,null,null,null,null,null,null,null,null,24,23,22,21,20,19], upp2: [null,null,null,null,null,null,null,null,null,null,null,null,26,28,31,29,28,26] },
  APJ: { shipAct: [15,23,23,16,23,23,18,21,20,23,25,28,18,17,16,15,14,12], projection: [19,23,25,20,23,32,21,22,21,25,26,29,20,21,23,23,21,20], upp1: [null,null,null,null,null,null,null,null,null,null,null,null,17,16,16,16,15,15], upp2: [null,null,null,null,null,null,null,null,null,null,null,null,18,19,21,21,21,19] },
};

// DMS Scorecard drill-down: disposition mix (Unassisted/Augmented/Assisted, must sum to 100
// each month) broken out by country and by offering, drilled into from the region-level view.
export const dmsDrillData = {
  country: {
    US: { dmsUn: [46,47,48,49,50,51,51,52], dmsAu: [25,25,24,24,23,23,23,22], dmsAs: [29,28,28,27,27,26,26,26] },
    UK: { dmsUn: [40,41,42,43,44,45,45,46], dmsAu: [27,27,26,26,25,25,25,24], dmsAs: [33,32,32,31,31,30,30,30] },
    India: { dmsUn: [36,37,38,39,40,41,41,42], dmsAu: [29,29,28,28,27,27,27,26], dmsAs: [35,34,34,33,33,32,32,32] },
  },
  offering: {
    pro: { dmsUn: [48,49,50,51,52,53,53,54], dmsAu: [24,24,23,23,22,22,22,21], dmsAs: [28,27,27,26,26,25,25,25] },
    premium: { dmsUn: [42,43,44,45,46,47,47,48], dmsAu: [26,26,25,25,24,24,24,24], dmsAs: [32,31,31,30,30,29,29,28] },
    basic: { dmsUn: [34,35,36,37,38,39,39,40], dmsAu: [29,29,28,28,27,27,27,26], dmsAs: [37,36,36,35,35,34,34,34] },
    oop: { dmsUn: [30,31,32,33,34,35,35,36], dmsAu: [31,31,30,30,29,29,29,28], dmsAs: [39,38,38,37,37,36,36,36] },
  },
};

const globalMonthly = {
  labels: M8,
  offered: [112000,118000,108000,125000,120000,132000,128000,138000],
  handled: [94000,98000,92000,102000,99000,108000,105000,114000],
  forecast: [120000,126000,118000,132000,128000,140000,135000,145000],
  actual: [94000,98000,92000,102000,99000,108000,105000,114000],
  abandon: [7,9,8,11,10,13,12,14],
  voice: [58,56,53,50,48,46,44,43],
  chat: [22,24,27,30,32,34,35,36],
  email: [15,15,14,14,14,14,15,15],
  social: [5,5,6,6,6,6,6,6],
  cases: [820,835,845,860,875,865,880,895],
  dmsUn: [42,43,44,45,46,47,47,48],
  dmsAu: [26,26,25,25,24,24,24,24],
  dmsAs: [32,31,31,30,30,29,29,28],
  partActual: [94000,98000,92000,102000,99000,108000,105000,114000],
  partForecast: [120000,126000,118000,132000,128000,140000,135000,145000],
  capAv: [19200,19400,19600,19400,19600,19800,20000,20200],
  capAl: [16800,17200,17600,17400,18000,18400,18200,18800],
  capDm: [18000,18400,18800,19200,19000,19600,19400,20400],
  bias: [-4,-6,-9,-13,-15,-17,-18,-16],
  dbVol: [76000,80000,74000,82000,80000,87000,85000,92000],
  ospVol: [36000,38000,34000,40000,39000,45000,43000,46000],
  tagWeb: [32000,34000,35000,36000,37000,39000,40000,41000],
  tagPhone: [40000,39000,38000,37000,36000,35000,34000,33000],
  tagChat: [16000,18000,20000,23000,25000,27000,29000,31000],
  tagEmail: [16000,15500,15000,14500,14000,14000,13500,13000],
  tagSocial: [8000,9000,10000,11000,12000,13000,14000,15000],
  expAssets: [48000,52000,58000,60000,65000,74000,68000,62000],
  expShipped: [32000,34000,36000,37000,38000,40000,39000,38000],
  expASU: [180000,184000,188000,192000,196000,200000,204000,208000],
  expFcASU: [184000,190000,196000,202000,208000,212000,216000,220000],
  fy26: [3100,2800,2500,2900,3100,2800,2400,2200],
  fy27act: [1300,1400,1600,1100,620,0,0,0],
  plan1: [1980,2238,1769,1467,871,1562,968,1297],
  plan2: [1950,2200,1740,1440,850,1530,940,1270],
  plan3: [2010,2270,1800,1500,890,1590,1000,1320],
  mlfc: [1900,2100,1700,1400,850,1500,950,1250],
  linTr: [1850,1800,1750,1700,1650,1600,1550,1500],
  kpi: { acc: '65%', accSub: '▼ 15%', vol: '812K', volSub: '▲ 5%', q: '100', qSub: '38·41·21', var: '±16%', ship: '1.93M', shgr: '+3.5%', shvar: '-3.8%', asu: '1.2M', asuvar: '+3.8%', sl: '72%', hc: '-5.8%', aht: '11.0m', util: '84%' },
};

function cloneRegion(overrides) {
  const clone = JSON.parse(JSON.stringify(globalMonthly));
  Object.assign(clone.kpi, overrides);
  return clone;
}

const monthly = {
  Global: JSON.parse(JSON.stringify(globalMonthly)),
  AMER: cloneRegion({ acc: '80%', accSub: 'At target' }),
  EMEA: cloneRegion({ acc: '65%' }),
  APJ: cloneRegion({ acc: '46%', accSub: '▼ 34%' }),
};

const weekly = JSON.parse(JSON.stringify(monthly));
['Global', 'AMER', 'EMEA', 'APJ'].forEach((r) => { weekly[r].labels = ['W1','W2','W3','W4','W5','W6','W7','W8']; });

const qtr = JSON.parse(JSON.stringify(monthly));
qtr.Global.labels = ['Q1','Q2','Q3','Q4','Q1 FY25','Q2 FY25'];
['AMER', 'EMEA', 'APJ'].forEach((r) => { qtr[r].labels = ['Q1','Q2','Q3','Q4','Q1','Q2']; });

export const D = { monthly, weekly, qtr };

// Each period has one group per DP/OSP channel type, DB and OSP, each with
// its own bold total row plus expandable period-by-period detail rows --
// DB's numbers are a separate, smaller series (not just a copy of OSP's).
export const hvData = {
  monthly: {
    cols: ['DP/OSP','Channel','Month','QTR','FY2024','FY2025','Actual FY2026','Forecast FY2026','Off%','YoY'],
    groups: [
      {
        total: ['OSP','Chat','—','—','29,752','30,901','26,367','29,741','89%','-77%'],
        rows: [
          ['','Chat','Feb','Q1','2,174','2,429','3,114','2,535','123%','-58%'],
          ['','Chat','Mar','Q1','2,431','2,720','2,411','2,634','92%','-40%'],
        ],
      },
      {
        total: ['DB','Chat','—','—','18,430','19,120','21,845','20,560','106%','-33%'],
        rows: [
          ['','Chat','Feb','Q1','1,340','1,410','1,605','1,520','106%','-34%'],
          ['','Chat','Mar','Q1','1,505','1,585','1,720','1,650','104%','-33%'],
        ],
      },
    ],
  },
  weekly: {
    cols: ['DP/OSP','Channel','Week','FY2024','FY2025','Actual FY2026','Forecast FY2026','Off%','YoY'],
    groups: [
      {
        total: ['OSP','Chat','Total','29,752','30,901','26,367','29,741','89%','-42%'],
        rows: [
          ['','Chat','W1','544','607','779','634','123%','-58%'],
          ['','Chat','W2','608','680','603','658','92%','-40%'],
        ],
      },
      {
        total: ['DB','Chat','Total','18,430','19,120','21,845','20,560','106%','-19%'],
        rows: [
          ['','Chat','W1','337','355','404','380','106%','-20%'],
          ['','Chat','W2','378','397','430','410','104%','-18%'],
        ],
      },
    ],
  },
  qtr: {
    cols: ['DP/OSP','Channel','QTR','FY2024','FY2025','Actual FY2026','Forecast FY2026','Off%','YoY'],
    groups: [
      {
        total: ['OSP','Chat','Total','29,752','30,901','26,367','29,741','89%','-77%'],
        rows: [
          ['','Chat','Q1','7,250','8,080','8,317','8,283','100%','-46%'],
        ],
      },
      {
        total: ['DB','Chat','Total','18,430','19,120','21,845','20,560','106%','-19%'],
        rows: [
          ['','Chat','Q1','4,480','4,690','5,320','5,090','105%','-17%'],
        ],
      },
    ],
  },
};

// Flattened [cols, ...every group's total + rows] shape for the download
// button, which just wants one flat list of rows regardless of grouping.
export function hvDownloadRows(pd) {
  return [pd.cols, ...pd.groups.flatMap((g) => [g.total, ...g.rows])];
}
