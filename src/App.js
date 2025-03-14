import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./public/login";
import AdminHome from "./public/Admin/Homepage";
import NewUser from "./public/Admin/NewUser";
// import EditorHome from "./pages/EditorHome";
// import WriterHome from "./pages/WriterHome";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/create-user" element={<NewUser />} />
        {/* <Route path="/editor/home" element={<EditorHome />} />
        <Route path="/writer/home" element={<WriterHome />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
