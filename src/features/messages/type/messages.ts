import { AppStackParamList, TabParamList } from "../../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { Profile } from "../../../types/profile";

export interface MessagesScreenNavigationProp extends CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Messages">,
  NativeStackNavigationProp<AppStackParamList>
> {}

/**
 * 🔹 RTDB Message (Ultra-Lean for Bandwidth Savings)
 * used inside ChatScreen and MMKV Message Shards
 */
export interface Message {
  id: string; // RTDB Push Key
  s: string; // senderId
  t: string; // text
  ts: number; // timestamp
  r?: boolean; // read (true/false)
  pending?: boolean; // Optimistic UI flag
}

export interface ChatPartnerProfile {
  uid: string; // 👈 Always use 'uid' for User IDs
  name: string; // 👈 Always use 'name' for Display Names
  photo: string | null; // 👈 Always use 'photo' for Images
  dateOfBirth?: string;
}

export interface RecentChatPartner {
  roomId: string;
  participants: string[];
  updatedAt: any;
  lastMessage?: string;
  lastMessageAt?: number | string;
  unreadCount?: number;
  otherUser?: ChatPartnerProfile; // 👈 Uses the clean interface above
  // Matches Firestore document structure
  users?: Record<string, { name: string; photo: string | null }>;
}

/**
 * 🔹 UI Display Item (Normalized)
 * The unified shape for the 'UserBanner' component across all tabs
 */
// export interface UserBannerItem {
//   id: string; // roomId (for chats) or uid (for likes)
//   name: string;
//   photo?: string | null;
//   age?: string;
//   lastMessage?: string;
//   lastMessageAt?: number | string | Date;
//   unreadCount?: number;
//   profile?: Profile; // Attached for Likes tabs
// }
export interface UserBannerItem {
  id: string;
  name: string;
  photo?: string | null;
  age?: string;
  lastMessage?: string;
  lastMessageAt?: number | string | Date;
  unreadCount?: number;
  profile?: Profile;
  // 🔹 ADD THIS: To store the recipient's UID for navigation
  otherUserId?: string;
}

/**
 * 🔹 Legacy/Alternative Chat Room interface
 * (Keep if used in specific Navigation params)
 */
export interface ChatRoom {
  roomId: string;
  otherUser: {
    uid: string;
    fullName: string;
    thumbnail: string | null;
  };
}
