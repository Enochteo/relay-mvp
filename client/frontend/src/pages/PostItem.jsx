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
  const navigate = useNavigate();

  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
  setImages([...e.target.files]);
};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    images.forEach((img) => formData.append("images", img));

   try {
      await api.post("/items/", formData,  {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
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
        <form className="form-grid" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-row">
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={4} />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} style={{ flex: 1 }} />
            <select name="category" value={form.category} onChange={handleChange} style={{ flex: 1 }}>
              <option value="TEXTBOOK">Textbook</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FURNITURE">Furniture</option>
            </select>
            <select name="condition" value={form.condition} onChange={handleChange} style={{ flex: 1 }}>
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
          <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" name="is_negotiable" checked={form.is_negotiable} onChange={handleChange} />
              Negotiable?
            </label>
            <input type="file" multiple onChange={handleImageChange} style={{ flex: 1 }} />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">Publish</button>
            {error && <span className="muted" style={{ color: 'red' }}>{error}</span>}
            {success && <span className="muted" style={{ color: 'green' }}>{success}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostItem;