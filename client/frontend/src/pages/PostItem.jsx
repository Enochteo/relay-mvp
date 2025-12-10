import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../supabase/supabaseClient";

function PostItem() {
  const { accessToken } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "TEXTBOOK",
    condition: "GOOD",
    is_negotiable: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const uploadImagesToSupabase = async (imageFiles) => {
    const uploadedUrls = [];
    const errors = [];

    for (const file of imageFiles) {
      try {
        const result = await uploadImage(file);
        uploadedUrls.push(result.url);
        console.log(`✓ Uploaded: ${file.name}`);
      } catch (err) {
        const errorMsg = `Failed to upload ${file.name}: ${err.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        // Continue uploading other files even if one fails
      }
    }

    if (errors.length > 0 && uploadedUrls.length === 0) {
      // All uploads failed
      throw new Error(errors.join("; "));
    }

    if (errors.length > 0) {
      // Some uploads failed but we have some successes
      console.warn("Some images failed to upload:", errors);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!form.title || !form.price) {
        setError("Title and price are required");
        setLoading(false);
        return;
      }

      // Upload images to Supabase if provided
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImagesToSupabase(images);
      }

      // Create FormData for backend
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      // Append uploaded image files (backend will store them)
      images.forEach((img) => {
        formData.append("images", img);
      });

      // Send to backend
      const response = await api.post("/items/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Item posted successfully!");
      setForm({
        title: "",
        description: "",
        price: "",
        category: "OTHER",
        condition: "GOOD",
        is_negotiable: false,
      });
      setImages([]);

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Failed to post item:", err);
      setError(err.message || "Failed to post item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell container-center">
      <div className="card" style={{ width: 680 }}>
        <h2>Post a new item</h2>
        <form
          className="form-grid"
          onSubmit={handleSubmit}
          style={{ marginTop: 12 }}
        >
          <div className="form-row">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="form-row" style={{ display: "flex", gap: 8 }}>
            <input
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ flex: 1 }}
            >
              <option value="TEXTBOOK">Textbook</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FURNITURE">Furniture</option>
              <option value="CLOTHING">Clothing</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              style={{ flex: 1 }}
            >
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
          <div
            className="form-row"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                name="is_negotiable"
                checked={form.is_negotiable}
                onChange={handleChange}
              />
              Negotiable?
            </label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              style={{ flex: 1 }}
            />
          </div>
          <div className="form-row" style={{ display: "flex", gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </button>
            {error && (
              <span className="muted" style={{ color: "red" }}>
                {error}
              </span>
            )}
            {success && (
              <span className="muted" style={{ color: "green" }}>
                {success}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostItem;
