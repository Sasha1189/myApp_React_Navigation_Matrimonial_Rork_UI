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
import { getDefaultProfile } from "../utils/getDefaultProfile";
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
import { Alert } from "react-native";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  myProfile: Profile;
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

  const isGenderValid =
    user?.displayName === "Male" || user?.displayName === "Female";

  usePresence(user?.uid, tier, isGenderValid ? user?.displayName : undefined);

  const updateMyProfile = useUpdateProfile(user, myProfile, setMyProfile, tier);

  //profile
  useEffect(() => {
    const syncProfile = async () => {
      const userDisplayName = user?.displayName
        ? user.displayName.toLowerCase()
        : "";
      const isGenderValid =
        userDisplayName === "male" || userDisplayName === "female";

      if (!user?.uid || !isGenderValid) return;

      try {
        // 🎯 STEP 1: Fast Track Cache Check
        const hasCache = storage.contains(PROFILE_CACHE_KEY);

        if (hasCache) {
          console.log(
            "📦 [Auth Context]: Profile loaded instantly from local disk cache. Skipping server fetch.",
          );
          const cachedData = storage.getString(PROFILE_CACHE_KEY);
          if (cachedData) {
            setMyProfile(JSON.parse(cachedData));
          }
          return; // 🛑 EXIT EARLY: Saves network reads on every single app boot!
        }

        // 🎯 STEP 2: Network Fetch (Only runs if local cache is completely empty)
        console.log(
          "🔄 [Auth Context]: Cache empty. Fetching initial profile data from server...",
        );
        const remoteData = await getProfile(
          user.uid,
          user.displayName as string,
        );

        if (remoteData) {
          // A paid user profile was found on the server
          const fullyInjectedProfile = { ...remoteData, uid: user.uid };
          setMyProfile(fullyInjectedProfile);
          storage.set(PROFILE_CACHE_KEY, JSON.stringify(fullyInjectedProfile));
          console.log(
            "✅ [Auth Context]: Initial paid profile fetched and cached successfully.",
          );
        } else {
          console.log(
            "🔒 [Auth Context]: No remote profile found. Seeding default local memory layout for free account.",
          );

          const freeProfileSeed = {
            ...getDefaultProfile(),
            uid: user.uid,
            gender: user.displayName as any, // Syncs their chosen gender text directly
          };

          setMyProfile(freeProfileSeed);
          storage.set(PROFILE_CACHE_KEY, JSON.stringify(freeProfileSeed));
          console.log(
            "✅ [Auth Context]: Local cache seeded. Remote server fetches are now locked down.",
          );
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

  // 2. sync feed
  useEffect(() => {
    if (!isGenderValid || !tier) return;

    const lastSync = storage.getNumber("profiles_last_sync_timestamp") || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastSync === 0 || lastSync === 1 || Date.now() - lastSync > oneDay) {
      FeedSyncService.syncFeeds(user?.displayName as string, tier);
    }
  }, [user?.displayName, tier]);

  // 3. Hardware Identity & Security Binding Control (PAID USERS ONLY)
  useEffect(() => {
    // 🎯 FIX 1: Add the paid user gate to protect your database from free user traffic
    const isPaidUser = tier === "basic" || tier === "premium";
    if (!user?.uid || !isGenderValid || !isPaidUser) return;

    const checkBinding = async () => {
      try {
        // Initialize dynamic device identity parameters
        let currentHardwareId = await getUniqueId();

        // 🎯 FIX 2: Override instead of early return. This allows Google to save
        // to the cache normally and avoids infinite loop background execution.
        const googleTestNumbers = ["+919999991111", "+919999992222"];
        if (user.phoneNumber && googleTestNumbers.includes(user.phoneNumber)) {
          console.log(
            "Google reviewer validation detected. Overriding with static test identity.",
          );
          currentHardwareId = "GOOGLE_TEST_DEVICE_ID_STATIC";
        }

        const cachedId = getDBDeviceIdCache();

        if (cachedId === currentHardwareId) {
          console.log("Device verified via Cache");
          return;
        }

        const dbId = await getUserDeviceId(user.uid);

        if (!dbId || dbId.trim() === "") {
          await updateUserDeviceId(user.uid, currentHardwareId);
          setDBDeviceIdCache(currentHardwareId); // Saves correctly (even for Google's mock ID)
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
