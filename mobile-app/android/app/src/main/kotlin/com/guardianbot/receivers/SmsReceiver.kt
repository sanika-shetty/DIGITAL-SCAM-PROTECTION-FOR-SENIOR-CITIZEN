package com.guardianbot.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.guardianbot.detector.ScamClassifier
import com.guardianbot.detector.TtsAlertService
import com.guardianbot.sync.FirestoreSyncManager

class SmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GuardianSmsReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.displayOriginatingAddress ?: "Unknown"
                val body = sms.displayMessageBody ?: ""

                Log.d(TAG, "Intercepted SMS from $sender: $body")

                // Run on-device scam classification
                val result = ScamClassifier.evaluate(body)

                if (result.riskScore >= 40) {
                    Log.w(TAG, "🚨 High Risk SMS Detected! Score=${result.riskScore}")

                    // Audio & tactile warning
                    val tts = TtsAlertService(context)
                    tts.speakWarning("Attention: Dangerous scam message received from $sender. Do not click links or share verification codes.")

                    // Dispatch alert to Firestore for Family Dashboard
                    FirestoreSyncManager.dispatchSmsAlert(
                        seniorId = "senior_01",
                        seniorName = "Savitri Patel",
                        sender = sender,
                        body = body,
                        classification = result
                    )
                }
            }
        }
    }
}
