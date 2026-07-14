import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import FilterBar from './components/layout/FilterBar';
import RCAPanel from './components/layout/RCAPanel';
import InfoTip from './components/common/InfoTip';
import Toast from './components/common/Toast';
import DetailModal from './components/modals/DetailModal';
import ApprovalModal from './components/modals/ApprovalModal';
import ForwardModal from './components/modals/ForwardModal';
import PartnerRcaModal from './components/modals/PartnerRcaModal';

import Home from './components/tabs/Home';
import ForecastOverview from './components/tabs/ForecastOverview';
import ShipmentAsu from './components/tabs/ShipmentAsu';
import ForecastHealth from './components/tabs/ForecastHealth';
import CapacityOverview from './components/tabs/CapacityOverview';
import CalendarForecast from './components/tabs/CalendarForecast';
import CalendarFiscal from './components/tabs/CalendarFiscal';
import Reports from './components/tabs/Reports';
import Notifications from './components/tabs/Notifications';
import Settings from './components/tabs/Settings';

const TABS = {
  'home': Home,
  'forecast-overview': ForecastOverview,
  'shipment-asu': ShipmentAsu,
  'forecast-health': ForecastHealth,
  'capacity-overview': CapacityOverview,
  'calendar-forecast': CalendarForecast,
  'calendar-fiscal': CalendarFiscal,
  'reports': Reports,
  'notifications': Notifications,
  'settings': Settings,
};

function TabRouter() {
  const { currentTab } = useApp();
  const TabComponent = TABS[currentTab] || Home;
  return (
    <div className="main-scroll">
      <TabComponent />
    </div>
  );
}

function DashboardShell() {
  return (
    <div className="app">
      <InfoTip />
      <Sidebar />
      <div className="content">
        <Topbar />
        <FilterBar />
        <div className="main-wrap">
          <TabRouter />
          <RCAPanel />
        </div>
      </div>
      <DetailModal />
      <ApprovalModal />
      <ForwardModal />
      <PartnerRcaModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  );
}
