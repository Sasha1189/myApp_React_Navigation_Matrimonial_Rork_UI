import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react-native";

interface ReadStatusProps {
  isRead?: boolean; // From RTDB 'r' field
  isPending?: boolean; // From TanStack Optimistic UI
}

export const ReadStatus = React.memo(
  ({ isRead, isPending }: ReadStatusProps) => {
    // 🔹 STATE 1: Message is still being sent (Offline or slow network)
    if (isPending) {
      return <Clock size={12} color="gray" />;
    }

    // 🔹 STATE 2: Message has been READ by the other user (Double Blue)
    if (isRead) {
      // 🔹 Double Tick (Blue) - Use a specific WhatsApp Blue #34B7F1
      return <CheckCheck size={14} color="#34B7F1" />;
    }

    // 🔹 STATE 3: Message is SENT but not yet read (Single/Double Gray)
    // Logic: In a basic setup, RTDB 'r: false' means it's on the server.
    return <Check size={14} color="gray" />;
  },
);
