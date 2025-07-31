import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { exec } from "child_process";
import dgram from "dgram"; // Use import instead of require
import { WebSocketServer } from "ws";
import { createServer } from "http";

import figureData from "./public/js/figureData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Create HTTP server for both Express and WebSocket
const httpServer = createServer(app);

// WebSocket setup
const wss = new WebSocketServer({ server: httpServer });
let connectedClients = [];

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
  connectedClients.push(ws);

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
    connectedClients = connectedClients.filter((client) => client !== ws);
  });
});

// Function to send button press to all connected clients
function sendButtonPressToClients(action) {
  const message = JSON.stringify({ type: "button-press", action });
  connectedClients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(message);
    }
  });
}

app.use(express.json({ limit: "10mb" }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.post("/save-photo", (req, res) => {
  const { image, figureIndex } = req.body;
  const matches = image.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!matches) return res.status(400).send("Invalid image data");
  const buffer = Buffer.from(matches[1], "base64");
  const filename = `${Date.now()}.jpg`;
  const originalFilepath = path.join(
    __dirname,
    "public/originalUserPhotos",
    filename
  );
  const editedFilepath = path.join(
    __dirname,
    "public/editedUserPhotos",
    filename
  );

  fs.mkdirSync(path.dirname(originalFilepath), { recursive: true });

  const figure = figureData[figureIndex];
  if (!figure) return res.status(400).send("Invalid figure index");
  const cutoutPath = path.join(__dirname, "public", figure.cutout);
  const script = path.resolve("./edit-photo.ps1");
  const command = `powershell -ExecutionPolicy Bypass -File "${script}" "${originalFilepath}" "${editedFilepath}" "${cutoutPath}"`;

  fs.writeFile(originalFilepath, buffer, (err) => {
    if (err) return res.status(500).send("Failed to save");

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("PowerShell error:", error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ filename });
    });
  });
});

app.get("/", (request, response) => {
  response.render("index", { figureData: figureData });
});

// UDP Server for Phidget messages
const udpServer = dgram.createSocket("udp4");

udpServer.on("listening", () => {
  const address = udpServer.address();
  console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

udpServer.on("message", (message, remote) => {
  try {
    const data = JSON.parse(message.toString());
    const { button, state } = data;

    console.log(`Received UDP message: button ${button}, state ${state}`);
    handlePhidgetButton(button, state);
  } catch (err) {
    console.error("Invalid UDP message:", err.message);
  }
});

udpServer.bind(5005, "0.0.0.0");

function handlePhidgetButton(button, state) {
  if (state !== 1) return; // only trigger on press, not release

  let action;
  switch (button) {
    case 1:
      action = "left";
      break;
    case 2:
      action = "right";
      break;
    case 3:
      action = "enter";
      break;
    default:
      console.warn("Unknown button:", button);
      return;
  }

  console.log(`Sending action '${action}' to clients`);
  sendButtonPressToClients(action);
}

// Use httpServer instead of app.listen to support both Express and WebSocket
httpServer.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`);
});
