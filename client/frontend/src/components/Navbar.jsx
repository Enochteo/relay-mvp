import { NavLink } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import Logo from "./Logo";

function Navbar() {
  const { accessToken, logout } = useContext(AuthContext);
  const { unreadCount } = useUnreadMessages();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && !e.target.closest(".site-header")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleNavClick = () => {
    setOpen(false); // Close mobile menu when nav item is clicked
  };

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="brand">
          <Logo />
          <div className="brand-text">
            <h1>Relay</h1>
            <small className="muted">Campus marketplace</small>
          </div>
        </div>

        <div className="nav-right">
          <button
            className={`nav-toggle ${open ? "open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav className={`nav-actions ${open ? "open" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            Browse
          </NavLink>
          <NavLink
            to="/post"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            Post
          </NavLink>
          {accessToken && (
            <NavLink
              to="/messages"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleNavClick}
            >
              <span className="nav-item-content">
                Messages
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}
          {accessToken ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={handleNavClick}
              >
                Dashboard
              </NavLink>
              <button
                onClick={toggleTheme}
                className="btn secondary theme-toggle"
              >
                {theme === "dark" ? "🌞" : "🌙"}
                <span className="theme-text">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>
              <button
                onClick={() => {
                  logout();
                  handleNavClick();
                }}
                className="btn secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleTheme}
                className="btn secondary theme-toggle"
              >
                {theme === "dark" ? "🌞" : "🌙"}
                <span className="theme-text">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={handleNavClick}
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={handleNavClick}
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
      {open && (
        <div className="nav-overlay" onClick={() => setOpen(false)}></div>
      )}
    </header>
  );
}

export default Navbar;
