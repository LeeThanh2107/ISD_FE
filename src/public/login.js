import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/api'
import { jwtDecode } from "jwt-decode";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`login`, { username, password });
      const { role } = jwtDecode(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", role);

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
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
