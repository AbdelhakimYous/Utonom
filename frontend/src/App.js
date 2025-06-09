import './App.css';
import Form from './form.js';
import Login from './login.js';
// Importe d'autres pages ici
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

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
  return (
    <div className="App">
      <Router>
        <nav>
          <Link to="/">Accueil</Link> |{' '}
          <Link to="/form">Formulaire</Link> |{' '}
          <Link to="/about">À propos</Link> |{' '}
          <Link to="/login">Connexion</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<Form />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          {/* Ajoute ici d'autres routes/pages */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;