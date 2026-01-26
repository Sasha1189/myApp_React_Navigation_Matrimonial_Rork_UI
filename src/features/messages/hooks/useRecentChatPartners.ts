import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export function useRecentChatPartners(uid: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!uid) return;

    const socket = io("http://192.168.74.182:8000", {
      auth: { userId: uid },
    });
    socketRef.current = socket;

      // ✅ Initial fetch
    socket.emit("fetchRecentChatPartners");

    // ✅ Listen for server updates
    socket.on("recentChatPartners", (partners) => {
      queryClient.setQueryData(["recentChatPartners"], partners || []);
    });
    return () => {
      socket.disconnect();
    };
  }, [uid, queryClient]);

  return socketRef;
}
