import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { accessToken, logout } = useContext(AuthContext);
  return (
    <header className="site-header">
      <div className="brand">
        <div className="logo" aria-hidden />
        <h1>Relay</h1>
      </div>

      <nav className="nav-actions">
        <NavLink to="/" className={({isActive})=> isActive ? 'active' : ''}>Browse</NavLink>
        <NavLink to="/post" className={({isActive})=> isActive ? 'active' : ''}>Post</NavLink>
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