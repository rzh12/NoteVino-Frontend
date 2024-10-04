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
    <div style={{ ...styles.sidebar, width: isCollapsed ? "0" : "250px" }}>
      {!isCollapsed && (
        <>
          {/* <div style={styles.noteVinoHeader}>
            <h2
              style={{
                opacity: isSidebarVisible ? 1 : 0,
                transition: "opacity 0.3s ease", // 添加過渡效果
              }}
            >
              NoteVino
            </h2>
          </div> */}

          <div
            style={{
              ...styles.searchContainer,
              opacity: isSidebarVisible ? 1 : 0,
              transition: "opacity 0.3s ease", // 過渡效果
            }}
          >
            <SearchWines
              onSearchResults={handleSearchResults}
              resetSearch={resetSearch}
            />
          </div>

          {/* 根據搜尋狀態顯示內容 */}
          <div
            style={{
              ...styles.wineList,
              opacity: isSidebarVisible ? 1 : 0,
              transition: "opacity 0.3s ease", // 過渡效果
            }}
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
                        className="wine-item"
                      >
                        {wine.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <h5 className="no-results">没有找到相關的酒款</h5>
              )
            ) : (
              <WinesList onWineSelect={onWineSelect} reload={reload} />
            )}
          </div>

          <div
            style={{
              ...styles.uploadButton,
              opacity: isSidebarVisible ? 1 : 0,
              transition: "opacity 0.3s ease", // 過渡效果
            }}
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

const styles = {
  sidebar: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#fff", // 使用白色背景
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: "width 0.3s ease", // 增加寬度動畫
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)", // 增加陰影效果讓側邊欄更立體
  },
  noteVinoHeader: {
    height: "60px", // 與 header 一致的高度
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // 背景與 header 保持一致
    borderBottom: "1px solid #ccc", // 添加底部邊框
    flexShrink: 0,
  },
  searchContainer: {
    height: "59px",
    padding: "20px", // 搜尋區塊的 padding
    flexShrink: 0,
  },
  wineList: {
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #ccc",
    flexGrow: 1,
    overflowY: "auto", // 使用 auto 避免滾動條永久佔用空間
  },
  uploadButton: {
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  resetButton: {
    marginTop: "10px", // 在搜尋結果下方添加一個重置按鈕
  },
};

export default Sidebar;
