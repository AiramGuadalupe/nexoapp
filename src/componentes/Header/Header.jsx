import React, { useEffect, useState, useRef } from "react";
import { HelpCircle, Accessibility, User, LogOut, Sun, Moon, Palette, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import "./HeaderAccesibilidad.css"; // ← solo estilos nuevos

const Header = ({ onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accMenuOpen, setAccMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const accRef = useRef(null);
  const navigate = useNavigate();

  // Detecta modo oscuro del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Carga preferencias guardadas
  useEffect(() => {
    const savedDark = localStorage.getItem("nexo-dark-mode");
    const savedPalette = localStorage.getItem("nexo-palette");
    const savedFont = localStorage.getItem("nexo-font-size");

    if (savedDark !== null) {
      const dark = JSON.parse(savedDark);
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
    }

    if (savedPalette) {
      const palette = JSON.parse(savedPalette);
      applyPalette(palette);
    }

    if (savedFont) {
      const index = parseInt(savedFont, 10);
      if (!isNaN(index)) setFontIndex(index);
    }
  }, []);

  // Cierra menús al clicar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (accRef.current && !accRef.current.contains(e.target)) setAccMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const logoImg = document.querySelector(".header__logo");
    if (logoImg) {
      logoImg.src = isDark
        ? "/android-chrome-light-512x512.png"
        : "/android-chrome-512x512.png";
    }
  }, [isDarkMode]); 
  // Alterna modo oscuro/claro
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("nexo-dark-mode", JSON.stringify(newMode));
  };

  // Paletas de color
  const palettes = [
    { name: "Azul", primary: "#0B3549", accent: "#1a7097" },
    { name: "Verde", primary: "#0A4D3C", accent: "#34D399" },
    { name: "Morado", primary: "#3B1F68", accent: "#A78BFA" },
  ];

  const applyPalette = (p) => {
    document.documentElement.style.setProperty("--color-primary", p.primary);
    document.documentElement.style.setProperty("--color-accent", p.accent);
    localStorage.setItem("nexo-palette", JSON.stringify(p));
  };

  // Tamaño de fuente
  const fontSizes = ["Pequeño", "Normal", "Grande"];
  const [fontIndex, setFontIndex] = useState(1);
  const applyFontSize = () => {
    const sizes = ["14px", "16px", "18px"];
    document.documentElement.style.setProperty("--font-size-base", sizes[fontIndex]);
    localStorage.setItem("nexo-font-size", fontIndex.toString());
  };

  useEffect(() => {
    applyFontSize();
  }, [fontIndex]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__left">
        <img src="/android-chrome-512x512.png" alt="Logo Nexo" className="header__logo" />
      </div>

      <div className="header__right">
        <HelpCircle className="header__icon" />

        {/* Botón accesibilidad con menú desplegable */}
        <div className="header__acc" ref={accRef}>
          <Accessibility
            className="header__icon"
            onClick={() => setAccMenuOpen((prev) => !prev)}
          />
          {accMenuOpen && (
            <div className="acc-menu">
              <button onClick={toggleDarkMode}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="acc-submenu">
                <span className="acc-label"><Palette size={16} /> Paleta</span>
                {palettes.map((p) => (
                  <button key={p.name} onClick={() => applyPalette(p)}>
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="acc-submenu">
                <span className="acc-label"><Type size={16} /> Tamaño</span>
                <button onClick={() => setFontIndex((i) => (i + 1) % fontSizes.length)}>
                  {fontSizes[fontIndex]}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="header__user" ref={menuRef}>
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