import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  firestore,
  collection,
  queryFs,
  orderBy,
  getDocsFromCache,
  limit,
} from "@/config/firebase";
import { FeedSyncService } from "../apis/feedApi";

export function useFeedLatest(uid: string, isActive: boolean) {
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    const g = user?.displayName?.toLowerCase().trim();
    return g === "male" || g === "female";
  });
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  const loadLatestProfiles = useCallback(async () => {
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
      const q = queryFs(colRef, orderBy("createdAt", "desc"), limit(50));

      const snapshot = await getDocsFromCache(q);

      const data = snapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setProfiles(data || []);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (uid && isActive) {
      loadLatestProfiles();
    } else {
      setIsLoading(false);
    }
  }, [uid, isActive, loadLatestProfiles]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length));
      _setIndex(next);
    },
    [profiles.length],
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const success = await FeedSyncService.syncFeeds(user?.displayName || "");
    if (success) await loadLatestProfiles();
    setIsLoading(false);
  }, [user?.displayName, loadLatestProfiles]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: loadLatestProfiles,
    refetch,
  };
}
