import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { accessToken, logout } = useContext(AuthContext);
  return (
    <nav>
      <Link to="/">Browse</Link>
      {accessToken ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={logout} className="btn secondary">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;