import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

function EditItem() {
  const { id } = useParams();
  const { accessToken } = useContext(AuthContext);
  const [form, setForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/items/${id}/`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    await api.put(`/items/${id}/`, formData, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "multipart/form-data" },
    });
    navigate("/dashboard");
  };

  if (!form) return <p className="muted">Loading...</p>;

  return (
    <div className="app-shell container-center">
      <div className="card" style={{ maxWidth: 600, width: '100%' }}>
        <h2>Edit item</h2>
        <form className="form-grid" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
          </div>
          <div className="form-row">
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={4} />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <input name="price" value={form.price} onChange={handleChange} placeholder="Price" style={{ flex: 1 }} />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">Save</button>
            <button className="btn secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItem;
