import { useMemo, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import database from "@react-native-firebase/database";
import { fetchRecentChatRooms } from "../apis/chatApi";
import { Message, RecentChatPartner } from "../type/messages";

const calculateUnread = (messages: Message[] | undefined, myUid: string) => {
  if (!messages) return 0;
  return messages.filter((m) => m.s !== myUid && m.r === false).length;
};
export function useRecentChatPartners(uid: string) {
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery<RecentChatPartner[]>({
    queryKey: ["rooms", uid],
    queryFn: () => fetchRecentChatRooms(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!uid || rooms.length === 0) return;

    const cleanups = rooms.map((room) => {
      const chatRef = database()
        .ref(`/messages/${room.roomId}`)
        .orderByChild("ts")
        .limitToLast(1);

      const onValue = chatRef.on("child_added", (snapshot) => {
        const newMessage = { id: snapshot.key, ...snapshot.val() };
        const queryKey = ["chat", room.roomId];

        queryClient.setQueryData(queryKey, (old: Message[] = []) => {
          if (old.find((m) => m.id === newMessage.id)) return old;
          return [...old, newMessage].sort((a, b) => a.ts - b.ts);
        });
      });
      return { ref: chatRef, onValue };
    });

    return () =>
      cleanups.forEach(({ ref, onValue }) => ref.off("child_added", onValue));
  }, [rooms, queryClient, uid]);

  const hydratedRooms = useMemo((): RecentChatPartner[] => {
    return rooms.map((room) => {
      const chatCache = queryClient.getQueryData<Message[]>([
        "chat",
        room.roomId,
      ]);
      const lastMsg = chatCache?.length
        ? chatCache[chatCache.length - 1]
        : null;

      const otherUserUid =
        Object.keys(room.users || {}).find((id) => id !== uid) || "";
      const otherUserData: { name: string; photo: string | null } = room
        .users?.[otherUserUid] || { name: "User", photo: null };

      return {
        ...room,
        otherUser: {
          uid: otherUserUid,
          name: otherUserData.name || "User",
          photo: otherUserData.photo || null,
        },
        // 🔹 Ensure we return number or string as per interface
        lastMessage: lastMsg?.t || room.lastMessage || "",
        lastMessageAt:
          lastMsg?.ts ||
          (room.updatedAt?.toMillis
            ? room.updatedAt.toMillis()
            : room.updatedAt),
        unreadCount: calculateUnread(chatCache, uid),
      };
    });
  }, [rooms, queryClient, uid]);

  return { rooms: hydratedRooms, isLoading };
}
