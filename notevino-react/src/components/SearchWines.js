import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import "./SearchWines.css";

function SearchWines({ onSearchResults, resetSearch }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      handleSearch(value); // Automatically trigger search when there is input
    } else {
      resetSearch(); // Reset search when the input field is cleared
    }
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      resetSearch(); // If the search bar is cleared, reset the search state
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("token");

    axios
      .get(`/api/wines/search?query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setLoading(false);
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          onSearchResults(response.data.data);
        } else {
          onSearchResults([]);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error during search:", error);
        onSearchResults([]);
      });
  };

  return (
    <div className="search-wines-container">
      <div className="input-wrapper">
        {/* 放大鏡圖標 */}
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="search-icon"
          style={{ fontSize: "20px" }}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          className="search-input"
        />
        {/* 重置按鈕 */}
        {query && (
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setQuery("");
              resetSearch();
            }}
          >
            <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: "20px" }} />
          </button>
        )}
      </div>
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default SearchWines;
