import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createConversation } from "../api/messaging";
import ContactSellerBtn from "../components/ContactSellerBtn";
import SearchBar from "../components/SearchBar";
import SearchFilters from "../components/SearchFilters";

function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken, user } = useContext(AuthContext);

  // Get initial search and filter values from URL
  const initialSearch = searchParams.get("search") || "";
  const initialFilters = {
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
    seller: searchParams.get("seller") || "",
    sortBy: searchParams.get("ordering") || "-created_at",
  };

  const [currentSearch, setCurrentSearch] = useState(initialSearch);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  // Fetch items with search and filters
  const fetchItems = useCallback(
    async (search = "", filters = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (search) {
          params.append("search", search);
        }

        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "") {
            if (key === "sortBy") {
              params.append("ordering", value);
            } else if (key === "minPrice") {
              params.append("min_price", value);
            } else if (key === "maxPrice") {
              params.append("max_price", value);
            } else {
              params.append(key, value);
            }
          }
        });

        const response = await api.get(`/items/?${params.toString()}`);
        setItems(response.data);

        // Update URL without triggering navigation
        setSearchParams(params);
      } catch (err) {
        console.error("Failed to load items", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams]
  );

  // Initial load
  useEffect(() => {
    fetchItems(currentSearch, currentFilters);
  }, []);

  const handleSearch = (searchQuery) => {
    setCurrentSearch(searchQuery);
    fetchItems(searchQuery, currentFilters);
  };

  const handleSuggestionSelect = (suggestion) => {
    setCurrentSearch(suggestion);
    fetchItems(suggestion, currentFilters);
  };

  const handleFiltersChange = (newFilters) => {
    setCurrentFilters(newFilters);
    fetchItems(currentSearch, newFilters);
  };

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

      {/* Search Bar */}
      <div className="search-section">
        <SearchBar
          onSearch={handleSearch}
          onSuggestionSelect={handleSuggestionSelect}
        />
        <SearchFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={currentFilters}
        />
      </div>

      {/* Results */}
      <div className="results-section">
        {loading && (
          <div className="loading-state">
            <p>Searching items...</p>
          </div>
        )}

        {!loading &&
          items.length === 0 &&
          (currentSearch ||
            Object.values(currentFilters).some(
              (v) => v !== "" && v !== "-created_at"
            )) && (
            <div className="empty-state">
              <h3>No items found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}

        {!loading && items.length > 0 && (
          <>
            <div className="results-header">
              <p className="muted">
                {items.length} item{items.length !== 1 ? "s" : ""} found
                {currentSearch && ` for "${currentSearch}"`}
              </p>
            </div>

            <div className="grid">
              {items.map((item) => (
                <div key={item.id} className="card">
                  {item.images.length > 0 ? (
                    <div
                      className="card-image"
                      style={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: item.images.length
                          ? "#f8f8f8"
                          : "linear-gradient(90deg, var(--accent), var(--accent-2))",
                        borderRadius: 8,
                        marginBottom: 12,
                        overflow: "hidden",
                      }}
                    >
                      {item.images.length > 0 && (
                        <img
                          src={item.images[0].image}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: 8,
                            display: "block",
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      className="card-image"
                      style={{
                        height: 180,
                        background:
                          "linear-gradient(90deg, var(--accent), var(--accent-2))",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />
                  )}
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Browse;
