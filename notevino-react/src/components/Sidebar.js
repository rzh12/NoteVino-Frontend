import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "shards-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // 使用 useNavigate 來進行路由導航
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // 用來保存搜索結果
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); // 如果有 token，表示已登入

      // 如果用戶已登入，獲取用戶信息
      axios
        .get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // 使用當前的 JWT token
          },
        })
        .then((response) => {
          const { name, picture } = response.data; // 從 response 中獲取用戶名和頭像
          setUserName(name);
          setAvatarUrl(
            picture || "https://via.placeholder.com/50?text=No+Image"
          ); // 如果 picture 為 null，則使用預設的占位符
        })
        .catch((error) => {
          console.error("Failed to fetch user profile:", error);
        });
    } else {
      setIsLoggedIn(false); // 沒有 token 表示未登入
    }
  }, []);

  // 在 sidebar 展開或收起的瞬間，延遲顯示內容
  useEffect(() => {
    if (isCollapsed) {
      // 先讓文字淡出，然後再隱藏
      setIsSidebarVisible(false); // 開始淡出過渡
    } else {
      setIsSidebarVisible(true); // 在展開時顯示文字
    }
  }, [isCollapsed]);

  const handleLogin = () => {
    navigate("/login"); // 點擊時導航到 /login
  };

  const handleRegister = () => {
    navigate("/register"); // 點擊時導航到 /register
  };

  const handleLogout = () => {
    // 清除 localStorage 中的 JWT token
    localStorage.removeItem("token");

    // 更新頁面
    window.location.reload();
  };

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
    <div style={{ ...styles.sidebar, width: isCollapsed ? "0" : "300px" }}>
      {!isCollapsed && (
        <>
          <div style={styles.noteVinoHeader}>
            <h2
              style={{
                opacity: isSidebarVisible ? 1 : 0,
                transition: "opacity 0.3s ease", // 添加過渡效果
              }}
            >
              NoteVino
            </h2>
          </div>

          {/* 如果登入，顯示用戶資料和登出按鈕；否則顯示登入和註冊 */}
          {isLoggedIn ? (
            <>
              <div
                style={{
                  ...styles.userProfile,
                  opacity: isSidebarVisible ? 1 : 0, // 控制淡入淡出
                  transition: "opacity 0.3s ease",
                }}
              >
                <img src={avatarUrl} alt="User Avatar" style={styles.avatar} />
                <span>Welcome, {userName}!</span>
              </div>
              <div
                style={{
                  ...styles.authItem,
                  opacity: isSidebarVisible ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  ...styles.authItem,
                  opacity: isSidebarVisible ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
                onClick={handleLogin}
              >
                Login
              </div>
              <div
                style={{
                  ...styles.authItem,
                  opacity: isSidebarVisible ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
                onClick={handleRegister}
              >
                Register
              </div>
            </>
          )}

          <div style={styles.searchContainer}>
            <SearchWines
              onSearchResults={handleSearchResults}
              resetSearch={resetSearch}
            />
          </div>

          {/* 根據搜尋狀態顯示內容 */}
          {isSearching ? (
            <div style={styles.wineList}>
              {searchResults.length > 0 ? (
                searchResults.map((wine) => (
                  <div
                    key={wine.wineId}
                    onClick={() => onWineSelect(wine.wineId)}
                    className="wine-item"
                  >
                    {wine.name}
                  </div>
                ))
              ) : (
                <p>没有找到相關的酒款。</p>
              )}
            </div>
          ) : (
            <div style={styles.wineList}>
              <WinesList onWineSelect={onWineSelect} reload={reload} />
            </div>
          )}

          <div style={styles.uploadButton}>
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
  userProfile: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#f5f5f5", // 淡灰色背景讓 userProfile 看起來更突出
    borderBottom: "1px solid #e5e5e5", // 底部邊框與其他部分一致
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // 添加陰影讓頭像看起來更立體
  },
  welcomeText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  authItem: {
    padding: "15px 20px", // 增加 padding 讓區塊更舒適
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer", // 鼠標懸停時顯示為可點擊
    borderBottom: "1px solid #e5e5e5", // 添加分隔線
    transition: "background-color 0.2s ease", // 增加過渡效果
  },
  authItemHover: {
    backgroundColor: "#f0f0f0", // 當鼠標懸停時的背景色
  },
  searchContainer: {
    padding: "20px", // 搜尋區塊的 padding
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
