import React, { useState } from "react";
import { User, Lock, Accessibility, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí podrías hacer validaciones o llamadas al backend
    if (username.trim() && password.trim()) {
      onLogin(); // Cambia el estado en App.js
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo principal */}
        <img
          src="/android-chrome-512x512.png"
          alt="Logo Nexo"
          className="login-logo"
        />

        {/* Formulario */}
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

        {/* Botón de registro */}
        <Link to="/registro" className="register-link">
          ¿No tienes cuenta? <strong>Regístrate</strong>
        </Link>
      </div>

      {/* Iconos inferiores (idénticos al header) */}
      <div className="bottom-icons">
        <Accessibility className="accessibility-icon" />
        <HelpCircle className="help-icon" />
      </div>
    </div>
  );
};

export default Login;
