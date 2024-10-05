import React, { useState, useEffect } from "react";
import WinesList from "./WinesList";
import SearchWines from "./SearchWines";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

function Sidebar({ onWineSelect, onUploadSelect, reload, isCollapsed }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // 用來保存搜索結果
  const [isSearching, setIsSearching] = useState(false);

  // 在 sidebar 展開或收起的瞬間，延遲顯示內容
  useEffect(() => {
    if (isCollapsed) {
      // 先讓文字淡出，然後再隱藏
      setIsSidebarVisible(false); // 開始淡出過渡
    } else {
      setIsSidebarVisible(true); // 在展開時顯示文字
    }
  }, [isCollapsed]);

  const handleSearchResults = (results) => {
    setSearchResults(results); // 保存搜索結果
    setIsSearching(true); // 設置為搜索狀態
  };

  // 重置搜尋狀態
  const resetSearch = () => {
    setIsSearching(false); // 關閉搜尋模式
    setSearchResults([]); // 清空搜尋結果
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
                      icon={faFileCirclePlus}
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
