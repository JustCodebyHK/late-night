/**
 * GitHub Actions Script: Update Min/Max Temperature
 * 
 * Reads current temperature from Firebase Realtime Database
 * Compares with stored min/max in /sensor/minmax
 * Updates if new extremes found
 * 
 * Run locally: node scripts/update-minmax.js
 * Requires: FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
function initializeFirebase() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set');
    console.log('📝 Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (e) {
    console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON:', e.message);
    process.exit(1);
  }

  // Check if already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
    });
    console.log('✅ Firebase Admin initialized');
  }

  return admin.database();
}

async function updateMinMax() {
  const db = initializeFirebase();
  const tempRef = db.ref('sensor/temperature');
  const minMaxRef = db.ref('sensor/minmax');

  try {
    // Read current temperature
    const tempSnapshot = await tempRef.once('value');
    const currentTemp = tempSnapshot.val();

    if (currentTemp === null) {
      console.log('⚠️ No temperature data found at /sensor/temperature');
      return { success: false, reason: 'No temperature data' };
    }

    const temp = Number(currentTemp);
    if (isNaN(temp) || temp < -40 || temp > 80) {
      console.log(`⚠️ Invalid temperature value: ${currentTemp}`);
      return { success: false, reason: 'Invalid temperature' };
    }

    console.log(`🌡️ Current temperature: ${temp}°C`);

    // Read existing min/max
    const minMaxSnapshot = await minMaxRef.once('value');
    const currentMinMax = minMaxSnapshot.val() || { min: temp, max: temp };

    let updated = false;
    const now = Date.now();

    // Check for new minimum
    if (currentMinMax.min === null || temp < currentMinMax.min) {
      currentMinMax.min = temp;
      currentMinMax.minTime = now;
      updated = true;
      console.log(`📉 New minimum: ${temp}°C`);
    }

    // Check for new maximum
    if (currentMinMax.max === null || temp > currentMinMax.max) {
      currentMinMax.max = temp;
      currentMinMax.maxTime = now;
      updated = true;
      console.log(`📈 New maximum: ${temp}°C`);
    }

    if (updated) {
      await minMaxRef.set(currentMinMax);
      console.log('✅ Min/Max updated in Firebase:', currentMinMax);
    } else {
      console.log('ℹ️ No new extremes, min/max unchanged');
    }

    return { 
      success: true, 
      updated, 
      minMax: currentMinMax,
      currentTemp: temp
    };

  } catch (error) {
    console.error('❌ Error updating min/max:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  updateMinMax()
    .then(result => {
      if (result.success) {
        console.log('✅ Script completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Script failed:', result.reason || result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('❌ Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = { updateMinMax };