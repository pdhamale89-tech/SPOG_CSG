import { useApp } from '../../context/AppContext';

export default function HeadcountDetailModal() {
  const { headcountDetailModal, closeHeadcountDetail } = useApp();
  const { open, label, avg, exit, excess, total } = headcountDetailModal;

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeHeadcountDetail(); }}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Headcount Detail — {label}</h2>
          <button className="modal-close" onClick={closeHeadcountDetail}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="approval-grid">
            <div className="approval-field"><label>Total HC</label><span><strong>{total?.toLocaleString()}</strong></span></div>
            <div className="approval-field"><label>L1 HC Avg</label><span>{avg?.toLocaleString()}</span></div>
            <div className="approval-field"><label>L1 HC Exit</label><span>{exit?.toLocaleString()}</span></div>
            <div className="approval-field"><label>Excess HC</label><span>{excess?.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
