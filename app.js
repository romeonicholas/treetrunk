import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import UDPService from "./services/udpService.js";
import WebSocketService from "./services/websocketService.js";
import ButtonController from "./controllers/buttonController.js";
import { scanFigureData } from "./utils/figureScanner.js";

dotenv.config();

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

// Build figureData from figureResources directory
const figureData = scanFigureData();
console.log(
  `Found ${figureData.length} figures:`,
  figureData.map((f) => f.name)
);
app.locals.figureData = figureData;

// Initialize services
const udpService = new UDPService();
const websocketService = new WebSocketService(httpServer);
const buttonController = new ButtonController(websocketService, udpService);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes
app.use("/", routes);

// TTT endpoint
app.post("/send-ttt", (req, res) => {
  const { value } = req.body;
  buttonController.sendTTT(value);
  res.json({ success: true, message: `TTT:${value} sent` });
});

// Setup UDP message handling
udpService.onMessage((data) => {
  const { button, state } = data;
  buttonController.handlePhidgetButton(button, state);
});

// Start UDP server
udpService.startServer(5005, "0.0.0.0");

// Cleanup on exit
const cleanup = () => {
  console.log("\nShutting down gracefully...");
  udpService.close();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

httpServer.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`);
});
