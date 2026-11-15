/**
 * Reset Min/Max in Firebase - Run once to clear today's data
 * Usage: node scripts/reset-minmax.cjs
 */

const admin = require('firebase-admin');

function initializeFirebase() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not set');
    console.log('Set it: $env:FIREBASE_SERVICE_ACCOUNT_KEY="your_json_here"');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (e) {
    console.error('❌ Invalid JSON:', e.message);
    process.exit(1);
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
    });
    console.log('✅ Firebase initialized');
  }

  return admin.database();
}

async function resetMinMax() {
  const db = initializeFirebase();
  const minMaxRef = db.ref('sensor/minmax');

  try {
    // Set to null to completely remove the node
    await minMaxRef.remove();
    console.log('✅ Min/Max data completely cleared from Firebase');
    console.log('📝 Next run will create fresh min/max for today');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetMinMax();