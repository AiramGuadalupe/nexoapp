import React, { useState } from "react";
import { User, Accessibility, HelpCircle } from "lucide-react";
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

  const [message, setMessage] = useState(""); // Mensaje de modal
  const [isError, setIsError] = useState(true); // Diferencia error o éxito

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validaciones
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

    try {
      const res = await window.nexoAPI.register({
        username: form.username,
        password: form.password,
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: `${form.prefijo} ${form.telefono}`,
      });

      if (res.success) {
        setMessage("Registrado correctamente. Ahora inicia sesión.");
        setIsError(false);
        if (onRegister) onRegister();
      } else {
        setMessage(res.error);
        setIsError(true);
      }
    } catch (err) {
      setMessage("Ocurrió un error inesperado.");
      setIsError(true);
      console.error(err);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-header">
          <img
            src="/android-chrome-512x512.png"
            alt="Logo Nexo"
            className="registro-logo"
          />
        </div>

        <div className="registro-content">
          <div className="registro-avatar">
            <User className="avatar-icon" />
          </div>

          <form className="registro-form" onSubmit={handleRegister}>
            {/* Usuario */}
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

            {/* Datos personales */}
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

            {/* Teléfono */}
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

            {/* Footer */}
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
        <Accessibility className="accessibility-icon" />
        <HelpCircle className="help-icon" />
      </div>

      {/* Modal de mensaje */}
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
