import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

// Custom icons
const driverIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const storeIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/606/606363.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const TrackOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const orderId = paramOrderId || "7617";
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [storeLatLng, setStoreLatLng] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Locating...");

  // 1. Geocode the Store address (from form data)
  useEffect(() => {
    const storedUser = localStorage.getItem("formData");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const query = `${userData.address}, ${userData.city}, ${userData.country || "India"}`;

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setStoreLatLng([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        })
        .catch(err => console.error("Store geocoding error:", err));
    }
  }, []);

  useEffect(() => {
    const mapContainer = document.getElementById("map-container");

    if (mapContainer && !mapRef.current) {
      mapRef.current = L.map(mapContainer, {
        zoomControl: true,
        fadeAnimation: true,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      mapRef.current.invalidateSize();
    }

    // Add Store Marker (Start Location)
    if (storeLatLng && mapRef.current) {
      if (!storeMarkerRef.current) {
        storeMarkerRef.current = L.marker(storeLatLng, { icon: storeIcon })
          .addTo(mapRef.current)
          .bindPopup("<b>Pickup Point (From Form)</b>")
          .openPopup();
        mapRef.current.setView(storeLatLng, 13);
      }
    }

    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocode laptop location to get address string
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const addressString = data.display_name;
              setCurrentAddress(addressString);
              // Emit only the address string as requested
              socket.emit("send-location", { address: addressString, orderId });

              updatePath(latitude, longitude);
            });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    const updatePath = (driverLat, driverLon) => {
      if (!mapRef.current) return;
      const driverLatLng = [driverLat, driverLon];

      // Update Driver Marker
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(driverLatLng, { icon: driverIcon })
          .addTo(mapRef.current)
          .bindPopup("<b>Delivery Partner (Current Location)</b>");
      } else {
        driverMarkerRef.current.setLatLng(driverLatLng);
      }

      // Draw path from Store to Current Location
      if (storeLatLng) {
        if (!polylineRef.current) {
          polylineRef.current = L.polyline([storeLatLng, driverLatLng], {
            color: "#45a049",
            weight: 5,
            dashArray: "10, 20",
            opacity: 0.8
          }).addTo(mapRef.current);
        } else {
          polylineRef.current.setLatLngs([storeLatLng, driverLatLng]);
        }

        const bounds = L.latLngBounds([storeLatLng, driverLatLng]);
        mapRef.current.fitBounds(bounds, { padding: [80, 80], animate: true });
      }
    };

    // Handle incoming address strings from other clients
    socket.on("receive-location", ({ address, orderId: incomingId }) => {
      if (incomingId === orderId && address) {
        console.log("Received address string to track:", address);
        // Geocode the received address string to find it on the map
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              updatePath(parseFloat(data[0].lat), parseFloat(data[0].lon));
            }
          });
      }
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket.off("receive-location");
    };
  }, [orderId, storeLatLng]);

  return (
    <div className="track-order-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Tracking Order: <span style={{ color: "#45a049" }}>{orderId}</span></h2>
      <div
        id="map-container"
        style={{
          height: "600px",
          width: "100%",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          overflow: "hidden",
          border: "2px solid #eee"
        }}
      ></div>
      <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
        <p style={{ color: "#333", fontSize: "1rem", margin: "0" }}>
          <b>Tracking Address:</b> <span style={{ color: "#45a049" }}>{currentAddress}</span>
        </p>
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "10px" }}>
          Simulating path from the <b>Form Address</b> to your <b>Current Laptop Location</b>.
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
