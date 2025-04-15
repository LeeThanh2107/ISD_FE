import React, { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../AuthContext';
import { FaBell, FaUser, FaCaretDown } from 'react-icons/fa';
import HeaderImage from '../images/Header.png';
import Logo from '../images/logo.png';
import '../css/Navbar.css';

const Navbar = memo(({ userRole, isLoginScreen = false }) => {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fullname = useSelector((state) => state.user.fullname);

  const menuItems = {
    ADMIN: [
      { path: '/admin/home', label: 'Trang chủ' },
      { path: '/admin/create-user', label: 'Cấp tài khoản' },
      { path: '/admin/reset-password', label: 'Đổi mật khẩu' }
    ],
    EDITOR: [
      { path: '/editor/home', label: 'Trang chủ' },
      { path: '/editor/article-list', label: 'Danh sách bài viết' },
      { path: '/editor/reset-password', label: 'Đổi mật khẩu' }
    ],
    WRITER: [
      { path: '/writer/home', label: 'Trang chủ' },
      { path: '/writer/create-article', label: 'Viết bài' },
      { path: '/writer/reset-password', label: 'Đổi mật khẩu' }
    ],
  };

  const currentMenuItems = [...(menuItems[userRole] || [])];

  const handleLogOut = () => {
    localStorage.removeItem('token');
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
          <div className='user-container'>
            <div className="user-section">
              <div className="user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FaBell className="icon" />
                <span className="username">{fullname}</span> {/* ✅ From Redux */}
                <FaUser className="icon" />
                <FaCaretDown className="caret" />
              </div>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <ul>
                  {currentMenuItems.map((item) => (
                    <li className='items' key={item.path}>
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
        </div>
      )}
    </nav>
  );
});

export default Navbar;
