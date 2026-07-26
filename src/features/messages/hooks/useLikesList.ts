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

    // Listen for MMKV cache changes to update UI state
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === "likes_profiles_cache") {
        setLikesSent(LikesCache.getProfiles());
      }
    });

    let unsubRemoved: (() => void) | undefined;
    const sentRef = query(ref(rtdb, `likesSent/${myUid}`), limitToLast(100));

    const syncOnceAndListenDeletes = async () => {
      // Setup live deletion sync immediately so unliking profiles updates your UI instantly
      unsubRemoved = onChildRemoved(sentRef, (snap) => {
        const currentProfiles = LikesCache.getProfiles();
        const filtered = currentProfiles.filter((p: any) => p.uid !== snap.key);

        // This save triggers the MMKV listener above, updating your components cleanly
        LikesCache.saveProfile(filtered, "add");
      });

      if (likesSent.length > 0) return; // Skip fetch if cache is already populated

      setSentLoading(true);
      try {
        const snap = await get(sentRef);
        if (snap.exists()) {
          const cloudData = Object.values(snap.val()).sort(
            (a: any, b: any) => b.ts - a.ts,
          );
          LikesCache.saveProfile(cloudData, "add");
        }
      } catch (err) {
        console.error("LikesSent network initialization failed:", err);
      } finally {
        setSentLoading(false);
      }
    };

    syncOnceAndListenDeletes();

    return () => {
      listener.remove();
      if (unsubRemoved) unsubRemoved();
    };
  }, [myUid, likesSent.length]);

  return { data: likesSent, isLoading: sentLoading };
}

export function useLikeReceived(
  myUid: string,
  tier: "none" | "basic" | "premium",
) {
  const [likesRec, setLikesRec] = useState<any[]>(() => {
    return LikesReceivedCache.getList() || [];
  });
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    // 1. 🛡️ COST SHIELD: Block free tier users from initiating listeners
    if (!myUid || tier !== "premium") {
      setRecLoading(false);
      return;
    }

    setRecLoading(true);

    // Read the timestamp milestone from MMKV
    const lastSavedTimestamp = storage.getNumber(LAST_REC_TS_KEY) || 0;

    // 2. DELTA QUERY: Only stream items created AFTER our last sync milestone
    const recRef = query(
      ref(rtdb, `likesReceived/${myUid}`),
      orderByChild("ts"),
      startAt(lastSavedTimestamp + 1),
    );

    // 3. BRAND NEW DELTA INSERTS
    const unsubAdded = onChildAdded(recRef, (snap) => {
      const data = snap.val();
      if (!data || !data.uid) return;

      setLikesRec((prev) => {
        if (prev.some((p) => p.uid === data.uid)) return prev;

        const updatedList = [data, ...prev].sort(
          (a: any, b: any) => b.ts - a.ts,
        );
        LikesReceivedCache.saveList(updatedList);

        // 🎯 FIX 2: Read directly from MMKV inline to break the stale closure trap
        const activeSavedTs = storage.getNumber(LAST_REC_TS_KEY) || 0;
        if (data.ts > activeSavedTs) {
          storage.set(LAST_REC_TS_KEY, data.ts);
        }

        return updatedList;
      });
      setRecLoading(false);
    });

    // 4. 🎯 FIX 1: SCOPED LIVE DELETE LISTENER
    // Instead of listening to the heavy root node path, apply the exact same query parameters
    // to capture deletion events specifically within your visible, active data track window.
    const unsubRemoved = onChildRemoved(recRef, (snap) => {
      setLikesRec((prev) => {
        const updatedList = prev.filter((p) => p.uid !== snap.key);
        LikesReceivedCache.saveList(updatedList);
        return updatedList;
      });
    });

    // Safety guard fallback to turn off loading state spinner if no new items arrive
    const timer = setTimeout(() => setRecLoading(false), 800);

    return () => {
      clearTimeout(timer);
      unsubAdded();
      unsubRemoved();
    };
  }, [myUid, tier]);

  return { data: likesRec, isLoading: recLoading };
}
