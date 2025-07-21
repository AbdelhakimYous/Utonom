import React, { useState } from 'react';
import './form.css';

function AjouterVoiture() {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('marque', marque);
    formData.append('modele', modele);
    formData.append('immatriculation', immatriculation);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (image) formData.append('image', image);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/creervoiture', {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });


      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'ajout de la voiture.");
      } else {
        setSuccess("Voiture ajoutée !");
        setMarque('');
        setModele('');
        setImmatriculation('');
        setLatitude('');
        setLongitude('');
        setImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError("Erreur réseau ou serveur.");
    }
  };

  return (
    <div className="form-bg">
      <form className="form-container" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Ajouter une voiture</h2>

        <input
          type="text"
          placeholder="Marque"
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Modèle"
          value={modele}
          onChange={(e) => setModele(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Immatriculation"
          value={immatriculation}
          onChange={(e) => setImmatriculation(e.target.value)}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Aperçu"
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "cover",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
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
