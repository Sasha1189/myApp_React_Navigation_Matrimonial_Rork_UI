import {
  useLikesReceivedProfilesList,
  useLikesSentProfilesList,
} from "../../home/hooks/useSwipeMutations";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type RecentChatPartner } from "../type/messages";
import { Profile } from "../../../types/profile";
import { UserBannerItem } from "../type/messages";

export function useMessagesData(
  activeTab: "chats" | "sent" | "received",
  uid: string | undefined
) {

  const { data: chats = [], isLoading: chatsLoading } = useQuery<RecentChatPartner[]>({
    queryKey: ["recentChatPartners"],
    queryFn: () => [],
    initialData: [],
    enabled: false,
  });

  // 🔹 Likes
  const { data: sent = [], isLoading: sentLoading } = useLikesSentProfilesList(uid!);
  const { data: received = [], isLoading: receivedLoading } = useLikesReceivedProfilesList(uid!);

  // 🔹 Normalize for UI
  const normalized: UserBannerItem[] = useMemo(() => {
    if (activeTab === "chats") {
      return chats.map((c) => ({
        id: c.otherUser?.id ?? c.roomId, // fallback if profile missing
        name: c.otherUser?.fullName ?? "Unknown User",
        photo: c.otherUser?.photo,
        // age: c.otherUser?.age,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c.unreadCount,
      }));
    }

    const list: Profile[] = activeTab === "sent" ? sent : received;
    return list.map((p) => ({
      id: p.uid,
      name: p.fullName, // depending on profile type
      photo: p.photos?.[0].downloadURL, // first photo
    //   age: p.age,
      // no chat data for likes
      lastMessage: undefined,
      lastMessageAt: undefined,
      unreadCount: undefined,
    }));
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
