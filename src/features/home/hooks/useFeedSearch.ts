import { useState, useCallback, useEffect } from "react";
import {
  firestore,
  collection,
  queryFs,
  where,
  getDocsFromCache,
  limit,
} from "@/config/firebase";
import { storage } from "../../../cache/cacheConfig";
import { useAuth } from "../../../context/AuthContext";

export function useFeedSearch(
  uid: string,
  isActive: boolean,
  field: string,
  query: string,
) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  const performSearch = useCallback(async () => {
    if (!isActive || !query.trim()) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    const rawGender = user?.displayName || "";
    const gender = rawGender.toLowerCase().trim();

    // 2. Gender Guard
    if (gender !== "male" && gender !== "female") {
      setIsLoading(false);
      return;
    }

    const targetCollection =
      gender === "male" ? "femaleProfiles" : "maleProfiles";

    setIsLoading(true);
    setError(null);

    try {
      const colRef = collection(firestore, targetCollection);

      const searchTerm = query.trim();
      const q = queryFs(
        colRef,
        where(field, ">=", searchTerm),
        where(field, "<=", searchTerm + "\uf8ff"),
        limit(20),
      );

      const snapshot = await getDocsFromCache(q);

      const data = snapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      setProfiles(data);
    } catch (e: any) {
      console.error("Search Error:", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, query, field, user?.displayName]);

  useEffect(() => {
    if (uid && isActive) {
      performSearch();
    } else {
      setProfiles([]);
    }
  }, [uid, isActive, query, field, performSearch]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length));
      _setIndex(next);
    },
    [profiles.length],
  );

  return {
    profiles,
    currentIndex: 0,
    updateIndex, // Search usually shows a scrollable list or reset index
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: () => {
      storage.set(`active_mode_${uid}`, "default");
      storage.remove(`search_query_${uid}`); // Optional: clean up query too
    },
    refetch: performSearch,
  };
}
