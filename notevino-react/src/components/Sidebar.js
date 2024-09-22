import React from "react";
import WinesList from "./WinesList";

function Sidebar({ onWineSelect, onUploadSelect, reload }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.userInfo}>
        <h2>User Info</h2>
        <p>Function-1</p>
      </div>
      <div style={styles.wineList}>
        <WinesList
          onWineSelect={onWineSelect}
          onUploadSelect={onUploadSelect}
          reload={reload}
        />
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "300px",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#f4f4f4",
  },
  userInfo: {
    padding: "20px",
    backgroundColor: "#ddd",
    borderBottom: "1px solid #ccc",
    flexGrow: 0,
  },
  wineList: {
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #ccc",
    flexGrow: 1,
    overflowY: "auto",
  },
};

export default Sidebar;
