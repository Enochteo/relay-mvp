import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header card">
      <div className="brand">
        <div className="logo" aria-hidden />
        <h1>Relay</h1>
      </div>
      <nav className="nav-actions">
        <Link className="muted" to="/">Browse</Link>
        <Link className="muted" to="/post">Post</Link>
        <Link className="muted" to="/dashboard">Dashboard</Link>
        <Link className="muted" to="/signup">Sign up</Link>
        <Link className="muted" to="/login">Log in</Link>
      </nav>
    </header>
  );
}

export default Navbar;