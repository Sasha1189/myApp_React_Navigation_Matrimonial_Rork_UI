import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BlockedUserDetail } from "../../../types/profile";

const storageKey = (uid: string) => `blockedUserDetails:${uid}`;

export function useBlockedUserDetails(uid: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<BlockedUserDetail[]>({
    queryKey: ["blockedUserDetails", uid],
    enabled: !!uid,
    initialData: [],
    // Load from AsyncStorage on first mount
    queryFn: async () => {
      if (!uid) return [];
      const raw = await AsyncStorage.getItem(storageKey(uid));
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as BlockedUserDetail[];
        return [];
      } catch {
        return [];
      }
    },
    staleTime: Infinity, // we don't “refetch” from server
    gcTime: Infinity,
  });

  // Whenever blocked details change, mirror to AsyncStorage
  React.useEffect(() => {
    if (!uid) return;
    const data = query.data ?? [];
    AsyncStorage.setItem(storageKey(uid), JSON.stringify(data)).catch(() => {});
  }, [uid, query.data]);

  return query;
}
