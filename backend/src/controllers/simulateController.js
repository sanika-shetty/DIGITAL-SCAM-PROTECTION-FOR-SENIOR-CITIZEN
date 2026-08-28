/**
 * Guardian Bot - Scam Scenario Simulation Controller
 * Powers the interactive simulator for live testing and demonstration.
 */

import { ScamClassifier } from "../scamEngine/classifier.js";
import { db } from "../config/firebase.js";
import { broadcastEvent } from "../utils/broadcaster.js";

const PRESET_SCENARIOS = {
  DIGITAL_ARREST: {
    title: "CBI / Police Digital Arrest Scam",
    callerNumber: "+91 99887 76655",
    callerName: "Unknown Caller (Suspected Spoofed)",
    channel: "PHONE_CALL",
    chunks: [
      "Hello, am I speaking with Savitri Patel? This is Inspector Vikram Roy from the Cyber Crime Investigation Cell.",
      "We have seized an illegal FedEx consignment from Mumbai containing narcotics, passports, and credit cards in your name.",
      "A non-bailable arrest warrant has been issued by the Supreme Court of India against your Aadhaar number for money laundering.",
      "You are under Digital Arrest right now. You must stay on video call and do not disconnect or inform anyone.",
      "To prevent immediate arrest, transfer Rs 50,000 security deposit to the RBI verification account immediately within 10 minutes."
    ]
  },

  BANK_OTP_FRAUD: {
    title: "Urgent KYC & OTP Interception Scam",
    callerNumber: "+91 91234 56780",
    callerName: "HDFC Bank Alert Desk",
    channel: "PHONE_CALL",
    chunks: [
      "Dear customer, your bank account and debit card will be blocked tonight due to pending KYC verification.",
      "To unfreeze your account, we have sent a 6-digit verification OTP to your registered mobile number.",
      "Please share the OTP immediately to update your PAN card link, or your account will be suspended permanently."
    ]
  },

  REMOTE_ANYDESK: {
    title: "Electricity Bill Cutoff & AnyDesk Remote Takeover",
    callerNumber: "+91 98765 43210",
    callerName: "State Electricity Board",
    channel: "PHONE_CALL",
    chunks: [
      "Attention: Your electricity power will be disconnected tonight at 9:30 PM due to unpaid electricity bill of Rs 850.",
      "To update bill payment immediately, download and install AnyDesk QuickSupport app from Google Play Store.",
      "Open the app and share your 9-digit code with our electricity officer right now so we can assist your screen."
    ]
  },

  GRANDSON_EMERGENCY: {
    title: "Fake Grandchild Hospital Emergency Scam",
    callerNumber: "+91 97711 22334",
    callerName: "City Care Hospital",
    channel: "PHONE_CALL",
    chunks: [
      "Grandma, please help me! Your grandson was in a severe car accident and is in hospital emergency.",
      "The doctor requires urgent surgery deposit of Rs 40,000 right now. Do not tell parents, please send money via Google Pay immediately."
    ]
  }
};

export const runSimulationScenario = async (req, res) => {
  try {
    const { scenarioKey = "DIGITAL_ARREST", seniorId = "senior_01", seniorName = "Savitri Patel", chunkDelayMs = 2500 } = req.body;

    const scenario = PRESET_SCENARIOS[scenarioKey] || PRESET_SCENARIOS.DIGITAL_ARREST;

    console.log(`🎬 [SIMULATION] Launching scenario "${scenario.title}" for Senior ${seniorName}...`);

    // Broadcast call start
    broadcastEvent("CALL_STARTED", {
      seniorId,
      seniorName,
      callerNumber: scenario.callerNumber,
      callerName: scenario.callerName,
      channel: scenario.channel,
      scenarioTitle: scenario.title,
      timestamp: new Date().toISOString()
    });

    // Process first chunk synchronously
    const firstChunk = scenario.chunks[0];
    const initialAnalysis = ScamClassifier.analyze(firstChunk, { seniorId, channel: scenario.channel });

    broadcastEvent("LIVE_SPEECH_CHUNK", {
      seniorId,
      seniorName,
      chunkIndex: 0,
      totalChunks: scenario.chunks.length,
      callerNumber: scenario.callerNumber,
      rawText: firstChunk,
      highlightedTranscript: initialAnalysis.highlightedTranscript,
      riskScore: initialAnalysis.riskScore,
      threatLevel: initialAnalysis.threatLevel,
      matchedCategories: initialAnalysis.matchedCategories,
      timestamp: new Date().toISOString()
    });

    // Schedule subsequent chunks asynchronously to simulate real conversation pace
    let accumulatedText = firstChunk;

    scenario.chunks.slice(1).forEach((chunk, index) => {
      setTimeout(async () => {
        accumulatedText += " " + chunk;
        const currentAnalysis = ScamClassifier.analyze(accumulatedText, { seniorId, channel: scenario.channel });

        console.log(`📡 [SIMULATION CHUNK ${index + 2}/${scenario.chunks.length}] Risk Score: ${currentAnalysis.riskScore} (${currentAnalysis.threatLevel})`);

        broadcastEvent("LIVE_SPEECH_CHUNK", {
          seniorId,
          seniorName,
          chunkIndex: index + 1,
          totalChunks: scenario.chunks.length,
          callerNumber: scenario.callerNumber,
          rawText: chunk,
          accumulatedText,
          highlightedTranscript: currentAnalysis.highlightedTranscript,
          riskScore: currentAnalysis.riskScore,
          threatLevel: currentAnalysis.threatLevel,
          matchedCategories: currentAnalysis.matchedCategories,
          ttsWarning: currentAnalysis.ttsWarning,
          timestamp: new Date().toISOString()
        });

        // Trigger alert once threshold is reached on the peak chunk
        if (index === scenario.chunks.length - 2 || currentAnalysis.riskScore >= 75) {
          const alertData = {
            seniorId,
            seniorName,
            type: "CALL_SCAM",
            severity: currentAnalysis.threatLevel,
            riskScore: currentAnalysis.riskScore,
            category: currentAnalysis.matchedCategories[0]?.name || scenario.title,
            snippet: accumulatedText,
            highlightedKeywords: currentAnalysis.highlightedKeywords,
            status: "ACTIVE",
            callerNumber: scenario.callerNumber,
            channel: scenario.channel,
            ttsWarning: currentAnalysis.ttsWarning,
            recommendedAction: currentAnalysis.recommendedAction,
            timestamp: new Date().toISOString()
          };

          const docRef = await db.collection("alerts").add(alertData);
          broadcastEvent("NEW_ALERT", { id: docRef.id, ...alertData });
        }
      }, (index + 1) * chunkDelayMs);
    });

    return res.status(200).json({
      success: true,
      message: `Scenario "${scenario.title}" started. ${scenario.chunks.length} chunks streaming over WebSocket.`,
      scenarioKey,
      scenarioTitle: scenario.title,
      totalChunks: scenario.chunks.length
    });
  } catch (error) {
    console.error("Simulation failed:", error);
    return res.status(500).json({ error: "Failed to run simulation", details: error.message });
  }
};

export const getPresetScenarios = (req, res) => {
  return res.status(200).json({
    success: true,
    scenarios: Object.entries(PRESET_SCENARIOS).map(([key, value]) => ({
      key,
      title: value.title,
      channel: value.channel,
      callerNumber: value.callerNumber,
      samplePreview: value.chunks[0]
    }))
  });
};
