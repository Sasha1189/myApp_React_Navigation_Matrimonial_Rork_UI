import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeed } from "../apis/feedApi";
import { Profile } from "../../../types/profile";

interface FetchFeedResult {
  profiles: any[];
  lastCursor?: {lastCreatedAt: string, lastId: string};
  done?: boolean;
}

export function useFeed(
  uid: string,
  gender?: string,
  limit = 10,
  filters?: Record<string, any>
) {
  const queryClient = useQueryClient();

  const filterKey = filters ? JSON.stringify(filters) : "";

  const key = ["feed", uid, gender, limit, filterKey] as const;

  const query = useInfiniteQuery<FetchFeedResult, Error>({

    queryKey: key,

    queryFn: ({ pageParam = 1 }) => {

      const page = pageParam as number;

      if (!uid || !gender) return { profiles: [], done: true };

      return fetchFeed(page, limit, uid, gender, filters);
    },

    // 3) Tell React Query how to find the "next pageParam"
    //    If backend says done === true, we stop.
    getNextPageParam: (lastPage, pages) =>
      lastPage.done ? undefined : pages.length + 1,

    staleTime: 1000 * 60,

    initialPageParam: 1,

    enabled: !!uid && (gender === "Male" || gender === "Female"),
  });

   // ✅ Manual reset function
  const resetFeed = async () => {
    // tell backend to reset Firestore cursor
    if (!uid || !gender) return;
    await fetchFeed(1, limit, uid, gender, filters, true); // pass reset=true
    // clear local cache so query restarts
    queryClient.resetQueries({ queryKey: key });
  };

  // Optional: prefetch the *next* page when the last page has results and isn't done.
  const pages = query.data?.pages;
  const lastPage = pages?.[pages.length - 1];

  React.useEffect(() => {
    if (!uid || !gender) return;

    if (lastPage && lastPage.profiles.length > 0 && !lastPage.done && !query.isFetchingNextPage && gender !== undefined) {

      queryClient.prefetchInfiniteQuery({

        queryKey: key,

        queryFn: ({ pageParam = pages?.length ?? 1 }) => fetchFeed(pageParam, limit, uid, gender, filters),

        initialPageParam: pages?.length ?? 1,
      });
    }
  }, [lastPage, queryClient, uid, gender, limit, query.isFetchingNextPage, pages?.length]);

  return {...query, resetFeed};
}

// Hook to manually prefetch next results (if needed)
// export function usePrefetchNextFeed(gender: string, limit = 10) {
//   const queryClient = useQueryClient();
//   return React.useCallback(() => {
//     const key = ["feed", gender, limit] as const;
//     queryClient.prefetchInfiniteQuery({
//       queryKey: key,
//       queryFn: ({ pageParam = 1 }) => fetchFeed(pageParam, limit, gender),
//       initialPageParam: 1,
//     });
//   }, [queryClient, gender, limit]);
// }