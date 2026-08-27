import { getAuth, signOut } from "@react-native-firebase/auth";
import {
  getDatabase,
  ref,
  update,
  serverTimestamp,
} from "@react-native-firebase/database";

export async function logoutUser(uid?: string): Promise<void> {
  if (uid) {
    const statusRef = ref(getDatabase(), `/status/${uid}`);
    await update(statusRef, {
      state: "offline",
      lastChanged: serverTimestamp(),
    }).catch((err) => console.log("Background status sync skipped:", err));
  }

  await signOut(getAuth());
}
