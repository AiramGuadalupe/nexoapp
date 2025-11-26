import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Calendario from "../Calendario/Calendario";
import "../../styles/global.css";
import "./Home.css";
/*modificar ctrlz */
const Home = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) setUserId(user.id);
  }, []);

  if (!userId) return <p>Cargando usuario...</p>;

  return (
    <div className="home-page">
      <div className="home-container">
        <Sidebar active="calendario" open={open} toggleSidebar={() => setOpen(!open)} />
        <main className="home-content">
          <Calendario userId={userId} />
        </main>
      </div>
    </div>
  );
};

export default Home;