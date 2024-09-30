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

function RecommendationForm({ onRecommendationsFetch }) {
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmitRecommendations = () => {
    const token = localStorage.getItem("token");

    // 發送 GET 請求，將 rating 和 price 作為請求頭發送
    axios
      .get("/api/wines/user/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`, // 將 JWT token 放在 Authorization 請求頭
          rating: rating || "4.3", // 使用輸入的 rating，否則默認為 4.3
          price: price || "5000", // 使用輸入的 price，否則默認為 5000
        },
      })
      .then((response) => {
        if (response.status === 200) {
          onRecommendationsFetch(response.data); // 傳遞推薦結果給父組件
        } else {
          alert("No recommendations available.");
        }
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
      });
  };

  return (
    <div style={styles.outerContainer}>
      <Card style={styles.recommendationCard}>
        <CardBody>
          <h3>推薦條件</h3>
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
          <Button onClick={handleSubmitRecommendations}>提交</Button>
        </CardBody>
      </Card>
    </div>
  );
}

const styles = {
  outerContainer: {
    padding: "20px",
  },
  recommendationCard: {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // 添加陰影
    borderRadius: "10px", // 圓角邊框
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  title: {
    marginBottom: "20px",
    fontSize: "1.5rem",
  },
};

export default RecommendationForm;
