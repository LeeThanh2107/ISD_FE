import React, { useState, useEffect } from 'react';
import styles from '../css/EditAccountModal.module.css'; // Create this CSS Module file

// Assuming Role is an enum or similar structure you can iterate over
// Example: Replace with your actual Role definition/import
const ROLES = ['Admin', 'Editor', 'Writer'];

function EditAccountModal({ account, onClose, onSave }) {
  // State to manage form inputs, initialized with the account data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    // Add other editable fields as needed
  });
  const [isSaving, setIsSaving] = useState(false); // To show loading state on save
  const [error, setError] = useState(null); // To show save errors

  // Effect to update form data when the 'account' prop changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        email: account.email || '',
        username: account.username ||'',
        role: account.role || '',
        // Initialize other fields
      });
      setError(null); // Clear previous errors when opening/changing account
    }
  }, [account]); // Re-run effect if the account object changes

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setIsSaving(true);
    setError(null);
    try {
      // Call the onSave prop function passed from AccountList
      // Pass the account ID and the updated formData
      await onSave(account.userId, formData);
      // onClose(); // Optionally close modal on successful save (handled by parent)
    } catch (err) {
        console.error("Error saving account:", err);
        setError(err.message || "Failed to save changes.");
    } finally {
        setIsSaving(false);
    }
  };

  // If no account is provided, don't render the modal
  if (!account) {
    return null;
  }

  return (
    // Modal backdrop (overlay)
    <div className={styles.modalBackdrop} onClick={onClose}>
      {/* Modal content - stop propagation to prevent closing when clicking inside */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa tài khoản: {account.username}</h3>
          <button onClick={onClose} className={styles.closeButton} title="Đóng">&times;</button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
                      {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              disabled
              required
              className={styles.formInput}
            />
          </div>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Họ và Tên:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>

          {/* Role (Dropdown) */}
          <div className={styles.formGroup}>
            <label htmlFor="role">Vai trò:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className={styles.formSelect}
            >
              <option value="" disabled>Chọn vai trò</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>


          {/* Add other form fields here */}

           {/* Error Message */}
           {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Modal Footer - Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.modalButton} ${styles.cancelButton}`}
            disabled={isSaving}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`${styles.modalButton} ${styles.saveButton}`}
            disabled={isSaving} // Disable button while saving
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
       </form>
      </div>
    </div>
  );
}

export default EditAccountModal;