import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

const ROOT_CAUSES = ['Demand Surge', 'OSP Staffing Gap', 'Seasonality Impact', 'Model Drift', 'Data Quality Issue', 'Other'];
const PRIORITY_CLASSES = ['high', 'medium', 'low'];

export default function ApprovalModal() {
  const { approvalModal, closeApproval, handleApproval, openForward, actionLog } = useApp();
  const existing = actionLog[approvalModal.id];
  const priorityKey = (approvalModal.priority || '').toLowerCase();
  const priorityClass = 'priority-badge priority-' + (PRIORITY_CLASSES.includes(priorityKey) ? priorityKey : 'medium');

  const [rootCause, setRootCause] = useState(ROOT_CAUSES[0]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (approvalModal.open) {
      setRootCause(existing?.rootCause || approvalModal.prefillRootCause || ROOT_CAUSES[0]);
      setCorrectiveAction(existing?.correctiveAction || '');
      setPreventiveAction(existing?.preventiveAction || '');
      setOwner(existing?.owner || '');
      setDueDate(existing?.dueDate || '');
      setComment(existing?.comment || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalModal.open, approvalModal.id]);

  function submit(decision) {
    handleApproval(decision, { rootCause, correctiveAction, preventiveAction, owner, dueDate, comment });
  }

  return (
    <div className={'approval-overlay' + (approvalModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeApproval(); }}>
      <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-header">
          <h2>📋 RCA/CLCA</h2>
          <button className="approval-close" onClick={closeApproval}>&times;</button>
        </div>
        <div className="approval-body">
          {existing?.type === 'clca' && (
            <div className="insight-box" style={{ marginBottom: '10px' }}>
              <span className="ins-ic">✓</span>
              <span>Last actioned {existing.timestamp} — {existing.decision === 'approved' ? 'Approved' : 'Rejected'} ({existing.rootCause || 'no root cause set'}).</span>
            </div>
          )}
          <div className="approval-section">
            <h3>Info</h3>
            <div className="approval-grid">
              <div className="approval-field"><label>ID</label><span>{approvalModal.id}</span></div>
              <div className="approval-field"><label>Queue</label><span>{approvalModal.area}</span></div>
              <div className="approval-field"><label>Priority</label><span className={priorityClass}>{(approvalModal.priority || '').toUpperCase()}</span></div>
            </div>
          </div>
          <div className="approval-section">
            <h3>Root Cause Analysis</h3>
            <select className="approval-select" value={rootCause} onChange={(e) => setRootCause(e.target.value)}>
              {ROOT_CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="approval-section">
            <h3>Corrective / Preventive Action</h3>
            <div className="approval-grid">
              <div>
                <label style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corrective Action</label>
                <textarea className="approval-comment" placeholder="What fixes this now..." value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preventive Action</label>
                <textarea className="approval-comment" placeholder="How to stop recurrence..." value={preventiveAction} onChange={(e) => setPreventiveAction(e.target.value)}></textarea>
              </div>
            </div>
            <div className="approval-grid" style={{ marginTop: '8px' }}>
              <div className="approval-field">
                <label>Owner</label>
                <input className="approval-input" placeholder="Assignee" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div className="approval-field">
                <label>Due Date</label>
                <input className="approval-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="approval-section">
            <h3>Decision</h3>
            <textarea className="approval-comment" placeholder="Comments..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="approval-btn btn-approve" onClick={() => submit('approved')}>✓ Approve</button>
              <button className="approval-btn btn-reject" onClick={() => submit('rejected')}>✕ Reject</button>
              <button className="approval-btn btn-forward" onClick={openForward}>→ Forward</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
