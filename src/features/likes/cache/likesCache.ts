import { likesStorage, safeParse } from "@/cacheMMKV/cacheConfig";
// ==========================================
// 2. LIKES DOMAIN CACHE (Outbound & Inbound)
// ==========================================

export const LIKES_IDS_KEY = "likes_ids_index";
export const LIKES_REC_CACHE_KEY = "likes_received_list";
export const LIKES_REC_LAST_SYNC_KEY = "likes_received_last_sync_ts";

export const LikesCache = {
  getIds: (): string[] => {
    return safeParse<string[]>(likesStorage.getString(LIKES_IDS_KEY), []);
  },

  // Bulk set IDs during initial cold start sync
  setIds: (ids: string[]) => {
    likesStorage.set(LIKES_IDS_KEY, JSON.stringify(ids));
  },

  updateIds: (uid: string, action: "add" | "remove") => {
    let ids = LikesCache.getIds();
    if (action === "add") {
      ids = Array.from(new Set([uid, ...ids])).slice(0, 1000);
    } else {
      ids = ids.filter((i) => i !== uid);
    }
    likesStorage.set(LIKES_IDS_KEY, JSON.stringify(ids));
  },
};

//................................................

export const LikesReceivedCache = {
  getList: (): { uid: string; ts: number }[] => {
    return safeParse<{ uid: string; ts: number }[]>(
      likesStorage.getString(LIKES_REC_CACHE_KEY),
      [],
    );
  },

  saveList: (newList: { uid: string; ts: number }[]) => {
    // Merge new received likes with existing cached items, deduplicate by UID, and keep top 100 newest
    const current = LikesReceivedCache.getList();
    const mergedMap = new Map<string, number>();

    [...current, ...newList].forEach((item) => {
      mergedMap.set(item.uid, item.ts);
    });

    const sorted = Array.from(mergedMap.entries())
      .map(([uid, ts]) => ({ uid, ts }))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 100);

    likesStorage.set(LIKES_REC_CACHE_KEY, JSON.stringify(sorted));
  },

  // 24-Hour sync gatekeeper
  shouldSync: (): boolean => {
    const lastSync = likesStorage.getNumber(LIKES_REC_LAST_SYNC_KEY) || 0;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    return Date.now() - lastSync >= TWENTY_FOUR_HOURS_MS;
  },

  updateSyncTimestamp: () => {
    likesStorage.set(LIKES_REC_LAST_SYNC_KEY, Date.now());
  },
};
