import dgram from "dgram";

class UDPService {
  constructor() {
    this.client = dgram.createSocket("udp4");
    this.server = dgram.createSocket("udp4");
    this.messageHandlers = [];
  }

  // Send TTT messages
  sendTTTMessage(value) {
    if (value < 1 || value > 9) {
      console.warn(`Invalid TTT value: ${value}. Must be between 1 and 9.`);
      return;
    }

    const message = `TTT:${value}`;
    const targetIP = "10.62.0.11";
    const targetPort = 5000;

    this.client.send(message, targetPort, targetIP, (err) => {
      if (err) {
        console.error("Error sending UDP message:", err);
      } else {
        console.log(
          `Sent UDP message: "${message}" to ${targetIP}:${targetPort}`
        );
      }
    });
  }

  // Start UDP server for receiving messages
  startServer(port = 5005, host = "0.0.0.0") {
    this.server.on("listening", () => {
      const address = this.server.address();
      console.log(`UDP Server listening on ${address.address}:${address.port}`);
    });

    this.server.on("message", (message, remote) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received UDP message:`, data);

        // Notify all message handlers
        this.messageHandlers.forEach((handler) => handler(data));
      } catch (err) {
        console.error("Invalid UDP message:", err.message);
      }
    });

    this.server.bind(port, host);
  }

  // Add message handler
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // Cleanup
  close() {
    try {
      this.client.close();
      this.server.close();
      console.log("UDP services closed");
    } catch (err) {
      if (err.code !== "ERR_SOCKET_DGRAM_NOT_RUNNING") {
        console.error("Error closing UDP socket:", err);
      }
    }
  }
}

export default UDPService;
