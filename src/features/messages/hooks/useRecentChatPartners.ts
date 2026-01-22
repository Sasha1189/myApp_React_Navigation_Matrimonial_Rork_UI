import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export function useRecentChatPartners(uid: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!uid) return;

    const socket = io("http://192.168.237.176:8000", {
      auth: { userId: uid }, // 👈 backend reads this as currentUserId
    });
    socketRef.current = socket;

      // ✅ Initial fetch
    socket.emit("fetchRecentChatPartners"); // 👈 keep name aligned with backend
    console.log("🔌 fetchRecentPartners emitted for uid:", uid);

    // ✅ Listen for server updates
    socket.on("recentChatPartners", (partners) => {
      console.log("📨 recentChatPartners from server:", partners);
      queryClient.setQueryData(["recentChatPartners"], partners || []);
    });
    return () => {
      socket.disconnect();
    };
  }, [uid, queryClient]);

  return socketRef;
}
