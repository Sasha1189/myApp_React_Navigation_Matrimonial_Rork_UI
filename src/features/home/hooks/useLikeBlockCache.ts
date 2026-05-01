import { useState, useEffect, useMemo } from "react";
import { storage, LikesCache, BlocksCache } from "../../../cache/cacheConfig";

export function useLikeBlockCache() {
  const [likedIds, setLikedIds] = useState(() => LikesCache.getIds());
  const [blockedIds, setBlockedIds] = useState(() => BlocksCache.getIds());

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === "likes_ids_index") setLikedIds(LikesCache.getIds());
      if (key === "blocked_ids_index") setBlockedIds(BlocksCache.getIds());
    });
    return () => listener.remove();
  }, []);

  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const blockedSet = useMemo(() => new Set(blockedIds), [blockedIds]);

  return { likedSet, blockedSet };
}
