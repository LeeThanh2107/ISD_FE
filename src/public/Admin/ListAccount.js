import React, { useState, useEffect } from 'react';
import styles from '../../css/AccountList.module.css';
import api from '../../api/api';
import EditAccountModal from '../../components/EditAccountModal';
import ConfirmDeleteModal from '../../components/DeleteAccountModal'; // Import the new modal

function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // For fetch/general errors
  const [deleteError, setDeleteError] = useState(null); // Specific error for delete operation

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  // --- End Edit Modal State ---

  // --- Delete Confirmation Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState(null);
  const [deletingAccountUsername, setDeletingAccountUsername] = useState('');
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete button
  // --- End Delete Confirmation Modal State ---

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null); // Clear general error on load
    setDeleteError(null); // Clear delete error on load
    try {
      const response = await api.get('/admin/user/list');
      if (response?.data && Array.isArray(response.data)) {
         setAccounts(response.data);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
         setAccounts(response.data.data);
      } else {
        console.error("API response data is not an array:", response?.data);
        setAccounts([]);
        throw new Error("Invalid data format received from API.");
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message || "Could not load account data.");
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit Modal Actions ---
  const handleEdit = (accountData) => {
    if (accountData) {
      setEditingAccount(accountData);
      setIsEditModalOpen(true);
    } else {
      console.error("Attempted to edit null account data");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAccount(null);
  };

  const handleSaveChanges = async (accountId, updatedData) => {
    try {
      const response = await api.put(`/admin/user/edit-account`, updatedData); // Ensure endpoint and payload are correct
      const savedAccount = response.data; // Adjust if nested

      setAccounts(currentAccounts =>
        currentAccounts.map(acc =>
          (acc.id === accountId || acc.userId === accountId) ? { ...acc, ...savedAccount } : acc
        )
      );
      closeEditModal();
      return Promise.resolve();
    } catch (err) {
      console.error("Failed to save account update:", err);
      const errorMessage = err.response?.data?.message || err.message || "Could not save changes.";
      throw new Error(errorMessage);
    }
  };
  // --- End Edit Modal Actions ---

  // --- Delete Actions ---
  const handleDeleteClick = (account) => { // Receive the whole account object
    if (account && (account.userId || account.id)) {
        setDeletingAccountId(account.userId || account.id);
        setDeletingAccountUsername(account.username || ''); // Store username for the message
        setIsDeleteModalOpen(true); // Open the confirmation modal
        setDeleteError(null); // Clear previous delete errors
    } else {
        console.error("Invalid account data for deletion:", account);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAccountId(null);
    setDeletingAccountUsername('');
    setIsDeleting(false); // Reset deletion loading state
    setDeleteError(null); // Clear delete error on close
  };

  const confirmDelete = async () => {
    if (!deletingAccountId) return;

    setIsDeleting(true); // Set loading state for delete button
    setDeleteError(null); // Clear previous errors

    try {
      // ** Replace with your actual API endpoint for deleting **
      await api.delete(`/admin/user/delete/${deletingAccountId}`);

      // Update state locally by filtering out the deleted account
      setAccounts(currentAccounts =>
        currentAccounts.filter(acc => (acc.id !== deletingAccountId && acc.userId !== deletingAccountId))
      );
      console.log("Account deleted successfully");
      closeDeleteModal(); // Close modal after successful deletion
      // Optionally: Show success message/toast

    } catch (err) {
      console.error("Failed to delete account:", err);
      const errorMessage = err.response?.data?.message || err.message || "Could not delete account.";
      setDeleteError(errorMessage); // Set specific delete error to potentially show
      // Keep the modal open on error? Or close? User choice. Here we keep it open.
      // setError(errorMessage); // Set general error as well if desired
    } finally {
        setIsDeleting(false); // Reset loading state regardless of outcome
    }
  };
  // --- End Delete Actions ---

  // --- Render Logic ---

  if (isLoading) { /* ... loading ... */
      return <div className={styles['account-list-container']}><p className={styles['loading-message']}>Đang tải danh sách tài khoản...</p></div>;
  }
  if (error && accounts.length === 0) { /* ... fetch error ... */
      return <div className={styles['account-list-container']}><p className={styles['error-message']}>Lỗi: {error}</p></div>;
  }

  return (
    <div className={styles['account-list-container']}>
      <h2>Danh Sách Tài Khoản</h2>
      {/* Display general fetch error or specific delete error */}
      {(error && !isLoading) && <p className={styles['error-message']}>Lỗi: {error}</p>}
      {/* Display specific delete error if it occurred */}
      {deleteError && <p className={styles['error-message']}>Lỗi xóa: {deleteError}</p>}


      {accounts.length === 0 && !isLoading ? ( /* ... no accounts ... */
        <p>Không tìm thấy tài khoản nào.</p>
      ) : (
        <div className={styles['table-wrapper']}>
          <table className={styles['account-table']}>
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.userId || account.id}>
                  <td>{account.username}</td>
                  <td>{account.name || account.fullName || 'N/A'}</td>
                  <td>{account.email}</td>
                  <td>{account.role}</td>
                  <td>{account.dateCreated ? new Date(account.dateCreated).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td className={styles['actions-cell']}>
                    <button
                      className={`${styles['action-button']} ${styles['edit-button']}`}
                      onClick={() => handleEdit(account)} // Pass full account
                      title="Chỉnh sửa"
                    >
                      Sửa
                    </button>
                    <button
                      className={`${styles['action-button']} ${styles['delete-button']}`}
                      // Call handleDeleteClick to open confirmation modal
                      onClick={() => handleDeleteClick(account)} // Pass full account
                      title="Xóa"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Render Edit Modal --- */}
      {isEditModalOpen && (
        <EditAccountModal
          account={editingAccount}
          onClose={closeEditModal}
          onSave={handleSaveChanges}
        />
      )}

      {/* --- Render Delete Confirmation Modal --- */}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete} // Call the function that performs the delete
          accountUsername={deletingAccountUsername} // Pass username for the message
          isDeleting={isDeleting} // Pass loading state
        />
      )}

    </div>
  );
}

export default AccountList;