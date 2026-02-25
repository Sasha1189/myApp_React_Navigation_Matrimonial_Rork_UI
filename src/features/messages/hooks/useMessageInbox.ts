// import { useState, useCallback, useRef } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { rtdb } from "../../../config/firebase";
// import { IInboxItem } from "../type/chattype";

// const PAGE_SIZE = 50;
// const MAX_LIMIT = 200;

// export const useMessageInbox = (uid: string) => {
//   const [banners, setBanners] = useState<IInboxItem[]>([]);
//   const [isLive, setIsLive] = useState(true);
//   const [hasMore, setHasMore] = useState(false);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const [hasNewAtTop, setHasNewAtTop] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const oldestTsRef = useRef<number | null>(null);
//   const latestSeenTsRef = useRef<number>(0);

//   const listenerRef = useRef<any>(null);
//   const notifyRef = useRef<any>(null);

//   const stopListeners = useCallback(() => {
//     if (listenerRef.current)
//       rtdb.ref(`inbox/${uid}`).off("value", listenerRef.current);
//     if (notifyRef.current)
//       rtdb.ref(`inbox/${uid}`).off("value", notifyRef.current);
//     listenerRef.current = null;
//     notifyRef.current = null;
//   }, [uid]);

//   const startLive = useCallback(() => {
//     if (!uid) return;

//     if (listenerRef.current) rtdb.ref(`inbox/${uid}`).off();

//     setIsLive(true);
//     setHasNewAtTop(false);

//     const query = rtdb
//       .ref(`inbox/${uid}`)
//       .orderByChild("updatedAt")
//       .limitToLast(PAGE_SIZE);

//     listenerRef.current = query.on("value", (snap) => {
//       const data = snap.val();
//       if (data) {
//         const sorted = (Object.values(data) as IInboxItem[]).sort(
//           (a, b) => b.updatedAt - a.updatedAt,
//         );
//         setBanners(sorted);
//         oldestTsRef.current = sorted[sorted.length - 1].updatedAt;
//         latestSeenTsRef.current = sorted[0].updatedAt;
//         setHasMore(sorted.length === PAGE_SIZE);
//       } else {
//         setBanners([]);
//         setHasMore(false);
//       }
//       setIsLoading(false);
//     });
//   }, [uid]);

//   useFocusEffect(
//     useCallback(() => {
//       startLive();
//       return () => stopListeners();
//     }, [startLive, stopListeners]),
//   );

//   const loadMore = useCallback(async () => {
//     // 1. If we already know there's no more data, show Toast and exit
//     if (!hasMore && !isLoading && banners.length > 0) {
//       // Replace with your preferred Toast library (e.g., react-native-root-toast or Alert)
//       // Toast.show("No more chats to load", { duration: Toast.durations.SHORT });
//       return;
//     }

//     if (isFetchingMore || !oldestTsRef.current) return;

//     if (isLive) {
//       console.log("Switching to Static Mode - Killing Listener");
//       setIsLive(false);
//       stopListeners();

//       if (listenerRef.current)
//         rtdb.ref(`inbox/${uid}`).off("value", listenerRef.current);

//       // Start the background 'New Message' notifier
//       // startNotifyListener();

//       notifyRef.current = rtdb
//         .ref(`inbox/${uid}`)
//         .orderByChild("updatedAt")
//         .limitToLast(1)
//         .on("value", (snap) => {
//           const val = Object.values(snap.val() || {})[0] as IInboxItem;
//           if (val?.updatedAt > latestSeenTsRef.current) setHasNewAtTop(true);
//         });
//     }

//     setIsFetchingMore(true);

//     try {
//       const snap = await rtdb
//         .ref(`inbox/${uid}`)
//         .orderByChild("updatedAt")
//         .endAt(oldestTsRef.current - 1)
//         .limitToLast(PAGE_SIZE)
//         .once("value");

//       const data = snap.val();
//       if (data) {
//         const batch = (Object.values(data) as IInboxItem[]).sort(
//           (a, b) => b.updatedAt - a.updatedAt,
//         );

//         setBanners((prev) => {
//           const combined = [...prev, ...batch];
//           // Deduplicate
//           const unique = Array.from(
//             new Map(combined.map((item) => [item.roomId, item])).values(),
//           );

//           // 🔹 SLIDING WINDOW: If user fetches beyond 200, drop the oldest ones from the TOP
//           // To keep latest 200: use .slice(-MAX_LIMIT) if appending to end
//           // To keep 20-220 range: combined.slice(20) removes the 20 newest to make room
//           return unique.length > MAX_LIMIT ? unique.slice(20) : unique;
//         });

//         oldestTsRef.current = batch[batch.length - 1].updatedAt;
//         setHasMore(batch.length === PAGE_SIZE); // 🔹 If we got less than PAGE_SIZE, no more data
//       } else {
//         setHasMore(false);
//       }
//     } catch (e) {
//       console.error("Pagination failed", e);
//     } finally {
//       setIsFetchingMore(false);
//     }
//   }, [uid, isLive, hasMore, isFetchingMore]);

//   return {
//     banners,
//     isLive,
//     hasNewAtTop,
//     isLoading,
//     isFetchingMore,
//     loadMore,
//     hasMore,
//     reset: startLive,
//   };
// };
// //logic
// // Here are the one-liner descriptions of the conditions your code currently meets:
// // Atomic Reciprocity: Writes both sender and receiver inbox metadata in
// //    a single database request. Firebase Update Documentation
// // Initial-Only Metadata: Only uploads heavy Base64 name/photo data if the roomId does not already exist.
// // Sliding Window Memory: Limits local state to 200 items, dropping the
// //    oldest 20 to prevent Base64 memory crashes. MDN Array Slice
// // Deep-Scroll Freeze: Kills the Live Listener during pagination to
// //    prevent new messages from "jumping" the user's scroll position.
// // Duplicate Elimination: Uses a Map by roomId to ensure zero duplicate banners appear in the list.
// // Delta-Sync Pagination: Uses endAt(ts - 1) to fetch the next batch
// //    without re-downloading previous items. Firebase RTDB Queries
// // Background Change-Detection: Uses a lightweight limitToLast(1) listener
// //    to notify users of new messages while they are deep-scrolling.
// // Debounced Typing: Hits the database only twice (start/stop) per
// //    typing session instead of every keystroke.
// // Automatic Presence Cleanup: Uses onDisconnect() and useFocusEffect
// //    cleanup to instantly remove "Typing..." when the user leaves. Firebase Offline Capabilities
// // Index-Optimized Fetching: Leverages server-side .indexOn: ["updatedAt"]
// //    for high-speed, low-bandwidth sorting. Firebase Indexing

import { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { rtdb } from "../../../config/firebase";
import {
  ref,
  query,
  orderByChild,
  limitToLast,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  get,
  endAt,
} from "@react-native-firebase/database";
import { IInboxItem } from "../type/chattype";

const PAGE_SIZE = 50;
const MAX_LIMIT = 200;

export const useMessageInbox = (uid: string) => {
  const [banners, setBanners] = useState<IInboxItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasNewAtTop, setHasNewAtTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const oldestTsRef = useRef<number | null>(null);
  const latestSeenTsRef = useRef<number>(0);

  // Refs for modular unsubscription functions
  const msgUnsubscribe = useRef<(() => void) | null>(null);
  // const unsubAdded = useRef<(() => void) | null>(null);
  // const unsubChanged = useRef<(() => void) | null>(null);
  const unsubNotify = useRef<(() => void) | null>(null);

  const stopListeners = useCallback(() => {
    if (msgUnsubscribe.current) {
      msgUnsubscribe.current();
      msgUnsubscribe.current = null;
    }

    if (unsubNotify.current) {
      unsubNotify.current();
      unsubNotify.current = null;
    }
  }, []);

  const startLive = useCallback(async () => {
    if (!uid) return;
    stopListeners();
    setIsLive(true);
    setHasNewAtTop(false);

    const inboxQuery = query(
      ref(rtdb, `inbox/${uid}`),
      orderByChild("updatedAt"),
      limitToLast(PAGE_SIZE),
    );

    // 1. Initial Fetch (One-time cost)
    try {
      const snap = await get(inboxQuery);
      const data = snap.val() || {};
      const sorted = (Object.values(data) as IInboxItem[]).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      );

      setBanners(sorted);
      if (sorted.length > 0) {
        oldestTsRef.current = sorted[sorted.length - 1].updatedAt;
        latestSeenTsRef.current = sorted[0].updatedAt;
      }
      setHasMore(sorted.length === PAGE_SIZE);
    } catch (err) {
      console.error("Inbox initial fetch failed", err);
    } finally {
      setIsLoading(false);
    }

    // 2. Cost-Efficient Listeners: Only sync changes, not full list
    const unsubAdded = onChildAdded(inboxQuery, (snap) => {
      const newItem = snap.val() as IInboxItem;
      setBanners((prev) => {
        if (prev.some((item) => item.roomId === newItem.roomId)) return prev;
        const newList = [newItem, ...prev].sort(
          (a, b) => b.updatedAt - a.updatedAt,
        );
        return newList.slice(0, PAGE_SIZE);
      });
    });

    const unsubChanged = onChildChanged(inboxQuery, (snap) => {
      const updatedItem = snap.val() as IInboxItem;
      setBanners((prev) =>
        prev
          .map((item) =>
            item.roomId === updatedItem.roomId ? updatedItem : item,
          )
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
    });

    // 4. NEW: Listener for Deletions (Critical for Sync)
    const unsubRemoved = onChildRemoved(inboxQuery, (snap) => {
      const deletedRoomId = snap.key;
      setBanners((prev) =>
        prev.filter((item) => item.roomId !== deletedRoomId),
      );
    });

    // Save all three unsubscription functions
    msgUnsubscribe.current = () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [uid, stopListeners]);

  useFocusEffect(
    useCallback(() => {
      startLive();
      return () => stopListeners();
    }, [startLive, stopListeners]),
  );

  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || !oldestTsRef.current) return;

    if (isLive) {
      setIsLive(false);
      stopListeners();

      // Background Notifier for new chats while in static mode
      const notifyQuery = query(ref(rtdb, `inbox/${uid}`), limitToLast(1));
      unsubNotify.current = onChildAdded(notifyQuery, (snap) => {
        const val = snap.val() as IInboxItem;
        if (val?.updatedAt > latestSeenTsRef.current) setHasNewAtTop(true);
      });
    }

    setIsFetchingMore(true);
    try {
      const moreQuery = query(
        ref(rtdb, `inbox/${uid}`),
        orderByChild("updatedAt"),
        endAt(oldestTsRef.current - 1),
        limitToLast(PAGE_SIZE),
      );

      const snap = await get(moreQuery);
      const data = snap.val();

      if (data) {
        const batch = (Object.values(data) as IInboxItem[]).sort(
          (a, b) => b.updatedAt - a.updatedAt,
        );

        setBanners((prev) => {
          const combined = [...prev, ...batch];
          // Deduplicate by RoomID
          const unique = Array.from(
            new Map(combined.map((item) => [item.roomId, item])).values(),
          ).sort((a, b) => b.updatedAt - a.updatedAt);

          return unique.length > MAX_LIMIT
            ? unique.slice(0, MAX_LIMIT)
            : unique;
        });

        oldestTsRef.current = batch[batch.length - 1].updatedAt;
        setHasMore(batch.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Inbox pagination failed", e);
    } finally {
      setIsFetchingMore(false);
    }
  }, [uid, isLive, hasMore, isFetchingMore, stopListeners]);

  return {
    banners,
    isLive,
    hasNewAtTop,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    reset: startLive,
  };
};
