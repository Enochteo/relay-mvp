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
    api.get(`/items/${id}/`).then(res => setForm(res.data));
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

  if (!form) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} />
      <textarea name="description" value={form.description} onChange={handleChange} />
      <input name="price" value={form.price} onChange={handleChange} />
      <button className="btn">Save</button>
    </form>
  );
}

export default EditItem;
