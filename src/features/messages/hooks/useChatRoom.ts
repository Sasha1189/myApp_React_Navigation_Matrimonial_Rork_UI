import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  isSent: boolean;
  timestamp: Date;
}

export function useChatRoom(
  currentUserId: string | undefined,
  otherUserId: string
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const sortMessages = (msgs: ChatMessage[]) =>
    msgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  useEffect(() => {
    if (!currentUserId) return;

    const socket = io("http://192.168.1.104:8000", {
      auth: { userId: currentUserId },
    });
    socketRef.current = socket;

    // ✅ backend expects `otherUserId`, not roomId
    socket.emit("joinRoom", { otherUserId });

    // Initial history
    socket.on("chatHistory", (msgs) => {
      const formatted = msgs.map((m: any) => ({
        id: m._id,
        text: m.text,
        senderId: m.senderId,
        isSent: m.senderId === currentUserId,
        timestamp: new Date(m.createdAt),
      }));
      setMessages(sortMessages(formatted));
      setCursor(formatted.length > 0 ? formatted[0].id : null);
      setHasMore(formatted.length >= 20);
    });

    // New messages
    socket.on("chatMessage", (m) => {
      setMessages((prev) =>
        sortMessages([
          ...prev,
          {
            id: m._id,
            text: m.text,
            senderId: m.senderId,
            isSent: m.senderId === currentUserId,
            timestamp: new Date(m.createdAt),
          },
        ])
      );
    });

    // Pagination
    socket.on("oldMessages", ({ messages: msgs, nextCursor }) => {
      const formatted = msgs.map((m: any) => ({
        id: m._id,
        text: m.text,
        senderId: m.senderId,
        isSent: m.senderId === currentUserId,
        timestamp: new Date(m.createdAt),
      }));
      setMessages((prev) => sortMessages([...prev, ...formatted]));
      setCursor(nextCursor);
      setHasMore(!!nextCursor);
      setLoadingMore(false);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("chatMessage");
      socket.off("oldMessages");
      socket.disconnect();
    };
  }, [currentUserId, otherUserId]);

  const loadMoreMessages = useCallback(() => {
    if (!socketRef.current || loadingMore || !hasMore) return;
    setLoadingMore(true);

    // ✅ backend expects `otherUserId`
    socketRef.current.emit("fetchOldMessages", {
      otherUserId,
      cursor,
      limit: 20,
    });
  }, [otherUserId, cursor, loadingMore, hasMore]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !socketRef.current) return;

    // ✅ backend expects `sendMessage`
    socketRef.current.emit("sendMessage", {
      otherUserId,
      text,
    });
  };

  return {
    messages,
    hasMore,
    loadingMore,
    loadMoreMessages,
    sendMessage,
  };
}
