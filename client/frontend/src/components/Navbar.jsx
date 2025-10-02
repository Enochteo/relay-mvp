import { NavLink } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from '../context/AuthContext'
import Logo from './Logo';

function Navbar() {
  const { accessToken, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <header className="site-header">
      <div className="brand">
        <Logo />
        <div className="brand-text">
          <h1>Relay</h1>
          <small className="muted">Campus marketplace</small>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
        <div className="nav-search">
          <input placeholder="Search items..." />
        </div>
      </div>

      <nav className={`nav-actions ${open ? 'open' : ''}`}>
        <NavLink to="/" className={({isActive})=> isActive ? 'active' : ''}>Browse</NavLink>
        <NavLink to="/post" className={({isActive})=> isActive ? 'active' : ''}>Post</NavLink>
        <button onClick={toggleTheme} className="btn secondary">{theme === "dark" ? "🌞 Light" : "🌙 Dark"}</button>
        {accessToken && <NavLink to="/messages">Inbox</NavLink>}
        {accessToken ? (
          <>
            <NavLink to="/dashboard" className={({isActive})=> isActive ? 'active' : ''}>Dashboard</NavLink>
            <button onClick={logout} className="btn secondary">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive})=> isActive ? 'active' : ''}>Login</NavLink>
            <NavLink to="/signup" className={({isActive})=> isActive ? 'active' : ''}>Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;