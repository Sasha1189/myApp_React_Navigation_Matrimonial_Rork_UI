import { Profile } from "../../../types/profile";

export interface ChatUser {
  uid: string;
  name: string;
  photo: string;
}

export interface IMessage {
  id: string; // Message ID (RTDB Key)
  s: string; // Sender UID
  t: string; // Text content
  ts: number; // Timestamp (milliseconds)
  r?: boolean; // Read status (RTDB 'r' field)
  pending?: boolean; // Optimistic UI flag for pending messages
}

export interface IInboxItem {
  roomId: string;
  participants: string[];
  lastMessage: string;
  updatedAt: number;
  otherUser: ChatUser;
  unreadCount: number;
}

export interface ChatRouteProp {
  params: {
    roomId: string;
    uid: string;
    otherUser: {
      uid: string;
      name: string;
      photo?: string;
    };
  };
}

export interface UserBannerItem {
  id: string; // roomId for chats, uid for likes
  name: string;
  photo?: string | null;
  age?: string;
  profile?: Profile;
}
