import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WinesList.css";

function WinesList({ onWineSelect, onUploadSelect, reload }) {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 從 localStorage 中獲取 JWT token
    const token = localStorage.getItem("token");

    setLoading(true); // 開始加載資料
    axios
      .get("/api/wines/list", {
        headers: {
          Authorization: `Bearer ${token}`, // 添加 Authorization header
        },
      })
      .then((response) => {
        if (response.data.success) {
          setWines(response.data.data); // 提取 data 來顯示
        }
        setLoading(false); // 資料加載完成
      })
      .catch((error) => {
        setLoading(false); // 無論發生什麼錯誤，都結束 loading
        if (error.response) {
          console.error("Response error:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      });
  }, [reload]);

  return (
    <div>
      <h3>Wines List</h3>
      <div className="wine-list">
        {/* 顯示載入中的狀態 */}
        {loading ? (
          <p>載入中...</p>
        ) : wines.length === 0 ? (
          <p>目前沒有任何酒款。</p> // 當沒有酒款時顯示
        ) : (
          wines.map((wine) => (
            <div
              key={wine.wineId}
              onClick={() => onWineSelect(wine.wineId)}
              className="wine-item"
            >
              {wine.name}
            </div>
          ))
        )}
        {/* 新增葡萄酒的按鈕，無論有沒有酒款，這個按鈕都會顯示 */}
        <div
          className="wine-item add-wine"
          onClick={onUploadSelect}
          style={{ textAlign: "center", cursor: "pointer" }}
        >
          <p>+ 新增葡萄酒</p> {/* 顯示 + 按鈕 */}
        </div>
      </div>
    </div>
  );
}

export default WinesList;
