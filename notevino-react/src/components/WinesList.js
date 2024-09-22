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
        <ul>
          {wines.map((wine) => (
            <li
              key={wine.wineId}
              onClick={() => onWineSelect(wine.wineId)}
              className="wine-item"
            >
              <div>
                <p>{wine.name}</p>
                <p>
                  {wine.region} - {wine.type} - {wine.vintage}
                </p>
              </div>
            </li>
          ))}
          <li
            className="wine-item add-wine"
            onClick={onUploadSelect}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <p>+ Add a wine</p>
          </li>
        </ul>
      )}
    </div>
  );
}

export default WinesList;
