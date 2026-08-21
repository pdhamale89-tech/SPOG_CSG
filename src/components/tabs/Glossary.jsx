import { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_PAGES } from '../../data/glossaryData';

export default function Glossary() {
  const [page, setPage] = useState('All');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GLOSSARY.filter((g) => {
      if (page !== 'All' && g.page !== page) return false;
      if (!needle) return true;
      return `${g.metric} ${g.description} ${g.usedIn}`.toLowerCase().includes(needle);
    });
  }, [page, q]);

  return (
    <div className="tab-panel active">
      <div className="home-hero-header" style={{ maxWidth: '760px', padding: '8px 4px 16px' }}>
        <div className="home-hero-eyebrow">Reference</div>
        <h1 className="home-hero-h1">Metric Glossary</h1>
        <p className="home-hero-sub">Every KPI, chart series and card value across the dashboard — what it means, how it&apos;s calculated, and where it&apos;s used.</p>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div className="glossary-filters">
          <div className="drilldown-toggle">
            {['All', ...GLOSSARY_PAGES].map((p) => (
              <button key={p} className={'drilldown-toggle-btn' + (page === p ? ' active' : '')} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
          <input
            className="glossary-search"
            type="text"
            placeholder="Search metric, description or chart..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Metrics{page !== 'All' ? ` — ${page}` : ''}</div>
          <span className="glossary-count">{rows.length} metric{rows.length === 1 ? '' : 's'}</span>
        </div>
        <div className="tw">
          <table className="glossary-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Metric</th>
                <th>Description</th>
                <th>Logic</th>
                <th>Used In</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => (
                <tr key={i}>
                  <td><span className="glossary-page-badge">{g.page}</span></td>
                  <td><strong>{g.metric}</strong></td>
                  <td>{g.description}</td>
                  <td className="glossary-logic">{g.logic}</td>
                  <td className="glossary-used-in">{g.usedIn}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '18px' }}>No metrics match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
