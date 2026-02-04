import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

// Custom icons with fallbacks
const driverIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const storeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TrackOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const orderId = paramOrderId || "7617";
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Hardcoded Warehouse Location (Mathura, UP)
  const [storeLatLng] = useState([27.4925, 77.6736]);
  const [driverLatLng, setDriverLatLng] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Locating your partner...");

  useEffect(() => {
    const mapContainer = document.getElementById("map-container");

    if (mapContainer && !mapRef.current) {
      mapRef.current = L.map(mapContainer, {
        zoomControl: true,
        fadeAnimation: true,
      }).setView(storeLatLng, 13);

      // Using CARTO Voyager tiles with correct URL to avoid SSL errors
      console.log("Initializing map with CARTO Voyager tiles...");
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      mapRef.current.invalidateSize();
    }

    if (storeLatLng && mapRef.current) {
      if (!storeMarkerRef.current) {
        storeMarkerRef.current = L.marker(storeLatLng, { icon: storeIcon })
          .addTo(mapRef.current)
          .bindPopup("<b>Swiftly Warehouse (Mathura)</b>")
          .openPopup();
      }
    }

    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const addressString = data.display_name || "Active Delivery Partner";
              setCurrentAddress(addressString);
              socket.emit("send-location", { address: addressString, orderId });
              setDriverLatLng([latitude, longitude]);
            });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    socket.on("receive-location", ({ address, orderId: incomingId }) => {
      console.log(`Received address string to track: ${address}`);
      if (incomingId === orderId && address) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setDriverLatLng([Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)]);
            }
          });
      }
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket.off("receive-location");
    };
  }, [orderId, storeLatLng]);

  // Handle Path and Markers Updates
  useEffect(() => {
    if (!mapRef.current || !driverLatLng) return;

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(driverLatLng, { icon: driverIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>Delivery Partner</b>");
    } else {
      driverMarkerRef.current.setLatLng(driverLatLng);
    }

    if (storeLatLng) {
      if (!polylineRef.current) {
        polylineRef.current = L.polyline([storeLatLng, driverLatLng], {
          color: "#FFD700",
          weight: 4,
          dashArray: "10, 15",
          opacity: 0.8
        }).addTo(mapRef.current);
      } else {
        polylineRef.current.setLatLngs([storeLatLng, driverLatLng]);
      }

      const bounds = L.latLngBounds([storeLatLng, driverLatLng]);
      mapRef.current.fitBounds(bounds, { padding: [80, 80], animate: true });
    } else {
      mapRef.current.setView(driverLatLng, 15);
    }
  }, [driverLatLng, storeLatLng]);

  return (
    <div className="track-order-container" style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#2d3436" }}>
          Tracking Order: <span style={{ color: "#fab1a0" }}>#{orderId}</span>
        </h2>
      </header>

      <div
        id="map-container"
        style={{
          height: "550px",
          width: "100%",
          borderRadius: "24px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          overflow: "hidden",
          border: "4px solid #fff",
          backgroundColor: "#f0f0f0"
        }}
      ></div>

      <footer style={{ marginTop: "20px", padding: "20px", background: "#fff", borderRadius: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#fab1a0", animation: "pulse 1.5s infinite" }}></div>
          <span style={{ fontWeight: "600", color: "#636e72" }}>Live Status</span>
        </div>
        <p style={{ color: "#2d3436", fontSize: "1.1rem", marginTop: "10px", lineHeight: "1.4" }}>
          <strong>Partner Location:</strong> {currentAddress}
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(250, 177, 160, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(250, 177, 160, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(250, 177, 160, 0); }
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;
