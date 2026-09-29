import { useSyncExternalStore, useMemo } from "react";
import { LikesCache } from "../cache/likesCache";
import { likesStorage } from "@/cacheMMKV/cacheConfig";

const LIKES_KEY = "likes_ids_index";

const subscribeLikes = (onStoreChange: () => void) => {
  const subscription = likesStorage.addOnValueChangedListener((key) => {
    if (key === LIKES_KEY) {
      onStoreChange();
    }
  });
  return () => subscription.remove();
};

const getLikedIdsSnapshot = () => LikesCache.getIds().join(",");

export function useLikedSet(): Set<string> {
  const likedIdsString = useSyncExternalStore(
    subscribeLikes,
    getLikedIdsSnapshot,
    getLikedIdsSnapshot,
  );

  return useMemo(() => {
    if (!likedIdsString) return new Set<string>();
    return new Set(likedIdsString.split(","));
  }, [likedIdsString]);
}
