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
import { doc, getDoc, firestore } from "../config/firebase";
import { FeedSyncService } from "@/features/home/apis/feedApi";
import { BlocksCache } from "../cache/cacheConfig";
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
  profile: Profile;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile>(() => {
    const cached = storage.getString(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : getDefaultProfile();
  });

  usePresence(user?.uid);
  const updateProfile = useUpdateProfile(user, profile, setProfile, tier);

  //profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!user?.uid) return;
      if (!user?.displayName) return;
      try {
        const hasCache = storage.contains(PROFILE_CACHE_KEY);
        if (!hasCache) {
          const remoteData = await getProfile(user?.uid, user?.displayName);
          if (remoteData) {
            setProfile(remoteData);
            storage.set(PROFILE_CACHE_KEY, JSON.stringify(remoteData));
          }
        }
      } catch (error) {
        console.error("Initial self profilesync failed:", error);
      }
    };
    syncProfile();
  }, [user?.uid, user?.displayName]);

  // 2. sync feed
  useEffect(() => {
    if (user?.displayName) {
      const lastSync = storage.getNumber("profiles_last_sync_timestamp") || 0;
      const oneDay = 24 * 60 * 60 * 1000;

      // 🔹 NO TIMER: Fire immediately when gender is ready or 24h passed
      if (lastSync === 0 || Date.now() - lastSync > oneDay) {
        FeedSyncService.syncFeeds(user?.displayName);
      }
    }
  }, [user?.displayName]);

  // 3. Hardware Identity & Security Binding Control
  useEffect(() => {
    if (!user?.uid || !user?.displayName) return;
    const checkBinding = async () => {
      try {
        const currentHardwareId = await getUniqueId();
        const cachedId = getDBDeviceIdCache();

        if (cachedId === currentHardwareId) {
          console.log("Device verified via Cache");
          return;
        }

        const dbId = await getUserDeviceId(user.uid);

        if (!dbId || dbId === "") {
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
                onPress: async () => await getAuth().signOut(),
              },
            ],
            { cancelable: false }, // 🛡️ Prevents tapping outside the alert layout box to bypass logout
          );
        } else {
          setDBDeviceIdCache(dbId);
        }
      } catch (error) {
        console.error("Device ID verification failed:", error);
      }
    };
    checkBinding();
  }, [user?.uid, user?.displayName]);

  //auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. CLEAR STATE ON LOGOUT
      if (!firebaseUser) {
        setUser(null);
        setTier("none");
        setAuthLoading(false);
        return;
      }
      // 2. FAST TRACK: Show App immediately using Cache
      setUser(firebaseUser);
      setAuthLoading(false);

      try {
        const idTokenResult = await getIdTokenResult(firebaseUser, true);
        const claims = idTokenResult.claims;

        // If no subscription claim is found, they are a confirmed unpaid/new user
        if (!claims.t) {
          setTier((currentTier) => {
            if (currentTier !== "none") {
              storage.set(TIER_CACHE_KEY, "none");
              return "none";
            }
            return currentTier;
          });
          return;
        }

        const tierMapping: Record<string, "none" | "basic" | "premium"> = {
          n: "none",
          b: "basic",
          p: "premium",
        };

        const mappedTier = tierMapping[claims.t as string] || "none";
        const expirySeconds = (claims.e as number) || 0;
        const currentTimeSeconds = Math.floor(Date.now() / 1000);

        // 4. SYNC TIER & CACHE
        if (mappedTier !== "none" && currentTimeSeconds > expirySeconds) {
          // Token says active, but it expired in real-time
          setTier((currentTier) => {
            if (currentTier !== "none") {
              storage.set(TIER_CACHE_KEY, "none");
              return "none";
            }
            return currentTier;
          });
        } else {
          setTier((currentTier) => {
            if (currentTier !== mappedTier) {
              storage.set(TIER_CACHE_KEY, mappedTier);
              return mappedTier;
            }
            return currentTier;
          });
        }

        // 5. SYNC BLOCKED LIST (Background)
        const blockDocRef = doc(firestore, "blockedIDs", firebaseUser.uid);
        const blockSnap = await getDoc(blockDocRef);
        if (blockSnap.exists()) {
          const data = blockSnap.data();
          const mine = data?.mine || [];
          const theirs = data?.theirs || [];

          // 🔹 Save both lists to MMKV immediately
          BlocksCache.sync(mine, theirs);
        } else {
          // Ensure cache is cleared if no doc exists
          BlocksCache.sync([], []);
        }
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
      profile,
      authLoading,
      updateProfile,
      tier,
      setTier,
    }),
    [user, profile, authLoading, tier],
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
