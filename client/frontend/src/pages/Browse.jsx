import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from 'react-router-dom'

function Browse() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    api.get("/items/")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load items", err));
  }, []);

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Browse items</h1>
        <p className="muted">Discover items your classmates are offering.</p>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  height: 120,
                  background: item.images && item.images.length > 0
                    ? `url(${item.images[0].image}) center center/cover no-repeat`
                    : "linear-gradient(90deg,var(--accent), var(--accent-2))",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              <p className="muted" style={{ margin: 0, minHeight: 32 }}>{item.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <strong>${item.price}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn secondary" onClick={() => navigate(`/items/${item.id}`)}>View</button>
                  <button className="btn">Contact</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Browse;