/**
 * Guardian Bot - Master API Routes
 */

import { Router } from "express";
import { analyzeTextOrSpeech } from "../controllers/scamController.js";
import { getAlerts, updateAlertStatus, createAlert } from "../controllers/alertController.js";
import { handleHardwareSOS } from "../controllers/hardwareController.js";
import { getSeniors, getSeniorById, updateSeniorStatus } from "../controllers/seniorController.js";
import { runSimulationScenario, getPresetScenarios } from "../controllers/simulateController.js";

const router = Router();

// Health Check & Diagnostics
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ONLINE",
    service: "Guardian Bot Backend Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Scam Analysis Endpoints
router.post("/scam/analyze", analyzeTextOrSpeech);

// Alerts Management
router.get("/alerts", getAlerts);
router.post("/alerts", createAlert);
router.patch("/alerts/:id", updateAlertStatus);

// Hardware Panic / ESP32 Wokwi Ingestion
router.post("/hardware/sos", handleHardwareSOS);

// Protected Seniors & Telemetry
router.get("/seniors", getSeniors);
router.get("/seniors/:id", getSeniorById);
router.patch("/seniors/:id", updateSeniorStatus);

// Interactive Simulation Tools
router.get("/simulate/scenarios", getPresetScenarios);
router.post("/simulate/run", runSimulationScenario);

export default router;
