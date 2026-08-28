/**
 * Guardian Bot - Alerts Management Controller
 */

import { db } from "../config/firebase.js";
import { broadcastEvent } from "../utils/broadcaster.js";

export const getAlerts = async (req, res) => {
  try {
    const { seniorId, status, limit = 50 } = req.query;
    const snapshot = await db.collection("alerts").get();

    let alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });

    // Apply filters
    if (seniorId) {
      alerts = alerts.filter(a => a.seniorId === seniorId);
    }
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

    // Limit results
    if (limit) {
      alerts = alerts.slice(0, parseInt(limit, 10));
    }

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return res.status(500).json({ error: "Failed to fetch alerts", details: error.message });
  }
};

export const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolvedBy = "Family Dashboard User", notes } = req.body;

    if (!["ACTIVE", "ACKNOWLEDGED", "RESOLVED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be ACTIVE, ACKNOWLEDGED, or RESOLVED." });
    }

    const updatePayload = {
      status,
      updatedAt: new Date().toISOString(),
      ...(status === "RESOLVED" ? { resolvedAt: new Date().toISOString(), resolvedBy, notes } : {})
    };

    await db.collection("alerts").doc(id).update(updatePayload);

    const docSnapshot = await db.collection("alerts").doc(id).get();
    const updatedAlert = { id, ...docSnapshot.data() };

    broadcastEvent("ALERT_UPDATED", updatedAlert);

    return res.status(200).json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error(`Failed to update alert ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to update alert", details: error.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const alertData = {
      seniorId: req.body.seniorId || "senior_01",
      seniorName: req.body.seniorName || "Savitri Patel",
      type: req.body.type || "CALL_SCAM",
      severity: req.body.severity || "HIGH",
      riskScore: req.body.riskScore || 80,
      category: req.body.category || "Scam Warning",
      snippet: req.body.snippet || "Suspicious call detected",
      highlightedKeywords: req.body.highlightedKeywords || [],
      status: "ACTIVE",
      timestamp: new Date().toISOString(),
      ...req.body
    };

    const docRef = await db.collection("alerts").add(alertData);
    const newAlert = { id: docRef.id, ...alertData };

    broadcastEvent("NEW_ALERT", newAlert);

    return res.status(201).json({
      success: true,
      alert: newAlert
    });
  } catch (error) {
    console.error("Failed to create alert:", error);
    return res.status(500).json({ error: "Failed to create alert", details: error.message });
  }
};
