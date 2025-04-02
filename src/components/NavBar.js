import React, { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/Navbar.css';
import { useAuth } from '../AuthContext';
import { FaBell, FaUser, FaCaretDown } from 'react-icons/fa';
import HeaderImage from '../images/Header.png'
const Navbar = memo(({ userRole, isLoginScreen = false }) => {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = {
    ADMIN: [
      { path: '/admin/home', label: 'Dashboard' },
      { path: '/admin/create-user', label: 'Create Users' },
    ],
    EDITOR: [
      { path: '/', label: 'Home' },
      { path: '/profile', label: 'Profile' },
      { path: '/my-orders', label: 'My Orders' },
    ],
    WRITER: [
      { path: '/writer/home', label: 'Home' },
      { path: '/writer/create-article', label: 'Create Article' },
    ],
  };

  // Additional items from the image to include in the dropdown

  const currentMenuItems = [...(menuItems[userRole] || [])];

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    auth.setUserRole('GUEST');
    window.location.href="/login"
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {isLoginScreen ? (
          // Login screen header
          <div className="login-header">
              <img src={HeaderImage} alt="Login Header" className="header-image" />
          </div>
        ) : (
          // Regular navigation bar
          <>
            <div className="navbar-logo">
              <img src="/path-to-logo.png" alt="Logo" className="logo" />
            </div>
            <div className="user-section">
              <div className="user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FaBell className="icon" />
                <span className="username">Bùi Giang Nam</span>
                <FaUser className="icon" />
                <FaCaretDown className="caret" />
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <ul>
                    {currentMenuItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                    <li>
                      <button className="logout-button" onClick={handleLogOut}>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
});

export default Navbar;