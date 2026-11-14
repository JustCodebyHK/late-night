import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

// Firebase Configuration
// Uses environment variables with fallbacks for development
// Create .env file from .env.example and add your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
const missingKeys = requiredKeys.filter(key => 
  !firebaseConfig[key] || firebaseConfig[key].startsWith('YOUR_')
);

if (missingKeys.length > 0 && import.meta.env.PROD) {
  console.warn(`Firebase config missing: ${missingKeys.join(', ')}. Please set environment variables.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const functions = getFunctions(app);

export { database, functions, ref, onValue, push, set, serverTimestamp, query, orderByChild, limitToLast };

// Database structure reference:
// /sensor/temperature - current temperature (from ESP8266)
// /sensor/humidity - current humidity (from ESP8266)
// /sensor/minmax - min/max tracked by Cloud Function 24/7
//   { min: number, max: number, minTime: number, maxTime: number }