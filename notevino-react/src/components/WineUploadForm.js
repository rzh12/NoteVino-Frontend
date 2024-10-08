import React, { useState } from "react";
import axios from "axios";
import { Button, Form, FormGroup, FormInput, FormSelect } from "shards-react";
import Swal from "sweetalert2";
import "./WineUploadForm.css";

function WineUploadForm({ onUploadSuccess }) {
  const [wineInfo, setWineInfo] = useState({
    name: "",
    region: "",
    type: "",
    vintage: "",
  });
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("未選擇任何檔案"); // 預設顯示文字

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWineInfo({ ...wineInfo, [name]: value });
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
          Swal.fire({
            icon: "success",
            title: "葡萄酒上傳成功 ！",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500, // 1.5 秒後自動關閉
            timerProgressBar: true,
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

  return (
    <div className="form-container">
      <h2>上傳葡萄酒資料</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="name">Name:</label>
          <FormInput
            type="text"
            name="name"
            value={wineInfo.name}
            onChange={handleInputChange}
            required
          />
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
