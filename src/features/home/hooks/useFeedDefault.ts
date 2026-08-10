import { useState, useEffect, useCallback } from "react";
import { storage } from "../../../cache/cacheConfig";
import { useAuth } from "../../../context/AuthContext";
import { FeedSyncService } from "../apis/feedApi";

export function useFeedDefault(uid: string, isActive: boolean) {
  const { user } = useAuth();
  const indexKey = `index_${uid}_default`;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    const g = user?.displayName?.toLowerCase().trim();
    return g === "male" || g === "female";
  });
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(
    () => storage.getNumber(indexKey) || 0,
  );

  const loadLocalProfiles = useCallback(() => {
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
      const records = FeedSyncService.getCachedProfiles();

      // Simply sort and return—no internal map conversion required anymore!
      const data = Object.values(records).sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });

      setProfiles(data || []);
    } catch (e: any) {
      setError(e);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (uid && isActive) {
      loadLocalProfiles();
    } else {
      setIsLoading(false);
    }
  }, [uid, isActive, loadLocalProfiles]);

  const updateIndex = useCallback(
    (val: number) => {
      const maxLimit = profiles?.length || 0;
      const next = Math.max(0, Math.min(val, maxLimit));
      _setIndex(next);
      storage.set(indexKey, next);
    },
    [profiles.length, indexKey],
  );

  const refetch = useCallback(async () => {
    if (profiles.length > 0) {
      updateIndex(0);
      loadLocalProfiles();
      return;
    }

    setIsLoading(true);
    const success = await FeedSyncService.syncFeeds(user?.displayName || "");
    if (success) {
      loadLocalProfiles();
    }
    setIsLoading(false);
  }, [profiles?.length, user?.displayName, loadLocalProfiles, updateIndex]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: () => updateIndex(0),
    refetch,
  };
}
