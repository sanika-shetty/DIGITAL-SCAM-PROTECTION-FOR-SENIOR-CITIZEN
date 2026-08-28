# Guardian Bot - Hardware SOS Panic Button (ESP32 Wokwi Simulation)

This directory contains the firmware and electronic schematic for an IoT emergency SOS panic station for senior citizens.

## Pinout Map

| Component | ESP32 Pin | Logic / Purpose |
|---|---|---|
| **Emergency Push Button** | `GPIO 4` | Active LOW (`INPUT_PULLUP`). Connects to GND on press. |
| **Status LED (Green)** | `GPIO 2` | Active HIGH (Current-limiting 220Ω resistor). Indicates WiFi Online & System Standby. |
| **Alert LED (Red)** | `GPIO 15` | Active HIGH (Current-limiting 220Ω resistor). Flashes during active emergency panic trigger. |
| **Piezo Buzzer Siren** | `GPIO 5` | Generates 2.4kHz - 3.2kHz alert tone pattern on button press. |
| **Power & Ground** | `3V3`, `GND` | Ground rail connection for push button, LEDs, and buzzer. |

---

## How to Run in Wokwi (Online Browser Simulator)

1. Open [https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)
2. Copy & paste the contents of `sketch.ino` into the code editor.
3. Switch to the `diagram.json` tab and paste the contents of `diagram.json`.
4. Click the **Play / Start Simulation** button.
5. In the Serial Monitor, observe:
   - WiFi connecting to `Wokwi-GUEST`
   - Green LED lighting up
   - Pressing the red **SOS EMERGENCY** button instantly triggers the buzzer siren, flashes the Red LED, and dispatches the HTTP POST payload to `/api/hardware/sos`.
6. Look at your React Family Dashboard to see the flashing fullscreen Panic Modal activate in real-time!
