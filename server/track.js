// server/track.js
const intervalMap = new Map(); // if you need to stop by orderId

export function simulateMovement(io, orderId, startCoords, endCoords) {
  console.log("🟡 Starting simulateMovement...");

  const steps = 300;
  let i = 0;

  const interval = setInterval(() => {
    const lat = startCoords.lat + ((endCoords.lat - startCoords.lat) * i) / steps;
    const lng = startCoords.lng + ((endCoords.lng - startCoords.lng) * i) / steps;

    io.emit("receive-location", {
      orderId,
      latitude: lat,
      longitude: lng,
    });

    console.log(`🚴 [${orderId}] location:`, lat, lng);

    i++;
    if (i > steps) {
      clearInterval(interval);
    }
  }, 500);

  intervalMap.set(orderId, interval);
}

export function stopTracking(orderId) {
  const interval = intervalMap.get(orderId);
  if (interval) {
    clearInterval(interval);
    intervalMap.delete(orderId);
    console.log(`🛑 Stopped tracking for ${orderId}`);
  }
}
