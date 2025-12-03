import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Calendario from "../Calendario/Calendario";
import InformesPopup from "../InformesPopup/InformesPopup"; // ← nuevo
import "../../styles/global.css";
import "./Home.css";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showSettings, setShowSettings] = useState(false); // ← popup

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) setUserId(user.id);
  }, []);

  if (!userId) return <p>Cargando usuario...</p>;

  return (
    <div className="home-page">
      <div className="home-container">
        <Sidebar
          active="calendario"
          open={open}
          toggleSidebar={() => setOpen(!open)}
          onSettingsClick={() => setShowSettings(true)} // ← abre popup
        />
        <main className="home-content">
          <Calendario userId={userId} />
        </main>
      </div>

      {showSettings && (
        <InformesPopup userId={userId} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Home;