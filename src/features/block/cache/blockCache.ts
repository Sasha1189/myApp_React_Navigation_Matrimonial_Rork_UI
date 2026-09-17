import { DataSnapshot } from "@react-native-firebase/database";
import { blocksStorage } from "@/cacheMMKV/cacheConfig";

export const BLOCKED_IDS_KEY = "blocked_ids_index";
export const MY_BLOCKED_IDS_KEY = "my_blocked_ids_index";
export const BLOCKS_LAST_SYNC_KEY = "blocks_last_sync_ts";

const safeParse = <T>(data: string | undefined, fallback: T): T => {
  if (!data) return fallback;
  try {
    return (JSON.parse(data) as T) ?? fallback;
  } catch {
    return fallback;
  }
};

export const BlocksCache = {
  getMergedIds: (): string[] => {
    const parsed = safeParse<string[]>(
      blocksStorage.getString(BLOCKED_IDS_KEY),
      [],
    );
    return Array.isArray(parsed) ? parsed : [];
  },

  getMyIds: (): string[] => {
    const parsed = safeParse<string[]>(
      blocksStorage.getString(MY_BLOCKED_IDS_KEY),
      [],
    );
    return Array.isArray(parsed) ? parsed : [];
  },

  sync: (mine: string[], merged: string[]): void => {
    const safeMine = Array.isArray(mine) ? mine : [];
    const safeMerged = Array.isArray(merged) ? merged : [];

    blocksStorage.set(MY_BLOCKED_IDS_KEY, JSON.stringify(safeMine));
    blocksStorage.set(BLOCKED_IDS_KEY, JSON.stringify(safeMerged));
  },

  update: (targetUid: string, action: "add" | "remove"): void => {
    if (!targetUid || typeof targetUid !== "string") return;

    const mutateKey = (key: string): void => {
      const raw = safeParse<string[]>(blocksStorage.getString(key), []);
      const current = Array.isArray(raw) ? raw : [];
      let updated: string[];

      if (action === "add") {
        updated = current.includes(targetUid)
          ? current
          : [targetUid, ...current];
      } else {
        updated = current.filter((id) => id !== targetUid);
      }

      blocksStorage.set(key, JSON.stringify(updated));
    };

    mutateKey(MY_BLOCKED_IDS_KEY);
    mutateKey(BLOCKED_IDS_KEY);
  },

  /**
   * Applies snapshot deltas to MMKV cache only.
   */
  applyDelta: (
    unblocksSnap?: DataSnapshot | null,
    newBlocksSnap?: DataSnapshot | null,
  ): void => {
    const theirsRemove: string[] = [];
    const theirsAdd: string[] = [];

    // 1. Extract unblocked UIDs
    if (unblocksSnap?.exists?.()) {
      unblocksSnap.forEach((child) => {
        if (child?.key) theirsRemove.push(child.key);
        return undefined;
      });
    }

    // 2. Extract newly blocked UIDs
    if (newBlocksSnap?.exists?.()) {
      newBlocksSnap.forEach((child) => {
        const val = child.val();
        if (child?.key && typeof val === "number" && val > 1) {
          theirsAdd.push(child.key);
        }
        return undefined;
      });
    }

    // 3. Update local MMKV cache
    if (theirsRemove.length > 0 || theirsAdd.length > 0) {
      const existingBlockedIds = BlocksCache.getMergedIds();
      const removeSet = new Set(theirsRemove);

      const filteredExisting = existingBlockedIds.filter(
        (id) => !removeSet.has(id),
      );
      const merged = Array.from(new Set([...filteredExisting, ...theirsAdd]));

      blocksStorage.set(BLOCKED_IDS_KEY, JSON.stringify(merged));
    }
  },
};
