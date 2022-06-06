import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, ExternalLink } from '../../components';

function ZoomPopupModal({ open, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const modalContent = (
    <div>
      <h2>Zoom Meeting</h2>
      <p className="leading-snug">
        In order to publish this listing, you need to authorize us via zoom so that we can schedule
        a meeting on your behalf.
      </p>

      <ExternalLink
        href={`https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_ZOOM_CLIENT_ID}&redirect_uri=http://localhost:3500/api/auth/callback/zoom?backurl=${currentPath}`}
        target="_self"
      >
        Continue with zoom login
      </ExternalLink>
    </div>
  );
  return (
    <Modal
      id="Zoom-Modal"
      name="Zoom-Modal"
      isOpen={open}
      onClose={onClose}
      onManageDisableScrolling={() => {}}
      usePortal
    >
      {modalContent}
    </Modal>
  );
}

export default ZoomPopupModal;
