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
import { storage } from "../cache/cacheConfig";
import { getDefaultProfile } from "../utils/getDefaultProfile";
import { Profile } from "../types/profile";
import { usePresence } from "@/features/messages/hooks/usePresence";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import { getProfile } from "@/features/profile/api/profileApi";
import { doc, getDoc, firestore } from "../config/firebase";
import { BlocksCache } from "../cache/cacheConfig";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  profile: Profile;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  tier: "none" | "trial" | "basic" | "premium";
  setTier: (tier: any) => void;
  hasUsedTrial: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY = "self_profile_cache";
const TIER_CACHE_KEY = "self_tier_cache";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tier, setTier] = useState<"none" | "trial" | "basic" | "premium">(
    () => {
      const cached = storage.getString(TIER_CACHE_KEY);
      return (cached as any) || "none";
    },
  );
  const [hasUsedTrial, setHasUsedTrial] = useState(false);

  const [profile, setProfile] = useState<Profile>(() => {
    const cached = storage.getString(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : getDefaultProfile();
  });

  usePresence(user?.uid);
  const updateProfile = useUpdateProfile(user, profile, setProfile);

  //profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;
      try {
        const hasCache = storage.contains(PROFILE_CACHE_KEY);
        if (!hasCache) {
          const remoteData = await getProfile(user?.uid, user?.displayName!);
          if (remoteData) {
            setProfile(remoteData);
            storage.set(PROFILE_CACHE_KEY, JSON.stringify(remoteData));
          }
        }
      } catch (error) {
        console.error("Initial sync failed:", error);
      }
    };
    syncProfile();
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
        // 3. BACKGROUND SYNC: Slow network stuff
        // We use 'true' to force a fresh token from the server
        const idTokenResult = await getIdTokenResult(firebaseUser, true);
        const claims = idTokenResult.claims;

        // Use the actual claim value directly
        const serverHasUsedTrial = !!claims.h;
        setHasUsedTrial(serverHasUsedTrial);

        const tierMapping: Record<
          string,
          "none" | "trial" | "basic" | "premium"
        > = {
          n: "none",
          t: "trial",
          b: "basic",
          p: "premium",
        };

        const mappedTier = tierMapping[claims.t as string] || "none";
        const expirySeconds = (claims.e as number) || 0;
        const currentTimeSeconds = Math.floor(Date.now() / 1000);

        // 4. SYNC TIER & CACHE
        if (mappedTier !== "none" && currentTimeSeconds > expirySeconds) {
          setTier("none");
          setHasUsedTrial(true);
          storage.set(TIER_CACHE_KEY, "none");
        } else {
          setTier(mappedTier);
          // Always cache the latest tier from the server
          storage.set(TIER_CACHE_KEY, mappedTier);
        }

        // 5. SYNC BLOCKED LIST (Background)
        const blockDocRef = doc(firestore, "blockedIDs", firebaseUser.uid);
        const blockSnap = await getDoc(blockDocRef);
        if (blockSnap.exists()) {
          // Pass the 'blockedUsers' object (Map)
          const serverMap = blockSnap.data()?.blockedUsers || {};
          BlocksCache.syncFromFirestore(serverMap);
        }
      } catch (error) {
        console.error("Background sync failed:", error);
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
      hasUsedTrial,
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
