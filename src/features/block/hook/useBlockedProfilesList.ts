import { useState, useEffect, useCallback } from "react";
import { blocksStorage } from "@/cacheMMKV/cacheConfig";
import { BlocksCache } from "../cache/blockCache";
import { feedRepository } from "@/features/home/services/feedRepository";
import { Profile } from "@/features/profile/types/profile";

export function useBlockedList(myUid: string) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfiles = useCallback(async () => {
    if (!myUid) return;
    setIsLoading(true);
    try {
      const ids = BlocksCache.getMyIds();
      const data = await feedRepository.fetchProfilesByUids(ids);
      setProfiles(data);
    } catch (error) {
      console.error("[useLikeSent] Failed to load profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [myUid]);

  useEffect(() => {
    // 1. Fetch on initial mount
    loadProfiles();

    // 2. Listen for cache changes on MMKV
    const listener = blocksStorage.addOnValueChangedListener((key) => {
      if (key === "my_blocked_ids_index") {
        loadProfiles();
      }
    });

    // 3. Clean up listener on unmount
    return () => {
      listener.remove();
    };
  }, [myUid, loadProfiles]);

  return { profiles, isLoading, refetch: loadProfiles };
}
