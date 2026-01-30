import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export function useRecentChatPartners(uid: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!uid) return;

     // 1. STRIP /api/v1: Get the base domain only
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "";
    const SOCKET_URL = API_URL.replace("/api/v1", "");

    const socket = io(SOCKET_URL, {
      auth: { userId: uid },
      transports: ["websocket"],
      extraHeaders: {
      "ngrok-skip-browser-warning": "true",
      },
    });

    socketRef.current = socket;

    // ✅ Listen for connection success first
    socket.on("connect", () => {
      console.log("Socket connected!");
      socket.emit("fetchRecentChatPartners");
    });

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
