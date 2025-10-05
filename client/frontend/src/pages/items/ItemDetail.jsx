import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ContactSellerBtn from "../../components/ContactSellerBtn";
import { AuthContext } from "../../context/AuthContext";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const { accessToken, user } = useContext(AuthContext);

  useEffect(() => {
    api.get(`/items/${id}/`).then((res) => setItem(res.data));
  }, [id]);

  if (!item) return <p className="muted">Loading...</p>;
  return (
    <div className="app-shell container-center">
      <div className="card" style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{ marginBottom: 8 }}>{item.title}</h2>
        <div className="muted" style={{ marginBottom: 12 }}>
          ${item.price} &nbsp;|&nbsp; {item.condition}
        </div>
        <p style={{ marginBottom: 16 }}>{item.description}</p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {item.images &&
            item.images.map((img) => (
              <img
                key={img.id}
                src={img.image}
                alt={item.title}
                style={{ width: 160, borderRadius: 8, objectFit: "cover" }}
              />
            ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {user && user.id === item.seller.id ? (
            <button
              className="btn"
              disabled
              style={{
                opacity: 0.5,
                cursor: "not-allowed",
                backgroundColor: "#6c757d",
              }}
              title="This is your own item"
            >
              Your Item
            </button>
          ) : (
            <ContactSellerBtn
              sellerId={item.seller.id}
              token={accessToken}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
