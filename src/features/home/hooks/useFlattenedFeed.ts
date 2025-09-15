import React from "react";
import { useFeed } from "./useFeed";
import { useLikesSentIdsList, useLikesReceivedIdsList } from "./useSwipeMutations";

export function useFlattenedFeed(
  uid: string,
  gender?: string,
  limit = 10,
  filters?: Record<string, any>
) {
 
  const query = useFeed(uid, gender, limit, filters);

   // Likes queries
  const likesSent = useLikesSentIdsList(uid);

  const likesReceived = useLikesReceivedIdsList(uid);

  //  console.log("🔎 feed pages:", query.data?.pages?.length);
  // console.log("🔎 likesSent data:", likesSent.data);
  // console.log("🔎 likesReceived data:", likesReceived.data);

   // Flatten + merge
  const profiles = React.useMemo(() => {

    const sentSet = new Set(likesSent.data?.likedIds ?? []);
    const receivedSet = new Set(likesReceived.data?.receivedIds ?? []);

    return (
      query.data?.pages?.flatMap((page) =>
        page.profiles.map((p) => ({
          ...p,
          liked: !!(sentSet.has(p.uid) || p.liked),
          likedMe: !!(receivedSet.has(p.uid) || p.likedMe),
        }))
      ) ?? []
    );
   
  }, [query.data, likesSent.data, likesReceived.data]);

  const lastPage =
    query.data && query.data.pages && query.data.pages.length > 0
      ? query.data.pages[query.data.pages.length - 1]
      : undefined;

  const feedDone = !!lastPage?.done;
  // console.log("🔎 merged profiles sample:", profiles[0]);
  return { ...query, profiles, lastPage, feedDone };
}
