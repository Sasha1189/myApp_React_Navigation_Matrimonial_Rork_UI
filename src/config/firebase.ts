import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  initializeFirestore,
} from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import {
  getDatabase,
  setPersistenceEnabled,
  setPersistenceCacheSizeBytes,
} from "@react-native-firebase/database";

// 1. Core Instances
export const app = getApp();
export const auth = getAuth(app);

async function initializeFirebaseServices() {
  // Initialize Firestore with persistence off
  await initializeFirestore(app, {
    persistence: false, // disable offline persistence
  });
}
initializeFirebaseServices();

export const firestore = getFirestore(app);

export const storage = getStorage(app);

// 2. Realtime Database Setup
const DB_URL =
  "https://smooth-pivot-453409-f7-default-rtdb.asia-southeast1.firebasedatabase.app/";
export const rtdb = getDatabase(app, DB_URL);

// Apply persistence settings to the rtdb instance
setPersistenceEnabled(rtdb, true);
setPersistenceCacheSizeBytes(rtdb, 50 * 1024 * 1024); //50 MB cache

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

// 4. Storage Exports
export {
  ref as refStorage,
  getDownloadURL,
  deleteObject,
  putFile,
  refFromURL,
} from "@react-native-firebase/storage";

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
} from "@react-native-firebase/firestore";

export { getIdToken, updateProfile, reload } from "@react-native-firebase/auth";
