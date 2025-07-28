import './App.css';
import Form from './form.js';
import Login from './login.js';
import AjouterVoiture from './ajouterVoiture.js';
import LesVoitures from './lesVoitures.js';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import Localiser from './localiser.js';
import Lesutilisateurs from './touslesutilisateurs.js';
import AfficherVns from './afficherlesvns.js';
import React from "react";
import ChatBot from './ChatBot.js';
import ReponseAdmin from './ReponseAdmin.js';


function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
      borderRadius: "16px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      margin: "2rem auto",
      maxWidth: "600px",
      padding: "2rem"
    }}>
      <h1 style={{ color: "#2d3a4b", marginBottom: "1rem" }}>Bienvenue sur Utonom</h1>
      <h2 style={{ color: "#4e5d6c", marginBottom: "2rem" }}>Trouvez votre voiture autonome idéale</h2>
      <p style={{ color: "#5a6a7a", fontSize: "1.1rem", marginBottom: "2rem", textAlign: "center" }}>
        Explorez notre sélection de véhicules autonomes, comparez les modèles, et réservez votre prochaine expérience de conduite intelligente en toute simplicité.
      </p>
      <Link to="/form">
        <button style={{
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "1rem 2rem",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,123,255,0.15)"
        }}>
          Trouver une voiture
        </button>
      </Link>
    </div>
  );
}

function About() {
  return <h2>À propos</h2>;
}

function App() {
  const [refresh, setRefresh] = React.useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const isConnected = !!role && !!userId;

  const handleLogout = () => {
    localStorage.clear();
    setRefresh(r => !r); // force le refresh du composant
  };

  return (
    <div className="App">
      <Router>
        <nav className="navbar">
          <Link to="/">Accueil</Link>
          <Link to="/form">Formulaire</Link>
          <Link to="/about">À propos</Link>
          {!isConnected && <Link to="/login">Connexion</Link>}
          {isConnected && (
            <>
              <Link to="/localiser">Chercher une voiture</Link>
              <Link to="/lesvoitures">Liste des Voitures</Link>
              <Link to="/Reponse">Reponse</Link>
              <Link to="/lesutilisateurs">les</Link>
              <Link to="/lesvns">vns</Link>
              {role === "admin" && <Link to="/ajoutervoiture">Ajouter Voiture</Link>}
              <button onClick={handleLogout} style={{
                marginLeft: "1rem",
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.2rem",
                fontSize: "1rem",
                cursor: "pointer"
              }}>
                Déconnexion
              </button>
            </>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<Form />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ajoutervoiture" element={<AjouterVoiture />} />
          <Route path="/lesvoitures" element={<LesVoitures />} /> 
          <Route path="/Reponse" element={<ReponseAdmin />} /> 
          <Route path="/localiser" element={<Localiser/>} /> 
          <Route path="/lesutilisateurs" element={<Lesutilisateurs/>} /> 
          <Route path="/lesvns" element={<AfficherVns/>} /> 
        </Routes>
      </Router>

      <div className="App">
        <ChatBot />
      </div>
    </div>

    
  );
}

export default App;