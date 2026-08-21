import { useState, useCallback, useEffect, useRef } from "react";
import {
  feedRepository,
  FETCH_PAGE_SIZE_LATEST,
  MAX_MEMORY_LIMIT,
} from "../apis/feedRepository";
import { Profile } from "@/types/profile";
import { FeedHookResult } from "../type/type";

export function useFeedLatest(uid: string, isActive: boolean): FeedHookResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [resetCount, setResetCount] = useState<number>(0);
  const mode = "latest";

  const isFetchingRef = useRef<boolean>(false);
  const initialLoadedRef = useRef<boolean>(false);

  const feedKey = `${mode}-${resetCount}`;

  // Keep profilesRef updated at top-level hook
  const profilesRef = useRef<Profile[]>(profiles);
  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  // 1. Initial Load (Always starts from scratch at index 0)
  const fetchLatestProfiles = useCallback(
    async (shouldRemount = false) => {
      if (!uid || isFetchingRef.current) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);
      isFetchingRef.current = true;

      try {
        console.log(`[useFeedLatest] Loading fresh latest feed for ${uid}...`);

        const initialData = await feedRepository.getLatestProfiles(
          FETCH_PAGE_SIZE_LATEST,
        );

        setProfiles(initialData);
        setCurrentIndex(0); // Always reset index to 0 on revisit / initial load
        setHasMore(initialData.length === FETCH_PAGE_SIZE_LATEST);

        initialLoadedRef.current = true;
        if (shouldRemount) {
          setResetCount((prev) => prev + 1);
        }
      } catch (err: unknown) {
        console.error(
          "❌ [useFeedLatest] Failed to load latest profiles:",
          err,
        );
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

  // 2. Trigger initial fetch when tab/hook becomes active
  useEffect(() => {
    if (uid && isActive && !initialLoadedRef.current) {
      fetchLatestProfiles();
    } else if (!isActive) {
      // Reset ref when user leaves tab so next visit triggers a fresh index 0 load
      initialLoadedRef.current = false;
    }
  }, [uid, isActive, fetchLatestProfiles]);

  // 3. Forward Pagination
  const loadMore = useCallback(async () => {
    if (
      !isActive ||
      isFetchingRef.current ||
      isLoadingMore ||
      isLoading ||
      !hasMore ||
      profiles.length === 0
    ) {
      return;
    }

    const lastProfile = profiles[profiles.length - 1];
    const lastUa = Number(lastProfile?.ua);

    if (isNaN(lastUa)) return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      console.log(`[useFeedLatest] Fetching next batch after ua: ${lastUa}`);
      const nextProfiles = await feedRepository.getMoreLatestProfiles(
        lastUa,
        FETCH_PAGE_SIZE_LATEST,
      );

      if (!nextProfiles || nextProfiles.length === 0) {
        setHasMore(false);
      } else {
        setProfiles((prev) => [...prev, ...nextProfiles]);
        if (nextProfiles.length < FETCH_PAGE_SIZE_LATEST) {
          setHasMore(false);
        }
      }
    } catch (err: unknown) {
      console.error("❌ [useFeedLatest] LoadMore Error:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isActive, profiles, isLoadingMore, isLoading, hasMore]);

  // 4. Index Update & Memory Purge
  const updateIndex = useCallback(
    async (index: number) => {
      setCurrentIndex(index);

      // MEMORY PURGE: Check if memory limit is reached
      if (index >= MAX_MEMORY_LIMIT) {
        console.log(
          `[useFeedLatest] Reached memory limit (${index}). Purging stack and reloading latest...`,
        );

        const currentProfiles = profilesRef.current;
        const currentProfile = currentProfiles[index];
        const lastUa = Number(currentProfile?.ua);

        if (isNaN(lastUa) || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        try {
          // 1. MUST await async API call
          const nextProfiles = await feedRepository.getMoreLatestProfiles(
            lastUa,
            FETCH_PAGE_SIZE_LATEST,
          );

          // Prepend current profile so card 8 becomes index 0 of the new stack
          const prunedStack = [currentProfile, ...(nextProfiles ?? [])];

          setProfiles(prunedStack);
          setCurrentIndex(0); // Index 0 is now card 8
          setHasMore((nextProfiles?.length ?? 0) >= FETCH_PAGE_SIZE_LATEST);

          initialLoadedRef.current = true;

          setResetCount((prev) => prev + 1);
        } catch (err: unknown) {
          console.error("❌ [useFeedLatest] purge Error:", err);
        } finally {
          isFetchingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [], // Safe with profilesRef & isFetchingRef
  );

  // 5. Feed Reset (Manual refresh trigger)
  const resetFeed = useCallback(() => {
    initialLoadedRef.current = false;
    setCurrentIndex(0);
    fetchLatestProfiles(true);
  }, [fetchLatestProfiles]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    resetFeed,
    refetch: fetchLatestProfiles,
    isError,
    error,
    loadMore,
    mode: "latest",
    feedKey,
  };
}
