// gemini code...

import { useEffect, useState } from "react";
import {
  rtdb,
  ref,
  query,
  limitToLast,
  onChildAdded,
} from "../../../config/firebase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "../type/messages";

export function useChatRoom(roomId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const queryKey = ["chat", roomId];

  // 1. 🔹 Instant Load from MMKV (via TanStack Persistence)
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey,
    queryFn: () => [], // Logic is handled by the listener
    staleTime: Infinity,
    initialData: [],
  });

  useEffect(() => {
    if (!roomId) return;

    const chatRef = query(ref(rtdb, `messages/${roomId}`), limitToLast(50));

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const newMessage = { id: snapshot.key!, ...snapshot.val() };
      setIsLoading(false);
      const queryKey = ["chat", roomId];

      queryClient.setQueryData(queryKey, (old: Message[] = []) => {
        if (old.some((m) => m.id === newMessage.id)) return old;

        const pendingMsg = old.find(
          (m) =>
            m.pending === true &&
            m.s === newMessage.s &&
            m.t === newMessage.t &&
            Math.abs(m.ts - newMessage.ts) < 10000,
        );

        let updated;
        if (pendingMsg) {
          updated = old.map((m) => (m.id === pendingMsg.id ? newMessage : m));
        } else {
          updated = [...old, newMessage];
        }

        return updated.sort((a, b) => a.ts - b.ts).slice(-100);
      });
    });

    return () => unsubscribe();
  }, [roomId, queryClient]);

  return { messages, isLoading };
}
