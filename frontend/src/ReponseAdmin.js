import React, { useEffect, useState } from 'react';

function ReponseAdmin() {
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVoituresDisponibles = async () => {
    try {
      const res = await fetch('https://utonom-production.up.railway.app/api/voitures-disponibles');
      const data = await res.json();
      setVoitures(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des voitures', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoituresDisponibles();
  }, []);

  const accepterVoiture = async (id) => {
    try {
      const res = await fetch('https://utonom-production.up.railway.app/api/accepter-voiture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      alert(data.message);
      fetchVoituresDisponibles();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation', error);
    }
  };

  const refuserVoiture = async (id) => {
    try {
      const res = await fetch('https://utonom-production.up.railway.app/api/refuser-voiture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      alert(data.message);
      fetchVoituresDisponibles();
    } catch (error) {
      console.error('Erreur lors du refus', error);
    }
  };

  const supprimerVoiture = async (id) => {
    try {
      const res = await fetch('https://utonom-production.up.railway.app/api/supprimer-voiture', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      alert(data.message);
      fetchVoituresDisponibles();
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    }
  };

  const modifierVoiture = async (voiture) => {
    const nouvelleMarque = prompt('Nouvelle marque :', voiture.marque);
    const nouveauModele = prompt('Nouveau modèle :', voiture.modele);
    if (!nouvelleMarque || !nouveauModele) return;

    try {
      const res = await fetch('https://utonom-production.up.railway.app/api/modifier-voiture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voiture.id,
          marque: nouvelleMarque,
          modele: nouveauModele
        }),
      });
      const data = await res.json();
      alert(data.message);
      fetchVoituresDisponibles();
    } catch (error) {
      console.error('Erreur lors de la modification', error);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Voitures disponibles</h2>
      {voitures.length === 0 && <p>Aucune voiture disponible.</p>}
      <ul>
        {voitures.map(voiture => (
          <li key={voiture.id}>
            {voiture.marque} {voiture.modele} (ID: {voiture.id}) — Disponibilité: {voiture.disponible ? 'Oui' : 'Non'}
            <button onClick={() => accepterVoiture(voiture.id)} style={{ marginLeft: '10px' }}>
              Accepter
            </button>
            <button onClick={() => refuserVoiture(voiture.id)} style={{ marginLeft: '10px', backgroundColor: 'orange' }}>
              Refuser
            </button>
            <button onClick={() => modifierVoiture(voiture)} style={{ marginLeft: '10px', backgroundColor: 'blue', color: 'white' }}>
              Modifier
            </button>
            <button onClick={() => supprimerVoiture(voiture.id)} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReponseAdmin;
