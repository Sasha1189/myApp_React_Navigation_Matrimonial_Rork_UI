import { createMMKV } from "react-native-mmkv";
import { firestore, get } from "@/config/firebase";

// 1. Core Storage (MMKV)
export const storage = createMMKV({
  id: "myAppCache",
});

// 2. Like/Unlike Cache (Instant UI Feedback)
const LIKES_IDS_KEY = "likes_ids_index";
const LIKES_PROFILES_KEY = "likes_profiles_cache";

export const LikesCache = {
  getIds: (): string[] => {
    const data = storage.getString(LIKES_IDS_KEY);
    return data ? JSON.parse(data) : [];
  },
  updateIds: (uid: string, action: "add" | "remove") => {
    let ids = LikesCache.getIds();
    if (action === "add") {
      ids = [uid, ...ids.filter((i) => i !== uid)].slice(0, 1000);
    } else {
      ids = ids.filter((i) => i !== uid);
    }
    storage.set(LIKES_IDS_KEY, JSON.stringify(ids));
  },
  getProfiles: (): any[] => {
    const data = storage.getString(LIKES_PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveProfile: (profile: any, action: "add" | "remove") => {
    let list = LikesCache.getProfiles();
    if (action === "add") {
      list = [profile, ...list.filter((p) => p.uid !== profile.uid)].slice(
        0,
        100,
      );
    } else {
      list = list.filter((p) => p.uid !== profile.uid);
    }
    storage.set(LIKES_PROFILES_KEY, JSON.stringify(list));
  },
};

// 3. Likes Received Cache
const LIKES_REC_CACHE_KEY = "likes_received_list";
const PROFILE_DETAIL_PREFIX = "profile_detail_";

export const LikesReceivedCache = {
  getList: (): any[] => {
    const data = storage.getString(LIKES_REC_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveList: (list: any[]) => {
    const limited = list.sort((a, b) => b.ts - a.ts).slice(0, 100);
    storage.set(LIKES_REC_CACHE_KEY, JSON.stringify(limited));
  },
  getProfileDetail: (uid: string): any | null => {
    const data = storage.getString(`${PROFILE_DETAIL_PREFIX}${uid}`);
    if (!data) return null;
    const cached = JSON.parse(data);
    if (Date.now() - cached.ts > 86400000) {
      storage.remove(`${PROFILE_DETAIL_PREFIX}${uid}`);
      return null;
    }
    return cached.profile;
  },
  saveProfileDetail: (uid: string, profile: any) => {
    storage.set(
      `${PROFILE_DETAIL_PREFIX}${uid}`,
      JSON.stringify({ profile, ts: Date.now() }),
    );
  },
};

const BLOCKED_IDS_KEY = "blocked_ids_index"; // Merged (Feed Filter)
const MY_BLOCKED_IDS_KEY = "my_blocked_ids_index"; // Mine (Settings UI)

export const BlocksCache = {
  getIds: (): string[] => {
    const data = storage.getString(BLOCKED_IDS_KEY);
    try {
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // 🔹 NEW: Used by Settings Screen
  getMyIds: (): string[] => {
    const data = storage.getString(MY_BLOCKED_IDS_KEY);
    try {
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // Called by AuthContext on startup
  sync: (mine: string[], theirs: string[]) => {
    // 1. Save 'Mine' specific list
    storage.set(MY_BLOCKED_IDS_KEY, JSON.stringify(mine || []));

    // 2. Save 'Merged' list for Feed
    const all = [...new Set([...(mine || []), ...(theirs || [])])];
    storage.set(BLOCKED_IDS_KEY, JSON.stringify(all));
  },

  // Called when User Blocks/Unblocks someone
  update: (targetUid: string, action: "add" | "remove") => {
    // Helper to update a specific key
    const updateKey = (key: string) => {
      const raw = storage.getString(key);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      if (action === "add") {
        list = [...new Set([targetUid, ...list])];
      } else {
        list = list.filter((id: string) => id !== targetUid);
      }
      storage.set(key, JSON.stringify(list));
    };

    // Update BOTH keys
    updateKey(MY_BLOCKED_IDS_KEY); // Add to UI list
    updateKey(BLOCKED_IDS_KEY); // Add to Feed filter
  },
};

// 5. Logout Utility
export async function clearCacheOnLogout() {
  storage.clearAll();
  try {
    await firestore.clearPersistence();
    console.log("✅ Firestore local cache wiped.");
  } catch (e) {
    console.error("❌ Firestore cache clear failed:", e);
  }
}

// 6. Device ID Cache (for Single Device Enforcement)..get set functions here for better encapsulation
const DEVICE_ID_KEY = "device_id";

export const getDBDeviceIdCache = (): string => {
  return storage.getString(DEVICE_ID_KEY) || "";
};

export const setDBDeviceIdCache = (deviceId: string) => {
  storage.set(DEVICE_ID_KEY, deviceId);
};
