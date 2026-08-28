package com.guardianbot.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.guardianbot.detector.AudioTranscriptionService

class CallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GuardianCallReceiver"
        private var lastState = TelephonyManager.CALL_STATE_IDLE
        private var incomingNumber: String? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            if (number != null && number.isNotBlank()) {
                incomingNumber = number
            }

            var state = TelephonyManager.CALL_STATE_IDLE
            when (stateStr) {
                TelephonyManager.EXTRA_STATE_RINGING -> state = TelephonyManager.CALL_STATE_RINGING
                TelephonyManager.EXTRA_STATE_OFFHOOK -> state = TelephonyManager.CALL_STATE_OFFHOOK
                TelephonyManager.EXTRA_STATE_IDLE -> state = TelephonyManager.CALL_STATE_IDLE
            }

            handleStateChange(context, state, incomingNumber)
        }
    }

    private fun handleStateChange(context: Context, state: Int, number: String?) {
        if (state == lastState) return

        when (state) {
            TelephonyManager.CALL_STATE_OFFHOOK -> {
                // Call answered: start audio monitoring service
                Log.d(TAG, "Call connected with ${number ?: "Unknown"}. Launching Guardian Shield.")
                val serviceIntent = Intent(context, AudioTranscriptionService::class.java).apply {
                    action = AudioTranscriptionService.ACTION_START_MONITORING
                    putExtra(AudioTranscriptionService.EXTRA_CALLER_NUMBER, number ?: "Unknown")
                }
                ContextCompat.startForegroundService(context, serviceIntent)
            }

            TelephonyManager.CALL_STATE_IDLE -> {
                // Call ended: stop audio monitoring service
                Log.d(TAG, "Call ended. Stopping Guardian Shield.")
                val serviceIntent = Intent(context, AudioTranscriptionService::class.java).apply {
                    action = AudioTranscriptionService.ACTION_STOP_MONITORING
                }
                context.startService(serviceIntent)
            }
        }

        lastState = state
    }
}
