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
    setQuery(e.target.value);

    if (e.target.value.trim()) {
      handleSearch(e.target.value); // 當輸入有內容時，自動觸發搜尋
    } else {
      resetSearch(); // 當輸入框被清空時重置搜尋
    }
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      resetSearch(); // 如果搜尋欄被清空，重置搜尋狀態
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
      <form onSubmit={handleSearch} className="search-form">
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
        </div>
        {/* 重置搜索按钮 */}
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
      </form>
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default SearchWines;
