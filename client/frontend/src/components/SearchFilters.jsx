import React, { useState } from "react";

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    category: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    seller: "",
    sortBy: "created_at",
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "TEXTBOOK", label: "Textbooks" },
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "FURNITURE", label: "Furniture" },
    { value: "CLOTHING", label: "Clothing" },
    { value: "OTHER", label: "Other" },
  ];

  const conditionOptions = [
    { value: "", label: "Any Condition" },
    { value: "NEW", label: "Like New" },
    { value: "GOOD", label: "Gently Used" },
    { value: "FAIR", label: "Fair" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Newest First" },
    { value: "-created_at", label: "Oldest First" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
    { value: "title", label: "Name: A to Z" },
    { value: "-title", label: "Name: Z to A" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      seller: "",
      sortBy: "created_at",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sortBy" && value !== ""
  );

  return (
    <div className="search-filters">
      <div className="filters-header">
        <div className="filters-main">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="filter-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn secondary"
          >
            {showAdvanced ? "Hide Filters" : "More Filters"}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn secondary">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="filters-advanced">
          <div className="filter-row">
            <div className="filter-group">
              <label>Condition</label>
              <select
                value={filters.condition}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
                className="filter-select"
              >
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="price-input"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="price-input"
                  min="0"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Seller</label>
              <input
                type="text"
                placeholder="Search by seller name..."
                value={filters.seller}
                onChange={(e) => handleFilterChange("seller", e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
