import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getColors } from '../../theme/colors';
import ChartCanvas from '../charts/ChartCanvas';

function noop() {}

export default function DrillDownModal() {
  const { drillDownModal, closeDrillDown, theme } = useApp();
  const { open, title, subtitle, rows } = drillDownModal;

  const config = useMemo(() => {
    if (!rows || !rows.length) return null;
    const { textPrimary, textSecondary, gridColor, accentGreen, accentRed } = getColors(theme);
    return {
      type: 'bar',
      data: {
        labels: rows.map((r) => r.label),
        datasets: [{
          data: rows.map((r) => r.pct),
          backgroundColor: rows.map((r) => (r.pct >= 0 ? accentGreen : accentRed)),
          borderRadius: 6,
          maxBarThickness: 56,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw >= 0 ? '+' : ''}${ctx.raw.toFixed(1)}%`,
              afterLabel: (ctx) => rows[ctx.dataIndex]?.sub || '',
            },
          },
          datalabels: {
            display: true,
            color: textPrimary,
            font: { size: 10, weight: 'bold' },
            anchor: 'end',
            align: (ctx) => (rows[ctx.dataIndex]?.pct >= 0 ? 'top' : 'bottom'),
            formatter: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
          },
        },
        scales: {
          x: { ticks: { color: textSecondary, font: { size: 9 } }, grid: { display: false } },
          y: { ticks: { color: textSecondary, font: { size: 9 }, callback: (v) => v + '%' }, grid: { color: gridColor } },
        },
      },
    };
  }, [rows, theme]);

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeDrillDown(); }}>
      <div className="modal drilldown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Drill-Down'}</h2>
          <button className="modal-close" onClick={closeDrillDown}>&times;</button>
        </div>
        <div className="modal-body">
          {subtitle && <div className="drilldown-subtitle">{subtitle}</div>}
          {config && <ChartCanvas config={config} height="240px" onClick={noop} />}
        </div>
      </div>
    </div>
  );
}
