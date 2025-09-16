import {
  useLikesReceivedProfilesList,
  useLikesSentProfilesList,
} from "../../home/hooks/useSwipeMutations";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type RecentChatPartner } from "../type/messages";
import { Profile } from "../../../types/profile";
import { UserBannerItem } from "../type/messages";
import { formatDOB } from "../../../utils/dateUtils";

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
      return chats.map((c) => {
    // const lastMessageAt =
    //   typeof c.lastMessageAt === "string"
    //     ? new Date(c.lastMessageAt)
    //     : c.lastMessageAt.toDate?.() ?? new Date();

    return {
      id: c.otherUser?.id ?? c.roomId,
      name: c.otherUser?.name ?? "Unknown User",
      photo: c.otherUser?.photo ?? undefined, // already string | null
      age: c.otherUser?.dateOfBirth
        ? formatDOB(c.otherUser.dateOfBirth, "age")
        : undefined,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt, // lastMessageAt
      unreadCount: c.unreadCount,
    };
  });
  }
    ////....//////
    const list = activeTab === "sent" ? sent : received;

  return list.map((item) => {
  const profile = (item as any).profile ?? item; // fallback if direct profile
  return {
    id: profile.uid,
    name: profile.fullName,
    photo: profile.photos?.[0]?.downloadURL,
    age: profile.dateOfBirth ? formatDOB(profile.dateOfBirth, "age") : "18+",
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
