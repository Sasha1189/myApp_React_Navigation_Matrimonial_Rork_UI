import {
  useLikesReceivedProfilesList,
  useLikesSentProfilesList,
} from "./useLikesProfileData";
import { useRecentChatPartners } from "./useRecentChatPartners";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserBannerItem } from "../type/messages";
import { formatDOB } from "../../../utils/dateUtils";

export function useMessagesData(
  activeTab: "chats" | "sent" | "received",
  uid: string | undefined,
) {
  const queryClient = useQueryClient();
  // 🔹 Chats
  const { rooms: chats, isLoading: chatsLoading } = useRecentChatPartners(uid!);

  // 🔹 Likes
  const { data: sent = [], isLoading: sentLoading } = useLikesSentProfilesList(
    uid!,
  );
  console.log("Sent Likes Data:", sent); // Debug log for sent likes data
  const { data: received = [], isLoading: receivedLoading } =
    useLikesReceivedProfilesList(uid!);

  // 🔹 Normalize for UI
  const normalized: UserBannerItem[] = useMemo(() => {
    // if (activeTab === "chats") {
    //   return chats.map((c) => {
    //     return {
    //       id: c.otherUser?.id ?? c.roomId,
    //       name: c.otherUser?.name ?? "Unknown User",
    //       photo: c.otherUser?.thumbnail, // already string | null
    //       age: c.otherUser?.dateOfBirth
    //         ? formatDOB(c.otherUser.dateOfBirth, "age")
    //         : undefined,
    //       lastMessage: c.lastMessage,
    //       lastMessageAt: c.lastMessageAt, // lastMessageAt
    //       unreadCount: c.unreadCount,
    //     };
    //   });
    // }

    if (activeTab === "chats") {
      // 'chats' here are the rooms returned by useRecentChatPartners
      return chats.map((room) => ({
        id: room.roomId,
        name: room.otherUser?.name || "User",
        photo: room.otherUser?.photo || null,
        age: undefined,
        // These are already hydrated by your useRecentChatPartners logic
        lastMessage: room.lastMessage,
        lastMessageAt: room.lastMessageAt,
        unreadCount: room.unreadCount,
        roomId: room.roomId,
        otherUser: room.otherUser,
        otherUserId: room.otherUser?.uid,
      }));
    }
    ////....//////
    const list = activeTab === "sent" ? sent : received;

    return list.map((item) => {
      const profile = (item as any).profile ?? item; // fallback if direct profile
      return {
        id: profile.uid,
        name: profile.fullName,
        photo: profile.thumbnail,
        age: profile.dateOfBirth
          ? formatDOB(profile.dateOfBirth, "age")
          : "18+",
        lastMessage: undefined,
        lastMessageAt: undefined,
        unreadCount: undefined,
        profile, // pass full profile for details screen
      };
    });
  }, [activeTab, chats, sent, received]);

  // 🔹 Select loading state
  const loading =
    activeTab === "chats"
      ? chatsLoading
      : activeTab === "sent"
        ? sentLoading && !sent.length
        : receivedLoading && !received.length;

  return { data: normalized, loading };
}
