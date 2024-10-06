import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, CardBody, CardTitle } from "shards-react";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import {
  faPenToSquare,
  faWandMagicSparkles,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import "./WineDetails.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ReactMarkdown from "react-markdown";

function WineDetails({ wineId, onDeleteSuccess, reloadWines }) {
  const [wine, setWine] = useState(null);
  const placeholderImage = "https://via.placeholder.com/250?text=No+Image";
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [updatedWine, setUpdatedWine] = useState({});
  const [editNoteId, setEditNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tastingNote, setTastingNote] = useState("");
  const [satNote, setSatNote] = useState(null);
  const [isEditingSatNote, setIsEditingSatNote] = useState(false);
  const [isCreatingSatNote, setIsCreatingSatNote] = useState(false);

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

      const fetchSatNote = () => {
        axios
          .get(`/api/wines/${wineId}/sat-note`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            if (response.data.success) {
              setSatNote(response.data.data);
              setIsCreatingSatNote(false); // SAT Note 已存在
            } else {
              setSatNote(null);
              setIsCreatingSatNote(true); // SAT Note 不存在
            }
          })
          .catch((error) => {
            console.error("Error fetching SAT note:", error);
            setSatNote(null);
            setIsCreatingSatNote(true);
          });
      };

      fetchSatNote();
    }
  }, [wineId, token]);

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
      const response = await axios.get("/api/wines/generate-tasting-note", {
        headers: {
          wineId: wineId,
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        const generatedNote = responseData.choices[0].message.content;
        setTastingNote(generatedNote);
      } else {
        setTastingNote("No Tasting Note available.");
      }
    } catch (error) {
      console.error("Error generating tasting note:", error);
      setTastingNote("Failed to generate Tasting Note.");
    }
  };

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

  // 保存或更新 SAT Note
  const handleSaveSatNote = () => {
    const url = `/api/wines/${wineId}/sat-note`;
    const method = isCreatingSatNote ? "post" : "put";

    axios({
      method: method,
      url: url,
      data: satNote,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.data.success) {
          setIsEditingSatNote(false); // 退出编辑模式
          alert("SAT Note saved successfully!");

          // 保存成功后，获取最新的 SAT Note
          axios
            .get(`/api/wines/${wineId}/sat-note`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              if (response.data.success) {
                setSatNote(response.data.data);
                setIsCreatingSatNote(false); // SAT Note 已存在
              } else {
                setSatNote(null);
                setIsCreatingSatNote(true); // SAT Note 不存在
              }
            })
            .catch((error) => {
              console.error("Error fetching SAT note after saving:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error saving SAT note:", error);
        alert("Failed to save SAT Note.");
      });
  };

  const handleSatNoteChange = (e) => {
    const { name, value } = e.target;
    setSatNote((prevSatNote) => ({
      ...prevSatNote,
      [name]: value,
    }));
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
                  <Button onClick={saveUpdatedWine} className="save-button">
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
                  onClick={generateTastingNote}
                  className="note-gen-Button"
                >
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    style={{ fontSize: "24px" }}
                  />
                </Button>
              </div>
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
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            ></p>
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

        {/* SAT Note Section */}
        <div className="note-section sat-notes">
          <Card className="sat-note-card">
            <CardBody>
              <h2>SAT Note</h2>
              {isEditingSatNote ? (
                <div className="sat-note-form">
                  <div className="sat-note-item">
                    <label htmlFor="sweetness">Sweetness:</label>
                    <select
                      name="sweetness"
                      value={satNote?.sweetness || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.acidity || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.tannin || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.alcohol || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.body || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.flavourIntensity || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.finish || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.quality || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      value={satNote?.potentialForAgeing || ""}
                      onChange={handleSatNoteChange}
                      className="input"
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
                      onClick={() => setIsEditingSatNote(false)}
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
                      setIsEditingSatNote(true);
                      setIsCreatingSatNote(false); // 进入更新模式
                    }}
                    className="sat-edit-button"
                  >
                    編輯
                  </Button>
                </div>
              ) : (
                <div>
                  <p>尚未添加 SAT Note。</p>
                  <Button
                    onClick={() => {
                      setSatNote({});
                      setIsEditingSatNote(true);
                      setIsCreatingSatNote(true);
                    }}
                    className="sat-add-button"
                  >
                    新增 SAT Note
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
