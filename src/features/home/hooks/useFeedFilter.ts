import { useState, useEffect, useCallback, useRef } from "react";
import { Profile } from "@/types/profile";
import { FeedHookResult } from "../type/type";
import {
  feedRepository,
  FETCH_PAGE_SIZE_FILTER,
  MAX_MEMORY_LIMIT,
} from "../apis/feedRepository";

export function useFeedFilter(
  uid: string,
  isActive: boolean,
  filters: any,
): FeedHookResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [resetCount, setResetCount] = useState<number>(0);
  const mode = "filter";

  const isFetchingRef = useRef<boolean>(false);
  const initialLoadedRef = useRef<boolean>(false);

  const feedKey = `${mode}-${resetCount}`;

  // 1. Initial Load / Filter Execution
  const performFilter = useCallback(
    async (shouldRemount = false) => {
      if (!isActive || !filters) {
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
        console.log(`[useFeedFilter] Executing filtered profile fetch...`);
        const parsed = await feedRepository.getFilteredProfiles(
          filters,
          FETCH_PAGE_SIZE_FILTER,
          0,
        );

        setProfiles(parsed || []);
        setCurrentIndex(0);
        setHasMore((parsed || []).length === FETCH_PAGE_SIZE_FILTER);

        initialLoadedRef.current = true;

        // Trigger remount AFTER new profiles & initialIndex are set
        if (shouldRemount) {
          setResetCount((prev) => prev + 1);
        }
      } catch (err: unknown) {
        console.error("❌ [useFeedFilter] Filter Error:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setProfiles([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isActive, filters],
  );

  // 2. Trigger filter when uid, active status, or filters change
  useEffect(() => {
    if (
      uid &&
      isActive &&
      !initialLoadedRef.current &&
      !isFetchingRef.current
    ) {
      performFilter();
    }
  }, [uid, isActive, filters, performFilter]);

  // 3. Load More (Append next batch)
  const loadMore = useCallback(async () => {
    if (
      !isActive ||
      !filters ||
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
      console.log(
        `[useFeedFilter] Fetching next filtered page (offset: ${nextOffset}, limit: ${FETCH_PAGE_SIZE_FILTER})...`,
      );

      const parsed = await feedRepository.getFilteredProfiles(
        filters,
        FETCH_PAGE_SIZE_FILTER,
        nextOffset,
      );

      if (!parsed || parsed.length === 0) {
        setHasMore(false);
      } else {
        setProfiles((prev) => [...prev, ...parsed]);
        if (parsed.length < FETCH_PAGE_SIZE_FILTER) {
          setHasMore(false);
        }
      }
    } catch (err: unknown) {
      console.error("❌ [useFeedFilter] LoadMore Error:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isActive, filters, isLoading, isLoadingMore, hasMore, profiles.length]);

  // 4. Index Update & Memory Purge
  const updateIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);

      // MEMORY PURGE: Check if memory limit is reached
      if (index >= MAX_MEMORY_LIMIT) {
        console.log(
          `[useFeedFilter] Reached memory limit (${index}). Purging stack and re-executing filter...`,
        );

        // Reset tracking ref and reload fresh batch from top (index 0)
        initialLoadedRef.current = false;

        performFilter(true);
      }
    },
    [profiles, uid, performFilter],
  );

  // 5. Feed Reset
  const resetFeed = useCallback(() => {
    initialLoadedRef.current = false;

    setCurrentIndex(0);

    performFilter(true);
  }, [uid, performFilter]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    resetFeed,
    refetch: performFilter,
    isError,
    error,
    loadMore,
    mode: "filter",
    feedKey,
  };
}
