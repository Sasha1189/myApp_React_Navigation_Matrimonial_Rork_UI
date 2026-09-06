import { BlocksCache } from "../cache/blockCache";
import { LikesCache } from "@/features/likes/cache/likesCache";
import { rtdb } from "@/config/firebase";
import { ref, update, serverTimestamp } from "@react-native-firebase/database";

/**
 * Toggle Block / Unblock:
 * We use two nodes as blocksMine & blocksTheirs
 * - Block: Sets serverTimestamp() for both users id paths
 * - Unblock: Sets value to 1 (unblock signal) once fetched delete path or set to null
 * - Sync strategy - once daily
 */
export const toggleBlock = async (
  myUid: string,
  targetUid: string,
): Promise<boolean> => {
  const isCurrentlyBlocked = BlocksCache.getMyIds().includes(targetUid);
  const updates: Record<string, any> = {};

  const myMinePath = `blocksMine/${myUid}/${targetUid}`;
  const theirTheirsPath = `blocksTheirs/${targetUid}/${myUid}`;

  if (isCurrentlyBlocked) {
    // UNBLOCK: Set value to 1 signal
    updates[myMinePath] = 1;
    updates[theirTheirsPath] = 1;
    BlocksCache.update(targetUid, "remove");
  } else {
    // BLOCK: Set active timestamp
    const ts = serverTimestamp();
    updates[myMinePath] = ts;
    updates[theirTheirsPath] = ts;

    // Purge active likes
    updates[`likesSent/${myUid}/${targetUid}`] = null;
    updates[`likesReceived/${myUid}/${targetUid}`] = null;
    updates[`likesSent/${targetUid}/${myUid}`] = null;
    updates[`likesReceived/${targetUid}/${myUid}`] = null;

    BlocksCache.update(targetUid, "add");
    LikesCache.updateIds(targetUid, "remove");
  }

  try {
    await update(ref(rtdb, "/"), updates);
    return !isCurrentlyBlocked;
  } catch (err) {
    BlocksCache.update(targetUid, isCurrentlyBlocked ? "add" : "remove");
    throw err;
  }
};
