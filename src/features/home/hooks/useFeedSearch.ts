import { useState, useCallback, useEffect } from "react";
import { storage } from "../../../cache/cacheConfig";
import { useAuth } from "../../../context/AuthContext";
import { FeedSyncService } from "../apis/feedApi";

export function useFeedSearch(
  uid: string,
  isActive: boolean,
  field: string,
  query: string,
) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  /**
   * Performs an instant string prefix query over the profiles
   * held directly inside your high-performance MMKV cache layer.
   * Utilizes an early-exit loop to maximize performance on large datasets.
   */
  const performSearch = useCallback(() => {
    const cleanQuery = query?.trim() || "";

    if (!isActive || !cleanQuery) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

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
      // 1. Grab raw dictionary profiles straight from MMKV memory
      const records = FeedSyncService.getCachedProfiles();
      const normalizedQuery = cleanQuery.toLowerCase();

      const allProfiles = Object.values(records);
      const filteredData: any[] = [];

      // 2. High-Efficiency Early-Exit Loop
      for (const profile of allProfiles) {
        // Stop execution the exact moment our target limit of 20 is met
        if (filteredData.length >= 20) {
          break;
        }

        const fieldValue = profile[field];
        if (
          typeof fieldValue === "string" &&
          fieldValue.toLowerCase().startsWith(normalizedQuery)
        ) {
          filteredData.push(profile);
        }
      }

      setProfiles(filteredData);
    } catch (e: any) {
      setError(e);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, query, field, user?.displayName]);

  // Performs search instantly matching text state changes or active mode toggles
  useEffect(() => {
    if (uid && isActive) {
      performSearch();
    } else {
      setProfiles([]);
    }
  }, [uid, isActive, query, field, performSearch]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length || 0));
      _setIndex(next);
    },
    [profiles.length],
  );

  return {
    profiles,
    currentIndex: 0, // Keeps your default screen configuration structure untouched
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: () => {
      storage.set(`active_mode_${uid}`, "default");
      storage.remove(`search_query_${uid}`);
    },
    refetch: performSearch,
  };
}
