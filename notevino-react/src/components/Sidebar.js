import React, { useState, useEffect } from "react";
import WinesList from "./WinesList";
import SearchWines from "./SearchWines";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

function Sidebar({ onWineSelect, onUploadSelect, reload, isCollapsed }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Delay displaying content at the moment the sidebar expands or collapses
  useEffect(() => {
    if (isCollapsed) {
      setIsSidebarVisible(false);
    } else {
      setIsSidebarVisible(true);
    }
  }, [isCollapsed]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearching(true);
  };

  const resetSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <div
      className={`sidebar ${
        isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
      }`}
    >
      {!isCollapsed && (
        <>
          <div
            className={`search-container ${
              isSidebarVisible ? "search-container-visible" : ""
            }`}
          >
            <SearchWines
              onSearchResults={handleSearchResults}
              resetSearch={resetSearch}
            />
          </div>

          {/* 根據搜尋狀態顯示內容 */}
          <div
            className={`wine-list ${
              isSidebarVisible ? "wine-list-visible" : ""
            }`}
          >
            {isSearching ? (
              searchResults.length > 0 ? (
                <>
                  <h5
                    className={`search-results-header ${
                      isSidebarVisible ? "search-results-header-visible" : ""
                    }`}
                  >
                    搜尋結果
                  </h5>
                  {/* 新增搜尋結果標題 */}
                  <div
                    className={`search-results-list ${
                      isSidebarVisible ? "search-results-list-visible" : ""
                    }`}
                  >
                    {searchResults.map((wine) => (
                      <div
                        key={wine.wineId}
                        onClick={() => onWineSelect(wine.wineId)}
                        className="search-list-item"
                      >
                        {wine.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <h5
                  className={`no-results ${
                    isSidebarVisible ? "no-results-visible" : ""
                  }`}
                >
                  没有找到相關的酒款
                </h5>
              )
            ) : (
              <>
                <h5
                  className={`wines-list-header ${
                    isSidebarVisible ? "wines-list-header-visible" : ""
                  }`}
                >
                  您的葡萄酒清單
                </h5>
                <div
                  className={`upload-button ${
                    isSidebarVisible ? "upload-button-visible" : ""
                  }`}
                >
                  <button
                    className="upload-icon-button"
                    onClick={onUploadSelect}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ fontSize: "20px" }}
                    />
                  </button>
                </div>
                <WinesList onWineSelect={onWineSelect} reload={reload} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;
