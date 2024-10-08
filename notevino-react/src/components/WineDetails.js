import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, CardBody, CardTitle } from "shards-react";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import {
  faPenToSquare,
  faWandMagicSparkles,
  faEllipsis,
  faArrowDownWideShort,
  faArrowUpWideShort,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "./WineDetails.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ReactMarkdown from "react-markdown";
import Swal from "sweetalert2";

function WineDetails({
  wineId,
  onDeleteSuccess,
  reloadWines,
  isAddingNote,
  setIsAddingNote,
  newNote,
  setNewNote,
}) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/250?text=No+Image";
  const [updatedWine, setUpdatedWine] = useState({});
  const [editNoteId, setEditNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tastingNote, setTastingNote] = useState("");
  const [satNote, setSatNote] = useState(null);
  const [isEditingSatNote, setIsEditingSatNote] = useState(false);
  const [isCreatingSatNote, setIsCreatingSatNote] = useState(false);
  const [editedSatNote, setEditedSatNote] = useState(null);
  const [errors, setErrors] = useState({});
  const [isAscending, setIsAscending] = useState(false);

  // 從 localStorage 中獲取 token
  const token = localStorage.getItem("token");

  const fetchSatNote = useCallback(() => {
    axios
      .get(`/api/wines/${wineId}/sat-note`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setSatNote(response.data.data);
          setIsCreatingSatNote(false);
        } else {
          setSatNote(null);
          setIsCreatingSatNote(true);
        }
        setIsEditingSatNote(false);
      })
      .catch((error) => {
        console.error("Error fetching SAT note:", error);
        setSatNote(null);
        setIsCreatingSatNote(true);
        setIsEditingSatNote(false);
      });
  }, [wineId, token]);

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
            const sortedNotes = response.data.data.notes
              ? response.data.data.notes
                  .slice()
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              : [];

            const updatedWineData = {
              ...response.data.data,
              notes: sortedNotes,
            };

            setWine(updatedWineData);
            setUpdatedWine(updatedWineData);
          }
        })
        .catch((error) => {
          console.error("Error fetching wine details:", error);
        });

      fetchSatNote();
    }
  }, [wineId, token, fetchSatNote]);

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
            // 刪除成功，調用父組件的回調
            onDeleteSuccess();
          }
        })
        .catch((error) => {
          console.error("Error deleting wine:", error);
        });
    }
  };

  const handleSave = () => {
    const updatedInfo = {
      name: updatedWine.name,
      region: updatedWine.region,
      type: updatedWine.type,
      vintage: updatedWine.vintage,
    };

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
          reloadWines();
          setIsEditing(false);
        }
      })
      .catch((error) => {
        console.error("Error updating wine:", error);
      });
  };

  const generateTastingNote = async () => {
    try {
      // 顯示 Loading alert
      Swal.fire({
        title: "Generating Tasting Note...",
        text: "請稍待片刻！😉",
        toast: true,
        position: "top-end",
        allowOutsideClick: true, // 允許點擊其他地方繼續操作
        allowEscapeKey: true, // 允許按下ESC繼續操作
        showConfirmButton: false, // 隱藏確認按鈕
        didOpen: () => {
          Swal.showLoading(); // 顯示 loading 指示器
        },
      });
      const response = await axios.get("/api/wines/generate-tasting-note", {
        headers: {
          wineId: wineId,
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        const generatedNote = responseData.choices[0].message.content;
        setTastingNote(generatedNote);

        Swal.fire({
          icon: "success",
          title: "Tasting Note Generated!",
          text: "品飲筆記生成成功！🍷",
          showConfirmButton: true,
        });
      } else {
        setTastingNote("No Tasting Note available.");
        Swal.fire({
          icon: "error",
          title: "Failed to Generate",
          text: "No Tasting Note available.",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error generating tasting note:", error);
      setTastingNote("Failed to generate Tasting Note.");

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate Tasting Note. Please try again.",
        showConfirmButton: true,
      });
    }
  };

  // 提交新增筆記
  const handleSubmitNote = (e) => {
    e.preventDefault();

    // 移除 HTML 標籤並檢查內容是否為空
    const strippedContent = newNote.replace(/<[^>]+>/g, "").trim();
    if (!strippedContent) {
      alert("筆記內容不能為空白");
      return;
    }

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
            noteId: response.data.data.noteId,
            content: newNote,
            createdAt: response.data.data.createdAt,
            updatedAt: response.data.data.updatedAt,
          };
          setIsAddingNote(false);
          setNewNote("");

          setWine((prevWine) => {
            const updatedNotes = [...prevWine.notes, newNoteFromServer];
            const sortedNotes = updatedNotes
              .slice()
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // 倒序排序
            return { ...prevWine, notes: sortedNotes };
          });
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
          const updatedAt = response.data.data;
          setWine((prevWine) => {
            const updatedNotes = prevWine.notes.map((note) =>
              note.noteId === noteId
                ? { ...note, content: noteContent, updatedAt }
                : note
            );
            const sortedNotes = updatedNotes
              .slice()
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // 倒序排序
            return { ...prevWine, notes: sortedNotes };
          });
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

  // 保存或更新 SAT Note
  const handleSaveSatNote = () => {
    // 定義所有必填欄位
    const requiredFields = [
      "sweetness",
      "acidity",
      "tannin",
      "alcohol",
      "body",
      "flavourIntensity",
      "finish",
      "quality",
      "potentialForAgeing",
    ];

    // 檢查未填寫的欄位
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!editedSatNote || !editedSatNote[field]) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("請填寫所有必填欄位");
      return;
    } else {
      setErrors({});
    }

    const url = `/api/wines/${wineId}/sat-note`;
    const method = isCreatingSatNote ? "post" : "put";

    axios({
      method: method,
      url: url,
      data: editedSatNote,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.data.success) {
          setIsEditingSatNote(false);
          alert("SAT Note saved successfully!");
          // 重新獲取最新的 SAT 筆記
          fetchSatNote();
          setIsCreatingSatNote(false);
          setEditedSatNote(null);
        }
      })
      .catch((error) => {
        console.error("Error saving SAT note:", error);
        alert("Failed to save SAT Note.");
      });
  };

  const handleSatNoteChange = (e) => {
    const { name, value } = e.target;
    setEditedSatNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));

    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: false,
      }));
    }
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  return (
    <div className="wine-details-container">
      <Card className="wine-details-card">
        <CardBody>
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
                  <Button
                    onClick={saveUpdatedWine}
                    className="wine-save-button"
                  >
                    儲存
                  </Button>
                </>
              ) : (
                <>
                  <div className="wine-info-container">
                    <CardTitle className="wine-info-title">
                      {wine.name}
                    </CardTitle>
                    <p className="wine-info">
                      <span className="wine-info-label">Region</span>
                      <span className="wine-info-text">{wine.region}</span>
                    </p>
                    <p className="wine-info">
                      <span className="wine-info-label">Type</span>
                      <span className="wine-info-text">{wine.type}</span>
                    </p>
                    <p className="wine-info">
                      <span className="wine-info-label">Vintage</span>
                      <span className="wine-info-text">{wine.vintage}</span>
                    </p>
                  </div>
                </>
              )}
              <p className="wine-info time">
                <span className="wine-info-label time">Created At:</span>
                <span className="wine-info-text time">
                  {new Date(wine.createdAt).toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}{" "}
                  &nbsp;
                  {new Date(wine.createdAt).toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24 小时制
                  })}
                </span>
              </p>
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
            <div className="image-action-buttons">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="wine-edit-Button"
              >
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  style={{ fontSize: "24px" }}
                />
              </Button>
              <Button onClick={handleDelete} className="wine-delete-Button">
                <FontAwesomeIcon
                  icon={faTrashCan}
                  style={{ fontSize: "24px" }}
                />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tasting Notes Section */}
      <div className="notes-container">
        <div className="note-section tasting-notes">
          <Card className="notes-card">
            <CardBody>
              <div className="tasting-note-header">
                <h2>Tasting Notes</h2>
                <Button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="add-note-button"
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    style={{ marginRight: "5px" }}
                  />
                  Add Note
                </Button>
                <Button onClick={toggleSortOrder} className="sort-order-button">
                  <FontAwesomeIcon
                    icon={
                      isAscending ? faArrowDownWideShort : faArrowUpWideShort
                    }
                    style={{ fontSize: "24px" }}
                  />
                </Button>
                <Button
                  onClick={generateTastingNote}
                  className="note-gen-Button"
                >
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    style={{ fontSize: "24px" }}
                  />
                </Button>
              </div>
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
                  <div className="note-buttons">
                    <Button type="submit" className="submit-note-button">
                      提交筆記
                    </Button>
                    {/* <Button
                      type="button"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote("");
                      }}
                      className="cancel-note-button"
                    >
                      取消
                    </Button> */}
                  </div>
                </form>
              ) : null}
              <ul>
                {wine.notes && wine.notes.length > 0 ? (
                  wine.notes
                    .slice()
                    .sort(
                      (a, b) =>
                        isAscending
                          ? new Date(a.updatedAt) - new Date(b.updatedAt) // 正序
                          : new Date(b.updatedAt) - new Date(a.updatedAt) // 倒序
                    )
                    .map((note) => (
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
                              className="note-save-button"
                            >
                              保存
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.noteId)}
                              className="note-delete-button"
                            >
                              刪除
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Display note content */}
                            <div className="note-content">
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: note.content,
                                }}
                              ></p>
                              {/* Display updatedAt */}
                              <p className="note-updatedAt">
                                updated at:{" "}
                                {new Date(note.updatedAt).toLocaleString(
                                  "zh-TW",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false, // 24 小時制
                                  }
                                )}
                              </p>
                              <Button
                                theme="none"
                                className="note-edit-icon"
                                onClick={() =>
                                  handleEditNote(note.noteId, note.content)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faEllipsis}
                                  style={{ fontSize: "24px" }}
                                />
                              </Button>
                            </div>
                          </>
                        )}
                      </li>
                    ))
                ) : (
                  <span className="no-notes-tag">無品酒記錄</span>
                )}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* SAT Note Section */}
        <div className="note-section sat-notes">
          <Card className="sat-note-card">
            <CardBody>
              <div className="sat-note-header">
                <h2>SAT</h2>
              </div>
              {isEditingSatNote ? (
                <div className="sat-note-form">
                  <div className="sat-note-item">
                    <label htmlFor="sweetness">Sweetness:</label>
                    <select
                      name="sweetness"
                      value={editedSatNote?.sweetness || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${
                        errors.sweetness ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select Sweetness</option>
                      <option value="dry">dry</option>
                      <option value="off-dry">off-dry</option>
                      <option value="medium-dry">medium-dry</option>
                      <option value="medium-sweet">medium-sweet</option>
                      <option value="sweet">sweet</option>
                      <option value="luscious">luscious</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="acidity">Acidity:</label>
                    <select
                      name="acidity"
                      value={editedSatNote?.acidity || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.acidity ? "input-error" : ""}`}
                    >
                      <option value="">Select Acidity</option>
                      <option value="low">low</option>
                      <option value="medium-minus">medium-minus</option>
                      <option value="medium">medium</option>
                      <option value="medium-plus">medium-plus</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="tannin">Tannin:</label>
                    <select
                      name="tannin"
                      value={editedSatNote?.tannin || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.tannin ? "input-error" : ""}`}
                    >
                      <option value="">Select Tannin</option>
                      <option value="none">none</option>
                      <option value="low">low</option>
                      <option value="medium-minus">medium-minus</option>
                      <option value="medium">medium</option>
                      <option value="medium-plus">medium-plus</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="alcohol">Alcohol:</label>
                    <select
                      name="alcohol"
                      value={editedSatNote?.alcohol || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.alcohol ? "input-error" : ""}`}
                    >
                      <option value="">Select Alcohol</option>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="body">Body:</label>
                    <select
                      name="body"
                      value={editedSatNote?.body || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.body ? "input-error" : ""}`}
                    >
                      <option value="">Select Body</option>
                      <option value="light">light</option>
                      <option value="medium-minus">medium-minus</option>
                      <option value="medium">medium</option>
                      <option value="medium-plus">medium-plus</option>
                      <option value="full">full</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="flavourIntensity">Flavour Intensity:</label>
                    <select
                      name="flavourIntensity"
                      value={editedSatNote?.flavourIntensity || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${
                        errors.flavourIntensity ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select Flavour Intensity</option>
                      <option value="light">light</option>
                      <option value="medium-minus">medium-minus</option>
                      <option value="medium">medium</option>
                      <option value="medium-plus">medium-plus</option>
                      <option value="pronounced">pronounced</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="finish">Finish:</label>
                    <select
                      name="finish"
                      value={editedSatNote?.finish || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.finish ? "input-error" : ""}`}
                    >
                      <option value="">Select Finish</option>
                      <option value="short">short</option>
                      <option value="medium-minus">medium-minus</option>
                      <option value="medium">medium</option>
                      <option value="medium-plus">medium-plus</option>
                      <option value="long">long</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="quality">Quality:</label>
                    <select
                      name="quality"
                      value={editedSatNote?.quality || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${errors.quality ? "input-error" : ""}`}
                    >
                      <option value="">Select Quality</option>
                      <option value="faulty">faulty</option>
                      <option value="poor">poor</option>
                      <option value="acceptable">acceptable</option>
                      <option value="good">good</option>
                      <option value="very good">very good</option>
                      <option value="outstanding">outstanding</option>
                    </select>
                  </div>
                  <div className="sat-note-item">
                    <label htmlFor="potentialForAgeing">
                      Potential for Ageing:
                    </label>
                    <select
                      name="potentialForAgeing"
                      value={editedSatNote?.potentialForAgeing || ""}
                      onChange={handleSatNoteChange}
                      className={`input ${
                        errors.potentialForAgeing ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select Potential for Ageing</option>
                      <option value="too young">too young</option>
                      <option value="has potential for ageing">
                        has potential for ageing
                      </option>
                      <option value="not suitable for ageing">
                        not suitable for ageing
                      </option>
                      <option value="too old">too old</option>
                    </select>
                  </div>
                  <div className="sat-note-edit-buttons">
                    <Button
                      onClick={handleSaveSatNote}
                      className="sat-save-button"
                    >
                      保存
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingSatNote(false);
                        setEditedSatNote(null); // 丟棄更改
                        if (isCreatingSatNote) {
                          setSatNote(null);
                          setIsCreatingSatNote(false);
                        }
                      }}
                      className="sat-cancel-button"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : satNote ? (
                <div className="sat-note-display">
                  <table className="sat-note-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Sweetness</strong>
                        </td>
                        <td>{satNote.sweetness}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Acidity</strong>
                        </td>
                        <td>{satNote.acidity}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Tannin</strong>
                        </td>
                        <td>{satNote.tannin}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Alcohol</strong>
                        </td>
                        <td>{satNote.alcohol}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Body</strong>
                        </td>
                        <td>{satNote.body}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Flavour Intensity</strong>
                        </td>
                        <td>{satNote.flavourIntensity}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Finish</strong>
                        </td>
                        <td>{satNote.finish}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Quality</strong>
                        </td>
                        <td>{satNote.quality}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Potential for Ageing</strong>
                        </td>
                        <td>{satNote.potentialForAgeing}</td>
                      </tr>
                    </tbody>
                  </table>
                  <Button
                    onClick={() => {
                      setEditedSatNote({ ...satNote });
                      setIsEditingSatNote(true);
                      setIsCreatingSatNote(false); // 進入更新模式
                    }}
                    className="sat-edit-button"
                  >
                    編輯
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="no-sat-tag">尚未新增 SAT 筆記。</p>
                  <Button
                    onClick={() => {
                      setEditedSatNote({});
                      setIsEditingSatNote(true);
                      setIsCreatingSatNote(true);
                    }}
                    className="sat-add-button"
                  >
                    新增 SAT 筆記
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {tastingNote && (
        <Card className="tasting-note-card">
          <CardBody>
            <CardTitle>品飲筆記範例</CardTitle>
            <ReactMarkdown>{tastingNote}</ReactMarkdown>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default WineDetails;
