import React from "react";
import { User, Accessibility, HelpCircle } from "lucide-react";
import "./Registro.css";

const Registro = () => {
  return (
    <div className="registro-page">
      <div className="registro-container">
        {/* Logo superior */}
        <div className="registro-header">
          <img
            src="/android-chrome-512x512.png"
            alt="Logo Nexo"
            className="registro-logo"
          />
        </div>

        {/* Contenido principal */}
        <div className="registro-content">
          {/* Icono grande de usuario */}
          <div className="registro-avatar">
            <User className="avatar-icon" />
          </div>

          {/* Formulario */}
          <form className="registro-form">
            <div className="form-section">
              <h3>Usuario</h3>
              <input type="text" placeholder="Nombre de usuario" />
              <input type="password" placeholder="Contraseña" />
            </div>

            <div className="form-section">
              <h3>Datos personales</h3>
              <input type="text" placeholder="Nombre" />
              <input type="text" placeholder="Apellidos" />
            </div>

            <div className="form-section">
              <h3>Teléfono</h3>
              <div className="telefono-group">
                <select>
                  <option>España (+34)</option>
                  <option>México (+52)</option>
                  <option>Argentina (+54)</option>
                </select>
                <input type="text" placeholder="Número tlf" />
              </div>
            </div>

            <div className="form-footer">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span>Aceptar términos y condiciones</span>
              </label>
              <button type="submit" className="btn-registrar">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Iconos inferiores */}
      <div className="bottom-icons">
        <Accessibility className="accessibility-icon" />
        <HelpCircle className="help-icon" />
      </div>
    </div>
  );
};

export default Registro;
