import { useApp } from '../../context/AppContext';

const ISG_URL = `${import.meta.env.BASE_URL}isg/`;

export default function Home() {
  const { goSub } = useApp();

  return (
    <div className="tab-panel active">
      <div className="ai-story">
        <div className="ai-icon-box">🏠</div>
        <div>
          <div className="ai-story-title">Welcome</div>
          <div className="ai-story-text"><strong>SPOG</strong> consolidates Forecast, Shipment, ASU, and Capacity dashboards.</div>
        </div>
      </div>

      <div className="home-hero-grid">
        <button type="button" className="home-hero-card csg" onClick={() => goSub('forecast-overview')}>
          <span className="home-hero-ic">🏢</span>
          <span className="home-hero-title">CSG</span>
          <span className="home-hero-tag">Customer Support Group — open this dashboard</span>
          <span className="home-hero-cta">Open dashboard →</span>
        </button>
        <button type="button" className="home-hero-card isg" onClick={() => { window.location.href = ISG_URL; }}>
          <span className="home-hero-ic">🏭</span>
          <span className="home-hero-title">ISG</span>
          <span className="home-hero-tag">Infrastructure Solutions Group dashboard</span>
          <span className="home-hero-cta">Open dashboard →</span>
        </button>
      </div>
    </div>
  );
}
