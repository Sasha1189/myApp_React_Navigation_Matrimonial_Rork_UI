import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeed } from "../apis/feedApi";
import { Profile } from "../../../types/profile";

interface FetchFeedResult {
  items: Profile[];
  done?: boolean;
}

export function useFeed(uid: string, gender?: string, limit = 10, filters?: Record<string, any>) {
  const queryClient = useQueryClient();
  const filterKey = filters ? JSON.stringify(filters) : "";
  const key = ["feed", uid, gender, limit, filterKey] as const;

  const query = useInfiniteQuery<FetchFeedResult, Error>({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      console.log(
        "[useFeed] QueryFn fired → page:",
        pageParam,
        "gender:",
        gender
      );
      if (!gender) return { items: [], done: true };
      return fetchFeed(pageParam, limit, uid, gender);
    },
    getNextPageParam: (lastPage, pages) => (lastPage.done ? undefined : pages.length + 1),
    staleTime: 1000 * 60,
    initialPageParam: 1,
    enabled: !!uid && (gender === "Male" || gender === "Female"),
  });

  // Prefetch helper: if last page had items, prefetch next
  const pages = query.data?.pages;
  const lastPage = pages?.[pages.length - 1];

  React.useEffect(() => {
    console.log(
      "[useFeed] gender:",
      gender,
      "enabled:",
      !!gender,
      "status:",
      query.status
    );
    if (!gender) return;
    if (lastPage && lastPage.items.length > 0 && !query.isFetchingNextPage) {
      queryClient.prefetchInfiniteQuery({
        queryKey: key,
        queryFn: ({ pageParam = pages?.length ?? 1 }) => fetchFeed(pageParam, limit, gender),
        initialPageParam: pages?.length ?? 1,
      });
    }
  }, [lastPage, queryClient, gender, limit, query.isFetchingNextPage, pages?.length]);

  return query;
}

// Hook to manually prefetch next results (if needed)
export function usePrefetchNextFeed(gender: string, limit = 10) {
  const queryClient = useQueryClient();
  return React.useCallback(() => {
    const key = ["feed", gender, limit] as const;
    queryClient.prefetchInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam = 1 }) => fetchFeed(pageParam, limit, gender),
      initialPageParam: 1,
    });
  }, [queryClient, gender, limit]);
}