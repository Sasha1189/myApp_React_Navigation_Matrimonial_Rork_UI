import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
import { useBlockedSet } from "@/features/block/hook/useBlockedSet"; // Adjust path to your hook
import { feedRepository } from "@/db/services/dbFeedServices"; // Adjust path to your feed repository
import { Profile } from "@/features/profile/types/profile";

const PAGE_SIZE = 20;
const MAX_LIMIT = 100;

export const useMessageInbox = (uid: string) => {
  const [rawBanners, setRawBanners] = useState<IInboxItem[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});

  const [isLive, setIsLive] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasNewAtTop, setHasNewAtTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Blocked Users Set
  const blockedSet = useBlockedSet();

  const oldestTsRef = useRef<number | null>(null);
  const latestSeenTsRef = useRef<number>(0);

  // Refs for modular unsubscription functions
  const msgUnsubscribe = useRef<(() => void) | null>(null);
  const unsubNotify = useRef<(() => void) | null>(null);

  // 1. Batch-fetch missing profiles whenever rawBanners update
  useEffect(() => {
    const missingUids = Array.from(
      new Set(
        rawBanners
          .map((item) => item.ou?.uid)
          .filter(
            (id): id is string =>
              Boolean(id) && !blockedSet.has(id) && !profileMap[id],
          ),
      ),
    );

    if (missingUids.length === 0) return;

    // Fetch missing profiles in parallel from local SQLite
    Promise.all(missingUids.map((id) => feedRepository.fetchProfileByUid(id)))
      .then((profiles) => {
        const updates: Record<string, Profile> = {};
        profiles.forEach((profile, idx) => {
          if (profile) updates[missingUids[idx]] = profile;
        });

        if (Object.keys(updates).length > 0) {
          setProfileMap((prev) => ({ ...prev, ...updates }));
        }
      })
      .catch((err) =>
        console.error("[useMessageInbox] Profile lookup failed", err),
      );
  }, [rawBanners, blockedSet, profileMap]);

  // 2. Filter blocked users & attach name/photo to `ou`
  const banners: IInboxItem[] = useMemo(() => {
    return rawBanners
      .filter((item) => item.ou?.uid && !blockedSet.has(item.ou.uid))
      .map((item) => {
        const profile = profileMap[item.ou.uid];
        return {
          ...item,
          ou: {
            ...item.ou,
            name: profile?.fn ?? "",
            photo: profile?.photos?.[0]?.downloadURL ?? null,
          },
        };
      });
  }, [rawBanners, blockedSet, profileMap]);

  //----------------------------------------------------------------------------
  // 3. Stop all listeners
  //----------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // RTDB Sync Logic
  // ---------------------------------------------------------------------------
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

    // 1. Initial Fetch
    try {
      const snap = await get(inboxQuery);
      const data = snap.val() || {};
      const sorted = (Object.values(data) as IInboxItem[]).sort(
        (a, b) => b.ua - a.ua,
      );

      setRawBanners(sorted);
      if (sorted.length > 0) {
        oldestTsRef.current = sorted[sorted.length - 1].ua;
        latestSeenTsRef.current = sorted[0].ua;
      }
      setHasMore(sorted.length === PAGE_SIZE);
    } catch (err) {
      console.error("Inbox initial fetch failed", err);
    } finally {
      setIsLoading(false);
    }

    // 2. Realtime Listeners
    const unsubAdded = onChildAdded(inboxQuery, (snap) => {
      const newItem = snap.val() as IInboxItem;
      setRawBanners((prev) => {
        if (prev.some((item) => item.rId === newItem.rId)) return prev;
        const newList = [newItem, ...prev].sort((a, b) => b.ua - a.ua);
        return newList.slice(0, PAGE_SIZE);
      });
    });

    const unsubChanged = onChildChanged(inboxQuery, (snap) => {
      const updatedItem = snap.val() as IInboxItem;
      setRawBanners((prev) =>
        prev
          .map((item) => (item.rId === updatedItem.rId ? updatedItem : item))
          .sort((a, b) => b.ua - a.ua),
      );
    });

    const unsubRemoved = onChildRemoved(inboxQuery, (snap) => {
      const deletedRoomId = snap.key;
      setRawBanners((prev) =>
        prev.filter((item) => item.rId !== deletedRoomId),
      );
    });

    msgUnsubscribe.current = () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [uid, stopListeners]);

  //----------------------------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      try {
        goOnline(rtdb);
      } catch (err) {
        console.error("Failed to re-engage inbox socket layer:", err);
      }

      startLive();

      return () => {
        stopListeners();
      };
    }, [startLive, stopListeners]),
  );

  // Pagination Logic
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || !oldestTsRef.current) return;

    if (isLive) {
      setIsLive(false);
      stopListeners();

      const notifyQuery = query(ref(rtdb, `inbox/${uid}`), limitToLast(1));
      unsubNotify.current = onChildAdded(notifyQuery, (snap) => {
        const val = snap.val() as IInboxItem;
        if (val?.ua > latestSeenTsRef.current) setHasNewAtTop(true);
      });
    }

    setIsFetchingMore(true);
    try {
      const moreQuery = query(
        ref(rtdb, `inbox/${uid}`),
        orderByChild("ua"),
        endAt(oldestTsRef.current - 1),
        limitToLast(PAGE_SIZE),
      );

      const snap = await get(moreQuery);
      const data = snap.val();

      if (data) {
        const batch = (Object.values(data) as IInboxItem[]).sort(
          (a, b) => b.ua - a.ua,
        );
        oldestTsRef.current = batch[batch.length - 1].ua;

        setRawBanners((prev) => {
          const combined = [...prev, ...batch];
          const unique = Array.from(
            new Map(combined.map((item) => [item.rId, item])).values(),
          ).sort((a, b) => b.ua - a.ua);

          return unique.length > MAX_LIMIT
            ? unique.slice(0, MAX_LIMIT)
            : unique;
        });
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
