package com.guardianbot.detector

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale

class TtsAlertService(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    companion object {
        private const val TAG = "GuardianTTS"
    }

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "Language is not supported for TTS")
            } else {
                isInitialized = true
                tts?.setSpeechRate(0.9f) // Slightly slower, clear voice for senior citizens
                tts?.setPitch(1.05f)

                // High priority audio stream to interrupt caller audio if needed
                val audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build()
                tts?.setAudioAttributes(audioAttributes)
                Log.d(TAG, "TTS Alert Service Initialized Successfully")
            }
        } else {
            Log.e(TAG, "TTS Initialization failed")
        }
    }

    fun speakWarning(warningMessage: String, onFinished: (() -> Unit)? = null) {
        if (!isInitialized) {
            Log.w(TAG, "TTS not ready yet. Retrying...")
            return
        }

        // Trigger strong haptic vibration pulse for elderly tactile alert
        triggerEmergencyVibration()

        val utteranceId = "GUARDIAN_SCAM_ALERT_${System.currentTimeMillis()}"

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                Log.d(TAG, "Started speaking alert: $warningMessage")
            }

            override fun onDone(utteranceId: String?) {
                Log.d(TAG, "Completed speaking alert")
                onFinished?.invoke()
            }

            override fun onError(utteranceId: String?) {
                Log.e(TAG, "Error playing TTS utterance")
            }
        })

        // Queue in FLUSH mode to override any active sound and immediately warn senior
        tts?.speak(warningMessage, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    private fun triggerEmergencyVibration() {
        try {
            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val timings = longArrayOf(0, 400, 200, 400, 200, 600)
                    val amplitudes = intArrayOf(0, 255, 0, 255, 0, 255)
                    vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(1000)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Vibration failed", e)
        }
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        isInitialized = false
    }
}
