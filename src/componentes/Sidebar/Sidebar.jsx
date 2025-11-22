import React, { useState } from "react";
import {
  CalendarDays,
  PiggyBank,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ active = "calendario" }) => {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>      
      {/* Contenedor de botones superiores */}
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

      {/* Botón flecha → Este va FUERA del sidebar visual */}
      <button className={`sidebar__arrow ${open ? "rotated" : ""}`} onClick={toggleSidebar}>
        <ChevronRight className="sidebar__icon" />
      </button>

      {/* Botón inferior */}
      <div className="sidebar__bottom">
        <button className={`sidebar__btn ${active === "config" ? "active" : ""}`}>
          <Settings className="sidebar__icon" />
          {open && <span className="sidebar__label">Ajustes</span>}
        </button>
      </div>

      {/* Fondo oscuro cuando está abierto */}
      {open && <div className="sidebar__overlay" onClick={toggleSidebar}></div>}
    </aside>
  );
};

export default Sidebar;
