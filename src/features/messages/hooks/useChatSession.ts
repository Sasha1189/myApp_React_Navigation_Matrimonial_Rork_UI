import { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { rtdb } from "../../../config/firebase";
import {
  ref,
  query,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  limitToLast,
  orderByChild,
  endAt,
  get,
  push,
  update,
  serverTimestamp,
  remove,
  set,
  onDisconnect,
  goOnline,
} from "@react-native-firebase/database";
import { IMessage } from "../type/chattype";
import { formatStatusTime } from "../../../utils/dateUtils";
import { useTranslation } from "react-i18next";

export function useChatSession(
  roomId: string,
  myUid: string,
  sender: { name?: string; photo?: string },
  otherUser: { uid: string; name?: string; photo?: string },
) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { t } = useTranslation();
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
    try {
      goOnline(rtdb);
    } catch (err) {
      console.error("Failed to re-engage active chat socket wrapper:", err);
    }
    stopListeners();
    setIsLive(true);
    setHasNewAtBottom(false);

    // Modular Query: Passing rtdb instance as the first argument
    const msgQuery = query(ref(rtdb, `messages/${roomId}`), limitToLast(50));
    // 1. Initial Load (One-time cost)
    get(msgQuery).then((snap) => {
      const data = snap.val() || {};
      const list = (Object.values(data) as IMessage[]).sort(
        (a, b) => b.ts - a.ts,
      );
      setMessages(list);

      if (list.length > 0) {
        const oldestInBatch = list[list.length - 1].ts;
        if (!oldestLoadedTs.current || oldestInBatch < oldestLoadedTs.current) {
          oldestLoadedTs.current = oldestInBatch;
        }
      }
      setHasMore(list.length >= 50);
      setIsLoading(false);

      // Initial Read Batch
      const unread = list.filter((m) => m.s !== myUid && !m.r);
      if (unread.length > 0) {
        const updates: any = {};
        unread.forEach((m) => (updates[`messages/${roomId}/${m.id}/r`] = true));
        update(ref(rtdb, "/"), updates);
      }
    });

    // 2. Listen ONLY for New Messages (Smallest possible download)
    const unsubAdded = onChildAdded(msgQuery, (snap) => {
      const newMsg = snap.val() as IMessage;
      setMessages((prev) => {
        // Prevent duplicates from initial 'get'
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const newList = [newMsg, ...prev].sort((a, b) => b.ts - a.ts);
        return newList.slice(0, 50); // Keep local memory lean
      });

      // Mark single new message as read if it's not mine
      if (newMsg.s !== myUid && !newMsg.r) {
        update(ref(rtdb, `messages/${roomId}/${newMsg.id}`), { r: true });
      }
    });

    // 3. Listen ONLY for Changes (e.g., Read Ticks from the other user)
    const unsubChanged = onChildChanged(msgQuery, (snap) => {
      const updatedMsg = snap.val() as IMessage;
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
      );
    });

    // 5. Listener: Deletions (The "Missing" Piece)
    // This ensures that if a message is deleted, it's removed from your DISK cache too.
    const unsubRemoved = onChildRemoved(msgQuery, (snap) => {
      setMessages((prev) => prev.filter((m) => m.id !== snap.key));
    });

    msgUnsubscribe.current = () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [roomId, myUid, stopListeners]);

  const clearUnreadBadge = useCallback(() => {
    update(ref(rtdb, `inbox/${myUid}/${roomId}`), { u: null });
  }, [myUid, roomId]);

  useFocusEffect(
    useCallback(() => {
      const otherUid = otherUser?.uid;
      if (!roomId || !myUid || !otherUid) return;

      clearUnreadBadge();

      startLiveMessages();

      const statusRef = ref(rtdb, `status/${otherUid}`);
      const otherTypingRef = ref(rtdb, `typing/${roomId}/${otherUid}`);

      const unsubStatus = onValue(statusRef, (snap) =>
        setOtherStatus(snap.val()),
      );
      const unsubTyping = onValue(otherTypingRef, (snap) => {
        const val = snap.val();
        setIsOtherTyping(!!val); // If node exists, it's true. If removed, it's false.
      });

      return () => {
        stopListeners();
        unsubStatus();
        unsubTyping();
        remove(ref(rtdb, `typing/${roomId}/${myUid}`));
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [
      roomId,
      myUid,
      otherUser?.uid,
      startLiveMessages,
      stopListeners,
      clearUnreadBadge,
    ]),
  );

  const loadEarlier = useCallback(async () => {
    if (isLoadingEarlier || !hasMore || !oldestLoadedTs.current) return;

    if (isLive) {
      setIsLive(false);
      stopListeners();

      const lastMsgQuery = query(
        ref(rtdb, `messages/${roomId}`),
        limitToLast(1),
      );
      newMsgUnsubscribe.current = onChildAdded(lastMsgQuery, (snap) => {
        if (snap.val()?.s !== myUid) setHasNewAtBottom(true);
      });
    }

    setIsLoadingEarlier(true);
    try {
      // Functional Querying replaces .orderByChild() calls
      const earlierQuery = query(
        ref(rtdb, `messages/${roomId}`),
        orderByChild("ts"),
        endAt(oldestLoadedTs.current - 1),
        limitToLast(50),
      );

      const snap = await get(earlierQuery);
      const data = snap.val();

      if (data) {
        const older = (Object.values(data) as IMessage[]).sort(
          (a, b) => b.ts - a.ts,
        );
        setMessages((prev) => {
          const combined = [...prev, ...older];
          // Sliding window for React 19 performance
          return combined.length > 200 ? combined.slice(0, 200) : combined;
        });
        oldestLoadedTs.current = older[older.length - 1].ts;
        setHasMore(older.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load earlier failed", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [roomId, isLive, isLoadingEarlier, hasMore, myUid, stopListeners]);

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text?.trim();
      if (!cleanText || !otherUser?.uid || !myUid) return;

      const ts = serverTimestamp();
      const msgId = push(ref(rtdb, `messages/${roomId}`)).key;

      const updates: Record<string, any> = {};
      updates[`messages/${roomId}/${msgId}`] = {
        id: msgId,
        s: myUid,
        t: cleanText,
        ts,
        r: false,
      };

      const common = { lastMessage: cleanText, updatedAt: ts, roomId };
      updates[`inbox/${myUid}/${roomId}`] = {
        ...common,
        otherUser: {
          uid: otherUser.uid,
          name: otherUser.name || "User",
          photo: otherUser.photo || "",
        },
      };
      updates[`inbox/${otherUser.uid}/${roomId}`] = {
        ...common,
        otherUser: {
          uid: myUid,
          name: sender.name || "User",
          photo: sender.photo || "",
        },
        u: true, // <--- The "Unread" flag
      };

      return update(ref(rtdb, "/"), updates);
    },
    [roomId, myUid, sender, otherUser],
  );

  const deleteMessage = useCallback(
    async (messageItem: IMessage) => {
      if (!roomId || !myUid || !messageItem?.id || !otherUser?.uid) return;

      try {
        const deletionTime = Date.now();
        const updates: Record<string, any> = {};

        // 1. Compliance Archive Path: Stores data for audits with a separate deletion time
        const archivePath = `archive/${roomId}/${messageItem.s}/${messageItem.id}`;
        updates[archivePath] = {
          ...messageItem,
          deletedAt: deletionTime, // Distinct compliance timestamp anchor
        };

        // 2. Production Removal Path: Deletes the active bubble node instance
        const liveMessagePath = `messages/${roomId}/${messageItem.id}`;
        updates[liveMessagePath] = null; // Removing the node completely in RTB

        // 3. Inbox Patch Update: Evaluate if the deleted item was the latest message
        const isLatestMessage = messages[0]?.id === messageItem.id;

        if (isLatestMessage) {
          const fallbackMsg = messages[1]; // Get the next newest available message

          if (fallbackMsg) {
            // Rollback inbox preview to the previous message content
            const fallbackText = fallbackMsg.t || "";
            const fallbackTs =
              typeof fallbackMsg.ts === "number"
                ? fallbackMsg.ts
                : deletionTime;

            updates[`inbox/${myUid}/${roomId}/lastMessage`] = fallbackText;
            updates[`inbox/${myUid}/${roomId}/updatedAt`] = fallbackTs;

            updates[`inbox/${otherUser.uid}/${roomId}/lastMessage`] =
              fallbackText;
            updates[`inbox/${otherUser.uid}/${roomId}/updatedAt`] = fallbackTs;
          } else {
            // No other messages left in the chat room. Clear out the previews cleanly.
            updates[`inbox/${myUid}/${roomId}/lastMessage`] = "";
            updates[`inbox/${myUid}/${roomId}/updatedAt`] = deletionTime;

            updates[`inbox/${otherUser.uid}/${roomId}/lastMessage`] = "";
            updates[`inbox/${otherUser.uid}/${roomId}/updatedAt`] =
              deletionTime;
          }
        }

        // 4. Atomic Multi-Path Execution
        await update(ref(rtdb, "/"), updates);
      } catch (err) {
        throw err; // Re-throw to handle UI alerting fallbacks gracefully
      }
    },
    [roomId, myUid, messages, otherUser?.uid], // Added messages and otherUser.uid to dependencies
  );

  const setMyTyping = useCallback(
    (isTyping: boolean) => {
      // Guard: Prevents spamming the DB with the same state
      if (isTyping === lastTypingState.current) return;
      lastTypingState.current = isTyping;

      const tPath = `typing/${roomId}/${myUid}`;
      const tRef = ref(rtdb, tPath);

      if (isTyping) {
        // SET state to true and tell server to REMOVE it if I disconnect
        set(tRef, true);
        onDisconnect(tRef).remove();
      } else {
        remove(tRef);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [roomId, myUid],
  );

  const getStatusLabel = useCallback(() => {
    if (isOtherTyping) return t("chat.typing");

    if (otherStatus?.state === "online") return t("chat.online");

    if (otherStatus?.lastChanged) {
      return t("chat.lastSeen", {
        time: formatStatusTime(otherStatus.lastChanged),
      });
    }

    return "";
  }, [isOtherTyping, otherStatus, t]);

  return {
    messages,
    isLoading,
    isLoadingEarlier,
    isOtherTyping,
    otherStatus,
    hasMore,
    isLive,
    hasNewAtBottom,
    loadEarlier,
    sendMessage,
    deleteMessage,
    setMyTyping,
    getStatusLabel,
    resetToLive: startLiveMessages,
  };
}
