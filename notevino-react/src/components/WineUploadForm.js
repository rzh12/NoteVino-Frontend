import React, { useState } from "react";
import axios from "axios";
import { Button, Form, FormGroup, FormInput, FormSelect } from "shards-react";
import "./WineUploadForm.css";

function WineUploadForm({ onUploadSuccess }) {
  const [wineInfo, setWineInfo] = useState({
    name: "",
    region: "",
    type: "",
    vintage: "",
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWineInfo({ ...wineInfo, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
          alert("葡萄酒上傳成功！");
          onUploadSuccess();
        }
      })
      .catch((error) => {
        console.error("Error uploading wine:", error);
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
          <label htmlFor="image">Upload Image:</label>
          <FormInput type="file" onChange={handleImageChange} />
        </FormGroup>

        <Button type="submit" theme="success" block>
          上傳葡萄酒
        </Button>
      </Form>
    </div>
  );
}

export default WineUploadForm;
