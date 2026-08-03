export default function ComingSoonOverlay({ children }) {
  return (
    <div className="coming-soon-wrap">
      <div className="coming-soon-blurred">{children}</div>
      <div className="coming-soon-overlay">
        <span className="coming-soon-badge">🚧 Coming Soon</span>
      </div>
    </div>
  );
}
