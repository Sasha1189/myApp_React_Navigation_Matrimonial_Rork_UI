import { useEffect, useState } from "react";
import {
  LikesCache,
  LikesReceivedCache,
  storage,
} from "../../../cache/cacheConfig";
import { rtdb } from "../../../config/firebase";
import {
  ref,
  get,
  query,
  orderByChild,
  limitToLast,
  onChildAdded,
  onChildRemoved,
} from "@react-native-firebase/database";

export function useLikeSent(myUid: string) {
  const [likesSent, setLikesSent] = useState(() => LikesCache.getProfiles());
  const [sentLoading, setSentLoading] = useState(false);

  useEffect(() => {
    if (!myUid) return;

    const listener = storage.addOnValueChangedListener((key) => {
      if (key === "likes_profiles_cache") {
        const updatedProfiles = LikesCache.getProfiles();
        setLikesSent(updatedProfiles);
      }
    });

    // 3. Optional: One-time Sync (Only if cache is empty)
    const syncOnce = async () => {
      if (likesSent.length > 0) return; // Skip if we already have data

      setSentLoading(true);
      try {
        const sentRef = query(
          ref(rtdb, `likesSent/${myUid}`),
          limitToLast(100),
        );
        const snap = await get(sentRef);
        if (snap.exists()) {
          const cloudData = Object.values(snap.val()).sort(
            (a: any, b: any) => b.ts - a.ts,
          );
          // Saving to cache will trigger the listener above
          LikesCache.saveProfile(cloudData, "add");
        }
      } finally {
        setSentLoading(false);
      }
    };

    syncOnce();

    return () => listener.remove(); // Cleanup to prevent memory leaks
  }, [myUid]);

  return { data: likesSent, isLoading: sentLoading };
}

export function useLikeReceived(myUid: string) {
  const [likesRec, setLikesRec] = useState(() => LikesReceivedCache.getList());
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (!myUid) return;

    const recRef = query(
      ref(rtdb, `likesReceived/${myUid}`),
      orderByChild("ts"),
      limitToLast(100),
    );

    const unsubAdded = onChildAdded(recRef, (snap) => {
      const data = snap.val();
      setLikesRec((prev) => {
        if (prev.some((p) => p.uid === data.uid)) return prev;
        const newList = [data, ...prev];
        LikesReceivedCache.saveList(newList);
        return newList.sort((a, b) => b.ts - a.ts).slice(0, 100);
      });
    });

    const unsubRemoved = onChildRemoved(recRef, (snap) => {
      setLikesRec((prev) => {
        const newList = prev.filter((p) => p.uid !== snap.key);
        LikesReceivedCache.saveList(newList);
        return newList;
      });
    });

    return () => {
      unsubAdded();
      unsubRemoved();
    };
  }, [myUid]);

  return { data: likesRec, isLoading: recLoading };
}
