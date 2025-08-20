import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import {
//   API_KEY,
//   AUTH_DOMAIN,
//   PROJECT_ID,
//   STORAGE_BUCKET,
//   MESSAGING_SENDER_ID,
//   APP_ID,
//   MEASUREMENT_ID,
// } from "@env";

// const firebaseConfig = {
//   apiKey: API_KEY,
//   authDomain: AUTH_DOMAIN,
//   projectId: PROJECT_ID,
//   storageBucket: STORAGE_BUCKET,
//   messagingSenderId: MESSAGING_SENDER_ID,
//   appId: APP_ID,
//   measurementId: MEASUREMENT_ID,
// };
const firebaseConfig = {
  apiKey: "AIzaSyBSW7hAbu2_1-H2kAWj39DEDU12LNSEzrk",
  authDomain: "smooth-pivot-453409-f7.firebaseapp.com",
  projectId: "smooth-pivot-453409-f7",
  storageBucket: "smooth-pivot-453409-f7.firebasestorage.app",
  messagingSenderId: "295491417988",
  appId: "1:295491417988:web:b2163a62a138ffa6a34fd1",
  measurementId: "G-DE53ST5ZK3",
};

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
