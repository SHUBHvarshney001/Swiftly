import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const TrackOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const orderId = paramOrderId || "7617";
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const mapContainer = document.getElementById("map-container");

    if (mapContainer && !mapRef.current) {
      mapRef.current = L.map(mapContainer, {
        zoomControl: true,
        fadeAnimation: false,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Invalidate size immediately and then again shortly after for reliability
      mapRef.current.invalidateSize();
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 100);
    }

    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit("send-location", { latitude, longitude, orderId });

          if (mapRef.current) {
            const latLng = [latitude, longitude];
            if (!markerRef.current) {
              markerRef.current = L.marker(latLng).addTo(mapRef.current);
              mapRef.current.setView(latLng, 13);
            } else {
              markerRef.current.setLatLng(latLng);
            }
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    socket.on("receive-location", ({ latitude, longitude, orderId: incomingId }) => {
      if (incomingId === orderId && mapRef.current) {
        const latLng = [latitude, longitude];
        if (markerRef.current) {
          markerRef.current.setLatLng(latLng);
        } else {
          markerRef.current = L.marker(latLng).addTo(mapRef.current);
          mapRef.current.setView(latLng, 13);
        }
      }
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket.off("receive-location");
    };
  }, [orderId]);

  return (
    <div className="track-order-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Tracking Order: <span style={{ color: "#45a049" }}>{orderId}</span></h2>
      <div
        id="map-container"
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          overflow: "hidden",
          border: "2px solid #ddd"
        }}
      ></div>
      <p style={{ marginTop: "15px", color: "#666" }}>
        Tracking is active. Using your device's live location to simulate delivery status.
      </p>
    </div>
  );
};

export default TrackOrder;
