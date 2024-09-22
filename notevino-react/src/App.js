import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import WineDetails from "./components/WineDetails";
import WineUploadForm from "./components/WineUploadForm";

function App() {
  const [selectedWineId, setSelectedWineId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <div style={styles.container}>
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
      />
      <div style={styles.content}>
        {/* 如果是上傳狀態，顯示上傳表單 */}
        {isUploading ? (
          <WineUploadForm />
        ) : selectedWineId ? (
          <WineDetails wineId={selectedWineId} />
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
