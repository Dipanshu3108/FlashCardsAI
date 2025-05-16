// src/components/Modal/Modal.js
import React from 'react';
import './Modal.css'; // We'll create this CSS file

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Close on overlay click */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <button className="modal-close-button" onClick={onClose}>
          × {/* A simple 'x' character for close */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;