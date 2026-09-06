import { useState, useCallback, useEffect, useRef } from "react";
import { Profile } from "@/features/profile/types/profile";
import { FeedHookResult } from "../type/type";
import {
  feedRepository,
  FETCH_PAGE_SIZE_SEARCH,
  MAX_MEMORY_LIMIT,
} from "../services/feedRepository";

export function useSearchFeed(
  uid: string,
  isActive: boolean,
  query: string,
): FeedHookResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [resetCount, setResetCount] = useState<number>(0);
  const mode = "search";

  const isFetchingRef = useRef<boolean>(false);
  const initialLoadedRef = useRef<boolean>(false);

  const feedKey = `${mode}-${resetCount}`;

  // 1. Initial Search Execution
  const performSearch = useCallback(
    async (shouldRemount = false) => {
      const cleanQuery = query?.trim();

      if (!isActive || !cleanQuery) {
        setProfiles([]);
        setCurrentIndex(0);
        setHasMore(false);
        setIsError(false);
        setError(null);
        return;
      }

      if (isFetchingRef.current) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);
      isFetchingRef.current = true;

      try {
        const parsed = await feedRepository.searchProfiles(
          cleanQuery,
          FETCH_PAGE_SIZE_SEARCH,
          0,
        );

        setProfiles(parsed ?? []);
        setCurrentIndex(0);
        setHasMore(parsed.length === FETCH_PAGE_SIZE_SEARCH);

        initialLoadedRef.current = true;

        // Trigger remount AFTER new profiles & initialIndex are set
        if (shouldRemount) {
          setResetCount((prev) => prev + 1);
        }
      } catch (err: unknown) {
        console.error("❌ [useFeedSearch] Search Error:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setProfiles([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isActive, query],
  );

  // 2. Trigger search when query or active status changes
  useEffect(() => {
    if (
      uid &&
      isActive &&
      !initialLoadedRef.current &&
      !isFetchingRef.current
    ) {
      performSearch();
    }
  }, [uid, isActive, performSearch]);

  // 3. Load More (Append next search batch)
  const loadMore = useCallback(async () => {
    const cleanQuery = query?.trim();

    if (
      !isActive ||
      !cleanQuery ||
      isFetchingRef.current ||
      isLoading ||
      isLoadingMore ||
      !hasMore ||
      profiles.length === 0
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextOffset = profiles.length;
      const parsed = await feedRepository.searchProfiles(
        cleanQuery,
        FETCH_PAGE_SIZE_SEARCH,
        nextOffset,
      );

      if (!parsed || parsed.length === 0) {
        setHasMore(false);
      } else {
        setProfiles((prev) => [...prev, ...parsed]);
        if (parsed.length < FETCH_PAGE_SIZE_SEARCH) {
          setHasMore(false);
        }
      }
    } catch (err: unknown) {
      console.error("❌ [useFeedSearch] LoadMore Error:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isActive, query, isLoading, isLoadingMore, hasMore, profiles.length]);

  // 4. Index Update & Memory Purge
  const updateIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);

      // MEMORY PURGE: Check if memory limit is reached
      if (index >= MAX_MEMORY_LIMIT) {
        // Reset tracking ref and reload fresh batch from top (index 0)
        initialLoadedRef.current = false;

        performSearch(true);
      }
    },
    [profiles, uid, performSearch],
  );

  // 5. Feed Reset
  const resetFeed = useCallback(() => {
    initialLoadedRef.current = false;

    setCurrentIndex(0);

    performSearch(true);
  }, [uid, performSearch]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    resetFeed,
    refetch: performSearch,
    isError,
    error,
    loadMore,
    mode: "search",
    feedKey,
  };
}
