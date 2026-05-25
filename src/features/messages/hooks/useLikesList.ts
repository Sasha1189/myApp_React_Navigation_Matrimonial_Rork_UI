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
  startAt,
  orderByChild,
  limitToLast,
  onChildAdded,
  onChildRemoved,
} from "@react-native-firebase/database";

const LAST_REC_TS_KEY = "likes_received_last_sync_timestamp";

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

export function useLikeReceived(
  myUid: string,
  tier: "none" | "basic" | "premium",
) {
  // 1. FOREVER CACHE RESCUE: Instantly mount using your full accumulated historical MMKV data
  const [likesRec, setLikesRec] = useState<any[]>(() => {
    return LikesReceivedCache.getList() || [];
  });
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (!myUid || tier !== "premium") {
      console.log(
        "🛑 Cost Shield Active: useLikeReceived execution completely blocked for free tier.",
      );
      setRecLoading(false);
      return;
    }

    setRecLoading(true);

    // 2. DELTA QUERY FILTER: Read the timestamp of the newest profile currently sitting in your MMKV cache
    const lastSavedTimestamp = storage.getNumber(LAST_REC_TS_KEY) || 0;

    // Instruct the RTDB server to ONLY stream items created AFTER our last saved timestamp milestone
    const recRef = query(
      ref(rtdb, `likesReceived/${myUid}`),
      orderByChild("ts"),
      // Adding +1 ensures the server doesn't re-transmit your newest cached item on boot
      startAt(lastSavedTimestamp + 1),
    );

    // 3. BRAND NEW DELTA INSERTS
    const unsubAdded = onChildAdded(recRef, (snap) => {
      const data = snap.val();
      if (!data || !data.uid) return;

      setLikesRec((prev) => {
        // Prevent duplicate cell mounts if state hooks overlap
        if (prev.some((p) => p.uid === data.uid)) return prev;

        // Build our accumulative forever list tracking framework
        const updatedList = [data, ...prev].sort((a, b) => b.ts - a.ts);

        // Save the complete growing history stack cleanly to your permanent MMKV file
        LikesReceivedCache.saveList(updatedList);

        // Update your sync timestamp marker to match the newest incoming delta row element
        if (data.ts > lastSavedTimestamp) {
          storage.set(LAST_REC_TS_KEY, data.ts);
        }

        return updatedList;
      });
      setRecLoading(false);
    });

    // 4. LIVE DELETE/UNLIKE SYNC LISTENER
    // Note: Since unliking removes records, we listen to the entire node path to capture deletes instantly
    const globalRemovedRef = ref(rtdb, `likesReceived/${myUid}`);
    const unsubRemoved = onChildRemoved(globalRemovedRef, (snap) => {
      setLikesRec((prev) => {
        const updatedList = prev.filter((p) => p.uid !== snap.key);
        LikesReceivedCache.saveList(updatedList);
        return updatedList;
      });
    });

    // If the delta query returns absolutely no new items on boot, turn off loading safely
    const timer = setTimeout(() => setRecLoading(false), 800);

    return () => {
      clearTimeout(timer);
      unsubAdded();
      unsubRemoved();
    };
  }, [myUid, tier]);

  return { data: likesRec, isLoading: recLoading };
}
