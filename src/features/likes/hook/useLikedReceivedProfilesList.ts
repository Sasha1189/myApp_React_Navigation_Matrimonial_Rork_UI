import { useState, useEffect, useCallback } from "react";
import { likesStorage } from "@/cacheMMKV/cacheConfig";
import { LikesCache, LikesReceivedCache } from "../cache/likesCache";
import { profileService } from "@/db/repositories/profileService";
import { Profile } from "@/features/profile/types/profile";

export function useLikeSent(myUid: string) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfiles = useCallback(async () => {
    if (!myUid) return;
    setIsLoading(true);
    try {
      const ids = LikesCache.getIds();
      const data = await profileService.fetchProfilesByUids(ids);
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
    const listener = likesStorage.addOnValueChangedListener((key) => {
      if (key === "likes_ids_index") {
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

export function useLikeReceived(
  myUid: string,
  tier: "none" | "basic" | "premium",
) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfiles = useCallback(async () => {
    if (!myUid) return;
    setIsLoading(true);
    try {
      const list = LikesReceivedCache.getList();
      const ids = list.map(({ uid }) => uid);
      const data = await profileService.fetchProfilesByUids(ids);
      setProfiles(data);
    } catch (error) {
      console.error("[useLikeReceived] Failed to load profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [myUid]);

  useEffect(() => {
    if (!myUid || tier !== "premium") {
      setIsLoading(false);
      return;
    }
    // 1. Fetch on initial mount
    loadProfiles();

    // 2. Listen for cache changes on MMKV
    const listener = likesStorage.addOnValueChangedListener((key) => {
      if (key === "likes_received_list") {
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
