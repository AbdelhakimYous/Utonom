import React, { useState } from 'react';
import './form.css';

function AjouterVoiture() {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setError('');

    let imageData = null;
    if (image) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        imageData = reader.result;
        await sendData(imageData);
      };
      reader.readAsDataURL(image);
    } else {
      await sendData(null);
    }
  }

  async function sendData(imageData) {
    const url = 'http://127.0.0.1:8000/api/ajoutervoiture';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marque,
          modele,
          annee,
          image: imageData,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Erreur lors de l'ajout.");
        return;
      }
      setSuccess("Voiture ajoutée !");
      setMarque('');
      setModele('');
      setAnnee('');
      setImage(null);
      setImagePreview(null);
    } catch (e) {
      setError("Erreur réseau ou serveur.");
    }
  }

  return (
    <div className="form-bg">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Ajouter une voiture</h2>
        <input
          type="text"
          name="marque"
          placeholder="Marque"
          value={marque}
          onChange={e => setMarque(e.target.value)}
          required
        />
        <input
          type="text"
          name="modele"
          placeholder="Modèle"
          value={modele}
          onChange={e => setModele(e.target.value)}
          required
        />
        <input
          type="number"
          name="annee"
          placeholder="Année"
          value={annee}
          onChange={e => setAnnee(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: "1rem" }}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Aperçu"
            style={{ width: "100%", maxHeight: "200px", objectFit: "cover", marginBottom: "1rem", borderRadius: "8px" }}
          />
        )}
        <button type="submit">Ajouter Voiture</button>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
      </form>
    </div>
  );
}

export default AjouterVoiture;