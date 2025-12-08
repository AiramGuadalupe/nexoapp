import React, { useState, useRef, useEffect } from "react";
import { User, Lock, Accessibility, HelpCircle, X, Sun, Moon, Palette, Type } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";

const Registro = ({ onRegister }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    prefijo: "+34",
    acepta: false,
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);
  const [accMenuOpen, setAccMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const accRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontIndex, setFontIndex] = useState(1);
  const navigate = useNavigate();

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
      setIsDarkMode(dark);
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
    { name: "Morado", primary: "#3B1F68", accent: "#A78Bfa" },
  ];

  const applyPalette = (p) => {
    document.documentElement.style.setProperty("--color-primary", p.primary);
    document.documentElement.style.setProperty("--color-accent", p.accent);
    localStorage.setItem("nexo-palette", JSON.stringify(p));
  };

  // Tamaño de fuente
  const fontSizes = ["Pequeño", "Normal", "Grande"];
  const applyFontSize = () => {
    const sizes = ["14px", "16px", "18px"];
    document.documentElement.style.setProperty("--font-size-base", sizes[fontIndex]);
    localStorage.setItem("nexo-font-size", fontIndex.toString());
  };

  useEffect(() => {
    applyFontSize();
  }, [fontIndex]);

  // Cierra menús al clicar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accRef.current && !accRef.current.contains(e.target)) setAccMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.acepta) {
      setMessage("Debes aceptar los términos y condiciones.");
      setIsError(true);
      return;
    }

    if (!form.username || !form.password) {
      setMessage("El nombre de usuario y contraseña son obligatorios.");
      setIsError(true);
      return;
    }

    if (!form.telefono || form.telefono.trim() === "") {
      setMessage("El teléfono es obligatorio.");
      setIsError(true);
      return;
    }

    const res = await window.nexoAPI.register({
      username: form.username,
      password: form.password,
    });

    if (res.success) {
      localStorage.setItem("user", JSON.stringify(res.user));
      setMessage("Registrado correctamente. Serás redirigido...");
      setIsError(false);

      if (onRegister) onRegister();
    } else {
      setMessage(res.error);
      setIsError(true);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-header">
          <img src="/android-chrome-512x512.png" alt="Logo Nexo" className="registro-logo" />
        </div>

        <div className="registro-content">
          <div className="registro-avatar">
            <User className="avatar-icon" />
          </div>

          <form className="registro-form" onSubmit={handleRegister}>
            <div className="form-section">
              <h3>Usuario</h3>
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                onChange={handleChange}
              />
            </div>

            <div className="form-section">
              <h3>Datos personales</h3>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
              />
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                onChange={handleChange}
              />
            </div>

            <div className="form-section">
              <h3>Teléfono</h3>
              <div className="telefono-group">
                <select
                  name="prefijo"
                  value={form.prefijo}
                  onChange={handleChange}
                >
                  <option value="+34">España (+34)</option>
                  <option value="+52">México (+52)</option>
                  <option value="+54">Argentina (+54)</option>
                </select>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Número tlf"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-footer">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="acepta"
                  onChange={handleChange}
                />
                <span>Aceptar términos y condiciones</span>
              </label>
              <button type="submit" className="btn-registrar">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bottom-icons">
        <div className="registro-acc" ref={accRef}>
          <Accessibility
            className="accessibility-icon"
            onClick={() => setAccMenuOpen((prev) => !prev)}
          />
          {accMenuOpen && (
            <div className="registro-acc-menu">
              <button onClick={toggleDarkMode}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="registro-acc-submenu">
                <span className="registro-acc-label"><Palette size={16} /> Paleta</span>
                {palettes.map((p) => (
                  <button key={p.name} onClick={() => applyPalette(p)}>
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="registro-acc-submenu">
                <span className="registro-acc-label"><Type size={16} /> Tamaño</span>
                <button onClick={() => setFontIndex((i) => (i + 1) % fontSizes.length)}>
                  {fontSizes[fontIndex]}
                </button>
              </div>
            </div>
          )}
        </div>

        <HelpCircle className="help-icon" onClick={() => setHelpOpen(true)} />
      </div>

      {message && (
        <div className="message-modal">
          <div className={`message-content ${isError ? "error" : "success"}`}>
            <p>{message}</p>
            <button onClick={() => setMessage("")}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registro;