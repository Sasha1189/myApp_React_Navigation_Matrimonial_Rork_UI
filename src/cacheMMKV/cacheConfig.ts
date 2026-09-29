import { createMMKV, MMKV } from "react-native-mmkv";
import { resetDatabase } from "@/db/client";

// ==========================================
// 1. ISOLATED MMKV INSTANCES
// ==========================================

export const likesStorage = createMMKV({ id: "cache-likes" });
export const blocksStorage = createMMKV({ id: "cache-blocks" });
export const appStorage = createMMKV({ id: "cache-app" });

const allStorages: MMKV[] = [likesStorage, blocksStorage, appStorage];

// ==========================================
// 2. MMKV KEYS
// ==========================================

export const TIER_CACHE_KEY = "self_tier_cache";
export const PROFILE_CACHE_KEY = "self_profile_cache";
export const IS_DOC_UPLOADED_CACHE_KEY = "isUploaded_cache";
const DEVICE_ID_KEY = "device_id";

// ==========================================
// 3. GENERIC HELPERS
// ==========================================

/** Safe JSON parser with strict fallback handling */
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
// 4. PROFILE CACHE HELPERS
// ==========================================

/** Reads and parses the cached profile safely, returning the fallback if empty */
export const getCachedProfile = <T>(fallback: T): T => {
  const cached = appStorage.getString(PROFILE_CACHE_KEY);
  return safeParse<T>(cached, fallback);
};

/** Serializes and saves the updated profile into MMKV */
export const setCachedProfile = <T>(profile: T): void => {
  try {
    appStorage.set(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("❌ [Cache] Failed to save profile to MMKV:", error);
  }
};

/** Purges only the cached profile key */
export const clearCachedProfile = (): void => {
  appStorage.remove(PROFILE_CACHE_KEY);
};

// ==========================================
// 5. DEVICE & SYSTEM CONFIG
// ==========================================

export const getDBDeviceIdCache = (): string => {
  return appStorage.getString(DEVICE_ID_KEY) || "";
};

export const setDBDeviceIdCache = (deviceId: string) => {
  appStorage.set(DEVICE_ID_KEY, deviceId);
};

// ==========================================
// 6. TEARDOWN & PURGE
// ==========================================

/**
 * Wipes SQLite database tables and clears all isolated MMKV storage instances.
 * Call this directly during the logout lifecycle.
 */
export async function clearCacheOnLogout() {
  try {
    // 1. Reset SQLite tables (Drizzle / Local DB)
    await resetDatabase();

    // 2. Clear all MMKV instances in parallel
    allStorages.forEach((inst) => inst.clearAll());

    console.log("🧹 SQLite and MMKV domain caches purged successfully.");
  } catch (storageError) {
    console.error("⚠️ Cache purge error on logout:", storageError);
  }
}

//.................................................................

// Generates local YYYY-MM-DD string
const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayStorageKey = (uid: string): string => {
  return `daily_msg_count_${uid}_${getTodayDateStr()}`;
};

export const getDailySentCount = (uid: string): number => {
  if (!uid) return 0;
  return appStorage.getNumber(getTodayStorageKey(uid)) ?? 0;
};

export const incrementDailySentCount = (uid: string): number => {
  if (!uid) return 0;
  const key = getTodayStorageKey(uid);
  const current = appStorage.getNumber(key) ?? 0;
  const next = current + 1;
  appStorage.set(key, next);
  return next;
};
