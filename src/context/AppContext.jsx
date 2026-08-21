import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatIST } from '../utils/dateUtils';

const AppContext = createContext(null);

export const NO_FILTER_TABS = ['calendar-forecast', 'calendar-fiscal', 'home', 'reports', 'notifications', 'settings', 'glossary'];

const BREADCRUMBS = {
  'forecast-overview': 'Forecast › Overview',
  'shipment-overview': 'Forecast › Shipment Overview',
  'asu-overview': 'Forecast › ASU Overview',
  'capacity-overview': 'Capacity › Overview',
  'calendar-forecast': 'Calendar › Planning',
  'calendar-fiscal': 'Calendar › Fiscal',
  'glossary': 'Tools › Glossary',
};

function defaultBreadcrumb(pid) {
  return BREADCRUMBS[pid] || pid.charAt(0).toUpperCase() + pid.slice(1);
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [currentTab, setCurrentTabState] = useState('forecast-overview');
  const [breadcrumb, setBreadcrumb] = useState('Forecast › Overview');

  // Snapshot of when this dashboard session loaded, shown in the topbar and info popups.
  // No backend exists yet, so "last refreshed" is the page load time rather than a real data-pull time.
  const [lastUpdated] = useState(() => formatIST(new Date()));

  const [curRegion, setCurRegion] = useState('Global');
  const [curPeriod, setCurPeriod] = useState('monthly');
  const [fiscalYear, setFiscalYear] = useState('FY26');
  // Capacity Overview's Plan A/Plan B comparison picker -- lives here (not
  // local to that page) because it now renders inside the shared FilterBar,
  // alongside the rest of the Filters panel, instead of its own box on the page.
  const [compPlanA, setCompPlanA] = useState('Jan');
  const [compPlanB, setCompPlanB] = useState('Feb');
  const [chartRegions, setChartRegions] = useState({});
  const [chartSubRegions, setChartSubRegions] = useState({});
  const [chartCountries, setChartCountries] = useState({});
  const [curHistPlan, setCurHistPlan] = useState('plan1');
  const [rcaCollapsed, setRcaCollapsed] = useState(false);

  const [toast, setToast] = useState({ show: false, msg: '', cls: '' });
  const [detailModal, setDetailModal] = useState({ open: false, title: '', body: '' });
  const [approvalModal, setApprovalModal] = useState({ open: false, id: '', area: '', priority: 'Low', prefillRootCause: '' });
  const [forwardModal, setForwardModal] = useState({ open: false, step: 1, forRca: false });
  const [drillDownModal, setDrillDownModal] = useState({ open: false, title: '', subtitle: '', panels: [], tableRows: [] });
  const [adherenceModal, setAdherenceModal] = useState({ open: false });
  const [segmentGrowthModal, setSegmentGrowthModal] = useState({ open: false });
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
    setCurrentTabState(pid);
    setBreadcrumb(defaultBreadcrumb(pid));
  }, []);

  const goSub = useCallback((pid) => {
    setCurrentTabState(pid);
    setBreadcrumb(defaultBreadcrumb(pid));
  }, []);

  const showFilters = !NO_FILTER_TABS.includes(currentTab);
  const showRCA = !NO_FILTER_TABS.includes(currentTab);
  const toggleRcaCollapsed = useCallback(() => setRcaCollapsed((c) => !c), []);

  const setChartRegion = useCallback((id, region) => {
    setChartRegions((prev) => ({ ...prev, [id]: region }));
  }, []);

  const chartRegionFor = useCallback((id) => chartRegions[id] || curRegion, [chartRegions, curRegion]);

  const setChartSubRegion = useCallback((id, subRegion) => {
    setChartSubRegions((prev) => ({ ...prev, [id]: subRegion }));
  }, []);

  const chartSubRegionFor = useCallback((id) => chartSubRegions[id] || 'All', [chartSubRegions]);

  const setChartCountry = useCallback((id, country) => {
    setChartCountries((prev) => ({ ...prev, [id]: country }));
  }, []);

  const chartCountryFor = useCallback((id) => chartCountries[id] || 'All', [chartCountries]);

  const applyFilters = useCallback((region) => {
    setCurRegion(region);
  }, []);

  const clearFilters = useCallback(() => {
    setCurRegion('Global');
    setChartRegions({});
    setChartSubRegions({});
    setChartCountries({});
    setCompPlanA('Jan');
    setCompPlanB('Feb');
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

  const openDrillDown = useCallback((title, subtitle, panels, tableRows) => setDrillDownModal({ open: true, title, subtitle, panels, tableRows }), []);
  const closeDrillDown = useCallback(() => setDrillDownModal((m) => ({ ...m, open: false })), []);

  const openDetail = useCallback((title, body) => setDetailModal({ open: true, title, body }), []);
  const closeDetail = useCallback(() => setDetailModal((m) => ({ ...m, open: false })), []);

  const openAdherence = useCallback(() => setAdherenceModal({ open: true }), []);
  const closeAdherence = useCallback(() => setAdherenceModal((m) => ({ ...m, open: false })), []);

  const openSegmentGrowth = useCallback(() => setSegmentGrowthModal({ open: true }), []);
  const closeSegmentGrowth = useCallback(() => setSegmentGrowthModal((m) => ({ ...m, open: false })), []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setApprovalModal((m) => ({ ...m, open: false }));
        setForwardModal((m) => ({ ...m, open: false }));
        setDetailModal((m) => ({ ...m, open: false }));
        setAdherenceModal((m) => ({ ...m, open: false }));
        setSegmentGrowthModal((m) => ({ ...m, open: false }));
        setDrillDownModal((m) => ({ ...m, open: false }));
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({
    theme, toggleTheme, lastUpdated,
    currentTab, navTo, goSub, breadcrumb,
    curRegion, setCurRegion, curPeriod, setCurPeriod, fiscalYear, setFiscalYear,
    compPlanA, setCompPlanA, compPlanB, setCompPlanB,
    chartRegions, setChartRegion, chartRegionFor,
    chartSubRegions, setChartSubRegion, chartSubRegionFor,
    chartCountries, setChartCountry, chartCountryFor,
    curHistPlan, setCurHistPlan,
    showFilters, showRCA, rcaCollapsed, toggleRcaCollapsed,
    applyFilters, clearFilters,
    toast, showToast,
    detailModal, openDetail, closeDetail,
    adherenceModal, openAdherence, closeAdherence,
    segmentGrowthModal, openSegmentGrowth, closeSegmentGrowth,
    approvalModal, openApproval, closeApproval, handleApproval,
    handleRCAApproval,
    forwardModal, openForward, closeForward, submitForward,
    drillDownModal, openDrillDown, closeDrillDown,
    actionLog, logAction,
  }), [theme, toggleTheme, lastUpdated, currentTab, navTo, goSub, breadcrumb,
    curRegion, curPeriod, fiscalYear, compPlanA, compPlanB, chartRegions, setChartRegion, chartRegionFor,
    chartSubRegions, setChartSubRegion, chartSubRegionFor,
    chartCountries, setChartCountry, chartCountryFor, curHistPlan,
    showFilters, showRCA, rcaCollapsed, toggleRcaCollapsed, applyFilters, clearFilters, toast, showToast,
    detailModal, openDetail, closeDetail, adherenceModal, openAdherence, closeAdherence,
    segmentGrowthModal, openSegmentGrowth, closeSegmentGrowth,
    approvalModal, openApproval, closeApproval, handleApproval,
    handleRCAApproval, forwardModal, openForward, closeForward, submitForward,
    drillDownModal, openDrillDown, closeDrillDown, actionLog, logAction]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
