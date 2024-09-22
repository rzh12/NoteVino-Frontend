import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WineDetails.css";

function WineDetails({ wineId }) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/200?text=No+Image";

  useEffect(() => {
    if (wineId) {
      axios
        .get(`/api/wines/${wineId}`)
        .then((response) => {
          if (response.data.success) {
            setWine(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching wine details:", error);
        });
    }
  }, [wineId]);

  if (!wine) {
    return null; // 在 wine 資料還未載入時，返回 null
  }

  return (
    <div className="container">
      <div className="header">
        <div className="details">
          <h2>{wine.name}</h2>
          <p>Region: {wine.region}</p>
          <p>Type: {wine.type}</p>
          <p>Vintage: {wine.vintage}</p>
        </div>
        <img
          src={wine.imageUrl || placeholderImage}
          alt={wine.name}
          className="image"
          onError={(e) => {
            e.target.src = placeholderImage;
          }} // 圖片加載失敗時替換成預設圖片
        />
      </div>
      <h3>Tasting Notes</h3>
      <ul>
        {wine.notes.map((note, index) => (
          <li key={index}>
            {note.content} - {new Date(note.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WineDetails;
