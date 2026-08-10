import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { storage } from "@/cache/cacheConfig";
import { FeedSyncService } from "../apis/feedApi";

export function useFeedFilter(uid: string, isActive: boolean, filters: any) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentIndex, _setIndex] = useState(0);

  const performFilter = useCallback(() => {
    if (!isActive || !filters) return;
    setIsLoading(true);
    setError(null);

    try {
      const rawGender = user?.displayName || "";
      const gender = rawGender.toLowerCase().trim();

      if (gender !== "male" && gender !== "female") {
        setProfiles([]);
        setIsLoading(false);
        return;
      }

      // 1. Fetch current local runtime dataset from MMKV
      const records = FeedSyncService.getCachedProfiles();
      const allProfiles = Object.values(records);
      const scoredData: any[] = [];

      // Setup age matching boundary variables if configured
      let youngestPossibleBirthDate: Date | null = null;
      if (filters.maxAge) {
        const ageInt = parseInt(filters.maxAge, 10);
        youngestPossibleBirthDate = new Date();
        youngestPossibleBirthDate.setFullYear(
          youngestPossibleBirthDate.getFullYear() - ageInt,
        );
      }

      // 2. Iterate, evaluate structural thresholds, and compute rankings
      for (const p of allProfiles) {
        let score = 0;
        let passAgeCheck = true;

        // --- Age Range Validation ---
        if (youngestPossibleBirthDate && p.dateOfBirth) {
          // Convert Firestore Timestamp seconds/milliseconds payload cleanly to a Date structure
          const birthDate = p.dateOfBirth.seconds
            ? new Date(p.dateOfBirth.seconds * 1000)
            : new Date(p.dateOfBirth);

          // The profile's birth date must be AFTER this threshold to be YOUNGER than filters.maxAge
          if (birthDate < youngestPossibleBirthDate) {
            passAgeCheck = false;
          } else {
            score++; // Matches your logic: Age check satisfied gets an automatic match score point
          }
        } else if (filters.maxAge) {
          // If a filter is requested but profile data doesn't have a valid field, fail validation safely
          passAgeCheck = false;
        }

        // If age ceiling restriction checks fail, immediately skip parsing the rest of this profile
        if (!passAgeCheck) continue;

        // --- Weight Scored Filter Points Matrix ---
        // 1. Max Height (Less than or Equal)
        if (
          filters.maxHeight &&
          p.height !== undefined &&
          Number(p.height) <= Number(filters.maxHeight)
        ) {
          score++;
        }

        // 2. Native Place (Exact Match)
        if (filters.nativePlace && p.nativePlace === filters.nativePlace) {
          score++;
        }

        // 3. Min Income (Greater than or Equal)
        if (
          filters.minIncome &&
          p.annualIncome !== undefined &&
          Number(p.annualIncome) >= Number(filters.minIncome)
        ) {
          score++;
        }

        // 4. Marital Status (Exact Match)
        if (
          filters.maritalStatus &&
          p.maritalStatus === filters.maritalStatus
        ) {
          score++;
        }

        // 5. Ready to Marry (Exact Match)
        if (filters.isReady && p.isReady === filters.isReady) {
          score++;
        }

        scoredData.push({ ...p, matchScore: score });
      }

      // 3. Sort Results: Highest Score (6 Matches) -> Lowest Score (0 Matches)
      const sorted = scoredData.sort(
        (a: any, b: any) => b.matchScore - a.matchScore,
      );
      setProfiles(sorted);
    } catch (e) {
      setError(e);
      console.error("Filter Ranking Error:", e);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, filters, user?.displayName]);

  // Processes filtering calculations instantly upon focused screen entry or filter edits
  useEffect(() => {
    if (uid && isActive) {
      performFilter();
    }
  }, [uid, isActive, filters, performFilter]);

  const updateIndex = useCallback(
    (val: number) => {
      const next = Math.max(0, Math.min(val, profiles?.length || 0));
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
      performFilter();
    }
  }, [profiles?.length, performFilter, updateIndex]);

  return {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isError: !!error,
    error,
    feedDone: true,
    resetFeed,
    refetch,
  };
}
