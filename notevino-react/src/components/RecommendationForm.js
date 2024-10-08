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

function RecommendationForm({ onRecommendationsFetch }) {
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [useRegion, setUseRegion] = useState(false);
  const [region, setRegion] = useState("");

  const handleSubmitRecommendations = () => {
    const token = localStorage.getItem("token");

    // 立即顯示提交成功的 toast 提示
    Swal.fire({
      icon: "success",
      title: "Recommendation Submitted!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500, // 1.5 秒後自動關閉
      timerProgressBar: true,
    });

    // 發送 GET 請求，將 rating 和 price 作為請求頭發送
    axios
      .get("/api/wines/user/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`, // 將 JWT token 放在 Authorization 請求頭
          rating: rating || "4.3", // 使用輸入的 rating，否則默認為 4.3
          price: price || "5000", // 使用輸入的 price，否則默認為 5000
          useRegion: useRegion,
          region: useRegion ? region : undefined, // 如果 useRegion 為 true，則傳遞 region，否則不傳遞
        },
      })
      .then((response) => {
        if (response.status === 200) {
          onRecommendationsFetch(response.data); // 傳遞推薦結果給父組件
        } else {
          alert("No recommendations available.");
          Swal.fire({
            icon: "warning",
            title: "No Recommendations",
            text: "No recommendations available at the moment.",
            timer: 1500, // 1.5秒後自動關閉
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
          timer: 2000, // 2秒後自動關閉
          showConfirmButton: true,
        });
      });
  };

  return (
    <div className="outer-container">
      <Card className="recommendation-card">
        <CardBody>
          <h3 className="title">推薦條件</h3>
          <InputGroup className="mb-3">
            <InputGroupText>評分</InputGroupText>
            <FormInput
              placeholder="輸入評分"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroupText>價格</InputGroupText>
            <FormInput
              placeholder="輸入價格"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </InputGroup>

          {/* 使用原生 checkbox */}
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
