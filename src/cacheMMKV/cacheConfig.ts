import { createMMKV, MMKV } from "react-native-mmkv";
import { resetDatabase } from "@/db/client";
import {
  UserTier,
  genderType,
  VerificationStatus,
} from "@/context/types/auth.types";

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
export const GENDER_CACHE_KEY = "self_gender";
export const VERIFIED_CACHE_KEY = "is_verified";
export const PROFILE_CACHE_KEY = "self_profile_cache";
export const DEVICE_ID_KEY = "device_id";

// ==========================================
// 3. tier
// ==========================================
export const getTierCache = (): UserTier => {
  const status = appStorage.getString(TIER_CACHE_KEY) as UserTier | undefined;
  return status ?? "none";
};

export const setTierCache = (status: UserTier): void => {
  appStorage.set(TIER_CACHE_KEY, status);
};

// ==========================================
// 2. Verified status
// ==========================================
export const getGenderCache = (): genderType => {
  const status = appStorage.getString(GENDER_CACHE_KEY) as
    | genderType
    | undefined;
  return status ?? "";
};

export const setGenderCache = (status: genderType): void => {
  appStorage.set(GENDER_CACHE_KEY, status);
};

// ==========================================
// 3. Verified status
// ==========================================
export const getVerifiedCache = (): VerificationStatus => {
  const status = appStorage.getString(VERIFIED_CACHE_KEY) as
    | VerificationStatus
    | undefined;
  return status ?? "false";
};

export const setVerifiedCache = (status: VerificationStatus): void => {
  appStorage.set(VERIFIED_CACHE_KEY, status);
};

// ==========================================
// 4. PROFILE CACHE HELPERS
// ==========================================
export const getCachedProfile = <T>(fallback: T): T => {
  const cached = appStorage.getString(PROFILE_CACHE_KEY);
  return safeParse<T>(cached, fallback);
};

export const setCachedProfile = <T>(profile: T): void => {
  try {
    appStorage.set(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("❌ [Cache] Failed to save profile to MMKV:", error);
  }
};

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

// ==========================================
// GENERIC HELPERS
// ==========================================
export const safeParse = <T>(data: string | undefined, fallback: T): T => {
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
