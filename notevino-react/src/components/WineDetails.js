import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, CardBody, CardTitle } from "shards-react";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import "./WineDetails.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // 引入Quill的樣式

function WineDetails({
  wineId,
  onDeleteSuccess,
  reloadWines,
  isEditing,
  handleSave,
}) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/250?text=No+Image";
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
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

  // 提交修改葡萄酒資訊
  const saveUpdatedWine = () => {
    handleSave(updatedWine); // 調用傳遞進來的 handleSave 函數保存修改

    // 保留現有的筆記，避免更新時丟失筆記
    setWine((prevWine) => ({
      ...updatedWine, // 更新葡萄酒的基本信息
      notes: prevWine.notes, // 保留原有的筆記數據
    }));
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
    <div className="wine-details-container">
      <Card className="wine-details-card">
        <div className="wine-details-header">
          <div className="wine-details-content">
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
                <Button onClick={saveUpdatedWine} className="save-button">
                  儲存
                </Button>
              </>
            ) : (
              <>
                <CardTitle>{wine.name}</CardTitle>
                <p>Region: {wine.region}</p>
                <p>Type: {wine.type}</p>
                <p>Vintage: {wine.vintage}</p>
              </>
            )}
          </div>
          <div className="wine-image-container">
            <img
              src={wine.imageUrl || placeholderImage}
              alt={wine.name}
              className="wine-image"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tasting Notes Section */}
      <Card className="notes-card">
        <CardBody>
          <h2>Tasting Notes</h2>
          <ul>
            {wine.notes && wine.notes.length > 0 ? (
              wine.notes.map((note) => (
                <li key={note.noteId} className="note-item">
                  {editNoteId === note.noteId ? (
                    <>
                      <ReactQuill
                        value={noteContent}
                        onChange={setNoteContent}
                        className="note-input"
                      />
                      <Button
                        onClick={() => handleSaveNote(note.noteId)}
                        className="save-button"
                      >
                        保存
                      </Button>
                      <Button
                        onClick={() => handleDeleteNote(note.noteId)}
                        className="delete-button"
                      >
                        刪除
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Display note content */}
                      <div className="note-content">
                        <Button
                          theme="none"
                          className="editIcon"
                          onClick={() =>
                            handleEditNote(note.noteId, note.content)
                          }
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </Button>
                        <p
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        ></p>
                      </div>
                    </>
                  )}
                </li>
              ))
            ) : (
              <span className="no-notes-tag">無品酒記錄</span>
            )}
          </ul>

          {/* New note section */}
          {/* 新增筆記 */}
          {isAddingNote ? (
            <form onSubmit={handleSubmitNote} className="form">
              <ReactQuill
                value={newNote}
                onChange={setNewNote}
                placeholder="輸入您的品酒筆記"
                required
                className="note-editor"
              />
              <Button type="submit" className="submitButton">
                提交筆記
              </Button>
            </form>
          ) : (
            <Button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="addNoteButton"
            >
              + 新增筆記
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default WineDetails;
