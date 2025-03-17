import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const AuthContext = createContext();

// Provider quản lý trạng thái auth
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('role') || 'guest');
  const handleStorageChange = () => {
    const newRole = localStorage.getItem('role') || 'guest';
    setUserRole(newRole);
  };
  window.addEventListener('storage', handleStorageChange);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện dụng để lấy role
export const useAuth = () => useContext(AuthContext);
