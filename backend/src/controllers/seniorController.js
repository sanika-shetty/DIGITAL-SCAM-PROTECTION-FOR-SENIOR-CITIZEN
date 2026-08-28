/**
 * Guardian Bot - Senior Profiles & Device Telemetry Controller
 */

import { db } from "../config/firebase.js";

export const getSeniors = async (req, res) => {
  try {
    const snapshot = await db.collection("seniors").get();
    const seniors = [];
    snapshot.forEach(doc => {
      seniors.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      count: seniors.length,
      seniors
    });
  } catch (error) {
    console.error("Failed to fetch seniors:", error);
    return res.status(500).json({ error: "Failed to fetch senior profiles", details: error.message });
  }
};

export const getSeniorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("seniors").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: `Senior with id ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      senior: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error(`Failed to fetch senior ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to fetch senior", details: error.message });
  }
};

export const updateSeniorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, batteryLevel, currentCall } = req.body;

    const updateData = {
      ...(status ? { status } : {}),
      ...(batteryLevel !== undefined ? { batteryLevel } : {}),
      ...(currentCall !== undefined ? { currentCall } : {}),
      lastActive: new Date().toISOString()
    };

    await db.collection("seniors").doc(id).update(updateData);
    const updated = await db.collection("seniors").doc(id).get();

    return res.status(200).json({
      success: true,
      senior: { id, ...updated.data() }
    });
  } catch (error) {
    console.error(`Failed to update senior ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to update senior", details: error.message });
  }
};
