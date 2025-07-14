import React, { useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useGeolocated } from "react-geolocated";
const carIcon = process.env.PUBLIC_URL + '/car.png';
const key = process.env.REACT_APP_API_GOOGLEMAP;

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

const defaultCarPosition = {
  lat: 45.508888, // Place Ville-Marie
  lng: -73.566111,
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
  const [step, setStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [carToUserDistance, setCarToUserDistance] = useState('');
  const [carToUserDuration, setCarToUserDuration] = useState('');
  const [carPosition, setCarPosition] = useState(defaultCarPosition);
  const [userPosition, setUserPosition] = useState(null); // position simulée utilisateur
  const [mapMode, setMapMode] = useState(null); // "carToUser" ou "userToDest"

  const prixParKm = 2;

  function refreshCarToUserRoute(position = carPosition) {
    if (!window.google || !coords) return;
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
        }
      }
    );
  }

  function getRouteVoitureVersUtilisateur(e) {
    e.preventDefault();
    setDistance('');
    setDuration('');
    setDistanceValue(0);
    setShowPayment(false);
    setConfirmation('');
    setMapMode(null);
    setUserPosition(null); // reset simulation user

    if (!window.google || !map) return;

    const origin = carPosition;
    const destinationUser = coords
      ? { lat: coords.latitude, lng: coords.longitude }
      : null;

    if (!destinationUser) {
      alert("Localisation non disponible !");
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
        origin,
        destination: destinationUser,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(response);
          const leg = response.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
          setCarToUserDistance(leg.distance.text);
          setCarToUserDuration(leg.duration.text);
          setDistanceValue(0);
          setStep(2);
        } else {
          alert('Directions request failed due to ' + status);
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
          setShowPayment(true);
        } else {
          alert('Directions request failed due to ' + status);
        }
      }
    );
  }

  function handlePayment() {
    setConfirmation(`Paiement de ${prix} $ CAD effectué !`);
    setShowPayment(false);
    setStep(1);
    setMapMode(null);
    refreshCarToUserRoute();
  }

  function simulateCarArrived() {
    if (coords) {
      setCarPosition({ lat: coords.latitude, lng: coords.longitude });
      setMapMode(null);
      setTimeout(() => {
        refreshCarToUserRoute({ lat: coords.latitude, lng: coords.longitude });
      }, 200);
    }
  }

  // Nouvelle fonction de simulation voiture + utilisateur arrivés à destination
  function simulateUserAndCarArrived() {
    if (!destination) {
      alert("Veuillez entrer une destination pour la simulation.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const newPos = { lat: loc.lat(), lng: loc.lng() };
        
        setCarPosition(newPos);
        setUserPosition(newPos);
        setDistance('');
        setDuration('');
        setShowPayment(false);
        setConfirmation('Simulation : Vous et la voiture êtes arrivés à destination !');
        setStep(1);
        setMapMode(null);

        if (directionsRendererRef.current) {
          directionsRendererRef.current.set('directions', null);
        }
      } else {
        alert("Impossible de géocoder la destination pour la simulation : " + status);
      }
    });
  }

  const prix = distanceValue ? ((distanceValue / 1000) * prixParKm).toFixed(2) : null;

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
          <Marker
            position={carPosition}
            icon={{
              url: carIcon,
              scaledSize: { width: 44, height: 44 }
            }}
          />
          {(userPosition || coords) && (
            <Marker
              position={userPosition || { lat: coords.latitude, lng: coords.longitude }}
              label="👤"
            />
          )}
        </GoogleMap>
        {step === 1 && (
          <form onSubmit={getRouteVoitureVersUtilisateur} style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button type="submit" style={{
              padding: "0.8rem 2.2rem",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1.15rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,123,255,0.12)",
              transition: "background 0.2s"
            }}>
              Appeler la voiture la plus proche
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={getRouteUtilisateurVersDestination} style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Entrez votre destination"
              style={{
                padding: "0.8rem",
                borderRadius: "12px",
                border: "1.5px solid #cfd8dc",
                width: "70%",
                fontSize: "1.08rem",
                marginBottom: "0.5rem"
              }}
            />
            <button type="submit" style={{
              marginLeft: "1rem",
              padding: "0.8rem 2.2rem",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #28a745 0%, #00c851 100%)",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1.15rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }}>
              Aller à la destination
            </button>
          </form>
        )}
        <div id="msg" style={{ margin: "1.5rem 0", textAlign: "center", fontSize: "1.08rem" }}>
          {distance && duration && (
            <span>
              {step === 1
                ? <>La voiture arrive dans <b>{duration}</b> <span style={{ color: "#007bff" }}>(distance : {distance})</span></>
                : <>
                    Vous arriverez à destination dans <b>{duration}</b> <span style={{ color: "#28a745" }}>(distance : {distance})</span>
                    {prix && (
                      <><br />Prix estimé : <b style={{ color: "#ff9800" }}>{prix} $ CAD</b></>
                    )}
                  </>
              }
            </span>
          )}
          {!coords && (
            <div style={{ color: "red" }}>
              Localisation non disponible. Autorisez la géolocalisation pour utiliser cette fonctionnalité.
            </div>
          )}
        </div>
        {showPayment && (
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <button
              style={{
                background: "linear-gradient(90deg, #ffc107 0%, #ff9800 100%)",
                color: "#222",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2.2rem",
                fontSize: "1.15rem",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginRight: "1rem"
              }}
              onClick={handlePayment}
            >
              Payer {prix} $ CAD
            </button>
            <button
              style={{
                background: "#0070ba",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2.2rem",
                fontSize: "1.15rem",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "inline-flex",
                alignItems: "center"
              }}
              onClick={() => {
                handlePayment();
                alert('Paiement PayPal fictif effectué !');
              }}
            >
              <img
                src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                alt="PayPal"
                style={{ height: "24px", marginRight: "0.5rem" }}
              />
              Payer avec PayPal
            </button>
          </div>
        )}
        {confirmation && (
          <div style={{
            textAlign: "center",
            margin: "1.5rem 0",
            color: "#388e3c",
            fontWeight: "bold",
            fontSize: "1.08rem"
          }}>
            {confirmation}
            <br />
            La voiture arrive dans <b>{carToUserDuration}</b> <span style={{ color: "#007bff" }}>(distance : {carToUserDistance})</span>
            <br />
            <div style={{ marginTop: "1.2rem" }}>
              <button
                style={{
                  background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginRight: "0.7rem"
                }}
                onClick={() => setMapMode("carToUser")}
              >
                Voir la carte voiture-utilisateur
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #28a745 0%, #00c851 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginRight: "0.7rem"
                }}
                onClick={() => setMapMode("userToDest")}
              >
                Voir le trajet souhaité
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)",
                  color: "#222",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={simulateCarArrived}
              >
                Simulation : la voiture est arrivée proche de l'utilisateur
              </button>
              <br />
              <button
                style={{
                  background: "linear-gradient(90deg, #ff5722 0%, #ff7043 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.7rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginTop: "0.7rem"
                }}
                onClick={simulateUserAndCarArrived}
              >
                Simulation : utilisateur et voiture arrivés à destination
              </button>
            </div>
          </div>
        )}
        {mapMode === "carToUser" && coords && (
          <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <h3 style={{ color: "#2d3a4b", fontWeight: 700 }}>Carte voiture → utilisateur</h3>
            <iframe
              title="Voiture vers utilisateur"
              width="400"
              height="300"
              style={{ border: 0, borderRadius: "14px", boxShadow: "0 2px 12px #b0c4de44" }}
              loading="lazy"
              allowFullScreen
            src={`https://www.google.com/maps/embed/v1/directions?key=${key}=${carPosition.lat},${carPosition.lng}&destination=${coords.latitude},${coords.longitude}`}
            />
          </div>
        )}
        {mapMode === "userToDest" && coords && (
          <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <h3 style={{ color: "#2d3a4b", fontWeight: 700 }}>Votre trajet souhaité</h3>
            <iframe
              title="Trajet souhaité"
              width="400"
              height="300"
              style={{ border: 0, borderRadius: "14px", boxShadow: "0 2px 12px #b0c4de44" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/directions?key=${key}=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(destination)}`}
            />
          </div>
        )}
        <div style={{
          textAlign: "center",
          marginTop: "2.5rem",
          color: "#b0b8c1",
          fontSize: "0.98rem"
        }}>
          Utonom © 2025 – Montréal
        </div>
      </div>
    </div>
  ) : <></>;
}

export default React.memo(Localiser);
