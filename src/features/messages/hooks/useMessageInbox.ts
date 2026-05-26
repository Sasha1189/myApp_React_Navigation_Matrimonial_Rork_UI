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
  goOnline,
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

  // useFocusEffect(
  //   useCallback(() => {
  //     startLive();
  //     return () => stopListeners();
  //   }, [startLive, stopListeners]),
  // );

  // Inside your useMessageInbox hook body:
  useFocusEffect(
    useCallback(() => {
      // 🎯 CRITICAL ACCURACY FIX: Wake up the global valve before initiating data streams.
      // This safely fixes any background goOffline() commands issued by the usePresence hook.
      try {
        goOnline(rtdb);
        console.log(
          "📥 [Inbox Hook]: Screen focused. Ensuring RTDB socket is online.",
        );
      } catch (err) {
        console.error("Failed to re-engage inbox socket layer:", err);
      }

      startLive();

      return () => {
        console.log(
          "📤 [Inbox Hook]: Screen blurred. Suspending live inbox tracking listeners.",
        );
        stopListeners();
      };
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
