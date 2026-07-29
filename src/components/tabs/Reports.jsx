import { useApp } from '../../context/AppContext';

const REPORTS = [
  {
    name: 'Agent Performance',
    icon: '🧑‍💻',
    category: 'Performance',
    description: 'Agent-level productivity, quality and adherence metrics.',
    url: 'https://app.powerbi.com/groups/me/reports/63f7a1c3-d015-4a19-9b75-d28db8f4fa44/ReportSection8454c812b60b8bb83b99?experience=power-bi',
  },
  { name: 'Forecast Accuracy', icon: '📈', category: 'Forecast', description: 'Plan vs actual accuracy trends across regions.', url: null },
  { name: 'Capacity Planning', icon: '📊', category: 'Capacity', description: 'Headcount, hiring and gap analysis by planner.', url: null },
  { name: 'Shipment Analytics', icon: '📦', category: 'Shipment', description: 'Shipment volume, growth and queue-level detail.', url: null },
  { name: 'ASU Health', icon: '🏷️', category: 'ASU', description: 'ASU trend, tag routing and exit forecasts.', url: null },
  { name: 'Queue Performance', icon: '🎯', category: 'Operations', description: 'Queue-level forecast vs actual and RCA status.', url: null },
];

export default function Reports() {
  const { showToast } = useApp();

  function handleOpen(report) {
    if (report.url) {
      window.open(report.url, '_blank', 'noopener,noreferrer');
    } else {
      showToast(`${report.name} link not configured yet`, 'toast-info');
    }
  }

  function handleKeyDown(e, report) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen(report);
    }
  }

  return (
    <div className="tab-panel active">
      <div className="ai-story">
        <div className="ai-icon-box">📋</div>
        <div><div className="ai-story-title">Reports</div><div className="ai-story-text">Scheduled and on-demand reports. Click a card to open it.</div></div>
      </div>

      <div className="report-grid">
        {REPORTS.map((r) => (
          <div
            className={'report-card' + (r.url ? '' : ' disabled')}
            key={r.name}
            role="button"
            tabIndex={0}
            onClick={() => handleOpen(r)}
            onKeyDown={(e) => handleKeyDown(e, r)}
          >
            <div className="report-card-icon">{r.icon}</div>
            <div className="report-card-name">{r.name}</div>
            <div className="report-card-category">{r.category}</div>
            <div className="report-card-desc">{r.description}</div>
            <div className="report-card-cta">{r.url ? 'Open Report ↗' : 'Coming soon'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
