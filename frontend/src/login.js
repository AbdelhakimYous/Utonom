import React from "react";
import { useState } from "react";
import "./login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [motdepasse, setMotdepasse] = useState("");

    async function handleSubmit(e) {
    e.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/connexion';

    const response = await fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email,
        motdepasse,
    }),
});

let data;
try {
    data = await response.json();
    console.log('voila le role');
    console.log(data.roles);
    localStorage.setItem("role", data.roles[0]);
} catch (e) {
    // Affiche la vraie réponse pour debug
    const text = await response.text();
    console.error("Réponse non JSON :", text);
    return;
}
console.log(data);
    }

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={motdepasse} onChange={e => setMotdepasse(e.target.value)} required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}

export default Login;
