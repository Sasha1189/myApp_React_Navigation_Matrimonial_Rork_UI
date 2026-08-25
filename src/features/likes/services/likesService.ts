import { LikesCache } from "../cache/likesCache";
import { rtdb } from "@/config/firebase";
import { ref, update, serverTimestamp } from "@react-native-firebase/database";

export const toggleLike = async (
  myUid: string,
  targetUid: string,
): Promise<boolean> => {
  const likedIds = LikesCache.getIds();
  const isCurrentlyLiked = likedIds.includes(targetUid);

  const updates: Record<string, any> = {};
  const mySentPath = `likesSent/${myUid}/${targetUid}`;
  const theirReceivedPath = `likesReceived/${targetUid}/${myUid}`;

  if (isCurrentlyLiked) {
    updates[mySentPath] = 1;
    updates[theirReceivedPath] = 1;
    LikesCache.updateIds(targetUid, "remove");
  } else {
    const tsServer = serverTimestamp();
    updates[mySentPath] = tsServer;
    updates[theirReceivedPath] = tsServer;
    LikesCache.updateIds(targetUid, "add");
  }

  try {
    await update(ref(rtdb, "/"), updates);
    return !isCurrentlyLiked;
  } catch (err) {
    // Revert MMKV on network failure
    LikesCache.updateIds(targetUid, isCurrentlyLiked ? "add" : "remove");
    throw err;
  }
};
