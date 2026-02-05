import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearchFeed } from "../apis/feedApi";
import { storage } from "../../../cache/cacheConfig";
import { useState, useCallback } from "react";
import { FeedHookResult, FetchFeedResult } from "../type/type";
import { Profile } from "../../../types/profile";

export function useFeedSearch(uid: string, gender: string, searchParams: any): FeedHookResult {
  // 🔹 Use a hash of params for the index key so different searches have different progress
  const paramsHash = JSON.stringify(searchParams);
  const indexKey = `index_${uid}_search_${paramsHash}`;
  
  const query = useInfiniteQuery<FetchFeedResult, Error>({
    queryKey: ["feed", "search", uid, paramsHash], // 🔹 Distinct Cache for this specific search
    queryFn: ({ pageParam }) => 
      fetchSearchFeed({ 
        uid, 
        gender, 
        lastCreatedAt: pageParam as string,
        searchParams 
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.done ? undefined : lastPage.lastCreatedAt),
    staleTime: 1000 * 60 * 5, // 🔹 5 mins (search results are often temporary)
    gcTime: 1000 * 60 * 60 * 24, // 1 day (prune search cache faster than main feed)
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