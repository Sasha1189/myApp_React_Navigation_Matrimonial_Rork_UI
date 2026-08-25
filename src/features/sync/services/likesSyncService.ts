import { rtdb } from "../../../config/firebase";
import {
  ref,
  get,
  query,
  orderByValue,
  startAt,
} from "@react-native-firebase/database";
import {
  LikesCache,
  LikesReceivedCache,
  LIKES_REC_LAST_SYNC_KEY,
} from "../../likes/cache/likesCache";
import { likesStorage } from "@/cacheMMKV/cacheConfig";

export const syncLikes = async (myUid: string) => {
  if (!myUid) return;

  const lastSyncTs = likesStorage.getNumber(LIKES_REC_LAST_SYNC_KEY) || 0;

  const isCacheEmpty =
    LikesCache.getIds().length === 0 &&
    LikesReceivedCache.getList().length === 0;

  if (lastSyncTs === 0 || isCacheEmpty) {
    await performFullSync(myUid);
  } else {
    await syncLikesReceived24h(myUid);
  }
};

export const performFullSync = async (myUid: string) => {
  try {
    const likesSentRef = query(ref(rtdb, `likesSent/${myUid}`));
    const likesReceivedRef = query(ref(rtdb, `likesReceived/${myUid}`));

    const sentSnap = await get(likesSentRef);
    const ReceivedSnap = await get(likesReceivedRef);

    if (sentSnap.exists() && sentSnap.val()) {
      const remoteUids = Object.keys(sentSnap.val());
      LikesCache.setIds(remoteUids);
    }

    if (ReceivedSnap.exists() && ReceivedSnap.val()) {
      const remoteUids = Object.keys(ReceivedSnap.val());
      LikesCache.setIds(remoteUids);
    }

    LikesReceivedCache.updateSyncTimestamp();
  } catch (error) {
    console.error("Failed to sync initial likesSent from RTDB:", error);
  }
};

export const syncLikesReceived24h = async (myUid: string, force = false) => {
  if (!myUid) return;

  // Gate check: Only execute if 24 hours have passed since last sync
  if (!force && !LikesReceivedCache.shouldSync()) {
    return;
  }

  try {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Queries RTDB server index for timestamp values >= 24h ago
    const recentLikesQuery = query(
      ref(rtdb, `likesReceived/${myUid}`),
      orderByValue(),
      startAt(twentyFourHoursAgo),
    );

    const snap = await get(recentLikesQuery);

    if (snap.exists() && snap.val()) {
      const newLikesList: { uid: string; ts: number }[] = [];

      snap.forEach((childSnap) => {
        const likerUid = childSnap.key;
        const timestamp = childSnap.val();
        if (likerUid && typeof timestamp === "number") {
          newLikesList.push({ uid: likerUid, ts: timestamp });
        }
        return undefined;
      });

      console.log("Delta receivedlike sync:", newLikesList);

      // Update local MMKV cache and save sync timestamp
      LikesReceivedCache.saveList(newLikesList);
      LikesReceivedCache.updateSyncTimestamp();
    } else {
      // Even if no new likes received, update timestamp to reset 24h timer
      LikesReceivedCache.updateSyncTimestamp();
    }
  } catch (error) {
    console.error("Failed to sync 24h likesReceived from RTDB:", error);
  }
};
