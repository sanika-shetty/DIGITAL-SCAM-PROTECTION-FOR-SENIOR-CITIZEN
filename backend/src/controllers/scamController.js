/**
 * Guardian Bot - Scam Analysis Controller
 */

import { ScamClassifier } from "../scamEngine/classifier.js";
import { db } from "../config/firebase.js";
import { broadcastEvent } from "../utils/broadcaster.js";

export const analyzeTextOrSpeech = async (req, res) => {
  try {
    const { text, seniorId = "senior_01", seniorName = "Savitri Patel", channel = "PHONE_CALL", callerNumber = "+91 98990 00123" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing required 'text' parameter in request body" });
    }

    const analysis = ScamClassifier.analyze(text, { seniorId, channel, callerNumber });

    // Broadcast live chunk to dashboard for real-time live call audio visualizer and speech stream
    broadcastEvent("LIVE_SPEECH_CHUNK", {
      seniorId,
      seniorName,
      channel,
      callerNumber,
      rawText: text,
      highlightedTranscript: analysis.highlightedTranscript,
      riskScore: analysis.riskScore,
      threatLevel: analysis.threatLevel,
      matchedCategories: analysis.matchedCategories,
      timestamp: new Date().toISOString()
    });

    let savedAlert = null;

    // Automatically generate and broadcast a high or critical alert if score exceeds safety threshold
    if (analysis.riskScore >= 50) {
      const alertData = {
        seniorId,
        seniorName,
        type: channel === "SMS" ? "SMS_PHISHING" : "CALL_SCAM",
        severity: analysis.threatLevel,
        riskScore: analysis.riskScore,
        category: analysis.matchedCategories[0]?.name || "High Threat Scam",
        snippet: text,
        highlightedKeywords: analysis.highlightedKeywords,
        status: "ACTIVE",
        resolvedAt: null,
        callerNumber,
        channel,
        ttsWarning: analysis.ttsWarning,
        recommendedAction: analysis.recommendedAction,
        timestamp: new Date().toISOString()
      };

      const docRef = await db.collection("alerts").add(alertData);
      savedAlert = { id: docRef.id, ...alertData };

      // Broadcast alert to connected React dashboards
      broadcastEvent("NEW_ALERT", savedAlert);
    }

    return res.status(200).json({
      success: true,
      analysis,
      alertTriggered: !!savedAlert,
      alert: savedAlert
    });
  } catch (error) {
    console.error("Scam analysis failed:", error);
    return res.status(500).json({ error: "Failed to analyze text segment", details: error.message });
  }
};
