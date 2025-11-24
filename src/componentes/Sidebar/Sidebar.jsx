import { CalendarDays, PiggyBank, FileText, Settings } from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ active, open, toggleSidebar }) => {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Contenedor de botones superiores */}
        <div className="sidebar__top">
          <button
            className={`sidebar__btn ${active === "calendario" ? "active" : ""}`}
          >
            <CalendarDays className="sidebar__icon" />
            {open && <span className="sidebar__label">Calendario</span>}
          </button>

          <button
            className={`sidebar__btn ${active === "finanzas" ? "active" : ""}`}
          >
            <PiggyBank className="sidebar__icon" />
            {open && <span className="sidebar__label">Finanzas</span>}
          </button>

          <button
            className={`sidebar__btn ${active === "notas" ? "active" : ""}`}
          >
            <FileText className="sidebar__icon" />
            {open && <span className="sidebar__label">Notas</span>}
          </button>
        </div>

        {/* Tu flecha original */}
        <button
          className={`sidebar__arrow ${open ? "rotated" : ""}`}
          onClick={toggleSidebar}
        >
          ➤
        </button>

        {/* Botón inferior */}
        <div className="sidebar__bottom">
          <button
            className={`sidebar__btn ${active === "config" ? "active" : ""}`}
          >
            <Settings className="sidebar__icon" />
            {open && <span className="sidebar__label">Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* Overlay fuera del aside */}
      {open && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
