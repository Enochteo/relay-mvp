function Browse() {
  const sample = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    desc: "Short description about this item.",
    price: `$${(20 + i * 5).toFixed(2)}`,
  }));

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Browse items</h1>
        <p className="muted">Discover items your classmates are offering.</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {sample.map((s) => (
            <div key={s.id} className="card">
              <div style={{ height: 120, background: 'linear-gradient(90deg,var(--accent), var(--accent-2))', borderRadius: 8, marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 6px' }}>{s.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{s.desc}</p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{s.price}</strong>
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
