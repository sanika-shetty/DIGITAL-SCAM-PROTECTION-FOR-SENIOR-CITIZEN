package com.guardianbot.detector

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.guardianbot.sync.FirestoreSyncManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AudioTranscriptionService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private lateinit var ttsAlertService: TtsAlertService
    private var isMonitoring = false
    private var callerNumber: String = "Unknown"

    companion object {
        private const val TAG = "AudioTranscriptionSvc"
        private const val CHANNEL_ID = "guardian_shield_channel"
        private const val NOTIFICATION_ID = 1001

        const val ACTION_START_MONITORING = "ACTION_START_MONITORING"
        const val ACTION_STOP_MONITORING = "ACTION_STOP_MONITORING"
        const val EXTRA_CALLER_NUMBER = "EXTRA_CALLER_NUMBER"
    }

    override fun onCreate() {
        super.onCreate()
        ttsAlertService = TtsAlertService(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_MONITORING -> {
                callerNumber = intent.getStringExtra(EXTRA_CALLER_NUMBER) ?: "Unknown"
                startForeground(NOTIFICATION_ID, buildForegroundNotification())
                startAudioAnalysisPipeline()
            }
            ACTION_STOP_MONITORING -> {
                stopAudioAnalysisPipeline()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun startAudioAnalysisPipeline() {
        if (isMonitoring) return
        isMonitoring = true
        Log.d(TAG, "Starting Whisper Speech Transcription Pipeline for call with $callerNumber")

        serviceScope.launch {
            // Simulated Whisper chunk transcription ingestion loop
            // In native production, this connects to Android AudioRecord + ONNX Whisper / cloud Whisper API
            FirestoreSyncManager.logCallStarted("senior_01", callerNumber)
        }
    }

    /**
     * Process speech chunk transcribed from Whisper pipeline
     */
    fun processTranscribedChunk(chunkText: String) {
        val result = ScamClassifier.evaluate(chunkText)
        Log.d(TAG, "Chunk Analysis Result: Score=${result.riskScore}, Level=${result.threatLevel}")

        // 1. If risk score reaches High or Critical, execute instantaneous TTS audio warning to senior
        if (result.riskScore >= 50 && result.ttsWarningText != null) {
            ttsAlertService.speakWarning(result.ttsWarningText)
        }

        // 2. Sync to Firebase Firestore to notify Family Dashboard
        if (result.riskScore >= 50) {
            FirestoreSyncManager.dispatchScamAlert(
                seniorId = "senior_01",
                seniorName = "Savitri Patel",
                callerNumber = callerNumber,
                transcript = chunkText,
                classification = result
            )
        }
    }

    private fun stopAudioAnalysisPipeline() {
        isMonitoring = false
        Log.d(TAG, "Stopped audio transcription pipeline")
        FirestoreSyncManager.logCallEnded("senior_01")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Guardian Active Call Protection",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active background audio scam detector shield for senior safety"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Guardian Bot Active Shield")
            .setContentText("Monitoring live call for scam and fraud patterns...")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
        ttsAlertService.shutdown()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
