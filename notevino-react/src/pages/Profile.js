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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./Profile.css"; // 用於添加自定義樣式

const WINE_TYPES = [
  "Red",
  "White",
  "Rose",
  "Sparkling",
  "Dessert",
  "Fortified",
];
const COLORS = {
  Red: "#901B4E",
  White: "#E0C16D",
  Rosé: "#0088FE",
  Sparkling: "#00C49F",
  Dessert: "#AF19FF",
  Fortified: "#FF6666",
};

const RADIAN = Math.PI / 180;

function Profile({ onAvatarUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pieData, setPieData] = useState([]);
  const [animationPercent, setAnimationPercent] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 });

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("未登入，無法獲取使用者資料");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [profileResponse, wineResponse] = await Promise.all([
          axios.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/wines/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(profileResponse.data);

        if (wineResponse.data.success) {
          const wines = wineResponse.data.data;
          processPieData(wines);
          processUploadHistory(wines);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("無法獲取資料");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 動畫邏輯
    const easeOutQuad = (t) => t * (2 - t);
    const animationDuration = 1000;
    const stepTime = 20;
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

  const processPieData = (data) => {
    const typeCounts = data.reduce((acc, wine) => {
      acc[wine.type] = (acc[wine.type] || 0) + 1;
      return acc;
    }, {});

    // 只保留有數量的酒類數據
    const pieData = WINE_TYPES.reduce((acc, type) => {
      if (typeCounts[type] && typeCounts[type] > 0) {
        acc.push({
          name: type,
          value: typeCounts[type],
        });
      }
      return acc;
    }, []);

    setPieData(pieData);
  };

  const processUploadHistory = (data) => {
    const dailyUploads = data.reduce((acc, wine) => {
      // 使用 toLocaleDateString 來確保日期格式一致
      const date = new Date(wine.createdAt).toLocaleDateString("en-CA"); // 使用 'en-CA' 來獲得 YYYY-MM-DD 格式
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // 確保包含今天的日期，即使沒有上傳
    const today = new Date().toLocaleDateString("en-CA");
    if (!dailyUploads[today]) {
      dailyUploads[today] = 0;
    }

    const history = Object.keys(dailyUploads)
      .sort()
      .map((date) => ({
        date,
        count: dailyUploads[date],
      }));

    setUploadHistory(history);
    // 更新可見範圍以顯示最新的數據
    setVisibleRange({
      start: Math.max(0, history.length - 7),
      end: history.length,
    });
  };

  const handleScroll = (direction) => {
    setVisibleRange((prev) => {
      if (direction === "left" && prev.start > 0) {
        return { start: prev.start - 1, end: prev.end - 1 };
      } else if (direction === "right" && prev.end < uploadHistory.length) {
        return { start: prev.start + 1, end: prev.end + 1 };
      }
      return prev;
    });
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

  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return <span style={{ color }}>{value}</span>;
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
          <div className="charts-container">
            {/* 折線圖 (左側) */}
            <div className="chart-item upload-history-container">
              <h3 className="chart-title-line">每日新增酒款數量</h3>
              {uploadHistory.length > 0 ? (
                <div className="chart-wrapper">
                  <div className="scroll-controls">
                    <button
                      onClick={() => handleScroll("left")}
                      disabled={visibleRange.start === 0}
                      aria-label="向左滾動"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={() => handleScroll("right")}
                      disabled={visibleRange.end >= uploadHistory.length}
                      aria-label="向右滾動"
                    >
                      &#8594;
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={uploadHistory.slice(
                        visibleRange.start,
                        visibleRange.end
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div>No upload history available</div>
              )}
            </div>

            {/* 圓餅圖 (右側) */}
            <div className="chart-item pie-chart-container">
              <h3 className="chart-title">葡萄酒類別統計</h3>
              {pieData.length > 0 ? (
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
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Legend formatter={renderColorfulLegendText} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div>No pie chart data available</div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
