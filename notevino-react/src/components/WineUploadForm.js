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
  const [fileName, setFileName] = useState("未選擇任何檔案");
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWineInfo({ ...wineInfo, [name]: value });

    if (name === "name") {
      fetchSuggestions(value);
    }
  };

  const fetchSuggestions = debounce((query) => {
    if (query.length > 0) {
      axios
        .get(`/api/wines/autocomplete?query=${query}`)
        .then((response) => {
          if (response.data.success) {
            setSuggestions(response.data.data);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          setShowSuggestions(false);
        });
    } else {
      setShowSuggestions(false);
    }
  }, 300); // Debounce

  const handleSuggestionClick = (suggestion) => {
    setWineInfo({
      ...wineInfo,
      name: suggestion.name,
      region: suggestion.region,
    });
    setShowSuggestions(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setFileName(file.name);
    } else {
      setFileName("未選擇任何檔案");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("info", JSON.stringify(wineInfo));
    formData.append("image", image);

    const token = localStorage.getItem("token");

    axios
      .post("/api/wines/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          const wineId = response.data.data;

          Swal.fire({
            icon: "success",
            title: "葡萄酒上傳成功！",
            text: "你可以選擇繼續上傳或跳轉到該葡萄酒的詳細頁面。",
            showCancelButton: true,
            confirmButtonText: "轉跳到該葡萄酒頁面",
            cancelButtonText: "繼續上傳",
            customClass: {
              confirmButton: "btn-confirm",
              cancelButton: "btn-cancel",
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
          timer: 2000,
          timerProgressBar: true,
        });
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (inputRef.current && suggestionsRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        suggestionsRef.current.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsRef.current.style.left = `${rect.left + window.scrollX}px`;
        suggestionsRef.current.style.width = `${rect.width}px`;
      }
    };

    if (showSuggestions) {
      handleScroll();
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
            <span className="file-name">{fileName}</span>
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
