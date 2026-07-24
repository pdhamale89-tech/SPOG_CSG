import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { M8 } from '../../data/forecastData';

const DEFAULTS = {
  fiscalYear: 'FY26',
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
  reportingClassification: 'All Classifications',
  subServiceOffering: 'All Offerings',
};

// Rendered in two groups so Region (the one real, wired filter) can sit
// between Fiscal Week and Sub Region, matching the requested sequence.
const FIELDS_BEFORE_REGION = [
  { key: 'fiscalYear', label: 'Fiscal Year', options: ['FY24', 'FY25', 'FY26', 'FY27'] },
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
  const { showFilters, curRegion, applyFilters, curPeriod, setCurPeriod, clearFilters } = useApp();
  const [decor, setDecor] = useState(DEFAULTS);
  const [expanded, setExpanded] = useState(true);

  function handleClear() {
    setDecor(DEFAULTS);
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
        </div>
        <span className="f-clear" onClick={handleClear}>✕ Clear All</span>
      </div>
      {expanded && (
        <div className="filter-grid">
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
          {FIELDS_AFTER_REGION.map(renderField)}
        </div>
      )}
    </div>
  );
}
