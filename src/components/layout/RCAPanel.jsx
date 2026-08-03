import { useApp } from '../../context/AppContext';
import ComingSoonOverlay from '../common/ComingSoonOverlay';

export default function RCAPanel() {
  const { showRCA, rcaCollapsed, toggleRcaCollapsed, handleRCAApproval, openForward } = useApp();
  return (
    <div className={'rca-panel' + (showRCA ? ' visible' : '') + (rcaCollapsed ? ' collapsed' : '')}>
      <button className="rca-collapse-btn" onClick={toggleRcaCollapsed} title={rcaCollapsed ? 'Expand panel' : 'Collapse panel'}>
        {rcaCollapsed ? '◂' : '▸'}
      </button>
      {!rcaCollapsed && (
        <ComingSoonOverlay>
          <div className="rca-panel-title">✦ RCA &amp; CLCA</div>
          <div>
            <div className="rca-section">
              <div className="rca-section-title">Root Cause</div>
              <div className="rca-panel-content">
                <strong>APAC Surge:</strong> 32% spike.<br />
                <strong>Channel Shift:</strong> Chat grew 22%.
              </div>
            </div>
          </div>
          <div className="rca-approve-section">
            <div className="rca-approve-title">Quick Approval</div>
            <textarea className="rca-comment" placeholder="Comments..."></textarea>
            <div className="rca-approve-btns" style={{ marginTop: '6px' }}>
              <button className="rca-btn rca-btn-approve" onClick={() => handleRCAApproval('approved')}>✓ Approve</button>
              <button className="rca-btn rca-btn-reject" onClick={() => handleRCAApproval('rejected')}>✕ Reject</button>
              <button className="rca-btn rca-btn-forward" onClick={openForward}>→ Forward</button>
            </div>
          </div>
        </ComingSoonOverlay>
      )}
    </div>
  );
}
