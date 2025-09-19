import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password1: "",
    password2: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/users/register/", form);
      setMessage(res.data.detail);
    } catch (err) {
      setMessage("Error: " + JSON.stringify(err.response.data));
    }
  };

   return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email (.edu)" onChange={handleChange} />
        <input name="full_name" placeholder="Full Name" onChange={handleChange} />
        <input type="password" name="password1" placeholder="Password" onChange={handleChange} />
        <input type="password" name="password2" placeholder="Confirm Password" onChange={handleChange} />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}