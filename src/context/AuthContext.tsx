import {
  useState,
  useEffect,
  useContext,
  createContext,
  useMemo,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import {
  storage,
  getDBDeviceIdCache,
  setDBDeviceIdCache,
} from "../cache/cacheConfig";
import { getDefaultProfile } from "../types/getDefaultProfile";
import { Profile } from "../types/profile";
import { usePresence } from "@/features/messages/hooks/usePresence";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import { getProfile } from "@/features/profile/api/profileApi";
import { FeedSyncService } from "@/features/home/apis/feedApi";
import { getUniqueId } from "react-native-device-info";
import {
  getUserDeviceId,
  updateUserDeviceId,
} from "@/features/home/apis/userApi";
import { syncUserProfiles, performDeltaSync } from "@/services/syncService";
import { Alert } from "react-native";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  myProfile: Profile;
  setMyProfile: (profile: Profile) => void;
  updateMyProfile: (data: Partial<Profile>) => Promise<void>;
  tier: "none" | "basic" | "premium";
  setTier: (tier: "none" | "basic" | "premium") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY = "self_profile_cache";
const TIER_CACHE_KEY = "self_tier_cache";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [tier, setTier] = useState<"none" | "basic" | "premium">(() => {
    const cached = storage.getString(TIER_CACHE_KEY);
    return (cached as any) || "none";
  });
  const [myProfile, setMyProfile] = useState<Profile>(() => {
    const cached = storage.getString(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : getDefaultProfile();
  });

  // Standardized gender verification
  const userGender = user?.displayName?.trim().toLowerCase();
  const isGenderValid = userGender === "male" || userGender === "female";

  usePresence(user?.uid, tier, isGenderValid ? user?.displayName : undefined);

  const updateMyProfile = useUpdateProfile(user, myProfile, setMyProfile, tier);

  // 1. Sync User's Own Profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!user?.uid || !isGenderValid) return;

      try {
        // 🎯 STEP 1: Fast Track Cache Check
        const hasCache = storage.contains(PROFILE_CACHE_KEY);

        if (hasCache) {
          const cachedData = storage.getString(PROFILE_CACHE_KEY);
          if (cachedData) {
            setMyProfile(JSON.parse(cachedData));
          }
          return;
        }
        const remoteData = await getProfile(
          user.uid,
          user.displayName as string,
        );

        if (remoteData) {
          // A paid user profile was found on the server
          const fullyInjectedProfile = { ...remoteData, uid: user.uid };
          setMyProfile(fullyInjectedProfile);
          storage.set(PROFILE_CACHE_KEY, JSON.stringify(fullyInjectedProfile));
        } else {
          const freeProfileSeed = {
            ...getDefaultProfile(),
            uid: user.uid,
            gender: user.displayName as any, // Syncs their chosen gender text directly
          };

          setMyProfile(freeProfileSeed);
          storage.set(PROFILE_CACHE_KEY, JSON.stringify(freeProfileSeed));
        }
      } catch (error) {
        console.error(
          "❌ [Auth Context]: Failed to fetch initial profile data:",
          error,
        );
      }
    };

    syncProfile();
  }, [user?.uid, user?.displayName]);

  // 2. Sync Opposite Gender Profiles into Local SQLite (Bulk Dump + Delta)
  useEffect(() => {
    if (!user?.uid || !isGenderValid) return;

    const runProfileDatabaseSync = async () => {
      try {
        const isPaid = tier === "basic" || tier === "premium";

        // Step A: Initial Sync (Paid Gzip Dump or Free 15 Profiles)
        await syncUserProfiles(isPaid, user.displayName);

        // Step B: Delta Sync (Incremental updates since last sync timestamp)
        await performDeltaSync(isPaid, user.displayName);
      } catch (error) {
        console.error(
          "❌ [Auth Context]: SQLite local feed sync failed:",
          error,
        );
      }
    };

    runProfileDatabaseSync();
  }, [user?.uid, user?.displayName, tier, isGenderValid]);

  // 3. Hardware Identity & Security Binding Control (PAID USERS ONLY)
  useEffect(() => {
    if (!user?.uid) return;

    const GOOGLE_REVIEWER_UIDS = [
      "ZtyLW424djVC38KNB819khGSp4n2",
      "YFRi0id1LIV8qkR5VYmEFlGAJ4O2",
    ];

    if (GOOGLE_REVIEWER_UIDS.includes(user.uid)) {
      return;
    }

    const isPaidUser = tier === "basic" || tier === "premium";
    if (!isGenderValid || !isPaidUser) return;

    const checkBinding = async () => {
      try {
        let currentHardwareId = await getUniqueId();

        const cachedId = getDBDeviceIdCache();

        if (cachedId === currentHardwareId) {
          return;
        }

        const dbId = await getUserDeviceId(user.uid);

        if (!dbId || dbId.trim() === "") {
          await updateUserDeviceId(user.uid, currentHardwareId);
          setDBDeviceIdCache(currentHardwareId);
          return;
        }

        if (dbId !== currentHardwareId) {
          Alert.alert(
            "Device Mismatch",
            "This account is registered on another device. Contact support.",
            [
              {
                text: "Logout",
                onPress: async () => await getAuth().signOut(), // 🎯 FIX 3: Clean cache data purge on eviction
              },
            ],
            { cancelable: false },
          );
        } else {
          setDBDeviceIdCache(dbId);
        }
      } catch (error) {
        console.error("Device ID verification failed:", error);
      }
    };
    checkBinding();
  }, [user?.uid, isGenderValid, tier]);

  //auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. CLEAR STATE ON LOGOUT
      if (!firebaseUser) {
        setTier("none");
        setUser(null);
        setAuthLoading(false);
        return;
      }

      // 2. FAST TRACK: Show App immediately using Cache
      setUser(firebaseUser);
      setAuthLoading(false);

      try {
        const idTokenResult = await getIdTokenResult(firebaseUser, true);
        const claims = idTokenResult.claims;

        // Calculate the accurate tier first based on fresh token claims
        let activeTier: "none" | "basic" | "premium" = "none";

        if (claims && claims.t) {
          const tierMapping: Record<string, "none" | "basic" | "premium"> = {
            n: "none",
            b: "basic",
            p: "premium",
          };

          const mappedTier = tierMapping[claims.t as string] || "none";
          const expirySeconds = (claims.e as number) || 0;
          const currentTimeSeconds = Math.floor(Date.now() / 1000);

          // If token says active but the timestamp expired in real-time, downgrade them
          if (mappedTier !== "none" && currentTimeSeconds > expirySeconds) {
            activeTier = "none";
          } else {
            activeTier = mappedTier;
          }
        } else {
          // 🎯 CRITICAL ACCURACY FIX: If claims.t is missing (Registration / Free accounts),
          // explicitly fall back to "none". This handles new users and revokes expired plans.
          activeTier = "none";
        }

        // 3. SYNC TIER STATE & CACHE
        setTier((currentTier) => {
          if (currentTier !== activeTier) {
            storage.set(TIER_CACHE_KEY, activeTier);
            return activeTier;
          }
          return currentTier;
        });
      } catch (error) {
        console.error("Auth/tier/block state check failed:", error);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      myProfile,
      setMyProfile,
      authLoading,
      updateMyProfile,
      tier,
      setTier,
    }),
    [user, myProfile, authLoading, tier],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
