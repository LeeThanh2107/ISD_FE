import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./public/login";
import AdminHome from "./public/Admin/Homepage";
import NewUser from "./public/Admin/NewUser";
import Navbar from "./components/NavBar";
import { useAuth } from "./AuthContext";
import NewArticle from "./public/Writer/NewArticle";
import WriterHome from "./public/Writer/Homepage";
// import EditorHome from "./pages/EditorHome";
// import WriterHome from "./pages/WriterHome";

const App = () => {
  const auth = useAuth();
  const [userRole,setUserRole] = useState('guest');
  useEffect(()=>{
    setUserRole(auth.userRole);
  },[auth.userRole])
  return (
    <Router>
      <Navbar userRole={userRole}/>
       <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/create-user" element={<NewUser />} />
        <Route path="/writer/create-article" element={<NewArticle />} />
        <Route path="/writer/home" element={<WriterHome />} />
      </Routes>
    </Router>
  );
};

export default App;
