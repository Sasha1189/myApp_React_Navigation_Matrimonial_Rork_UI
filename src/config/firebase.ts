import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import database from "@react-native-firebase/database";

const app = getApp();

const DB_URL =
  "https://smooth-pivot-453409-f7-default-rtdb.asia-southeast1.firebasedatabase.app/";

// ✅ Create the regional database reference
const dbInstance = database(app);
// ✅ Use the instance to enable persistence
dbInstance.setPersistenceEnabled(true);
dbInstance.setPersistenceCacheSizeBytes(50 * 1024 * 1024); //50 MB cache

export const rtdb = dbInstance.app.database(DB_URL);
export const auth = getAuth();
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
