import React from "react";
const { ipcRenderer } = window.require("electron");

const TitleBar = () => {
  return (
    <div style={styles.container}>
      <span style={styles.title}>Mi App</span>
      <div style={styles.buttons}>
        <button onClick={() => ipcRenderer.send("window-minimize")}>—</button>
        <button onClick={() => ipcRenderer.send("window-maximize")}>☐</button>
        <button onClick={() => ipcRenderer.send("window-close")}>✕</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    height: "35px",
    padding: "0 10px",
    WebkitAppRegion: "drag", // Permite arrastrar la ventana
  },
  title: {
    fontWeight: "bold",
  },
  buttons: {
    display: "flex",
    gap: "5px",
  },
};

export default TitleBar;