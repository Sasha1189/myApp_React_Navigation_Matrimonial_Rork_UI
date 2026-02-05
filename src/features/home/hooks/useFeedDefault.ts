import { useInfiniteQuery,useQueryClient } from "@tanstack/react-query";
import { fetchDefaultFeed } from "../apis/feedApi";
import { queryClient, storage } from "../../../cache/cacheConfig";
import { useState, useCallback, useMemo } from "react";
import { FeedHookResult, FetchFeedResult } from "../type/type";

export function useFeedDefault(uid: string, gender: string): FeedHookResult {
  const indexKey = `index_${uid}_default`;
  const queryKey = ["feed", "default", uid];
  
  const query = useInfiniteQuery<FetchFeedResult, Error>({
    queryKey: ["feed", "default", uid],
    queryFn: ({ pageParam }) => 
      fetchDefaultFeed({ uid, gender, lastCreatedAt: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.done ? undefined : lastPage.lastCreatedAt),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    enabled: !!uid && !!gender,
  });

  // 🔹 Extract profiles and status
  const profiles = useMemo(() => 
    query.data?.pages.flatMap((page) => page.profiles) ?? [], 
    [query.data]
  );

  const lastPage = query.data?.pages?.[query.data.pages.length - 1];
  const feedDone = !!lastPage?.done;
  
  const [currentIndex, _setIndex] = useState(() => storage.getNumber(indexKey) || 0);

  const updateIndex = useCallback((val: number) => {
    const next = Math.max(0, val);
    _setIndex(next);
    storage.set(indexKey, next);
    // Auto-fetch logic: Fetch next page when 5 cards from the end
    if (profiles.length - next < 5 && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [profiles.length, query.hasNextPage, query.isFetchingNextPage, indexKey]);

// 🔹 Manual Reset Logic (Clears MMKV index too)
  const resetFeed = useCallback(async () => {
    storage.set(indexKey, 0); // Reset index to card 1
    _setIndex(0);
    // Optional: Pass 'true' to API if your backend needs a cursor reset
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, indexKey]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    feedDone,
    resetFeed,
// 🔹 Query status/Native TanStack flags
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}