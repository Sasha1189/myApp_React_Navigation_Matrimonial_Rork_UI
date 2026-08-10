import { LikesCache } from "../../../cache/cacheConfig";
import { rtdb } from "../../../config/firebase";
import {
  ref,
  get,
  update,
  serverTimestamp,
} from "@react-native-firebase/database";

export const toggleLike = async (
  myProfile: { myUid: string; name: string; photo: string },
  otherUser: { uid: string; name: string; photo: string },
) => {
  const likedIds = LikesCache.getIds();
  let isCurrentlyLiked = likedIds.includes(otherUser.uid);

  if (!isCurrentlyLiked) {
    const snap = await get(
      ref(rtdb, `likesSent/${myProfile.myUid}/${otherUser.uid}`),
    );
    isCurrentlyLiked = snap.exists();
  }

  const updates: Record<string, any> = {};
  const ts = Date.now();
  const tsServer = serverTimestamp();
  const mySentPath = `likesSent/${myProfile.myUid}/${otherUser.uid}`;
  const theirReceivedPath = `likesReceived/${otherUser.uid}/${myProfile.myUid}`;

  if (isCurrentlyLiked) {
    updates[mySentPath] = null;
    updates[theirReceivedPath] = null;
    LikesCache.updateIds(otherUser.uid, "remove");
    LikesCache.saveProfile(otherUser, "remove");
  } else {
    const likeData = {
      uid: otherUser.uid,
      name: otherUser.name,
      photo: otherUser.photo,
      ts,
    };
    updates[mySentPath] = { ...likeData, ts: tsServer };
    updates[theirReceivedPath] = {
      uid: myProfile.myUid,
      name: myProfile.name || "User",
      photo: myProfile.photo || "",
      ts: tsServer,
      u: true, // Unread badge for them
    };
    LikesCache.updateIds(otherUser.uid, "add");
    LikesCache.saveProfile(likeData, "add");
  }

  try {
    return await update(ref(rtdb, "/"), updates);
  } catch (err) {
    throw err;
  }
};
