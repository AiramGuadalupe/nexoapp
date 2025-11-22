import React, { useState } from "react";
import { User, Lock, Accessibility, HelpCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // <-- Estado para mostrar errores

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await window.nexoAPI.login({ username, password });

    if (res.success) {
      onLogin();
    } else {
      setError(res.error); // <-- en lugar de alert()
    }
  };

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
        <Accessibility className="accessibility-icon" />
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
