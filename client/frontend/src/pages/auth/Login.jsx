import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="container-center">
      <div className="card" style={{maxWidth: 520, width: '100%'}}>
        <h2>Log in</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="email" placeholder="Email" onChange={handleChange} />
          </div>
          <div className="form-row">
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          </div>
          <div className="form-row">
            <button className="btn" type="submit">Login</button>
          </div>
        </form>
        {error && <p className="muted">{error}</p>}
      </div>
    </div>
    
  );
}
