function Dashboard() {
  const myListings = [
    { id: 1, title: "Calculus Textbook", status: "Available" },
    { id: 2, title: "Studio Monitor Headphones", status: "Pending" },
  ];

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Your dashboard</h1>
        <p className="muted">Manage your listings, messages, and saved items.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div>
          <div className="card">
            <h3>My listings</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {myListings.map((l) => (
                <li key={l.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{l.title}</strong>
                      <div className="muted">{l.status}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn secondary">Edit</button>
                      <button className="btn">View</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          <div className="card">
            <h4>Summary</h4>
            <p className="muted">You have {myListings.length} active listings.</p>
            <div style={{ marginTop: 12 }}>
              <button className="btn">Post new item</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
