import { useState, useEffect, useCallback, useRef } from "react";
import database from "@react-native-firebase/database";
// @ts-ignore
import debounce from "lodash/debounce";

export function useTypingStatus(roomId: string, uid: string, otherUid: string) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingRef = useRef(database().ref(`/typing/${roomId}/${uid}`));

  // 🔹 1. BROADCAST: Set status to true/false in RTDB
  const setTyping = useCallback((status: boolean) => {
    if (status) {
      typingRef.current.set(true);
      typingRef.current.onDisconnect().remove(); // Safety cleanup
    } else {
      typingRef.current.remove();
    }
  }, []);

  // 🔹 2. DEBOUNCE: Stop "typing" status after 2 seconds of no activity
  const stopTypingDebounced = useCallback(
    debounce(() => setTyping(false), 2000),
    [setTyping],
  );

  // 🔹 3. LISTEN: Watch the other user's node
  useEffect(() => {
    const otherRef = database().ref(`/typing/${roomId}/${otherUid}`);
    const onValue = otherRef.on("value", (snap) =>
      setIsOtherTyping(snap.exists()),
    );

    return () => {
      otherRef.off("value", onValue);
      setTyping(false); // Cleanup when leaving chat
    };
  }, [roomId, otherUid, setTyping]);

  return { isOtherTyping, setTyping, stopTypingDebounced };
}
