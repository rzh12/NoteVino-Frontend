import React, { useState } from "react";
import { Card, CardBody, CardTitle } from "shards-react";
import Sidebar from "../components/Sidebar";
import WineDetails from "../components/WineDetails";
import WineUploadForm from "../components/WineUploadForm";
import { FaBars } from "react-icons/fa";
import { Button } from "shards-react";

function HomePage() {
  const [selectedWineId, setSelectedWineId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // 控制側邊欄狀態

  const handleWineSelect = (wineId) => {
    setSelectedWineId(wineId);
    setIsUploading(false);
  };

  const handleUploadSelect = () => {
    setIsUploading(true);
    setSelectedWineId(null);
  };

  const reloadWines = () => {
    setReload(!reload);
  };

  const handleDeleteSuccess = () => {
    setSelectedWineId(null);
    reloadWines();
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed); // 切換側邊欄收合狀態
  };

  return (
    <div style={styles.container}>
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
        reload={reload}
        isCollapsed={isSidebarCollapsed}
      />
      <div
        style={{
          ...styles.content,
          marginLeft: isSidebarCollapsed ? "0" : "300px", // 根據側邊欄狀態調整右側區域左邊界
        }}
      >
        <div style={styles.header}>
          {/* 漢堡選單按鈕，放在 header 左上角 */}
          <Button style={styles.toggleButton} onClick={toggleSidebar}>
            <FaBars />
          </Button>
          <h1>Dashboard</h1>
        </div>

        {/* 將 padding 應用到 header 下方的內容 */}
        <div style={styles.contentBody}>
          {isUploading ? (
            <WineUploadForm onUploadSuccess={reloadWines} />
          ) : selectedWineId ? (
            <WineDetails
              wineId={selectedWineId}
              onDeleteSuccess={handleDeleteSuccess}
              reloadWines={reloadWines}
            />
          ) : (
            <Card style={styles.welcomeCard}>
              <CardBody>
                <CardTitle>Welcome!</CardTitle>
                <p>選擇一支酒以查看詳細資訊</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
  },
  content: {
    flexGrow: 1,
    transition: "margin-left 0.3s ease",
    overflowY: "auto", // 啟用整個右側內容滾動
    height: "100vh", // 確保右側區域可以滾動
    backgroundColor: "#f8f9fa", // 統一背景色
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px", // 只保留 header 的內邊距
    backgroundColor: "#fff", // 確保 header 是白色背景
    borderBottom: "1px solid #ccc",
    height: "60px", // 設置 header 高度為 60px
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // 增加 header 的陰影效果
  },
  toggleButton: {
    fontSize: "1.5rem",
    padding: "5px 10px",
  },
  welcomeCard: {
    borderRadius: "8px", // 添加卡片的圓角
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // 增加卡片的陰影
  },
  contentBody: {
    padding: "20px", // 這裡設置內容部分的 padding，而不是 header
  },
};

export default HomePage;
