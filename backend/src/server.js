/**
 * Guardian Bot - Server Entry Point
 * Express REST API + WebSocket Real-Time Event Dispatcher
 */

import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

import apiRoutes from "./routes/api.js";
import { setWebSocketServer } from "./utils/broadcaster.js";
import { isFirebaseLive } from "./config/firebase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: "*", // Accessible to local dashboard, Wokwi, and mobile clients
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan("dev"));

// API Router
app.use("/api", apiRoutes);

// Root Index Route
app.get("/", (req, res) => {
  res.json({
    project: "Guardian Bot - Real-Time Scam Protection & Family Alerting",
    status: "RUNNING",
    firebaseConnected: isFirebaseLive,
    documentation: "/api/health",
    endpoints: {
      analyze: "POST /api/scam/analyze",
      hardwareSOS: "POST /api/hardware/sos",
      alerts: "GET /api/alerts",
      seniors: "GET /api/seniors",
      simulate: "POST /api/simulate/run"
    }
  });
});

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`🔌 [WebSocket] Client connected from ${clientIp}`);

  // Send initial connection handshake
  ws.send(JSON.stringify({
    event: "CONNECTED",
    payload: {
      message: "Connected to Guardian Bot Real-Time Security Feed",
      timestamp: new Date().toISOString()
    }
  }));

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message);
      console.log("📩 [WebSocket Received]", parsed);
    } catch (e) {
      console.warn("Received non-JSON websocket message");
    }
  });

  ws.on("close", () => {
    console.log("🔌 [WebSocket] Client disconnected");
  });
});

// Bind broadcaster
setWebSocketServer(wss);

// Start server
server.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log(`🛡️  GUARDIAN BOT BACKEND ENGINE IS RUNNING ON PORT ${PORT}`);
  console.log(`📡  REST API:      http://localhost:${PORT}/api`);
  console.log(`⚡  WebSocket:     ws://localhost:${PORT}/ws`);
  console.log(`🔥  Database Mode: ${isFirebaseLive ? "Live Firebase Firestore" : "Reactive Memory Store (Demo Mode)"}`);
  console.log("=======================================================\n");
});

export { app, server };
