import { useState, useEffect, useCallback, useRef } from "react";
import { Profile } from "@/features/profile/types/profile";
import { FeedCache } from "../cache/feedCache";
import { FeedHookResult } from "../type/type";
import {
  feedRepository,
  FETCH_PAGE_SIZE_DEFAULT,
  MAX_MEMORY_LIMIT,
} from "../services/feedRepository";

export function useDefaultFeed(uid: string, isActive: boolean): FeedHookResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [resetCount, setResetCount] = useState<number>(0);
  const mode = "default";

  const isFetchingRef = useRef<boolean>(false);
  const initialLoadedRef = useRef<boolean>(false);

  const feedKey = `${mode}-${resetCount}`;

  // 1. Initial Load anchored at cached lastCa
  const fetchInitialProfiles = useCallback(
    async (shouldRemount = false) => {
      if (!uid) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);
      isFetchingRef.current = true;

      try {
        const cachedCa = FeedCache.getLastCa(uid);

        console.log(
          `[useFeedDefault] Loading feed for ${uid} relative to cached ca:`,
          cachedCa,
        );

        const { profiles: initialData, initialIndex } =
          await feedRepository.getInitialFeed(cachedCa);

        // Update dataset and target starting index together
        setProfiles(initialData ?? []);
        setCurrentIndex(initialIndex ?? 0);
        setHasMore((initialData?.length ?? 0) > 0);

        const activeProfile = initialData?.[initialIndex];
        if (activeProfile?.ca !== undefined && activeProfile?.ca !== null) {
          FeedCache.setLastCa(uid, Number(activeProfile.ca));
        }

        initialLoadedRef.current = true;

        // Trigger remount AFTER new profiles & initialIndex are set
        if (shouldRemount) {
          setResetCount((prev) => prev + 1);
        }
      } catch (err: unknown) {
        console.error("[useFeedDefault] Failed to load initial profiles:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setProfiles([]);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [uid],
  );

  // 2. Trigger fetch when tab becomes active
  useEffect(() => {
    if (
      uid &&
      isActive &&
      !initialLoadedRef.current &&
      !isFetchingRef.current
    ) {
      fetchInitialProfiles();
    }
  }, [uid, isActive, fetchInitialProfiles]);

  // 3. Forward Pagination
  const loadMore = useCallback(async () => {
    if (
      !isActive ||
      isFetchingRef.current ||
      isLoadingMore ||
      isLoading ||
      !hasMore
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const lastProfile = profiles[profiles.length - 1];
      const lastCa = lastProfile?.ca;

      console.log(`[useFeedDefault] Triggered loadMore after ca: ${lastCa}`);
      const nextProfiles = await feedRepository.getNextFeedPage(
        lastCa,
        FETCH_PAGE_SIZE_DEFAULT,
      );

      if (!nextProfiles || nextProfiles.length === 0) {
        setHasMore(false);
      } else {
        setProfiles((prev) => [...prev, ...nextProfiles]);
        if (nextProfiles.length < FETCH_PAGE_SIZE_DEFAULT) {
          setHasMore(false);
        }
      }
    } catch (err: unknown) {
      console.error("[useFeedDefault] Error fetching next page:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isActive, profiles, isLoadingMore, isLoading, hasMore]);

  // 4. Index Update & MMKV Persistence
  const updateIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);

      const activeProfile = profiles[index];
      if (
        activeProfile?.ca !== undefined &&
        activeProfile?.ca !== null &&
        uid
      ) {
        const caValue = Number(activeProfile.ca);
        console.log(
          `[useFeedDefault] Persisting lastCa for ${uid}: ${caValue}`,
        );
        FeedCache.setLastCa(uid, caValue);
      }

      // MEMORY PURGE: Memory limit reached
      if (index >= MAX_MEMORY_LIMIT) {
        console.log(
          `[useFeedDefault] Reached memory limit (${index}). Purging stack and re-anchoring...`,
        );
        // Reset tracking ref and reload fresh batch from top (index 0)
        initialLoadedRef.current = false;
        // Fetch new profiles first, then increment resetCount to remount
        fetchInitialProfiles(true);
      }
    },
    [profiles, uid, fetchInitialProfiles],
  );

  // 5. Feed Reset
  const resetFeed = useCallback(() => {
    initialLoadedRef.current = false;

    if (uid) {
      FeedCache.clearLastCa(uid);
    }

    setCurrentIndex(0);
    // Fetch fresh stack and remount list upon resolution
    fetchInitialProfiles(true);
  }, [uid, fetchInitialProfiles]);
  console.log(
    "[useDefaultFeed] return value updated:",
    isLoading,
    "&",
    profiles?.length,
  );
  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    resetFeed,
    refetch: fetchInitialProfiles,
    isError,
    error,
    loadMore,
    mode: "default",
    feedKey,
  };
}
