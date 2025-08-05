import { WebSocketServer } from "ws";

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.connectedClients = [];

    this.wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket");
      this.connectedClients.push(ws);

      ws.on("close", () => {
        console.log("Client disconnected from WebSocket");
        this.connectedClients = this.connectedClients.filter(
          (client) => client !== ws
        );
      });
    });
  }

  sendButtonPress(action) {
    const message = JSON.stringify({ type: "button-press", action });
    this.connectedClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.connectedClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }
}

export default WebSocketService;
