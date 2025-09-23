import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { accessToken, logout } = useContext(AuthContext); 
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/items/my_items", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setMyListings(res.data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchListings();
    }
  }, [accessToken]);

  if (loading) return <p className="muted">Loading your listings...</p>;

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Your dashboard</h1>
        <p className="muted">Manage your listings, messages, and saved items.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
        <div>
          <div className="card">
            <h3>My listings</h3>
            {myListings.length === 0 ? (
              <p className="muted">No listings yet. Post something to get started!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {myListings.map((l) => (
                  <li
                    key={l.id}
                    style={{
                      padding: "0.75rem 0",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>{l.title}</strong>
                        <div className="muted">
                          ${l.price} – {l.condition}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn secondary">Edit</button>
                        <button className="btn">View</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside>
          <div className="card">
            <h4>Summary</h4>
            <p className="muted">You have {myListings.length} active listings.</p>
            <div style={{ marginTop: 12 }}>
              <button className="btn">Post new item</button>
              <button className="btn secondary" onClick={logout}>Logout</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
