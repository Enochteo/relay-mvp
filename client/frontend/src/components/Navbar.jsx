import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/">Browse</Link> |{" "}
      <Link to="/post">Post Item</Link> |{" "}
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/signup">Signup</Link> |{" "}
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;