import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

// Flat label -> tab id index for the masthead search field's "jump to a
// page" behavior (CSG Productivity Console artifact: masthead global
// search "Search agents, queues, reports…"). Mirrors Sidebar.jsx's nav tree.
const NAV_INDEX = [
  { label: 'Home', id: 'home' },
  { label: 'Forecast Overview', id: 'forecast-overview' },
  { label: 'Shipment Overview', id: 'shipment-overview' },
  { label: 'ASU Overview', id: 'asu-overview' },
  { label: 'Capacity Overview', id: 'capacity-overview' },
  { label: 'Reports', id: 'reports' },
  { label: 'Planning Calendar', id: 'calendar-forecast' },
  { label: 'Fiscal Calendar', id: 'calendar-fiscal' },
  { label: 'Glossary', id: 'glossary' },
  { label: 'Notifications', id: 'notifications' },
  { label: 'Settings', id: 'settings' },
];

export default function Topbar() {
  const { breadcrumb, theme, toggleTheme, lastUpdated, navTo } = useApp();
  const [query, setQuery] = useState('');

  function onSearchKeyDown(e) {
    if (e.key !== 'Enter') return;
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = NAV_INDEX.find((n) => n.label.toLowerCase().includes(q));
    if (match) { navTo(match.id); setQuery(''); }
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1>SPOG</h1>
        <span className="bc">{breadcrumb}</span>
      </div>
      <label className="m-search" htmlFor="globalSearch">
        <Icon name="search" size={15} />
        <input
          id="globalSearch"
          type="search"
          placeholder="Search pages, reports…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
      </label>
      <div className="topbar-r">
        <button type="button" className="icon-btn" title="Notifications" onClick={() => navTo('notifications')}>
          <Icon name="bell" size={17} />
        </button>
        <span className="tog-lbl"><Icon name="sun" size={13} /></span>
        <label className="theme-tog">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <div className="tog-track"><div className="tog-thumb"></div></div>
        </label>
        <span className="tog-lbl"><Icon name="moon" size={13} /></span>
        <span className="last-updated">Last Updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
