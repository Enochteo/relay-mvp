import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom'

function PostItem() {
  const { accessToken } = useContext(AuthContext);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "TEXTBOOK", condition: "GOOD", is_negotiable: false,});
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   try {
      await api.post("/items/", { ...form },  {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSuccess("Item posted successfully!");
      setError("");
      setForm({
        title: "",
        description: "",
        price: "",
        category: "OTHER",
        condition: "GOOD",
        is_negotiable: false,
      });
      // redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to post item:", err);
      setError("Error: Something went wrong");
    }
  };

return (
    <div className="app-shell container-center">
      <div className="card" style={{ width: 680 }}>
        <h2>Post a new item</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="TEXTBOOK">Textbook</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="FURNITURE">Furniture</option>
          </select>
          <select name="condition" value={form.condition} onChange={handleChange}>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>
          <label>
            <input type="checkbox" name="is_negotiable" checked={form.is_negotiable} onChange={handleChange} />
            Negotiable?
          </label>
          <button className="btn" type="submit">Publish</button>
        </form>
        {message && <p className="muted">{message}</p>}
      </div>
    </div>
  );
}

export default PostItem;