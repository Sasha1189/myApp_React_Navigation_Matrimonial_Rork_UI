import { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { rtdb, get, ref, serverTimestamp } from "../../../config/firebase";
import { IMessage } from "../type/chattype";

export function useChatSession(
  roomId: string,
  myUid: string,
  sender: any,
  otherUser: any,
) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLive, setIsLive] = useState(true); // 🔹 Tracks Live vs Static mode
  const [hasNewAtBottom, setHasNewAtBottom] = useState(false); // 🔹 For "New Message" popup
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherStatus, setOtherStatus] = useState<any>(null);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const oldestLoadedTs = useRef<number | null>(null);
  const lastTypingState = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const msgListenerRef = useRef<any>(null);

  const stopMsgListener = useCallback(() => {
    if (msgListenerRef.current) {
      rtdb.ref(`messages/${roomId}`).off("value", msgListenerRef.current);
      msgListenerRef.current = null;
    }
  }, [roomId]);

  const startLiveMessages = useCallback(() => {
    stopMsgListener();
    setIsLive(true);
    setHasNewAtBottom(false);

    const query = rtdb.ref(`messages/${roomId}`).limitToLast(50);
    msgListenerRef.current = query.on("value", (snap) => {
      const data = snap.val() || {};
      const list = (Object.values(data) as IMessage[]).sort(
        (a, b) => a.ts - b.ts,
      );

      setMessages(list);
      if (list.length > 0) oldestLoadedTs.current = list[0].ts;
      setHasMore(list.length === 50);
      setIsLoading(false);

      // Auto-mark as read logic
      const lastMsg = list[list.length - 1];
      if (lastMsg && lastMsg.s !== myUid && !lastMsg.r) {
        rtdb.ref(`messages/${roomId}/${lastMsg.id}/r`).set(true);
      }
    });
  }, [roomId, myUid, stopMsgListener]);

  useFocusEffect(
    useCallback(() => {
      if (!roomId || !myUid || !otherUser.uid) return;

      startLiveMessages();

      // Secondary listeners (Typing/Status) stay live regardless
      const otherStatusRef = rtdb.ref(`status/${otherUser.uid}`);
      const otherTypingRef = rtdb.ref(`typing/${roomId}/${otherUser.uid}`);
      const onStatus = otherStatusRef.on("value", (snap) =>
        setOtherStatus(snap.val()),
      );
      const onTyping = otherTypingRef.on("value", (snap) =>
        setIsOtherTyping(!!snap.val()),
      );

      return () => {
        stopMsgListener();
        otherStatusRef.off("value", onStatus);
        otherTypingRef.off("value", onTyping);
        rtdb.ref(`typing/${roomId}/${myUid}`).remove();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [roomId, myUid, otherUser.uid, startLiveMessages, stopMsgListener]),
  );

  const loadEarlier = useCallback(async () => {
    // 1. If we know there's no more, exit (optional: show toast here)
    if (!hasMore && !isLoadingEarlier) return;

    if (isLoadingEarlier || !oldestLoadedTs.current) return;

    // 2. Freeze the Live Feed when user starts digging into history
    if (isLive) {
      setIsLive(false);
      stopMsgListener();
      // Background listener for "New Message" popup
      rtdb
        .ref(`messages/${roomId}`)
        .limitToLast(1)
        .on("child_added", (snap) => {
          if (snap.val().s !== myUid) setHasNewAtBottom(true);
        });
    }

    setIsLoadingEarlier(true);
    try {
      const snap = await rtdb
        .ref(`messages/${roomId}`)
        .orderByChild("ts")
        .endAt(oldestLoadedTs.current - 1)
        .limitToLast(50)
        .once("value");

      const data = snap.val();
      if (data) {
        const older = (Object.values(data) as IMessage[]).sort(
          (a, b) => a.ts - b.ts,
        );
        setMessages((prev) => {
          const combined = [...older, ...prev];
          // 3. Sliding Window: Keep only the 200 most relevant for memory safety
          return combined.length > 200 ? combined.slice(-200) : combined;
        });
        oldestLoadedTs.current = older[0].ts;
        setHasMore(older.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load earlier failed", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [roomId, isLive, isLoadingEarlier, hasMore, myUid, stopMsgListener]);

  const setMyTyping = useCallback(
    (isTyping: boolean) => {
      // 1. Guard: Prevents redundant database writes if state hasn't changed
      if (isTyping === lastTypingState.current) return;

      const tRef = rtdb.ref(`typing/${roomId}/${myUid}`);
      lastTypingState.current = isTyping;

      if (isTyping) {
        // 2. Start Typing
        tRef.set(true);
        tRef.onDisconnect().remove(); // Ensures "typing" disappears if app crashes
      } else {
        // 3. Stop Typing
        tRef.remove();
        // Only clear the timeout if it exists to prevent memory leaks
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [roomId, myUid],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text?.trim();
      // Guard against missing user data or empty text
      if (!cleanText || !otherUser?.uid || !myUid) {
        console.error("SendMessage failed: Missing required context");
        return;
      }

      const ts = serverTimestamp();
      const newMsgRef = rtdb.ref(`messages/${roomId}`).push();
      const msgId = newMsgRef.key;

      const updates: any = {};
      // 1. The Message add
      updates[`messages/${roomId}/${msgId}`] = {
        id: msgId,
        s: myUid,
        t: cleanText,
        ts: ts,
        r: false,
      };

      // 2. The Inbox Update (This is what triggers background listeners!)

      //  Check if the Room already exists in the sender's inbox
      const inboxSnap = await get(ref(rtdb, `inbox/${myUid}/${roomId}`));
      const common = { lastMessage: cleanText, updatedAt: ts, roomId };

      if (!inboxSnap.exists()) {
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
        };
      } else {
        updates[`inbox/${myUid}/${roomId}/lastMessage`] = cleanText;
        updates[`inbox/${myUid}/${roomId}/updatedAt`] = ts;
        updates[`inbox/${otherUser.uid}/${roomId}/lastMessage`] = cleanText;
        updates[`inbox/${otherUser.uid}/${roomId}/updatedAt`] = ts;
      }

      return rtdb.ref().update(updates);
    },
    [roomId, myUid, sender, otherUser],
  );

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
    setMyTyping,
    sendMessage,
    resetToLive: startLiveMessages,
  };
}
