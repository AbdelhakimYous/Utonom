import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  Autocomplete
} from '@react-google-maps/api';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const Localiser = () => {
  const API_KEY = process.env.REACT_APP_API_GOOGLEMAP;
  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  

  const [voiture, setVoiture] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [destination, setDestination] = useState(null);

  const [directions, setDirections] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const [distanceLeft, setDistanceLeft] = useState(null);

  const [mode, setMode] = useState(null);
  const autocompleteRef = useRef(null);

  const [prix, setPrix] = useState(null);

  // Nouveaux états pour le flux
  const [adresseConfirmee, setAdresseConfirmee] = useState(false);
  const [paiementEffectue, setPaiementEffectue] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });

        try {
          const res = await fetch('https://utonom-production.up.railway.app/api/voiture-plus-proche', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude
            })
          });
          const data = await res.json();
          console.log(data);

          if (data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            setVoiture({ position: { lat, lng } });
          } else {
            alert("Aucune voiture trouvée.");

          }
        } catch (error) {
          alert("Erreur lors de l'appel API.");
          console.error(error);
        }
      },
      () => alert("Impossible d'obtenir votre position.")
    );
  }, []);

  useEffect(() => {
    if (routePath.length > 0 && stepIndex < routePath.length) {
      const interval = setInterval(() => {
        const newPos = routePath[stepIndex];
        setPosition(newPos);
        setStepIndex((prev) => prev + 1);

        const google = window.google;
        if (google && google.maps && google.maps.geometry && destination) {
          const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(newPos.lat, newPos.lng),
            new google.maps.LatLng(destination.lat, destination.lng)
          );
          setDistanceLeft(dist);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [routePath, stepIndex, destination]);

  const handleDirectionsCallback = (result, status) => {
    if (status === 'OK') {
      setDirections(result);
      const points = result.routes[0].overview_path.map(p => ({
        lat: p.lat(),
        lng: p.lng()
      }));
      setRoutePath(points);
      setPosition(points[0]);
      setStepIndex(0);

      if (destination) {
        const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(userPosition.lat, userPosition.lng),
          new window.google.maps.LatLng(destination.lat, destination.lng)
        );
        const prixCalcule = (dist / 1000 * 1.5).toFixed(2); // 1.5$/km
        setPrix(prixCalcule);
      }
    } else {
      console.error("Erreur DirectionsService :", status);
    }
  };

  const lancerSimulation = (type) => {
    if (!voiture || !userPosition) {
      alert("Chargement en cours...");
      return;
    }
    if (type === 'utilisateurVersDestination' && !destination) {
      alert("Choisissez une destination.");
      return;
    }

    let origin, destinationPoint;
    if (type === 'voitureVersUtilisateur') {
      origin = voiture.position;
      destinationPoint = userPosition;
    } else {
      origin = userPosition;
      destinationPoint = destination;
    }

    setMode(type);
    setDirections(null);
    setRoutePath([]);
    setStepIndex(0);

    const service = new window.google.maps.DirectionsService();
    service.route({
      origin,
      destination: destinationPoint,
      travelMode: 'DRIVING'
    }, handleDirectionsCallback);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setDestination({ lat, lng });
        // Reset les états quand une nouvelle destination est sélectionnée
        setAdresseConfirmee(false);
        setPaiementEffectue(false);
      } else {
        alert("Adresse invalide.");
      }
    }
  };

  const confirmerAdresse = () => {
    if (!destination) {
      alert("Veuillez d'abord sélectionner une destination.");
      return;
    }

    setAdresseConfirmee(true);

    // Calculer le prix immédiatement après confirmation
    if (userPosition && destination) {
      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userPosition.lat, userPosition.lng),
        new window.google.maps.LatLng(destination.lat, destination.lng)
      );
      const prixCalcule = (dist / 1000 * 1.5).toFixed(2); // 1.5$/km
      setPrix(prixCalcule);
    }
  };

  const renderMap = (id) => (
    <GoogleMap
      mapContainerStyle={{ height: "500px", width: "100%" }}
      center={userPosition || { lat: 45.5017, lng: -73.5673 }}
      zoom={14}
      id={id}
    >
      {directions && <DirectionsRenderer directions={directions} />}
      {position && <Marker position={position} />}
      {voiture?.position && <Marker position={voiture.position} label="🚗" />}
      {userPosition && <Marker position={userPosition} label="🧍" />}
      {destination && <Marker position={destination} label="🏁" />}
    </GoogleMap>
  );

  return (
    <LoadScript googleMapsApiKey={API_KEY} libraries={['places', 'geometry']}>
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <Autocomplete
            onLoad={ref => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Entrez une destination"
              style={{ padding: '8px', width: '350px', marginRight: '10px' }}
            />
          </Autocomplete>

          {/* Bouton Confirmer adresse - toujours visible si destination sélectionnée */}
          {destination && !adresseConfirmee && (
            <button 
              onClick={confirmerAdresse}
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              ✅ Confirmer adresse
            </button>
          )}

          {/* Section prix et paiement - visible après confirmation d'adresse */}
          {adresseConfirmee && !paiementEffectue && prix && (
            <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #ddd', borderRadius: '8px' }}>
              <h4>💵 Prix du trajet: {prix}$</h4>
              <p>Veuillez procéder au paiement pour confirmer votre course</p>
              
              {/* Bouton pour simuler un achat */}
              <button 
                onClick={() => {
                  alert("Simulation d'achat effectuée avec succès !");
                  setPaiementEffectue(true);
                }}
                style={{ 
                  backgroundColor: '#9C27B0', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  marginRight: '10px'
                }}
              >
                🎭 Simuler un achat
              </button>

              <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: { value: prix }
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(details => {
                      alert(`Paiement effectué par ${details.payer.name.given_name}`);
                      setPaiementEffectue(true); // Marquer le paiement comme effectué
                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}

          {/* Boutons de simulation - visibles seulement après paiement */}
          {paiementEffectue && voiture && (
            <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px', backgroundColor: '#f0fff0' }}>
              <h4>🎉 Paiement confirmé ! Votre course peut commencer</h4>
              
              <button 
                onClick={() => lancerSimulation('voitureVersUtilisateur')}
                style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🚗 Faire venir la voiture
              </button>

              <button
                onClick={() => lancerSimulation('utilisateurVersDestination')}
                style={{ 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🧍 Aller à la destination
              </button>
            </div>
          )}
        </div>

        {distanceLeft !== null && (
          <div style={{
            background: '#fff',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
            fontWeight: 'bold',
            border: '1px solid #ddd'
          }}>
            🚗 Distance restante : {(distanceLeft / 1000).toFixed(2)} km
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h3>🗺️ Carte 1</h3>
          {renderMap("map1")}
        </div>

        <div>
          <h3>🗺️ Carte 2</h3>
          {renderMap("map2")}
        </div>
      </div>
    </LoadScript>
  );
};

export default Localiser;