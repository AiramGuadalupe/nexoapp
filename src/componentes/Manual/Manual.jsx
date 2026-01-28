import React, { useEffect, useState } from "react";
import { X, HelpCircle, LogIn, Calendar, FileText, Settings, Shield, BookOpen, Command, PieChart } from "lucide-react";
import { useManual } from "../../context/ManualContext";
import "./Manual.css";

// Importar imágenes
import loginImg from "../../assets/manual/login.png";
import calendarioImg from "../../assets/manual/calendario.png";
import notasImg from "../../assets/manual/notas.png";
import configuracionImg from "../../assets/manual/configuracion.png";

const Manual = () => {
  const { isManualOpen, closeManual, toggleManual } = useManual();
  const [activeSection, setActiveSection] = useState("intro");

  // Listener global para F1
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        toggleManual();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleManual]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  if (!isManualOpen) return null;

  const sections = [
    { id: "intro", label: "Introducción", icon: <BookOpen size={18} /> },
    { id: "acceso", label: "Acceso y Seguridad", icon: <Shield size={18} /> },
    { id: "calendario", label: "Calendario", icon: <Calendar size={18} /> },
    { id: "notas", label: "Notas", icon: <FileText size={18} /> },
    { id: "informes", label: "Informes", icon: <PieChart size={18} /> },
    { id: "configuracion", label: "Configuración", icon: <Settings size={18} /> },
    { id: "atajos", label: "Atajos de Teclado", icon: <Command size={18} /> },
  ];

  return (
    <div className="manual-overlay" onClick={closeManual}>
      <div className="manual-container" onClick={(e) => e.stopPropagation()}>

        {/* Sidebar Index */}
        <div className="manual-sidebar">
          <div className="manual-sidebar-header">
            <h2 className="manual-sidebar-title">
              <HelpCircle size={24} /> Manual
            </h2>
          </div>
          <div className="manual-nav">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`manual-nav-item ${activeSection === section.id ? "active" : ""}`}
                onClick={() => scrollToSection(section.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {section.icon} {section.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="manual-content">
          <button className="manual-close-btn" onClick={closeManual}>
            <X size={24} />
          </button>

          <section id="intro" className="manual-section">
            <h3><BookOpen size={24} /> Introducción</h3>
            <p>
              Bienvenido al <strong>Manual de Usuario de NexoApp</strong>. Esta guía está diseñada para ayudarle a
              aprovechar al máximo todas las herramientas que ofrece nuestra plataforma. NexoApp es una solución integral
              para la gestión personal y profesional, combinando un potente calendario, un sistema de notas flexible y
              herramientas de análisis.
            </p>
            <div className="highlight-box">
              <p>
                <strong>Tip Rápido:</strong> Puede abrir este manual en cualquier momento presionando la
                tecla <kbd>F1</kbd> en su teclado.
              </p>
            </div>
          </section>

          <section id="acceso" className="manual-section">
            <h3><Shield size={24} /> Acceso y Seguridad</h3>
            <p>
              Para comenzar a utilizar NexoApp, es necesario autenticarse. Su seguridad es nuestra prioridad.
            </p>
            <ul>
              <li><strong>Inicio de Sesión:</strong> Ingrese su correo electrónico y contraseña registrados.</li>
              <li><strong>Registro:</strong> Si no tiene cuenta, use el enlace "Regístrate" para crear una nueva.</li>
              <li><strong>Errores de Acceso:</strong> Si introduce credenciales incorrectas, el sistema le avisará mediante una notificación visual.</li>
            </ul>
            <p>
              En la pantalla de login también encontrará opciones de personalización rápida en la parte inferior:
            </p>
            <ul>
              <li><span role="img" aria-label="moon">🌙</span> <strong>Modo Oscuro:</strong> Alterne entre temas claro y oscuro.</li>
              <li><strong>Tamaño de Fuente:</strong> Ajuste la legibilidad del texto.</li>
              <li><strong>Paleta de Colores:</strong> Personalice el color de acento de la aplicación.</li>
            </ul>
            <img src={loginImg} alt="Pantalla de Acceso" className="manual-img" />
          </section>

          <section id="calendario" className="manual-section">
            <h3><Calendar size={24} /> Gestión del Calendario</h3>
            <p>
              El módulo de calendario le permite organizar su tiempo eficientemente.
            </p>
            <ol>
              <li><strong>Vista Mensual:</strong> Visualice todos sus eventos del mes actual. Use las flechas superiores para cambiar de mes.</li>
              <li><strong>Crear Eventos:</strong> Haga clic en cualquier día para abrir el formulario de creación. Asigne un título y un color para categorizarlo.</li>
              <li><strong>Editar/Eliminar:</strong> Al hacer clic en un evento existente, puede modificar sus detalles o eliminarlo si ya no es relevante.</li>
            </ol>
            <img src={calendarioImg} alt="Calendario" className="manual-img" />
          </section>

          <section id="notas" className="manual-section">
            <h3><FileText size={24} /> Notas y Documentación</h3>
            <p>
              Gestione su información importante con el sistema de notas avanzado.
            </p>
            <ul>
              <li><strong>Crear Nota:</strong> Use el botón flotante <strong>"+"</strong> para añadir una nueva nota.</li>
              <li><strong>Organización:</strong> Las notas se ordenan cronológicamente. Use el buscador integrado para filtrar por palabras clave.</li>
              <li><strong>Edición en Tiempo Real:</strong> Los cambios se guardan automáticamente mientras escribe.</li>
              <li><strong>Eliminación:</strong> Use el icono de papelera en cada nota para descartarla (se pedirá confirmación).</li>
            </ul>
            <img src={notasImg} alt="Notas" className="manual-img" />
          </section>

          <section id="informes" className="manual-section">
            <h3><PieChart size={24} /> Informes y Exportación</h3>
            <p>
              NexoApp incluye capacidades de generación de informes para mantener un registro físico o digital de su actividad.
            </p>
            <p>
              Desde el panel de configuración, puede acceder a la opción <strong>"Generar Informe"</strong>. Esto creará
              un documento PDF descargable que incluye un resumen de sus eventos y notas recientes, ideal para
              respaldos o presentaciones.
            </p>
          </section>

          <section id="configuracion" className="manual-section">
            <h3><Settings size={24} /> Configuración</h3>
            <p>
              Adapte la aplicación a sus preferencias personales.
            </p>
            <ul>
              <li><strong>Perfil:</strong> Actualice su información personal.</li>
              <li><strong>Apariencia:</strong> Los ajustes de tema y color se persisten en su navegador.</li>
              <li><strong>Cerrar Sesión:</strong> Termine su sesión de forma segura para proteger sus datos en equipos compartidos.</li>
            </ul>
            <img src={configuracionImg} alt="Configuración" className="manual-img" />
          </section>

          <section id="atajos" className="manual-section">
            <h3><Command size={24} /> Atajos de Teclado</h3>
            <p>Mejore su productividad con estos atajos rápidos:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #eee)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Tecla</th>
                  <th style={{ padding: '8px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px' }}><kbd>F1</kbd></td>
                  <td style={{ padding: '8px' }}>Abrir / Cerrar este manual</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px' }}><kbd>Esc</kbd></td>
                  <td style={{ padding: '8px' }}>Cerrar ventanas modales o el manual</td>
                </tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Manual;
