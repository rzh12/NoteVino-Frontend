import React, { useState } from "react";
import axios from "axios";

function WineUploadForm() {
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
        }
      })
      .catch((error) => {
        console.error("Error uploading wine:", error);
      });
  };

  return (
    <div>
      <h2>上傳葡萄酒資料</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={wineInfo.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Region:
          <input
            type="text"
            name="region"
            value={wineInfo.region}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Type:
          <input
            type="text"
            name="type"
            value={wineInfo.type}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Vintage:
          <input
            type="number"
            name="vintage"
            value={wineInfo.vintage}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Upload Image:
          <input type="file" onChange={handleImageChange} />
        </label>
        <button type="submit">上傳葡萄酒</button>
      </form>
    </div>
  );
}

export default WineUploadForm;
