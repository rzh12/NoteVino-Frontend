import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardBody, CardTitle } from "shards-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import "./Profile.css"; // 用於添加自定義樣式

const COLORS = [
  "#901B4E",
  "#E0C16D",
  "#0088FE",
  "#00C49F",
  "#AF19FF",
  "#FF6666",
];

const RADIAN = Math.PI / 180;

function Profile({ onAvatarUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, setWineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [animationPercent, setAnimationPercent] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

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

    axios
      .get("/api/wines/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setWineData(response.data.data); // 保存用戶上傳的酒類數據
          processPieData(response.data.data); // 處理並設置圓餅圖數據
        }
      })
      .catch((error) => {
        console.error("無法獲取酒類數據", error);
      });

    const easeOutQuad = (t) => t * (2 - t);
    const animationDuration = 1000; // 1秒
    const stepTime = 20; // 每20毫秒更新一次
    const steps = animationDuration / stepTime;
    let step = 0;

    const animationInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimationPercent(easeOutQuad(progress) * 100);
      if (step >= steps) {
        clearInterval(animationInterval);
      }
    }, stepTime);

    return () => clearInterval(animationInterval);
  }, []);

  // 處理酒類數據，生成圓餅圖需要的格式
  const processPieData = (data) => {
    const typeCounts = data.reduce((acc, wine) => {
      acc[wine.type] = (acc[wine.type] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(typeCounts).map((type) => ({
      name: type,
      value: typeCounts[type],
    }));

    setPieData(pieData);
  };

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const uploadAvatar = (file) => {
    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("picture", file);

    axios
      .post("/api/users/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.imageUrl) {
          // 更新用戶的頭像 URL
          setUser((prevUser) => ({
            ...prevUser,
            picture: response.data.imageUrl,
          }));

          // 呼叫回呼函數，將新的頭像 URL 傳遞給 HomePage
          if (onAvatarUpdate) {
            onAvatarUpdate(response.data.imageUrl);
          }
        }
        setIsUploading(false);
      })
      .catch((error) => {
        console.error("上傳頭像失敗:", error);
        setIsUploading(false);
      });
  };

  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill={fill}
          fontSize="18"
          fontWeight="bold"
        >
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          fontSize="16"
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(2)}%`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={20}
          textAnchor={textAnchor}
          fill="#666"
          fontSize="14"
        >
          {`(數量: ${value})`}
        </text>
      </g>
    );
  };

  // 顯示用戶資料
  return (
    <div className="profile-container">
      <Card className="profile-card">
        <CardBody>
          <div className="profile-card-header">
            {/* 將圖片容器移到左側 */}
            <div className="profile-card-image-container">
              <label htmlFor="avatar-upload">
                <img
                  src={
                    user.picture ||
                    "https://via.placeholder.com/250?text=No+Image"
                  }
                  alt={`${user.name}'s avatar`}
                  className="profile-card-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/250?text=No+Image";
                  }}
                />
                {isUploading && (
                  <div className="uploading-overlay">上傳中...</div>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
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
          {/* 圓餅圖 */}
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  startAngle={90}
                  endAngle={90 + 360 * (animationPercent / 100)}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
