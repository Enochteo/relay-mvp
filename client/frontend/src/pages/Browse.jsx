import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createConversation } from "../api/messaging";
import ContactSellerBtn from "../components/ContactSellerBtn";

function Browse() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { accessToken, user } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/items/")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load items", err));
  }, []);

  // const handleContact = async (sellerId) => {
  //   if (!accessToken) {
  //     navigate("/login");
  //     return;
  //   }

  //   // Prevent users from contacting themselves
  //   if (user && user.id === sellerId) {
  //     alert("You cannot contact yourself!");
  //     return;
  //   }

  //   try {
  //     const convo = await createConversation(sellerId, accessToken);
  //     navigate(`/messages/${convo.id}`);
  //   } catch (err) {
  //     console.error("Failed to start conversation", err);
  //   }
  // };

  return (
    <div className="app-shell">
      <div className="hero">
        <h1>Browse items</h1>
        <p className="muted">Discover items your classmates are offering.</p>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div
                className="card-image"
                style={{
                  background: item.images.length
                    ? `url(${item.images[0].image}) center center/cover no-repeat`
                    : "linear-gradient(90deg, var(--accent), var(--accent-2))",
                }}
              />
              <h3>{item.title}</h3>
              <p className="muted">{item.description}</p>

              {/* Seller info */}
              <p className="seller">
                Seller:
                <button
                  className="link-btn"
                  onClick={() => navigate(`/profile/${item.seller.id}`)}
                >
                  {item.seller.full_name || item.seller.email}
                </button>
                {user && user.id === item.seller.id && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#007bff",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    (You)
                  </span>
                )}
              </p>
              <p className="muted">
                ⭐ {item.seller.profile.rating_avg.toFixed(1)} (
                {item.seller.profile.rating_count})
              </p>

              <div className="card-footer">
                <strong>${item.price}</strong>
                <div className="btn-group">
                  <button
                    className="btn secondary"
                    onClick={() => navigate(`/items/${item.id}`)}
                  >
                    View
                  </button>
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
                    // <button
                    //   className="btn"
                    //   onClick={() => handleContact(item.seller.id)}
                    // >
                    //   Contact
                    // </button>
                  )}
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
