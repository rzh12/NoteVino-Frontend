import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, CardTitle } from "shards-react";
import "./Profile.css"; // 用於添加自定義樣式

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // 從 localStorage 中獲取 token

    if (!token) {
      setError("未登入，無法獲取使用者資料");
      setLoading(false);
      return;
    }

    // 發送 GET 請求來獲取使用者的個人資料
    axios
      .get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // 將 token 添加到請求的 Authorization 標頭中
        },
      })
      .then((response) => {
        setUser(response.data); // 保存用戶資料到 state 中
        setLoading(false); // 請求完成，取消加載狀態
      })
      .catch((error) => {
        setError("無法獲取使用者資料");
        setLoading(false); // 無論成功與否都取消加載狀態
      });
  }, []);

  // 顯示加載狀態
  if (loading) {
    return <div>載入中...</div>;
  }

  // 顯示錯誤信息
  if (error) {
    return <div>{error}</div>;
  }

  // 格式化日期
  const formattedDate = new Date(user.createdAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedTime = new Date(user.createdAt).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24 小時制
  });

  // 顯示用戶資料
  return (
    <div className="profile-container">
      <Card className="profile-card">
        <CardBody>
          <div className="profile-card-header">
            {/* 將圖片容器移到左側 */}
            <div className="profile-card-image-container">
              <img
                src={user.picture}
                alt={`${user.name}'s avatar`}
                className="profile-card-image"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
            {/* 資訊容器移到右側 */}
            <div className="profile-card-content">
              <CardTitle className="profile-card-title">{user.name}</CardTitle>
              <p className="profile-card-info">
                <span className="profile-card-label">電子信箱：</span>
                <span className="profile-card-text">{user.email}</span>
              </p>
              <p className="profile-card-info">
                <span className="profile-card-label">帳號建立時間：</span>
                <span className="profile-card-text">
                  {formattedDate} {formattedTime}
                </span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
