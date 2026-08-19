import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { M8 } from '../../data/forecastData';
import { MONTHS, MONTH_LABELS } from '../../data/capacityOverviewNewData';

const FISCAL_YEARS = ['FY24', 'FY25', 'FY26', 'FY27'];

const DEFAULTS = {
  fiscalQuarter: 'All Quarters',
  fiscalMonth: 'All Months',
  fiscalWeek: 'All Weeks',
  subRegion: 'All Sub-Regions',
  country: 'All Countries',
  offering: 'All Offerings',
  forecastName: 'All Forecasts',
  capacityPlanner: 'All Planners',
  businessOrg: 'All Business Orgs',
  businessLead: 'All Business Leads',
  queueName: 'All Queues',
  forecastQueueName: 'All Queues',
  reportingClassification: 'All Classifications',
  subServiceOffering: 'All Offerings',
  segment: 'All Segments',
};

// Forecast Overview, Shipment Overview, and ASU Overview get their own
// vocabulary: Forecast Queue Name only shows on these tabs, and Capacity
// Planner reads as Forecaster here (it stays Capacity Planner everywhere
// else, e.g. Capacity Overview, where that label was requested).
const FORECAST_TABS = ['forecast-overview', 'shipment-overview', 'asu-overview'];
const YEARLY_TABS = ['capacity-overview'];
const FORECAST_QUEUE_FIELD = { key: 'forecastQueueName', label: 'Forecast Queue Name', options: ['All Queues', 'Enterprise Voice T1', 'Commercial Voice T2'] };
const SEGMENT_FIELD = { key: 'segment', label: 'Segment', options: ['All Segments', 'Consumer', 'Commercial', 'Enterprise'] };

// Rendered in two groups so Region (the one real, wired filter) can sit
// between Fiscal Week and Sub Region, matching the requested sequence.
const FIELDS_BEFORE_REGION = [
  { key: 'fiscalQuarter', label: 'Fiscal Quarter', options: ['All Quarters', 'Q1', 'Q2', 'Q3', 'Q4'] },
  { key: 'fiscalMonth', label: 'Fiscal Month', options: ['All Months', ...M8] },
  { key: 'fiscalWeek', label: 'Fiscal Week', options: ['All Weeks', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
];

const FIELDS_AFTER_REGION = [
  { key: 'subRegion', label: 'Sub Region', options: ['All Sub-Regions', 'North', 'South', 'East', 'West', 'Central'] },
  { key: 'country', label: 'Country', options: ['All Countries', 'US', 'UK', 'India', 'Canada', 'Germany', 'Australia'] },
  { key: 'offering', label: 'Offering', options: ['All Offerings', 'Pro', 'Premium', 'Basic', 'PON'] },
  { key: 'forecastName', label: 'Plan Name', options: ['All Forecasts', 'Jul Pro', 'Jun Pro', 'Aug Pro'] },
  { key: 'capacityPlanner', label: 'Capacity Planner', options: ['All Planners', 'S. Johnson', 'K. Lee', 'D. Brown', 'N. Singh'] },
  { key: 'businessOrg', label: 'Business Org', options: ['All Business Orgs', 'Consumer', 'Commercial', 'Enterprise', 'Public Sector'] },
  { key: 'businessLead', label: 'Business Lead', options: ['All Business Leads', 'J. Smith', 'A. Patel', 'M. Chen', 'R. Garcia'] },
  { key: 'queueName', label: 'Combined Queue Name', options: ['All Queues', 'Enterprise Voice T1', 'Commercial Voice T2'] },
  { key: 'reportingClassification', label: 'Reporting Classification', options: ['All Classifications', 'Actual', 'Forecast', 'Plan', 'ML Forecast'] },
  { key: 'subServiceOffering', label: 'Sub-Service Offering', options: ['All Offerings', 'Pro', 'Premium', 'Basic', 'OOP'] },
];

export default function FilterBar() {
  const {
    showFilters, currentTab, curRegion, applyFilters, curPeriod, setCurPeriod,
    fiscalYear, setFiscalYear, clearFilters,
    compPlanA, setCompPlanA, compPlanB, setCompPlanB,
  } = useApp();
  const isCapacityOverview = currentTab === 'capacity-overview';
  const [decor, setDecor] = useState(DEFAULTS);
  const [expanded, setExpanded] = useState(true);

  // Yearly only has real data on the two Capacity tabs (see capacityData.js)
  // -- every other tab indexes its own period-keyed dataset (forecastData.js's
  // D, etc.) with no 'yearly' entry and would throw. So the button only
  // shows up while one of those is active, and if the user switches away
  // while Yearly is selected, fall back to Monthly rather than carry an
  // unsupported period into a tab that can't render it.
  useEffect(() => {
    if (!YEARLY_TABS.includes(currentTab) && curPeriod === 'yearly') {
      setCurPeriod('monthly');
    }
  }, [currentTab, curPeriod, setCurPeriod]);

  function handleClear() {
    setDecor(DEFAULTS);
    setFiscalYear('FY26');
    setCurPeriod('monthly');
    clearFilters();
  }

  function renderField({ key, label, options }) {
    return (
      <div className="filter-group" key={key}>
        <label>{label}</label>
        <select value={decor[key]} onChange={(e) => setDecor((d) => ({ ...d, [key]: e.target.value }))}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className={'filter-panel' + (showFilters ? '' : ' hidden')}>
      <div className="filter-panel-head">
        <div className="filter-panel-title" onClick={() => setExpanded((e) => !e)}>
          <span className="filter-panel-icon">🔎</span>Filters
          <span className={'filter-panel-caret' + (expanded ? '' : ' collapsed')}>▾</span>
        </div>
        <div className="period-bar">
          <button className={'p-btn' + (curPeriod === 'weekly' ? ' active' : '')} onClick={() => setCurPeriod('weekly')}>Weekly</button>
          <button className={'p-btn' + (curPeriod === 'monthly' ? ' active' : '')} onClick={() => setCurPeriod('monthly')}>Monthly</button>
          <button className={'p-btn' + (curPeriod === 'qtr' ? ' active' : '')} onClick={() => setCurPeriod('qtr')}>QTR</button>
          {YEARLY_TABS.includes(currentTab) && (
            <button className={'p-btn' + (curPeriod === 'yearly' ? ' active' : '')} onClick={() => setCurPeriod('yearly')}>Yearly</button>
          )}
        </div>
      </div>
      {expanded && (
        <>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Fiscal Year</label>
              <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
                {FISCAL_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {FIELDS_BEFORE_REGION.map(renderField)}
            <div className="filter-group">
              <label>Region</label>
              <select value={curRegion} onChange={(e) => applyFilters(e.target.value)}>
                <option value="Global">Global</option>
                <option value="AMER">AMER</option>
                <option value="EMEA">EMEA</option>
                <option value="APJ">APJ</option>
              </select>
            </div>
            {FIELDS_AFTER_REGION.filter((f) => !(f.key === 'offering' && currentTab === 'asu-overview')).map((f) => renderField(
              f.key === 'capacityPlanner' && FORECAST_TABS.includes(currentTab) ? { ...f, label: 'Forecaster' } : f
            ))}
            {FORECAST_TABS.includes(currentTab) && renderField(FORECAST_QUEUE_FIELD)}
            {currentTab === 'asu-overview' && renderField(SEGMENT_FIELD)}
          </div>
          {isCapacityOverview ? (
            <div className="cap-plan-filters">
              <span className="cap-plan-filters-title">⠿ Comparison Filter</span>
              <div className="filter-group">
                <label>Current Plan</label>
                <select value={compPlanA} onChange={(e) => setCompPlanA(e.target.value)}>
                  {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Previous Plan</label>
                <select value={compPlanB} onChange={(e) => setCompPlanB(e.target.value)}>
                  {MONTHS.map((m) => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
                </select>
              </div>
              <button type="button" className="clear-all-btn cap-plan-filters-clear" onClick={handleClear}>✕ Clear All</button>
            </div>
          ) : (
            <div className="filter-clear-row">
              <button type="button" className="clear-all-btn" onClick={handleClear}>✕ Clear All</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
