import React, { useState } from "react";
import axios from "axios";
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

    axios
      .post("/api/wines/upload", formData)
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
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          value={wineInfo.name}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="region">Region:</label>
        <input
          type="text"
          name="region"
          value={wineInfo.region}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="type">Type:</label>
        <select
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
        </select>

        <label htmlFor="vintage">Vintage:</label>
        <input
          type="number"
          name="vintage"
          value={wineInfo.vintage}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="image">Upload Image:</label>
        <input type="file" onChange={handleImageChange} />

        <button type="submit">上傳葡萄酒</button>
      </form>
    </div>
  );
}

export default WineUploadForm;
