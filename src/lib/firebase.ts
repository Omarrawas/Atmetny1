
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Ensure getFirestore is imported
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions"; // Added Functions

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.includes("YOUR_API_KEY")) {
  throw new Error(
    "Firebase API Key is missing, is still the placeholder 'YOUR_API_KEY', or seems invalid. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY in your .env file is set to your actual Firebase API Key. " +
    "The application cannot initialize Firebase without a valid API key."
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const functions = getFunctions(app); // Initialize Firebase Functions

// للتطوير المحلي، يمكنك الاتصال بـ Functions Emulator إذا كنت تستخدمه
// if (process.env.NODE_ENV === 'development') {
//   try {
//     console.log("Connecting to Firebase Functions Emulator on localhost:5001");
//     connectFunctionsEmulator(functions, 'localhost', 5001);
//   } catch (e) {
//     console.error("Error connecting to Firebase Functions Emulator:", e);
//   }
// }


export { app, auth, googleProvider, db, functions };

