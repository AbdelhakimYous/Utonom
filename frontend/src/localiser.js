import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useGeolocated } from "react-geolocated";

const carIcon = process.env.PUBLIC_URL + '/car.png';
const key = process.env.REACT_APP_API_GOOGLEMAP;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
console.log(PAYPAL_CLIENT_ID); // Ajoutez votre Client ID PayPal

const containerStyle = {
  width: '100%',
  
  maxWidth: '420px',
  height: '400px',
  borderRadius: '18px',
  boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
  border: '2px solid #e3eafc'
};

const center = {
  lat: 45.5017, // Montréal centre
  lng: -73.5673,
};

function Localiser() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: key,
    libraries: ['places'],
  });

  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    userDecisionTimeout: 5000,
  });

  const [map, setMap] = useState(null);
  const directionsRendererRef = useRef(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [distanceValue, setDistanceValue] = useState(0);
  const [destination, setDestination] = useState('');
  // NOUVEAU : Stocker les coordonnées de la destination
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [step, setStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [carToUserDistance, setCarToUserDistance] = useState('');
  const [carToUserDuration, setCarToUserDuration] = useState('');
  const [carPosition, setCarPosition] = useState(null); // voiture la plus proche
  const [userPosition, setUserPosition] = useState(null); // position simulée utilisateur
  const [mapMode, setMapMode] = useState(null); // "carToUser" ou "userToDest"
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [remainingTimeToUser, setRemainingTimeToUser] = useState(null);
const [remainingTimeToDestination, setRemainingTimeToDestination] = useState(null);
const [intervalId, setIntervalId] = useState(null);
  

  const prixParKm = 2;

  // Charger le SDK PayPal
  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      console.error('PayPal Client ID manquant. Ajoutez REACT_APP_PAYPAL_CLIENT_ID à vos variables d\'environnement.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=CAD`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => console.error('Erreur lors du chargement du SDK PayPal');
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Calculer le prix
  const prix = distanceValue > 0 ? ((distanceValue / 1000) * prixParKm).toFixed(2) : null;

  // Initialiser les boutons PayPal quand nécessaire
  useEffect(() => {
    if (paypalLoaded && showPayment && prix && prix > 0 && window.paypal) {
      initPayPalButtons();
    }
  }, [paypalLoaded, showPayment, prix, distanceValue]);


  function simulatePayment() {
  const user_id = localStorage.getItem("user_id");
  const voiture_id = carPosition?.id;
  const montant = prix;

  // Vérifications de sécurité
  if (!user_id || !voiture_id || !montant || parseFloat(montant) <= 0) {
    console.error('Données manquantes pour la simulation:', { user_id, voiture_id, montant });
    setConfirmation("❌ Erreur : informations manquantes pour la simulation de paiement.");
    return;
  }

  const paymentData = {
    user_id: parseInt(user_id),
    voiture_id: parseInt(voiture_id),
    montant: parseFloat(montant)
  };

  console.log('Simulation - Envoi des données de paiement:', paymentData);

  fetch('http://localhost:8003/api/paiements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  })
    .then(res => res.json())
    .then(data => {
      console.log('Simulation - Réponse Laravel:', data);
      if (data.paiement_id || data.id) {
        setConfirmation(`✅ SIMULATION - Paiement de ${prix} $ CAD enregistré avec succès !
          📝 ID Paiement: ${data.paiement_id || data.id}
          👤 User ID: ${user_id}
          🚗 Voiture ID: ${voiture_id}`);
      } else if (data.errors) {
        setConfirmation("❌ Erreur lors de la simulation : " + JSON.stringify(data.errors));
      } else {
        setConfirmation("❌ Erreur lors de l'enregistrement de la simulation.");
      }
      setShowPayment(false);
      setStep(1);
      setMapMode(null);
      refreshCarToUserRoute();
    })
    .catch((error) => {
      console.error('Erreur réseau simulation:', error);
      setConfirmation("❌ Erreur réseau lors de la simulation de paiement.");
      setShowPayment(false);
      setStep(1);
      setMapMode(null);
      refreshCarToUserRoute();
    });
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "0 sec";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes}min ${secs}sec`;
  } else {
    return `${secs}sec`;
  }
}

function startCountdown(type, seconds) {
  // Nettoyer l'interval existant
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  const newIntervalId = setInterval(() => {
    if (type === 'toUser') {
      setRemainingTimeToUser(prev => {
        if (prev <= 1) {
          clearInterval(newIntervalId);
          // Auto-simulation: la voiture arrive
          setTimeout(() => simulateCarArrived(), 1000);
          return 0;
        }
        return prev - 1;
      });
    } else if (type === 'toDestination') {
      setRemainingTimeToDestination(prev => {
        if (prev <= 1) {
          clearInterval(newIntervalId);
          // Auto-simulation: arrivée à destination
          setTimeout(() => simulateUserAndCarArrived(), 1000);
          return 0;
        }
        return prev - 1;
      });
    }
  }, 1000);
  
  setIntervalId(newIntervalId);
}

function calculateUserToDestinationTime() {
  if (!window.google || !coords || !destinationCoords) return;
  
  const directionsService = new window.google.maps.DirectionsService();
  directionsService.route(
    {
      origin: { lat: coords.latitude, lng: coords.longitude },
      destination: { lat: destinationCoords.latitude, lng: destinationCoords.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === 'OK') {
        const leg = response.routes[0].legs[0];
        const durationInSeconds = leg.duration.value;
        setRemainingTimeToDestination(durationInSeconds);
        startCountdown('toDestination', durationInSeconds);
      }
    }
  );
}

  function initPayPalButtons() {
    // Nettoyer les boutons existants
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    // Vérifications de sécurité
    if (!window.paypal || !prix || parseFloat(prix) <= 0) {
      console.warn('PayPal non disponible ou prix invalide:', { paypal: !!window.paypal, prix });
      return;
    }

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 40
        },
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: prix,
                currency_code: 'CAD'
              },
              description: `Transport Utonom - ${distance} (${duration})`
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            // Paiement réussi, maintenant enregistrer dans Laravel
            handlePaymentSuccess(details);
          });
        },
        onError: function(err) {
          console.error('Erreur PayPal:', err);
          setConfirmation('❌ Erreur lors du paiement PayPal.');
          setShowPayment(false);
          setStep(1);
          setMapMode(null);
          refreshCarToUserRoute();
        },
        onCancel: function(data) {
          console.log('Paiement annulé:', data);
          setConfirmation('⚠️ Paiement annulé.');
        }
      }).render('#paypal-button-container');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation PayPal:', error);
      setConfirmation('❌ Erreur lors de l\'initialisation du paiement.');
    }
  }

function refreshCarToUserRoute(position = carPosition) {
  if (!window.google || !coords || !position) return;
  
  const directionsService = new window.google.maps.DirectionsService();
  directionsService.route(
    {
      origin: position,
      destination: { lat: coords.latitude, lng: coords.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === 'OK') {
        const leg = response.routes[0].legs[0];
        setCarToUserDistance(leg.distance.text);
        setCarToUserDuration(leg.duration.text);
        
        // NOUVEAU: Démarrer le countdown en temps réel
        const durationInSeconds = leg.duration.value;
        setRemainingTimeToUser(durationInSeconds);
        startCountdown('toUser', durationInSeconds);
      }
    }
  );
}


  function getRouteUtilisateurVersDestination(e) {
    e.preventDefault();
    setDistance('');
    setDuration('');
    setDistanceValue(0);
    setShowPayment(false);
    setConfirmation('');
    setMapMode(null);
    // NOUVEAU : Reset des coordonnées de destination
    setDestinationCoords(null);

    if (!window.google || !map) return;

    const originUser = coords
      ? { lat: coords.latitude, lng: coords.longitude }
      : null;

    if (!originUser) {
      alert("Localisation non disponible !");
      return;
    }
    if (!destination) {
      alert("Veuillez entrer une destination.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
      directionsRendererRef.current.setMap(map);
    }

    directionsService.route(
      {
        origin: originUser,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(response);
          const leg = response.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
          setDistanceValue(leg.distance.value);
          
          // NOUVEAU : Sauvegarder les coordonnées de la destination
          const destinationLocation = leg.end_location;
          setDestinationCoords({
            latitude: destinationLocation.lat(),
            longitude: destinationLocation.lng()
          });
          console.log('Coordonnées de destination sauvegardées:', {
            latitude: destinationLocation.lat(),
            longitude: destinationLocation.lng()
          });
          
          setShowPayment(true);
        } else {
          alert('Directions request failed due to ' + status);
        }
      }
    );
  }

  // Fonction appelée après un paiement PayPal réussi
  function handlePaymentSuccess(paypalDetails) {
    const user_id = localStorage.getItem("user_id");
    const voiture_id = carPosition?.id;
    const montant = prix;

    // Vérifications de sécurité renforcées
    if (!user_id || !voiture_id || !montant || parseFloat(montant) <= 0) {
      console.error('Données manquantes:', { user_id, voiture_id, montant });
      setConfirmation("❌ Erreur : informations de paiement manquantes.");
      setShowPayment(false);
      setStep(1);
      setMapMode(null);
      refreshCarToUserRoute();
      return;
    }

    const paymentData = {
      user_id: parseInt(user_id),
      voiture_id: parseInt(voiture_id),
      montant: parseFloat(montant),
      paypal_transaction_id: paypalDetails.id || '',
      paypal_payer_email: paypalDetails.payer?.email_address || '',
      paypal_status: paypalDetails.status || 'COMPLETED'
    };

    console.log('Envoi des données de paiement:', paymentData);

    fetch('http://localhost:8003/api/paiements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Réponse Laravel:', data);
        if (data.paiement_id) {
          setConfirmation(`✅ Paiement de ${prix} $ CAD effectué avec succès !
            🔗 ID PayPal: ${paypalDetails.id}
            📝 ID Laravel: ${data.paiement_id}`);
        } else if (data.errors) {
          setConfirmation("❌ Erreur lors de l'enregistrement : " + JSON.stringify(data.errors));
        } else {
          setConfirmation("❌ Erreur lors de l'enregistrement du paiement.");
        }
        setShowPayment(false);
        setStep(1);
        setMapMode(null);
        refreshCarToUserRoute();
      })
      .catch((error) => {
        console.error('Erreur réseau:', error);
        setConfirmation("❌ Erreur réseau lors de l'enregistrement du paiement.");
        setShowPayment(false);
        setStep(1);
        setMapMode(null);
        refreshCarToUserRoute();
      });
  }

function simulateCarArrived() {
  if (coords) {
    const newCarPosition = { 
      latitude: coords.latitude, 
      longitude: coords.longitude,
      id: carPosition?.id || 1
    };
    setCarPosition(newCarPosition);
    setMapMode(null);
    setRemainingTimeToUser(0);
    
    // Nettoyer les intervals
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Démarrer le countdown vers la destination
    setTimeout(() => {
      if (destinationCoords) {
        calculateUserToDestinationTime();
        setConfirmation('🚗 La voiture est arrivée ! En route vers la destination...');
      } else {
        setConfirmation('🚗 La voiture est arrivée à votre position !');
      }
    }, 200);
  }
}


// NOUVEAU : Fonction modifiée pour utiliser les coordonnées de la destination
function simulateUserAndCarArrived() {
  if (destinationCoords) {
    const destinationPosition = { 
      latitude: destinationCoords.latitude, 
      longitude: destinationCoords.longitude,
      id: carPosition?.id || 1
    };
    
    setCarPosition(destinationPosition);
    setUserPosition(destinationPosition);
    setMapMode(null);
    setRemainingTimeToDestination(0);
    
    // Nettoyer les intervals
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({routes: []});
    }
    
    setTimeout(() => {
      setConfirmation('🎉 Arrivée à destination ! Bon voyage !');
    }, 200);
  }
}

// 8. Ajouter un useEffect pour nettoyer les intervals au démontage
useEffect(() => {
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [intervalId]);

  // Fonction unique pour tout faire en un clic
  function envoyerGeolocalisation() {
    if (!coords) {
      alert("Localisation non disponible !");
      return;
    }
    fetch('http://localhost:8000/api/voiture-plus-proche', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          setCarPosition(data); // on garde tout l'objet pour avoir l'id
          setConfirmation('🚗 Voiture la plus proche trouvée !');
          setStep(2); // Passe directement à l'étape destination
        } else {
          setConfirmation('❌ Aucune voiture trouvée.');
        }
      })
      .catch(() => setConfirmation('❌ Erreur lors de la recherche.'));
  }



  return isLoaded ? (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 60%, #f7d9e3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "2rem 0",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
      }}
    >
      <div style={{
        background: "rgba(255,255,255,0.98)",
        borderRadius: "28px",
        boxShadow: "0 12px 40px rgba(44,62,80,0.18)",
        padding: "2.5rem 2rem",
        marginTop: "2rem",
        maxWidth: "480px",
        width: "95%"
      }}>
        <h2 style={{
          textAlign: "center",
          color: "#2d3a4b",
          marginBottom: "1.5rem",
          fontWeight: 800,
          letterSpacing: "0.02em",
          fontSize: "2rem"
        }}>
          🚗 Utonom Montréal
        </h2>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={setMap}
          onUnmount={() => setMap(null)}
        >
{carPosition && (
  <Marker
    position={{ lat: carPosition.latitude, lng: carPosition.longitude }}
    icon={{
      url: carIcon,
      scaledSize: { width: 44, height: 44 }
    }}
    title={userPosition && userPosition.latitude === carPosition.latitude && userPosition.longitude === carPosition.longitude 
      ? "🎉 Voiture arrivée à destination" 
      : `Voiture ${carPosition.id || 'autonome'}`}
  />
)}

{/* Marker pour l'utilisateur */}
{userPosition ? (
  <Marker
    position={{ lat: coords.latitude, lng: coords.longitude }}
    label="👤"
    title="🎯 Vous êtes arrivé à destination"
  />
) : coords && (
  <Marker
    position={{ lat: coords.latitude, lng: coords.longitude }}
    label="👤"
    title="Votre position actuelle"
  />
)}

{/* NOUVEAU : Marker pour la destination si elle existe */}
{destinationCoords && !userPosition && (
  <Marker
    position={{ lat: destinationCoords.latitude, lng: destinationCoords.longitude }}
    label="🎯"
    title="Destination"
  />
)}
        </GoogleMap>
        
        {step === 1 && (
          <button
            style={{
              marginTop: "1rem",
              padding: "0.8rem 2.2rem",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1.15rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,123,255,0.12)",
              transition: "background 0.2s",
              width: "100%"
            }}
            onClick={envoyerGeolocalisation}
          >
            Chercher la voiture la plus proche (API Laravel)
          </button>
        )}
        
        {step === 2 && (
          <form onSubmit={getRouteUtilisateurVersDestination} style={{ marginTop: "1.5rem" }}>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Entrez votre destination"
              style={{
                padding: "0.8rem",
                borderRadius: "12px",
                border: "1.5px solid #cfd8dc",
                width: "100%",
                fontSize: "1.08rem",
                marginBottom: "1rem",
                boxSizing: "border-box"
              }}
            />
            <button type="submit" style={{
              padding: "0.8rem 2.2rem",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #28a745 0%, #00c851 100%)",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1.15rem",
              cursor: "pointer",
              transition: "background 0.2s",
              width: "100%"
            }}>
              Calculer le trajet et le prix
            </button>
          </form>
        )}
        
<div id="msg" style={{ margin: "1.5rem 0", textAlign: "center", fontSize: "1.08rem" }}>
  {distance && duration && (
    <div style={{
      background: "rgba(40, 167, 69, 0.1)",
      padding: "1rem",
      borderRadius: "12px",
      border: "1px solid rgba(40, 167, 69, 0.2)"
    }}>
      {step === 1 ? (
        <>
          {remainingTimeToUser !== null && remainingTimeToUser > 0 ? (
            <>
              ⏰ La voiture arrive dans <b style={{color: "#dc3545"}}>{formatTime(remainingTimeToUser)}</b>
              <br />
              <span style={{ color: "#007bff", fontSize: "0.9em" }}>
                (distance totale : {carToUserDistance || distance})
              </span>
            </>
          ) : remainingTimeToUser === 0 ? (
            <>
              <span style={{color: "#28a745", fontWeight: "bold"}}>🚗 Voiture arrivée !</span>
              <br />
              {remainingTimeToDestination !== null && remainingTimeToDestination > 0 && (
                <>
                  <br />
                  🎯 Trajet vers destination dans <b style={{color: "#ff9800"}}>{formatTime(remainingTimeToDestination)}</b>
                  <br />
                  <span style={{ color: "#666", fontSize: "0.9em" }}>
                    📏 Distance : {distance}
                  </span>
                </>
              )}
            </>
          ) : (
            <>La voiture arrive dans <b>{duration}</b> <span style={{ color: "#007bff" }}>(distance : {distance})</span></>
          )}
        </>
      ) : (
        <>
          🎯 Distance totale : <span style={{ color: "#28a745" }}>{distance}</span><br/>
          {remainingTimeToDestination !== null && remainingTimeToDestination > 0 ? (
            <>
              ⏰ Arrivée à destination dans <b style={{color: "#dc3545"}}>{formatTime(remainingTimeToDestination)}</b>
            </>
          ) : remainingTimeToDestination === 0 ? (
            <span style={{color: "#28a745", fontWeight: "bold"}}>🎉 Arrivé à destination !</span>
          ) : (
            <>⏱️ Temps de trajet estimé : <b>{duration}</b></>
          )}
          <br/>
          {prix && (
            <>💰 Prix : <b style={{ color: "#ff9800", fontSize: "1.2em" }}>{prix} $ CAD</b></>
          )}
        </>
      )}
    </div>
  )}
  {!coords && (
    <div style={{ 
      color: "#dc3545", 
      background: "rgba(220, 53, 69, 0.1)",
      padding: "1rem",
      borderRadius: "12px",
      border: "1px solid rgba(220, 53, 69, 0.2)"
    }}>
      📍 Localisation non disponible. Autorisez la géolocalisation pour utiliser cette fonctionnalité.
    </div>
  )}
</div>


{showPayment && prix && parseFloat(prix) > 0 && (
  <div style={{ 
    textAlign: "center", 
    marginBottom: "1.2rem",
    background: "rgba(0, 123, 255, 0.05)",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(0, 123, 255, 0.1)"
  }}>
    <h3 style={{ 
      color: "#2d3a4b", 
      marginBottom: "1rem",
      fontSize: "1.2rem"
    }}>
      💳 Paiement sécurisé
    </h3>
    <p style={{ 
      marginBottom: "1rem", 
      color: "#666",
      fontSize: "1rem" 
    }}>
      Montant à payer : <strong>{prix} $ CAD</strong>
    </p>
    
    {/* Bouton de simulation de paiement */}
    <button
      onClick={simulatePayment}
      style={{
        padding: "0.8rem 2rem",
        borderRadius: "12px",
        background: "linear-gradient(90deg, #17a2b8 0%, #20c997 100%)",
        color: "#fff",
        border: "none",
        fontWeight: "bold",
        fontSize: "1.1rem",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(23, 162, 184, 0.3)",
        transition: "all 0.3s ease",
        marginBottom: "1rem",
        width: "100%",
        maxWidth: "300px"
      }}
      onMouseEnter={e => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 16px rgba(23, 162, 184, 0.4)";
      }}
      onMouseLeave={e => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 12px rgba(23, 162, 184, 0.3)";
      }}
    >
      🧪 SIMULATION - Payer maintenant
    </button>
    
    <div style={{ 
      fontSize: "0.85rem", 
      color: "#666", 
      fontStyle: "italic",
      marginTop: "0.5rem" 
    }}>
      Mode test - Insère directement en base de données
    </div>
    
    {paypalLoaded && window.paypal ? (
      <>
        <div style={{ 
          margin: "1rem 0", 
          color: "#999", 
          fontSize: "0.9rem" 
        }}>
          ou
        </div>
        <div id="paypal-button-container" style={{ 
          marginTop: "1rem",
          maxWidth: "300px",
          margin: "1rem auto 0"
        }}></div>
      </>
    ) : (
      <div style={{ 
        padding: "1rem", 
        color: "#666",
        fontStyle: "italic",
        marginTop: "1rem"
      }}>
        ⏳ Chargement PayPal...
        {!PAYPAL_CLIENT_ID && (
          <div style={{ color: "#dc3545", marginTop: "0.5rem" }}>
            ⚠️ Client ID PayPal manquant
          </div>
        )}
      </div>
    )}
  </div>
)}

        {confirmation && (
          <div style={{
            textAlign: "center",
            margin: "1.5rem 0",
            background: confirmation.includes('❌') 
              ? "rgba(220, 53, 69, 0.1)" 
              : "rgba(40, 167, 69, 0.1)",
            padding: "1.5rem",
            borderRadius: "16px",
            border: confirmation.includes('❌') 
              ? "1px solid rgba(220, 53, 69, 0.2)" 
              : "1px solid rgba(40, 167, 69, 0.2)",
            color: confirmation.includes('❌') ? "#dc3545" : "#388e3c",
            fontWeight: "bold",
            fontSize: "1.08rem",
            whiteSpace: "pre-line"
          }}>
            {confirmation}
            {carToUserDistance && carToUserDuration && (
              <>
                <br /><br />
                🚗 La voiture arrive dans <b>{carToUserDuration}</b> <span style={{ color: "#007bff" }}>(distance : {carToUserDistance})</span>
              </>
            )}
            <br />
            <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              <button
                style={{
                  background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.2rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={() => setMapMode("carToUser")}
              >
                🗺️ Voir trajet voiture→vous
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #28a745 0%, #00c851 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.2rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={() => setMapMode("userToDest")}
              >
                🎯 Voir votre trajet
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)",
                  color: "#222",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.2rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={simulateCarArrived}
              >
                ⚡ Simulation : voiture arrivée
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #ff5722 0%, #ff7043 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.2rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={simulateUserAndCarArrived}
              >
                🏁 Simulation : arrivée destination
              </button>
            </div>
          </div>
        )}
        
        {mapMode === "carToUser" && coords && carPosition && (
          <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <h3 style={{ color: "#2d3a4b", fontWeight: 700, marginBottom: "1rem" }}>
              🚗➡️👤 Trajet voiture vers vous
            </h3>
            <iframe
              title="Voiture vers utilisateur"
              width="100%"
              height="300"
              style={{ 
                border: 0, 
                borderRadius: "14px", 
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                maxWidth: "400px"
              }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${carPosition.latitude},${carPosition.longitude}&destination=${coords.latitude},${coords.longitude}`}
            />
          </div>
        )}
        
        {mapMode === "userToDest" && coords && destination && (
          <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <h3 style={{ color: "#2d3a4b", fontWeight: 700, marginBottom: "1rem" }}>
              🎯 Votre trajet vers la destination
            </h3>
            <iframe
              title="Trajet souhaité"
              width="100%"
              height="300"
              style={{ 
                border: 0, 
                borderRadius: "14px", 
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                maxWidth: "400px"
              }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(destination)}`}
            />
          </div>
        )}
        
        <div style={{
          textAlign: "center",
          marginTop: "2.5rem",
          color: "#b0b8c1",
          fontSize: "0.98rem",
          borderTop: "1px solid rgba(176, 184, 193, 0.2)",
          paddingTop: "1.5rem"
        }}>
          Utonom © 2025 – Montréal 🍁
        </div>
      </div>
    </div>
  ) : <></>;
}

export default React.memo(Localiser);