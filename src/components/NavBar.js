import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/Navbar.css';
import { useAuth } from '../AuthContext';
import HeaderImage from '../images/Header (1).png';
const Navbar = memo(({ userRole }) => {
  const auth = useAuth();
  // Định nghĩa menu items
  // const [role,setRole] = useState('guest');
  // useEffect(()=>{
  //   setRole(userRole);
  // },[userRole]);
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
    ]
  };

  // Debug: Log giá trị userRole
  // Lấy menu items với fallback an toàn
  const currentMenuItems = menuItems[userRole];
  // Debug: Log giá trị currentMenuItems
  const handleLogOut = function(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    auth.setUserRole('GUEST');
  }
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="nav-menu">
          {Array.isArray(currentMenuItems) && currentMenuItems.length > 0 ? (
            currentMenuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))
          )
           : (
            <li className="nav-item">
              <img alt="" src={HeaderImage} className='title_img'></img>
            </li>
          )}
        </ul>
{      currentMenuItems && currentMenuItems.length > 0 ? (
     <div className="nav-item" onClick={handleLogOut}>
     <NavLink
       to="/login"
       >
         Logout
       </NavLink>
   </div>
)     : <div></div>
}
      </div>
    </nav>
  );
});

export default Navbar;