import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardTitle } from "shards-react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Sidebar from "../components/Sidebar";
import WineDetails from "../components/WineDetails";
import WineUploadForm from "../components/WineUploadForm";
import { Button } from "shards-react";
import axios from "axios";
import RecommendationForm from "../components/RecommendationForm";
import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faUserLarge,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import WineCard from "../components/WineCard";
import Profile from "../pages/Profile";
// import { Squash as Hamburger } from "hamburger-react";

// Material-UI 表格組件
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import nvLogo from "../nv-logo.svg";

function HomePage() {
  const [selectedWineId, setSelectedWineId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [wineDetailsList, setWineDetailsList] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const handleWineSelect = (wineId) => {
    setSelectedWineId(wineId);
    setIsUploading(false);
    setShowRecommendationForm(false);
    setIsAddingNote(false);
    setNewNote("");
    setShowProfile(false);
  };

  const handleUploadSelect = () => {
    setIsUploading(true);
    setSelectedWineId(null);
    setShowRecommendationForm(false);
    setShowProfile(false);
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
    setShowProfile(false);
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

  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 如果沒有 token，跳轉到登入頁
    if (!token) {
      navigate("/login");
      return;
    }

    // 驗證 token 是否有效，獲取用戶資料
    axios
      .get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { name, picture } = response.data;
        setUserName(name);
        setAvatarUrl(picture || "https://via.placeholder.com/50?text=No+Image");
        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);

        // 如果 token 失效或請求出錯，清除 token 並跳轉到登入頁
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
      });
  }, [navigate]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("");
    setAvatarUrl("");
    window.location.reload();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleHome = () => {
    setSelectedWineId(null);
    setIsUploading(false);
    setShowRecommendationForm(false);
    setRecommendations([]);
    setIsSidebarCollapsed(false);
    setShowProfile(false);
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  useEffect(() => {
    // Fetch top 5 wine suggestions
    axios
      .get("/api/wines/autocomplete?query=") // 空字符串查询返回热门酒款
      .then((response) => {
        if (response.data.success) {
          const suggestions = response.data.data.slice(0, 5); // 取前 5 笔数据

          // 获取每个酒款的详细信息
          const fetchWineDetails = suggestions.map((wine) =>
            axios.get(`/api/wines/${wine.wineId}`).then((res) => res.data.data)
          );

          Promise.all(fetchWineDetails)
            .then((details) => {
              setWineDetailsList(details);
            })
            .catch((error) => {
              console.error("Error fetching wine details:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching wine suggestions:", error);
      });
  }, []);

  return (
    <div className="homepage-container">
      <Sidebar
        onWineSelect={handleWineSelect}
        onUploadSelect={handleUploadSelect}
        reload={reload}
        isCollapsed={isSidebarCollapsed}
      />
      <div
        className={`homepage-content ${
          isSidebarCollapsed
            ? "homepage-content-collapsed"
            : "homepage-content-expanded"
        }`}
      >
        <div className="header">
          {/* 左側按鈕 */}
          <div className="left-header-buttons">
            <div className="toggle-button" onClick={toggleSidebar}>
              <FontAwesomeIcon
                icon={faBars}
                className="fa-bars-icon"
                style={{ fontSize: "24px" }}
              />
            </div>
            <Button className="home-button" onClick={handleHome}>
              Home
            </Button>
            <Button
              className="recommendation-button"
              onClick={handleRecommendClick}
            >
              個人化推薦
            </Button>
          </div>

          {/* 中間區域：網站標題和 logo */}
          <div className="header-content">
            <img src={nvLogo} alt="logo" className="header-logo" />
            <h1 className="header-title">NoteVino</h1>
          </div>

          {/* 右側按鈕和 userInfo */}
          <div className="right-header">
            {/* <Button className="dark-mode-toggle" onClick={toggleDarkMode}>
              Dark Mode
            </Button> */}

            {/* 分隔線 */}
            <div className="separator"></div>

            {/* user-info 區域 */}
            <div className="user-info">
              {isLoggedIn ? (
                <Dropdown
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                  className="user-dropdown"
                >
                  <DropdownToggle
                    tag="div"
                    data-toggle="dropdown"
                    aria-expanded={dropdownOpen}
                    className="dropdown-toggle"
                  >
                    <div className="user-profile">
                      <img
                        src={avatarUrl}
                        alt="User Avatar"
                        className="avatar"
                      />
                      <span className="user-name">{userName}</span>
                    </div>
                  </DropdownToggle>
                  <DropdownMenu
                    right
                    className={`dropdown-menu-custom ${
                      dropdownOpen ? "show" : ""
                    }`}
                  >
                    <DropdownItem
                      onClick={() => {
                        setShowProfile(true); // 顯示 Profile 頁面
                        setSelectedWineId(null); // 重置其他狀態
                        setIsUploading(false);
                        setShowRecommendationForm(false);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        className="dropdown-icon"
                      />{" "}
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="dropdown-icon"
                      />{" "}
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <div className="login-container" onClick={handleLogin}>
                  <FontAwesomeIcon icon={faUserLarge} className="user-icon" />
                  <span className="login-text">Login</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-body">
          {showProfile ? (
            <Profile onAvatarUpdate={handleAvatarUpdate} />
          ) : showRecommendationForm ? (
            <>
              <RecommendationForm
                onRecommendationsFetch={handleRecommendationsFetch}
              />
              {recommendations.length > 0 && (
                <div className="outer-container">
                  <Card className="recommendations-card">
                    <CardBody>
                      <h3 className="title">推薦結果</h3>
                      {/* 使用 Material-UI 表格組件 */}
                      <TableContainer
                        component={Paper}
                        className="table-container"
                      >
                        <Table
                          className="recommendations-table"
                          aria-label="recommendations table"
                        >
                          <TableHead className="recommendations-table-header">
                            <TableRow>
                              <TableCell className="recommendation-table-header-cell">
                                名稱
                              </TableCell>
                              <TableCell className="recommendation-table-header-cell">
                                酒莊
                              </TableCell>
                              <TableCell className="recommendation-table-header-cell">
                                地區
                              </TableCell>
                              <TableCell className="recommendation-table-header-cell">
                                國家
                              </TableCell>
                              <TableCell
                                className="recommendation-table-header-cell"
                                style={{ width: "80px" }}
                              >
                                評分
                              </TableCell>
                              <TableCell
                                className="recommendation-table-header-cell"
                                style={{ width: "120px" }}
                              >
                                價格
                              </TableCell>
                              <TableCell
                                className="recommendation-table-header-cell"
                                style={{ width: "80px" }}
                              >
                                類型
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recommendations.map((recommendation, index) => (
                              <TableRow
                                key={index}
                                className={`recommendation-row ${
                                  index === recommendations.length - 1
                                    ? "last-row"
                                    : ""
                                }`}
                              >
                                <TableCell className="recommendation-cell">
                                  {recommendation.name}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.winery}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.region}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.country}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.rating}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.price}
                                </TableCell>
                                <TableCell className="recommendation-cell">
                                  {recommendation.type}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>
                </div>
              )}
            </>
          ) : isUploading ? (
            <WineUploadForm
              onUploadSuccess={reloadWines}
              onWineSelect={handleWineSelect}
            />
          ) : selectedWineId ? (
            <>
              <WineDetails
                wineId={selectedWineId}
                onDeleteSuccess={handleDeleteSuccess}
                reloadWines={reloadWines}
                isAddingNote={isAddingNote}
                setIsAddingNote={setIsAddingNote}
                newNote={newNote}
                setNewNote={setNewNote}
              />
            </>
          ) : (
            <div className="welcome-card-container">
              <Card className="welcome-card">
                <CardBody className="welcome-card-body">
                  <CardTitle className="welcome-card-title">Welcome!</CardTitle>
                  <p className="welcome-card-text">近期熱門酒款如下：</p>
                </CardBody>
              </Card>

              {wineDetailsList.length > 0 ? (
                wineDetailsList.map((wine) => (
                  <WineCard key={wine.wineId} wine={wine} />
                ))
              ) : (
                <p className="welcome-card-text">正在載入熱門酒款...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
