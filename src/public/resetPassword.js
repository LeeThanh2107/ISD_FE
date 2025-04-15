import React, { useState } from "react";
import api from '../api/api';
import '../css/Login.css'; // Import file CSS
import ChangePasswordModal from "../components/ChangePasswordModal";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        if(password !== confirmPassword){
            setError("Mật khẩu không trùng khớp!");
            return;
        }else{
            const response = await api.post(`reset-password`, { password });
            if(response.status === 200){
                setModalIsOpen(true);
                setMessage(response.message);
                setError('');
            }
        }
    } catch (error) {
        setMessage('');
        setError('Check the information and try again or contact administrator!');
        setModalIsOpen(true);
    }
  };
  const closeModal = () => {
    setModalIsOpen(false);
    setMessage('');
    setError('');
  };
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đổi mật khẩu</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <div className="input-wrapper">
              <i className="fas fa-lock icon"></i>
              <input
                type="password"
                id="password"
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="password">Nhập lại mật khẩu mới</label>
            <div className="input-wrapper">
              <i className="fas fa-lock icon"></i>
              <input
                type="password"
                id="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="login-button">Đổi mật khẩu</button>
        </form>
      </div>
      <ChangePasswordModal
            isOpen={modalIsOpen}
            onClose={closeModal}
            message={message}
            error={error}
            />
    </div>
  );
};

export default ResetPassword;