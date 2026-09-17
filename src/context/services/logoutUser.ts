import { clearCacheOnLogout } from "@/cacheMMKV/cacheConfig";
import { getAuth, signOut } from "@react-native-firebase/auth";
import {
  getDatabase,
  ref,
  update,
  serverTimestamp,
} from "@react-native-firebase/database";

// export async function logoutUserh(uid?: string): Promise<void> {
//   if (uid) {
//     const statusRef = ref(getDatabase(), `/status/${uid}`);
//     await update(statusRef, {
//       state: "offline",
//       lastChanged: serverTimestamp(),
//     }).catch((err) => console.log("Background status sync skipped:", err));
//   }

//   clearCacheOnLogout();

//   await signOut(getAuth());
// }

export async function logoutUser({
  uid,
  setAuthLoading,
}: {
  uid?: string;
  setAuthLoading?: (loading: boolean) => void;
}): Promise<void> {
  try {
    // 1. Sync offline status while auth session & UI are fully active
    if (uid) {
      const statusRef = ref(getDatabase(), `/status/${uid}`);
      await update(statusRef, {
        state: "offline",
        lastChanged: serverTimestamp(),
      }).catch((err) => console.log("Background status sync skipped:", err));
    }

    // 2. Trigger Auth Loading -> Unmounts AppNavigator & Feed hooks instantly
    if (setAuthLoading) {
      setAuthLoading(true);
    }

    // 3. Allow 50ms for React microtasks & unmount effects to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 4. Wipe SQLite tables & MMKV storage safely
    clearCacheOnLogout();

    // 5. Sign out of Firebase Auth
    await signOut(getAuth());
  } catch (error) {
    console.error("[Logout Error]:", error);
    await signOut(getAuth());
  } finally {
    if (setAuthLoading) {
      setAuthLoading(false);
    }
  }
}
