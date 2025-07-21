import React, { useState } from "react";
import "./login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [motdepasse, setMotdepasse] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
    const url = 'https://utonom-production-b201.up.railway.app/api/connexion';

        try {
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

            if (!response.ok) {
                const errorText = await response.text(); // lire le body UNE seule fois
                console.error("Erreur côté serveur :", errorText);
                return;
            }

            const data = await response.json(); // lire le JSON ici si ok
            console.log("Connexion réussie !");
            console.log("Rôle :", data.roles);

            localStorage.setItem("role", data.roles);
            localStorage.setItem("user_id", data.id);
            console.log(data.id);

        } catch (error) {
            console.error("Erreur réseau ou autre :", error);
        }
    }

    return (
        <div>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={motdepasse}
                    onChange={e => setMotdepasse(e.target.value)}
                    required
                />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}

export default Login;
