const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();

const MIN_MAX_PATH = "/sensor/minmax";
const TEMP_PATH = "/sensor/temperature";

/**
 * Cloud Function: Tracks min/max temperature in Firebase
 * Triggers on every write to /sensor/temperature
 */
exports.trackMinMax = functions.database
  .ref(TEMP_PATH)
  .onWrite(async (change, context) => {
    const newTemp = change.after.val();
    
    // Ignore deletions or null values
    if (newTemp === null) {
      console.log("Temperature deleted, skipping min/max update");
      return null;
    }

    const temp = Number(newTemp);
    
    // Validate temperature range
    if (isNaN(temp) || temp < -40 || temp > 80) {
      console.log(`Invalid temperature value: ${newTemp}`);
      return null;
    }

    const minMaxRef = db.ref(MIN_MAX_PATH);
    
    try {
      const snapshot = await minMaxRef.once("value");
      const current = snapshot.val() || { min: temp, max: temp };

      let updated = false;
      const now = Date.now();

      if (current.min === null || temp < current.min) {
        current.min = temp;
        current.minTime = now;
        updated = true;
        console.log(`New minimum: ${temp}°C`);
      }
      if (current.max === null || temp > current.max) {
        current.max = temp;
        current.maxTime = now;
        updated = true;
        console.log(`New maximum: ${temp}°C`);
      }

      if (updated) {
        await minMaxRef.set(current);
        console.log("Min/Max updated in Firebase:", current);
      }

      return null;
    } catch (error) {
      console.error("Error updating min/max:", error);
      return null;
    }
  });

/**
 * Cloud Function: Reset min/max (callable from dashboard)
 * Usage: firebase functions:shell -> resetMinMax({})
 */
exports.resetMinMax = functions.https.onCall(async (data, context) => {
  // Optional: Add authentication check
  // if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  
  try {
    await db.ref(MIN_MAX_PATH).set({ min: null, max: null, minTime: null, maxTime: null });
    console.log("Min/Max reset by user");
    return { success: true, message: "Min/Max reset successfully" };
  } catch (error) {
    console.error("Error resetting min/max:", error);
    throw new functions.https.HttpsError("internal", "Failed to reset min/max");
  }
});

/**
 * Cloud Function: Manual min/max update (for testing)
 */
exports.manualMinMaxUpdate = functions.https.onCall(async (data, context) => {
  const { temperature } = data;
  if (typeof temperature !== "number") {
    throw new functions.https.HttpsError("invalid-argument", "temperature must be a number");
  }
  
  // Trigger the same logic as trackMinMax
  const temp = temperature;
  const minMaxRef = db.ref(MIN_MAX_PATH);
  
  try {
    const snapshot = await minMaxRef.once("value");
    const current = snapshot.val() || { min: temp, max: temp };

    let updated = false;
    const now = Date.now();

    if (current.min === null || temp < current.min) {
      current.min = temp;
      current.minTime = now;
      updated = true;
    }
    if (current.max === null || temp > current.max) {
      current.max = temp;
      current.maxTime = now;
      updated = true;
    }

    if (updated) {
      await minMaxRef.set(current);
    }

    return { success: true, minmax: current };
  } catch (error) {
    console.error("Error in manual update:", error);
    throw new functions.https.HttpsError("internal", "Failed to update min/max");
  }
});