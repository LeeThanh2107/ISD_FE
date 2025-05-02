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
import EditorResetPassword from "./public/resetPassword";
import AdminResetPassword from "./public/resetPassword";
import WriterResetPassword from "./public/resetPassword";
import EditorArticleList from "./public/Editor/ArticleList";
import Review from "./public/Editor/Review";
import WriterArticleList from './public/Writer/ArticleList';
import EditArticle from './public/Writer/EditArticle';
import WriterAnalytic from'./public/Admin/WriterAnalytic';
import ListAccount from './public/Admin/ListAccount';
const App = () => {
  const auth = useAuth();
  const [userRole, setUserRole] = useState('guest');
  const [homeRoute, setHomeRoute] = useState('/login');
  const location = useLocation(); // Hook to get the current route

  // Determine if the current route is the login screen
  const isLoginScreen = location.pathname === "/login";

  useEffect(() => {
    setUserRole(auth.userRole);
    if(auth.userRole === 'ADMIN'){
       setHomeRoute(process.env.REACT_APP_HOME_ADMIN)
    }else if(auth.userRole === 'WRITER'){
      setHomeRoute(process.env.REACT_APP_HOME_WRITER)
    }else if(auth.userRole === 'EDITOR'){
      setHomeRoute(process.env.REACT_APP_HOME_EDITOR)
    }
  }, [auth.userRole]);

  return (
    <div>
      <Navbar userRole={userRole} isLoginScreen={isLoginScreen} />
      <Routes>
        <Route path="/" element={userRole === 'guest' ? <Navigate to="/login" />: <Navigate to={homeRoute} />} />
        <Route path="/login" element={userRole === 'guest' ? <Login />: <Navigate to={homeRoute} />} />
        <Route path="/admin/reset-password" element={userRole === 'admin' ? <Login />: <AdminResetPassword/>} />
        <Route path="/editor/reset-password" element={userRole === 'writer' ? <Login />: <WriterResetPassword/>} />
        <Route path="/writer/reset-password" element={userRole === 'editor' ? <Login />: <EditorResetPassword/>} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/editor/review/:id" element={<Review />} />
        <Route path="/admin/create-user" element={<NewUser />} />
        <Route path="/writer/create-article" element={<NewArticle />} />
        <Route path="/writer/home" element={<WriterHome />} />
        <Route path="/editor/home" element={<EditorHome />} />
        <Route path="/editor/article-list" element={<EditorArticleList />} />
        <Route path="/writer/article-list" element={<WriterArticleList />} />
        <Route path="/writer/edit/:id" element={<EditArticle />} />
        <Route path="/admin/analytic/:id" element={<WriterAnalytic />} />
        <Route path="admin/list-account" element={<ListAccount />} />
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