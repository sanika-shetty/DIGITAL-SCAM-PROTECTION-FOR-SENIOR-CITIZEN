/**
 * Guardian Bot - Core Scam Classification Engine
 * Evaluates text / transcribed speech in real-time, calculates threat score,
 * and synthesizes senior-friendly voice warning scripts and family actions.
 */

import { SCAM_CATEGORIES, RISK_THRESHOLDS } from "./knowledgeBase.js";

export class ScamClassifier {
  /**
   * Analyzes an incoming text chunk, SMS, or transcribed speech segment.
   * @param {string} text - The raw text or speech transcript
   * @param {object} context - Additional metadata (e.g. callerId, channel, duration)
   * @returns {object} Analysis result with score, breakdown, highlights, and TTS warning
   */
  static analyze(text, context = {}) {
    if (!text || typeof text !== "string") {
      return {
        riskScore: 0,
        threatLevel: "SAFE",
        matchedCategories: [],
        highlightedKeywords: [],
        ttsWarning: null,
        recommendedAction: "No threats detected.",
        isCritical: false
      };
    }

    const cleanText = text.trim();
    const matchedCategories = [];
    const highlightedKeywords = [];
    let totalRawScore = 0;
    let highestCategorySeverity = "SAFE";

    for (const [key, category] of Object.entries(SCAM_CATEGORIES)) {
      let categoryMatchCount = 0;
      let categoryAccumulatedScore = 0;
      const matchedPatterns = [];

      for (const item of category.patterns) {
        const match = cleanText.match(item.pattern);
        if (match) {
          categoryMatchCount++;
          categoryAccumulatedScore += item.weight;
          matchedPatterns.push({
            label: item.label,
            matchedText: match[0],
            weight: item.weight
          });

          if (!highlightedKeywords.includes(match[0].toLowerCase())) {
            highlightedKeywords.push(match[0].toLowerCase());
          }
        }
      }

      if (categoryMatchCount > 0) {
        // Compound multiplier when multiple indicators in the same category fire
        const categoryMultiplier = 1 + (categoryMatchCount - 1) * 0.25;
        const categoryFinalScore = Math.min(categoryAccumulatedScore * categoryMultiplier, 90);
        totalRawScore += categoryFinalScore;

        matchedCategories.push({
          id: category.id,
          name: category.name,
          severity: category.severity,
          score: Math.round(categoryFinalScore),
          description: category.description,
          warningAdvice: category.warningAdvice,
          matchedPatterns
        });

        if (category.severity === "CRITICAL") highestCategorySeverity = "CRITICAL";
        else if (category.severity === "HIGH" && highestCategorySeverity !== "CRITICAL") highestCategorySeverity = "HIGH";
        else if (category.severity === "MEDIUM" && highestCategorySeverity === "SAFE") highestCategorySeverity = "MEDIUM";
      }
    }

    // Additional cross-category heuristic: Coercion + Money Transfer = Extreme Danger
    const hasLegalOrPolice = matchedCategories.some(c => c.id === "DIGITAL_ARREST");
    const hasTransfer = matchedCategories.some(c => c.id === "URGENT_FUND_TRANSFER");
    const hasOtpOrRemote = matchedCategories.some(c => c.id === "BANKING_OTP_PHISHING" || c.id === "REMOTE_ACCESS_FRAUD");

    if ((hasLegalOrPolice && hasTransfer) || (hasOtpOrRemote && hasTransfer)) {
      totalRawScore += 30; // Synergistic threat bump
    }

    // Scale and bound composite risk score to 0 - 100
    let riskScore = Math.min(Math.round(totalRawScore), 100);

    // Determine final threat level
    let threatLevel = "SAFE";
    if (riskScore >= RISK_THRESHOLDS.CRITICAL) threatLevel = "CRITICAL";
    else if (riskScore >= RISK_THRESHOLDS.HIGH) threatLevel = "HIGH";
    else if (riskScore >= RISK_THRESHOLDS.MEDIUM) threatLevel = "MEDIUM";

    // Build Senior-Friendly Text-to-Speech (TTS) Voice Warning
    let ttsWarning = null;
    let recommendedAction = "Normal conversation. Shield active.";

    if (threatLevel === "CRITICAL" || threatLevel === "HIGH") {
      const topCategory = matchedCategories.sort((a, b) => b.score - a.score)[0];
      const advice = topCategory?.warningAdvice || "Do not share any codes or send money.";
      
      ttsWarning = `WARNING: Guardian Bot detected a dangerous scam attempt. ${advice} Please hang up immediately. Your family has been alerted.`;
      recommendedAction = `CRITICAL INTERVENTION: Call senior immediately. ${advice}`;
    } else if (threatLevel === "MEDIUM") {
      ttsWarning = `CAUTION: Potential spam or unverified request detected. Do not share personal details.`;
      recommendedAction = `Monitor call closely. Check if senior needs assistance.`;
    }

    // Generate HTML-safe or markup-highlighted transcript
    let highlightedTranscript = cleanText;
    highlightedKeywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, "gi");
      highlightedTranscript = highlightedTranscript.replace(regex, `<mark class="scam-keyword">$1</mark>`);
    });

    return {
      riskScore,
      threatLevel,
      matchedCategories,
      highlightedKeywords,
      highlightedTranscript,
      rawText: cleanText,
      ttsWarning,
      recommendedAction,
      isCritical: threatLevel === "CRITICAL",
      analyzedAt: new Date().toISOString()
    };
  }
}
