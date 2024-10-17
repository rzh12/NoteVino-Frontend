import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button, Form, FormGroup, FormInput, FormSelect } from "shards-react";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import "./WineUploadForm.css";

function WineUploadForm({ onUploadSuccess, onWineSelect }) {
  const [wineInfo, setWineInfo] = useState({
    name: "",
    region: "",
    type: "",
    vintage: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("未選擇任何檔案"); // 預設顯示文字
  const inputRef = useRef(null); // 追蹤 name 輸入框的位置
  const suggestionsRef = useRef(null); // 追蹤建議框的位置

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWineInfo({ ...wineInfo, [name]: value });

    if (name === "name") {
      fetchSuggestions(value); // 當輸入酒名時進行自動完成查詢
    }
  };

  // 延遲執行的函數，減少不必要的請求
  const fetchSuggestions = debounce((query) => {
    if (query.length > 0) {
      axios
        .get(`/api/wines/autocomplete?query=${query}`)
        .then((response) => {
          if (response.data.success) {
            setSuggestions(response.data.data);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false); // 如果無匹配結果，隱藏建議
          }
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          setShowSuggestions(false); // 查詢錯誤時隱藏建議
        });
    } else {
      setShowSuggestions(false); // 如果沒有輸入字符，隱藏建議
    }
  }, 300); // 使用 debounce，限制請求頻率

  const handleSuggestionClick = (suggestion) => {
    setWineInfo({
      ...wineInfo,
      name: suggestion.name,
      region: suggestion.region,
    });
    setShowSuggestions(false); // 點擊後隱藏建議
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setFileName(file.name); // 當選擇檔案後顯示檔案名稱
    } else {
      setFileName("未選擇任何檔案"); // 沒有選擇檔案時顯示預設文字
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("info", JSON.stringify(wineInfo));
    formData.append("image", image);

    const token = localStorage.getItem("token"); // 假設 token 存儲在 localStorage

    axios
      .post("/api/wines/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // 在請求頭中添加 JWT token
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          const wineId = response.data.data; // 從 response.data.data 獲取 wineId

          Swal.fire({
            icon: "success",
            title: "葡萄酒上傳成功！",
            text: "你可以選擇繼續上傳或跳轉到該葡萄酒的詳細頁面。",
            showCancelButton: true, // 顯示取消按鈕
            confirmButtonText: "轉跳到該葡萄酒頁面",
            cancelButtonText: "繼續上傳",
            customClass: {
              confirmButton: "btn-confirm", // 自定義 confirm 按鈕的樣式
              cancelButton: "btn-cancel", // 自定義 cancel 按鈕的樣式（可選）
            },
          }).then((result) => {
            if (result.isConfirmed) {
              onWineSelect(wineId);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              setWineInfo({ name: "", region: "", type: "", vintage: "" });
              setImage(null);
            }
          });

          onUploadSuccess();
        }
      })
      .catch((error) => {
        console.error("Error uploading wine:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to Upload Wine",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000, // 2 秒後自動關閉
          timerProgressBar: true,
        });
      });
  };

  // 點擊外部時關閉建議框
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 確保點擊的不是輸入框、建議框或者建議框中的某個選項
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false); // 點擊外部時隱藏建議框
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 滾動時保持建議框的位置
  useEffect(() => {
    const handleScroll = () => {
      if (inputRef.current && suggestionsRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        suggestionsRef.current.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsRef.current.style.left = `${rect.left + window.scrollX}px`;
        suggestionsRef.current.style.width = `${rect.width}px`; // 確保寬度與輸入框一致
      }
    };

    if (showSuggestions) {
      handleScroll(); // 初次顯示時計算位置
      window.addEventListener("scroll", handleScroll, true);
    } else {
      window.removeEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showSuggestions]);

  return (
    <div className="form-container">
      <h2>上傳葡萄酒資料</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="name">Name:</label>
          <div ref={inputRef}>
            <FormInput
              type="text"
              name="name"
              value={wineInfo.name}
              onChange={handleInputChange}
              required
            />
          </div>
          {showSuggestions && (
            <ul className="suggestions" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name} ({suggestion.region})
                </li>
              ))}
            </ul>
          )}
        </FormGroup>

        <FormGroup>
          <label htmlFor="region">Region:</label>
          <FormInput
            type="text"
            name="region"
            value={wineInfo.region}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="type">Type:</label>
          <FormSelect
            name="type"
            value={wineInfo.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Red">Red</option>
            <option value="White">White</option>
            <option value="Rose">Rose</option>
            <option value="Sparkling">Sparkling</option>
            <option value="Dessert">Dessert</option>
            <option value="Fortified">Fortified</option>
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <label htmlFor="vintage">Vintage:</label>
          <FormInput
            type="number"
            name="vintage"
            value={wineInfo.vintage}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Upload Image:</label>{" "}
          <div className="image-upload-container">
            <button
              type="button"
              className="custom-file-upload"
              onClick={() => document.getElementById("image").click()}
            >
              選擇檔案
            </button>
            <input
              type="file"
              id="image"
              className="hidden-file-input"
              onChange={handleImageChange}
            />
            <span className="file-name">{fileName}</span> {/* 顯示文件名稱 */}
          </div>
        </FormGroup>

        <Button
          type="submit"
          theme="success"
          className="wine-upload-button"
          block
        >
          上傳葡萄酒
        </Button>
      </Form>
    </div>
  );
}

export default WineUploadForm;
