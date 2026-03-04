import { createMMKV } from "react-native-mmkv";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const storage = createMMKV({
  id: "myAppCache",
});

const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    storage.remove(key);
    return Promise.resolve();
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
      // Ensure data is retrieved from cache even if offline
      networkMode: "offlineFirst",
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: clientStorage,
  throttleTime: 1000,
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 6, // 7 days
  buster: "v1-cache-key", // Change this to wipe cache on breaking schema changes
};
//............
// const LIKES_SENT_CACHE_KEY = "likes_sent_cache";

// export const LikesCache = {
//   // Get full list
//   getSent: (): any[] => {
//     const data = storage.getString(LIKES_SENT_CACHE_KEY);
//     return data ? JSON.parse(data) : [];
//   },

//   // Save/Update list (Limit to 100)
//   saveSent: (list: any[]) => {
//     const limited = list.sort((a, b) => b.ts - a.ts).slice(0, 100);
//     storage.set(LIKES_SENT_CACHE_KEY, JSON.stringify(limited));
//   },

//   // Quick check if liked
//   isLiked: (targetUid: string): boolean => {
//     const list = LikesCache.getSent();
//     return list.some((p) => p.uid === targetUid);
//   },
// };
const LIKES_IDS_KEY = "likes_ids_index";
const LIKES_PROFILES_KEY = "likes_profiles_cache";

export const LikesCache = {
  // --- LAYER 1: ID INDEX (FOR THE FEED) ---
  getIds: (): string[] => {
    const data = storage.getString(LIKES_IDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateIds: (uid: string, action: "add" | "remove") => {
    let ids = LikesCache.getIds();
    if (action === "add") {
      ids = [uid, ...ids.filter((i) => i !== uid)].slice(0, 1000); // Keep 1000
    } else {
      ids = ids.filter((i) => i !== uid);
    }
    storage.set(LIKES_IDS_KEY, JSON.stringify(ids));
  },

  // --- LAYER 2: PROFILES (FOR THE LIKES TAB) ---
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
      ); // Keep 100
    } else {
      list = list.filter((p) => p.uid !== profile.uid);
    }
    storage.set(LIKES_PROFILES_KEY, JSON.stringify(list));
  },
};

//............
const LIKES_REC_CACHE_KEY = "likes_received_list";
const PROFILE_DETAIL_PREFIX = "profile_detail_";

export const LikesReceivedCache = {
  // 1. Manage the Banner List (RTDB data: uid, name, photo)
  getList: (): any[] => {
    const data = storage.getString(LIKES_REC_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveList: (list: any[]) => {
    // Keep only the latest 100 to save local storage space
    const limited = list.sort((a, b) => b.ts - a.ts).slice(0, 100);
    storage.set(LIKES_REC_CACHE_KEY, JSON.stringify(limited));
  },

  // 2. Manage Full Profile Details (Firestore data)
  getProfileDetail: (uid: string): any | null => {
    const data = storage.getString(`${PROFILE_DETAIL_PREFIX}${uid}`);
    if (!data) return null;

    const cached = JSON.parse(data);
    // Optional: Auto-expire cache after 24 hours to keep data fresh
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

// 🔹 Clear persisted cache on logout
export async function clearCacheOnLogout() {
  storage.clearAll();
  queryClient.clear();
}
