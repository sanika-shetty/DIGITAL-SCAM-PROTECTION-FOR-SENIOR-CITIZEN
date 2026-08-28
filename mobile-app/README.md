# Guardian Bot - Mobile Application (`/mobile-app`)

The Guardian Bot mobile application runs on senior citizens' devices to provide proactive real-time protection against predatory phone and SMS scams.

## Architecture & Subsystems

1. **Call & SMS Interceptors (`receivers/`)**:
   - `CallReceiver.kt`: Intercepts `PHONE_STATE` broadcasts. Automatically starts the `AudioTranscriptionService` foreground monitoring service when a call is connected.
   - `SmsReceiver.kt`: Intercepts incoming SMS with highest priority, extracts phishing links and OTP requests, and triggers alerts.

2. **On-Device Scam Engine (`detector/ScamClassifier.kt`)**:
   - High-speed rule & pattern matching for:
     - Digital Arrest / Police & CBI Impersonation
     - Banking / KYC / OTP demands
     - Remote Access App downloads (AnyDesk, TeamViewer)
     - Coercive fund transfers
   - Calculates weighted composite risk score (0-100).

3. **Text-To-Speech (TTS) Interruption (`detector/TtsAlertService.kt`)**:
   - Executes immediate alarm-channel voice synthesis directly on the device: *"WARNING: Guardian Bot detected a dangerous scam attempt. Do not share OTP or transfer money. Please hang up now."*
   - Triggers multi-burst haptic vibration patterns.

4. **Senior UI (`ui/MainActivity.kt`)**:
   - High-contrast, large-button interface designed for elderly accessibility.
   - 1-Tap Emergency SOS.
   - 1-Tap Quick Dial Family button.
   - Voice shield verification button.

5. **Cloud Sync (`sync/FirestoreSyncManager.kt`)**:
   - Sends real-time alerts to the Firebase Firestore / REST backend to instantaneously notify family members on the web dashboard.
