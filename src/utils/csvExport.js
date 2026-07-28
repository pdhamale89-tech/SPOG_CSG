function csvCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Turns a Chart.js config (whatever ChartCanvas is currently rendering) into
// CSV rows: one column per dataset/legend entry, one row per axis label.
export function chartToCsvRows(config) {
  const labels = config?.data?.labels || [];
  const datasets = config?.data?.datasets || [];
  const header = ['Period', ...datasets.map((d) => d.label || 'Series')];
  const rows = labels.map((label, i) => [label, ...datasets.map((d) => (d.data ? d.data[i] : ''))]);
  return [header, ...rows];
}
