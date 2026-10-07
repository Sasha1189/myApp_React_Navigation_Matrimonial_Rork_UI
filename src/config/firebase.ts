import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  initializeFirestore,
} from "@react-native-firebase/firestore";
import {
  getDatabase,
  setPersistenceEnabled,
  setPersistenceCacheSizeBytes,
} from "@react-native-firebase/database";

// 1. Core Instances
export const app = getApp();
export const auth = getAuth(app);

async function initializeFirebaseServices() {
  await initializeFirestore(app, {
    persistence: false, // disable offline persistence
  });
}
initializeFirebaseServices();

export const firestore = getFirestore(app);

// 2. Realtime Database Setup
const DB_URL = process.env.EXPO_PUBLIC_FIREBASE_RTDB_URL;
export const rtdb = getDatabase(app, DB_URL);
setPersistenceEnabled(rtdb, true);
setPersistenceCacheSizeBytes(rtdb, 50 * 1024 * 1024);

// 3. RTDB Exports
export {
  ref,
  get,
  set,
  update,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  serverTimestamp,
  query,
  limitToLast,
  orderByChild,
  endAt,
  onDisconnect,
  goOnline,
  goOffline,
  keepSynced,
} from "@react-native-firebase/database";

// 5. Firestore Exports (Modular)
export {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query as queryFs, // Alias to avoid conflict with RTDB query
  where,
  orderBy,
  limit,
  writeBatch,
  deleteField,
  getDocFromCache,
  getDocsFromCache,
  getDocsFromServer,
  arrayUnion,
  arrayRemove,
  getFirestore,
  terminate,
  clearIndexedDbPersistence,
  serverTimestamp as firestoreServerTimestamp,
  Timestamp,
} from "@react-native-firebase/firestore";

export {
  getIdToken,
  updateProfile,
  reload,
  signOut,
} from "@react-native-firebase/auth";
