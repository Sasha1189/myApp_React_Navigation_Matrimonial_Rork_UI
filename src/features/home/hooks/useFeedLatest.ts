import { useState,useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchLatestFeed } from "../apis/feedApi";
import { storage } from "../../../cache/cacheConfig";
import { FeedHookResult, FetchFeedResult } from "../type/type";
import { Profile } from "src/types/profile";

export function useFeedLatest(uid: string, gender: string): FeedHookResult {
  const indexKey = `index_${uid}_latest`;
  
  const query = useInfiniteQuery<FetchFeedResult, Error>({
    queryKey: ["feed", "latest", uid],
    queryFn: ({ pageParam }) => fetchLatestFeed({ uid, gender, lastCreatedAt: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.done ? undefined : lastPage.lastCreatedAt),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7 ,
  });

  const profiles: Profile[] = query.data?.pages 
    ? query.data.pages.flatMap((page) => page.profiles) 
    : [];
  
  // Local state synced with MMKV
  const [currentIndex, _setIndex] = useState(() => storage.getNumber(indexKey) || 0);

   // 🔹 Use useCallback to prevent unnecessary re-renders in HomeScreen
  const updateIndex = useCallback((val: number) => {
    const next = Math.max(0, val);
    _setIndex(next);
    storage.set(indexKey, next);
    
    // Auto-fetch logic
    if (profiles.length - next < 5 && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [profiles.length, query.hasNextPage, query.isFetchingNextPage, indexKey]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}