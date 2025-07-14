import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import './form.css';

function Form() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [age, setAge] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const url = 'http://127.0.0.1:8000/api/nouveauutilisateur';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom,
        prenom,
        email,
        motdepasse,
        nomUtilisateur,
        age,
      }),
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <GoogleOAuthProvider clientId="793678313638-mp6si08de9523kr10b05mqu938s78rfa.apps.googleusercontent.com">
      <form onSubmit={handleSubmit}>
        <input type="text" name="nom" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
        <input type="text" name="prenom" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} required />
        <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" name="motdepasse" placeholder="Mot de passe" value={motdepasse} onChange={e => setMotdepasse(e.target.value)} required />
        <input type="text" name="nomUtilisateur" placeholder="Nom d'utilisateur" value={nomUtilisateur} onChange={e => setNomUtilisateur(e.target.value)} required />
        <input type="number" name="age" placeholder="Âge" value={age} onChange={e => setAge(e.target.value)} required />
        <button type="submit">S'inscrire</button>
        <div style={{ margin: "1rem 0", textAlign: "center" }}>
          <GoogleLogin
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
            }}
            onError={() => {
              console.log('Google Login Failed');
            }}
          />
        </div>
      </form>
    </GoogleOAuthProvider>
  );
}

export default Form;