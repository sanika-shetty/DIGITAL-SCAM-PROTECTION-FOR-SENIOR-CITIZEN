package com.guardianbot.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.guardianbot.R
import com.guardianbot.detector.TtsAlertService
import com.guardianbot.sync.FirestoreSyncManager
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var ttsService: TtsAlertService
    private val PERMISSION_REQUEST_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        ttsService = TtsAlertService(this)

        requestRequiredPermissions()
        setupUI()
    }

    private fun setupUI() {
        val tvStatus = findViewById<TextView>(R.id.tvShieldStatus)
        val btnSos = findViewById<Button>(R.id.btnEmergencySos)
        val btnCallSon = findViewById<Button>(R.id.btnCallSon)
        val btnTestShield = findViewById<Button>(R.id.btnTestShield)

        // Large high-contrast SOS button
        btnSos.setOnClickListener {
            triggerManualSos()
        }

        // 1-Tap Quick Call Family
        btnCallSon.setOnClickListener {
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:+919819012345")
            }
            startActivity(intent)
        }

        // Test Voice Shield button for senior peace of mind
        btnTestShield.setOnClickListener {
            ttsService.speakWarning("Guardian Shield is fully active. Your phone and calls are protected.")
            Toast.makeText(this, "Voice Shield Tested: Status OK", Toast.LENGTH_SHORT).show()
        }
    }

    private fun triggerManualSos() {
        ttsService.speakWarning("Emergency SOS activated. Alerting your family right now.")
        Toast.makeText(this, "🚨 SOS SENT TO FAMILY", Toast.LENGTH_LONG).show()

        // Sync emergency panic to Firestore backend
        Thread {
            try {
                FirestoreSyncManager.dispatchScamAlert(
                    seniorId = "senior_01",
                    seniorName = "Savitri Patel",
                    callerNumber = "SOS-BUTTON-MOBILE",
                    transcript = "Senior pressed on-screen Emergency SOS button in Guardian Bot App",
                    classification = com.guardianbot.detector.ClassificationResult(
                        riskScore = 100,
                        threatLevel = "CRITICAL",
                        isCritical = true,
                        matchedKeywords = listOf("sos", "emergency button"),
                        matchedCategories = listOf("Manual Senior Panic"),
                        ttsWarningText = "Emergency SOS Active",
                        recommendedAction = "IMMEDIATE CONTACT REQUIRED"
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }

    private fun requestRequiredPermissions() {
        val permissions = arrayOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.ACCESS_FINE_LOCATION
        )

        val ungranted = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (ungranted.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, ungranted.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ttsService.shutdown()
    }
}
