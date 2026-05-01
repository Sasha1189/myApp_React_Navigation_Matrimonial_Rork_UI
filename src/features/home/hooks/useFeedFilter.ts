import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  firestore,
  collection,
  queryFs,
  getDocsFromCache,
  where,
} from "@/config/firebase";
import { storage } from "@/cache/cacheConfig";

export function useFeedFilter(uid: string, isActive: boolean, filters: any) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  const performFilter = useCallback(async () => {
    if (!isActive || !filters) return;
    setIsLoading(true);

    const calculateDateFromAge = (age: number) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - age);
      return d; // Returns a Date object exactly 'age' years ago
    };

    try {
      const rawGender = user?.displayName || "";
      const gender = rawGender.toLowerCase().trim();

      if (gender !== "male" && gender !== "female") {
        setProfiles([]);
        setIsLoading(false);
        return;
      }

      const targetCollection =
        gender === "male" ? "femaleProfiles" : "maleProfiles";

      const colRef = collection(firestore, targetCollection);

      let q = queryFs(colRef);

      if (filters.maxAge) {
        const ageInt = parseInt(filters.maxAge, 10);
        const youngestPossibleBirthDate = new Date();
        // Birth date must be AFTER this date to be YOUNGER than ageInt
        youngestPossibleBirthDate.setFullYear(
          youngestPossibleBirthDate.getFullYear() - ageInt,
        );

        q = queryFs(q, where("dateOfBirth", ">=", youngestPossibleBirthDate));
      }

      const snapshot = await getDocsFromCache(q);

      const rawData = snapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      // SCORING ENGINE
      const scoredData = rawData.map((p: any) => {
        let score = 0;

        // 1. Max Height (Less than)
        if (filters.maxHeight && Number(p.height) <= Number(filters.maxHeight))
          score++;

        // 2. Native Place (Exact)
        if (filters.nativePlace && p.nativePlace === filters.nativePlace)
          score++;

        // 3. Min Income (Greater than or Equal)
        if (
          filters.minIncome &&
          Number(p.annualIncome) >= Number(filters.minIncome)
        )
          score++;

        // 4. Marital Status (Exact)
        if (filters.maritalStatus && p.maritalStatus === filters.maritalStatus)
          score++;

        // 5. Ready to Marry (Exact)
        if (filters.isReady && p.isReady === filters.isReady) score++;

        // Age is already checked by Firestore, so we add the point automatically
        if (filters.maxAge) score++;

        return { ...p, matchScore: score };
      });

      // SORTING: 6 Matches -> 5 Matches -> ...
      const sorted = scoredData.sort(
        (a: any, b: any) => b.matchScore - a.matchScore,
      );
      setProfiles(sorted);
    } catch (e) {
      setError(e);
      console.error("Filter Ranking Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, filters, user?.displayName]);

  useEffect(() => {
    if (uid && isActive) performFilter();
  }, [uid, isActive, filters, performFilter]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length));
      _setIndex(next);
    },
    [profiles.length],
  );

  const resetFeed = useCallback(() => {
    storage.set(`active_mode_${uid}`, "default");
    storage.remove(`active_filter_params_${uid}`);
  }, [uid]);

  const refetch = useCallback(async () => {
    if (profiles.length > 0) {
      updateIndex(0);
      await performFilter();
      return;
    }
  }, [profiles?.length, user?.displayName, updateIndex]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed: resetFeed,
    refetch,
  };
}
