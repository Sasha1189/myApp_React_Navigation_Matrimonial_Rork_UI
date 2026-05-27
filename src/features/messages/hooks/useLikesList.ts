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

// export function useLikeSent(myUid: string) {
//   const [likesSent, setLikesSent] = useState(() => LikesCache.getProfiles());
//   const [sentLoading, setSentLoading] = useState(false);

//   useEffect(() => {
//     if (!myUid) return;

//     const listener = storage.addOnValueChangedListener((key) => {
//       if (key === "likes_profiles_cache") {
//         const updatedProfiles = LikesCache.getProfiles();
//         setLikesSent(updatedProfiles);
//       }
//     });

//     // 3. Optional: One-time Sync (Only if cache is empty)
//     const syncOnce = async () => {
//       if (likesSent.length > 0) return; // Skip if we already have data

//       setSentLoading(true);
//       try {
//         const sentRef = query(
//           ref(rtdb, `likesSent/${myUid}`),
//           limitToLast(100),
//         );
//         const snap = await get(sentRef);
//         if (snap.exists()) {
//           const cloudData = Object.values(snap.val()).sort(
//             (a: any, b: any) => b.ts - a.ts,
//           );
//           // Saving to cache will trigger the listener above
//           LikesCache.saveProfile(cloudData, "add");
//         }
//       } finally {
//         setSentLoading(false);
//       }
//     };

//     syncOnce();

//     return () => listener.remove(); // Cleanup to prevent memory leaks
//   }, [myUid]);

//   return { data: likesSent, isLoading: sentLoading };
// }

// export function useLikeReceived(
//   myUid: string,
//   tier: "none" | "basic" | "premium",
// ) {
//   // 1. FOREVER CACHE RESCUE: Instantly mount using your full accumulated historical MMKV data
//   const [likesRec, setLikesRec] = useState<any[]>(() => {
//     return LikesReceivedCache.getList() || [];
//   });
//   const [recLoading, setRecLoading] = useState(false);

//   useEffect(() => {
//     if (!myUid || tier !== "premium") {
//       console.log(
//         "🛑 Cost Shield Active: useLikeReceived execution completely blocked for free tier.",
//       );
//       setRecLoading(false);
//       return;
//     }

//     setRecLoading(true);

//     // 2. DELTA QUERY FILTER: Read the timestamp of the newest profile currently sitting in your MMKV cache
//     const lastSavedTimestamp = storage.getNumber(LAST_REC_TS_KEY) || 0;

//     // Instruct the RTDB server to ONLY stream items created AFTER our last saved timestamp milestone
//     const recRef = query(
//       ref(rtdb, `likesReceived/${myUid}`),
//       orderByChild("ts"),
//       // Adding +1 ensures the server doesn't re-transmit your newest cached item on boot
//       startAt(lastSavedTimestamp + 1),
//     );

//     // 3. BRAND NEW DELTA INSERTS
//     const unsubAdded = onChildAdded(recRef, (snap) => {
//       const data = snap.val();
//       if (!data || !data.uid) return;

//       setLikesRec((prev) => {
//         // Prevent duplicate cell mounts if state hooks overlap
//         if (prev.some((p) => p.uid === data.uid)) return prev;

//         // Build our accumulative forever list tracking framework
//         const updatedList = [data, ...prev].sort((a, b) => b.ts - a.ts);

//         // Save the complete growing history stack cleanly to your permanent MMKV file
//         LikesReceivedCache.saveList(updatedList);

//         // Update your sync timestamp marker to match the newest incoming delta row element
//         if (data.ts > lastSavedTimestamp) {
//           storage.set(LAST_REC_TS_KEY, data.ts);
//         }

//         return updatedList;
//       });
//       setRecLoading(false);
//     });

//     // 4. LIVE DELETE/UNLIKE SYNC LISTENER
//     // Note: Since unliking removes records, we listen to the entire node path to capture deletes instantly
//     const globalRemovedRef = ref(rtdb, `likesReceived/${myUid}`);
//     const unsubRemoved = onChildRemoved(globalRemovedRef, (snap) => {
//       setLikesRec((prev) => {
//         const updatedList = prev.filter((p) => p.uid !== snap.key);
//         LikesReceivedCache.saveList(updatedList);
//         return updatedList;
//       });
//     });

//     // If the delta query returns absolutely no new items on boot, turn off loading safely
//     const timer = setTimeout(() => setRecLoading(false), 800);

//     return () => {
//       clearTimeout(timer);
//       unsubAdded();
//       unsubRemoved();
//     };
//   }, [myUid, tier]);

//   return { data: likesRec, isLoading: recLoading };
// }

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
        console.log("🗑️ [Likes Sent]: Target unliked or removed:", snap.key);
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
      console.log(
        "🛑 [Likes Received]: Cost Shield Active. Execution blocked for free tier.",
      );
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
      console.log(
        "🗑️ [Likes Received]: Deletion detected within active track window:",
        snap.key,
      );
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
