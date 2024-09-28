import React, { useState } from "react";
import "./HomePage.css";
import Sidebar from "../components/Sidebar";
import WineDetails from "../components/WineDetails";
import WineUploadForm from "../components/WineUploadForm";

function HomePage() {
  const [selectedWineId, setSelectedWineId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reload, setReload] = useState(false);

  // 點擊某一支酒時，顯示詳細資訊，隱藏上傳表單
  const handleWineSelect = (wineId) => {
    setSelectedWineId(wineId);
    setIsUploading(false); // 關閉上傳表單
  };

  // 點擊 + 按鈕時，顯示上傳表單
  const handleUploadSelect = () => {
    setIsUploading(true); // 顯示上傳表單
    setSelectedWineId(null); // 不顯示任何酒的詳細資訊
  };

  // 觸發重新加載列表
  const reloadWines = () => {
    setReload(!reload); // 改變 reload 來觸發 WinesList 重新加載
  };

  // 刪除成功後的回調，清除選中的 wine
  const handleDeleteSuccess = () => {
    setSelectedWineId(null); // 清空詳細頁，回到「選擇一支酒」
    reloadWines(); // 重新加載列表
  };

  return (
    <div className="home-container">
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
        reload={reload}
      />
      <div className="home-content">
        {isUploading ? (
          <WineUploadForm onUploadSuccess={reloadWines} />
        ) : selectedWineId ? (
          <WineDetails
            wineId={selectedWineId}
            onDeleteSuccess={handleDeleteSuccess}
            reloadWines={reloadWines}
          />
        ) : (
          <div className="home-placeholder-wrapper">
            <div className="home-placeholder-text">
              <p>Welcome!</p>
              <p>選擇一支酒以查看詳細資訊</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
