import React, { useState } from "react";
import "./styles/global.css"; 
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./componentes/Header/Header";
import Home from "./componentes/Home/Home";
import Login from "./componentes/Login/Login";
import Register from "./componentes/Registro/Registro";
import NotasPage from "./componentes/Notas/NotasPage";
import TitleBar from "./componentes/TitleBar/TitleBar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {isLoggedIn ? (
        <>
          {/* 🔹 Header visible solo si está logueado */}
          <Header onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/notas" element={<NotasPage />} />
            </Routes>
          </main>
        </>
      ) : (
        // 🔹 Pantallas sin header
        <Routes>
          <Route path="/" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="/registro" element={<Register onRegister={() => setIsLoggedIn(true)} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
