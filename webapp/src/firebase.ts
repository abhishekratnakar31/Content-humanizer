import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBpR5nRKcJfrjhhq9wfd27URqMs8wW6Do",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "content-humanizer-f9499.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "content-humanizer-f9499",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "content-humanizer-f9499.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "834497591742",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:834497591742:web:a1022aa55f447d8dc3e1ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
