import React, { useState } from 'react';
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
    const url = process.env.REACT_APP_API_URL + '/nouveauutilisateur/';
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
    <form onSubmit={handleSubmit}>
      <input type="text" name="nom" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
      <input type="text" name="prenom" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} required />
      <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" name="motdepasse" placeholder="Mot de passe" value={motdepasse} onChange={e => setMotdepasse(e.target.value)} required />
      <input type="text" name="nomUtilisateur" placeholder="Nom d'utilisateur" value={nomUtilisateur} onChange={e => setNomUtilisateur(e.target.value)} required />
      <input type="number" name="age" placeholder="Âge" value={age} onChange={e => setAge(e.target.value)} required />
      <button type="submit">S'inscrire</button>
    </form>
  );
}

export default Form;