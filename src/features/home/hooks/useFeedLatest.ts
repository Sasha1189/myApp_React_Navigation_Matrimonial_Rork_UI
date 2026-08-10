import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { FeedSyncService } from "../apis/feedApi";

export function useFeedLatest(uid: string, isActive: boolean) {
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    const g = user?.displayName?.toLowerCase().trim();
    return g === "male" || g === "female";
  });
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  /**
   * Reads raw records directly out of the MMKV layer,
   * sorts them descending by creation date, and clips to a limit of 50.
   */
  const loadLatestProfiles = useCallback(() => {
    const rawGender = user?.displayName || "";
    const gender = rawGender.toLowerCase().trim();

    if (gender !== "male" && gender !== "female") {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch current runtime dictionary from memory layer
      const records = FeedSyncService.getCachedProfiles();

      // 2. Map, sort by createdAt descending, and slice to match old limit(50)
      const data = Object.values(records)
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Emulates orderBy("createdAt", "desc")
        })
        .slice(0, 50); // Emulates limit(50)

      setProfiles(data || []);
    } catch (e: any) {
      setError(e);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.displayName]);

  // Handle initialization and focus/active states
  useEffect(() => {
    if (uid && isActive) {
      loadLatestProfiles();
    } else {
      setIsLoading(false);
    }
  }, [uid, isActive, loadLatestProfiles]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length || 0));
      _setIndex(next);
    },
    [profiles.length],
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const success = await FeedSyncService.syncFeeds(user?.displayName || "");
    if (success) {
      loadLatestProfiles();
    }
    setIsLoading(false);
  }, [user?.displayName, loadLatestProfiles]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: loadLatestProfiles,
    refetch,
  };
}
