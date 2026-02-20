import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import database, {
  get,
  ref,
  serverTimestamp,
} from "@react-native-firebase/database";

// Initialize with modular syntax
const app = getApp();

const DB_URL =
  "https://smooth-pivot-453409-f7-default-rtdb.asia-southeast1.firebasedatabase.app/";

// ✅ Create the regional database reference
const rtdb = database(app).app.database(DB_URL);
// ✅ Use the instance to enable persistence
rtdb.setPersistenceEnabled(true);
rtdb.setPersistenceCacheSizeBytes(20 * 1024 * 1024);

const authInstance = getAuth();
const db = getFirestore();
const storage = getStorage();

export { authInstance as auth, db, storage, rtdb, get, ref, serverTimestamp };
