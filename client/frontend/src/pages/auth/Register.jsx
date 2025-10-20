import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    major: "",
    bio: "",
    graduation_year: "",
    password1: "",
    password2: "",
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/api/users/register/",
        form
      );
      navigate("/login");
      setMessage(res.data.detail);
    } catch (err) {
      setMessage("Error: " + JSON.stringify(err.response.data));
    }
  };

  return (
    <div className="container-center">
      <div className="card" style={{ maxWidth: 520, width: "100%" }}>
        <h2>Create an account</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="email"
              placeholder="Email (.edu)"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              name="full_name"
              placeholder="Full Name"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="major"
              placeholder="Major"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="bio"
              placeholder="Tell us about yourself"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="graduation_year"
              placeholder="Graduation Year (e.g. 2027)"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              name="password1"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <button className="btn" type="submit">
              Sign Up
            </button>
          </div>
        </form>
        {message && (
          <p className="muted" style={{ color: "red" }}>
            {message}
          </p>
        )}{" "}
      </div>
    </div>
  );
}
