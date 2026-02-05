import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMatchedFeed } from "../apis/feedApi";
import { storage } from "../../../cache/cacheConfig";
import { useState, useCallback } from "react";
import { FeedHookResult, FetchFeedResult } from "../type/type";
import { Profile } from "../../../types/profile";

export function useFeedMatches(uid: string, gender: string, preferences?: any): FeedHookResult {
  const indexKey = `index_${uid}_matches`;
  
  const query = useInfiniteQuery<FetchFeedResult, Error>({
    queryKey: ["feed", "matches", uid, JSON.stringify(preferences)], // 🔹 Key includes prefs
    queryFn: ({ pageParam }) => 
      fetchMatchedFeed({ 
        uid, 
        gender, 
        lastCreatedAt: pageParam as string,
        preferences 
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.done ? undefined : lastPage.lastCreatedAt),
    staleTime: 1000 * 60 * 60, // 🔹 1 hour (less aggressive than 'Infinity')
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  const profiles: Profile[] = query.data?.pages 
    ? query.data.pages.flatMap((page) => page.profiles) 
    : [];
  
  const [currentIndex, _setIndex] = useState(() => storage.getNumber(indexKey) || 0);

  const updateIndex = useCallback((val: number) => {
    const next = Math.max(0, val);
    _setIndex(next);
    storage.set(indexKey, next);
    
    if (profiles.length - next < 5 && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [profiles.length, query.hasNextPage, query.isFetchingNextPage, indexKey]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading: query.isLoading,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}