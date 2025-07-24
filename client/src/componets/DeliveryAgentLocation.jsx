import { io } from "socket.io-client";
const socket = io("http://localhost:8080");

const orderId = "ORD-82517"; // Use actual order ID used in URL

let lat = 51.505;
let lng = -0.09;

setInterval(() => {
  lat += 0.0001;
  lng += 0.0001;

  socket.emit("send-location", {
    orderId,
    latitude: lat,
    longitude: lng
  });
}, 3000);
