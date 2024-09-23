import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import WineDetails from "./components/WineDetails";
import WineUploadForm from "./components/WineUploadForm";

function App() {
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
    <div style={styles.container}>
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
        reload={reload}
      />
      <div style={styles.content}>
        {isUploading ? (
          <WineUploadForm onUploadSuccess={reloadWines} /> // 傳入上傳成功後的回調
        ) : selectedWineId ? (
          <WineDetails
            wineId={selectedWineId}
            onDeleteSuccess={handleDeleteSuccess} // 傳入刪除成功後的回調
            reloadWines={reloadWines} // 傳入重新加載函數
          />
        ) : (
          <div>選擇一支酒以查看詳細資訊</div> // 預設顯示提示
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
  },
  content: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#fafafa",
  },
};

export default App;
