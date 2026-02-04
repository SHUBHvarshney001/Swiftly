import { io } from "socket.io-client";
const socket = io("http://localhost:8080");

const orderId = "ORD-82517"; // Use actual order ID used in URL

// Mathura warehouse coordinates: 27.4925, 77.6736
let lat = 27.4925;
let lng = 77.6736;

setInterval(() => {
  lat += 0.0001;
  lng += 0.0001;

  socket.emit("send-location", {
    orderId,
    latitude: lat,
    longitude: lng
  });
}, 3000);
