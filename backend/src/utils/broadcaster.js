/**
 * Guardian Bot - Real-time WebSocket & Event Broadcaster
 */

let wssInstance = null;

export function setWebSocketServer(wss) {
  wssInstance = wss;
}

export function broadcastEvent(eventType, payload) {
  if (!wssInstance) return;

  const message = JSON.stringify({
    event: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  wssInstance.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
      } catch (err) {
        console.error("Failed to send WebSocket message to client:", err.message);
      }
    }
  });
}
