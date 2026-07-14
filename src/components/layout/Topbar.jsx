import { useApp } from '../../context/AppContext';

export default function Topbar() {
  const { breadcrumb, theme, toggleTheme } = useApp();
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1>SPOG</h1>
        <span className="bc">{breadcrumb}</span>
      </div>
      <div className="topbar-r">
        <span className="tog-lbl">☀️</span>
        <label className="theme-tog">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <div className="tog-track"><div className="tog-thumb"></div></div>
        </label>
        <span className="tog-lbl">🌙</span>
      </div>
    </div>
  );
}
