import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WinesList.css";

function WinesList({ onWineSelect, onUploadSelect, reload }) {
  const [wines, setWines] = useState([]);

  useEffect(() => {
    axios
      .get("/api/wines/list")
      .then((response) => {
        if (response.data.success) {
          setWines(response.data.data); // 提取 data 來顯示
        }
      })
      .catch((error) => {
        console.error("Error fetching wines list:", error);
      });
  }, [reload]);

  return (
    <div>
      <h3>Wines List</h3>
      {wines.length === 0 ? (
        <p>載入中...</p>
      ) : (
        <div className="wine-list">
          {wines.map((wine) => (
            <div
              key={wine.wineId}
              onClick={() => onWineSelect(wine.wineId)}
              className="wine-item"
            >
              {wine.name}
            </div>
          ))}
          <div
            className="wine-item add-wine"
            onClick={onUploadSelect}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <p>+ 新增葡萄酒</p> {/* 顯示 + 按鈕 */}
          </div>
        </div>
      )}
    </div>
  );
}

export default WinesList;
