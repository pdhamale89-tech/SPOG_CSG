export default function CareOverview() {
  return (
    <div className="tab-panel active">
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>💙</div>
        <div className="card-title" style={{ fontSize: '16px', justifyContent: 'center', marginBottom: '8px' }}>Care Overview</div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 14px', lineHeight: 1.6 }}>
          Forecast, capacity and reporting views for Care are on the way. Reports and the shared Calendar tools are already available from the sidebar.
        </p>
        <span className="coming-soon-badge">🚧 Coming Soon</span>
      </div>
    </div>
  );
}
