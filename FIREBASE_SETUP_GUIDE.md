# Firebase Setup Guide for ESP32 DHT11 Dashboard

This guide walks you through setting up Firebase Realtime Database for your ESP32 sensor dashboard.

## 📋 Prerequisites

- Google account
- Firebase project (free tier works fine)
- ESP32 board with DHT11 sensor

---

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `esp32-sensor-dashboard` (or your preferred name)
4. **Disable** Google Analytics (not needed for this project)
5. Click **"Create project"**
6. Wait for provisioning, then click **"Continue"**

---

## 🗄️ Step 2: Enable Realtime Database

1. In the left sidebar, click **Build** → **Realtime Database**
2. Click **"Create Database"**
3. Choose location (select closest to you)
4. **Important**: Select **"Start in test mode"** for development
   - This allows read/write without authentication
   - ⚠️ **Secure this before production!**
5. Click **"Enable"**

### Database Rules (Development)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Database Rules (Production - Recommended)
```json
{
  "rules": {
    "sensors": {
      "$deviceId": {
        ".read": true,
        ".write": "$deviceId === auth.uid || auth.token.device_id === $deviceId"
      }
    }
  }
}
```

---

## 🔑 Step 3: Get Firebase Configuration

1. In Firebase Console, click **Project Settings** (gear icon) → **General**
2. Scroll down to **"Your apps"** section
3. Click **Web app** icon (`</>`)
4. Register app: `esp32-dashboard`
5. **Don't** check "Set up Firebase Hosting"
6. Click **"Register app"**
7. Copy the **firebaseConfig** object values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## ⚙️ Step 4: Configure React Dashboard

### Update `src/firebase/config.js`

Replace the placeholder values with your actual Firebase config:

```javascript
// src/firebase/config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Important: Database URL Format
- ✅ Correct: `https://my-project-default-rtdb.firebaseio.com`
- ❌ Wrong: `https://my-project.firebaseio.com` (old format)
- ❌ Wrong: `https://console.firebase.google.com/project/my-project/...`

---

## 📱 Step 5: Configure ESP32

### Install Required Libraries (Arduino IDE)

1. Open Arduino IDE
2. Tools → Manage Libraries
3. Search and install:
   - **Firebase ESP Client** (by mobizt) - version 4.4.0+
   - **DHT sensor library** (by Adafruit)
   - **Adafruit Unified Sensor**

### Update ESP32 Code

Edit `esp32-firebase-dht11/esp32-firebase-dht11.ino`:

```cpp
// WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_NETWORK_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase Config (from Step 3)
#define API_KEY "YOUR_API_KEY_HERE"
#define DATABASE_URL "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"

// Device ID (must match dashboard)
#define DEVICE_ID "esp32-dht11-01"

// Timezone offset (seconds from UTC)
// Examples:
// UTC: 0
// EST: -18000
// PST: -28800
// CET: 3600
// IST: 19800
const long gmtOffset_sec = 19800;  // Change for your timezone
const int daylightOffset_sec = 0;  // 3600 if DST active
```

---

## 🔧 Step 6: Test the Setup

### 1. Start React Dashboard
```bash
cd esp32-dashboard
npm run dev
```
Open http://localhost:5173

### 2. Upload ESP32 Code
1. Connect ESP32 via USB
2. Select board: **ESP32 Dev Module**
3. Select correct port
4. Click **Upload**
5. Open Serial Monitor (115200 baud)

### 3. Verify Data Flow
**Serial Monitor should show:**
```
=== ESP32 DHT11 Firebase Logger ===
Device ID: esp32-dht11-01
DHT11 initialized on pin 4
Connecting to WiFi: YourNetwork
...........
✓ WiFi Connected!
IP Address: 192.168.1.100
RSSI: -45 dBm
Waiting for NTP time sync...
✓ Time synchronized
Firebase initialized
Reading: 23.5°C, 55.0%
✓ Historical reading saved
✓ Latest reading updated
✓ Device status updated
```

**Firebase Console → Realtime Database should show:**
```json
{
  "sensors": {
    "esp32-dht11-01": {
      "latest": {
        "temperature": 23.5,
        "humidity": 55.0,
        "timestamp": 1700000000000,
        "deviceId": "esp32-dht11-01"
      },
      "readings": {
        "-abc123xyz": {
          "temperature": 23.5,
          "humidity": 55.0,
          "timestamp": 1700000000000,
          "deviceId": "esp32-dht11-01"
        }
      },
      "status": {
        "online": true,
        "lastSeen": 1700000000000,
        "deviceId": "esp32-dht11-01",
        "freeHeap": 245000,
        "wifiRSSI": -45
      }
    }
  }
}
```

**Dashboard should display:**
- Current temperature & humidity cards
- Real-time updating charts
- Green "Live" status badge
- Device status panel showing "Online"

---

## 🐛 Troubleshooting

### Dashboard Shows "No Data"
1. Check browser console (F12) for errors
2. Verify `databaseURL` in config.js matches exactly
3. Check Firebase Database rules allow read
4. Ensure ESP32 is sending data (check Serial Monitor)

### ESP32 Can't Connect to Firebase
1. Verify `API_KEY` and `DATABASE_URL` are correct
2. Check WiFi credentials
3. Ensure Realtime Database is enabled (not Firestore)
4. Check Serial Monitor for error codes

### Common Error Codes
| Error | Cause | Fix |
|-------|-------|-----|
| `PERMISSION_DENIED` | Database rules | Set rules to test mode |
| `INVALID_API_KEY` | Wrong API key | Copy from Project Settings |
| `DATABASE_URL_NOT_SET` | Missing/invalid URL | Use format: `https://project-id-default-rtdb.firebaseio.com` |
| `NETWORK_ERROR` | WiFi/Internet | Check WiFi credentials |

### Time Sync Issues
- ESP32 uses NTP for timestamps
- If time is wrong, charts show incorrect times
- Adjust `gmtOffset_sec` for your timezone
- Check Serial Monitor for "Time synchronized" message

---

## 🔒 Step 7: Secure for Production

### 1. Database Rules (Production)
```json
{
  "rules": {
    "sensors": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "$deviceId === auth.uid"
      }
    }
  }
}
```

### 2. Firebase Authentication
- Enable **Email/Password** or **Anonymous** auth
- Update ESP32 to authenticate:
```cpp
auth.user.email = "device@yourdomain.com";
auth.user.password = "securepassword";
```

### 3. Environment Variables (React)
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
```

Update `config.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

---

## 📊 Database Structure Reference

```
/sensors
  /{deviceId}
    /latest          // Current reading (single object)
      temperature: number
      humidity: number
      timestamp: number (milliseconds since epoch)
      deviceId: string
    
    /readings        // Historical data (push keys)
      /{pushId}
        temperature: number
        humidity: number
        timestamp: number
        deviceId: string
    
    /status          // Device metadata
      online: boolean
      lastSeen: number
      deviceId: string
      firmware: string
      freeHeap: number
      wifiRSSI: number
```

---

## 🚀 Next Steps

1. **Add more sensors**: Extend ESP32 code for multiple DHT11s
2. **Alerts**: Add Firebase Functions for threshold alerts
3. **Multiple devices**: Use device selector in dashboard
4. **Data export**: Add CSV export button
5. **Mobile app**: Use same Firebase backend with React Native

---

## 📞 Support

If you encounter issues:
1. Check Serial Monitor output
2. Check browser console (F12)
3. Verify Firebase Console → Realtime Database has data
4. Review this guide's troubleshooting section

Happy monitoring! 🌡️💧