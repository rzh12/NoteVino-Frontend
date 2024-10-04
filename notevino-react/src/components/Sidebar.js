import React, { useState, useEffect } from "react";
import { Button } from "shards-react";
import WinesList from "./WinesList";
import SearchWines from "./SearchWines";
import "./Sidebar.css";

function Sidebar({
  onWineSelect,
  onUploadSelect,
  onSearch,
  reload,
  isCollapsed,
}) {
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
                  <h5 className="search-results-header">搜尋結果</h5>{" "}
                  {/* 新增搜尋結果標題 */}
                  <div className="search-results-list">
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
                <h5 className="no-results">没有找到相關的酒款</h5> // 當沒有搜尋結果時顯示
              )
            ) : (
              <WinesList onWineSelect={onWineSelect} reload={reload} /> // 非搜尋狀態下顯示酒款列表
            )}
          </div>

          <div
            className={`upload-button ${
              isSidebarVisible ? "upload-button-visible" : ""
            }`}
          >
            <Button theme="primary" onClick={onUploadSelect}>
              + Upload Wine
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;
