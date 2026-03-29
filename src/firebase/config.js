import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these with YOUR values from firebase-config-backup.txt
const firebaseConfig = {
  apiKey: "AIzaSyB8_N4ahqrKxOP206a3FIhw26z0d2pxMWE",
  authDomain: "remotedevicemanager-645f6.firebaseapp.com",
  projectId: "remotedevicemanager-645f6",
  storageBucket: "remotedevicemanager-645f6.firebasestorage.app",
  messagingSenderId: "835441367602",
  appId: "1:835441367602:web:272dec51c7710835373a2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export so other files can use them
export { auth, db };