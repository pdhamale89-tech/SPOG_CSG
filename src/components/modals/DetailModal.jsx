import { useApp } from '../../context/AppContext';

export default function DetailModal() {
  const { detailModal, closeDetail } = useApp();
  return (
    <div className={'modal-overlay' + (detailModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{detailModal.title || 'Detail'}</h2>
          <button className="modal-close" onClick={closeDetail}>&times;</button>
        </div>
        <div className="modal-body">{detailModal.body}</div>
      </div>
    </div>
  );
}
