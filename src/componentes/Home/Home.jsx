import Sidebar from "../Sidebar/Sidebar";
import "../../styles/global.css";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <div className="home-container">
        <Sidebar active="calendario" />

        <main className="home-content">
          <img
            src="/android-chrome-512x512.png"
            alt="Nexo Logo"
            className="home-logo"
          />
          <h1>Bienvenido a NEXO</h1>
          <p>
            Esta es tu página principal. Desde aquí podrás acceder a todas las
            herramientas y servicios de tu aplicación.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Home;
