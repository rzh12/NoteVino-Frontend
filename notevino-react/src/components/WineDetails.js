import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WineDetails.css";

function WineDetails({ wineId, onDeleteSuccess, reloadWines }) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/200?text=No+Image";
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedWine, setUpdatedWine] = useState({});

  useEffect(() => {
    if (wineId) {
      axios
        .get(`/api/wines/${wineId}`)
        .then((response) => {
          if (response.data.success) {
            setWine(response.data.data);
            setUpdatedWine(response.data.data);
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

  // 提交修改
  const handleSave = () => {
    const updatedInfo = {
      name: updatedWine.name,
      region: updatedWine.region,
      type: updatedWine.type,
      vintage: updatedWine.vintage,
    };

    // 將 updatedInfo 轉換為 JSON 字串，並附加到 URL 的查詢參數
    const queryParams = new URLSearchParams({
      info: JSON.stringify(updatedInfo),
    }).toString();

    axios
      .put(`/api/wines/${wineId}?${queryParams}`)
      .then((response) => {
        if (response.data.success) {
          alert("更新成功");
          setWine(updatedWine); // 更新顯示的數據
          setIsEditing(false); // 關閉編輯模式
          reloadWines();
        }
      })
      .catch((error) => {
        console.error("Error updating wine:", error);
      });
  };

  // 刪除葡萄酒記錄
  const handleDelete = () => {
    if (window.confirm("確定要刪除此葡萄酒記錄？")) {
      axios
        .delete(`/api/wines/${wineId}`)
        .then((response) => {
          if (response.status === 204) {
            // 確認成功回應是 204
            onDeleteSuccess(); // 刪除成功後回調，清空詳細頁
            reloadWines(); // 刪除成功後重新加載列表
          }
        })
        .catch((error) => {
          console.error("Error deleting wine:", error);
        });
    }
  };

  // 處理表單變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedWine({
      ...updatedWine,
      [name]: value,
    });
  };

  if (!wine) {
    return null; // 在 wine 資料還未載入時，返回 null
  }

  return (
    <div className="container">
      <div className="header">
        <div className="details">
          {isEditing ? (
            <>
              <div className="detail-item">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={updatedWine.name}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="detail-item">
                <label htmlFor="region">Region:</label>
                <input
                  type="text"
                  name="region"
                  value={updatedWine.region}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="detail-item">
                <label htmlFor="type">Type:</label>
                <select
                  name="type"
                  value={updatedWine.type}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="Red">Red</option>
                  <option value="White">White</option>
                  <option value="Sparkling">Sparkling</option>
                  <option value="Rose">Rose</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Fortified">Fortified</option>
                </select>
              </div>
              <div className="detail-item">
                <label htmlFor="vintage">Vintage:</label>
                <input
                  type="number"
                  name="vintage"
                  value={updatedWine.vintage}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <button onClick={handleSave} className="saveButton">
                儲存
              </button>
            </>
          ) : (
            <>
              <h2>Name: {wine.name}</h2>
              <p>Region: {wine.region}</p>
              <p>Type: {wine.type}</p>
              <p>Vintage: {wine.vintage}</p>
            </>
          )}
        </div>
        <div class="image-wrapper">
          <img
            src={wine.imageUrl || placeholderImage}
            alt={wine.name}
            className="image"
            onError={(e) => {
              e.target.src = placeholderImage;
            }} // 圖片加載失敗時替換成預設圖片
          />
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="gearButton">
          ⚙️
        </button>

        <button onClick={handleDelete} className="deleteButton">
          🗑️
        </button>
      </div>
      <div className="bottom-section">
        <h3>Tasting Notes</h3>
        <ul>
          {wine.notes && wine.notes.length > 0 ? (
            wine.notes.map((note, index) => (
              <li key={note.noteId}>
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
    </div>
  );
}

export default WineDetails;
