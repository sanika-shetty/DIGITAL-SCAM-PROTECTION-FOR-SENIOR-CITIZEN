package com.guardianbot.detector

import java.util.Locale
import java.util.regex.Pattern

data class ScamPattern(
    val regex: Regex,
    val weight: Int,
    val label: String
)

data class ScamCategory(
    val id: String,
    val name: String,
    val severity: String,
    val patterns: List<ScamPattern>,
    val warningAdvice: String
)

data class ClassificationResult(
    val riskScore: Int,
    val threatLevel: String, // "SAFE", "MEDIUM", "HIGH", "CRITICAL"
    val isCritical: Boolean,
    val matchedKeywords: List<String>,
    val matchedCategories: List<String>,
    val ttsWarningText: String?,
    val recommendedAction: String
)

object ScamClassifier {

    private val categories = listOf(
        ScamCategory(
            id = "DIGITAL_ARREST",
            name = "Digital Arrest & Law Enforcement Impersonation",
            severity = "CRITICAL",
            warningAdvice = "Law enforcement NEVER arrests over video call or demands money.",
            patterns = listOf(
                ScamPattern(Regex("(?i)digital\\s*arrest"), 45, "Digital Arrest Mention"),
                ScamPattern(Regex("(?i)\\b(cbi|police\\s*officer|cyber\\s*crime|narcotics|customs|enforcement\\s*directorate)\\b"), 30, "Agency Impersonation"),
                ScamPattern(Regex("(?i)\\b(arrest\\s*warrant|supreme\\s*court|money\\s*laundering|terror\\s*funding)\\b"), 35, "Legal Threat"),
                ScamPattern(Regex("(?i)\\b(illegal\\s*(consignment|parcel|drugs)|fedex\\s*parcel)\\b"), 35, "Detained Parcel Claim"),
                ScamPattern(Regex("(?i)\\b(stay\\s*on\\s*(video\\s*call|camera|skype)|do\\s*not\\s*(hang\\s*up|disconnect))\\b"), 30, "Isolation Coercion")
            )
        ),
        ScamCategory(
            id = "BANKING_OTP",
            name = "Banking, OTP & KYC Phishing",
            severity = "CRITICAL",
            warningAdvice = "NEVER share OTP or passwords. Your bank will never ask for them.",
            patterns = listOf(
                ScamPattern(Regex("(?i)\\b(share|tell|give|enter)\\s*(the\\s*)?(otp|one\\s*time\\s*password|verification\\s*code)\\b"), 40, "OTP Demand"),
                ScamPattern(Regex("(?i)\\b(bank\\s*account\\s*(blocked|suspended|frozen)|debit\\s*card\\s*deactivated)\\b"), 35, "Account Freeze Threat"),
                ScamPattern(Regex("(?i)\\b(kyc\\s*(expired|update|verification)|pan\\s*card\\s*link)\\b"), 30, "Urgent KYC Lure"),
                ScamPattern(Regex("(?i)\\b(cvv|atm\\s*pin|internet\\s*banking\\s*password)\\b"), 35, "Credentials Request"),
                ScamPattern(Regex("(?i)\\b(electricity\\s*bill\\s*unpaid|power\\s*disconnected\\s*tonight)\\b"), 35, "Utility Cutoff Scam")
            )
        ),
        ScamCategory(
            id = "REMOTE_ACCESS",
            name = "Remote Access Screen-Takeover",
            severity = "CRITICAL",
            warningAdvice = "DO NOT download AnyDesk or TeamViewer. Hang up immediately.",
            patterns = listOf(
                ScamPattern(Regex("(?i)\\b(anydesk|teamviewer|rustdesk|quicksupport|screen\\s*share)\\b"), 40, "Screen Sharing App"),
                ScamPattern(Regex("(?i)\\b(install|download)\\s*(this\\s*)?(app|apk|application)\\b"), 25, "App Download Request"),
                ScamPattern(Regex("(?i)\\b(allow\\s*permission|grant\\s*access|9\\s*digit\\s*code)\\b"), 30, "Remote Access Code")
            )
        ),
        ScamCategory(
            id = "URGENT_TRANSFER",
            name = "Coercive Money Transfer",
            severity = "HIGH",
            warningAdvice = "Never transfer money to any 'safe account' or 'RBI verification account'.",
            patterns = listOf(
                ScamPattern(Regex("(?i)\\b(transfer|send|deposit|pay)\\s*(money|funds|amount|penalty|security\\s*deposit)\\b"), 25, "Fund Transfer Request"),
                ScamPattern(Regex("(?i)\\b(rbi\\s*verification\\s*account|refundable\\s*security|clearance\\s*fee)\\b"), 35, "Fake Verification Account"),
                ScamPattern(Regex("(?i)\\b(immediately|urgently|within\\s*\\d+\\s*minutes)\\b"), 20, "Time Pressure"),
                ScamPattern(Regex("(?i)\\b(google\\s*pay|phonepe|paytm|upi\\s*id|qr\\s*code)\\b"), 20, "Payment Gateway Lure")
            )
        )
    )

    fun evaluate(text: String): ClassificationResult {
        if (text.isBlank()) {
            return ClassificationResult(
                riskScore = 0,
                threatLevel = "SAFE",
                isCritical = false,
                matchedKeywords = emptyList(),
                matchedCategories = emptyList(),
                ttsWarningText = null,
                recommendedAction = "Normal call. Safety shield active."
            )
        }

        var totalRawScore = 0
        val matchedKeywords = mutableListOf<String>()
        val matchedCategoriesList = mutableListOf<String>()

        for (category in categories) {
            var categoryMatchCount = 0
            var categoryScore = 0

            for (pattern in category.patterns) {
                val match = pattern.regex.find(text)
                if (match != null) {
                    categoryMatchCount++
                    categoryScore += pattern.weight
                    val matchedText = match.value.lowercase(Locale.getDefault())
                    if (!matchedKeywords.contains(matchedText)) {
                        matchedKeywords.add(matchedText)
                    }
                }
            }

            if (categoryMatchCount > 0) {
                val multiplier = 1.0 + (categoryMatchCount - 1) * 0.25
                totalRawScore += (categoryScore * multiplier).toInt()
                matchedCategoriesList.add(category.name)
            }
        }

        val riskScore = totalRawScore.coerceIn(0, 100)

        val threatLevel = when {
            riskScore >= 75 -> "CRITICAL"
            riskScore >= 50 -> "HIGH"
            riskScore >= 25 -> "MEDIUM"
            else -> "SAFE"
        }

        val isCritical = threatLevel == "CRITICAL"

        val ttsWarning = when (threatLevel) {
            "CRITICAL" -> "WARNING: High threat scam detected. Do not share OTP, do not download apps, and do not transfer money. Please hang up now. Family has been alerted."
            "HIGH" -> "Caution: Suspicious caller detected. Do not share personal details or banking passwords."
            "MEDIUM" -> "Notice: Potential spam inquiry detected. Stay cautious."
            else -> null
        }

        val recommendedAction = when (threatLevel) {
            "CRITICAL" -> "EMERGENCY: Immediate Call Interruption & Family SOS Alert"
            "HIGH" -> "Warning banner shown on senior screen. Family notified."
            "MEDIUM" -> "Log suspicious incident."
            else -> "Safety Shield Active"
        }

        return ClassificationResult(
            riskScore = riskScore,
            threatLevel = threatLevel,
            isCritical = isCritical,
            matchedKeywords = matchedKeywords,
            matchedCategories = matchedCategoriesList,
            ttsWarningText = ttsWarning,
            recommendedAction = recommendedAction
        )
    }
}
