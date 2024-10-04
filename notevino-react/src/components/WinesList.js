import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./WinesList.css";

function WinesList({ onWineSelect, reload }) {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true); // 使用 useRef 替代 state

  useEffect(() => {
    // 從 localStorage 中獲取 JWT token
    const token = localStorage.getItem("token");

    if (isFirstLoad.current) {
      setLoading(true); // 只在第一次加載時顯示 loading
    }

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
        isFirstLoad.current = false; // 第一次加載完成後將標記設為 false
      })
      .catch((error) => {
        setLoading(false); // 無論發生什麼錯誤，都結束 loading
        isFirstLoad.current = false; // 第一次加載完成後將標記設為 false
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
      <h5 className="wine-list-title">您的葡萄酒清單</h5>
      <div className="wine-list">
        {/* 顯示載入中的狀態，只在第一次加載時顯示 */}
        {loading && isFirstLoad.current ? (
          <p className="loading">載入中...</p>
        ) : wines.length === 0 ? (
          <h5 className="no-wines">目前沒有任何酒款。</h5> // 當沒有酒款時顯示
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
      </div>
    </div>
  );
}

export default WinesList;
