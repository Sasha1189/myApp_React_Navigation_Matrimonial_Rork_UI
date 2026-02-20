import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { rtdb } from "src/config/firebase";
import { IInboxItem } from "../type/chattype";

export const useMessageInbox = (uid: string) => {
  const [banners, setBanners] = useState<IInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;

      setIsLoading(true);

      // 1. Setup Query: Latest 20 items ordered by timestamp
      const inboxQuery = rtdb
        .ref(`inbox/${uid}`)
        .orderByChild("updatedAt")
        .limitToLast(20);

      // 2. Start Real-Time Listener
      const onValueChange = inboxQuery.on(
        "value",
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Convert object to array
            const list: IInboxItem[] = Object.values(data);
            // Sort Descending (Newest at top)
            setBanners(list.sort((a, b) => b.updatedAt - a.updatedAt));
          } else {
            setBanners([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("RTDB Listener Error:", error);
          setIsLoading(false);
        },
      );

      // 3. CRITICAL: Stop listening when user leaves the screen
      // This saves battery and bandwidth ($$$)
      return () => inboxQuery.off("value", onValueChange);
    }, [uid]),
  );

  return { banners, isLoading };
};
//......pagination and pull to refresh logic can be added later if needed
// import { useState, useCallback, useRef } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { rtdb } from "src/config/firebase";
// import { IInboxItem } from "../type/chattype";

// const PAGE_SIZE = 20;

// export const useMessageInbox = (uid: string) => {
//   const [banners, setBanners] = useState<IInboxItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   // Keep track of the oldest timestamp we have for pagination
//   const oldestTimestampRef = useRef<number | null>(null);

//   useFocusEffect(
//     useCallback(() => {
//       if (!uid) return;
//       setIsLoading(true);

//       // 1. REAL-TIME LISTENER (Top 20)
//       const topQuery = rtdb
//         .ref(`inbox/${uid}`)
//         .orderByChild("updatedAt")
//         .limitToLast(PAGE_SIZE);

//       const onValue = topQuery.on("value", (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           const list: IInboxItem[] = Object.values(data);
//           const sorted = list.sort((a, b) => b.updatedAt - a.updatedAt);

//           setBanners((prev) => {
//             // Merge real-time top 20 with existing paginated data
//             const existingExtra = prev.slice(PAGE_SIZE);
//             return [...sorted, ...existingExtra];
//           });

//           // Update the "anchor" for pagination (the 20th item)
//           oldestTimestampRef.current = sorted[sorted.length - 1].updatedAt;
//         } else {
//           setBanners([]);
//         }
//         setIsLoading(false);
//       });

//       // Cleanup listener on unfocus
//       return () => topQuery.off("value", onValue);
//     }, [uid]),
//   );

//   // 2. LOAD MORE (One-time fetch for older items)
//   const loadMore = useCallback(async () => {
//     if (isFetchingMore || !hasMore || !oldestTimestampRef.current) return;

//     setIsFetchingMore(true);
//     try {
//       const nextQuery = rtdb
//         .ref(`inbox/${uid}`)
//         .orderByChild("updatedAt")
//         .endAt(oldestTimestampRef.current - 1)
//         .limitToLast(PAGE_SIZE);

//       const snapshot = await nextQuery.get();
//       const data = snapshot.val();

//       if (data) {
//         const nextBatch: IInboxItem[] = Object.values(data);
//         const sortedBatch = nextBatch.sort((a, b) => b.updatedAt - a.updatedAt);

//         setBanners((prev) => [...prev, ...sortedBatch]);
//         oldestTimestampRef.current =
//           sortedBatch[sortedBatch.length - 1].updatedAt;
//         setHasMore(nextBatch.length === PAGE_SIZE);
//       } else {
//         setHasMore(false);
//       }
//     } catch (e) {
//       console.error("Pagination error", e);
//     } finally {
//       setIsFetchingMore(false);
//     }
//   }, [uid, isFetchingMore, hasMore]);

//   return { banners, isLoading, isFetchingMore, loadMore };
// };
// setBanners((prev) => {
//   const incoming = Object.values(data).sort(
//     (a, b) => b.updatedAt - a.updatedAt,
//   );

//   // Combine incoming with existing, but filter out any IDs that are now in the Top 20
//   const topIds = new Set(incoming.map((i) => i.roomId));
//   const remaining = prev.filter((item) => !topIds.has(item.roomId));

//   return [...incoming, ...remaining.slice(0, 80)]; // Keep total list manageable
// });
