import { useCallback, useEffect, useState } from "react";
import {
  rtdb,
  ref,
  set,
  onValue,
  off,
  onDisconnect,
  remove,
  push,
} from "../../../config/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "../type/messages";

export function useSendMessage(roomId: string, uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const messageRef = push(ref(rtdb, `/messages/${roomId}`));
      // Use the SAME timestamp for the server write as the optimistic one
      // to make matching easier
      const ts = Date.now();
      await set(messageRef, { s: uid, t: text, ts, r: false });
      return { id: messageRef.key, s: uid, t: text, ts, r: false };
    },
    onMutate: async (text: string) => {
      const queryKey = ["chat", roomId];
      await queryClient.cancelQueries({ queryKey });

      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        s: uid,
        t: text,
        ts: Date.now(),
        pending: true,
      };

      queryClient.setQueryData(queryKey, (old: Message[] = []) => [
        ...old,
        tempMsg,
      ]);

      return { tempMsg }; // 👈 This is context for onError
    },
    onError: (err, text, context) => {
      // 🔹 Rollback: Remove the "Clock" message if it never reached the server
      queryClient.setQueryData(["chat", roomId], (old: Message[] = []) =>
        old.filter((m) => m.id !== context?.tempMsg.id),
      );
    },
  });
}

export function useTypingStatus(roomId: string, uid: string, otherUid: string) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // 1. 🔹 Broadcast my status
  const setTyping = useCallback(
    (status: boolean) => {
      const typingRef = ref(rtdb, `/typing/${roomId}/${uid}`);
      if (status) {
        set(typingRef, true);
        // Clean up if user kills app while typing
        onDisconnect(typingRef).remove();
      } else {
        remove(typingRef);
      }
    },
    [roomId, uid],
  );

  // 2. 🔹 Listen for other user
  useEffect(() => {
    if (!roomId || !otherUid) return;

    const otherRef = ref(rtdb, `/typing/${roomId}/${otherUid}`);

    // ✅ FIX: onValue returns the unsubscribe function directly
    const unsubscribe = onValue(otherRef, (snap) => {
      setIsOtherTyping(snap.exists());
    });

    return () => {
      unsubscribe(); // Stop listening
      setTyping(false); // Clear my status on exit
    };
  }, [roomId, otherUid, setTyping]);

  return { isOtherTyping, setTyping };
}
