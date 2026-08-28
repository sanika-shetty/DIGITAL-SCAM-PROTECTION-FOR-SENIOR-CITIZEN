/**
 * ============================================================================
 * GUARDIAN BOT - ESP32 PHYSICAL SOS PANIC BUTTON FIRMWARE
 * Target Simulation: Wokwi ESP32
 * ============================================================================
 * Description:
 *  - Connects to virtual WiFi (Wokwi-GUEST).
 *  - Monitors physical emergency push-button on GPIO 4 with internal pull-up.
 *  - Emits local audio-visual feedback (Green/Red LEDs + Piezo Siren on GPIO 5).
 *  - Dispatches an instantaneous HTTPS/HTTP POST alert to the Guardian Cloud/Backend.
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// --- PIN DEFINITIONS ---
const int PIN_BUTTON    = 4;   // Emergency SOS Push Button (Active LOW with INPUT_PULLUP)
const int PIN_LED_GREEN = 2;   // Normal / Safe Standby Status LED
const int PIN_LED_RED   = 15;  // Emergency Triggered Warning LED
const int PIN_BUZZER    = 5;   // Piezo Buzzer Siren

// --- NETWORK CONFIGURATION ---
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Guardian Bot Backend Endpoint
// (For local testing with Wokwi Bridge or hosted backend URL)
const char* BACKEND_SOS_URL = "http://host.wokwi.internal:5000/api/hardware/sos";
// Optional direct Firebase Firestore REST endpoint fallback
const char* FIREBASE_REST_URL = "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/hardware_triggers";

// --- DEVICE TELEMETRY ---
const char* DEVICE_ID   = "ESP32-SOS-01";
const char* SENIOR_ID   = "senior_01";
const char* LOCATION    = "Living Room Emergency Station";
int simulatedBattery    = 98;

// --- DEBOUNCE & STATE VARIABLES ---
int lastButtonState       = HIGH;
int currentButtonState    = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50; // ms

bool isAlertActive = false;
unsigned long alertStartTime = 0;

void printAsciiBanner() {
  Serial.println(F("\n========================================================="));
  Serial.println(F("   🛡️  GUARDIAN BOT - IOT EMERGENCY SOS CONTROLLER       "));
  Serial.println(F("   Real-Time Senior Citizen Protection & Alert Dispatch   "));
  Serial.println(F("========================================================="));
}

void connectWiFi() {
  Serial.print(F("\n[WiFi] Connecting to network: "));
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(F("."));
    digitalWrite(PIN_LED_GREEN, !digitalRead(PIN_LED_GREEN)); // Blink while connecting
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED_GREEN, HIGH); // Solid GREEN = Online & Protected
    digitalWrite(PIN_LED_RED, LOW);
    Serial.println(F("\n[WiFi] CONNECTED SUCCESSFULLY!"));
    Serial.print(F("[WiFi] IP Address: "));
    Serial.println(WiFi.localIP());
    Serial.println(F("[System] Ready. Press physical SOS Button to trigger Panic Alert.\n"));
  } else {
    Serial.println(F("\n[WiFi] Connection Failed. Operating in Offline Emergency Mode."));
    digitalWrite(PIN_LED_GREEN, LOW);
  }
}

void playBuzzerPattern() {
  // Beep-beep alarm pattern
  for (int i = 0; i < 3; i++) {
    tone(PIN_BUZZER, 2400, 150);
    delay(200);
    tone(PIN_BUZZER, 3200, 200);
    delay(250);
  }
  noTone(PIN_BUZZER);
}

void sendEmergencyAlert() {
  Serial.println(F("\n🚨 ========================================================="));
  Serial.println(F("🚨 [SOS TRIGGERED] SENIOR PRESSED EMERGENCY PANIC BUTTON!"));
  Serial.println(F("🚨 ========================================================="));

  // 1. Visual & Audio Local Indicator
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, HIGH);
  playBuzzerPattern();

  // 2. Transmit HTTP Alert Payload
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_SOS_URL);
    http.addHeader("Content-Type", "application/json");

    // Build JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
    jsonPayload += "\"seniorId\":\"" + String(SENIOR_ID) + "\",";
    jsonPayload += "\"location\":\"" + String(LOCATION) + "\",";
    jsonPayload += "\"battery\":" + String(simulatedBattery) + ",";
    jsonPayload += "\"buttonState\":\"PRESSED\",";
    jsonPayload += "\"timestamp\":\"" + String(millis()) + "\"";
    jsonPayload += "}";

    Serial.print(F("[Cloud Sync] Dispatching SOS Payload: "));
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print(F("✅ [Cloud Sync] Server Responded with Code: "));
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.print(F("✅ [Cloud Sync] Response: "));
      Serial.println(response);
    } else {
      Serial.print(F("⚠️ [Cloud Sync] HTTP POST error: "));
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println(F("⚠️ [Cloud Sync] WiFi Disconnected. Retrying Connection..."));
    connectWiFi();
  }

  isAlertActive = true;
  alertStartTime = millis();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  printAsciiBanner();

  // Initialize GPIO Pins
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Initial LED State
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  noTone(PIN_BUZZER);

  // Connect to Network
  connectWiFi();
}

void loop() {
  // Read push button state with debounce
  int reading = digitalRead(PIN_BUTTON);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != currentButtonState) {
      currentButtonState = reading;

      // Button is pressed (Active LOW)
      if (currentButtonState == LOW) {
        sendEmergencyAlert();
      }
    }
  }

  lastButtonState = reading;

  // Handle active alert flashing LED state (flashes Red for 10 seconds post-trigger)
  if (isAlertActive) {
    if (millis() - alertStartTime < 10000) {
      digitalWrite(PIN_LED_RED, (millis() / 250) % 2 == 0 ? HIGH : LOW);
    } else {
      // Revert to normal protected state
      isAlertActive = false;
      digitalWrite(PIN_LED_RED, LOW);
      digitalWrite(PIN_LED_GREEN, HIGH);
      Serial.println(F("[System] Alert state reset. Returned to Normal Standby.\n"));
    }
  }
}
