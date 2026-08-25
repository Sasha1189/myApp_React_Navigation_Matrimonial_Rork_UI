import { createMMKV, MMKV } from "react-native-mmkv";
// import { resetDatabase } from "@/db/recovery/recovery";
import { resetDatabase } from "@/db/client";

// ==========================================
// 1. ISOLATED MMKV INSTANCES
// ==========================================

export const likesStorage = createMMKV({ id: "cache-likes" });
export const blocksStorage = createMMKV({ id: "cache-blocks" });
export const appStorage = createMMKV({ id: "cache-app" });

const allStorages: MMKV[] = [likesStorage, blocksStorage, appStorage];

// Universal JSON parser helper
export const safeParse = <T>(data: string | undefined, fallback: T): T => {
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

// ==========================================
// 2. DEVICE & SYSTEM CONFIG
// ==========================================

const DEVICE_ID_KEY = "device_id";

export const getDBDeviceIdCache = (): string => {
  return appStorage.getString(DEVICE_ID_KEY) || "";
};

export const setDBDeviceIdCache = (deviceId: string) => {
  appStorage.set(DEVICE_ID_KEY, deviceId);
};

// ==========================================
// 3. TEARDOWN & PURGE
// ==========================================

/**
 * Wipes SQLite database tables and clears all isolated MMKV storage instances.
 * Call this directly during the logout lifecycle.
 */
export async function clearCacheOnLogout() {
  try {
    // 1. Reset SQLite tables (Drizzle / Local DB) temporerily called from client
    await resetDatabase();

    // 2. Clear all MMKV instances in parallel
    allStorages.forEach((inst) => inst.clearAll());

    console.log("🧹 SQLite and MMKV domain caches purged successfully.");
  } catch (storageError) {
    console.error("⚠️ Cache purge error on logout:", storageError);
  }
}
