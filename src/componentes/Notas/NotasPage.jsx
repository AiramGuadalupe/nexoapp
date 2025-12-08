import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import NotasGrid from "./NotasGrid";
import InformesPopup from "../InformesPopup/InformesPopup";
import "../../styles/global.css";
import "./NotasPage.css";

const NotasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) setUserId(user.id);
  }, []);

  if (!userId) return <p>Cargando usuario...</p>;

  return (
    <div className="home-page">
      <div className="home-container">
        <Sidebar
          active="notas"
          open={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSettingsClick={() => setShowSettings(true)}
        />
        <main className="home-content">
          <NotasGrid userId={userId} />
        </main>
      </div>

      {showSettings && (
        <InformesPopup userId={userId} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default NotasPage;