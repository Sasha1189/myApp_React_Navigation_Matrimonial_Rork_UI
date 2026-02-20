import { useEffect, useState, useRef, useCallback } from "react";
import { rtdb, get, ref, serverTimestamp } from "../../../config/firebase";
import { IMessage } from "../type/chattype";

export function useChatSession(
  roomId: string,
  myUid: string,
  sender: any,
  otherUser: any,
) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherStatus, setOtherStatus] = useState<any>(null);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastTypingState = useRef(false);
  const oldestLoadedTs = useRef<number | null>(null);

  useEffect(() => {
    if (!roomId || !myUid || !otherUser.uid) return;

    // --- References ---
    const msgRef = rtdb.ref(`messages/${roomId}`).limitToLast(50);
    const otherStatusRef = rtdb.ref(`status/${otherUser.uid}`);
    const otherTypingRef = rtdb.ref(`typing/${roomId}/${otherUser.uid}`);
    const myStatusRef = rtdb.ref(`status/${myUid}`);
    const connectionRef = rtdb.ref(".info/connected");

    // --- 1. Real-time Messages ---
    const onMsg = msgRef.on("value", (snap) => {
      const data = snap.val() || {};
      const list = (Object.values(data) as IMessage[]).sort(
        (a, b) => a.ts - b.ts,
      );
      setMessages(list);
      if (list.length > 0) {
        oldestLoadedTs.current = list[0].ts; // 🔹 Sync the ref
      }
      setIsLoading(false);
    });

    // --- 2. Presence Logic (Self & Other) ---
    const onConnect = connectionRef.on("value", (snap) => {
      if (snap.val() === false) return;
      const ts = serverTimestamp();
      myStatusRef
        .onDisconnect()
        .set({
          state: "offline",
          lastChanged: ts,
        })
        .then(() => {
          myStatusRef.set({
            state: "online",
            lastChanged: ts,
          });
        });
    });

    const onStatus = otherStatusRef.on("value", (snap) =>
      setOtherStatus(snap.val()),
    );
    const onTyping = otherTypingRef.on("value", (snap) =>
      setIsOtherTyping(!!snap.val()),
    );

    // --- 3. Read Receipt Logic ---
    const markAsRead = async () => {
      const lastMsgRef = rtdb.ref(`messages/${roomId}`).limitToLast(1);
      const snap = await lastMsgRef.once("value");
      const data = snap.val();
      if (data) {
        const msgKey = Object.keys(data)[0];
        const msg = data[msgKey];
        if (msg.s !== myUid && !msg.r) {
          rtdb.ref(`messages/${roomId}/${msgKey}/r`).set(true);
        }
      }
    };
    markAsRead();

    return () => {
      msgRef.off("value", onMsg);
      connectionRef.off("value", onConnect);
      otherStatusRef.off("value", onStatus);
      otherTypingRef.off("value", onTyping);
    };
  }, [roomId, myUid, otherUser.uid]);

  // 2. Pagination Function (Fetch Older):
  const loadEarlier = useCallback(async () => {
    if (!oldestLoadedTs.current || isLoadingEarlier || !hasMore) return;

    setIsLoadingEarlier(true);
    try {
      const snapshot = await rtdb
        .ref(`messages/${roomId}`)
        .orderByChild("ts")
        .endAt(oldestLoadedTs.current - 1)
        .limitToLast(50)
        .once("value");

      const data = snapshot.val();
      if (data) {
        const olderMessages = (Object.values(data) as IMessage[]).sort(
          (a, b) => a.ts - b.ts,
        );

        if (olderMessages.length > 0) {
          oldestLoadedTs.current = olderMessages[0].ts; // 🔹 Update Ref to new oldest
          setMessages((prev) => [...olderMessages, ...prev]);
        }

        if (olderMessages.length < 50) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load earlier failed", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [roomId, isLoadingEarlier, hasMore]);

  const setMyTyping = useCallback(
    (isTyping: boolean) => {
      if (isTyping === lastTypingState.current) return;
      lastTypingState.current = isTyping;
      const ref = rtdb.ref(`typing/${roomId}/${myUid}`);
      isTyping ? (ref.set(true), ref.onDisconnect().remove()) : ref.remove();
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
      const targetUid = otherUser?.uid || otherUser?.id;
      if (!targetUid) {
        console.error("CRITICAL: No target UID found for message");
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

      // 1. Check if the Room already exists in the sender's inbox
      const inboxSnap = await get(ref(rtdb, `inbox/${sender.uid}/${roomId}`));

      if (!inboxSnap.exists()) {
        const otherUserInboxMetadata = {
          roomId: roomId,
          lastMessage: text.trim(),
          updatedAt: ts,
          otherUser: {
            uid: otherUser.uid,
            name: otherUser.name || otherUser.fullName || "User",
            photo: otherUser.photo || "",
          },
        };
        const senderInboxMetadata = {
          roomId: roomId,
          lastMessage: text.trim(),
          updatedAt: ts,
          otherUser: {
            uid: myUid,
            name: sender.name || "User",
            photo: sender.photo || "",
          },
        };
        //store to sender inbox room
        updates[`inbox/${myUid}/${roomId}`] = otherUserInboxMetadata;
        //store to otherUsers inbox room
        updates[`inbox/${otherUser.uid}/${roomId}`] = senderInboxMetadata;
      } else {
        // If it exists, we only update the lastMessage and updatedAt for both users
        updates[`inbox/${myUid}/${roomId}/lastMessage`] = cleanText;
        updates[`inbox/${myUid}/${roomId}/updatedAt`] = ts;
        updates[`inbox/${otherUser.uid}/${roomId}/lastMessage`] = cleanText;
        updates[`inbox/${otherUser.uid}/${roomId}/updatedAt`] = ts;
      }

      try {
        await rtdb.ref().update(updates);
      } catch (error) {
        console.error("Firebase Update Failed:", error);
      }
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
    loadEarlier,
    setMyTyping,
    sendMessage,
  };
}
