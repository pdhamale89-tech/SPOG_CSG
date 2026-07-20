import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatIST } from '../utils/dateUtils';

const AppContext = createContext(null);

export const NO_FILTER_TABS = ['calendar-forecast', 'calendar-fiscal', 'home', 'reports', 'notifications', 'settings'];

const BREADCRUMBS = {
  'forecast-overview': 'Forecast › Overview',
  'shipment-asu': 'Forecast › Shipment & ASU',
  'forecast-health': 'Forecast › Health Monitor',
  'capacity-overview': 'Capacity › Overview',
  'calendar-forecast': 'Calendar › Forecast',
  'calendar-fiscal': 'Calendar › Fiscal',
};

function defaultBreadcrumb(pid) {
  return BREADCRUMBS[pid] || pid.charAt(0).toUpperCase() + pid.slice(1);
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [currentTab, setCurrentTabState] = useState('forecast-overview');
  const [openSubMenu, setOpenSubMenu] = useState('f-sub');
  const [breadcrumb, setBreadcrumb] = useState('Forecast › Overview');

  // Snapshot of when this dashboard session loaded, shown in the topbar and info popups.
  // No backend exists yet, so "last refreshed" is the page load time rather than a real data-pull time.
  const [lastUpdated] = useState(() => formatIST(new Date()));

  const [curRegion, setCurRegion] = useState('Global');
  const [curPeriod, setCurPeriod] = useState('monthly');
  const [chartRegions, setChartRegions] = useState({});
  const [curHistPlan, setCurHistPlan] = useState('plan1');
  const [drill, setDrill] = useState({ level: 'overall', offering: '', segment: '' });

  const [toast, setToast] = useState({ show: false, msg: '', cls: '' });
  const [detailModal, setDetailModal] = useState({ open: false, title: '', body: '' });
  const [approvalModal, setApprovalModal] = useState({ open: false, id: '', area: '', priority: 'Low', prefillRootCause: '' });
  const [forwardModal, setForwardModal] = useState({ open: false, step: 1, forRca: false });
  const [partnerRcaModal, setPartnerRcaModal] = useState({ open: false, idx: 0 });
  // Session-only record of submitted RCA/CLCA actions, keyed by whatever id triggered them
  // (queue id like 'Q-001', or a derived key for a Partner Minimum bar). No backend exists yet,
  // so this is what lets the UI show "Actioned" after a submit instead of the toast being the
  // only trace it happened.
  const [actionLog, setActionLog] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const navTo = useCallback((pid) => {
    setOpenSubMenu(null);
    setCurrentTabState(pid);
    setBreadcrumb(defaultBreadcrumb(pid));
  }, []);

  const goSub = useCallback((pid) => {
    setCurrentTabState(pid);
    setBreadcrumb(defaultBreadcrumb(pid));
  }, []);

  const toggleSub = useCallback((id, firstChild) => {
    setOpenSubMenu((prev) => {
      const willOpen = prev !== id;
      if (willOpen && firstChild) {
        setCurrentTabState(firstChild);
        setBreadcrumb(defaultBreadcrumb(firstChild));
      }
      return willOpen ? id : null;
    });
  }, []);

  const showFilters = !NO_FILTER_TABS.includes(currentTab);
  const showRCA = !NO_FILTER_TABS.includes(currentTab);

  const setChartRegion = useCallback((id, region) => {
    setChartRegions((prev) => ({ ...prev, [id]: region }));
  }, []);

  const chartRegionFor = useCallback((id) => chartRegions[id] || curRegion, [chartRegions, curRegion]);

  const applyFilters = useCallback((region) => {
    setCurRegion(region);
  }, []);

  const clearFilters = useCallback(() => {
    setCurRegion('Global');
    setChartRegions({});
  }, []);

  const showToast = useCallback((msg, cls) => {
    setToast({ show: true, msg, cls });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  }, []);

  const openApproval = useCallback(({ id, area, priority = 'Medium', prefillRootCause = '' }) => {
    setApprovalModal({ open: true, id, area, priority, prefillRootCause });
  }, []);
  const closeApproval = useCallback(() => setApprovalModal((m) => ({ ...m, open: false })), []);
  const logAction = useCallback((id, record) => {
    setActionLog((prev) => ({ ...prev, [id]: record }));
  }, []);
  // Returns false (and keeps the modal open) when an approval is missing required fields,
  // so the caller knows not to close the modal.
  const handleApproval = useCallback((decision, fields = {}) => {
    if (decision === 'approved' && (!fields.rootCause || !fields.correctiveAction?.trim())) {
      showToast('Root cause & corrective action are required to approve', 'toast-error');
      return false;
    }
    logAction(approvalModal.id, {
      type: 'clca', decision, area: approvalModal.area, priority: approvalModal.priority,
      ...fields, timestamp: new Date().toLocaleString(),
    });
    setApprovalModal((m) => ({ ...m, open: false }));
    showToast(decision === 'approved' ? '✓ CLCA Approved & Logged' : '✕ Rejected', decision === 'approved' ? 'toast-success' : 'toast-error');
    return true;
  }, [showToast, logAction, approvalModal.id, approvalModal.area, approvalModal.priority]);

  const handleRCAApproval = useCallback((decision) => {
    showToast(decision === 'approved' ? '✓ Approved' : '✕ Rejected', decision === 'approved' ? 'toast-success' : 'toast-error');
  }, [showToast]);

  const openForward = useCallback(() => setForwardModal({ open: true, step: 1 }), []);
  const closeForward = useCallback(() => setForwardModal((m) => ({ ...m, open: false })), []);
  const submitForward = useCallback((email) => {
    if (!email) { showToast('Enter email', 'toast-error'); return false; }
    setForwardModal((m) => ({ ...m, step: 2 }));
    return true;
  }, [showToast]);

  const openPartnerRca = useCallback((idx) => setPartnerRcaModal({ open: true, idx }), []);
  const closePartnerRca = useCallback(() => setPartnerRcaModal((m) => ({ ...m, open: false })), []);

  const openDetail = useCallback((title, body) => setDetailModal({ open: true, title, body }), []);
  const closeDetail = useCallback(() => setDetailModal((m) => ({ ...m, open: false })), []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setApprovalModal((m) => ({ ...m, open: false }));
        setForwardModal((m) => ({ ...m, open: false }));
        setDetailModal((m) => ({ ...m, open: false }));
        setPartnerRcaModal((m) => ({ ...m, open: false }));
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({
    theme, toggleTheme, lastUpdated,
    currentTab, navTo, goSub, openSubMenu, toggleSub, breadcrumb,
    curRegion, setCurRegion, curPeriod, setCurPeriod,
    chartRegions, setChartRegion, chartRegionFor,
    curHistPlan, setCurHistPlan,
    drill, setDrill,
    showFilters, showRCA,
    applyFilters, clearFilters,
    toast, showToast,
    detailModal, openDetail, closeDetail,
    approvalModal, openApproval, closeApproval, handleApproval,
    handleRCAApproval,
    forwardModal, openForward, closeForward, submitForward,
    partnerRcaModal, openPartnerRca, closePartnerRca,
    actionLog, logAction,
  }), [theme, toggleTheme, lastUpdated, currentTab, navTo, goSub, openSubMenu, toggleSub, breadcrumb,
    curRegion, curPeriod, chartRegions, setChartRegion, chartRegionFor, curHistPlan, drill,
    showFilters, showRCA, applyFilters, clearFilters, toast, showToast,
    detailModal, openDetail, closeDetail, approvalModal, openApproval, closeApproval, handleApproval,
    handleRCAApproval, forwardModal, openForward, closeForward, submitForward,
    partnerRcaModal, openPartnerRca, closePartnerRca, actionLog, logAction]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
