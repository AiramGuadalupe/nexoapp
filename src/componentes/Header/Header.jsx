import React, { useEffect, useState, useRef } from "react";
import { HelpCircle, Accessibility, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Detecta si el sistema está en modo oscuro
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Cierra sesión y redirige al login
  const handleLogout = () => {
    onLogout(); // actualiza el estado global en App.jsx
    navigate("/"); // redirige al login
  };

  const logoSrc = isDarkMode
    ? "/android-chrome-512x512.png"
    : "/android-chrome-512x512.png";

  return (
    <header className="header">
      <div className="header__left">
        <img src={logoSrc} alt="Logo Nexo" className="header__logo" />
      </div>

      <div className="header__right" ref={menuRef}>
        <HelpCircle className="header__icon" />
        <Accessibility className="header__icon" />

        <div className="header__user">
          <User
            className="header__icon"
            onClick={() => setMenuOpen((prev) => !prev)}
          />
          {menuOpen && (
            <div className="user-menu">
              <button onClick={handleLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
