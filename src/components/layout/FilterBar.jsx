import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const DEFAULTS = { segment: 'All Segments', product: 'All Products', channel: 'All Channels', dbosp: 'DB/OSP', fy: 'FY25' };

export default function FilterBar() {
  const { showFilters, curRegion, applyFilters, curPeriod, setCurPeriod, clearFilters } = useApp();
  const [decor, setDecor] = useState(DEFAULTS);

  function handleClear() {
    setDecor(DEFAULTS);
    clearFilters();
  }

  return (
    <div className={'filter-bar' + (showFilters ? '' : ' hidden')}>
      <label>Filters:</label>
      <select className="f-sel" value={curRegion} onChange={(e) => applyFilters(e.target.value)}>
        <option value="Global">Global</option>
        <option value="AMER">AMER</option>
        <option value="EMEA">EMEA</option>
        <option value="APJ">APJ</option>
      </select>
      <select className="f-sel" value={decor.segment} onChange={(e) => setDecor((d) => ({ ...d, segment: e.target.value }))}>
        <option>All Segments</option><option>Consumer</option><option>Commercial</option><option>Enterprise</option>
      </select>
      <select className="f-sel" value={decor.product} onChange={(e) => setDecor((d) => ({ ...d, product: e.target.value }))}>
        <option>All Products</option><option>Latitude</option><option>Precision</option><option>OptiPlex</option>
      </select>
      <select className="f-sel" value={decor.channel} onChange={(e) => setDecor((d) => ({ ...d, channel: e.target.value }))}>
        <option>All Channels</option><option>Voice</option><option>Chat</option><option>Email</option>
      </select>
      <select className="f-sel" value={decor.dbosp} onChange={(e) => setDecor((d) => ({ ...d, dbosp: e.target.value }))}>
        <option>DB/OSP</option><option>DB</option><option>OSP</option>
      </select>
      <select className="f-sel" value={decor.fy} onChange={(e) => setDecor((d) => ({ ...d, fy: e.target.value }))}>
        <option>FY25</option><option>FY24</option>
      </select>
      <div className="period-bar">
        <button className={'p-btn' + (curPeriod === 'weekly' ? ' active' : '')} onClick={() => setCurPeriod('weekly')}>Weekly</button>
        <button className={'p-btn' + (curPeriod === 'monthly' ? ' active' : '')} onClick={() => setCurPeriod('monthly')}>Monthly</button>
        <button className={'p-btn' + (curPeriod === 'qtr' ? ' active' : '')} onClick={() => setCurPeriod('qtr')}>QTR</button>
      </div>
      <span className="f-clear" onClick={handleClear}>✕ Clear</span>
    </div>
  );
}
