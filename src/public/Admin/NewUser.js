import React, { useState } from "react"; // Removed unused useEffect
import api from "../../api/api"; // Your API client
import UserCreateModal from "../../components/UserCreationModal"; // Your Modal component
// 1. Import CSS Module
import styles from '../../css/NewUser.module.css'; // Adjust path as needed

function NewUser() {
  // --- State ---
  const [role, setRole] = useState(''); // Default to empty string for placeholder
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  // --- Handlers ---
  const handleDropdownChange = function(event) {
    setRole(event.target.value);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    // Optionally clear form fields after successful creation shown in modal
    if (message && !error) {
        setEmail('');
        setFullname('');
        setUsername('');
        setRole('');
    }
    // Clear modal specific state
    setMessage('');
    setTempPassword('');
    setError('');
  };

  const createNewUser = async function() {
    // Basic validation
    if (!email || !fullname || !username || !role) {
        setError('Please fill in all required fields.');
        setModalIsOpen(true); // Show error in modal
        return;
    }

    setIsSubmitting(true); // Indicate loading
    setError(''); // Clear previous errors
    setMessage('');
    setTempPassword('');

    try {
      const response = await api.post('/admin/user/store', {
        username: username,
        name: fullname, // Ensure backend expects 'name'
        role: role,    // Ensure backend expects the numeric value
        email: email,
      });

      // Check response structure carefully
      const responseData = response.data.data; // Or response.data.data if nested

      // Use status code primarily, but check data structure too
      if (response.status >= 200 && response.status < 300 && responseData) {
        setMessage(responseData.message || "User created successfully!"); // Use backend message or default
        setTempPassword(responseData.generatedPassword || ''); // Get password if provided
        setError('');
      } else {
         // Handle non-2xx success responses or responses without expected data
         throw new Error(responseData?.message || `Request failed with status ${response.status}`);
      }
      setModalIsOpen(true); // Show success/info modal

    } catch (err) {
      console.error("Error creating user:", err); // Log the full error
      setMessage('');
      setTempPassword('');
      // Try to get specific error from backend response, fallback to generic
      setError(err.response?.data?.message || err.message || 'Check the information and try again or contact administrator!');
      setModalIsOpen(true); // Show error modal
    } finally {
        setIsSubmitting(false); // Stop loading indicator
    }
  };

  // --- Render ---
  return (
    // 2. Apply CSS Module class names
    <div className={styles.newUserContainer}>
      <h2>Create New User</h2>

      {/* Email Input */}
      <div className={styles.newUserFormGroup}>
        <label htmlFor="email">Email:</label> {/* Added htmlFor */}
        <input
          id="email" // Match label htmlFor
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Enter email here"
          required
          disabled={isSubmitting} // Disable during submission
        />
      </div>

      {/* Full Name Input */}
      <div className={styles.newUserFormGroup}>
        <label htmlFor="fullname">Full name:</label> {/* Added htmlFor */}
        <input
          id="fullname" // Match label htmlFor
          type="text"
          onChange={(e) => setFullname(e.target.value)}
          value={fullname}
          placeholder="Enter user's full name"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Username Input */}
      <div className={styles.newUserFormGroup}>
        <label htmlFor="username">Username:</label> {/* Added htmlFor */}
        <input
          id="username" // Match label htmlFor
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder="Enter username"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Role Select */}
      <div className={styles.newUserFormGroup}>
        <label htmlFor="role">Role:</label> {/* Added htmlFor */}
        <select
          id="role" // Match label htmlFor
          value={role}
          onChange={handleDropdownChange}
          required
          disabled={isSubmitting}
        >
          <option value="" disabled>Select a role</option>
          {/* Ensure values match what backend expects (e.g., 0, 1, 2) */}
          <option value="2">Admin</option>
          <option value="0">Writer</option>
          <option value="1">Editor</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className={styles.newUserFormGroup}>
        <button
          className={styles.newUserSubmitButton}
          onClick={createNewUser}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? 'Creating...' : 'Create'} {/* Show loading text */}
        </button>
      </div>

      {/* Modal Component */}
      <UserCreateModal
        isOpen={modalIsOpen}
        onClose={closeModal}
        message={message}
        tempPassword={tempPassword}
        error={error}
      />
    </div>
  );
}

export default NewUser;