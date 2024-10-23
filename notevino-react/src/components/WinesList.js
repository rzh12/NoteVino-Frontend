import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./WinesList.css";

function WinesList({ onWineSelect, reload }) {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (isFirstLoad.current) {
      setLoading(true);
    }

    axios
      .get("/api/wines/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setWines(response.data.data);
        }
        setLoading(false);
        isFirstLoad.current = false;
      })
      .catch((error) => {
        setLoading(false);
        isFirstLoad.current = false;
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
      <div
        className={`wines-list-container ${
          !loading ? "wines-list-container-visible" : ""
        }`}
      >
        {loading && isFirstLoad.current ? (
          <p
            className={`loading-text ${!loading ? "loading-text-visible" : ""}`}
          >
            載入中...
          </p>
        ) : wines.length === 0 ? (
          <h5 className={`no-wines ${!loading ? "no-wines-visible" : ""}`}>
            目前沒有任何酒款
          </h5>
        ) : (
          wines.map((wine) => (
            <div
              key={wine.wineId}
              onClick={() => onWineSelect(wine.wineId)}
              className="wine-list-item"
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
