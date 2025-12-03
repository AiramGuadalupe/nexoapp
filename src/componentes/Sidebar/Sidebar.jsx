import { CalendarDays, PiggyBank, FileText, Settings } from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ active, open, toggleSidebar, onSettingsClick }) => {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar__top">
          <button className={`sidebar__btn ${active === "calendario" ? "active" : ""}`}>
            <CalendarDays className="sidebar__icon" />
            {open && <span className="sidebar__label">Calendario</span>}
          </button>
          <button className={`sidebar__btn ${active === "finanzas" ? "active" : ""}`}>
            <PiggyBank className="sidebar__icon" />
            {open && <span className="sidebar__label">Finanzas</span>}
          </button>
          <button className={`sidebar__btn ${active === "notas" ? "active" : ""}`}>
            <FileText className="sidebar__icon" />
            {open && <span className="sidebar__label">Notas</span>}
          </button>
        </div>

        <button className={`sidebar__arrow ${open ? "rotated" : ""}`} onClick={toggleSidebar}>➤</button>

        <div className="sidebar__bottom">
          <button
            className={`sidebar__btn ${active === "config" ? "active" : ""}`}
            onClick={onSettingsClick} // ← abre popup
          >
            <Settings className="sidebar__icon" />
            {open && <span className="sidebar__label">Ajustes</span>}
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;