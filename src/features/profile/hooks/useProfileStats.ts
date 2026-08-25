import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // Import your Auth hook
import {
  LikesCache,
  LikesReceivedCache,
} from "@/features/likes/cache/likesCache";
import { likesStorage } from "@/cacheMMKV/cacheConfig";

interface ProfileStats {
  matchesCount: number | string;
  sentCount: number | string;
  receivedCount: number | string;
  isLoading: boolean;
}

export function useProfileStats(uid: string | undefined) {
  const { tier } = useAuth();

  const calculateLocalStats = (): ProfileStats => {
    if (!uid) {
      return {
        matchesCount: 0,
        sentCount: 0,
        receivedCount: 0,
        isLoading: true,
      };
    }

    const upgradeLabel = "Upgrade to see";

    if (tier !== "basic" && tier !== "premium") {
      return {
        sentCount: upgradeLabel,
        receivedCount: upgradeLabel,
        matchesCount: upgradeLabel,
        isLoading: false,
      };
    }

    // Load arrays directly from your MMKV structural cache folders
    const sentIds = LikesCache.getIds() || [];
    const receivedList = LikesReceivedCache.getList() || [];
    const receivedIds = receivedList
      .map((item: any) => item.uid)
      .filter(Boolean);

    // --- CONDITION 2: BASIC TIER (ONLY SENT COUNT UNLOCKED) ---
    if (tier === "basic") {
      return {
        sentCount: sentIds?.length, // Basic tier can see exactly how many likes they sent!
        receivedCount: upgradeLabel, // Hidden for basic tier - prompts upgrade
        matchesCount: upgradeLabel, // Hidden for basic tier - prompts upgrade
        isLoading: false,
      };
    }

    // --- CONDITION 3: PREMIUM TIER (ALL UNLOCKED & MUTUAL INTERSECTION RUNNING) ---
    // Create a strict hash set search array map of sent IDs for O(1) matching checks
    const sentSet = new Set(sentIds);
    const mutualMatches = receivedIds.filter((id) => sentSet.has(id));

    return {
      sentCount: sentIds?.length,
      receivedCount: receivedIds?.length,
      matchesCount: mutualMatches?.length, // Pure local matching calculation with 0 database cost!
      isLoading: false,
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
  }, [uid, tier]);

  return stats;
}
