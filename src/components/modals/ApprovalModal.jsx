import { useApp } from '../../context/AppContext';

export default function ApprovalModal() {
  const { approvalModal, closeApproval, handleApproval, openForward } = useApp();
  const priorityClass = 'priority-badge priority-' + ((approvalModal.priority || '').toLowerCase() === 'high' ? 'high' : 'medium');

  return (
    <div className={'approval-overlay' + (approvalModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeApproval(); }}>
      <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-header">
          <h2>📋 CLCA</h2>
          <button className="approval-close" onClick={closeApproval}>&times;</button>
        </div>
        <div className="approval-body">
          <div className="approval-section">
            <h3>Info</h3>
            <div className="approval-grid">
              <div className="approval-field"><label>ID</label><span>{approvalModal.id}</span></div>
              <div className="approval-field"><label>Queue</label><span>{approvalModal.area}</span></div>
              <div className="approval-field"><label>Priority</label><span className={priorityClass}>{(approvalModal.priority || '').toUpperCase()}</span></div>
            </div>
          </div>
          <div className="approval-section">
            <h3>Decision</h3>
            <textarea className="approval-comment" placeholder="Comments..."></textarea>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="approval-btn btn-approve" onClick={() => handleApproval('approved')}>✓ Approve</button>
              <button className="approval-btn btn-reject" onClick={() => handleApproval('rejected')}>✕ Reject</button>
              <button className="approval-btn btn-forward" onClick={openForward}>→ Forward</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
