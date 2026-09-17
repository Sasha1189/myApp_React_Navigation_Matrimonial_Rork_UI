import {
  BlocksCache,
  BLOCKS_LAST_SYNC_KEY,
} from "../../block/cache/blockCache";
import { rtdb } from "@/config/firebase";
import {
  ref,
  update,
  get,
  query,
  orderByValue,
  equalTo,
  startAt,
} from "@react-native-firebase/database";
import { blocksStorage } from "@/cacheMMKV/cacheConfig";

export interface SyncOptions {
  isPaid?: boolean;
}

/**
 * Sync Entry Point: Runs on every app cold boot (Paid users only)
 */
export const syncBlocks = async (myUid: string, options: SyncOptions = {}) => {
  if (!myUid || !options.isPaid) return;

  const lastSyncTs = blocksStorage.getNumber(BLOCKS_LAST_SYNC_KEY) || 0;

  // Safe array fallback checks
  const myIds = BlocksCache.getMyIds() ?? [];
  const mergedIds = BlocksCache.getMergedIds() ?? [];
  const isCacheEmpty = myIds.length === 0 && mergedIds.length === 0;

  if (lastSyncTs === 0 || isCacheEmpty) {
    await performFullSyncRtdb(myUid, options);
  } else {
    await performDeltaSyncRtdb(myUid, lastSyncTs, options);
  }
};

const performFullSyncRtdb = async (
  myUid: string,
  options: SyncOptions = {},
) => {
  if (!options.isPaid) return;
  const syncStartTime = Date.now();

  try {
    const [mineSnap, theirsSnap] = await Promise.all([
      get(ref(rtdb, `blocksMine/${myUid}`)),
      get(ref(rtdb, `blocksTheirs/${myUid}`)),
    ]);

    const activeMine: string[] = [];
    const activeTheirs: string[] = [];
    const cleanups: Record<string, any> = {};

    if (mineSnap?.exists()) {
      mineSnap.forEach((child) => {
        const val = child.val();
        if (child.key && typeof val === "number") {
          if (val > 1) activeMine.push(child.key);
          else if (val === 1)
            cleanups[`blocksMine/${myUid}/${child.key}`] = null;
        }
        return undefined;
      });
    }

    if (theirsSnap?.exists()) {
      theirsSnap.forEach((child) => {
        const val = child.val();
        if (child.key && typeof val === "number") {
          if (val > 1) activeTheirs.push(child.key);
          else if (val === 1)
            cleanups[`blocksTheirs/${myUid}/${child.key}`] = null;
        }
        return undefined;
      });
    }

    const merged = Array.from(new Set([...activeMine, ...activeTheirs]));
    BlocksCache.sync(activeMine, merged);

    // Delete stale '1' tombstones from RTDB
    if (Object.keys(cleanups).length > 0) {
      await update(ref(rtdb, "/"), cleanups);
    }

    blocksStorage.set(BLOCKS_LAST_SYNC_KEY, syncStartTime);
  } catch (error) {
    console.error("Full blocks sync failed:", error);
  }
};

export const performDeltaSyncRtdb = async (
  myUid: string,
  lastSyncTs: number,
  options: SyncOptions = {},
): Promise<void> => {
  if (!options.isPaid) return;
  const newSyncStartTime = Date.now();

  try {
    const theirsRef = ref(rtdb, `blocksTheirs/${myUid}`);

    const [unblocksSnap, newBlocksSnap] = await Promise.all([
      get(query(theirsRef, orderByValue(), equalTo(1))),
      get(query(theirsRef, orderByValue(), startAt(lastSyncTs + 1))),
    ]);

    BlocksCache.applyDelta(unblocksSnap, newBlocksSnap);

    const cleanups: Record<string, null> = {};
    if (unblocksSnap?.exists()) {
      unblocksSnap.forEach((child) => {
        if (child.key) {
          cleanups[`blocksTheirs/${myUid}/${child.key}`] = null;
        }
        return undefined;
      });
    }

    if (Object.keys(cleanups).length > 0) {
      await update(ref(rtdb, "/"), cleanups);
    }

    blocksStorage.set(BLOCKS_LAST_SYNC_KEY, newSyncStartTime);
  } catch (error) {
    console.error("Delta blocks sync failed:", error);
  }
};
