import { useState } from "react";
import api from "../api/axios";

function PostItem() {
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
   try {
      await api.post("items/", {
        title: form.title,
        description: form.description,
        price: form.price,
        category: "TEXTBOOK", // placeholder for now
        condition: "GOOD", // placeholder
        is_negotiable: true,
      });
      setMessage("Item posted successfully!");
      setForm({ title: "", description: "", price: "" });
    } catch (err) {
      setMessage("Failed to post item.");
    }

  };

return (
    <div className="app-shell container-center">
      <div className="card" style={{ width: 680 }}>
        <h2>Post a new item</h2>
        <p className="muted">Add details so others can find and contact you.</p>
        <form className="form-grid" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-row">
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={5} />
          </div>
          <div className="form-row">
            <input name="price" placeholder="Price (USD)" value={form.price} onChange={handleChange} />
          </div>
          <div className="form-row">
            <button className="btn" type="submit">Publish</button>
          </div>
        </form>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}

export default PostItem;

