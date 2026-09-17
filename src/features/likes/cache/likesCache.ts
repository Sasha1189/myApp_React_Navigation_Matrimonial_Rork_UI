import { likesStorage, safeParse } from "@/cacheMMKV/cacheConfig";

export const LIKES_IDS_KEY = "likes_ids_index";
export const LIKES_REC_CACHE_KEY = "likes_received_list";
export const LIKES_REC_LAST_SYNC_KEY = "likes_received_last_sync_ts";

export const LikesCache = {
  getIds: (): string[] => {
    const parsed = safeParse<string[]>(
      likesStorage.getString(LIKES_IDS_KEY),
      [],
    );
    // Guarantee array type even if safeParse returns null/undefined
    return Array.isArray(parsed) ? parsed : [];
  },

  setIds: (ids: string[]) => {
    const safeIds = Array.isArray(ids) ? ids : [];
    likesStorage.set(LIKES_IDS_KEY, JSON.stringify(safeIds));
  },

  updateIds: (uid: string, action: "add" | "remove") => {
    if (!uid) return;
    const current = LikesCache.getIds();
    let ids: string[];

    if (action === "add") {
      ids = Array.from(new Set([uid, ...current])).slice(0, 1000);
    } else {
      ids = current.filter((i) => i !== uid);
    }
    likesStorage.set(LIKES_IDS_KEY, JSON.stringify(ids));
  },
};

export const LikesReceivedCache = {
  getList: (): { uid: string; ts: number }[] => {
    const parsed = safeParse<{ uid: string; ts: number }[]>(
      likesStorage.getString(LIKES_REC_CACHE_KEY),
      [],
    );
    return Array.isArray(parsed) ? parsed : [];
  },

  saveList: (newList: { uid: string; ts: number }[]) => {
    const current = LikesReceivedCache.getList();
    const safeNewList = Array.isArray(newList) ? newList : [];
    const mergedMap = new Map<string, number>();

    [...current, ...safeNewList].forEach((item) => {
      if (item?.uid && typeof item?.ts === "number") {
        mergedMap.set(item.uid, item.ts);
      }
    });

    const sorted = Array.from(mergedMap.entries())
      .map(([uid, ts]) => ({ uid, ts }))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 100);

    likesStorage.set(LIKES_REC_CACHE_KEY, JSON.stringify(sorted));
  },

  /**
   * Returns true if sync should be skipped (less than 24h since last sync)
   */
  shouldSync: (): boolean => {
    const lastSync = likesStorage.getNumber(LIKES_REC_LAST_SYNC_KEY) || 0;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    return Date.now() - lastSync < TWENTY_FOUR_HOURS_MS;
  },

  updateSyncTimestamp: () => {
    likesStorage.set(LIKES_REC_LAST_SYNC_KEY, Date.now());
  },
};
