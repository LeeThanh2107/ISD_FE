import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./public/login";
import AdminHome from "./public/Admin/Homepage";
import NewUser from "./public/Admin/NewUser";
import Navbar from "./components/NavBar";
import { useAuth } from "./AuthContext";
import NewArticle from "./public/Writer/NewArticle";
import WriterHome from "./public/Writer/Homepage";
import EditorHome from "./public/Editor/Homepage";
import ResetPassword from "./public/resetPassword";
const App = () => {
  const auth = useAuth();
  const [userRole, setUserRole] = useState('guest');
  const location = useLocation(); // Hook to get the current route

  // Determine if the current route is the login screen
  const isLoginScreen = location.pathname === "/login";

  useEffect(() => {
    setUserRole(auth.userRole);
  }, [auth.userRole]);

  return (
    <div>
      <Navbar userRole={userRole} isLoginScreen={isLoginScreen} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/create-user" element={<NewUser />} />
        <Route path="/writer/create-article" element={<NewArticle />} />
        <Route path="/writer/home" element={<WriterHome />} />
        <Route path="/editor/home" element={<EditorHome />} />
        
      </Routes>
    </div>
  );
};

// Wrap App with Router since useLocation needs Router context
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;