import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import {
  getDatabase,
  setPersistenceEnabled,
  setPersistenceCacheSizeBytes,
} from "@react-native-firebase/database";

const app = getApp();
export const auth = getAuth();

const DB_URL =
  "https://smooth-pivot-453409-f7-default-rtdb.asia-southeast1.firebasedatabase.app/";

export const rtdb = getDatabase(app, DB_URL);
setPersistenceEnabled(rtdb, true);
setPersistenceCacheSizeBytes(rtdb, 50 * 1024 * 1024); //50 MB cache
export const firestore = getFirestore();
export const storage = getStorage();
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
  keepSynced, // Import this for your Inbox logic
} from "@react-native-firebase/database";
