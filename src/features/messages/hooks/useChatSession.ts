import { useState, useRef, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { rtdb } from "../../../config/firebase";
import {
  ref,
  query,
  onValue,
  onChildAdded,
  onChildRemoved,
  limitToLast,
  endBefore,
  get,
  push,
  update,
  serverTimestamp,
  remove,
  set,
  onDisconnect,
  orderByKey,
  startAfter,
} from "@react-native-firebase/database";
import { IMessage } from "../type/chattype";
import { formatStatusTime } from "../../../utils/dateUtils";
import { useTranslation } from "react-i18next";
import {
  getDailySentCount,
  incrementDailySentCount,
} from "@/cacheMMKV/cacheConfig";

const DAILY_MESSAGE_LIMIT = 5;
const TARGET_BATCH_SIZE = 20;
const BATCH_SIZE = TARGET_BATCH_SIZE || 30;

export function useChatSession(
  rId: string,
  myUid: string,
  ou: { uid: string; name?: string; photo?: string },
) {
  const otherUid = ou?.uid;
  const [sentTodayCount, setSentTodayCount] = useState<number>(() =>
    getDailySentCount(myUid),
  );

  const { t } = useTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [hasNewAtBottom, setHasNewAtBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherStatus, setOtherStatus] = useState<any>(null);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const oldestLoadedTs = useRef<number | null>(null);
  const lastTypingState = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const msgUnsubscribe = useRef<(() => void) | null>(null);
  const newMsgUnsubscribe = useRef<(() => void) | null>(null);

  // Add a ref to store a queue of message IDs waiting to be marked as read
  const unreadQueue = useRef<string[]>([]);
  const readReceiptTimeout = useRef<NodeJS.Timeout | null>(null);

  const roomHash = useMemo(() => getRoomHash(rId), [rId]);

  const currentMonthStr = useRef(
    (() => {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    })(),
  ).current;

  const canSend = useMemo(() => {
    return sentTodayCount < DAILY_MESSAGE_LIMIT;
  }, [sentTodayCount]);

  const flushReadReceipts = useCallback(() => {
    if (unreadQueue.current.length === 0) return;

    const updates: Record<string, boolean> = {};
    unreadQueue.current.forEach((msgId) => {
      updates[`messages/${rId}/${msgId}/r`] = true;
    });

    update(ref(rtdb, "/"), updates)
      .then(() => {
        unreadQueue.current = []; // Clear queue on success
      })
      .catch(console.error);
  }, [rId]);

  const queueReadReceipt = useCallback(
    (msgId: string) => {
      if (unreadQueue.current.includes(msgId)) return;
      unreadQueue.current.push(msgId);

      if (readReceiptTimeout.current) clearTimeout(readReceiptTimeout.current);
      readReceiptTimeout.current = setTimeout(flushReadReceipts, 1500); // Debounce write for 1.5 seconds
    },
    [flushReadReceipts],
  );

  const stopListeners = useCallback(() => {
    if (msgUnsubscribe.current) {
      msgUnsubscribe.current();
      msgUnsubscribe.current = null;
    }
    if (newMsgUnsubscribe.current) {
      newMsgUnsubscribe.current();
      newMsgUnsubscribe.current = null;
    }
  }, []);

  const startLiveMessages = useCallback(() => {
    stopListeners();
    setIsLive(true);
    setHasNewAtBottom(false);
    setIsLoading(true);

    const roomRef = ref(rtdb, `messages/${rId}`);

    // 1. Unified viewport query for the latest messages
    const liveQuery = query(
      roomRef,
      orderByKey(),
      limitToLast(TARGET_BATCH_SIZE),
    );

    // 2. Single listener handles initial load, new messages, edits, and deletes
    const unsub = onValue(
      liveQuery,
      (snap) => {
        let list: IMessage[] = [];
        if (snap.exists()) {
          const rawData: IMessage[] = [];
          snap.forEach((child) => {
            rawData.push(child.val() as IMessage);
          });
          list = sortMessagesDesc(rawData);
        }

        setMessages(list);

        // Track Oldest Valid Timestamp for pagination
        const oldestMsgWithTs = [...list]
          .reverse()
          .find((m) => getValidTs(m) !== null);

        if (oldestMsgWithTs) {
          const validTs = getValidTs(oldestMsgWithTs)!;
          if (!oldestLoadedTs.current || validTs < oldestLoadedTs.current) {
            oldestLoadedTs.current = validTs;
          }
        }

        setHasMore(list.length >= TARGET_BATCH_SIZE);

        // 3. Batched Read Receipts integration
        const unread = list.filter((m) => m.s !== myUid && !m.r);
        if (unread.length > 0) {
          unread.forEach((m) => {
            if (m.id) queueReadReceipt(m.id);
          });
        }

        setIsLoading(false);
      },
      (err) => {
        console.error("Chat viewport stream error:", err);
        setIsLoading(false);
      },
    );

    msgUnsubscribe.current = unsub;
  }, [rId, myUid, stopListeners, queueReadReceipt]);

  const clearUnreadBadge = useCallback(async () => {
    if (!myUid || !rId) return;

    try {
      const inboxRef = ref(rtdb, `inbox/${myUid}/${rId}`);
      await update(inboxRef, { u: null });
    } catch (err) {
      console.error("Failed to clear unread badge:", err);
    }
  }, [myUid, rId]);

  useFocusEffect(
    useCallback(() => {
      if (!rId || !myUid || !otherUid) return;

      // 1. Clear unread badge & ignite live message stream
      clearUnreadBadge();
      startLiveMessages();

      // 2. Real-time subscriptions for presence and typing state
      const statusRef = ref(rtdb, `status/${otherUid}`);

      const otherTypingRef = ref(rtdb, `t/${otherUid}`);

      const unsubStatus = onValue(statusRef, (snap) => {
        setOtherStatus(snap.val());
      });

      const unsubTyping = onValue(otherTypingRef, (snap) => {
        const activeTypingHash = snap.val();
        setIsOtherTyping(activeTypingHash === roomHash);
      });

      // 3. Screen Blur / Unmount Cleanup
      return () => {
        stopListeners();
        unsubStatus();
        unsubTyping();

        // Reset self-typing status and timers on blur
        remove(ref(rtdb, `t/${myUid}`)).catch(console.error);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        // Reset typing state ref so re-focus allows fresh typing updates
        lastTypingState.current = false;
      };
    }, [
      rId,
      myUid,
      otherUid,
      startLiveMessages,
      stopListeners,
      clearUnreadBadge,
    ]),
  );

  const setMyTyping = useCallback(
    (isTyping: boolean) => {
      if (!rId || !myUid) return;

      if (isTyping === lastTypingState.current) return;
      lastTypingState.current = isTyping;

      const tRef = ref(rtdb, `t/${myUid}`);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        set(tRef, roomHash).catch(console.error);
        // Auto-clear typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          lastTypingState.current = false;
          remove(tRef).catch(console.error);
        }, 3000);
      } else {
        remove(tRef).catch(console.error);
      }
    },
    [rId, myUid],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text?.trim();
      if (!cleanText || !otherUid || !myUid) return;

      if (!canSend) {
        return;
      }

      setMyTyping(false);

      const ts = serverTimestamp();
      const roomRef = ref(rtdb, `messages/${rId}`);
      const msgRef = push(roomRef);
      const msgId = msgRef.key;

      if (!msgId) {
        throw new Error("FAILED_TO_GENERATE_MESSAGE_ID");
      }

      const updates: Record<string, any> = {};

      const truncatedText =
        cleanText.length > 30 ? cleanText.substring(0, 30) + "..." : cleanText;

      // 1. Flat Message Node
      updates[`messages/${rId}/${msgId}`] = {
        id: msgId,
        s: myUid,
        t: cleanText,
        ts,
        r: false,
      };

      // 2. Sender Inbox Metadata
      updates[`inbox/${myUid}/${rId}`] = {
        lm: truncatedText,
        ua: ts,
      };

      // 3. Recipient Inbox Metadata (with unread flag)
      updates[`inbox/${otherUid}/${rId}`] = {
        lm: truncatedText,
        ua: ts,
        u: true,
      };

      updates[`active_rooms/${currentMonthStr}/${rId}`] = true;

      await update(ref(rtdb, "/"), updates);
      // Increment MMKV and update local state synchronously
      const updatedCount = incrementDailySentCount(myUid);
      setSentTodayCount(updatedCount);
      return;
    },
    [rId, myUid, otherUid, canSend],
  );

  const deleteMessage = useCallback(
    async (messageItem: IMessage) => {
      if (!rId || !myUid || !otherUid || !messageItem?.id) return;

      try {
        const deletionTime = Date.now();
        const updates: Record<string, any> = {};

        // 1. Archive deleted message metadata
        const archivePath = `archive/${rId}/${messageItem.s}/${messageItem.id}`;
        updates[archivePath] = {
          ...messageItem,
          dAt: deletionTime, //deletedAT
        };

        // 2. Flat Path deletion (remove month-based sub-path)
        const liveMessagePath = `messages/${rId}/${messageItem.id}`;
        updates[liveMessagePath] = null;

        // 3. Inbox Last Message Update (index 0 is the newest in desc-sorted state)
        const isLatestMessage = messages[0]?.id === messageItem.id;

        if (isLatestMessage) {
          const fallbackMsg = messages[1];

          if (fallbackMsg) {
            const fallbackText = fallbackMsg.t || "";
            const fallbackTs = getValidTs(fallbackMsg) || deletionTime;

            updates[`inbox/${myUid}/${rId}`] = {
              lm: fallbackText.substring(0, 60) + "...",
              ua: fallbackTs,
            };

            updates[`inbox/${otherUid}/${rId}`] = {
              lm: fallbackText.substring(0, 60) + "...",
              ua: fallbackTs,
            };
          } else {
            // Room is now empty after this deletion
            updates[`inbox/${myUid}/${rId}`] = {
              lm: "",
              ua: deletionTime,
            };

            updates[`inbox/${otherUid}/${rId}`] = {
              lm: "",
              ua: deletionTime,
            };
          }
        }

        await update(ref(rtdb, "/"), updates);
      } catch (err) {
        console.error("Failed to delete message:", err);
        throw err;
      }
    },
    [rId, myUid, otherUid, messages],
  );

  const loadEarlier = useCallback(async () => {
    if (isLoadingEarlier || !hasMore) return;

    const roomRef = ref(rtdb, `messages/${rId}`);

    // 1. Pause live stream when scrolling back into history
    if (isLive) {
      setIsLive(false);
      stopListeners();
      // Listen only for new incoming messages at the bottom to notify user
      const newestMsgId = messages[0]?.id;
      if (newestMsgId) {
        const newMsgQuery = query(
          roomRef,
          orderByKey(),
          startAfter(newestMsgId),
        );
        newMsgUnsubscribe.current = onChildAdded(newMsgQuery, (snap) => {
          const msg = snap.val() as IMessage;
          if (msg && msg.s !== myUid) {
            setHasNewAtBottom(true);
          }
        });
      }
    }

    // 2. Locate the oldest valid message anchor currently in state
    const oldestMsg = [...messages].reverse().find((m) => Boolean(m?.id));
    if (!oldestMsg?.id) return;

    setIsLoadingEarlier(true);

    try {
      // 3. Key-anchored query: fetch items strictly BEFORE the oldest loaded Push ID
      const earlierQuery = query(
        roomRef,
        orderByKey(),
        endBefore(oldestMsg.id),
        limitToLast(BATCH_SIZE),
      );

      const snap = await get(earlierQuery);
      let older: IMessage[] = [];

      if (snap.exists()) {
        const rawData: IMessage[] = [];
        snap.forEach((child) => {
          rawData.push(child.val() as IMessage);
        });
        older = sortMessagesDesc(rawData);
      }

      // 4. Update State & Anchors
      if (older.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueOlder = older.filter((m) => !existingIds.has(m.id));
          return [...prev, ...uniqueOlder];
        });
        const newOldest = older[older.length - 1];
        const newOldestTs = getValidTs(newOldest);
        if (newOldestTs) {
          oldestLoadedTs.current = newOldestTs;
        }
        // If we received fewer items than requested, we've reached the end of history
        setHasMore(older.length >= BATCH_SIZE);
      } else {
        setHasMore(false); // Reached end of RTDB history
      }
    } catch (err) {
      console.error("Failed to load earlier messages:", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [rId, isLive, isLoadingEarlier, hasMore, messages, myUid, stopListeners]);

  const statusLabel = useMemo(() => {
    if (isOtherTyping) return t("chat.typing");
    if (otherStatus?.st === "on") return t("chat.online");
    if (otherStatus?.lc) {
      return t("chat.lastSeen", {
        time: formatStatusTime(otherStatus.lc),
      });
    }
    return "";
  }, [isOtherTyping, otherStatus?.st, otherStatus?.lc]);

  return {
    messages,
    isLoading,
    isLoadingEarlier,
    isOtherTyping,
    otherStatus,
    hasMore,
    isLive,
    hasNewAtBottom,
    canSend,
    sentTodayCount,
    loadEarlier,
    sendMessage,
    deleteMessage,
    setMyTyping,
    statusLabel,
    resetToLive: startLiveMessages,
  };
}

// 1. Strict Timestamp Validator (Returns number or null)
const getValidTs = (msg?: IMessage): number | null => {
  return typeof msg?.ts === "number" && !Number.isNaN(msg.ts) ? msg.ts : null;
};

// 2. Safe Sorting (Timestamp-first, Push Key fallback)
const sortMessagesDesc = (msgs: IMessage[]): IMessage[] => {
  return [...msgs].sort((a, b) => {
    const tsA = getValidTs(a);
    const tsB = getValidTs(b);

    if (tsA !== null && tsB !== null) {
      return tsB - tsA; // Descending numerical order
    }

    // If ts is missing on either, fall back to lexicographical Push Key comparison
    if (a.id && b.id) {
      return b.id.localeCompare(a.id);
    }

    return 0;
  });
};

const getRoomHash = (roomId: string): string => {
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = (hash << 5) - hash + roomId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36); // Yields an ultra-short base36 string
};
