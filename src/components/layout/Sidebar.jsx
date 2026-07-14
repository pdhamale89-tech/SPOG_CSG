import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { currentTab, openSubMenu, toggleSub, goSub, navTo } = useApp();

  const subItemClass = (pid) => 'sb-i' + (currentTab === pid ? ' active' : '');
  const topItemClass = (pid) => 'sb-i' + (currentTab === pid ? ' active' : '');

  return (
    <div className="sidebar">
      <div className="sidebar-logo-area">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12L10 17L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="sidebar-brand">SPOG<small>Single Pane of Glass</small></div>
      </div>
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <div className={topItemClass('home')} onClick={() => navTo('home')}><span className="ic">🏠</span>Home</div>

        <div className="sidebar-section-label">Forecast</div>
        <div className="sb-i active" onClick={() => toggleSub('f-sub', 'forecast-overview')}><span className="ic">📊</span>Forecast<span className="arr">▾</span></div>
        <div className={'sb-sub' + (openSubMenu === 'f-sub' ? ' open' : '')}>
          <div className={subItemClass('forecast-overview')} onClick={() => goSub('forecast-overview')}>Forecast Overview</div>
          <div className={subItemClass('shipment-asu')} onClick={() => goSub('shipment-asu')}>Shipment &amp; ASU Trend</div>
          <div className={subItemClass('forecast-health')} onClick={() => goSub('forecast-health')}>Forecast Health Monitor</div>
        </div>

        <div className="sidebar-section-label">Operations</div>
        <div className="sb-i" onClick={() => toggleSub('c-sub', 'capacity-overview')}><span className="ic">⚙️</span>Capacity<span className="arr">▾</span></div>
        <div className={'sb-sub' + (openSubMenu === 'c-sub' ? ' open' : '')}>
          <div className={subItemClass('capacity-overview')} onClick={() => goSub('capacity-overview')}>Capacity Overview</div>
        </div>

        <div className="sidebar-section-label">Tools</div>
        <div className={topItemClass('reports')} onClick={() => navTo('reports')}><span className="ic">📋</span>Reports</div>
        <div className="sb-i" onClick={() => toggleSub('cal-sub', 'calendar-forecast')}><span className="ic">📅</span>Calendar<span className="arr">▾</span></div>
        <div className={'sb-sub' + (openSubMenu === 'cal-sub' ? ' open' : '')}>
          <div className={subItemClass('calendar-forecast')} onClick={() => goSub('calendar-forecast')}>Forecast Calendar</div>
          <div className={subItemClass('calendar-fiscal')} onClick={() => goSub('calendar-fiscal')}>Fiscal Calendar</div>
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-section-label">System</div>
        <div className={topItemClass('notifications')} onClick={() => navTo('notifications')}><span className="ic">🔔</span>Notifications</div>
        <div className={topItemClass('settings')} onClick={() => navTo('settings')}><span className="ic">⚙️</span>Settings</div>
      </div>
    </div>
  );
}
