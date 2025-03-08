import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./public/login";
import AdminHome from "./public/Admin/Homepage";
// import EditorHome from "./pages/EditorHome";
// import WriterHome from "./pages/WriterHome";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/home" element={<AdminHome />} />
        {/* <Route path="/editor/home" element={<EditorHome />} />
        <Route path="/writer/home" element={<WriterHome />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
