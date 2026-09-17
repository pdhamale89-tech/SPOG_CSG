import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

export default function Sidebar() {
  const { currentTab, goSub, navTo, sidebarCollapsed, toggleSidebarCollapsed } = useApp();

  const subItemClass = (pid) => 'sb-i' + (currentTab === pid ? ' active' : '');
  const topItemClass = (pid) => 'sb-i' + (currentTab === pid ? ' active' : '');

  return (
    <div className={'sidebar' + (sidebarCollapsed ? ' collapsed' : '')}>
      <div className="sidebar-logo-area">
        <div className="sidebar-logo">
          <Icon name="check" size={16} strokeWidth={2.5} className="sidebar-logo-ic" />
        </div>
        <div className="sidebar-brand">SPOG<small>Single Pane of Glass</small></div>
      </div>
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <div className={topItemClass('home')} onClick={() => navTo('home')} title="Home"><span className="ic"><Icon name="home" /></span><span className="sb-lbl">Home</span></div>

        <div className="sidebar-section-label">Forecast &amp; Capacity Overview</div>
        <div className="sb-i active" onClick={() => goSub('forecast-overview')} title="Forecast"><span className="ic"><Icon name="dashboard" /></span><span className="sb-lbl">Forecast</span></div>
        <div className="sb-sub open">
          <div className={subItemClass('forecast-overview')} onClick={() => goSub('forecast-overview')}>Forecast Overview</div>
          <div className={subItemClass('shipment-overview')} onClick={() => goSub('shipment-overview')}>Shipment Overview</div>
          <div className={subItemClass('asu-overview')} onClick={() => goSub('asu-overview')}>ASU Overview</div>
        </div>
        <div className={topItemClass('capacity-overview')} onClick={() => goSub('capacity-overview')} title="Capacity Overview"><span className="ic"><Icon name="settings" /></span><span className="sb-lbl">Capacity Overview</span></div>

        <div className="sidebar-section-label">Tools</div>
        <div className={topItemClass('reports')} onClick={() => navTo('reports')} title="Reports"><span className="ic"><Icon name="reports" /></span><span className="sb-lbl">Reports</span></div>
        <div className="sb-i" onClick={() => goSub('calendar-forecast')} title="Calendar"><span className="ic"><Icon name="calendar" /></span><span className="sb-lbl">Calendar</span></div>
        <div className="sb-sub open">
          <div className={subItemClass('calendar-forecast')} onClick={() => goSub('calendar-forecast')}>Planning Calendar</div>
          <div className={subItemClass('calendar-fiscal')} onClick={() => goSub('calendar-fiscal')}>Fiscal Calendar</div>
        </div>
        <div className={topItemClass('glossary')} onClick={() => navTo('glossary')} title="Glossary"><span className="ic"><Icon name="glossary" /></span><span className="sb-lbl">Glossary</span></div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-section-label">System</div>
        <div className={topItemClass('notifications')} onClick={() => navTo('notifications')} title="Notifications"><span className="ic"><Icon name="bell" /></span><span className="sb-lbl">Notifications</span></div>
        <div className={topItemClass('settings')} onClick={() => navTo('settings')} title="Settings"><span className="ic"><Icon name="settings" /></span><span className="sb-lbl">Settings</span></div>
        <button type="button" className="sb-i sb-collapse-btn" onClick={toggleSidebarCollapsed} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
          <span className="ic"><Icon name="collapse" className={sidebarCollapsed ? 'ic-flip' : undefined} /></span>
          <span className="sb-lbl">Collapse</span>
        </button>
      </div>
    </div>
  );
}
