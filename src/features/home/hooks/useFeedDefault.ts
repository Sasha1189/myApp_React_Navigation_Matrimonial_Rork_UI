import { useState, useEffect, useCallback, useMemo } from "react";
import { storage } from "../../../cache/cacheConfig";
import { useAuth } from "../../../context/AuthContext";
import {
  firestore,
  collection,
  queryFs,
  orderBy,
  getDocsFromCache,
} from "@/config/firebase";
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

  const loadLocalProfiles = useCallback(async () => {
    const rawGender = user?.displayName || "";
    const gender = rawGender.toLowerCase().trim();

    if (gender !== "male" && gender !== "female") {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    const targetCollection =
      gender === "male" ? "femaleProfiles" : "maleProfiles";

    setIsLoading(true);
    setError(null);
    try {
      const colRef = collection(firestore, targetCollection);
      const q = queryFs(colRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocsFromCache(q);

      const data = snapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      }));
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

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === "profiles_last_sync_timestamp") {
        loadLocalProfiles();
      }
    });
    return () => listener.remove();
  }, [loadLocalProfiles]);

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
      await loadLocalProfiles();
      return;
    }
    setIsLoading(true);
    const success = await FeedSyncService.syncFeeds(user?.displayName || "");
    if (success) await loadLocalProfiles();
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
