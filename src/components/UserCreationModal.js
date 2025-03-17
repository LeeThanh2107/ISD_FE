import React from 'react';
import Modal from 'react-modal';

// Đặt root element cho modal (cần thiết cho accessibility)
Modal.setAppElement('#root');

const UserCreateModal = ({ isOpen, onClose, message, tempPassword, error }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          padding: '20px',
          borderRadius: '8px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <h2>Thông Báo</h2>
      {error ? (
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      ) : (
        <div>
          <p>{message}</p>
          {tempPassword && (
            <p>
              <strong>Temporary Password:</strong> {tempPassword}
            </p>
          )}
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </Modal>
  );
};

export default UserCreateModal;