import { useApp } from '../../context/AppContext';

const ISG_URL = `${import.meta.env.BASE_URL}isg/`;

const BUSINESSES = [
  {
    key: 'csg',
    code: 'CSG',
    name: 'Customer Support Group',
    icon: '🏢',
    desc: 'Forecast, shipment, ASU and capacity planning in one pane.',
    chips: ['Forecast', 'Shipment', 'ASU', 'Capacity', 'Reports'],
  },
  {
    key: 'isg',
    code: 'ISG',
    name: 'Infrastructure Solutions Group',
    icon: '🏭',
    desc: 'ESG and HES forecasting, capacity planning and shared calendar tools.',
    chips: ['ESG', 'HES', 'Calendar'],
  },
  {
    key: 'care',
    code: 'Care',
    name: 'Care',
    icon: '💙',
    desc: 'Care overview, reports and shared calendar tools.',
    chips: ['Overview', 'Reports', 'Calendar'],
  },
];

export default function Home() {
  const { goSub, setWorkspace } = useApp();

  function openBusiness(key) {
    if (key === 'csg') { setWorkspace('csg'); goSub('forecast-overview'); }
    else if (key === 'isg') window.location.href = ISG_URL;
    else { setWorkspace('care'); goSub('care-overview'); }
  }

  return (
    <div className="tab-panel active">
      <div className="home-hero-header">
        <div className="home-hero-eyebrow">SPOG · Single Pane of Glass</div>
        <h1 className="home-hero-h1">Choose a business to open its dashboard</h1>
        <p className="home-hero-sub">One workspace, three businesses — CSG, ISG and Care each have their own forecast, capacity and reporting views.</p>
      </div>

      <div className="home-hero-grid">
        {BUSINESSES.map((b) => (
          <button key={b.key} type="button" className={`home-hero-card ${b.key}`} onClick={() => openBusiness(b.key)}>
            <div className="home-hero-top">
              <span className="home-hero-ic">{b.icon}</span>
              <span className="home-hero-badge">{b.chips.length} modules</span>
            </div>
            <div>
              <span className="home-hero-title">{b.code}</span>
              <span className="home-hero-full">{b.name}</span>
            </div>
            <span className="home-hero-tag">{b.desc}</span>
            <div className="home-hero-chips">
              {b.chips.map((c) => <span key={c} className="home-hero-chip">{c}</span>)}
            </div>
            <span className="home-hero-cta">Open {b.code} dashboard →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
