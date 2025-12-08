import React, { useState, useRef, useEffect } from "react";
import { User, Lock, Accessibility, HelpCircle, X, Sun, Moon, Palette, Type } from "lucide-react";
import { Link } from "react-router-dom";
import "./Login.css";


const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // <-- Estado para mostrar errores
  const [accMenuOpen, setAccMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const accRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

  // Detecta modo oscuro del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => document.documentElement.classList.toggle("dark", e.matches);
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
      document.documentElement.classList.toggle("dark", dark);
    }

    if (savedPalette) {
      const palette = JSON.parse(savedPalette);
      document.documentElement.style.setProperty("--color-primary", palette.primary);
      document.documentElement.style.setProperty("--color-accent", palette.accent);
    }

    if (savedFont) {
      const index = parseInt(savedFont, 10);
      if (!isNaN(index)) {
        const sizes = ["14px", "16px", "18px"];
        document.documentElement.style.setProperty("--font-size-base", sizes[index]);
      }
    }
  }, []);

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await window.nexoAPI.login({ username, password });

    if (res.success) {
      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin();
    } else {
      setError(res.error); // <-- en lugar de alert()
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accRef.current && !accRef.current.contains(e.target)) setAccMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        <img
          src="/android-chrome-512x512.png"
          alt="Logo Nexo"
          className="login-logo"
        />

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-links">
            <a href="#" className="forgot-link">
              ¿Olvidó la contraseña?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <Link to="/registro" className="register-link">
          ¿No tienes cuenta? <strong>Regístrate</strong>
        </Link>
      </div>

      <div className="bottom-icons">
        <div className="login-acc" ref={accRef}>
          <Accessibility
            className="accessibility-icon"
            onClick={() => setAccMenuOpen((prev) => !prev)}
          />
          {accMenuOpen && (
            <div className="login-acc-menu">
              <button onClick={toggleDarkMode}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="login-acc-submenu">
                <span className="login-acc-label"><Palette size={16} /> Paleta</span>
                {palettes.map((p) => (
                  <button key={p.name} onClick={() => applyPalette(p)}>
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="login-acc-submenu">
                <span className="login-acc-label"><Type size={16} /> Tamaño</span>
                <button onClick={() => setFontIndex((i) => (i + 1) % fontSizes.length)}>
                  {fontSizes[fontIndex]}
                </button>
              </div>
            </div>
          )}
        </div>
        <HelpCircle className="help-icon" />
      </div>


      {/* Modal de error */}
      {error && (
        <div className="error-modal">
          <div className="error-content">
            <p>{error}</p>
            <button onClick={() => setError("")} className="close-btn">
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
