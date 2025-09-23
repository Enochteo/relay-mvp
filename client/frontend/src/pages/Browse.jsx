import { useEffect, useState } from "react";
import api from "../api/axios";

function Browse() {
  const [items, setItems] = useState([]);

  
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
            <div key={item.id} className="card">
              <div
                style={{
                  height: 120,
                  background:
                    "linear-gradient(90deg,var(--accent), var(--accent-2))",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
              <h3 style={{ margin: "0 0 6px" }}>{item.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {item.description}
              </p>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>${item.price}</strong>
                <button className="btn">Contact</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Browse;