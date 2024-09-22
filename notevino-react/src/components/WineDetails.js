import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WineDetails.css";

function WineDetails({ wineId }) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/200?text=No+Image";
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

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

  // 提交新增筆記
  const handleSubmitNote = (e) => {
    e.preventDefault();

    axios
      .post(`/api/wines/${wineId}/notes`, {
        content: newNote,
      })
      .then((response) => {
        if (response.data.success) {
          setIsAddingNote(false); // 關閉表單
          setNewNote(""); // 清空輸入框
          // 重新加載筆記
          setWine((prevWine) => ({
            ...prevWine,
            notes: [
              ...prevWine.notes,
              { content: newNote, createdAt: new Date().toISOString() },
            ],
          }));
        }
      })
      .catch((error) => {
        console.error("Error creating note:", error);
      });
  };

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
        {wine.notes && wine.notes.length > 0 ? (
          wine.notes.map((note, index) => (
            <li key={index}>
              {note.content} - {new Date(note.createdAt).toLocaleDateString()}
            </li>
          ))
        ) : (
          <li>無品酒記錄</li>
        )}
      </ul>

      <button onClick={() => setIsAddingNote(true)} className="addNoteButton">
        + 添加筆記
      </button>

      {isAddingNote && (
        <form onSubmit={handleSubmitNote} className="form">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="輸入您的品酒筆記"
            required
            className="textarea"
          />
          <button type="submit" className="submitButton">
            提交筆記
          </button>
        </form>
      )}
    </div>
  );
}

export default WineDetails;
