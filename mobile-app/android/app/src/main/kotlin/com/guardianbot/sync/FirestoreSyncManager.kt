package com.guardianbot.sync

import android.util.Log
import com.guardianbot.detector.ClassificationResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object FirestoreSyncManager {

    private const val TAG = "FirestoreSync"
    private const val BACKEND_API_BASE = "http://10.0.2.2:5000/api" // Android Emulator localhost bridge or hosted URL

    private fun getCurrentIsoTimestamp(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date())
    }

    fun dispatchScamAlert(
        seniorId: String,
        seniorName: String,
        callerNumber: String,
        transcript: String,
        classification: ClassificationResult
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("seniorId", seniorId)
                    put("seniorName", seniorName)
                    put("type", "CALL_SCAM")
                    put("severity", classification.threatLevel)
                    put("riskScore", classification.riskScore)
                    put("category", classification.matchedCategories.firstOrNull() ?: "Scam Call")
                    put("snippet", transcript)
                    put("callerNumber", callerNumber)
                    put("channel", "PHONE_CALL")
                    put("highlightedKeywords", JSONArray(classification.matchedKeywords))
                    put("ttsWarning", classification.ttsWarningText)
                    put("recommendedAction", classification.recommendedAction)
                    put("status", "ACTIVE")
                    put("timestamp", getCurrentIsoTimestamp())
                }

                postJson("$BACKEND_API_BASE/alerts", json.toString())
                Log.d(TAG, "Successfully synced call scam alert to cloud.")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to dispatch scam alert", e)
            }
        }
    }

    fun dispatchSmsAlert(
        seniorId: String,
        seniorName: String,
        sender: String,
        body: String,
        classification: ClassificationResult
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("seniorId", seniorId)
                    put("seniorName", seniorName)
                    put("type", "SMS_PHISHING")
                    put("severity", classification.threatLevel)
                    put("riskScore", classification.riskScore)
                    put("category", classification.matchedCategories.firstOrNull() ?: "Phishing SMS")
                    put("snippet", body)
                    put("callerNumber", sender)
                    put("channel", "SMS")
                    put("highlightedKeywords", JSONArray(classification.matchedKeywords))
                    put("status", "ACTIVE")
                    put("timestamp", getCurrentIsoTimestamp())
                }

                postJson("$BACKEND_API_BASE/alerts", json.toString())
                Log.d(TAG, "Successfully synced SMS alert to cloud.")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to dispatch SMS alert", e)
            }
        }
    }

    fun logCallStarted(seniorId: String, callerNumber: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("status", "ON_CALL")
                    put("currentCall", JSONObject().apply {
                        put("callerNumber", callerNumber)
                        put("startedAt", getCurrentIsoTimestamp())
                    })
                }
                patchJson("$BACKEND_API_BASE/seniors/$seniorId", json.toString())
            } catch (e: Exception) {
                Log.e(TAG, "Failed to log call start", e)
            }
        }
    }

    fun logCallEnded(seniorId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("status", "PROTECTED")
                    put("currentCall", JSONObject.NULL)
                }
                patchJson("$BACKEND_API_BASE/seniors/$seniorId", json.toString())
            } catch (e: Exception) {
                Log.e(TAG, "Failed to log call end", e)
            }
        }
    }

    private fun postJson(urlString: String, jsonString: String) {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json; utf-8")
            setRequestProperty("Accept", "application/json")
            doOutput = true
            connectTimeout = 5000
            readTimeout = 5000
        }

        OutputStreamWriter(conn.outputStream).use { writer ->
            writer.write(jsonString)
            writer.flush()
        }

        val code = conn.responseCode
        Log.d(TAG, "POST $urlString -> Response code: $code")
        conn.disconnect()
    }

    private fun patchJson(urlString: String, jsonString: String) {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "PATCH"
            setRequestProperty("Content-Type", "application/json; utf-8")
            setRequestProperty("Accept", "application/json")
            doOutput = true
            connectTimeout = 5000
            readTimeout = 5000
        }

        OutputStreamWriter(conn.outputStream).use { writer ->
            writer.write(jsonString)
            writer.flush()
        }

        val code = conn.responseCode
        Log.d(TAG, "PATCH $urlString -> Response code: $code")
        conn.disconnect()
    }
}
