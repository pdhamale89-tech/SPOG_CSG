import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ForwardModal() {
  const { forwardModal, closeForward, submitForward } = useApp();
  const [email, setEmail] = useState('');

  function handleClose() {
    closeForward();
    setEmail('');
  }

  return (
    <div className={'forward-overlay' + (forwardModal.open ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="forward-modal" onClick={(e) => e.stopPropagation()}>
        {forwardModal.step === 1 ? (
          <div>
            <div className="fwd-header">
              <h3>Enter email</h3>
              <button className="fwd-close" onClick={handleClose}>×</button>
            </div>
            <input type="email" placeholder="approver@dell.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-ok" onClick={() => submitForward(email)}>Ok</button>
          </div>
        ) : (
          <div className="fwd-success">
            <h3>Sent</h3>
            <button className="btn-ok-sm" onClick={handleClose}>Ok</button>
          </div>
        )}
      </div>
    </div>
  );
}
