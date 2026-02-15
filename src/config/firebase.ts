import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  where,
  orderBy,
  getDocs,
  limit, // and any others you need
} from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import {
  getDatabase,
  query,
  ref,
  push,
  set,
  onValue,
  off,
  onChildAdded,
  limitToLast,
} from "@react-native-firebase/database";

// Initialize with modular syntax
const app = getApp();
const authInstance = getAuth();
const db = getFirestore();
const storage = getStorage();
const DB_URL =
  "https://smooth-pivot-453409-f7-default-rtdb.asia-southeast1.firebasedatabase.app/";
export const rtdb = getDatabase(app, DB_URL);

export { authInstance as auth, db, storage };

export {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  ref,
  push,
  set,
  onValue,
  off,
  onChildAdded,
  limitToLast,
};

// src/config/firebase.ts
// import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
// import { getAuth } from '@react-native-firebase/auth';
// import { getFirestore, collection, doc, getDoc, setDoc, serverTimestamp, query, where, orderBy, getDocs } from '@react-native-firebase/firestore';
// import { getDatabase, ref, push, set, onValue, off, onChildAdded, onDisconnect, remove, update } from '@react-native-firebase/database';

// // 🔹 React Native Firebase automatically initializes the default app.
// // You don't need to manually call initializeApp unless using secondary apps.
// export const db = getFirestore(); // No 'app' parameter needed
// export const auth = getAuth();
// export const rtdb = getDatabase();

// export {
//   collection, doc, getDoc, setDoc, serverTimestamp,
//   query, where, orderBy, getDocs,
//   ref, push, set, onValue, off, onChildAdded, onDisconnect, remove, update
// };
