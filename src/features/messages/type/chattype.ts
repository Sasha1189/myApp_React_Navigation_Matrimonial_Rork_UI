import { Profile } from "../../profile/types/profile";

export interface IMessage {
  id: string; // Message ID (RTDB Key)
  s: string; // Sender UID
  t: string; // Text content
  ts: number; // Timestamp (milliseconds)
  r?: boolean; // Read status (RTDB 'r' field)
  p?: boolean; // Optimistic UI flag for pending messages
}

export interface ChatUser {
  uid: string;
  name?: string; //used for inline push
  photo?: string | null; // used for inline push
}

export interface IInboxItem {
  rId: string; // Room ID (RTDB Key)
  pt: string[]; // Array of participant UIDs
  lm: string; // Last message text
  ua: number; // Timestamp of the last message (milliseconds)
  ou: ChatUser; // The other user participant in the chat (for one-on-one chats)
  u?: Boolean; // Unread status (RTDB 'u' field)
}
