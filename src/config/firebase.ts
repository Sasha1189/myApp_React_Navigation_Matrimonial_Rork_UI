import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyBSW7hAbu2_1-H2kAWj39DEDU12LNSEzrk",
//   authDomain: "smooth-pivot-453409-f7.firebaseapp.com",
//   projectId: "smooth-pivot-453409-f7",
//   storageBucket: "smooth-pivot-453409-f7.firebasestorage.app",
//   messagingSenderId: "295491417988",
//   appId: "1:295491417988:web:b2163a62a138ffa6a34fd1",
//   measurementId: "G-DE53ST5ZK3",
// };
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Missing Firebase API key");
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// // Use initializeAuth with persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage };
export default app;
