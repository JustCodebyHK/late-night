/*
 * ESP32 DHT11 Sensor Data to Firebase Realtime Database
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - DHT11 Temperature & Humidity Sensor
 * - Jumper wires
 * 
 * Wiring:
 * - DHT11 VCC -> 3.3V (or 5V)
 * - DHT11 GND -> GND
 * - DHT11 DATA -> GPIO 4 (or any digital pin)
 * 
 * Libraries needed (install via Library Manager):
 * - Firebase ESP Client (by mobizt)
 * - DHT sensor library (by Adafruit)
 * - Adafruit Unified Sensor
 * 
 * Firebase Setup:
 * 1. Create Firebase project at console.firebase.google.com
 * 2. Enable Realtime Database (test mode for development)
 * 3. Get database URL and API key from Project Settings
 * 4. Set database rules to allow read/write (for testing)
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <time.h>

// ============ CONFIGURATION ============
// WiFi Credentials - REPLACE WITH YOUR WIFI
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase Configuration - FROM YOUR PROJECT
#define API_KEY "AIzaSyAl9enr3rEMOnLWTXukeLZRZcYdNX6T86g"
#define DATABASE_URL "https://late-night-82be8-default-rtdb.asia-southeast1.firebasedatabase.app" // No trailing slash

// Device Configuration
#define DEVICE_ID "esp32-dht11-01"
#define DHT_PIN 4
#define DHT_TYPE DHT11

// Reading interval (milliseconds)
#define READING_INTERVAL 30000  // 30 seconds

// ============ GLOBAL OBJECTS ============
DHT dht(DHT_PIN, DHT_TYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastReadingTime = 0;
bool firebaseReady = false;
int wifiReconnectAttempts = 0;
const int MAX_WIFI_RECONNECT = 10;

// NTP Time sync
const char* ntpServer = "pool.ntp.org";
// Your database is in asia-southeast1 region - adjust timezone offset:
// IST (India): 19800, WIB (Jakarta): 25200, PHT (Philippines): 28800, etc.
const long gmtOffset_sec = 19800;      // Change this for your timezone (seconds from UTC)
const int daylightOffset_sec = 0;      // Adjust for DST if applicable (usually 3600)

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== ESP32 DHT11 Firebase Logger ===");
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT11 initialized on pin " + String(DHT_PIN));
  
  // Connect to WiFi
  connectWiFi();
  
  // Configure time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time sync...");
  waitForTimeSync();
  
  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // For anonymous auth (or use email/password)
  auth.user.email = "";
  auth.user.password = "";
  
  // Optional: Set token generation callback
  config.token_status_callback = tokenStatusCallback;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Set database read/write size limits
  fbdo.setBSSLBufferSize(4096, 1024);
  fbdo.setResponseSize(2048);
  
  Serial.println("Firebase initialized");
  firebaseReady = true;
  
  // Set initial device status
  updateDeviceStatus(true);
}

// ============ MAIN LOOP ============
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    handleWiFiReconnect();
    return;
  }
  
  // Check Firebase readiness
  if (!Firebase.ready()) {
    Serial.println("Firebase not ready, waiting...");
    delay(1000);
    return;
  }
  
  unsigned long currentTime = millis();
  
  // Take reading at interval
  if (currentTime - lastReadingTime >= READING_INTERVAL || lastReadingTime == 0) {
    lastReadingTime = currentTime;
    takeAndSendReading();
  }
  
  // Keep Firebase connection alive
  Firebase.loop();
  
  delay(100); // Small delay to prevent watchdog issues
}

// ============ SENSOR READING & FIREBASE ============
void takeAndSendReading() {
  // Read temperature and humidity
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius
  
  // Check for valid readings
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT11 sensor!");
    return;
  }
  
  // Validate ranges (DHT11 specs: 0-50°C, 20-90% RH)
  if (temperature < -40 || temperature > 80 || humidity < 0 || humidity > 100) {
    Serial.println("Reading out of valid range, discarding");
    return;
  }
  
  Serial.printf("Reading: %.1f°C, %.1f%%\n", temperature, humidity);
  
  // Get current timestamp
  time_t now = time(nullptr);
  unsigned long timestamp = now * 1000; // Convert to milliseconds
  
  // Prepare data for Firebase
  FirebaseJson json;
  json.set("temperature", temperature);
  json.set("humidity", humidity);
  json.set("timestamp", timestamp);
  json.set("deviceId", DEVICE_ID);
  
  // 1. Push to history/readings (auto-generated key)
  String readingsPath = "/sensors/" + String(DEVICE_ID) + "/readings";
  if (Firebase.RTDB.pushJSON(&fbdo, readingsPath.c_str(), &json)) {
    Serial.println("✓ Historical reading saved");
  } else {
    Serial.printf("✗ Failed to save reading: %s\n", fbdo.errorReason().c_str());
  }
  
  // 2. Update latest reading
  String latestPath = "/sensors/" + String(DEVICE_ID) + "/latest";
  if (Firebase.RTDB.setJSON(&fbdo, latestPath.c_str(), &json)) {
    Serial.println("✓ Latest reading updated");
  } else {
    Serial.printf("✗ Failed to update latest: %s\n", fbdo.errorReason().c_str());
  }
  
  // 3. Update device status (online with timestamp)
  updateDeviceStatus(true);
}

// Update device online/offline status
void updateDeviceStatus(bool online) {
  FirebaseJson statusJson;
  statusJson.set("online", online);
  statusJson.set("lastSeen", (unsigned long)(time(nullptr) * 1000));
  statusJson.set("deviceId", DEVICE_ID);
  statusJson.set("firmware", "1.0.0");
  statusJson.set("freeHeap", ESP.getFreeHeap());
  statusJson.set("wifiRSSI", WiFi.RSSI());
  
  String statusPath = "/sensors/" + String(DEVICE_ID) + "/status";
  if (Firebase.RTDB.setJSON(&fbdo, statusPath.c_str(), &statusJson)) {
    Serial.println("✓ Device status updated");
  } else {
    Serial.printf("✗ Status update failed: %s\n", fbdo.errorReason().c_str());
  }
}

// ============ WIFI MANAGEMENT ============
void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
    wifiReconnectAttempts = 0;
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    ESP.restart();
  }
}

void handleWiFiReconnect() {
  if (wifiReconnectAttempts >= MAX_WIFI_RECONNECT) {
    Serial.println("Max WiFi reconnect attempts reached, restarting...");
    ESP.restart();
  }
  
  Serial.printf("WiFi lost, reconnecting... (attempt %d/%d)\n", 
                wifiReconnectAttempts + 1, MAX_WIFI_RECONNECT);
  
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✓ WiFi Reconnected!");
    wifiReconnectAttempts = 0;
    // Re-establish Firebase
    Firebase.begin(&config, &auth);
  } else {
    wifiReconnectAttempts++;
  }
}

// ============ TIME SYNC ============
void waitForTimeSync() {
  time_t now = 0;
  int attempts = 0;
  while (now < 100000 && attempts < 20) { // Wait until year 1973+
    delay(500);
    time(&now);
    attempts++;
  }
  if (now >= 100000) {
    Serial.println("✓ Time synchronized");
  } else {
    Serial.println("⚠ Time sync timeout, using approximate time");
  }
}

// ============ FIREBASE CALLBACKS ============
void tokenStatusCallback(TokenInfo info) {
  if (info.status == token_status_error) {
    Serial.printf("Token error: %s\n", info.error.c_str());
  }
}