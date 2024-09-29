import React from "react";
import { Button } from "shards-react";
import WinesList from "./WinesList";

function Sidebar({ onWineSelect, onUploadSelect, reload, isCollapsed }) {
  return (
    <div style={{ ...styles.sidebar, width: isCollapsed ? "0" : "300px" }}>
      {!isCollapsed && (
        <>
          <div style={styles.noteVinoHeader}>
            <h2>NoteVino</h2>
          </div>

          <div style={styles.wineList}>
            <WinesList onWineSelect={onWineSelect} reload={reload} />
          </div>

          <div style={styles.uploadButton}>
            <Button theme="primary" onClick={onUploadSelect}>
              + Upload Wine
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#fff", // 使用白色背景
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: "width 0.3s ease", // 增加寬度動畫
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)", // 增加陰影效果讓側邊欄更立體
  },
  noteVinoHeader: {
    height: "60px", // 與 header 一致的高度
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // 背景與 header 保持一致
    borderBottom: "1px solid #ccc", // 添加底部邊框
    flexShrink: 0,
  },
  wineList: {
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #ccc",
    flexGrow: 1,
    overflowY: "auto", // 使用 auto 避免滾動條永久佔用空間
  },
  uploadButton: {
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export default Sidebar;
