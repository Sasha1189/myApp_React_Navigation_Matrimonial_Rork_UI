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
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY = "self_profile_cache";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tier, setTier] = useState<"none" | "trial" | "basic" | "premium">(
    "none",
  );

  const [profile, setProfile] = useState<Profile>(() => {
    const cached = storage.getString(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : getDefaultProfile();
  });

  usePresence(user?.uid);
  const updateProfile = useUpdateProfile(user, profile, setProfile);

  // New: Function to fetch subscription from your backend
  const refreshSubscription = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      // MOCK for now: replace with fetch('your-backend/status')
      console.log("Checking subscription for:", user.uid);
      // setTier(data.tier);
    } catch (error) {
      console.error("Sub check failed:", error);
    }
  };

  //first time fetch self profile-on login
  useEffect(() => {
    const syncProfileAndTier = async () => {
      if (!user) return;
      try {
        // 1. Existing Profile Sync
        const hasCache = storage.contains(PROFILE_CACHE_KEY);
        if (!hasCache) {
          const remoteData = await getProfile(user?.uid, user?.displayName!);
          if (remoteData) {
            setProfile(remoteData);
            storage.set(PROFILE_CACHE_KEY, JSON.stringify(remoteData));
          }
        }
        // 2. New: Tier Sync
        await refreshSubscription();
      } catch (error) {
        console.error("Initial sync failed:", error);
      }
    };
    syncProfileAndTier();
  }, [user?.uid]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
      refreshSubscription,
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
