import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/items/${id}/`).then((res) => setItem(res.data));
  }, [id]);

  if (!item) return <p className="muted">Loading...</p>;
  return (
    <div className="app-shell container-center">
      <div className="card" style={{ maxWidth: 600, width: '100%' }}>
        <h2 style={{ marginBottom: 8 }}>{item.title}</h2>
        <div className="muted" style={{ marginBottom: 12 }}>${item.price} &nbsp;|&nbsp; {item.condition}</div>
        <p style={{ marginBottom: 16 }}>{item.description}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {item.images && item.images.map((img) => (
            <img key={img.id} src={img.image} alt={item.title} style={{ width: 160, borderRadius: 8, objectFit: 'cover' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Contact Seller</button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;