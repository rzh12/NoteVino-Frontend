import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faPenToSquare, faPencil } from "@fortawesome/free-solid-svg-icons";
import "./WineDetails.css";

function WineDetails({ wineId, onDeleteSuccess, reloadWines }) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/250?text=No+Image";
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedWine, setUpdatedWine] = useState({});
  const [editNoteId, setEditNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  // 從 localStorage 中獲取 token
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (wineId) {
      axios
        .get(`/api/wines/${wineId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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
  }, [wineId, token]);

  // 提交新增筆記
  const handleSubmitNote = (e) => {
    e.preventDefault();

    // 構建與後端期望的 FreeFormNoteRequest 對應的數據
    const freeFormNoteRequest = {
      content: newNote,
    };

    axios
      .post(`/api/wines/${wineId}/notes`, freeFormNoteRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.success) {
          const newNoteFromServer = {
            noteId: response.data.data.noteId, // 獲取返回的 noteId
            content: newNote,
            createdAt: response.data.data.createdAt, // 使用返回的 createdAt
          };
          setIsAddingNote(false); // 關閉表單
          setNewNote(""); // 清空輸入框
          // 重新加載筆記
          setWine((prevWine) => ({
            ...prevWine,
            notes: [...prevWine.notes, newNoteFromServer],
          }));
        }
      })
      .catch((error) => {
        console.error("Error creating note:", error);
      });
  };

  // 提交修改葡萄酒資訊
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
      .put(
        `/api/wines/${wineId}?${queryParams}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          alert("更新成功");
          // 保留現有的筆記數據，避免更新時丟失
          setWine((prevWine) => ({
            ...updatedWine, // 更新葡萄酒的基本信息
            notes: prevWine.notes, // 保留原有的筆記數據
          }));
          setIsEditing(false); // 關閉編輯模式
          reloadWines();
        }
      })
      .catch((error) => {
        console.error("Error updating wine:", error);
      });
  };

  // 提交修改筆記
  const handleSaveNote = (noteId) => {
    axios
      .put(
        `/api/wines/${wineId}/notes/${noteId}`,
        { content: noteContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          setWine((prevWine) => ({
            ...prevWine,
            notes: prevWine.notes.map((note) =>
              note.noteId === noteId ? { ...note, content: noteContent } : note
            ),
          }));
          setEditNoteId(null); // 退出編輯模式
          setNoteContent(""); // 清空編輯框
        }
      })
      .catch((error) => {
        console.error("Error updating note:", error);
      });
  };

  // 刪除葡萄酒記錄
  const handleDelete = () => {
    if (window.confirm("確定要刪除此葡萄酒記錄？")) {
      axios
        .delete(`/api/wines/${wineId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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

  // 刪除筆記
  const handleDeleteNote = (noteId) => {
    if (window.confirm("確定要刪除此筆記？")) {
      axios
        .delete(`/api/wines/${wineId}/notes/${noteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 204) {
            // 刪除成功，從筆記列表中移除該筆記
            setWine((prevWine) => ({
              ...prevWine,
              notes: prevWine.notes.filter((note) => note.noteId !== noteId),
            }));
            setEditNoteId(null); // 退出編輯模式
          }
        })
        .catch((error) => {
          console.error("Error deleting note:", error);
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

  // 進入筆記編輯模式
  const handleEditNote = (noteId, content) => {
    setEditNoteId(noteId);
    setNoteContent(content);
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
            <div className="wine-details">
              <h2>{wine.name}</h2>
              <p>Region: {wine.region}</p>
              <p>Type: {wine.type}</p>
              <p>Vintage: {wine.vintage}</p>
            </div>
          )}
        </div>
        <div className="image-wrapper">
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
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>

        <button onClick={handleDelete} className="deleteButton">
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
      <div className="bottom-section">
        <h2>Tasting Notes</h2>
        <ul>
          {wine.notes && wine.notes.length > 0 ? (
            wine.notes.map((note) => (
              <li key={note.noteId} className="note-item">
                {editNoteId === note.noteId ? (
                  <div className="note-content">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="note-input"
                    />
                    <div className="button-container">
                      <button
                        onClick={() => handleDeleteNote(note.noteId)} // 調用刪除函數
                        className="note-deleteButton"
                      >
                        刪除
                      </button>
                      <button
                        onClick={() => handleSaveNote(note.noteId)} // 使用正確的 noteId 保存
                        className="saveButton"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="note-content">
                    <button
                      onClick={() => handleEditNote(note.noteId, note.content)} // 編輯時使用正確的 noteId
                      className="editIcon"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <p>{note.content}</p>
                  </div>
                )}
              </li>
            ))
          ) : (
            <ul>
              <span className="no-notes-tag">無品酒記錄</span>
            </ul>
          )}
        </ul>

        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className="addNoteButton"
        >
          + 新增筆記
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
