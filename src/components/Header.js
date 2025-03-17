function Header(){
    return(
        <header className="header">
        {/* <img src={Logo} alt="Logo" className="logo" /> */}
        <nav className="navbar">
          <button className="nav-btn">+</button>
          <button className="nav-btn">📋</button>
          <button className="nav-btn">📅</button>
          <button className="nav-btn">📊</button>
          <button className="nav-btn">⋮</button>
        </nav>
        <div className="user-info">
              <span className="notification">🔔</span>
              <span className="user-name">Bùi Giang Nam</span>
              <img src="https://via.placeholder.com/30" alt="User" className="user-avatar" />
            </div>
      </header>

    )
}
export default Header;