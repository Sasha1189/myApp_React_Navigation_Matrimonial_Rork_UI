import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  LikesCache,
  LikesReceivedCache,
} from "@/features/likes/cache/likesCache";
import { likesStorage } from "@/cacheMMKV/cacheConfig";

export interface ProfileStats {
  matchesCount: number;
  sentCount: number;
  receivedCount: number;
  isLoading: boolean;
  isSubscribed: boolean;
}

export function useProfileStats(uid: string | undefined): ProfileStats {
  const { tier } = useAuth();

  // Returns true if user has any active subscription
  const isSubscribed = Boolean(
    tier && (tier === "basic" || tier === "premium"),
  );

  const calculateLocalStats = (): ProfileStats => {
    if (!uid) {
      return {
        matchesCount: 0,
        sentCount: 0,
        receivedCount: 0,
        isLoading: true,
        isSubscribed: false,
      };
    }

    if (!isSubscribed) {
      return {
        sentCount: 0,
        receivedCount: 0,
        matchesCount: 0,
        isLoading: false,
        isSubscribed: false,
      };
    }

    // Load arrays directly from MMKV cache
    const sentIds = LikesCache.getIds() || [];
    const receivedList = LikesReceivedCache.getList() || [];
    const receivedIds = receivedList
      .map((item: any) => item.uid)
      .filter(Boolean);

    // Mutual matches calculation
    const sentSet = new Set(sentIds);
    const mutualMatches = receivedIds.filter((id) => sentSet.has(id));

    return {
      sentCount: sentIds.length,
      receivedCount: receivedIds.length,
      matchesCount: mutualMatches.length,
      isLoading: false,
      isSubscribed: true,
    };
  };

  const [stats, setStats] = useState<ProfileStats>(() => calculateLocalStats());

  useEffect(() => {
    if (!uid) return;

    const listener = likesStorage.addOnValueChangedListener((key) => {
      if (key === "likes_ids_index" || key === "likes_received_cache_key") {
        setStats(calculateLocalStats());
      }
    });

    setStats(calculateLocalStats());

    return () => listener.remove();
  }, [uid, tier, isSubscribed]);

  return stats;
}
