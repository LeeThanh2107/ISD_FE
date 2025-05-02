import React from 'react';
import styles from '../css/ConfirmDeleteModal.module.css'; // Create this CSS Module file

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, accountUsername, isDeleting }) {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Xác nhận Xóa Tài Khoản</h3>
          <button onClick={onClose} className={styles.closeButton} title="Đóng">&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p>
            Bạn có chắc chắn muốn xóa tài khoản{' '}
            <strong>{accountUsername || 'này'}</strong>?
          </p>
          {/* Important Warning Message */}
          <p className={styles.warningText}>
            Hành động này không thể hoàn tác!
            <p>
            Nếu bạn xóa tài khoản tác giả, tất cả các bài viết do tác giả này viết đều sẽ bị xóa!
            </p>
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.modalButton} ${styles.cancelButton}`}
            disabled={isDeleting} // Disable if deletion is in progress
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm} // Trigger the actual delete function
            className={`${styles.modalButton} ${styles.confirmDeleteButton}`}
            disabled={isDeleting} // Disable if deletion is in progress
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;