import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { M8 } from '../../data/forecastData';

const DEFAULTS = {
  fiscalYear: 'FY26',
  fiscalQuarter: 'All Quarters',
  fiscalWeek: 'All Weeks',
  fiscalMonth: 'All Months',
  subRegion: 'All Sub-Regions',
  country: 'All Countries',
  businessOrg: 'All Business Orgs',
  businessLead: 'All Business Leads',
  subServiceOffering: 'All Offerings',
  channel: 'All Channels',
  forecastName: 'All Forecasts',
  reportingClassification: 'All Classifications',
  mlOverrideReason: 'All Reasons',
  forecaster: 'All Forecasters',
  planDataSource: 'All Sources',
};

const FILTER_FIELDS = [
  { key: 'fiscalYear', label: 'Fiscal Year', options: ['FY24', 'FY25', 'FY26', 'FY27'] },
  { key: 'fiscalQuarter', label: 'Fiscal Quarter', options: ['All Quarters', 'Q1', 'Q2', 'Q3', 'Q4'] },
  { key: 'fiscalMonth', label: 'Fiscal Month', options: ['All Months', ...M8] },
  { key: 'fiscalWeek', label: 'Fiscal Week', options: ['All Weeks', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
  { key: 'subRegion', label: 'Sub Region', options: ['All Sub-Regions', 'North', 'South', 'East', 'West', 'Central'] },
  { key: 'country', label: 'Country', options: ['All Countries', 'US', 'UK', 'India', 'Canada', 'Germany', 'Australia'] },
  { key: 'businessOrg', label: 'Business Org', options: ['All Business Orgs', 'Consumer', 'Commercial', 'Enterprise', 'Public Sector'] },
  { key: 'businessLead', label: 'Business Lead', options: ['All Business Leads', 'J. Smith', 'A. Patel', 'M. Chen', 'R. Garcia'] },
  { key: 'subServiceOffering', label: 'Sub-Service Offering', options: ['All Offerings', 'Pro', 'Premium', 'Basic', 'OOP'] },
  { key: 'channel', label: 'Channel', options: ['All Channels', 'Voice', 'Chat', 'Email', 'Social'] },
  { key: 'forecastName', label: 'Forecast Name', options: ['All Forecasts', 'Jul Pro', 'Jun Pro', 'Aug Pro'] },
  { key: 'reportingClassification', label: 'Reporting Classification', options: ['All Classifications', 'Actual', 'Forecast', 'Plan', 'ML Forecast'] },
  { key: 'mlOverrideReason', label: 'ML Override Reason', options: ['All Reasons', 'Demand Surge', 'Seasonality Adjustment', 'Data Anomaly', 'Manual Correction'] },
  { key: 'forecaster', label: 'Forecaster', options: ['All Forecasters', 'S. Johnson', 'K. Lee', 'D. Brown', 'N. Singh'] },
  { key: 'planDataSource', label: 'Plan Data Source', options: ['All Sources', 'ML Model', 'Manual Plan', 'Statistical Model', 'Hybrid'] },
];

export default function FilterBar() {
  const { showFilters, curRegion, applyFilters, curPeriod, setCurPeriod, clearFilters } = useApp();
  const [decor, setDecor] = useState(DEFAULTS);
  const [expanded, setExpanded] = useState(true);

  function handleClear() {
    setDecor(DEFAULTS);
    clearFilters();
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
          <div className="filter-group">
            <label>Region</label>
            <select value={curRegion} onChange={(e) => applyFilters(e.target.value)}>
              <option value="Global">Global</option>
              <option value="AMER">AMER</option>
              <option value="EMEA">EMEA</option>
              <option value="APJ">APJ</option>
            </select>
          </div>
          {FILTER_FIELDS.map(({ key, label, options }) => (
            <div className="filter-group" key={key}>
              <label>{label}</label>
              <select value={decor[key]} onChange={(e) => setDecor((d) => ({ ...d, [key]: e.target.value }))}>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
