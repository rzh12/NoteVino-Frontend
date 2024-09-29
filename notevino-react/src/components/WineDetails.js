import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faPenToSquare, faPencil } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardTitle } from "shards-react";
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

  // // 處理表單變更
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setUpdatedWine({
  //     ...updatedWine,
  //     [name]: value,
  //   });
  // };

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
      <Card>
        <div className="wine-details-header">
          <div className="wine-details-title">
            {isEditing ? (
              <>
                <div className="detail-item">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedWine.name}
                    onChange={(e) =>
                      setUpdatedWine({ ...updatedWine, name: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div className="detail-item">
                  <label htmlFor="region">Region:</label>
                  <input
                    type="text"
                    name="region"
                    value={updatedWine.region}
                    onChange={(e) =>
                      setUpdatedWine({ ...updatedWine, region: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <Button onClick={handleSave} className="save-button">
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
          <div className="wine-details-controls">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="edit-button"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
            <Button onClick={handleDelete} className="delete-button">
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </div>
        </div>
        <CardBody>
          <img
            src={wine.imageUrl || placeholderImage}
            alt={wine.name}
            className="wine-image"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </CardBody>
      </Card>

      {/* Tasting Notes Section */}
      <div className="bottom-section">
        <h2>Tasting Notes</h2>
        <ul>
          {wine.notes && wine.notes.length > 0 ? (
            wine.notes.map((note) => (
              <li key={note.noteId} className="note-item">
                {editNoteId === note.noteId ? (
                  <>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
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
                  <div className="note-content">
                    <Button
                      onClick={() => handleEditNote(note.noteId, note.content)}
                      className="editIcon"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </Button>
                    <p>{note.content}</p>
                  </div>
                )}
              </li>
            ))
          ) : (
            <span className="no-notes-tag">無品酒記錄</span>
          )}
        </ul>

        {/* 新增筆記 */}
        {isAddingNote ? (
          <form onSubmit={handleSubmitNote} className="form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="輸入您的品酒筆記"
              required
              className="textarea"
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
      </div>
    </div>
  );
}

export default WineDetails;
