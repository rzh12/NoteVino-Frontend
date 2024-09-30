import React, { useState } from "react";
import { Card, CardBody, CardTitle } from "shards-react";
import Sidebar from "../components/Sidebar";
import WineDetails from "../components/WineDetails";
import WineUploadForm from "../components/WineUploadForm";
import { FaBars, FaTrashAlt, FaEdit } from "react-icons/fa";
import { Button } from "shards-react";
import axios from "axios";
import RecommendationForm from "../components/RecommendationForm";

function HomePage() {
  const [selectedWineId, setSelectedWineId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // 控制側邊欄狀態
  const [isEditing, setIsEditing] = useState(false); // 控制是否進入編輯模式
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const handleWineSelect = (wineId) => {
    setSelectedWineId(wineId);
    setIsUploading(false);
    setIsEditing(false);
    setShowRecommendationForm(false);
  };

  const handleUploadSelect = () => {
    setIsUploading(true);
    setSelectedWineId(null);
    setIsEditing(false);
    setShowRecommendationForm(false);
  };

  const reloadWines = () => {
    setReload(!reload);
  };

  const handleDeleteSuccess = () => {
    setSelectedWineId(null);
    reloadWines();
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed); // 切換側邊欄收合狀態
  };

  // 處理推薦按鈕點擊，切換表單顯示/隱藏
  const handleRecommendClick = () => {
    setShowRecommendationForm(!showRecommendationForm); // 切換推薦表單顯示狀態
    setIsUploading(false); // 隱藏上傳葡萄酒表單
    setSelectedWineId(null); // 隱藏葡萄酒詳細信息
    if (!showRecommendationForm) {
      setRecommendations([]); // 隱藏推薦結果
    }
  };

  const handleRecommendationsFetch = (data) => {
    // 處理推薦結果
    setRecommendations(data);
  };

  // 刪除葡萄酒記錄
  const handleDelete = () => {
    const token = localStorage.getItem("token");
    if (window.confirm("確定要刪除此葡萄酒記錄？")) {
      axios
        .delete(`/api/wines/${selectedWineId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 204) {
            // 確認成功回應是 204
            handleDeleteSuccess(); // 刪除成功後回調，清空詳細頁
          }
        })
        .catch((error) => {
          console.error("Error deleting wine:", error);
        });
    }
  };

  // 將編輯狀態傳遞給 WineDetails 並處理保存
  const handleSave = (updatedWineData) => {
    const token = localStorage.getItem("token");
    const updatedInfo = {
      name: updatedWineData.name, // 根據傳入的數據
      region: updatedWineData.region,
      type: updatedWineData.type,
      vintage: updatedWineData.vintage,
    };

    const queryParams = new URLSearchParams({
      info: JSON.stringify(updatedInfo),
    }).toString();

    axios
      .put(
        `/api/wines/${selectedWineId}?${queryParams}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          alert("更新成功");
          reloadWines(); // 重新加載數據
          setIsEditing(false); // 關閉編輯模式
        }
      })
      .catch((error) => {
        console.error("Error updating wine:", error);
      });
  };

  return (
    <div style={styles.container}>
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
        reload={reload}
        isCollapsed={isSidebarCollapsed}
      />
      <div
        style={{
          ...styles.content,
          marginLeft: isSidebarCollapsed ? "0" : "300px", // 根據側邊欄狀態調整右側區域左邊界
        }}
      >
        <div style={styles.header}>
          <div style={styles.leftHeaderButtons}>
            <Button style={styles.toggleButton} onClick={toggleSidebar}>
              <FaBars />
            </Button>
            <Button
              style={styles.recommendationButton}
              onClick={handleRecommendClick}
            >
              推薦
            </Button>
          </div>

          {/* 當選中酒品時顯示修改和刪除按鈕 */}
          {selectedWineId && (
            <div style={styles.actionButtons}>
              <Button
                theme="primary"
                onClick={() => setIsEditing(!isEditing)}
                style={styles.editButton}
              >
                <FaEdit />
              </Button>
              <Button
                theme="danger"
                onClick={handleDelete}
                style={styles.deleteButton}
              >
                <FaTrashAlt />
              </Button>
            </div>
          )}
        </div>

        <div style={styles.contentBody}>
          {/* 如果顯示推薦表單 */}
          {showRecommendationForm ? (
            <>
              <RecommendationForm
                onRecommendationsFetch={handleRecommendationsFetch}
              />
              {recommendations.length > 0 && (
                <div style={styles.outerContainer}>
                  <Card style={styles.recommendationsCard}>
                    <CardBody>
                      <h3 style={styles.title}>推薦結果</h3>
                      <ul>
                        {recommendations.map((recommendation, index) => (
                          <li key={index}>{JSON.stringify(recommendation)}</li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </div>
              )}
            </>
          ) : isUploading ? (
            <WineUploadForm onUploadSuccess={reloadWines} />
          ) : selectedWineId ? (
            <WineDetails
              wineId={selectedWineId}
              isEditing={isEditing} // 傳遞是否編輯模式
              handleSave={handleSave} // 傳遞保存修改的方法
              onDeleteSuccess={handleDeleteSuccess}
              reloadWines={reloadWines}
            />
          ) : (
            <Card style={styles.welcomeCard}>
              <CardBody>
                <CardTitle>Welcome!</CardTitle>
                <p>選擇一支酒以查看詳細資訊</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
  },
  content: {
    flexGrow: 1,
    transition: "margin-left 0.3s ease",
    overflowY: "auto", // 啟用整個右側內容滾動
    height: "100vh", // 確保右側區域可以滾動
    backgroundColor: "#f8f9fa", // 統一背景色
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px", // 只保留 header 的內邊距
    backgroundColor: "#fff", // 確保 header 是白色背景
    borderBottom: "1px solid #ccc",
    height: "60px", // 設置 header 高度為 60px
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // 增加 header 的陰影效果
  },
  leftHeaderButtons: {
    display: "flex",
    alignItems: "center",
  },
  toggleButton: {
    fontSize: "1rem",
    padding: "5px 10px",
  },
  recommendationButton: {
    fontSize: "1rem",
    padding: "5px 10px",
    marginLeft: "10px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px", // 讓按鈕之間有間距
  },
  editButton: {
    fontSize: "1rem",
    padding: "5px 10px",
  },
  deleteButton: {
    fontSize: "1rem",
    padding: "5px 10px",
  },
  welcomeCard: {
    borderRadius: "8px", // 添加卡片的圓角
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // 增加卡片的陰影
  },
  contentBody: {
    padding: "20px", // 這裡設置內容部分的 padding，而不是 header
  },
  outerContainer: {
    padding: "20px",
  },
  recommendationsCard: {
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
};

export default HomePage;
