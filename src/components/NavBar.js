import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FaBell, FaUser } from 'react-icons/fa';
import HeaderImage from '../images/Header.png';
import Logo from '../images/logo.png';
import '../css/Navbar.css';

const Navbar = memo(({ userRole, isLoginScreen = false }) => {
  const auth = useAuth();
  const fullname = localStorage.getItem('fullname');

  const menuItems = {
    ADMIN: [
      { path: '/admin/home', label: 'Trang chủ' },
      { path: '/admin/create-user', label: 'Cấp tài khoản' },
      { path: '/admin/reset-password', label: 'Đổi mật khẩu' },
      { path: '/admin/list-account', label: 'Danh sách tài khoản'}
    ],
    EDITOR: [
      { path: '/editor/home', label: 'Trang chủ' },
      { path: '/editor/article-list', label: 'Danh sách bài viết' },
      { path: '/editor/reset-password', label: 'Đổi mật khẩu' }
    ],
    WRITER: [
      { path: '/writer/home', label: 'Trang chủ' },
      { path: '/writer/article-list', label: 'Bài viết trong ban'},
      { path: '/writer/create-article', label: 'Viết bài' },
      { path: '/writer/reset-password', label: 'Đổi mật khẩu' }
    ],
  };

  const currentMenuItems = [...(menuItems[userRole] || [])];

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem("fullname");
    localStorage.removeItem('role');
    auth.setUserRole('GUEST');
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      {isLoginScreen ? (
        <div className="navbar-login-container">
          <div className="login-header">
            <img src={HeaderImage} alt="Login Header" className="header-image" />
          </div>
        </div>
      ) : (
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={Logo} alt="Logo" className="logo" />
          </div>
          
          {/* Navigation links in the middle */}
          <div className="navbar-nav">
            <ul className="nav-menu">
              {currentMenuItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="user-container">
            <div className="user-section">
              <div className="user-info">
                <FaBell className="icon" />
                <span className="username">{fullname}</span>
                <FaUser className="icon" />
                <button className="logout-button-header" onClick={handleLogOut}>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;