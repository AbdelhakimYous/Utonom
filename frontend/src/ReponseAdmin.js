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
            <button onClick={() => refuserVoiture(voiture.id)} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
              Refuser
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReponseAdmin;
