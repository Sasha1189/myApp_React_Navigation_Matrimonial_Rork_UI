import { useEffect } from "react";
import { rtdb, ref, onValue, update } from "../../../config/firebase";

export function useReadReceipts(roomId: string, uid: string) {
  useEffect(() => {
    if (!roomId || !uid) return;

    const chatRef = ref(rtdb, `/messages/${roomId}`);

    // ✅ FIX: Modular listener returns unsubscribe callback
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const updates: Record<string, any> = {};
      let hasUpdates = false;

      snapshot.forEach((child) => {
        const msg = child.val();

        // If message is NOT mine AND is currently unread (r === false)
        if (msg.s !== uid && msg.r === false) {
          updates[`${child.key}/r`] = true;
          hasUpdates = true;
        }
        return undefined; // Continue iteration
      });

      // 🔹 Aggressive Batch Update: 1 network call for all unread messages
      if (hasUpdates) {
        update(chatRef, updates).catch((err) =>
          console.warn("Read sync failed", err),
        );
      }
    });

    return () => unsubscribe();
  }, [roomId, uid]);
}
