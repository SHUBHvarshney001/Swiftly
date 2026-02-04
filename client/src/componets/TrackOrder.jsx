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
      mapRef.current = L.map(mapContainer).setView([51.505, -0.09], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
    }

    // Listen for real-time location updates
    socket.on("receive-location", ({ latitude, longitude, orderId: incomingId }) => {
      if (incomingId === orderId && mapRef.current) {
        const latLng = [latitude, longitude];
        if (markerRef.current) {
          markerRef.current.setLatLng(latLng);
        } else {
          markerRef.current = L.marker(latLng).addTo(mapRef.current);
        }
        mapRef.current.setView(latLng, 13);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      socket.off("receive-location");
    };
  }, [orderId]);

  return (
    <div>
      <h2>Tracking Order: {orderId}</h2>
      <div id="map-container" style={{ height: "400px" }}></div>
    </div>
  );
};

export default TrackOrder;
