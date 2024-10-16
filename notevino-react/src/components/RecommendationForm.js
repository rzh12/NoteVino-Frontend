import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  InputGroup,
  InputGroupText,
  FormInput,
} from "shards-react";
import axios from "axios";
import "./RecommendationForm.css";
import Swal from "sweetalert2";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function RecommendationForm({ onRecommendationsFetch }) {
  const [rating, setRating] = useState(4.3);
  const [price, setPrice] = useState(5000);
  const [useRegion, setUseRegion] = useState(false);
  const [region, setRegion] = useState("");

  const handleSubmitRecommendations = () => {
    const token = localStorage.getItem("token");

    Swal.fire({
      icon: "success",
      title: "Recommendation Submitted!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });

    axios
      .get("/api/wines/user/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`,
          rating: rating || "4.3",
          price: price || "5000",
          useRegion: useRegion,
          region: useRegion ? region : undefined,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          onRecommendationsFetch(response.data);
        } else {
          alert("No recommendations available.");
          Swal.fire({
            icon: "warning",
            title: "No Recommendations",
            text: "No recommendations available at the moment.",
            timer: 1500,
            showConfirmButton: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load recommendations. Please try again.",
          timer: 2000,
          showConfirmButton: true,
        });
      });
  };

  return (
    <div className="outer-container">
      <Card className="recommendation-card">
        <CardBody>
          <h3 className="title">推薦條件</h3>
          <div className="slider-container">
            <div className="slider-label">
              評分：
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {rating.toFixed(1)}
              </span>
            </div>
            <Slider
              min={3.8}
              max={5.0}
              step={0.1}
              value={rating}
              onChange={(value) => setRating(Number(value))}
              trackStyle={{ backgroundColor: "#0e8871", height: 8 }}
              handleStyle={{
                borderColor: "#0e8871",
                height: 24,
                width: 24,
                marginTop: -8,
                backgroundColor: "#FFFFFF",
              }}
              railStyle={{ backgroundColor: "#CCC", height: 8 }}
              className="slider"
            />
          </div>

          <div className="slider-container">
            <div className="slider-label">
              價格：
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {price}
              </span>
            </div>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={price}
              onChange={(value) => setPrice(Number(value))}
              trackStyle={{ backgroundColor: "#09f", height: 8 }}
              handleStyle={{
                borderColor: "#09f",
                height: 24,
                width: 24,
                marginTop: -8,
                backgroundColor: "#FFFFFF",
              }}
              railStyle={{ backgroundColor: "#CCC", height: 8 }}
              className="slider"
            />
          </div>

          {/* checkbox */}
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={useRegion}
              onChange={() => setUseRegion(!useRegion)}
              className="custom-checkbox"
            />
            <label htmlFor="useRegion">針對特定地區進行推薦</label>
          </div>

          <InputGroup className="mb-3">
            <InputGroupText>地區</InputGroupText>
            <FormInput
              placeholder="輸入 Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={!useRegion} // 當未勾選 "使用 Region" 時禁用輸入框
              className={useRegion ? "enabled-input" : "disabled-input"} // 根據勾選框狀態調整樣式
            />
          </InputGroup>

          <Button className="button" onClick={handleSubmitRecommendations}>
            提交
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default RecommendationForm;
