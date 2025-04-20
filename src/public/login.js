import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api from '../api/api';
import { jwtDecode } from "jwt-decode";
import '../css/Login.css'; // Import file CSS

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`login`, { username, password });
      const { role } = jwtDecode(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem('fullname',response.data.name);
      auth.setUserRole(role);
      // Điều hướng theo role
      if (role === "ADMIN") {
        navigate(process.env.REACT_APP_HOME_ADMIN);
      } else if (role === "EDITOR") {
        navigate(process.env.REACT_APP_HOME_EDITOR);
      } else if (role === "WRITER") {
        navigate(process.env.REACT_APP_HOME_WRITER);
      } else {
        setError("Role không hợp lệ!");
      }
    } catch (error) {
      console.log(error);
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="buttons">
          <button type="submit" className="login-button">ĐĂNG NHẬP</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;