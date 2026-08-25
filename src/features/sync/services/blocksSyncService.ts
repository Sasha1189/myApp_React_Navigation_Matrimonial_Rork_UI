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

/**
 * Sync Entry Point: Runs on every app cold boot
 */
export const syncBlocks = async (myUid: string) => {
  if (!myUid) return;

  const lastSyncTs = blocksStorage.getNumber(BLOCKS_LAST_SYNC_KEY) || 0;
  const isCacheEmpty =
    BlocksCache.getMyIds().length === 0 &&
    BlocksCache.getMergedIds().length === 0;

  if (lastSyncTs === 0 || isCacheEmpty) {
    await performFullSync(myUid);
  } else {
    await performDeltaSync(myUid, lastSyncTs);
  }
};

const performFullSync = async (myUid: string) => {
  const syncStartTime = Date.now();

  try {
    const [mineSnap, theirsSnap] = await Promise.all([
      get(ref(rtdb, `blocksMine/${myUid}`)),
      get(ref(rtdb, `blocksTheirs/${myUid}`)),
    ]);

    const activeMine: string[] = [];
    const activeTheirs: string[] = [];
    const cleanups: Record<string, any> = {};

    if (mineSnap.exists()) {
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

    if (theirsSnap.exists()) {
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
    console.log(
      "Initial fetch blocksync- mine, their",
      activeMine,
      activeTheirs,
    );
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

export const performDeltaSync = async (
  myUid: string,
  lastSyncTs: number,
): Promise<void> => {
  const newSyncStartTime = Date.now();
  //  for now sync on every appboot
  lastSyncTs = newSyncStartTime;

  try {
    const theirsRef = ref(rtdb, `blocksTheirs/${myUid}`);

    // Parallel queries:
    // 1. Get all pending unblocks (val === 1)
    // 2. Get all new blocks created since lastSyncTs (val > lastSyncTs)
    const [unblocksSnap, newBlocksSnap] = await Promise.all([
      get(query(theirsRef, orderByValue(), equalTo(1))),
      get(query(theirsRef, orderByValue(), startAt(lastSyncTs + 1))),
    ]);

    // 1. Update MMKV local cache via helper
    BlocksCache.applyDelta(unblocksSnap, newBlocksSnap);

    // 2. Perform RTDB tombstone cleanup independently using unblocksSnap
    const cleanups: Record<string, null> = {};
    if (unblocksSnap.exists()) {
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

    blocksStorage.set(BLOCKS_LAST_SYNC_KEY, lastSyncTs);
  } catch (error) {
    console.error("Delta blocks sync failed:", error);
  }
};
