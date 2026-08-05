// Every chart's period axis labels are derived from this one function so the
// Fiscal Year filter and the Weekly/Monthly/QTR toggle always produce the
// same label format everywhere: FY{yy}W{nn}, FY{yy}M{nn}, FY{yy}Q{n}. The
// underlying data points are untouched — only how each period is named.

function fyNum(fiscalYear) {
  const m = String(fiscalYear ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 26;
}

export function buildPeriodLabels(fiscalYear, curPeriod, n) {
  const startFy = fyNum(fiscalYear);
  const pad = (v) => String(v).padStart(2, '0');

  if (curPeriod === 'weekly') {
    return Array.from({ length: n }, (_, i) => {
      const fy = startFy + Math.floor(i / 52);
      const w = (i % 52) + 1;
      return `FY${fy}W${pad(w)}`;
    });
  }
  if (curPeriod === 'qtr') {
    return Array.from({ length: n }, (_, i) => {
      const fy = startFy + Math.floor(i / 4);
      const q = (i % 4) + 1;
      return `FY${fy}Q${q}`;
    });
  }
  if (curPeriod === 'yearly') {
    return Array.from({ length: n }, (_, i) => `FY${startFy + i}`);
  }
  return Array.from({ length: n }, (_, i) => {
    const fy = startFy + Math.floor(i / 12);
    const m = (i % 12) + 1;
    return `FY${fy}M${pad(m)}`;
  });
}
