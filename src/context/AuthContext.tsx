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
    "none",
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
    const syncProfileAndTier = async () => {
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
    syncProfileAndTier();
  }, [user?.uid, user?.displayName]);
  //auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await getIdTokenResult(firebaseUser, true);

        const claims = idTokenResult.claims;
        setHasUsedTrial(!!claims.h);

        // 1. Decode Tier Map (t: 'p' -> 'premium')
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

        // 2. Check Expiry
        if (mappedTier !== "none" && currentTimeSeconds > expirySeconds) {
          setTier("none");
          setHasUsedTrial(true);
          storage.set(TIER_CACHE_KEY, "none");
        } else {
          setTier(mappedTier);
          setHasUsedTrial(hasUsedTrial);
          storage.set(TIER_CACHE_KEY, mappedTier);
        }
      } else {
        setTier("none");
      }
      setUser(firebaseUser);
      setAuthLoading(false);
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
