# 🛡️ Guardian Bot: Real-Time Scam Protection & Family Alerting for Senior Citizens

> A production-ready, full-stack cybersecurity safety ecosystem designed to protect elderly citizens from predatory phone scams, "Digital Arrest" coercion, OTP theft, and remote-access fraud through on-device AI transcription, physical IoT panic hardware, and an instant React family alert dashboard.

---

## 🌟 Key System Capabilities

- **🧠 Multi-Tier Scam Detection Engine**: Scans live audio transcripts and SMS against weighted heuristic rules ("Digital Arrest", CBI/Police impersonation, OTP phishing, AnyDesk remote access, bank account freeze threats).
- **🔊 On-Device Voice Warning (TTS)**: Interrupts senior calls in real time with clear, calming audio guidance (*"WARNING: Potential scam detected. Do not share codes or transfer money. Your family has been alerted."*).
- **🚨 Wokwi ESP32 IoT Panic Station**: Physical emergency SOS push button on `GPIO 4` with status LEDs, buzzer siren, and instant HTTP alert dispatch.
- **📊 Real-Time Family Web Dashboard**: High-contrast, dark-mode React interface with live threat gauge (0-100), live audio waveform visualizer, highlighted keyword transcripts, flashing emergency panic modals, and 1-click **Call Now** action buttons.
- **⚡ Dual-Mode Database**: Operates with zero friction out-of-the-box in **Reactive Memory Mode** or with live **Firebase Firestore** synchronization.

---

## 📁 Repository Directory Layout

```
DIGITAL-SCAM-PROTECTION-FOR-SENIOR-CITIZEN/
├── backend/                  # Node.js/Express REST API + WebSocket Server
│   ├── src/
│   │   ├── config/           # Firebase & Reactive Memory Store connector
│   │   ├── scamEngine/       # Rule-based knowledge base & multi-tier classifier
│   │   ├── controllers/      # Scam analysis, alerts, hardware SOS, simulation
│   │   ├── routes/           # REST API routes
│   │   ├── utils/            # WebSocket live broadcaster
│   │   └── server.js         # HTTP + WebSocket entry point
│   ├── package.json
│   └── .env.example
│
├── dashboard/                # React 18 + Tailwind CSS + Vite Family Web App
│   ├── src/
│   │   ├── components/       # ThreatMeter, LiveCallMonitor, ActiveThreatLog, PanicModal
│   │   ├── context/          # AlertContext with WebSocket & Firestore sync
│   │   ├── firebase/         # Client Firebase configuration
│   │   ├── utils/            # Web Audio emergency siren synthesizer
│   │   ├── App.jsx           # Master dashboard view
│   │   └── index.css         # High-contrast glassmorphism & scam highlight styles
│   ├── package.json
│   └── vite.config.js
│
├── hardware-sim/             # Wokwi ESP32 Simulation Firmware & Schematic
│   ├── sketch.ino            # ESP32 C++ firmware with WiFi, GPIO 4 button, LEDs, Buzzer
│   ├── diagram.json          # Complete Wokwi electronic schematic
│   ├── wokwi.toml            # Wokwi simulation config
│   └── README.md
│
├── mobile-app/               # Senior Mobile Device App Code
│   ├── android/              # Native Android Kotlin project
│   │   └── app/src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── kotlin/com/guardianbot/
│   │       │   ├── detector/   # ScamClassifier, AudioTranscriptionService, TtsAlertService
│   │       │   ├── receivers/  # CallReceiver, SmsReceiver
│   │       │   ├── sync/       # FirestoreSyncManager
│   │       │   └── ui/         # MainActivity (Accessible Senior UI)
│   │       └── res/layout/     # activity_main.xml
│   ├── react-native/         # Cross-platform companion for Expo
│   └── README.md
│
├── INTEGRATION_MANUAL.md     # Detailed End-to-End Setup & Verification Guide
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Launch the Backend API & WebSocket Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (REST) and `ws://localhost:5000/ws` (WebSocket).*

### 2. Launch the Family Web Dashboard
```bash
cd dashboard
npm install
npm run dev
```
*Dashboard opens at `http://localhost:5173`.*

### 3. Run the Hardware Panic Button Simulation (Wokwi)
1. Open [Wokwi ESP32 Simulator](https://wokwi.com/projects/new/esp32).
2. Paste `/hardware-sim/sketch.ino` into the code tab and `/hardware-sim/diagram.json` into the diagram tab.
3. Click **Start Simulation** and press the red **SOS EMERGENCY** button.
4. Watch the alert instantaneously trigger on the React Family Dashboard!

---

## 📖 Detailed Documentation
For the complete step-by-step connection guide, Firebase Firestore security rules, and verification scenarios, read **[INTEGRATION_MANUAL.md](file:///c:/Users/SANIKA/HACK/DIGITAL-SCAM-PROTECTION-FOR-SENIOR-CITIZEN/INTEGRATION_MANUAL.md)**.